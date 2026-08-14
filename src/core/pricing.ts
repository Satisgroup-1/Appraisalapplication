// Pricing specification: sale/rent rates, build programme and the full
// finance + development-cost parameter set. Defaults reproduce
// Appraisal_Model_1.xlsx ('2. Inputs' and '3. Dev Costs').

import type { DevCostLine, FinanceInputs, PricingSpec } from './types';

export const DEFAULT_DEV_COSTS: DevCostLine[] = [
  // (B) LEGALS & ACQUISITION
  { code: 'B01', group: 'legals', label: 'Purchase legals (solicitor)', kind: 'fixed', value: 7500 },
  { code: 'B02', group: 'legals', label: 'Searches, title indemnity & surveys', kind: 'fixed', value: 2500 },
  { code: 'B03', group: 'legals', label: 'Valuation report', kind: 'fixed', value: 1500 },
  { code: 'B04', group: 'legals', label: 'Stamp Duty (SDLT)', kind: 'fixed', value: 87000 },
  { code: 'B05', group: 'legals', label: 'Sourcing fee', kind: 'pctPurchase', value: 0.01 },
  { code: 'B06', group: 'legals', label: 'Agent commission', kind: 'pctPurchase', value: 0.005 },
  { code: 'B07', group: 'legals', label: 'Legal contingency', kind: 'fixed', value: 1500 },
  { code: 'B08', group: 'legals', label: 'Other', kind: 'fixed', value: 2000 },
  // (C) PROFESSIONAL FEES (pre-construction)
  { code: 'C01', group: 'professional', label: 'Architect fees', kind: 'fixed', value: 42500 },
  { code: 'C02', group: 'professional', label: 'Planning consultant', kind: 'fixed', value: 10700 },
  { code: 'C03', group: 'professional', label: 'Structural engineer', kind: 'fixed', value: 15650 },
  { code: 'C04', group: 'professional', label: 'Building control', kind: 'fixed', value: 7300 },
  { code: 'C05', group: 'professional', label: 'M&E engineer', kind: 'fixed', value: 10000 },
  { code: 'C06', group: 'professional', label: 'Surveys (measured / asbestos / noise / drainage / roof)', kind: 'fixed', value: 13000 },
  { code: 'C07', group: 'professional', label: 'Fire engineer', kind: 'fixed', value: 15650 },
  { code: 'C08', group: 'professional', label: 'Principal designer role', kind: 'fixed', value: 3000 },
  { code: 'C09', group: 'professional', label: 'Party wall surveyor', kind: 'fixed', value: 5000 },
  { code: 'C10', group: 'professional', label: 'Building insurance (pre-construction)', kind: 'fixed', value: 7500 },
  { code: 'C11', group: 'professional', label: 'Planning conditions & other reports', kind: 'fixed', value: 10000 },
  { code: 'C12', group: 'professional', label: 'Other', kind: 'fixed', value: 10000 },
  // (D) DEVELOPMENT / CONSTRUCTION COSTS
  { code: 'D01', group: 'construction', label: 'Build cost (main contract)', kind: 'fixed', value: 2305099 },
  { code: 'D02', group: 'construction', label: 'Utilities (connections etc.)', kind: 'fixed', value: 40000 },
  { code: 'D03', group: 'construction', label: "Employer's agent", kind: 'fixed', value: 60000 },
  { code: 'D04', group: 'construction', label: 'Project management', kind: 'fixed', value: 20000 },
  { code: 'D05', group: 'construction', label: 'Quantity surveyor', kind: 'fixed', value: 33000 },
  { code: 'D06', group: 'construction', label: 'Health & safety consultant', kind: 'fixed', value: 2850 },
  { code: 'D07', group: 'construction', label: 'Interior designer', kind: 'fixed', value: 20000 },
  { code: 'D08', group: 'construction', label: 'Contingency (% of build)', kind: 'pctBuild', value: 0.05 },
  { code: 'D09', group: 'construction', label: 'Demolition & site clearance (% of build)', kind: 'pctBuild', value: 0.015 },
  { code: 'D10', group: 'construction', label: '10-yr structural warranty (per unit)', kind: 'perUnit', value: 1200 },
  { code: 'D11', group: 'construction', label: 'Roof / basement warranties', kind: 'fixed', value: 3000 },
  { code: 'D12', group: 'construction', label: 'Other', kind: 'fixed', value: 20000 },
  // (E) DURING CONSTRUCTION (site running costs)
  { code: 'E01', group: 'duringConstruction', label: 'Electricity supply', kind: 'fixed', value: 9000 },
  { code: 'E02', group: 'duringConstruction', label: 'Water supply', kind: 'fixed', value: 6000 },
  { code: 'E03', group: 'duringConstruction', label: 'Security', kind: 'fixed', value: 3000 },
  { code: 'E04', group: 'duringConstruction', label: 'Internet', kind: 'fixed', value: 400 },
  { code: 'E05', group: 'duringConstruction', label: 'Building insurance during works', kind: 'fixed', value: 15000 },
  { code: 'E06', group: 'duringConstruction', label: 'Other', kind: 'fixed', value: 5000 },
  // (F) POST CONSTRUCTION (holding costs at PC)
  { code: 'F01', group: 'postConstruction', label: 'Council tax', kind: 'fixed', value: 3300 },
  { code: 'F02', group: 'postConstruction', label: 'Utilities post-completion', kind: 'fixed', value: 2750 },
  { code: 'F03', group: 'postConstruction', label: 'Buildings insurance', kind: 'fixed', value: 2500 },
  { code: 'F04', group: 'postConstruction', label: 'Other', kind: 'fixed', value: 5000 },
  // (G) SALES & MARKETING
  { code: 'G01', group: 'salesMarketing', label: 'Show apartment', kind: 'fixed', value: 20000 },
  { code: 'G02', group: 'salesMarketing', label: 'Marketing materials & brochure', kind: 'fixed', value: 10000 },
  { code: 'G03', group: 'salesMarketing', label: 'Sales agent fees (% of GDV)', kind: 'pctGDV', value: 0 }, // rate taken from finance.sales.agentFeePct
  { code: 'G04', group: 'salesMarketing', label: 'Sales legals (per unit)', kind: 'salesLegalPerUnit', value: 0 },
  { code: 'G05', group: 'salesMarketing', label: 'Photography & video', kind: 'fixed', value: 6000 },
  { code: 'G06', group: 'salesMarketing', label: 'Other', kind: 'fixed', value: 5000 },
  // (H) OTHER / SPV RUNNING COSTS
  { code: 'H01', group: 'other', label: 'Admin fee', kind: 'fixed', value: 7500 },
  { code: 'H02', group: 'other', label: 'Company set-up & SPV shareholder legals', kind: 'fixed', value: 2100 },
  { code: 'H03', group: 'other', label: 'Tax advisor', kind: 'fixed', value: 750 },
  { code: 'H04', group: 'other', label: 'Book keeper', kind: 'fixed', value: 3000 },
  { code: 'H05', group: 'other', label: 'Bank charges', kind: 'fixed', value: 510 },
  { code: 'H06', group: 'other', label: 'Accountancy fees', kind: 'fixed', value: 600 },
  { code: 'H07', group: 'other', label: 'CIS submissions', kind: 'fixed', value: 1200 },
  { code: 'H08', group: 'other', label: 'Contingency', kind: 'fixed', value: 5000 },
];

