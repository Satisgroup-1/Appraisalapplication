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
   split, sales assumptions, refinance) and the full development-cost schedule. Save/load
   named presets as JSON files.
3. **Options** — one click enumerates conversion options: all-residential at three unit-mix
   strategies (max units / balanced / family), ground-commercial + residential uppers,
   floor-through lateral flats, and a whole-building merge. Every unit is validated against
   the NDSS ruleset (editable in Settings); each option gets a schematic SVG plan, a
   compliance report and a priced unit schedule.
4. **Appraisal** — the adopted option runs through the DCF engine: development cost build-up,
   48-month cashflow with bridge + development loan roll-up, four exit scenarios (sell at PC,
   delayed sales, refinance & rent, refinance-then-sell) and sensitivity grids. Export a
   populated copy of the Appraisal Model workbook (`.xlsx`) — the workbook's own formulas
   recalculate on open in Excel.

## Connecting Claude

Only the PDF and image floorplan reader calls Claude; DXF import, manual entry, the layout
engine, the NDSS validator and the whole DCF appraisal run entirely offline. Settings offers
two ways to connect, and shows which one a request will actually use:

- **Sign in with Claude** — opens the browser, and the token is refreshed automatically from
  then on. Nothing to copy or re-enter. The sign-in is performed by the
  [Anthropic CLI](https://platform.claude.com/docs/en/api/sdks/cli) (`ant auth login`), which
  owns the OAuth flow and stores one profile shared with every Anthropic tool on the machine,
  so the CLI has to be installed once. The app never handles the tokens itself; the SDK reads
  and refreshes that profile. Signing out is `ant auth logout`, deliberately left to the CLI
  because the profile is shared.
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

The DCF engine (`src/core/dcf.ts`) is a cell-by-cell port of `Appraisal_Model_1.xlsx`;
`tests/dcf.test.ts` asserts it reproduces the exact values Excel computed for the demo scheme
(cached workbook results). The layout engine and NDSS validator are ports of the
`floorplan-converter` agent skill (`scripts/layout.py`, `validate.py`).

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
