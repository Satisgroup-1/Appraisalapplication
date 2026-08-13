#!/usr/bin/env bash
# Cross-check the DCF engine against the Appraisal Model workbook's own
# formulas, recalculated by LibreOffice headless. See scripts/crosscheck.ts.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${1:-/tmp/crosscheck}"
mkdir -p "$OUT"

# 1. Bundle the cross-check script (engine + exporter).
npx esbuild scripts/crosscheck.ts --bundle --platform=node --format=cjs \
  --outfile="$OUT/crosscheck.cjs" --log-level=error

# 2. Export a test scheme through the app's exporter + record engine figures.
node "$OUT/crosscheck.cjs" export "$OUT"

# 3. Recalculate with LibreOffice. A dedicated profile sets
#    OOXMLRecalcMode=0 (recalculate always on load), so the saved copy
#    carries freshly computed values for every formula.
PROFILE="$OUT/loprofile"
mkdir -p "$PROFILE/user"
cat > "$PROFILE/user/registrymodifications.xcu" <<'XCU'
<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
 <item oor:path="/org.openoffice.Office.Calc/Formula/Load"><prop oor:name="OOXMLRecalcMode" oor:op="fuse"><value>0</value></prop></item>
</oor:items>
XCU
rm -rf "$OUT/recalc"
soffice -env:UserInstallation="file://$PROFILE" --headless --norestore \
  --convert-to xlsx --outdir "$OUT/recalc" "$OUT/export.xlsx" >/dev/null

# 4. Compare.
node "$OUT/crosscheck.cjs" compare "$OUT"
