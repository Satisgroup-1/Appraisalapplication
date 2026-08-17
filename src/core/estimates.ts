// Pure helpers for the pricing estimates feature: sanitising what the
// research agents return before it can reach an input, scaling the room-rate
// table to a researched blended £/sqft, and staleness. Everything here is
// deterministic and unit-tested; the agents themselves live in the Electron
// main process (electron/estimate.ts).

import type {
  BuildEstimates,
  EstimateValue,
  FinanceEstimates,
  RateCategory,
  RoomAreas,
  RoomRates,
  SalesEstimates,
} from './types';
import { SQM_TO_SQFT } from './rules';

/** Suggestions older than this carry a "run again" badge. */
export const ESTIMATE_STALE_DAYS = 30;

export function isStale(ranAt: string | undefined, now = new Date()): boolean {
  if (!ranAt) return true;
  const t = Date.parse(ranAt);
  if (!Number.isFinite(t)) return true;
  return now.getTime() - t > ESTIMATE_STALE_DAYS * 24 * 3600 * 1000;
}

// ---------------------------------------------------------------------------
// Sanitising agent output. A model can return anything; nothing reaches an
// input field unless it is finite, ordered (low <= likely <= high) and within
// a band that is credible for what the figure IS. Out-of-band values clamp;
// a missing or non-numeric likely value drops the whole estimate.
// ---------------------------------------------------------------------------

interface Band {
  min: number;
  max: number;
}

export const BANDS = {
  salePsf: { min: 50, max: 3000 } as Band,
  rentPsf: { min: 0.3, max: 12 } as Band,
  buildPsf: { min: 50, max: 1000 } as Band,
  ratePa: { min: 0, max: 0.35 } as Band,
  feePct: { min: 0, max: 0.1 } as Band,
};

const CONFIDENCES = new Set(['high', 'medium', 'low']);

/** Returns a cleaned EstimateValue, or null when the raw value is unusable. */
export function sanitizeEstimate(raw: unknown, band: Band): EstimateValue | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const likelyIn = Number(r.likely);
  if (!Number.isFinite(likelyIn)) return null;
  const clamp = (v: number) => Math.min(band.max, Math.max(band.min, v));
  const likely = clamp(likelyIn);
  const low = Number.isFinite(Number(r.low)) ? clamp(Number(r.low)) : likely;
  const high = Number.isFinite(Number(r.high)) ? clamp(Number(r.high)) : likely;
  return {
    low: Math.min(low, likely),
    likely,
    high: Math.max(high, likely),
    confidence: CONFIDENCES.has(String(r.confidence)) ? (String(r.confidence) as EstimateValue['confidence']) : 'low',
    rationale: typeof r.rationale === 'string' ? r.rationale.slice(0, 2000) : '',
    sources: Array.isArray(r.sources) ? r.sources.filter((s) => typeof s === 'string').slice(0, 10) : [],
  };
}

const RATE_CATEGORIES: RateCategory[] = ['commercial', 'studio', 'bed1', 'bed2', 'bed3', 'house'];

/** Cleans a raw sales research payload; unit types with no usable figures are
 *  simply absent, never zeroed. */
export function sanitizeSalesEstimates(raw: unknown, address: string, ranAt: string): SalesEstimates {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rates: SalesEstimates['rates'] = {};
  const rawRates = (r.rates ?? {}) as Record<string, unknown>;
  for (const cat of RATE_CATEGORIES) {
    const entry = rawRates[cat] as Record<string, unknown> | undefined;
    if (!entry) continue;
    const salePsf = sanitizeEstimate(entry.salePsf, BANDS.salePsf);
    const rentPsf = sanitizeEstimate(entry.rentPsf, BANDS.rentPsf);
    if (salePsf && rentPsf) rates[cat] = { salePsf, rentPsf };
    else if (salePsf) rates[cat] = { salePsf, rentPsf: { ...salePsf, low: 0.3, likely: 0.3, high: 0.3, confidence: 'low', rationale: 'No rental evidence found.', sources: [] } };
  }
  // The HPI projection travels with the sales run so the model does the
  // today-to-completion growth exactly once. Same guard as the HPI agent.
  const hpiRaw = Array.isArray(r.hpiAnnualPct) ? (r.hpiAnnualPct as unknown[]).slice(0, 5) : [];
  const hpi = hpiRaw.map((x) => Math.max(-0.15, Math.min(0.2, Number(x) || 0)));
  while (hpi.length > 0 && hpi.length < 5) hpi.push(hpi[hpi.length - 1]);
  return {
    ranAt,
    address,
    rates,
    hpiAnnualPct: hpi,
    hpiRationale: typeof r.hpiRationale === 'string' ? r.hpiRationale.slice(0, 2000) : '',
    hpiSources: Array.isArray(r.hpiSources) ? (r.hpiSources as unknown[]).filter((s) => typeof s === 'string').slice(0, 8) as string[] : [],
  };
}

