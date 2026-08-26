// D4: the spec's discriminants — buildCostMode, vat.fundedBy, waterfall.mode,
// sdlt.regime — are closed sets the engine tests with `=== 'literal'`. A value
// outside the set is therefore absorbed silently: it takes the else-branch,
// moves the numbers, and is reported nowhere. Every one of the three untested
// discriminants errs in the direction that FLATTERS the deal, so these tests
// pin both halves of the answer: the sanitiser must disclose the resolution as
// a repair, and the resolution must be the branch the engine already took, so
// no stored project's figure moves. (sdlt.regime, the one already validated, is
// not like the other three: an unrecognised regime takes the AUTOMATIC arm,
// computeSdlt has no default case, and the appraisal goes NaN — so its 'manual'
// fallback is justified by keeping the solicitor's typed B04, not by
// reproducing a branch that is unusable. It is checked here only by D's
// tripwire case.)
//
// The figures below were measured on this checkout (2026-08-24, HEAD 2dfdf20)
// before the fix and must be identical after it — a repair that re-prices is
// the wrong repair.

import { describe, expect, it } from 'vitest';
import { DEMO_BUILDING } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import { runAppraisal } from '../src/core/dcf';
import { generateOptions } from '../src/core/conversions';
import { DEFAULT_RULES } from '../src/core/rules';
import { auditAppraisal, sanitizeSpec } from '../src/core/audit';
import type { AppraisalResult, PricingSpec } from '../src/core/types';

const OPTION = generateOptions(DEMO_BUILDING, DEFAULT_RULES, DEFAULT_PRICING).find((o) => o.id === 'full_balanced')!;

/** Mutate a clone of the shipped spec, then run it exactly as AppraisalView does. */
function run(mutate: (s: PricingSpec) => void) {
  const raw = clonePricing(DEFAULT_PRICING);
  mutate(raw);
  const { spec: clean, repairs } = sanitizeSpec(raw);
  const result = runAppraisal(OPTION.schedule, clean, OPTION.roomAreas);
  return { raw, clean, repairs, result, report: auditAppraisal(result, clean, OPTION.schedule) };
}

/** The main contract line, which is what buildCostMode actually decides. */
const d01Of = (r: AppraisalResult) =>
  (Object.keys(r.devCosts.groups) as (keyof AppraisalResult['devCosts']['groups'])[])
    .flatMap((g) => r.devCosts.groups[g].lines)
    .find((l) => l.code === 'D01')!.amount;

