// A5 — investor ROI must be reported on BOTH capital committed and capital
// actually drawn, in either distribution mode.
//
// The defect this file pins: the single headline `investorRoi` silently swaps
// its denominator with the profit mode (committed in 'simple', peak drawn in
// 'waterfall'). On the probe below — an over-committed scheme whose economics
// are identical either way (no pref, 50/50 residual) — that is 18.75% against
// 24.67%: 5.92 points of movement bought by a presentation switch. Reporting
// both bases always is the client's decision (appraisal-loop.md, "ROI
// denominator"), and it is what makes the two impossible to disagree.

import { describe, expect, it } from 'vitest';
import type { AppraisalResult, PricingSpec, WaterfallResult } from '../src/core/types';
import { clonePricing, DEFAULT_PRICING, normalizePricing } from '../src/core/pricing';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { runAppraisal } from '../src/core/dcf';
import { auditAppraisal } from '../src/core/audit';

const close = (actual: number, expected: number, tolerance = 0.01) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

/** The over-committed probe: £5m committed against £3.80m ever drawn. */
function probeSpec(mode: 'simple' | 'waterfall'): PricingSpec {
  const spec = clonePricing(DEFAULT_PRICING);
  spec.buildCostMode = 'fixed';
  spec.finance.equity = { total: 5_000_000, investorShare: 0.5 };
  spec.finance.waterfall = { mode, prefRatePa: 0, residualInvestorPct: 0.5 };
  return spec;
}

/** Peak cumulative equity actually called down over a scenario's horizon. */
const peakEquityCum = (r: AppraisalResult, exitMonth: number) => {
  let peak = 0;
  for (let m = 1; m <= Math.min(exitMonth, r.cashflow.length); m++) {
    peak = Math.max(peak, r.cashflow[m - 1].equityCum);
  }
  return peak;
};

describe('investor ROI is reported on both bases', () => {
  it('gives the same committed/drawn pair in simple and in waterfall mode', () => {
    // Measured in this checkout: profit 468,825.94 against 2,500,000 committed
    // and 1,900,218.69 drawn. Neither figure may depend on the profit mode.
    for (const mode of ['simple', 'waterfall'] as const) {
      const w = runAppraisal(DEMO_SCHEDULE, probeSpec(mode)).scenarios.s1.waterfall;
      close(w.investorRoiOnCommitted!, 0.1875303746939108, 1e-12);
      close(w.investorRoiOnDrawn!, 0.24672209529994052, 1e-12);
      close(w.investorProfit, 468825.93673477694, 1e-6);
    }
  });

  it('splits both bases between the two parties so the stack reconciles', () => {
    for (const mode of ['simple', 'waterfall'] as const) {
      const r = runAppraisal(DEMO_SCHEDULE, probeSpec(mode));
      const w = r.scenarios.s1.waterfall;
      expect(w.investorCommitted).toBe(2_500_000);
      expect(w.developerCommitted).toBe(2_500_000);
      close(w.investorDrawnPeak, 1900218.6900399998, 1e-6);
      close(w.developerDrawnPeak, 1900218.6900399998, 1e-6);
      // S1 exits at PC (month 15), by when the equity is fully deployed, so
      // the two drawn halves must sum to the equity the cashflow reports used.
      close(w.investorDrawnPeak + w.developerDrawnPeak, r.finance.equityUsed, 0.01);
      close(w.investorDrawnPeak + w.developerDrawnPeak, 3800437.3800799996, 0.01);
    }
  });

  it('each ROI is profit ÷ its own base, in every scenario and either mode', () => {
    for (const mode of ['simple', 'waterfall'] as const) {
      const r = runAppraisal(DEMO_SCHEDULE, probeSpec(mode));
      for (const key of ['s1', 's2', 's4'] as const) {
        const w: WaterfallResult = r.scenarios[key].waterfall;
        close(w.investorCommitted + w.developerCommitted, 5_000_000, 0.01);
        close(w.investorDrawnPeak + w.developerDrawnPeak, peakEquityCum(r, w.exitMonth), 0.02);
        expect(w.investorDrawnPeak).toBeLessThanOrEqual(w.investorCommitted + 0.01);
        close(w.investorRoiOnCommitted! * w.investorCommitted, w.investorProfit, 0.01);
        close(w.investorRoiOnDrawn! * w.investorDrawnPeak, w.investorProfit, 0.01);
        // Per annum figures are the same ratios over the same horizon.
        close(w.investorRoiPaOnCommitted!, (w.investorRoiOnCommitted! * 12) / w.exitMonth, 1e-12);
        close(w.investorRoiPaOnDrawn!, (w.investorRoiOnDrawn! * 12) / w.exitMonth, 1e-12);
      }
    }
  });

  it('moves nothing on the demo defaults, where committed is fully drawn', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    const w = runAppraisal(DEMO_SCHEDULE, spec).scenarios.s1.waterfall;
    // Legacy fields, unchanged by this cycle.
    expect(w.investorCapital).toBe(700000);
    close(w.investorRoi, 0.556867854910761, 1e-12);
    close(w.investorRoiPa, 0.4454942839286088, 1e-12);
    close(w.investorProfit, 389807.4984375327, 1e-6);
    // £1.4m committed and every pound of it called down, so the two bases
    // coincide and neither can flatter the other.
    expect(w.investorCommitted).toBe(700000);
    close(w.investorDrawnPeak, 700000, 1e-6);
    close(w.investorRoiOnCommitted!, w.investorRoi, 1e-12);
    close(w.investorRoiOnDrawn!, w.investorRoi, 1e-12);
    close(w.investorRoiPaOnCommitted!, w.investorRoiPa, 1e-12);
    close(w.investorRoiPaOnDrawn!, w.investorRoiPa, 1e-12);
  });

  it('reports a nil base as not applicable, never as a confident zero', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    spec.finance.equity = { total: 0, investorShare: 0.5 };
    const w = runAppraisal(DEMO_SCHEDULE, spec).scenarios.s1.waterfall;
    expect(w.investorCommitted).toBe(0);
    expect(w.investorDrawnPeak).toBe(0);
    expect(w.investorRoiOnCommitted).toBeNull();
    expect(w.investorRoiOnDrawn).toBeNull();
    expect(w.investorRoiPaOnCommitted).toBeNull();
    expect(w.investorRoiPaOnDrawn).toBeNull();
    // The legacy field keeps its documented zero: compatibility, not a claim.
    expect(w.investorRoi).toBe(0);
  });
});

