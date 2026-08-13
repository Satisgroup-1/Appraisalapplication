// DCF appraisal engine. A faithful port of Appraisal_Model_1.xlsx:
//   '3. Dev Costs'  -> computeDevCosts
//   '4. Cashflow'   -> computeCashflow (48 months, bridge + dev loan roll-up)
//   '5. Scenarios'  -> computeScenarios (4 exit scenarios, 36-month sell-down)
//   '6. Sensitivity'-> computeSensitivity (3 grids)
// Cell references from the workbook are noted in comments throughout.

import type {
  AppraisalResult,
  DevCostGroup,
  DevCostsComputed,
  FinanceInputs,
  FinanceSummary,
  MonthRow,
  PricingSpec,
  RoomAreas,
  ScenarioResults,
  ScheduleRow,
  SensitivityResults,
} from './types';
import { SQM_TO_SQFT } from './rules';

export const MONTHS = 48; // '4. Cashflow' columns E..AZ
export const SELLDOWN_MONTHS = 36; // '5. Scenarios' columns E..AN

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

export function computeDevCosts(spec: PricingSpec, totals: ScheduleTotals, roomAreas?: RoomAreas): DevCostsComputed {
  const f = spec.finance;
  const buildLine = spec.devCosts.find((l) => l.code === 'D01');
  const fixedBuildCost = buildLine?.kind === 'fixed' ? buildLine.value : 0;

  const useRoomRates = spec.buildCostMode === 'roomRates' && !!roomAreas;
  const roomResult = useRoomRates ? buildCostFromRooms(spec, roomAreas!) : null;
  const buildCost = roomResult ? roomResult.total : fixedBuildCost;

  const groups: DevCostsComputed['groups'] = {
    legals: { lines: [], total: 0 },
    professional: { lines: [], total: 0 },
    construction: { lines: [], total: 0 },
    duringConstruction: { lines: [], total: 0 },
    postConstruction: { lines: [], total: 0 },
    salesMarketing: { lines: [], total: 0 },
    other: { lines: [], total: 0 },
  };

  for (const line of spec.devCosts) {
    let amount = 0;
    switch (line.kind) {
      case 'fixed':
        amount = line.code === 'D01' ? buildCost : line.value;
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
        amount = (line.value || f.sales.agentFeePct) * totals.gdv;
        break;
      case 'salesLegalPerUnit': // G04 = E41 x F40
        amount = f.sales.legalPerUnit * totals.units;
        break;
    }
    groups[line.group].lines.push({ code: line.code, label: line.label, amount });
    groups[line.group].total += amount;
  }

  const totalPreFinance =
    f.purchasePrice +
    (Object.keys(groups) as DevCostGroup[]).reduce((s, g) => s + groups[g].total, 0); // F87

  return {
    purchase: f.purchasePrice,
    groups,
    totalPreFinance,
    buildCost,
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
}

export function programmeOf(f: FinanceInputs, totals: ScheduleTotals): Programme {
  // Phase lengths are divisors in the cashflow spread (the workbook divides
  // by them too) — clamp to >= 1 month so a zero input cannot silently drop
  // a whole cost category or produce NaN.
  const legalMonths = Math.max(1, Math.round(f.legalMonths));
  const preConMonths = Math.max(1, Math.round(f.preConMonths));
  const conMonths = Math.max(1, Math.round(totals.maxBuildMonths));
  return {
    legalMonths,
    preConMonths,
    conMonths,
    conStartMonth: preConMonths + 1,
    pcMonth: preConMonths + conMonths,
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
): CashflowResult {
  const { legalMonths, preConMonths, conMonths, conStartMonth, pcMonth } = prog;
  const g = dev.groups;

  const bridgeAdvance = f.purchasePrice * f.bridge.ltv; // E21
  // '2. Inputs' E22: estimated redemption = advance*(1+arr)*(1+rate/12)^preCon*(1+exit)
  const estRedemption =
    bridgeAdvance * (1 + f.bridge.arrangementFee) * Math.pow(1 + f.bridge.ratePa / 12, preConMonths) * (1 + f.bridge.exitFee);
  // E29 facility = F87 - equity - advance + est. redemption
  const devFacilityEstimate = dev.totalPreFinance - f.equity.total - bridgeAdvance + estRedemption;
  // E30 dev arrangement fee £ (rolled at first draw)
  const devArrangementFee = f.devLoan.arrangementFee * devFacilityEstimate;

  const rows: MonthRow[] = [];
  let cumCosts = 0;
  let prevBridgeBal = 0;
  let prevEquityCum = 0;
  let prevDevBal = 0;

  for (let m = 1; m <= MONTHS; m++) {
    // Cost rows (E8..E15 pattern)
    let costs = 0;
    if (m === 1) costs += dev.purchase; // (A) purchase at month 1
    if (m <= legalMonths) costs += g.legals.total / legalMonths; // (B)
    if (m <= preConMonths) costs += g.professional.total / preConMonths; // (C)
    if (m > preConMonths && m <= pcMonth) {
      costs += g.construction.total / conMonths; // (D)
      costs += g.duringConstruction.total / conMonths; // (E)
    }
    if (m === pcMonth) {
      costs += g.postConstruction.total; // (F)
      costs += g.salesMarketing.total; // (G)
    }
    if (m <= pcMonth) costs += g.other.total / pcMonth; // (H)
    cumCosts += costs;

    // Bridge (rows 20-23)
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

    // Equity (rows 24-25): cumulative = MIN(total, MAX(0, cumCosts - advance))
    const equityCum = Math.min(f.equity.total, Math.max(0, cumCosts - bridgeAdvance));
    const equityMonth = equityCum - prevEquityCum;

    // Dev loan (rows 26-28)
    let devDrawdown = 0;
    let devInterest = 0;
    let devBalance = 0;
    if (m >= conStartMonth) {
      devDrawdown = Math.max(0, costs - equityMonth) + (m === conStartMonth ? bridgeRedemption + devArrangementFee : 0);
    }
    if (m > 1 && m <= pcMonth) devInterest = prevDevBal * (f.devLoan.ratePa / 12);
    devBalance = m > pcMonth ? 0 : prevDevBal + devInterest + devDrawdown;
    if (m === 1) devBalance = devDrawdown; // E28 = E26

    const fundingGap = m < conStartMonth && cumCosts > bridgeAdvance + f.equity.total;

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
  const totalFinanceCosts =
    bridgeArrangementFee + bridgeInterestTotal + bridgeExitFee + devArrangementFee + devInterestTotal + devExitFee; // C43
  const totalCostsAfterFinance = dev.totalPreFinance + totalFinanceCosts; // C44
  const equityUsed = Math.max(...rows.map((r) => r.equityCum)); // C45

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
      totalFinanceCosts,
      totalCostsAfterFinance,
      equityUsed,
    },
  };
}

/** Sell-down loop shared by scenarios 2 and 4. */
function sellDown(
  units: number,
  gdvAdjusted: number,
  velocity: number,
  agentFeePct: number,
  legalPerUnit: number,
  openingLoan: number,
  monthlyRate: number,
): { totalInterest: number; closingBalances: number[] } {
  const avgPrice = units === 0 ? 0 : gdvAdjusted / units;
  let remaining = units;
  let opening = openingLoan;
  let totalInterest = 0;
  const closingBalances: number[] = [];
  for (let m = 1; m <= SELLDOWN_MONTHS; m++) {
    const sold = Math.min(velocity, remaining);
    remaining -= sold;
    const gross = sold * avgPrice;
    const net = gross * (1 - agentFeePct) - sold * legalPerUnit;
    const interest = opening * monthlyRate;
    totalInterest += interest;
    const repayment = Math.min(opening + interest, Math.max(0, net));
    const closing = opening + interest - repayment;
    closingBalances.push(closing);
    opening = closing;
  }
  return { totalInterest, closingBalances };
}

export function computeScenarios(
  f: FinanceInputs,
  totals: ScheduleTotals,
  dev: DevCostsComputed,
  fin: FinanceSummary,
  prog: Programme,
): ScenarioResults {
  // Scenario 1 — immediate sale at PC
  const gdvAdjusted = totals.gdv * (1 + f.sales.priceAdjust); // F5
  const netProfit1 = gdvAdjusted - fin.totalCostsAfterFinance; // F9
  const investorEquity = f.equity.total * f.equity.investorShare; // E36
  const s1 = {
    gdvAdjusted,
    netProfit: netProfit1,
    profitOnCost: fin.totalCostsAfterFinance === 0 ? 0 : netProfit1 / fin.totalCostsAfterFinance,
    profitOnGdv: gdvAdjusted === 0 ? 0 : netProfit1 / gdvAdjusted,
    investorProfit: netProfit1 * f.equity.investorShare,
    developerProfit: netProfit1 * (1 - f.equity.investorShare),
    investorRoi: investorEquity === 0 ? 0 : (netProfit1 * f.equity.investorShare) / investorEquity,
    durationMonths: prog.pcMonth,
    investorRoiPa:
      prog.pcMonth === 0 ? 0 : ((investorEquity === 0 ? 0 : (netProfit1 * f.equity.investorShare) / investorEquity) * 12) / prog.pcMonth,
  };

  // Scenario 2 — delayed sales, dev loan keeps rolling (rows 23-39)
  const sd2 = sellDown(
    totals.units,
    gdvAdjusted,
    f.sales.velocityPerMonth,
    f.sales.agentFeePct,
    f.sales.legalPerUnit,
    fin.devPayoffAtPC, // E28 = C40
    f.devLoan.ratePa / 12,
  );
  const monthsToSellOut = f.sales.velocityPerMonth === 0 ? 0 : Math.ceil(totals.units / f.sales.velocityPerMonth); // F33
  const monthsToRepay: number | '36+' =
    sd2.closingBalances[SELLDOWN_MONTHS - 1] > 0.01
      ? '36+'
      : sd2.closingBalances.filter((b) => b > 0.01).length + 1; // F34
  const netProfit2 = netProfit1 - sd2.totalInterest; // F36
  const s2 = {
    monthsToSellOut,
    monthsToRepay,
    extraInterest: sd2.totalInterest, // F35
    netProfit: netProfit2,
    investorProfit: netProfit2 * f.equity.investorShare, // F37
    investorRoi: investorEquity === 0 ? 0 : (netProfit2 * f.equity.investorShare) / investorEquity, // F38
    totalDurationMonths: prog.pcMonth + monthsToSellOut, // F39
  };

  // Scenario 3 — refinance at PC & rent (rows 43-54)
  const mortgageAdvance = f.refinance.ltv * gdvAdjusted; // F43
  const refiArrFee = mortgageAdvance * f.refinance.arrangementFee; // F44
  const surplusReleased = mortgageAdvance - refiArrFee - fin.devPayoffAtPC; // F46
  const grossAnnualRent = totals.grossAnnualRent; // F47 = UI F46
  const netAnnualRent = grossAnnualRent * (1 - f.refinance.voidPct) * (1 - f.refinance.mgmtPct); // F48
  const annualInterest = mortgageAdvance * f.refinance.ratePa; // F49
  const netAnnualCashflow = netAnnualRent - annualInterest; // F50
  const equityRemaining = f.equity.total - surplusReleased; // F52
  const s3 = {
    mortgageAdvance,
    arrangementFee: refiArrFee,
    devPayoff: fin.devPayoffAtPC, // F45 = F12
    surplusReleased,
    grossAnnualRent,
    netAnnualRent,
    annualInterest,
    netAnnualCashflow,
    interestCover: annualInterest === 0 ? 0 : netAnnualRent / annualInterest, // F51
    equityRemaining,
    cashOnCash: equityRemaining === 0 ? 0 : netAnnualCashflow / equityRemaining, // F53
    unrealisedProfit: netProfit1, // F54
  };

  // Scenario 4 — refinance at PC, then delayed sales at the lower rate (rows 59-75)
  const refiPrincipal = fin.devPayoffAtPC; // F59 = F12
  const refiFeeRolled = refiPrincipal * f.refinance.arrangementFee; // F60
  const sd4 = sellDown(
    totals.units,
    gdvAdjusted,
    f.sales.velocityPerMonth,
    f.sales.agentFeePct,
    f.sales.legalPerUnit,
    refiPrincipal + refiFeeRolled, // E66
    f.refinance.ratePa / 12, // E67
  );
  const netProfit4 = netProfit1 - refiFeeRolled - sd4.totalInterest; // F72
  const s4 = {
    refiPrincipal,
    arrangementFee: refiFeeRolled,
    extraInterest: sd4.totalInterest, // F71
    netProfit: netProfit4,
    benefitVsS2: netProfit4 - netProfit2, // F73
    investorProfit: netProfit4 * f.equity.investorShare, // F74
    investorRoi: investorEquity === 0 ? 0 : (netProfit4 * f.equity.investorShare) / investorEquity, // F75
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

  // Grid 1: C8 = GDV*(1+p)*(1-agent) - legalPerUnit*units - F4
  const grid1 = GRID1_MOVES.map((p) => {
    const netProfit = totals.gdv * (1 + p) * (1 - f.sales.agentFeePct) - f.sales.legalPerUnit * totals.units - fixedCostBase;
    return {
      priceMove: p,
      netProfit,
      profitOnGdv: totals.gdv === 0 ? 0 : netProfit / (totals.gdv * (1 + p)),
    };
  });

  // Grid 2: C17 = C8(p) - C40*(devRate/12)*(MIN(ceil(units/vel), ceil(C40/max(1, monthlyNet(p,vel))))+1)/2
  const grid2 = GRID1_MOVES.map((p, i) => {
    const base = grid1[i].netProfit;
    return {
      priceMove: p,
      profits: GRID2_VELOCITIES.map((vel) => {
        const monthlyNet =
          vel * ((totals.gdv * (1 + p)) / Math.max(totals.units, 1)) * (1 - f.sales.agentFeePct) - vel * f.sales.legalPerUnit;
        const monthsSellOut = Math.ceil(totals.units / vel);
        const monthsRepay = Math.ceil(fin.devPayoffAtPC / Math.max(1, monthlyNet));
        const months = Math.min(monthsSellOut, monthsRepay);
        const netProfit = base - fin.devPayoffAtPC * (f.devLoan.ratePa / 12) * ((months + 1) / 2);
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
  const dev = computeDevCosts(spec, totals, roomAreas);
  const prog = programmeOf(f, totals);
  const { rows, finance } = computeCashflow(f, dev, prog, totals);
  const scenarios = computeScenarios(f, totals, dev, finance, prog);
  const sensitivity = computeSensitivity(f, totals, dev, finance, scenarios);

  const warnings: string[] = [];
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
