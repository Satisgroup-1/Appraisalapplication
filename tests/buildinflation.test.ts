// Tender-price inflation on the main contract (AUDIT.md §6.4).
//
// The defect: HPI indexed revenue forward to completion while the build cost
// stayed frozen at today's money, so lengthening the programme manufactured
// profit — £386,876 of it on the demo at 5% HPI. Cost is now indexed to the
// months the contract is actually certified.

import { describe, expect, it } from 'vitest';
import {
  buildCostSchedule,
  buildIndexAt,
  computeDevCosts,
  programmeOf,
  runAppraisal,
  sCurveMonth,
  scheduleTotals,
} from '../src/core/dcf';
import { auditAppraisal, sanitizeSpec } from '../src/core/audit';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING, normalizePricing } from '../src/core/pricing';
import { sanitizeBuildEstimates } from '../src/core/estimates';
import type { BuildInflationInputs, PricingSpec } from '../src/core/types';

const HPI_5 = [0.05, 0.05, 0.05, 0.05, 0.05];

function spec(opts: { hpi?: boolean; inflation?: number | false; buildMonthsExtra?: number } = {}): PricingSpec {
  const s = clonePricing(DEFAULT_PRICING);
  if (opts.hpi) s.finance.hpi = { enabled: true, annualPct: [...HPI_5] };
  s.finance.buildInflation =
    opts.inflation === false || opts.inflation === undefined
      ? { enabled: false, annualPct: 0.04 }
      : { enabled: true, annualPct: opts.inflation };
  return s;
}

const schedule = (extraMonths = 0) =>
  DEMO_SCHEDULE.map((r) => ({ ...r, buildMonths: r.buildMonths + extraMonths }));

describe('the index and the certificate schedule', () => {
  const on: BuildInflationInputs = { enabled: true, annualPct: 0.04 };

  it('compounds monthly from the purchase, and is 1.0 when off or flat', () => {
    expect(buildIndexAt(on, 12)).toBeCloseTo(1.04, 12);
    expect(buildIndexAt(on, 6)).toBeCloseTo(Math.pow(1.04, 0.5), 12);
    expect(buildIndexAt(on, 0)).toBe(1);
    expect(buildIndexAt({ enabled: false, annualPct: 0.04 }, 12)).toBe(1);
    expect(buildIndexAt({ enabled: true, annualPct: 0 }, 12)).toBe(1);
  });

  it('the factor is exactly the S-curve-weighted index, not an averaged one', () => {
    const prog = { preConMonths: 3, conMonths: 12 };
    const { factor } = buildCostSchedule(on, prog);
    // Hand-sum: each S-curve slice priced at its own month's index.
    let manual = 0;
    for (let k = 1; k <= prog.conMonths; k++) {
      manual += sCurveMonth(k, prog.conMonths) * buildIndexAt(on, prog.preConMonths + k);
    }
    expect(factor).toBeCloseTo(manual, 12);
    // Sanity: strictly between the index at the first and last certificate.
    expect(factor).toBeGreaterThan(buildIndexAt(on, prog.preConMonths + 1));
    expect(factor).toBeLessThan(buildIndexAt(on, prog.preConMonths + prog.conMonths));
  });

  it('weights sum to one, so no pound of contract is lost or invented', () => {
    for (const rate of [0.04, 0.12, -0.05]) {
      const { weights } = buildCostSchedule({ enabled: true, annualPct: rate }, { preConMonths: 3, conMonths: 15 });
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12);
      expect(weights.every((w) => w > 0)).toBe(true);
    }
  });

  it('a later certificate carries a higher index than an earlier one', () => {
    const { weights } = buildCostSchedule(on, { preConMonths: 3, conMonths: 12 });
    const raw = Array.from({ length: 12 }, (_, i) => sCurveMonth(i + 1, 12));
    // Weight/raw ratio must increase monotonically: that ratio IS the index.
    const ratios = weights.map((w, i) => w / raw[i]);
    for (let i = 1; i < ratios.length; i++) expect(ratios[i]).toBeGreaterThan(ratios[i - 1]);
  });

  it('off, or flat, returns the raw S-curve untouched (no divide-by-almost-1)', () => {
    const prog = { preConMonths: 3, conMonths: 12 };
    const raw = Array.from({ length: 12 }, (_, i) => sCurveMonth(i + 1, 12));
    for (const bi of [
      { enabled: false, annualPct: 0.04 },
      { enabled: true, annualPct: 0 },
    ] as BuildInflationInputs[]) {
      const s = buildCostSchedule(bi, prog);
      expect(s.factor).toBe(1);
      expect(s.weights).toEqual(raw); // identical, not merely close
    }
  });

  it('deflation indexes the contract DOWN', () => {
    const { factor } = buildCostSchedule({ enabled: true, annualPct: -0.05 }, { preConMonths: 3, conMonths: 12 });
    expect(factor).toBeLessThan(1);
  });
});

