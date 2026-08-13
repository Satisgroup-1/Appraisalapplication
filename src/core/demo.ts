// Demo data bundled with the app.
//
// 1. DEMO_SCHEDULE — the exact 12-unit scheme from Appraisal_Model_1.xlsx
//    ('1. Unit Import' rows 7-18), used to demonstrate the appraisal engine
//    and verified against the workbook's computed values in tests.
// 2. DEMO_BUILDING — a former retail building (ground commercial + 3 upper
//    floors) for demonstrating the conversion generator end-to-end.

import type { Envelope, Project, ScheduleRow } from './types';
import { SQM_TO_SQFT } from './rules';
import { DEFAULT_PRICING, clonePricing } from './pricing';

function row(
  no: number,
  name: string,
  floor: string,
  type: string,
  sqm: number,
  salePsf: number,
  buildMonths: number,
  monthlyRent: number,
  notes = '',
): ScheduleRow {
  const sqft = sqm * SQM_TO_SQFT;
  return { no, name, floor, type, sqm, sqft, salePsf, unitGdv: sqft * salePsf, buildMonths, monthlyRent, notes };
}

export const DEMO_SCHEDULE: ScheduleRow[] = [
  row(1, 'Commercial Unit', 'G', 'Commercial', 64, 254, 6, 1200),
  row(2, 'Apartment 1', '1', '2 bed', 76, 611, 10, 1650),
  row(3, 'Apartment 2', '1', '2 bed', 70, 617, 10, 1550),
  row(4, 'Apartment 3', '1', '2 bed', 93, 574, 10, 1850),
  row(5, 'Apartment 4', '2', '2 bed', 76, 617, 11, 1650),
  row(6, 'Apartment 5', '2', '2 bed', 70, 630, 11, 1550),
  row(7, 'Apartment 6', '2', '2 bed', 93, 584, 11, 1850),
  row(8, 'Apartment 7', '3', '2 bed', 76, 630, 12, 1650, 'new build'),
  row(9, 'Apartment 8', '3', '2 bed', 70, 644, 12, 1550, 'new build'),
  row(10, 'Apartment 9', '3', '2 bed', 93, 594, 12, 1850, 'new build'),
  row(11, 'Apartment 10', '4', '2 bed', 87, 694, 12, 1800, 'new build'),
  row(12, 'Apartment 11', '4', '2 bed', 93, 724, 12, 1850, 'new build'),
];

/** 26m x 13m former retail building, based on the skill's envelope example. */
function demoFloor(floor: string, use: Envelope['use']): Envelope {
  const winXs = [1.5, 4.0, 6.5, 9.0, 11.5, 14.0, 16.5, 19.0, 21.5, 24.0];
  return {
    id: `demo-${floor}`,
    floor,
    use,
    envelope: [
      [0, 0],
      [26, 0],
      [26, 13],
      [0, 13],
    ],
    cores: [{ type: 'stair', poly: [[11.5, 5.9], [14.5, 5.9], [14.5, 8.3], [11.5, 8.3]] }],
    windows: [
      ...winXs.map((x) => ({ x, side: 'front' as const })),
      ...winXs.map((x) => ({ x, side: 'rear' as const })),
    ],
    note: 'Demo floor: 26m x 13m, windows at 2.5m centres both facades',
    assumptions: ['Scale assumed from demo data'],
  };
}

export const DEMO_BUILDING: Envelope[] = [
  demoFloor('G', 'commercial'),
  demoFloor('1', 'commercial'),
  demoFloor('2', 'commercial'),
  demoFloor('3', 'commercial'),
];

export function demoProject(): Project {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: 'Demo: Former Retail Building',
    address: '123 High Street, Manchester',
    createdAt: now,
    updatedAt: now,
    listedOrConservation: false,
    floors: JSON.parse(JSON.stringify(DEMO_BUILDING)),
    pricing: clonePricing(DEFAULT_PRICING),
  };
}
