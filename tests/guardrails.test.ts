// Guard rails and plausibility checks (AUDIT.md §6.6).
//
// Four defects that all share one shape: a degenerate input produced a
// confident-looking number instead of an explicit "not applicable", and
// nothing on screen said so.
//
// A4 — an over-equitised scheme booked a NEGATIVE dev-loan arrangement fee,
//      i.e. phantom finance income reducing total costs.
// A6 — velocityPerMonth = 0 reported "sold out at completion" (duration 15)
//      alongside a loan that never repays and £1.16m of extra interest.
// A8 — fundingGap was computed every month and surfaced nowhere: months of
//      spend with no funding source, silently.
// A9 — covenant flags read "OK" on a zero denominator: a scheme with no sale
//      prices passed the LTGDV covenant.
// E3 — the in-app auditor re-derived identities but had no plausibility
//      checks, so it could not catch any of the above.

import { describe, expect, it } from 'vitest';
import { runAppraisal } from '../src/core/dcf';
import { auditAppraisal, sanitizeSpec } from '../src/core/audit';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import type { PricingSpec, ScheduleRow } from '../src/core/types';

const spec = (mut: (s: PricingSpec) => void = () => {}): PricingSpec => {
  const s = clonePricing(DEFAULT_PRICING);
  mut(s);
  return s;
};

const run = (mut?: (s: PricingSpec) => void, schedule: ScheduleRow[] = DEMO_SCHEDULE) =>
  runAppraisal(schedule, spec(mut));

/** The demo with every sale price stripped out: rent still runs, GDV is nil. */
const NO_PRICE_SCHEDULE: ScheduleRow[] = DEMO_SCHEDULE.map((u) => ({ ...u, salePsf: 0, unitGdv: 0 }));

const matching = (warnings: string[], re: RegExp) => warnings.filter((w) => re.test(w));

// ---------------------------------------------------------------------------
// A4 — the dev facility estimate can never be negative
// ---------------------------------------------------------------------------

