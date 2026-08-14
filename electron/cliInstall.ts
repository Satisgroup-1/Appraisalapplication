// App-managed install of the Anthropic CLI (`ant`), which owns the browser
// sign-in flow. The user should not have to install anything by hand: when no
// CLI is found, the app downloads the official release binary itself.
//
// Trust model: the version AND the SHA-256 of every platform asset are pinned
// here, taken from the release's published checksums file — the app will only
// ever run a binary whose hash it already knows. Upgrading the CLI is a code
// change, not a moving download. The CLI is MIT-licensed, which permits
// exactly this. No `electron` imports: everything is parameterised so the
// module is unit-testable outside Electron.

import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';

export const CLI_VERSION = '1.23.0';

/** Release assets by platform-arch, hashes from ant_1.23.0_checksums.txt. */
const ASSETS: Record<string, { asset: string; sha256: string }> = {
  'darwin-arm64': {
    asset: `ant_${CLI_VERSION}_macos_arm64.zip`,
    sha256: '7cb51686721b9374600569a47a61dc018dae802d30db68a5b4033539ead958f9',
  },
  'darwin-x64': {
    asset: `ant_${CLI_VERSION}_macos_amd64.zip`,
    sha256: '672600cea44930fad025722e1afeaba0a032f07bee0472338e3fab321b736140',
  },
  'win32-x64': {
    asset: `ant_${CLI_VERSION}_windows_amd64.zip`,
    sha256: 'a94e4bf4d5674a86d2f4bfcd549f247cfb04cccb756b7090da3a8b72abe78f77',
  },
  'win32-arm64': {
    asset: `ant_${CLI_VERSION}_windows_arm64.zip`,
    sha256: '07d17cd02e522928094ced54cce811c23fa945420f0dfe39e04ecd9e56e8855c',
  },
  'linux-x64': {
    asset: `ant_${CLI_VERSION}_linux_amd64.tar.gz`,
    sha256: 'ccedb855c18c3ddb2e3bb1c02b5bc0bb756115f7210bfccdbc1dcf8ec00e4fcb',
  },
  'linux-arm64': {
    asset: `ant_${CLI_VERSION}_linux_arm64.tar.gz`,
    sha256: '0417e2583db6b8822b696309ed7829a92d66b26ff848ba21f8aa71eb766000af',
  },
};

export function assetFor(platform: NodeJS.Platform, arch: string): { asset: string; sha256: string; url: string } | null {
  const entry = ASSETS[`${platform}-${arch}`];
  if (!entry) return null;
  return {
    ...entry,
    url: `https://github.com/anthropics/anthropic-cli/releases/download/v${CLI_VERSION}/${entry.asset}`,
  };
}

/** HTTPS download following redirects (github.com hands off to a CDN). */
export function downloadFile(url: string, dest: string, redirectsLeft = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'user-agent': 'satis-appraisal' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft === 0) return reject(new Error('Too many redirects downloading the CLI.'));
        return resolve(downloadFile(res.headers.location, dest, redirectsLeft - 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Download failed with HTTP ${res.statusCode}.`));
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(() => resolve()));
      out.on('error', reject);
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(120_000, () => req.destroy(new Error('Download timed out.')));
  });
}

export function sha256File(p: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(p);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: 120_000, windowsHide: true }, (err, _o, stderr) =>
      err ? reject(new Error(`${cmd} failed: ${String(stderr || err.message).slice(0, 300)}`)) : resolve(),
    );
  });
}

/** Locate the extracted binary, wherever the archive placed it. */
function findBinary(dir: string, name: string): string | null {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findBinary(p, name);
      if (found) return found;
    } else if (entry.name === name) {
      return p;
    }
  }
  return null;
}

/** Extract with tools the OS is guaranteed to have — no unzip dependency. */
async function extractArchive(archive: string, destDir: string, platform: NodeJS.Platform): Promise<void> {
  fs.mkdirSync(destDir, { recursive: true });
  if (archive.endsWith('.tar.gz')) {
    await run('tar', ['-xzf', archive, '-C', destDir]);
  } else if (platform === 'darwin') {
    await run('ditto', ['-x', '-k', archive, destDir]); // always present on macOS
  } else if (platform === 'win32') {
    await run('powershell.exe', ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${archive}' -DestinationPath '${destDir}' -Force`]);
  } else {
    await run('tar', ['-xf', archive, '-C', destDir]);
  }
}

export interface InstallResult {
  binPath: string;
  version: string;
}

/**
 * Downloads, verifies and installs the pinned CLI into `binDir`. Throws with
 * a user-readable message on any failure; a mismatched checksum aborts before
 * anything is executed and deletes the download. The transport can be
 * injected so tests exercise the verify-then-install pipeline offline.
 */
export async function installCli(
  binDir: string,
  platform: NodeJS.Platform = process.platform,
  arch: string = process.arch,
  download: (url: string, dest: string) => Promise<void> = downloadFile,
): Promise<InstallResult> {
  const target = assetFor(platform, arch);
  if (!target) throw new Error(`No CLI build is published for ${platform}/${arch}. Install it manually or use an API key.`);

  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'satis-ant-'));
  try {
    const archivePath = path.join(work, target.asset);
    await download(target.url, archivePath);

    const digest = await sha256File(archivePath);
    if (digest !== target.sha256) {
      throw new Error(
        `The downloaded CLI did not match its pinned checksum (got ${digest.slice(0, 12)}…, expected ${target.sha256.slice(0, 12)}…). Nothing was installed.`,
      );
    }

    const extractDir = path.join(work, 'extract');
    await extractArchive(archivePath, extractDir, platform);
    const name = platform === 'win32' ? 'ant.exe' : 'ant';
    const found = findBinary(extractDir, name);
    if (!found) throw new Error('The CLI archive did not contain the expected binary.');

    fs.mkdirSync(binDir, { recursive: true });
    const binPath = path.join(binDir, name);
    fs.copyFileSync(found, binPath);
    if (platform !== 'win32') fs.chmodSync(binPath, 0o755);
    if (platform === 'darwin') {
      // Best effort: the file was written by us, not a browser, so it should
      // carry no quarantine attribute — but clear one if anything added it.
      await run('xattr', ['-d', 'com.apple.quarantine', binPath]).catch(() => undefined);
    }
    return { binPath, version: CLI_VERSION };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}
