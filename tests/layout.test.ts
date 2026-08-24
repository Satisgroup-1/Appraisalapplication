import { describe, expect, it } from 'vitest';
import { DEMO_BUILDING } from '../src/core/demo';
import { DEFAULT_RULES } from '../src/core/rules';
import { planFloor, planFloorThrough } from '../src/core/layout';
import { planToSvg } from '../src/core/svgplan';
import { validateFloor } from '../src/core/validate';
import { generateOptions } from '../src/core/conversions';
import { DEFAULT_PRICING } from '../src/core/pricing';
import type { Envelope } from '../src/core/types';

const floor = DEMO_BUILDING[1];

describe('layout engine', () => {
  it('plans a balanced mix on the demo floor and all units pass NDSS', () => {
    const plan = planFloor(floor, DEFAULT_RULES, 'balanced');
    expect(plan.floorGiaSqm).toBeCloseTo(338, 0);
    expect(plan.units.length).toBeGreaterThan(2);
    const compliance = validateFloor(plan, DEFAULT_RULES);
    for (const u of compliance.units) {
      expect(u.issues).toEqual([]);
    }
  });

  it('max_units yields at least as many units as family', () => {
    const maxU = planFloor(floor, DEFAULT_RULES, 'max_units').units.length;
    const fam = planFloor(floor, DEFAULT_RULES, 'family').units.length;
    expect(maxU).toBeGreaterThanOrEqual(fam);
  });

  it('floor-through produces a single unit covering the floor minus core', () => {
    const plan = planFloorThrough(floor, DEFAULT_RULES);
    expect(plan.units.length).toBe(1);
    expect(plan.units[0].giaSqm).toBeCloseTo(338 - 7.2, 0);
  });

  it('rejects envelopes with the long axis on y', () => {
    const rotated = { ...floor, envelope: [[0, 0], [13, 0], [13, 26], [0, 26]] as [number, number][] };
    expect(() => planFloor(rotated, DEFAULT_RULES)).toThrow(/long axis/);
  });
});

// ---------------------------------------------------------------------------
// Non-rectangular envelopes (AUDIT.md §6.3)
//
// Units are packed on the envelope's BOUNDING BOX, so on an L/T/U-shaped floor
// a unit rectangle can overhang the building. Measuring the unclipped rectangle
// reported an L-shaped probe floor at 124% net-to-gross and overstated its GDV
// by ~24%. Every proposed rectangle is now clipped before its area counts.
// ---------------------------------------------------------------------------

