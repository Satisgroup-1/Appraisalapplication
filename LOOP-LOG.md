# Loop log

Every firing of the hourly improvement Routine appends one row here, whether it
landed or not. `./scripts/loop-status.sh` reads this file plus the git history
and prints the current state of the loop.

Columns: when (UTC) · outcome · item · title · rework rounds · what happened.

| When | Outcome | Item | Title | Rounds | Note |
|---|---|---|---|---|---|
| 2026-08-24 02:24 | SETUP | — | Loop established: planner, builder, reviewer; hourly Routine | 0 | Baseline before the first cycle: 228 tests, 53 audit checks, 9 of 37 findings closed |
| 2026-08-24 12:10 | ABANDONED | A4 | Floor the facility at the bridge redemption, not at zero (manual cycle) | 1 | Plan, build and audit all completed and the reviewer APPROVED after one rework; abandoned at the push because origin had advanced 21 commits across 30 overlapping files. A4 was already fixed on the branch, but by flooring the WHOLE estimate, which prices a £1,446,776 drawn facility at a £0 fee. Finding and the exact fix filed as A12. |
| 2026-08-24 03:25 | LANDED | 5 | Guard rails on degenerate inputs, and the plausibility checks that catch them (A4, A6, A8, A9 + E3) | 1 | 228→251 tests, 53→61 audit checks. 18 tests confirmed failing first. One rework round: `plaus-icr` initially failed on the demo's real ICR of 0.87, which broke five existing "audit is clean" tests and showed the check was conflating a weak deal with a model defect — recast as "below cover is never unflagged". No golden pin moved. |
| 2026-08-24 03:51 | ABANDONED | A4+A8 | Floor the development facility at zero, and disclose pre-construction spend that nothing funds | 0 | Reviewer APPROVED, but the work collided: origin advanced 6 commits mid-cycle and the 03:25 guard-rails cycle had already landed both fixes. Rebase conflicted in 5 files and would have deleted `tests/guardrails.test.ts`. Reset to `f786ce2` rather than force-push over another cycle's work. Base verified green: tsc clean, 251 tests. |
| 2026-08-24 04:33 | LANDED | C3 | Zero-dwelling conversion options must not report as NDSS-compliant | 0 | 251→253 tests. allCompliant was `compliance.every(allPass)`, vacuously true over the empty units array of an unplannable envelope, so a £0-GDV option that builds nothing showed a green "NDSS compliant" badge. Now `residentialUnits > 0 && every(allPass)`; zero-dwelling options carry a warning and read "Not viable - no dwellings". Confirmed failing-first on a 3m-deep shallow floor. No-op on the demo: all 8 options keep bit-identical flags. No golden pin moved. |
| 2026-08-24 06:30 | ABANDONED | D3 | Validate cost-line discriminants in sanitizeSpec, and stop swallowing engine failures on the Appraisal page | 3 | Reviewer withheld approval after 3 rounds: runAppraisalForView drops the repairs it had already collected when a later stage throws, sanitizeSpec still throws outright on a non-array devCosts, the new test carries a false comment about H01's position, and the incidence rule's forward-compatibility hazard was left undocumented. Working tree reverted to 41d6e58; nothing committed. |
| 2026-08-24 07:35 | LANDED | D11 | Reject duplicate cost-line codes in the sanitiser and add an auditor tripwire that catches them | 0 | sanitizeSpec now de-dups devCosts by code (keeps the FIRST occurrence, reports each dropped copy as a repair) and a new costs-duplicate-codes tripwire fails on any spec still carrying a repeated code. A duplicated D01 previously swung S1 net profit from +779,614.9968750654 to -1,671,760.18 (-£2,451,375) silently against a green audit. Clean baseline 61→62 checks; 5 D11 tests confirmed failing-first. No golden pin moved. |
| 2026-08-24 08:51 | LANDED | A5 | Report investor ROI on both committed and drawn capital, in every profit mode | 0 | `investorCapital` was `mode === 'waterfall' ? drawnPeak : committed`, so an economically identical deal (no pref, 50/50 residual, equity 5,000,000 at investorShare 0.5) reported the same S1 investorProfit of 468,825.94 as 18.753% in simple mode and 24.672% in waterfall - 5.92 points apart on a presentation switch - while the investor's drawn peak and the developer's committed summed to 4,400,218.69, which is neither the 5,000,000 committed nor the 3,800,437.38 drawn. `WaterfallResult` now carries investorCommitted / investorDrawnPeak / developerCommitted / developerDrawnPeak and four ROI figures (on committed, on drawn, and their pa pair), each null on a zero base per the A9 precedent; both parties' peaks come from one traversal of the same `equityMonth` series. Additive, so stored projects load unchanged (demo S1 still 700,000 capital, ROI 0.556867854910761, profit 389,807.4984375327). Audit checks 62 -> 65: +3, one capital-basis reconciliation per profit scenario (wf-s1/s2/s4-capital); failCount unchanged at 0. 258->265 tests; tests/roi.test.ts 7 tests, all 7 confirmed failing at 0b2a57e. No golden pin in tests/dcf.test.ts moved. |
| 2026-08-24 10:32 | LANDED | NEW-sanitised-spec-everywhere | Price every screen from the repaired spec: one appraisal entry point for Options, Pricing and Appraisal | 0 | New pure module `src/core/appraise.ts`; `appraiseProject(input, {audit?})` runs sanitizeSpec -> repairSchedule -> runAppraisal -> auditAppraisal (audit opt-in, since 65 re-derivations per option card is not free), never throws, and returns the result **together with the repaired spec and schedule it was computed from**, the repairs and an error string. `OptionsView` priced the card's "S1 profit" from the RAW spec inside a bare `catch {}` and `PricingView` briefed the finance-research agent from the same raw figure, so only `AppraisalView` sanitised or disclosed anything. `PctField` has no min/max, so 450 in the bridge-rate box (4.5 = 450% pa) and 90 in the agent-fee box (0.9 of GDV) need no file editing: `full_max_units` then read -7,365,660.64 on the Options grid against +431,604.10 on the Appraisal page under "65 checks, 0 fails, 2 input repairs applied" - a 7.80m sign flip; `full_family` -7,346,488.69 vs +451,889.79; `DEMO_SCHEDULE` -7,173,576.86 vs -558,799.21. Reproduced again with D11's duplicated D01: card -1,671,760.18 vs appraisal +779,614.997. The research brief is now read ENTIRELY from the repaired spec - an earlier cut sent the repaired GDV/facility with the raw `purchasePrice`/`bridgeLtv`, asking for bridge terms at 700% LTV against a facility sized at the clamped 100%. "Nothing to price" (`error: null`) stays distinct from "pricing failed", and on failure the repairs already collected are reported rather than discarded with the exception; a failed run no longer reads "No option selected yet." A zero-dwelling option (0.3-scaled `DEMO_BUILDING`) no longer prints -2,790,709.02 - the sunk cost of building nothing - beside its own "Not viable - no dwellings" badge. Clean demo unchanged: 779,614.9968750654, 65 checks / 0 fails / 0 repairs, all 8 demo options bit-identical. 265 -> 293 tests (new `tests/appraise.test.ts`). No financial default and no golden pin moved; `tests/dcf.test.ts` untouched. |

