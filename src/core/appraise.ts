// The one way to price a scheme in this application.
//
// Every screen that shows a number for an option — the Options card's "S1
// profit", the Appraisal page, the finance-research brief on the Pricing page —
// goes through here, so all three report the same figure for the same option
// and the same figure the exported workbook is built from. The history that
// makes this a module rather than three call sites: the Options page priced
// from the RAW spec while the Appraisal page priced from the sanitised one, so
// a 450% bridge rate fat-fingered into a box with no max (PctField still has
// no min/max) showed the demo conversion as a £7.4m loss on the page the user
// chooses the scheme on and a £432k profit on the page that appraises it — a
// sign flip, undisclosed, with the audit strip on the profitable page reading
// "0 fails, 2 input repairs applied".
//
// Order is load-bearing: sanitise the spec, repair the schedule, THEN price,
// and only then audit. The auditor re-derives the model from the spec it is
// handed, so handing it the raw spec while the result came from the repaired
// one would make every clamped figure read as an engine defect.

import { auditAppraisal, repairSchedule, sanitizeSpec } from './audit';
import type { AuditReport, AuditRepair } from './audit';
import { runAppraisal } from './dcf';
import type { AppraisalResult, PricingSpec, RoomAreas, ScheduleRow } from './types';

export interface PricedAppraisal {
  result: AppraisalResult | null;
  /** The REPAIRED spec the result was computed from. Null whenever `result`
   *  is, so a caller cannot build an export from inputs that never produced
   *  figures. Every consumer of these figures must read its spec fields from
   *  HERE and not from the raw project spec: the workbook's '2. Inputs' would
   *  otherwise carry an unrepaired number beside a reported repair, and the
   *  finance-research brief did exactly that — quoting a raw 700% LTV against a
   *  facility this module had sized at the repaired 100%. Mixing the two is a
   *  spec that never existed. */
  spec: PricingSpec | null;
  /** The REPAIRED schedule the result was computed from, likewise. */
  schedule: ScheduleRow[] | null;
  /** Every repair applied to the inputs, for disclosure. Populated even when
   *  pricing failed — see the docblock on appraiseProject. */
  repairs: AuditRepair[];
  /** Only when `opts.audit === true`; the 65-check re-derivation is far too
   *  expensive to run once per card in an option grid. */
  audit: AuditReport | null;
  /** Null means "nothing to price yet", NOT "priced fine". A message means the
   *  inputs could not be priced at all and no figure should be shown. */
  error: string | null;
}

export interface AppraiseInput {
  schedule: ScheduleRow[] | null;
  pricing: PricingSpec | null;
  roomAreas?: RoomAreas;
}

/**
 * Prices a scheme from repaired inputs. Never throws: a caller that has to
 * wrap this in try/catch would be free to swallow the exception, which is how
 * an unpriceable option came to show no profit at all on the Options card and
 * "No option selected yet" on the Appraisal page.
 *
 * Two distinct empty results, deliberately not collapsed into one:
 *  - nothing to price (no schedule, or no spec) → all nulls and `error: null`;
 *  - pricing failed → `result: null` and `error` set, WITH the repairs already
 *    collected from the stages that completed, so the screen can still show
 *    what it fixed instead of discarding that work with the exception.
 *
 * Honest limit on that second promise: repairs found INSIDE a `sanitizeSpec`
 * that itself throws (a non-array `devCosts` gives "s.devCosts is not
 * iterable") are unrecoverable — sanitizeSpec accumulates them in a local
 * array and never returns on the throw path. That is a residual of the
 * sanitiser, not something this module can reach.
 */
export function appraiseProject(input: AppraiseInput, opts?: { audit?: boolean }): PricedAppraisal {
  const { schedule: rawSchedule, pricing, roomAreas } = input;
  const empty: PricedAppraisal = { result: null, spec: null, schedule: null, repairs: [], audit: null, error: null };
  if (!rawSchedule || !rawSchedule.length || !pricing) return empty;

  // Accumulated outside the try so a throw in a later stage still reports the
  // repairs the earlier stages found.
  const repairs: AuditRepair[] = [];
  try {
    const clean = sanitizeSpec(pricing);
    repairs.push(...clean.repairs);
    const sched = repairSchedule(rawSchedule);
    repairs.push(...sched.repairs);
    const result = runAppraisal(sched.schedule, clean.spec, roomAreas);
    return {
      result,
      spec: clean.spec,
      schedule: sched.schedule,
      repairs,
      audit: opts?.audit ? auditAppraisal(result, clean.spec, sched.schedule) : null,
      error: null,
    };
  } catch (e) {
    return {
      ...empty,
      repairs,
      error: (e as Error)?.message || String(e) || 'unknown error',
    };
  }
}
