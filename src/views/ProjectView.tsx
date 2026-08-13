// Step 1 — Building: project meta, floorplan import (AI / DXF / manual) and
// per-floor envelope review.

import { useState } from 'react';
import type { Envelope, Project } from '../core/types';
import { polyArea } from '../core/layout';
import { useStore } from '../state/store';
import { parseDxfToEnvelope } from '../dxf';

interface AiFloor {
  floor: string;
  use: Envelope['use'];
  envelope: [number, number][];
  cores: Envelope['cores'];
  windows: Envelope['windows'];
  assumptions: string[];
}

interface AiResult {
  floors: AiFloor[];
  scaleBasis: string;
  warnings: string[];
}

export default function ProjectView() {
  const project = useStore((s) => s.project);
  const setProjectMeta = useStore((s) => s.setProjectMeta);
  const upsertFloor = useStore((s) => s.upsertFloor);
  const removeFloor = useStore((s) => s.removeFloor);
  const setBusy = useStore((s) => s.setBusy);
  const busy = useStore((s) => s.busy);
  const setView = useStore((s) => s.setView);

  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

  async function importPlans() {
    setError(null);
    setAiNotes([]);
    const files = await window.satis.openFloorplanFiles();
    if (!files.length) return;
    for (const f of files) {
      if (f.ext === 'dxf') {
        try {
          const env = parseDxfToEnvelope(f.content, nextFloorLabel(project!));
          upsertFloor(env);
        } catch (e) {
          setError(`DXF ${f.name}: ${(e as Error).message}`);
        }
      } else {
        // PDF / image -> AI extraction
        try {
          const hasKey = await window.satis.aiHasKey();
          if (!hasKey) {
            setError(
              'No Anthropic API key configured — add one in Settings, or trace the plan manually with "Add floor".',
            );
            continue;
          }
          setBusy(`Reading ${f.name} with AI…`);
          const result = (await window.satis.aiExtract({ name: f.name, ext: f.ext, base64: f.content })) as AiResult;
          for (const fl of result.floors) {
            upsertFloor({
              id: `ai-${fl.floor}-${Math.random().toString(36).slice(2, 8)}`,
              floor: fl.floor,
              use: fl.use,
              envelope: fl.envelope,
              cores: fl.cores ?? [],
              windows: fl.windows ?? [],
              assumptions: fl.assumptions ?? [],
            });
          }
          setAiNotes([
            `Scale basis: ${result.scaleBasis}`,
            ...result.warnings.map((w) => `Warning: ${w}`),
            'Review each floor’s dimensions below and confirm before generating options — a wrong scale invalidates everything.',
          ]);
        } catch (e) {
          setError(`${f.name}: ${(e as Error).message}`);
        } finally {
          setBusy(null);
        }
      }
    }
  }

  async function exportProjectFile() {
    await window.satis.saveProject(JSON.stringify(project, null, 2), project!.name.replace(/\s+/g, '_'));
  }

  return (
    <div>
      <div className="page-title">
        Building &amp; floorplans
        <span className="hint">Import plans, review the extracted geometry, then move to Pricing</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button className="btn" onClick={importPlans} disabled={!!busy}>
          {busy ? 'Working…' : 'Import floorplans'}
        </button>
        <button className="btn ghost" onClick={() => upsertFloor(blankFloor(project))}>
          Add floor manually
        </button>
        <button className="btn ghost" onClick={exportProjectFile}>
          Export project file
        </button>
      </div>
      <p className="note">
        PDF and image plans are interpreted with AI (API key in Settings) — always confirm the extracted dimensions.
        DXF files are parsed directly. Envelopes are schematic: rectangle-based feasibility geometry, not architecture.
      </p>

      {error && <div className="warn-box">{error}</div>}
      {aiNotes.length > 0 && <div className="ok-box">{aiNotes.map((n, i) => <div key={i}>{n}</div>)}</div>}

      <h3 className="section">Scheme</h3>
      <div className="grid c3">
        <label className="field">
          Scheme name
          <input value={project.name} onChange={(e) => setProjectMeta({ name: e.target.value })} />
        </label>
        <label className="field">
          Address
          <input value={project.address} onChange={(e) => setProjectMeta({ address: e.target.value })} />
        </label>
        <label className="field">
          Listed / conservation area
          <select
            value={project.listedOrConservation ? 'yes' : 'no'}
            onChange={(e) => setProjectMeta({ listedOrConservation: e.target.value === 'yes' })}
          >
            <option value="no">No</option>
            <option value="yes">Yes — flag window alterations</option>
          </select>
        </label>
      </div>
      {project.listedOrConservation && (
        <div className="warn-box">
          Listed / conservation status: window alterations may not be possible. Options assume retained openings only.
        </div>
      )}

      <h3 className="section">Floors ({project.floors.length})</h3>
      {project.floors.length === 0 ? (
        <div className="empty-state">
          No floors captured yet.
          <br />
          Import floorplans (PDF, image or DXF) or add a floor manually.
        </div>
      ) : (
        project.floors.map((f) => (
          <FloorEditor key={f.id} floor={f} onChange={upsertFloor} onRemove={() => removeFloor(f.id)} />
        ))
      )}

      {project.floors.length > 0 && (
        <button className="btn" onClick={() => setView('pricing')}>
          Continue to pricing →
        </button>
      )}
    </div>
  );
}

