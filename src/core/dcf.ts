// DCF appraisal engine. A faithful port of Appraisal_Model_1.xlsx:
//   '3. Dev Costs'  -> computeDevCosts
//   '4. Cashflow'   -> computeCashflow (48 months, bridge + dev loan roll-up)
//   '5. Scenarios'  -> computeScenarios (4 exit scenarios, 36-month sell-down)
//   '6. Sensitivity'-> computeSensitivity (3 grids)
// Cell references from the workbook are noted in comments throughout.

import type {
  AppraisalResult,
  BuildInflationInputs,
  CostIncidence,
  DevCostGroup,
  DevCostsComputed,
  FinanceInputs,
  FinanceSummary,
  HpiInputs,
  MonthRow,
  PricingSpec,
  RoomAreas,
  ScenarioResults,
  ScheduleRow,
  SensitivityResults,
  WaterfallResult,
} from './types';
import { MAX_UNITS, SQM_TO_SQFT } from './rules';
import { sdltForFinance } from './sdlt';

export const MONTHS = 48; // '4. Cashflow' columns E..AZ
export const SELLDOWN_MONTHS = 36; // '5. Scenarios' columns E..AN

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------

/**
 * Cumulative fraction of the main contract certified by the end of month m of
 * an n-month build, on a standard S-curve (smoothstep: slow mobilisation, peak
 * mid-programme, tail-off to completion). Stands in for a QS drawdown
 * schedule; replace with actual certificates when a schedule exists.
 */
export function sCurveFraction(m: number, n: number): number {
  const t = Math.min(1, Math.max(0, n === 0 ? 1 : m / n));
  return t * t * (3 - 2 * t);
}

/** The month-m slice of the S-curve (certificates issued in that month). */
export function sCurveMonth(m: number, n: number): number {
  return sCurveFraction(m, n) - sCurveFraction(m - 1, n);
}

/**
 * Cumulative house-price index from the purchase month to month m, from
 * annual rates (year 1..N; the final rate persists beyond the array),
 * compounded monthly. 1.0 when HPI is disabled.
 */
export function hpiIndexAt(hpi: HpiInputs, month: number): number {
  if (!hpi.enabled || month <= 0 || hpi.annualPct.length === 0) return 1;
  let idx = 1;
  for (let k = 1; k <= month; k++) {
    const year = Math.ceil(k / 12);
    const rate = hpi.annualPct[Math.min(year, hpi.annualPct.length) - 1] ?? 0;
    idx *= Math.pow(1 + rate, 1 / 12);
  }
  return idx;
}

/**
 * Tender-price index from the purchase month to month m, compounded monthly
 * from one annual rate. 1.0 when build inflation is disabled.
 */
export function buildIndexAt(bi: BuildInflationInputs, month: number): number {
  if (!bi?.enabled || month <= 0 || !Number.isFinite(bi.annualPct) || bi.annualPct === 0) return 1;
  return Math.pow(1 + bi.annualPct, month / 12);
}

/**
 * How the main contract is drawn AND priced across the construction period.
 *
 * `weights[k-1]` is the share of the (inflated) contract sum certified in month
 * k of the build; `factor` is the S-curve-weighted tender-price index, i.e. the
 * ratio between today's contract sum and what it actually costs when spent.
 *
 * The two are consistent by construction: weights are the per-month
 * indexed S-curve slices divided by `factor`, so
 *   Σ weights = 1                          (no pound of contract goes missing)
 *   todayCost x factor = inflated total      (D01 and the cashflow agree)
 * and each month still carries its OWN index, not an averaged one.
 *
 * With inflation off the raw S-curve slices are returned untouched — not
 * divided by a `factor` that is only floating-point-close to 1 — so an existing
 * appraisal's figures do not move by a rounding step.
 */
export function buildCostSchedule(
  bi: BuildInflationInputs,
  prog: Pick<Programme, 'preConMonths' | 'conMonths'>,
): { factor: number; weights: number[] } {
  const raw: number[] = [];
  for (let k = 1; k <= prog.conMonths; k++) raw.push(sCurveMonth(k, prog.conMonths));
  if (!bi?.enabled || !Number.isFinite(bi.annualPct) || bi.annualPct === 0) {
    return { factor: 1, weights: raw };
  }
  const indexed = raw.map((slice, i) => slice * buildIndexAt(bi, prog.preConMonths + i + 1));
  const factor = indexed.reduce((a, b) => a + b, 0);
  if (!(factor > 0)) return { factor: 1, weights: raw };
  return { factor, weights: indexed.map((v) => v / factor) };
}

/** Match cost lines that get special timing, by code with a label fallback
 *  so renamed/custom lines still behave. Exported so the auditor, the UI and
 *  the workbook export share ONE definition of "the SDLT line". */
export const isSdltLine = (code: string, label: string) => code === 'B04' || /sdlt|stamp\s*duty/i.test(label);

/** The single line an automatic SDLT regime prices from the bands: the FIRST
 *  fixed line matching isSdltLine. Applying the computed amount to every
 *  match would double stamp duty on a spec with two matching lines. */
export function sdltLineCodeOf(lines: PricingSpec['devCosts']): string | null {
  return lines.find((l) => l.kind === 'fixed' && isSdltLine(l.code, l.label))?.code ?? null;
}
const isArchitectLine = (code: string, label: string) => code === 'C01' || /architect/i.test(label);
const isQsLine = (code: string, label: string) => code === 'D05' || /quantity\s*surveyor/i.test(label);
const isBuildLine = (code: string) => code === 'D01';
const isContingencyLine = (code: string, label: string) => code === 'D08' || /contingency/i.test(label);

export interface ScheduleTotals {
  units: number; // UI F40 = COUNTA
  niaSqft: number; // UI F41 = sum sqft
  gdv: number; // UI F42
  avgPsf: number; // UI F43
  maxBuildMonths: number; // UI F44 = MAX(J)
  monthlyRent: number; // UI F45
  grossAnnualRent: number; // UI F46
}

export function scheduleTotals(rows: ScheduleRow[]): ScheduleTotals {
  const niaSqft = rows.reduce((s, r) => s + r.sqft, 0);
  const gdv = rows.reduce((s, r) => s + r.unitGdv, 0);
  const monthlyRent = rows.reduce((s, r) => s + r.monthlyRent, 0);
  return {
    units: rows.length,
    niaSqft,
    gdv,
    avgPsf: niaSqft === 0 ? 0 : gdv / niaSqft,
    maxBuildMonths: rows.length ? Math.max(...rows.map((r) => r.buildMonths)) : 0,
    monthlyRent,
    grossAnnualRent: monthlyRent * 12,
  };
}

