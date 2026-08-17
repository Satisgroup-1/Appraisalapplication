// Export a conversion option into a copy of the Appraisal Model workbook.
// Mirrors the skill's write_units.py: fills '1. Unit Import' rows 7-36
// (including Sale £psf, Build months and Monthly Rent, which the app prices
// from the pricing spec) and writes the programme & finance parameters into
// '2. Inputs'. The workbook's own formulas recalculate on open in Excel.

import ExcelJS from 'exceljs';
import { computeSdlt } from '../src/core/sdlt';

interface ScheduleRowIn {
  no: number;
  name: string;
  floor: string;
  type: string;
  sqm: number;
  salePsf: number;
  buildMonths: number;
  monthlyRent: number;
  notes: string;
}

interface DevCostLineIn {
  code: string;
  kind: string;
  value: number;
}

interface InputsIn {
  address?: string;
  purchasePrice: number;
  purchaseDate: string; // yyyy-mm
  giaSqft: number;
  legalMonths: number;
  preConMonths: number;
  bridge: { ltv: number; ratePa: number; arrangementFee: number; exitFee: number };
  devLoan: { ratePa: number; arrangementFee: number; exitFee: number; maxLtgdv: number };
  equity: { total: number; investorShare: number };
  sales: { agentFeePct: number; legalPerUnit: number; velocityPerMonth: number; priceAdjust: number };
  refinance: { ltv: number; ratePa: number; arrangementFee: number; voidPct: number; mgmtPct: number };
  /** The pricing spec's dev cost lines, so edits made in-app reach the workbook. */
  devCostLines?: DevCostLineIn[];
  /** Computed build cost (room-rate mode) to write into D01/F37. */
  buildCostOverride?: number | null;
  /** Present when the caller spreads FinanceInputs: lets the export write the
   *  band-computed SDLT the engine actually used, not the dormant typed B04. */
  sdlt?: { regime?: 'nonResidential' | 'residentialCompany' | 'manual' };
  vat?: { optedToTax?: boolean; ratePct?: number };
}

const BLUE = 'FF0000FF';

// '3. Dev Costs' cell for each editable line. Fixed lines write their £
// amount into column F; percentage / per-unit lines write their *rate* into
// the column D helper cell the workbook's own formula reads (e.g. D44 for
// contingency % of build). G03/G04 stay formula-driven from '2. Inputs'.
const DEV_COST_CELLS: Record<string, { cell: string; writes: 'amount' | 'rate' }> = {
  B01: { cell: 'F11', writes: 'amount' },
  B02: { cell: 'F12', writes: 'amount' },
  B03: { cell: 'F13', writes: 'amount' },
  B04: { cell: 'F14', writes: 'amount' },
  B05: { cell: 'D15', writes: 'rate' },
  B06: { cell: 'D16', writes: 'rate' },
  B07: { cell: 'F17', writes: 'amount' },
  B08: { cell: 'F18', writes: 'amount' },
  C01: { cell: 'F22', writes: 'amount' },
  C02: { cell: 'F23', writes: 'amount' },
  C03: { cell: 'F24', writes: 'amount' },
  C04: { cell: 'F25', writes: 'amount' },
  C05: { cell: 'F26', writes: 'amount' },
  C06: { cell: 'F27', writes: 'amount' },
  C07: { cell: 'F28', writes: 'amount' },
  C08: { cell: 'F29', writes: 'amount' },
  C09: { cell: 'F30', writes: 'amount' },
  C10: { cell: 'F31', writes: 'amount' },
  C11: { cell: 'F32', writes: 'amount' },
  C12: { cell: 'F33', writes: 'amount' },
  D01: { cell: 'F37', writes: 'amount' },
  D02: { cell: 'F38', writes: 'amount' },
  D03: { cell: 'F39', writes: 'amount' },
  D04: { cell: 'F40', writes: 'amount' },
  D05: { cell: 'F41', writes: 'amount' },
  D06: { cell: 'F42', writes: 'amount' },
  D07: { cell: 'F43', writes: 'amount' },
  D08: { cell: 'D44', writes: 'rate' },
  D09: { cell: 'D45', writes: 'rate' },
  D10: { cell: 'D46', writes: 'rate' },
  D11: { cell: 'F47', writes: 'amount' },
  D12: { cell: 'F48', writes: 'amount' },
  E01: { cell: 'F52', writes: 'amount' },
  E02: { cell: 'F53', writes: 'amount' },
  E03: { cell: 'F54', writes: 'amount' },
  E04: { cell: 'F55', writes: 'amount' },
  E05: { cell: 'F56', writes: 'amount' },
  E06: { cell: 'F57', writes: 'amount' },
  F01: { cell: 'F61', writes: 'amount' },
  F02: { cell: 'F62', writes: 'amount' },
  F03: { cell: 'F63', writes: 'amount' },
  F04: { cell: 'F64', writes: 'amount' },
  G01: { cell: 'F68', writes: 'amount' },
  G02: { cell: 'F69', writes: 'amount' },
  G05: { cell: 'F72', writes: 'amount' },
  G06: { cell: 'F73', writes: 'amount' },
  H01: { cell: 'F77', writes: 'amount' },
  H02: { cell: 'F78', writes: 'amount' },
  H03: { cell: 'F79', writes: 'amount' },
  H04: { cell: 'F80', writes: 'amount' },
  H05: { cell: 'F81', writes: 'amount' },
  H06: { cell: 'F82', writes: 'amount' },
  H07: { cell: 'F83', writes: 'amount' },
  H08: { cell: 'F84', writes: 'amount' },
};

