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

### 6.6 Guard rails on degenerate inputs, and plausibility checks (2026-08-24)

Four defects with one shape: a degenerate input produced a confident-looking
number instead of an explicit "not applicable", and nothing on screen said so.
The auditor could not catch any of them, because every one was arithmetically
self-consistent — the same blind spot that let the SDLT-doubling bug through.

| # | Severity | Defect | Fix |
|---|---|---|---|
| 15 | MEDIUM | The E29 facility estimate (`totalPreFinance - equity - bridgeAdvance + estRedemption`) was unfloored. With £6m of equity against ~£5.1m of cost it read **-£812,718**, and the arrangement fee at 1.5% became **-£12,191 of phantom finance *income*** netted off total costs. No warning fired: a cash-rich deal was paid to arrange a facility. | The estimate is floored at zero and the fee priced off the floored figure, so finance can never be income. The E29 basis is unchanged — it is faithful to how facilities are priced at signing. `FinanceSummary.devFacilityNil` carries the state onward. |
| 16 | MEDIUM | `velocityPerMonth = 0` returned `monthsToSellOut = 0`, so S2 reported `totalDurationMonths` **15 — "sold out at completion"** — beside `monthsToRepay '36+'` and **£1,164,090** of extra interest. The duration headline and the interest bill described different universes, and the sell-out warning was gated on `velocity > 0` so it could never reach this case. | `monthsToSellOut` and `totalDurationMonths` are `number \| null`; zero velocity is `null` — no sales modelled — and warns, naming the interest figure and pointing at S3. The pref horizon falls back to the sell-down window, which is what it already resolved to. |
| 17 | MEDIUM | `fundingGap` was computed for every month and surfaced **nowhere** — no warning, no UI element, no audit check. Pre-construction spend above bridge + equity is simply unfunded: money out with no source and no interest charged. | `MonthRow.fundingShortfall` quantifies each gap, `runAppraisal` warns with the months and the peak amount, and `plaus-funded` fails the audit. On a zero-equity demo probe the peak shortfall is **£940,782** across months 1-3. |
| 18 | LOW | `ltgdvAtPeak` guarded division by returning 0, and `ltgdvOk` then read `0 <= maxLtgdv` — **`true`**. A schedule with no sale prices *passed the LTGDV covenant*. Same shape for `profitOnCost`, `profitOnGdv`, `interestCover` and `cashOnCash`. | Those five are `number \| null` and the covenant verdict is `boolean \| null`: not applicable when the ratio is, or when no facility is estimated. The UI renders `n/a`, and "not assessed" rather than "(ok)" on the covenant. A real breach stays `false` — pinned by a test, because the not-applicable path is exactly where a breach could get swallowed. |

Notes:

- **A4's written fix was to "skip the facility entirely when the estimate is
  nil". The probe showed that would be wrong.** With £6m of equity the cashflow
  still draws up to **£1,446,776**, because equity is capped at
  `cumNeed - bridgeAdvance` and the bridge must still be redeemed at
  construction start. So a real facility exists while the estimate reads nil.
  Flooring removes the phantom income; it leaves that draw priced at a £0
  arrangement fee, which is an understatement. Rather than paper over it, the
  divergence warns explicitly. **Residual:** the estimate basis and the actual
  draw can disagree, and only the warning connects them. Sizing the facility
  from the cashflow instead of from E29 is the real fix and is a schema-level
  change to how the fee is charged.
- **The ICR check is not a check on the deal.** A7's decision is to warn below
  100% cover only. The demo's ICR of 0.87 is a *true statement* about the
  scheme, not a model defect, so `plaus-icr` does not fail on it — it fails
  only when cover is below 1 and **no warning says so**. A first pass had it
  failing on the ratio itself, which broke five existing "the audit is clean on
  a healthy appraisal" tests and, correctly read, showed the check was
  conflating "the model is wrong" with "the deal is weak".
- **No demo figure moved and no golden pin was touched.** Every fix is gated on
  a degenerate state the demo is not in: the demo's facility estimate stays
  £3,787,281.62, its fee £56,809.22, its sell-out 6 months and its LTGDV
  0.63745. The one visible change on the demo is the new ICR warning, which is
  the A7 decision being honoured.
- **NIA ≤ GIA is already covered** by §6.3's `makeOption` tripwire, and the
  data lives on the option rather than the appraisal, so it is not duplicated
  in `auditAppraisal`.

