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
  /** Low-y edge. Habitable rooms take the window wall, bathroom and hall the
   *  strip against the corridor; recorded rather than re-derived downstream. */
  y: number;
  d: number;
  /** Floor area INSIDE the envelope: the drawn rectangle clipped to the
   *  building, so a room overhanging a notch is measured at its real size. */
  area: number;
  /** Clipped footprint, present only where the drawn rectangle is not wholly
   *  inside the envelope. Absent on the common rectangular floor. */
  outline?: [number, number][];
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
  /** GIA INSIDE the envelope. The layout engine proposes axis-aligned
   *  rectangles on the bounding box; this is that rectangle clipped to the
   *  building, so a non-rectangular floor cannot report more net area than it
   *  physically has. */
  giaSqm: number;
  /** Clipped footprint, present only where the unit rectangle overhangs the
   *  envelope. Absent on the common rectangular floor. */
  outline?: [number, number][];
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
  /** Requirements that cannot be verified from schematic geometry — always
   *  surfaced so the report never silently implies they were checked. */
  advisories: string[];
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
  /** Floor areas by room type, used for room-rate build costing. */
  roomAreas: RoomAreas;
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

/** Build cost £/sqft by room type — drives line D01 when buildCostMode = 'roomRates'. */
export interface RoomRates {
  kitchenLiving: number; // open-plan living/kitchen (includes kitchen fit-out)
  bedroom: number;
  bathroom: number; // sanitaryware, tiling, ventilation
  hallStorage: number;
  circulation: number; // common corridors, retained cores, landlord areas
  commercial: number; // retained commercial shell & core / fit-out allowance
}

/** Floor areas by room type for one conversion option (sqm). */
export interface RoomAreas {
  kitchenLivingSqm: number;
  bedroomSqm: number;
  bathroomSqm: number;
  hallStorageSqm: number;
  circulationSqm: number;
  commercialSqm: number;
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
  /**
   * How build cost (dev cost line D01) is derived:
   *  - 'roomRates': from the option's room-type areas x roomRates £/sqft
   *    (falls back to the fixed D01 amount when no room data is available,
   *    e.g. a hand-entered schedule).
   *  - 'fixed': always the D01 line amount.
   */
  buildCostMode: 'fixed' | 'roomRates';
  roomRates: RoomRates;
  finance: FinanceInputs;
  devCosts: DevCostLine[];
}

/** VAT on the purchase when the seller has opted the property to tax. */
export interface VatInputs {
  optedToTax: boolean;
  ratePct: number; // 0.20
  /** Months between completion and the reclaim landing (typically 2). */
  reclaimLagMonths: number;
  /** 'equity': paid from cash and recovered at reclaim. 'vatLoan': a short
   *  VAT facility funds it; only its fee + interest are a real cost. */
  fundedBy: 'equity' | 'vatLoan';
  vatLoan: { ratePa: number; arrangementFee: number };
}

/** Contractor retention held against the main contract (D01). */
export interface RetentionInputs {
  /** Withheld from each certificate during the works (e.g. 3%). */
  pctDuringWorks: number;
  /** Portion still held after PC for the defects period (e.g. 1.5%);
   *  the difference is released at PC. */
  pctAfterPc: number;
  /** Defects period length; the final release lands this many months after PC. */
  releaseMonthsAfterPc: number;
}

/** Forward house price inflation applied to sale prices by sale month. */
export interface HpiInputs {
  enabled: boolean;
  /** Annual rates for years 1..N from purchase (decimals); the last rate
   *  persists beyond the array. */
  annualPct: number[];
  region?: string;
  rationale?: string;
  sources?: string[];
  projectedAt?: string; // ISO date the projection was produced
}

/**
 * Forward tender-price inflation applied to the main contract (line D01).
 *
 * The build cost the user enters — a fixed D01 or the room-rate table — is
 * TODAY'S money, exactly as sale £psf are today's values. HPI carries revenue
 * forward to completion; without this, cost stayed frozen at today's prices and
 * simply lengthening the programme manufactured profit (AUDIT.md §6.4).
 *
 * Deliberately INDEPENDENT of `HpiInputs`: tender prices and house prices are
 * driven by different things (labour and materials vs. mortgage rates and
 * supply) and routinely move in opposite directions, so one rate cannot serve
 * both.
 */
export interface BuildInflationInputs {
  enabled: boolean;
  /** Annual tender-price inflation as a decimal, compounded monthly from the
   *  purchase to each certificate's month. */
  annualPct: number;
  region?: string;
  rationale?: string;
  sources?: string[];
  projectedAt?: string; // ISO date the projection was produced
}

