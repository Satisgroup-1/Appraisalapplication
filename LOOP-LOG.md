# Loop log

Every firing of the hourly improvement Routine appends one row here, whether it
landed or not. `./scripts/loop-status.sh` reads this file plus the git history
and prints the current state of the loop.

Columns: when (UTC) · outcome · item · title · rework rounds · what happened.

| When | Outcome | Item | Title | Rounds | Note |
|---|---|---|---|---|---|
| 2026-08-24 02:24 | SETUP | — | Loop established: planner, builder, reviewer; hourly Routine | 0 | Baseline before the first cycle: 228 tests, 53 audit checks, 9 of 37 findings closed |
| 2026-08-24 03:25 | LANDED | 5 | Guard rails on degenerate inputs, and the plausibility checks that catch them (A4, A6, A8, A9 + E3) | 1 | 228→251 tests, 53→61 audit checks. 18 tests confirmed failing first. One rework round: `plaus-icr` initially failed on the demo's real ICR of 0.87, which broke five existing "audit is clean" tests and showed the check was conflating a weak deal with a model defect — recast as "below cover is never unflagged". No golden pin moved. |

## Awaiting the client

Nothing. Every question the audit raised has been answered:

- Build cost inflation — own researched input, independent of HPI (done, AUDIT.md §6.4)
- Exit cost attribution — `whenIncurred` plus an `(I)` letting group (done, §6.5)
- Discounting — equity IRR by default, no hurdle; hurdle an optional UI input (unblocked, B1)
- ROI denominator — report both committed and drawn capital (unblocked, A5)
- Tax — pre-tax throughout, and say so (done in the assumptions and README)
- Refinance ICR — warn below 100% cover only, no covenant modelling (unblocked, A7)
- Estimator priority — the `(E)` and `(F)` holding/site-running groups first (goal C)
- Planning obligations — no CIL, no S106 (closed, B3)
- Leasehold — 999-year leases, freehold retained, nothing added to GDV (closed, B4)

The loop will add new entries here if a cycle hits something it refuses to decide alone.
