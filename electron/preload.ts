import { contextBridge, ipcRenderer } from 'electron';

export interface ImportedFile {
  name: string;
  ext: string;
  content: string; // utf-8 text for dxf, base64 for pdf/images
}

const api = {
  saveProject: (json: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('project:save', json, suggestedName),
  openProject: (): Promise<{ path: string; json: string } | null> => ipcRenderer.invoke('project:open'),
  openFloorplanFiles: (): Promise<ImportedFile[]> => ipcRenderer.invoke('floorplan:openFiles'),
  aiHasKey: (): Promise<boolean> => ipcRenderer.invoke('ai:hasKey'),
  aiSetKey: (key: string): Promise<boolean> => ipcRenderer.invoke('ai:setKey', key),
  aiExtract: (payload: { name: string; ext: string; base64: string; hint?: string }): Promise<unknown> =>
    ipcRenderer.invoke('ai:extract', payload),
  exportXlsx: (scheduleJson: string, inputsJson: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('export:xlsx', { scheduleJson, inputsJson, suggestedName }),
  exportSvg: (svg: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('export:svg', svg, suggestedName),
  showItemInFolder: (p: string): Promise<void> => ipcRenderer.invoke('shell:showItem', p),
};

export type SatisApi = typeof api;

contextBridge.exposeInMainWorld('satis', api);
