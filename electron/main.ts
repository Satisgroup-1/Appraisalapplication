// Electron main process: window lifecycle, project file I/O, xlsx export
// from the bundled Appraisal Model template, and AI floorplan extraction.

import { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { exportWorkbook } from './xlsxExport';
import { extractEnvelopes } from './ai';

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function resourcesDir(): string {
  return isDev ? path.join(app.getAppPath(), 'resources') : path.join(process.resourcesPath, 'resources');
}

function configPath(): string {
  return path.join(app.getPath('userData'), 'config.json');
}

interface StoredConfig {
  apiKeyEncrypted?: string; // base64 of safeStorage-encrypted key
  apiKeyPlain?: string; // fallback when safeStorage is unavailable
}

function readConfig(): StoredConfig {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(cfg: StoredConfig) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg), { mode: 0o600 });
}

function getApiKey(): string | null {
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

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#ffffff',
    title: 'Satis Appraisal',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle('project:save', async (_e, json: string, suggestedName: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save project',
    defaultPath: `${suggestedName || 'appraisal'}.satis.json`,
    filters: [{ name: 'Satis Appraisal project', extensions: ['json'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, json, 'utf-8');
  return filePath;
});

ipcMain.handle('project:open', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Open project',
    filters: [{ name: 'Satis Appraisal project', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return null;
  return { path: filePaths[0], json: fs.readFileSync(filePaths[0], 'utf-8') };
});

ipcMain.handle('floorplan:openFiles', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Import floorplans',
    filters: [
      { name: 'Floorplans', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'dxf'] },
    ],
    properties: ['openFile', 'multiSelections'],
  });
  if (canceled) return [];
  return filePaths.map((p) => {
    const ext = path.extname(p).slice(1).toLowerCase();
    const buf = fs.readFileSync(p);
    return {
      name: path.basename(p),
      ext,
      // DXF is parsed as text in the renderer; binary formats go to the AI as base64.
      content: ext === 'dxf' ? buf.toString('utf-8') : buf.toString('base64'),
    };
  });
});

ipcMain.handle('ai:hasKey', () => getApiKey() !== null);

ipcMain.handle('ai:setKey', (_e, key: string) => {
  if (!key) {
    writeConfig({});
    return true;
  }
  if (safeStorage.isEncryptionAvailable()) {
    writeConfig({ apiKeyEncrypted: safeStorage.encryptString(key).toString('base64') });
  } else {
    writeConfig({ apiKeyPlain: key });
  }
  return true;
});

ipcMain.handle(
  'ai:extract',
  async (_e, payload: { name: string; ext: string; base64: string; hint?: string }) => {
    const key = getApiKey();
    if (!key) throw new Error('No API key configured. Add your Anthropic API key in Settings.');
    return extractEnvelopes(key, payload);
  },
);

ipcMain.handle('export:xlsx', async (_e, payload: { scheduleJson: string; inputsJson: string; suggestedName: string }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export appraisal workbook',
    defaultPath: `${payload.suggestedName || 'appraisal'}.xlsx`,
    filters: [{ name: 'Excel workbook', extensions: ['xlsx'] }],
  });
  if (canceled || !filePath) return null;
  const template = path.join(resourcesDir(), 'appraisal_template.xlsx');
  await exportWorkbook(template, filePath, JSON.parse(payload.scheduleJson), JSON.parse(payload.inputsJson));
  return filePath;
});

ipcMain.handle('export:svg', async (_e, svg: string, suggestedName: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export floorplan SVG',
    defaultPath: `${suggestedName || 'floorplan'}.svg`,
    filters: [{ name: 'SVG image', extensions: ['svg'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, svg, 'utf-8');
  return filePath;
});

ipcMain.handle('shell:showItem', (_e, p: string) => {
  shell.showItemInFolder(p);
});
