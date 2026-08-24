import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CodeExhibit, ProcessExhibit } from '@/components/ConsultingExhibits';
import { NarrativeOpening } from '@/components/EditorialNarrative';
import { InteractiveEvidence } from '@/components/InteractiveEvidence';
import { MechanicalMark } from '@/components/MechanicalVisuals';
import { NarrativeSections, ReportActionAgenda, ReportReferences } from '@/components/NarrativeReport';
import { ReadingModeSwitch } from '@/components/ReadingModeSwitch';
import { JsonLd } from '@/components/JsonLd';
import type { CaseExhibitPlacement } from '@/lib/caseEditorial';
import { caseEditorial } from '@/lib/caseEditorial';
import { caseResearch, cases } from '@/lib/content';
import { dedupeSources } from '@/lib/reportNarrative';
import { getCaseVariants } from '@/lib/reportVariants';
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
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
  const variants = getCaseVariants(study, research);
  const references = dedupeSources(research.map(({ source, href, finding }) => ({ label: source, href, detail: finding })));
  const evidenceViews = [{
    label: 'Operating evidence',
    title: editorial.evidenceTitle,
    summary: study.barSubtitle,
    source: study.barNote.replace(/^Source:\s*/i, '').replace(/\.$/, ''),
    interpretation: editorial.evidenceInterpretation,
    points: study.bars.map((bar) => ({
      label: bar.label,
      value: bar.value,
      display: bar.display,
      detail: study.status === 'In progress'
        ? 'This is a discovery priority, not a measured operating result.'
        : 'This is an illustrative design value and requires testing before use in an investment claim.',
    })),
  }];
  const pageUrl = absoluteUrl(`/case-studies/${study.slug}`);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Case studies', path: '/case-studies' },
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
    if (placement.kind === 'evidence') return <InteractiveEvidence key="evidence" eyebrow="Decision evidence" views={evidenceViews}/>;
    if (placement.kind === 'process') return <ProcessExhibit key="process" number="1" title={editorial.processTitle} steps={study.phases}/>;
    return <CodeExhibit key="system" title={editorial.systemTitle} eyebrow="System decision architecture" lines={study.code.lines} nodes={study.code.nodes}/>;
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="detail consulting-detail case-narrative-detail">
        <Link className="back" href="/case-studies"><ArrowLeft size={16}/> All case studies</Link>
        <div className="report-meta"><span className="badge">{study.status}</span><span>{study.sector}</span><span>Operating case</span></div>
        <h1>{study.title}</h1>
        <p className="case-status-note"><strong>Evidence status.</strong> {editorial.statusStatement}</p>
        <div className="detail-visual report-visual"><Image src={study.image} alt="" fill priority sizes="(max-width: 1200px) 100vw, 1030px"/><MechanicalMark label="Operating decision map"/><div className="case-image-wash"/></div>

        <ReadingModeSwitch simplePanelId={`simple-case-${study.slug}`} advancedPanelId={`advanced-case-${study.slug}`}/>
        {(['simple', 'advanced'] as const).map((mode) => {
          const variant = variants[mode];
          return (
            <section className="report-mode-panel" id={`${mode}-case-${study.slug}`} data-report-mode={mode} aria-label={`${mode} reading level`} key={mode}>
              <p className="mode-read-estimate">Estimated reading time: {variant.estimatedReadingTime}</p>
              <p className="lede">{variant.standfirst}</p>
              <div className="executive-brief"><span>Engagement thesis</span><p>{variant.thesis}</p></div>
              {variant.opening && <NarrativeOpening label={variant.opening.label} title={variant.opening.title} paragraphs={variant.opening.paragraphs} centralQuestion={variant.opening.centralQuestion}/>}
              <NarrativeSections sections={variant.sections} className="continuous-case-sections" contentsLabel={mode === 'simple' ? 'Executive case' : 'Technical case'} idPrefix={`${mode}-case-${study.slug}`} renderExhibit={renderExhibit}/>
              <ReportActionAgenda eyebrow="Release agenda" title="Decisions required before the next release" actions={variant.actionAgenda}/>
            </section>
          );
        })}

        <ReportReferences id="case-references" title="Sources informing the design hypothesis" introduction="These publications provide external context. Their findings do not convert this engagement or illustrative design into a measured client result." sources={references}/>

        {study.status === 'Illustrative' && <aside className="case-disclaimer">This illustrative case explains a delivery and control pattern that Quiet Gears could provide. It does not represent a completed client engagement or a measured client result. Every target, weight, allocation and expected benefit remains explicitly illustrative until tested in the stated operating context.</aside>}
      </article>
      <section className="cta-band"><h2>Where is friction<br/>holding you back?</h2><Link className="button lime" href="/contact">Talk it through with us <ArrowRight size={17}/></Link></section>
    </>
  );
}
