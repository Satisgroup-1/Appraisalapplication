import type { CaseExhibitPlacement } from '@/lib/caseEditorial';
import { caseEditorial } from '@/lib/caseEditorial';
import type { Article, CaseStudy, ResearchFinding } from '@/lib/content';
import type { NewsEditorial, NewsExhibitPlacement } from '@/lib/newsEditorial';
import type { Report } from '@/lib/reportNarrative';

/**
 * One report per piece. An earlier version of the site offered the same
 * argument at two reading levels, which meant every article had to be written
 * twice and neither version could carry the whole case. A published article
 * has one text.
 */
export function getNewsReport(article: Article, editorial: NewsEditorial): Report<NewsExhibitPlacement> {
  return {
    standfirst: editorial.standfirst,
    thesis: editorial.thesis,
    opening: { label: editorial.sceneLabel, title: editorial.sceneTitle, paragraphs: editorial.sceneParagraphs },
    sections: editorial.sections,
    actionAgenda: article.actions,
  };
}

export function getCaseReport(study: CaseStudy, research: ResearchFinding[]): Report<CaseExhibitPlacement> {
  const editorial = caseEditorial[study.slug];
  const sources = research.map(({ source, href, finding }) => ({ label: source, href, detail: finding }));

  return {
    standfirst: study.summary,
    thesis: editorial.thesis,
    opening: {
      label: editorial.sceneLabel,
      title: editorial.openingTitle,
      paragraphs: editorial.openingParagraphs,
      centralQuestion: editorial.centralQuestion,
    },
    // Case paragraphs cite research by index so the editorial file stays
    // readable; the indexes are resolved here against that case's findings.
    sections: editorial.sections.map((section) => ({
      ...section,
      paragraphs: section.paragraphs.map((paragraph) => ({
        text: paragraph.text,
        sources: paragraph.sources?.map((index) => sources[index]),
      })),
    })),
    actionAgenda: study.nextSteps,
  };
}
