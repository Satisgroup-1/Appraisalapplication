# Improvement list — application & appraisal model

Audit date 2026-08-24, against `main` at v0.2.3. Baseline is healthy: 145 tests green,
`tsc --noEmit` clean, and AUDIT.md §1-6 already documents the workbook parity work, the v2
timing deviations and eight previously-fixed defects. **Nothing below repeats AUDIT.md.**
Every finding here was reproduced numerically on the bundled demo scheme (12 units, £1.95m
purchase, £6.25m GDV) or on a minimal probe; the figures quoted are actual engine output.

Severity is *decision impact*: HIGH means an appraisal can be materially wrong without
anything on screen saying so.

---

## A. Appraisal model — financial correctness

### A1 — HIGH · ~~HPI inflates revenue but nothing inflates build cost~~ · **FIXED 2026-08-24**
`src/core/dcf.ts:613` indexes GDV forward to PC by the HPI projection. No cost line is
indexed, and there is no build-cost-inflation input anywhere in `FinanceInputs`.

Demo, 5% pa HPI over a 15-month programme:

| | GDV at PC | Build cost | S1 net profit |
|---|---|---|---|
| HPI off | £6,248,229 | £2,305,099 | £779,637 |
| HPI on | £6,641,154 | £2,305,099 | £1,166,513 |

**+£386,876 of profit created purely by the passage of time.** Real tender prices move with
BCIS/labour inflation over the same 15 months; on a £2.3m contract even 4% pa is ~£115k. The
model currently rewards a *longer* programme, which inverts the true risk. Turning HPI on is
therefore not a conservative act, and the estimates flow encourages exactly that (the sales
research run fills the HPI array automatically).

Fix: a `buildInflationPa` input applied to the contract sum over the pre-construction and
construction period (and to the room rates), defaulting to something non-zero, plus a
sensitivity axis on it. See question 1.

### A2 — HIGH · ~~Scenario 3 (refinance & hold) pays full selling costs on a sale that never happens~~ · **FIXED 2026-08-24**
`unrealisedProfit` (`src/core/dcf.ts:686`) is `netProfit1`, which carries the whole `(G) Sales
& marketing` group. On the demo that group is £143,723:

| Line | Amount |
|---|---|
| G01 Show apartment | £20,000 |
| G02 Marketing materials | £10,000 |
| **G03 Sales agent fees (% of GDV)** | **£93,723** |
| G04 Sales legals (per unit) | £9,000 |
| G05 Photography & video | £6,000 |
| G06 Other | £5,000 |

In a hold, the £93,723 agent fee and £9,000 sales legals are not incurred, and the show flat /
brochure spend is at best partly incurred. The mirror gap is that S3 has **no letting costs at
all** — tenant-find fees, EPCs, inventory/furnishing, first-let voids, HMO/selective licensing —
so the hold case is simultaneously overcharged for selling and undercharged for letting.

Fix: attribute cost lines to the exits they occur in (a `whenIncurred: 'always' | 'onSale' |
'onLet'` flag on `DevCostLine`), and add a letting-cost group used by S3.

### A3 — MEDIUM/HIGH · ~~Post-completion holding costs never lengthen with the hold period~~ · **FIXED 2026-08-24**
`(F) Post construction` is a fixed set of amounts spread over `postConMonths`
(`src/core/dcf.ts:271`). The *total* is constant however long the sell-down runs:

| Sales velocity | Sell-out | (F) holding total | S2 extra interest |
|---|---|---|---|
| 4 / month | 3 months | £13,550 | £42,681 |
| 2 / month | 6 months | £13,550 | £71,459 |
| 0.5 / month | 24 months | £13,550 | £257,226 |

Interest correctly scales 6× while council tax, insurance and utilities on unsold flats stay
flat. Empty-homes council tax premiums make this worse in reality, not better. The slow-sales
case — the one the scenario exists to test — is the one it understates.

Fix: express (F) lines as £/month (or £/unit/month) and accrue them over the actual hold, in
both the cashflow and the S2/S4 profit bridge.

### A4 — MEDIUM · ~~Over-equitised schemes book a *negative* dev-loan arrangement fee~~ · **FIXED 2026-08-24**
`devFacilityEstimate = totalPreFinance − equity − bridgeAdvance + estRedemption`
(`src/core/dcf.ts:253`) is unfloored. Demo with £6m equity against £5.1m of costs:

