import { describe, expect, it } from 'vitest';
import { DEMO_BUILDING } from '../src/core/demo';
import { DEFAULT_RULES } from '../src/core/rules';
import { planFloor, planFloorThrough } from '../src/core/layout';
import { validateFloor } from '../src/core/validate';
import { generateOptions } from '../src/core/conversions';
import { DEFAULT_PRICING } from '../src/core/pricing';

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
});