The seven new plausibility checks (`plaus-facility`, `plaus-finance-cost`,
`plaus-funded`, `plaus-gap-amount`, `plaus-icr`, `plaus-ratios`,
`plaus-duration`) are the E3 answer: they ask whether an answer *could be true
of a real scheme*, where every other check asks only whether the model agrees
with itself. `plaus-ratios` also caught a defect in its own first draft —
`a !== true === b` parses as `(a !== true) === b`, which would have failed a
genuine covenant breach. That is now pinned.

Coverage: `tests/guardrails.test.ts` (23 tests) — the over-equitised probe, the
nil-estimate-with-a-real-draw divergence, zero velocity, quantified funding
gaps and the peak figure in the warning, every not-applicable ratio, the ICR
warning and its silence once cover clears, a real covenant breach staying a
breach, and each new audit check in both its passing and failing state.
Eighteen were confirmed to fail against the pre-fix engine. The audit grew from
53 to 61 checks; the suite from 228 to 251 tests.

### 6.7 The abandoned D3 cycle, and what it uncovered (2026-08-24)

D3 (cost-line discriminant validation, plus replacing `AppraisalView`'s bare
`catch {}`) was built and refused three times, then reverted in full — nothing
from the attempt is on the branch. The refusals are recorded in `LOOP-LOG.md`.
Two of them are worth carrying forward as audit findings in their own right,
because both are true of the engine **as it stands today**, with no D3 code in
it.

**Finding 1 — a repair can move a charge between exits, and can raise profit.**
The first D3 attempt pinned every known code's `whenIncurred` to
`DEFAULT_PRICING` in both directions. That silently narrows an explicit, legal,
wider tag. Measured on `DEMO_SCHEDULE` + `clonePricing(DEFAULT_PRICING)`:
`I01.whenIncurred = 'always'` priced at S1 **760,100.6324761845** as stored and
**779,614.9968750654** once repaired — the sanitiser *invented* **£19,514.36**
of profit; and tagging `G01, G02, G05, G06` as `'always'` (a developer who
marketed for sale, failed, and let) deleted **£42,081.30** of real marketing
spend from the letting exit. Any future validator over `whenIncurred` must
treat `'always'` as a superset it may never narrow, and must not claim that
repairs only ever move numbers downward — a *lateral* tag on a line whose
standard incidence is not `'always'` moves a charge from one exit to another
and can raise reported profit either way.

**Finding 2 — duplicate cost codes are undetected, and the audit cannot see
them by construction.** Logged as IMPROVEMENTS.md **D11 (HIGH)**, with the full
table. Reproduced independently: duplicating `D01` in a stored spec takes
`devCosts.totalPreFinance` from **5,116,085.86508** to **7,421,184.865080001**
and S1 net profit from **779,614.9968750654** to **-1,671,760.1760894181** — a
**£2,451,375** swing — while `sanitizeSpec` reports **0 repairs** and
`auditAppraisal` returns **61 checks / 0 fails**. `costs-lines` resolves both
spec entries to the same engine line *by code*, so it compares the line with
itself; the `costs-group-*` checks sum the engine's own lines, so the doubled
total agrees with itself. This is the most serious kind of defect the model can
carry: not a crash, but a confidently wrong number with a green audit behind
it. **Unfixed.**

A third objection was documentary only: `sanitizeSpec`'s existing `value`
branch zeroes anything `Number.isFinite` rejects, so a hand-edited
`"value": "40000"` on `D02` deletes the £40,000 utilities line and lifts S1 to
**822,129.49** at 61/0. Pre-existing, out of D3's scope, and now recorded so
the next validator does not assert a "repairs always charge the cost" property
the code does not hold.

### 6.8 Investor ROI: one headline, two denominators (2026-08-24)

**Finding — the reported ROI changed with the profit mode, not with the
scheme.** `computeWaterfall` set `investorCapital = mode === 'waterfall' ?
drawnPeak : committed`, so the single `investorRoi` silently swapped its
denominator when the user flipped a presentation switch. Measured on
`DEMO_SCHEDULE` + `clonePricing(DEFAULT_PRICING)` with
`equity = {total: 5,000,000, investorShare: 0.5}`,
`waterfall = {prefRatePa: 0, residualInvestorPct: 0.5}` — a deal that is
economically identical either way (no pref, 50/50 residual), S1:

| mode | investorCapital | investorProfit | investorRoi |
|---|---|---|---|
| `simple` | 2,500,000 | 468,825.93673477694 | **0.1875303746939108** |
| `waterfall` | 1,900,218.6900399998 | 468,825.93673477694 | **0.24672209529994052** |