describe('non-rectangular envelopes', () => {
  const winsBoth = (n = 10): Envelope['windows'] => [
    ...Array.from({ length: n }, (_, i) => ({ x: 1.5 + i * 2.5, side: 'front' as const })),
    ...Array.from({ length: n }, (_, i) => ({ x: 1.5 + i * 2.5, side: 'rear' as const })),
  ];
  const env = (id: string, envelope: [number, number][]): Envelope => ({
    id,
    floor: '1',
    use: 'commercial',
    envelope,
    cores: [],
    windows: winsBoth(),
  });

  /** L: 26x6 base plus a 13x7 left leg = 247 sqm inside a 338 sqm bounding box. */
  const L = env('L', [[0, 0], [26, 0], [26, 6], [13, 6], [13, 13], [0, 13]]);
  /** U: 26x13 with an 8x9 central notch = 266 sqm. */
  const U = env('U', [[0, 0], [26, 0], [26, 13], [17, 13], [17, 4], [9, 4], [9, 13], [0, 13]]);

  for (const [name, e, expectGia] of [
    ['L-shaped', L, 247],
    ['U-shaped', U, 266],
  ] as const) {
    it(`${name} floor: net area never exceeds the floor it sits on`, () => {
      const plan = planFloor(e, DEFAULT_RULES, 'balanced');
      expect(plan.floorGiaSqm).toBeCloseTo(expectGia, 1);
      expect(plan.niaSqm).toBeLessThanOrEqual(plan.floorGiaSqm);
      expect(plan.netToGross).toBeLessThanOrEqual(1);
      // Not a vacuous pass: the floor is genuinely used.
      expect(plan.units.length).toBeGreaterThan(0);
      expect(plan.niaSqm).toBeGreaterThan(plan.floorGiaSqm * 0.5);
    });

    it(`${name} floor: no unit is measured larger than its own rectangle`, () => {
      for (const u of planFloor(e, DEFAULT_RULES, 'balanced').units) {
        const rect = (u.x1 - u.x0) * (u.y1 - u.y0);
        expect(u.giaSqm).toBeLessThanOrEqual(rect + 0.06); // 0.06 covers the 1dp rounding
        expect(u.giaSqm).toBeGreaterThan(0);
      }
    });

    it(`${name} floor: rooms still tile their unit, at clipped areas`, () => {
      for (const u of planFloor(e, DEFAULT_RULES, 'balanced').units) {
        const roomSum = u.rooms.reduce((s, r) => s + r.area, 0);
        // Each room area is rounded to 1dp, so four rooms can drift 0.2 sqm.
        expect(Math.abs(roomSum - u.giaSqm)).toBeLessThanOrEqual(0.25);
        for (const r of u.rooms) {
          expect(r.area).toBeLessThanOrEqual(r.w * r.d + 0.06);
          expect(r.area).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }

  it('a unit falling wholly outside the envelope is dropped, not shrunk', () => {
    // A deep notch on the right: the rear bank there has no building in it.
    const notched = env('N', [[0, 0], [26, 0], [26, 4], [16, 4], [16, 13], [0, 13]]);
    const plan = planFloor(notched, DEFAULT_RULES, 'balanced');
    for (const u of plan.units) expect(u.giaSqm).toBeGreaterThan(0);
    expect(plan.niaSqm).toBeLessThanOrEqual(plan.floorGiaSqm);
  });

  it('floor-through on a notched floor measures the polygon, and clips its rooms', () => {
    const plan = planFloorThrough(L, DEFAULT_RULES);
    expect(plan.units[0].giaSqm).toBeCloseTo(247, 1); // polygon, not the 338 bounding box
    for (const r of plan.units[0].rooms) {
      expect(r.area).toBeLessThanOrEqual(r.w * r.d + 0.06);
    }
    expect(plan.niaSqm).toBeLessThanOrEqual(plan.floorGiaSqm);
  });

  it('every generated option keeps net area within gross, and the tripwire is silent', () => {
    const building = [
      { ...L, id: 'g', floor: 'G' },
      { ...L, id: 'f1', floor: '1' },
      { ...U, id: 'f2', floor: '2' },
    ];
    const options = generateOptions(building, DEFAULT_RULES, DEFAULT_PRICING);
    expect(options.length).toBeGreaterThan(0);
    for (const o of options) {
      expect(o.warnings.filter((w) => /exceeds the floor/.test(w)), o.id).toEqual([]);
      for (const p of o.floors) expect(p.niaSqm, `${o.id} floor ${p.floor}`).toBeLessThanOrEqual(p.floorGiaSqm + 0.15);
    }
  });

  it('introducing clipping moved nothing on a rectangular floor', () => {
    // The guard on the fix. Clipping a rectangle that is wholly inside its
    // envelope must return the rectangle's own exact area, not the shoelace of
    // the clipped ring — those differ in the last float digit, which is enough
    // to flip a 1dp rounding and shift a unit by 0.1 sqm. These are the values
    // the engine produced BEFORE clipping existed, captured from git HEAD.
    const expected = {
      max_units: [38.4, 51.8, 63.2, 67.9, 67.9],
      balanced: [51.8, 63.2, 38.4, 67.9, 67.9],
      family: [76.7, 76.7, 67.9, 67.9],
    } as const;
    for (const strategy of ['max_units', 'balanced', 'family'] as const) {
      const plan = planFloor(floor, DEFAULT_RULES, strategy);
      expect(plan.floorGiaSqm).toBeCloseTo(338, 6);
      expect(plan.niaSqm, strategy).toBe(289.2);
      expect(plan.netToGross, strategy).toBe(0.856);
      expect(plan.units.map((u) => u.giaSqm), strategy).toEqual([...expected[strategy]]);
      for (const u of plan.units) {
        // No redundant outline, and rooms measured as before.
        expect(u.outline).toBeUndefined();
        for (const r of u.rooms) expect(r.outline).toBeUndefined();
      }
    }
    const ft = planFloorThrough(floor, DEFAULT_RULES);
    expect(ft.units[0].giaSqm).toBe(330.8);
    expect(ft.units[0].outline).toBeUndefined();
  });

  // Shapes real buildings actually have: a chamfered corner, a shallow notch, a
  // non-parallel rear wall. Unlike a deep L, these clip a unit PARTIALLY —
  // it survives at a reduced area (and may be re-typed down), which is the case
  // that exercises the clipped-outline path.
  const partial: [string, [number, number][], number][] = [
    ['chamfered corner', [[0, 0], [26, 0], [26, 13], [2, 13], [0, 11]], 336],
    ['shallow notch', [[0, 0], [26, 0], [26, 13], [15, 13], [15, 11.5], [11, 11.5], [11, 13], [0, 13]], 332],
    ['angled rear wall', [[0, 0], [26, 0], [26, 13], [0, 10]], 299],
  ];

  for (const [name, envelope, expectGia] of partial) {
    it(`${name}: a partially clipped unit survives at its real area`, () => {
      const plan = planFloor(env(name, envelope), DEFAULT_RULES, 'balanced');
      expect(plan.floorGiaSqm).toBeCloseTo(expectGia, 1);
      expect(plan.niaSqm).toBeLessThanOrEqual(plan.floorGiaSqm);

      const clipped = plan.units.filter((u) => u.outline);
      expect(clipped.length, 'expected at least one partially clipped unit').toBeGreaterThan(0);
      for (const u of clipped) {
        const rect = (u.x1 - u.x0) * (u.y1 - u.y0);
        expect(u.giaSqm).toBeLessThan(rect); // genuinely reduced
        expect(u.giaSqm).toBeGreaterThan(0);
        expect(u.outline!.length).toBeGreaterThanOrEqual(3);
        // A clipped unit must still clear the minimum for the type it was given.
        expect(u.giaSqm + 0.05).toBeGreaterThanOrEqual(DEFAULT_RULES.unitMinimumGia[u.type]);
      }
    });
  }

  it('a clipped plan renders as polygons that stay inside the envelope', () => {
    const e = env('chamfer', [[0, 0], [26, 0], [26, 13], [2, 13], [0, 11]]);
    const plan = planFloor(e, DEFAULT_RULES, 'balanced');
    const svg = planToSvg(plan, e);
    // The envelope plus at least one clipped unit or room outline.
    expect(svg.split('<polygon').length - 1).toBeGreaterThan(1);
    // Nothing drawn as a polygon may leave the envelope's bounding box.
    const pts = [...svg.matchAll(/<polygon points="([^"]+)"/g)].flatMap((m) =>
      m[1].split(' ').map((p) => p.split(',').map(Number)),
    );
    expect(pts.length).toBeGreaterThan(4);
    for (const [x, y] of pts) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
    }
  });

  it('the demo building\'s option GDVs and room areas are unchanged', () => {
    // Room areas drive build cost, GDV drives everything else: both captured
    // from git HEAD before clipping was introduced.
    const options = generateOptions(DEMO_BUILDING, DEFAULT_RULES, DEFAULT_PRICING);
    expect(options.map((o) => Math.round(o.totals.gdv))).toEqual([
      7872243, 7872243, 7873793, 6808599, 6808599, 6809762, 7473905, 8545675,
    ]);
    expect(options.map((o) => o.roomAreas.bedroomSqm)).toEqual([
      350.4, 350.4, 302.4, 262.8, 262.8, 226.8, 138.6, 184.8,
    ]);
  });
});

describe('conversion option generator', () => {
  const options = generateOptions(DEMO_BUILDING, DEFAULT_RULES, DEFAULT_PRICING);

  it('generates full-resi, mixed, floor-through and whole-house options', () => {
    const modes = new Set(options.map((o) => o.mode));
    expect(modes).toContain('full_residential');
    expect(modes).toContain('mixed_ground_commercial');
    expect(modes).toContain('floor_through');
    expect(modes).toContain('whole_house');
    expect(options.length).toBeGreaterThanOrEqual(8);
  });

  it('mixed option keeps a commercial schedule row', () => {
    const mixed = options.find((o) => o.mode === 'mixed_ground_commercial')!;
    expect(mixed.schedule.some((r) => r.type === 'Commercial')).toBe(true);
    expect(mixed.retained.length).toBe(1);
  });

  it('every priced schedule row has a GDV and rent', () => {
    for (const o of options) {
      for (const r of o.schedule) {
        expect(r.unitGdv).toBeGreaterThan(0);
        expect(r.monthlyRent).toBeGreaterThan(0);
        expect(r.buildMonths).toBeGreaterThan(0);
      }
    }
  });

  it('full residential options are NDSS compliant on the demo building', () => {
    for (const o of options.filter((x) => x.mode === 'full_residential')) {
      expect(o.allCompliant).toBe(true);
    }
  });

  // C3: a floor too small/shallow to place any residential unit produces a
  // full_* option with an EMPTY units array. validateFloor's allPass is
  // vacuously true over no units, so `compliance.every(allPass)` reported these
  // empty, £0-GDV options as fully NDSS-compliant. A conversion that builds no
  // dwelling is the status quo, not a compliant choice.
  it('zero-dwelling options are not reported as NDSS compliant', () => {
    const shallow: Envelope = {
      id: 's',
      floor: 'G',
      use: 'commercial',
      envelope: [[0, 0], [8, 0], [8, 3], [0, 3]],
      cores: [{ type: 'stair', poly: [[0, 0], [1.5, 0], [1.5, 3], [0, 3]] }],
      windows: [{ x: 4, side: 'front' }, { x: 4, side: 'rear' }],
    };
    const opts = generateOptions([shallow], DEFAULT_RULES, DEFAULT_PRICING);
    for (const id of ['full_max_units', 'full_balanced', 'full_family']) {
      const o = opts.find((x) => x.id === id)!;
      expect(o, id).toBeDefined();
      expect(o.totals.residentialUnits, id).toBe(0);
      // Fails against pre-fix code, where this was vacuously true.
      expect(o.allCompliant, id).toBe(false);
      // Marked, not dropped: the reason must be visible in the warning box.
      expect(o.warnings.some((w) => /no residential dwelling/i.test(w)), id).toBe(true);
    }
  });

  // Regression: the fix must be a no-op on any building that actually yields
  // dwellings. Every demo option has residentialUnits > 0, so allCompliant is
  // bit-identical to the pre-fix values (all full_* remain true).
  it('demo options keep their allCompliant flags and count', () => {
    expect(options.length).toBeGreaterThanOrEqual(8);
    for (const o of options) expect(o.totals.residentialUnits).toBeGreaterThan(0);
    expect(options.map((o) => o.allCompliant)).toEqual([
      true, true, true, true, true, true, true, true,
    ]);
  });
});
