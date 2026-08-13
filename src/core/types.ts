// Core domain types shared across the layout engine, compliance validator,
// DCF appraisal engine and UI.

export type UnitTypeKey =
  | 'studio_1p'
  | '1bed_2p'
  | '2bed_3p'
  | '2bed_4p'
  | '3bed_4p'
  | '3bed_5p'
  | '3bed_6p';

export type MixStrategy = 'max_units' | 'balanced' | 'family';

export interface Point {
  x: number;
  y: number;
}

export interface WindowPos {
  x: number;
  side: 'front' | 'rear';
}

export interface Core {
  type: string; // 'stair' | 'lift' | 'core'
  poly: [number, number][];
}

/** One floor of the existing building, in metres, long axis on x. */
export interface Envelope {
  id: string;
  floor: string; // 'G', '1', '2'...
  label?: string;
  use: 'residential' | 'commercial' | 'mixed' | 'unknown';
  envelope: [number, number][];
  cores: Core[];
  windows: WindowPos[];
  note?: string;
  /** Confidence / assumptions recorded during AI or manual extraction. */
  assumptions?: string[];
}

export interface Room {
  type: 'bedroom' | 'kitchen_living' | 'living' | 'kitchen' | 'bathroom' | 'hall';
  name: string;
  x: number;
  w: number;
  d: number;
  area: number;
  window: boolean;
}

export interface PlannedUnit {
  no: number;
  name: string;
  type: UnitTypeKey;
  label: string;
  persons: number;
  beds: number;
  side: 'front' | 'rear';
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  giaSqm: number;
  windows: number[];
  rooms: Room[];
}

export interface FloorPlanResult {
  floor: string;
  strategy: MixStrategy | 'floor_through' | 'whole_house' | 'as_existing';
  floorGiaSqm: number;
  coreSqm: number;
  corridor: { y0: number; y1: number } | null;
  niaSqm: number;
  netToGross: number;
  units: PlannedUnit[];
}

export interface ComplianceIssue {
  unitNo: number;
  message: string;
}

export interface UnitCompliance {
  unitNo: number;
  pass: boolean;
  issues: string[];
}

export interface FloorCompliance {
  floor: string;
  netToGrossNote: string | null;
  units: UnitCompliance[];
  allPass: boolean;
}

/** A floor kept in its existing (e.g. commercial) use within an option. */
export interface RetainedFloor {
  floor: string;
  use: string;
  sqm: number;
}

/** A whole-building conversion option: one plan per floor plus derived schedule. */
export interface ConversionOption {
  id: string;
  title: string;
  mode: ConversionMode;
  strategy: FloorPlanResult['strategy'];
  description: string;
  floors: FloorPlanResult[];
  /** Floors kept in existing (e.g. commercial) use. */
  retained: RetainedFloor[];
  compliance: FloorCompliance[];
  allCompliant: boolean;
  warnings: string[];
  schedule: ScheduleRow[];
  totals: {
    units: number;
    residentialUnits: number;
    niaSqm: number;
    niaSqft: number;
    gdv: number;
    monthlyRent: number;
  };
}

export type ConversionMode =
  | 'full_residential' // every floor converted to flats
  | 'mixed_ground_commercial' // ground stays commercial, uppers converted
  | 'floor_through' // one lateral apartment per floor
  | 'whole_house'; // entire building merged into one dwelling

/** One row of the unit schedule — mirrors '1. Unit Import' in the workbook. */
export interface ScheduleRow {
  no: number;
  name: string;
  floor: string;
  type: string; // 'Studio' | '1 bed' | '2 bed' | '3 bed' | 'Commercial' | 'House'
  sqm: number;
  sqft: number;
  salePsf: number;
  unitGdv: number;
  buildMonths: number;
  monthlyRent: number;
  notes: string;
}

// ---------------------------------------------------------------------------
// Pricing specification
// ---------------------------------------------------------------------------

export interface UnitPricing {
  salePsf: number; // £ per sqft
  monthlyRentPsf: number; // £ per sqft per month
}

export interface PricingSpec {
  name: string;
  /** £psf sale and rent rates by unit category. */
  rates: {
    commercial: UnitPricing;
    studio: UnitPricing;
    bed1: UnitPricing;
    bed2: UnitPricing;
    bed3: UnitPricing;
    house: UnitPricing;
  };
  /** Build programme: months for lowest converted floor, + increment per floor above. */
  build: {
    baseMonths: number;
    perFloorMonths: number;
    commercialMonths: number;
  };
  finance: FinanceInputs;
  devCosts: DevCostLine[];
}

export interface FinanceInputs {
  purchasePrice: number;
  purchaseDate: string; // ISO yyyy-mm
  giaSqft: number; // gross internal area of whole building
  legalMonths: number; // '2. Inputs' E10
  preConMonths: number; // E11
  bridge: {
    ltv: number; // E17
    ratePa: number; // E18
    arrangementFee: number; // E19
    exitFee: number; // E20
  };
  devLoan: {
    ratePa: number; // E25
    arrangementFee: number; // E26
    exitFee: number; // E27
    maxLtgdv: number; // E28
  };
  equity: {
    total: number; // E33
    investorShare: number; // E34
  };
  sales: {
    agentFeePct: number; // E40
    legalPerUnit: number; // E41
    velocityPerMonth: number; // E42
    priceAdjust: number; // E43
  };
  refinance: {
    ltv: number; // E46
    ratePa: number; // E47
    arrangementFee: number; // E48
    voidPct: number; // E49
    mgmtPct: number; // E50
  };
}

