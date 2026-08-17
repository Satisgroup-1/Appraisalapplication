// Step 2 — Pricing: sale/rent rates, build programme, finance parameters and
// development cost lines, with save/load of named presets.

import { useState } from 'react';
import type {
  BuildEstimates,
  DevCostLine,
  EstimateValue,
  FinanceEstimates,
  PricingSpec,
  RateCategory,
  RoomRates,
  SalesEstimates,
} from '../core/types';
import { normalizePricing } from '../core/pricing';
import { runAppraisal, sdltLineCodeOf } from '../core/dcf';
import { sdltForFinance } from '../core/sdlt';
import { blendedRoomRate, isStale, scaleRoomRates } from '../core/estimates';
import { fmtGBP, useStore } from '../state/store';

export default function PricingView() {
  const project = useStore((s) => s.project);
  const setPricing = useStore((s) => s.setPricing);
  const setEstimates = useStore((s) => s.setEstimates);
  const options = useStore((s) => s.options);
  const selectedOptionId = useStore((s) => s.selectedOptionId);
  const setView = useStore((s) => s.setView);
  const [msg, setMsg] = useState<string | null>(null);
  const [hpiBusy, setHpiBusy] = useState(false);
  const [hpiMsg, setHpiMsg] = useState<string | null>(null);
  const [estBusy, setEstBusy] = useState<string | null>(null);
  const [estMsg, setEstMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!project) return null;
  const spec = project.pricing;

  const patch = (p: Partial<PricingSpec>) => setPricing({ ...spec, ...p });
  const patchFinance = (p: Partial<PricingSpec['finance']>) => patch({ finance: { ...spec.finance, ...p } });
  const fin = spec.finance;
  const est = project.estimates ?? {};
  const option = options.find((o) => o.id === selectedOptionId) ?? options[0] ?? null;
  // What the room-rate table currently blends to — over the selected scheme's
  // real areas when one exists, matching exactly what Apply will scale.
  const currentBuildBlend = option
    ? blendedRoomRate(spec.roomRates, option.roomAreas)
    : (spec.roomRates.kitchenLiving +
        spec.roomRates.bedroom +
        spec.roomRates.bathroom +
        spec.roomRates.hallStorage +
        spec.roomRates.circulation) /
      5;

  async function runHpiAgent() {
    setHpiMsg(null);
    setHpiBusy(true);
    try {
      const auth = await window.satis.authStatus();
      if (!auth.ready) {
        setHpiMsg('Claude is not connected yet. Open Settings to sign in or add an API key, or enter rates manually.');
        return;
      }
      const region = fin.hpi.region?.trim() || project!.address || 'UK';
      const proj = await window.satis.aiProjectHpi(region);
      patchFinance({
        hpi: {
          ...fin.hpi,
          enabled: true,
          annualPct: proj.annualPct,
          region: proj.region,
          rationale: proj.rationale,
          sources: proj.sources,
          projectedAt: proj.projectedAt,
        },
      });
      setHpiMsg('Projection applied. Review the rates and rationale below; every figure stays editable.');
    } catch (e) {
      setHpiMsg(`Projection failed: ${(e as Error).message}`);
    } finally {
      setHpiBusy(false);
    }
  }

  async function claudeReady(): Promise<boolean> {
    const auth = await window.satis.authStatus();
    if (!auth.ready) {
      setEstMsg({ ok: false, text: 'Claude is not connected yet. Open Settings to sign in or add an API key.' });
      return false;
    }
    return true;
  }

  async function runSalesEstimate(): Promise<void> {
    const address = project!.address.trim();
    if (!address) throw new Error('Give the project an address first (Project step): sales evidence is searched around it.');
    const unitTypes = option ? [...new Set(option.schedule.map((r) => r.type))] : ['Studio', '1 bed', '2 bed', '3 bed'];
    const sales = (await window.satis.aiEstimateSales({ address, unitTypes })) as SalesEstimates;
    setEstimates({ sales });
  }

  async function runBuildEstimate(): Promise<void> {
    const region = fin.hpi.region?.trim() || project!.address.trim() || 'UK';
    const build = (await window.satis.aiEstimateBuild({ region, giaSqft: fin.giaSqft })) as BuildEstimates;
    setEstimates({ build });
  }

  async function runFinanceEstimate(): Promise<void> {
    // Shape the research to this deal where a generated option exists;
    // otherwise the agent is told the GDV is not yet established.
    let gdv = 0;
    let facility = 0;
    if (option) {
      const r = runAppraisal(option.schedule, spec, option.roomAreas);
      gdv = r.totals.gdv;
      facility = r.finance.devFacilityEstimate;
    }
    const finance = (await window.satis.aiEstimateFinance({
      deal: {
        purchasePrice: fin.purchasePrice,
        bridgeLtv: fin.bridge.ltv,
        devFacilityEstimate: facility,
        gdv,
        assetType: 'commercial building converted to residential flats',
      },
    })) as FinanceEstimates;
    setEstimates({ finance });
  }

  async function runEstimates(which: 'sales' | 'build' | 'finance' | 'all') {
    setEstMsg(null);
    if (!(await claudeReady())) return;
    const jobs: [string, () => Promise<void>][] =
      which === 'all'
        ? [
            ['sales & rents', runSalesEstimate],
            ['build cost', runBuildEstimate],
            ['finance rates', runFinanceEstimate],
          ]
        : which === 'sales'
          ? [['sales & rents', runSalesEstimate]]
          : which === 'build'
            ? [['build cost', runBuildEstimate]]
            : [['finance rates', runFinanceEstimate]];
    const failures: string[] = [];
    for (const [name, job] of jobs) {
      setEstBusy(`Researching ${name}… (searches the web, takes a minute)`);
      try {
        await job();
      } catch (e) {
        failures.push(`${name}: ${(e as Error).message}`);
      }
    }
    setEstBusy(null);
    setEstMsg(
      failures.length
        ? { ok: false, text: `Some research did not complete. ${failures.join(' ')}` }
        : { ok: true, text: 'Estimates updated. Suggestions appear beside each covered field; nothing is applied until you choose.' },
    );
  }

  async function savePreset() {
    const path = await window.satis.saveProject(JSON.stringify(spec, null, 2), `${spec.name.replace(/\s+/g, '_')}.pricing`);
    if (path) setMsg(`Preset saved to ${path}`);
  }

  async function loadPreset() {
    const res = await window.satis.openProject();
    if (!res) return;
    try {
      const p = JSON.parse(res.json) as Partial<PricingSpec>;
      if (!p.rates || !p.finance || !p.devCosts) throw new Error('Not a pricing preset file.');
      const normalized = normalizePricing(p);
      setPricing(normalized);
      setMsg(`Loaded preset "${normalized.name}"`);
    } catch (e) {
      setMsg(`Could not load preset: ${(e as Error).message}`);
    }
  }

  return (
    <div>
      <div className="page-title">
        Pricing specification
        <span className="hint">Rates and assumptions used to price every generated option</span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <button className="btn ghost" onClick={savePreset}>
          Save preset
        </button>
        <button className="btn ghost" onClick={loadPreset}>
          Load preset
        </button>
      </div>
      {msg && <div className="ok-box">{msg}</div>}

      <div className="grid c3">
        <label className="field">
          Preset name
          <input value={spec.name} onChange={(e) => patch({ name: e.target.value })} />
        </label>
      </div>

      <h3 className="section">Pricing estimates</h3>
      <p className="note">
        Researches real-world figures for this project and shows a suggestion with its range, rationale and sources
        beside each covered field — nothing is applied until you choose. Sales &amp; rents come from sold prices within
        half a mile (indexed to today) reconciled with current listings; build cost from published conversion
        benchmarks and your recorded tenders; finance rates from current market pricing and your recorded term sheets,
        shaped to this deal. Suggestions are today&apos;s values: the house price inflation setting below carries sale
        prices forward to completion, so growth is only ever counted once. Tenders and term sheets are recorded in
        Settings.
      </p>
      <div style={{ marginBottom: 10 }}>
        <button className="btn" onClick={() => runEstimates('all')} disabled={!!estBusy}>
          Estimate everything
        </button>
        <button className="btn ghost" onClick={() => runEstimates('sales')} disabled={!!estBusy}>
          Sales &amp; rents{staleTag(est.sales?.ranAt)}
        </button>
        <button className="btn ghost" onClick={() => runEstimates('build')} disabled={!!estBusy}>
          Build cost{staleTag(est.build?.ranAt)}
        </button>
        <button className="btn ghost" onClick={() => runEstimates('finance')} disabled={!!estBusy}>
          Finance rates{staleTag(est.finance?.ranAt)}
        </button>
      </div>
      {estBusy && <div className="ok-box">{estBusy}</div>}
      {estMsg && <div className={estMsg.ok ? 'ok-box' : 'warn-box'}>{estMsg.text}</div>}

      <h3 className="section">Sale &amp; rental rates</h3>
      <table className="data" style={{ maxWidth: 640 }}>
        <thead>
          <tr>
            <th>Unit type</th>
            <th className="num">Sale £/sqft</th>
            <th className="num">Rent £/sqft/mo</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(spec.rates) as (keyof PricingSpec['rates'])[]).map((k) => {
            const sug = est.sales?.rates[k as RateCategory];
            return (
              <tr key={k}>
                <td style={{ textTransform: 'capitalize' }}>{labelOf(k)}</td>
                <td className="num">
                  <input
                    type="number"
                    value={spec.rates[k].salePsf}
                    onChange={(e) =>
                      patch({ rates: { ...spec.rates, [k]: { ...spec.rates[k], salePsf: num(e.target.value) } } })
                    }
                  />
                  {sug && (
                    <Suggestion
                      est={sug.salePsf}
                      fmt={(v) => `£${Math.round(v)}`}
                      onApply={() =>
                        patch({ rates: { ...spec.rates, [k]: { ...spec.rates[k], salePsf: Math.round(sug.salePsf.likely) } } })
                      }
                    />
                  )}
                </td>
                <td className="num">
                  <input
                    type="number"
                    step="0.05"
                    value={spec.rates[k].monthlyRentPsf}
                    onChange={(e) =>
                      patch({ rates: { ...spec.rates, [k]: { ...spec.rates[k], monthlyRentPsf: num(e.target.value) } } })
                    }
                  />
                  {sug && (
                    <Suggestion
                      est={sug.rentPsf}
                      fmt={(v) => `£${v.toFixed(2)}`}
                      onApply={() =>
                        patch({
                          rates: {
                            ...spec.rates,
                            [k]: { ...spec.rates[k], monthlyRentPsf: Math.round(sug.rentPsf.likely * 100) / 100 },
                          },
                        })
                      }
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {est.sales && (
        <>
          <div style={{ marginBottom: 6 }}>
            <button
              className="btn ghost"
              onClick={() => {
                const rates = { ...spec.rates };
                for (const k of Object.keys(rates) as (keyof PricingSpec['rates'])[]) {
                  const sug = est.sales!.rates[k as RateCategory];
                  if (!sug) continue;
                  rates[k] = {
                    salePsf: Math.round(sug.salePsf.likely),
                    monthlyRentPsf: Math.round(sug.rentPsf.likely * 100) / 100,
                  };
                }
                patch({ rates });
              }}
            >
              Apply all sales &amp; rent suggestions
            </button>
          </div>
          <EvidenceDetails
            title={`Sales evidence & rationale (researched ${new Date(est.sales.ranAt).toLocaleDateString('en-GB')}, ${est.sales.address})`}
            entries={Object.entries(est.sales.rates).map(([k, v]) => ({
              label: labelOf(k),
              value: v.salePsf,
            }))}
          />
        </>
      )}

      <h3 className="section">Build cost: £/sqft by room type</h3>
      <p className="note">
        With room-type rates on, the build cost (dev cost line D01) is computed from each option's actual room areas
        (kitchens/living, bedrooms, bathrooms, halls, common circulation and retained commercial), so denser layouts
        with more wet rooms cost more to build. Hand-entered schedules without room data fall back to the fixed D01
        amount below.
      </p>
      <div className="grid c3">
        <label className="field">
          Build cost mode
          <select
            value={spec.buildCostMode}
            onChange={(e) => patch({ buildCostMode: e.target.value as PricingSpec['buildCostMode'] })}
          >
            <option value="roomRates">Room-type £/sqft rates</option>
            <option value="fixed">Fixed amount (line D01)</option>
          </select>
        </label>
      </div>
      {spec.buildCostMode === 'roomRates' && (
        <table className="data" style={{ maxWidth: 560 }}>
          <thead>
            <tr>
              <th>Room type</th>
              <th className="num">Build £/sqft</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['kitchenLiving', 'Living / kitchen (incl. kitchen fit-out)'],
                ['bedroom', 'Bedrooms'],
                ['bathroom', 'Bathrooms (sanitaryware, tiling, ventilation)'],
                ['hallStorage', 'Halls / storage'],
                ['circulation', 'Circulation & cores (common areas)'],
                ['commercial', 'Commercial (retained floors)'],
              ] as [keyof RoomRates, string][]
            ).map(([k, label]) => (
              <tr key={k}>
                <td>{label}</td>
                <td className="num">
                  <input
                    type="number"
                    value={spec.roomRates[k]}
                    onChange={(e) => patch({ roomRates: { ...spec.roomRates, [k]: num(e.target.value) } })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {est.build && (
        <div className="est-block">
          <Suggestion
            est={est.build.blendedPsf}
            fmt={(v) => `£${Math.round(v)}/sqft all-in`}
            label={
              spec.buildCostMode === 'roomRates'
                ? `current blend £${Math.round(currentBuildBlend)}/sqft — Apply scales every room rate, keeping their ratios`
                : `Apply sets the fixed D01 contract sum to £/sqft × building GIA`
            }
            onApply={() => {
              if (spec.buildCostMode === 'roomRates') {
                patch({ roomRates: scaleRoomRates(spec.roomRates, option?.roomAreas ?? null, est.build!.blendedPsf.likely) });
              } else {
                const sum = Math.round(est.build!.blendedPsf.likely * fin.giaSqft);
                patch({ devCosts: spec.devCosts.map((l) => (l.code === 'D01' ? { ...l, value: sum } : l)) });
              }
            }}
          />
          <EvidenceDetails
            title={`Build cost evidence & rationale (researched ${new Date(est.build.ranAt).toLocaleDateString('en-GB')}, ${est.build.region})`}
            entries={[{ label: 'All-in contract £/sqft', value: est.build.blendedPsf }]}
          />
        </div>
      )}

      <h3 className="section">Build programme</h3>
      <div className="grid c3">
        <label className="field">
          Base build months (ground floor unit)
          <input type="number" value={spec.build.baseMonths} onChange={(e) => patch({ build: { ...spec.build, baseMonths: num(e.target.value) } })} />
        </label>
        <label className="field">
          + months per floor above ground
          <input type="number" value={spec.build.perFloorMonths} onChange={(e) => patch({ build: { ...spec.build, perFloorMonths: num(e.target.value) } })} />
        </label>
        <label className="field">
          Commercial fit-out months
          <input type="number" value={spec.build.commercialMonths} onChange={(e) => patch({ build: { ...spec.build, commercialMonths: num(e.target.value) } })} />
        </label>
      </div>

      <h3 className="section">Site &amp; programme</h3>
      <div className="grid c4">
        <label className="field">
          Purchase price £
          <input type="number" value={spec.finance.purchasePrice} onChange={(e) => patchFinance({ purchasePrice: num(e.target.value) })} />
        </label>
        <label className="field">
          Purchase date
          <input type="month" value={spec.finance.purchaseDate} onChange={(e) => patchFinance({ purchaseDate: e.target.value })} />
        </label>
        <label className="field">
          Building GIA (sqft)
          <input type="number" value={spec.finance.giaSqft} onChange={(e) => patchFinance({ giaSqft: num(e.target.value) })} />
        </label>
        <label className="field">
          Legal period (months)
          <input type="number" value={spec.finance.legalMonths} onChange={(e) => patchFinance({ legalMonths: num(e.target.value) })} />
        </label>
        <label className="field">
          Pre-construction (months)
          <input type="number" value={spec.finance.preConMonths} onChange={(e) => patchFinance({ preConMonths: num(e.target.value) })} />
        </label>
        <label className="field">
          Stamp duty (line B04)
          <select
            value={fin.sdlt.regime}
            onChange={(e) => patchFinance({ sdlt: { regime: e.target.value as PricingSpec['finance']['sdlt']['regime'] } })}
          >
            <option value="nonResidential">Auto: commercial / mixed-use bands</option>
            <option value="residentialCompany">Auto: residential, company rates</option>
            <option value="manual">Manual (typed on the B04 line)</option>
          </select>
        </label>
        {fin.sdlt.regime !== 'manual' && (
          <label className="field">
            SDLT computed
            <input value={fmtGBP(sdltForFinance(fin) ?? 0)} readOnly style={{ color: 'var(--grey-text)' }} />
          </label>
        )}
      </div>
      {fin.sdlt.regime !== 'manual' && (
        <p className="note">
          SDLT recomputes live from the purchase price on HMRC bands{fin.vat.optedToTax ? ', on the VAT-inclusive price because the property is opted to tax' : ''}.
          Your solicitor&apos;s completion statement is final: switch to Manual and type the figure if it differs.
        </p>
      )}

      <h3 className="section">VAT on the purchase</h3>
      <p className="note">
        If the seller has opted the property to tax, VAT is paid on the purchase price at completion and reclaimed
        (typically two months later). It nets to zero as a cost, but has to be funded in the meantime: from equity, or
        with a short VAT loan whose fee and interest are a real cost. SDLT is charged on the VAT-inclusive price, so
        check the SDLT line when this is on.
      </p>
      <div className="grid c4">
        <label className="field">
          Seller opted to tax
          <select
            value={fin.vat.optedToTax ? 'yes' : 'no'}
            onChange={(e) => patchFinance({ vat: { ...fin.vat, optedToTax: e.target.value === 'yes' } })}
          >
            <option value="no">No: no VAT on purchase</option>
            <option value="yes">Yes: VAT paid &amp; reclaimed</option>
          </select>
        </label>
        {fin.vat.optedToTax && (
          <>
            <PctField label="VAT rate" value={fin.vat.ratePct} onChange={(v) => patchFinance({ vat: { ...fin.vat, ratePct: v } })} />
            <label className="field">
              Reclaim lag (months)
              <input
                type="number"
                min={0}
                value={fin.vat.reclaimLagMonths}
                onChange={(e) => patchFinance({ vat: { ...fin.vat, reclaimLagMonths: num(e.target.value) } })}
              />
            </label>
            <label className="field">
              Funded by
              <select
                value={fin.vat.fundedBy}
                onChange={(e) => patchFinance({ vat: { ...fin.vat, fundedBy: e.target.value as 'equity' | 'vatLoan' } })}
              >
                <option value="equity">Equity (working capital)</option>
                <option value="vatLoan">VAT loan facility</option>
              </select>
            </label>
            {fin.vat.fundedBy === 'vatLoan' && (
              <>
                <PctField
                  label="VAT loan rate pa"
                  value={fin.vat.vatLoan.ratePa}
                  est={est.finance?.vatLoanRatePa}
                  onChange={(v) => patchFinance({ vat: { ...fin.vat, vatLoan: { ...fin.vat.vatLoan, ratePa: v } } })}
                />
                <PctField
                  label="VAT loan arrangement fee"
                  value={fin.vat.vatLoan.arrangementFee}
                  onChange={(v) => patchFinance({ vat: { ...fin.vat, vatLoan: { ...fin.vat.vatLoan, arrangementFee: v } } })}
                />
              </>
            )}
          </>
        )}
      </div>

      <h3 className="section">Bridging loan: site purchase</h3>
      <p className="note">
        The bridge advances against the purchase price only. SDLT, legals, valuation and design fees are paid from
        equity: they are part of the equity raise, not the facility.
      </p>
      <div className="grid c4">
        <PctField label="LTV on purchase" value={spec.finance.bridge.ltv} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, ltv: v } })} />
        <PctField label="Interest rate pa" value={spec.finance.bridge.ratePa} est={est.finance?.bridgeRatePa} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.bridge.arrangementFee} est={est.finance?.bridgeArrangementFee} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, arrangementFee: v } })} />
        <PctField label="Exit fee" value={spec.finance.bridge.exitFee} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, exitFee: v } })} />
      </div>

      <h3 className="section">Development loan</h3>
      <div className="grid c4">
        <PctField label="Interest rate pa" value={spec.finance.devLoan.ratePa} est={est.finance?.devLoanRatePa} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.devLoan.arrangementFee} est={est.finance?.devLoanArrangementFee} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, arrangementFee: v } })} />
        <PctField label="Exit fee" value={spec.finance.devLoan.exitFee} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, exitFee: v } })} />
        <PctField label="Max LTGDV covenant" value={spec.finance.devLoan.maxLtgdv} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, maxLtgdv: v } })} />
      </div>
      {est.finance && (
        <>
          <div style={{ marginBottom: 6 }}>
            <button
              className="btn ghost"
              onClick={() => {
                const fe = est.finance!;
                patchFinance({
                  bridge: { ...fin.bridge, ratePa: round4(fe.bridgeRatePa.likely), arrangementFee: round4(fe.bridgeArrangementFee.likely) },
                  devLoan: { ...fin.devLoan, ratePa: round4(fe.devLoanRatePa.likely), arrangementFee: round4(fe.devLoanArrangementFee.likely) },
                  vat: { ...fin.vat, vatLoan: { ...fin.vat.vatLoan, ratePa: round4(fe.vatLoanRatePa.likely) } },
                  refinance: { ...fin.refinance, ratePa: round4(fe.refinanceRatePa.likely) },
                  depositRatePa: round4(fe.depositRatePa.likely),
                });
              }}
            >
              Apply all finance rate suggestions
            </button>
          </div>
          <EvidenceDetails
            title={`Finance rate evidence & rationale (researched ${new Date(est.finance.ranAt).toLocaleDateString('en-GB')}${est.finance.soniaRatePa !== null ? `, SONIA ${(est.finance.soniaRatePa * 100).toFixed(2)}%` : ''})`}
            entries={[
              { label: 'Bridge rate pa', value: est.finance.bridgeRatePa },
              { label: 'Bridge arrangement fee', value: est.finance.bridgeArrangementFee },
              { label: 'Dev loan rate pa', value: est.finance.devLoanRatePa },
              { label: 'Dev loan arrangement fee', value: est.finance.devLoanArrangementFee },
              { label: 'VAT loan rate pa', value: est.finance.vatLoanRatePa },
              { label: 'Refinance rate pa', value: est.finance.refinanceRatePa },
              { label: 'Deposit rate pa (SONIA-linked)', value: est.finance.depositRatePa },
            ]}
          />
        </>
      )}

      <h3 className="section">Construction cashflow, retention &amp; cash</h3>
      <p className="note">
        The main contract draws on a standard S-curve (slow start, peak mid-programme, tail-off), standing in for a QS
        drawdown schedule. Architect and QS fees straight-line from month 1 to practical completion; other professional
        fees sit in pre-construction. Retention is withheld from every certificate, part released at PC and the rest
        after the defects period. Cash held (the retention pot, sale surpluses) earns deposit interest.
      </p>
      <div className="grid c4">
        <PctField
          label="Retention during works"
          value={fin.retention.pctDuringWorks}
          onChange={(v) => patchFinance({ retention: { ...fin.retention, pctDuringWorks: v } })}
        />
        <PctField
          label="Held after PC (defects)"
          value={fin.retention.pctAfterPc}
          onChange={(v) => patchFinance({ retention: { ...fin.retention, pctAfterPc: v } })}
        />
        <label className="field">
          Defects period (months)
          <input
            type="number"
            min={0}
            value={fin.retention.releaseMonthsAfterPc}
            onChange={(e) => patchFinance({ retention: { ...fin.retention, releaseMonthsAfterPc: num(e.target.value) } })}
          />
        </label>
        <PctField label="Deposit interest rate pa" value={fin.depositRatePa} est={est.finance?.depositRatePa} onChange={(v) => patchFinance({ depositRatePa: v })} />
      </div>

      <h3 className="section">House price inflation</h3>
      <p className="note">
        When on, sale prices are indexed forward to each unit&apos;s sale month and the refinance valuation to PC. The
        projection agent researches current figures (ONS HPI, published 5-year forecasts) for the project&apos;s region
        and fills the rates with sources; everything stays editable.
      </p>
      <div className="grid c4">
        <label className="field">
          Apply HPI to sale prices
          <select
            value={fin.hpi.enabled ? 'yes' : 'no'}
            onChange={(e) => patchFinance({ hpi: { ...fin.hpi, enabled: e.target.value === 'yes' } })}
          >
            <option value="no">Off: prices as entered</option>
            <option value="yes">On: index by sale month</option>
          </select>
        </label>
        <label className="field">
          Region
          <input
            placeholder={project.address || 'e.g. Manchester'}
            value={fin.hpi.region ?? ''}
            onChange={(e) => patchFinance({ hpi: { ...fin.hpi, region: e.target.value } })}
          />
        </label>
        <label className="field">
          &nbsp;
          <button className="btn" onClick={runHpiAgent} disabled={hpiBusy} style={{ marginTop: 5 }}>
            {hpiBusy ? 'Researching…' : 'Project with AI'}
          </button>
        </label>
      </div>
      <div className="grid c5" style={{ maxWidth: 720 }}>
        {fin.hpi.annualPct.map((r, i) => (
          <PctField
            key={i}
            label={`Year ${i + 1}`}
            value={r}
            onChange={(v) =>
              patchFinance({ hpi: { ...fin.hpi, annualPct: fin.hpi.annualPct.map((x, j) => (j === i ? v : x)) } })
            }
          />
        ))}
      </div>
      {est.sales && est.sales.hpiAnnualPct.length === 5 && (
        <div className="est-block">
          <div className="suggest" title={est.sales.hpiRationale}>
            <span>
              → {est.sales.hpiAnnualPct.map((r) => `${(r * 100).toFixed(1)}%`).join(' / ')}
              <span className="suggest-range"> · from the sales &amp; rents research — sale suggestions are today&apos;s values, so apply this too</span>
            </span>
            <button
              className="btn mini"
              onClick={() =>
                patchFinance({
                  hpi: {
                    ...fin.hpi,
                    enabled: true,
                    annualPct: est.sales!.hpiAnnualPct,
                    region: est.sales!.address,
                    rationale: est.sales!.hpiRationale,
                    sources: est.sales!.hpiSources,
                    projectedAt: est.sales!.ranAt,
                  },
                })
              }
            >
              Apply
            </button>
          </div>
        </div>
      )}
      {hpiMsg && <div className={hpiMsg.startsWith('Projection applied') ? 'ok-box' : 'warn-box'}>{hpiMsg}</div>}
      {fin.hpi.rationale && (
        <details style={{ marginBottom: 12 }}>
          <summary style={{ fontSize: 11.5, color: 'var(--grey-text)', cursor: 'pointer' }}>
            Projection rationale &amp; sources
            {fin.hpi.projectedAt ? ` (${new Date(fin.hpi.projectedAt).toLocaleDateString('en-GB')})` : ''}
          </summary>
          <p className="note" style={{ marginTop: 6 }}>
            {fin.hpi.rationale}
          </p>
          {(fin.hpi.sources ?? []).map((s, i) => (
            <div key={i} className="assumption">
              · {s}
            </div>
          ))}
        </details>
      )}

      <h3 className="section">Equity &amp; sales</h3>
      <div className="grid c4">
        <label className="field">
          Total equity £
          <input type="number" value={spec.finance.equity.total} onChange={(e) => patchFinance({ equity: { ...spec.finance.equity, total: num(e.target.value) } })} />
        </label>
        <PctField label="Investor share" value={spec.finance.equity.investorShare} onChange={(v) => patchFinance({ equity: { ...spec.finance.equity, investorShare: v } })} />
        <PctField label="Sales agent fee" value={spec.finance.sales.agentFeePct} onChange={(v) => patchFinance({ sales: { ...spec.finance.sales, agentFeePct: v } })} />
        <label className="field">
          Sales legals £/unit
          <input type="number" value={spec.finance.sales.legalPerUnit} onChange={(e) => patchFinance({ sales: { ...spec.finance.sales, legalPerUnit: num(e.target.value) } })} />
        </label>
        <label className="field">
          Sales velocity units/month
          <input type="number" value={spec.finance.sales.velocityPerMonth} onChange={(e) => patchFinance({ sales: { ...spec.finance.sales, velocityPerMonth: num(e.target.value) } })} />
        </label>
        <PctField label="Price adjust vs GDV" value={spec.finance.sales.priceAdjust} onChange={(v) => patchFinance({ sales: { ...spec.finance.sales, priceAdjust: v } })} />
      </div>

      <h3 className="section">Profit split</h3>
      <p className="note">
        Simple split mirrors the current deals: profit × investor share, no preferred return. The waterfall pays
        investor capital back first, then a preferred return compounded monthly on drawn capital, then splits the
        residual: the structure more sophisticated investors will expect.
      </p>
      <div className="grid c4">
        <label className="field">
          Structure
          <select
            value={fin.waterfall.mode}
            onChange={(e) => patchFinance({ waterfall: { ...fin.waterfall, mode: e.target.value as 'simple' | 'waterfall' } })}
          >
            <option value="simple">Simple split (current deals)</option>
            <option value="waterfall">Waterfall: pref then split</option>
          </select>
        </label>
        {fin.waterfall.mode === 'waterfall' && (
          <>
            <PctField
              label="Preferred return pa"
              value={fin.waterfall.prefRatePa}
              onChange={(v) => patchFinance({ waterfall: { ...fin.waterfall, prefRatePa: v } })}
            />
            <PctField
              label="Investor share above pref"
              value={fin.waterfall.residualInvestorPct}
              onChange={(v) => patchFinance({ waterfall: { ...fin.waterfall, residualInvestorPct: v } })}
            />
          </>
        )}
      </div>

      <h3 className="section">Refinance / exit</h3>
      <div className="grid c4">
        <PctField label="Refinance LTV" value={spec.finance.refinance.ltv} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, ltv: v } })} />
        <PctField label="Refi interest pa" value={spec.finance.refinance.ratePa} est={est.finance?.refinanceRatePa} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.refinance.arrangementFee} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, arrangementFee: v } })} />
        <PctField label="Void allowance" value={spec.finance.refinance.voidPct} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, voidPct: v } })} />
        <PctField label="Management & opex" value={spec.finance.refinance.mgmtPct} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, mgmtPct: v } })} />
      </div>

      <h3 className="section">Development costs</h3>
      <p className="note">
        Percentage lines follow the driver shown; sales agent fees and sales legals are computed from the sales
        assumptions above. Amounts marked % of build reference line D01.
      </p>
      <DevCostTable
        lines={spec.devCosts}
        autoSdlt={sdltForFinance(fin)}
        autoSdltCode={sdltForFinance(fin) !== null ? sdltLineCodeOf(spec.devCosts) : null}
        onChange={(devCosts) => patch({ devCosts })}
      />

      <button className="btn" onClick={() => setView('options')}>
        Continue to options →
      </button>
    </div>
  );
}

