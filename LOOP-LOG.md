# Loop log

Every firing of the hourly improvement Routine appends one row here, whether it
landed or not. `./scripts/loop-status.sh` reads this file plus the git history
and prints the current state of the loop.

Columns: when (UTC) · outcome · item · title · rework rounds · what happened.

| When | Outcome | Item | Title | Rounds | Note |
|---|---|---|---|---|---|
| 2026-08-24 02:24 | SETUP | — | Loop established: planner, builder, reviewer; hourly Routine | 0 | Baseline before the first cycle: 228 tests, 53 audit checks, 9 of 37 findings closed |
| 2026-08-24 03:25 | LANDED | 5 | Guard rails on degenerate inputs, and the plausibility checks that catch them (A4, A6, A8, A9 + E3) | 1 | 228→251 tests, 53→61 audit checks. 18 tests confirmed failing first. One rework round: `plaus-icr` initially failed on the demo's real ICR of 0.87, which broke five existing "audit is clean" tests and showed the check was conflating a weak deal with a model defect — recast as "below cover is never unflagged". No golden pin moved. |
| 2026-08-24 03:51 | ABANDONED | A4+A8 | Floor the development facility at zero, and disclose pre-construction spend that nothing funds | 0 | Reviewer APPROVED, but the work collided: origin advanced 6 commits mid-cycle and the 03:25 guard-rails cycle had already landed both fixes. Rebase conflicted in 5 files and would have deleted `tests/guardrails.test.ts`. Reset to `f786ce2` rather than force-push over another cycle's work. Base verified green: tsc clean, 251 tests. |
| 2026-08-24 04:33 | LANDED | C3 | Zero-dwelling conversion options must not report as NDSS-compliant | 0 | 251→253 tests. allCompliant was `compliance.every(allPass)`, vacuously true over the empty units array of an unplannable envelope, so a £0-GDV option that builds nothing showed a green "NDSS compliant" badge. Now `residentialUnits > 0 && every(allPass)`; zero-dwelling options carry a warning and read "Not viable - no dwellings". Confirmed failing-first on a 3m-deep shallow floor. No-op on the demo: all 8 options keep bit-identical flags. No golden pin moved. |
| 2026-08-24 06:30 | ABANDONED | D3 | Validate cost-line discriminants in sanitizeSpec, and stop swallowing engine failures on the Appraisal page | 3 | Reviewer withheld approval after 3 rounds: runAppraisalForView drops the repairs it had already collected when a later stage throws, sanitizeSpec still throws outright on a non-array devCosts, the new test carries a false comment about H01's position, and the incidence rule's forward-compatibility hazard was left undocumented. Working tree reverted to 41d6e58; nothing committed. |
| 2026-08-24 07:35 | LANDED | D11 | Reject duplicate cost-line codes in the sanitiser and add an auditor tripwire that catches them | 0 | sanitizeSpec now de-dups devCosts by code (keeps the FIRST occurrence, reports each dropped copy as a repair) and a new costs-duplicate-codes tripwire fails on any spec still carrying a repeated code. A duplicated D01 previously swung S1 net profit from +779,614.9968750654 to -1,671,760.18 (-£2,451,375) silently against a green audit. Clean baseline 61→62 checks; 5 D11 tests confirmed failing-first. No golden pin moved. |

## Abandoned: D3

The work itself was reverted — `git checkout -- . && git clean -fd` against
`41d6e58` — so the next attempt starts from the same base this one did, not from
a half-landed version of it.

**Correction, made in the same cycle.** The first version of this section listed
four *observations* as the blocking objections. They were not. They are backlog
notes, and they are under **Candidate backlog** below where they belong. The
reviewer's actual round-3 required changes are the three quoted here, and it
stated explicitly that they are **documentation-only** — "Do not revert or alter
any engine, sanitiser or test behaviour to satisfy them — the code is correct and
I verified every acceptance figure." D3 was therefore abandoned on the rework-round
limit while its code stood verified, not because the implementation was wrong.
Whoever picks D3 up next should know that.

The reviewer's round-3 required changes, verbatim in substance:

