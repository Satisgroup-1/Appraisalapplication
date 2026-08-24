// Schematic SVG floorplan renderer. Port of the skill's render_svg.py,
// restyled to the Satis brand: monochrome — black #191510-ish ink on white,
// greys from #ced1d2 — Work Sans type, letterspaced small caps for labels.

import type { Envelope, FloorPlanResult } from './types';

const SCALE = 28; // px per metre
const PAD = 60;

// Warm paper tints per unit label (Satis surface palette derivatives).
const TYPE_FILL: Record<string, string> = {
  Studio: '#f8f5ef',
  '1 bed': '#f3eee4',
  '2 bed': '#ece5d6',
  '3 bed': '#e2d9c5',
  House: '#ece5d6',
};
const INK = '#161616';
const MUTED = '#616568';
const BRASS = '#a5813f';
const BORDER = '#d9d5cd';

const px = (v: number) => Math.round(v * SCALE * 10) / 10;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function planToSvg(plan: FloorPlanResult, env: Envelope, opts?: { title?: string }): string {
  const xs = env.envelope.map((p) => p[0]);
  const ys = env.envelope.map((p) => p[1]);
  const W = Math.max(...xs) - Math.min(...xs);
  const D = Math.max(...ys) - Math.min(...ys);
  const ox = Math.min(...xs);
  const oy = Math.min(...ys);
  const width = px(W) + 2 * PAD;
  const height = px(D) + 2 * PAD + 70;

  const X = (x: number) => PAD + px(x - ox);
  const Y = (y: number) => PAD + px(y - oy);

  const font = `font-family="'Work Sans','Helvetica Neue',Arial,sans-serif"`;
  const s: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" ${font}>`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    `<text x="${PAD}" y="28" font-size="13" letter-spacing="3" fill="${INK}">${esc(
      (opts?.title ?? `PROPOSED CONVERSION · FLOOR ${plan.floor}`).toUpperCase(),
    )}</text>`,
    `<line x1="${PAD}" y1="38" x2="${width - PAD}" y2="38" stroke="${INK}" stroke-width="0.75"/>`,
    `<text x="${PAD}" y="52" font-size="10" fill="${MUTED}">${esc(
      `${plan.units.length} unit${plan.units.length === 1 ? '' : 's'} · NIA ${plan.niaSqm} sqm · net:gross ${(plan.netToGross * 100).toFixed(0)}% · ${String(plan.strategy).replace('_', ' ')} · schematic for feasibility only`,
    )}</text>`,
  ];

  // envelope
  const pts = env.envelope.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ');
  s.push(`<polygon points="${pts}" fill="#fcfbf8" stroke="${INK}" stroke-width="2.5"/>`);

  // corridor
  if (plan.corridor) {
    const c = plan.corridor;
    s.push(
      `<rect x="${X(ox)}" y="${Y(c.y0)}" width="${px(W)}" height="${px(c.y1 - c.y0)}" fill="#f5f1e9" stroke="${BORDER}" stroke-dasharray="4 3" stroke-width="0.75"/>`,
      `<text x="${X(ox) + 6}" y="${Y(c.y0) + px(c.y1 - c.y0) / 2 + 3}" font-size="8" letter-spacing="2" fill="${MUTED}">CORRIDOR</text>`,
    );
  }

  // cores
  for (const core of env.cores) {
    const cp = core.poly;
    const cpts = cp.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ');
    const cx = cp.reduce((a, p) => a + p[0], 0) / cp.length;
    const cy = cp.reduce((a, p) => a + p[1], 0) / cp.length;
    s.push(
      `<polygon points="${cpts}" fill="${BORDER}" stroke="${INK}" stroke-width="0.75"/>`,
      `<text x="${X(cx)}" y="${Y(cy) + 3}" font-size="8" letter-spacing="2" text-anchor="middle" fill="${INK}">${esc(
        (core.type || 'CORE').toUpperCase(),
      )}</text>`,
    );
  }

  // units + rooms. Both carry an `outline` when the drawn rectangle overhangs a
  // non-rectangular envelope, so the plan shows the clipped footprint the areas
  // were actually measured on rather than a rectangle floating outside a wall.
  const shape = (
    outline: [number, number][] | undefined,
    rx0: number,
    ry0: number,
    rx1: number,
    ry1: number,
    attrs: string,
  ) =>
    outline
      ? `<polygon points="${outline.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')}" ${attrs}/>`
      : `<rect x="${X(rx0)}" y="${Y(ry0)}" width="${px(rx1 - rx0)}" height="${px(ry1 - ry0)}" ${attrs}/>`;

  for (const u of plan.units) {
    const fill = TYPE_FILL[u.label] ?? '#f3eee4';
    s.push(shape(u.outline, u.x0, u.y0, u.x1, u.y1, `fill="${fill}" stroke="${INK}" stroke-width="1.75"`));
    for (const r of u.rooms) {
      if (r.area <= 0) continue; // wholly outside the envelope: nothing to draw
      s.push(shape(r.outline, r.x, r.y, r.x + r.w, r.y + r.d, `fill="none" stroke="#b8b2a4" stroke-width="0.6"`));
      // Label from the drawn extent, but clamped into the shape actually shown.
      const lx = r.outline ? Math.min(...r.outline.map((p) => p[0])) : r.x;
      const ly = r.outline ? Math.min(...r.outline.map((p) => p[1])) : r.y;
      s.push(
        `<text x="${X(lx) + 3}" y="${Y(ly) + 11}" font-size="7.5" fill="${MUTED}">${esc(r.name)} ${r.area}m²</text>`,
      );
    }
    // Centre the unit label on the clipped footprint, not on a midpoint that
    // may sit outside the building.
    const box = u.outline
      ? [
          Math.min(...u.outline.map((p) => p[0])),
          Math.min(...u.outline.map((p) => p[1])),
          Math.max(...u.outline.map((p) => p[0])),
          Math.max(...u.outline.map((p) => p[1])),
        ]
      : [u.x0, u.y0, u.x1, u.y1];
    s.push(
      `<text x="${X((box[0] + box[2]) / 2)}" y="${Y((box[1] + box[3]) / 2) + 4}" font-size="11" font-weight="600" text-anchor="middle" fill="${INK}">${u.no}: ${esc(
        u.label,
      )} ${u.giaSqm}m²</text>`,
    );
  }

  // windows as facade ticks
  for (const w of env.windows) {
    const wy = w.side === 'front' ? oy : oy + D;
    s.push(
      `<line x1="${X(w.x - 0.5)}" y1="${Y(wy)}" x2="${X(w.x + 0.5)}" y2="${Y(wy)}" stroke="${BRASS}" stroke-width="5"/>`,
    );
  }

  // scale bar (5m) + legend
  const sbY = height - 26;
  s.push(
    `<line x1="${PAD}" y1="${sbY}" x2="${PAD + px(5)}" y2="${sbY}" stroke="#000000" stroke-width="2"/>`,
    `<text x="${PAD}" y="${sbY - 6}" font-size="8" fill="#000000">5 m</text>`,
    `<text x="${PAD + px(7)}" y="${sbY}" font-size="8" fill="#6b6f71">thick facade ticks = retained window openings</text>`,
    `<text x="${width - PAD}" y="${sbY}" font-size="9" letter-spacing="4" text-anchor="end" fill="#000000">S A T I S</text>`,
  );
  s.push('</svg>');
  return s.join('\n');
}
