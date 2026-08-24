// Polygon clipping used by the layout engine to measure proposed units against
// a real envelope rather than its bounding box (AUDIT.md §6.3).

import { describe, expect, it } from 'vitest';
import { bounding, clippedRectArea, clipToRect, polyArea, rectIsInside } from '../src/core/geom';
import type { Ring } from '../src/core/geom';

/** 26 x 13 rectangle — the demo floor shape. */
const RECT: Ring = [[0, 0], [26, 0], [26, 13], [0, 13]];
/** L: full 26x6 base plus a 13x7 left leg = 156 + 91 = 247 sqm. */
const L: Ring = [[0, 0], [26, 0], [26, 6], [13, 6], [13, 13], [0, 13]];
/** U: 20x10 with a 10x7 central notch = 200 - 70 = 130 sqm. A horizontal band
 *  across the notch splits into two disconnected pieces — the case that breaks
 *  naive clipping. */
const U: Ring = [[0, 0], [20, 0], [20, 10], [15, 10], [15, 3], [5, 3], [5, 10], [0, 10]];

describe('polyArea and bounding', () => {
  it('measures the shapes by hand calculation, winding-independent', () => {
    expect(polyArea(RECT)).toBeCloseTo(338, 9);
    expect(polyArea(L)).toBeCloseTo(247, 9);
    expect(polyArea(U)).toBeCloseTo(130, 9);
    expect(polyArea([...L].reverse())).toBeCloseTo(247, 9); // reversed winding
    expect(bounding(L)).toEqual([0, 0, 26, 13]);
  });
});

describe('clipToRect', () => {
  it('is exact on a rectangular envelope, so rectangular floors are unchanged', () => {
    expect(clippedRectArea(RECT, 0, 0, 5.9, 5.9)).toBeCloseTo(5.9 * 5.9, 9);
    expect(clippedRectArea(RECT, 3, 0, 8.2, 5.9)).toBeCloseTo(5.2 * 5.9, 9);
    expect(clippedRectArea(RECT, 0, 0, 26, 13)).toBeCloseTo(338, 9);
    expect(rectIsInside(RECT, 0, 0, 5.9, 5.9)).toBe(true);
    expect(rectIsInside(RECT, 0, 0, 26, 13)).toBe(true);
  });

  it('measures an L-shape against hand calculation', () => {
    expect(clippedRectArea(L, 0, 0, 26, 13)).toBeCloseTo(247, 9); // whole shape
    expect(clippedRectArea(L, 0, 0, 13, 13)).toBeCloseTo(169, 9); // leg, fully inside
    expect(clippedRectArea(L, 13, 0, 26, 13)).toBeCloseTo(78, 9); // right half: base band only
    expect(clippedRectArea(L, 20, 8, 26, 13)).toBe(0); // wholly in the notch
    expect(rectIsInside(L, 0, 0, 13, 13)).toBe(true);
    expect(rectIsInside(L, 13, 0, 26, 13)).toBe(false);
  });

  it('measures a band that splits into two disconnected pieces', () => {
    // y 5..8 crosses the notch: two 5-wide x 3-deep pieces = 30
    expect(clippedRectArea(U, 0, 5, 20, 8)).toBeCloseTo(30, 9);
    // y 0..3 is solid across the full width = 60
    expect(clippedRectArea(U, 0, 0, 20, 3)).toBeCloseTo(60, 9);
    expect(clippedRectArea(U, 6, 4, 14, 9)).toBe(0); // inside the notch
    expect(clippedRectArea(U, 3, 4, 8, 9)).toBeCloseTo(10, 9); // straddling one leg
  });

  it('returns zero, never NaN, for degenerate or disjoint rectangles', () => {
    for (const a of [
      clippedRectArea(L, 5, 5, 5, 9), // zero width
      clippedRectArea(L, 5, 9, 9, 9), // zero height
      clippedRectArea(L, 100, 100, 110, 110), // disjoint
      clippedRectArea(L, 9, 9, 8, 10), // inverted
    ]) {
      expect(Number.isFinite(a)).toBe(true);
      expect(a).toBe(0);
    }
    expect(clipToRect(L, 100, 100, 110, 110)).toEqual([]);
    expect(rectIsInside(L, 5, 5, 5, 5)).toBe(false);
  });

  it('never reports more area than either input, over a sweep of rectangles', () => {
    for (const poly of [RECT, L, U]) {
      const whole = polyArea(poly);
      for (let i = 0; i < 400; i++) {
        const x0 = (i * 7.3) % 25;
        const y0 = (i * 3.1) % 12;
        const w = 0.5 + ((i * 1.7) % 6);
        const h = 0.5 + ((i * 2.3) % 5);
        const a = clippedRectArea(poly, x0, y0, x0 + w, y0 + h);
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(w * h + 1e-9);
        expect(a).toBeLessThanOrEqual(whole + 1e-9);
      }
    }
  });

  it('clipping a partition of a rectangle conserves area', () => {
    // The layout engine relies on this: a unit's rooms tile its rectangle, so
    // the clipped room areas must sum to the clipped unit area.
    const [ux0, uy0, ux1, uy1] = [7, 2, 19, 11];
    const whole = clippedRectArea(U, ux0, uy0, ux1, uy1);
    const cuts = [7, 10.5, 13, 16, 19];
    let sum = 0;
    for (let i = 0; i + 1 < cuts.length; i++) sum += clippedRectArea(U, cuts[i], uy0, cuts[i + 1], uy1);
    expect(sum).toBeCloseTo(whole, 9);
  });
});
