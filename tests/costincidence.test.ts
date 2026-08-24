// Per-exit cost attribution and time-based holding costs (AUDIT.md §6.5).
//
// A2 — every scenario paid every cost. The refinance-and-hold case was charged
//      the full sales & marketing group (£143,723 on the demo, £93,723 of it
//      agent fees on a sale that never happens) and carried no letting costs.
// A3 — (F) holding costs were lump sums, so a 24-month sell-down cost exactly
//      what a 3-month one did, while interest scaled 6x.

import { describe, expect, it } from 'vitest';
import { computeDevCosts, programmeOf, runAppraisal, scheduleTotals, MONTHS } from '../src/core/dcf';
import { auditAppraisal, sanitizeSpec } from '../src/core/audit';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING, normalizePricing } from '../src/core/pricing';
import { buildExportInputs } from '../src/core/exportPayload';
import type { DevCostLine, PricingSpec } from '../src/core/types';

const at = (velocity: number) => {
  const s = clonePricing(DEFAULT_PRICING);
  s.finance.sales.velocityPerMonth = velocity;
  return runAppraisal(DEMO_SCHEDULE, s);
};

// ---------------------------------------------------------------------------
// A3 — holding costs run for as long as the stock is held
// ---------------------------------------------------------------------------

describe('time-based holding costs (A3)', () => {
  it('scale linearly with the hold period', () => {
    const table = [4, 2, 1, 0.5].map((v) => {
      const r = at(v);
      return { v, hold: r.programme.holdMonths, f: r.devCosts.groups.postConstruction.total };
    });
    expect(table.map((t) => t.hold)).toEqual([3, 6, 12, 24]);
    // 8x the hold, 8x the cost — the whole point.
    expect(table[3].f).toBeCloseTo(table[0].f * 8, 6);
    expect(table[1].f).toBeCloseTo(table[0].f * 2, 6);
    // Strictly increasing, never flat.
    for (let i = 1; i < table.length; i++) expect(table[i].f).toBeGreaterThan(table[i - 1].f);
  });

  it('a slower sell-down now costs profit through holding as well as interest', () => {
    const fast = at(4);
    const slow = at(0.5);
    expect(slow.devCosts.groups.postConstruction.total - fast.devCosts.groups.postConstruction.total).toBeGreaterThan(
      45_000,
    );
    expect(slow.scenarios.s2.netProfit).toBeLessThan(fast.scenarios.s2.netProfit);
  });

  it('the cost lines and the cashflow use the SAME hold period', () => {
    // If these drift, holding costs are charged for one period and spread over
    // another, and the conservation identity silently absorbs the difference.
    for (const v of [4, 2, 1, 0.5]) {
      const r = at(v);
      expect(r.devCosts.holdMonths).toBe(r.programme.holdMonths);
      const spent = r.cashflow.reduce((a, m) => a + m.costs, 0);
      expect(spent).toBeCloseTo(r.devCosts.totalPreFinance, 2);
    }
  });

  it('per-unit-per-month scales with the unit count too', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    const totals = scheduleTotals(DEMO_SCHEDULE);
    const prog = programmeOf(spec.finance, totals);
    const dev = computeDevCosts(spec, totals, undefined, 1, 1, 'onSale', prog.holdMonths, totals.grossAnnualRent);
    const f01 = dev.groups.postConstruction.lines.find((l) => l.code === 'F01')!;
    expect(f01.amount).toBeCloseTo(46 * totals.units * prog.holdMonths, 6);
  });

  it('the hold period is clamped to the cashflow horizon', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.sales.velocityPerMonth = 0.01; // ~1200 months of sell-down
    const r = runAppraisal(DEMO_SCHEDULE, s);
    expect(r.programme.holdMonths).toBe(MONTHS - r.programme.pcMonth);
    expect(r.programme.holdMonths).toBeGreaterThan(0);
  });

  it('zero velocity holds the stock for the remaining horizon, not for no time', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.sales.velocityPerMonth = 0;
    const r = runAppraisal(DEMO_SCHEDULE, s);
    expect(r.programme.holdMonths).toBe(MONTHS - r.programme.pcMonth);
    expect(r.devCosts.groups.postConstruction.total).toBeGreaterThan(0);
  });

  it('sensitivity grid 2 re-prices holding costs as it sweeps velocity', () => {
    // Otherwise the grid reproduces the very defect A3 fixed: interest scales
    // with velocity while council tax and insurance stay put. Verified by
    // recomputing each cell's interest term exactly as the grid does and
    // checking the residual against the holding it should have added.
    const r = at(2);
    const f = DEFAULT_PRICING.finance;
    const row = r.sensitivity.grid2.find((g) => g.priceMove === 0)!;
    const base = r.sensitivity.grid1.find((g) => g.priceMove === 0)!.netProfit;
    const perMonth = r.devCosts.groups.postConstruction.total / r.devCosts.holdMonths;
    expect(perMonth).toBeGreaterThan(0);

    for (const cell of row.profits) {
      const monthlyNet =
        cell.velocity * (r.scenarios.s1.gdvAdjusted / r.totals.units) * (1 - f.sales.agentFeePct) -
        cell.velocity * f.sales.legalPerUnit;
      const monthsSellOut = Math.ceil(r.totals.units / cell.velocity);
      const months = Math.min(monthsSellOut, Math.ceil(r.finance.devPayoffAtPC / Math.max(1, monthlyNet)));
      const interest = r.finance.devPayoffAtPC * (f.devLoan.ratePa / 12) * ((months + 1) / 2);
      const expectedHolding = perMonth * (monthsSellOut - r.programme.holdMonths);
      expect(base - interest - cell.netProfit, `velocity ${cell.velocity}`).toBeCloseTo(expectedHolding, 6);
    }

    // Selling slower is worse, and the base velocity's cell adds no holding.
    const atBase = row.profits.find((p) => p.velocity === 2)!;
    const slower = row.profits.find((p) => p.velocity === 1)!;
    expect(atBase.netProfit).toBeGreaterThan(slower.netProfit);
    expect(perMonth * (Math.ceil(r.totals.units / 2) - r.programme.holdMonths)).toBe(0);
  });

  it('a legacy fixed (F) line keeps lump behaviour, so stored projects are unchanged', () => {
    const s = clonePricing(DEFAULT_PRICING);
    s.devCosts = s.devCosts.map((l) =>
      l.group === 'postConstruction' ? ({ ...l, kind: 'fixed', value: 3000 } as DevCostLine) : l,
    );
    const fast = runAppraisal(DEMO_SCHEDULE, { ...s, finance: { ...s.finance, sales: { ...s.finance.sales, velocityPerMonth: 4 } } });
    const slow = runAppraisal(DEMO_SCHEDULE, { ...s, finance: { ...s.finance, sales: { ...s.finance.sales, velocityPerMonth: 0.5 } } });
    expect(fast.devCosts.groups.postConstruction.total).toBe(12000);
    expect(slow.devCosts.groups.postConstruction.total).toBe(12000); // lump: unchanged by the hold
  });
});

