export function NarrativeOpening({
  label,
  title,
  paragraphs,
  centralQuestion,
}: {
  label: string;
  title: string;
  paragraphs: string[];
  centralQuestion?: string;
}) {
  return (
    <section className="narrative-opening">
      <span>{label}</span>
      <h2>{title}</h2>
      <div>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      {centralQuestion && <blockquote><b>The central question</b>{centralQuestion}</blockquote>}
    </section>
  );
}
