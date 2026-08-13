// Step 2 — Pricing: sale/rent rates, build programme, finance parameters and
// development cost lines, with save/load of named presets.

import { useState } from 'react';
import type { DevCostLine, PricingSpec, RoomRates } from '../core/types';
import { normalizePricing } from '../core/pricing';
import { useStore } from '../state/store';

export default function PricingView() {
  const project = useStore((s) => s.project);
  const setPricing = useStore((s) => s.setPricing);
  const setView = useStore((s) => s.setView);
  const spec = project.pricing;
  const [msg, setMsg] = useState<string | null>(null);

  const patch = (p: Partial<PricingSpec>) => setPricing({ ...spec, ...p });
  const patchFinance = (p: Partial<PricingSpec['finance']>) => patch({ finance: { ...spec.finance, ...p } });

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
          {(Object.keys(spec.rates) as (keyof PricingSpec['rates'])[]).map((k) => (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="section">Build cost — £/sqft by room type</h3>
      <p className="note">
        With room-type rates on, the build cost (dev cost line D01) is computed from each option's actual room areas —
        kitchens/living, bedrooms, bathrooms, halls, common circulation and retained commercial — so denser layouts
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
      </div>

      <h3 className="section">Bridging loan — site purchase</h3>
      <div className="grid c4">
        <PctField label="LTV on purchase" value={spec.finance.bridge.ltv} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, ltv: v } })} />
        <PctField label="Interest rate pa" value={spec.finance.bridge.ratePa} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.bridge.arrangementFee} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, arrangementFee: v } })} />
        <PctField label="Exit fee" value={spec.finance.bridge.exitFee} onChange={(v) => patchFinance({ bridge: { ...spec.finance.bridge, exitFee: v } })} />
      </div>

      <h3 className="section">Development loan</h3>
      <div className="grid c4">
        <PctField label="Interest rate pa" value={spec.finance.devLoan.ratePa} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.devLoan.arrangementFee} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, arrangementFee: v } })} />
        <PctField label="Exit fee" value={spec.finance.devLoan.exitFee} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, exitFee: v } })} />
        <PctField label="Max LTGDV covenant" value={spec.finance.devLoan.maxLtgdv} onChange={(v) => patchFinance({ devLoan: { ...spec.finance.devLoan, maxLtgdv: v } })} />
      </div>

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

      <h3 className="section">Refinance / exit</h3>
      <div className="grid c4">
        <PctField label="Refinance LTV" value={spec.finance.refinance.ltv} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, ltv: v } })} />
        <PctField label="Refi interest pa" value={spec.finance.refinance.ratePa} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, ratePa: v } })} />
        <PctField label="Arrangement fee" value={spec.finance.refinance.arrangementFee} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, arrangementFee: v } })} />
        <PctField label="Void allowance" value={spec.finance.refinance.voidPct} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, voidPct: v } })} />
        <PctField label="Management & opex" value={spec.finance.refinance.mgmtPct} onChange={(v) => patchFinance({ refinance: { ...spec.finance.refinance, mgmtPct: v } })} />
      </div>

      <h3 className="section">Development costs</h3>
      <p className="note">
        Percentage lines follow the driver shown; sales agent fees and sales legals are computed from the sales
        assumptions above. Amounts marked % of build reference line D01.
      </p>
      <DevCostTable lines={spec.devCosts} onChange={(devCosts) => patch({ devCosts })} />

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

function PctField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="field">
      {label} (%)
      <input type="number" step="0.1" value={Math.round(value * 1000) / 10} onChange={(e) => onChange(num(e.target.value) / 100)} />
    </label>
  );
}

const KIND_LABEL: Record<DevCostLine['kind'], string> = {
  fixed: '£ fixed',
  pctPurchase: '% of purchase',
  pctBuild: '% of build',
  perUnit: '£ per unit',
  pctGDV: '% of GDV',
  salesLegalPerUnit: '£/unit (from sales)',
};

function DevCostTable({ lines, onChange }: { lines: DevCostLine[]; onChange: (l: DevCostLine[]) => void }) {
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
                      {l.kind === 'salesLegalPerUnit' || (l.kind === 'pctGDV' && l.value === 0) ? (
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
