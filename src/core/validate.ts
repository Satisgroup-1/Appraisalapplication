// Compliance validator: check proposed units against the ruleset.
// Port of the floorplan-converter skill's scripts/validate.py.

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
  // window count: every habitable room must map to a window position
  const habitable = u.rooms.filter((r) => rules.windows.habitableRoomTypes.includes(r.type));
  if ((u.windows ?? []).length < habitable.length) {
    issues.push(`${habitable.length} habitable rooms but only ${(u.windows ?? []).length} window bays captured`);
  }
  return issues;
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
  };
}