- `devFacilityEstimate` = **−£812,740**
- `devArrangementFee` = **−£12,191** — phantom finance *income* reducing total costs

No warning fires. A cash-rich deal (or a user testing "what if we just fund it ourselves")
silently gets paid to arrange a facility it never draws.

Fix: `Math.max(0, ...)` on the facility estimate, and skip the facility entirely (fee, exit
fee, LTGDV covenant) when the estimate is nil.

**Done** — estimate floored, fee priced off the floored figure, LTGDV not assessed when nil.
Recorded in AUDIT.md §6.6 finding 15. **The "skip entirely" half of that fix was wrong**, and
the probe said so: with £6m of equity the cashflow still draws **£1,446,776** to redeem the
bridge, so a real facility exists while E29 reads nil. **Residual:** that draw is priced at a
£0 arrangement fee. It now warns rather than being silent, but sizing the facility from the
cashflow instead of from E29 is the actual fix and is a change to how the fee is charged.

### A5 — MEDIUM · Investor ROI changes 6 points when you switch profit mode, with no change in economics
`src/core/dcf.ts:569` uses **drawn peak** capital in waterfall mode and **committed** capital in
simple mode. Demo with £5m committed (more than the scheme can absorb), pref 0%, residual 50/50
— economically identical to the simple 50/50 split:

| Mode | Investor capital | Investor profit | ROI |
|---|---|---|---|
| simple | £2,500,000 | £468,837 | **18.75%** |
| waterfall (0% pref, 50/50) | £1,900,219 | £468,837 | **24.67%** |