export type DevCostKind =
  | 'fixed' // value = £ amount
  | 'pctPurchase' // value = rate x purchase price
  | 'pctBuild' // value = rate x build cost (line D01)
  | 'perUnit' // value = £ x unit count
  | 'pctGDV' // value = rate x GDV
  | 'salesLegalPerUnit'; // value ignored; uses finance.sales.legalPerUnit x units

export type DevCostGroup =
  | 'legals' // (B)
  | 'professional' // (C)
  | 'construction' // (D)
  | 'duringConstruction' // (E)
  | 'postConstruction' // (F)
  | 'salesMarketing' // (G)
  | 'other'; // (H)

export interface DevCostLine {
  code: string;
  group: DevCostGroup;
  label: string;
  kind: DevCostKind;
  value: number;
}

// ---------------------------------------------------------------------------
// DCF results
// ---------------------------------------------------------------------------

export interface DevCostsComputed {
  purchase: number; // (A)
  groups: Record<DevCostGroup, { lines: { code: string; label: string; amount: number }[]; total: number }>;
  totalPreFinance: number; // '3. Dev Costs' F87
  buildCost: number; // line D01 amount (for psf metric)
}

export interface MonthRow {
  month: number;
  costs: number;
  cumCosts: number;
  bridgeInterest: number;
  bridgeBalance: number;
  bridgeRedemption: number;
  equityCum: number;
  equityMonth: number;
  devDrawdown: number;
  devInterest: number;
  devBalance: number;
  fundingGap: boolean;
}

export interface FinanceSummary {
  bridgeAdvance: number;
  bridgeArrangementFee: number;
  bridgeInterestTotal: number;
  bridgeExitFee: number;
  bridgeRedemptionTotal: number;
  devFacilityEstimate: number;
  devArrangementFee: number;
  devInterestTotal: number;
  devBalanceAtPC: number;
  devExitFee: number;
  devPayoffAtPC: number;
  peakDevBalance: number;
  ltgdvAtPeak: number;
  ltgdvOk: boolean;
  totalFinanceCosts: number;
  totalCostsAfterFinance: number;
  equityUsed: number;
}

export interface ScenarioResults {
  s1: {
    gdvAdjusted: number;
    netProfit: number;
    profitOnCost: number;
    profitOnGdv: number;
    investorProfit: number;
    developerProfit: number;
    investorRoi: number;
    durationMonths: number;
    investorRoiPa: number;
  };
  s2: {
    monthsToSellOut: number;
    monthsToRepay: number | '36+';
    extraInterest: number;
    netProfit: number;
    investorProfit: number;
    investorRoi: number;
    totalDurationMonths: number;
  };
  s3: {
    mortgageAdvance: number;
    arrangementFee: number;
    devPayoff: number;
    surplusReleased: number;
    grossAnnualRent: number;
    netAnnualRent: number;
    annualInterest: number;
    netAnnualCashflow: number;
    interestCover: number;
    equityRemaining: number;
    cashOnCash: number;
    unrealisedProfit: number;
  };
  s4: {
    refiPrincipal: number;
    arrangementFee: number;
    extraInterest: number;
    netProfit: number;
    benefitVsS2: number;
    investorProfit: number;
    investorRoi: number;
  };
}

export interface SensitivityResults {
  fixedCostBase: number;
  /** Grid 1: price movement -> S1 net profit & profit on GDV. */
  grid1: { priceMove: number; netProfit: number; profitOnGdv: number }[];
  /** Grid 2: price movement x sales velocity -> approx S2 net profit. */
  grid2: { priceMove: number; profits: { velocity: number; netProfit: number }[] }[];
  grid2Velocities: number[];
  /** Grid 3: refi rate x LTV -> net annual cashflow. */
  grid3: { rate: number; cells: { ltv: number; cashflow: number }[] }[];
  grid3Ltvs: number[];
}

export interface AppraisalResult {
  schedule: ScheduleRow[];
  totals: {
    units: number;
    niaSqft: number;
    gdv: number;
    avgPsf: number;
    maxBuildMonths: number;
    monthlyRent: number;
    grossAnnualRent: number;
  };
  programme: {
    legalMonths: number;
    preConMonths: number;
    conMonths: number;
    conStartMonth: number;
    pcMonth: number;
  };
  devCosts: DevCostsComputed;
  cashflow: MonthRow[];
  finance: FinanceSummary;
  scenarios: ScenarioResults;
  sensitivity: SensitivityResults;
}

// ---------------------------------------------------------------------------
// Project file
// ---------------------------------------------------------------------------

export interface Project {
  version: 1;
  name: string;
  address: string;
  createdAt: string;
  listedOrConservation: boolean;
  floors: Envelope[];
  pricing: PricingSpec;
  /** id of option adopted for export, if any */
  adoptedOptionId?: string;
}
