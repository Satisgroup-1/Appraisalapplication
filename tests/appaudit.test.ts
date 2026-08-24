// The in-app automatic audit must (a) pass every check on a clean appraisal,
// (b) catch seeded corruption in results — an auditor that cannot fail is
// decoration — and (c) repair recoverable input messes with a note for every
// change, never silently.

import { describe, expect, it } from 'vitest';
import type { AppraisalResult, PricingSpec, ScheduleRow } from '../src/core/types';
import { auditAppraisal, repairSchedule, sanitizeSpec } from '../src/core/audit';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { runAppraisal } from '../src/core/dcf';

function cleanRun(mutate?: (s: PricingSpec) => void): { r: AppraisalResult; spec: PricingSpec } {
  const spec = clonePricing(DEFAULT_PRICING);
  spec.buildCostMode = 'fixed';
  mutate?.(spec);
  return { r: runAppraisal(DEMO_SCHEDULE, spec), spec };
}

const corrupt = (r: AppraisalResult): AppraisalResult => JSON.parse(JSON.stringify(r));

describe('audit passes clean appraisals', () => {
  it('demo defaults: every check passes', () => {
    const { r, spec } = cleanRun();
    const report = auditAppraisal(r, spec, DEMO_SCHEDULE);
    expect(report.failCount, JSON.stringify(report.checks.filter((c) => !c.pass), null, 2)).toBe(0);
    expect(report.checks.length).toBeGreaterThanOrEqual(25);
  });

  it('with VAT + HPI + waterfall + lever all on: every check passes', () => {
    const { r, spec } = cleanRun((s) => {
      s.finance.vat.optedToTax = true;
      s.finance.vat.fundedBy = 'vatLoan';
      s.finance.hpi = { enabled: true, annualPct: [0.04, 0.03, 0.03, 0.02, 0.02] };
      s.finance.waterfall = { mode: 'waterfall', prefRatePa: 0.08, residualInvestorPct: 0.5 };
      s.finance.sales.priceAdjust = 0.03;
    });
    const report = auditAppraisal(r, spec, DEMO_SCHEDULE);
    expect(report.failCount, JSON.stringify(report.checks.filter((c) => !c.pass), null, 2)).toBe(0);
  });
});

describe('audit catches seeded corruption', () => {
  const seedAndExpect = (id: string, seed: (r: AppraisalResult) => void) => {
    const { r, spec } = cleanRun();
    const bad = corrupt(r);
    seed(bad);
    const report = auditAppraisal(bad, spec, DEMO_SCHEDULE);
    const check = report.checks.find((c) => c.id === id);
    expect(check, `check ${id} should exist`).toBeTruthy();
    expect(check!.pass, `check ${id} should FAIL after seeding`).toBe(false);
  };

  it('a nudged scenario-1 profit', () => seedAndExpect('s1-profit', (r) => (r.scenarios.s1.netProfit += 1)));
  it('a cost line drifting from its driver', () =>
    seedAndExpect('costs-lines', (r) => (r.devCosts.groups.construction.lines.find((l) => l.code === 'D08')!.amount += 500)));
  it('an SDLT line drifting from the HMRC band computation', () =>
    // The demo runs the automatic non-residential regime, so the auditor must
    // recompute B04 from the bands, not accept whatever amount is present.
    seedAndExpect('costs-lines', (r) => (r.devCosts.groups.legals.lines.find((l) => l.code === 'B04')!.amount += 500)));
  it('a group total that stops matching its lines', () =>
    seedAndExpect('costs-group-legals', (r) => (r.devCosts.groups.legals.total += 1000)));
  it('a month of costs going missing', () => seedAndExpect('cf-conservation', (r) => (r.cashflow[5].costs -= 500)));
  it('retention leaking from the pot', () =>
    seedAndExpect('cf-retention', (r) => (r.cashflow[10].retentionWithheld += 250)));
  it('a VAT reclaim that never lands', () => {
    const { spec } = cleanRun();
    const vatSpec = clonePricing(spec);
    vatSpec.finance.vat.optedToTax = true;
    const r = runAppraisal(DEMO_SCHEDULE, vatSpec);
    const bad = corrupt(r);
    bad.cashflow[2].vatReclaimed = 0;
    const report = auditAppraisal(bad, vatSpec, DEMO_SCHEDULE);
    expect(report.checks.find((c) => c.id === 'cf-vat')!.pass).toBe(false);
  });
  it('finance costs that do not sum', () => seedAndExpect('fin-total', (r) => (r.finance.totalFinanceCosts += 10)));
  it('a distribution that does not add to net profit', () =>
    seedAndExpect('wf-s2-sum', (r) => (r.scenarios.s2.waterfall.investorProfit += 5)));
  it('a sensitivity grid detached from scenario 1', () =>
    seedAndExpect('grid1-zero', (r) => (r.sensitivity.grid1[2].netProfit += 100)));
  it('an inconsistent schedule cell', () => {
    const { r, spec } = cleanRun();
    const badSchedule: ScheduleRow[] = JSON.parse(JSON.stringify(DEMO_SCHEDULE));
    badSchedule[0].unitGdv *= 1.2; // no longer sqft x £psf
    const report = auditAppraisal(r, spec, badSchedule);
    expect(report.checks.find((c) => c.id === 'sched-cells')!.pass).toBe(false);
  });
});

