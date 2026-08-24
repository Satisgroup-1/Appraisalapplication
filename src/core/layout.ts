// Layout engine: propose unit conversions for one floor of an existing
// building. Port of the floorplan-converter skill's scripts/layout.py.
//
// Model (simple and auditable):
// - A central corridor runs along the long axis; units form two banks, each
//   spanning corridor to facade so every unit fronts a window wall.
// - Each bank is split into segments around cores. Segments are packed with
//   units at NDSS-minimum widths (cycling the strategy's type order, with a
//   downgrade-last-unit step to squeeze in one more), then all units in the
//   segment stretch proportionally so no space is wasted.
// - Each unit is then assigned the window bays it spans and re-typed to the
//   best (largest) type its area, window count and living width can support.
// - Rooms: bedrooms and living/kitchen on the facade (windowed), bathroom and
//   hall on the internal strip (mechanical vent).
// - Every proposed rectangle is CLIPPED to the envelope polygon before its area
//   counts. The packing grid is the bounding box, so on an L/T/U-shaped floor a
//   unit can overhang the building; measuring the unclipped rectangle inflated
//   net area and GDV (AUDIT.md §6.3). A unit whose clipped area no longer
//   supports any type in the strategy is dropped rather than shrunk, which
//   leaves such floors deliberately under-packed — conservative, and visible in
//   the net-to-gross figure.

import type { Envelope, FloorPlanResult, MixStrategy, PlannedUnit, Room, UnitTypeKey } from './types';
import type { Rules } from './rules';
import { BEDS, LABEL, MAX_STRETCH, MIN_LIVING_W, PERSONS } from './rules';
import { bounding, polyArea, rectClip } from './geom';

// Re-exported: callers took these from here before the geometry helpers were
// split out, and the layout engine remains their natural home in the API.
export { bounding, polyArea };

const round = (v: number, dp: number) => {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
};