describe('the contract sum and where it lands', () => {
  it('D01 and every %-of-build line follow the indexed contract', () => {
    const s = spec({ inflation: 0.04 });
    const r = runAppraisal(DEMO_SCHEDULE, s);
    const { factor } = buildCostSchedule(s.finance.buildInflation, r.programme);

    expect(r.devCosts.buildInflationFactor).toBeCloseTo(factor, 12);
    expect(r.devCosts.buildCost).toBeCloseTo(r.devCosts.buildCostToday * factor, 6);
    expect(r.devCosts.buildCost).toBeGreaterThan(r.devCosts.buildCostToday);

    const line = (code: string) =>
      r.devCosts.groups.construction.lines.find((l) => l.code === code)!.amount;
    expect(line('D01')).toBeCloseTo(r.devCosts.buildCost, 6);
    expect(line('D08')).toBeCloseTo(0.05 * r.devCosts.buildCost, 6); // contingency
    expect(line('D09')).toBeCloseTo(0.015 * r.devCosts.buildCost, 6); // demolition
  });

  it('the monthly certificates sum to the indexed contract sum', () => {
    const s = spec({ inflation: 0.06 });
    const r = runAppraisal(DEMO_SCHEDULE, s);
    // Conservation across the whole cashflow: every pound lands once.
    const spent = r.cashflow.reduce((a, m) => a + m.costs, 0);
    expect(spent).toBeCloseTo(r.devCosts.totalPreFinance, 2);
  });

  it('room-rate mode indexes the blended contract, leaving the rate table alone', () => {
    const s = spec({ inflation: 0.04 });
    s.buildCostMode = 'roomRates';
    const areas = {
      kitchenLivingSqm: 400,
      bedroomSqm: 300,
      bathroomSqm: 80,
      hallStorageSqm: 60,
      circulationSqm: 120,
      commercialSqm: 64,
    };
    const totals = scheduleTotals(DEMO_SCHEDULE);
    const prog = programmeOf(s.finance, totals);
    const { factor } = buildCostSchedule(s.finance.buildInflation, prog);
    const dev = computeDevCosts(s, totals, areas, 1, factor);

    // The breakdown stays at today's rates so rate x area still reconciles...
    const breakdownSum = dev.buildBreakdown!.reduce((a, b) => a + b.amount, 0);
    expect(breakdownSum).toBeCloseTo(dev.buildCostToday, 6);
    for (const b of dev.buildBreakdown!) expect(b.amount).toBeCloseTo(b.sqft * b.ratePsf, 6);
    // ...and the inflation step sits on top of it.
    expect(dev.buildCost).toBeCloseTo(dev.buildCostToday * factor, 6);
  });

  it('inflation off leaves the contract, and the whole appraisal, untouched', () => {
    const off = runAppraisal(DEMO_SCHEDULE, spec());
    expect(off.devCosts.buildInflationFactor).toBe(1);
    expect(off.devCosts.buildCost).toBe(off.devCosts.buildCostToday);
    // The demo's pinned figures (tests/dcf.test.ts) must be reachable.
    expect(Math.round(off.scenarios.s1.netProfit)).toBe(779615); // re-pinned with the (F) change, AUDIT.md §6.5
  });
});

