// Step 4 — Appraisal: the full DCF for the selected option. Mirrors the
// Appraisal Model workbook: summary, dev costs, monthly cashflow, four exit
// scenarios and sensitivity grids, plus export to the Excel template.

import { useMemo, useState } from 'react';
import { runAppraisal } from '../core/dcf';
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
  const schedule: ScheduleRow[] | null = useDemo ? DEMO_SCHEDULE : option?.schedule ?? null;
  const roomAreas = useDemo ? undefined : option?.roomAreas;
  const pricing = project?.pricing ?? null;

  const result: AppraisalResult | null = useMemo(() => {
    if (!schedule || !schedule.length || !pricing) return null;
    try {
      return runAppraisal(schedule, pricing, roomAreas);
    } catch {
      return null;
    }
  }, [schedule, pricing, roomAreas]);

  if (!project) return null;

  async function exportXlsx() {
    if (!schedule || !project) return;
    setExportMsg(null);
    const inputs = {
      address: project.address || project.name,
      ...project.pricing.finance,
      devCostLines: project.pricing.devCosts.map((l) => ({ code: l.code, kind: l.kind, value: l.value })),
      buildCostOverride: result?.devCosts.buildCostSource === 'roomRates' ? result.devCosts.buildCost : null,
    };
    const path = await window.satis.exportXlsx(
      JSON.stringify(schedule),
      JSON.stringify(inputs),
      `${project.name.replace(/\s+/g, '_')}_${useDemo ? 'demo' : option?.id ?? 'appraisal'}`,
    );
    if (path) {
      setExportMsg(`Workbook exported to ${path} — open in Excel to recalculate.`);
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
          Demo — Appraisal Model 1 scheme
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
              <td>S1 — Immediate sale at PC</td>
              <td className="num">{fmtGBP(scenarios.s1.netProfit)}</td>
              <td className="num">{fmtPct(scenarios.s1.profitOnGdv)}</td>
              <td className="num">{fmtPct(scenarios.s1.investorRoi)}</td>
              <td className="num">{scenarios.s1.durationMonths}</td>
            </tr>
            <tr>
              <td>S2 — Delayed sales (dev loan)</td>
              <td className="num">{fmtGBP(scenarios.s2.netProfit)}</td>
              <td className="num">{fmtPct(scenarios.s1.gdvAdjusted === 0 ? 0 : scenarios.s2.netProfit / scenarios.s1.gdvAdjusted)}</td>
              <td className="num">{fmtPct(scenarios.s2.investorRoi)}</td>
              <td className="num">{scenarios.s2.totalDurationMonths}</td>
            </tr>
            <tr>
              <td>S3 — Refinance &amp; rent (pa cashflow)</td>
              <td className="num">{fmtGBP(scenarios.s3.netAnnualCashflow)}</td>
              <td className="num">—</td>
              <td className="num">{fmtPct(scenarios.s3.cashOnCash)}</td>
              <td className="num">hold</td>
            </tr>
            <tr>
              <td>S4 — Refinance then delayed sales</td>
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
            <Row k="TOTAL FINANCE COSTS" v={fmtGBP(finance.totalFinanceCosts)} total />
          </tbody>
        </table>
      </div>
    </div>
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
          <h3 className="section">Build cost (D01) — from room-type £/sqft rates</h3>
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
  const rows = result.cashflow.filter((r) => r.month <= Math.max(result.programme.pcMonth + 2, 14));
  return (
    <div style={{ overflowX: 'auto' }}>
      <p className="note">
        Costs spread evenly within each phase. Bridge rolls up from purchase and is redeemed by the development loan at
        construction start (month {result.programme.conStartMonth}); the development loan rolls up to PC (month{' '}
        {result.programme.pcMonth}).
      </p>
      <table className="data">
        <thead>
          <tr>
            <th>Month</th>
            <th className="num">Costs</th>
            <th className="num">Cumulative</th>
            <th className="num">Bridge interest</th>
            <th className="num">Bridge balance</th>
            <th className="num">Equity deployed</th>
            <th className="num">Dev drawdown</th>
            <th className="num">Dev interest</th>
            <th className="num">Dev balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.month} style={r.month === result.programme.pcMonth ? { background: 'var(--grey-light)' } : undefined}>
              <td>
                {r.month}
                {r.month === result.programme.conStartMonth && ' · start on site'}
                {r.month === result.programme.pcMonth && ' · PC'}
              </td>
              <td className="num">{fmtNum(r.costs)}</td>
              <td className="num">{fmtNum(r.cumCosts)}</td>
              <td className="num">{fmtNum(r.bridgeInterest)}</td>
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
        <h3 className="section">S1 — Immediate sale at practical completion</h3>
        <table className="data">
          <tbody>
            <Row k="GDV (adjusted for price lever)" v={fmtGBP(sc.s1.gdvAdjusted)} />
            <Row k="Total costs after finance" v={fmtGBP(result.finance.totalCostsAfterFinance)} />
            <Row k="NET PROFIT" v={fmtGBP(sc.s1.netProfit)} total />
            <Row k="Profit on cost" v={fmtPct(sc.s1.profitOnCost)} />
            <Row k="Profit on GDV" v={fmtPct(sc.s1.profitOnGdv)} />
            <Row k="Investor profit share" v={fmtGBP(sc.s1.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s1.investorRoi)} />
            <Row k="Investor ROI per annum" v={fmtPct(sc.s1.investorRoiPa)} />
          </tbody>
        </table>

        <h3 className="section">S3 — Refinance at PC &amp; rent</h3>
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
        <h3 className="section">S2 — Delayed sales (dev loan rolls)</h3>
        <table className="data">
          <tbody>
            <Row k="Months to sell out" v={String(sc.s2.monthsToSellOut)} />
            <Row k="Months until loan repaid" v={String(sc.s2.monthsToRepay)} />
            <Row k="Extra interest after PC" v={fmtGBP(sc.s2.extraInterest)} />
            <Row k="NET PROFIT" v={fmtGBP(sc.s2.netProfit)} total />
            <Row k="Investor profit share" v={fmtGBP(sc.s2.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s2.investorRoi)} />
            <Row k="Total duration (months)" v={String(sc.s2.totalDurationMonths)} />
          </tbody>
        </table>

        <h3 className="section">S4 — Refinance at PC, then delayed sales</h3>
        <table className="data">
          <tbody>
            <Row k="Refinance principal (= dev payoff)" v={fmtGBP(sc.s4.refiPrincipal)} />
            <Row k="Arrangement fee (rolled)" v={fmtGBP(sc.s4.arrangementFee)} />
            <Row k="Extra interest after PC (refi rate)" v={fmtGBP(sc.s4.extraInterest)} />
            <Row k="NET PROFIT" v={fmtGBP(sc.s4.netProfit)} total />
            <Row k="Benefit vs Scenario 2" v={fmtGBP(sc.s4.benefitVsS2)} />
            <Row k="Investor profit share" v={fmtGBP(sc.s4.investorProfit)} />
            <Row k="Investor ROI" v={fmtPct(sc.s4.investorRoi)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SensitivityTab({ result }: { result: AppraisalResult }) {
  const s = result.sensitivity;
  return (
    <div>
      <h3 className="section">Grid 1 — S1 net profit vs sale price movement</h3>
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

      <h3 className="section">Grid 2 — S2 net profit: price movement × sales velocity (approximation)</h3>
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

      <h3 className="section">Grid 3 — Refinance &amp; rent: net annual cashflow by refi rate × LTV</h3>
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