/** App model v2 results, passed from the renderer so the exported sheet shows
 *  exactly what the user saw (no recompute drift). */
export interface ModelV2In {
  assumptions: string[];
  summary: [string, string | number][];
  scenarios: [string, string | number][];
  cashflow: {
    month: number;
    costs: number;
    cumCosts: number;
    vatFlow: number;
    retentionBalance: number;
    bridgeBalance: number;
    equityCum: number;
    devDrawdown: number;
    devInterest: number;
    devBalance: number;
  }[];
}

export async function exportWorkbook(
  templatePath: string,
  outPath: string,
  schedule: ScheduleRowIn[],
  inputs: InputsIn,
  modelV2?: ModelV2In | null,
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(templatePath);

  const ui = wb.getWorksheet('1. Unit Import');
  if (!ui) throw new Error("Template is missing '1. Unit Import'.");

  // Clear input columns of rows 7..36 (leave formula cols G, I alone).
  for (let r = 7; r <= 36; r++) {
    for (const col of ['B', 'C', 'D', 'E', 'F', 'H', 'J', 'K', 'L']) {
      ui.getCell(`${col}${r}`).value = null;
    }
  }

  const rows = schedule.slice(0, 30);
  rows.forEach((u, i) => {
    const r = 7 + i;
    const set = (col: string, v: string | number) => {
      const cell = ui.getCell(`${col}${r}`);
      cell.value = v;
      cell.font = { name: 'Arial', size: 10, color: { argb: BLUE } };
    };
    set('B', u.no);
    set('C', u.name);
    set('D', u.floor);
    set('E', u.type);
    set('F', Math.round(u.sqm * 10) / 10);
    set('H', Math.round(u.salePsf));
    set('J', u.buildMonths);
    set('K', Math.round(u.monthlyRent));
    if (u.notes) set('L', u.notes);
  });

  // '2. Inputs' programme & finance parameters.
  const inp = wb.getWorksheet('2. Inputs');
  if (inp) {
    const setIn = (cell: string, v: number | Date) => {
      inp.getCell(cell).value = v;
    };
    setIn('E5', inputs.purchasePrice);
    const [y, m] = inputs.purchaseDate.split('-').map((v) => parseInt(v, 10));
    if (y && m) setIn('E6', new Date(Date.UTC(y, m - 1, 1)));
    setIn('E7', inputs.giaSqft);
    setIn('E10', inputs.legalMonths);
    setIn('E11', inputs.preConMonths);
    setIn('E17', inputs.bridge.ltv);
    setIn('E18', inputs.bridge.ratePa);
    setIn('E19', inputs.bridge.arrangementFee);
    setIn('E20', inputs.bridge.exitFee);
    setIn('E25', inputs.devLoan.ratePa);
    setIn('E26', inputs.devLoan.arrangementFee);
    setIn('E27', inputs.devLoan.exitFee);
    setIn('E28', inputs.devLoan.maxLtgdv);
    setIn('E33', inputs.equity.total);
    setIn('E34', inputs.equity.investorShare);
    setIn('E40', inputs.sales.agentFeePct);
    setIn('E41', inputs.sales.legalPerUnit);
    setIn('E42', inputs.sales.velocityPerMonth);
    setIn('E43', inputs.sales.priceAdjust);
    setIn('E46', inputs.refinance.ltv);
    setIn('E47', inputs.refinance.ratePa);
    setIn('E48', inputs.refinance.arrangementFee);
    setIn('E49', inputs.refinance.voidPct);
    setIn('E50', inputs.refinance.mgmtPct);
  }

  // Dev cost lines: write in-app values into the workbook so both stay in
  // step. Fixed lines set the F-column amount; percentage/per-unit lines set
  // the D-column rate the workbook formula reads. D01 takes the room-rate
  // build cost when one was computed.
  const dc = wb.getWorksheet('3. Dev Costs');
  if (dc && inputs.devCostLines) {
    // Under an automatic SDLT regime the typed B04 value is dormant: the
    // engine prices the line from HMRC bands (on the VAT-inclusive price when
    // opted to tax), so the export must write the same computed figure or the
    // workbook and the app disagree by exactly the drift in the typed value.
    const regime = inputs.sdlt?.regime;
    const autoSdlt =
      regime && regime !== 'manual'
        ? computeSdlt(
            inputs.purchasePrice * (inputs.vat?.optedToTax ? 1 + (inputs.vat.ratePct ?? 0.2) : 1),
            regime,
          )
        : null;
    for (const line of inputs.devCostLines) {
      const target = DEV_COST_CELLS[line.code];
      if (!target) continue;
      if (line.code === 'D01' && inputs.buildCostOverride != null) {
        dc.getCell(target.cell).value = Math.round(inputs.buildCostOverride);
      } else if (line.code === 'B04' && autoSdlt !== null && target.writes === 'amount') {
        dc.getCell(target.cell).value = autoSdlt;
      } else if (line.kind === 'fixed' && target.writes === 'amount') {
        dc.getCell(target.cell).value = line.value;
      } else if (target.writes === 'rate' && line.kind !== 'fixed') {
        dc.getCell(target.cell).value = line.value;
      }
    }
  }

  // Scheme address on the summary sheet.
  const summary = wb.getWorksheet('SUMMARY');
  if (summary && inputs.address) {
    summary.getCell('B3').value = inputs.address;
  }

  // App model v2 sheet: the template's own sheets keep the workbook's classic
  // formulas; this sheet carries the app's richer model (S-curve drawdown,
  // SDLT on completion, retention, VAT, HPI, waterfall) so the export shows
  // both. Values only — the v2 engine lives in the app, not in formulas.
  if (modelV2) {
    const old = wb.getWorksheet('7. App Model v2');
    if (old) wb.removeWorksheet(old.id);
    const ws = wb.addWorksheet('7. App Model v2');
    ws.getColumn(1).width = 46;
    ws.getColumn(2).width = 20;
    let r = 1;
    const title = (t: string) => {
      ws.getCell(r, 1).value = t;
      ws.getCell(r, 1).font = { name: 'Arial', size: 11, bold: true };
      r += 1;
    };
    const pair = (k: string, v: string | number) => {
      ws.getCell(r, 1).value = k;
      ws.getCell(r, 2).value = v;
      ws.getCell(r, 1).font = { name: 'Arial', size: 10 };
      ws.getCell(r, 2).font = { name: 'Arial', size: 10 };
      r += 1;
    };

    title('APP MODEL V2 — computed by Satis Appraisal');
    pair('Note', 'Sheets 1-6 recalculate with the workbook’s own (simplified) formulas; this sheet is the app’s model.');
    r += 1;
    title('Assumptions');
    for (const a of modelV2.assumptions) pair('·', a);
    r += 1;
    title('Summary');
    for (const [k, v] of modelV2.summary) pair(k, v);
    r += 1;
    title('Scenarios');
    for (const [k, v] of modelV2.scenarios) pair(k, v);
    r += 1;
    title('Monthly cashflow');
    const headers = ['Month', 'Costs', 'Cumulative', 'VAT flow', 'Retention held', 'Bridge bal', 'Equity', 'Dev draw', 'Dev interest', 'Dev balance'];
    headers.forEach((h, i) => {
      const c = ws.getCell(r, i + 1);
      c.value = h;
      c.font = { name: 'Arial', size: 10, bold: true };
    });
    r += 1;
    for (const m of modelV2.cashflow) {
      const vals = [m.month, m.costs, m.cumCosts, m.vatFlow, m.retentionBalance, m.bridgeBalance, m.equityCum, m.devDrawdown, m.devInterest, m.devBalance];
      vals.forEach((v, i) => {
        const c = ws.getCell(r, i + 1);
        c.value = typeof v === 'number' && i > 0 ? Math.round(v * 100) / 100 : v;
        c.font = { name: 'Arial', size: 9 };
        if (i > 0) c.numFmt = '#,##0';
      });
      r += 1;
    }
  }

  // Force Excel to recalculate every formula on open (values were computed
  // for the template's demo scheme and are now stale).
  wb.calcProperties.fullCalcOnLoad = true;

  await wb.xlsx.writeFile(outPath);
}
