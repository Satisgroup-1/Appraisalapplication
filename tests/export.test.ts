// Workbook export regression tests.
//
// The export path had no unit coverage before this file — only
// scripts/crosscheck.sh, which needs LibreOffice and so ran only by hand.
// Two defects survived in that blind spot (AUDIT.md §6.2, D1 and D2):
//
//  D1 — the renderer built the export payload from the RAW project spec while
//       the screen priced the SANITIZED one, so a repair reported in the audit
//       strip was contradicted by the exported '2. Inputs'.
//  D2 — a schedule longer than '1. Unit Import' (rows 7-36) was silently
//       truncated, dropping units and their GDV with nothing said.
//
// Both are pinned end to end here: payload construction, and the bytes that
// actually land in the workbook.

import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { exportWorkbook } from '../electron/xlsxExport';
import { sanitizeSpec } from '../src/core/audit';
import { buildExportInputs, buildModelV2 } from '../src/core/exportPayload';
import { runAppraisal } from '../src/core/dcf';
import { DEMO_SCHEDULE } from '../src/core/demo';
import { clonePricing, DEFAULT_PRICING } from '../src/core/pricing';
import { MAX_UNITS, SQM_TO_SQFT } from '../src/core/rules';
import type { ScheduleRow } from '../src/core/types';

const TEMPLATE = path.join(__dirname, '..', 'resources', 'appraisal_template.xlsx');

function tmpOut(name: string): string {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'satis-export-')), name);
}

/** n units cloned off the demo's first flat, renumbered. */
function scheduleOf(n: number): ScheduleRow[] {
  const base = DEMO_SCHEDULE[1];
  return Array.from({ length: n }, (_, i) => ({ ...base, no: i + 1, name: `Apartment ${i + 1}` }));
}

async function readBack(file: string) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb;
}

// ---------------------------------------------------------------------------
// D1 — the export must carry the same inputs the screen priced
// ---------------------------------------------------------------------------

