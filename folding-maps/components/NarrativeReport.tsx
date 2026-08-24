import { Fragment, type ReactNode } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import type { ReportSection, ReportSource } from '@/lib/reportNarrative';

export function NarrativeSections<TExhibit extends { afterParagraph: number }>({
  sections,
  className,
  contentsLabel,
  idPrefix,
  renderExhibit,
}: {
  sections: ReportSection<TExhibit>[];
  className: string;
  contentsLabel: string;
  idPrefix: string;
  renderExhibit: (exhibit: TExhibit) => ReactNode;
}) {
  return (
    <div className="report-body">
      <nav className="report-contents" aria-label={`${contentsLabel} contents`}>
        <span>{contentsLabel}</span>
        {sections.map((section, index) => <a href={`#${idPrefix}-section-${index + 1}`} key={section.heading}>{String(index + 1).padStart(2, '0')} {section.heading}</a>)}
      </nav>
      <div className={`report-sections narrative-report-sections ${className}`}>
        {sections.map((section, sectionIndex) => (
          <section id={`${idPrefix}-section-${sectionIndex + 1}`} key={section.heading} data-section-role={section.role ?? 'analysis'}>
            {section.transition && <p className="section-transition">{section.transition}</p>}
            <span className="section-number">{String(sectionIndex + 1).padStart(2, '0')}</span>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <Fragment key={paragraph.text}>
                <p>
                  {paragraph.text}
                  {paragraph.sources?.length ? (
                    <span className="inline-citations">Sources: {paragraph.sources.map((source, sourceIndex) => <Fragment key={source.href}>{sourceIndex > 0 && ', '}<a href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={12}/></a></Fragment>)}</span>
                  ) : null}
                </p>
                {section.exhibits?.filter((exhibit) => exhibit.afterParagraph === paragraphIndex).map(renderExhibit)}
              </Fragment>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function ReportActionAgenda({ eyebrow, title, actions }: { eyebrow: string; title: string; actions: string[] }) {
  return (
    <section className="next-step-panel article-actions report-action-agenda">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <ol>{actions.map((action) => <li key={action}><Check size={16}/>{action}</li>)}</ol>
    </section>
  );
}

export function ReportReferences({
  id,
  title,
  introduction,
  sources,
}: {
  id: string;
  title: string;
  introduction: string;
  sources: ReportSource[];
}) {
  return (
    <aside className="references report-references" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <p>{introduction}</p>
      <ol>{sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label}<ArrowUpRight size={14}/></a>{source.detail && <span>{source.detail}</span>}</li>)}</ol>
    </aside>
  );
}