describe('the asymmetry that manufactured profit', () => {
  it('closes most of the phantom profit HPI created on its own', () => {
    const hpiOnly = runAppraisal(DEMO_SCHEDULE, spec({ hpi: true }));
    const both = runAppraisal(DEMO_SCHEDULE, spec({ hpi: true, inflation: 0.04 }));
    const flat = runAppraisal(DEMO_SCHEDULE, spec());

    // HPI alone adds ~£387k of profit with costs frozen.
    expect(hpiOnly.scenarios.s1.netProfit - flat.scenarios.s1.netProfit).toBeGreaterThan(380_000);
    // Indexing the contract takes a real bite out of that.
    expect(both.scenarios.s1.netProfit).toBeLessThan(hpiOnly.scenarios.s1.netProfit);
    expect(hpiOnly.scenarios.s1.netProfit - both.scenarios.s1.netProfit).toBeGreaterThan(70_000);
  });

  it('a longer programme now costs more, where before it was free', () => {
    const run = (extra: number, inflation: number | false) =>
      runAppraisal(schedule(extra), spec({ inflation })).devCosts;

    // Frozen: the contract sum is identical however long the build runs.
    expect(run(12, false).buildCost).toBe(run(0, false).buildCost);
    expect(run(12, false).buildInflationFactor).toBe(1);

    // Indexed: each extra 6 months of programme is a bigger contract, because
    // the S-curve's centre of gravity moves later. Note the uplift tracks the
    // centre, not the end date — 12 extra months moves the midpoint by 6, so a
    // 24-month build at 4% pa carries ~5.2%, not ~8%.
    const f0 = run(0, 0.04).buildInflationFactor;
    const f6 = run(6, 0.04).buildInflationFactor;
    const f12 = run(12, 0.04).buildInflationFactor;
    expect(f0).toBeCloseTo(1.031577, 5); // 12-month build, months 4-15
    expect(f6).toBeCloseTo(1.041792, 5); // 18-month build, months 4-21
    expect(f12).toBeCloseTo(1.052128, 5); // 24-month build, months 4-27
    expect(f12).toBeGreaterThan(f6);
    expect(f6).toBeGreaterThan(f0);
    // In money: a year longer on site adds ~£47k to a £2.3m contract.
    expect(run(12, 0.04).buildCost - run(0, 0.04).buildCost).toBeGreaterThan(45_000);
  });

  it('warns loudly when HPI is on and tender inflation is off', () => {
    const asym = runAppraisal(DEMO_SCHEDULE, spec({ hpi: true }));
    const warning = asym.warnings.find((w) => /tender-price inflation is OFF/i.test(w));
    expect(warning).toBeDefined();
    expect(warning).toMatch(/longer programme/i);

    // Silent once both are on, or when HPI is off.
    expect(
      runAppraisal(DEMO_SCHEDULE, spec({ hpi: true, inflation: 0.04 })).warnings.some((w) =>
        /tender-price inflation is OFF/i.test(w),
      ),
    ).toBe(false);
    expect(
      runAppraisal(DEMO_SCHEDULE, spec()).warnings.some((w) => /tender-price inflation is OFF/i.test(w)),
    ).toBe(false);
    // An all-zero HPI array is not the trap, so it must not cry wolf.
    const zeroHpi = clonePricing(DEFAULT_PRICING);
    zeroHpi.finance.hpi = { enabled: true, annualPct: [0, 0, 0, 0, 0] };
    expect(
      runAppraisal(DEMO_SCHEDULE, zeroHpi).warnings.some((w) => /tender-price inflation is OFF/i.test(w)),
    ).toBe(false);
  });

  it('reports the factor it applied, so the uplift is never silent', () => {
    const r = runAppraisal(DEMO_SCHEDULE, spec({ inflation: 0.04 }));
    const w = r.warnings.find((x) => /indexed for tender-price inflation/i.test(x));
    expect(w).toContain('4.0% pa');
    expect(w).toMatch(/above today’s money/);
    // An enabled-but-zero rate says so rather than implying an uplift.
    expect(
      runAppraisal(DEMO_SCHEDULE, spec({ inflation: 0 })).warnings.some((x) => /rate is zero/i.test(x)),
    ).toBe(true);
  });
});

describe('inputs and migration', () => {
  it('projects saved before build inflation existed load with it OFF', () => {
    const legacy = JSON.parse(JSON.stringify(clonePricing(DEFAULT_PRICING))) as Record<string, any>;
    delete legacy.finance.buildInflation;
    const n = normalizePricing(legacy as PricingSpec);
    expect(n.finance.buildInflation.enabled).toBe(false);
    // ...so a stored appraisal's profit does not move on load.
    expect(Math.round(runAppraisal(DEMO_SCHEDULE, n).scenarios.s1.netProfit)).toBe(779615);
  });

  it('a truthy-but-empty block cannot inherit the default and flip the model', () => {
    // The trap AUDIT.md §6.1 finding 8 found in the SDLT block.
    const s = JSON.parse(JSON.stringify(clonePricing(DEFAULT_PRICING))) as Record<string, any>;
    s.finance.buildInflation = {};
    expect(normalizePricing(s as PricingSpec).finance.buildInflation.enabled).toBe(false);
  });

  it('an explicitly enabled block survives a round trip', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.buildInflation = { enabled: true, annualPct: 0.055, region: 'Manchester' };
    const n = normalizePricing(JSON.parse(JSON.stringify(s)));
    expect(n.finance.buildInflation).toMatchObject({ enabled: true, annualPct: 0.055, region: 'Manchester' });
  });

  it('sanitizeSpec clamps an implausible rate and reports it', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.buildInflation = { enabled: true, annualPct: 4 }; // 400% pa, meant 4%
    const { spec: clean, repairs } = sanitizeSpec(s);
    expect(clean.finance.buildInflation.annualPct).toBe(0.3);
    expect(repairs.map((r) => r.field)).toContain('build inflation rate');
  });

  it('sanitizeSpec repairs a missing or malformed block to off', () => {
    const s = JSON.parse(JSON.stringify(clonePricing(DEFAULT_PRICING))) as Record<string, any>;
    s.finance.buildInflation = { annualPct: 0.04 }; // no `enabled`
    const { spec: clean, repairs } = sanitizeSpec(s as PricingSpec);
    expect(clean.finance.buildInflation.enabled).toBe(false);
    expect(repairs.map((r) => r.field)).toContain('build inflation');
  });

  it('deflation is allowed; absurd deflation is not', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.buildInflation = { enabled: true, annualPct: -0.5 };
    expect(sanitizeSpec(s).spec.finance.buildInflation.annualPct).toBe(-0.15);
  });
});