export const DEFAULT_FINANCE: FinanceInputs = {
  purchasePrice: 1950000,
  purchaseDate: '2026-08',
  giaSqft: 11586,
  legalMonths: 2,
  preConMonths: 3,
  // VAT applies only when the seller has opted the property to tax: pay on
  // completion, reclaim ~2 months later.
  vat: {
    optedToTax: false,
    ratePct: 0.2,
    reclaimLagMonths: 2,
    fundedBy: 'equity',
    vatLoan: { ratePa: 0.1, arrangementFee: 0.015 },
  },
  // 3% withheld from contractor certificates; half released at PC, half held
  // 12 months for the defects period.
  retention: { pctDuringWorks: 0.03, pctAfterPc: 0.015, releaseMonthsAfterPc: 12 },
  depositRatePa: 0.035,
  hpi: { enabled: false, annualPct: [0.03, 0.03, 0.03, 0.03, 0.03] },
  // Current deals are a straight 50/50 with no pref; the waterfall option is
  // ready for deals with a preferred return.
  waterfall: { mode: 'simple', prefRatePa: 0.08, residualInvestorPct: 0.5 },
  bridge: { ltv: 0.65, ratePa: 0.1, arrangementFee: 0.02, exitFee: 0.01 },
  devLoan: { ratePa: 0.085, arrangementFee: 0.015, exitFee: 0.01, maxLtgdv: 0.65 },
  equity: { total: 1400000, investorShare: 0.5 },
  sales: { agentFeePct: 0.015, legalPerUnit: 750, velocityPerMonth: 2, priceAdjust: 0 },
  refinance: { ltv: 0.65, ratePa: 0.055, arrangementFee: 0.01, voidPct: 0.05, mgmtPct: 0.15 },
};

