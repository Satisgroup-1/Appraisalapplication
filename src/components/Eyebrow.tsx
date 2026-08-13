// Indexed section label, ported from the group website: a two-digit index in
// mono, a hairline that draws in, and a tracked-out brass label. Gives pages
// an editorial, spec-sheet rhythm.

export default function Eyebrow({ index, label }: { index?: string; label: string }) {
  return (
    <div className="eyebrow">
      {index && <span className="eyebrow-index">{index}</span>}
      <span className="eyebrow-line" aria-hidden="true" />
      <span className="eyebrow-label">{label}</span>
    </div>
  );
}