/** How stamp duty (dev cost line B04) is derived. */
export interface SdltInputs {
  /** 'nonResidential': commercial/mixed-use bands (the usual purchase here).
   *  'residentialCompany': residential main rates + company surcharge.
   *  'manual': keep the typed B04 figure (solicitor's number). */
  regime: 'nonResidential' | 'residentialCompany' | 'manual';
}

/** How profit is shared between investor and developer. */
export interface WaterfallInputs {
  /** 'simple': profit x investorShare (current 50/50 deals).
   *  'waterfall': capital back, then preferred return, then residual split. */
  mode: 'simple' | 'waterfall';
  /** Preferred return on drawn investor capital, compounded monthly. */
  prefRatePa: number;
  /** Investor share of profit above the pref. */
  residualInvestorPct: number;
}

export interface FinanceInputs {
  purchasePrice: number;
  purchaseDate: string; // ISO yyyy-mm
  giaSqft: number; // gross internal area of whole building
  legalMonths: number; // '2. Inputs' E10
  preConMonths: number; // E11
  vat: VatInputs;
  sdlt: SdltInputs;
  retention: RetentionInputs;
  /** Interest earned on cash held (retention pot, sale surpluses). */
  depositRatePa: number;
  hpi: HpiInputs;
  /** Tender-price inflation on the main contract. Set independently of hpi. */
  buildInflation: BuildInflationInputs;
  waterfall: WaterfallInputs;
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
  | 'salesLegalPerUnit' // value ignored; uses finance.sales.legalPerUnit x units
  // Time-based holding costs. A lump sum cannot represent council tax,
  // insurance or standing charges on unsold stock: those run for as long as the
  // stock is held, and a lump made a 24-month sell-down cost the same as a
  // 3-month one (AUDIT.md §6.5).
  | 'perMonthHeld' // value = £ per month x months held after PC
  | 'perUnitPerMonthHeld' // value = £ per unit per month x units x months held
  | 'pctAnnualRent'; // value = rate x gross annual rent (letting fees)

export type DevCostGroup =
  | 'legals' // (B)
  | 'professional' // (C)
  | 'construction' // (D)
  | 'duringConstruction' // (E)
  | 'postConstruction' // (F)
  | 'salesMarketing' // (G)
  | 'other' // (H)
  | 'letting'; // (I) incurred only when the scheme is let rather than sold

/**
 * Which exits a cost line is incurred in.
 *
 * Without this every scenario paid every cost: the refinance-and-hold case was
 * charged the full sales & marketing group — £143,723 on the demo, £93,723 of it
 * agent fees on a sale that never happens — while carrying no letting costs at
 * all (AUDIT.md §6.5). Defaults to 'always' when absent, so a spec or project
 * file written before this existed behaves exactly as it did.
 */
export type CostIncidence =
  | 'always' // incurred whatever happens to the scheme
  | 'onSale' // only if the units are sold (agent fees, sales legals, show flat)
  | 'onLet'; // only if the units are let (letting fees, EPCs, furnishing)

export interface DevCostLine {
  code: string;
  group: DevCostGroup;
  label: string;
  kind: DevCostKind;
  value: number;
  /** Defaults to 'always' when absent. */
  whenIncurred?: CostIncidence;
}

// ---------------------------------------------------------------------------
// DCF results
// ---------------------------------------------------------------------------

export interface DevCostsComputed {
  /** Which exit this cost build-up prices: 'onSale' includes the onSale lines
   *  and excludes the onLet ones, and vice versa. 'always' lines are in both. */
  basis: Exclude<CostIncidence, 'always'>;
  /** Months of holding after PC that the time-based lines were charged for. */
  holdMonths: number;
  /** Total of the lines EXCLUDED by this basis, i.e. the other exit's costs.
   *  On the 'onLet' basis this is the selling costs a hold avoids. */
  excludedTotal: number;
  purchase: number; // (A)
  groups: Record<DevCostGroup, { lines: { code: string; label: string; amount: number }[]; total: number }>;
  totalPreFinance: number; // '3. Dev Costs' F87
  /** Line D01 as the model uses it: today's cost x the inflation factor. */
  buildCost: number;
  /** The same contract in TODAY'S money, before tender-price inflation. Equal
   *  to buildCost when inflation is off. */
  buildCostToday: number;
  /** S-curve-weighted tender-price index over the construction period: the
   *  factor between buildCostToday and buildCost. 1 when inflation is off. */
  buildInflationFactor: number;
  buildCostSource: 'fixed' | 'roomRates';
  /** Per-room-type build cost breakdown when buildCostSource = 'roomRates'.
   *  Amounts are at TODAY'S rates, so rate x area still reconciles; the
   *  inflation step is shown separately via buildInflationFactor. */
  buildBreakdown: { label: string; sqm: number; sqft: number; ratePsf: number; amount: number }[] | null;
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
  /** True when this month's cumulative spend exceeds bridge + equity and no
   *  dev loan draws yet: the spend has no funding source. */
  fundingGap: boolean;
  /** The amount `fundingGap` is short by, so the gap can be reported rather
   *  than merely flagged. Zero whenever `fundingGap` is false. */
  fundingShortfall: number;
  /** VAT paid on the purchase this month (month 1 when opted to tax). */
  vatPaid: number;
  /** VAT reclaim landing this month. */
  vatReclaimed: number;
  /** VAT facility balance (vatLoan funding only). */
  vatLoanBalance: number;
  /** Retention withheld from this month's certificate (reduces cash out). */
  retentionWithheld: number;
  /** Retention released to the contractor this month (PC and PC+defects). */
  retentionReleased: number;
  /** Retention pot balance held in the bank at month end. */
  retentionBalance: number;
  /** Deposit interest earned on the retention pot this month. */
  depositInterest: number;
}

export interface FinanceSummary {
  bridgeAdvance: number;
  bridgeArrangementFee: number;
  bridgeInterestTotal: number;
  bridgeExitFee: number;
  bridgeRedemptionTotal: number;
  /** Estimated facility at signing (E29), floored at zero: a cash-rich scheme
   *  needs no facility, and a negative estimate used to price the arrangement
   *  fee as finance income. */
  devFacilityEstimate: number;
  /** True when no facility is estimated. The cashflow may still draw the loan
   *  to redeem the bridge, in which case `runAppraisal` warns. */
  devFacilityNil: boolean;
  devArrangementFee: number;
  devInterestTotal: number;
  devBalanceAtPC: number;
  devExitFee: number;
  devPayoffAtPC: number;
  peakDevBalance: number;
  /** Peak dev balance / GDV. `null` when there is no GDV to divide by — a
   *  not-applicable state, never a passing zero. */
  ltgdvAtPeak: number | null;
  /** Covenant verdict. `null` when the ratio is not applicable (no GDV) or no
   *  facility is estimated, so a degenerate scheme cannot read as compliant. */
  ltgdvOk: boolean | null;
  /** VAT paid on the purchase (0 unless opted to tax). Nets to zero at reclaim. */
  vatOnPurchase: number;
  vatLoanFee: number;
  vatLoanInterest: number;
  /** Peak retention pot held in the bank. */
  retentionHeldPeak: number;
  /** Deposit interest earned on the retention pot (credited against costs). */
  depositInterestRetention: number;
  totalFinanceCosts: number;
  totalCostsAfterFinance: number;
  equityUsed: number;
}

/** Profit distribution for one exit scenario. */
export interface WaterfallResult {
  mode: 'simple' | 'waterfall';
  exitMonth: number;
  /** LEGACY, mode-dependent: peak capital DRAWN in 'waterfall' mode (pref
   *  accrues on the drawn balance) but capital COMMITTED in 'simple'. Retained
   *  so stored appraisals read unchanged; the reportable figures are
   *  `investorCommitted` / `investorDrawnPeak` below, which state their basis. */
  investorCapital: number;
  /** LEGACY: always the developer's COMMITTED share, so it does not pair with
   *  `investorCapital` above in waterfall mode. Use the explicit fields. */
  developerCapital: number;
  prefAccrued: number;
  prefPaid: number;
  /** Pref not covered by profit (profit below the hurdle). */
  prefShortfall: number;
  residualProfit: number;
  investorProfit: number;
  developerProfit: number;
  /** LEGACY, mode-dependent denominator: profit ÷ `investorCapital`, so the
   *  same deal reads ~6 points higher in 'waterfall' than in 'simple' with no
   *  change in economics. Report `investorRoiOnCommitted` and
   *  `investorRoiOnDrawn` instead — quoting one basis without naming it is the
   *  defect this pair exists to close. */
  investorRoi: number;
  /** LEGACY: `investorRoi` annualised over `exitMonth`, same mode dependence. */
  investorRoiPa: number;

