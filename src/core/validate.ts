// Compliance validator: check proposed units against the ruleset.
// Port of the floorplan-converter skill's scripts/validate.py, extended with:
//  - NDSS built-in storage minima (checked against the unit's hall/storage strip)
//  - explicit advisories for requirements a schematic plan cannot verify
//    (ceiling heights, glazing ratios, aspect), so the report never silently
//    implies they were checked.

import type { FloorCompliance, FloorPlanResult, PlannedUnit, UnitCompliance } from './types';
import type { Rules } from './rules';

export function validateUnit(u: PlannedUnit, rules: Rules): string[] {
  const issues: string[] = [];
  const mins = rules.unitMinimumGia;
  const t = u.type;
  if (u.giaSqm < mins[t] - 0.05) {
    issues.push(`GIA ${u.giaSqm}sqm below NDSS minimum ${mins[t]}sqm for ${t}`);
  }
  const br = rules.bedrooms;
  const beds = u.rooms.filter((r) => r.type === 'bedroom');
  if (beds.length !== u.beds) {
    issues.push(`expected ${u.beds} bedrooms, found ${beds.length}`);
  }
  beds.forEach((b, i) => {
    // The layout engine draws every bedroom as a double; NDSS would allow the
    // second bedroom of a 2b3p (or third of a 3b5p) to be a single, so this
    // check is deliberately stricter than the bare standard.
    const minA = br.doubleMinArea;
    const minW = i === 0 ? br.doubleMinWidth : br.otherDoubleMinWidth;
    if (b.area < minA - 0.05) issues.push(`${b.name} area ${b.area}sqm < ${minA}sqm`);
    if (b.w < minW - 0.01) issues.push(`${b.name} width ${b.w.toFixed(2)}m < ${minW}m`);
    if (br.mustHaveWindow && !b.window) issues.push(`${b.name} has no window`);
  });
  const living = u.rooms.filter((r) => r.type === 'living' || r.type === 'kitchen_living');
  if (!living.length) {
    issues.push('no living room');
  } else {
    const lv = living[0];
    if (rules.livingRooms.mustHaveWindow && !lv.window) issues.push('living room has no window');
    const p = `${Math.min(u.persons, 4)}p`;
    const need = rules.livingRooms.minCombinedLivingKitchenDining[p];
    if (need && lv.area < need - 0.05 && u.type !== 'studio_1p') {
      issues.push(`living/kitchen ${lv.area}sqm < ${need}sqm for ${u.persons} persons`);
    }
  }
  if (rules.kitchensBathrooms.kitchenRequired) {
    if (!u.rooms.some((r) => r.type === 'kitchen' || r.type === 'kitchen_living')) issues.push('no kitchen');
  }
  if (rules.kitchensBathrooms.bathroomRequired) {
    if (!u.rooms.some((r) => r.type === 'bathroom')) issues.push('no bathroom');
  }
  // NDSS built-in storage: the hall/storage strip must at least cover the
  // storage requirement for the unit size.
  const storageNeed =
    u.beds === 0
      ? rules.storage.studio
      : u.beds === 1
        ? rules.storage.bed1
        : u.beds === 2
          ? rules.storage.bed2
          : rules.storage.bed3;
  const hallArea = u.rooms.filter((r) => r.type === 'hall').reduce((s, r) => s + r.area, 0);
  if (hallArea < storageNeed - 0.05) {
    issues.push(`hall/storage ${hallArea.toFixed(1)}sqm < ${storageNeed}sqm NDSS built-in storage`);
  }
  // window count: every habitable room must map to a window position
  const habitable = u.rooms.filter((r) => rules.windows.habitableRoomTypes.includes(r.type));
  if ((u.windows ?? []).length < habitable.length) {
    issues.push(`${habitable.length} habitable rooms but only ${(u.windows ?? []).length} window bays captured`);
  }
  return issues;
}

/** Requirements that exist in the ruleset but cannot be verified from
 *  schematic geometry — surfaced on every floor so nothing reads as checked
 *  when it was assumed. */
export function floorAdvisories(plan: FloorPlanResult, rules: Rules): string[] {
  const adv: string[] = [
    `Ceiling height ≥${rules.heights.minCeiling}m over ≥${Math.round(rules.heights.minCeilingCoverage * 100)}% of GIA assumed. Verify on measured survey.`,
    `Glazing ≥${Math.round(rules.windows.glazingMinRatioOfRoomFloor * 100)}% of room floor area assumed for habitable rooms, and depends on actual window sizes.`,
  ];
  if (plan.corridor) {
    adv.push('Corridor-and-bays layout gives single-aspect units, and some LPAs restrict single-aspect (esp. north-facing) dwellings.');
  }
  if (plan.units.some((u) => u.type === 'studio_1p')) {
    adv.push('Studio minimum of 37sqm assumes a shower room; NDSS requires 39sqm where a bath is provided.');
  }
  adv.push('Planning matters (permitted development / Class MA, fire strategy, natural light tests, external amenity) are out of scope. Treat as risks.');
  return adv;
}

export function validateFloor(plan: FloorPlanResult, rules: Rules): FloorCompliance {
  const units: UnitCompliance[] = plan.units.map((u) => {
    const issues = validateUnit(u, rules);
    return { unitNo: u.no, pass: issues.length === 0, issues };
  });
  const ntg = rules.efficiency.targetNetToGross;
  const note =
    plan.netToGross < ntg - 0.08
      ? `net-to-gross ${(plan.netToGross * 100).toFixed(0)}% well below target ${(ntg * 100).toFixed(0)}%`
      : null;
  return {
    floor: plan.floor,
    netToGrossNote: note,
    units,
    allPass: units.every((u) => u.pass),
    advisories: floorAdvisories(plan, rules),
  };
}
