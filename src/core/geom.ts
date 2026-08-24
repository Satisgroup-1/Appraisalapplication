// Plane geometry shared by the layout engine, the compliance validator and the
// schematic renderer.
//
// The layout engine works in axis-aligned rectangles (a corridor with two banks
// of units), but a real envelope is a polygon — the AI extractor is asked for
// 4-10 vertices and DXF import takes whatever closed polyline it finds. Laying
// rectangles out on the envelope's BOUNDING BOX and then measuring them as if
// they were inside it overstates net internal area, and therefore GDV, by the
// whole area of the notch: an L-shaped floor reported 124% net-to-gross before
// these helpers existed (AUDIT.md §6.3).
//
// So every rectangle the engine proposes is clipped to the envelope before its
// area is believed.

export type Ring = [number, number][];

/** Vertices within this distance of a clip edge count as on it, so a rectangle
 *  flush with the envelope wall clips to itself exactly rather than shedding a
 *  sliver to floating-point noise. */
const EPS = 1e-9;

/** Shoelace area of a ring. Unsigned, so winding order does not matter. */
export function polyArea(poly: Ring): number {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Axis-aligned bounds as [minX, minY, maxX, maxY]. */
export function bounding(poly: Ring): [number, number, number, number] {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

type Pt = [number, number];

/** One Sutherland-Hodgman pass: keep the part of `ring` inside a half-plane. */
function clipHalf(ring: Ring, keep: (p: Pt) => boolean, cut: (a: Pt, b: Pt) => Pt): Ring {
  if (ring.length < 3) return [];
  const out: Ring = [];
  for (let i = 0; i < ring.length; i++) {
    const cur = ring[i];
    const prev = ring[(i + ring.length - 1) % ring.length];
    const curIn = keep(cur);
    const prevIn = keep(prev);
    if (curIn) {
      if (!prevIn) out.push(cut(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(cut(prev, cur));
    }
  }
  return out;
}

const atX = (x: number) => (a: Pt, b: Pt): Pt => {
  // Only ever called when a and b straddle x, so b[0] !== a[0].
  const t = (x - a[0]) / (b[0] - a[0]);
  return [x, a[1] + t * (b[1] - a[1])];
};

const atY = (y: number) => (a: Pt, b: Pt): Pt => {
  const t = (y - a[1]) / (b[1] - a[1]);
  return [a[0] + t * (b[0] - a[0]), y];
};

/**
 * The ring of `poly` intersected with the axis-aligned rectangle.
 *
 * Sutherland-Hodgman against the rectangle's four half-planes. The clip region
 * is convex, which is what the algorithm requires; the SUBJECT may be concave,
 * and where a concave envelope splits into disconnected pieces the result is a
 * single degenerate ring whose connecting edges run along the clip boundary.
 * Those edges contribute nothing to the shoelace sum, so `polyArea` of this
 * ring is the true intersection area either way — which is what the engine
 * needs. Treat the ring as reliable for AREA and for drawing a convex
 * envelope; do not assume it is a simple polygon for a concave one.
 */
export function clipToRect(poly: Ring, x0: number, y0: number, x1: number, y1: number): Ring {
  if (x1 - x0 <= EPS || y1 - y0 <= EPS) return [];
  let ring: Ring = poly;
  ring = clipHalf(ring, (p) => p[0] >= x0 - EPS, atX(x0));
  ring = clipHalf(ring, (p) => p[0] <= x1 + EPS, atX(x1));
  ring = clipHalf(ring, (p) => p[1] >= y0 - EPS, atY(y0));
  ring = clipHalf(ring, (p) => p[1] <= y1 + EPS, atY(y1));
  return ring.length >= 3 ? ring : [];
}

/** How a rectangle sits inside an envelope: its area within, whether it is
 *  wholly contained, and the clipped ring. */
export interface RectClip {
  /** Area of the rectangle lying inside the polygon. */
  area: number;
  /** True when the whole rectangle is inside. */
  inside: boolean;
  /** The clipped ring; empty when the rectangle is outside or degenerate. */
  ring: Ring;
}

/**
 * Clip a rectangle to `poly`, once, returning everything a caller needs.
 *
 * When the rectangle turns out to be wholly inside, `area` is the rectangle's
 * OWN exact width x depth rather than the shoelace sum of the clipped ring.
 * The two agree mathematically, but the ring's vertices come from
 * interpolation, so the shoelace can differ in the last floating-point digit —
 * enough to flip a 1dp rounding and move a unit's recorded area by 0.1 sqm.
 * Returning the exact product keeps a rectangular floor bit-identical to plain
 * `w * d`, so introducing clipping moved no existing scheme's figures.
 */
export function rectClip(poly: Ring, x0: number, y0: number, x1: number, y1: number): RectClip {
  const rect = (x1 - x0) * (y1 - y0);
  if (rect <= EPS) return { area: 0, inside: false, ring: [] };
  const ring = clipToRect(poly, x0, y0, x1, y1);
  const clipped = polyArea(ring);
  const inside = Math.abs(clipped - rect) <= Math.max(1e-7, rect * 1e-9);
  return { area: inside ? rect : clipped, inside, ring };
}

/** Area of `poly` inside the rectangle: 0 when they do not overlap. */
export function clippedRectArea(poly: Ring, x0: number, y0: number, x1: number, y1: number): number {
  return rectClip(poly, x0, y0, x1, y1).area;
}

/** True when the rectangle lies wholly inside `poly` (to rounding). */
export function rectIsInside(poly: Ring, x0: number, y0: number, x1: number, y1: number): boolean {
  return rectClip(poly, x0, y0, x1, y1).inside;
}