  // --- the reportable pair: both bases, always, in both modes (A5) ---
  // Committed is the money the investor put at the scheme's disposal for the
  // duration whether or not it was called down — the conservative denominator.
  // Drawn peak is the most the cashflow actually took, which flatters the
  // return by ignoring the idle commitment. Neither is wrong on its own;
  // quoting one without saying which is.
  /** Basis: capital COMMITTED = `equity.total × investorShare`. */
  investorCommitted: number;
  /** Basis: peak capital DRAWN = `investorShare ×` peak cumulative equity over
   *  this scenario's horizon. Never exceeds `investorCommitted`. */
  investorDrawnPeak: number;
  /** Basis: capital COMMITTED = `equity.total × (1 - investorShare)`. */
  developerCommitted: number;
  /** Basis: peak capital DRAWN, complementary share, same traversal as the
   *  investor's, so investor + developer drawn = peak equity drawn. */
  developerDrawnPeak: number;
  /** `investorProfit ÷ investorCommitted`. `null` when nothing is committed —
   *  a not-applicable ratio, never a confident zero. */
  investorRoiOnCommitted: number | null;
  /** `investorProfit ÷ investorDrawnPeak`. `null` when nothing was drawn. */
  investorRoiOnDrawn: number | null;
  /** The committed-basis ROI annualised over `exitMonth`. `null` with its ROI. */
  investorRoiPaOnCommitted: number | null;
  /** The drawn-basis ROI annualised over `exitMonth`. `null` with its ROI. */
  investorRoiPaOnDrawn: number | null;
}

export interface ScenarioResults {
  s1: {
    /** GDV indexed to PC by HPI (1.0 index when HPI is off). */
    gdvAdjusted: number;
    /** Cumulative HPI index at PC applied to today's GDV. */
    hpiIndexAtPc: number;
    netProfit: number;
    /** `null` when there are no costs to divide by. */
    profitOnCost: number | null;
    /** `null` when there is no GDV to divide by. */
    profitOnGdv: number | null;
    investorProfit: number;
    developerProfit: number;
    investorRoi: number;
    durationMonths: number;
    investorRoiPa: number;
    waterfall: WaterfallResult;
  };
  s2: {
    /** `null` when sales velocity is zero: no sales are modelled, so there is
     *  no sell-out month. Never 0, which read as "sold out at completion". */
    monthsToSellOut: number | null;
    monthsToRepay: number | '36+';
    extraInterest: number;
    /** Extra value from HPI between PC and each unit's sale month. */
    hpiUplift: number;
    /** Deposit interest earned on sale surpluses after the loan is repaid. */
    depositInterestOnSurplus: number;
    netProfit: number;
    investorProfit: number;
    investorRoi: number;
    /** PC month + sell-out. `null` when no sales are modelled. */
    totalDurationMonths: number | null;
    waterfall: WaterfallResult;
  };
  s3: {
    /** Selling costs NOT incurred because the scheme is held, not sold. */
    sellingCostsAvoided: number;
    /** Letting costs incurred instead (the (I) group). */
    lettingCosts: number;
    /** All-in costs on the LET basis: the sale basis less selling costs, plus
     *  letting costs, with this scenario's own finance costs. */
    costsIfLet: number;
    mortgageAdvance: number;
    arrangementFee: number;
    devPayoff: number;
    surplusReleased: number;
    grossAnnualRent: number;
    netAnnualRent: number;
    annualInterest: number;
    netAnnualCashflow: number;
    /** Net rent / mortgage interest. `null` when nothing is borrowed. */
    interestCover: number | null;
    equityRemaining: number;
    /** Net cashflow / equity left in. `null` when no equity remains. */
    cashOnCash: number | null;
    unrealisedProfit: number;
  };
  s4: {
    refiPrincipal: number;
    arrangementFee: number;
    extraInterest: number;
    hpiUplift: number;
    depositInterestOnSurplus: number;
    netProfit: number;
    benefitVsS2: number;
    investorProfit: number;
    investorRoi: number;
    waterfall: WaterfallResult;
  };
}

export interface SensitivityResults {
  fixedCostBase: number;
  /** Grid 1: price movement -> S1 net profit & profit on GDV. */
  grid1: { priceMove: number; netProfit: number; profitOnGdv: number | null }[];
  /** Grid 2: price movement x sales velocity -> approx S2 net profit. */
  grid2: { priceMove: number; profits: { velocity: number; netProfit: number }[] }[];
  grid2Velocities: number[];
  /** Grid 3: refi rate x LTV -> net annual cashflow. */
  grid3: { rate: number; cells: { ltv: number; cashflow: number }[] }[];
  grid3Ltvs: number[];
}

export interface AppraisalResult {
  /** Modelling caveats (truncated cashflow horizon, clamped inputs, ...). */
  warnings: string[];
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
    /** Expected months held after PC; time-based holding costs run this long. */
    holdMonths: number;
  };
  devCosts: DevCostsComputed;
  cashflow: MonthRow[];
  finance: FinanceSummary;
  scenarios: ScenarioResults;
  sensitivity: SensitivityResults;
}

