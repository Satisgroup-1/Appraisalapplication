# Satis Appraisal

Desktop application (Windows + macOS) that imports floorplans of existing buildings, generates
the set of ways they could be converted — commercial → residential, splitting larger buildings
into flats, lateral floor-through apartments, or merging flats back into a single dwelling —
validates every layout against UK minimum-space rules, and runs a full DCF development
appraisal of each option, mirroring the Satis Appraisal Model workbook.

Built with Electron + React + TypeScript, styled to the Satis brand guidelines (Satis_Brand_V7).

## Workflow

The app opens with the SATIS letter-drop intro (as on the group website), then lands on the
**Projects** homepage — a library of schemes with framed cards. Projects auto-save; select one
to enter its workspace:

1. **Building** — import floorplans:
   - **PDF / images** are interpreted with AI (Claude vision; connect an account in
     Settings — see [Connecting Claude](#connecting-claude)). Extraction assumptions and
     scale basis are surfaced for review — always confirm dimensions before generating
     options.
   - **DXF** files are parsed deterministically (largest closed polyline = envelope,
     `STAIR`/`LIFT`/`CORE` layers = cores, `WIN*` layers = windows).
   - **Manual entry** — type dimensions, window counts and core placement per floor.
2. **Pricing** — sale £psf and rent rates by unit type, **build £/sqft by room type**
   (living/kitchen, bedrooms, bathrooms, halls, circulation, retained commercial — the build
   cost is computed from each option's actual room areas, so layouts with more wet rooms cost
   more), build programme, purchase/finance parameters (bridge, development loan, equity
   split, sales assumptions, refinance), VAT on the purchase (opted-to-tax sellers: paid at
   completion, reclaimed ~2 months later, equity- or VAT-loan-funded), contractor retention
   (3% withheld, 1.5% at PC, 1.5% after the defects period), deposit interest on cash held,
   **house price inflation** (a projection agent researches current regional figures and
   forecasts with sources, or enter rates manually), the profit structure (simple split or a
   preferred-return waterfall) and the full development-cost schedule. Save/load named presets
   as JSON files.

   **Pricing estimates** research real-world figures for the project and show a suggestion —
   likely value, low-high range, confidence, rationale and dated sources — beside each covered
   field; nothing is applied without a click (per field or per group). Sales £/psf and rents
   come from sold prices within half a mile of the address (up to 18 months old, indexed to
   today on recorded local UK HPI with a regional/national blend bridging unpublished months)
   reconciled against current listings, with a measured new-conversion uplift and a widen-and-
   flag rule when evidence is thin; the same run fills the HPI projection so growth to
   completion is only ever counted once. Build cost is one researched all-in conversion £/sqft
   (prelims and OH&P in; contingency and demolition out) scaled onto the room-rate table,
   ratios preserved, anchored by tender results recorded in Settings. Finance rates (bridge,
   dev loan, VAT loan, refinance) are shaped to the deal's LTV, size and asset type and
   anchored by term sheets recorded in Settings; the deposit rate pegs to SONIA minus a
   researched spread. Estimates are stored in the project with their evidence and flag
   themselves stale after 30 days. **Stamp duty needs no estimate**: line B04 computes exactly
   from HMRC bands via a per-project selector (commercial/mixed-use, residential company
   rates, or manual for the solicitor's figure), charged on the VAT-inclusive price when the
   property is opted to tax.
3. **Options** — one click enumerates conversion options: all-residential at three unit-mix
   strategies (max units / balanced / family), ground-commercial + residential uppers,
   floor-through lateral flats, and a whole-building merge. Every unit is validated against
   the NDSS ruleset (editable in Settings); each option gets a schematic SVG plan, a
   compliance report and a priced unit schedule.
4. **Appraisal** — the adopted option runs through the DCF engine: development cost build-up,
   a 48-month cashflow (bridge against the purchase only, S-curve build drawdown, SDLT on
   completion, architect/QS fees to PC, retention withheld and released, VAT flows, dev loan
   roll-up), four exit scenarios (sell at PC, delayed sales, refinance & rent,
   refinance-then-sell) with HPI-indexed sale prices and per-scenario distribution waterfalls,
   and sensitivity grids. Export a populated copy of the Appraisal Model workbook (`.xlsx`) —
   sheets 1-6 recalculate with the workbook's own (classic) formulas, and a `7. App Model v2`
   sheet carries the app's richer model and assumptions.

## Connecting Claude

Only the PDF and image floorplan reader calls Claude; DXF import, manual entry, the layout
engine, the NDSS validator and the whole DCF appraisal run entirely offline. Settings offers
two ways to connect, and shows which one a request will actually use:

- **Sign in with Claude** — opens the browser, and the token is refreshed automatically from
  then on. Nothing to copy or re-enter, and nothing to install by hand. The sign-in is
  performed by the [Anthropic CLI](https://platform.claude.com/docs/en/api/sdks/cli)
  (`ant auth login`), which owns the OAuth flow and stores one profile shared with every
  Anthropic tool on the machine. If the CLI is not already installed, the app downloads the
  pinned release itself on first sign-in (into its own data directory) and verifies it
  against a SHA-256 recorded in the source (`electron/cliInstall.ts`) before running it; a
  copy the user installed always takes precedence. The app never handles the tokens itself;
  the SDK reads and refreshes that profile. Signing out is `ant auth logout`, deliberately
  left to the CLI because the profile is shared.
- **An Anthropic API key** — pasted into Settings and encrypted with the OS keychain
  (`safeStorage`). Where no keychain exists the key is written to a file readable only by the
  user account, and Settings says so rather than implying encryption.

`ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` are honoured when set. Note that on macOS and
Linux a variable exported from a shell profile is invisible to an app launched from Finder or
a desktop launcher, so it only applies when the app is started from a terminal.

Precedence matches the SDK's own resolution order exactly, so the reported credential is the
one that will be used: stored key, then `ANTHROPIC_API_KEY`, then `ANTHROPIC_AUTH_TOKEN`, then
the Claude sign-in. When a key shadows a sign-in, Settings says so rather than leaving the
account label misleading. `tests/auth.test.ts` pins this order.

**Test connection** in Settings resolves the active credential and retrieves the model record,
translating failures into plain English (rejected credentials, no model access, no credit,
rate limited, unreachable API) instead of surfacing a raw status code.

Credentials never cross into the renderer: resolution, storage and every API call happen in
the Electron main process, and the IPC surface returns account labels only.

## Development

```bash
npm install
npm run dev        # vite + electron with hot reload
npm test           # engine tests, incl. golden tests vs the Excel workbook
npm run typecheck
```

The DCF engine (`src/core/dcf.ts`) began as a cell-by-cell port of `Appraisal_Model_1.xlsx`
and has since deliberately deviated where the workbook simplified timing (S-curve drawdown,
SDLT on completion, retention, VAT, HPI, waterfall) — the deviations and their verification
are catalogued in AUDIT.md §5;
`tests/dcf.test.ts` asserts it reproduces the exact values Excel computed for the demo scheme
(cached workbook results). The layout engine and NDSS validator are ports of the
`floorplan-converter` agent skill (`scripts/layout.py`, `validate.py`).

Every appraisal runs through an **automatic financial audit** (`src/core/audit.ts`): 40+
checks re-derive every cost line, unit cell, conservation identity, scenario linkage and
profit distribution independently of the engine, and recoverable input messes are repaired
with a visible note. For engine changes, run the `/audit-dcf` skill — it fans out the
`dcf-financial-auditor` and `dcf-numeric-verifier` agents (`.claude/agents/`).

An hourly improvement loop (`.claude/appraisal-loop.md`) runs three agents — planner, builder
and a reviewer holding a hard veto — against the backlog in **IMPROVEMENTS.md**. Run
`./scripts/loop-status.sh` to see where it has got to: branch state, the green bar, every
cycle's outcome from `LOOP-LOG.md`, the remaining backlog, and anything waiting on a decision.

See **AUDIT.md** for the full model audit: golden tests, financial identity tests, the
regulation review of the floorplan converter, and a LibreOffice cross-check
(`./scripts/crosscheck.sh`) that recalculates an exported workbook headlessly and verifies the
engine matches the workbook's own formulas to the penny on an independent scheme.

## Building installers

```bash
npm run dist:win   # Windows NSIS installer (run on Windows)
npm run dist:mac   # macOS dmg, universal (run on macOS)
```

CI (`.github/workflows/build.yml`) builds both installers on every push to `main` and uploads
them as artifacts. Builds are currently **unsigned** — Windows SmartScreen and macOS
Gatekeeper will show a warning on first launch. To sign, add certificates as repo secrets and
signing config under the `build` key in `package.json`.

## Brand

The design system follows the Satis group website (`satis-group-website`): warm paper
surfaces (`#f5f1e9`), brass accents (`#a5813f`), clay/sage status colours, indexed eyebrow
section labels, and brass crop-mark frame corners on project cards — layered over the
Satis_Brand_V7 fundamentals (letterspaced SATIS wordmark, monochrome ink). Work Sans (the
brand's secondary/web face, OFL-licensed) is bundled; if you hold a Fieldwork licence, drop
the font files into `src/assets/fonts` and add `@font-face` rules — the CSS font stack
already prefers Fieldwork.

## Scope notes

Layouts are feasibility schematics, not architecture. Planning matters — permitted development
rights, Class MA, minimum natural-light tests, fire strategy, external amenity — are out of
scope and flagged as risks, never claimed compliant. Options exceeding 30 units warn that they
exceed the appraisal workbook's unit capacity.
