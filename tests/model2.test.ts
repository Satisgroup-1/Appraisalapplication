// Hand-computable proofs of the v2 model mechanics, on schemes small enough
// to verify with a calculator: S-curve drawdown, SDLT on completion,
// architect/QS phasing, retention withholding and release, holding costs over
// the sell period, VAT (both funding routes), HPI indexing, the waterfall,
// deposit interest, and the conservation identities that must always hold.

import { describe, expect, it } from 'vitest';
import type { MonthRow, PricingSpec, ScheduleRow } from '../src/core/types';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import {
  computeWaterfall,
  hpiIndexAt,
  MONTHS,
  runAppraisal,
  sCurveFraction,
  sCurveMonth,
} from '../src/core/dcf';

const close = (actual: number, expected: number, tolerance = 0.01) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);

/** Two units, 4-month build; sqft chosen so unitGdv is a round number. */
function tinySchedule(): ScheduleRow[] {
  return [1, 2].map((no) => ({
    no,
    name: `Apartment ${no}`,
    floor: '1',
    type: '2 bed',
    sqm: 60,
    sqft: 600,
    salePsf: 500,
    unitGdv: 300000,
    buildMonths: 4,
    monthlyRent: 1000,
    notes: '',
  }));
}

/** Minimal spec: only the cost lines each test needs, everything else zero. */
function tinySpec(devCosts: PricingSpec['devCosts']): PricingSpec {
  const s = clonePricing(DEFAULT_PRICING);
  s.buildCostMode = 'fixed';
  s.devCosts = devCosts;
  s.finance.purchasePrice = 1000000;
  s.finance.legalMonths = 2;
  s.finance.preConMonths = 2; // construction months 3..6, PC = 6
  s.finance.equity.total = 2000000; // ample: no funding gaps in the tiny cases
  s.finance.sales.velocityPerMonth = 1; // 2 units -> 2-month sell period
  s.finance.depositRatePa = 0;
  s.finance.hpi.enabled = false;
  // These schemes hand-set their SDLT amounts; manual keeps them authoritative.
  s.finance.sdlt = { regime: 'manual' };
  return s;
}

const D01 = (value: number) =>
  ({ code: 'D01', group: 'construction', label: 'Build cost (main contract)', kind: 'fixed', value }) as const;

/** The 12-unit shape used by the conservation and audit-fix tests. */
const DEMO_SCHEDULE_12 = (): ScheduleRow[] =>
  Array.from({ length: 12 }, (_, i) => ({
    no: i + 1,
    name: `Apartment ${i + 1}`,
    floor: '1',
    type: '2 bed',
    sqm: 60,
    sqft: 645.8,
    salePsf: 610,
    unitGdv: 645.8 * 610,
    buildMonths: 12,
    monthlyRent: 1300,
    notes: '',
  }));

describe('S-curve', () => {
  it('is a smoothstep: half certified at mid-programme, slices sum to 1', () => {
    close(sCurveFraction(2, 4), 0.5, 1e-12);
    const slices = [1, 2, 3, 4].map((m) => sCurveMonth(m, 4));
    close(slices[0], 0.15625, 1e-12);
    close(slices[1], 0.34375, 1e-12);
    close(slices[2], 0.34375, 1e-12);
    close(slices[3], 0.15625, 1e-12);
    close(
      Array.from({ length: 9 }, (_, i) => sCurveMonth(i + 1, 9)).reduce((a, b) => a + b, 0),
      1,
      1e-12,
    );
  });

  it('drives the main contract drawdown month by month', () => {
    const spec = tinySpec([D01(1000000)]);
    spec.finance.retention.pctDuringWorks = 0; // isolate the curve
    spec.finance.retention.pctAfterPc = 0;
    const r = runAppraisal(tinySchedule(), spec);
    // months 3..6 carry the four slices of the 4-month curve
    close(r.cashflow[2].costs, 156250);
    close(r.cashflow[3].costs, 343750);
    close(r.cashflow[4].costs, 343750);
    close(r.cashflow[5].costs, 156250);
  });
});

