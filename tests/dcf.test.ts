// DCF engine tests, two kinds:
//
//  A. WORKBOOK PARITY — values Excel itself computed for Appraisal_Model_1
//     (cached results, data_only=True). These cover the parts where the
//     workbook is still the source of truth: the unit schedule, the bridge
//     (unchanged mechanics), facility sizing, and pre-finance cost totals.
//
//  NOTE on the 2026-08-24 re-pin (AUDIT.md §6.5): the (F) holding-cost lines
//  moved from lump sums to per-month-held rates, so they scale with the actual
//  sell-down. At the demo's 6-month hold the group totals £13,572 against the
//  old £13,550 — a deliberate +£22, being the difference between the old lumps
//  and honest round monthly figures. EVERY changed pin below traces to that
//  £22: pre-finance +£22.00, facility estimate +£22.00, arrangement fee +£0.33
//  (1.5% of it), all-in costs +£22.36, and each scenario's profit -£22.36.
//  Scenario 3 moved for a different and larger reason — it is now priced on the
//  LET basis (no selling costs, plus letting costs) — which is the point of the
//  change, not a side effect.
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
    close(result.finance.devFacilityEstimate, 3787281.620426354); // Inputs E29 (+£22.00)
    close(result.finance.devArrangementFee, 56809.22430639531); // Inputs E30 / C36 (+£0.33 = 1.5% x £22)
  });
  it('matches total pre-finance costs (amounts unchanged; only timing moved)', () => {
    close(result.devCosts.totalPreFinance, 5116085.86508); // F87 (+£22.00: the (F) re-pin)
  });
});

describe('B. model v2 regression: finance (S-curve + retention + deposit interest)', () => {
  it('dev loan figures', () => {
    close(result.finance.devInterestTotal, 187012.78481545442);
    close(result.finance.devBalanceAtPC, 3982955.1445482043);
    close(result.finance.peakDevBalance, 3982955.1445482043);
  });
  it('retention pot and deposit interest', () => {
    close(result.finance.retentionHeldPeak, 67792.32128472222);
    close(result.finance.depositInterestRetention, 2319.50586875);
  });
  it('totals', () => {
    close(result.finance.totalFinanceCosts, 354847.31591368595);
    close(result.finance.totalCostsAfterFinance, 5468613.675124936); // +£22.36
    close(result.finance.equityUsed, 1400000);
  });
});

describe('B. model v2 regression: scenarios', () => {
  it('S1 immediate sale', () => {
    close(result.scenarios.s1.netProfit, 779614.9968750654); // -£22.36
    // The ratio is nullable now (A9: no GDV means not applicable). The demo has
    // GDV, so it must be a real number — asserted, not assumed.
    expect(result.scenarios.s1.profitOnGdv).not.toBeNull();
    close(result.scenarios.s1.profitOnGdv!, 0.12477376194132116, 1e-9);
  });
  it('S2 delayed sales', () => {
    close(result.scenarios.s2.extraInterest, 71459.06678384484);
    close(result.scenarios.s2.depositInterestOnSurplus, 3003.4968171977434);
    close(result.scenarios.s2.netProfit, 711159.4269084183); // -£22.37
    expect(result.scenarios.s2.monthsToSellOut).toBe(6);
    expect(result.scenarios.s2.monthsToRepay).toBe(4);
  });
  it('S3 refinance & rent, priced on the LET basis', () => {
    // Selling costs are not incurred on a hold; letting set-up costs are.
    close(result.scenarios.s3.sellingCostsAvoided, 143723.43008000002);
    close(result.scenarios.s3.lettingCosts, 34500);
    // The dev loan at PC is lower without the sales & marketing spend, so the
    // refinance releases a real surplus instead of the old £2k shortfall.
    close(result.scenarios.s3.surplusReleased, 144899.449961863);
    close(result.scenarios.s3.costsIfLet, 5356164.679601388);
    close(result.scenarios.s3.unrealisedProfit, 892063.9923986131);
    close(result.scenarios.s3.netAnnualRent, 193800); // rents unchanged by v2
    close(result.scenarios.s3.netAnnualCashflow, -29574.175024000055); // driven by GDV & rates, unchanged
  });
  it('S4 refinance then delayed sales', () => {
    close(result.scenarios.s4.extraInterest, 46807.65075604594);
    close(result.scenarios.s4.netProfit, 695529.5155015405); // -£22.37
  });
});

describe('B. model v2 regression: sensitivity', () => {
  it('fixed cost base and grid 1 at -10%', () => {
    close(result.sensitivity.fixedCostBase, 5365890.2450449355); // +£22.36
    close(result.sensitivity.grid1[0].netProfit, 164164.47268306557); // -£22.36
  });
  it('grid 3 at 5.5% x 65% LTV equals scenario 3 cashflow', () => {
    const row = result.sensitivity.grid3[2];
    expect(row.rate).toBeCloseTo(0.055, 10);
    close(row.cells[2].cashflow, result.scenarios.s3.netAnnualCashflow);
  });
});
