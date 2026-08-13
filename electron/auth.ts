// Credentials for the Claude calls that read floorplans.
//
// Three ways in, resolved in the same order the Anthropic SDK itself uses so
// that what this module reports is what a request will actually do:
//
//   1. a key stored by this app (encrypted with the OS keychain)
//   2. ANTHROPIC_API_KEY in the app's environment
//   3. ANTHROPIC_AUTH_TOKEN in the app's environment
//   4. a Claude sign-in: an OAuth profile written by `ant auth login`, which
//      the SDK reads off disk and refreshes on its own
//
// Nothing secret crosses into the renderer. Everything below returns account
// labels, never tokens.

import { safeStorage } from 'electron';
import { execFile } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import Anthropic from '@anthropic-ai/sdk';
import { loadConfig, loadCredentials } from '@anthropic-ai/sdk/core/credentials';

/** Beta value the API requires on requests authenticated with a bearer token. */
const OAUTH_BETA = 'oauth-2025-04-20';

export type AuthSource = 'stored-key' | 'env-key' | 'env-token' | 'claude-login' | 'none';

export interface ClaudeLogin {
  /** Profile name the credentials were found under. */
  profile: string;
  email?: string;
  organisation?: string;
  workspaceId?: string;
  /** Unix seconds; absent when the profile carries no expiry. */
  expiresAt?: number;
  expired: boolean;
  /** Whether a refresh token is present, so an expired access token self-heals. */
  refreshable: boolean;
}

export interface CliInfo {
  available: boolean;
  version?: string;
  /** Set when something called `ant` was found but is not the Anthropic CLI. */
  conflict?: string;
}

export interface AuthStatus {
  /** The credential a request would actually use right now. */
  source: AuthSource;
  ready: boolean;
  storedKey: boolean;
  envKey: boolean;
  envToken: boolean;
  login: ClaudeLogin | null;
  /** A Claude sign-in exists but an API key takes precedence over it. */
  shadowed: boolean;
  cli: CliInfo;
  /** True where safeStorage can encrypt, so a stored key is not left in plain text. */
  keychain: boolean;
}

// ---------------------------------------------------------------------------
// Key stored by this app
// ---------------------------------------------------------------------------

interface StoredConfig {
  apiKeyEncrypted?: string; // base64 of safeStorage-encrypted key
  apiKeyPlain?: string; // fallback when safeStorage is unavailable
}

let configFile = '';

/** Called once at startup: userData is only known after app.whenReady. */
export function initAuth(userDataDir: string) {
  configFile = path.join(userDataDir, 'config.json');
}

function readConfig(): StoredConfig {
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(cfg: StoredConfig) {
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify(cfg), { mode: 0o600 });
}

export function getStoredKey(): string | null {
  const cfg = readConfig();
  if (cfg.apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
    try {
      return safeStorage.decryptString(Buffer.from(cfg.apiKeyEncrypted, 'base64'));
    } catch {
      return null;
    }
  }
  return cfg.apiKeyPlain ?? null;
}

export function setStoredKey(key: string) {
  if (!key) {
    writeConfig({});
    return;
  }
  if (safeStorage.isEncryptionAvailable()) {
    writeConfig({ apiKeyEncrypted: safeStorage.encryptString(key).toString('base64') });
  } else {
    writeConfig({ apiKeyPlain: key });
  }
}

// ---------------------------------------------------------------------------
// Claude sign-in (OAuth profile on disk)
// ---------------------------------------------------------------------------

function activeProfileName(): string {
  if (process.env.ANTHROPIC_PROFILE) return process.env.ANTHROPIC_PROFILE;
  const dir =
    process.env.ANTHROPIC_CONFIG_DIR ??
    (process.platform === 'win32'
      ? path.join(process.env.APPDATA ?? os.homedir(), 'Anthropic')
      : path.join(os.homedir(), '.config', 'anthropic'));
  try {
    const active = fs.readFileSync(path.join(dir, 'active_config'), 'utf-8').trim();
    if (active) return active;
  } catch {
    /* no active_config: the SDK falls back to "default" */
  }
  return 'default';
}

/**
 * Reads the signed-in account for display. Returns null when no OAuth profile
 * is present, which is the common case for key-only users.
 */