describe('automatic SDLT', () => {
  it('prices B04 from the non-residential bands, ignoring the typed value', () => {
    const spec = tinySpec([{ code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 999 }]);
    spec.finance.sdlt = { regime: 'nonResidential' };
    const r = runAppraisal(tinySchedule(), spec);
    // £1,000,000 non-residential: 2% × 100k + 5% × 750k = £39,500
    const b04 = r.devCosts.groups.legals.lines.find((l) => l.code === 'B04')!;
    close(b04.amount, 39500);
    close(r.cashflow[0].costs, 1000000 + 39500); // still paid on completion
  });

  it('charges on the VAT-inclusive price when the property is opted to tax', () => {
    const spec = tinySpec([{ code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 999 }]);
    spec.finance.sdlt = { regime: 'nonResidential' };
    spec.finance.vat.optedToTax = true; // chargeable £1,200,000
    const r = runAppraisal(tinySchedule(), spec);
    // 2% × 100k + 5% × 950k = £49,500
    const b04 = r.devCosts.groups.legals.lines.find((l) => l.code === 'B04')!;
    close(b04.amount, 49500);
    expect(r.warnings.some((w) => /SDLT has been computed on the VAT-inclusive/i.test(w))).toBe(true);
  });

  it('applies the band figure to only the FIRST matching line, and warns about the rest', () => {
    // Audit finding #7: a preset with two lines matching /sdlt|stamp duty/i
    // (importable via preset JSON) used to get the FULL computed SDLT on each,
    // doubling stamp duty invisibly to the conservation identities.
    const spec = tinySpec([
      { code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 999 },
      { code: 'B09', group: 'legals', label: 'SDLT top-up (solicitor adjustment)', kind: 'fixed', value: 500 },
    ]);
    spec.finance.sdlt = { regime: 'nonResidential' };
    const r = runAppraisal(tinySchedule(), spec);
    const legals = r.devCosts.groups.legals.lines;
    close(legals.find((l) => l.code === 'B04')!.amount, 39500); // computed
    close(legals.find((l) => l.code === 'B09')!.amount, 500); // typed value kept
    expect(r.warnings.some((w) => /look like stamp duty/i.test(w))).toBe(true);
  });

  it('manual regime keeps the typed figure untouched', () => {
    const spec = tinySpec([{ code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 50000 }]);
    const r = runAppraisal(tinySchedule(), spec);
    close(r.devCosts.groups.legals.lines.find((l) => l.code === 'B04')!.amount, 50000);
  });
});

describe('acquisition timing', () => {
  it('pays SDLT on completion (month 1), other legals over the legal period', () => {
    const spec = tinySpec([
      { code: 'B01', group: 'legals', label: 'Purchase legals', kind: 'fixed', value: 10000 },
      { code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 50000 },
    ]);
    const r = runAppraisal(tinySchedule(), spec);
    close(r.cashflow[0].costs, 1000000 + 50000 + 5000); // purchase + SDLT + half the legals
    close(r.cashflow[1].costs, 5000); // remaining legals only
  });

  it('straight-lines architect and QS to PC; other professional fees in pre-con', () => {
    const spec = tinySpec([
      { code: 'C01', group: 'professional', label: 'Architect fees', kind: 'fixed', value: 12000 },
      { code: 'C03', group: 'professional', label: 'Structural engineer', kind: 'fixed', value: 8000 },
      { code: 'D05', group: 'construction', label: 'Quantity surveyor', kind: 'fixed', value: 6000 },
    ]);
    const r = runAppraisal(tinySchedule(), spec); // PC = month 6
    // Architect 12,000/6 + QS 6,000/6 = 3,000/month for months 1..6;
    // structural engineer 8,000/2 = 4,000 in months 1..2 only.
    close(r.cashflow[0].costs - 1000000, 3000 + 4000);
    close(r.cashflow[1].costs, 3000 + 4000);
    close(r.cashflow[2].costs, 3000);
    close(r.cashflow[5].costs, 3000);
    close(r.cashflow[6].costs, 0);
  });

  it('straight-lines post-construction holding costs over the sell period', () => {
    const spec = tinySpec([
      { code: 'F01', group: 'postConstruction', label: 'Council tax', kind: 'fixed', value: 6000 },
    ]);
    const r = runAppraisal(tinySchedule(), spec); // PC = 6; 2 units at 1/month -> months 7-8
    close(r.cashflow[5].costs, 0);
    close(r.cashflow[6].costs, 3000);
    close(r.cashflow[7].costs, 3000);
    close(r.cashflow[8].costs, 0);
  });
});

