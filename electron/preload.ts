import { contextBridge, ipcRenderer } from 'electron';
import type { AuthStatus } from './auth';

export type { AuthStatus, AuthSource, ClaudeLogin, CliInfo } from './auth';

export interface ImportedFile {
  name: string;
  ext: string;
  content: string; // utf-8 text for dxf, base64 for pdf/images
}

export interface ProjectSummaryIpc {
  id: string;
  name: string;
  address: string;
  floorCount: number;
  updatedAt: string;
}

const api = {
  projectsList: (): Promise<ProjectSummaryIpc[]> => ipcRenderer.invoke('projects:list'),
  projectsLoad: (id: string): Promise<string | null> => ipcRenderer.invoke('projects:load', id),
  projectsSave: (id: string, json: string): Promise<boolean> => ipcRenderer.invoke('projects:save', id, json),
  projectsDelete: (id: string): Promise<boolean> => ipcRenderer.invoke('projects:delete', id),
  saveProject: (json: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('project:save', json, suggestedName),
  openProject: (): Promise<{ path: string; json: string } | null> => ipcRenderer.invoke('project:open'),
  openFloorplanFiles: (): Promise<ImportedFile[]> => ipcRenderer.invoke('floorplan:openFiles'),
  authStatus: (): Promise<AuthStatus> => ipcRenderer.invoke('auth:status'),
  authSetKey: (key: string): Promise<boolean> => ipcRenderer.invoke('auth:setKey', key),
  authSignIn: (): Promise<{ ok: boolean; message: string }> => ipcRenderer.invoke('auth:signIn'),
  authTest: (): Promise<{ ok: boolean; message: string }> => ipcRenderer.invoke('auth:test'),
  authOpenLink: (which: 'console-keys' | 'cli-install'): Promise<boolean> =>
    ipcRenderer.invoke('auth:openLink', which),
  aiExtract: (payload: { name: string; ext: string; base64: string; hint?: string }): Promise<unknown> =>
    ipcRenderer.invoke('ai:extract', payload),
  aiProjectHpi: (
    region: string,
  ): Promise<{ annualPct: number[]; region: string; rationale: string; sources: string[]; projectedAt: string }> =>
    ipcRenderer.invoke('ai:projectHpi', region),
  aiEstimateSales: (payload: { address: string; unitTypes: string[] }): Promise<unknown> =>
    ipcRenderer.invoke('ai:estimateSales', payload),
  aiEstimateBuild: (payload: { region: string; giaSqft: number }): Promise<unknown> =>
    ipcRenderer.invoke('ai:estimateBuild', payload),
  aiEstimateFinance: (payload: {
    deal: { purchasePrice: number; bridgeLtv: number; devFacilityEstimate: number; gdv: number; assetType: string };
  }): Promise<unknown> => ipcRenderer.invoke('ai:estimateFinance', payload),
  calibrationLoad: (): Promise<unknown> => ipcRenderer.invoke('calibration:load'),
  calibrationSave: (json: string): Promise<boolean> => ipcRenderer.invoke('calibration:save', json),
  onEstimateProgress: (
    cb: (p: { kind: 'sales' | 'build' | 'finance'; stage: string; searches: number }) => void,
  ): (() => void) => {
    const listener = (_e: unknown, p: { kind: 'sales' | 'build' | 'finance'; stage: string; searches: number }) => cb(p);
    ipcRenderer.on('ai:estimateProgress', listener);
    return () => {
      ipcRenderer.removeListener('ai:estimateProgress', listener);
    };
  },
  exportXlsx: (
    scheduleJson: string,
    inputsJson: string,
    suggestedName: string,
    modelV2Json?: string,
  ): Promise<string | null> => ipcRenderer.invoke('export:xlsx', { scheduleJson, inputsJson, suggestedName, modelV2Json }),
  exportSvg: (svg: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('export:svg', svg, suggestedName),
  showItemInFolder: (p: string): Promise<void> => ipcRenderer.invoke('shell:showItem', p),
};

export type SatisApi = typeof api;

contextBridge.exposeInMainWorld('satis', api);