// ---------------------------------------------------------------------------
// Pricing estimates — AI-researched suggestions stored with their evidence.
// Estimates never overwrite an input: the UI shows them beside each field and
// the user applies them individually or per group.
// ---------------------------------------------------------------------------

/** One estimated figure with its uncertainty and provenance. */
export interface EstimateValue {
  low: number;
  /** The value an Apply click inserts. */
  likely: number;
  high: number;
  confidence: 'high' | 'medium' | 'low';
  /** How the figure was reached: evidence counts, radius used, adjustments. */
  rationale: string;
  /** Named, dated sources. */
  sources: string[];
}

export type RateCategory = 'commercial' | 'studio' | 'bed1' | 'bed2' | 'bed3' | 'house';

/** Sales & rents research output. Values are TODAY'S prices: the model's HPI
 *  setting carries them forward to completion / sale month, so growth is
 *  never counted twice. */
export interface SalesEstimates {
  ranAt: string; // ISO date
  address: string;
  rates: Partial<Record<RateCategory, { salePsf: EstimateValue; rentPsf: EstimateValue }>>;
  /** 5-year HPI projection from the same research, to fill finance.hpi. */
  hpiAnnualPct: number[];
  hpiRationale: string;
  hpiSources: string[];
}

/** Build cost research output: one blended all-in contract £/sqft that the
 *  room-rate table is scaled to (ratios preserved), plus the forward
 *  tender-price inflation that carries it to the construction months. */