function nextFloorLabel(project: Project): string {
  const labels = new Set(project.floors.map((f) => f.floor));
  if (!labels.has('G')) return 'G';
  for (let i = 1; i < 20; i++) if (!labels.has(String(i))) return String(i);
  return `${project.floors.length}`;
}

function blankFloor(project: Project): Envelope {
  return {
    id: `manual-${Math.random().toString(36).slice(2, 8)}`,
    floor: nextFloorLabel(project),
    use: 'unknown',
    envelope: [
      [0, 0],
      [24, 0],
      [24, 12],
      [0, 12],
    ],
    cores: [{ type: 'stair', poly: [[10.5, 5.4], [13.5, 5.4], [13.5, 7.8], [10.5, 7.8]] }],
    windows: [
      ...[2, 5, 8, 11, 14, 17, 20, 22].map((x) => ({ x, side: 'front' as const })),
      ...[2, 5, 8, 11, 14, 17, 20, 22].map((x) => ({ x, side: 'rear' as const })),
    ],
    assumptions: ['Manually entered envelope'],
  };
}

function FloorEditor({
  floor,
  onChange,
  onRemove,
}: {
  floor: Envelope;
  onChange: (f: Envelope) => void;
  onRemove: () => void;
}) {
  const [x0, y0, x1, y1] = boundsOf(floor.envelope);
  const W = x1 - x0;
  const D = y1 - y0;
  const gia = polyArea(floor.envelope);
  const frontWins = floor.windows.filter((w) => w.side === 'front').length;
  const rearWins = floor.windows.filter((w) => w.side === 'rear').length;
  const hasCore = floor.cores.length > 0;

  function setRect(w: number, d: number) {
    if (!(w > 3) || !(d > 3)) return;
    onChange({
      ...floor,
      envelope: [
        [0, 0],
        [w, 0],
        [w, d],
        [0, d],
      ],
      cores: floor.cores.map((c) => ({
        ...c,
        poly: centreCore(w, d),
      })),
      windows: floor.windows.filter((win) => win.x <= w - 0.5),
    });
  }

  function setWindows(front: number, rear: number) {
    const spread = (n: number, side: 'front' | 'rear') =>
      Array.from({ length: Math.max(0, n) }, (_, i) => ({
        x: Math.round(((i + 0.5) * (W / Math.max(1, n))) * 100) / 100,
        side,
      }));
    onChange({ ...floor, windows: [...spread(front, 'front'), ...spread(rear, 'rear')] });
  }

  function toggleCore(on: boolean) {
    onChange({ ...floor, cores: on ? [{ type: 'stair', poly: centreCore(W, D) }] : [] });
  }

  return (
    <div className="floor-block">
      <div className="floor-head">
        <h4>Floor {floor.floor}</h4>
        <span style={{ fontSize: 11.5, color: 'var(--grey-text)' }}>
          {W.toFixed(1)}m × {D.toFixed(1)}m · GIA {gia.toFixed(0)} sqm
        </span>
      </div>
      <div className="grid c4">
        <label className="field">
          Floor label
          <input value={floor.floor} onChange={(e) => onChange({ ...floor, floor: e.target.value })} />
        </label>
        <label className="field">
          Existing use
          <select value={floor.use} onChange={(e) => onChange({ ...floor, use: e.target.value as Envelope['use'] })}>
            <option value="unknown">Unknown</option>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label className="field">
          Width (m, long axis)
          <input type="number" step="0.5" value={round1(W)} onChange={(e) => setRect(parseFloat(e.target.value), D)} />
        </label>
        <label className="field">
          Depth (m)
          <input type="number" step="0.5" value={round1(D)} onChange={(e) => setRect(W, parseFloat(e.target.value))} />
        </label>
      </div>
      <div className="grid c4">
        <label className="field">
          Windows — front facade
          <input type="number" min={0} value={frontWins} onChange={(e) => setWindows(parseInt(e.target.value || '0', 10), rearWins)} />
        </label>
        <label className="field">
          Windows — rear facade
          <input type="number" min={0} value={rearWins} onChange={(e) => setWindows(frontWins, parseInt(e.target.value || '0', 10))} />
        </label>
        <label className="field">
          Central stair core
          <select value={hasCore ? 'yes' : 'no'} onChange={(e) => toggleCore(e.target.value === 'yes')}>
            <option value="yes">Retained (3.0 × 2.4m)</option>
            <option value="no">None</option>
          </select>
        </label>
        <label className="field">
          &nbsp;
          <button className="btn ghost small" onClick={onRemove} style={{ marginTop: 5 }}>
            Remove floor
          </button>
        </label>
      </div>
      {(floor.assumptions?.length ?? 0) > 0 && (
        <details>
          <summary style={{ fontSize: 11, color: 'var(--grey-text)', cursor: 'pointer' }}>
            Extraction assumptions ({floor.assumptions!.length})
          </summary>
          {floor.assumptions!.map((a, i) => (
            <div key={i} className="assumption">
              — {a}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

const round1 = (v: number) => Math.round(v * 10) / 10;

function boundsOf(poly: [number, number][]): [number, number, number, number] {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function centreCore(w: number, d: number): [number, number][] {
  const cw = 3.0;
  const cd = 2.4;
  const cx = w / 2;
  const cy = d / 2;
  return [
    [round1(cx - cw / 2), round1(cy - cd / 2)],
    [round1(cx + cw / 2), round1(cy - cd / 2)],
    [round1(cx + cw / 2), round1(cy + cd / 2)],
    [round1(cx - cw / 2), round1(cy + cd / 2)],
  ];
}
