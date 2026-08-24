# Standing decisions for the improvement loop

Every agent in the loop reads this file first. It is the contract: where the
loop may act, what it may not do, and what the client has already decided.
When a decision here conflicts with an agent's own judgement, this file wins.
When something is genuinely not covered, the planner records the question in
`IMPROVEMENTS.md` under **Open questions** rather than guessing.

## The three goals (client's words, 2026-08-24)

- **A — Simple, intuitive UI.** Screens that need no explanation, with an easy
  path to *add* complexity: progressive disclosure, not a wall of inputs. A
  simple mode that just works, and optional depth for the ones who want it.
- **B — Additive.** New features, estimators for more line items, more
  conversion types. Growth, not churn: do not rewrite what works.
- **C — Estimator precision.** Every researched input as tight and as
  well-evidenced as it can be made — better prompts, better anchoring on the
  user's own tender/term-sheet records, narrower honest ranges, and refusal to
  guess where evidence is thin.
  **First target, chosen by the client 2026-08-24: holding and site-running
  costs — the `(E)` during-construction and `(F)` post-completion groups.**
  These are now per-month figures, so estimator precision here scales with the
  hold period and matters most on exactly the slow-sales case the model exists
  to stress. Professional fees, acquisition costs and sales & marketing are
  candidates for later, not now.

## Operating rules

| Rule | Decision |
|---|---|
| Branch | `claude/audit-application-appraisal-model-3ih1fl`. Never any other. |
| Autonomy | Commit and push each approved cycle. No pull requests. |
| Order of work | **Correctness backlog first**, then additive goals. A new feature built on a known defect inherits it. |
| Audit authority | **Hard veto.** Nothing commits while the reviewer objects. Up to **2** rework rounds, then abandon the item, revert the working tree, and log the objection. |
| Cadence | One cycle per hour, one item per cycle. |
| Green bar | `npx tsc --noEmit` and `npm test` must both pass before a commit. Non-negotiable. |
| Failing-first | Every fix needs a test that demonstrably failed before it. A fix without one does not count as done. |
| Golden pins | A pin in `tests/dcf.test.ts` may only move with the delta and its mechanic stated in both the test comment and the commit message. |
| Documentation | Confirmed findings go in `AUDIT.md`; the item is struck through in `IMPROVEMENTS.md` with a one-line result and any residual. |

## Hard limits — never, whatever the reasoning

- Never weaken, skip, delete or loosen the tolerance of a test to make a
  change pass. If a test is genuinely wrong, say so explicitly and separately.
- Never change a financial default (rates, fees, cost values, band
  thresholds) in order to make figures agree. Those are the client's
  commercial inputs and statute.
- Never enable a model behaviour by default that would move a **stored
  project's** numbers on load. New behaviour ships off, with a migration that
  gates on an explicit flag — the `sdlt: {}` trap in AUDIT.md §6.1 finding 8
  is the pattern to avoid.
- Never remove or bypass a warning, an audit check, or a sanitiser.
- Never push to a branch other than the one above, and never open a PR.
- Never claim a verification you did not run. Paste the actual output.

## Decisions already taken (do not re-litigate)

| Topic | Decision |
|---|---|
| Build cost inflation | Own researched input (`buildInflation`), **independent** of HPI. Done, AUDIT.md §6.4. |
| Exit cost attribution | Per-line `whenIncurred` flag plus an `(I)` letting group. Done, §6.5. |
| Discounting (B1) | **UNBLOCKED 2026-08-24.** Compute and headline **equity IRR by default, with NO hurdle rate** — so no discount-rate assumption enters the model uninvited. Add an **optional hurdle-rate input in the UI**; when the user sets one, show NPV at that rate and mark the IRR as clearing or missing it. Empty hurdle is the default and must stay valid: IRR only, no NPV, no pass/fail. IRR from the monthly equity cashflow (bisection on the actual flows), never an annualised ROI. Guard the no-sign-change case rather than returning a fake number. |
| ROI denominator | Report **both** committed and drawn capital, in every profit mode. Not yet built (A5). |
| Tax | **DECIDED 2026-08-24: keep the model PRE-TAX.** No corporation tax on SPV profit, no VAT on works. Investors model their own tax. Do not add either. The README and the exported assumptions must SAY the figures are pre-tax rather than leaving it to be inferred. |
| Planning obligations | Undecided. Do not add CIL/S106 lines without asking. |
| Leasehold structure | Undecided. Do not add ground rent or reversion value without asking. |
| Refinance ICR (A7) | **DECIDED 2026-08-24: warn below 100% only.** No covenant modelling, no stress rate, no capping of the advance. Simply flag when net rent does not cover mortgage interest at all — the demo's ICR of 0.87 must produce a visible warning. Do not invent a 125%/145% test. |

## Known weak seams

- **`electron/xlsxExport.ts`'s `DEV_COST_CELLS` mapping.** It has produced the
  same export/engine divergence three times (AUDIT.md §6.2 finding 9, §6.4,
  §6.5). Any change touching cost lines, build cost or scenario figures must
  check the exported workbook agrees with the engine, and a structural fix to
  this mapping is a standing candidate for the backlog.
- **The layout packer is bounding-box based.** Areas are now clipped correctly
  (§6.3) but a notched floor is under-packed. A polygon-aware packer is a
  large, separate job.
- **`AppraisalView`'s bare `catch {}`** swallows every engine exception and
  renders "No option selected yet" (D3). Fix before adding engine paths that
  can throw.