describe('D4 — unrecognised spec discriminants are repaired and disclosed', () => {
  it('A: an unknown buildCostMode resolves to fixed, is reported, and re-prices nothing', () => {
    const { clean, repairs, result } = run((s) => {
      (s as { buildCostMode: unknown }).buildCostMode = 'typo';
    });

    expect(repairs).toHaveLength(1);
    expect(repairs[0].field).toMatch(/build cost mode/i);
    expect(repairs[0].from).toBe('typo');
    expect(repairs[0].to).toBe('fixed');
    // The user has to be told which way it went: this is £221,662 of build cost.
    expect(repairs[0].reason).toMatch(/fixed/i);
    expect(clean.buildCostMode).toBe('fixed');

    // Disclosure, not a re-price: identical to what the engine already did with
    // the corrupt string. The £251,748 of overstated profit is made visible
    // here, not removed — only the user can choose the right mode.
    expect(d01Of(result)).toBeCloseTo(2305099, 2);
    expect(result.scenarios.s1.netProfit).toBeCloseTo(2331378.373762631, 2);
  });

  it('B: an unknown waterfall mode resolves to simple, and the three wf-*-simple checks come back', () => {
    const { clean, repairs, result, report } = run((s) => {
      s.finance.waterfall = { mode: 'typo' as never, prefRatePa: 0.08, residualInvestorPct: 0.5 };
    });

    expect(repairs).toHaveLength(1);
    expect(repairs[0].to).toBe('simple');
    expect(clean.finance.waterfall.mode).toBe('simple');

    // The engine already split simply (every `mode === 'waterfall'` test was
    // false); all that changes is that the result now SAYS so, which is what
    // makes WaterfallTable render it and the auditor assess it. A genuine
    // 'waterfall' run would have paid the investor 1,072,525.53.
    const wf = result.scenarios.s1.waterfall;
    expect(wf.mode).toBe('simple');
    expect(wf.investorProfit).toBeCloseTo(1039815.0801394759, 2);
    expect(wf.investorProfit).toBeCloseTo(result.scenarios.s1.netProfit * 0.5, 6);

    for (const id of ['wf-s1-simple', 'wf-s2-simple', 'wf-s4-simple']) {
      const check = report.checks.find((c) => c.id === id);
      expect(check, `${id} must be assessed, not skipped`).toBeDefined();
      expect(check!.pass).toBe(true);
    }
  });

  it('C: an unknown vat.fundedBy resolves to equity, and states the VAT-loan cost the typo avoided', () => {
    const typo = run((s) => {
      s.finance.vat.optedToTax = true;
      (s.finance.vat as { fundedBy: unknown }).fundedBy = 'typo';
    });

    expect(typo.repairs).toHaveLength(1);
    expect(typo.repairs[0].to).toBe('equity');
    expect(typo.clean.finance.vat.fundedBy).toBe('equity');
    expect(typo.result.scenarios.s1.netProfit).toBeCloseTo(2058321.89779957, 2);

    // What the corrupt string was quietly avoiding: the VAT loan's arrangement
    // fee and interest, £17,056.89 of it. The repair does not restore that cost
    // — it cannot know the user meant 'vatLoan' — it only stops the file
    // claiming a funding mode nobody priced.
    const loan = run((s) => {
      s.finance.vat.optedToTax = true;
      s.finance.vat.fundedBy = 'vatLoan';
    });
    expect(loan.repairs).toHaveLength(0);
    expect(loan.result.scenarios.s1.netProfit).toBeCloseTo(2041265.0087556047, 2);
    expect(typo.result.scenarios.s1.netProfit - loan.result.scenarios.s1.netProfit).toBeCloseTo(17056.889043965, 2);
  });

  it('D: the auditor refuses to certify a raw spec that still carries a bad discriminant', () => {
    // Defence in depth: since D12 every screen prices through appraiseProject,
    // which sanitises before it audits, so no live caller can reach the auditor
    // with a corrupt discriminant. The tripwire is pinned here against the spec
    // as handed in, because a future caller that audits an unsanitised spec
    // would otherwise get a clean bill of health on a scheme the engine priced
    // by a branch nobody chose.
    const cases: [string, (s: PricingSpec) => void][] = [
      ['build cost mode', (s) => ((s as { buildCostMode: unknown }).buildCostMode = 'typo')],
      ['waterfall mode', (s) => (s.finance.waterfall.mode = 'typo' as never)],
      ['vat funding', (s) => ((s.finance.vat as { fundedBy: unknown }).fundedBy = 'typo')],
      ['sdlt regime', (s) => (s.finance.sdlt = { regime: 'typo' } as never)],
    ];
    for (const [name, mutate] of cases) {
      const raw = clonePricing(DEFAULT_PRICING);
      mutate(raw);
      const result = runAppraisal(OPTION.schedule, raw, OPTION.roomAreas);
      const report = auditAppraisal(result, raw, OPTION.schedule);
      const check = report.checks.find((c) => c.id === 'inputs-enums');
      expect(check, `${name}: inputs-enums must exist`).toBeDefined();
      expect(check!.pass, `${name}: inputs-enums must fail on a raw bad spec`).toBe(false);
      expect(check!.detail).toContain('typo');
    }

    // The SDLT regime is the one discriminant whose corruption fails LOUDLY
    // rather than flatteringly, and it is why its 'manual' fallback is not
    // justified the way the other three are: dcf.ts gates the automatic
    // calculation on `regime !== 'manual'`, so an unrecognised regime takes the
    // AUTOMATIC arm, computeSdlt has no default case, B04 comes back undefined
    // and the whole appraisal is NaN. 'manual' is right because it keeps the
    // solicitor's typed B04, not because it reproduces that branch.
    const rawSdlt = clonePricing(DEFAULT_PRICING);
    rawSdlt.finance.sdlt = { regime: 'typo' } as never;
    expect(runAppraisal(OPTION.schedule, rawSdlt, OPTION.roomAreas).scenarios.s1.netProfit).toBeNaN();
    const fixedSdlt = sanitizeSpec(rawSdlt);
    expect(fixedSdlt.repairs.map((r) => r.to)).toEqual(['manual']);
    expect(runAppraisal(OPTION.schedule, fixedSdlt.spec, OPTION.roomAreas).scenarios.s1.netProfit).toBe(
      2079630.1602789517,
    );

    // And the gate change: an unrecognised mode no longer falls between the two
    // branches, so the simple-split reconciliation is still performed.
    const rawWf = clonePricing(DEFAULT_PRICING);
    rawWf.finance.waterfall.mode = 'typo' as never;
    const wfReport = auditAppraisal(
      runAppraisal(OPTION.schedule, rawWf, OPTION.roomAreas),
      rawWf,
      OPTION.schedule,
    );
    expect(wfReport.checks.map((c) => c.id)).toContain('wf-s1-simple');
    expect(wfReport.failCount).toBe(1); // the tripwire itself, and nothing else
  });

  it('E: a clean spec is untouched — no repairs, and the demo figures to the last digit', () => {
    const input = clonePricing(DEFAULT_PRICING);
    const { spec, repairs } = sanitizeSpec(input);
    expect(repairs).toHaveLength(0);
    expect(spec).toEqual(input);

    const { result, report } = run(() => {});
    expect(result.scenarios.s1.netProfit).toBe(2079630.1602789517);
    expect(d01Of(result)).toBe(2526760.9416);
    expect(result.devCosts.totalPreFinance).toBe(5404844.04553);
    // 65 before this cycle, plus the inputs-enums tripwire. That +1 is the only
    // movement in the check count this change is allowed to make.
    expect(report.checks).toHaveLength(66);
    expect(report.failCount).toBe(0);
  });
});