function labelOf(k: string): string {
  return { commercial: 'Commercial', studio: 'Studio', bed1: '1 bed', bed2: '2 bed', bed3: '3 bed', house: 'House' }[k] ?? k;
}

const num = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);

function PctField({
  label,
  value,
  onChange,
  est,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  /** Researched suggestion shown under the input; Apply inserts the likely value. */
  est?: EstimateValue;
}) {
  return (
    <label className="field">
      {label} (%)
      <input type="number" step="0.1" value={Math.round(value * 1000) / 10} onChange={(e) => onChange(num(e.target.value) / 100)} />
      {est && <Suggestion est={est} fmt={(v) => `${(v * 100).toFixed(2)}%`} onApply={() => onChange(round4(est.likely))} />}
    </label>
  );
}

/** Rates round to basis-point precision when applied. */
const round4 = (v: number) => Math.round(v * 10000) / 10000;

/**
 * A researched suggestion beside a field: likely value, range, confidence.
 * Hovering shows the rationale; Apply inserts the likely value. Nothing is
 * ever applied without a click.
 */
function Suggestion({
  est,
  fmt,
  onApply,
  label,
}: {
  est: EstimateValue;
  fmt: (v: number) => string;
  onApply: () => void;
  label?: string;
}) {
  return (
    <div className="suggest" title={est.rationale}>
      <span>
        → {fmt(est.likely)} <span className="suggest-range">({fmt(est.low)}–{fmt(est.high)}, {est.confidence})</span>
        {label ? <span className="suggest-range"> · {label}</span> : null}
      </span>
      <button className="btn mini" onClick={onApply}>
        Apply
      </button>
    </div>
  );
}

