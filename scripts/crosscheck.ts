// Independent cross-check of the DCF engine against the Appraisal Model
// workbook's own formulas.
//
//   1. `export`  — price a test scheme with the engine, export it into the
//                  real template via the app's exporter, and write the
//                  engine's key figures to engine.json.
//   2. (shell)   — recalculate the exported workbook with LibreOffice
//                  headless (OOXMLRecalcMode=0 forces a full recalc on load).
//   3. `compare` — read the recalculated workbook and diff every key figure
//                  against the engine.
//
// Run via scripts/crosscheck.sh. This exercises the exporter (unit rows,
// inputs, dev-cost lines) and the engine simultaneously: if either wrote or
// computed a wrong number, the workbook's formulas will disagree.

import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import { exportWorkbook } from '../electron/xlsxExport';
import { runAppraisal } from '../src/core/dcf';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import type { PricingSpec, ScheduleRow } from '../src/core/types';

const SQM_TO_SQFT = 10.7639;
const OUT = process.argv[3] ?? '/tmp/crosscheck';

function row(no: number, floor: string, type: string, sqm: number, psf: number, months: number, rent: number): ScheduleRow {
  const sqft = sqm * SQM_TO_SQFT;
  return {
    no,
    name: type === 'Commercial' ? 'Commercial Unit' : `Apartment ${no}`,
    floor,
    type,
    sqm,
    sqft,
    salePsf: psf,
    unitGdv: sqft * psf,
    buildMonths: months,
    monthlyRent: rent,
    notes: '',
  };
}

// Deliberately different from both the template's demo scheme and the app
// demo: different unit count, mix, prices, programme and finance terms.
const SCHEDULE: ScheduleRow[] = [
  row(1, 'G', 'Commercial', 110, 210, 7, 1900),
  row(2, 'G', 'Studio', 39, 655, 8, 950),
  row(3, '1', '1 bed', 51, 642, 9, 1150),
  row(4, '1', '1 bed', 54, 638, 9, 1180),
  row(5, '2', '2 bed', 68, 622, 10, 1480),
  row(6, '2', '2 bed', 74, 618, 10, 1520),
  row(7, '3', '3 bed', 98, 601, 11, 1990),
];

function spec(): PricingSpec {
  const s = clonePricing(DEFAULT_PRICING);
  s.buildCostMode = 'fixed';
  s.finance.purchasePrice = 1450000;
  s.finance.purchaseDate = '2026-10';
  s.finance.giaSqft = 6200;
  s.finance.legalMonths = 3;
  s.finance.preConMonths = 4;
  s.finance.bridge = { ltv: 0.6, ratePa: 0.11, arrangementFee: 0.015, exitFee: 0.012 };
  s.finance.devLoan = { ratePa: 0.092, arrangementFee: 0.02, exitFee: 0.008, maxLtgdv: 0.7 };
  s.finance.equity = { total: 1050000, investorShare: 0.4 };
  s.finance.sales = { agentFeePct: 0.018, legalPerUnit: 900, velocityPerMonth: 1, priceAdjust: -0.02 };
  s.finance.refinance = { ltv: 0.6, ratePa: 0.061, arrangementFee: 0.012, voidPct: 0.06, mgmtPct: 0.12 };
  // Vary some dev cost lines from the template values.
  for (const l of s.devCosts) {
    if (l.code === 'D01') l.value = 1480000;
    if (l.code === 'B04') l.value = 61000;
    if (l.code === 'C01') l.value = 30000;
    if (l.code === 'D08') l.value = 0.06;
    if (l.code === 'H08') l.value = 8000;
  }
  return s;
}

async function doExport() {
  fs.mkdirSync(OUT, { recursive: true });
  const s = spec();
  const r = runAppraisal(SCHEDULE, s);
  const engine = {
    gdv: r.totals.gdv,
    unitCount: r.totals.units,
    preFinanceCosts: r.devCosts.totalPreFinance,
    bridgeInterest: r.finance.bridgeInterestTotal,
    devArrangementFee: r.finance.devArrangementFee,
    devBalanceAtPC: r.finance.devBalanceAtPC,
    peakDevLoan: r.finance.peakDevBalance,
    totalFinanceCosts: r.finance.totalFinanceCosts,
    costsAfterFinance: r.finance.totalCostsAfterFinance,
    s1NetProfit: r.scenarios.s1.netProfit,
    s2NetProfit: r.scenarios.s2.netProfit,
    s3Cashflow: r.scenarios.s3.netAnnualCashflow,
    s4NetProfit: r.scenarios.s4.netProfit,
  };
  fs.writeFileSync(path.join(OUT, 'engine.json'), JSON.stringify(engine, null, 2));
  await exportWorkbook(
    process.argv[4] ?? 'resources/appraisal_template.xlsx',
    path.join(OUT, 'export.xlsx'),
    SCHEDULE,
    {
      address: 'Cross-check scheme',
      ...s.finance,
      devCostLines: s.devCosts.map((l) => ({ code: l.code, kind: l.kind, value: l.value })),
      buildCostOverride: null,
    },
  );
  console.log('exported', path.join(OUT, 'export.xlsx'));
}

async function doCompare() {
  const engine = JSON.parse(fs.readFileSync(path.join(OUT, 'engine.json'), 'utf-8'));
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path.join(OUT, 'recalc', 'export.xlsx'));
  const val = (sheet: string, cell: string): number => {
    const c = wb.getWorksheet(sheet)!.getCell(cell);
    const v = c.value as { result?: number } | number;
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object' && typeof v.result === 'number') return v.result;
    throw new Error(`No numeric result in ${sheet}!${cell}: ${JSON.stringify(v)}`);
  };

  const excel = {
    gdv: val('1. Unit Import', 'F42'),
    unitCount: val('1. Unit Import', 'F40'),
    preFinanceCosts: val('3. Dev Costs', 'F87'),
    bridgeInterest: val('4. Cashflow', 'C33'),
    devArrangementFee: val('2. Inputs', 'E30'),
    devBalanceAtPC: val('4. Cashflow', 'C38'),
    peakDevLoan: val('4. Cashflow', 'C41'),
    totalFinanceCosts: val('4. Cashflow', 'C43'),
    costsAfterFinance: val('4. Cashflow', 'C44'),
    s1NetProfit: val('5. Scenarios', 'F9'),
    s2NetProfit: val('5. Scenarios', 'F36'),
    s3Cashflow: val('5. Scenarios', 'F50'),
    s4NetProfit: val('5. Scenarios', 'F72'),
  };

  let failed = 0;
  for (const k of Object.keys(excel) as (keyof typeof excel)[]) {
    const diff = Math.abs(excel[k] - engine[k]);
    const rel = diff / Math.max(1, Math.abs(excel[k]));
    const ok = diff < 0.01 || rel < 1e-9;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'OK  ' : 'FAIL'} ${k.padEnd(20)} excel=${excel[k].toFixed(2).padStart(14)}  engine=${engine[k]
        .toFixed(2)
        .padStart(14)}  diff=${diff.toFixed(4)}`,
    );
  }
  if (failed) {
    console.error(`\n${failed} figure(s) disagree with the workbook.`);
    process.exit(1);
  }
  console.log('\nAll figures agree with the workbook’s own formulas.');
}

const cmd = process.argv[2];
if (cmd === 'export') doExport();
else if (cmd === 'compare') doCompare();
else {
  console.error('usage: crosscheck (export|compare) [outdir] [template]');
  process.exit(1);
}