Same profit, same deal, 5.9 points apart. (Where equity is fully drawn — the demo defaults —
the two agree, which is why the existing tests don't catch it.)

Fix: one denominator for both modes. See question 4.

### A6 — MEDIUM · ~~`velocityPerMonth = 0` reports a sell-out that never happens~~ · **FIXED 2026-08-24**
`src/core/dcf.ts:643` returns `monthsToSellOut = 0` for zero velocity, so S2 shows:

- `totalDurationMonths` = 15 (= PC month, i.e. "sold out at completion")
- `monthsToRepay` = `'36+'` (loan never repaid)
- `extraInterest` = £1,163,800; net profit −£384,163 vs S1 +£779,637

The duration headline and the interest bill describe different universes, and no warning fires
(`runAppraisal`'s sell-out warning is gated on `velocity > 0`).

Fix: treat zero velocity as "no sales modelled" — report `'36+'`/n-a for duration and warn.

**Done** — `monthsToSellOut` and `totalDurationMonths` are nullable, zero velocity is `null`
and warns with the interest figure. Recorded in AUDIT.md §6.6 finding 16.

### A7 — MEDIUM · No interest-cover covenant on the refinance
The dev loan has an LTGDV covenant with a pass/fail flag; the refinance has none. On the demo
S3 refinances at 65% LTV with:

- net annual rent £193,800, annual interest £223,374
- **ICR 0.87**, net cashflow **−£29,574**, cash-on-cash −2.11%

No BTL lender advances at ICR 0.87 (typical stress test 125-145% at a stressed rate). The
model reports a £4.06m advance as achievable. `interestCover` is computed
(`src/core/dcf.ts:683`) and displayed, but nothing tests it, so "refinance & rent" reads as a
live exit when it is not fundable.

Fix: a `minIcr` covenant input with the same pass/fail treatment as `ltgdvOk`, tested at a
stressed rate, and cap the advance at the ICR-implied maximum.

**Partly done 2026-08-24 — and the rest is deliberately not being built.** The client's
decision (question 9, `appraisal-loop.md`) is to warn below 100% cover only: no stressed rate,
no covenant input, no capping of the advance. So the demo's ICR of 0.87 now raises a visible
warning and `plaus-icr` fails if cover is below 1 and nothing says so — but there is no
`minIcr` and there will not be one unless the client asks. AUDIT.md §6.6.

### A8 — MEDIUM · ~~`fundingGap` is computed every month and surfaced nowhere~~ · **FIXED 2026-08-24**
`src/core/dcf.ts:398` flags months where pre-construction costs exceed bridge + equity. No dev
loan draws before construction start, so those costs are simply **unfunded** — spent with no
source and no interest charged. `fundingGap` appears in `MonthRow` and then in no warning, no
UI element and no audit check (verified by grep across `src/views` and `src/core/audit.ts`).

Fix: raise a `runAppraisal` warning and an audit check; ideally model a stretch facility or
show the shortfall explicitly.

**Done** — `MonthRow.fundingShortfall` quantifies each gap, the warning names the months and
the peak (£940,782 on a zero-equity demo probe), and `plaus-funded` fails the audit. Recorded
in AUDIT.md §6.6 finding 17. **Residual:** the shortfall is reported, not funded — no stretch
facility is modelled, so the months still carry no finance cost.

### A9 — LOW · ~~Covenant flags read "OK" on a zero-revenue scheme~~ · **FIXED 2026-08-24**
`ltgdvAtPeak` guards division by returning 0 when GDV is 0, and `ltgdvOk` then reads `true`
(`src/core/dcf.ts:470`). A schedule with no sale prices passes the covenant. Same shape for
`profitOnGdv` and `interestCover`. Make the guard produce an explicit not-applicable state
rather than a passing zero.

**Done** — `ltgdvAtPeak`, `profitOnCost`, `profitOnGdv`, `interestCover` and `cashOnCash` are
`number | null`; `ltgdvOk` is `boolean | null`. The UI renders `n/a` and "not assessed". A real
breach stays `false`, pinned by a test. Recorded in AUDIT.md §6.6 finding 18.

### A10 — MEDIUM · Retained commercial rent is refinanced on residential terms
S3's `grossAnnualRent` is the whole schedule's rent, including the retained commercial unit
(£14,400 pa on the demo), and the whole lot is advanced against at the residential
`refinance.ltv` and priced at the residential rate. Mixed-use assets are financed
differently (lower LTV, higher rate, different ICR test) and often refinanced separately.
Split the refinance by use, or exclude commercial and state that it is held unencumbered.

---

## B. Appraisal model — missing mechanics (scope, not defects)

These are absent by design or never specified. Each needs a decision before it is built.

- **B1 — No discounting.** The engine is called a DCF but produces no NPV, no IRR and takes no
  discount/hurdle rate. Every headline is profit-on-cost / profit-on-GDV — undiscounted, so a
  15-month and a 39-month exit at the same profit look identical. Equity IRR is the number
  investors ask for. (`investorRoiPa` is a simple annualisation, not an IRR.) See question 3.
- ~~**B2 — No tax.**~~ **CLOSED 2026-08-24 — pre-tax is the house convention.** No corporation
  tax on SPV profit and no VAT on works; investors model their own position. The change made
  was disclosure: the exported assumptions and the README now state the pre-tax basis
  explicitly, pinned by a test, rather than leaving it to be inferred. CIS withholding and
  onward-transaction SDLT remain unmodelled and unasked-for.
- ~~**B3 — No planning obligations.**~~ **CLOSED 2026-08-24 — the client's conversions attract
  neither CIL nor S106,** so no default lines. A one-off obligation on some future scheme can
  go in a group's "Other" line; note the UI can only edit a line's value, never add one, so
  making cost lines user-addable is a fair backlog candidate. Building Safety Act gateway fees
  remain out of scope like other regulatory matters.
- ~~**B4 — No leasehold structure.**~~ **CLOSED 2026-08-24 — no change needed.** Flats are
  sold on 999-year leases with the freehold retained and never sold on, so there is no GDV to
  add: a peppercorn ground rent is mandatory on newly granted residential long leases
  (Leasehold Reform (Ground Rent) Act 2022), a 999-year reversion has no present value, and
  there is no disposal receipt. The assumption is now stated in the exported v2 assumptions
  and the README, and pinned by a test, so it reads as considered rather than missing. The
  freeholder's continuing obligations (structure, block insurance, service-charge
  administration, Building Safety Act duties) are real but out of scope like other regulatory
  matters.
- **B5 — Personal guarantee cost** — already flagged as deliberately deferred in AUDIT.md §5;
  restating only so it stays on one list.
- **B6 — Sensitivity grids don't cover the drivers that matter most.** Three grids: price,
  price × velocity, refi rate × LTV. Nothing on build cost (the largest single line), the
  programme length, or the interest rate on the development facility. Given A1, a build-cost
  axis is the highest-value addition.
- **B7 — Sales pacing is uniform and unit-blind.** Sell-down uses average price (GDV ÷ units),
  commercial included — documented in AUDIT.md as workbook-faithful. Worth revisiting now that
  the workbook is no longer the source of truth for timing: in practice the small units go
  first and the commercial unit sells on a different timescale entirely.

---

## C. Layout & compliance engine

### C1 — HIGH · ~~Non-rectangular floors are laid out on their bounding box, overstating NIA and GDV~~ · **FIXED 2026-08-24**
`planFloor` and `planFloorThrough` take `bounding(env.envelope)` (`src/core/layout.ts:42,268`)
and lay units across the full rectangle, while `floorGiaSqm` is the true `polyArea`. Units are
placed in space the building does not occupy.

Probe — an L-shaped floor (26×13 bounding box, true area 247 sqm):

- true polygon GIA: **247 sqm**
- planned NIA: **306.8 sqm**
- **net-to-gross 1.242 — 124%, physically impossible**

GDV is overstated by ~24% and the compliance report passes units that overlap thin air. This
is not an edge case: the AI extraction schema explicitly asks for `4-10 vertices`
(`electron/ai.ts`, envelope description), so L-, T- and U-shaped envelopes are an expected
input, and DXF import takes the largest closed polyline whatever its shape.

Fix, cheapest first: (a) clip every unit rectangle to the envelope polygon and recompute
`giaSqm` from the clipped area; (b) hard-fail with a clear message when
`niaSqm > floorGiaSqm`; (c) as an interim guard, an audit check that net-to-gross ≤ 1.0 on
every floor. (c) should land regardless of when (a) does.

### C2 — MEDIUM · A portrait envelope silently loses every all-residential option
`planFloor` throws when depth > width (`src/core/layout.ts:46`), and `generateOptions` catches
that per-strategy and skips it with a bare comment (`src/core/conversions.ts:226`). Probe with
a 13×26 envelope (long axis on y):

- options returned: `floor_through`, `whole_house`
- `full_*` options: **none**
- warnings explaining it: **`[]`**

The user sees two options instead of five and is told nothing. The AI prompt asks for
rotation, but manual entry and DXF import have no such guard.

Fix: rotate the envelope internally (the engine only needs the long axis on x, which is a
transform, not a constraint), and if a floor genuinely cannot be planned, say so on the
Options page.

### C3 — MEDIUM · Zero-unit options are offered for adoption and report as compliant
Probe with a floor too shallow to plan anything (8×3 m):

```
full_max_units:  0 units, GDV £0, allCompliant=true
full_balanced:   0 units, GDV £0, allCompliant=true
full_family:     0 units, GDV £0, allCompliant=true
```

`allCompliant` is `units.every(...)` over an empty array — vacuously true. Three empty options
sit in the pill row looking like real choices with a green tick.

Fix: drop options with no residential units (or mark them as not viable), and make
`allCompliant` false when there is nothing to validate.

### C4 — LOW · The merged whole-house unit validates one floor's rooms against the whole building's area
`src/core/conversions.ts` builds the merged unit by spreading `plans[0].units[0]` and
overriding `giaSqm` with the building-wide NIA. The `rooms` array stays the ground floor's, so
the validator checks a 4-storey house's storage and bedroom count against one floor's rooms.
Build cost is right (room areas are overridden separately); compliance is not.

### C5 — LOW · No guard on degenerate depth
`bankDepth = (D - corridorW) / 2` and `facadeD = d - 1.2` go negative for shallow floors,
producing negative room areas rather than an error. Validate `D > corridorW + 2 × minBank`
before planning.

---

## D. Application robustness & correctness

### D1 — HIGH · ~~The Excel export sends *unrepaired* inputs while the screen shows the repaired model~~ · **FIXED 2026-08-24**
`AppraisalView` computes the appraisal from `sanitizeSpec(pricing).spec`, but `exportXlsx`
builds its payload from `project.pricing.finance` raw (`src/views/AppraisalView.tsx:55`).
Probe — a spec with two fat-finger typos:

| | Bridge rate | Agent fee |
|---|---|---|
| Repaired, shown on screen and in `7. App Model v2` | 50% | 20% |
| Written to workbook `'2. Inputs'!E18` / `E40` | **450%** | **90%** |

The audit strip truthfully reports both repairs, and the workbook then contradicts it. Same
issue for `devCostLines`, which is also taken from the raw spec.

Fix: sanitize once in `AppraisalView`, keep the cleaned spec in the memo, and export from it.

### D2 — HIGH · ~~The export silently truncates schedules over 30 units~~ · **FIXED 2026-08-24**
`electron/xlsxExport.ts:157` does `schedule.slice(0, 30)` to fit `'1. Unit Import'` rows 7-36.
Probe with 42 units:

- engine GDV £20,992,963 → workbook GDV £14,994,974
- **£5,997,990 dropped**, no warning in `AppraisalResult.warnings`

`ConversionOption.warnings` carries a >30-unit note, but that lives on the option, not the
appraisal, and never reaches the export path at all (demo and hand-entered schedules skip it
entirely). The `7. App Model v2` sheet shows the 42-unit result next to a 30-unit sheet 1-6.

Fix: warn in `runAppraisal` on `units > MAX_UNITS`, return the truncated count from
`exportWorkbook`, and surface it in the export confirmation message.

### D3 — MEDIUM/HIGH · A malformed cost line crashes the appraisal, and the crash is swallowed
`groups[line.group].lines.push(...)` (`src/core/dcf.ts:187`) assumes a valid `DevCostGroup`.
`normalizePricing` passes `devCosts` straight through with no validation, and `sanitizeSpec`
only checks that `value` is finite. Probe with `group: 'acquisition'` in a hand-edited project
file:

- `sanitizeSpec` repairs: **0**
- `runAppraisal` throws `Cannot read properties of undefined (reading 'lines')`
- `AppraisalView`'s bare `catch {}` (line 45) returns nulls, so the page renders
  **"No option selected yet"**

The user is told to go and select an option they have already selected. Every engine exception
lands in this hole.

Fix: validate `code`/`group`/`kind` in `sanitizeSpec` (repairing unknown groups to `other`
with a reported repair), and replace the bare catch with a visible error state carrying the
message.

### D4 — MEDIUM · Enum inputs are never validated
`sanitizeSpec` validates the SDLT regime (added by the previous audit) but not
`vat.fundedBy`, `waterfall.mode` or `buildCostMode`. Probe with `'typo'` in all three:

- repairs reported: **none**
- `vat.fundedBy: 'typo'` → silently funded from equity
- `waterfall.mode: 'typo'` → behaves as simple, but is *reported* as `'typo'`, so
  `WaterfallTable` renders nothing **and the auditor's `mode === 'simple'` split check is
  skipped entirely** — a blind spot in the audit itself
- `buildCostMode: 'typo'` → falls through to fixed D01

Fix: one enum-validation helper covering all four, each with a reported repair.

### D5 — MEDIUM · The editable NDSS ruleset is never persisted
`setRules` is `set({ rules, ... })` only (`src/state/store.ts:184`). Rules live in Zustand
memory: every edit made in Settings is lost on restart, and because they are not stored on the
`Project`, **a saved project cannot be re-validated against the ruleset it was assessed
under**. For a compliance record that is the wrong side of reproducible. Persist to app
settings, and stamp the effective ruleset onto the project (or the adopted option).

### D6 — MEDIUM · Autosave can lose the last 600 ms of work on quit
`scheduleSave` debounces 600 ms. `closeProject` flushes; nothing else does. There is no
`before-quit`/`will-quit` handler in `electron/main.ts` and no `beforeunload` in the renderer
(verified by grep), so closing the window straight after a keystroke drops it.
Add a flush on `before-quit` and on window close.

### D7 — MEDIUM · Project writes are not atomic
`fs.writeFileSync(path.join(projectsDir(), ...))` (`electron/main.ts:109`) overwrites in place.
A crash or power loss mid-write leaves truncated JSON — and `projects:list` catches parse
failures and **skips the file**, so the project vanishes from the homepage with no error. Write
to `<id>.json.tmp` then `fs.renameSync`, keep one `.bak`, and report unreadable files on the
homepage instead of hiding them.

### D8 — MEDIUM · No error boundary
`src/main.tsx` renders `<App />` with no error boundary, and `store.regenerate()` calls
`generateOptions` with no try/catch (`src/state/store.ts:189`). Any throw in option generation
or in a render blanks the window with no recovery path. Add a boundary that shows the error and
offers "back to Projects".

### D9 — LOW/MEDIUM · Renderer hardening
`webPreferences` sets `contextIsolation: true` and `nodeIntegration: false`
(`electron/main.ts:35`) — good — but `sandbox: true` is not set, and `index.html` has no
Content-Security-Policy meta tag. The IPC surface is well designed (fixed link destinations,
`path.basename` on project ids, payload re-validation in the main process, no credentials over
the bridge — this part is genuinely well done). Adding `sandbox: true` and a strict CSP closes
the remaining gap cheaply.

### D10 — LOW · Option generation blocks the UI with no feedback
`regenerate()` runs `generateOptions` synchronously and never sets `busy`, and `OptionsView`
runs a full `runAppraisal` per option in a `useMemo`. Fine on a 4-storey demo; on a large
building it is a frozen window with an "Autosaved" label. Set `busy` around generation.

### D11 — HIGH · A duplicated cost code is charged twice, and every audit check still passes
Found by the reviewer during the abandoned D3 cycle (2026-08-24) and independently
reproduced. Nothing in `sanitizeSpec` or `auditAppraisal` compares cost-line **codes**, so a
stored project carrying the same line twice — a hand-edited file, a merge of two `.pricing`
presets, or a future "duplicate this line" UI affordance — has that cost charged twice with
no repair, no warning and no failing check.

The auditor cannot see it by construction: `costs-lines` resolves both spec entries to the
same engine `outLine` **by code**, so it compares the line against itself, and each
`costs-group-*` check sums the engine's own lines, so the doubled total agrees with itself.

Measured on `DEMO_SCHEDULE` + `clonePricing(DEFAULT_PRICING)`, every case at **61 checks /
0 fails and 0 repairs** (clean baseline S1 net profit **779,614.9968750654**,
`devCosts.totalPreFinance` **5,116,085.86508**):

| Duplicated line | S1 net profit | Δ profit | `totalPreFinance` |
|---|---|---|---|
| D01 main contract | **-1,671,760.1760894181** | **-2,451,375.17** | 7,421,184.865080001 |
| D08 | 656,843.4625555435 | -122,771.53 | 5,231,340.81508 |
| G03 | 683,419.7851110287 | -96,195.21 | 5,209,809.29516 |
| C01 | 734,196.5353005892 | -45,418.46 | 5,158,585.86508 |
| D02 | 737,095.2380344532 | -42,519.76 | 5,156,085.86508 |
| H01 | 771,610.2545725498 | -8,004.74 | 5,123,585.86508 |
| B02 | 776,902.3827024568 | -2,712.61 | 5,118,585.86508 |

The duplicated D01 swing of **£2,451,375** is larger than the £2,438,315 case D3 was written
for, and unlike D3 it is **silent**: D3 at least crashes, this reports a confidently wrong
number against a green audit. A scheme shown as £779,615 profitable is really £1.67m
loss-making, and nothing on the screen says so.

Fix: reject duplicate codes in `sanitizeSpec` (drop the later occurrence with a reported
repair naming the code, so the charge is not silently doubled *or* silently halved), and add
a `costs-duplicate-codes` check to `auditAppraisal` so the auditor stops resolving a line
against itself. Note that `costs-lines` comparing spec entries to engine lines **by code** is
the root cause and is worth revisiting more generally.

---

## E. Engineering & process

- **E1 — No linter or formatter.** No ESLint, Prettier, `.editorconfig` or pre-commit hook in
  the repo. CI runs `typecheck` + `test` only. For a codebase carrying this much financial
  logic, `@typescript-eslint` with `no-floating-promises`, `no-unnecessary-condition` and
  `strict-boolean-expressions` would earn its keep — several findings above (D3, D4) are
  exactly what those rules catch.
- **E2 — `crosscheck.sh` is not in CI.** AUDIT.md calls the LibreOffice cross-check the
  regression net that caught finding #6, and it runs only when someone remembers. Add a CI job
  with `libreoffice-calc` on ubuntu; it is the only thing verifying engine/workbook parity.
- ~~**E3 — The in-app auditor cannot catch a whole class of defect.**~~ **DONE 2026-08-24.**
  Seven plausibility checks added — `plaus-facility`, `plaus-finance-cost`, `plaus-funded`,
  `plaus-gap-amount`, `plaus-icr`, `plaus-ratios`, `plaus-duration` — taking the audit from 53
  to 61 checks. They ask whether an answer *could be true of a real scheme*, where every other
  check asks only whether the model agrees with itself. Net-to-gross ≤ 1.0 and NIA ≤ GIA were
  already covered by §6.3's `makeOption` tripwire and live on the option, not the appraisal, so
  they are not duplicated here. **Note on `plaus-icr`:** the auditor reports model defects, not
  weak deals, so it checks that below-100% cover is *flagged*, not that cover clears. AUDIT.md
  §6.6.
- **E4 — Test coverage is deep but narrow.** 145 tests concentrate on the demo scheme and
  hand-computable probes. The findings above were all reachable because nothing exercises
  degenerate geometry (L-shaped, portrait, too-shallow floors), over-equitised funding, zero
  velocity, or hand-corrupted project files. A property-based pass over `generateOptions` and
  `runAppraisal` with randomised envelopes and specs — asserting only invariants (NIA ≤ GIA,
  costs ≥ 0, no throws, warnings present when clamped) — would have found C1, C2, C3, D3
  and A4.
- **E5 — Docs claim more than the code does, in two places.** README says the ruleset is
  "editable in Settings" (true, but not persisted — D5) and describes the app as a "DCF"
  appraisal (no discounting — B1). Worth aligning either the docs or the code.

---

## Suggested order

1. ~~**D1, D2** — export/screen disagreement.~~ **Done** — payload construction extracted to
   `src/core/exportPayload.ts`, over-capacity schedules reported rather than truncated in
   silence, and `tests/export.test.ts` added (the export path previously had no unit test).
   Recorded in AUDIT.md §6.2.
2. ~~**C1 (+ the net-to-gross audit check)**~~ **Done** — units and rooms are clipped to
   the envelope polygon (`src/core/geom.ts`); the L-shaped probe went from 124% to 83%
   net-to-gross with the demo's figures bit-identical, and the NIA>GIA tripwire is in
   `makeOption`. Recorded in AUDIT.md §6.3. **Residual:** the packer is still bounding-box
   based, so a notched floor is under-packed (units that would overhang are dropped, not
   reshaped) — conservative, and visible in net-to-gross. A polygon-aware packer is a
   separate, larger job.
3. ~~**A1** — build cost inflation.~~ **Done** — a `buildInflation` block indexes the main
   contract to its certificate months, independent of HPI as specified; ships disabled so no
   stored project moves, and `runAppraisal` warns whenever HPI is indexing revenue while cost
   is frozen. The estimate agent now researches BCIS tender-price inflation alongside the
   £/sqft. Recorded in AUDIT.md §6.4. **Residual:** only the main contract is indexed —
   professional fees, utilities and holding costs remain in today's money (stated in the
   warning, not silent). A build-cost sensitivity axis (B6) is still open and is now the
   natural companion to this.