/** Collapsible rationale + sources for a group of estimates. */
function EvidenceDetails({ title, entries }: { title: string; entries: { label: string; value: EstimateValue }[] }) {
  return (
    <details style={{ marginBottom: 12 }}>
      <summary style={{ fontSize: 11.5, color: 'var(--grey-text)', cursor: 'pointer' }}>{title}</summary>
      {entries.map((e, i) => (
        <div key={i} style={{ marginTop: 6 }}>
          <div className="assumption" style={{ fontWeight: 600 }}>
            {e.label} — {e.value.confidence} confidence
          </div>
          {e.value.rationale && <p className="note" style={{ margin: '2px 0 2px 10px' }}>{e.value.rationale}</p>}
          {e.value.sources.map((s, j) => (
            <div key={j} className="assumption" style={{ marginLeft: 10 }}>
              · {s}
            </div>
          ))}
        </div>
      ))}
    </details>
  );
}

/** " (stale)" marker for a group's Estimate button once research has aged. */
function staleTag(ranAt: string | undefined): string {
  if (!ranAt) return '';
  return isStale(ranAt) ? ' (stale)' : '';
}

const KIND_LABEL: Record<DevCostLine['kind'], string> = {
  fixed: '£ fixed',
  pctPurchase: '% of purchase',
  pctBuild: '% of build',
  perUnit: '£ per unit',
  pctGDV: '% of GDV',
  salesLegalPerUnit: '£/unit (from sales)',
};