describe('input repair (never silent)', () => {
  it('repairs non-finite and out-of-range finance inputs with a note each', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.finance.sales.velocityPerMonth = NaN;
    spec.finance.bridge.ltv = 1.4; // 140% LTV
    spec.finance.retention.pctAfterPc = 0.05; // more than the 3% withheld
    spec.finance.hpi.annualPct = [0.5, Number.NaN] as number[]; // too big, junk, too short
    const { spec: fixed, repairs } = sanitizeSpec(spec);
    expect(fixed.finance.sales.velocityPerMonth).toBe(DEFAULT_PRICING.finance.sales.velocityPerMonth);
    expect(fixed.finance.bridge.ltv).toBe(1);
    expect(fixed.finance.retention.pctAfterPc).toBe(fixed.finance.retention.pctDuringWorks);
    expect(fixed.finance.hpi.annualPct).toHaveLength(5);
    expect(fixed.finance.hpi.annualPct[0]).toBe(0.2); // clamped to the band
    expect(repairs.length).toBeGreaterThanOrEqual(4);
    for (const rep of repairs) expect(rep.reason.length).toBeGreaterThan(0);
    // The original spec is untouched.
    expect(Number.isNaN(spec.finance.sales.velocityPerMonth)).toBe(true);
  });

  it('repairs schedule cells from area x rate and reports the change', () => {
    const rows: ScheduleRow[] = JSON.parse(JSON.stringify(DEMO_SCHEDULE));
    rows[1].unitGdv = rows[1].unitGdv * 1.1; // drifted from sqft x psf
    rows[2].sqft = NaN;
    const { schedule, repairs } = repairSchedule(rows);
    expect(schedule[1].unitGdv).toBeCloseTo(schedule[1].sqft * schedule[1].salePsf, 4);
    expect(Number.isFinite(schedule[2].sqft)).toBe(true);
    expect(repairs.length).toBeGreaterThanOrEqual(2);
    // A repaired schedule then passes the audit cleanly.
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    const r = runAppraisal(schedule, spec);
    expect(auditAppraisal(r, spec, schedule).failCount).toBe(0);
  });

  it('repairs an unknown SDLT regime to manual, keeping the typed figure', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    (spec.finance.sdlt as { regime: string }).regime = 'freeport-special';
    const { spec: cleaned, repairs } = sanitizeSpec(spec);
    expect(cleaned.finance.sdlt.regime).toBe('manual');
    expect(repairs.some((r) => r.field === 'SDLT regime')).toBe(true);
  });

  it('a clean spec and schedule need zero repairs', () => {
    expect(sanitizeSpec(clonePricing(DEFAULT_PRICING)).repairs).toHaveLength(0);
    expect(repairSchedule(DEMO_SCHEDULE).repairs).toHaveLength(0);
  });
});

describe('duplicate cost codes (D11)', () => {
  // A cost line carried twice under one code is charged twice by the engine,
  // while costs-lines resolves both spec entries to the same engine line and
  // compares it against itself — a green audit against a doubled cost. The fix
  // is upstream: sanitizeSpec drops the surplus copy with a reported repair,
  // and an independent tripwire fails on any spec still carrying duplicates.
  const dupSpec = (code: string, mutateSecond?: (l: PricingSpec['devCosts'][number]) => void): PricingSpec => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    const original = spec.devCosts.find((l) => l.code === code)!;
    const copy = JSON.parse(JSON.stringify(original)) as PricingSpec['devCosts'][number];
    mutateSecond?.(copy);
    spec.devCosts.push(copy);
    return spec;
  };

  it('sanitizeSpec drops a duplicated D01 with a repair naming the code', () => {
    const { repairs } = sanitizeSpec(dupSpec('D01'));
    expect(repairs.length).toBeGreaterThanOrEqual(1);
    expect(repairs.some((rep) => `${rep.field} ${rep.reason}`.includes('D01'))).toBe(true);
  });

  it('the sanitised D01-duplicated spec prices to the clean figures', () => {
    const { spec } = sanitizeSpec(dupSpec('D01'));
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    expect(r.scenarios.s1.netProfit).toBeCloseTo(779614.9968750654, 2);
    expect(r.devCosts.totalPreFinance).toBeCloseTo(5116085.86508, 2);
  });

  it('auditAppraisal fails costs-duplicate-codes on a spec still carrying a duplicate', () => {
    const spec = dupSpec('D01');
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const check = auditAppraisal(r, spec, DEMO_SCHEDULE).checks.find((c) => c.id === 'costs-duplicate-codes');
    expect(check, 'costs-duplicate-codes should exist').toBeTruthy();
    expect(check!.pass).toBe(false);
    expect(check!.detail).toContain('D01');
  });

  it('de-duplication keeps the FIRST occurrence (later copy discarded)', () => {
    // Second copy carries a wildly different value; keeping the first means the
    // priced line is unchanged from clean. B01 is a plain fixed line so its
    // value flows straight through, which makes first-kept observable.
    const { spec } = sanitizeSpec(dupSpec('B01', (l) => (l.value = 999999)));
    expect(spec.devCosts.filter((l) => l.code === 'B01')).toHaveLength(1);
    expect(spec.devCosts.find((l) => l.code === 'B01')!.value).toBe(7500);
  });

  it('a clean spec: 0 repairs and costs-duplicate-codes passes (61 -> 62)', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    expect(sanitizeSpec(spec).repairs).toHaveLength(0);
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const report = auditAppraisal(r, spec, DEMO_SCHEDULE);
    const check = report.checks.find((c) => c.id === 'costs-duplicate-codes');
    expect(check!.pass).toBe(true);
    expect(report.passCount).toBe(62);
  });
});