async function detectLogin(): Promise<ClaudeLogin | null> {
  let config;
  try {
    config = await loadConfig();
  } catch {
    return null;
  }
  if (!config || config.authentication?.type !== 'user_oauth') return null;

  let creds = null;
  try {
    creds = await loadCredentials();
  } catch {
    // Unreadable or unsafe-permission credentials file. The profile exists, so
    // report the sign-in and let a connection test surface the real problem.
  }

  const expiresAt = creds?.expires_at;
  return {
    profile: activeProfileName(),
    email: creds?.account_email,
    organisation: creds?.organization_name,
    workspaceId: config.workspace_id,
    expiresAt,
    expired: typeof expiresAt === 'number' ? expiresAt * 1000 < Date.now() : false,
    refreshable: !!creds?.refresh_token,
  };
}

// ---------------------------------------------------------------------------
// The `ant` CLI, which owns the browser sign-in flow
// ---------------------------------------------------------------------------

function antCandidates(): string[] {
  const home = os.homedir();
  if (process.platform === 'win32') {
    return ['ant.exe', 'ant', path.join(home, 'go', 'bin', 'ant.exe')];
  }
  return [
    'ant',
    '/opt/homebrew/bin/ant', // Homebrew on Apple silicon
    '/usr/local/bin/ant', // Homebrew on Intel, and the tarball install
    path.join(home, 'go', 'bin', 'ant'), // go install
  ];
}

function run(
  cmd: string,
  args: string[],
  timeout: number,
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, windowsHide: true }, (err, stdout, stderr) => {
      const code = err && typeof (err as { code?: unknown }).code === 'number' ? (err as unknown as { code: number }).code : err ? 1 : 0;
      resolve({ code, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') });
    });
  });
}

let cliCache: (CliInfo & { cmd?: string }) | null = null;

/**
 * Locates the Anthropic CLI.
 *
 * `ant` is also the command name of Apache Ant, the Java build tool, so a
 * candidate that answers to --version is only accepted once its output has
 * been checked. Reporting the Java tool as a Claude sign-in would send the
 * user round a loop that could never succeed.
 */
export async function findAnt(refresh = false): Promise<CliInfo & { cmd?: string }> {
  // Only a positive result is cached. A negative one is re-probed so that a
  // user who installs the CLI and presses Recheck is not told it is still
  // missing; the probes cost nothing when the file does not exist.
  if (cliCache?.available && !refresh) return cliCache;
  let conflict: string | undefined;
  for (const cmd of antCandidates()) {
    const { code, stdout, stderr } = await run(cmd, ['--version'], 10_000);
    const out = `${stdout}${stderr}`.trim();
    if (code !== 0 && !out) continue;
    if (/apache\s+ant/i.test(out)) {
      conflict = `“${cmd}” on this machine is Apache Ant, the Java build tool, not the Anthropic CLI.`;
      continue;
    }
    if (code !== 0) continue;
    cliCache = { available: true, version: out.split('\n')[0]?.slice(0, 80), cmd };
    return cliCache;
  }
  cliCache = { available: false, conflict };
  return cliCache;
}

/**
 * Runs `ant auth login`, which opens the browser and writes an OAuth profile
 * the SDK then picks up. Long timeout: the user has to sign in and pick a
 * workspace in between.
 */