export function planFloor(env: Envelope, rules: Rules, strategy: MixStrategy = 'balanced'): FloorPlanResult {
  const [x0, y0, x1, y1] = bounding(env.envelope);
  const W = x1 - x0;
  const D = y1 - y0;
  if (D > W) {
    throw new Error(`Floor ${env.floor}: rotate envelope so the long axis is x (W >= D).`);
  }
  const corridorW = rules.circulation.corridorMinWidth;
  const corePolys = env.cores.map((c) => c.poly);
  const coreArea = corePolys.reduce((s, cp) => s + polyArea(cp), 0);
  const bankDepth = (D - corridorW) / 2;
  const cy0 = y0 + bankDepth;
  const cy1 = y0 + bankDepth + corridorW;
  const winFront = env.windows.filter((w) => w.side === 'front').map((w) => w.x).sort((a, b) => a - b);
  const winRear = env.windows.filter((w) => w.side === 'rear').map((w) => w.x).sort((a, b) => a - b);

  const strat = rules.mixStrategies[strategy];
  const order: UnitTypeKey[] = [...strat.prefer, ...(strat.allow ?? [])];
  const mins = rules.unitMinimumGia;
  const bySize = [...new Set(order)].sort((a, b) => mins[a] - mins[b]); // small -> large

  /** Bank length minus core overlaps -> list of [sx0, sx1]. */
  function segments(by0: number, by1: number): [number, number][] {
    const cuts: [number, number][] = [];
    for (const cp of corePolys) {
      const [bx0, byc0, bx1, byc1] = bounding(cp);
      if (!(byc1 <= by0 || byc0 >= by1)) cuts.push([bx0, bx1]);
    }
    cuts.sort((a, b) => a[0] - b[0]);
    const segs: [number, number][] = [];
    let cx = x0;
    for (const [ex0, ex1] of cuts) {
      if (ex0 - cx > 0.5) segs.push([cx, ex0]);
      cx = Math.max(cx, ex1);
    }
    if (x1 - cx > 0.5) segs.push([cx, x1]);
    return segs;
  }

  /** Choose unit types at min widths, cycling order; downgrade the last unit
   *  if that frees room for one more; return [type, width] pairs. */
  function packSegment(sx0: number, sx1: number, depth: number): [UnitTypeKey, number][] {
    const L = sx1 - sx0;
    const minw: Record<string, number> = {};
    for (const t of new Set(order)) minw[t] = mins[t] / depth;
    const types: UnitTypeKey[] = [];
    let used = 0;
    let i = 0;
    for (;;) {
      const t = order[i % order.length];
      i += 1;
      if (used + minw[t] <= L + 1e-9) {
        types.push(t);
        used += minw[t];
        continue;
      }
      // try any type that still fits
      const fit = bySize.filter((u) => used + minw[u] <= L + 1e-9);
      if (fit.length) {
        types.push(fit[fit.length - 1]);
        used += minw[fit[fit.length - 1]];
        continue;
      }
      // downgrade the last placed unit to squeeze one more in
      if (types.length) {
        const last = types[types.length - 1];
        const smaller = bySize.filter((u) => mins[u] < mins[last]);
        for (let k = smaller.length - 1; k >= 0; k--) {
          const u = smaller[k];
          const freed = minw[last] - minw[u];
          const fit2 = bySize.filter((v) => used - freed + minw[v] <= L + 1e-9);
          if (fit2.length) {
            types[types.length - 1] = u;
            used -= freed;
            types.push(fit2[fit2.length - 1]);
            used += minw[fit2[fit2.length - 1]];
            break;
          }
        }
      }
      break;
    }
    if (!types.length) return [];
    const stretch = Math.min(L / used, MAX_STRETCH);
    const widths = types.map((t) => minw[t] * stretch);
    // give any remainder to the last unit
    const rem = L - widths.reduce((s, w) => s + w, 0);
    if (rem > 0) widths[widths.length - 1] += rem;
    return types.map((t, k) => [t, widths[k]]);
  }

  /** Largest type in the strategy whose minima the space supports. */
  function bestType(gia: number, nwin: number, livingWAt: (t: UnitTypeKey) => number): UnitTypeKey | null {
    const cands = [...new Set(order)].sort((a, b) => mins[b] - mins[a]);
    for (const t of cands) {
      if (gia + 0.05 < mins[t]) continue;
      if (nwin < 1 + BEDS[t]) continue;
      if (livingWAt(t) < MIN_LIVING_W && BEDS[t] > 0) continue;
      return t;
    }
    return null;
  }

  /** The clipped footprint, but only when the rectangle actually overhangs the
   *  envelope — a rectangular floor carries no redundant outlines. */
  function outlineOf(c: { inside: boolean; ring: [number, number][] }): { outline?: [number, number][] } {
    if (c.inside || c.ring.length < 3) return {};
    return { outline: c.ring.map((p) => [round(p[0], 2), round(p[1], 2)] as [number, number]) };
  }

  /** One room rectangle, measured and drawn as clipped to the envelope. */
  function room(
    type: Room['type'],
    name: string,
    rx: number,
    rw: number,
    ry: number,
    rd: number,
    window: boolean,
  ): Room {
    const c = rectClip(env.envelope, rx, ry, rx + rw, ry + rd);
    return {
      type,
      name,
      x: round(rx, 2),
      w: round(rw, 2),
      y: round(ry, 2),
      d: round(rd, 2),
      area: round(c.area, 1),
      ...outlineOf(c),
      window,
    };
  }

  function makeUnit(
    t: UnitTypeKey,
    ux0: number,
    ux1: number,
    uy0: number,
    uy1: number,
    side: 'front' | 'rear',
    wins: number[],
  ): PlannedUnit {
    const w = ux1 - ux0;
    const d = uy1 - uy0;
    const unitClip = rectClip(env.envelope, ux0, uy0, ux1, uy1);
    const hallD = 1.2;
    const facadeD = d - hallD;
    const br = rules.bedrooms;
    // Habitable rooms take the window wall; bathroom and hall the strip against
    // the corridor. 'front' units face min-y, 'rear' units max-y.
    const facadeY0 = side === 'front' ? uy0 : uy1 - facadeD;
    const internalY0 = side === 'front' ? uy1 - hallD : uy0;
    const rooms: Room[] = [];
    let cursor = ux0;
    for (let b = 0; b < BEDS[t]; b++) {
      const bw = Math.max(b === 0 ? br.doubleMinWidth : br.otherDoubleMinWidth, br.doubleMinArea / facadeD);
      rooms.push(room('bedroom', `Bed ${b + 1}`, cursor, bw, facadeY0, facadeD, true));
      cursor += bw;
    }
    rooms.push(room('kitchen_living', 'Living / Kitchen', cursor, ux1 - cursor, facadeY0, facadeD, true));
    const bathW = Math.min(2.2, w - 0.8);
    rooms.push(room('bathroom', 'Bath', ux0, bathW, internalY0, hallD, false));
    rooms.push(room('hall', 'Hall / Storage', ux0 + bathW, w - bathW, internalY0, hallD, false));
    return {
      no: 0,
      name: '',
      type: t,
      label: LABEL[t],
      persons: PERSONS[t],
      beds: BEDS[t],
      side,
      x0: round(ux0, 2),
      x1: round(ux1, 2),
      y0: round(uy0, 2),
      y1: round(uy1, 2),
      // Clipped, not w x d: on a rectangular floor these are identical, on a
      // notched one only the part inside the building counts.
      giaSqm: round(unitClip.area, 1),
      ...outlineOf(unitClip),
      windows: wins.map((v) => round(v, 2)),
      rooms,
    };
  }

  function fillBank(side: 'front' | 'rear', wxs: number[], by0: number, by1: number): PlannedUnit[] {
    const depth = by1 - by0;
    const units: PlannedUnit[] = [];
    for (const [sx0, sx1] of segments(by0, by1)) {
      const packed = packSegment(sx0, sx1, depth);
      let cx = sx0;
      for (const [, wdt] of packed) {
        const ux0 = cx;
        const ux1 = cx + wdt;
        const wins = wxs.filter((w) => ux0 + 0.2 <= w && w <= ux1 - 0.2);
        // The area that actually exists, so a unit hanging over a notch is
        // typed on (or rejected for) its real size.
        const gia = rectClip(env.envelope, ux0, by0, ux1, by1).area;
        const br = rules.bedrooms;
        const livingWAt = (tt: UnitTypeKey) => {
          let bw = 0;
          for (let b = 0; b < BEDS[tt]; b++) {
            bw += Math.max(b === 0 ? br.doubleMinWidth : br.otherDoubleMinWidth, br.doubleMinArea / (depth - 1.2));
          }
          return wdt - bw;
        };
        const bt = bestType(gia, wins.length, livingWAt);
        if (bt !== null) units.push(makeUnit(bt, ux0, ux1, by0, by1, side, wins));
        cx = ux1;
      }
    }
    return units;
  }

  const units = [...fillBank('front', winFront, y0, cy0), ...fillBank('rear', winRear, cy1, y1)];
  units.forEach((u, k) => {
    u.no = k + 1;
    u.name = `Apartment ${k + 1}`;
  });
  const giaFloor = polyArea(env.envelope);
  const nia = units.reduce((s, u) => s + u.giaSqm, 0);
  return {
    floor: env.floor,
    strategy,
    floorGiaSqm: round(giaFloor, 1),
    coreSqm: round(coreArea, 1),
    corridor: { y0: round(cy0, 2), y1: round(cy1, 2) },
    niaSqm: round(nia, 1),
    netToGross: giaFloor ? round(nia / giaFloor, 3) : 0,
    units,
  };
}

