import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CodeExhibit } from '@/components/ConsultingExhibits';
import { NarrativeOpening } from '@/components/EditorialNarrative';
import { InteractiveEvidence } from '@/components/InteractiveEvidence';
import { MechanicalMark } from '@/components/MechanicalVisuals';
import { NarrativeSections, ReportActionAgenda, ReportReferences } from '@/components/NarrativeReport';
import { ReadingModeSwitch } from '@/components/ReadingModeSwitch';
import { JsonLd } from '@/components/JsonLd';
import { articleResearch, articles } from '@/lib/content';
import { newsEvidenceViews } from '@/lib/editorialGraphics';
import { newsEditorial, type NewsExhibitPlacement } from '@/lib/newsEditorial';
import { dedupeSources } from '@/lib/reportNarrative';
import { getNewsVariants } from '@/lib/reportVariants';
import { absoluteUrl, breadcrumbJsonLd, createPageMetadata, SITE_NAME, SITE_URL, toIsoDate } from '@/lib/seo';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  const editorial = newsEditorial[article.slug];
  return createPageMetadata({
    title: editorial.title,
    description: editorial.standfirst,
    path: `/news/${article.slug}`,
    image: article.image,
    type: 'article',
    publishedTime: toIsoDate(article.date),
  });
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();
  const editorial = newsEditorial[article.slug];
  const variants = getNewsVariants(article, editorial);
  const references = dedupeSources([
    ...article.sources,
    ...articleResearch[article.slug].map(({ source, href, finding }) => ({ label: source, href, detail: finding })),
    ...editorial.sections.flatMap((section) => section.paragraphs.flatMap((paragraph) => paragraph.sources ?? [])),
  ]);
  const pageUrl = absoluteUrl(`/news/${article.slug}`);
  const publishedTime = toIsoDate(article.date);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'News and analysis', path: '/news' },
      { name: editorial.title, path: `/news/${article.slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: editorial.title,
      description: editorial.standfirst,
      image: absoluteUrl(article.image),
      datePublished: publishedTime,
      dateModified: publishedTime,
      mainEntityOfPage: pageUrl,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      articleSection: article.tag,
    },
  ];
  const renderExhibit = (placement: NewsExhibitPlacement) => placement.kind === 'evidence'
    ? <InteractiveEvidence key={`evidence-${placement.view}`} views={[newsEvidenceViews[article.slug][placement.view]]}/>
    : <CodeExhibit key="system" title={article.code.title} eyebrow="Implementation pattern" lines={article.code.lines} nodes={article.code.nodes}/>;

  return (
    <article className="article-detail insight-report prose-first-report">
      <JsonLd data={jsonLd} />
      <Link className="back" href="/news"><ArrowLeft size={16}/> All analysis</Link>
      <div className="report-meta"><span>{article.tag}</span><span>{article.date}</span><span>{article.read}</span></div>
      <h1>{editorial.title}</h1>
      <div className="article-hero-image"><Image src={article.image} alt="" fill priority sizes="(max-width: 1000px) 100vw, 860px"/><span>{article.artLabel}</span><MechanicalMark label="Evidence briefing"/></div>

      <ReadingModeSwitch simplePanelId={`simple-news-${article.slug}`} advancedPanelId={`advanced-news-${article.slug}`}/>
      {(['simple', 'advanced'] as const).map((mode) => {
        const variant = variants[mode];
        return (
          <section className="report-mode-panel" id={`${mode}-news-${article.slug}`} data-report-mode={mode} aria-label={`${mode} reading level`} key={mode}>
            <p className="mode-read-estimate">Estimated reading time: {variant.estimatedReadingTime}</p>
            <p className="lede">{variant.standfirst}</p>
            {variant.opening && <NarrativeOpening label={variant.opening.label} title={variant.opening.title} paragraphs={variant.opening.paragraphs} centralQuestion={variant.opening.centralQuestion}/>}
            <section className="thesis-panel"><span>Central contention</span><p>{variant.thesis}</p></section>
            <NarrativeSections sections={variant.sections} className="editorial-report-sections continuous-report-sections" contentsLabel={mode === 'simple' ? 'Executive analysis' : 'Technical analysis'} idPrefix={`${mode}-news-${article.slug}`} renderExhibit={renderExhibit}/>
            <ReportActionAgenda eyebrow="Leadership agenda" title="Decisions arising from the analysis" actions={variant.actionAgenda}/>
          </section>
        );
      })}

      <ReportReferences id="news-references" title="Sources and further reading" introduction="External evidence is used for context. Quiet Gears analysis and illustrative charts are identified separately." sources={references}/>
    </article>
  );
}