Same profit, same cashflow, **5.92 percentage points apart**.

**Second finding — the two sides of the stack were measured on different
bases.** In waterfall mode `investorCapital` was the drawn peak while
`developerCapital` stayed *committed*. Their sum, **4,400,218.69**, reconciled
to neither the £5,000,000 committed nor the £3,800,437.38 peak drawn
(`finance.equityUsed`), so the Distribution-waterfall table displayed a capital
stack that was not any real quantity, and nothing checked it.

**Fix (A5) — report both bases, always, in both modes.** `WaterfallResult` now
carries `investorCommitted` / `investorDrawnPeak` / `developerCommitted` /
`developerDrawnPeak` and the four ROI figures
(`investorRoiOnCommitted`, `investorRoiOnDrawn`, and their per-annum pair),
each `null` where its base is exactly zero — the A9 precedent that a degenerate
ratio must never read as a confident zero. Committed is the money the investor
cannot deploy elsewhere for the duration; drawn peak is the exposure the
cashflow actually called. Both parties' drawn peaks come from **one traversal**
of the same `equityMonth` series with complementary shares, so they cannot
drift. On the probe both modes now report 18.75% committed and 24.67% drawn,
and 1,900,218.69 + 1,900,218.69 = 3,800,437.38 = `finance.equityUsed`.

**No money moved.** `investorProfit`, `developerProfit`, `prefAccrued`,
`prefPaid`, `prefShortfall` and `residualProfit` are untouched, as are the
legacy `investorCapital` / `investorRoi` / `investorRoiPa` — now documented in
the type as mode-dependent and no longer the reported figures. On the demo
defaults (equity 1,400,000, fully drawn) S1 still reports investor capital
700,000, ROI **0.556867854910761**, ROI pa **0.4454942839286088**, investor
profit **389,807.4984375327**, and the new pair agrees with itself. No golden
pin in `tests/dcf.test.ts` moved; the only deliberate movement is the audit
count.

**New audit check, one per profit scenario** — `wf-s1-capital`,
`wf-s2-capital`, `wf-s4-capital`: committed halves sum to `equity.total`, drawn
peaks sum to the peak `equityCum` over that scenario's own horizon, investor
drawn never exceeds investor committed, and each ROI times its own base returns
`investorProfit`. Clean demo: **65 checks / 0 fails** (was 62/0; +3, one per
scenario). Tripwire proven: `investorDrawnPeak += 1` on S1 fails
`wf-s1-capital` while S2 and S4 still pass.

**Failing-first evidence.** `tests/roi.test.ts` — 7 tests, all 7 failing
against the pre-change engine (`expected NaN to be less than or equal to
1e-12`, `expected undefined to be 2500000`, `wf-s1-capital: expected undefined
to be true`, and the stored-project test on `expected undefined to be 700000`),
all 7 passing after. Re-verified at the landing step by running the delivered
file in a worktree at the pre-change commit `0b2a57e`: `Tests 7 failed (7)`.

**Residual.** The legacy `investorCapital` / `investorRoi` / `investorRoiPa`
are still mode-dependent in the engine's return value. They are documented as
such and are no longer what the UI reads, but a future consumer that reaches
for `investorRoi` will still get a mode-dependent denominator. Retiring them is
a separate, wider change.

### 6.9 One appraisal entry point: the Options page priced from the raw spec (2026-08-24)

**Finding — two screens of the same app reported different profits for the same
option, and the screen the user chooses on was the wrong one.**
`OptionsView` called `runAppraisal(o.schedule, project.pricing, o.roomAreas)`
on the **raw** spec for the "S1 profit" on every card; `PricingView` did the
same for the GDV and `devFacilityEstimate` it briefed the finance-research agent
with. `AppraisalView` and the workbook export priced from the **repaired** spec
(`sanitizeSpec` then `repairSchedule`) and disclosed the repairs in the audit
strip. Nothing on the Options grid disclosed anything.

No file editing is needed to reach it: `PctField` is
`<input type="number" step="0.1">` with no `min` and no `max`, so `450` typed in
the bridge-rate box stores `bridge.ratePa = 4.5` and `90` in the agent-fee box
stores `sales.agentFeePct = 0.9`. `sanitizeSpec` repairs both (`bridge rate
4.5->0.5`, `sales agent fee 0.9->0.2`). Measured on
`generateOptions(DEMO_BUILDING, DEFAULT_RULES, ...)` with that spec:

