// Settings: how the app authenticates to Claude for floorplan reading, and
// the editable NDSS ruleset that governs compliance validation.

import { useCallback, useEffect, useState } from 'react';
import type { AuthStatus } from '../../electron/preload';
import { useStore } from '../state/store';
import type { CalibrationRecords, TenderRecord, TermSheetRecord, UnitTypeKey } from '../core/types';
import { DEFAULT_RULES } from '../core/rules';

/** One line describing the credential a request would actually use. */
function sourceLabel(status: AuthStatus): string {
  switch (status.source) {
    case 'stored-key':
      return 'Using the API key saved in this app';
    case 'env-key':
      return 'Using ANTHROPIC_API_KEY from the environment';
    case 'env-token':
      return 'Using ANTHROPIC_AUTH_TOKEN from the environment';
    case 'claude-login':
      return status.login?.email
        ? `Signed in to Claude as ${status.login.email}${status.login.organisation ? ` (${status.login.organisation})` : ''}`
        : 'Signed in to Claude';
    default:
      return 'Not connected to Claude yet';
  }
}

export default function SettingsView() {
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refreshAuth = useCallback(async () => {
    setAuth(await window.satis.authStatus());
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  async function signIn() {
    setMsg(null);
    setBusy(
      auth?.cli.available
        ? 'Waiting for you to finish signing in in your browser…'
        : 'Fetching the sign-in tool, then opening your browser… the download runs once and takes a moment.',
    );
    const res = await window.satis.authSignIn();
    setBusy(null);
    setMsg({ ok: res.ok, text: res.message });
    await refreshAuth();
  }

  async function saveKey() {
    const key = keyInput.trim();
    await window.satis.authSetKey(key);
    setKeyInput('');
    await refreshAuth();
    setMsg({
      ok: true,
      text: key
        ? 'API key saved. Press Test connection to check it works.'
        : 'API key removed from this app.',
    });
  }

  async function test() {
    setMsg(null);
    setBusy('Testing the connection…');
    const res = await window.satis.authTest();
    setBusy(null);
    setMsg({ ok: res.ok, text: res.message });
  }

  const minima = rules.unitMinimumGia;

  return (
    <div>
      <div className="page-title">Settings</div>

      <h3 className="section">Claude access for floorplan reading</h3>
      <p className="note">
        PDF and image floorplans are read by Claude. You can either sign in with your Claude account or paste an
        Anthropic API key, whichever you have. Credentials stay on this machine and are only used for floorplan
        extraction. DXF import and manual floor entry work without either.
      </p>

      {auth && (
        <div className={auth.ready ? 'ok-box' : 'warn-box'}>
          <div>
            <span className={`badge ${auth.ready ? 'pass' : 'fail'}`} style={{ marginRight: 8 }}>
              {auth.ready ? 'Connected' : 'Not connected'}
            </span>
            {sourceLabel(auth)}
          </div>
          {auth.shadowed && (
            <div style={{ marginTop: 6 }}>
              You are also signed in to Claude, but an API key takes precedence. Remove the key (save an empty key
              below) to use the sign-in instead.
            </div>
          )}
          {auth.login?.expired && !auth.login.refreshable && (
            <div style={{ marginTop: 6 }}>Your Claude sign-in has expired. Sign in again to renew it.</div>
          )}
          {auth.storedKey && !auth.keychain && (
            <div style={{ marginTop: 6 }}>
              This system has no keychain available, so the saved key is held in a file readable only by your user
              account rather than encrypted.
            </div>
          )}
        </div>
      )}

      <h4 className="subsection">Sign in with your Claude account</h4>
      <p className="note">
        Opens your browser to sign in, then hands the app a token it refreshes on its own. No key to copy, and nothing
        to re-enter later. The sign-in itself is handled by the Anthropic command-line tool; if it is not already on
        this machine the app downloads it automatically the first time you sign in, verifying it against a published
        checksum. There is nothing to install by hand.
      </p>
      <div style={{ marginBottom: 14 }}>
        <button className="btn" onClick={signIn} disabled={!!busy}>
          {auth?.login ? 'Sign in again' : 'Sign in with Claude'}
        </button>
        <button className="btn ghost" onClick={() => window.satis.authOpenLink('cli-install')}>
          Installing the Anthropic CLI
        </button>
      </div>
      {auth && !auth.cli.available && (
        <p className="note">
          {auth.cli.conflict
            ? `${auth.cli.conflict} Signing in from here still works: the app fetches its own copy of the Anthropic CLI when you press the button.`
            : 'The Anthropic sign-in tool is not on this machine yet. It will be downloaded automatically when you press Sign in with Claude; installing it yourself (link above) also works, as does pasting an API key below.'}
        </p>
      )}
      {auth?.login && (
        <p className="note">
          Signing out is handled by the CLI rather than this app, because the same sign-in is shared with other
          Anthropic tools. Run &quot;ant auth logout&quot; in a terminal to sign out everywhere.
        </p>
      )}

      <h4 className="subsection">Or use an Anthropic API key</h4>
      <div className="grid c2">
        <label className="field">
          Anthropic API key {auth?.storedKey ? '(saved)' : '(not saved)'}
          <input
            type="password"
            placeholder={
              auth?.storedKey ? '•••••••••••••••• (enter a new key to replace, or save empty to remove)' : 'sk-ant-…'
            }
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
        </label>
        <label className="field">
          &nbsp;
          <span style={{ display: 'block', marginTop: 5 }}>
            <button className="btn" onClick={saveKey}>
              Save key
            </button>
            <button className="btn ghost" onClick={() => window.satis.authOpenLink('console-keys')}>
              Create a key
            </button>
          </span>
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <button className="btn ghost" onClick={test} disabled={!!busy || !auth?.ready}>
          Test connection
        </button>
        <button className="btn ghost" onClick={() => void refreshAuth()} disabled={!!busy}>
          Recheck
        </button>
      </div>
      {busy && <div className="ok-box">{busy}</div>}
      {msg && <div className={msg.ok ? 'ok-box' : 'warn-box'}>{msg.text}</div>}
      {auth && !auth.envKey && !auth.envToken && (
        <p className="note">
          ANTHROPIC_API_KEY is also picked up when it is set. On Mac and Linux a variable set in your shell profile is
          only visible to this app when the app is launched from a terminal, so saving the key above is the reliable
          route.
        </p>
      )}

      <h3 className="section">NDSS ruleset: minimum unit sizes (sqm)</h3>
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
              <td>{k.replace('_', ', ').replace('p', ' person')}</td>
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

      <CalibrationSection />

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

// ---------------------------------------------------------------------------
// Calibration records: the developer's own tender results and lender term
// sheets. Kept in app settings (shared across every project) and fed to the
// pricing estimate agents as the strongest available anchor.
// ---------------------------------------------------------------------------

const newId = () => `cal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const numOr = (v: string, fallback = 0) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : fallback);

function CalibrationSection() {
  const [cal, setCal] = useState<CalibrationRecords | null>(null);

  useEffect(() => {
    void (async () => {
      const loaded = (await window.satis.calibrationLoad()) as CalibrationRecords;
      setCal({ tenders: loaded?.tenders ?? [], termSheets: loaded?.termSheets ?? [] });
    })();
  }, []);

  function save(next: CalibrationRecords) {
    setCal(next);
    void window.satis.calibrationSave(JSON.stringify(next));
  }

  if (!cal) return null;

  return (
    <>
      <h3 className="section">Pricing estimate calibration</h3>
      <p className="note">
        Your own market evidence, shared across every project. The pricing estimate agents anchor to these: tender
        results calibrate the build cost £/sqft, and lender term sheets calibrate the finance rates to what lenders
        actually quote you. Records stay on this machine and are only ever sent to Claude as part of an estimate run
        you start.
      </p>

      <h4 className="subsection">Tender results (build cost £/sqft, all-in contract)</h4>
      <table className="data" style={{ maxWidth: 820 }}>
        <thead>
          <tr>
            <th>Project</th>
            <th>Date</th>
            <th>Region</th>
            <th className="num">£/sqft</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cal.tenders.map((t) => (
            <tr key={t.id}>
              <td>
                <input value={t.projectName} onChange={(e) => save({ ...cal, tenders: cal.tenders.map((x) => (x.id === t.id ? { ...x, projectName: e.target.value } : x)) })} />
              </td>
              <td style={{ width: 120 }}>
                <input type="month" value={t.date} onChange={(e) => save({ ...cal, tenders: cal.tenders.map((x) => (x.id === t.id ? { ...x, date: e.target.value } : x)) })} />
              </td>
              <td>
                <input value={t.region} onChange={(e) => save({ ...cal, tenders: cal.tenders.map((x) => (x.id === t.id ? { ...x, region: e.target.value } : x)) })} />
              </td>
              <td className="num" style={{ width: 90 }}>
                <input type="number" value={t.psf} onChange={(e) => save({ ...cal, tenders: cal.tenders.map((x) => (x.id === t.id ? { ...x, psf: numOr(e.target.value) } : x)) })} />
              </td>
              <td>
                <input value={t.notes} onChange={(e) => save({ ...cal, tenders: cal.tenders.map((x) => (x.id === t.id ? { ...x, notes: e.target.value } : x)) })} />
              </td>
              <td style={{ width: 70 }}>
                <button className="btn ghost mini" onClick={() => save({ ...cal, tenders: cal.tenders.filter((x) => x.id !== t.id) })}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn ghost"
        onClick={() =>
          save({
            ...cal,
            tenders: [
              ...cal.tenders,
              { id: newId(), projectName: '', date: new Date().toISOString().slice(0, 7), region: '', psf: 0, notes: '' } satisfies TenderRecord,
            ],
          })
        }
      >
        Add tender result
      </button>

      <h4 className="subsection">Lender term sheets</h4>
      <table className="data" style={{ maxWidth: 960 }}>
        <thead>
          <tr>
            <th>Lender</th>
            <th>Date</th>
            <th>Product</th>
            <th className="num">Rate % pa</th>
            <th className="num">Fee %</th>
            <th className="num">LTV %</th>
            <th className="num">Loan £</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cal.termSheets.map((t) => (
            <tr key={t.id}>
              <td>
                <input value={t.lender} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, lender: e.target.value } : x)) })} />
              </td>
              <td style={{ width: 120 }}>
                <input type="month" value={t.date} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, date: e.target.value } : x)) })} />
              </td>
              <td style={{ width: 120 }}>
                <select value={t.product} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, product: e.target.value as TermSheetRecord['product'] } : x)) })}>
                  <option value="bridge">Bridge</option>
                  <option value="devLoan">Dev loan</option>
                  <option value="vatLoan">VAT loan</option>
                  <option value="refinance">Refinance</option>
                </select>
              </td>
              <td className="num" style={{ width: 80 }}>
                <input type="number" step="0.05" value={Math.round(t.ratePa * 10000) / 100} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, ratePa: numOr(e.target.value) / 100 } : x)) })} />
              </td>
              <td className="num" style={{ width: 70 }}>
                <input type="number" step="0.05" value={Math.round(t.arrangementFee * 10000) / 100} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, arrangementFee: numOr(e.target.value) / 100 } : x)) })} />
              </td>
              <td className="num" style={{ width: 70 }}>
                <input type="number" step="1" value={Math.round(t.ltv * 100)} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, ltv: numOr(e.target.value) / 100 } : x)) })} />
              </td>
              <td className="num" style={{ width: 110 }}>
                <input type="number" value={t.loanSize} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, loanSize: numOr(e.target.value) } : x)) })} />
              </td>
              <td>
                <input value={t.notes} onChange={(e) => save({ ...cal, termSheets: cal.termSheets.map((x) => (x.id === t.id ? { ...x, notes: e.target.value } : x)) })} />
              </td>
              <td style={{ width: 70 }}>
                <button className="btn ghost mini" onClick={() => save({ ...cal, termSheets: cal.termSheets.filter((x) => x.id !== t.id) })}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn ghost"
        onClick={() =>
          save({
            ...cal,
            termSheets: [
              ...cal.termSheets,
              {
                id: newId(),
                lender: '',
                date: new Date().toISOString().slice(0, 7),
                product: 'bridge',
                ratePa: 0.1,
                arrangementFee: 0.02,
                ltv: 0.65,
                loanSize: 0,
                notes: '',
              } satisfies TermSheetRecord,
            ],
          })
        }
      >
        Add term sheet
      </button>
    </>
  );
}