/** Build cost from room-type areas x £/sqft rates. */
export function buildCostFromRooms(
  spec: PricingSpec,
  roomAreas: RoomAreas,
): { total: number; breakdown: DevCostsComputed['buildBreakdown'] } {
  const items: { label: string; sqm: number; rate: number }[] = [
    { label: 'Living / kitchen', sqm: roomAreas.kitchenLivingSqm, rate: spec.roomRates.kitchenLiving },
    { label: 'Bedrooms', sqm: roomAreas.bedroomSqm, rate: spec.roomRates.bedroom },
    { label: 'Bathrooms', sqm: roomAreas.bathroomSqm, rate: spec.roomRates.bathroom },
    { label: 'Halls / storage', sqm: roomAreas.hallStorageSqm, rate: spec.roomRates.hallStorage },
    { label: 'Circulation & cores', sqm: roomAreas.circulationSqm, rate: spec.roomRates.circulation },
    { label: 'Commercial (retained)', sqm: roomAreas.commercialSqm, rate: spec.roomRates.commercial },
  ];
  const breakdown = items
    .filter((i) => i.sqm > 0)
    .map((i) => {
      const sqft = i.sqm * SQM_TO_SQFT;
      return { label: i.label, sqm: i.sqm, sqft, ratePsf: i.rate, amount: sqft * i.rate };
    });
  return { total: breakdown.reduce((s, b) => s + b.amount, 0), breakdown };
}

export function computeDevCosts(
  spec: PricingSpec,
  totals: ScheduleTotals,
  roomAreas?: RoomAreas,
  /**
   * Factor applied to %-of-GDV cost lines (sales agent fees) so they are
   * priced on the SAME revenue the scenarios sell at — GDV indexed to PC and
   * adjusted by the price lever. Pricing fees on raw GDV while revenue is
   * indexed understates selling costs and breaks S1 = grid1's matching row.
   */
  salesGdvFactor = 1,
  /**
   * S-curve-weighted tender-price index (from `buildCostSchedule`). The typed
   * D01 / room-rate table is TODAY'S cost; this carries it to the months the
   * contract is actually certified. Percentage-of-build lines (contingency,
   * demolition) follow automatically, which is correct — they scale with the
   * contract they are a percentage of.
   */
  buildInflationFactor = 1,
  /**
   * Which exit to price. 'onSale' keeps the always + onSale lines (the
   * development case, and the basis for S1/S2/S4); 'onLet' keeps always + onLet
   * (S3's refinance-and-hold). Each build-up is internally complete, so the
   * cashflow and every identity work unchanged on either.
   */
  basis: Exclude<CostIncidence, 'always'> = 'onSale',
  /** Months held after PC, for the time-based holding lines. */
  holdMonths = 1,
  /** Gross annual rent, for letting fees priced as a percentage of it. */
  grossAnnualRent = 0,
): DevCostsComputed {
  const f = spec.finance;
  const buildLine = spec.devCosts.find((l) => l.code === 'D01');
  const fixedBuildCost = buildLine?.kind === 'fixed' ? buildLine.value : 0;

  const useRoomRates = spec.buildCostMode === 'roomRates' && !!roomAreas;
  const roomResult = useRoomRates ? buildCostFromRooms(spec, roomAreas!) : null;
  const buildCostToday = roomResult ? roomResult.total : fixedBuildCost;
  const buildCost = buildCostToday * buildInflationFactor;

  const groups: DevCostsComputed['groups'] = {
    legals: { lines: [], total: 0 },
    professional: { lines: [], total: 0 },
    construction: { lines: [], total: 0 },
    duringConstruction: { lines: [], total: 0 },
    postConstruction: { lines: [], total: 0 },
    salesMarketing: { lines: [], total: 0 },
    other: { lines: [], total: 0 },
    letting: { lines: [], total: 0 },
  };

  // Stamp duty computed from HMRC bands (on the VAT-inclusive price when
  // opted to tax) unless the regime is manual, which keeps the typed figure.
  // Only the FIRST matching line gets the computed amount; any further
  // SDLT-looking lines keep their typed values (and runAppraisal warns).
  const computedSdlt = sdltForFinance(f);
  const sdltCode = computedSdlt !== null ? sdltLineCodeOf(spec.devCosts) : null;
  let excludedTotal = 0;

  for (const line of spec.devCosts) {
    // A line tagged for the OTHER exit is not incurred here at all. Absent tag
    // means 'always', so pre-existing specs are unaffected.
    const incidence = line.whenIncurred ?? 'always';
    let amount = 0;
    switch (line.kind) {
      case 'fixed':
        amount = line.code === 'D01' ? buildCost : line.code === sdltCode ? computedSdlt! : line.value;
        break;
      case 'pctPurchase': // e.g. B05 = D15 * '2. Inputs'!E5
        amount = line.value * f.purchasePrice;
        break;
      case 'pctBuild': // D08 = 5% x F37, D09 = 1.5% x F37
        amount = line.value * buildCost;
        break;
      case 'perUnit': // D10 = £1200 x F40
        amount = line.value * totals.units;
        break;
      case 'pctGDV': // G03 = E40 x F42 (rate from finance when line value is 0)
        amount = (line.value || f.sales.agentFeePct) * totals.gdv * salesGdvFactor;
        break;
      case 'salesLegalPerUnit': // G04 = E41 x F40
        amount = f.sales.legalPerUnit * totals.units;
        break;
      case 'perMonthHeld':
        amount = line.value * holdMonths;
        break;
      case 'perUnitPerMonthHeld':
        amount = line.value * totals.units * holdMonths;
        break;
      case 'pctAnnualRent':
        amount = line.value * grossAnnualRent;
        break;
    }
    if (incidence !== 'always' && incidence !== basis) {
      // Not incurred on this exit. Recorded as excluded rather than dropped, so
      // a scenario can say what it avoided instead of the figure vanishing.
      excludedTotal += amount;
      continue;
    }
    groups[line.group].lines.push({ code: line.code, label: line.label, amount });
    groups[line.group].total += amount;
  }

  const totalPreFinance =
    f.purchasePrice +
    (Object.keys(groups) as DevCostGroup[]).reduce((s, g) => s + groups[g].total, 0); // F87

  return {
    basis,
    holdMonths,
    excludedTotal,
    purchase: f.purchasePrice,
    groups,
    totalPreFinance,
    buildCost,
    buildCostToday,
    buildInflationFactor,
    buildCostSource: roomResult ? 'roomRates' : 'fixed',
    buildBreakdown: roomResult ? roomResult.breakdown : null,
  };
}

