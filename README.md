# Satis Appraisal

Desktop application (Windows + macOS) that imports floorplans of existing buildings, generates
the set of ways they could be converted — commercial → residential, splitting larger buildings
into flats, lateral floor-through apartments, or merging flats back into a single dwelling —
validates every layout against UK minimum-space rules, and runs a full DCF development
appraisal of each option, mirroring the Satis Appraisal Model workbook.

Built with Electron + React + TypeScript, styled to the Satis brand guidelines (Satis_Brand_V7).

## Workflow

1. **Building** — import floorplans:
   - **PDF / images** are interpreted with AI (Claude vision; add an Anthropic API key in
     Settings). Extraction assumptions and scale basis are surfaced for review — always
     confirm dimensions before generating options.
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

Monochrome palette (`#ffffff` / `#000000` / `#ced1d2`), letterspaced SATIS wordmark. Work Sans
(the brand's secondary/web face, OFL-licensed) is bundled; if you hold a Fieldwork licence,
drop the font files into `src/assets/fonts` and add `@font-face` rules — the CSS font stack
already prefers Fieldwork.

## Scope notes

Layouts are feasibility schematics, not architecture. Planning matters — permitted development
rights, Class MA, minimum natural-light tests, fire strategy, external amenity — are out of
scope and flagged as risks, never claimed compliant. Options exceeding 30 units warn that they
exceed the appraisal workbook's unit capacity.
