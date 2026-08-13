// Golden tests: the DCF engine must reproduce the values Excel itself
// computed for Appraisal_Model_1.xlsx (cached results read from the
// workbook with data_only=True).

import { describe, expect, it } from 'vitest';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { DEFAULT_PRICING } from '../src/core/pricing';
import { runAppraisal } from '../src/core/dcf';

const result = runAppraisal(DEMO_SCHEDULE, DEFAULT_PRICING);

const close = (actual: number, expected: number, tolerance = 0.01) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

describe('unit schedule totals (1. Unit Import)', () => {
  it('matches units, NIA, GDV', () => {
    expect(result.totals.units).toBe(12); // F40
    close(result.totals.niaSqft, 10344.1079, 0.001); // F41
    close(result.totals.gdv, 6248228.672, 0.01); // F42
    expect(result.totals.maxBuildMonths).toBe(12); // F44
  });
});

describe('finance engine (4. Cashflow)', () => {
  it('matches bridge figures', () => {
    close(result.finance.bridgeArrangementFee, 25350); // C32
    close(result.finance.bridgeInterestTotal, 32591.341927083333); // C33
    close(result.finance.bridgeExitFee, 13254.413419270835); // C34
    close(result.finance.bridgeRedemptionTotal, 1338695.7553463543); // C35
  });
  it('matches dev loan figures', () => {
    close(result.finance.devFacilityEstimate, 3787259.620426355); // Inputs E29
    close(result.finance.devArrangementFee, 56808.89430639532); // Inputs E30 / C36
    close(result.finance.devBalanceAtPC, 4032062.8810614347); // C38
    close(result.finance.peakDevBalance, 4032062.8810614347); // C41
  });
  it('matches totals', () => {
    close(result.finance.totalFinanceCosts, 356319.6447920471); // C43
    close(result.finance.totalCostsAfterFinance, 5472383.509872048); // C44
    close(result.finance.equityUsed, 1400000); // C45
  });
});

describe('scenarios (5. Scenarios)', () => {
  it('S1 immediate sale', () => {
    close(result.scenarios.s1.netProfit, 775845.162127953); // F9
    close(result.scenarios.s1.profitOnGdv, 0.12417041738640658, 1e-9); // F11
  });
  it('S2 delayed sales', () => {
    close(result.scenarios.s2.extraInterest, 73221.20575511176); // F35
    close(result.scenarios.s2.netProfit, 702623.9563728413); // F36
    expect(result.scenarios.s2.monthsToSellOut).toBe(6); // F33
    expect(result.scenarios.s2.monthsToRepay).toBe(5); // F34
  });
  it('S3 refinance & rent', () => {
    close(result.scenarios.s3.surplusReleased, -51648.359440048225); // F46
    close(result.scenarios.s3.netAnnualRent, 193800); // F48
    close(result.scenarios.s3.netAnnualCashflow, -29574.175024000055); // F50
  });
  it('S4 refinance then delayed sales', () => {
    close(result.scenarios.s4.extraInterest, 47966.22836565975); // F71
    close(result.scenarios.s4.netProfit, 687155.0986635728); // F72
  });
});

describe('sensitivity (6. Sensitivity)', () => {
  it('fixed cost base', () => {
    close(result.sensitivity.fixedCostBase, 5369660.079792048); // F4
  });
  it('grid 1 at -10%', () => {
    close(result.sensitivity.grid1[0].netProfit, 160394.63793595321); // C8
  });
  it('grid 2 at -10% x 1/mo and +10% x 6/mo', () => {
    close(result.sensitivity.grid2[0].profits[0].netProfit, 16164.388627984794); // C17
    close(result.sensitivity.grid2[4].profits[4].netProfit, 1348026.6115275633); // G21 (+10% row x 6/mo)
  });
  it('grid 3 at 5.5% x 65% LTV equals scenario 3 cashflow', () => {
    const row = result.sensitivity.grid3[2];
    expect(row.rate).toBeCloseTo(0.055, 10);
    close(row.cells[2].cashflow, -29574.175024000055); // E29
  });
});
