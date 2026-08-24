# Loop log

Every firing of the hourly improvement Routine appends one row here, whether it
landed or not. `./scripts/loop-status.sh` reads this file plus the git history
and prints the current state of the loop.

Columns: when (UTC) · outcome · item · title · rework rounds · what happened.

| When | Outcome | Item | Title | Rounds | Note |
|---|---|---|---|---|---|
| 2026-08-24 02:24 | SETUP | — | Loop established: planner, builder, reviewer; hourly Routine | 0 | Baseline before the first cycle: 227 tests, 53 audit checks, backlog items D1 D2 C1 A1 A2 A3 done |

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
