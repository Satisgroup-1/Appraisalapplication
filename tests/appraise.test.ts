// One appraisal entry point for every screen (NEW-sanitised-spec-everywhere).
//
// The defect this file pins: the Options page and the Pricing page priced the
// scheme from the RAW spec while the Appraisal page and the workbook priced it
// from the REPAIRED one, so a fat-fingered bridge rate (450% typed into a box
// with no max) made the same option read as a £7.4m loss on one screen and a
// £432k profit on another. The "before" figures below are the raw ones and are
// asserted to DIFFER from what appraiseProject returns: if a future refactor
// quietly puts a view back on the raw path, the divergence is a test failure
// rather than a screen the user has to reconcile by hand.

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { appraiseProject } from '../src/core/appraise';
import { sanitizeSpec } from '../src/core/audit';
import { generateOptions } from '../src/core/conversions';
import { runAppraisal } from '../src/core/dcf';
import { DEMO_BUILDING, DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import { DEFAULT_RULES } from '../src/core/rules';
import type { ConversionOption, Envelope, PricingSpec } from '../src/core/types';

const demoOptions = generateOptions(DEMO_BUILDING, DEFAULT_RULES, DEFAULT_PRICING);

/** The fat-finger spec of the item's evidence block: PctField has no max, so
 *  450 typed in the bridge-rate box stores 4.5 and 90 in the agent-fee box
 *  stores 0.9. Both are repairable, and sanitizeSpec repairs them. */
function typoSpec(): PricingSpec {
  const s = clonePricing(DEFAULT_PRICING);
  s.finance.bridge.ratePa = 4.5;
  s.finance.sales.agentFeePct = 0.9;
  return s;
}

/** The brief-building block of PricingView.runFinanceEstimate, mirrored field
 *  for field: every one of the four deal fields read from the spec
 *  `appraiseProject` returned, none from the raw project spec. Held in step
 *  with the view by the source assertions in the two "PricingView ..." tests
 *  below, because the view itself cannot be rendered under vitest's node
 *  environment (zustand store, window.satis). */
function financeBrief(
  option: ConversionOption,
  pricing: PricingSpec = DEFAULT_PRICING,
): { purchasePrice: number; bridgeLtv: number; devFacilityEstimate: number; gdv: number } {
  const p = appraiseProject({ schedule: option.schedule, pricing, roomAreas: option.roomAreas });
  if (p.error || !p.result || !p.spec) {
    throw new Error(
      `The appraisal could not be priced, so the finance research has no facility size to work from: ${p.error ?? '<the selected option has no unit schedule to price>'}`,
    );
  }
  const f = p.spec.finance;
  return {
    purchasePrice: f.purchasePrice,
    bridgeLtv: f.bridge.ltv,
    devFacilityEstimate: p.result.finance.devFacilityEstimate,
    gdv: p.result.totals.gdv,
  };
}

/** The expression PricingView actually briefs a deal field from, on the path
 *  where an option WAS priced, evaluated against the two bindings the view has
 *  in scope there: `fin` (the RAW spec's finance block) and `f` (the REPAIRED
 *  one appraiseProject returned).
 *
 *  Read out of the source and evaluated rather than mirrored by hand because a
 *  hand-written mirror asserts what the test author believes the view does, not
 *  what it does: the brief that mixed a repaired facility with a raw 700% LTV
 *  passed a mirror of itself. The view cannot be rendered instead — there is no
 *  DOM under vitest, and it pulls in the zustand store and window.satis. */
function briefFieldAfterPricing(
  name: 'purchasePrice' | 'bridgeLtv',
  bindings: { fin: PricingSpec['finance']; f: PricingSpec['finance'] },
): unknown {
  const body = financeEstimateSource();
  const afterPricing = body.slice(body.indexOf('const p = appraiseProject'));
  const reads = [...afterPricing.matchAll(new RegExp(`\\b${name}: ([^,\\n]+),`, 'g'))];
  expect(reads.length, `PricingView must brief ${name} exactly once on the priced path`).toBe(1);
  return new Function('fin', 'f', `return ${reads[0][1]};`)(bindings.fin, bindings.f);
}

/** The body of PricingView.runFinanceEstimate, as source. */
function financeEstimateSource(): string {
  const src = readFileSync(join(__dirname, '..', 'src', 'views', 'PricingView.tsx'), 'utf8');
  const from = src.indexOf('async function runFinanceEstimate');
  expect(from).toBeGreaterThan(-1);
  const to = src.indexOf('async function runEstimates');
  expect(to).toBeGreaterThan(from);
  return src.slice(from, to);
}

describe('criterion 1: no well-formed project moves', () => {
  // Exactly the eight figures the app printed before this cycle, on the raw
  // path, because DEFAULT_PRICING needs no repair: sanitizing a clean spec is
  // the identity, so routing every screen through the sanitiser cannot move a
  // well-formed project. toBe, not toBeCloseTo — bit-identical or it is a
  // regression.
  const expected: Record<string, number> = {
    full_max_units: 2079630.1602789517,
    full_balanced: 2079630.1602789517,
    full_family: 2100210.1981250523,
    mixed_max_units: 1400878.62059341,
    mixed_balanced: 1400878.62059341,
    mixed_family: 1414649.656284904,
    floor_through: 1922012.764009281,
    whole_house: 2285332.0792131154,
  };

  it('all 8 demo options price identically, with no repairs and no error', () => {
    expect(demoOptions.map((o) => o.id).sort()).toEqual(Object.keys(expected).sort());
    for (const o of demoOptions) {
      const p = appraiseProject({ schedule: o.schedule, pricing: DEFAULT_PRICING, roomAreas: o.roomAreas });
      expect(p.error, `${o.id} should price`).toBe(null);
      expect(p.repairs, `${o.id} needs no repair`).toEqual([]);
      expect(p.result!.scenarios.s1.netProfit, o.id).toBe(expected[o.id]);
      // The repaired spec and schedule come back so the caller (the export,
      // the audit strip) prices from what was actually run, never the raw.
      expect(p.spec).not.toBe(null);
      expect(p.schedule).not.toBe(null);
    }
  });
});

describe('criterion 2: typo spec — engine parity with the Appraisal page', () => {
  it('the demo scheme prices as the Appraisal page does, not as the Options card did', () => {
    const spec = typoSpec();
    const before = runAppraisal(DEMO_SCHEDULE, spec).scenarios.s1.netProfit;
    expect(before).toBeCloseTo(-7173576.862996035, 2); // what the Options card showed
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: spec });
    expect(p.error).toBe(null);
    expect(p.result!.scenarios.s1.netProfit).toBeCloseTo(-558799.2093047546, 2);
    expect(p.result!.scenarios.s1.netProfit).not.toBe(before);
    expect(p.repairs.map((r) => `${r.field} ${r.from}->${r.to}`)).toEqual([
      'bridge rate 4.5->0.5',
      'sales agent fee 0.9->0.2',
    ]);
  });

  it('full_max_units flips from a £7.4m loss to a £432k profit', () => {
    const spec = typoSpec();
    const o = demoOptions.find((x) => x.id === 'full_max_units')!;
    const before = runAppraisal(o.schedule, spec, o.roomAreas).scenarios.s1.netProfit;
    expect(before).toBeCloseTo(-7365660.643752255, 2); // what the Options card showed
    const p = appraiseProject({ schedule: o.schedule, pricing: spec, roomAreas: o.roomAreas });
    expect(p.result!.scenarios.s1.netProfit).toBeCloseTo(431604.0969711812, 2);
    expect(p.result!.scenarios.s1.netProfit).not.toBe(before);
    // The sign flip is the whole point: a developer abandoned this scheme on
    // the strength of the raw figure.
    expect(before).toBeLessThan(0);
    expect(p.result!.scenarios.s1.netProfit).toBeGreaterThan(0);
    expect(p.repairs).toHaveLength(2);
  });

  it('the repaired spec, not the raw one, is what is returned', () => {
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: typoSpec() });
    expect(p.spec!.finance.bridge.ratePa).toBe(0.5);
    expect(p.spec!.finance.sales.agentFeePct).toBe(0.2);
  });
});