function DevCostTable({
  lines,
  onChange,
  autoSdlt,
  autoSdltCode,
}: {
  lines: DevCostLine[];
  onChange: (l: DevCostLine[]) => void;
  /** Computed SDLT when the regime is automatic; null in manual mode. */
  autoSdlt: number | null;
  /** The one line the automatic figure applies to (engine's first-match rule). */
  autoSdltCode: string | null;
}) {
  const groups: { key: DevCostLine['group']; title: string }[] = [
    { key: 'legals', title: '(B) Legals & acquisition' },
    { key: 'professional', title: '(C) Professional fees' },
    { key: 'construction', title: '(D) Development / construction' },
    { key: 'duringConstruction', title: '(E) During construction' },
    { key: 'postConstruction', title: '(F) Post construction' },
    { key: 'salesMarketing', title: '(G) Sales & marketing' },
    { key: 'other', title: '(H) Other / SPV running' },
  ];
  function setLine(code: string, value: number) {
    onChange(lines.map((l) => (l.code === code ? { ...l, value } : l)));
  }
  return (
    <>
      {groups.map((g) => (
        <div key={g.key}>
          <h3 className="section" style={{ marginTop: 18 }}>
            {g.title}
          </h3>
          <table className="data" style={{ maxWidth: 720 }}>
            <tbody>
              {lines
                .filter((l) => l.group === g.key)
                .map((l) => (
                  <tr key={l.code}>
                    <td style={{ width: 50, color: 'var(--grey-mid)' }}>{l.code}</td>
                    <td>{l.label}</td>
                    <td style={{ width: 130, color: 'var(--grey-text)', fontSize: 11 }}>{KIND_LABEL[l.kind]}</td>
                    <td className="num" style={{ width: 120 }}>
                      {autoSdlt !== null && l.code === autoSdltCode ? (
                        <span style={{ color: 'var(--grey-mid)' }} title="Computed from HMRC bands; switch the stamp duty selector to Manual to type a figure.">
                          auto: {fmtGBP(autoSdlt)}
                        </span>
                      ) : l.kind === 'salesLegalPerUnit' || (l.kind === 'pctGDV' && l.value === 0) ? (
                        <span style={{ color: 'var(--grey-mid)' }}>auto</span>
                      ) : (
                        <input
                          type="number"
                          step={l.kind.startsWith('pct') ? 0.001 : 1}
                          value={l.value}
                          onChange={(e) => setLine(l.code, num(e.target.value))}
                        />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}