describe('stored projects load unchanged', () => {
  it('a project file written before A5 reports the same figures it always did', () => {
    // Nothing was added to PricingSpec, so an old project file is read exactly
    // as before; the new fields are derived at run time from the same inputs.
    // The pins here are the values this scheme reported before the change.
    const stored = JSON.parse(JSON.stringify(clonePricing(DEFAULT_PRICING))) as PricingSpec;
    stored.buildCostMode = 'fixed';
    const w = runAppraisal(DEMO_SCHEDULE, normalizePricing(stored)).scenarios.s1.waterfall;
    expect(w.investorCapital).toBe(700000);
    expect(w.developerCapital).toBe(700000);
    close(w.investorRoi, 0.556867854910761, 1e-12);
    close(w.investorRoiPa, 0.4454942839286088, 1e-12);
    close(w.investorProfit, 389807.4984375327, 1e-6);
    close(w.developerProfit, 389807.4984375327, 1e-6);
    // Additive, not a migration: the new bases simply appear alongside.
    expect(w.investorCommitted).toBe(700000);
    close(w.investorDrawnPeak, 700000, 1e-6);
  });
});

describe('the auditor guards the capital bases', () => {
  it('passes wf-<s>-capital on a clean demo and fails when a drawn peak drifts', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const clean = auditAppraisal(r, spec, DEMO_SCHEDULE);
    for (const id of ['wf-s1-capital', 'wf-s2-capital', 'wf-s4-capital']) {
      expect(clean.checks.find((c) => c.id === id)?.pass, id).toBe(true);
    }

    const corrupted: AppraisalResult = JSON.parse(JSON.stringify(r));
    corrupted.scenarios.s1.waterfall.investorDrawnPeak += 1;
    const report = auditAppraisal(corrupted, spec, DEMO_SCHEDULE);
    expect(report.checks.find((c) => c.id === 'wf-s1-capital')?.pass).toBe(false);
    expect(report.checks.find((c) => c.id === 'wf-s2-capital')?.pass).toBe(true);
    expect(report.checks.find((c) => c.id === 'wf-s4-capital')?.pass).toBe(true);
  });
});
