// Conversion option generator: enumerate the ways an existing building can be
// converted (commercial -> residential, splitting into flats, lateral
// floor-through apartments, merging into a single dwelling), validate every
// unit against the ruleset, and derive priced unit schedules.

import type {
  ConversionMode,
  ConversionOption,
  Envelope,
  FloorPlanResult,
  MixStrategy,
  PricingSpec,
  RetainedFloor,
  RoomAreas,
  ScheduleRow,
} from './types';
import type { Rules } from './rules';
import { MAX_UNITS, SQM_TO_SQFT } from './rules';
import { planFloor, planFloorThrough, polyArea } from './layout';
import { validateFloor } from './validate';
import { rateFor } from './pricing';

const STRATEGIES: MixStrategy[] = ['max_units', 'balanced', 'family'];

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Floor sort key: B(asement) < G(round) < 1 < 2 ... */
function floorRank(f: string): number {
  const s = f.trim().toUpperCase();
  if (s.startsWith('B')) return -1;
  if (s === 'G' || s === 'GF' || s === '0') return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : 99;
}

function buildMonthsFor(floor: string, spec: PricingSpec): number {
  const rank = Math.max(0, floorRank(floor));
  return spec.build.baseMonths + spec.build.perFloorMonths * rank;
}

/** Derive a priced schedule from floor plans + retained floors. */
export function deriveSchedule(
  floors: FloorPlanResult[],
  retained: RetainedFloor[],
  spec: PricingSpec,
): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  let n = 0;
  for (const r of retained) {
    n += 1;
    const rate = rateFor(spec, 'Commercial');
    const sqft = r.sqm * SQM_TO_SQFT;
    rows.push({
      no: n,
      name: `Commercial Unit${retained.length > 1 ? ` ${n}` : ''}`,
      floor: r.floor,
      type: 'Commercial',
      sqm: round1(r.sqm),
      sqft,
      salePsf: rate.salePsf,
      unitGdv: sqft * rate.salePsf,
      buildMonths: spec.build.commercialMonths,
      monthlyRent: Math.round(sqft * rate.monthlyRentPsf),
      notes: 'retained commercial',
    });
  }
  let aptIndex = 0;
  const sorted = [...floors].sort((a, b) => floorRank(a.floor) - floorRank(b.floor));
  for (const plan of sorted) {
    for (const u of plan.units) {
      n += 1;
      aptIndex += 1;
      const label = plan.strategy === 'whole_house' ? 'House' : u.label;
      const rate = rateFor(spec, label);
      const sqft = u.giaSqm * SQM_TO_SQFT;
      rows.push({
        no: n,
        name: plan.strategy === 'whole_house' ? 'Whole house' : `Apartment ${aptIndex}`,
        floor: plan.floor,
        type: label,
        sqm: u.giaSqm,
        sqft,
        salePsf: rate.salePsf,
        unitGdv: sqft * rate.salePsf,
        buildMonths: buildMonthsFor(plan.floor, spec),
        monthlyRent: Math.round(sqft * rate.monthlyRentPsf),
        notes: `${u.beds} bed(s), ${u.persons}p, ${plan.strategy} mix`,
      });
    }
  }
  return rows;
}

/**
 * Sum floor areas by room type across an option's plans. Any residual area a
 * unit has beyond its drawn rooms (minor tiling gaps in the schematic model)
 * is allocated to living/kitchen. Circulation = gross minus net internal area
 * of converted floors (common corridors + retained cores).
 */
export function roomAreasOf(plans: FloorPlanResult[], retained: RetainedFloor[]): RoomAreas {
  const a: RoomAreas = {
    kitchenLivingSqm: 0,
    bedroomSqm: 0,
    bathroomSqm: 0,
    hallStorageSqm: 0,
    circulationSqm: 0,
    commercialSqm: 0,
  };
  for (const plan of plans) {
    for (const u of plan.units) {
      let roomSum = 0;
      for (const r of u.rooms) {
        roomSum += r.area;
        switch (r.type) {
          case 'bedroom':
            a.bedroomSqm += r.area;
            break;
          case 'bathroom':
            a.bathroomSqm += r.area;
            break;
          case 'hall':
            a.hallStorageSqm += r.area;
            break;
          default:
            a.kitchenLivingSqm += r.area;
        }
      }
      a.kitchenLivingSqm += Math.max(0, u.giaSqm - roomSum);
    }
    a.circulationSqm += Math.max(0, plan.floorGiaSqm - plan.niaSqm);
  }
  for (const r of retained) a.commercialSqm += r.sqm;
  (Object.keys(a) as (keyof RoomAreas)[]).forEach((k) => {
    a[k] = round1(a[k]);
  });
  return a;
}

function totalsOf(rows: ScheduleRow[]) {
  const niaSqm = rows.reduce((s, r) => s + r.sqm, 0);
  return {
    units: rows.length,
    residentialUnits: rows.filter((r) => r.type !== 'Commercial').length,
    niaSqm: round1(niaSqm),
    niaSqft: niaSqm * SQM_TO_SQFT,
    gdv: rows.reduce((s, r) => s + r.unitGdv, 0),
    monthlyRent: rows.reduce((s, r) => s + r.monthlyRent, 0),
  };
}