export interface BuildEstimates {
  ranAt: string;
  region: string;
  blendedPsf: EstimateValue;
  /** Forecast annual tender-price inflation (decimal). Absent when the
   *  research found nothing usable — never defaulted to zero, which the model
   *  would read as "tender prices are flat" rather than "not known". */
  tenderInflationPa?: EstimateValue;
}

/** Finance rate research output, shaped to the deal's LTV/size/asset type. */
export interface FinanceEstimates {
  ranAt: string;
  bridgeRatePa: EstimateValue;
  bridgeArrangementFee: EstimateValue;
  devLoanRatePa: EstimateValue;
  devLoanArrangementFee: EstimateValue;
  vatLoanRatePa: EstimateValue;
  refinanceRatePa: EstimateValue;
  /** Instant-access deposit rate pegged to SONIA minus a researched spread. */
  depositRatePa: EstimateValue;
  /** The SONIA rate found during research (decimal), for the rationale. */
  soniaRatePa: number | null;
}

export interface EstimateSet {
  sales?: SalesEstimates;
  build?: BuildEstimates;
  finance?: FinanceEstimates;
}

// ---------------------------------------------------------------------------
// Calibration records — the user's own evidence, kept in app settings and
// shared across projects: what contractors actually tendered and what lenders
// actually quoted. Passed to the research agents to anchor estimates.
// ---------------------------------------------------------------------------

export interface TenderRecord {
  id: string;
  projectName: string;
  date: string; // yyyy-mm
  region: string;
  /** All-in contract £/sqft actually tendered. */
  psf: number;
  notes: string;
}

export interface TermSheetRecord {
  id: string;
  lender: string;
  date: string; // yyyy-mm
  product: 'bridge' | 'devLoan' | 'vatLoan' | 'refinance';
  ratePa: number; // decimal
  arrangementFee: number; // decimal
  ltv: number; // decimal
  loanSize: number; // £
  notes: string;
}

export interface CalibrationRecords {
  tenders: TenderRecord[];
  termSheets: TermSheetRecord[];
}

// ---------------------------------------------------------------------------
// Project file
// ---------------------------------------------------------------------------

export interface Project {
  version: 1;
  /** Stable id within the projects library. */
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  listedOrConservation: boolean;
  floors: Envelope[];
  pricing: PricingSpec;
  /** AI-researched pricing estimates with their evidence (never auto-applied). */
  estimates?: EstimateSet;
  /** id of option adopted for export, if any */
  adoptedOptionId?: string;
}

/** Lightweight card data for the projects homepage. */
export interface ProjectSummary {
  id: string;
  name: string;
  address: string;
  floorCount: number;
  updatedAt: string;
}
