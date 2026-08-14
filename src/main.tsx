import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Browser/dev fallback: outside Electron the preload bridge is absent, so
// stub it (projects persist to localStorage) to keep the renderer usable
// for UI development.
if (!window.satis) {
  const KEY = 'satis-projects';
  const read = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '{}');
    } catch {
      return {};
    }
  };
  const write = (v: Record<string, string>) => localStorage.setItem(KEY, JSON.stringify(v));
  window.satis = {
    projectsList: async () =>
      Object.values(read())
        .map((json) => {
          const p = JSON.parse(json);
          return {
            id: p.id,
            name: p.name ?? 'Untitled scheme',
            address: p.address ?? '',
            floorCount: p.floors?.length ?? 0,
            updatedAt: p.updatedAt ?? '',
          };
        })
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    projectsLoad: async (id) => read()[id] ?? null,
    projectsSave: async (id, json) => {
      const all = read();
      all[id] = json;
      write(all);
      return true;
    },
    projectsDelete: async (id) => {
      const all = read();
      delete all[id];
      write(all);
      return true;
    },
    saveProject: async () => null,
    openProject: async () => null,
    openFloorplanFiles: async () => [],
    authStatus: async () => ({
      source: 'none' as const,
      ready: false,
      storedKey: false,
      envKey: false,
      envToken: false,
      login: null,
      shadowed: false,
      cli: { available: false },
      keychain: false,
    }),
    authSetKey: async () => true,
    authSignIn: async () => ({ ok: false, message: 'Signing in is only available in the desktop app.' }),
    authTest: async () => ({ ok: false, message: 'Connection testing is only available in the desktop app.' }),
    authOpenLink: async () => false,
    aiExtract: async () => {
      throw new Error('Floorplan reading is only available in the desktop app.');
    },
    aiProjectHpi: async () => {
      throw new Error('HPI projection is only available in the desktop app.');
    },
    exportXlsx: async () => null,
    exportSvg: async () => null,
    showItemInFolder: async () => {},
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
