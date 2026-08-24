# Model & Floorplan Converter Audit

Audit of (1) the DCF appraisal engine against the Appraisal Model workbook and general
financial correctness, and (2) the floorplan converter against UK space regulations.
All findings below are fixed in this codebase; regression tests pin every fix.

## 1. DCF engine — verification method

Two independent checks:

**Golden tests** (`tests/dcf.test.ts`): the engine reproduces the exact values Excel itself
cached in `Appraisal_Model_1.xlsx` for its demo scheme — 12 figures across the unit schedule,
bridge/development-loan roll-up, all four exit scenarios and all three sensitivity grids
(e.g. S1 profit £775,845.16, finance costs £356,319.64, grid cells to 9+ significant figures).

**LibreOffice cross-check** (`scripts/crosscheck.sh`): a *different* scheme (7 units, different
mix/prices/programme, altered finance terms and dev-cost lines, negative profit) is priced by
the engine, exported into the real template through the app's exporter, recalculated from
scratch by LibreOffice Calc (`OOXMLRecalcMode=0`, full recalc on load), and compared. All 13
key figures agree to < 1p:

```
OK   gdv                  excel=    2828376.18  engine=    2828376.18
OK   preFinanceCosts      excel=    3657620.77  engine=    3657620.77
OK   bridgeInterest       excel=      32826.43  engine=      32826.43
OK   devArrangementFee    excel=      53289.75  engine=      53289.75
OK   devBalanceAtPC       excel=    2850681.71  engine=    2850681.71
OK   totalFinanceCosts    excel=     265866.40  engine=     265866.40
OK   costsAfterFinance    excel=    3923487.17  engine=    3923487.17
OK   s1NetProfit          excel=   -1151678.51  engine=   -1151678.51
OK   s2NetProfit          excel=   -1308798.01  engine=   -1308798.01
OK   s3Cashflow           excel=       -496.71  engine=       -496.71
OK   s4NetProfit          excel=   -1289957.82  engine=   -1289957.82
```

Because the comparison runs *through the exporter*, it simultaneously validates that unit
rows, programme/finance inputs and development-cost lines are written to the right cells.

**Financial identity tests** (`tests/audit.test.ts`) hold for arbitrary schemes:
- every pound of pre-finance cost appears in the cashflow (nothing dropped or double-counted);
- costs-after-finance = pre-finance + finance costs;
- dev loan balance at PC = drawdowns + rolled interest;
- cumulative costs to PC are fully funded by bridge + equity + net dev-loan draws;
- sensitivity grid 1 at 0% equals the S1 profit (they are algebraically identical);
- grid 3 centre cell equals the S3 cashflow;
- delayed sales (S2) never beat an immediate sale (S1).

