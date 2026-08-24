import type { Industry } from '@/lib/industries';

type Props = Pick<Industry, 'name' | 'motif' | 'signalLabels'>;

const motifPaths: Record<Industry['motif'], string[]> = {
  orbit: [
    'M86 290 C170 126 334 112 466 210 S676 326 754 168',
    'M138 102 C262 220 336 338 516 326 S692 254 738 94',
  ],
  field: [
    'M72 116 C180 84 250 156 356 122 S568 82 752 138',
    'M72 306 C210 226 326 354 462 286 S650 226 752 286',
  ],
  flow: [
    'M60 224 H214 C268 224 272 124 326 124 H478 C534 124 536 286 594 286 H770',
    'M60 318 H176 C244 318 250 252 314 252 H500 C558 252 572 188 636 188 H770',
  ],
  lattice: [
    'M92 92 L248 164 L404 92 L560 164 L716 92',
    'M92 316 L248 244 L404 316 L560 244 L716 316',
  ],
  pulse: [
    'M58 228 H196 L238 144 L304 306 L366 190 L414 228 H770',
    'M58 284 H172 L222 250 L282 284 L342 250 L402 284 H770',
  ],
  stack: [
    'M92 118 H716 M92 204 H716 M92 290 H716',
    'M160 72 V342 M404 72 V342 M650 72 V342',
  ],
};

export function IndustrySignal({ name, motif, signalLabels }: Props) {
  const nodes = [
    { x: 110, y: 226 },
    { x: 302, y: 148 },
    { x: 502, y: 276 },
    { x: 700, y: 178 },
  ];

  return (
    <figure className={`industry-signal motif-${motif}`} aria-labelledby="industry-signal-caption">
      <svg viewBox="0 0 820 420" role="img" aria-label={`${name} operating signal connecting ${signalLabels.join(', ')}`}>
        <defs>
          <pattern id={`signal-grid-${motif}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeOpacity=".08" />
          </pattern>
          <filter id={`signal-glow-${motif}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="820" height="420" fill={`url(#signal-grid-${motif})`} />
        <circle className="signal-orbit orbit-a" cx="410" cy="210" r="154" />
        <circle className="signal-orbit orbit-b" cx="410" cy="210" r="92" />
        <g className="signal-paths">
          {motifPaths[motif].map((path) => <path d={path} key={path} />)}
        </g>
        <g className="signal-core" filter={`url(#signal-glow-${motif})`}>
          <circle cx="410" cy="210" r="28" />
          <circle cx="410" cy="210" r="9" />
        </g>
        {nodes.map((node, index) => (
          <g className="signal-node" key={signalLabels[index]} transform={`translate(${node.x} ${node.y})`}>
            <circle r="31" />
            <circle r="8" />
            <path d="M-14 0H14M0-14V14" />
            <text y="57" textAnchor="middle">{String(index + 1).padStart(2, '0')}</text>
          </g>
        ))}
        <g className="signal-readout">
          <text x="44" y="48">OPERATING SIGNAL</text>
          <text x="776" y="48" textAnchor="end">HUMAN LED / EVIDENCE LINKED</text>
          <text x="44" y="386">SOURCE STATUS: VISIBLE</text>
          <text x="776" y="386" textAnchor="end">DECISION OWNER: REQUIRED</text>
        </g>
      </svg>
      <figcaption id="industry-signal-caption">
        {signalLabels.map((label, index) => <span key={label}><b>{String(index + 1).padStart(2, '0')}</b>{label}</span>)}
      </figcaption>
    </figure>
  );
}