1. **The new sanitiser docblock claimed audit coverage that does not exist.**
   `src/core/audit.ts` said "Duplicate codes are deliberately left alone: they
   already fail the `costs-lines` check, so they are not silent." Disproved in one
   probe: duplicating any cost line on the demo gives 0 repairs and a fully green
   audit — 61 checks, 0 fails. Same defect class as the round-2 objection: a
   safety property asserted in a comment that the code does not hold, copied from
   the specification without being checked.
2. **Log the duplicate-code hole as a real, unreported defect** — with the numbers
   that prove it, stated as unfixed rather than covered.
3. **Qualify "every repair here resolves to the interpretation that CHARGES the
   cost".** The `value` branch does the opposite: `Number.isFinite` is false for a
   numeric string, so a hand-edited `"value": "40000"` on `D02` is repaired to 0
   and the £40,000 utilities line is deleted — S1 goes 779,614.9968750654 →
   822,129.49 at 61/0. Pre-existing and out of scope, but the new sentence claimed
   it away.

Items 2 and 3 are now discharged independently of D3, since both describe the
engine as it stands with no D3 code in it: the duplicate-code hole is
**IMPROVEMENTS.md D11 (HIGH)** with its full table, and both it and the `value`
coercion behaviour are recorded in **AUDIT.md §6.7**. Item 1 lapsed with the
revert — the docblock it corrects no longer exists.

Also carried into AUDIT.md §6.7 from the round-1 refusal, because it constrains
any future attempt: pinning a known code's `whenIncurred` in both directions
narrows an explicit `'always'` and *invents* profit — `I01 = 'always'` priced
760,100.6324761845 stored versus 779,614.9968750654 repaired, **+£19,514.36**.
`'always'` is a superset a sanitiser may never narrow.

**Process note.** `.claude/appraisal-loop.md` allows up to **2** rework rounds;
this cycle ran **3**. `.claude/workflows/appraisal-improve.js` and the contract
disagree on the bound. Worth reconciling — the extra round is why the row above
reads 3.

## Candidate backlog (reviewer observations)

Findings the reviewer confirmed against the current base `f786ce2`, out of scope
for the cycle that surfaced them. Not acted on; recorded so a later planner can
pick them up. Each was re-verified against upstream before being written here —
observations that applied only to the abandoned local branch were discarded.

- **The A4 warning is a cliff, not a threshold.** `devFacilityNil` keys on
  `devFacilityEstimate === 0` exactly (`src/core/dcf.ts:365`). Probed on
  `DEMO_SCHEDULE`: equity £5,187,281 gives an estimate of £0.62, a fee of £0.01,
  a drawn peak of £1,446,776.30 and **no warning**; equity £5,187,282 gives an
  estimate of £0.00 and the full warning. The two states are economically
  identical and one is silent. When the fee-basis question (12) is answered, the
  warning should key on materiality — estimate materially below `peakDevBalance`
  — rather than on exact zero.
- **The arrangement fee is already levied on undrawn facility.** In the
  £100,000-equity probe `devFacilityEstimate` is £5,087,281.62 against a drawn
  peak of £4,495,586.91: £591,694.71 priced but never drawn, or 1.5% × £840,782
  = £12,612 of fee on the hole. AUDIT.md §6.6's note records the opposite
  direction (fee understated on the demo); both are the same root cause and the
  fee basis decides which way it errs.
- **`fundingShortfall` is measured on `cumNeed`, which includes VAT working
  capital** (`src/core/dcf.ts:516`). A shortfall driven wholly by equity-funded
  VAT — out at month 1, back at the reclaim month — would be described by the
  warning as spend that will "never be financed and carries no interest", which
  is stronger than the facts for that component. Not reproducible on the demo
  (opted-to-tax at default equity gives a peak shortfall of £0.00), so this is a
  wording refinement, not a number error.