// ---------------------------------------------------------------------------
// A2 — a cost belongs to the exits that actually incur it
// ---------------------------------------------------------------------------

describe('per-exit cost attribution (A2)', () => {
  const r = runAppraisal(DEMO_SCHEDULE, DEFAULT_PRICING);

  it('the sale basis carries the selling costs and none of the letting ones', () => {
    expect(r.devCosts.basis).toBe('onSale');
    expect(r.devCosts.groups.salesMarketing.total).toBeCloseTo(143723.43008, 4);
    expect(r.devCosts.groups.letting.total).toBe(0);
    expect(r.devCosts.groups.letting.lines).toEqual([]);
    // The letting lines are recorded as excluded, not silently dropped.
    expect(r.devCosts.excludedTotal).toBeCloseTo(34500, 6);
  });

  it('scenario 3 avoids the selling costs and pays the letting ones instead', () => {
    expect(r.scenarios.s3.sellingCostsAvoided).toBeCloseTo(143723.43008, 4);
    expect(r.scenarios.s3.lettingCosts).toBeCloseTo(34500, 6);
    // Its cost base is genuinely lower than the sale case's.
    expect(r.scenarios.s3.costsIfLet).toBeLessThan(r.finance.totalCostsAfterFinance);
    expect(r.finance.totalCostsAfterFinance - r.scenarios.s3.costsIfLet).toBeGreaterThan(100_000);
  });

  it('unrealised profit is the HOLD outcome, not the sale profit relabelled', () => {
    // This was the defect: S3 reported netProfit1, which charged £93,723 of
    // agent fees on a sale that never happens.
    expect(r.scenarios.s3.unrealisedProfit).not.toBeCloseTo(r.scenarios.s1.netProfit, 0);
    expect(r.scenarios.s3.unrealisedProfit).toBeGreaterThan(r.scenarios.s1.netProfit);
    expect(r.scenarios.s3.unrealisedProfit).toBeCloseTo(
      r.scenarios.s1.gdvAdjusted - r.scenarios.s3.costsIfLet,
      6,
    );
  });

  it('the refinance is measured against a hold-basis loan balance', () => {
    // No sales & marketing spend at PC means a smaller loan to redeem, so the
    // refinance releases a surplus where the sale-basis figure showed a gap.
    expect(r.scenarios.s3.devPayoff).toBeLessThan(r.finance.devPayoffAtPC);
    expect(r.scenarios.s3.surplusReleased).toBeGreaterThan(0);
  });

  it('the sale scenarios are untouched by the letting lines', () => {
    // S1/S2/S4 must not see a penny of (I).
    const withoutLetting = clonePricing(DEFAULT_PRICING);
    withoutLetting.devCosts = withoutLetting.devCosts.filter((l) => l.group !== 'letting');
    const bare = runAppraisal(DEMO_SCHEDULE, withoutLetting);
    expect(bare.scenarios.s1.netProfit).toBeCloseTo(r.scenarios.s1.netProfit, 6);
    expect(bare.scenarios.s2.netProfit).toBeCloseTo(r.scenarios.s2.netProfit, 6);
    expect(bare.scenarios.s4.netProfit).toBeCloseTo(r.scenarios.s4.netProfit, 6);
    // ...but S3 loses its letting costs, so its profit rises.
    expect(bare.scenarios.s3.unrealisedProfit).toBeGreaterThan(r.scenarios.s3.unrealisedProfit);
  });

  it('an untagged spec behaves exactly as it did before incidence existed', () => {
    // The compatibility guarantee for stored project files.
    const legacy = clonePricing(DEFAULT_PRICING);
    legacy.devCosts = legacy.devCosts
      .filter((l) => l.group !== 'letting')
      .map(({ whenIncurred, ...rest }) => rest as DevCostLine);
    const l = runAppraisal(DEMO_SCHEDULE, legacy);
    expect(l.devCosts.excludedTotal).toBe(0);
    expect(l.scenarios.s3.sellingCostsAvoided).toBe(0);
    expect(l.scenarios.s3.lettingCosts).toBe(0);
    // With nothing excluded, the let basis IS the sale basis: the old S3.
    expect(l.scenarios.s3.unrealisedProfit).toBeCloseTo(l.scenarios.s1.netProfit, 6);
    expect(l.scenarios.s3.devPayoff).toBeCloseTo(l.finance.devPayoffAtPC, 6);
  });

  it('normalizePricing keeps a legacy devCosts array verbatim', () => {
    const legacy = JSON.parse(JSON.stringify(clonePricing(DEFAULT_PRICING))) as PricingSpec;
    legacy.devCosts = legacy.devCosts
      .filter((l) => l.group !== 'letting')
      .map(({ whenIncurred, ...rest }) => rest as DevCostLine);
    const n = normalizePricing(legacy);
    expect(n.devCosts.some((l) => l.group === 'letting')).toBe(false);
    expect(n.devCosts.every((l) => l.whenIncurred === undefined)).toBe(true);
  });

  it('letting fees priced off annual rent follow the rent, not the GDV', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    const totals = scheduleTotals(DEMO_SCHEDULE);
    const prog = programmeOf(spec.finance, totals);
    const devLet = computeDevCosts(spec, totals, undefined, 1, 1, 'onLet', prog.holdMonths, totals.grossAnnualRent);
    const i01 = devLet.groups.letting.lines.find((l) => l.code === 'I01')!;
    expect(i01.amount).toBeCloseTo(0.08 * totals.grossAnnualRent, 6);
    expect(totals.grossAnnualRent).toBe(240000);
  });

  it('the let basis excludes exactly the onSale lines', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    const totals = scheduleTotals(DEMO_SCHEDULE);
    const prog = programmeOf(spec.finance, totals);
    const devLet = computeDevCosts(spec, totals, undefined, 1, 1, 'onLet', prog.holdMonths, totals.grossAnnualRent);
    expect(devLet.basis).toBe('onLet');
    expect(devLet.groups.salesMarketing.total).toBe(0);
    expect(devLet.groups.letting.total).toBeCloseTo(34500, 6);
    expect(devLet.excludedTotal).toBeCloseTo(143723.43008, 4);
  });
});