describe('criterion 3: a duplicated cost code', () => {
  it('D01 twice is charged once, and the figure is the Appraisal page figure', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.devCosts = [...spec.devCosts, JSON.parse(JSON.stringify(spec.devCosts.find((l) => l.code === 'D01')))];
    const before = runAppraisal(DEMO_SCHEDULE, spec).scenarios.s1.netProfit;
    expect(before).toBeCloseTo(-1671760.1760894181, 2); // what the Options card showed
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: spec });
    expect(p.error).toBe(null);
    expect(p.result!.scenarios.s1.netProfit).toBeCloseTo(779614.9968750654, 2);
    expect(p.result!.scenarios.s1.netProfit).not.toBe(before);
    expect(p.repairs).toHaveLength(1);
    expect(p.repairs[0].field).toBe('cost line D01');
    expect(p.repairs[0].from).toBe('duplicated');
    expect(p.repairs[0].to).toBe('removed');
  });
});

describe('criterion 4: partial repairs survive an engine throw', () => {
  it('an unknown cost group throws, and the repairs already found are still reported', () => {
    const spec = typoSpec();
    spec.finance.sales.agentFeePct = DEFAULT_PRICING.finance.sales.agentFeePct; // leave exactly one repair
    (spec.devCosts[0] as unknown as { group: string }).group = 'acquisition';
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: spec });
    expect(p.result).toBe(null);
    expect(p.spec).toBe(null);
    expect(p.audit).toBe(null);
    expect(p.error).toBeTruthy();
    expect(p.error).toContain('lines');
    // The point of the item: the repairs sanitizeSpec had already collected
    // are NOT thrown away with the exception — the screen can still say what
    // it fixed while telling the user it could not price the scheme.
    expect(p.repairs).toHaveLength(1);
    expect(p.repairs[0].field).toBe('bridge rate');
  });

  it('never throws, whatever it is handed', () => {
    const junk = { finance: {} } as unknown as PricingSpec;
    expect(() => appraiseProject({ schedule: DEMO_SCHEDULE, pricing: junk })).not.toThrow();
    expect(appraiseProject({ schedule: DEMO_SCHEDULE, pricing: junk }).error).toBeTruthy();
  });
});

