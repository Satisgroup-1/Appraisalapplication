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

## 7. Re-running the audit

```bash
npm test                 # golden + parity + v2 mechanics + identity + regulation tests
./scripts/crosscheck.sh  # shared figures vs LibreOffice-recalculated workbook (needs libreoffice-calc)
```
