// The payload the workbook export is built from.
//
// This lives outside the view on purpose. Both halves of an export — the
// '2. Inputs' / '3. Dev Costs' figures and the '7. App Model v2' sheet — must
// be derived from the SAME spec the on-screen appraisal was computed from,
// which is the SANITIZED spec (`sanitizeSpec`), never the raw project spec.
// Taking the spec as a parameter here means there is no code path that can
// reach the unrepaired one: a repair reported in the audit strip (a 450%
// bridge rate clamped to 50%, say) is guaranteed to be the figure the
// workbook carries.

import type { AppraisalResult, FinanceInputs, PricingSpec } from './types';

/** Finance + cost-line figures written into the template's own sheets.
 *  Spelt out as FinanceInputs & extras rather than an index signature, so the
 *  exporter's own `InputsIn` contract is checked at compile time. */
export type ExportInputs = FinanceInputs & {
  address: string;
  devCostLines: {
    code: string;
    kind: string;
    value: number;
    label: string;
    whenIncurred: string;
    /** The £ figure the engine computed, when a result was available. */
    amount?: number;
  }[];
  buildCostOverride: number | null;
};

export function buildExportInputs(args: {
  address: string;
  spec: PricingSpec;
  result: AppraisalResult | null;
}): ExportInputs {
  const { address, spec, result } = args;
  const computedAmounts = new Map<string, number>();
  if (result) {
    for (const group of Object.values(result.devCosts.groups)) {
      for (const line of group.lines) computedAmounts.set(line.code, line.amount);
    }
  }
  return {
    address,
    ...spec.finance,
    // The computed amount travels with each line, so a kind the workbook has no
    // cell shape for (the time-based holding lines) can still be written as a £
    // amount instead of silently leaving the template's own figure in place.
    devCostLines: spec.devCosts.map((l) => ({
      code: l.code,
      kind: l.kind,
      value: l.value,
      label: l.label,
      whenIncurred: l.whenIncurred ?? 'always',
      amount: computedAmounts.get(l.code),
    })),
    // ALWAYS the contract sum the engine actually used, whatever made it differ
    // from the typed D01 — room-rate costing, tender-price inflation, or both.
    // Gating this on the room-rate mode alone left `fixed` mode with inflation
    // on writing the typed figure while the model used the indexed one (a
    // £72,788 gap on the demo at 4% pa) — the same export/screen divergence as
    // finding 9. In fixed mode with inflation off the two are equal, so
    // writing it unconditionally is a no-op there.
    buildCostOverride: result ? result.devCosts.buildCost : null,
  };
}

/** The '7. App Model v2' sheet: what the appraisal screen shows, verbatim. */
export interface ModelV2Payload {
  assumptions: string[];
  summary: [string, string | number][];
  scenarios: [string, string | number][];
  cashflow: {
    month: number;
    costs: number;
    cumCosts: number;
    vatFlow: number;
    retentionBalance: number;
    bridgeBalance: number;
    equityCum: number;
    devDrawdown: number;
    devInterest: number;
    devBalance: number;
  }[];
}

export function buildModelV2(spec: PricingSpec, result: AppraisalResult): ModelV2Payload {
  const fin = spec.finance;
  const pct = (v: number, dp = 1) => `${(v * 100).toFixed(dp)}%`;
  return {
    assumptions: [
      'Bridge advances against the purchase price only; SDLT, legals, valuation and design fees paid from equity',
      'SDLT paid on completion (month 1)',
      'Main contract drawn on a standard S-curve; architect & QS fees straight-lined to PC',
      `Retention: ${pct(fin.retention.pctDuringWorks)} withheld, ${pct(fin.retention.pctAfterPc)} held ${fin.retention.releaseMonthsAfterPc} months after PC`,
      'Post-construction holding costs straight-lined over the sell period',
      fin.vat.optedToTax
        ? `VAT on purchase at ${pct(fin.vat.ratePct, 0)}, reclaimed after ${fin.vat.reclaimLagMonths} months, funded by ${fin.vat.fundedBy === 'vatLoan' ? 'VAT loan' : 'equity'}`
        : 'No VAT on purchase (seller not opted to tax)',
      `Deposit interest at ${pct(fin.depositRatePa, 2)} pa on cash held`,
      fin.hpi.enabled
        ? `HPI applied: years 1-5 at ${fin.hpi.annualPct.map((r) => pct(r)).join(', ')}${fin.hpi.region ? ` (${fin.hpi.region})` : ''}`
        : 'HPI off: sale prices as entered',
      fin.buildInflation.enabled
        ? `Tender-price inflation ${pct(fin.buildInflation.annualPct)} pa on the main contract: priced at ${pct(result.devCosts.buildInflationFactor - 1)} above today's money (other cost lines in today's money)`
        : 'Tender-price inflation off: build cost at today’s money',
      fin.waterfall.mode === 'waterfall'
        ? `Waterfall: ${pct(fin.waterfall.prefRatePa)} pref (monthly compounding), then ${pct(fin.waterfall.residualInvestorPct, 0)} investor`
        : `Simple profit split: ${pct(fin.equity.investorShare, 0)} investor`,
      'Sales pacing uniform across units',
    ],
    summary: [
      ['GDV (today)', Math.round(result.totals.gdv)],
      ['GDV indexed to PC', Math.round(result.scenarios.s1.gdvAdjusted)],
      ['Build cost (today)', Math.round(result.devCosts.buildCostToday)],
      ['Build cost (indexed to certificate months)', Math.round(result.devCosts.buildCost)],
      ['Total costs pre-finance', Math.round(result.devCosts.totalPreFinance)],
      ['Total finance costs', Math.round(result.finance.totalFinanceCosts)],
      ['Deposit interest on retention pot', Math.round(result.finance.depositInterestRetention)],
      ['Total costs after finance', Math.round(result.finance.totalCostsAfterFinance)],
      ['Peak dev loan', Math.round(result.finance.peakDevBalance)],
      ['Peak equity deployed', Math.round(result.finance.equityUsed)],
      ['Months to PC', result.programme.pcMonth],
    ],
    scenarios: [
      ['S1 net profit (sell at PC)', Math.round(result.scenarios.s1.netProfit)],
      [
        'S1 investor / developer',
        `${Math.round(result.scenarios.s1.waterfall.investorProfit)} / ${Math.round(result.scenarios.s1.waterfall.developerProfit)}`,
      ],
      ['S2 net profit (delayed sales)', Math.round(result.scenarios.s2.netProfit)],
      ['S2 HPI uplift on later sales', Math.round(result.scenarios.s2.hpiUplift)],
      ['S3 net annual cashflow (refi & rent)', Math.round(result.scenarios.s3.netAnnualCashflow)],
      ['S4 net profit (refi then sell)', Math.round(result.scenarios.s4.netProfit)],
    ],
    cashflow: result.cashflow
      .filter(
        (r) =>
          Math.abs(r.costs) > 0.005 || r.devBalance > 0 || r.retentionBalance > 0 || r.vatPaid > 0 || r.vatReclaimed > 0,
      )
      .map((r) => ({
        month: r.month,
        costs: r.costs,
        cumCosts: r.cumCosts,
        vatFlow: r.vatReclaimed - r.vatPaid,
        retentionBalance: r.retentionBalance,
        bridgeBalance: r.bridgeBalance,
        equityCum: r.equityCum,
        devDrawdown: r.devDrawdown,
        devInterest: r.devInterest,
        devBalance: r.devBalance,
      })),
  };
}