describe('an option with no unit schedule: nothing to price, and not a TypeError either', () => {
  // The reviewer's find, and the reason "nothing to price" carries error null.
  // conversions.ts:172 warns "No residential dwelling could be planned on this
  // envelope" and still returns the option, with an EMPTY schedule; PricingView
  // falls back to options[0] when nothing is selected, so that option reaches
  // runFinanceEstimate without the user ever choosing it. appraiseProject
  // correctly reports it as nothing-to-price — result null with error NULL — so
  // any caller guarding only on `error` dereferences null. Measured on a
  // 0.3-scaled DEMO_BUILDING: at HEAD the raw call briefed the research agent
  // with { gdv: 0, facility: 1356702.246962354 } (a facility sized off the
  // purchase price for a scheme with no units), and guarding only on `error`
  // threw "Cannot read properties of null (reading 'totals')", which
  // runEstimates then printed verbatim in the failed estimate row.
  //
  // 0.3 of the demo's 26m x 13m floor is 7.8m x 3.9m: too shallow for any
  // compliant dwelling, which is exactly the envelope the warning exists for.
  function scaledBuilding(k: number): Envelope[] {
    const floors = JSON.parse(JSON.stringify(DEMO_BUILDING)) as Envelope[];
    return floors.map((f) => ({
      ...f,
      envelope: f.envelope.map(([x, y]) => [x * k, y * k] as [number, number]),
      cores: f.cores.map((c) => ({ ...c, poly: c.poly.map(([x, y]) => [x * k, y * k] as [number, number]) })),
      windows: f.windows.map((w) => ({ ...w, x: w.x * k })),
    }));
  }
  const tiny = generateOptions(scaledBuilding(0.3), DEFAULT_RULES, DEFAULT_PRICING);
  const zeroUnit = tiny[0];

  it('is reachable without hand-editing anything: options[0] has an empty schedule', () => {
    expect(zeroUnit.id).toBe('full_max_units');
    expect(zeroUnit.schedule).toEqual([]);
    expect(zeroUnit.totals.residentialUnits).toBe(0);
    expect(zeroUnit.warnings.join(' ')).toContain('No residential dwelling could be planned');
  });

  it('prices as nothing-to-price, so error === null does NOT imply a result', () => {
    const p = appraiseProject({ schedule: zeroUnit.schedule, pricing: DEFAULT_PRICING, roomAreas: zeroUnit.roomAreas });
    expect(p.error).toBe(null);
    expect(p.result).toBe(null);
    expect(p.repairs).toEqual([]);
    // The raw engine happily prices an empty schedule — £2.79m of acquisition
    // and finance cost against no revenue — which is what the Options card
    // printed as this option's "S1 profit" at HEAD. It is not a conversion's
    // profit, so no figure is now shown for it. Pinned so the blast radius
    // recorded in AUDIT.md §6.9 stays checkable.
    expect(runAppraisal(zeroUnit.schedule, DEFAULT_PRICING, zeroUnit.roomAreas).scenarios.s1.netProfit).toBeCloseTo(
      -2790709.023373137,
      2,
    );
  });

  it('the finance brief is refused with the mandated sentence, not a TypeError', () => {
    let thrown: Error | null = null;
    try {
      financeBrief(zeroUnit);
    } catch (e) {
      thrown = e as Error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown).not.toBeInstanceOf(TypeError);
    expect(thrown!.message).toBe(
      'The appraisal could not be priced, so the finance research has no facility size to work from: ' +
        '<the selected option has no unit schedule to price>',
    );
    // And an option that CAN be priced still briefs the agent with real figures.
    const priceable = demoOptions.find((o) => o.id === 'full_max_units')!;
    expect(financeBrief(priceable).gdv).toBeGreaterThan(0);
    expect(financeBrief(priceable).devFacilityEstimate).toBeGreaterThan(0);
  });

  it('PricingView guards on the result, not only on the error', () => {
    const src = financeEstimateSource();
    // `!p.spec` is in the same guard because the brief now reads the repaired
    // spec: null spec and null result always travel together, and narrowing on
    // both is what keeps the four deal fields off a non-null assertion.
    expect(src).toContain('if (p.error || !p.result || !p.spec)');
    expect(src).toContain("${p.error ?? '<the selected option has no unit schedule to price>'}");
  });

  it('no view non-null-asserts a priced result', () => {
    // `appraiseProject` returns result: null for BOTH "nothing yet" and
    // "failed", so `result!` in a view is a null dereference waiting for a
    // zero-dwelling option. Narrow on the value instead.
    const dir = join(__dirname, '..', 'src', 'views');
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => /\bresult!/.test(readFileSync(join(dir, f), 'utf8')));
    expect(offenders, 'narrow on the result instead: error === null does not mean a figure exists').toEqual([]);
  });
});