/** One lateral apartment spanning the whole floor (minus cores). */
export function planFloorThrough(env: Envelope, rules: Rules): FloorPlanResult {
  const [x0, y0, x1, y1] = bounding(env.envelope);
  const giaFloor = polyArea(env.envelope);
  const coreArea = env.cores.reduce((s, c) => s + polyArea(c.poly), 0);
  const nia = giaFloor - coreArea;
  const wins = env.windows.map((w) => w.x);
  // Type by area: biggest NDSS type it clears.
  const order: UnitTypeKey[] = ['3bed_6p', '3bed_5p', '3bed_4p', '2bed_4p', '2bed_3p', '1bed_2p', 'studio_1p'];
  let type: UnitTypeKey = 'studio_1p';
  for (const t of order) {
    if (nia >= rules.unitMinimumGia[t] && wins.length >= 1 + BEDS[t]) {
      type = t;
      break;
    }
  }
  const W = x1 - x0;
  const D = y1 - y0;
  const hallD = 1.2;
  const facadeD = D - hallD;
  const roomD = facadeD / 2;
  // Same convention as planFloor: habitable rooms on the window wall (min-y
  // here, since a lateral unit is treated as front-facing), services behind.
  const facadeY0 = y0;
  const internalY0 = y1 - hallD;
  /** Measured and drawn clipped to the envelope, as in planFloor. */
  const room = (
    type: Room['type'],
    name: string,
    rx: number,
    rw: number,
    ry: number,
    rd: number,
    window: boolean,
  ): Room => {
    const c = rectClip(env.envelope, rx, ry, rx + rw, ry + rd);
    return {
      type,
      name,
      x: round(rx, 2),
      w: round(rw, 2),
      y: round(ry, 2),
      d: round(rd, 2),
      area: round(c.area, 1),
      ...(c.inside || c.ring.length < 3
        ? {}
        : { outline: c.ring.map((p) => [round(p[0], 2), round(p[1], 2)] as [number, number]) }),
      window,
    };
  };
  const rooms: Room[] = [];
  let cursor = x0;
  const br = rules.bedrooms;
  for (let b = 0; b < BEDS[type]; b++) {
    const bw = Math.max(b === 0 ? br.doubleMinWidth : br.otherDoubleMinWidth, br.doubleMinArea / Math.max(roomD, 2.5));
    rooms.push(room('bedroom', `Bed ${b + 1}`, cursor, bw, facadeY0, roomD, true));
    cursor += bw;
  }
  rooms.push(room('kitchen_living', 'Living / Kitchen', cursor, x1 - cursor, facadeY0, roomD, true));
  rooms.push(room('bathroom', 'Bath', x0, 2.2, internalY0, hallD, false));
  rooms.push(room('hall', 'Hall / Storage', x0 + 2.2, W - 2.2, internalY0, hallD, false));
  const unit: PlannedUnit = {
    no: 1,
    name: 'Apartment 1',
    type,
    label: LABEL[type],
    persons: PERSONS[type],
    beds: BEDS[type],
    side: 'front',
    x0: round(x0, 2),
    x1: round(x1, 2),
    y0: round(y0, 2),
    y1: round(y1, 2),
    // Already polygon-correct: the whole floor minus its cores.
    giaSqm: round(nia, 1),
    ...(rectClip(env.envelope, x0, y0, x1, y1).inside
      ? {}
      : { outline: env.envelope.map((p) => [round(p[0], 2), round(p[1], 2)] as [number, number]) }),
    windows: wins.map((v) => round(v, 2)),
    rooms,
  };
  return {
    floor: env.floor,
    strategy: 'floor_through',
    floorGiaSqm: round(giaFloor, 1),
    coreSqm: round(coreArea, 1),
    corridor: null,
    niaSqm: round(nia, 1),
    netToGross: giaFloor ? round(nia / giaFloor, 3) : 0,
    units: [unit],
  };
}
