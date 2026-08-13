// Export a conversion option into a copy of the Appraisal Model workbook.
// Mirrors the skill's write_units.py: fills '1. Unit Import' rows 7-36
// (including Sale £psf, Build months and Monthly Rent, which the app prices
// from the pricing spec) and writes the programme & finance parameters into
// '2. Inputs'. The workbook's own formulas recalculate on open in Excel.

import ExcelJS from 'exceljs';

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
  devCostAmounts?: { code: string; cell: string; amount: number }[];
}

const BLUE = 'FF0000FF';

export async function exportWorkbook(
  templatePath: string,
  outPath: string,
  schedule: ScheduleRowIn[],
  inputs: InputsIn,
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

  // Dev cost line amounts (fixed lines only; formula-driven lines stay).
  const dc = wb.getWorksheet('3. Dev Costs');
  if (dc && inputs.devCostAmounts) {
    for (const line of inputs.devCostAmounts) {
      dc.getCell(line.cell).value = line.amount;
    }
  }

  // Scheme address on the summary sheet.
  const summary = wb.getWorksheet('SUMMARY');
  if (summary && inputs.address) {
    summary.getCell('B3').value = inputs.address;
  }

  // Force Excel to recalculate every formula on open (values were computed
  // for the template's demo scheme and are now stale).
  wb.calcProperties.fullCalcOnLoad = true;

  await wb.xlsx.writeFile(outPath);
}