describe('the finance brief describes ONE spec: the repaired one', () => {
  // The reviewer's find on the first attempt at this item. Routing the GDV and
  // the facility through appraiseProject while leaving purchasePrice and
  // bridgeLtv on the raw `spec.finance` briefed the research agent with half a
  // spec: 'LTV on purchase' is a PctField with no max (PricingView.tsx:571), so
  // 700 typed there stores bridge.ltv = 7. The sanitiser clamps it to 1 and the
  // facility comes back sized off a £1.95m advance at 100% LTV — while the
  // brief still said 700%, so the researcher was asked to source bridge terms
  // for a deal no lender can quote, and the rates it returned were then applied
  // to the repaired appraisal. Before this cycle the brief was entirely raw and
  // so at least self-consistent; half-repaired is worse than either spec whole.
  const ltvTypoSpec = (): PricingSpec => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.bridge.ltv = 7; // 700 typed into a box with no max
    return s;
  };

  it('briefs the repaired LTV of 1, not the 7 the input box holds', () => {
    const spec = ltvTypoSpec();
    // Options are generated from the spec the screen holds, as the store does:
    // generateOptions reads only spec.rates and spec.build, neither of which the
    // sanitiser touches, so this is the same schedule either way.
    const o = generateOptions(DEMO_BUILDING, DEFAULT_RULES, spec).find((x) => x.id === 'full_max_units')!;
    const p = appraiseProject({ schedule: o.schedule, pricing: spec, roomAreas: o.roomAreas });
    expect(p.repairs.map((r) => `${r.field} ${r.from}->${r.to}`)).toEqual(['bridge LTV 7->1']);
    // Priced at LTV 1.0: a £1.95m advance against the £1.95m purchase, not the
    // £13.65m an LTV of 7 would draw.
    expect(p.result!.finance.bridgeAdvance).toBeCloseTo(1950000, 2);

    // What the VIEW briefs, lifted from its source: 7 before this fix, 1 after.
    const bindings = { fin: spec.finance, f: p.spec!.finance };
    expect(briefFieldAfterPricing('bridgeLtv', bindings), 'the brief must quote the LTV the facility was sized at').toBe(
      1,
    );
    expect(briefFieldAfterPricing('purchasePrice', bindings)).toBe(1950000);
    expect(spec.finance.bridge.ltv).toBe(7); // the raw spec keeps what the user typed

    const brief = financeBrief(o, spec);
    expect(brief.bridgeLtv).toBe(1); // the brief as first delivered carried 7
    expect(brief.bridgeLtv).not.toBe(spec.finance.bridge.ltv);
    expect(brief.purchasePrice).toBe(1950000);
    // The two priced fields, so the whole brief is pinned as one consistent set.
    expect(brief.devFacilityEstimate).toBeCloseTo(4114375.976832083, 2);
    expect(brief.gdv).toBeCloseTo(7872242.8484000005, 2);
  });

  it('briefs the repaired purchase price too — the other finance field of the brief', () => {
    // The purchase price is sanitised as well (clamped to >= 0), so the raw
    // read had a second way to disagree with the figures beside it: a negative
    // price is priced as 0 and the facility sized accordingly, while the brief
    // would still have quoted the negative amount.
    const spec = clonePricing(DEFAULT_PRICING);
    spec.finance.purchasePrice = -500000;
    const o = demoOptions.find((x) => x.id === 'full_max_units')!;
    const p = appraiseProject({ schedule: o.schedule, pricing: spec, roomAreas: o.roomAreas });
    expect(p.repairs.map((r) => `${r.field} ${r.from}->${r.to}`)).toEqual(['purchase price -500000->0']);
    const briefed = briefFieldAfterPricing('purchasePrice', { fin: spec.finance, f: p.spec!.finance });
    expect(briefed, 'the brief must quote the price the appraisal was priced on').toBe(0);
    expect(briefed).not.toBe(spec.finance.purchasePrice);
    expect(financeBrief(o, spec).purchasePrice).toBe(0);
  });

  it('a well-formed spec briefs exactly what it always did', () => {
    const o = demoOptions.find((x) => x.id === 'full_max_units')!;
    const brief = financeBrief(o);
    expect(brief.purchasePrice).toBe(DEFAULT_PRICING.finance.purchasePrice);
    expect(brief.bridgeLtv).toBe(DEFAULT_PRICING.finance.bridge.ltv);
  });

  it('PricingView reads no raw finance field once a repaired spec exists', () => {
    // Everything after the appraiseProject call must come from `p`. The raw
    // `fin` is legitimate only in the initialiser above it — the path where
    // nothing was priced and there is no repaired spec to read.
    const body = financeEstimateSource();
    const afterPricing = body.slice(body.indexOf('const p = appraiseProject'));
    expect(afterPricing, 'the brief may not mix repaired figures with raw inputs').not.toMatch(/\bfin\./);
    expect(afterPricing).toContain('const f = p.spec.finance;');
    expect(afterPricing).toContain('purchasePrice: f.purchasePrice');
    expect(afterPricing).toContain('bridgeLtv: f.bridge.ltv');
  });
});

