// Automatic financial audit, run on every appraisal.
//
// Two jobs, both reported to the user rather than silently trusted:
//
//  1. sanitizeSpec / repairSchedule CLEAN UP recoverable messes in the inputs
//     (non-finite numbers, impossible percentages, malformed HPI arrays,
//     schedule cells that disagree with each other) and record every repair.
//  2. auditAppraisal RE-DERIVES the model from first principles — every cost
//     line, every conservation identity, every scenario linkage, every
//     distribution — and compares against what the engine produced. The
//     checks are deliberately written as independent recomputations, not
//     reads of the same code path, so a defect in the engine cannot hide by
//     agreeing with itself.

import type {
  AppraisalResult,
  DevCostGroup,
  PricingSpec,
  ScheduleRow,
  WaterfallResult,
} from './types';
import { buildCostSchedule, hpiIndexAt, MONTHS, sdltLineCodeOf } from './dcf';
import { DEFAULT_PRICING } from './pricing';
import { SQM_TO_SQFT } from './rules';
import { sdltForFinance } from './sdlt';

export interface AuditCheck {
  id: string;
  label: string;
  pass: boolean;
  detail?: string;
}

export interface AuditRepair {
  field: string;
  from: string;
  to: string;
  reason: string;
}

export interface AuditReport {
  checks: AuditCheck[];
  passCount: number;
  failCount: number;
}

const closeAbs = (a: number, b: number, tol = 0.02) =>
  Math.abs(a - b) <= tol || Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * 1e-9;
const closeRel = (a: number, b: number, rel = 0.005) =>
  Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * rel;