- **The funding shortfall is warned about but never exported or shown.**
  `fundingShortfall` reaches `runAppraisal`'s warnings and the `plaus-funded`
  audit check, but `grep` finds it in neither `electron/xlsxExport.ts` nor
  `AppraisalView.tsx`. Missing: a `peakFundingShortfall` on `FinanceSummary`, an
  `(UNFUNDED)` row on the Funding panel, and a per-month shortfall column in the
  exported '7. App Model v2' cashflow block. The sheet is written sequentially,
  so the column is cheap — a candidate for the export backlog alongside the
  standing `DEV_COST_CELLS` seam.

**From the C3 cycle (2026-08-24 04:33), out of scope for that fix:**

- **The C3 spec's illustrative GDV figures are stale.** The shallow-floor
  `floor_through`/`whole_house` options are quoted at 124000 / 116250 in the
  spec's evidence block, but the actual engine output is 134333.47 / 125937.63.
  This is only in the spec's prose, not asserted anywhere, and both options are
  non-compliant with or without the fix, so it does not affect correctness.
  Noted so a future reader does not trust those spec numbers.
- **`generateOptions`' whole_house branch dereferences `plans[0].units[0]`**
  (`conversions.ts:329`) with no guard. On the shallow floor `planFloorThrough`
  still yields one unit so it survives, but a truly unplannable envelope (zero
  units on floor 0) would throw here. The `full_*` loop is wrapped in try/catch
  but the `whole_house` block is not. Pre-existing, not introduced by C3.
- **The C3 demo regression test hardcodes an exact 8-element `[true x8]`
  array.** If the demo building ever yields a 9th option the assertion breaks.
  Acceptable brittleness for a pin, but a length-scoped assertion would be more
  robust.

**From the abandoned D3 cycle (2026-08-24 06:30). The change was not approved
and was reverted; these are the reviewer's observations against it, recorded
but not acted on:**

- `value` coercion (pre-existing, backlog): a numeric string in a stored file
  is not finite, so the sanitiser zeroes it. `"40000"` on D02 deletes £40,000
  and lifts S1 to 822,129.49 with 61/0 and one repair reading
  `cost line D02: 40000->0`. Coercing a parseable numeric string before zeroing
  would make the value repair obey the same charge-the-cost principle the
  discriminant repairs now follow.
- `sanitizeSpec` still throws outright if `devCosts` is not an array: setting
  `spec.devCosts = {}` gives `spec.devCosts.forEach is not a function`. It is
  now caught by `runAppraisalForView` and shown in the new error panel rather
  than swallowed, which is a strict improvement, but repairing a non-array
  `devCosts` to `[]` with a repair note is the natural companion to D4.
- `runAppraisalForView` discards the repairs it had already collected when a
  later stage throws — `empty(error)` returns `repairs: []`. On the narrow path
  where `sanitizeSpec` repairs 17 inputs and then `runAppraisal` throws, the
  error panel cannot say so, and the repairs disclosure is the most useful
  diagnostic available at that moment. Returning the partial repair list
  alongside `error` would cost nothing.
- Test comment inaccuracy in `tests/inputvalidation.test.ts:245` — "H01 is the
  69th line of the default schedule". `DEFAULT_PRICING.devCosts` has 61 lines
  (61 distinct codes) and H01 is the 49th; the repair my probe observed is
  `cost line #49 code: ->LINE49`. The assertion itself is positional
  (`/^LINE\d+$/`) so nothing fails.
- Forward-compatibility of the incidence rule: because a shipped code's
  `whenIncurred` is now pinned to the standard line (only an explicit
  `'always'` is exempt), the day the UI lets a user edit incidence — or a
  `.pricing` preset written by another build carries a deliberate lateral tag
  through `loadPreset` at `src/views/PricingView.tsx:187` — the sanitiser will
  silently overwrite that choice. The code comment states the dependency
  ("nothing in this app can edit a line's incidence"), which is currently true;
  it is worth a note in IMPROVEMENTS.md so the validator is revisited if that
  stops being true.
- A repaired empty code becomes a synthetic `LINE49`, which `DEV_COST_CELLS` in
  `electron/xlsxExport.ts` cannot map, so that line's cost is in the engine but
  absent from its workbook cell. Equivalent to the pre-fix behaviour (an empty
  code did not map either), so not a regression — but it is another instance of
  the standing `DEV_COST_CELLS` weak seam.