| 2026-08-24 11:32 | LANDED | D4 | Validate the three unchecked enum inputs in sanitizeSpec, and stop the auditor losing checks to a bad one | 0 | `sanitizeSpec` validated only `sdlt.regime`; `buildCostMode`, `vat.fundedBy` and `waterfall.mode` are each read in dcf.ts as `=== 'literal'`, so a corrupt value silently took the else-branch and every one of the three flattered the deal. On `full_balanced` of DEMO_BUILDING against a 0-repair / 65-check / S1 2,079,630.1602789517 baseline: `buildCostMode: 'typo'` gave 0 repairs, 65/0 and S1 2,331,378.373762631 (+GBP251,748.21, D01 falling back to the fixed 2,305,099 instead of the room-rate build-up, -GBP221,661.94 of build cost); `waterfall.mode: 'typo'` gave 62/0 - three checks FEWER - paying the simple 1,039,815.08 while the result carried 'typo' back out, so WaterfallTable rendered nothing (a real waterfall pays 1,072,525.53); `vat.fundedBy: 'typo'` gave S1 2,058,321.90 against 2,041,265.01 on a real 'vatLoan', GBP17,056.89 of fee and interest nobody was charged for a facility the file claimed. `fixEnum` now resolves all four with a reported repair; for the three new ones the fallback IS the branch the engine already took, so no stored figure moves - disclosure, not a re-price. `sdlt.regime` is the exception and is documented as such: an unrecognised regime takes the AUTOMATIC arm, `computeSdlt` has no default case and the appraisal goes NaN (raw NaN vs sanitised 2,079,630.1602789517), so 'manual' is justified by keeping the solicitor's typed B04. Second hole, same instrument: the auditor's simple-split gate was `mode === 'simple'` while the engine's is `mode === 'waterfall' && netProfit > 0`, so a LOSS-MAKING waterfall - shared pro rata because no pref is payable out of a negative number - also lost wf-s1/s2/s4-simple; at priceAdjust -0.5 with pref 0.08 / residual 0.7, S1 -1,795,885.48 and investor -897,942.74 = netProfit x 0.5, reported 62 against 65 for the identical loss papered as a simple split. The gate is now the literal negation of the engine's. New `inputs-enums` tripwire (D11 mould) fails on any spec still carrying a bad discriminant - defence in depth, not a live catch: D12 landed mid-cycle so every screen now audits a sanitised spec, and the code comments say so rather than repeating the closed OptionsView/PricingView rationale. Incidental: the auditor THREW on a raw bad SDLT regime because B04 was undefined and `gbp()` died on `undefined.toLocaleString()`; `gbp()` is now total, byte-identical for every finite value and for NaN. Exact count pins 65 -> 66 in two suites - appaudit.test.ts's clean-spec pin and both of D12's appraise.test.ts pins, re-measured after the merge - the +1 being the new tripwire passing, failCount still 0, no existing check changed verdict. 293 -> 300 tests; tests/enums.test.ts, 6 of its 7 confirmed failing at 2dfdf20 (F2 passes both sides by design, pinning that a PROFITABLE waterfall is still not reconciled as a simple split). No golden pin in tests/dcf.test.ts moved and no financial default changed. AUDIT.md 6.10. |

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


