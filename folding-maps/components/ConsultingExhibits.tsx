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
    <figure className="consulting-exhibit process-exhibit">
      <figcaption><span>Exhibit {number}</span><h2>{title}</h2></figcaption>
      <div className="process-flow">
        {steps.map((step, index) => (
          <div className="process-node" key={step.label}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function CodeExhibit({
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
    <figure className="code-exhibit">
      <figcaption><span>{eyebrow}</span><h2>{title}</h2></figcaption>
      <div className="code-system">
        <div className="code-window" aria-label="Illustrative implementation pattern">
          <div className="code-dots"><i/><i/><i/></div>
          <pre><code>{lines.map((line, index) => <span key={`${line}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b>{line}</span>)}</code></pre>
        </div>
        <div className="system-nodes" aria-label="System architecture">
          {nodes.map((node, index) => <div key={node}><i>{String(index + 1).padStart(2, '0')}</i><span>{node}</span></div>)}
        </div>
      </div>
    </figure>
  );
}