function makeOption(
  id: string,
  title: string,
  mode: ConversionMode,
  strategy: FloorPlanResult['strategy'],
  description: string,
  floors: FloorPlanResult[],
  retained: RetainedFloor[],
  rules: Rules,
  spec: PricingSpec,
  roomAreasOverride?: RoomAreas,
): ConversionOption {
  const compliance = floors.map((f) => validateFloor(f, rules));
  const schedule = deriveSchedule(floors, retained, spec);
  const warnings: string[] = [];
  if (schedule.length > MAX_UNITS) {
    warnings.push(`${schedule.length} units exceeds the ${MAX_UNITS}-unit appraisal workbook limit.`);
  }
  for (const c of compliance) {
    if (c.netToGrossNote) warnings.push(`Floor ${c.floor}: ${c.netToGrossNote}`);
  }
  return {
    id,
    title,
    mode,
    strategy,
    description,
    floors,
    retained,
    compliance,
    allCompliant: compliance.every((c) => c.allPass),
    warnings,
    roomAreas: roomAreasOverride ?? roomAreasOf(floors, retained),
    schedule,
    totals: totalsOf(schedule),
  };
}

/**
 * Generate the full set of conversion options for a building.
 *
 * Modes:
 *  - full_residential x 3 mix strategies (every floor converted to flats)
 *  - mixed_ground_commercial x 3 strategies (ground kept commercial), when a
 *    ground/commercial floor exists
 *  - floor_through: one lateral apartment per converted floor
 *  - whole_house: entire building as a single dwelling
 */
export function generateOptions(building: Envelope[], rules: Rules, spec: PricingSpec): ConversionOption[] {
  const options: ConversionOption[] = [];
  const sorted = [...building].sort((a, b) => floorRank(a.floor) - floorRank(b.floor));
  if (!sorted.length) return options;

  const ground = sorted.filter((f) => floorRank(f.floor) <= 0);
  const uppers = sorted.filter((f) => floorRank(f.floor) > 0);

  const planAll = (envs: Envelope[], s: MixStrategy) => envs.map((e) => planFloor(e, rules, s));

  // 1. Full residential conversion, three mix strategies.
  for (const s of STRATEGIES) {
    try {
      options.push(
        makeOption(
          `full_${s}`,
          `All residential — ${s.replace('_', ' ')}`,
          'full_residential',
          s,
          'Every floor converted to apartments off a central corridor.',
          planAll(sorted, s),
          [],
          rules,
          spec,
        ),
      );
    } catch {
      /* floor shape not plannable with this engine — skip */
    }
  }

  // 2. Keep ground commercial, convert uppers.
  if (ground.length && uppers.length) {
    const retained: RetainedFloor[] = ground.map((g) => ({
      floor: g.floor,
      use: 'commercial',
      sqm: round1(polyArea(g.envelope) - g.cores.reduce((s2, c) => s2 + polyArea(c.poly), 0)),
    }));
    for (const s of STRATEGIES) {
      try {
        options.push(
          makeOption(
            `mixed_${s}`,
            `Ground commercial + resi uppers — ${s.replace('_', ' ')}`,
            'mixed_ground_commercial',
            s,
            'Ground floor retained in commercial use; upper floors converted to apartments.',
            planAll(uppers, s),
            retained,
            rules,
            spec,
          ),
        );
      } catch {
        /* skip */
      }
    }
  }

  // 3. Floor-through lateral apartments (one big unit per floor).
  {
    const resiFloors = uppers.length ? uppers : sorted;
    const retained: RetainedFloor[] =
      uppers.length && ground.length
        ? ground.map((g) => ({
            floor: g.floor,
            use: 'commercial',
            sqm: round1(polyArea(g.envelope) - g.cores.reduce((s2, c) => s2 + polyArea(c.poly), 0)),
          }))
        : [];
    const plans = resiFloors.map((e) => planFloorThrough(e, rules));
    options.push(
      makeOption(
        'floor_through',
        'Lateral floor-through apartments',
        'floor_through',
        'floor_through',
        'One generous lateral apartment per floor — fewer, larger units.',
        plans,
        retained,
        rules,
        spec,
      ),
    );
  }

  // 4. Whole building merged into a single dwelling.
  {
    const plans = sorted.map((e) => planFloorThrough(e, rules));
    const totalNia = plans.reduce((s, p) => s + p.niaSqm, 0);
    // Merge into one schedule row: single 'House' unit spanning all floors.
    const merged: FloorPlanResult = {
      floor: sorted.map((f) => f.floor).join('+'),
      strategy: 'whole_house',
      floorGiaSqm: round1(plans.reduce((s, p) => s + p.floorGiaSqm, 0)),
      coreSqm: round1(plans.reduce((s, p) => s + p.coreSqm, 0)),
      corridor: null,
      niaSqm: round1(totalNia),
      netToGross: plans.reduce((s, p) => s + p.floorGiaSqm, 0)
        ? Math.round((totalNia / plans.reduce((s, p) => s + p.floorGiaSqm, 0)) * 1000) / 1000
        : 0,
      units: [
        {
          ...plans[0].units[0],
          no: 1,
          name: 'Whole house',
          giaSqm: round1(totalNia),
          windows: plans.flatMap((p) => p.units[0]?.windows ?? []),
        },
      ],
    };
    options.push(
      makeOption(
        'whole_house',
        'Single dwelling (merge all floors)',
        'whole_house',
        'whole_house',
        'The whole building combined into one house — e.g. flats merged back into a single dwelling.',
        [merged],
        [],
        rules,
        spec,
        // Room areas from the per-floor plans: the merged schedule row carries
        // one set of rooms, but the build cost must cover every floor.
        roomAreasOf(plans, []),
      ),
    );
  }

  return options;
}