describe('criterion 5: nothing to price is not a failure', () => {
  it('an empty schedule is "no scheme yet", not "the scheme failed"', () => {
    const p = appraiseProject({ schedule: [], pricing: DEFAULT_PRICING });
    expect(p.error).toBe(null);
    expect(p.result).toBe(null);
    expect(p.repairs).toEqual([]);
  });

  it('a null pricing spec is likewise not an error', () => {
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: null });
    expect(p.error).toBe(null);
    expect(p.result).toBe(null);
    expect(p.repairs).toEqual([]);
  });

  it('a null schedule is likewise not an error', () => {
    const p = appraiseProject({ schedule: null, pricing: DEFAULT_PRICING });
    expect(p.error).toBe(null);
    expect(p.result).toBe(null);
  });
});

describe('criterion 6: the audit is opt-in and unchanged', () => {
  it('is not run by default — 8 clones per option grid is enough work', () => {
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: DEFAULT_PRICING });
    expect(p.audit).toBe(null);
    expect(p.result).not.toBe(null);
  });

  // 65 -> 66 with D4: +1, the `inputs-enums` tripwire, which is run on every
  // spec and passes on any spec that came through sanitizeSpec — which, since
  // this module exists, is every spec the auditor ever sees. failCount stays 0
  // in both cases and no existing check changed verdict; the count is the only
  // movement, and it is the same +1 recorded on tests/appaudit.test.ts's pin.
  it('opted in on a clean spec: 66 checks, 0 failures', () => {
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: DEFAULT_PRICING }, { audit: true });
    expect(p.audit!.failCount, JSON.stringify(p.audit!.checks.filter((c) => !c.pass))).toBe(0);
    expect(p.audit!.passCount).toBe(66);
  });

  it('opted in on the typo spec: still 66/0, proving the auditor sees the REPAIRED spec', () => {
    // If the auditor were handed the raw spec it would be re-deriving costs
    // from a 450% bridge rate against a result computed at 50%, and would fail.
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: typoSpec() }, { audit: true });
    expect(p.audit!.failCount, JSON.stringify(p.audit!.checks.filter((c) => !c.pass))).toBe(0);
    expect(p.audit!.passCount).toBe(66);
    expect(p.repairs).toHaveLength(2);
  });
});