| Option | Options card (raw) | Appraisal page (repaired) | Divergence |
|---|---|---|---|
| `full_max_units` | **-7,365,660.643752255** | **+431,604.0969711812** | £7.80m, sign flip |
| `full_balanced` | -7,365,660.643752255 | +431,604.0969711812 | £7.80m, sign flip |
| `full_family` | -7,346,488.693813074 | +451,889.7887576418 | £7.80m, sign flip |
| `DEMO_SCHEDULE` | -7,173,576.862996035 | -558,799.2093047546 | £6.61m |

A developer reading the grid abandons every conversion as catastrophically
loss-making while the app's own appraisal page prices `full_max_units` at
**+£431,604** and its audit strip reads **65 checks / 0 fails, 2 input repairs
applied**. Second reproduction, a preset-merged spec carrying `D01` twice (the
duplicate-code repair of D11): card **-1,671,760.1760894181** against appraisal
**+779,614.9968750654**, £2,451,375 apart and again across the profit/loss line.

**Fix — `src/core/appraise.ts`, and no view may price a scheme itself.**
`appraiseProject({schedule, pricing, roomAreas}, {audit?})` runs
`sanitizeSpec` → `repairSchedule` → `runAppraisal` → `auditAppraisal` (audit
opt-in only; 65 re-derivations per option card is not free) and returns the
result **with the repaired spec and schedule it was computed from**, the
repairs, and an error string. It never throws. All three views now call it, so
the figure on the card is the figure the appraisal, the audit and the workbook
are built from.

Two empty results are kept distinct, because collapsing them is what made the
old bare `catch {}` unreadable: **nothing to price** (no schedule or no spec) is
all nulls with `error: null`, and **pricing failed** is `result: null` with the
message *plus the repairs the completed stages had already found*. On screen:
`AppraisalView` shows an error panel naming the failure and listing those
repairs instead of "No option selected yet" for a scheme that was selected;
`OptionsView` says how many repairs it priced from and how many options failed;
`PricingView` refuses to brief the research agent rather than sending it a GDV
of 0.

**No well-formed project moves.** Sanitising a clean spec is the identity, so
all 8 demo options price bit-identically (`toBe`): `full_max_units`
2079630.1602789517, `full_balanced` 2079630.1602789517, `full_family`
2100210.1981250523, `mixed_max_units` 1400878.62059341, `mixed_balanced`
1400878.62059341, `mixed_family` 1414649.656284904, `floor_through`
1922012.764009281, `whole_house` 2285332.0792131154. No engine change, no schema
change, no flag, no migration: nothing stored moves and nothing on load moves.
No golden pin in `tests/dcf.test.ts` moved and the demo scheme's audit stays
65 / 0.

**Blast radius on screen — two distinct cases, not one.** (i) Where
`sanitizeSpec` reports a repair, the figure moves **to** the disclosed figure
the workbook already carried, which is the point of the item. (ii) Separately,
and with **no repair involved at all**, an option whose `schedule` is empty now
shows **no S1 profit stat**, where it previously showed one. `generateOptions`
does return such options — `conversions.ts` warns "No residential dwelling could
be planned on this envelope" and still emits the option — and on a 0.3-scaled
`DEMO_BUILDING` (7.8m x 3.9m floors, too shallow for any compliant unit)
`full_max_units`, `full_balanced` and `full_family` all come back with
`schedule.length === 0`. The card printed **"S1 profit -2790709.023373137"**
there at HEAD, from `runAppraisal` over an empty schedule, and now prints
nothing, with `repairs: []` and `error: null`.

That is deliberate and is the honest presentation: -£2.79m is the acquisition,
finance and holding cost of buying a building and constructing no dwelling, not
a conversion's profit, and it sat beside "0 units", "£0.00m GDV" and the card's
own **"Not viable - no dwellings"** badge. `appraiseProject` classifies an empty
schedule as *nothing to price* rather than as a failure (criterion 5), so the
stat is absent next to an explicit badge saying why, instead of inviting a
comparison between a scheme's profit and a non-scheme's sunk cost. Pinned in
`tests/appraise.test.ts` so the next cycle inherits a true blast radius.