const gbp = (v: number) => `£${v.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Input clean-up
// ---------------------------------------------------------------------------

/** Clamp helper that records what it changed. */
function fix(
  repairs: AuditRepair[],
  field: string,
  value: number,
  fallback: number,
  min: number,
  max: number,
  reason: string,
): number {
  if (!Number.isFinite(value)) {
    repairs.push({ field, from: String(value), to: String(fallback), reason: `${reason}: not a number` });
    return fallback;
  }
  const clamped = Math.min(max, Math.max(min, value));
  if (clamped !== value) {
    repairs.push({ field, from: String(value), to: String(clamped), reason });
    return clamped;
  }
  return value;
}

/**
 * Repairs recoverable messes in a pricing spec before the appraisal runs.
 * Returns a cleaned CLONE (the stored spec is never mutated) plus a note for
 * every repair, so nothing is corrected silently.
 */
export function sanitizeSpec(spec: PricingSpec): { spec: PricingSpec; repairs: AuditRepair[] } {
  const repairs: AuditRepair[] = [];
  const s: PricingSpec = JSON.parse(JSON.stringify(spec));
  const d = DEFAULT_PRICING.finance;
  const f = s.finance;

  f.purchasePrice = fix(repairs, 'purchase price', f.purchasePrice, d.purchasePrice, 0, 1e10, 'must be a non-negative amount');
  f.legalMonths = fix(repairs, 'legal period', f.legalMonths, d.legalMonths, 1, 24, 'must be 1-24 months');
  f.preConMonths = fix(repairs, 'pre-construction period', f.preConMonths, d.preConMonths, 1, 36, 'must be 1-36 months');
  f.depositRatePa = fix(repairs, 'deposit rate', f.depositRatePa, d.depositRatePa, 0, 0.25, 'must be 0-25% pa');

  f.bridge.ltv = fix(repairs, 'bridge LTV', f.bridge.ltv, d.bridge.ltv, 0, 1, 'must be 0-100%');
  f.bridge.ratePa = fix(repairs, 'bridge rate', f.bridge.ratePa, d.bridge.ratePa, 0, 0.5, 'must be 0-50% pa');
  f.bridge.arrangementFee = fix(repairs, 'bridge arrangement fee', f.bridge.arrangementFee, d.bridge.arrangementFee, 0, 0.1, 'must be 0-10%');
  f.bridge.exitFee = fix(repairs, 'bridge exit fee', f.bridge.exitFee, d.bridge.exitFee, 0, 0.1, 'must be 0-10%');
  f.devLoan.ratePa = fix(repairs, 'dev loan rate', f.devLoan.ratePa, d.devLoan.ratePa, 0, 0.5, 'must be 0-50% pa');
  f.devLoan.arrangementFee = fix(repairs, 'dev loan arrangement fee', f.devLoan.arrangementFee, d.devLoan.arrangementFee, 0, 0.1, 'must be 0-10%');
  f.devLoan.exitFee = fix(repairs, 'dev loan exit fee', f.devLoan.exitFee, d.devLoan.exitFee, 0, 0.1, 'must be 0-10%');
  f.devLoan.maxLtgdv = fix(repairs, 'max LTGDV covenant', f.devLoan.maxLtgdv, d.devLoan.maxLtgdv, 0, 1, 'must be 0-100%');

  f.equity.total = fix(repairs, 'equity total', f.equity.total, d.equity.total, 0, 1e10, 'must be a non-negative amount');
  f.equity.investorShare = fix(repairs, 'investor share', f.equity.investorShare, d.equity.investorShare, 0, 1, 'must be 0-100%');
  f.sales.agentFeePct = fix(repairs, 'sales agent fee', f.sales.agentFeePct, d.sales.agentFeePct, 0, 0.2, 'must be 0-20%');
  f.sales.legalPerUnit = fix(repairs, 'sales legals per unit', f.sales.legalPerUnit, d.sales.legalPerUnit, 0, 1e6, 'must be a non-negative amount');
  f.sales.velocityPerMonth = fix(repairs, 'sales velocity', f.sales.velocityPerMonth, d.sales.velocityPerMonth, 0, 100, 'must be 0-100 units/month');
  f.sales.priceAdjust = fix(repairs, 'price adjust lever', f.sales.priceAdjust, 0, -0.9, 2, 'must be -90%..+200%');
  f.refinance.ltv = fix(repairs, 'refinance LTV', f.refinance.ltv, d.refinance.ltv, 0, 1, 'must be 0-100%');
  f.refinance.ratePa = fix(repairs, 'refinance rate', f.refinance.ratePa, d.refinance.ratePa, 0, 0.5, 'must be 0-50% pa');
  f.refinance.arrangementFee = fix(repairs, 'refinance fee', f.refinance.arrangementFee, d.refinance.arrangementFee, 0, 0.1, 'must be 0-10%');
  f.refinance.voidPct = fix(repairs, 'void allowance', f.refinance.voidPct, d.refinance.voidPct, 0, 1, 'must be 0-100%');
  f.refinance.mgmtPct = fix(repairs, 'management & opex', f.refinance.mgmtPct, d.refinance.mgmtPct, 0, 1, 'must be 0-100%');

  if (!f.sdlt || !['nonResidential', 'residentialCompany', 'manual'].includes(f.sdlt.regime)) {
    repairs.push({
      field: 'SDLT regime',
      from: String(f.sdlt?.regime),
      to: 'manual',
      reason: 'unknown SDLT regime; keeping the typed B04 figure',
    });
    f.sdlt = { regime: 'manual' };
  }

  f.vat.ratePct = fix(repairs, 'VAT rate', f.vat.ratePct, d.vat.ratePct, 0, 1, 'must be 0-100%');
  f.vat.reclaimLagMonths = Math.round(fix(repairs, 'VAT reclaim lag', f.vat.reclaimLagMonths, d.vat.reclaimLagMonths, 0, 24, 'must be 0-24 months'));
  f.vat.vatLoan.ratePa = fix(repairs, 'VAT loan rate', f.vat.vatLoan.ratePa, d.vat.vatLoan.ratePa, 0, 0.5, 'must be 0-50% pa');
  f.vat.vatLoan.arrangementFee = fix(repairs, 'VAT loan fee', f.vat.vatLoan.arrangementFee, d.vat.vatLoan.arrangementFee, 0, 0.1, 'must be 0-10%');

  f.retention.pctDuringWorks = fix(repairs, 'retention during works', f.retention.pctDuringWorks, d.retention.pctDuringWorks, 0, 0.2, 'must be 0-20%');
  f.retention.pctAfterPc = fix(repairs, 'retention after PC', f.retention.pctAfterPc, d.retention.pctAfterPc, 0, 0.2, 'must be 0-20%');
  if (f.retention.pctAfterPc > f.retention.pctDuringWorks) {
    repairs.push({
      field: 'retention after PC',
      from: String(f.retention.pctAfterPc),
      to: String(f.retention.pctDuringWorks),
      reason: 'cannot hold back more after PC than was withheld during the works',
    });
    f.retention.pctAfterPc = f.retention.pctDuringWorks;
  }
  f.retention.releaseMonthsAfterPc = Math.round(
    fix(repairs, 'defects period', f.retention.releaseMonthsAfterPc, d.retention.releaseMonthsAfterPc, 0, 36, 'must be 0-36 months'),
  );

  // HPI: exactly 5 finite annual rates within a sane band.
  const rates = Array.isArray(f.hpi.annualPct) ? f.hpi.annualPct.slice(0, 5) : [];
  const cleaned = rates.map((r, i) => fix(repairs, `HPI year ${i + 1}`, Number(r), 0, -0.15, 0.2, 'must be -15%..+20% pa'));
  while (cleaned.length < 5) {
    repairs.push({
      field: `HPI year ${cleaned.length + 1}`,
      from: 'missing',
      to: String(cleaned[cleaned.length - 1] ?? 0),
      reason: 'projection needs 5 annual rates; padded with the last known rate',
    });
    cleaned.push(cleaned[cleaned.length - 1] ?? 0);
  }
  f.hpi.annualPct = cleaned;

  // Tender-price inflation: one annual rate, in a band credible for tender
  // prices (deflation happens; +30% pa does not).
  if (!f.buildInflation || typeof f.buildInflation.enabled !== 'boolean') {
    repairs.push({
      field: 'build inflation',
      from: String(f.buildInflation?.enabled),
      to: 'off',
      reason: 'missing or malformed; build cost kept at today’s money',
    });
    f.buildInflation = { ...d.buildInflation, enabled: false };
  }
  f.buildInflation.annualPct = fix(
    repairs,
    'build inflation rate',
    f.buildInflation.annualPct,
    d.buildInflation.annualPct,
    -0.15,
    0.3,
    'must be -15%..+30% pa',
  );

  f.waterfall.prefRatePa = fix(repairs, 'preferred return', f.waterfall.prefRatePa, d.waterfall.prefRatePa, 0, 0.5, 'must be 0-50% pa');
  f.waterfall.residualInvestorPct = fix(repairs, 'investor share above pref', f.waterfall.residualInvestorPct, d.waterfall.residualInvestorPct, 0, 1, 'must be 0-100%');

  for (const line of s.devCosts) {
    if (!Number.isFinite(line.value)) {
      repairs.push({ field: `cost line ${line.code}`, from: String(line.value), to: '0', reason: 'not a number' });
      line.value = 0;
    }
  }
  for (const key of Object.keys(s.roomRates) as (keyof PricingSpec['roomRates'])[]) {
    s.roomRates[key] = fix(repairs, `room rate ${key}`, s.roomRates[key], DEFAULT_PRICING.roomRates[key], 0, 5000, 'must be a non-negative £/sqft');
  }

  return { spec: s, repairs };
}

/**
 * Repairs schedule cells that disagree with each other: sqft is re-derived
 * from sqm and unitGdv from sqft x £psf when they drift beyond rounding.
 * Area x rate is the source of truth; every change is reported.
 */
export function repairSchedule(schedule: ScheduleRow[]): { schedule: ScheduleRow[]; repairs: AuditRepair[] } {
  const repairs: AuditRepair[] = [];
  const rows = schedule.map((r) => ({ ...r }));
  for (const row of rows) {
    for (const key of ['sqm', 'sqft', 'salePsf', 'unitGdv', 'buildMonths', 'monthlyRent'] as const) {
      if (!Number.isFinite(row[key])) {
        repairs.push({ field: `unit ${row.no} ${key}`, from: String(row[key]), to: '0', reason: 'not a number' });
        row[key] = 0;
      }
    }
    const expectSqft = row.sqm * SQM_TO_SQFT;
    if (row.sqm > 0 && !closeRel(row.sqft, expectSqft, 0.01)) {
      repairs.push({
        field: `unit ${row.no} sqft`,
        from: row.sqft.toFixed(1),
        to: expectSqft.toFixed(1),
        reason: 'disagrees with sqm × 10.7639',
      });
      row.sqft = expectSqft;
    }
    const expectGdv = row.sqft * row.salePsf;
    if (row.sqft > 0 && row.salePsf > 0 && !closeRel(row.unitGdv, expectGdv, 0.005)) {
      repairs.push({
        field: `unit ${row.no} GDV`,
        from: gbp(row.unitGdv),
        to: gbp(expectGdv),
        reason: 'disagrees with sqft × £psf',
      });
      row.unitGdv = expectGdv;
    }
  }
  return { schedule: rows, repairs };
}

// ---------------------------------------------------------------------------
// The audit proper
// ---------------------------------------------------------------------------

export function auditAppraisal(r: AppraisalResult, spec: PricingSpec, schedule: ScheduleRow[]): AuditReport {
  const checks: AuditCheck[] = [];
  const ok = (id: string, label: string, pass: boolean, detail?: string) =>
    checks.push({ id, label, pass, detail: pass ? undefined : detail });
  const f = spec.finance;
  const pc = r.programme.pcMonth;
  const horizonOk = pc + f.retention.releaseMonthsAfterPc <= MONTHS && pc <= MONTHS;

  // --- schedule: every cell, every total ---
  let cellsOk = true;
  let cellDetail = '';
  for (const row of schedule) {
    if (row.sqm > 0 && !closeRel(row.sqft, row.sqm * SQM_TO_SQFT, 0.01)) {
      cellsOk = false;
      cellDetail = `unit ${row.no}: sqft ${row.sqft.toFixed(1)} vs sqm×10.7639 ${(row.sqm * SQM_TO_SQFT).toFixed(1)}`;
      break;
    }
    if (row.sqft > 0 && row.salePsf > 0 && !closeRel(row.unitGdv, row.sqft * row.salePsf, 0.005)) {
      cellsOk = false;
      cellDetail = `unit ${row.no}: GDV ${gbp(row.unitGdv)} vs sqft×£psf ${gbp(row.sqft * row.salePsf)}`;
      break;
    }
  }
  ok('sched-cells', 'Every unit: sqft = sqm × 10.7639 and GDV = sqft × £psf', cellsOk, cellDetail);
  const sumGdv = schedule.reduce((s, x) => s + x.unitGdv, 0);
  const sumSqft = schedule.reduce((s, x) => s + x.sqft, 0);
  ok('sched-gdv', 'GDV total = Σ unit GDVs', closeAbs(r.totals.gdv, sumGdv), `${gbp(r.totals.gdv)} vs ${gbp(sumGdv)}`);
  ok('sched-nia', 'NIA total = Σ unit sqft', closeAbs(r.totals.niaSqft, sumSqft), `${r.totals.niaSqft} vs ${sumSqft}`);
  ok(
    'sched-avg',
    'Average £psf = GDV / NIA',
    sumSqft === 0 || closeAbs(r.totals.avgPsf, sumGdv / sumSqft, 0.01),
    `${r.totals.avgPsf}`,
  );

  // --- dev costs: recompute every line from the spec ---
  const idx = hpiIndexAt(f.hpi, pc);
  const salesFactor = idx * (1 + f.sales.priceAdjust);
  const buildCost = r.devCosts.buildCost;
  // Automatic SDLT: only the FIRST matching line carries the band figure —
  // the same rule the engine applies, so a doubled SDLT line cannot hide.
  const autoSdlt = sdltForFinance(f);
  const auditSdltCode = autoSdlt !== null ? sdltLineCodeOf(spec.devCosts) : null;
  let linesOk = true;
  let lineDetail = '';
  const allLines = (Object.keys(r.devCosts.groups) as DevCostGroup[]).flatMap((g) => r.devCosts.groups[g].lines);
  for (const specLine of spec.devCosts) {
    const outLine = allLines.find((l) => l.code === specLine.code);
    const incidence = specLine.whenIncurred ?? 'always';
    if (incidence !== 'always' && incidence !== r.devCosts.basis) {
      // Correctly absent: this line belongs to the other exit.
      if (outLine) {
        linesOk = false;
        lineDetail = `line ${specLine.code} is ${incidence} but appears in the ${r.devCosts.basis} build-up`;
        break;
      }
      continue;
    }
    if (!outLine) {
      linesOk = false;
      lineDetail = `line ${specLine.code} missing from output`;
      break;
    }
    let expected: number;
    switch (specLine.kind) {
      case 'fixed':
        expected = specLine.code === 'D01' ? buildCost : specLine.code === auditSdltCode ? autoSdlt! : specLine.value;
        break;
      case 'pctPurchase':
        expected = specLine.value * f.purchasePrice;
        break;
      case 'pctBuild':
        expected = specLine.value * buildCost;
        break;
      case 'perUnit':
        expected = specLine.value * r.totals.units;
        break;
      case 'pctGDV':
        expected = (specLine.value || f.sales.agentFeePct) * r.totals.gdv * salesFactor;
        break;
      case 'salesLegalPerUnit':
        expected = f.sales.legalPerUnit * r.totals.units;
        break;
      case 'perMonthHeld':
        expected = specLine.value * r.devCosts.holdMonths;
        break;
      case 'perUnitPerMonthHeld':
        expected = specLine.value * r.totals.units * r.devCosts.holdMonths;
        break;
      case 'pctAnnualRent':
        expected = specLine.value * r.totals.grossAnnualRent;
        break;
    }
    if (!closeAbs(outLine.amount, expected, 0.02)) {
      linesOk = false;
      lineDetail = `${specLine.code}: engine ${gbp(outLine.amount)} vs recomputed ${gbp(expected)}`;
      break;
    }
  }
  ok('costs-lines', 'Every cost line recomputes from its driver (incl. sales fees on levered GDV)', linesOk, lineDetail);
  // Build inflation, re-derived independently: the factor from the rate and the
  // programme, and the line from today's cost x that factor. A wrong factor
  // would otherwise be invisible, since every %-of-build line agrees with it.
  const expectSchedule = buildCostSchedule(f.buildInflation, r.programme);
  ok(
    'costs-buildinflation',
    'Build inflation factor = S-curve-weighted tender index over the construction period',
    closeRel(r.devCosts.buildInflationFactor, expectSchedule.factor, 1e-9),
    `${r.devCosts.buildInflationFactor} vs ${expectSchedule.factor}`,
  );
  ok(
    'costs-buildtoday',
    'Build cost = today’s cost × the inflation factor',
    closeAbs(buildCost, r.devCosts.buildCostToday * r.devCosts.buildInflationFactor, 0.02),
    `${gbp(buildCost)} vs ${gbp(r.devCosts.buildCostToday * r.devCosts.buildInflationFactor)}`,
  );
  ok(
    'costs-buildinflation-off',
    'Inflation disabled leaves the contract at today’s money',
    f.buildInflation.enabled || closeAbs(buildCost, r.devCosts.buildCostToday, 0.02),
    `${gbp(buildCost)} vs ${gbp(r.devCosts.buildCostToday)}`,
  );
  ok(
    'costs-buildweights',
    'Monthly contract certificates share out the whole contract sum (Σ weights = 1)',
    closeRel(expectSchedule.weights.reduce((a, b) => a + b, 0), 1, 1e-9),
    `Σ = ${expectSchedule.weights.reduce((a, b) => a + b, 0)}`,
  );
  for (const g of Object.keys(r.devCosts.groups) as DevCostGroup[]) {
    const grp = r.devCosts.groups[g];
    const sum = grp.lines.reduce((s, l) => s + l.amount, 0);
    ok(`costs-group-${g}`, `Group (${g}) total = Σ its lines`, closeAbs(grp.total, sum), `${gbp(grp.total)} vs ${gbp(sum)}`);
  }
  const preFinance =
    r.devCosts.purchase + (Object.keys(r.devCosts.groups) as DevCostGroup[]).reduce((s, g) => s + r.devCosts.groups[g].total, 0);
  ok(
    'costs-hold',
    'Time-based holding costs charged for the programme’s hold period',
    r.devCosts.holdMonths === r.programme.holdMonths,
    `${r.devCosts.holdMonths} vs ${r.programme.holdMonths}`,
  );
  ok('costs-prefinance', 'Pre-finance total = purchase + Σ groups', closeAbs(r.devCosts.totalPreFinance, preFinance), `${gbp(r.devCosts.totalPreFinance)} vs ${gbp(preFinance)}`);

  // --- cashflow conservation ---
  const cf = r.cashflow;
  ok('cf-nonneg', 'Monthly costs never negative', cf.every((m) => m.costs > -0.005), '');
  if (horizonOk) {
    const spent = cf.reduce((s, m) => s + m.costs, 0);
    ok('cf-conservation', 'Σ monthly costs = pre-finance total (every pound lands somewhere once)', closeAbs(spent, r.devCosts.totalPreFinance, 0.02), `${gbp(spent)} vs ${gbp(r.devCosts.totalPreFinance)}`);
  }
  const withheld = cf.reduce((s, m) => s + m.retentionWithheld, 0);
  const released = cf.reduce((s, m) => s + m.retentionReleased, 0);
  ok('cf-retention', 'Retention conserved: withheld = released, pot ends at zero', closeAbs(withheld, released) && Math.abs(cf[cf.length - 1].retentionBalance) < 0.02 && cf.every((m) => m.retentionBalance > -0.005), `withheld ${gbp(withheld)} vs released ${gbp(released)}`);
  const vatIn = cf.reduce((s, m) => s + m.vatReclaimed, 0);
  const vatOut = cf.reduce((s, m) => s + m.vatPaid, 0);
  ok('cf-vat', 'VAT conserved: reclaimed = paid, facility repaid', closeAbs(vatIn, vatOut) && Math.abs(cf[cf.length - 1].vatLoanBalance) < 0.02, `paid ${gbp(vatOut)} vs reclaimed ${gbp(vatIn)}`);
  const draws = cf.reduce((s, m) => s + m.devDrawdown, 0);
  const devInt = cf.reduce((s, m) => s + m.devInterest, 0);
  ok('cf-devloan', 'Dev balance at PC = Σ drawdowns + Σ rolled interest', !horizonOk || closeAbs(r.finance.devBalanceAtPC, draws + devInt, 0.02), `${gbp(r.finance.devBalanceAtPC)} vs ${gbp(draws + devInt)}`);
  ok('cf-devloan-nonneg', 'Dev loan balance never negative', cf.every((m) => m.devBalance > -0.005), '');
  ok('cf-equity', 'Equity never exceeds the committed total', cf.every((m) => m.equityCum <= f.equity.total + 0.005), '');
  let depOk = true;
  let prevPot = 0;
  let depSum = 0;
  for (const m of cf) {
    if (!closeAbs(m.depositInterest, prevPot * (f.depositRatePa / 12), 0.005)) depOk = false;
    depSum += m.depositInterest;
    prevPot = m.retentionBalance;
  }
  ok('cf-deposit', 'Deposit interest = pot balance × rate/12, every month', depOk && closeAbs(depSum, r.finance.depositInterestRetention), '');

  // --- finance summary ---
  const finSum =
    r.finance.bridgeArrangementFee +
    r.finance.bridgeInterestTotal +
    r.finance.bridgeExitFee +
    r.finance.devArrangementFee +
    r.finance.devInterestTotal +
    r.finance.devExitFee +
    r.finance.vatLoanFee +
    r.finance.vatLoanInterest;
  ok('fin-total', 'Total finance costs = Σ its components', closeAbs(r.finance.totalFinanceCosts, finSum), `${gbp(r.finance.totalFinanceCosts)} vs ${gbp(finSum)}`);
  ok(
    'fin-allin',
    'All-in costs = pre-finance + finance - deposit interest credit',
    closeAbs(r.finance.totalCostsAfterFinance, r.devCosts.totalPreFinance + r.finance.totalFinanceCosts - r.finance.depositInterestRetention),
    '',
  );
  ok('fin-payoff', 'Dev payoff = balance at PC × (1 + exit fee)', closeAbs(r.finance.devPayoffAtPC, r.finance.devBalanceAtPC * (1 + f.devLoan.exitFee), 0.02), '');
  ok('fin-ltgdv', 'LTGDV = peak balance / GDV, covenant flag consistent', (r.totals.gdv === 0 || closeAbs(r.finance.ltgdvAtPeak, r.finance.peakDevBalance / r.totals.gdv, 1e-6)) && r.finance.ltgdvOk === r.finance.ltgdvAtPeak <= f.devLoan.maxLtgdv, '');

  // --- scenarios ---
  const s = r.scenarios;
  ok('s1-gdv', 'S1 GDV = today’s GDV × HPI index at PC × (1 + price lever)', closeAbs(s.s1.gdvAdjusted, r.totals.gdv * idx * (1 + f.sales.priceAdjust), 0.02), `${gbp(s.s1.gdvAdjusted)}`);
  ok('s1-profit', 'S1 profit = GDV at PC - all-in costs', closeAbs(s.s1.netProfit, s.s1.gdvAdjusted - r.finance.totalCostsAfterFinance), '');
  ok('s2-profit', 'S2 profit = S1 + HPI uplift + deposit interest - extra interest', closeAbs(s.s2.netProfit, s.s1.netProfit + s.s2.hpiUplift + s.s2.depositInterestOnSurplus - s.s2.extraInterest), '');
  ok('s4-profit', 'S4 profit = S1 + uplift + deposit - refi fee - extra interest', closeAbs(s.s4.netProfit, s.s1.netProfit + s.s4.hpiUplift + s.s4.depositInterestOnSurplus - s.s4.arrangementFee - s.s4.extraInterest), '');
  ok('s4-benefit', 'S4 benefit vs S2 = S4 profit - S2 profit', closeAbs(s.s4.benefitVsS2, s.s4.netProfit - s.s2.netProfit), '');
  ok('s3-advance', 'S3 mortgage = refinance LTV × GDV at PC', closeAbs(s.s3.mortgageAdvance, f.refinance.ltv * s.s1.gdvAdjusted, 0.02), '');
  ok('s3-cash', 'S3 cashflow = net rent - mortgage interest', closeAbs(s.s3.netAnnualCashflow, s.s3.netAnnualRent - s.s3.annualInterest), '');
  // Scenario 3 is priced on the LET basis: an independent re-derivation, since
  // a wrong basis would still satisfy every conservation identity.
  ok(
    's3-letbasis',
    'S3 unrealised profit = GDV at PC - all-in costs on the LET basis',
    closeAbs(s.s3.unrealisedProfit, s.s1.gdvAdjusted - s.s3.costsIfLet, 0.02),
    `${gbp(s.s3.unrealisedProfit)} vs ${gbp(s.s1.gdvAdjusted - s.s3.costsIfLet)}`,
  );
  {
    // The selling costs a hold avoids must equal the onSale lines, recomputed
    // from the spec rather than read back from the engine.
    let expectAvoided = 0;
    let expectLetting = 0;
    for (const line of spec.devCosts) {
      const inc = line.whenIncurred ?? 'always';
      if (inc === 'always') continue;
      let amt = 0;
      switch (line.kind) {
        case 'fixed':
          amt = line.code === 'D01' ? buildCost : line.code === auditSdltCode ? autoSdlt! : line.value;
          break;
        case 'pctPurchase':
          amt = line.value * f.purchasePrice;
          break;
        case 'pctBuild':
          amt = line.value * buildCost;
          break;
        case 'perUnit':
          amt = line.value * r.totals.units;
          break;
        case 'pctGDV':
          amt = (line.value || f.sales.agentFeePct) * r.totals.gdv * salesFactor;
          break;
        case 'salesLegalPerUnit':
          amt = f.sales.legalPerUnit * r.totals.units;
          break;
        case 'perMonthHeld':
          amt = line.value * r.devCosts.holdMonths;
          break;
        case 'perUnitPerMonthHeld':
          amt = line.value * r.totals.units * r.devCosts.holdMonths;
          break;
        case 'pctAnnualRent':
          amt = line.value * r.totals.grossAnnualRent;
          break;
      }
      if (inc === 'onSale') expectAvoided += amt;
      else expectLetting += amt;
    }
    ok(
      's3-avoided',
      'S3 selling costs avoided = Σ the onSale lines',
      closeAbs(s.s3.sellingCostsAvoided, expectAvoided, 0.02),
      `${gbp(s.s3.sellingCostsAvoided)} vs ${gbp(expectAvoided)}`,
    );
    ok(
      's3-letting',
      'S3 letting costs = Σ the onLet lines',
      closeAbs(s.s3.lettingCosts, expectLetting, 0.02),
      `${gbp(s.s3.lettingCosts)} vs ${gbp(expectLetting)}`,
    );
    ok(
      'costs-basis',
      'The sale-basis build-up excludes exactly the onLet lines',
      r.devCosts.basis === 'onSale' && closeAbs(r.devCosts.excludedTotal, expectLetting, 0.02),
      `${gbp(r.devCosts.excludedTotal)} vs ${gbp(expectLetting)}`,
    );
  }
  ok(
    's3-rent',
    'S3 net rent = gross × (1 - void) × (1 - mgmt)',
    closeAbs(s.s3.netAnnualRent, s.s3.grossAnnualRent * (1 - f.refinance.voidPct) * (1 - f.refinance.mgmtPct), 0.02),
    '',
  );

  // --- distributions: complete and internally consistent in every scenario ---
  const wfCheck = (name: string, wf: WaterfallResult, netProfit: number) => {
    ok(`wf-${name}-sum`, `${name.toUpperCase()} investor + developer = net profit`, closeAbs(wf.investorProfit + wf.developerProfit, netProfit), `${gbp(wf.investorProfit + wf.developerProfit)} vs ${gbp(netProfit)}`);
    ok(`wf-${name}-pref`, `${name.toUpperCase()} pref paid ≤ accrued and ≤ profit`, wf.prefPaid <= wf.prefAccrued + 0.005 && wf.prefPaid <= Math.max(0, netProfit) + 0.005, '');
    if (wf.mode === 'simple') {
      ok(`wf-${name}-simple`, `${name.toUpperCase()} simple split = profit × investor share`, closeAbs(wf.investorProfit, netProfit * f.equity.investorShare), '');
    }
  };
  wfCheck('s1', s.s1.waterfall, s.s1.netProfit);
  wfCheck('s2', s.s2.waterfall, s.s2.netProfit);
  wfCheck('s4', s.s4.waterfall, s.s4.netProfit);

  // --- sensitivity: grids reconcile with the scenarios they claim to vary ---
  const zeroRow = r.sensitivity.grid1.find((g) => g.priceMove === 0);
  ok('grid1-zero', 'Sensitivity grid 1 at 0% equals scenario 1', !!zeroRow && closeAbs(zeroRow.netProfit, s.s1.netProfit, 0.02), zeroRow ? `${gbp(zeroRow.netProfit)} vs ${gbp(s.s1.netProfit)}` : 'no 0% row');
  const midRate = r.sensitivity.grid3.find((g) => Math.abs(g.rate - f.refinance.ratePa) < 1e-9);
  const midCell = midRate?.cells.find((c) => Math.abs(c.ltv - f.refinance.ltv) < 1e-9);
  if (midCell) {
    ok('grid3-centre', 'Sensitivity grid 3 at the input rate × LTV equals scenario 3', closeAbs(midCell.cashflow, s.s3.netAnnualCashflow, 0.02), `${gbp(midCell.cashflow)} vs ${gbp(s.s3.netAnnualCashflow)}`);
  }

  const failCount = checks.filter((c) => !c.pass).length;
  return { checks, passCount: checks.length - failCount, failCount };
}
