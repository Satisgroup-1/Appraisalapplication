// The app-managed CLI installer. What matters here is the trust model: a
// pinned version, a pinned SHA-256 per platform asset, and a hard abort —
// before anything is executed — when the download does not match. The happy
// path against the real GitHub release is exercised out-of-band (it needs the
// network); these tests prove the pipeline's decisions offline by injecting
// the transport.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CLI_VERSION, assetFor, installCli, sha256File } from '../electron/cliInstall';

let tmp = '';
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'satis-cli-'));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('assetFor', () => {
  it('maps every shipped platform to a pinned asset and hash', () => {
    const combos: Array<[NodeJS.Platform, string, string]> = [
      ['darwin', 'arm64', `ant_${CLI_VERSION}_macos_arm64.zip`],
      ['darwin', 'x64', `ant_${CLI_VERSION}_macos_amd64.zip`],
      ['win32', 'x64', `ant_${CLI_VERSION}_windows_amd64.zip`],
      ['win32', 'arm64', `ant_${CLI_VERSION}_windows_arm64.zip`],
      ['linux', 'x64', `ant_${CLI_VERSION}_linux_amd64.tar.gz`],
      ['linux', 'arm64', `ant_${CLI_VERSION}_linux_arm64.tar.gz`],
    ];
    for (const [platform, arch, asset] of combos) {
      const t = assetFor(platform, arch);
      expect(t?.asset).toBe(asset);
      expect(t?.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(t?.url).toBe(
        `https://github.com/anthropics/anthropic-cli/releases/download/v${CLI_VERSION}/${asset}`,
      );
    }
  });

  it('returns null for a platform with no published build', () => {
    expect(assetFor('freebsd', 'x64')).toBe(null);
    expect(assetFor('darwin', 'ia32')).toBe(null);
  });
});

describe('sha256File', () => {
  it('matches a known digest', async () => {
    const p = path.join(tmp, 'f');
    fs.writeFileSync(p, 'abc');
    // sha256("abc"), the FIPS 180 test vector.
    expect(await sha256File(p)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('installCli', () => {
  it('refuses a platform with no published build without touching the network', async () => {
    let downloads = 0;
    await expect(
      installCli(path.join(tmp, 'bin'), 'freebsd', 'x64', async () => {
        downloads++;
      }),
    ).rejects.toThrow(/No CLI build is published/);
    expect(downloads).toBe(0);
  });

  it('aborts on a checksum mismatch before executing or installing anything', async () => {
    // The "release" the transport delivers is not what the pin expects —
    // exactly the tampered-download case the pin exists for.
    const binDir = path.join(tmp, 'bin');
    await expect(
      installCli(binDir, 'linux', 'x64', async (_url, dest) => {
        fs.writeFileSync(dest, 'not the real archive');
      }),
    ).rejects.toThrow(/checksum/i);
    // Nothing installed, and the temp download is gone.
    expect(fs.existsSync(path.join(binDir, 'ant'))).toBe(false);
  });

  it('reports a failed download as a readable error', async () => {
    await expect(
      installCli(path.join(tmp, 'bin'), 'darwin', 'arm64', async () => {
        throw new Error('Download failed with HTTP 503.');
      }),
    ).rejects.toThrow(/HTTP 503/);
  });
});