export interface Programme {
  legalMonths: number; // E10
  preConMonths: number; // E11
  conMonths: number; // E12 = max build months
  conStartMonth: number; // E13 = E11 + 1
  pcMonth: number; // E14 = E11 + E12
  /**
   * Months the finished stock is expected to be held after PC, i.e. the
   * sell-down period at the modelled velocity, clamped to the cashflow horizon.
   * Time-based holding costs are charged for exactly this long, and the
   * cashflow spreads them over exactly these months, so the two cannot drift.
   */
  holdMonths: number;
}

export function programmeOf(f: FinanceInputs, totals: ScheduleTotals): Programme {
  // Phase lengths are divisors in the cashflow spread (the workbook divides
  // by them too) — clamp to >= 1 month so a zero input cannot silently drop
  // a whole cost category or produce NaN.
  const legalMonths = Math.max(1, Math.round(f.legalMonths));
  const preConMonths = Math.max(1, Math.round(f.preConMonths));
  const conMonths = Math.max(1, Math.round(totals.maxBuildMonths));
  const pcMonth = preConMonths + conMonths;
  // Sell-down at the modelled velocity, clamped so it cannot run past the
  // cashflow horizon. Zero velocity means nothing sells, so the stock is held
  // for whatever horizon remains rather than for "no months at all".
  const sellMonths = f.sales.velocityPerMonth > 0 ? Math.ceil(totals.units / f.sales.velocityPerMonth) : MONTHS - pcMonth;
  return {
    legalMonths,
    preConMonths,
    conMonths,
    conStartMonth: preConMonths + 1,
    pcMonth,
    holdMonths: Math.max(1, Math.min(sellMonths, MONTHS - pcMonth)),
  };
}

export interface CashflowResult {
  rows: MonthRow[];
  finance: FinanceSummary;
}

