import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Browser/dev fallback: outside Electron the preload bridge is absent, so
// stub it with no-ops to keep the renderer usable for UI development.
if (!window.satis) {
  window.satis = {
    saveProject: async () => null,
    openProject: async () => null,
    openFloorplanFiles: async () => [],
    aiHasKey: async () => false,
    aiSetKey: async () => true,
    aiExtract: async () => {
      throw new Error('AI extraction is only available in the desktop app.');
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
