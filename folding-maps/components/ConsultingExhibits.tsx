/**
 * Figures inside a report. Both are numbered exhibits with a caption, because
 * that is how a reader refers back to them, and both carry their own note
 * rather than relying on the surrounding prose to explain them.
 */

export function ProcessExhibit({
  number,
  title,
  steps,
}: {
  number: string;
  title: string;
  steps: { label: string; detail: string }[];
}) {
  return (
    <figure className="exhibit">
      <figcaption>
        <span>Exhibit {number}</span>
        <h2>{title}</h2>
      </figcaption>
      <ol className="process-flow">
        {steps.map((step, index) => (
          <li key={step.label}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function SystemExhibit({
  title,
  eyebrow,
  lines,
  nodes,
}: {
  title: string;
  eyebrow: string;
  lines: string[];
  nodes: string[];
}) {
  return (
    <figure className="exhibit exhibit-system">
      <figcaption>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </figcaption>
      <div className="system-layout">
        <div className="system-logic">
          <span className="fact-label">Control flow</span>
          <ol>
            {lines.map((line, index) => (
              <li key={`${line}-${index}`}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        </div>
        <div className="system-nodes">
          <span className="fact-label">Components</span>
          <ol>
            {nodes.map((node, index) => (
              <li key={node}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                <span>{node}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <span className="exhibit-note">
        The flow is written as pseudocode so the sequence can be checked by someone who
        does not read the implementation language. Component names are the ones used in the
        build.
      </span>
    </figure>
  );
}
