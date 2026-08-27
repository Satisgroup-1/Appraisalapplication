'use client';

import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { EvidenceView } from '@/lib/editorialGraphics';

export function InteractiveEvidence({
  eyebrow = 'Evidence',
  views,
}: {
  eyebrow?: string;
  views: EvidenceView[];
}) {
  const headingId = useId();
  const [viewIndex, setViewIndex] = useState(0);
  const [pointIndex, setPointIndex] = useState(0);
  const view = views[viewIndex];
  const maximum = useMemo(() => Math.max(...view.points.map((point) => point.value), 1), [view]);
  const selected = view.points[pointIndex] ?? view.points[0];

  useEffect(() => setPointIndex(0), [viewIndex]);

  return (
    <section className="interactive-evidence" aria-labelledby={headingId}>
      <div className="interactive-evidence-heading">
        <div>
          <span>{eyebrow}</span>
          <h2 id={headingId}>{view.title}</h2>
          <p>{view.summary}</p>
        </div>
      </div>

      {views.length > 1 && (
        <div className="evidence-view-switch" aria-label="Choose evidence view">
          {views.map((option, index) => (
            <button type="button" key={option.label} aria-pressed={viewIndex === index} onClick={() => setViewIndex(index)}>{option.label}</button>
          ))}
        </div>
      )}

      <div className="evidence-chart-layout">
        <div className="evidence-chart" role="group" aria-label={`${view.title}. Select a bar for its interpretation.`}>
          {view.points.map((point, index) => {
            const width = Math.max(4, (point.value / maximum) * 100);
            return (
              <button
                className={pointIndex === index ? 'evidence-bar-row active' : 'evidence-bar-row'}
                type="button"
                key={point.label}
                onClick={() => setPointIndex(index)}
                onFocus={() => setPointIndex(index)}
                onMouseEnter={() => setPointIndex(index)}
                aria-pressed={pointIndex === index}
                aria-label={`${point.label}: ${point.display}. ${point.detail}`}
              >
                <span className="evidence-bar-label">{point.label}</span>
                <span className="evidence-bar-track"><i style={{ '--bar-size': `${width}%` } as CSSProperties}/></span>
                <strong>{point.display}</strong>
              </button>
            );
          })}
        </div>

        <aside className="evidence-reading" aria-live="polite">
          <span>Analyst reading</span>
          <strong>{selected.label}</strong>
          <b>{selected.display}</b>
          <p>{selected.detail}</p>
        </aside>
      </div>

      {view.interpretation && (
        <div className="evidence-interpretation">
          <p><strong>Established.</strong> {view.interpretation.establishes}</p>
          <p><strong>Not established.</strong> {view.interpretation.doesNotEstablish}</p>
          <p><strong>Management action.</strong> {view.interpretation.management}</p>
        </div>
      )}

      <p className="evidence-source">
        Source: {view.href ? <a href={view.href} target="_blank" rel="noreferrer">{view.source} <ArrowUpRight size={13}/></a> : view.source}
      </p>
    </section>
  );
}