**Raised 2026-08-24 by the D4 reviewer (spec discriminants). Not acted on.**

- **PRE-EXISTING, blocking nothing here: the `whole_house` demo option fails
  `cf-retention` on the SHIPPED defaults**, identically before (64 checks / 1
  fail) and after (65 / 1 fail) this change. Detail: "withheld GBP30,370.3 vs
  released GBP0", because `r.programme.pcMonth` is 112 against `MONTHS = 48` —
  the programme runs past the cashflow horizon, so retention is withheld and
  never released. Real money that never comes back, on a conversion type the app
  offers. Worth a backlog item: either extend/flag the horizon, or refuse to
  report a scheme whose PC falls outside it.
- **The new `inputs-enums` tripwire cannot fail anywhere in the running app.**
  `auditAppraisal` has exactly one caller, `src/views/AppraisalView.tsx:51`, and
  it is handed `clean.spec` — the sanitised spec, which by construction always
  passes. `src/views/OptionsView.tsx:27` and `src/views/PricingView.tsx:130` do
  call `runAppraisal` on the RAW project spec, which is the rationale the
  specification gave, but neither calls the auditor, so a corrupt discriminant
  still moves the option-comparison net profit and the pricing preview with no
  tripwire and no repair note. The check is sound defence-in-depth for future
  callers; closing the actual hole means sanitising (or auditing) in those two
  views. *(Superseded in part while this cycle ran: the
  NEW-sanitised-spec-everywhere cycle above routed all three views through
  `appraiseProject`, which sanitises before it audits. The observation's
  conclusion stands — the tripwire is defence in depth, not a live catch — and
  the code comments were amended at landing to say that instead of the stale
  raw-spec rationale.)*
- **Goal-A / disclosure strength.** `AuditStrip`
  (`src/views/AppraisalView.tsx:164-190`) renders a repair as the tail of one
  line — "· 1 input repair applied" — inside a collapsed `<details>`, while the
  badge still reads a green "Audit passed" and the box keeps the `ok-box` class.
  A repair whose consequence is GBP251,748 of profit deserves the warn state, or
  at least an un-collapsed note. Out of scope here (the specification forbade
  touching `src/views/`), but the disclosure this cycle buys is quieter than the
  number behind it.
- **Same class as D4, not covered by it: the BOOLEAN discriminants are still
  unvalidated** — `finance.vat.optedToTax`, `finance.hpi.enabled`. A stored file
  carrying the string "false" is truthy, so VAT (and with it the SDLT chargeable
  consideration, `sdlt.ts:74`) switches on with no repair and no check.
  `buildInflation.enabled` is already guarded by a `typeof === 'boolean'` test in
  `sanitizeSpec`; the other two are not. A one-line extension of the same
  pattern, for a later cycle.
- **Documentation imprecision, harmless.** The `fixEnum` docstring, the SDLT
  call-site comment and AUDIT.md 6.9 all say "dcf.ts gates the automatic
  calculation on `regime !== 'manual'`". The gate is actually `sdltForFinance` at
  `src/core/sdlt.ts:80` (`if (regime === 'manual') return null`);
  `dcf.ts:226-227` only branches on its null. The cited `src/core/sdlt.ts:60` for
  `computeSdlt`'s missing default case is correct.