/**
 * Default build £/sqft by room type. Wet rooms carry sanitaryware/tiling/
 * ventilation cost; living/kitchen includes the kitchen fit-out; circulation
 * covers common corridors and retained cores; commercial is a shell-and-core
 * allowance for retained commercial floors. Editable per preset.
 */
export const DEFAULT_ROOM_RATES = {
  kitchenLiving: 200,
  bedroom: 150,
  bathroom: 400,
  hallStorage: 140,
  circulation: 110,
  commercial: 90,
};

/**
 * Default pricing preset. Sale £psf / rent rates derived from the demo unit
 * schedule in Appraisal_Model_1 (2-beds averaging ~£630psf, commercial at
 * ~£254psf, rents ~£2.0-2.2/sqft/month).
 */
export const DEFAULT_PRICING: PricingSpec = {
  name: 'Appraisal Model 1 defaults',
  rates: {
    commercial: { salePsf: 254, monthlyRentPsf: 1.74 },
    studio: { salePsf: 640, monthlyRentPsf: 2.4 },
    bed1: { salePsf: 635, monthlyRentPsf: 2.25 },
    bed2: { salePsf: 630, monthlyRentPsf: 2.05 },
    bed3: { salePsf: 615, monthlyRentPsf: 1.9 },
    house: { salePsf: 600, monthlyRentPsf: 1.7 },
  },
  build: { baseMonths: 10, perFloorMonths: 1, commercialMonths: 6 },
  buildCostMode: 'roomRates',
  roomRates: DEFAULT_ROOM_RATES,
  finance: DEFAULT_FINANCE,
  devCosts: DEFAULT_DEV_COSTS,
};

export function clonePricing(p: PricingSpec): PricingSpec {
  return JSON.parse(JSON.stringify(p));
}

/** Fill gaps in a pricing spec loaded from an older project/preset file. */
export function normalizePricing(p: Partial<PricingSpec>): PricingSpec {
  const base = clonePricing(DEFAULT_PRICING);
  const fin = (p.finance ?? {}) as Partial<FinanceInputs>;
  return {
    ...base,
    ...p,
    rates: { ...base.rates, ...(p.rates ?? {}) },
    build: { ...base.build, ...(p.build ?? {}) },
    buildCostMode: p.buildCostMode ?? 'fixed', // old files priced from fixed D01
    roomRates: { ...base.roomRates, ...(p.roomRates ?? {}) },
    // Deep-merge nested finance blocks so files saved before a block existed
    // (vat, retention, hpi, waterfall) pick up complete defaults.
    finance: {
      ...base.finance,
      ...fin,
      vat: { ...base.finance.vat, ...(fin.vat ?? {}), vatLoan: { ...base.finance.vat.vatLoan, ...(fin.vat?.vatLoan ?? {}) } },
      retention: { ...base.finance.retention, ...(fin.retention ?? {}) },
      hpi: { ...base.finance.hpi, ...(fin.hpi ?? {}) },
      waterfall: { ...base.finance.waterfall, ...(fin.waterfall ?? {}) },
      bridge: { ...base.finance.bridge, ...(fin.bridge ?? {}) },
      devLoan: { ...base.finance.devLoan, ...(fin.devLoan ?? {}) },
      equity: { ...base.finance.equity, ...(fin.equity ?? {}) },
      sales: { ...base.finance.sales, ...(fin.sales ?? {}) },
      refinance: { ...base.finance.refinance, ...(fin.refinance ?? {}) },
    },
    devCosts: p.devCosts ?? base.devCosts,
  };
}

/** Map a schedule unit type label to a pricing rate category. */
export function rateFor(spec: PricingSpec, typeLabel: string) {
  switch (typeLabel) {
    case 'Commercial':
      return spec.rates.commercial;
    case 'Studio':
      return spec.rates.studio;
    case '1 bed':
      return spec.rates.bed1;
    case '2 bed':
      return spec.rates.bed2;
    case '3 bed':
      return spec.rates.bed3;
    case 'House':
      return spec.rates.house;
    default:
      return spec.rates.bed2;
  }
}