describe('criterion 7: no view may price a scheme itself', () => {
  it('no src/views/*.tsx calls runAppraisal', () => {
    const dir = join(__dirname, '..', 'src', 'views');
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => /\brunAppraisal\b/.test(readFileSync(join(dir, f), 'utf8')));
    expect(
      offenders,
      'a view calling runAppraisal directly bypasses sanitizeSpec/repairSchedule — price through appraiseProject',
    ).toEqual([]);
  });
});

describe('the on-screen copy each screen must carry', () => {
  // Read as source rather than rendered: the views pull in the zustand store
  // and window.satis, which do not exist under vitest's node environment. A
  // string match is enough to stop the wording drifting back to a silent
  // omission or to "No option selected yet" on a scheme that WAS selected.
  const view = (f: string) => readFileSync(join(__dirname, '..', 'src', 'views', f), 'utf8');

  it('AppraisalView says plainly that nothing was computed, and shows the detail', () => {
    const src = view('AppraisalView.tsx');
    expect(src).toContain(
      'This appraisal could not be computed, so no figures are shown. Check the pricing inputs on the Pricing page.',
    );
    expect(src).toContain('Technical detail: ');
    // The "nothing selected" empty state must survive for the error === null case.
    expect(src).toContain('No option selected yet.');
  });

  it('OptionsView discloses the repairs it priced from and the options it could not price', () => {
    const src = view('OptionsView.tsx');
    expect(src).toContain('Priced from repaired inputs — ');
    expect(src).toContain('input repair(s) applied. The Appraisal page lists them.');
    expect(src).toContain('option(s) could not be priced: ');
  });

  it('PricingView refuses to brief the finance researcher on an unpriceable scheme', () => {
    expect(view('PricingView.tsx')).toContain(
      'The appraisal could not be priced, so the finance research has no facility size to work from: ',
    );
  });
});

describe('backward compatibility: nothing stored moves, and regenerate stays safe', () => {
  it('sanitizeSpec leaves spec.rates and spec.build alone — the standing dependency for store.regenerate', () => {
    // generateOptions reads ONLY spec.rates (via rateFor) and spec.build (via
    // buildMonthsFor), and the sanitiser has no rule touching either, so
    // store.regenerate() staying on the raw spec creates no divergence with
    // the appraisal today. If a sanitiser rule ever clamps a rate or a build
    // month, THIS test fails and regenerate must be routed through
    // appraiseProject's sanitiser too, or the schedules will be generated from
    // inputs the appraisal has already repaired.
    const messy = clonePricing(DEFAULT_PRICING);
    messy.finance.bridge.ratePa = 4.5;
    messy.finance.sales.agentFeePct = 0.9;
    messy.finance.hpi.annualPct = [];
    messy.devCosts[3].value = Number.NaN;
    const clean = sanitizeSpec(messy);
    expect(clean.repairs.length).toBeGreaterThan(0);
    expect(clean.spec.rates).toEqual(messy.rates);
    expect(clean.spec.build).toEqual(messy.build);
  });

  it('a spec needing no repair round-trips through the entry point untouched', () => {
    // The load path is unchanged by this cycle: no flag, no migration. Pricing
    // a stored well-formed project through appraiseProject must hand the
    // engine the same spec it would have had on the raw path.
    const stored = clonePricing(DEFAULT_PRICING);
    const p = appraiseProject({ schedule: DEMO_SCHEDULE, pricing: stored });
    expect(p.repairs).toEqual([]);
    expect(p.spec).toEqual(stored);
    expect(p.result!.scenarios.s1.netProfit).toBe(runAppraisal(DEMO_SCHEDULE, stored).scenarios.s1.netProfit);
  });
});
