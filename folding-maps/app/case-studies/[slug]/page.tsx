import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProcessExhibit, SystemExhibit } from '@/components/ConsultingExhibits';
import { NarrativeOpening } from '@/components/EditorialNarrative';
import { InteractiveEvidence } from '@/components/InteractiveEvidence';
import { NarrativeSections, ReportActionAgenda, ReportReferences } from '@/components/NarrativeReport';
import { JsonLd } from '@/components/JsonLd';
import type { CaseExhibitPlacement } from '@/lib/caseEditorial';
import { caseEditorial } from '@/lib/caseEditorial';
import { caseResearch, cases } from '@/lib/content';
import { dedupeSources } from '@/lib/reportNarrative';
import { getCaseReport } from '@/lib/reportModel';
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = cases.find((item) => item.slug === slug);
  if (!study) return {};
  return createPageMetadata({
    title: study.title,
    description: study.summary,
    path: `/case-studies/${study.slug}`,
    image: study.image,
    type: 'article',
  });
}

export default async function CaseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = cases.find((item) => item.slug === slug);
  if (!study) notFound();

  const editorial = caseEditorial[study.slug];
  const research = caseResearch[study.slug];
  const report = getCaseReport(study, research);
  const references = dedupeSources(
    research.map(({ source, href, finding }) => ({ label: source, href, detail: finding })),
  );

  // Only a project whose count the firm has supplied carries an evidence
  // chart. The others specify what they are measuring in the text, and the
  // page shows the process and system exhibits alone.
  const evidenceViews = study.chart && editorial.evidenceTitle && editorial.evidenceInterpretation
    ? [
        {
          label: 'Operating evidence',
          title: editorial.evidenceTitle,
          summary: study.chart.subtitle,
          source: study.chart.note.replace(/^Source:\s*/i, '').replace(/\.$/, ''),
          interpretation: editorial.evidenceInterpretation,
          points: study.chart.bars.map((bar) => ({
            label: bar.label,
            value: bar.value,
            display: bar.display,
            detail: bar.detail ?? 'A priority agreed in discovery. The figure is a design target and has not yet been measured in operation.',
          })),
        },
      ]
    : [];

  const pageUrl = absoluteUrl(`/case-studies/${study.slug}`);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Work', path: '/case-studies' },
      { name: study.title, path: `/case-studies/${study.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: study.title,
      description: study.summary,
      image: absoluteUrl(study.image),
      mainEntityOfPage: pageUrl,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      articleSection: study.sector,
    },
  ];

  const renderExhibit = (placement: CaseExhibitPlacement) => {
    if (placement.kind === 'evidence')
      return evidenceViews.length
        ? <InteractiveEvidence key="evidence" eyebrow="Decision evidence" views={evidenceViews} />
        : null;
    if (placement.kind === 'process')
      return (
        <ProcessExhibit key="process" number="1" title={editorial.processTitle} steps={study.phases} />
      );
    return (
      <SystemExhibit
        key="system"
        title={editorial.systemTitle}
        eyebrow="System architecture"
        lines={study.code.lines}
        nodes={study.code.nodes}
      />
    );
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <article className="report">
        <Link className="back" href="/case-studies">
          <ArrowLeft size={15} aria-hidden="true" /> All projects
        </Link>

        <div className="report-meta">
          <span>{study.sector}</span>
          <span>Project</span>
        </div>

        <h1>{study.title}</h1>
        <p className="lede">{study.brief}</p>

        <div className="metric-strip">
          {study.metrics.map((metric) => (
            <div className="metric-item" key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              {metric.detail ? <small>{metric.detail}</small> : null}
            </div>
          ))}
        </div>

        <p className="caveat">
          <strong>Reading the figures on this page</strong>
          {editorial.statusStatement}
        </p>

        <p className="lede">{report.standfirst}</p>

        <div className="executive-brief">
          <span>The argument</span>
          <p>{report.thesis}</p>
        </div>

        {report.opening && (
          <NarrativeOpening
            label={report.opening.label}
            title={report.opening.title}
            paragraphs={report.opening.paragraphs}
            centralQuestion={report.opening.centralQuestion}
          />
        )}

        <NarrativeSections
          sections={report.sections}
          className="continuous-case-sections"
          contentsLabel="Contents"
          idPrefix={`case-${study.slug}`}
          renderExhibit={renderExhibit}
        />

        <ReportActionAgenda
          eyebrow="Next release"
          title="Decisions required before the next release"
          actions={report.actionAgenda}
        />

        <ReportReferences
          id="case-references"
          title="Sources"
          introduction="External research informing the design. These findings provide context; they do not convert this engagement's design targets into measured results."
          sources={references}
        />
      </article>

      <section className="contact-band">
        <div className="container inner">
          <div>
            <span className="kicker">Enquiries</span>
            <h2>Tell us where the work is getting stuck.</h2>
            <p>
              If this account resembles your operation, the useful first step is a
              conversation about the differences.
            </p>
          </div>
          <Link className="button" href="/contact">
            Start an enquiry <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