describe('over-equitised schemes (A4)', () => {
  // £6m of equity against ~£5.1m of cost. The unfloored E29 formula
  // (totalPreFinance - equity - bridgeAdvance + estRedemption) went to
  // -£812,718 and the arrangement fee to -£12,191.
  const rich = () => run((s) => (s.finance.equity.total = 6_000_000));

  it('floors the facility estimate at zero', () => {
    expect(rich().finance.devFacilityEstimate).toBeGreaterThanOrEqual(0);
  });

  it('never books the arrangement fee as finance income', () => {
    const r = rich();
    expect(r.finance.devArrangementFee).toBeGreaterThanOrEqual(0);
    // Total finance costs are a cost, in every funding mix.
    expect(r.finance.totalFinanceCosts).toBeGreaterThanOrEqual(0);
  });

  it('says so when the estimate is nil but the loan is actually drawn', () => {
    // The estimate is workbook-faithful (E29) and nets equity against cost,
    // so on a cash-rich deal it reads nil — while the cashflow still draws the
    // facility to redeem the bridge at construction start. Flooring the
    // estimate removes the phantom income but leaves a real facility priced at
    // a £0 arrangement fee, so the divergence has to be visible.
    const r = rich();
    expect(r.finance.peakDevBalance).toBeGreaterThan(0);
    expect(r.finance.devFacilityEstimate).toBe(0);
    expect(matching(r.warnings, /facility/i).length).toBeGreaterThan(0);
  });

  it('leaves a normally-funded scheme untouched', () => {
    // The demo draws a real facility; nothing above may move its figures.
    const base = run();
    expect(base.finance.devFacilityEstimate).toBeCloseTo(3787281.620426354, 2);
    expect(base.finance.devArrangementFee).toBeCloseTo(56809.22430639531, 2);
    expect(matching(base.warnings, /facility/i)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A6 — zero sales velocity is "no sales modelled", not "sold out at PC"
// ---------------------------------------------------------------------------

describe('zero sales velocity (A6)', () => {
  const still = () => run((s) => (s.finance.sales.velocityPerMonth = 0));

  it('reports no sell-out rather than month zero', () => {
    const s2 = still().scenarios.s2;
    expect(s2.monthsToSellOut).toBeNull();
    expect(s2.totalDurationMonths).toBeNull();
  });

  it('no longer claims a duration that contradicts the interest bill', () => {
    // Previously: totalDurationMonths 15 ("sold out at completion") next to
    // monthsToRepay '36+' and £1.16m of extra interest. Two universes.
    const s2 = still().scenarios.s2;
    expect(s2.monthsToRepay).toBe('36+');
    expect(s2.extraInterest).toBeGreaterThan(1_000_000);
    expect(s2.totalDurationMonths).not.toBe(15);
  });

  it('warns, where the old sell-out warning was gated on velocity > 0', () => {
    expect(matching(still().warnings, /no sales|velocity/i).length).toBeGreaterThan(0);
  });

  it('leaves a selling scheme reporting real months', () => {
    const s2 = run().scenarios.s2;
    expect(s2.monthsToSellOut).toBe(6);
    expect(s2.totalDurationMonths).toBe(21);
    expect(matching(run().warnings, /no sales/i)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A8 — unfunded months are reported, not just computed
// ---------------------------------------------------------------------------

describe('funding gaps (A8)', () => {
  // No equity at all: pre-construction spend exceeds the bridge advance from
  // month 1, and no dev loan draws before construction start.
  const unfunded = () => run((s) => (s.finance.equity.total = 0));

  it('quantifies the shortfall, month by month', () => {
    const r = unfunded();
    const gaps = r.cashflow.filter((m) => m.fundingGap);
    expect(gaps.map((m) => m.month)).toEqual([1, 2, 3]);
    // Every flagged month carries the amount it is short by.
    for (const m of gaps) expect(m.fundingShortfall).toBeGreaterThan(0);
    // And an unflagged month is short by nothing.
    for (const m of r.cashflow.filter((x) => !x.fundingGap)) expect(m.fundingShortfall).toBe(0);
  });

  it('warns with the peak shortfall', () => {
    const r = unfunded();
    const w = matching(r.warnings, /unfunded|funding/i);
    expect(w.length).toBeGreaterThan(0);
    const peak = Math.max(...r.cashflow.map((m) => m.fundingShortfall));
    // The number in the warning must be the real peak, not a rounded guess.
    expect(w[0]).toContain(Math.round(peak).toLocaleString('en-GB'));
  });

  it('stays quiet on a properly funded scheme', () => {
    const r = run();
    expect(r.cashflow.every((m) => !m.fundingGap)).toBe(true);
    expect(r.cashflow.every((m) => m.fundingShortfall === 0)).toBe(true);
    expect(matching(r.warnings, /unfunded/i)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A9 — a zero denominator is not applicable, never a pass
// ---------------------------------------------------------------------------

describe('covenant flags on zero denominators (A9)', () => {
  const noGdv = () => run(undefined, NO_PRICE_SCHEDULE);

  it('does not pass the LTGDV covenant on a scheme with no sale prices', () => {
    const r = noGdv();
    expect(r.totals.gdv).toBe(0);
    expect(r.finance.ltgdvAtPeak).toBeNull();
    // The old behaviour: ltgdvAtPeak 0, so 0 <= maxLtgdv, so `true`.
    expect(r.finance.ltgdvOk).not.toBe(true);
    expect(r.finance.ltgdvOk).toBeNull();
  });

  it('reports profit ratios as not applicable rather than zero', () => {
    const s = noGdv().scenarios;
    expect(s.s1.profitOnGdv).toBeNull();
    // A loss against no revenue is still a real loss — the profit itself stands.
    expect(s.s1.netProfit).toBeLessThan(0);
  });

  it('reports interest cover as not applicable when nothing is borrowed', () => {
    // No GDV means no refinance advance, so no interest to cover.
    const s3 = noGdv().scenarios.s3;
    expect(s3.annualInterest).toBe(0);
    expect(s3.interestCover).toBeNull();
  });

  it('still reports real ratios on the demo', () => {
    const r = run();
    expect(r.finance.ltgdvAtPeak).toBeCloseTo(0.6374534854008946, 9);
    expect(r.finance.ltgdvOk).toBe(true);
    expect(r.scenarios.s1.profitOnGdv).toBeCloseTo(0.12477376194132116, 9);
  });
});

// ---------------------------------------------------------------------------
// A7 — the refinance ICR warning (client decision: warn below 100% cover only)
// ---------------------------------------------------------------------------

describe('refinance interest cover (A7)', () => {
  it('warns on the demo, where net rent does not cover mortgage interest', () => {
    const r = run();
    // ICR 0.87: £193,800 of net rent against £223,374 of interest.
    expect(r.scenarios.s3.interestCover).toBeLessThan(1);
    expect(matching(r.warnings, /interest cover|does not cover/i).length).toBeGreaterThan(0);
  });

  it('stays quiet once rent covers the interest', () => {
    // Halve the advance and the same rent clears the interest comfortably.
    const r = run((s) => (s.finance.refinance.ltv = 0.25));
    expect(r.scenarios.s3.interestCover).toBeGreaterThan(1);
    expect(matching(r.warnings, /interest cover/i)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// E3 — the auditor can now catch all of the above
// ---------------------------------------------------------------------------

describe('auditor plausibility checks (E3)', () => {
  const auditOf = (mut?: (s: PricingSpec) => void, schedule: ScheduleRow[] = DEMO_SCHEDULE) => {
    const cleaned = sanitizeSpec(spec(mut));
    const r = runAppraisal(schedule, cleaned.spec);
    return { report: auditAppraisal(r, cleaned.spec, schedule), r };
  };
  const check = (id: string, mut?: (s: PricingSpec) => void, schedule?: ScheduleRow[]) => {
    const c = auditOf(mut, schedule).report.checks.find((x) => x.id === id);
    expect(c, `check ${id} is missing from the report`).toBeDefined();
    return c!;
  };

  it('checks the facility estimate is never negative', () => {
    expect(check('plaus-facility').pass).toBe(true);
    expect(check('plaus-facility', (s) => (s.finance.equity.total = 6_000_000)).pass).toBe(true);
  });

  it('checks no month is left unfunded', () => {
    expect(check('plaus-funded').pass).toBe(true);
    const unfunded = check('plaus-funded', (s) => (s.finance.equity.total = 0));
    expect(unfunded.pass).toBe(false);
    expect(unfunded.detail).toBeTruthy();
  });

  it('checks a below-cover ICR is flagged rather than that the deal is good', () => {
    // The demo's ICR of 0.87 is a true statement about the scheme, not a model
    // defect, so the auditor must NOT fail on it — it must fail only if the
    // model presents an unfundable refinance in silence.
    expect(check('plaus-icr').pass).toBe(true);
    expect(check('plaus-icr', (s) => (s.finance.refinance.ltv = 0.25)).pass).toBe(true);

    // Strip the warning and the same numbers become a defect: an exit the model
    // shows as live with nothing saying it cannot be funded.
    const cleaned = sanitizeSpec(spec());
    const r = runAppraisal(DEMO_SCHEDULE, cleaned.spec);
    expect(r.scenarios.s3.interestCover).toBeLessThan(1);
    const silent = { ...r, warnings: r.warnings.filter((w) => !/interest cover/i.test(w)) };
    const c = auditAppraisal(silent, cleaned.spec, DEMO_SCHEDULE).checks.find((x) => x.id === 'plaus-icr');
    expect(c!.pass).toBe(false);
    expect(c!.detail).toContain('0.87');
  });

  it('keeps a real covenant breach a breach', () => {
    // Guards the not-applicable logic against swallowing a genuine failure:
    // ltgdvOk false must stay false, and plaus-ratios must still pass.
    const over = auditOf((s) => (s.finance.devLoan.maxLtgdv = 0.1));
    expect(over.r.finance.ltgdvOk).toBe(false);
    expect(over.report.checks.find((c) => c.id === 'plaus-ratios')!.pass).toBe(true);
    expect(over.report.checks.find((c) => c.id === 'fin-ltgdv')!.pass).toBe(true);
  });

  it('checks no ratio passes on a zero denominator', () => {
    expect(check('plaus-ratios').pass).toBe(true);
    expect(check('plaus-ratios', undefined, NO_PRICE_SCHEDULE).pass).toBe(true);
  });

  it('keeps the whole report green on the demo', () => {
    const { report } = auditOf();
    expect(report.checks.filter((c) => !c.pass).map((c) => c.id)).toEqual([]);
    // The new checks are actually present, not just absent-and-therefore-green.
    for (const id of ['plaus-facility', 'plaus-finance-cost', 'plaus-funded', 'plaus-gap-amount', 'plaus-icr', 'plaus-ratios', 'plaus-duration']) {
      expect(report.checks.some((c) => c.id === id), id).toBe(true);
    }
  });
});