4. ~~**A2, A3** — per-scenario cost attribution and time-based holding costs.~~ **Done** —
   `whenIncurred` on every cost line plus an `(I)` letting group; S3 priced on its own
   let-basis cashflow; `(F)` converted to per-month-held rates driven by `Programme.holdMonths`.
   Recorded in AUDIT.md §6.5. **Residual:** the xlsx cell mapping has now produced the same
   export/engine divergence three times and wants a structural fix (see §6.5).
5. ~~**A4, A6, A8, A9 + E3** — guard rails and the plausibility checks that catch them.~~
   **Done** — every degenerate state now reports itself instead of returning a confident zero,
   and the auditor grew the plausibility checks that catch this whole class. Recorded in
   AUDIT.md §6.6. **Residuals:** the facility estimate can still diverge from the actual draw
   (warned, not fixed — A4), and an unfunded month is reported but not funded (A8).
6. **C2, C3, D3, D4, D8** — robustness; small diffs, removes silent failure.
7. **A5, A7, A10, D5-D7** — model conventions and persistence.
8. **B1-B7, E1, E2, E4** — scope decisions and process, once the questions below are answered.

---

## Decisions taken (2026-08-24)

Answered by the client; these are now the specification for the model work.

| # | Question | Decision |
|---|---|---|
| 1 | Build cost inflation (A1) | **Own input, researched.** Add `buildInflationPa` applied to the contract sum over the programme, with the estimates agent researching a BCIS-style tender price forecast as it already does HPI. Kept **independent** of the HPI rate, since tender prices and house prices diverge. |
| 2 | Exit cost attribution (A2) | **Per-line exit flag plus a letting group.** Add `whenIncurred: 'always' \| 'onSale' \| 'onLet'` to `DevCostLine`, and a letting-cost group (tenant find, EPC, furnishing, first-let void, licensing) that S3 uses. |
| 3 | Discounting (B1) | **Add equity IRR and NPV at a hurdle rate**, headlined alongside profit-on-cost. IRR from the monthly equity cashflow, not an annualised ROI. *Still needed: the hurdle rate to quote — see question 5 below.* |
| 4 | ROI denominator (A5) | **Show both.** Report ROI on capital committed *and* on capital actually drawn, in every profit mode, so the two can never silently disagree. |

