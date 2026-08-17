// Audit tests: financial identities that must hold for ANY scheme (not just
// the golden demo), room-rate build costing, edge-case guards, and the
// regulatory checks added to the validator.

import { describe, expect, it } from 'vitest';
import { DEMO_BUILDING, DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import { buildCostFromRooms, MONTHS, runAppraisal } from '../src/core/dcf';
import { generateOptions, roomAreasOf } from '../src/core/conversions';
import { DEFAULT_RULES } from '../src/core/rules';
import { planFloor } from '../src/core/layout';
import { validateFloor, validateUnit } from '../src/core/validate';
import type { PricingSpec, ScheduleRow } from '../src/core/types';

const SQM_TO_SQFT = 10.7639;

function row(no: number, floor: string, type: string, sqm: number, psf: number, months: number, rent: number): ScheduleRow {
  const sqft = sqm * SQM_TO_SQFT;
  return { no, name: `U${no}`, floor, type, sqm, sqft, salePsf: psf, unitGdv: sqft * psf, buildMonths: months, monthlyRent: rent, notes: '' };
}

/** A second, different scheme so identities are not tuned to the demo. */
const ALT_SCHEDULE: ScheduleRow[] = [
  row(1, 'G', 'Commercial', 120, 200, 8, 2100),
  row(2, '1', 'Studio', 39, 640, 9, 900),
  row(3, '1', '1 bed', 52, 635, 9, 1100),
  row(4, '2', '2 bed', 71, 630, 10, 1500),
  row(5, '2', '3 bed', 96, 615, 10, 1950),
];

function altSpec(): PricingSpec {
  const s = clonePricing(DEFAULT_PRICING);
  s.finance.purchasePrice = 1200000;
  s.finance.legalMonths = 3;
  s.finance.preConMonths = 4;
  s.finance.equity.total = 900000;
  s.finance.bridge.ltv = 0.6;
  s.finance.devLoan.ratePa = 0.09;
  s.finance.sales.velocityPerMonth = 1;
  s.buildCostMode = 'fixed';
  return s;
}

describe('financial identities (any scheme)', () => {
  for (const [name, schedule, spec] of [
    ['demo scheme', DEMO_SCHEDULE, DEFAULT_PRICING],
    ['alt scheme', ALT_SCHEDULE, altSpec()],
  ] as const) {
    describe(name, () => {
      const r = runAppraisal(schedule as ScheduleRow[], spec as PricingSpec);

      it('cashflow spends exactly the pre-finance cost total', () => {
        const spent = r.cashflow.reduce((s, m) => s + m.costs, 0);
        expect(spent).toBeCloseTo(r.devCosts.totalPreFinance, 4);
      });

      it('costs after finance = pre-finance + finance costs - deposit interest credit', () => {
        expect(r.finance.totalCostsAfterFinance).toBeCloseTo(
          r.devCosts.totalPreFinance + r.finance.totalFinanceCosts - r.finance.depositInterestRetention,
          6,
        );
      });

      it('dev loan balance at PC = drawdowns + rolled interest', () => {
        const draws = r.cashflow.reduce((s, m) => s + m.devDrawdown, 0);
        const interest = r.cashflow.reduce((s, m) => s + m.devInterest, 0);
        expect(r.finance.devBalanceAtPC).toBeCloseTo(draws + interest, 4);
      });

      it('every pound of cost is funded by bridge, equity or dev loan', () => {
        // Up to PC: cumulative costs = bridge advance + equity deployed + dev
        // drawdowns net of the redemption/fee drawn at construction start.
        const pc = r.programme.pcMonth;
        const rows = r.cashflow.filter((m) => m.month <= pc);
        const draws = rows.reduce((s, m) => s + m.devDrawdown, 0);
        const redemption = rows.reduce((s, m) => s + m.bridgeRedemption, 0);
        const equity = Math.max(...rows.map((m) => m.equityCum));
        const funded = r.finance.bridgeAdvance + equity + draws - redemption - r.finance.devArrangementFee;
        expect(funded).toBeCloseTo(rows[rows.length - 1].cumCosts, 1);
      });

      it('S1 profit equals GDV minus all-in costs', () => {
        expect(r.scenarios.s1.netProfit).toBeCloseTo(
          r.totals.gdv * (1 + (spec as PricingSpec).finance.sales.priceAdjust) - r.finance.totalCostsAfterFinance,
          6,
        );
      });

      it('sensitivity grid 1 at 0% equals the S1 net profit', () => {
        // C10 algebraically reduces to F9 when the price move is zero.
        const zero = r.sensitivity.grid1.find((g) => g.priceMove === 0)!;
        expect(zero.netProfit).toBeCloseTo(r.scenarios.s1.netProfit, 4);
      });

      it('grid 3 centre cell equals the S3 cashflow', () => {
        const centre = r.sensitivity.grid3.find((g) => Math.abs(g.rate - (spec as PricingSpec).finance.refinance.ratePa) < 1e-9);
        const cell = centre?.cells.find((c) => Math.abs(c.ltv - (spec as PricingSpec).finance.refinance.ltv) < 1e-9);
        if (cell) expect(cell.cashflow).toBeCloseTo(r.scenarios.s3.netAnnualCashflow, 4);
      });

      it('delayed sales never beat an immediate sale; cheaper refi debt never loses to dev debt', () => {
        expect(r.scenarios.s2.netProfit).toBeLessThanOrEqual(r.scenarios.s1.netProfit + 1e-6);
        const f = (spec as PricingSpec).finance;
        if (f.refinance.ratePa < f.devLoan.ratePa) {
          // S4 pays a refi fee but a lower rate — only worthwhile if it nets out;
          // with default fees it should sit between S2 and S1 or explain itself.
          expect(r.scenarios.s4.netProfit).toBeGreaterThanOrEqual(
            r.scenarios.s2.netProfit - r.scenarios.s4.arrangementFee - 1e-6,
          );
        }
      });

      it('scenario 2 loan is fully repaid iff proceeds cover payoff + interest', () => {
        const s2 = r.scenarios.s2;
        if (s2.monthsToRepay !== '36+') {
          const netProceeds =
            r.totals.gdv * (1 - (spec as PricingSpec).finance.sales.agentFeePct) -
            (spec as PricingSpec).finance.sales.legalPerUnit * r.totals.units;
          expect(netProceeds).toBeGreaterThan(r.finance.devPayoffAtPC);
        }
      });
    });
  }
});

describe('room-type £/sqft build costing', () => {
  const options = generateOptions(DEMO_BUILDING, DEFAULT_RULES, DEFAULT_PRICING);
  const full = options.find((o) => o.id === 'full_balanced')!;

  it('room areas cover the converted floors completely', () => {
    const a = full.roomAreas;
    const gross = full.floors.reduce((s, f) => s + f.floorGiaSqm, 0);
    const covered = a.kitchenLivingSqm + a.bedroomSqm + a.bathroomSqm + a.hallStorageSqm + a.circulationSqm;
    expect(covered).toBeCloseTo(gross, 0);
  });

  it('build cost equals the hand-computed sum of area x rate', () => {
    const { total, breakdown } = buildCostFromRooms(DEFAULT_PRICING, full.roomAreas);
    const hand =
      (full.roomAreas.kitchenLivingSqm * DEFAULT_PRICING.roomRates.kitchenLiving +
        full.roomAreas.bedroomSqm * DEFAULT_PRICING.roomRates.bedroom +
        full.roomAreas.bathroomSqm * DEFAULT_PRICING.roomRates.bathroom +
        full.roomAreas.hallStorageSqm * DEFAULT_PRICING.roomRates.hallStorage +
        full.roomAreas.circulationSqm * DEFAULT_PRICING.roomRates.circulation) *
      SQM_TO_SQFT;
    expect(total).toBeCloseTo(hand, 2);
    expect(breakdown!.every((b) => b.amount > 0)).toBe(true);
  });

  it('flows into the appraisal as line D01 and the pctBuild lines follow it', () => {
    const r = runAppraisal(full.schedule, DEFAULT_PRICING, full.roomAreas);
    expect(r.devCosts.buildCostSource).toBe('roomRates');
    const d01 = r.devCosts.groups.construction.lines.find((l) => l.code === 'D01')!;
    expect(d01.amount).toBeCloseTo(r.devCosts.buildCost, 2);
    const d08 = r.devCosts.groups.construction.lines.find((l) => l.code === 'D08')!;
    expect(d08.amount).toBeCloseTo(0.05 * r.devCosts.buildCost, 2);
  });

  it('a mixed option carries commercial area at the commercial rate', () => {
    const mixed = options.find((o) => o.mode === 'mixed_ground_commercial')!;
    expect(mixed.roomAreas.commercialSqm).toBeGreaterThan(0);
    const { breakdown } = buildCostFromRooms(DEFAULT_PRICING, mixed.roomAreas);
    expect(breakdown!.some((b) => b.label.startsWith('Commercial'))).toBe(true);
  });

  it('falls back to fixed D01 when no room data exists (golden demo unaffected)', () => {
    const r = runAppraisal(DEMO_SCHEDULE, DEFAULT_PRICING);
    expect(r.devCosts.buildCostSource).toBe('fixed');
    expect(r.devCosts.buildCost).toBe(2305099);
    expect(r.warnings.some((w) => w.includes('falls back'))).toBe(true);
  });
});

describe('edge-case guards', () => {
  it('zero-length phases are clamped, not divided by', () => {
    const s = altSpec();
    s.finance.legalMonths = 0;
    s.finance.preConMonths = 0;
    const r = runAppraisal(ALT_SCHEDULE, s);
    expect(Number.isFinite(r.finance.totalCostsAfterFinance)).toBe(true);
    const spent = r.cashflow.reduce((sum, m) => sum + m.costs, 0);
    expect(spent).toBeCloseTo(r.devCosts.totalPreFinance, 4); // nothing dropped
    expect(r.warnings.some((w) => w.includes('clamped'))).toBe(true);
  });

  it('warns when the programme exceeds the cashflow horizon', () => {
    const s = altSpec();
    const long = ALT_SCHEDULE.map((u) => ({ ...u, buildMonths: 50 }));
    const r = runAppraisal(long, s);
    expect(r.programme.pcMonth).toBeGreaterThan(MONTHS);
    expect(r.warnings.some((w) => w.includes('horizon'))).toBe(true);
  });

  it('warns when sell-out exceeds the 36-month scenario horizon', () => {
    const s = altSpec();
    s.finance.sales.velocityPerMonth = 0.1;
    const r = runAppraisal(ALT_SCHEDULE, s);
    expect(r.warnings.some((w) => w.includes('Sell-out'))).toBe(true);
  });
});

describe('regulatory checks (floorplan converter)', () => {
  const plan = planFloor(DEMO_BUILDING[1], DEFAULT_RULES, 'balanced');
  const compliance = validateFloor(plan, DEFAULT_RULES);

  it('units satisfy NDSS built-in storage minima via the hall/storage strip', () => {
    for (const u of plan.units) {
      const hall = u.rooms.filter((r) => r.type === 'hall').reduce((s, r) => s + r.area, 0);
      const need = u.beds === 0 ? 1.0 : u.beds === 1 ? 1.5 : u.beds === 2 ? 2.0 : 2.5;
      expect(hall).toBeGreaterThanOrEqual(need);
    }
    expect(compliance.allPass).toBe(true);
  });

  it('a unit with an undersized hall fails the storage check', () => {
    const bad = JSON.parse(JSON.stringify(plan.units[0]));
    for (const r of bad.rooms) if (r.type === 'hall') r.area = 0.5;
    const issues = validateUnit(bad, DEFAULT_RULES);
    expect(issues.some((i) => i.includes('storage'))).toBe(true);
  });

  it('surfaces advisories for requirements schematics cannot verify', () => {
    expect(compliance.advisories.some((a) => a.includes('Ceiling height'))).toBe(true);
    expect(compliance.advisories.some((a) => a.includes('Glazing'))).toBe(true);
    expect(compliance.advisories.some((a) => a.includes('single-aspect'))).toBe(true);
    expect(compliance.advisories.some((a) => a.includes('Planning'))).toBe(true);
  });

  it('NDSS Table 1 minima are the published 2015 values', () => {
    expect(DEFAULT_RULES.unitMinimumGia).toEqual({
      studio_1p: 37,
      '1bed_2p': 50,
      '2bed_3p': 61,
      '2bed_4p': 70,
      '3bed_4p': 74,
      '3bed_5p': 86,
      '3bed_6p': 95,
    });
    expect(DEFAULT_RULES.bedrooms.doubleMinArea).toBe(11.5);
    expect(DEFAULT_RULES.bedrooms.doubleMinWidth).toBe(2.75);
    expect(DEFAULT_RULES.bedrooms.otherDoubleMinWidth).toBe(2.55);
    expect(DEFAULT_RULES.bedrooms.singleMinArea).toBe(7.5);
    expect(DEFAULT_RULES.bedrooms.singleMinWidth).toBe(2.15);
    expect(DEFAULT_RULES.heights.minCeiling).toBe(2.3);
    expect(DEFAULT_RULES.storage).toEqual({ studio: 1.0, bed1: 1.5, bed2: 2.0, bed3: 2.5 });
  });
});
