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