The same option is why `PricingView` guards on the **result** and not only on
the error: at HEAD it briefed the finance-research agent with
`{ gdv: 0, facility: 1356702.246962354 }` — a facility sized off the purchase
price for a scheme with no units — and a first cut of this change guarded on
`p.error` alone and threw `Cannot read properties of null (reading 'totals')`,
which `runEstimates` then displayed verbatim in the failed estimate row. It now
reports *"The appraisal could not be priced, so the finance research has no
facility size to work from: &lt;the selected option has no unit schedule to
price&gt;"*.

**The brief must describe one spec, not half of each.** A second cut of this
change routed only the GDV and the facility through `appraiseProject` and left
`purchasePrice` and `bridgeLtv` on the raw `spec.finance`, which is reachable by
this item's own mechanism: 'LTV on purchase' is a `PctField` with no `max`, so
`700` typed there stores `bridge.ltv = 7`. `sanitizeSpec` repairs it (`bridge
LTV 7->1`) and the facility comes back sized off a **£1,950,000** bridge advance
at 100% LTV (`devFacilityEstimate` £4,114,375.976832083, GDV
£7,872,242.8484000005 on `full_max_units` of `DEMO_BUILDING`) — while the brief
still said `bridgeLtv: 7`. The researcher was therefore asked to source bridge
terms at 700% LTV for a facility sized at 100%, and its rates were then applied
to the repaired appraisal. The raw brief was at least self-consistent;
half-repaired is worse than either spec whole. Every field of the brief now
reads from `p.spec.finance` and `p.result`, and the raw `fin` survives only on
the branch where nothing was priced and there is no repaired spec to read.

Noted in passing, and NOT caused by this change: of the 8 generated demo
options, 7 audit 65 / 0 but `whole_house` audits **63 / 1** on `DEFAULT_PRICING`
— `cf-retention: withheld £30,370.3 vs released £0`. Its `pcMonth` is 112, so
the defects-period release at month 118 falls outside the model horizon and the
retention pot never empties. Reproduced identically through the pre-change
`sanitizeSpec` → `repairSchedule` → `runAppraisal` → `auditAppraisal` chain, so
the Appraisal page already showed this failing check for that option; the
retention identity really is broken there. A separate item.

**Standing dependency, now pinned by a test.** `generateOptions` reads only
`spec.rates` (via `rateFor`) and `spec.build` (via `buildMonthsFor`), and the
sanitiser has no rule touching either, so `store.regenerate()` staying on the
raw spec creates no divergence today. `tests/appraise.test.ts` asserts
`sanitizeSpec` leaves both sub-objects deep-equal on a messy spec: if a rule
ever clamps a rate or a build month, that test fails and `regenerate` must be
routed through the same entry point.

**Failing-first evidence.** `tests/appraise.test.ts` (24 tests) cannot even load
at `2dfdf20` — `Failed to load url ../src/core/appraise`. Re-run in a worktree
at `2dfdf20` with **only the new module** dropped in and the views left as they
were: `Tests 5 failed | 19 passed (24)`. The source guard names all three
offenders (`expected [ 'AppraisalView.tsx', 'OptionsView.tsx',
'PricingView.tsx' ] to deeply equal []`); each of the three copy assertions
fails because none of the three screens said any of this; and *PricingView
guards on the result, not only on the error* fails because the raw call was not
guarded at all.

Two further assertions were failing-first against the **first cut of this
change**, which guarded on `p.error` alone and read the result through a
non-null assertion: *no view non-null-asserts a priced result* →
`expected [ 'PricingView.tsx' ] to deeply equal []`, and *the finance brief is
refused with the mandated sentence, not a TypeError* →
`expected TypeError: Cannot read properties of null… to not be an instance of
TypeError`.

Four more were failing-first against the **second cut**, the half-repaired
brief above. *briefs the repaired LTV of 1, not the 7 the input box holds* →
`the brief must quote the LTV the facility was sized at: expected 7 to be 1`;
*briefs the repaired purchase price too* → `the brief must quote the price the
appraisal was priced on: expected -500000 to be +0` (the purchase price is
clamped to >= 0, so the raw read had a second way to disagree with the figures
beside it); *PricingView reads no raw finance field once a repaired spec exists*
→ `expected 'const p = appraiseProject({ schedule:…' not to match /\bfin\./`;
and the guard assertion, now `if (p.error || !p.result || !p.spec)`. The LTV
assertion evaluates the expression the **view** briefs each deal field from,
lifted out of `runFinanceEstimate`'s source and evaluated against the same two
bindings the view has (`fin` raw, `f` repaired), rather than a hand-written
mirror of the brief — a mirror is what let the half-repaired brief pass. The
view cannot be rendered instead: there is no DOM under vitest and it pulls in
the zustand store and `window.satis`.