export async function signInWithClaude(): Promise<{ ok: boolean; message: string }> {
  const cli = await findAnt(true);
  if (!cli.available || !cli.cmd) {
    return {
      ok: false,
      message:
        cli.conflict ??
        'The Anthropic CLI (ant) was not found on this machine. Install it, then press Sign in with Claude again.',
    };
  }

  const { code, stdout, stderr } = await run(cli.cmd, ['auth', 'login'], 5 * 60_000);
  if (code === 0) {
    const login = await detectLogin();
    return {
      ok: !!login,
      message: login
        ? `Signed in${login.email ? ` as ${login.email}` : ''}${login.organisation ? ` (${login.organisation})` : ''}.`
        : 'The sign-in command finished but no Claude profile was written. Try running "ant auth login" in a terminal.',
    };
  }
  const detail = (stderr || stdout).trim().split('\n').slice(-3).join(' ');
  return {
    ok: false,
    message: `Sign-in did not complete${detail ? `: ${detail}` : '.'} Running "ant auth login" in a terminal shows the full prompt.`,
  };
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export async function authStatus(): Promise<AuthStatus> {
  const storedKey = !!getStoredKey();
  const envKey = !!process.env.ANTHROPIC_API_KEY;
  const envToken = !!process.env.ANTHROPIC_AUTH_TOKEN;
  const login = await detectLogin();
  const cli = await findAnt();

  const source: AuthSource = storedKey
    ? 'stored-key'
    : envKey
      ? 'env-key'
      : envToken
        ? 'env-token'
        : login
          ? 'claude-login'
          : 'none';

  return {
    source,
    ready: source !== 'none',
    storedKey,
    envKey,
    envToken,
    login,
    shadowed: !!login && (storedKey || envKey || envToken),
    cli: { available: cli.available, version: cli.version, conflict: cli.conflict },
    keychain: safeStorage.isEncryptionAvailable(),
  };
}

// ---------------------------------------------------------------------------
// Client construction and connection test
// ---------------------------------------------------------------------------

export const NO_CREDENTIALS =
  'No Claude credentials yet. Open Settings to sign in with Claude or paste an API key. DXF import and manual floor entry work without either.';

/**
 * Builds a client for the active credential.
 *
 * A stored key is passed explicitly with authToken pinned to null: the SDK
 * otherwise picks ANTHROPIC_AUTH_TOKEN up from the environment as well, and
 * the API rejects a request carrying both. With no stored key the client is
 * constructed bare so the SDK's own chain resolves the environment or the
 * signed-in profile, adding the OAuth beta header where it applies.
 */
export async function buildClient(): Promise<Anthropic> {
  const status = await authStatus();
  if (!status.ready) throw new Error(NO_CREDENTIALS);

  if (status.source === 'stored-key') {
    return new Anthropic({ apiKey: getStoredKey()!, authToken: null });
  }
  if (status.source === 'env-token') {
    // A bearer token resolved straight from the environment does not travel
    // through the SDK's credential chain, so the beta header it would have
    // attached has to be set here.
    return new Anthropic({ defaultHeaders: { 'anthropic-beta': OAUTH_BETA } });
  }
  return new Anthropic();
}

/** Human-readable description of what a request would authenticate as. */
export function describeSource(status: AuthStatus): string {
  switch (status.source) {
    case 'stored-key':
      return 'API key stored in this app';
    case 'env-key':
      return 'ANTHROPIC_API_KEY from the environment';
    case 'env-token':
      return 'ANTHROPIC_AUTH_TOKEN from the environment';
    case 'claude-login':
      return status.login?.email ? `Claude sign-in (${status.login.email})` : 'Claude sign-in';
    default:
      return 'nothing configured';
  }
}

/**
 * Verifies the active credential against the API with the cheapest call there
 * is: retrieving the model record. Errors are translated because the raw ones
 * ("401 authentication_error") tell a non-developer nothing.
 */
export async function testConnection(model: string): Promise<{ ok: boolean; message: string }> {
  const status = await authStatus();
  if (!status.ready) return { ok: false, message: NO_CREDENTIALS };

  try {
    const client = await buildClient();
    const record = await client.models.retrieve(model);
    return {
      ok: true,
      message: `Connected using ${describeSource(status)}. ${record.display_name} is available.`,
    };
  } catch (e) {
    return { ok: false, message: explainError(e, status) };
  }
}

function explainError(e: unknown, status: AuthStatus): string {
  const using = describeSource(status);

  if (e instanceof Anthropic.AuthenticationError) {
    return status.source === 'claude-login'
      ? `The Claude sign-in was rejected. It may have expired; sign in again to refresh it.`
      : `Those credentials were rejected (${using}). Check the key is complete and has not been revoked.`;
  }
  if (e instanceof Anthropic.PermissionDeniedError) {
    return `Authenticated with ${using}, but this account cannot access the model. Check the workspace has access.`;
  }
  if (e instanceof Anthropic.NotFoundError) {
    return `Authenticated with ${using}, but the model was not found for this account.`;
  }
  if (e instanceof Anthropic.RateLimitError) {
    return 'Rate limited. The credentials are valid, so wait a moment and try again.';
  }
  if (e instanceof Anthropic.BadRequestError && /credit balance/i.test(e.message)) {
    return 'The credentials are valid but the account has no credit. Top up the Anthropic account, then try again.';
  }
  if (e instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API. Check the network connection or proxy.';
  }
  return `Connection test failed (${using}): ${(e as Error).message}`;
}