export function computeCashflow(
  f: FinanceInputs,
  dev: DevCostsComputed,
  prog: Programme,
  totals: ScheduleTotals,
  /** Per-month shares of the contract sum, from `buildCostSchedule`. Each
   *  carries its own tender-price index, and they sum to 1. Defaults to the
   *  plain S-curve. */
  buildWeights?: number[],
): CashflowResult {
  const { legalMonths, preConMonths, conMonths, conStartMonth, pcMonth } = prog;
  const g = dev.groups;

  // The bridge funds ONLY the property purchase (confirmed lender practice):
  // SDLT, legals, valuation and design fees are all paid from equity.
  const bridgeAdvance = f.purchasePrice * f.bridge.ltv; // E21
  // '2. Inputs' E22: estimated redemption = advance*(1+arr)*(1+rate/12)^preCon*(1+exit)
  const estRedemption =
    bridgeAdvance * (1 + f.bridge.arrangementFee) * Math.pow(1 + f.bridge.ratePa / 12, preConMonths) * (1 + f.bridge.exitFee);
  // E29 facility = F87 - equity - advance + est. redemption. The arrangement
  // fee is set on the committed facility at signing, which is itself an
  // estimate — so the estimate basis is faithful to how facilities are priced.
  const devFacilityEstimate = dev.totalPreFinance - f.equity.total - bridgeAdvance + estRedemption;
  const devArrangementFee = f.devLoan.arrangementFee * devFacilityEstimate;

  // Cost-line splits that get their own timing.
  const sumWhere = (grp: { lines: { code: string; label: string; amount: number }[] }, pred: (c: string, l: string) => boolean) =>
    grp.lines.filter((l) => pred(l.code, l.label)).reduce((s, l) => s + l.amount, 0);
  const sdltTotal = sumWhere(g.legals, isSdltLine); // paid on completion of the purchase
  const legalsRest = g.legals.total - sdltTotal;
  const architectTotal = sumWhere(g.professional, isArchitectLine); // runs through design AND construction
  const professionalRest = g.professional.total - architectTotal;
  const qsTotal = sumWhere(g.construction, isQsLine); // ditto
  const buildTotal = sumWhere(g.construction, (c) => isBuildLine(c)); // main contract, on the S-curve
  const contingencyTotal = sumWhere(g.construction, isContingencyLine); // spent as the build progresses
  const constructionRest = g.construction.total - qsTotal - buildTotal - contingencyTotal;

  // Post-construction holding and letting costs straight-line over the hold
  // period. Taken from the programme, which is the SAME figure the time-based
  // cost lines were charged for, so the two cannot drift.
  const postConStart = pcMonth + 1;
  const postConMonths = prog.holdMonths;

  // Retention: withheld from each certificate, part released at PC, the rest
  // at the end of the defects period.
  const ret = f.retention;
  const finalReleaseMonth = Math.min(pcMonth + Math.max(0, Math.round(ret.releaseMonthsAfterPc)), MONTHS);
  const defectsHoldTarget = buildTotal * Math.max(0, ret.pctAfterPc);

  // VAT on the purchase (opted-to-tax sellers only).
  const vat = f.vat;
  const vatOnPurchase = vat.optedToTax ? f.purchasePrice * vat.ratePct : 0;
  const vatReclaimMonth = Math.min(1 + Math.max(0, Math.round(vat.reclaimLagMonths)), MONTHS);
  const vatViaLoan = vat.optedToTax && vat.fundedBy === 'vatLoan';
  const vatLoanFee = vatViaLoan ? vatOnPurchase * vat.vatLoan.arrangementFee : 0;

  const rows: MonthRow[] = [];
  let cumCosts = 0;
  let cumNeed = 0; // costs + VAT working capital: what bridge+equity+dev loan must fund
  let prevBridgeBal = 0;
  let prevEquityCum = 0;
  let prevDevBal = 0;
  let retentionBalance = 0;
  let vatLoanBalance = 0;
  let vatLoanInterestTotal = 0;
  let equityAtPc = 0;

  for (let m = 1; m <= MONTHS; m++) {
    // --- development costs (timing per confirmed practice) ---
    let costs = 0;
    let retentionWithheld = 0;
    let retentionReleased = 0;
    if (m === 1) costs += dev.purchase + sdltTotal; // (A) + SDLT on completion
    if (m <= legalMonths) costs += legalsRest / legalMonths; // (B) other acquisition costs
    if (m <= preConMonths) costs += professionalRest / preConMonths; // (C) design team
    if (m <= pcMonth) costs += (architectTotal + qsTotal) / pcMonth; // architect & QS run to PC
    if (m > preConMonths && m <= pcMonth) {
      const k = m - preConMonths;
      // (D01) certificate for this month: the S-curve slice, priced at this
      // month's tender-price index when build inflation is on.
      const certified = buildTotal * (buildWeights ? (buildWeights[k - 1] ?? 0) : sCurveMonth(k, conMonths));
      retentionWithheld = certified * Math.max(0, ret.pctDuringWorks);
      costs += certified - retentionWithheld;
      costs += contingencyTotal * sCurveMonth(k, conMonths);
      costs += constructionRest / conMonths;
      costs += g.duringConstruction.total / conMonths; // (E)
    }
    if (m === pcMonth) {
      // First moiety: release the pot down to the defects-period holdback.
      retentionReleased += Math.max(0, retentionBalance + retentionWithheld - defectsHoldTarget);
      costs += g.salesMarketing.total; // (G) marketing around completion
    }
    if (m === finalReleaseMonth && m >= pcMonth) {
      // Defects period over: release whatever is still held.
      retentionReleased += Math.max(0, retentionBalance + retentionWithheld - retentionReleased);
    }
    costs += retentionReleased;
    if (pcMonth >= MONTHS ? m === MONTHS : m >= postConStart && m < postConStart + postConMonths) {
      // (F) holding costs and (I) letting costs over the hold period.
      costs += (g.postConstruction.total + g.letting.total) / postConMonths;
    }
    if (m <= pcMonth) costs += g.other.total / pcMonth; // (H)
    cumCosts += costs;

    // Deposit interest on the retention pot (held in the bank), accrued on
    // the balance carried into the month.
    const depositInterest = retentionBalance * (f.depositRatePa / 12);
    retentionBalance = retentionBalance + retentionWithheld - retentionReleased;

    // --- VAT on the purchase ---
    const vatPaid = m === 1 ? vatOnPurchase : 0;
    const vatReclaimed = m === vatReclaimMonth ? vatOnPurchase : 0;
    let vatLoanShortfall = 0;
    if (vatViaLoan) {
      if (m === 1) {
        vatLoanBalance = vatOnPurchase + vatLoanFee;
      }
      if (vatLoanBalance > 0) {
        const vi = vatLoanBalance * (vat.vatLoan.ratePa / 12);
        vatLoanInterestTotal += vi;
        vatLoanBalance += vi;
      }
      if (m === vatReclaimMonth && vatLoanBalance > 0) {
        // The reclaim repays the principal; the rolled fee + interest are the
        // real cost, settled from project funds that month.
        vatLoanShortfall = Math.max(0, vatLoanBalance - vatOnPurchase);
        vatLoanBalance = 0;
      }
    }
    // Equity-funded VAT is working capital: out at month 1, back at reclaim.
    const vatEquityFlow = vat.optedToTax && !vatViaLoan ? vatPaid - vatReclaimed : 0;
    const need = costs + vatEquityFlow + vatLoanShortfall;
    cumNeed += need;

    // --- bridge (rows 20-23): advances against the purchase only ---
    let bridgeInterest = 0;
    let bridgeBalance = 0;
    let bridgeRedemption = 0;
    if (m === 1) {
      bridgeInterest = bridgeAdvance * (1 + f.bridge.arrangementFee) * (f.bridge.ratePa / 12); // E21
      bridgeBalance = bridgeAdvance * (1 + f.bridge.arrangementFee) + bridgeInterest; // E22
    } else if (m <= preConMonths) {
      bridgeInterest = prevBridgeBal * (f.bridge.ratePa / 12);
      bridgeBalance = prevBridgeBal + bridgeInterest;
    } else {
      bridgeBalance = 0;
      if (m === conStartMonth) bridgeRedemption = prevBridgeBal * (1 + f.bridge.exitFee); // F23
    }

    // --- equity: fills the gap the bridge leaves, frozen at PC (costs after
    // PC are met from sales proceeds, not fresh equity) ---
    const equityCum =
      m <= pcMonth ? Math.min(f.equity.total, Math.max(0, cumNeed - bridgeAdvance)) : equityAtPc;
    if (m === pcMonth) equityAtPc = equityCum;
    const equityMonth = equityCum - prevEquityCum;

    // --- dev loan (rows 26-28): draws from construction start to PC ---
    let devInterest = 0;
    if (m > 1 && m <= pcMonth) devInterest = prevDevBal * (f.devLoan.ratePa / 12);
    let devDrawdown = 0;
    let devBalance = 0;
    if (m >= conStartMonth && m <= pcMonth) {
      // A negative funding need (the VAT reclaim landing during the loan
      // window while equity is fully deployed) PAYS THE LOAN DOWN rather
      // than vanishing; floored so the balance cannot go below zero.
      const grossNeed = need - equityMonth + (m === conStartMonth ? bridgeRedemption + devArrangementFee : 0);
      devDrawdown = Math.max(grossNeed, -(prevDevBal + devInterest));
    }
    devBalance = m > pcMonth ? 0 : prevDevBal + devInterest + devDrawdown;
    if (m === 1) devBalance = devDrawdown; // E28 = E26

    const fundingGap = m < conStartMonth && cumNeed > bridgeAdvance + f.equity.total;

    rows.push({
      month: m,
      costs,
      cumCosts,
      bridgeInterest,
      bridgeBalance,
      bridgeRedemption,
      equityCum,
      equityMonth,
      devDrawdown,
      devInterest,
      devBalance,
      fundingGap,
      vatPaid,
      vatReclaimed,
      vatLoanBalance,
      retentionWithheld,
      retentionReleased,
      retentionBalance,
      depositInterest,
    });

    prevBridgeBal = bridgeBalance;
    prevEquityCum = equityCum;
    prevDevBal = devBalance;
  }

  // Finance summary (rows 32-45)
  const bridgeArrangementFee = bridgeAdvance * f.bridge.arrangementFee; // C32
  const bridgeInterestTotal = rows.reduce((s, r) => s + r.bridgeInterest, 0); // C33
  const balAtPreConEnd = preConMonths >= 1 && preConMonths <= MONTHS ? rows[preConMonths - 1].bridgeBalance : 0;
  const bridgeExitFee = balAtPreConEnd * f.bridge.exitFee; // C34 = INDEX(E22:AZ22, E11) * E20
  const bridgeRedemptionTotal = rows.reduce((s, r) => s + r.bridgeRedemption, 0); // C35
  const devInterestTotal = rows.reduce((s, r) => s + r.devInterest, 0); // C37
  const devBalanceAtPC = pcMonth >= 1 && pcMonth <= MONTHS ? rows[pcMonth - 1].devBalance : 0; // C38
  const devExitFee = devBalanceAtPC * f.devLoan.exitFee; // C39
  const devPayoffAtPC = devBalanceAtPC + devExitFee; // C40
  const peakDevBalance = Math.max(...rows.map((r) => r.devBalance)); // C41
  const ltgdvAtPeak = totals.gdv === 0 ? 0 : peakDevBalance / totals.gdv; // C42
  const retentionHeldPeak = Math.max(...rows.map((r) => r.retentionBalance));
  const depositInterestRetention = rows.reduce((s, r) => s + r.depositInterest, 0);
  const totalFinanceCosts =
    bridgeArrangementFee +
    bridgeInterestTotal +
    bridgeExitFee +
    devArrangementFee +
    devInterestTotal +
    devExitFee +
    vatLoanFee +
    vatLoanInterestTotal; // C43 + VAT facility costs
  // Deposit interest earned on the retention pot offsets total costs.
  const totalCostsAfterFinance = dev.totalPreFinance + totalFinanceCosts - depositInterestRetention; // C44
  const equityUsed = Math.max(...rows.map((r) => r.equityCum)); // C45 (peak: includes VAT working capital)

  return {
    rows,
    finance: {
      bridgeAdvance,
      bridgeArrangementFee,
      bridgeInterestTotal,
      bridgeExitFee,
      bridgeRedemptionTotal,
      devFacilityEstimate,
      devArrangementFee,
      devInterestTotal,
      devBalanceAtPC,
      devExitFee,
      devPayoffAtPC,
      peakDevBalance,
      ltgdvAtPeak,
      ltgdvOk: ltgdvAtPeak <= f.devLoan.maxLtgdv,
      vatOnPurchase,
      vatLoanFee,
      vatLoanInterest: vatLoanInterestTotal,
      retentionHeldPeak,
      depositInterestRetention,
      totalFinanceCosts,
      totalCostsAfterFinance,
      equityUsed,
    },
  };
}