Consequences for the build order: A1 and A2 grow from "fix a defect" into schema changes
(`FinanceInputs.buildInflationPa`, `DevCostLine.whenIncurred`, a new letting-cost group), so
both need a `normalizePricing` migration path for existing project files — defaulting
`whenIncurred` to `'always'` preserves today's behaviour exactly, and a zero default for
`buildInflationPa` keeps the golden tests green until the rate is deliberately set. B1 adds
`hurdleRatePa` to `FinanceInputs` and an IRR solver (bisection on the monthly equity flows;
guard for the no-sign-change case). A5 widens `WaterfallResult` with a second capital/ROI pair.

## Open questions

Question 3 above is decided in principle but needs one number (5). The rest are scope calls.

5. **Hurdle rate (B1).** What discount / hurdle rate do you quote to investors? Needed to make
   the NPV real, and to mark IRRs as clearing or missing the hurdle.
6. ~~**Planning obligations (B3).**~~ **ANSWERED 2026-08-24: neither.** The client's
   conversions attract no CIL and no S106, so no default lines. If a scheme ever does, the
   per-group "Other" lines take it — though note the UI cannot ADD a cost line, only edit
   values, so making lines user-addable is a fair backlog candidate.
7. **Non-rectangular floors (C1).** How often are real envelopes L/T/U-shaped? If it is most
   of them, the clipping fix is the top priority rather than the second.
