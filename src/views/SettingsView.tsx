// Settings: Anthropic API key for AI floorplan extraction, and the editable
// NDSS ruleset that governs compliance validation.

import { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import type { UnitTypeKey } from '../core/types';
import { DEFAULT_RULES } from '../core/rules';

export default function SettingsView() {
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const [hasKey, setHasKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    window.satis.aiHasKey().then(setHasKey);
  }, []);

  async function saveKey() {
    await window.satis.aiSetKey(keyInput.trim());
    setHasKey(!!keyInput.trim());
    setKeyInput('');
    setMsg(keyInput.trim() ? 'API key stored (encrypted with your OS keychain where available).' : 'API key removed.');
  }

  const minima = rules.unitMinimumGia;

  return (
    <div>
      <div className="page-title">Settings</div>

      <h3 className="section">AI floorplan reading</h3>
      <p className="note">
        PDF and image floorplans are interpreted by Claude (Anthropic). The key is stored locally on this machine and
        used only for extraction requests. DXF import and manual entry work without a key.
      </p>
      <div className="grid c2">
        <label className="field">
          Anthropic API key {hasKey ? '— configured ✓' : '— not configured'}
          <input
            type="password"
            placeholder={hasKey ? '•••••••••••••••• (enter new key to replace, empty to remove)' : 'sk-ant-…'}
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
        </label>
        <label className="field">
          &nbsp;
          <button className="btn" onClick={saveKey} style={{ marginTop: 5 }}>
            Save key
          </button>
        </label>
      </div>
      {msg && <div className="ok-box">{msg}</div>}

      <h3 className="section">NDSS ruleset — minimum unit sizes (sqm)</h3>
      <p className="note">
        Defaults follow the UK Nationally Described Space Standard (2015) plus common building-regs-derived rules.
        Edits apply to newly generated options. Planning matters (permitted development, Class MA, fire strategy,
        external amenity) are out of scope and flagged as risks, never claimed compliant.
      </p>
      <table className="data" style={{ maxWidth: 480 }}>
        <thead>
          <tr>
            <th>Unit type</th>
            <th className="num">Minimum GIA (sqm)</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(minima) as UnitTypeKey[]).map((k) => (
            <tr key={k}>
              <td>{k.replace('_', ' — ').replace('p', ' person')}</td>
              <td className="num">
                <input
                  type="number"
                  value={minima[k]}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      unitMinimumGia: { ...minima, [k]: parseFloat(e.target.value) || minima[k] },
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="grid c3">
        <label className="field">
          Corridor min width (m)
          <input
            type="number"
            step="0.1"
            value={rules.circulation.corridorMinWidth}
            onChange={(e) =>
              setRules({
                ...rules,
                circulation: { ...rules.circulation, corridorMinWidth: parseFloat(e.target.value) || 1.2 },
              })
            }
          />
        </label>
        <label className="field">
          Double bedroom min area (sqm)
          <input
            type="number"
            step="0.5"
            value={rules.bedrooms.doubleMinArea}
            onChange={(e) =>
              setRules({ ...rules, bedrooms: { ...rules.bedrooms, doubleMinArea: parseFloat(e.target.value) || 11.5 } })
            }
          />
        </label>
        <label className="field">
          Target net:gross
          <input
            type="number"
            step="0.01"
            value={rules.efficiency.targetNetToGross}
            onChange={(e) =>
              setRules({ ...rules, efficiency: { targetNetToGross: parseFloat(e.target.value) || 0.83 } })
            }
          />
        </label>
      </div>
      <button className="btn ghost" onClick={() => setRules(JSON.parse(JSON.stringify(DEFAULT_RULES)))}>
        Reset ruleset to NDSS defaults
      </button>

      <h3 className="section">About</h3>
      <p className="note">
        Satis Appraisal generates residential conversion options from building floorplans, validates them against the
        NDSS ruleset, and runs a full DCF development appraisal (bridge + development loan, four exit scenarios,
        sensitivity) mirroring the Satis Appraisal Model workbook. Outputs are feasibility schematics and financial
        estimates, not architecture or advice.
      </p>
    </div>
  );
}
