// The estimate pipeline's deterministic half: nothing a research agent says
// reaches an input unless it survives these sanitisers, and the room-rate
// scaling must hit its researched target while preserving the ratios the
// user tuned.

import { describe, expect, it } from 'vitest';
import {
  BANDS,
  blendedRoomRate,
  isStale,
  sanitizeEstimate,
  sanitizeFinanceEstimates,
  sanitizeSalesEstimates,
  scaleRoomRates,
} from '../src/core/estimates';
import { DEFAULT_ROOM_RATES } from '../src/core/pricing';
import type { RoomAreas } from '../src/core/types';

const goodEst = (likely: number, spread = 0.1) => ({
  low: likely * (1 - spread),
  likely,
  high: likely * (1 + spread),
  confidence: 'medium',
  rationale: 'test',
  sources: ['a source, 2026'],
});

describe('sanitizeEstimate', () => {
  it('passes a sane estimate through unchanged', () => {
    const e = sanitizeEstimate(goodEst(640), BANDS.salePsf)!;
    expect(e.likely).toBe(640);
    expect(e.low).toBeCloseTo(576);
    expect(e.high).toBeCloseTo(704);
    expect(e.confidence).toBe('medium');
  });

  it('drops the estimate entirely when likely is missing or not a number', () => {
    expect(sanitizeEstimate({ low: 1, high: 2 }, BANDS.salePsf)).toBe(null);
    expect(sanitizeEstimate({ likely: 'lots' }, BANDS.salePsf)).toBe(null);
    expect(sanitizeEstimate(null, BANDS.salePsf)).toBe(null);
  });

  it('clamps out-of-band values instead of letting them through', () => {
    const e = sanitizeEstimate({ likely: 50_000, low: 1, high: 90_000 }, BANDS.salePsf)!;
    expect(e.likely).toBe(BANDS.salePsf.max);
    expect(e.low).toBe(BANDS.salePsf.min);
    expect(e.high).toBe(BANDS.salePsf.max);
  });

  it('reorders an inverted range around likely', () => {
    const e = sanitizeEstimate({ likely: 600, low: 700, high: 500 }, BANDS.salePsf)!;
    expect(e.low).toBeLessThanOrEqual(e.likely);
    expect(e.high).toBeGreaterThanOrEqual(e.likely);
  });

  it('defaults unknown confidence to low', () => {
    expect(sanitizeEstimate({ ...goodEst(600), confidence: 'certain' }, BANDS.salePsf)!.confidence).toBe('low');
  });
});

// Wire-format helpers matching the FLAT extraction schemas: the API compiles
// structured-output schemas to a size-capped grammar, and the earlier nested
// shape was rejected in production ("The compiled grammar is too large").
const salesEntry = (type: string, salePsf: number, rentPsf?: number) => ({
  type,
  salePsfLow: salePsf * 0.9,
  salePsfLikely: salePsf,
  salePsfHigh: salePsf * 1.1,
  ...(rentPsf !== undefined
    ? { rentPsfLow: rentPsf * 0.9, rentPsfLikely: rentPsf, rentPsfHigh: rentPsf * 1.1 }
    : {}),
  confidence: 'medium',
  rationale: 'test',
  sources: ['a source, 2026'],
});

const financeEntry = (key: string, likely: number) => ({ key, ...goodEst(likely) });

describe('sanitizeSalesEstimates', () => {
  it('keeps usable unit types and drops broken ones without zeroing them', () => {
    const clean = sanitizeSalesEstimates(
      {
        rates: [
          salesEntry('bed2', 630, 2.1),
          { ...salesEntry('bed1', 620), salePsfLikely: 'n/a' }, // unusable -> absent
        ],
        hpiAnnualPct: [0.03, 0.03, 0.04, 0.04, 0.04],
        hpiRationale: 'r',
        hpiSources: ['s'],
      },
      'addr',
      '2026-08-17T00:00:00Z',
    );
    expect(clean.rates.bed2?.salePsf.likely).toBe(630);
    expect(clean.rates.bed2?.rentPsf.likely).toBeCloseTo(2.1);
    expect(clean.rates.bed1).toBeUndefined();
  });

  it('flags a missing rent as a low-confidence placeholder instead of dropping the sale figure', () => {
    const clean = sanitizeSalesEstimates(
      { rates: [salesEntry('studio', 640)], hpiAnnualPct: [], hpiRationale: '', hpiSources: [] },
      'addr',
      '2026-08-17T00:00:00Z',
    );
    expect(clean.rates.studio?.salePsf.likely).toBe(640);
    expect(clean.rates.studio?.rentPsf.confidence).toBe('low');
  });

  it('ignores unknown unit types and duplicate entries', () => {
    const clean = sanitizeSalesEstimates(
      {
        rates: [salesEntry('penthouse', 900, 3), salesEntry('bed2', 630, 2.1), salesEntry('bed2', 999, 9)],
        hpiAnnualPct: [],
        hpiRationale: '',
        hpiSources: [],
      },
      'addr',
      '2026-08-17T00:00:00Z',
    );
    expect(Object.keys(clean.rates)).toEqual(['bed2']);
    expect(clean.rates.bed2?.salePsf.likely).toBe(630); // first entry wins
  });

  it('guards the HPI rates like the HPI agent: clamped, padded to 5', () => {
    const clean = sanitizeSalesEstimates(
      { rates: [], hpiAnnualPct: [0.5, -0.9, 0.02], hpiRationale: '', hpiSources: [] },
      'addr',
      '2026-08-17T00:00:00Z',
    );
    expect(clean.hpiAnnualPct).toEqual([0.2, -0.15, 0.02, 0.02, 0.02]);
  });
});

