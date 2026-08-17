// SDLT (Stamp Duty Land Tax) computed exactly from HMRC bands, replacing the
// hand-typed B04 figure. Two regimes cover this business's purchases:
//
//  - 'nonResidential': a commercial or mixed-use building bought to convert —
//    the common case here, and what the workbook's £87,000 on a £1,950,000
//    purchase corresponds to exactly.
//  - 'residentialCompany': an existing dwelling bought by a company — main
//    residential rates plus the 5-point company/additional-dwelling surcharge
//    on every band. (The 17% flat rate for companies buying a single dwelling
//    over £500k is relieved for property development businesses, which this
//    is, so surcharge rates apply.)
//  - 'manual': the estimator leaves line B04 alone for the solicitor's figure.
//
// When the seller has opted the property to tax, SDLT is charged on the
// VAT-INCLUSIVE consideration — sdltChargeable() applies that.
//
// Band thresholds are statute and change at Budgets: they are deliberately
// plain data at the top of this file so an update is a one-line diff.

import type { FinanceInputs } from './types';

export type SdltRegime = 'nonResidential' | 'residentialCompany' | 'manual';

/** [threshold from, rate] — marginal rate applies above each threshold. */
type Bands = [number, number][];

/** Non-residential / mixed-use freehold bands. */
export const NON_RESIDENTIAL_BANDS: Bands = [
  [0, 0],
  [150_000, 0.02],
  [250_000, 0.05],
];

/** Residential main rates (from April 2025). */
export const RESIDENTIAL_MAIN_BANDS: Bands = [
  [0, 0],
  [125_000, 0.02],
  [250_000, 0.05],
  [925_000, 0.1],
  [1_500_000, 0.12],
];

/** Company / additional-dwelling surcharge on every residential band
 *  (5 points since 31 October 2024). */
export const COMPANY_SURCHARGE = 0.05;

function marginal(bands: Bands, consideration: number): number {
  let tax = 0;
  for (let i = 0; i < bands.length; i++) {
    const [from, rate] = bands[i];
    const to = i + 1 < bands.length ? bands[i + 1][0] : Infinity;
    if (consideration <= from) break;
    tax += (Math.min(consideration, to) - from) * rate;
  }
  return tax;
}

/** SDLT for a chargeable consideration under a regime. 'manual' returns NaN
 *  on purpose — callers must keep the typed line, never a computed zero. */
export function computeSdlt(consideration: number, regime: SdltRegime): number {
  const c = Math.max(0, consideration);
  switch (regime) {
    case 'nonResidential':
      return marginal(NON_RESIDENTIAL_BANDS, c);
    case 'residentialCompany':
      return marginal(RESIDENTIAL_MAIN_BANDS, c) + COMPANY_SURCHARGE * c;
    case 'manual':
      return NaN;
  }
}

/** The consideration SDLT is charged on: VAT-inclusive when opted to tax. */
export function sdltChargeable(f: FinanceInputs): number {
  return f.purchasePrice * (f.vat.optedToTax ? 1 + f.vat.ratePct : 1);
}

/** The SDLT amount the model should use, or null in manual mode. */
export function sdltForFinance(f: FinanceInputs): number | null {
  const regime = f.sdlt?.regime ?? 'manual';
  if (regime === 'manual') return null;
  return computeSdlt(sdltChargeable(f), regime);
}