describe('export payload uses the sanitized spec (D1)', () => {
  // A spec with three fat-finger typos, each of which sanitizeSpec repairs and
  // reports. Before the fix these reached the workbook unrepaired.
  function typoSpec() {
    const s = clonePricing(DEFAULT_PRICING);
    s.finance.bridge.ratePa = 4.5; // 450% pa — meant 4.5%
    s.finance.sales.agentFeePct = 0.9; // 90% — meant 0.9%
    s.finance.hpi = { enabled: true, annualPct: [0.03, 0.9, 0.03, 0.03, 0.03] }; // 90% in year 2
    return s;
  }

  it('sanitizeSpec repairs the typos and reports every one', () => {
    const { spec, repairs } = sanitizeSpec(typoSpec());
    expect(spec.finance.bridge.ratePa).toBe(0.5); // clamped to the 50% pa ceiling
    expect(spec.finance.sales.agentFeePct).toBe(0.2); // clamped to the 20% ceiling
    expect(spec.finance.hpi.annualPct[1]).toBe(0.2); // clamped to +20% pa
    expect(repairs.map((r) => r.field)).toEqual(
      expect.arrayContaining(['bridge rate', 'sales agent fee', 'HPI year 2']),
    );
  });

  it('buildExportInputs carries the repaired finance figures, not the typed ones', () => {
    const { spec } = sanitizeSpec(typoSpec());
    const inputs = buildExportInputs({ address: 'Test', spec, result: null });
    expect((inputs.bridge as { ratePa: number }).ratePa).toBe(0.5);
    expect((inputs.sales as { agentFeePct: number }).agentFeePct).toBe(0.2);
  });

  it('buildModelV2 describes the repaired assumptions, not the typed ones', () => {
    const raw = typoSpec();
    const { spec } = sanitizeSpec(raw);
    const result = runAppraisal(DEMO_SCHEDULE, spec);
    const hpiLine = buildModelV2(spec, result).assumptions.find((a) => a.startsWith('HPI applied'));
    expect(hpiLine).toContain('20.0%'); // the clamped year-2 rate
    expect(hpiLine).not.toContain('90.0%'); // never the typed one
  });

  it("the repaired rates are what land in the workbook's '2. Inputs'", async () => {
    const { spec } = sanitizeSpec(typoSpec());
    const result = runAppraisal(DEMO_SCHEDULE, spec);
    const out = tmpOut('d1.xlsx');
    await exportWorkbook(
      TEMPLATE,
      out,
      DEMO_SCHEDULE,
      buildExportInputs({ address: 'Test', spec, result }),
      buildModelV2(spec, result),
    );
    const inp = (await readBack(out)).getWorksheet('2. Inputs')!;
    expect(inp.getCell('E18').value).toBe(0.5); // bridge rate, repaired
    expect(inp.getCell('E40').value).toBe(0.2); // agent fee, repaired
  });

  it('the pre-fix path — raw spec in — would have corrupted those same cells', async () => {
    // This is the defect itself, pinned so the sanitize step cannot be dropped
    // again: feeding buildExportInputs the RAW spec writes the typed 450% and
    // 90% into the workbook while the audit strip reports them as repaired.
    const raw = typoSpec();
    const out = tmpOut('d1-regression.xlsx');
    await exportWorkbook(TEMPLATE, out, DEMO_SCHEDULE, buildExportInputs({ address: 'Test', spec: raw, result: null }), null);
    const inp = (await readBack(out)).getWorksheet('2. Inputs')!;
    expect(inp.getCell('E18').value).toBe(4.5);
    expect(inp.getCell('E40').value).toBe(0.9);
    // ...whereas the spec the screen actually prices carries the repaired ones.
    expect(sanitizeSpec(raw).spec.finance.bridge.ratePa).toBe(0.5);
  });

  it('the workbook carries the contract sum the engine used, in every build mode', async () => {
    // Gating the D01 override on room-rate mode left `fixed` mode with
    // tender-price inflation on writing the typed figure while the model used
    // the indexed one — the same divergence as this section's main defect.
    for (const mode of ['fixed', 'roomRates'] as const) {
      for (const inflation of [false, true]) {
        const raw = clonePricing(DEFAULT_PRICING);
        raw.buildCostMode = mode;
        raw.finance.buildInflation = { enabled: inflation, annualPct: 0.04 };
        const { spec } = sanitizeSpec(raw);
        const result = runAppraisal(DEMO_SCHEDULE, spec);
        const inputs = buildExportInputs({ address: 'Test', spec, result });
        expect(inputs.buildCostOverride, `${mode}/${inflation}`).toBeCloseTo(result.devCosts.buildCost, 6);

        const out = tmpOut(`d01-${mode}-${inflation}.xlsx`);
        await exportWorkbook(TEMPLATE, out, DEMO_SCHEDULE, inputs, null);
        const dc = (await readBack(out)).getWorksheet('3. Dev Costs')!;
        // '3. Dev Costs'!F37 is D01. Rounded on write, so compare to the pound.
        expect(Number(dc.getCell('F37').value), `${mode}/${inflation}`).toBe(Math.round(result.devCosts.buildCost));
        if (inflation) expect(Number(dc.getCell('F37').value)).toBeGreaterThan(result.devCosts.buildCostToday);
      }
    }
  });

  it('states the tenure and the pre-tax basis, so neither reads as forgotten', async () => {
    // Disclosure, not arithmetic: a workbook reader must be able to see that
    // the retained freehold contributes nothing to GDV by decision (999-year
    // leases, peppercorn ground rent by statute, freehold never sold on) and
    // that every figure is pre-tax. Pinned because a dropped assumption line
    // is invisible — nothing else in the suite would notice.
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const result = runAppraisal(DEMO_SCHEDULE, spec);
    const assumptions = buildModelV2(spec, result).assumptions;

    const tenure = assumptions.find((a) => /999-year leases/.test(a));
    expect(tenure).toBeDefined();
    expect(tenure).toMatch(/freehold retained/i);
    expect(tenure).toMatch(/no ground rent/i);
    expect(tenure).toMatch(/adds nothing to GDV/i);

    expect(assumptions.some((a) => /PRE-TAX/.test(a) && /no corporation tax/i.test(a))).toBe(true);

    // And the assumptions reach the workbook, not just the payload.
    const out = tmpOut('assumptions.xlsx');
    await exportWorkbook(
      TEMPLATE,
      out,
      DEMO_SCHEDULE,
      buildExportInputs({ address: 'Test', spec, result }),
      buildModelV2(spec, result),
    );
    const ws = (await readBack(out)).getWorksheet('7. App Model v2')!;
    let sawTenure = false;
    let sawPreTax = false;
    ws.eachRow((row) => {
      const v = String(row.getCell(2).value ?? '');
      if (/999-year leases/.test(v)) sawTenure = true;
      if (/PRE-TAX/.test(v)) sawPreTax = true;
    });
    expect(sawTenure).toBe(true);
    expect(sawPreTax).toBe(true);
  });

  it('a clean spec is written through unchanged', async () => {
    const { spec, repairs } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    expect(repairs).toEqual([]);
    const result = runAppraisal(DEMO_SCHEDULE, spec);
    const out = tmpOut('clean.xlsx');
    await exportWorkbook(TEMPLATE, out, DEMO_SCHEDULE, buildExportInputs({ address: 'Test', spec, result }), null);
    const inp = (await readBack(out)).getWorksheet('2. Inputs')!;
    expect(inp.getCell('E18').value).toBeCloseTo(DEFAULT_PRICING.finance.bridge.ratePa, 12);
    expect(inp.getCell('E5').value).toBe(DEFAULT_PRICING.finance.purchasePrice);
  });
});

// ---------------------------------------------------------------------------
// D2 — a schedule that cannot fit sheets 1-6 must say so
// ---------------------------------------------------------------------------

