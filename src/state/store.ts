// Application state. The app opens onto a projects homepage; opening a
// project enters its workspace. Projects auto-save (debounced) into the
// library; options and appraisals are derived on demand from the project.

import { create } from 'zustand';
import type { ConversionOption, Envelope, EstimateSet, PricingSpec, Project, ProjectSummary } from '../core/types';
import { DEFAULT_RULES, type Rules } from '../core/rules';
import { generateOptions } from '../core/conversions';
import { demoProject } from '../core/demo';
import { clonePricing, DEFAULT_PRICING, normalizePricing } from '../core/pricing';

export type View = 'home' | 'project' | 'pricing' | 'options' | 'appraisal' | 'settings';

function newId(): string {
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(get: () => AppState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const { project } = get();
    if (project) void window.satis.projectsSave(project.id, JSON.stringify(project, null, 2));
  }, 600);
}

interface AppState {
  view: View;
  /** Currently open project; null on the homepage. */
  project: Project | null;
  summaries: ProjectSummary[];
  rules: Rules;
  options: ConversionOption[];
  optionsStale: boolean;
  selectedOptionId: string | null;
  busy: string | null;
  splashDone: boolean;

  setView: (v: View) => void;
  setSplashDone: () => void;
  refreshSummaries: () => Promise<void>;
  createProject: (name?: string) => Promise<void>;
  createDemoProject: () => Promise<void>;
  openProjectById: (id: string) => Promise<void>;
  importProjectJson: (json: string) => void;
  deleteProject: (id: string) => Promise<void>;
  closeProject: () => void;

  setProjectMeta: (patch: Partial<Pick<Project, 'name' | 'address' | 'listedOrConservation'>>) => void;
  upsertFloor: (floor: Envelope) => void;
  removeFloor: (id: string) => void;
  setPricing: (p: PricingSpec) => void;
  setEstimates: (patch: Partial<EstimateSet>) => void;
  setRules: (r: Rules) => void;
  regenerate: () => void;
  selectOption: (id: string | null) => void;
  setBusy: (b: string | null) => void;
}

function blankProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: newId(),
    name,
    address: '',
    createdAt: now,
    updatedAt: now,
    listedOrConservation: false,
    floors: [],
    pricing: clonePricing(DEFAULT_PRICING),
  };
}

/** Apply a mutation to the open project, stamp updatedAt and auto-save. */
function withProject(
  set: (p: Partial<AppState>) => void,
  get: () => AppState,
  fn: (p: Project) => Project,
  invalidatesOptions = true,
) {
  const p = get().project;
  if (!p) return;
  const next = { ...fn(p), updatedAt: new Date().toISOString() };
  set({ project: next, ...(invalidatesOptions ? { optionsStale: true } : {}) });
  scheduleSave(get);
}

export const useStore = create<AppState>((set, get) => ({
  view: 'home',
  project: null,
  summaries: [],
  rules: JSON.parse(JSON.stringify(DEFAULT_RULES)),
  options: [],
  optionsStale: true,
  selectedOptionId: null,
  busy: null,
  splashDone: false,

  setView: (view) => set({ view }),
  setSplashDone: () => set({ splashDone: true }),

  refreshSummaries: async () => {
    const summaries = await window.satis.projectsList();
    set({ summaries });
  },

  createProject: async (name = 'Untitled scheme') => {
    const project = blankProject(name);
    await window.satis.projectsSave(project.id, JSON.stringify(project, null, 2));
    set({ project, view: 'project', options: [], optionsStale: true, selectedOptionId: null });
    void get().refreshSummaries();
  },

  createDemoProject: async () => {
    const project = demoProject();
    await window.satis.projectsSave(project.id, JSON.stringify(project, null, 2));
    set({ project, view: 'project', options: [], optionsStale: true, selectedOptionId: null });
    void get().refreshSummaries();
  },

  openProjectById: async (id) => {
    const json = await window.satis.projectsLoad(id);
    if (!json) return;
    try {
      const p = JSON.parse(json) as Project;
      p.id = p.id ?? id;
      p.updatedAt = p.updatedAt ?? p.createdAt ?? new Date().toISOString();
      p.pricing = normalizePricing(p.pricing ?? {});
      set({ project: p, view: 'project', options: [], optionsStale: true, selectedOptionId: null });
    } catch {
      /* corrupt file — leave homepage as is */
    }
  },

  importProjectJson: (json) => {
    const p = JSON.parse(json) as Project;
    if (p.version !== 1) throw new Error('Unsupported project version.');
    p.id = p.id ?? newId();
    p.updatedAt = new Date().toISOString();
    p.pricing = normalizePricing(p.pricing ?? {});
    void window.satis.projectsSave(p.id, JSON.stringify(p, null, 2));
    set({ project: p, view: 'project', options: [], optionsStale: true, selectedOptionId: null });
    void get().refreshSummaries();
  },

  deleteProject: async (id) => {
    await window.satis.projectsDelete(id);
    void get().refreshSummaries();
  },

  closeProject: () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
      const { project } = get();
      if (project) void window.satis.projectsSave(project.id, JSON.stringify(project, null, 2));
    }
    set({ project: null, view: 'home', options: [], optionsStale: true, selectedOptionId: null });
    void get().refreshSummaries();
  },

  setProjectMeta: (patch) => withProject(set, get, (p) => ({ ...p, ...patch }), false),

  upsertFloor: (floor) =>
    withProject(set, get, (p) => {
      const floors = [...p.floors];
      const i = floors.findIndex((f) => f.id === floor.id);
      if (i >= 0) floors[i] = floor;
      else floors.push(floor);
      return { ...p, floors };
    }),

  removeFloor: (id) => withProject(set, get, (p) => ({ ...p, floors: p.floors.filter((f) => f.id !== id) })),

  setPricing: (pricing) => withProject(set, get, (p) => ({ ...p, pricing })),

  // Estimates are suggestions with provenance; storing them changes no model
  // input, so the generated options stay valid.
  setEstimates: (patch) =>
    withProject(set, get, (p) => ({ ...p, estimates: { ...(p.estimates ?? {}), ...patch } }), false),

  setRules: (rules) => set({ rules, optionsStale: true }),

  regenerate: () => {
    const { project, rules } = get();
    if (!project) return;
    const options = generateOptions(project.floors, rules, project.pricing);
    set((s) => ({
      options,
      optionsStale: false,
      selectedOptionId:
        s.selectedOptionId && options.some((o) => o.id === s.selectedOptionId)
          ? s.selectedOptionId
          : options[0]?.id ?? null,
    }));
  },

  selectOption: (selectedOptionId) => set({ selectedOptionId }),
  setBusy: (busy) => set({ busy }),
}));

export const fmtGBP = (v: number, dp = 0) =>
  v.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtPct = (v: number, dp = 1) => `${(v * 100).toFixed(dp)}%`;

export const fmtNum = (v: number, dp = 0) =>
  v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });

// A ratio the model could not compute (a zero denominator) or that does not
// apply (no facility, no sales) must read as such. A formatted 0.0% is the
// defect these replace: it looks like a measurement and passes for a good one.
export const NOT_APPLICABLE = 'n/a';

export const fmtPctOr = (v: number | null, dp = 1) => (v === null ? NOT_APPLICABLE : fmtPct(v, dp));

export const fmtNumOr = (v: number | null, dp = 0) => (v === null ? NOT_APPLICABLE : fmtNum(v, dp));

/** Months that may not exist (no sell-out because no sales are modelled). */
export const fmtMonthsOr = (v: number | null) => (v === null ? NOT_APPLICABLE : String(v));
