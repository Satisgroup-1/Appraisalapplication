// Step 3 — Options: generate every conversion option, browse schematic
// plans, compliance reports and headline numbers; adopt one for appraisal.

import { useMemo, useState } from 'react';
import type { ConversionOption } from '../core/types';
import { planToSvg } from '../core/svgplan';
import { runAppraisal } from '../core/dcf';
import { fmtGBP, fmtNum, fmtPct, useStore } from '../state/store';

export default function OptionsView() {
  const project = useStore((s) => s.project);
  const options = useStore((s) => s.options);
  const optionsStale = useStore((s) => s.optionsStale);
  const regenerate = useStore((s) => s.regenerate);
  const selectedOptionId = useStore((s) => s.selectedOptionId);
  const selectOption = useStore((s) => s.selectOption);
  const setView = useStore((s) => s.setView);

  const [filter, setFilter] = useState<'all' | 'compliant'>('all');
  const selected = options.find((o) => o.id === selectedOptionId) ?? null;

  const profits = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of options) {
      try {
        m.set(o.id, runAppraisal(o.schedule, project.pricing).scenarios.s1.netProfit);
      } catch {
        /* unpriceable option */
      }
    }
    return m;
  }, [options, project.pricing]);

  if (!project.floors.length) {
    return (
      <div>
        <div className="page-title">Conversion options</div>
        <div className="empty-state">
          Capture the building first — import floorplans on the Building page, then generate options here.
        </div>
      </div>
    );
  }

  const shown = filter === 'compliant' ? options.filter((o) => o.allCompliant) : options;

  return (
    <div>
      <div className="page-title">
        Conversion options
        <span className="hint">Every layout is validated against the NDSS ruleset before it is priced</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button className="btn" onClick={regenerate}>
          {optionsStale ? 'Generate options' : 'Regenerate options'}
        </button>
        {options.length > 0 && (
          <>
            <button className={`pill ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              All ({options.length})
            </button>
            <button className={`pill ${filter === 'compliant' ? 'on' : ''}`} onClick={() => setFilter('compliant')}>
              Fully compliant ({options.filter((o) => o.allCompliant).length})
            </button>
          </>
        )}
      </div>
      {optionsStale && options.length > 0 && (
        <div className="warn-box">Building or pricing has changed since these options were generated — regenerate.</div>
      )}

      {options.length === 0 ? (
        <div className="empty-state">
          Press Generate to enumerate conversions of “{project.name}” — commercial→residential, unit splits at three
          mix strategies, lateral floor-through apartments and a whole-building merge — validated against the NDSS
          ruleset and priced from “{project.pricing.name}”.
        </div>
      ) : (
        <div className="option-grid">
          {shown.map((o) => (
            <OptionCard
              key={o.id}
              option={o}
              profit={profits.get(o.id)}
              selected={o.id === selectedOptionId}
              onSelect={() => selectOption(o.id)}
            />
          ))}
        </div>
      )}

      {selected && <OptionDetail option={selected} onAppraise={() => setView('appraisal')} />}
    </div>
  );
}

function OptionCard({
  option,
  profit,
  selected,
  onSelect,
}: {
  option: ConversionOption;
  profit: number | undefined;
  selected: boolean;
  onSelect: () => void;
}) {
  const project = useStore((s) => s.project);
  const thumbSvg = useMemo(() => {
    const plan = option.floors[0];
    if (!plan) return '';
    const env = project.floors.find((f) => f.floor === plan.floor) ?? project.floors[0];
    return env ? planToSvg(plan, env) : '';
  }, [option, project.floors]);

  return (
    <button className={`option-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="plan-thumb" dangerouslySetInnerHTML={{ __html: thumbSvg }} />
      <div className="body">
        <span className={`badge ${option.allCompliant ? 'pass' : 'fail'}`}>
          {option.allCompliant ? 'NDSS compliant' : 'Non-compliant units'}
        </span>
        <h4>{option.title}</h4>
        <div className="desc">{option.description}</div>
        <div className="stats">
          <span>
            <b>{option.totals.units}</b> units
          </span>
          <span>
            <b>{fmtNum(option.totals.niaSqm)}</b> sqm NIA
          </span>
          <span>
            <b>{fmtGBP(option.totals.gdv / 1e6, 2)}m</b> GDV
          </span>
          {profit !== undefined && (
            <span>
              <b style={{ color: profit < 0 ? 'var(--fail)' : undefined }}>{fmtGBP(profit / 1e3)}k</b> S1 profit
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function OptionDetail({ option, onAppraise }: { option: ConversionOption; onAppraise: () => void }) {
  const project = useStore((s) => s.project);

  async function exportSvg(floorIdx: number) {
    const plan = option.floors[floorIdx];
    const env = project.floors.find((f) => f.floor === plan.floor);
    if (!env) return;
    await window.satis.exportSvg(planToSvg(plan, env), `${project.name}_${option.id}_floor${plan.floor}`);
  }

  return (
    <div style={{ marginTop: 34 }}>
      <div className="page-title">
        {option.title}
        <span className="hint">Feasibility schematics — not architecture. Planning matters are out of scope.</span>
      </div>

      {option.warnings.length > 0 && (
        <div className="warn-box">
          {option.warnings.map((w, i) => (
            <div key={i}>{w}</div>
          ))}
        </div>
      )}

      <h3 className="section">Unit schedule</h3>
      <table className="data">
        <thead>
          <tr>
            <th>No</th>
            <th>Unit</th>
            <th>Floor</th>
            <th>Type</th>
            <th className="num">Sqm</th>
            <th className="num">Sqft</th>
            <th className="num">£/sqft</th>
            <th className="num">Unit GDV</th>
            <th className="num">Build mo</th>
            <th className="num">Rent £/mo</th>
          </tr>
        </thead>
        <tbody>
          {option.schedule.map((r) => (
            <tr key={r.no}>
              <td>{r.no}</td>
              <td>{r.name}</td>
              <td>{r.floor}</td>
              <td>{r.type}</td>
              <td className="num">{fmtNum(r.sqm, 1)}</td>
              <td className="num">{fmtNum(r.sqft)}</td>
              <td className="num">{fmtNum(r.salePsf)}</td>
              <td className="num">{fmtGBP(r.unitGdv)}</td>
              <td className="num">{r.buildMonths}</td>
              <td className="num">{fmtNum(r.monthlyRent)}</td>
            </tr>
          ))}
          <tr className="total">
            <td colSpan={4}>TOTAL — {option.totals.units} units</td>
            <td className="num">{fmtNum(option.totals.niaSqm, 1)}</td>
            <td className="num">{fmtNum(option.totals.niaSqft)}</td>
            <td className="num" />
            <td className="num">{fmtGBP(option.totals.gdv)}</td>
            <td className="num" />
            <td className="num">{fmtNum(option.totals.monthlyRent)}</td>
          </tr>
        </tbody>
      </table>

      <button className="btn" onClick={onAppraise}>
        Appraise this option →
      </button>

      <h3 className="section">Floor plans &amp; compliance</h3>
      {option.floors.map((plan, i) => {
        const env = project.floors.find((f) => f.floor === plan.floor);
        const compliance = option.compliance.find((c) => c.floor === plan.floor);
        return (
          <div key={`${plan.floor}-${i}`} className="floor-block">
            <div className="floor-head">
              <h4>Floor {plan.floor}</h4>
              <span>
                <button className="btn ghost small" onClick={() => exportSvg(i)}>
                  Export SVG
                </button>
              </span>
            </div>
            {env && plan.strategy !== 'whole_house' && (
              <div className="svg-wrap" dangerouslySetInnerHTML={{ __html: planToSvg(plan, env) }} />
            )}
            {compliance && (
              <div>
                {compliance.units.map((u) => {
                  const unit = plan.units.find((x) => x.no === u.unitNo);
                  return (
                    <div key={u.unitNo} style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5 }}>
                        Unit {u.unitNo} · {unit?.label} · {unit?.giaSqm} sqm ({unit?.persons}p){' '}
                        <span className={`badge ${u.pass ? 'pass' : 'fail'}`} style={{ marginLeft: 8 }}>
                          {u.pass ? 'Pass' : 'Fail'}
                        </span>
                      </span>
                      {u.issues.map((iss, k) => (
                        <div key={k} className="compliance-issue">
                          — {iss}
                        </div>
                      ))}
                    </div>
                  );
                })}
                {compliance.netToGrossNote && <div className="assumption">Note: {compliance.netToGrossNote}</div>}
              </div>
            )}
          </div>
        );
      })}
      {option.retained.length > 0 && (
        <p className="note">
          Retained floors: {option.retained.map((r) => `floor ${r.floor} (${r.use}, ${fmtNum(r.sqm)} sqm)`).join(', ')}.
        </p>
      )}
    </div>
  );
}