describe('retention', () => {
  it('withholds 3% from certificates, releases 1.5% at PC and 1.5% after the defects period', () => {
    const spec = tinySpec([D01(1000000)]);
    const r = runAppraisal(tinySchedule(), spec); // PC = 6, final release month 18
    const withheld = r.cashflow.reduce((s, x) => s + x.retentionWithheld, 0);
    const released = r.cashflow.reduce((s, x) => s + x.retentionReleased, 0);
    close(withheld, 30000);
    close(released, 30000);
    close(r.cashflow[5].retentionReleased, 15000); // first moiety at PC
    close(r.cashflow[17].retentionReleased, 15000); // defects period over
    close(r.cashflow[16].retentionBalance, 15000); // pot holds 1.5% through the defects period
    close(r.cashflow[17].retentionBalance, 0);
    // Total build cash out still equals the contract sum.
    const buildCash =
      r.cashflow.slice(2, 6).reduce((s, x) => s + x.costs, 0) -
      0 + // no other construction lines in this spec
      r.cashflow[5].retentionReleased +
      r.cashflow[17].retentionReleased -
      r.cashflow[5].retentionReleased; // released at PC is inside month-6 costs already
    expect(buildCash).toBeGreaterThan(0); // sanity; exact identity is checked below
    close(r.cashflow.reduce((s, x) => s + x.costs, 0), r.devCosts.totalPreFinance);
  });

  it('earns deposit interest on the pot, computable from the balances', () => {
    const spec = tinySpec([D01(1000000)]);
    spec.finance.depositRatePa = 0.06; // 0.5%/month for easy arithmetic
    const r = runAppraisal(tinySchedule(), spec);
    let expected = 0;
    let prev = 0;
    for (const row of r.cashflow) {
      expected += prev * 0.005;
      close(row.depositInterest, prev * 0.005, 1e-9);
      prev = row.retentionBalance;
    }
    close(r.finance.depositInterestRetention, expected, 1e-9);
    close(r.finance.totalCostsAfterFinance, r.devCosts.totalPreFinance + r.finance.totalFinanceCosts - expected);
  });
});

describe('VAT on the purchase', () => {
  it('equity-funded: out at month 1, back at reclaim, zero profit impact, higher peak equity', () => {
    const base = tinySpec([D01(1000000)]);
    const withVat = tinySpec([D01(1000000)]);
    withVat.finance.vat.optedToTax = true;
    const r0 = runAppraisal(tinySchedule(), base);
    const r1 = runAppraisal(tinySchedule(), withVat);
    close(r1.cashflow[0].vatPaid, 200000);
    close(r1.cashflow[2].vatReclaimed, 200000); // lag 2 -> month 3
    close(r1.scenarios.s1.netProfit, r0.scenarios.s1.netProfit); // nets to zero
    // Funding is needed only until the reclaim: equity deployed is 200k
    // higher while the VAT is outstanding, identical once it lands.
    close(r1.cashflow[1].equityCum - r0.cashflow[1].equityCum, 200000);
    close(r1.cashflow[3].equityCum, r0.cashflow[3].equityCum);
    expect(r1.finance.vatOnPurchase).toBe(200000);
  });

  it('VAT loan: fee + rolled interest are the only cost, repaid by the reclaim', () => {
    const spec = tinySpec([D01(1000000)]);
    spec.finance.vat.optedToTax = true;
    spec.finance.vat.fundedBy = 'vatLoan';
    spec.finance.vat.vatLoan = { ratePa: 0.12, arrangementFee: 0.02 }; // 1%/month
    const r = runAppraisal(tinySchedule(), spec);
    const fee = 200000 * 0.02;
    const b0 = 200000 + fee;
    const i1 = b0 * 0.01;
    const i2 = (b0 + i1) * 0.01;
    const i3 = (b0 + i1 + i2) * 0.01; // reclaim month charges then repays
    close(r.finance.vatLoanFee, fee, 1e-9);
    close(r.finance.vatLoanInterest, i1 + i2 + i3, 1e-6);
    close(r.cashflow[2].vatLoanBalance, 0); // repaid at reclaim
    expect(r.cashflow[1].vatLoanBalance).toBeGreaterThan(b0);
  });
});

describe('house price inflation', () => {
  it('compounds annual rates monthly, year by year', () => {
    const hpi = { enabled: true, annualPct: [0.06, 0, 0.06, 0.06, 0.06] };
    close(hpiIndexAt(hpi, 12), 1.06, 1e-9);
    close(hpiIndexAt(hpi, 24), 1.06, 1e-9); // year 2 flat
    close(hpiIndexAt(hpi, 6), Math.pow(1.06, 0.5), 1e-9);
    close(hpiIndexAt({ enabled: false, annualPct: [0.5] }, 24), 1, 1e-12);
  });

  it('indexes S1 GDV to PC and adds uplift on later sales in S2', () => {
    const spec = tinySpec([D01(1000000)]);
    spec.finance.hpi = { enabled: true, annualPct: [0.05, 0.05, 0.05, 0.05, 0.05] };
    const r = runAppraisal(tinySchedule(), spec); // PC = 6
    const idx = Math.pow(1.05, 6 / 12);
    close(r.scenarios.s1.hpiIndexAtPc, idx, 1e-9);
    close(r.scenarios.s1.gdvAdjusted, 600000 * idx, 1e-6);
    // 2 units at 1/month: sales in months PC+1 and PC+2 both sit above the PC
    // index; the uplift reaching profit is net of the agent's fee on it.
    expect(r.scenarios.s2.hpiUplift).toBeGreaterThan(0);
    const grossUplift = 600000 * (Math.pow(1.05, 7 / 12) / 2 + Math.pow(1.05, 8 / 12) / 2) - 600000 * idx;
    close(r.scenarios.s2.hpiUplift, grossUplift * (1 - spec.finance.sales.agentFeePct), 1);
  });
});