/** Sell-down loop shared by scenarios 2 and 4. Sales pacing is uniform
 *  (confirmed assumption); prices index forward by HPI to each sale month;
 *  surplus cash after the loan is repaid earns deposit interest. */
function sellDown(args: {
  units: number;
  gdvAtPcAdjusted: number; // GDV indexed to PC x price lever
  hpi: HpiInputs;
  pcMonth: number;
  velocity: number;
  agentFeePct: number;
  legalPerUnit: number;
  openingLoan: number;
  monthlyRate: number;
  depositRatePa: number;
}): {
  totalInterest: number;
  hpiUplift: number;
  depositInterest: number;
  closingBalances: number[];
} {
  const { units, gdvAtPcAdjusted, hpi, pcMonth, velocity, agentFeePct, legalPerUnit, openingLoan, monthlyRate, depositRatePa } = args;
  const avgPriceAtPc = units === 0 ? 0 : gdvAtPcAdjusted / units;
  const indexAtPc = hpiIndexAt(hpi, pcMonth);
  let remaining = units;
  let opening = openingLoan;
  let totalInterest = 0;
  let hpiUplift = 0;
  let cash = 0;
  let depositInterest = 0;
  const closingBalances: number[] = [];
  for (let m = 1; m <= SELLDOWN_MONTHS; m++) {
    const sold = Math.min(velocity, remaining);
    remaining -= sold;
    // Price each month's sales at that month's index (relative to PC).
    const factor = indexAtPc === 0 ? 1 : hpiIndexAt(hpi, pcMonth + m) / indexAtPc;
    const gross = sold * avgPriceAtPc * factor;
    // Uplift is net of the agent fee: the agent is paid on the achieved
    // price, so only (1 - fee) of the growth reaches profit.
    hpiUplift += sold * avgPriceAtPc * (factor - 1) * (1 - agentFeePct);
    const net = gross * (1 - agentFeePct) - sold * legalPerUnit;
    const interest = opening * monthlyRate;
    totalInterest += interest;
    const repayment = Math.min(opening + interest, Math.max(0, net));
    const closing = opening + interest - repayment;
    closingBalances.push(closing);
    opening = closing;
    // Deposit interest on the cash balance carried in, then bank this
    // month's surplus (proceeds left after loan repayment). Only a positive
    // balance earns; a freak negative-net month must not charge interest.
    depositInterest += Math.max(0, cash) * (depositRatePa / 12);
    cash += Math.max(0, net) - repayment;
    if (remaining === 0 && closing <= 0.01) break; // sold out and repaid: cash distributes
  }
  return { totalInterest, hpiUplift, depositInterest, closingBalances };
}

/**
 * Profit distribution. 'simple' reproduces the current 50/50 deals; the
 * waterfall pays investor capital back first (implicit: profit is after all
 * costs), then a preferred return compounded monthly on drawn capital, then
 * splits the residual. Losses are borne pro-rata to capital in both modes.
 */
export function computeWaterfall(
  f: FinanceInputs,
  rows: MonthRow[],
  netProfit: number,
  exitMonth: number,
): WaterfallResult {
  const share = f.equity.investorShare;
  const wf = f.waterfall;
  const committed = f.equity.total * share;

  // Accrue pref on the investor's drawn balance, following the cashflow's
  // actual equity deployment (a VAT reclaim hands capital back early and
  // stops pref accruing on it).
  let capBal = 0;
  let pref = 0;
  let drawnPeak = 0;
  const horizon = Math.max(1, Math.round(exitMonth));
  for (let m = 1; m <= horizon; m++) {
    pref += (capBal + pref) * (wf.prefRatePa / 12); // no pref in the month of drawdown
    const draw = (rows[m - 1]?.equityMonth ?? 0) * share;
    capBal += draw;
    drawnPeak = Math.max(drawnPeak, capBal);
  }

  const investorCapital = wf.mode === 'waterfall' ? drawnPeak : committed;
  const developerCapital = f.equity.total - committed;

  let prefPaid = 0;
  let residualProfit = 0;
  let investorProfit: number;
  if (wf.mode !== 'waterfall' || netProfit <= 0) {
    investorProfit = netProfit * share;
    residualProfit = Math.max(0, netProfit);
  } else {
    prefPaid = Math.min(pref, netProfit);
    residualProfit = netProfit - prefPaid;
    investorProfit = prefPaid + residualProfit * wf.residualInvestorPct;
  }
  const developerProfit = netProfit - investorProfit;
  const investorRoi = investorCapital === 0 ? 0 : investorProfit / investorCapital;

  return {
    mode: wf.mode,
    exitMonth: horizon,
    investorCapital,
    developerCapital,
    prefAccrued: wf.mode === 'waterfall' ? pref : 0,
    prefPaid,
    prefShortfall: wf.mode === 'waterfall' && netProfit > 0 ? Math.max(0, pref - prefPaid) : 0,
    residualProfit,
    investorProfit,
    developerProfit,
    investorRoi,
    investorRoiPa: horizon === 0 ? 0 : (investorRoi * 12) / horizon,
  };
}