All 28 pass as delivered; 265 → 293 tests.

**Residuals.** (a) `sanitizeSpec` still throws on a non-array `devCosts`
(`s.devCosts is not iterable`) and the repairs it found before the throw are
unrecoverable — it accumulates them in a local array and does not return on the
throw path, so `appraiseProject`'s promise to preserve partial repairs stops at
the sanitiser's own boundary. (b) Unknown `group`/`kind` on a cost line are
still unvalidated, so such a spec is unpriceable rather than repaired (D3 stays
open, and is now strictly easier because the error is on screen). (c) `PctField`
still has no `min`/`max`, so the fat-finger input remains enterable — repaired
and disclosed, not prevented. (d) Selecting a zero-dwelling option still shows
"No option selected yet." on the Appraisal page: that is nothing-to-price, not a
failure, so it correctly takes the empty state — but the sentence is wrong for a
scheme the user did select. Copy only, and it needs the card's "not viable"
reason to say anything better.

### 6.10 Spec discriminants: validated, resolved and disclosed (2026-08-24)

**Finding — three of the four discriminants the engine branches on were never
validated, and each one errs in the direction that flatters the deal.**
`sanitizeSpec` checked `finance.sdlt.regime` and nothing else. Every other
discriminant is read in `dcf.ts` as a `=== 'literal'` test, so a corrupt value
is not rejected: it silently takes the else-branch. Probed on this checkout at
`2dfdf20` with the `full_balanced` option of `DEMO_BUILDING` and
`clonePricing(DEFAULT_PRICING)`, one hand-edited value at a time — baseline
0 repairs, **65 checks / 0 fails**, D01 £2,526,760.9416,
`totalPreFinance` £5,404,844.04553, S1 net profit £2,079,630.1602789517:

| Hand-edited value | repairs | audit | S1 net profit | against the correct spec |
|---|---|---|---|---|
| `buildCostMode: 'typo'` | **0** | 65 / 0 | **2,331,378.373762631** | **+£251,748.21** vs `'roomRates'`; D01 collapses to 2,305,099 (−£221,661.94 of build cost) |
| `waterfall.mode: 'typo'` | **0** | **62 / 0** — `wf-s1-simple`, `wf-s2-simple`, `wf-s4-simple` silently skipped | 2,079,630.16 (unchanged) | investor paid the *simple* 1,039,815.08 while the result reported mode `'typo'`, so `WaterfallTable` rendered nothing; a genuine `'waterfall'` run pays 1,072,525.53 |
| `vat.optedToTax: true, vat.fundedBy: 'typo'` | **0** | 65 / 0 | **2,058,321.89779957** | identical to `'equity'`; **£17,056.89** of VAT-loan fee and interest avoided vs `'vatLoan'` (2,041,265.0087556047) |

A quarter of a million pounds of profit from a misspelt string, while the audit
strip reads 65 checks, 0 fails, 0 repairs. The middle row is the worse defect:
the instrument meant to catch this class of thing had a hole in it, because
`wf.mode === 'simple'` gated the simple-split reconciliation and an unknown
mode was assessed by **neither** branch — the report shrank by three checks and
said nothing about it. Pulling on that thread found a second state falling
through the same gap, with no corrupt input at all: a **loss-making waterfall
deal**, where the engine splits pro rata but the mode still reads
`'waterfall'`. See the fix below.

**Fix (D4) — resolve to the branch the engine already took, and report it.** A
`fixEnum` helper beside `fix()` resolves `buildCostMode` → `'fixed'`,
`finance.waterfall.mode` → `'simple'`, `finance.vat.fundedBy` → `'equity'` and
(folded in unchanged in wording and fallback) `finance.sdlt.regime` →
`'manual'`, each through the existing `AuditRepair` channel that `AuditStrip`
already renders. **For the three discriminants this item newly validates**, the
fallback is what the engine *already* did with the corrupt value, so **no
figure moves anywhere** — this is a disclosure fix, not a correction. The
sanitiser deliberately does **not** guess the costlier intent
(`'roomRates'`, `'vatLoan'`): the intent behind a corrupt string is unknowable,
and inventing a repricing or a whole VAT facility on load is exactly the
stored-project movement that §6.1 finding 8's `sdlt: {}` trap warns against.