- **Process note for the planner.** This specification's blast radius asserted
  "no test pins an exact count", which was wrong — `tests/appaudit.test.ts:199`
  pinned `passCount` at 65 — and its acceptance criterion F then forbade editing
  any existing test. The two were unsatisfiable together. A grep for exact-count
  assertions belongs in the blast-radius section of any item that adds or removes
  an audit check. *(It bit twice: D12's `tests/appraise.test.ts` added two more
  exact pins on the same count while this cycle was in flight, and both had to be
  moved 65 -> 66 at landing.)*


## Awaiting the client

Four open (11 and 12 below, plus A10 and the D4 cycle's restatement of 12).
Everything the original audit raised is answered:

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

**Raised 2026-08-24 by the D4 cycle. Mirrored from IMPROVEMENTS.md "Open
questions" 12-13 so the status view surfaces them; both are blocked on the
client and neither will be picked by the loop:**

- **A10 — mixed-use refinance.** On a scheme with a retained commercial unit, S3
  currently advances against the WHOLE asset at the residential `refinance.ltv`
  (65%) and prices it at the residential rate (5.5%), including the demo's
  GBP14,400 pa of commercial rent. Which convention do you want: (a) one blended
  facility as now, (b) the commercial unit excluded from the refinance and held
  unencumbered, or (c) a separate commercial facility — and if (c), at what LTV,
  rate and arrangement fee? Any of (b) or (c) reduces the modelled advance, so
  this moves stored S3 figures and the loop will not choose it for you.
- **Q12 — basis of the development-loan arrangement fee.** Remains open, and now
  blocks two backlog items rather than one: the A4 residual (the fee is charged
  on a facility estimate of GBP3,787,282 against a cashflow peak of
  GBP3,982,955 on the demo, and on GBP591,694 of never-drawn facility in the
  over-equitised probe) and the reviewer's "cliff, not a threshold" observation
  on the `devFacilityNil` warning. Is the fee priced on the facility committed at
  signing, or on the facility actually drawn?

**From the A5 cycle (2026-08-24 08:51), recorded by the reviewer and not acted
on in that change:**

- **The audit failure `detail` for the two ROI limbs names the BASE, not the
  failing product.** It reads `ROI on committed x £2,500,000 vs investor
  profit £468,825.94`, but the two figures actually compared are `roi * base`
  and `investorProfit`, so a reader of a genuine failure sees an operand where
  they expect the mismatching total. The committed/drawn/within limbs do print
  both compared figures correctly. Cheap fix: print `gbp(roi * base)` instead
  of `gbp(base)`.
- **S3's cash-on-cash now sits under a header reading `Investor ROI
  (committed)`** (`AppraisalView.tsx:284`), and the new comment calls it "a
  committed-capital measure". It is neither investor-level nor committed:
  `cashOnCash = netAnnualCashflow / equityRemaining` where `equityRemaining =
  f.equity.total - surplusReleased` is the WHOLE equity left in the deal after
  refinance, not `x investorShare`. The mislabel is pre-existing (the column was
  already headed 'Investor ROI'), the specification directed exactly this
  placement, and no number moved - but the sharper header makes the wrong basis
  more explicit. Either scale S3 by `investorShare` or give the S3 cell its own
  labelled measure.
- **The new `wf-<s>-capital` check fires on inputs the sanitiser would have
  repaired but PricingView bypasses.** `investorShare = 1.5` on £5m equity gives
  `investorCommitted` 7,500,000 and `developerCommitted` -2,500,000, and all
  three limbs fail with `drawn £5,700,656.07 vs peak equity drawn
  £3,800,437.38`; `equity.total = -100` fails with `investor drawn £0 exceeds
  committed £-50`. Arguably correct - nonsense input is now flagged rather than
  silently modelled - but the detail blames the capital stack rather than the
  input. It reinforces the standing 'Awaiting the client' item that
  OptionsView/PricingView bypass `sanitizeSpec`; nothing to do in A5 itself.
- **The scenario-comparison table has no on-screen note explaining the two
  bases** (the existing `<p className="note">` covers only S3). A one-line note -
  'ROI shown on capital committed and on peak capital drawn; the two coincide
  when the equity is fully called down' - would make the new column
  self-explanatory per goal A. Nice-to-have, not required.
- **Residual recorded and accepted:** the legacy `investorCapital` /
  `investorRoi` / `investorRoiPa` still return a mode-dependent denominator
  (2,500,000 in simple vs 1,900,218.69 in waterfall on the probe). Nothing in
  `src/` or `electron/` reads them any more (grep confirms only
  `AppraisalView`, which now reads the explicit pair) and no ROI reaches the
  workbook, so the exposure is a future consumer only. Retiring them is a
  separate change.
- **Discharged at the landing step, not left open.** The reviewer noted that
  AUDIT.md §6.8 said "6 tests, all 6 failing" while the shipped
  `tests/roi.test.ts` contains 7, and that `.claude/appraisal-loop.md:65` still
  read "Not yet built (A5)". Both were corrected in the landing commit: the
  7-failing claim was re-verified in a worktree at `0b2a57e` (`Tests 7 failed
  (7)`, the seventh failing on `expected undefined to be 700000`) before the
  wording was tightened.

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

**Raised 2026-08-24 by the NEW-sanitised-spec-everywhere reviewer (one appraisal
entry point). Not acted on.**

- **The Options repair COUNT still de-duplicates, so it can under-report.**
  `OptionsView` filters repair strings before counting (`if
  (!repairs.includes(line))`, `OptionsView.tsx:51-54`), so an identical repair
  emitted twice for one spec is counted once. Measured: `DEFAULT_PRICING` with
  `D01` present three times gives `sanitizeSpec` **two** `cost line D01
  duplicated->removed` repairs, so the Appraisal audit strip reads "2 input
  repairs applied" while the Options warn-box reads "1 input repair(s) applied".
  Fix: count one option's `repairs.length` — every option is priced from the
  same spec, and generated schedules produce no schedule repairs (verified
  `repairs: []` on all 8 demo options for both the clean and the typo spec) —
  instead of de-duplicating across the set. Same divergence family this item
  exists to remove, but a count only: the profit figures agree.
- **`PricingView`'s `!option` path still briefs the research agent from the raw
  finance block** (`deal` initialiser, `PricingView.tsx:132`). With `bridge.ltv
  = 7` and no generated option, `electron/estimate.ts:344` renders "700% LTV" in
  the prompt. Self-consistently raw (facility 0, GDV 0), so not the
  half-repaired brief that was refused, but the fat-finger value still reaches
  the agent. Fixing it needs a sanitised-spec-without-a-result channel, which
  criterion 5 and the `spec: null whenever result is` docblock deliberately
  forbid — a design question for the backlog, not a patch.
- **A zero-dwelling option now makes the finance research FAIL outright**, while
  `option === null` proceeds with "a GDV not yet established". `generateOptions`
  emits these — on a 0.3-scaled `DEMO_BUILDING`, `full_max_units`,
  `full_balanced` and `full_family` all come back with `schedule: []`.
  `appraiseProject` classifies the empty schedule as nothing-to-price (`error
  === null`) and the view converts that non-error into a thrown error, so a
  project whose `options[0]` is non-viable cannot research finance rates at all.
  Falling back to the unpriced brief in that case would match the module's own
  classification; the current message is at least honest and tested.
- **Pre-existing, not this change: `whole_house` on `DEFAULT_PRICING` audits
  63 pass / 1 FAIL** — `cf-retention: withheld GBP30,370.3 vs released GBP0`.
  Its `pcMonth` is 112 and the defects-period release at month 118 falls past
  the model horizon, so the retention pot never empties and the withheld =
  released identity is genuinely broken for that option. Reproduced identically
  at `2dfdf20` through the old sanitizeSpec -> repairSchedule -> runAppraisal ->
  auditAppraisal chain. AUDIT.md 6.9 mentions it in passing; it has no row in
  IMPROVEMENTS.md and should get one.
- **Pre-existing: the last raw-spec-derived money figures on screen.**
  `PricingView`'s "SDLT computed" readOnly field (`PricingView.tsx:505`) and the
  B04 "auto:" cell (`PricingView.tsx:911-912`) derive from the RAW `fin`, so on
  a spec whose `purchasePrice` the sanitiser clamps, that display is not the
  SDLT the engine charges. Defensible on the page where the user is editing the
  raw input, but they are the last two.
- **The source-scraping assertion in `tests/appraise.test.ts` is brittle.**
  `briefFieldAfterPricing` extracts `<field>: <expr>,` by regex and evaluates it
  with `new Function`, so any reformatting of `runFinanceEstimate` — a
  trailing-comma-free last field, or a comment containing `purchasePrice: x,` —
  changes the match count. It fails loudly rather than silently (the
  `reads.length === 1` assertion), so it is safe, but a future refactor will pay
  for it.
- **No `LOOP-LOG.md` row existed at review time**, correctly per the standing
  decision that the `LANDED` row is written only after the push succeeds.