- UX: the error panel shows the engine's raw message verbatim, e.g. "Cannot
  read properties of undefined (reading 'purchasePrice')". That is exactly what
  the specification asked for and the surrounding prose is plain English, but a
  JS TypeError is developer-speak for a QS audience; a future cycle could map
  the common shapes to a sentence naming the input.


## Awaiting the client

Two open (11 and 12, below). Everything the original audit raised is answered:

- Build cost inflation — own researched input, independent of HPI (done, AUDIT.md §6.4)
- Exit cost attribution — `whenIncurred` plus an `(I)` letting group (done, §6.5)
- Discounting — equity IRR by default, no hurdle; hurdle an optional UI input (unblocked, B1)
- ROI denominator — report both committed and drawn capital (unblocked, A5)
- Tax — pre-tax throughout, and say so (done in the assumptions and README)
- Refinance ICR — warn below 100% cover only, no covenant modelling (unblocked, A7)
- Estimator priority — the `(E)` and `(F)` holding/site-running groups first (goal C)
- Planning obligations — no CIL, no S106 (closed, B3)
- Leasehold — 999-year leases, freehold retained, nothing added to GDV (closed, B4)

**Two new questions, raised 2026-08-24 by the A4/A8 cycle's planner. Both are
commercial conventions the loop refuses to invent:**

- **11. Stretch / mezzanine funding terms.** The model can now *warn* that
  pre-construction spend exceeds bridge + equity, but it cannot *finance* it.
  If a scheme's bridge and equity do not cover pre-construction spend, what
  facility fills the hole and on what terms — rate pa, arrangement fee, exit
  fee, and does it rank behind the senior development loan? Until this is
  answered the gap is disclosed and charged no interest, which flatters the
  funded cases.
- **12. Basis of the development-loan arrangement fee.** Is the fee priced on
  the facility *committed at signing* (the current E29 estimate) or on the
  facility *actually drawn*? On the demo the fee is charged on £3,787,282
  while the cashflow peaks at £3,982,955 — a £195,674 gap, understating the
  fee by ~£2,935 plus its rolled interest. In the over-equitised probe the
  error runs the other way: £591,694 of facility is priced but never drawn,
  levying ~£12,612 of fee on a hole. Repricing would move golden pins, so it
  needs the client's word on how their lenders actually charge it.

The loop will add new entries here if a cycle hits something it refuses to decide alone.

**Raised 2026-08-24 by the D11 reviewer (duplicate cost codes). Not acted on.**

- **Pre-existing, out of scope: two call sites bypass the sanitiser.**
  `OptionsView.tsx:27` (`runAppraisal(o.schedule, project.pricing, ...)`) and
  `PricingView.tsx:130` call `runAppraisal` on the RAW, un-sanitised spec, not
  `sanitizeSpec(...).spec`. A stored project carrying a duplicate cost code would
  therefore still show the doubled (wrong) cost in the Options net-profit list
  and the Pricing preview, because those two call sites bypass the new de-dup
  entirely and never invoke `auditAppraisal` (so the tripwire cannot warn there
  either). Only `AppraisalView` (lines 48-51) benefits from the fix. This is a
  variant of the already-logged IMPROVEMENTS.md:289 divergence and a reasonable
  backlog candidate; it is not introduced by this change.
- **Deliberately-scoped residual: root-cause by-code resolution left in place.**
  `audit.ts:314`, `allLines.find((l) => l.code === specLine.code)` in
  costs-lines, compares a doubled line against itself when handed an unsanitised
  dup spec. The spec explicitly declared a broader rework out of scope; the new
  costs-duplicate-codes tripwire guards it. Confirmed: on an unsanitised
  D01-dup spec, costs-lines still PASSES while costs-duplicate-codes FAILS
  (failCount 1), so the blindness is now caught.
- **Minor cosmetic (no action needed).** The tripwire builds a detail string
  `'duplicated code: '` even when there are no duplicates, but the `ok()` helper
  (audit.ts:270) sets detail to undefined on pass, so the empty-join string is
  never surfaced. Only real codes appear, and only on failure.