export function computeScenarios(
  f: FinanceInputs,
  totals: ScheduleTotals,
  dev: DevCostsComputed,
  fin: FinanceSummary,
  prog: Programme,
  rows: MonthRow[],
  /** The LET-basis cost build-up and its own finance roll-up, for S3. A hold
   *  does not pay selling costs and does pay letting costs, and its dev loan at
   *  PC differs accordingly, so scenario 3 is priced on its own cashflow rather
   *  than on the sale case's. */
  let_?: { dev: DevCostsComputed; fin: FinanceSummary },
): ScenarioResults {
  // Scenario 1 — immediate sale at PC. Today's GDV is indexed forward to PC
  // by the HPI projection (index 1.0 when disabled), then the price lever.
  const hpiIndexAtPc = hpiIndexAt(f.hpi, prog.pcMonth);
  const gdvAdjusted = totals.gdv * hpiIndexAtPc * (1 + f.sales.priceAdjust); // F5
  const netProfit1 = gdvAdjusted - fin.totalCostsAfterFinance; // F9
  const wf1 = computeWaterfall(f, rows, netProfit1, prog.pcMonth);
  const s1 = {
    gdvAdjusted,
    hpiIndexAtPc,
    netProfit: netProfit1,
    profitOnCost: fin.totalCostsAfterFinance === 0 ? 0 : netProfit1 / fin.totalCostsAfterFinance,
    profitOnGdv: gdvAdjusted === 0 ? 0 : netProfit1 / gdvAdjusted,
    investorProfit: wf1.investorProfit,
    developerProfit: wf1.developerProfit,
    investorRoi: wf1.investorRoi,
    durationMonths: prog.pcMonth,
    investorRoiPa: wf1.investorRoiPa,
    waterfall: wf1,
  };

  // Scenario 2 — delayed sales, dev loan keeps rolling (rows 23-39)
  const sd2 = sellDown({
    units: totals.units,
    gdvAtPcAdjusted: gdvAdjusted,
    hpi: f.hpi,
    pcMonth: prog.pcMonth,
    velocity: f.sales.velocityPerMonth,
    agentFeePct: f.sales.agentFeePct,
    legalPerUnit: f.sales.legalPerUnit,
    openingLoan: fin.devPayoffAtPC, // E28 = C40
    monthlyRate: f.devLoan.ratePa / 12,
    depositRatePa: f.depositRatePa,
  });
  const monthsToSellOut = f.sales.velocityPerMonth === 0 ? 0 : Math.ceil(totals.units / f.sales.velocityPerMonth); // F33
  const repayMonthsOf = (bal: number[]): number | '36+' =>
    bal.length >= SELLDOWN_MONTHS && bal[SELLDOWN_MONTHS - 1] > 0.01 ? '36+' : bal.filter((b) => b > 0.01).length + 1;
  const monthsToRepay = repayMonthsOf(sd2.closingBalances); // F34
  // Distributions cannot happen until the units are sold AND the loan is
  // repaid — the pref accrues to whichever comes later.
  const exitAfterPc2 = Math.max(monthsToSellOut, monthsToRepay === '36+' ? SELLDOWN_MONTHS : monthsToRepay);
  const netProfit2 = netProfit1 + sd2.hpiUplift + sd2.depositInterest - sd2.totalInterest; // F36 + HPI + deposit interest
  const wf2 = computeWaterfall(f, rows, netProfit2, prog.pcMonth + exitAfterPc2);
  const s2 = {
    monthsToSellOut,
    monthsToRepay,
    extraInterest: sd2.totalInterest, // F35
    hpiUplift: sd2.hpiUplift,
    depositInterestOnSurplus: sd2.depositInterest,
    netProfit: netProfit2,
    investorProfit: wf2.investorProfit, // F37
    investorRoi: wf2.investorRoi, // F38
    totalDurationMonths: prog.pcMonth + monthsToSellOut, // F39
    waterfall: wf2,
  };

  // Scenario 3 — refinance at PC & rent (rows 43-54).
  // Priced on the LET basis: no selling costs (no sale happens), plus the (I)
  // letting costs, and its own dev loan roll-up. Falls back to the sale case
  // when no let basis was supplied, which reproduces the old behaviour.
  const devLet = let_?.dev ?? dev;
  const finLet = let_?.fin ?? fin;
  const mortgageAdvance = f.refinance.ltv * gdvAdjusted; // F43
  const refiArrFee = mortgageAdvance * f.refinance.arrangementFee; // F44
  const surplusReleased = mortgageAdvance - refiArrFee - finLet.devPayoffAtPC; // F46
  const grossAnnualRent = totals.grossAnnualRent; // F47 = UI F46
  const netAnnualRent = grossAnnualRent * (1 - f.refinance.voidPct) * (1 - f.refinance.mgmtPct); // F48
  const annualInterest = mortgageAdvance * f.refinance.ratePa; // F49
  const netAnnualCashflow = netAnnualRent - annualInterest; // F50
  const equityRemaining = f.equity.total - surplusReleased; // F52
  const costsIfLet = finLet.totalCostsAfterFinance;
  const s3 = {
    // On the let basis, the excluded lines ARE the selling costs.
    sellingCostsAvoided: devLet.excludedTotal,
    lettingCosts: devLet.groups.letting.total,
    costsIfLet,
    mortgageAdvance,
    arrangementFee: refiArrFee,
    devPayoff: finLet.devPayoffAtPC, // F45 = F12
    surplusReleased,
    grossAnnualRent,
    netAnnualRent,
    annualInterest,
    netAnnualCashflow,
    interestCover: annualInterest === 0 ? 0 : netAnnualRent / annualInterest, // F51
    equityRemaining,
    cashOnCash: equityRemaining === 0 ? 0 : netAnnualCashflow / equityRemaining, // F53
    // Value uplift if refinanced and held, against the costs a HOLD actually
    // incurs — not the sale case's profit, which charged agent fees on a sale
    // that never happens.
    unrealisedProfit: gdvAdjusted - costsIfLet, // F54
  };

  // Scenario 4 — refinance at PC, then delayed sales at the lower rate (rows 59-75)
  const refiPrincipal = fin.devPayoffAtPC; // F59 = F12
  const refiFeeRolled = refiPrincipal * f.refinance.arrangementFee; // F60
  const sd4 = sellDown({
    units: totals.units,
    gdvAtPcAdjusted: gdvAdjusted,
    hpi: f.hpi,
    pcMonth: prog.pcMonth,
    velocity: f.sales.velocityPerMonth,
    agentFeePct: f.sales.agentFeePct,
    legalPerUnit: f.sales.legalPerUnit,
    openingLoan: refiPrincipal + refiFeeRolled, // E66
    monthlyRate: f.refinance.ratePa / 12, // E67
    depositRatePa: f.depositRatePa,
  });
  const netProfit4 = netProfit1 + sd4.hpiUplift + sd4.depositInterest - refiFeeRolled - sd4.totalInterest; // F72 + HPI + deposit
  const repay4 = repayMonthsOf(sd4.closingBalances);
  const exitAfterPc4 = Math.max(monthsToSellOut, repay4 === '36+' ? SELLDOWN_MONTHS : repay4);
  const wf4 = computeWaterfall(f, rows, netProfit4, prog.pcMonth + exitAfterPc4);
  const s4 = {
    refiPrincipal,
    arrangementFee: refiFeeRolled,
    extraInterest: sd4.totalInterest, // F71
    hpiUplift: sd4.hpiUplift,
    depositInterestOnSurplus: sd4.depositInterest,
    netProfit: netProfit4,
    benefitVsS2: netProfit4 - netProfit2, // F73
    investorProfit: wf4.investorProfit, // F74
    investorRoi: wf4.investorRoi, // F75
    waterfall: wf4,
  };

  return { s1, s2, s3, s4 };
}