8. ~~**Leasehold (B4).**~~ **ANSWERED AND CLOSED 2026-08-24: 999-year leases, freehold
   retained and not sold on.** No ground rent (peppercorn by statute), no reversion value at
   999 years, no disposal receipt — so nothing is added to GDV, deliberately. Stated in the
   exported assumptions and the README, and pinned by a test.
9. **Refinance covenant (A7).** What ICR do your BTL/portfolio lenders actually test at, and
   at what stressed rate? That number is needed to make the covenant check real rather than
   nominal.
10. **Tax (B2).** Left undecided: should the model carry corporation tax on SPV profit and show
    post-tax investor returns, or is pre-tax the house convention? And is the 5% reduced-rate
    VAT on qualifying conversion works worth modelling as a cashflow item?
11. **Stretch / mezzanine funding terms (A8's full fix).** The engine now warns when
    pre-construction spend exceeds bridge + equity, but it cannot finance the gap — the money
    is flagged as having no source and is charged no interest. If a scheme's bridge and equity
    do not cover pre-construction spend, what facility fills it and on what terms: rate pa,
    arrangement fee, exit fee, and does it rank behind the senior development loan?
12. **Basis of the development-loan arrangement fee.** Is the fee priced on the facility
    committed at signing (the current E29 estimate) or on the facility actually drawn? On the
    demo the fee is charged on £3,787,282 against a cashflow peak of £3,982,955 — a £195,674
    gap understating the fee by ~£2,935 plus rolled interest. In the over-equitised probe it
    errs the other way, levying ~£12,612 on £591,694 of facility that is never drawn.
    Repricing would move golden pins, so it needs the client's own lending convention.