// The gate on the simple-split reconciliation is a separate hole in the same
// instrument, found by the reviewer of the first attempt at this item. The
// engine splits simply whenever `mode !== 'waterfall' || netProfit <= 0` — a
// LOSS is shared pro rata however the deal is papered, because there is no
// preferred return to pay out of a negative number. An auditor gate that only
// asked about the mode therefore skipped wf-s1/s2/s4-simple on every
// loss-making waterfall deal: the exact state the model exists to stress, and
// the exact three-check silent drop this item was raised to stop.
describe('D4 — the simple-split reconciliation is gated on what the engine did', () => {
  it('F: a loss-making waterfall deal is split simply, and is checked as such', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.finance.sales.priceAdjust = -0.5; // halve values: the scheme loses money
    spec.finance.waterfall = { mode: 'waterfall', prefRatePa: 0.08, residualInvestorPct: 0.7 };
    const { spec: clean, repairs } = sanitizeSpec(spec);
    expect(repairs).toHaveLength(0); // nothing here is corrupt; the mode is legitimate
    const result = runAppraisal(OPTION.schedule, clean, OPTION.roomAreas);
    const report = auditAppraisal(result, clean, OPTION.schedule);

    // dcf.ts: `if (wf.mode !== 'waterfall' || netProfit <= 0) investorProfit =
    // netProfit * share` — the residualInvestorPct of 0.7 never gets a look in.
    const s1 = result.scenarios.s1;
    expect(s1.netProfit).toBeCloseTo(-1795885.476535621, 2);
    expect(s1.waterfall.investorProfit).toBeCloseTo(-897942.7382678105, 2);
    expect(s1.waterfall.investorProfit).toBeCloseTo(s1.netProfit * clean.finance.equity.investorShare, 6);
    expect(s1.waterfall.prefPaid).toBe(0);

    for (const id of ['wf-s1-simple', 'wf-s2-simple', 'wf-s4-simple']) {
      const check = report.checks.find((c) => c.id === id);
      expect(check, `${id} must be assessed on a loss-making waterfall, not skipped`).toBeDefined();
      expect(check!.pass).toBe(true);
    }
    expect(report.failCount).toBe(0);

    // The invariant behind the gate, stated without a magic number: the same
    // scheme at the same loss, papered as a simple split, is split by exactly
    // the same arithmetic — so it must be assessed by exactly the same number
    // of checks. Measured at 2dfdf20 this read 62 against 65 — the same loss,
    // the same split, three fewer checks purely because of how it was papered.
    const asSimple = clonePricing(DEFAULT_PRICING);
    asSimple.finance.sales.priceAdjust = -0.5;
    const simpleResult = runAppraisal(OPTION.schedule, sanitizeSpec(asSimple).spec, OPTION.roomAreas);
    const simpleReport = auditAppraisal(simpleResult, sanitizeSpec(asSimple).spec, OPTION.schedule);
    expect(simpleResult.scenarios.s1.waterfall.investorProfit).toBeCloseTo(s1.waterfall.investorProfit, 6);
    expect(report.checks).toHaveLength(simpleReport.checks.length);
  });

  it('F2: a PROFITABLE waterfall deal is still not reconciled as a simple split', () => {
    // The other half of complementarity. The gate must not over-reach: when the
    // engine really does run the pref-and-residual arithmetic, `investorProfit
    // = netProfit × investorShare` is false and asserting it would be a false
    // failure. residualInvestorPct 0.7 on a profitable deal pays the investor
    // well above half, so the three wf-*-simple checks are correctly absent.
    const spec = clonePricing(DEFAULT_PRICING);
    spec.finance.waterfall = { mode: 'waterfall', prefRatePa: 0.08, residualInvestorPct: 0.7 };
    const { spec: clean } = sanitizeSpec(spec);
    const result = runAppraisal(OPTION.schedule, clean, OPTION.roomAreas);
    const report = auditAppraisal(result, clean, OPTION.schedule);

    const s1 = result.scenarios.s1;
    expect(s1.netProfit).toBeGreaterThan(0);
    expect(s1.waterfall.investorProfit).toBeGreaterThan(s1.netProfit * 0.5);
    for (const id of ['wf-s1-simple', 'wf-s2-simple', 'wf-s4-simple']) {
      expect(report.checks.some((c) => c.id === id), `${id} must not be applied to a real waterfall`).toBe(false);
    }
    expect(report.failCount).toBe(0);
  });
});
