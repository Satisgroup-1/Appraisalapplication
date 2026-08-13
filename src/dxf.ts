// DXF -> Envelope extraction. Port of the skill's parse_dxf.py heuristics:
// - the largest closed LWPOLYLINE is the envelope
// - closed polylines on STAIR/LIFT/CORE layers become cores
// - entities on WIN* layers become window positions, assigned to the nearest
//   of the front (min-y) or rear (max-y) facade.

import DxfParser from 'dxf-parser';
import type { Core, Envelope, WindowPos } from './core/types';
import { polyArea } from './core/layout';

export function parseDxfToEnvelope(text: string, floorLabel: string, mm = false): Envelope {
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);
  if (!dxf) throw new Error('Could not parse DXF file.');
  const scale = mm ? 0.001 : 1;

  const polys: [number, number][][] = [];
  const cores: Core[] = [];
  const rawWindows: { x: number; y: number }[] = [];

  for (const e of dxf.entities ?? []) {
    const layer = ((e as { layer?: string }).layer ?? '').toUpperCase();
    if (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') {
      const ent = e as unknown as { vertices?: { x: number; y: number }[]; shape?: boolean; closed?: boolean };
      const verts = ent.vertices ?? [];
      const closed = ent.shape || ent.closed;
      if (!closed || verts.length < 3) continue;
      const pts: [number, number][] = verts.map((v) => [v.x * scale, v.y * scale]);
      if (['STAIR', 'LIFT', 'CORE'].some((k) => layer.includes(k))) {
        cores.push({
          type: layer.includes('STAIR') ? 'stair' : 'core',
          poly: pts.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]),
        });
      } else {
        polys.push(pts);
      }
    } else if (layer.includes('WIN')) {
      if (e.type === 'INSERT') {
        const ins = e as unknown as { position?: { x: number; y: number } };
        if (ins.position) rawWindows.push({ x: ins.position.x * scale, y: ins.position.y * scale });
      } else if (e.type === 'LINE') {
        const ln = e as unknown as { vertices?: { x: number; y: number }[] };
        const v = ln.vertices ?? [];
        if (v.length >= 2) {
          rawWindows.push({ x: ((v[0].x + v[1].x) / 2) * scale, y: ((v[0].y + v[1].y) / 2) * scale });
        }
      }
    }
  }

  if (!polys.length) throw new Error('No closed polyline found for the envelope.');
  const envelope = polys.reduce((best, p) => (polyArea(p) > polyArea(best) ? p : best));
  const ys = envelope.map((p) => p[1]);
  const ymid = (Math.min(...ys) + Math.max(...ys)) / 2;

  const windows: WindowPos[] = rawWindows.map((w) => ({
    x: Math.round(w.x * 100) / 100,
    side: w.y < ymid ? 'front' : 'rear',
  }));

  return {
    id: `dxf-${floorLabel}-${Math.random().toString(36).slice(2, 8)}`,
    floor: floorLabel,
    use: 'unknown',
    envelope: envelope.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]),
    cores,
    windows,
    assumptions: [`Parsed from DXF (units assumed ${mm ? 'millimetres' : 'metres'}); review before planning.`],
  };
}