// ---------------------------------------------------------------------------
// The audit and the export must both see the new shape
// ---------------------------------------------------------------------------

describe('audit and export coverage', () => {
  it('the audit passes on both bases and re-derives the incidence split', () => {
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const report = auditAppraisal(r, spec, DEMO_SCHEDULE);
    expect(report.failCount).toBe(0);
    for (const id of ['s3-letbasis', 's3-avoided', 's3-letting', 'costs-basis', 'costs-hold']) {
      expect(report.checks.some((c) => c.id === id), id).toBe(true);
    }
  });

  it('the audit catches a letting line smuggled into the sale build-up', () => {
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const seeded = {
      ...r,
      devCosts: {
        ...r.devCosts,
        groups: {
          ...r.devCosts.groups,
          letting: { lines: [{ code: 'I02', label: 'EPCs', amount: 900 }], total: 900 },
        },
      },
    };
    const report = auditAppraisal(seeded, spec, DEMO_SCHEDULE);
    expect(report.checks.find((c) => c.id === 'costs-lines')!.pass).toBe(false);
  });

  it('the audit catches a wrong hold period on the cost lines', () => {
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const r = runAppraisal(DEMO_SCHEDULE, spec);
    const seeded = { ...r, devCosts: { ...r.devCosts, holdMonths: r.devCosts.holdMonths + 3 } };
    const report = auditAppraisal(seeded, spec, DEMO_SCHEDULE);
    expect(report.checks.find((c) => c.id === 'costs-hold')!.pass).toBe(false);
  });

  it('the export payload carries the computed amount for time-based lines', () => {
    // The workbook has no cell shape for "per month held", so without the
    // computed amount the template's own F61-F64 would silently stand.
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const result = runAppraisal(DEMO_SCHEDULE, spec);
    const inputs = buildExportInputs({ address: 'Test', spec, result });
    for (const code of ['F01', 'F02', 'F03', 'F04']) {
      const line = inputs.devCostLines.find((l) => l.code === code)!;
      const engine = result.devCosts.groups.postConstruction.lines.find((l) => l.code === code)!;
      expect(line.amount, code).toBeCloseTo(engine.amount, 6);
      expect(line.amount).not.toBe(line.value); // the typed rate is not the amount
    }
    // Letting lines travel too, tagged, even though the workbook has no cells.
    expect(inputs.devCostLines.find((l) => l.code === 'I01')!.whenIncurred).toBe('onLet');
    expect(inputs.devCostLines.find((l) => l.code === 'G03')!.whenIncurred).toBe('onSale');
    expect(inputs.devCostLines.find((l) => l.code === 'D01')!.whenIncurred).toBe('always');
  });
});