**The SDLT regime is the exception to that no-movement claim, and is worth its
own record.** Its repair is pre-existing and unchanged by this cycle — same
wording, same `'manual'` fallback — but it is *not* justified the way the other
three are. `dcf.ts` gates the automatic calculation on `regime !== 'manual'`,
so an unrecognised regime takes the **automatic** arm; `computeSdlt`
(`src/core/sdlt.ts:60`) has no default case, B04 comes back `undefined`, and
the whole appraisal goes NaN. Measured on the demo with
`finance.sdlt = { regime: 'typo' }`: raw S1 net profit **NaN**, sanitised
**2,079,630.1602789517** — a whole appraisal of movement, not zero. `'manual'`
remains the right resolution, but because it preserves the solicitor's typed
B04 rather than because it reproduces a branch that is unusable. This is the
one discriminant whose corruption fails **loudly** rather than flatteringly,
which is why it was the only one already validated before this item, and why
its "movement" is the repair of a NaN and not the movement of anyone's stored
number.

**`normalizePricing` was deliberately left alone.** It still coerces a missing
`buildCostMode` to `'fixed'` silently at load (`src/core/pricing.ts:178`, "old
files priced from fixed D01"). That is a migration default for a field that was
never written, not a corruption, and the loader has no channel in which to
report anything. Validation belongs where it can be *told to the user*.

**Two auditor changes.** The simple-split gate is now
`wf.mode !== 'waterfall' || netProfit <= 0`, the literal negation of the
engine's own condition for the waterfall arithmetic, which is
**`mode === 'waterfall' && netProfit > 0`** — not `mode === 'waterfall'`
(`src/core/dcf.ts:708` reads `if (wf.mode !== 'waterfall' || netProfit <= 0)`).
Mirroring it exactly is the only thing that makes the check's coverage
complementary, so no deal state can fall between the two branches. Two used to.
The first was an unrecognised mode (`=== 'simple'` false). The second, found by
the reviewer of the first attempt at this item and fixed here, was a
**loss-making waterfall deal**: a loss is shared pro rata however the deal is
papered, because there is no preferred return payable out of a negative number,
so the engine ran the simple split while `!== 'waterfall'` was false and the
check was skipped. Measured, `full_balanced` with `priceAdjust −0.5` and
`waterfall { mode: 'waterfall', prefRatePa 0.08, residualInvestorPct 0.7 }`: S1
net profit **−1,795,885.48**, investor **−897,942.74** = net profit × the
*simple* share 0.5 — and `wf-s1-simple`/`-s2-`/`-s4-` absent, **62 checks**. It
now reads **66 / 0 fails**, the same count as the identical loss papered as a
simple split. A genuinely profitable waterfall still reports 63: those three
checks are correctly not applicable there, and asserting them would be a false
failure. And a new tripwire `inputs-enums` ("Every spec discriminant is a value
the engine recognises") fails, naming the field and the offending value, on any
spec that still carries one — the D11 pattern.

That tripwire is **defence in depth, not a live catch**. The rationale it was
written against — `OptionsView` and `PricingView` calling `runAppraisal` on the
raw spec — was closed by §6.9 (D12) while this cycle was in flight: every screen
now prices through `appraiseProject`, which sanitises before it audits, so no
caller in the shipped app can reach `auditAppraisal` with a corrupt
discriminant. It is kept, and its comments say so plainly, because the failure
it guards is the silent kind: every other check re-derives the model from the
same spec the engine was handed, so a corrupt discriminant makes auditor and
engine agree on the wrong branch and every identity holds while the answer is
not the one the file asked for. A future caller auditing an unsanitised spec
would otherwise collect a clean bill of health on a scheme priced by a branch
nobody chose.

**Check count** on `full_balanced`, every "before" figure measured at `2dfdf20`
and every "after" figure on this tree:

| Spec | before | after | what moved |
|---|---|---|---|
| clean, either raw or sanitised | 65 / 0 | **66 / 0** | the tripwire, which passes |
| unrecognised `waterfall.mode`, sanitised | 62 / 0 | **66 / 0** | tripwire + the three `wf-*-simple` restored |
| unrecognised `waterfall.mode`, raw | 62 / 0 | **66 / 1** | as above, and the tripwire now fails as it should |
| unrecognised `buildCostMode`, raw | 65 / 0 | **66 / 1** | the tripwire, failing |
| loss-making `waterfall` deal | 62 / 0 | **66 / 0** | the three `wf-*-simple` restored, plus the tripwire |
| profitable `waterfall` deal | 62 / 0 | **63 / 0** | the tripwire only; the three simple checks are correctly not applicable |

Those are the only movements. Two suites pin the count exactly and both were
updated 65 → 66, with the provenance in their comments and in the commit
message: `tests/appaudit.test.ts`'s clean-spec pin, and the two in §6.9's
`tests/appraise.test.ts` ("opted in on a clean spec" and "opted in on the typo
spec"), which landed on the branch while this cycle was in flight. In every one
of them `failCount` stays 0 and no existing check changed verdict — the +1 is
the new tripwire passing. No golden pin in `tests/dcf.test.ts` moved, and no
engine file was touched.

**Incidental, fixed here because it blocked the tripwire from ever being
reported:** the auditor *threw* on a raw spec with an unrecognised SDLT regime.
`computeSdlt` has no branch for one, so the engine's B04 comes back `undefined`
and the `gbp()` formatter died on `undefined.toLocaleString()`, taking the
whole report with it. `gbp()` is now total for non-numbers; output for every
finite value, and for `NaN`, is byte-identical.

**Failing-first evidence.** `tests/enums.test.ts` — 7 tests, 6 of them failing
against `2dfdf20` (`expected [] to have a length of 1` ×3,
`inputs-enums must exist: expected undefined to be defined`, `expected 65
checks to have a length of 66`, and for the loss-making waterfall
`wf-s1-simple must be assessed …: expected undefined to be defined`), all 7
passing after. The seventh, F2, passes both before and after by design: it is
the guard on the *other* side of the gate, pinning that a profitable waterfall
is still **not** reconciled as a simple split, so a future widening of the
condition cannot assert `profit × share` against arithmetic that never ran.

**Residual — the overstatement is disclosed, not removed.** A file with
`buildCostMode: 'typo'` still prices its contract from the fixed D01 line and
still shows the £251,748 of profit that the room rates would not have given.
The repair note now says which side of that the appraisal landed on; choosing
the right mode remains the user's act, in the UI. Likewise a corrupt
`vat.fundedBy` no longer claims a facility nobody priced, but the £17,056.89 of
VAT-loan cost is not conjured back. And cost-line discriminants
(`DevCostLine.group` / `kind` / `whenIncurred`) are still unvalidated — that is
D3, still open, and it needs an incidence rule this change deliberately does
not invent.

### 6.11 Pre-release audit of the v0.3.0 merge (2026-08-26)

Before cutting v0.3.0 (main v0.2.4 merged with the five improvement-loop
cycles: C3, D11, A5, the sanitised-spec entry point, D4), the two audit agents
re-ran the full battery on the merged tree and independently recomputed the
headline figures from first principles — 43 checks on the demo scheme, all
agreeing with the engine at ≤2e-9 absolute, plus conservation identities on
six stressed configurations. No engine defect was found. Three findings, none
in the model:

| # | Severity | Defect | Fix |
|---|---|---|---|
| 1 | LOW (harness) | `scripts/crosscheck.ts` hand-rolled the export inputs without each line's engine-computed `amount`, so the per-month-held **(F)** lines fell through `xlsxExport`'s amount branch and the workbook kept the template's stock lumps (£13,550 vs the engine's £14,224 on the cross-check scheme). The compare step then reported a £674 pre-finance divergence — and £13.48 on the arrangement fee, exactly 2% of it — against an engine that was right. Pre-existing since the F-group went per-month-held; none of the loop's commits caused it. | The harness now builds its inputs with the app's own `buildExportInputs`, the same path the real export takes. All five shared figures agree with the LibreOffice-recalculated workbook to the penny. |
| 2 | LOW (docs) | `appraise.ts` docblock still said "the 65-check re-derivation"; the auditor returns 66 on the demo since D4. | Comment corrected. |
| 3 | LOW (disclosure wording) | The D11 dedup repair read `to: 'removed'` beside a reason saying the line is charged once — ambiguous about whether the kept line survived. | Repair now reads `to: 'duplicate copy dropped'` with the reason stating the first occurrence is kept and charged. |

No golden pin moved, no financial default changed, no audit check weakened.
Battery at the cut: `tsc --noEmit` clean, 300/300 tests, `crosscheck.sh` all
figures `diff=0.0000`, auditor self-test 22/22 (every check proven to fail on
its seeded defect).

## 7. Re-running the audit

```bash
npm test                 # golden + parity + v2 mechanics + identity + regulation tests
./scripts/crosscheck.sh  # shared figures vs LibreOffice-recalculated workbook (needs libreoffice-calc)
```