const GRID1_MOVES = [-0.1, -0.05, 0, 0.05, 0.1];
const GRID2_VELOCITIES = [1, 2, 3, 4, 6];
const GRID3_RATES = [0.045, 0.05, 0.055, 0.06, 0.065];
const GRID3_LTVS = [0.55, 0.6, 0.65, 0.7];

export function computeSensitivity(
  f: FinanceInputs,
  totals: ScheduleTotals,
  dev: DevCostsComputed,
  fin: FinanceSummary,
  scen: ScenarioResults,
): SensitivityResults {
  // F4: fixed cost base = costs after finance excl. price-dependent selling costs (G03, G04)
  const salesAgentLine = dev.groups.salesMarketing.lines.find((l) => l.code === 'G03')?.amount ?? 0;
  const salesLegalLine = dev.groups.salesMarketing.lines.find((l) => l.code === 'G04')?.amount ?? 0;
  const fixedCostBase = fin.totalCostsAfterFinance - salesAgentLine - salesLegalLine;

  // Grids price off the same base scenario 1 sells at — GDV indexed to PC
  // with the price lever applied — so the 0% row equals S1 exactly, whatever
  // the lever or HPI settings. Grid moves are on top of that base.
  const gdvBase = totals.gdv * scen.s1.hpiIndexAtPc * (1 + f.sales.priceAdjust);

  // Grid 1: C8 = GDV*(1+p)*(1-agent) - legalPerUnit*units - F4
  const grid1 = GRID1_MOVES.map((p) => {
    const netProfit = gdvBase * (1 + p) * (1 - f.sales.agentFeePct) - f.sales.legalPerUnit * totals.units - fixedCostBase;
    return {
      priceMove: p,
      netProfit,
      profitOnGdv: gdvBase === 0 ? 0 : netProfit / (gdvBase * (1 + p)),
    };
  });

  // Grid 2: C17 = C8(p) - C40*(devRate/12)*(MIN(ceil(units/vel), ceil(C40/max(1, monthlyNet(p,vel))))+1)/2,
  // plus the holding-cost difference the changed velocity implies.
  //
  // `base` comes from grid 1, whose cost base carries the holding costs for the
  // MODELLED velocity. Sweeping velocity here without re-pricing them would let
  // interest scale while council tax and insurance stayed put — exactly the
  // defect §6.5 fixed, relocated into the grid.
  const holdingPerMonth = dev.holdMonths > 0 ? dev.groups.postConstruction.total / dev.holdMonths : 0;
  const grid2 = GRID1_MOVES.map((p, i) => {
    const base = grid1[i].netProfit;
    return {
      priceMove: p,
      profits: GRID2_VELOCITIES.map((vel) => {
        const monthlyNet =
          vel * ((gdvBase * (1 + p)) / Math.max(totals.units, 1)) * (1 - f.sales.agentFeePct) - vel * f.sales.legalPerUnit;
        const monthsSellOut = Math.ceil(totals.units / vel);
        const monthsRepay = Math.ceil(fin.devPayoffAtPC / Math.max(1, monthlyNet));
        const months = Math.min(monthsSellOut, monthsRepay);
        const extraHolding = holdingPerMonth * (monthsSellOut - dev.holdMonths);
        const netProfit = base - fin.devPayoffAtPC * (f.devLoan.ratePa / 12) * ((months + 1) / 2) - extraHolding;
        return { velocity: vel, netProfit };
      }),
    };
  });

  // Grid 3: F48 - F5*ltv*rate
  const grid3 = GRID3_RATES.map((rate) => ({
    rate,
    cells: GRID3_LTVS.map((ltv) => ({
      ltv,
      cashflow: scen.s3.netAnnualRent - scen.s1.gdvAdjusted * ltv * rate,
    })),
  }));

  return { fixedCostBase, grid1, grid2, grid2Velocities: GRID2_VELOCITIES, grid3, grid3Ltvs: GRID3_LTVS };
}