describe('the audit sees the inflation step', () => {
  it('passes clean with inflation on and off', () => {
    for (const inflation of [false, 0.04, -0.03] as const) {
      const s = spec({ hpi: true, inflation });
      const { spec: clean } = sanitizeSpec(s);
      const r = runAppraisal(DEMO_SCHEDULE, clean);
      const report = auditAppraisal(r, clean, DEMO_SCHEDULE);
      expect(report.failCount, `inflation ${inflation}`).toBe(0);
      expect(report.checks.some((c) => c.id === 'costs-buildinflation')).toBe(true);
    }
  });

  it('catches a corrupted factor that every %-of-build line agrees with', () => {
    // The reason this check exists: a wrong factor is conservation-consistent,
    // so nothing else in the audit would notice.
    const s = spec({ inflation: 0.04 });
    const { spec: clean } = sanitizeSpec(s);
    const r = runAppraisal(DEMO_SCHEDULE, clean);
    const seeded = { ...r, devCosts: { ...r.devCosts, buildInflationFactor: r.devCosts.buildInflationFactor * 1.05 } };
    const report = auditAppraisal(seeded, clean, DEMO_SCHEDULE);
    expect(report.failCount).toBeGreaterThan(0);
    expect(report.checks.find((c) => c.id === 'costs-buildinflation')!.pass).toBe(false);
  });

  it('catches a contract sum that does not equal today’s cost × the factor', () => {
    const s = spec({ inflation: 0.04 });
    const { spec: clean } = sanitizeSpec(s);
    const r = runAppraisal(DEMO_SCHEDULE, clean);
    const seeded = { ...r, devCosts: { ...r.devCosts, buildCostToday: r.devCosts.buildCostToday * 0.9 } };
    const report = auditAppraisal(seeded, clean, DEMO_SCHEDULE);
    expect(report.checks.find((c) => c.id === 'costs-buildtoday')!.pass).toBe(false);
  });
});

describe('the researched tender-price forecast', () => {
  it('is sanitised into the estimate, clamped to a credible band', () => {
    const raw = {
      blendedPsf: { low: 180, likely: 210, high: 250, confidence: 'medium', rationale: 'BCIS', sources: ['BCIS 2026'] },
      tenderInflationPa: { low: 0.02, likely: 0.045, high: 0.07, confidence: 'medium', rationale: 'TPI', sources: ['BCIS TPI'] },
    };
    const clean = sanitizeBuildEstimates(raw, 'Manchester', '2026-08-24T00:00:00Z')!;
    expect(clean.tenderInflationPa).toMatchObject({ low: 0.02, likely: 0.045, high: 0.07 });

    // A percentage sent as 4.5 instead of 0.045 clamps rather than 450% pa.
    const silly = sanitizeBuildEstimates(
      { ...raw, tenderInflationPa: { ...raw.tenderInflationPa, likely: 4.5 } },
      'x',
      'y',
    )!;
    expect(silly.tenderInflationPa!.likely).toBe(0.3);
  });

  it('is absent rather than zero when the research found nothing', () => {
    const clean = sanitizeBuildEstimates(
      { blendedPsf: { low: 180, likely: 210, high: 250, confidence: 'low', rationale: '', sources: [] } },
      'x',
      'y',
    )!;
    // Zero would read as "tender prices are flat" rather than "not known".
    expect(clean.tenderInflationPa).toBeUndefined();
    expect(clean.blendedPsf.likely).toBe(210);
  });
});