describe('over-capacity schedules are reported, not silently truncated (D2)', () => {
  it('runAppraisal warns above MAX_UNITS, naming the GDV sheets 1-6 would omit', () => {
    const schedule = scheduleOf(MAX_UNITS + 12);
    const r = runAppraisal(schedule, clonePricing(DEFAULT_PRICING));
    const warning = r.warnings.find((w) => w.includes(`${MAX_UNITS}-unit capacity`));
    expect(warning).toBeDefined();
    const dropped = schedule.slice(MAX_UNITS).reduce((s, x) => s + x.unitGdv, 0);
    expect(warning).toContain(`£${Math.round(dropped).toLocaleString('en-GB')}`);
    // The appraisal itself still prices every unit.
    expect(r.totals.units).toBe(MAX_UNITS + 12);
  });

  it('runAppraisal stays quiet at exactly MAX_UNITS', () => {
    const r = runAppraisal(scheduleOf(MAX_UNITS), clonePricing(DEFAULT_PRICING));
    expect(r.warnings.some((w) => w.includes('capacity'))).toBe(false);
  });

  it('exportWorkbook reports the units and GDV it could not carry', async () => {
    const schedule = scheduleOf(42);
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const result = runAppraisal(schedule, spec);
    const out = tmpOut('over.xlsx');
    const outcome = await exportWorkbook(
      TEMPLATE,
      out,
      schedule,
      buildExportInputs({ address: 'Test', spec, result }),
      buildModelV2(spec, result),
    );
    expect(outcome.unitsTotal).toBe(42);
    expect(outcome.unitsWritten).toBe(MAX_UNITS);
    expect(outcome.unitsDropped).toBe(42 - MAX_UNITS);
    const expectDropped = schedule.slice(MAX_UNITS).reduce((s, x) => s + x.unitGdv, 0);
    expect(outcome.gdvDropped).toBeCloseTo(expectDropped, 6);
    expect(outcome.gdvDropped).toBeGreaterThan(0);
  });

  it('the truncation is exactly rows 7..36, with nothing written past the block', async () => {
    const schedule = scheduleOf(42);
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const out = tmpOut('rows.xlsx');
    await exportWorkbook(
      TEMPLATE,
      out,
      schedule,
      buildExportInputs({ address: 'Test', spec, result: null }),
      null,
    );
    const ui = (await readBack(out)).getWorksheet('1. Unit Import')!;
    expect(ui.getCell('C7').value).toBe('Apartment 1');
    expect(ui.getCell('C36').value).toBe(`Apartment ${MAX_UNITS}`); // last row of the block
    expect(ui.getCell('C37').value).toBeFalsy(); // unit 31 is NOT smuggled in below
  });

  it('a full-capacity schedule reports nothing dropped', async () => {
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const out = tmpOut('exact.xlsx');
    const outcome = await exportWorkbook(
      TEMPLATE,
      out,
      scheduleOf(MAX_UNITS),
      buildExportInputs({ address: 'Test', spec, result: null }),
      null,
    );
    expect(outcome).toMatchObject({ unitsTotal: MAX_UNITS, unitsWritten: MAX_UNITS, unitsDropped: 0, gdvDropped: 0 });
  });

  it('gdvDropped falls back to sqm x psf when the payload carries no unitGdv', async () => {
    // scripts/crosscheck.ts and any older caller send trimmed rows.
    const trimmed = scheduleOf(32).map(({ unitGdv, sqft, ...rest }) => rest) as unknown as ScheduleRow[];
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const out = tmpOut('nogdv.xlsx');
    const outcome = await exportWorkbook(
      TEMPLATE,
      out,
      trimmed,
      buildExportInputs({ address: 'Test', spec, result: null }),
      null,
    );
    const base = DEMO_SCHEDULE[1];
    expect(outcome.unitsDropped).toBe(2);
    expect(outcome.gdvDropped).toBeCloseTo(2 * base.sqm * SQM_TO_SQFT * base.salePsf, 6);
  });

  it("the '7. App Model v2' sheet carries a capacity warning only when truncated", async () => {
    const { spec } = sanitizeSpec(clonePricing(DEFAULT_PRICING));
    const capacityRow = async (n: number) => {
      const schedule = scheduleOf(n);
      const result = runAppraisal(schedule, spec);
      const out = tmpOut(`v2-${n}.xlsx`);
      await exportWorkbook(
        TEMPLATE,
        out,
        schedule,
        buildExportInputs({ address: 'Test', spec, result }),
        buildModelV2(spec, result),
      );
      const ws = (await readBack(out)).getWorksheet('7. App Model v2')!;
      let found: string | null = null;
      ws.eachRow((row) => {
        if (String(row.getCell(1).value ?? '') === 'CAPACITY WARNING') found = String(row.getCell(2).value ?? '');
      });
      return found;
    };
    expect(await capacityRow(MAX_UNITS)).toBeNull();
    const warn = await capacityRow(42);
    expect(warn).toContain('42 units');
    expect(warn).toContain(`omit ${42 - MAX_UNITS} unit`);
  });
});
