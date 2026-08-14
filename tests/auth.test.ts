// Credential resolution for the Claude calls. The point of these tests is
// that what the Settings screen reports is exactly what a request would do:
// if precedence here drifts from the SDK's, the app confidently displays the
// wrong account.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// safeStorage only exists inside Electron. The stored-key path is exercised
// through it, so stand in a keychain that round-trips.
vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (s: string) => Buffer.from(`enc:${s}`),
    decryptString: (b: Buffer) => b.toString().replace(/^enc:/, ''),
  },
}));

// The real installer downloads a release from GitHub; tests must never reach
// the network. Each test decides whether the download "succeeds" (planting a
// binary) or fails.
const { installCliMock } = vi.hoisted(() => ({ installCliMock: vi.fn() }));
vi.mock('../electron/cliInstall', () => ({ installCli: installCliMock }));

const auth = await import('../electron/auth');

let tmp = '';
const savedEnv = { ...process.env };

function writeProfile(dir: string, creds: Record<string, unknown>) {
  fs.mkdirSync(path.join(dir, 'configs'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'credentials'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'configs', 'default.json'),
    JSON.stringify({
      version: '1.0',
      authentication: { type: 'user_oauth', client_id: 'cid' },
      workspace_id: 'wrkspc_01test',
    }),
  );
  fs.writeFileSync(path.join(dir, 'credentials', 'default.json'), JSON.stringify({ version: '1.0', ...creds }), {
    mode: 0o600,
  });
}

/** A stand-in `ant` on PATH. */
function fakeCli(dir: string, versionOutput: string, exitCode = 0) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'ant');
  fs.writeFileSync(file, `#!/bin/sh\necho "${versionOutput}"\nexit ${exitCode}\n`, { mode: 0o755 });
  process.env.PATH = `${dir}${path.delimiter}${savedEnv.PATH}`;
}

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'satis-auth-'));
  auth.initAuth(tmp);
  installCliMock.mockReset().mockRejectedValue(new Error('No network in tests.'));
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_PROFILE;
  // Point the SDK at an empty directory so a real profile on the machine
  // running the tests cannot leak in.
  process.env.ANTHROPIC_CONFIG_DIR = path.join(tmp, 'anthropic');
  // No `ant` anywhere, unless a test plants one.
  process.env.PATH = path.join(tmp, 'empty-bin');
});

afterEach(() => {
  process.env = { ...savedEnv };
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('stored key', () => {
  it('round-trips through the keychain and is removed by saving an empty key', () => {
    expect(auth.getStoredKey()).toBe(null);
    auth.setStoredKey('sk-ant-test-123');
    expect(auth.getStoredKey()).toBe('sk-ant-test-123');
    auth.setStoredKey('');
    expect(auth.getStoredKey()).toBe(null);
  });

  it('writes the config file owner-only', () => {
    auth.setStoredKey('sk-ant-test-123');
    const mode = fs.statSync(path.join(tmp, 'config.json')).mode & 0o777;
    expect(mode & 0o077).toBe(0);
  });
});

describe('source precedence', () => {
  it('reports nothing configured when there is no credential anywhere', async () => {
    const s = await auth.authStatus();
    expect(s.source).toBe('none');
    expect(s.ready).toBe(false);
    expect(s.login).toBe(null);
  });

  it('finds a Claude sign-in and reports the account', async () => {
    writeProfile(process.env.ANTHROPIC_CONFIG_DIR!, {
      type: 'oauth_token',
      access_token: 'tok',
      refresh_token: 'ref',
      expires_at: 4_102_444_800,
      account_email: 'admin@satisgroup.co.uk',
      organization_name: 'Satis Group',
    });
    const s = await auth.authStatus();
    expect(s.source).toBe('claude-login');
    expect(s.ready).toBe(true);
    expect(s.login?.email).toBe('admin@satisgroup.co.uk');
    expect(s.login?.organisation).toBe('Satis Group');
    expect(s.login?.expired).toBe(false);
    expect(s.login?.refreshable).toBe(true);
    expect(s.shadowed).toBe(false);
  });

  it('marks a past expiry as expired', async () => {
    writeProfile(process.env.ANTHROPIC_CONFIG_DIR!, {
      type: 'oauth_token',
      access_token: 'tok',
      expires_at: 1_000_000_000,
    });
    const s = await auth.authStatus();
    expect(s.login?.expired).toBe(true);
    expect(s.login?.refreshable).toBe(false);
  });

  it('puts an environment key ahead of a sign-in, and flags the sign-in as shadowed', async () => {
    writeProfile(process.env.ANTHROPIC_CONFIG_DIR!, { type: 'oauth_token', access_token: 'tok' });
    process.env.ANTHROPIC_API_KEY = 'sk-ant-env';
    const s = await auth.authStatus();
    expect(s.source).toBe('env-key');
    expect(s.login).not.toBe(null);
    expect(s.shadowed).toBe(true);
  });

  it('puts an environment key ahead of an environment token', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-env';
    process.env.ANTHROPIC_AUTH_TOKEN = 'bearer-env';
    expect((await auth.authStatus()).source).toBe('env-key');
  });

  it('uses an environment token when it is the only credential', async () => {
    process.env.ANTHROPIC_AUTH_TOKEN = 'bearer-env';
    const s = await auth.authStatus();
    expect(s.source).toBe('env-token');
    expect(s.ready).toBe(true);
  });

  it('puts a stored key ahead of everything, because the app passes it explicitly', async () => {
    writeProfile(process.env.ANTHROPIC_CONFIG_DIR!, { type: 'oauth_token', access_token: 'tok' });
    process.env.ANTHROPIC_API_KEY = 'sk-ant-env';
    auth.setStoredKey('sk-ant-stored');
    const s = await auth.authStatus();
    expect(s.source).toBe('stored-key');
    expect(s.shadowed).toBe(true);
  });
});

describe('client construction', () => {
  it('refuses to build a client with no credentials', async () => {
    await expect(auth.buildClient()).rejects.toThrow(/No Claude credentials/);
  });

  it('pins authToken to null for a stored key, so both auth headers cannot be sent at once', async () => {
    // The API rejects a request carrying x-api-key and Authorization together,
    // and the SDK reads ANTHROPIC_AUTH_TOKEN from the environment on its own.
    process.env.ANTHROPIC_AUTH_TOKEN = 'bearer-env';
    auth.setStoredKey('sk-ant-stored');
    const client = await auth.buildClient();
    expect(client.apiKey).toBe('sk-ant-stored');
    expect(client.authToken).toBe(null);
  });

  it('leaves an environment key to the SDK rather than re-reading it', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-env';
    const client = await auth.buildClient();
    expect(client.apiKey).toBe('sk-ant-env');
  });
});