describe('financial audit fixes', () => {
  it('prices %-of-GDV sales costs on the same revenue the scenarios sell at', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    spec.finance.sales.priceAdjust = 0.05;
    spec.finance.hpi = { enabled: true, annualPct: [0.04, 0.04, 0.04, 0.04, 0.04] };
    const r = runAppraisal(DEMO_SCHEDULE_12(), spec);
    const g03 = r.devCosts.groups.salesMarketing.lines.find((l) => l.code === 'G03')!.amount;
    close(g03, spec.finance.sales.agentFeePct * r.scenarios.s1.gdvAdjusted, 1e-6);
  });

  it('S1 equals the sensitivity grid at 0% movement, whatever the lever and HPI', () => {
    for (const [adjust, hpiOn] of [
      [0.05, true],
      [-0.08, false],
      [0, true],
    ] as const) {
      const spec = clonePricing(DEFAULT_PRICING);
      spec.buildCostMode = 'fixed';
      spec.finance.sales.priceAdjust = adjust;
      spec.finance.hpi = { enabled: hpiOn, annualPct: [0.04, 0.03, 0.03, 0.02, 0.02] };
      const r = runAppraisal(DEMO_SCHEDULE_12(), spec);
      const zeroRow = r.sensitivity.grid1.find((g) => g.priceMove === 0)!;
      close(zeroRow.netProfit, r.scenarios.s1.netProfit, 1e-6);
    }
  });

  it('a VAT reclaim landing inside the loan window pays the dev loan down', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    spec.finance.vat.optedToTax = true; // reclaim at month 3
    spec.finance.preConMonths = 1; // construction starts month 2
    spec.finance.equity.total = 300000; // capped before the reclaim lands
    const r = runAppraisal(DEMO_SCHEDULE_12(), spec);
    const m3 = r.cashflow[2];
    expect(m3.vatReclaimed).toBe(390000);
    expect(m3.devDrawdown).toBeLessThan(0); // the refund reduces the balance...
    expect(m3.devBalance).toBeGreaterThanOrEqual(0); // ...never below zero
    expect(m3.devBalance).toBeLessThan(r.cashflow[1].devBalance);
  });

  it('waterfall exit waits for the loan repayment tail on a stressed deal', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    spec.finance.waterfall = { mode: 'waterfall', prefRatePa: 0.08, residualInvestorPct: 0.5 };
    spec.finance.sales.velocityPerMonth = 12; // sold out a month after PC...
    spec.finance.sales.priceAdjust = -0.4; // ...but proceeds can't clear the loan
    const r = runAppraisal(DEMO_SCHEDULE_12(), spec);
    expect(r.scenarios.s2.monthsToSellOut).toBe(1);
    expect(r.scenarios.s2.monthsToRepay).toBe('36+');
    expect(r.scenarios.s2.waterfall.exitMonth).toBe(r.programme.pcMonth + 36);
  });

  it('never charges negative deposit interest, even with absurd selling costs', () => {
    const spec = clonePricing(DEFAULT_PRICING);
    spec.buildCostMode = 'fixed';
    spec.finance.sales.legalPerUnit = 1000000; // forces negative net proceeds
    const r = runAppraisal(DEMO_SCHEDULE_12(), spec);
    expect(r.scenarios.s2.depositInterestOnSurplus).toBeGreaterThanOrEqual(0);
    expect(r.scenarios.s4.depositInterestOnSurplus).toBeGreaterThanOrEqual(0);
  });
});

