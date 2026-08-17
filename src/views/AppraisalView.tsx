// Step 4 — Appraisal: the full DCF for the selected option. Mirrors the
// Appraisal Model workbook: summary, dev costs, monthly cashflow, four exit
// scenarios and sensitivity grids, plus export to the Excel template.

import { useMemo, useState } from 'react';
import { runAppraisal } from '../core/dcf';
import { auditAppraisal, repairSchedule, sanitizeSpec } from '../core/audit';
import type { AuditReport, AuditRepair } from '../core/audit';
import { DEMO_SCHEDULE } from '../core/demo';
import type { AppraisalResult, ScheduleRow } from '../core/types';
import { fmtGBP, fmtNum, fmtPct, useStore } from '../state/store';

type Tab = 'summary' | 'costs' | 'cashflow' | 'scenarios' | 'sensitivity';

export default function AppraisalView() {
  const project = useStore((s) => s.project);
  const options = useStore((s) => s.options);
  const selectedOptionId = useStore((s) => s.selectedOptionId);
  const selectOption = useStore((s) => s.selectOption);
  const [tab, setTab] = useState<Tab>('summary');
  const [useDemo, setUseDemo] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const option = options.find((o) => o.id === selectedOptionId) ?? null;
  const rawSchedule: ScheduleRow[] | null = useDemo ? DEMO_SCHEDULE : option?.schedule ?? null;
  const roomAreas = useDemo ? undefined : option?.roomAreas;
  const pricing = project?.pricing ?? null;

  // Every appraisal runs through the automatic financial audit: inputs are
  // repaired where recoverable (and every repair reported), then the computed
  // result is re-derived check by check.
  const { result, schedule, audit, repairs } = useMemo((): {
    result: AppraisalResult | null;
    schedule: ScheduleRow[] | null;
    audit: AuditReport | null;
    repairs: AuditRepair[];
  } => {
    if (!rawSchedule || !rawSchedule.length || !pricing) return { result: null, schedule: null, audit: null, repairs: [] };
    try {
      const spec = sanitizeSpec(pricing);
      const sched = repairSchedule(rawSchedule);
      const res = runAppraisal(sched.schedule, spec.spec, roomAreas);
      const auditReport = auditAppraisal(res, spec.spec, sched.schedule);
      return { result: res, schedule: sched.schedule, audit: auditReport, repairs: [...spec.repairs, ...sched.repairs] };
    } catch {
      return { result: null, schedule: null, audit: null, repairs: [] };
    }
  }, [rawSchedule, pricing, roomAreas]);

  if (!project) return null;

  async function exportXlsx() {
    if (!schedule || !project) return;
    setExportMsg(null);
    const fin = project.pricing.finance;
    const inputs = {
      address: project.address || project.name,
      ...fin,
      devCostLines: project.pricing.devCosts.map((l) => ({ code: l.code, kind: l.kind, value: l.value, label: l.label })),
      buildCostOverride: result?.devCosts.buildCostSource === 'roomRates' ? result.devCosts.buildCost : null,
    };
    // The '7. App Model v2' sheet mirrors exactly what this screen shows.
    const modelV2 = result
      ? {
          assumptions: [
            'Bridge advances against the purchase price only; SDLT, legals, valuation and design fees paid from equity',
            'SDLT paid on completion (month 1)',
            'Main contract drawn on a standard S-curve; architect & QS fees straight-lined to PC',
            `Retention: ${(fin.retention.pctDuringWorks * 100).toFixed(1)}% withheld, ${(fin.retention.pctAfterPc * 100).toFixed(1)}% held ${fin.retention.releaseMonthsAfterPc} months after PC`,
            'Post-construction holding costs straight-lined over the sell period',
            fin.vat.optedToTax
              ? `VAT on purchase at ${(fin.vat.ratePct * 100).toFixed(0)}%, reclaimed after ${fin.vat.reclaimLagMonths} months, funded by ${fin.vat.fundedBy === 'vatLoan' ? 'VAT loan' : 'equity'}`
              : 'No VAT on purchase (seller not opted to tax)',
            `Deposit interest at ${(fin.depositRatePa * 100).toFixed(2)}% pa on cash held`,
            fin.hpi.enabled
              ? `HPI applied: years 1-5 at ${fin.hpi.annualPct.map((r) => (r * 100).toFixed(1) + '%').join(', ')}${fin.hpi.region ? ` (${fin.hpi.region})` : ''}`
              : 'HPI off: sale prices as entered',
            fin.waterfall.mode === 'waterfall'
              ? `Waterfall: ${(fin.waterfall.prefRatePa * 100).toFixed(1)}% pref (monthly compounding), then ${(fin.waterfall.residualInvestorPct * 100).toFixed(0)}% investor`
              : `Simple profit split: ${(fin.equity.investorShare * 100).toFixed(0)}% investor`,
            'Sales pacing uniform across units',
          ],
          summary: [
            ['GDV (today)', Math.round(result.totals.gdv)],
            ['GDV indexed to PC', Math.round(result.scenarios.s1.gdvAdjusted)],
            ['Total costs pre-finance', Math.round(result.devCosts.totalPreFinance)],
            ['Total finance costs', Math.round(result.finance.totalFinanceCosts)],
            ['Deposit interest on retention pot', Math.round(result.finance.depositInterestRetention)],
            ['Total costs after finance', Math.round(result.finance.totalCostsAfterFinance)],
            ['Peak dev loan', Math.round(result.finance.peakDevBalance)],
            ['Peak equity deployed', Math.round(result.finance.equityUsed)],
            ['Months to PC', result.programme.pcMonth],
          ] as [string, number][],
          scenarios: [
            ['S1 net profit (sell at PC)', Math.round(result.scenarios.s1.netProfit)],
            ['S1 investor / developer', `${Math.round(result.scenarios.s1.waterfall.investorProfit)} / ${Math.round(result.scenarios.s1.waterfall.developerProfit)}`],
            ['S2 net profit (delayed sales)', Math.round(result.scenarios.s2.netProfit)],
            ['S2 HPI uplift on later sales', Math.round(result.scenarios.s2.hpiUplift)],
            ['S3 net annual cashflow (refi & rent)', Math.round(result.scenarios.s3.netAnnualCashflow)],
            ['S4 net profit (refi then sell)', Math.round(result.scenarios.s4.netProfit)],
          ] as [string, string | number][],
          cashflow: result.cashflow
            .filter((r) => Math.abs(r.costs) > 0.005 || r.devBalance > 0 || r.retentionBalance > 0 || r.vatPaid > 0 || r.vatReclaimed > 0)
            .map((r) => ({
              month: r.month,
              costs: r.costs,
              cumCosts: r.cumCosts,
              vatFlow: r.vatReclaimed - r.vatPaid,
              retentionBalance: r.retentionBalance,
              bridgeBalance: r.bridgeBalance,
              equityCum: r.equityCum,
              devDrawdown: r.devDrawdown,
              devInterest: r.devInterest,
              devBalance: r.devBalance,
            })),
        }
      : null;
    const path = await window.satis.exportXlsx(
      JSON.stringify(schedule),
      JSON.stringify(inputs),
      `${project.name.replace(/\s+/g, '_')}_${useDemo ? 'demo' : option?.id ?? 'appraisal'}`,
      modelV2 ? JSON.stringify(modelV2) : undefined,
    );
    if (path) {
      setExportMsg(`Workbook exported to ${path}. Sheets 1-6 recalculate in Excel; '7. App Model v2' carries this screen's model.`);
      window.satis.showItemInFolder(path);
    }
  }

  return (
    <div>
      <div className="page-title">
        DCF appraisal
        <span className="hint">Programme, finance and exits recomputed live from the adopted option</span>
      </div>

      <div className="pill-row">
        {options.map((o) => (
          <button
            key={o.id}
            className={`pill ${!useDemo && o.id === selectedOptionId ? 'on' : ''}`}
            onClick={() => {
              setUseDemo(false);
              selectOption(o.id);
            }}
          >
            {o.title}
          </button>
        ))}
        <button className={`pill ${useDemo ? 'on' : ''}`} onClick={() => setUseDemo(true)}>
          Demo: Appraisal Model 1 scheme
        </button>
      </div>

      {!result ? (
        <div className="empty-state">
          No option selected yet.
          <br />
          Generate options on the Options page and pick one, or load the bundled demo scheme above.
        </div>
      ) : (
        <>
          {result.warnings.length > 0 && (
            <div className="warn-box">
              {result.warnings.map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
          )}
          {audit && <AuditStrip audit={audit} repairs={repairs} />}
          <KpiRow result={result} />
          <div style={{ margin: '4px 0 18px' }}>
            <button className="btn" onClick={exportXlsx}>
              Export Excel workbook
            </button>
            {exportMsg && <div className="ok-box">{exportMsg}</div>}
          </div>

          <div className="tabs">
            {(['summary', 'costs', 'cashflow', 'scenarios', 'sensitivity'] as Tab[]).map((t) => (
              <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'summary' && <SummaryTab result={result} />}
          {tab === 'costs' && <CostsTab result={result} />}
          {tab === 'cashflow' && <CashflowTab result={result} />}
          {tab === 'scenarios' && <ScenariosTab result={result} />}
          {tab === 'sensitivity' && <SensitivityTab result={result} />}
        </>
      )}
    </div>
  );
}

/** Result of the automatic audit that runs on every appraisal. */
function AuditStrip({ audit, repairs }: { audit: AuditReport; repairs: AuditRepair[] }) {
  const failed = audit.checks.filter((c) => !c.pass);
  return (
    <div className={failed.length ? 'warn-box' : 'ok-box'} style={{ marginBottom: 14 }}>
      <div>
        <span className={`badge ${failed.length ? 'fail' : 'pass'}`} style={{ marginRight: 8 }}>
          {failed.length ? `${failed.length} check${failed.length === 1 ? '' : 's'} failed` : 'Audit passed'}
        </span>
        Automatic financial audit: {audit.passCount} of {audit.checks.length} checks passed
        {repairs.length > 0 && ` · ${repairs.length} input repair${repairs.length === 1 ? '' : 's'} applied`}
      </div>
      {failed.map((c) => (
        <div key={c.id} className="compliance-issue">
          · {c.label}
          {c.detail ? ` (${c.detail})` : ''}
        </div>
      ))}
      {repairs.length > 0 && (
        <details style={{ marginTop: 6 }}>
          <summary style={{ fontSize: 11, cursor: 'pointer' }}>What was repaired</summary>
          {repairs.map((rep, i) => (
            <div key={i} className="assumption">
              · {rep.field}: {rep.from} → {rep.to} ({rep.reason})
            </div>
          ))}
        </details>
      )}
      {!failed.length && (
        <details style={{ marginTop: 6 }}>
          <summary style={{ fontSize: 11, cursor: 'pointer' }}>What was checked</summary>
          {audit.checks.map((c) => (
            <div key={c.id} className="assumption">
              ✓ {c.label}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

function KpiRow({ result }: { result: AppraisalResult }) {
  const { scenarios: sc, totals, finance } = result;
  const kpis = [
    { k: 'GDV', v: fmtGBP(totals.gdv) },
    { k: 'Total costs inc. finance', v: fmtGBP(finance.totalCostsAfterFinance) },
    { k: 'S1 net profit', v: fmtGBP(sc.s1.netProfit), neg: sc.s1.netProfit < 0 },
    { k: 'Profit on GDV', v: fmtPct(sc.s1.profitOnGdv), neg: sc.s1.profitOnGdv < 0 },
    { k: 'Profit on cost', v: fmtPct(sc.s1.profitOnCost), neg: sc.s1.profitOnCost < 0 },
    { k: 'Months to PC', v: String(result.programme.pcMonth) },
    { k: 'Peak dev loan', v: fmtGBP(finance.peakDevBalance) },
    { k: 'LTGDV at peak', v: fmtPct(finance.ltgdvAtPeak), neg: !finance.ltgdvOk },
  ];
  return (
    <div className="kpi-row">
      {kpis.map((x) => (
        <div className="kpi" key={x.k}>
          <div className="k">{x.k}</div>
          <div className={`v ${x.neg ? 'negative' : ''}`}>{x.v}</div>
        </div>
      ))}
    </div>
  );
}

function SummaryTab({ result }: { result: AppraisalResult }) {
  const { totals, programme, finance, scenarios } = result;
  return (
    <div className="grid c2" style={{ alignItems: 'start' }}>
      <div>
        <h3 className="section">Scheme</h3>
        <table className="data">
          <tbody>
            <Row k="Total units" v={String(totals.units)} />
            <Row k="Total NIA (sqft)" v={fmtNum(totals.niaSqft)} />
            <Row k="GDV" v={fmtGBP(totals.gdv)} />
            <Row k="Average £psf" v={fmtNum(totals.avgPsf)} />
            <Row k="Gross annual rent" v={fmtGBP(totals.grossAnnualRent)} />
            <Row k="Programme to PC (months)" v={String(programme.pcMonth)} />
          </tbody>
        </table>

        <h3 className="section">Scenario comparison</h3>
        <table className="data">
          <thead>
            <tr>
              <th>Scenario</th>
              <th className="num">Net profit</th>
              <th className="num">Profit on GDV</th>
              <th className="num">Investor ROI</th>
              <th className="num">Months</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S1: Immediate sale at PC</td>
              <td className="num">{fmtGBP(scenarios.s1.netProfit)}</td>
              <td className="num">{fmtPct(scenarios.s1.profitOnGdv)}</td>
              <td className="num">{fmtPct(scenarios.s1.investorRoi)}</td>
              <td className="num">{scenarios.s1.durationMonths}</td>
            </tr>
            <tr>
              <td>S2: Delayed sales (dev loan)</td>
              <td className="num">{fmtGBP(scenarios.s2.netProfit)}</td>
              <td className="num">{fmtPct(scenarios.s1.gdvAdjusted === 0 ? 0 : scenarios.s2.netProfit / scenarios.s1.gdvAdjusted)}</td>
              <td className="num">{fmtPct(scenarios.s2.investorRoi)}</td>
              <td className="num">{scenarios.s2.totalDurationMonths}</td>
            </tr>
            <tr>
              <td>S3: Refinance &amp; rent (pa cashflow)</td>
              <td className="num">{fmtGBP(scenarios.s3.netAnnualCashflow)}</td>
              <td className="num">-</td>
              <td className="num">{fmtPct(scenarios.s3.cashOnCash)}</td>
              <td className="num">hold</td>
            </tr>
            <tr>
              <td>S4: Refinance then delayed sales</td>
              <td className="num">{fmtGBP(scenarios.s4.netProfit)}</td>
              <td className="num">{fmtPct(scenarios.s1.gdvAdjusted === 0 ? 0 : scenarios.s4.netProfit / scenarios.s1.gdvAdjusted)}</td>
              <td className="num">{fmtPct(scenarios.s4.investorRoi)}</td>
              <td className="num">{scenarios.s2.totalDurationMonths}</td>
            </tr>
          </tbody>
        </table>
        <p className="note">
          S3 shows annual rental cashflow (not a one-off profit); unrealised development profit stays in the asset.
        </p>
      </div>
      <div>
        <h3 className="section">Funding</h3>
        <table className="data">
          <tbody>
            <Row k="Bridge advance (day 1)" v={fmtGBP(finance.bridgeAdvance)} />
            <Row k="Bridge redemption" v={fmtGBP(finance.bridgeRedemptionTotal)} />
            <Row k="Equity used" v={fmtGBP(finance.equityUsed)} />
            <Row k="Peak development loan" v={fmtGBP(finance.peakDevBalance)} />
            <Row k="Dev loan payoff at PC" v={fmtGBP(finance.devPayoffAtPC)} />
            <Row
              k="LTGDV at peak"
              v={`${fmtPct(finance.ltgdvAtPeak)} ${finance.ltgdvOk ? '(ok)' : '(OVER COVENANT)'}`}
            />
          </tbody>
        </table>

        <h3 className="section">Finance costs</h3>
        <table className="data">
          <tbody>
            <Row k="Bridge arrangement fee" v={fmtGBP(finance.bridgeArrangementFee)} />
            <Row k="Bridge interest" v={fmtGBP(finance.bridgeInterestTotal)} />
            <Row k="Bridge exit fee" v={fmtGBP(finance.bridgeExitFee)} />
            <Row k="Dev loan arrangement fee" v={fmtGBP(finance.devArrangementFee)} />
            <Row k="Dev loan interest to PC" v={fmtGBP(finance.devInterestTotal)} />
            <Row k="Dev loan exit fee" v={fmtGBP(finance.devExitFee)} />
            {finance.vatLoanFee > 0 && <Row k="VAT loan arrangement fee" v={fmtGBP(finance.vatLoanFee)} />}
            {finance.vatLoanInterest > 0 && <Row k="VAT loan interest" v={fmtGBP(finance.vatLoanInterest)} />}
            <Row k="TOTAL FINANCE COSTS" v={fmtGBP(finance.totalFinanceCosts)} total />
            {finance.depositInterestRetention > 0 && (
              <Row k="Less: deposit interest on retention pot" v={`(${fmtGBP(finance.depositInterestRetention)})`} />
            )}
          </tbody>
        </table>

        {(finance.vatOnPurchase > 0 || finance.retentionHeldPeak > 0) && (
          <>
            <h3 className="section">Working capital</h3>
            <table className="data">
              <tbody>
                {finance.vatOnPurchase > 0 && (
                  <Row k="VAT paid on purchase (reclaimed later)" v={fmtGBP(finance.vatOnPurchase)} />
                )}
                <Row k="Peak retention pot held" v={fmtGBP(finance.retentionHeldPeak)} />
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

/** Distribution table for one scenario when the waterfall is on. */
function WaterfallTable({ w }: { w: import('../core/types').WaterfallResult }) {
  if (w.mode !== 'waterfall') return null;
  return (
    <table className="data">
      <thead>
        <tr>
          <th colSpan={2}>Distribution waterfall (exit month {w.exitMonth})</th>
        </tr>
      </thead>
      <tbody>
        <Row k="Investor capital drawn (peak)" v={fmtGBP(w.investorCapital)} />
        <Row k="Preferred return accrued" v={fmtGBP(w.prefAccrued)} />
        <Row k="Pref paid from profit" v={fmtGBP(w.prefPaid)} />
        {w.prefShortfall > 0 && <Row k="Pref shortfall (profit below hurdle)" v={fmtGBP(w.prefShortfall)} />}
        <Row k="Residual profit split" v={fmtGBP(w.residualProfit)} />
        <Row k="INVESTOR PROFIT" v={fmtGBP(w.investorProfit)} total />
        <Row k="DEVELOPER PROFIT" v={fmtGBP(w.developerProfit)} total />
      </tbody>
    </table>
  );
}

function Row({ k, v, total }: { k: string; v: string; total?: boolean }) {
  return (
    <tr className={total ? 'total' : ''}>
      <td>{k}</td>
      <td className="num">{v}</td>
    </tr>
  );
}

function CostsTab({ result }: { result: AppraisalResult }) {
  const d = result.devCosts;
  const bb = d.buildBreakdown;
  const groups: { key: keyof typeof d.groups; title: string }[] = [
    { key: 'legals', title: '(B) Legals & acquisition' },
    { key: 'professional', title: '(C) Professional fees' },
    { key: 'construction', title: '(D) Development / construction' },
    { key: 'duringConstruction', title: '(E) During construction' },
    { key: 'postConstruction', title: '(F) Post construction' },
    { key: 'salesMarketing', title: '(G) Sales & marketing' },
    { key: 'other', title: '(H) Other / SPV running' },
  ];
  return (
    <div>
      <table className="data" style={{ maxWidth: 700 }}>
        <tbody>
          <Row k="(A) Purchase price" v={fmtGBP(d.purchase)} />
        </tbody>
      </table>

      {bb && (
        <>
          <h3 className="section">Build cost (D01) from room-type £/sqft rates</h3>
          <table className="data" style={{ maxWidth: 700 }}>
            <thead>
              <tr>
                <th>Room type</th>
                <th className="num">Sqm</th>
                <th className="num">Sqft</th>
                <th className="num">£/sqft</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bb.map((b) => (
                <tr key={b.label}>
                  <td>{b.label}</td>
                  <td className="num">{fmtNum(b.sqm, 1)}</td>
                  <td className="num">{fmtNum(b.sqft)}</td>
                  <td className="num">{fmtNum(b.ratePsf)}</td>
                  <td className="num">{fmtGBP(b.amount)}</td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={4}>BUILD COST (main contract)</td>
                <td className="num">{fmtGBP(d.buildCost)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div className="grid c2" style={{ alignItems: 'start' }}>
        {groups.map((g) => (
          <table className="data" key={g.key}>
            <thead>
              <tr>
                <th colSpan={2}>{g.title}</th>
              </tr>
            </thead>
            <tbody>
              {d.groups[g.key].lines.map((l) => (
                <tr key={l.code}>
                  <td>
                    <span style={{ color: 'var(--grey-mid)', marginRight: 8 }}>{l.code}</span>
                    {l.label}
                  </td>
                  <td className="num">{fmtGBP(l.amount)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>TOTAL</td>
                <td className="num">{fmtGBP(d.groups[g.key].total)}</td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
      <table className="data" style={{ maxWidth: 700 }}>
        <tbody>
          <Row k="TOTAL PROJECT COSTS (pre-finance)" v={fmtGBP(d.totalPreFinance)} total />
        </tbody>
      </table>
    </div>
  );
}

function CashflowTab({ result }: { result: AppraisalResult }) {
  const pc = result.programme.pcMonth;
  const hasVat = result.finance.vatOnPurchase > 0;
  // Show the funding window, plus any later month with retention or VAT
  // activity (the final retention release lands after the defects period).
  const rows = result.cashflow.filter(
    (r) =>
      r.month <= Math.max(pc + 2, 14) ||
      r.retentionReleased > 0 ||
      r.vatReclaimed > 0 ||
      Math.abs(r.costs) > 0.005,
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <p className="note">
        The main contract draws on an S-curve; architect and QS fees run to PC; SDLT is paid on completion; retention
        is withheld from certificates and released at PC and after the defects period; post-construction holding costs
        straight-line over the sell period. Bridge rolls up from purchase and is redeemed by the development loan at
        construction start (month {result.programme.conStartMonth}); the development loan rolls up to PC (month {pc}).
      </p>
      <table className="data">
        <thead>
          <tr>
            <th>Month</th>
            <th className="num">Costs</th>
            <th className="num">Cumulative</th>
            {hasVat && <th className="num">VAT flow</th>}
            <th className="num">Retention held</th>
            <th className="num">Bridge balance</th>
            <th className="num">Equity deployed</th>
            <th className="num">Dev drawdown</th>
            <th className="num">Dev interest</th>
            <th className="num">Dev balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month} style={r.month === pc ? { background: 'var(--grey-light)' } : undefined}>
              <td>
                {r.month}
                {r.month === result.programme.conStartMonth && ' · start on site'}
                {r.month === pc && ' · PC'}
                {r.retentionReleased > 0 && r.month > pc && ' · retention release'}
              </td>
              <td className="num">{fmtNum(r.costs)}</td>
              <td className="num">{fmtNum(r.cumCosts)}</td>
              {hasVat && <td className="num">{fmtNum(r.vatReclaimed - r.vatPaid)}</td>}
              <td className="num">{fmtNum(r.retentionBalance)}</td>
              <td className="num">{fmtNum(r.bridgeBalance)}</td>
              <td className="num">{fmtNum(r.equityCum)}</td>
              <td className="num">{fmtNum(r.devDrawdown)}</td>
              <td className="num">{fmtNum(r.devInterest)}</td>
              <td className="num">{fmtNum(r.devBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScenariosTab({ result }: { result: AppraisalResult }) {
  const sc = result.scenarios;
  return (
    <div className="grid c2" style={{ alignItems: 'start' }}>
      <div>
        <h3 className="section">S1: Immediate sale at practical completion</h3>
        <table className="data">
          <tbody>
            {sc.s1.hpiIndexAtPc !== 1 && (
              <Row k="HPI index at PC (applied to GDV)" v={fmtNum(sc.s1.hpiIndexAtPc, 4)} />
            )}
            <Row k="GDV (indexed to PC, price lever applied)" v={fmtGBP(sc.s1.gdvAdjusted)} />
            <Row k="Total costs after finance" v={fmtGBP(result.finance.totalCostsAfterFinance)} />
            <Row k="NET PROFIT" v={fmtGBP(sc.s1.netProfit)} total />
            <Row k="Profit on cost" v={fmtPct(sc.s1.profitOnCost)} />
            <Row k="Profit on GDV" v={fmtPct(sc.s1.profitOnGdv)} />
            <Row k="Investor profit share" v={fmtGBP(sc.s1.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s1.investorRoi)} />
            <Row k="Investor ROI per annum" v={fmtPct(sc.s1.investorRoiPa)} />
          </tbody>
        </table>
        <WaterfallTable w={sc.s1.waterfall} />

        <h3 className="section">S3: Refinance at PC &amp; rent</h3>
        <table className="data">
          <tbody>
            <Row k="Mortgage advance (LTV × GDV)" v={fmtGBP(sc.s3.mortgageAdvance)} />
            <Row k="Arrangement fee" v={fmtGBP(sc.s3.arrangementFee)} />
            <Row k="Dev loan payoff" v={fmtGBP(sc.s3.devPayoff)} />
            <Row k="Surplus released / (equity gap)" v={fmtGBP(sc.s3.surplusReleased)} />
            <Row k="Net annual rent (after void & mgmt)" v={fmtGBP(sc.s3.netAnnualRent)} />
            <Row k="Annual mortgage interest" v={fmtGBP(sc.s3.annualInterest)} />
            <Row k="NET ANNUAL CASHFLOW" v={fmtGBP(sc.s3.netAnnualCashflow)} total />
            <Row k="Interest cover" v={fmtNum(sc.s3.interestCover, 2)} />
            <Row k="Equity remaining in deal" v={fmtGBP(sc.s3.equityRemaining)} />
            <Row k="Cash-on-cash return" v={fmtPct(sc.s3.cashOnCash)} />
            <Row k="Unrealised development profit" v={fmtGBP(sc.s3.unrealisedProfit)} />
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="section">S2: Delayed sales (dev loan rolls)</h3>
        <table className="data">
          <tbody>
            <Row k="Months to sell out" v={String(sc.s2.monthsToSellOut)} />
            <Row k="Months until loan repaid" v={String(sc.s2.monthsToRepay)} />
            <Row k="Extra interest after PC" v={fmtGBP(sc.s2.extraInterest)} />
            {sc.s2.hpiUplift !== 0 && <Row k="HPI uplift on later sales" v={fmtGBP(sc.s2.hpiUplift)} />}
            {sc.s2.depositInterestOnSurplus > 0 && (
              <Row k="Deposit interest on sale surpluses" v={fmtGBP(sc.s2.depositInterestOnSurplus)} />
            )}
            <Row k="NET PROFIT" v={fmtGBP(sc.s2.netProfit)} total />
            <Row k="Investor profit share" v={fmtGBP(sc.s2.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s2.investorRoi)} />
            <Row k="Total duration (months)" v={String(sc.s2.totalDurationMonths)} />
          </tbody>
        </table>
        <WaterfallTable w={sc.s2.waterfall} />

        <h3 className="section">S4: Refinance at PC, then delayed sales</h3>
        <table className="data">
          <tbody>
            <Row k="Refinance principal (= dev payoff)" v={fmtGBP(sc.s4.refiPrincipal)} />
            <Row k="Arrangement fee (rolled)" v={fmtGBP(sc.s4.arrangementFee)} />
            <Row k="Extra interest after PC (refi rate)" v={fmtGBP(sc.s4.extraInterest)} />
            {sc.s4.hpiUplift !== 0 && <Row k="HPI uplift on later sales" v={fmtGBP(sc.s4.hpiUplift)} />}
            {sc.s4.depositInterestOnSurplus > 0 && (
              <Row k="Deposit interest on sale surpluses" v={fmtGBP(sc.s4.depositInterestOnSurplus)} />
            )}
            <Row k="NET PROFIT" v={fmtGBP(sc.s4.netProfit)} total />
            <Row k="Benefit vs Scenario 2" v={fmtGBP(sc.s4.benefitVsS2)} />
            <Row k="Investor profit share" v={fmtGBP(sc.s4.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s4.investorRoi)} />
          </tbody>
        </table>
        <WaterfallTable w={sc.s4.waterfall} />
      </div>
    </div>
  );
}

function SensitivityTab({ result }: { result: AppraisalResult }) {
  const s = result.sensitivity;
  return (
    <div>
      <h3 className="section">Grid 1: S1 net profit vs sale price movement</h3>
      <table className="data" style={{ maxWidth: 560 }}>
        <thead>
          <tr>
            <th>Price vs GDV</th>
            <th className="num">Net profit</th>
            <th className="num">Profit on GDV</th>
          </tr>
        </thead>
        <tbody>
          {s.grid1.map((r) => (
            <tr key={r.priceMove}>
              <td>{fmtPct(r.priceMove, 0)}</td>
              <td className="num" style={r.netProfit < 0 ? { color: 'var(--fail)' } : undefined}>
                {fmtGBP(r.netProfit)}
              </td>
              <td className="num">{fmtPct(r.profitOnGdv)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="section">Grid 2: S2 net profit by price movement × sales velocity (approximation)</h3>
      <table className="data" style={{ maxWidth: 760 }}>
        <thead>
          <tr>
            <th>Price \ Units/mo</th>
            {s.grid2Velocities.map((v) => (
              <th className="num" key={v}>
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.grid2.map((r) => (
            <tr key={r.priceMove}>
              <td>{fmtPct(r.priceMove, 0)}</td>
              {r.profits.map((c) => (
                <td className="num" key={c.velocity} style={c.netProfit < 0 ? { color: 'var(--fail)' } : undefined}>
                  {fmtGBP(c.netProfit)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note">Approximate: assumes straight-line paydown of the dev loan; the exact base case is Scenario 2.</p>

      <h3 className="section">Grid 3: Refinance &amp; rent net annual cashflow by refi rate × LTV</h3>
      <table className="data" style={{ maxWidth: 660 }}>
        <thead>
          <tr>
            <th>Rate \ LTV</th>
            {s.grid3Ltvs.map((l) => (
              <th className="num" key={l}>
                {fmtPct(l, 0)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.grid3.map((r) => (
            <tr key={r.rate}>
              <td>{fmtPct(r.rate)}</td>
              {r.cells.map((c) => (
                <td className="num" key={c.ltv} style={c.cashflow < 0 ? { color: 'var(--fail)' } : undefined}>
                  {fmtGBP(c.cashflow)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