describe('locating the Anthropic CLI', () => {
  it('reports it when present', async () => {
    fakeCli(path.join(tmp, 'bin'), 'ant version 1.2.3');
    const cli = await auth.findAnt(true);
    expect(cli.available).toBe(true);
    expect(cli.version).toContain('1.2.3');
  });

  it('rejects Apache Ant, which shares the command name', async () => {
    // Without this check the Java build tool reads as a working Claude
    // sign-in and the button silently never succeeds.
    fakeCli(path.join(tmp, 'bin'), 'Apache Ant(TM) version 1.10.14 compiled on August 16 2023');
    const cli = await auth.findAnt(true);
    expect(cli.available).toBe(false);
    expect(cli.conflict).toMatch(/Apache Ant/);
  });

  it('does not cache a negative result, so an install is picked up on recheck', async () => {
    expect((await auth.findAnt(true)).available).toBe(false);
    fakeCli(path.join(tmp, 'bin'), 'ant version 1.2.3');
    expect((await auth.findAnt()).available).toBe(true);
  });

  it('finds the app-managed copy at its absolute path, off PATH entirely', async () => {
    // The managed copy lives in userData/bin, which is never on PATH.
    const managed = path.join(tmp, 'bin');
    fs.mkdirSync(managed, { recursive: true });
    fs.writeFileSync(path.join(managed, 'ant'), '#!/bin/sh\necho "ant version 9.9.9"\n', { mode: 0o755 });
    const cli = await auth.findAnt(true);
    expect(cli.available).toBe(true);
    expect(cli.cmd).toBe(path.join(managed, 'ant'));
  });
});

describe('automatic CLI download', () => {
  it('downloads the CLI when none is installed, then uses it', async () => {
    installCliMock.mockImplementation(async (binDir: string) => {
      fs.mkdirSync(binDir, { recursive: true });
      const bin = path.join(binDir, 'ant');
      fs.writeFileSync(bin, '#!/bin/sh\necho "ant version 1.23.0"\n', { mode: 0o755 });
      return { binPath: bin, version: '1.23.0' };
    });
    const res = await auth.ensureAnt();
    expect(installCliMock).toHaveBeenCalledWith(path.join(tmp, 'bin'));
    expect(res.downloaded).toBe(true);
    expect(res.cli?.available).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('leaves a user-installed CLI alone rather than downloading', async () => {
    fakeCli(path.join(tmp, 'path-bin'), 'ant version 1.2.3');
    const res = await auth.ensureAnt();
    expect(res.downloaded).toBe(false);
    expect(res.cli?.available).toBe(true);
    expect(installCliMock).not.toHaveBeenCalled();
  });

  it('declines to sign in with a clear message when the download fails, without throwing', async () => {
    const res = await auth.signInWithClaude();
    expect(res.ok).toBe(false);
    expect(res.message).toMatch(/downloading it automatically failed/i);
    expect(res.message).toMatch(/API key/);
  });
});