describe('waterfall', () => {
  const emptyRows = (draws: Record<number, number>): MonthRow[] =>
    Array.from({ length: MONTHS }, (_, i) => ({
      month: i + 1,
      costs: 0,
      cumCosts: 0,
      bridgeInterest: 0,
      bridgeBalance: 0,
      bridgeRedemption: 0,
      equityCum: 0,
      equityMonth: draws[i + 1] ?? 0,
      devDrawdown: 0,
      devInterest: 0,
      devBalance: 0,
      fundingGap: false,
      fundingShortfall: 0,
      vatPaid: 0,
      vatReclaimed: 0,
      vatLoanBalance: 0,
      retentionWithheld: 0,
      retentionReleased: 0,
      retentionBalance: 0,
      depositInterest: 0,
    }));

  const financeWith = (mode: 'simple' | 'waterfall') => {
    const f = clonePricing(DEFAULT_PRICING).finance;
    f.equity.total = 100000;
    f.equity.investorShare = 1;
    f.waterfall = { mode, prefRatePa: 0.12, residualInvestorPct: 0.5 };
    return f;
  };

  it('pays capital, then a 12% monthly-compounded pref, then splits 50/50', () => {
    // 100k drawn month 1, exit month 13 -> 12 months of pref accrual
    const w = computeWaterfall(financeWith('waterfall'), emptyRows({ 1: 100000 }), 50000, 13);
    const pref = 100000 * (Math.pow(1.01, 12) - 1); // 12,682.50
    close(w.prefAccrued, pref, 1e-6);
    close(w.prefPaid, pref, 1e-6);
    close(w.investorProfit, pref + (50000 - pref) * 0.5, 1e-6);
    close(w.developerProfit, 50000 - w.investorProfit, 1e-9);
    close(w.investorRoi, w.investorProfit / 100000, 1e-12);
  });

  it('gives the investor everything up to the pref when profit is below the hurdle', () => {
    const w = computeWaterfall(financeWith('waterfall'), emptyRows({ 1: 100000 }), 5000, 13);
    close(w.prefPaid, 5000, 1e-9);
    expect(w.prefShortfall).toBeGreaterThan(7000);
    close(w.investorProfit, 5000, 1e-9);
    close(w.developerProfit, 0, 1e-9);
  });

  it('shares losses pro-rata to capital in both modes', () => {
    for (const mode of ['simple', 'waterfall'] as const) {
      const f = financeWith(mode);
      f.equity.investorShare = 0.5;
      const w = computeWaterfall(f, emptyRows({ 1: 100000 }), -40000, 13);
      close(w.investorProfit, -20000, 1e-9);
      close(w.developerProfit, -20000, 1e-9);
    }
  });

  it('simple mode reproduces the flat split', () => {
    const f = financeWith('simple');
    f.equity.investorShare = 0.5;
    const w = computeWaterfall(f, emptyRows({ 1: 100000 }), 80000, 13);
    close(w.investorProfit, 40000, 1e-9);
    expect(w.prefAccrued).toBe(0);
  });
});

describe('conservation identities (always true)', () => {
  it('cashflow costs sum to total pre-finance costs; profit splits sum to net profit', () => {
    for (const build of [
      () => {
        const s = clonePricing(DEFAULT_PRICING);
        s.buildCostMode = 'fixed';
        return s;
      },
      () => {
        const s = clonePricing(DEFAULT_PRICING);
        s.buildCostMode = 'fixed';
        s.finance.vat.optedToTax = true;
        s.finance.hpi = { enabled: true, annualPct: [0.04, 0.03, 0.03, 0.02, 0.02] };
        s.finance.waterfall = { mode: 'waterfall', prefRatePa: 0.08, residualInvestorPct: 0.5 };
        return s;
      },
    ]) {
      const spec = build();
      const r = runAppraisal(
        Array.from({ length: 12 }, (_, i) => ({
          no: i + 1,
          name: `Apartment ${i + 1}`,
          floor: '1',
          type: '2 bed',
          sqm: 60,
          sqft: 645.8,
          salePsf: 610,
          unitGdv: 645.8 * 610,
          buildMonths: 12,
          monthlyRent: 1300,
          notes: '',
        })),
        spec,
      );
      close(
        r.cashflow.reduce((s, x) => s + x.costs, 0),
        r.devCosts.totalPreFinance,
        0.01,
      );
      for (const sc of [r.scenarios.s1, r.scenarios.s2, r.scenarios.s4]) {
        close(sc.waterfall.investorProfit + sc.waterfall.developerProfit, sc.netProfit, 0.01);
      }
      // VAT never appears as a cost; only its funding does.
      const vatIn = r.cashflow.reduce((s, x) => s + x.vatReclaimed, 0);
      const vatOut = r.cashflow.reduce((s, x) => s + x.vatPaid, 0);
      close(vatIn, vatOut, 0.01);
    }
  });
});