describe('sanitizeFinanceEstimates', () => {
  it('requires bridge and dev loan rates; mirrors gaps with low confidence', () => {
    expect(sanitizeFinanceEstimates({ rates: [financeEntry('bridgeRatePa', 0.1)] }, 'now')).toBe(null);
    const clean = sanitizeFinanceEstimates(
      {
        rates: [financeEntry('bridgeRatePa', 0.105), financeEntry('devLoanRatePa', 0.085)],
        soniaRatePa: 0.045,
      },
      'now',
    )!;
    expect(clean.bridgeRatePa.likely).toBeCloseTo(0.105);
    expect(clean.vatLoanRatePa.confidence).toBe('low'); // mirrored, flagged
    expect(clean.soniaRatePa).toBeCloseTo(0.045);
  });

  it('ignores unknown keys and rejects a nonsense SONIA rate rather than displaying it', () => {
    const clean = sanitizeFinanceEstimates(
      {
        rates: [financeEntry('bridgeRatePa', 0.1), financeEntry('devLoanRatePa', 0.08), financeEntry('cryptoYield', 2)],
        soniaRatePa: 4.5,
      },
      'now',
    )!;
    expect(clean.soniaRatePa).toBe(null);
    expect(clean.devLoanRatePa.likely).toBeCloseTo(0.08);
  });
});

describe('room-rate scaling', () => {
  const areas: RoomAreas = {
    kitchenLivingSqm: 200,
    bedroomSqm: 250,
    bathroomSqm: 60,
    hallStorageSqm: 40,
    circulationSqm: 100,
    commercialSqm: 0,
  };

  it('blends by area weight', () => {
    // Uniform rates blend to that rate regardless of areas.
    const flat = { kitchenLiving: 100, bedroom: 100, bathroom: 100, hallStorage: 100, circulation: 100, commercial: 100 };
    expect(blendedRoomRate(flat, areas)).toBeCloseTo(100);
  });

  it('hits the researched target and preserves ratios', () => {
    const target = 260;
    const scaled = scaleRoomRates(DEFAULT_ROOM_RATES, areas, target);
    // The blend lands on target within £1 (rates round to whole £).
    expect(Math.abs(blendedRoomRate(scaled, areas) - target)).toBeLessThan(1);
    // Ratios survive: bathroom/bedroom was 400/150.
    expect(scaled.bathroom / scaled.bedroom).toBeCloseTo(400 / 150, 1);
  });

  it('still scales sensibly with no room areas (no generated option yet)', () => {
    const scaled = scaleRoomRates(DEFAULT_ROOM_RATES, null, 300);
    const avg = (scaled.kitchenLiving + scaled.bedroom + scaled.bathroom + scaled.hallStorage + scaled.circulation) / 5;
    expect(Math.abs(avg - 300)).toBeLessThan(1);
  });

  it('refuses to scale to or from a non-positive rate', () => {
    expect(scaleRoomRates(DEFAULT_ROOM_RATES, areas, 0)).toEqual(DEFAULT_ROOM_RATES);
  });
});

describe('staleness', () => {
  it('flags missing, unparseable and >30-day-old runs', () => {
    const now = new Date('2026-08-17T12:00:00Z');
    expect(isStale(undefined, now)).toBe(true);
    expect(isStale('not a date', now)).toBe(true);
    expect(isStale('2026-07-01T00:00:00Z', now)).toBe(true); // 47 days
    expect(isStale('2026-08-01T00:00:00Z', now)).toBe(false); // 16 days
  });
});
