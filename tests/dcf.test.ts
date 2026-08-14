// DCF engine tests, two kinds:
//
//  A. WORKBOOK PARITY — values Excel itself computed for Appraisal_Model_1
//     (cached results, data_only=True). These cover the parts where the
//     workbook is still the source of truth: the unit schedule, the bridge
//     (unchanged mechanics), facility sizing, and pre-finance cost totals.
//
//  B. MODEL V2 REGRESSION — the engine deliberately deviates from the
//     workbook where its simplifications were corrected (S-curve drawdown,
//     SDLT on completion, architect/QS through to PC, retention, holding
//     costs over the sell period, deposit interest). These pins catch
//     unintended change; the mechanics themselves are proven hand-computably
//     in tests/model2.test.ts. Deviations are documented in AUDIT.md.

import { describe, expect, it } from 'vitest';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { DEFAULT_PRICING } from '../src/core/pricing';
import { runAppraisal } from '../src/core/dcf';

const result = runAppraisal(DEMO_SCHEDULE, DEFAULT_PRICING);

const close = (actual: number, expected: number, tolerance = 0.01) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

describe('A. workbook parity: unit schedule totals (1. Unit Import)', () => {
  it('matches units, NIA, GDV', () => {
    expect(result.totals.units).toBe(12); // F40
    close(result.totals.niaSqft, 10344.1079, 0.001); // F41
    close(result.totals.gdv, 6248228.672, 0.01); // F42
    expect(result.totals.maxBuildMonths).toBe(12); // F44
  });
});

describe('A. workbook parity: bridge & facility sizing (unchanged mechanics)', () => {
  it('matches bridge figures', () => {
    close(result.finance.bridgeArrangementFee, 25350); // C32
    close(result.finance.bridgeInterestTotal, 32591.341927083333); // C33
    close(result.finance.bridgeExitFee, 13254.413419270835); // C34
    close(result.finance.bridgeRedemptionTotal, 1338695.7553463543); // C35
  });
  it('matches facility estimate and arrangement fee (set at signing on the estimate)', () => {
    close(result.finance.devFacilityEstimate, 3787259.620426355); // Inputs E29
    close(result.finance.devArrangementFee, 56808.89430639532); // Inputs E30 / C36
  });
  it('matches total pre-finance costs (amounts unchanged; only timing moved)', () => {
    close(result.devCosts.totalPreFinance, 5116063.865115651); // F87
  });
});

describe('B. model v2 regression: finance (S-curve + retention + deposit interest)', () => {
  it('dev loan figures', () => {
    close(result.finance.devInterestTotal, 187012.75817267515);
    close(result.finance.devBalanceAtPC, 3982954.7879054253);
    close(result.finance.peakDevBalance, 3982954.7879054253);
  });
  it('retention pot and deposit interest', () => {
    close(result.finance.retentionHeldPeak, 67792.32128472222);
    close(result.finance.depositInterestRetention, 2319.50586875);
  });
  it('totals', () => {
    close(result.finance.totalFinanceCosts, 354846.9557044789);
    close(result.finance.totalCostsAfterFinance, 5468591.314915729);
    close(result.finance.equityUsed, 1400000);
  });
});

describe('B. model v2 regression: scenarios', () => {
  it('S1 immediate sale', () => {
    close(result.scenarios.s1.netProfit, 779637.3570842724);
    close(result.scenarios.s1.profitOnGdv, 0.1247773405890277, 1e-9);
  });
  it('S2 delayed sales', () => {
    close(result.scenarios.s2.extraInterest, 71459.05646896636);
    close(result.scenarios.s2.depositInterestOnSurplus, 3003.49897858824);
    close(result.scenarios.s2.netProfit, 711181.7995938943);
    expect(result.scenarios.s2.monthsToSellOut).toBe(6);
    expect(result.scenarios.s2.monthsToRepay).toBe(4);
  });
  it('S3 refinance & rent', () => {
    close(result.scenarios.s3.surplusReleased, -2049.185352478642);
    close(result.scenarios.s3.netAnnualRent, 193800); // rents unchanged by v2
    close(result.scenarios.s3.netAnnualCashflow, -29574.175024000055); // driven by GDV & rates, unchanged
  });
  it('S4 refinance then delayed sales', () => {
    close(result.scenarios.s4.extraInterest, 46807.642341926956);
    close(result.scenarios.s4.netProfit, 695551.8888126161);
  });
});

describe('B. model v2 regression: sensitivity', () => {
  it('fixed cost base and grid 1 at -10%', () => {
    close(result.sensitivity.fixedCostBase, 5365867.884835728);
    close(result.sensitivity.grid1[0].netProfit, 164186.83289227262);
  });
  it('grid 3 at 5.5% x 65% LTV equals scenario 3 cashflow', () => {
    const row = result.sensitivity.grid3[2];
    expect(row.rate).toBeCloseTo(0.055, 10);
    close(row.cells[2].cashflow, result.scenarios.s3.netAnnualCashflow);
  });
});
