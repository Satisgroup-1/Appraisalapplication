import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SystemExhibit } from '@/components/ConsultingExhibits';
import { NarrativeOpening } from '@/components/EditorialNarrative';
import { InteractiveEvidence } from '@/components/InteractiveEvidence';
import { NarrativeSections, ReportActionAgenda, ReportReferences } from '@/components/NarrativeReport';
import { JsonLd } from '@/components/JsonLd';
import { articleResearch, articles } from '@/lib/content';
import { newsEvidenceViews } from '@/lib/editorialGraphics';
import { newsEditorial, type NewsExhibitPlacement } from '@/lib/newsEditorial';
import { dedupeSources } from '@/lib/reportNarrative';
import { getNewsReport } from '@/lib/reportModel';
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
  const report = getNewsReport(article, editorial);
  const references = dedupeSources([
    ...article.sources,
    ...articleResearch[article.slug].map(({ source, href, finding }) => ({ label: source, href, detail: finding })),
    ...editorial.sections.flatMap((section) => section.paragraphs.flatMap((paragraph) => paragraph.sources ?? [])),
  ]);
  const pageUrl = absoluteUrl(`/news/${article.slug}`);
  const publishedTime = toIsoDate(article.date);
  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Insights', path: '/news' },
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
    : <SystemExhibit key="system" title={article.code.title} eyebrow="Implementation pattern" lines={article.code.lines} nodes={article.code.nodes}/>;

  return (
    <article className="report">
      <JsonLd data={jsonLd} />
      <Link className="back" href="/news"><ArrowLeft size={15} aria-hidden="true"/> All insights</Link>
      <div className="report-meta"><span>{article.tag}</span><span>{article.date}</span><span>{article.read}</span></div>
      <h1>{editorial.title}</h1>

      <p className="lede">{report.standfirst}</p>
      {report.opening && <NarrativeOpening label={report.opening.label} title={report.opening.title} paragraphs={report.opening.paragraphs} centralQuestion={report.opening.centralQuestion}/>}
      <section className="thesis-panel"><span>The contention</span><p>{report.thesis}</p></section>
      <NarrativeSections sections={report.sections} className="editorial-report-sections continuous-report-sections" contentsLabel="Contents" idPrefix={`news-${article.slug}`} renderExhibit={renderExhibit}/>
      <ReportActionAgenda eyebrow="What follows" title="Decisions arising from the analysis" actions={report.actionAgenda}/>

      <ReportReferences id="news-references" title="Sources" introduction="External evidence is used for context. Charts drawn from our own analysis are identified as such on the exhibit itself." sources={references}/>

      <div className="article-foot">
        <p>
          Written by Quiet Gears. If your own operating data contradicts the argument
          above, we would rather hear it than defend the piece.
        </p>
        <Link className="button light" href="/contact">
          Send a challenge <ArrowRight size={16} aria-hidden="true"/>
        </Link>
      </div>
    </article>
  );
}