export function sanitizeBuildEstimates(raw: unknown, region: string, ranAt: string): BuildEstimates | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const blendedPsf = sanitizeEstimate(r.blendedPsf, BANDS.buildPsf);
  if (!blendedPsf) return null;
  return { ranAt, region, blendedPsf };
}

export function sanitizeFinanceEstimates(raw: unknown, ranAt: string): FinanceEstimates | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const need = (key: string, band: Band) => sanitizeEstimate(r[key], band);
  const bridgeRatePa = need('bridgeRatePa', BANDS.ratePa);
  const devLoanRatePa = need('devLoanRatePa', BANDS.ratePa);
  if (!bridgeRatePa || !devLoanRatePa) return null;
  const fallback = (v: EstimateValue | null, from: EstimateValue): EstimateValue => v ?? { ...from, rationale: 'No direct evidence; mirrored from the nearest product.', confidence: 'low' };
  const sonia = Number(r.soniaRatePa);
  return {
    ranAt,
    bridgeRatePa,
    bridgeArrangementFee: fallback(need('bridgeArrangementFee', BANDS.feePct), { low: 0.02, likely: 0.02, high: 0.02, confidence: 'low', rationale: 'No fee evidence found; market standard 2%.', sources: [] }),
    devLoanRatePa,
    devLoanArrangementFee: fallback(need('devLoanArrangementFee', BANDS.feePct), { low: 0.015, likely: 0.015, high: 0.015, confidence: 'low', rationale: 'No fee evidence found; market standard 1.5%.', sources: [] }),
    vatLoanRatePa: fallback(need('vatLoanRatePa', BANDS.ratePa), bridgeRatePa),
    refinanceRatePa: fallback(need('refinanceRatePa', BANDS.ratePa), devLoanRatePa),
    depositRatePa: fallback(need('depositRatePa', BANDS.ratePa), { low: 0.02, likely: 0.03, high: 0.04, confidence: 'low', rationale: 'No deposit evidence found.', sources: [] }),
    soniaRatePa: Number.isFinite(sonia) && sonia >= 0 && sonia <= 0.2 ? sonia : null,
  };
}

// ---------------------------------------------------------------------------
// Room-rate scaling: one researched blended all-in £/sqft, applied so the
// EXISTING ratios between room types are preserved and the blend over this
// scheme's actual room areas hits the target exactly.
// ---------------------------------------------------------------------------

/** Area-weighted blended £/sqft of a room-rate table over a scheme's areas. */
export function blendedRoomRate(rates: RoomRates, areas: RoomAreas): number {
  const entries: [keyof RoomRates, number][] = [
    ['kitchenLiving', areas.kitchenLivingSqm],
    ['bedroom', areas.bedroomSqm],
    ['bathroom', areas.bathroomSqm],
    ['hallStorage', areas.hallStorageSqm],
    ['circulation', areas.circulationSqm],
    ['commercial', areas.commercialSqm],
  ];
  let cost = 0;
  let sqft = 0;
  for (const [key, sqm] of entries) {
    cost += rates[key] * sqm * SQM_TO_SQFT;
    sqft += sqm * SQM_TO_SQFT;
  }
  return sqft > 0 ? cost / sqft : 0;
}

/**
 * Scales a room-rate table so its blend over `areas` equals `targetPsf`.
 * With no usable areas (no generated option yet) the ratios are still
 * preserved by scaling against the simple average of the residential rates.
 * Rates round to whole £ — the blend can therefore be pennies off target,
 * which is far inside build-cost estimate precision.
 */
export function scaleRoomRates(rates: RoomRates, areas: RoomAreas | null, targetPsf: number): RoomRates {
  const hasAreas =
    !!areas &&
    areas.kitchenLivingSqm + areas.bedroomSqm + areas.bathroomSqm + areas.hallStorageSqm + areas.circulationSqm + areas.commercialSqm > 0;
  const current = hasAreas
    ? blendedRoomRate(rates, areas!)
    : (rates.kitchenLiving + rates.bedroom + rates.bathroom + rates.hallStorage + rates.circulation) / 5;
  if (!(current > 0) || !(targetPsf > 0)) return { ...rates };
  const k = targetPsf / current;
  return {
    kitchenLiving: Math.round(rates.kitchenLiving * k),
    bedroom: Math.round(rates.bedroom * k),
    bathroom: Math.round(rates.bathroom * k),
    hallStorage: Math.round(rates.hallStorage * k),
    circulation: Math.round(rates.circulation * k),
    commercial: Math.round(rates.commercial * k),
  };
}