/** Run the full appraisal for a unit schedule under a pricing spec. */
export function runAppraisal(schedule: ScheduleRow[], spec: PricingSpec, roomAreas?: RoomAreas): AppraisalResult {
  const totals = scheduleTotals(schedule);
  const f = spec.finance;
  const prog = programmeOf(f, totals);
  // Sales costs are priced on the revenue the scenarios actually sell at.
  const salesGdvFactor = hpiIndexAt(f.hpi, prog.pcMonth) * (1 + f.sales.priceAdjust);
  // Build cost is priced on the months the contract is certified, so the same
  // schedule sizes line D01 and spreads it across the cashflow.
  const buildSchedule = buildCostSchedule(f.buildInflation, prog);
  const devArgs = [spec, totals, roomAreas, salesGdvFactor, buildSchedule.factor] as const;
  const dev = computeDevCosts(...devArgs, 'onSale', prog.holdMonths, totals.grossAnnualRent);
  const { rows, finance } = computeCashflow(f, dev, prog, totals, buildSchedule.weights);
  // Scenario 3 holds rather than sells, so it gets its own cost build-up and
  // its own finance roll-up: no selling costs, letting costs instead, and a
  // dev loan at PC that reflects both.
  const devLet = computeDevCosts(...devArgs, 'onLet', prog.holdMonths, totals.grossAnnualRent);
  const letCashflow = computeCashflow(f, devLet, prog, totals, buildSchedule.weights);
  const scenarios = computeScenarios(f, totals, dev, finance, prog, rows, {
    dev: devLet,
    fin: letCashflow.finance,
  });
  const sensitivity = computeSensitivity(f, totals, dev, finance, scenarios);

  const warnings: string[] = [];
  if (f.vat.optedToTax) {
    warnings.push(
      f.sdlt.regime === 'manual'
        ? 'Property is opted to tax: check the SDLT line, since stamp duty is charged on the VAT-inclusive price.'
        : 'Property is opted to tax: SDLT has been computed on the VAT-inclusive purchase price.',
    );
  }
  if (f.sdlt.regime !== 'manual') {
    const sdltMatches = spec.devCosts.filter((l) => l.kind === 'fixed' && isSdltLine(l.code, l.label));
    if (sdltMatches.length > 1) {
      warnings.push(
        `Several cost lines look like stamp duty (${sdltMatches.map((l) => l.code).join(', ')}). Only the first (${sdltMatches[0].code}) is computed from HMRC bands; the others keep their typed values — check they are not duplicates.`,
      );
    }
  }
  if (prog.pcMonth + f.retention.releaseMonthsAfterPc > MONTHS) {
    warnings.push(
      `Final retention release (month ${prog.pcMonth + f.retention.releaseMonthsAfterPc}) falls beyond the ${MONTHS}-month horizon and is shown in month ${MONTHS}.`,
    );
  }
  if (f.hpi.enabled && !f.hpi.annualPct.some((r) => r !== 0)) {
    warnings.push('House price inflation is enabled but every annual rate is zero.');
  }
  // The asymmetry that manufactured profit: revenue indexed forward while the
  // contract stayed at today's prices, so a LONGER programme looked better.
  // Never silent — this is the single most misleading state the model can be in.
  if (f.hpi.enabled && f.hpi.annualPct.some((r) => r !== 0) && !f.buildInflation.enabled) {
    warnings.push(
      'House price inflation is indexing sale prices forward but tender-price inflation is OFF, so the build cost is frozen at today’s money. Profit is overstated and a longer programme will wrongly look more profitable. Set a build inflation rate, or turn HPI off.',
    );
  }
  if (f.buildInflation.enabled && f.buildInflation.annualPct === 0) {
    warnings.push('Tender-price inflation is enabled but the rate is zero, so build cost stays at today’s money.');
  }
  if (f.buildInflation.enabled && f.buildInflation.annualPct !== 0) {
    const factor = buildCostSchedule(f.buildInflation, prog).factor;
    warnings.push(
      `Build cost indexed for tender-price inflation at ${(f.buildInflation.annualPct * 100).toFixed(1)}% pa: the contract is priced at ${((factor - 1) * 100).toFixed(1)}% above today’s money (S-curve-weighted over months ${prog.conStartMonth}-${prog.pcMonth}). Other cost lines remain in today’s money.`,
    );
  }
  if (prog.pcMonth > MONTHS) {
    warnings.push(
      `Programme runs to month ${prog.pcMonth}, beyond the ${MONTHS}-month cashflow horizon, so finance costs are understated. Shorten the programme.`,
    );
  }
  if (prog.legalMonths !== f.legalMonths || prog.preConMonths !== f.preConMonths) {
    warnings.push('Legal / pre-construction periods below 1 month were clamped to 1.');
  }
  if (
    f.sales.velocityPerMonth > 0 &&
    Math.ceil(totals.units / f.sales.velocityPerMonth) > SELLDOWN_MONTHS
  ) {
    warnings.push(
      `Sell-out takes longer than the ${SELLDOWN_MONTHS}-month scenario horizon, so delayed-sale interest is understated.`,
    );
  }
  if (spec.buildCostMode === 'roomRates' && !roomAreas) {
    warnings.push('No room-type areas for this schedule, so build cost falls back to the fixed D01 amount.');
  }
  if (totals.units > MAX_UNITS) {
    // The workbook's '1. Unit Import' holds rows 7-36. The app's own model
    // prices every unit, but an Excel export cannot carry more than MAX_UNITS,
    // so say here exactly what sheets 1-6 would leave out.
    const droppedGdv = schedule.slice(MAX_UNITS).reduce((s2, r) => s2 + r.unitGdv, 0);
    warnings.push(
      `${totals.units} units exceeds the ${MAX_UNITS}-unit capacity of the workbook's '1. Unit Import' sheet. This appraisal prices all ${totals.units}, but an Excel export carries only the first ${MAX_UNITS} into sheets 1-6, omitting £${Math.round(droppedGdv).toLocaleString('en-GB')} of GDV there. The '7. App Model v2' sheet always reflects the full schedule.`,
    );
  }

  return {
    warnings,
    schedule,
    totals: {
      units: totals.units,
      niaSqft: totals.niaSqft,
      gdv: totals.gdv,
      avgPsf: totals.avgPsf,
      maxBuildMonths: totals.maxBuildMonths,
      monthlyRent: totals.monthlyRent,
      grossAnnualRent: totals.grossAnnualRent,
    },
    programme: prog,
    devCosts: dev,
    cashflow: rows,
    finance,
    scenarios,
    sensitivity,
  };
}
