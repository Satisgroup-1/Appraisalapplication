// Minimum requirement ruleset for residential conversion units.
// Defaults: UK Nationally Described Space Standard (NDSS, 2015) plus common
// building-regs-derived rules. Ported from the floorplan-converter skill's
// rules/ndss_rules.yaml — editable in the app's Rules panel.

import type { MixStrategy, UnitTypeKey } from './types';

export interface Rules {
  unitMinimumGia: Record<UnitTypeKey, number>;
  bedrooms: {
    singleMinArea: number;
    singleMinWidth: number;
    doubleMinArea: number;
    doubleMinWidth: number; // principal bedroom
    otherDoubleMinWidth: number;
    mustHaveWindow: boolean;
  };
  livingRooms: {
    mustHaveWindow: boolean;
    minCombinedLivingKitchenDining: Record<string, number>; // by occupancy '2p'..'4p'
  };
  kitchensBathrooms: {
    kitchenRequired: boolean;
    bathroomRequired: boolean;
    bathroomMayBeInternal: boolean;
    kitchenNeedsWindow: boolean;
  };
  windows: {
    glazingMinRatioOfRoomFloor: number;
    habitableRoomTypes: string[];
  };
  storage: { bed1: number; bed2: number; bed3: number };
  heights: { minCeiling: number; minCeilingCoverage: number };
  circulation: { corridorMinWidth: number; unitHallMinWidth: number };
  mixStrategies: Record<MixStrategy, { prefer: UnitTypeKey[]; allow: UnitTypeKey[] }>;
  efficiency: { targetNetToGross: number };
}

export const DEFAULT_RULES: Rules = {
  // NDSS Table 1, single-storey dwellings (sqm)
  unitMinimumGia: {
    studio_1p: 37, // with shower room instead of bathroom; 39 with bath
    '1bed_2p': 50,
    '2bed_3p': 61,
    '2bed_4p': 70,
    '3bed_4p': 74,
    '3bed_5p': 86,
    '3bed_6p': 95,
  },
  bedrooms: {
    singleMinArea: 7.5,
    singleMinWidth: 2.15,
    doubleMinArea: 11.5,
    doubleMinWidth: 2.75, // principal bedroom; other doubles 2.55
    otherDoubleMinWidth: 2.55,
    mustHaveWindow: true, // every bedroom needs natural light + ventilation
  },
  livingRooms: {
    mustHaveWindow: true, // habitable rooms need natural light
    // common LPA guideline by occupancy
    minCombinedLivingKitchenDining: { '2p': 22, '3p': 24, '4p': 27 },
  },
  kitchensBathrooms: {
    kitchenRequired: true,
    bathroomRequired: true,
    bathroomMayBeInternal: true, // if mechanically ventilated
    kitchenNeedsWindow: false, // if open-plan to a windowed living space
  },
  windows: {
    glazingMinRatioOfRoomFloor: 0.2, // guideline approximation
    habitableRoomTypes: ['living', 'bedroom', 'kitchen_living'],
  },
  storage: { bed1: 1.5, bed2: 2.0, bed3: 2.5 },
  heights: { minCeiling: 2.3, minCeilingCoverage: 0.75 },
  circulation: { corridorMinWidth: 1.2, unitHallMinWidth: 0.9 },
  mixStrategies: {
    max_units: { prefer: ['studio_1p', '1bed_2p'], allow: ['2bed_3p'] },
    balanced: { prefer: ['1bed_2p', '2bed_4p'], allow: ['studio_1p', '2bed_3p'] },
    family: { prefer: ['2bed_4p', '3bed_5p'], allow: ['1bed_2p'] },
  },
  efficiency: { targetNetToGross: 0.83 },
};

export const PERSONS: Record<UnitTypeKey, number> = {
  studio_1p: 1,
  '1bed_2p': 2,
  '2bed_3p': 3,
  '2bed_4p': 4,
  '3bed_4p': 4,
  '3bed_5p': 5,
  '3bed_6p': 6,
};

export const LABEL: Record<UnitTypeKey, string> = {
  studio_1p: 'Studio',
  '1bed_2p': '1 bed',
  '2bed_3p': '2 bed',
  '2bed_4p': '2 bed',
  '3bed_4p': '3 bed',
  '3bed_5p': '3 bed',
  '3bed_6p': '3 bed',
};

export const BEDS: Record<UnitTypeKey, number> = {
  studio_1p: 0,
  '1bed_2p': 1,
  '2bed_3p': 2,
  '2bed_4p': 2,
  '3bed_4p': 3,
  '3bed_5p': 3,
  '3bed_6p': 3,
};

/** Metres of facade the living/kitchen must keep. */
export const MIN_LIVING_W = 3.0;
/** Do not bloat a unit past min GIA x this. */
export const MAX_STRETCH = 1.45;
/** Max units per appraisal workbook (rows 7-36 of '1. Unit Import'). */
export const MAX_UNITS = 30;

export const SQM_TO_SQFT = 10.7639;