## 2. DCF engine — findings & fixes

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 1 | **High** | Development-cost edits made in the app did **not** flow into the exported workbook — the export kept the template's original amounts, so the Excel file could silently disagree with the in-app appraisal. | Exporter now writes every dev-cost line to its workbook cell (fixed lines → column F amounts; percentage/per-unit lines → the column D rate cells the workbook formulas read). Verified by the LibreOffice cross-check, which edits five lines and still agrees. |
| 2 | Medium | Zero-length legal / pre-construction / construction phases divided by zero: whole cost categories vanished from the cashflow (NaN or silently unspent). The workbook has the same flaw (`#DIV/0!`). | Phase lengths are clamped to ≥ 1 month; a warning is surfaced when clamping occurs. Identity test proves no cost is dropped. |
| 3 | Medium | A programme longer than the 48-month cashflow horizon (workbook columns E..AZ) silently truncated costs and interest. | The appraisal now carries an explicit warning; the horizon constant is exported and tested. |
| 4 | Low | Sell-out longer than the 36-month scenario horizon (workbook columns E..AN) understates delayed-sale interest with no indication. | Warning surfaced (matches the workbook's own `36+` marker behaviour). |
| 5 | Low | A pricing spec in room-rates mode applied to a hand-entered schedule (no room data) fell back to the fixed build cost invisibly. | Fallback now emits a warning naming the D01 amount used. |

### Workbook-faithful conventions (documented, not "fixed")

These reproduce the workbook by design; changing them would break parity with the Excel model
the business already uses:

- Costs spread evenly within each phase (no S-curve) — workbook note 1.
- Bridge interest in month 1 accrues on advance + arrangement fee for a full month.
- Equity deploys after the bridge and before the development loan; the loan funds the balance.
- Delayed-sale scenarios sell at the **average** unit price (GDV ÷ units), commercial included —
  workbook note 5.
- Sensitivity grid 2 assumes straight-line loan paydown (approximation) — workbook's own note.
- SDLT is a manual input (line B04), not a banded calculation — workbook note 4.
- S3 mortgage is interest-only; rent net of void and management — workbook note 6.

## 3. Floorplan converter — regulation audit

Checked against the Nationally Described Space Standard (NDSS, 2015) and the common
building-regs-derived rules the ruleset encodes:

**Verified correct** (now pinned by regression test):
- NDSS Table 1 minimum GIAs: studio/1p 37 sqm (shower), 1b2p 50, 2b3p 61, 2b4p 70, 3b4p 74,
  3b5p 86, 3b6p 95.
- Double bedroom ≥ 11.5 sqm; principal bedroom width ≥ 2.75 m; other doubles ≥ 2.55 m;
  single ≥ 7.5 sqm / 2.15 m.
- Every bedroom and living space requires a window; bathrooms may be internal (mechanically
  ventilated); kitchens open-plan to a windowed living space need no separate window.
- Minimum ceiling 2.3 m over ≥ 75 % of GIA (NDSS §Note 5) — in the ruleset.

**Gaps found & fixed:**

| # | Finding | Fix |
|---|---------|-----|
| 1 | **NDSS built-in storage was in the ruleset but never validated** — a unit with no storage passed. | Validator now requires the unit's hall/storage strip to cover the NDSS storage minimum (studio 1.0 sqm — app addition, NDSS keys storage off bedspaces; 1b 1.5, 2b 2.0, 3b 2.5). Failing units are reported like any other breach. |
| 2 | Ceiling-height and glazing-ratio rules could not be checked from schematic geometry and were **silently skipped**, so a "PASS" implied more than was verified. | Every compliance report now carries explicit advisories: heights and glazing are assumptions to verify on survey, corridor layouts produce single-aspect units (some LPAs restrict these), the 37 sqm studio minimum assumes a shower room (39 sqm with bath), and planning matters are out of scope. |
| 3 | The validator applies **double**-bedroom minima to every bedroom, though NDSS allows the second/third bedroom to be a single (7.5 sqm). | Kept deliberately as a stricter-than-standard check (the layout engine only draws doubles); documented in the validator so it is not mistaken for the bare standard. |

## 4. Room-type £/sqft build costing (new)

Build cost (dev-cost line D01) can now be derived from each option's actual room areas —
living/kitchen, bedrooms, bathrooms, halls/storage, common circulation & cores, retained
commercial — priced at per-room-type £/sqft rates set in the Pricing page. Denser layouts with
more wet rooms genuinely cost more. Tests assert the room areas tile the converted floors
completely, the total equals Σ area × rate, percentage-of-build lines (contingency, demolition)
follow the computed cost, and hand-entered schedules fall back to the fixed D01 amount — which
keeps the golden tests exact.

## 5. Model v2 — deliberate deviations from the workbook

The engine started as a cell-by-cell port of the workbook. Model v2 corrects the workbook's
timing simplifications, following answers to the audit's open questions. **The workbook is no
longer the source of truth for finance timing** — only for the unit schedule, the cost
schedule amounts, the bridge, and facility sizing. Every change below shifts *when* money
moves, not *how much* a cost line is (cost totals still reconcile to the penny).

| Change | Workbook behaviour | Model v2 behaviour (confirmed practice) |
|---|---|---|
| SDLT | Spread over the legal period | Paid on completion of the purchase (month 1) |
| SDLT amount | Hand-typed on B04 | Computed exactly from HMRC bands (`src/core/sdlt.ts`) under a per-project regime: non-residential/mixed (default — reproduces the workbook's £87,000 on the £1.95m demo to the penny), residential company rates (main rates + 5% surcharge), or manual (typed figure kept; pre-existing project files load as manual). Charged on the VAT-inclusive price when opted to tax. Band maths hand-verified in `tests/sdlt.test.ts`; the in-app auditor recomputes B04 from the bands, proven by a seeded-corruption test |
| Bridge scope | (Same formula, now stated) | Advances against the purchase price only; SDLT, legals, valuation and design fees are equity |
| Main contract drawdown | Straight-line over construction | Standard S-curve (smoothstep), standing in for a QS drawdown schedule; contingency follows the curve |
| Architect & QS fees | Architect in pre-con, QS over construction | Both straight-lined from month 1 to PC (they run through design and build) |
| Post-construction costs | Lump at PC | Straight-lined over the expected sell period |
| Retention | None | 3% withheld from certificates; 1.5% released at PC, 1.5% held 12 months (defects), all editable |
| VAT on purchase | None | If seller opted to tax: paid at completion, reclaimed ~2 months later; funded from equity or a VAT loan (fee + interest are the only real cost). SDLT-on-VAT warning surfaced |
| Deposit interest | None | Earned on the retention pot and on sale surpluses after loan repayment; credited against costs |
| GDV over time | Static | Optional HPI indexing: sale prices to each unit's sale month, refinance value to PC; rates from the projection agent (regional, sourced) or manual |
| Profit split | Flat investor share | Same by default; optional waterfall (capital → pref compounded monthly on drawn capital → residual split) |
| PG cost | Based on a provisional facility estimate | **Not modelled yet** — deliberately skipped until the facility term sheet (3-5 St John Street example) is provided; will be computed on the actual facility by iteration, not the estimate |

**Pricing estimates are not engine paths.** The research agents (`electron/estimate.ts`) and
suggestion helpers (`src/core/estimates.ts`) only ever produce *suggestions* stored on the
project with their range, rationale and sources; a figure enters the model exclusively through
the user clicking Apply, after passing hard sanitisers (finite, ordered low ≤ likely ≤ high,
clamped to per-quantity bands — sale £50-3,000/sqft, build £50-1,000/sqft, rates 0-35%, fees
0-10%). Sales suggestions are *today's* values by design: the HPI setting performs the
today-to-completion projection, so growth cannot be double-counted. Room-rate scaling
(`scaleRoomRates`) preserves the user's ratios and reproduces the researched blend to within
£1 (whole-pound rounding), verified in `tests/estimates.test.ts`.

Verification of v2 (`tests/model2.test.ts`): S-curve slices hand-checked and summing to 1;
retention conservation and release months exact; SDLT/architect/QS/holding-cost timing asserted
month by month on a hand-computable scheme; VAT flows net to zero with the loan's fee+interest
matching a 3-line hand calculation; the HPI index reproduces closed-form compounding; waterfall
pref equals 100k×(1.01¹²−1) on the canonical example, with hurdle-shortfall and loss cases;
plus standing identities (Σ monthly costs = pre-finance total; investor + developer = net
profit in every scenario and mode). Demo outputs are regression-pinned in `tests/dcf.test.ts`.

`scripts/crosscheck.sh` now checks the figures the two models still define identically (unit
schedule, pre-finance totals, bridge, facility sizing) against a LibreOffice recalculation of
the exported workbook. The export writes the app's v2 results to a `7. App Model v2` sheet so
workbook readers see both models side by side.

## 6. Second financial audit (of model v2 itself)

A full adversarial pass over the v2 engine, hunting defects in the new mechanics. Five
findings, each demonstrated numerically before fixing and pinned by a test afterwards
(`tests/model2.test.ts` → "financial audit fixes"):

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | HIGH | %-of-GDV sales costs (agent fees) were priced on **raw GDV** while the scenarios sell at HPI-indexed, price-levered GDV — fees understated by £5.9k on the demo under 5% HPI, and S1 disagreed with its own sensitivity grid by £4.7k at a +5% lever. | Sales-cost lines price on `GDV × hpiIndex(PC) × (1 + lever)`; the grids re-based on the same figure, so **grid 1's 0% row now equals S1 exactly** under any lever/HPI combination (asserted to 1e-6). |
| 2 | MEDIUM | HPI uplift on delayed sales was credited to profit **gross of agent fees**, overstating S2/S4 by the fee on the growth (~£1.4k on the demo). | Uplift credited net: `uplift × (1 − agentFee)`. |
| 3 | MEDIUM | A VAT reclaim landing **after construction start** with equity fully deployed simply vanished — it neither returned equity nor paid down the loan, overstating funding (£390k refund ignored in the probe case). | Negative funding need pays the dev loan down (drawdown may be negative), floored at the balance so it can never go below zero. |
| 4 | LOW | Deposit interest could accrue on a **negative** cash balance in the sell-down (only reachable with absurd selling costs), charging phantom negative interest. | Interest accrues on `max(0, cash)`. |
| 5 | MEDIUM | The waterfall's exit month used sell-out only, so on stressed deals where the loan outlives the sales the **pref stopped accruing before capital was actually distributable**, understating the investor's pref. | Exit = PC + max(sell-out, loan repayment months); a '36+' repayment tail accrues the full 36 months. |

The same pass produced two standing defences:

- **An automatic in-app audit** (`src/core/audit.ts`) that runs on every appraisal: it
  re-derives every cost line from its driver, every unit cell (sqft = sqm × 10.7639,
  GDV = sqft × £psf), every conservation identity (costs, retention, VAT, dev loan,
  deposit interest), every scenario linkage (S1 = GDV − costs, S2 = S1 + uplift + deposit
  − interest, grid 0-rows = scenarios) and every distribution (investor + developer = net
  profit, pref ≤ accrued), 44 checks on the demo — displayed above the KPIs. Recoverable
  input messes (non-finite numbers, impossible percentages, malformed HPI arrays, schedule
  cells disagreeing with area × rate) are repaired before computing, and **every repair is
  reported** — nothing is corrected silently. `tests/appaudit.test.ts` proves the auditor
  passes clean runs and catches ten classes of seeded corruption.
- **A Claude Code audit-agent team** for future changes: `.claude/agents/dcf-financial-auditor.md`
  (adversarial mechanics review with numeric probes) and `.claude/agents/dcf-numeric-verifier.md`
  (verification battery + independent recomputation), orchestrated by the `/audit-dcf` skill.

### 6.1 Audit of the SDLT / pricing-estimates change (2026-08-17)

The `/audit-dcf` team ran over the change that introduced band-computed SDLT and the
pricing-estimate helpers. The independent verifier recomputed the SDLT closed forms, the
demo's 48-month cost stream, bridge and dev-loan roll-ups, the S1/grid identities, the
canonical waterfall, and seven stressed configurations (VAT on under both funding routes and
both regimes, crash lever, zero/max velocity) — all exact. One finding:

| # | Severity | Defect | Fix |
|---|---|---|---|
| 6 | HIGH | The xlsx export still wrote the **typed** B04 into '3. Dev Costs'!F14 while the engine priced the line from HMRC bands — on the crosscheck scheme the workbook carried £61,000 against the engine's £62,000, breaking the export/engine penny-agreement (pre-finance off by £1,000, dev arrangement fee by £20). | `exportWorkbook` computes the band SDLT itself (VAT-inclusive when opted to tax) whenever the regime is automatic and writes that figure; `./scripts/crosscheck.sh` — which recalculates the exported workbook with LibreOffice — is the regression net that caught it and now agrees to the penny again. |
| 7 | MEDIUM | Every fixed line matching /sdlt\|stamp duty/i received the FULL computed SDLT, so a preset importing two matching lines (e.g. B04 plus an "SDLT top-up") **doubled stamp duty** — £39,500 of phantom cost on the probe scheme — invisibly, because the auditor recomputed each line the same way and the doubling is conservation-consistent. | Only the FIRST matching fixed line (shared `sdltLineCodeOf` rule) carries the band figure; further matches keep their typed values, `runAppraisal` warns about them, and the auditor, UI "auto" badge and workbook export all resolve the line through the same exported predicate. Pinned by a two-line test in `tests/model2.test.ts`. |
| 8 | LOW | `normalizePricing` gated the manual-mode default on the truthiness of the `sdlt` block, so a hand-edited/corrupted file containing `sdlt: {}` silently loaded as **automatic**, flipping a typed B04 to the computed figure with zero repairs reported. | Gate on `sdlt.regime` instead of the block; `sdlt: {}` now loads as manual. Pinned in `tests/sdlt.test.ts`. |

One out-of-diff observation was recorded, not fixed: `grid1`'s 0% row assumes the G03/G04
selling-cost lines exist in the spec (they always do in the shipped defaults and the UI, which
cannot delete lines); a hand-built spec omitting them makes grid1(0%) diverge from S1 by
exactly the selling costs. Pre-existing behaviour, untouched by this change, exposure limited
to test scaffolding.

### 6.2 Audit of the application layer (2026-08-24)

A full read-through of the app around the engine — renderer, store, Electron main, export
path — recorded in IMPROVEMENTS.md as 28 findings. The two that break the export contract
were fixed first, since both silently contradict figures the user has already been shown.

| # | Severity | Defect | Fix |
|---|---|---|---|
| 9 | HIGH | The workbook export built its payload from the **raw** project spec while the appraisal screen priced the **sanitized** one, so any repair the audit strip reported was contradicted by the exported workbook. Probe: a spec with a 450% bridge rate and a 90% agent fee showed 50% / 20% on screen (both reported as repairs) and wrote **4.5 and 0.9** into `'2. Inputs'`!E18/E40. `devCostLines` came from the raw spec too, and every `'7. App Model v2'` assumption line described the unrepaired inputs. | Payload construction moved out of the view into `src/core/exportPayload.ts` (`buildExportInputs`, `buildModelV2`), both taking the spec as a parameter so there is **no code path to the unrepaired one**. `AppraisalView` now carries the sanitized spec out of the same memo that computes the result. `tests/export.test.ts` pins the repaired figures in the written file — and pins the pre-fix behaviour too, so the sanitize step cannot be dropped again. |
| 10 | HIGH | A schedule longer than `'1. Unit Import'` (rows 7-36) was **silently truncated** by a hardcoded `slice(0, 30)`. Probe: a 42-unit scheme exported a workbook whose sheets 1-6 carried £14,994,974 of GDV against the engine's £20,992,963 — **£5,997,990 missing**, with no warning anywhere. The `>30 units` note that does exist lives on `ConversionOption.warnings`, so it never reaches a demo or hand-entered schedule, and never reaches the export path at all. | The limit is now the shared `MAX_UNITS`, and `exportWorkbook` returns an `ExportOutcome` (units total / written / dropped, and the GDV dropped) that travels back over IPC. `runAppraisal` warns above `MAX_UNITS` naming the omitted GDV; the export confirmation renders as a warning, not a success, and states the figures; the `'7. App Model v2'` sheet carries a `CAPACITY WARNING` row so a workbook reader sees the discrepancy next to the full-schedule numbers. |

Both were reachable because **the export path had no unit test at all** — only
`scripts/crosscheck.sh`, which needs LibreOffice and so runs by hand. `tests/export.test.ts`
(13 tests) now exercises it against the real template and reads the bytes back; four of those
tests were confirmed to fail against the pre-fix engine and exporter before the fix landed.
`scripts/` is also now inside `tsconfig.json`'s `include`, so the crosscheck script is
typechecked against the signatures it calls.

Extraction of the model-v2 payload was verified output-identical to the original inline code
across four spec variants (default, VAT-loan, waterfall, HPI), so the exported sheet is
unchanged.

### 6.3 Non-rectangular envelopes (2026-08-24)

| # | Severity | Defect | Fix |
|---|---|---|---|
| 11 | HIGH | The layout engine packs units on the envelope's **bounding box** and then measured those rectangles as if they were inside the building. On any non-rectangular floor that counted floor area the building does not have. Probe: an L-shaped floor (26x6 base plus a 13x7 leg, true area 247 sqm inside a 338 sqm bounding box) reported **NIA 306.8 sqm — 124% net-to-gross**, overstating GDV by ~24%, and the compliance report passed units sitting in thin air. Not an edge case: the AI extractor is asked for `4-10 vertices` and DXF import takes whatever closed polyline it finds. | Every rectangle the engine proposes — each unit and each of its rooms — is clipped to the envelope polygon (`src/core/geom.ts`, Sutherland-Hodgman) before its area counts, and re-typed on the clipped area. A unit whose clipped area no longer supports any type in the strategy is **dropped rather than shrunk**, so such floors come out deliberately under-packed: conservative, and visible in the net-to-gross figure. The L-shaped probe now reports 83% net-to-gross; a U-shaped one 86%. Clipped units and rooms carry an `outline` and the schematic renders them as polygons, so the plan shows the footprint the areas were measured on. |

Two things were needed to make this safe to land:

- **Bit-exactness on rectangles.** Clipping a rectangle wholly inside its envelope must return the rectangle's own `w x d`, not the shoelace sum of the clipped ring: the ring's vertices come from interpolation, so the shoelace differs in the last floating-point digit — enough to flip a 1dp rounding and move a unit by 0.1 sqm. The first cut of the fix silently shifted the demo floor's NIA from 289.2 to 289.0. `rectClip` now returns the exact product when the rectangle is contained, and the demo building's unit areas, room areas and all eight option GDVs were diffed against git HEAD and are **identical**.
- **A standing tripwire.** `makeOption` warns when any floor's NIA exceeds its GIA. Unreachable now, kept because while it *was* reachable the only symptom was a quietly inflated GDV.

Coverage: `tests/geom.test.ts` (7 tests) checks the clipping against hand calculations, including a U-shaped floor where a horizontal band splits into two disconnected pieces — the case naive clipping gets wrong — plus a 400-rectangle sweep asserting the clipped area never exceeds either input, and the partition-conservation property the room tiling depends on. `tests/layout.test.ts` grew to 19 tests covering L/U shapes, the partial-clip cases real buildings have (chamfered corner, shallow notch, angled rear wall — these clip a unit without killing it, so they exercise the outline path), SVG rendering staying inside the envelope, and the pre-clipping demo figures pinned as regression values. Six of them were confirmed to fail against the unclipped engine.

Still open, and deliberately not addressed here: the packer itself remains bounding-box based, so a notched floor is under-packed rather than optimally laid out (IMPROVEMENTS.md C1 notes this as the residual). A polygon-aware packer is a much larger change; measuring honestly came first.

### 6.4 Tender-price inflation on the main contract (2026-08-24)

| # | Severity | Defect | Fix |
|---|---|---|---|
| 12 | HIGH | HPI indexed **revenue** forward to completion while the build cost stayed frozen at today's money. On the demo at 5% pa HPI over a 15-month programme, GDV rose £6,248,229 → £6,641,154 and the contract stayed at £2,305,099: **+£386,876 of profit created purely by the passage of time**. The model therefore rewarded a *longer* programme, inverting the real risk, and turning HPI on — which the sales research run does automatically, since it fills the HPI array — was not the conservative act it appeared to be. | A `buildInflation` block on `FinanceInputs` (enabled flag + one annual rate, independent of HPI because tender prices and house prices diverge). The typed D01 / room-rate table is treated as **today's** money and indexed to the months the contract is actually certified; percentage-of-build lines (contingency, demolition) follow automatically. `buildCostSchedule` returns both the S-curve-weighted index and the per-month certificate weights, so each certificate carries its OWN index while `Σ weights = 1` and `todayCost × factor = D01` hold exactly — every conservation identity survives. |

Design notes worth keeping:

- **Independent of HPI, on purpose.** Tender prices are driven by labour, materials and contractor workload; house prices by mortgage rates and supply. They routinely move in opposite directions, so one rate cannot serve both.
- **The uplift tracks the S-curve's centre, not the end date.** Twelve extra months of programme moves the midpoint by six, so a 24-month build at 4% pa carries 5.2% rather than ~8%. Pinned in the tests to stop anyone "correcting" it.
- **Ships DISABLED**, with a usable 4% rate loaded, so no stored project's profit moves on load — and `normalizePricing` gates on the flag being present, not on the block, so a truthy-but-empty `buildInflation: {}` cannot inherit the default and silently flip the model (the trap §6.1 finding 8 found in the SDLT block).
- **The asymmetry is never silent again.** `runAppraisal` warns whenever HPI is indexing revenue while tender inflation is off, saying explicitly that a longer programme will wrongly look more profitable; the Pricing page shows the same warning inline. When inflation IS on, the applied factor is reported.
- **Other cost lines stay in today's money** — professional fees, utilities, holding costs. Stated in the warning and in the Pricing note rather than left to be discovered.
- **Researched, not guessed.** The build-cost estimate agent now also forecasts annual tender-price inflation from the BCIS Tender Price Index and cost-consultant forecasts, sanitised into a -15%..+30% band. A missing forecast stays **absent** rather than becoming 0%, which the model would read as "tender prices are flat" instead of "not known".
- Costs tab shows today's sub-total, the inflation step and the indexed contract as three lines, in both build-cost modes, so the room-rate breakdown still reconciles to `rate × area`.

One defect was introduced and caught during this change, of exactly the class §6.2 finding 9 fixed: `buildCostOverride` gated the exported D01 on room-rate mode, so `fixed` mode with inflation on wrote the **typed** figure into the workbook while the model used the indexed one — £72,788 apart on the demo at 4% pa. It now always exports the contract sum the engine used, whatever made it differ from the typed line, and `tests/export.test.ts` asserts that across both build modes with inflation on and off.

Coverage: `tests/buildinflation.test.ts` (25 tests) — the index and weights from first principles, the factor equal to a hand-summed indexed S-curve, conservation through the cashflow, deflation, both build-cost modes, the legacy-file and empty-block migrations, sanitiser clamping, the asymmetry warning firing and *not* crying wolf on an all-zero HPI array, and two seeded-corruption cases proving the auditor catches a wrong factor — which matters because a wrong factor is conservation-consistent, so nothing else in the audit would notice. Six of these were confirmed to fail against the frozen-cost engine. The audit grew from 44 to 48 checks.

### 6.5 Per-exit cost attribution and time-based holding costs (2026-08-24)

| # | Severity | Defect | Fix |
|---|---|---|---|
| 13 | HIGH | Every scenario paid every cost. The refinance-and-hold case (S3) was charged the whole `(G) Sales & marketing` group — **£143,723 on the demo, £93,723 of it agent fees on a sale that never happens** — and its `unrealisedProfit` was literally `netProfit1`, the sale case's profit. It also carried **no letting costs at all**, so the hold was overcharged for selling and undercharged for letting at the same time. | `DevCostLine` gains `whenIncurred: 'always' \| 'onSale' \| 'onLet'` (absent = `always`, so stored files are unaffected), plus a new `(I) Letting` group for the one-off cost of getting the building let. `computeDevCosts` takes a basis and excludes the other exit's lines, recording their total as `excludedTotal`. S3 is priced on its own let-basis build-up **and its own cashflow**, so its dev loan at PC reflects not spending £143,723 of sales cost — the refinance now releases a £144,899 surplus where it previously showed a £2,049 gap, and unrealised profit is £892,064 rather than the sale case's £779,615. |
| 14 | MEDIUM/HIGH | `(F)` holding costs were lump sums spread over the sell period, so the **total never changed with the hold**: £13,550 whether sell-out took 3 months or 24, while interest correctly scaled 6x. The slow-sales case — the one the scenario exists to test — was the one it understated. | Two new cost kinds, `perMonthHeld` and `perUnitPerMonthHeld`, and the four `(F)` defaults converted to them. `Programme` gains `holdMonths`, which is the single figure both the cost lines and the cashflow spread use, so they cannot drift. On the demo the group now runs £6,786 at 4 units/month to £54,288 at 0.5 — exactly 8x for 8x the hold. Sensitivity grid 2 re-prices holding as it sweeps velocity, or it would have reproduced this very defect inside the grid. |

Notes:

- **No double counting with the rent deductions.** `(I)` is deliberately the *one-off* cost of letting — tenant-find fees, EPCs, inventory, licensing. Ongoing management and voids are already deducted from rent by `refinance.mgmtPct` and `voidPct`, so a management fee here would be charged twice.
- **Backward compatibility is exact.** A stored project's `devCosts` array carries no `whenIncurred` and no `(I)` lines, so nothing is excluded, the let basis equals the sale basis, and S3 reproduces its old figures to the penny — asserted directly. Legacy `fixed` `(F)` lines keep lump behaviour.
- **The demo was re-pinned by £22**, being the difference between the old `(F)` lumps and honest round monthly rates. Storing back-derived values like `458.3333333333333` would have protected the goldens at the cost of fake precision in a user-facing default. Every changed pin in `tests/dcf.test.ts` traces to that £22 and says so; S3's larger movement is the fix itself, not a side effect.

A third instance of the §6.2 finding 9 export class was caught here: the workbook has no cell shape for "per month held", so `(F)`'s F61-F64 would have silently kept the *template's* figures while the app computed different ones. Each line's computed amount now travels in the export payload and is written for any amount-cell whose kind the workbook cannot express. **This mapping has now produced the same class of defect three times** (typed vs. banded SDLT, room-rate vs. inflated D01, and now the time-based lines) — it is the weakest seam in the codebase and worth a structural fix rather than a fourth patch.

Coverage: `tests/costincidence.test.ts` (21 tests) — linear scaling with the hold, cost lines and cashflow sharing one hold period, per-unit-per-month scaling, horizon clamping, zero velocity, the grid-2 term recomputed cell by cell, legacy lump behaviour, the incidence split on both bases, S3's reconciliation, the untagged-spec compatibility guarantee, and three seeded-corruption cases. Nine were confirmed to fail against the pre-fix engine. The audit grew from 48 to 53 checks.

## 7. Re-running the audit

```bash
npm test                 # golden + parity + v2 mechanics + identity + regulation tests
./scripts/crosscheck.sh  # shared figures vs LibreOffice-recalculated workbook (needs libreoffice-calc)
```
