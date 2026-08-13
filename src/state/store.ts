// Application state. Options and appraisals are derived on demand from the
// project (floors + pricing) so edits anywhere flow through consistently.

import { create } from 'zustand';
import type { ConversionOption, Envelope, PricingSpec, Project } from '../core/types';
import { DEFAULT_RULES, type Rules } from '../core/rules';
import { generateOptions } from '../core/conversions';
import { demoProject } from '../core/demo';
import { clonePricing, DEFAULT_PRICING } from '../core/pricing';

export type View = 'project' | 'pricing' | 'options' | 'appraisal' | 'settings';

interface AppState {
  view: View;
  project: Project;
  rules: Rules;
  options: ConversionOption[];
  optionsStale: boolean;
  selectedOptionId: string | null;
  savedPath: string | null;
  busy: string | null;

  setView: (v: View) => void;
  setProjectMeta: (patch: Partial<Pick<Project, 'name' | 'address' | 'listedOrConservation'>>) => void;
  setFloors: (floors: Envelope[]) => void;
  upsertFloor: (floor: Envelope) => void;
  removeFloor: (id: string) => void;
  setPricing: (p: PricingSpec) => void;
  setRules: (r: Rules) => void;
  regenerate: () => void;
  selectOption: (id: string | null) => void;
  newProject: () => void;
  loadDemo: () => void;
  loadProject: (p: Project, path: string | null) => void;
  setSavedPath: (p: string | null) => void;
  setBusy: (b: string | null) => void;
}

function blankProject(): Project {
  return {
    version: 1,
    name: 'Untitled scheme',
    address: '',
    createdAt: new Date().toISOString(),
    listedOrConservation: false,
    floors: [],
    pricing: clonePricing(DEFAULT_PRICING),
  };
}

export const useStore = create<AppState>((set, get) => ({
  view: 'project',
  project: demoProject(),
  rules: JSON.parse(JSON.stringify(DEFAULT_RULES)),
  options: [],
  optionsStale: true,
  selectedOptionId: null,
  savedPath: null,
  busy: null,

  setView: (view) => set({ view }),

  setProjectMeta: (patch) => set((s) => ({ project: { ...s.project, ...patch } })),

  setFloors: (floors) => set((s) => ({ project: { ...s.project, floors }, optionsStale: true })),

  upsertFloor: (floor) =>
    set((s) => {
      const floors = [...s.project.floors];
      const i = floors.findIndex((f) => f.id === floor.id);
      if (i >= 0) floors[i] = floor;
      else floors.push(floor);
      return { project: { ...s.project, floors }, optionsStale: true };
    }),

  removeFloor: (id) =>
    set((s) => ({
      project: { ...s.project, floors: s.project.floors.filter((f) => f.id !== id) },
      optionsStale: true,
    })),

  setPricing: (pricing) => set((s) => ({ project: { ...s.project, pricing }, optionsStale: true })),

  setRules: (rules) => set({ rules, optionsStale: true }),

  regenerate: () => {
    const { project, rules } = get();
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

  newProject: () =>
    set({ project: blankProject(), options: [], optionsStale: true, selectedOptionId: null, savedPath: null, view: 'project' }),

  loadDemo: () =>
    set({ project: demoProject(), options: [], optionsStale: true, selectedOptionId: null, savedPath: null, view: 'project' }),

  loadProject: (project, savedPath) =>
    set({ project, savedPath, options: [], optionsStale: true, selectedOptionId: null, view: 'project' }),

  setSavedPath: (savedPath) => set({ savedPath }),
  setBusy: (busy) => set({ busy }),
}));

export const fmtGBP = (v: number, dp = 0) =>
  v.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtPct = (v: number, dp = 1) => `${(v * 100).toFixed(dp)}%`;

export const fmtNum = (v: number, dp = 0) =>
  v.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
