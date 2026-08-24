import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { caseEditorial } from '@/lib/caseEditorial';
import { articleResearch, articles, caseResearch, cases } from '@/lib/content';
import { newsEvidenceViews } from '@/lib/editorialGraphics';
import { firstConversation, serviceJourney, servicePathways } from '@/lib/serviceModel';
import { newsEditorial } from '@/lib/newsEditorial';
import { getCaseVariants, getNewsVariants } from '@/lib/reportVariants';
import { advancedCaseDepth, advancedCaseExtensionSections, advancedCaseSections, advancedNewsDepth, advancedNewsExtensionSections, advancedNewsSections } from '@/lib/advancedDepth';

describe('editorial content', () => {
  it('has unique routes for all case studies and articles', () => {
    expect(articles).toHaveLength(8);
    expect(cases).toHaveLength(5);
    const slugs = [...cases, ...articles].map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('labels unfinished or fictional case work', () => {
    expect(cases.every((item) => ['In progress', 'Anonymised'].includes(item.status))).toBe(true);
  });

  it('provides centralised research metadata for every paper', () => {
    expect(cases.every((item) => caseResearch[item.slug]?.length >= 4)).toBe(true);
    expect(articles.every((item) => articleResearch[item.slug]?.length >= 4)).toBe(true);
  });

  it('gives every news article one substantial narrative essay', () => {
    expect(articles.every((item) => {
      const editorial = newsEditorial[item.slug];
      return editorial?.sceneParagraphs.length >= 2
        && editorial.thesis.length > 0
        && editorial.sections.length >= 4
        && editorial.sections.length <= 6
        && editorial.sections.every((section) => section.paragraphs.length >= 3);
    })).toBe(true);
  });

  it('gives all 13 advanced reports explicit causal transitions', () => {
    const reports = [
      ...articles.map((item) => newsEditorial[item.slug]),
      ...cases.map((item) => caseEditorial[item.slug]),
    ];
    expect(reports).toHaveLength(13);
    expect(reports.every((report) => !report.sections[0].transition && report.sections.slice(1).every((section) => section.transition && section.transition.length > 40))).toBe(true);
  });

  it('provides independently structured Simple and Advanced variants for every report', () => {
    const newsVariants = articles.map((article) => getNewsVariants(article, newsEditorial[article.slug]));
    const caseVariants = cases.map((study) => getCaseVariants(study, caseResearch[study.slug]));
    const allVariants = [...newsVariants, ...caseVariants];
    expect(allVariants).toHaveLength(13);
    expect(allVariants.every((variants) => ['simple', 'advanced'].every((mode) => {
      const variant = variants[mode as 'simple' | 'advanced'];
      return variant.thesis.length > 0
        && variant.opening
        && variant.sections.length >= 4
        && variant.sections.filter((section) => section.role === 'conclusion').length === 1
        && variant.actionAgenda.length >= 3
        && variant.estimatedReadingTime.length > 0;
    }))).toBe(true);
    expect(newsVariants.every((variants) => variants.simple.standfirst !== variants.advanced.standfirst && variants.simple.opening?.title !== variants.advanced.opening?.title)).toBe(true);
  });

  it('keeps each Advanced News report technically complete', () => {
    expect(articles.every((article) => {
      const variant = getNewsVariants(article, newsEditorial[article.slug]).advanced;
      const placements = variant.sections.flatMap((section) => section.exhibits ?? []);
      return variant.sections.length >= 5
        && variant.sections.length <= 8
        && variant.sections.filter((section) => section.role === 'counterargument').length === 1
        && placements.filter((placement) => placement.kind === 'evidence').length === 2
        && placements.filter((placement) => placement.kind === 'system').length === 1;
    })).toBe(true);
  });

  it('adds report-specific technical depth to every Advanced section', () => {
    expect(articles.every((article) => advancedNewsDepth[article.slug]?.length === newsEditorial[article.slug].sections.length && advancedNewsDepth[article.slug].every((paragraphs) => paragraphs.length >= 2))).toBe(true);
    expect(cases.every((study) => advancedCaseDepth[study.slug]?.length === caseEditorial[study.slug].sections.length && advancedCaseDepth[study.slug].every((paragraphs) => paragraphs.length >= 2))).toBe(true);
    expect(articles.every((article) => advancedNewsSections[article.slug]?.length >= 1)).toBe(true);
    expect(cases.every((study) => advancedCaseSections[study.slug]?.length >= 2)).toBe(true);
    expect(Object.keys(advancedNewsExtensionSections)).toHaveLength(6);
    expect(Object.keys(advancedCaseExtensionSections)).toHaveLength(4);
    const variants = [
      ...articles.map((article) => getNewsVariants(article, newsEditorial[article.slug]).advanced),
      ...cases.map((study) => getCaseVariants(study, caseResearch[study.slug]).advanced),
    ];
    expect(variants.every((variant) => variant.sections.reduce((total, section) => total + section.paragraphs.length, 0) >= 25)).toBe(true);
  });

  it('gives every case study one decision-led operating narrative', () => {
    expect(cases.every((item) => {
      const editorial = caseEditorial[item.slug];
      return editorial?.openingParagraphs.length >= 2
        && editorial.centralQuestion.length > 0
        && editorial.thesis.length > 0
        && editorial.statusStatement.length > 0
        && editorial.sections.length >= 4
        && editorial.sections.length <= 6
        && editorial.sections.every((section) => section.paragraphs.length >= 3);
    })).toBe(true);
  });

  it('uses concise, information-led case section and exhibit titles', () => {
    expect(cases.every((item) => {
      const editorial = caseEditorial[item.slug];
      const titles = [editorial.evidenceTitle, editorial.processTitle, editorial.systemTitle, ...editorial.sections.map((section) => section.heading)];
      return titles.every((title) => title.split(/\s+/).length <= 6 && !/^(the|a|an)\s/i.test(title));
    })).toBe(true);
  });

  it('gives every article one title, not one per file', () => {
    // The index reads newsEditorial and the home page reads content, so a
    // divergence here shows the same piece under two names. It did.
    expect(articles.every((item) => newsEditorial[item.slug].title === item.title)).toBe(true);
  });

  it('uses report-specific, information-led news headings', () => {
    expect(articles.every((item) => newsEditorial[item.slug].sections.every((section) => section.heading.split(/\s+/).length <= 6 && !/^(the|a|an)\s/i.test(section.heading)))).toBe(true);
  });

  it('places each case graphic inside its argument with interpretation after it', () => {
    expect(cases.every((item) => {
      const editorial = caseEditorial[item.slug];
      const placements = editorial.sections.flatMap((section) => (section.exhibits ?? []).map((placement) => ({ placement, paragraphCount: section.paragraphs.length })));
      return placements.length === 3
        && new Set(placements.map(({ placement }) => placement.kind)).size === 3
        && placements.every(({ placement, paragraphCount }) => placement.afterParagraph < paragraphCount - 1)
        && editorial.evidenceInterpretation.establishes.length > 0
        && editorial.evidenceInterpretation.doesNotEstablish.length > 0
        && editorial.evidenceInterpretation.management.length > 0;
    })).toBe(true);
  });

  it('states the evidence position on every case and integrates sources into its argument', () => {
    expect(cases.every((item) => {
      const editorial = caseEditorial[item.slug];
      const hasInlineSource = editorial.sections.some((section) => section.paragraphs.some((paragraph) => paragraph.sources?.length));
      // Every engagement written up without naming the client must say why the
      // client is withheld, and must say that its figures are targets and not
      // audited outcomes.
      const statement = editorial.statusStatement.toLowerCase();
      const explainsAnonymity = /not (?:to be )?named|anonym|withheld|privilege/.test(statement);
      const qualifiesFigures = /target|not been measured|remain unmeasured|awaiting audit/.test(statement);
      return hasInlineSource && (item.status !== 'Anonymised' || (explainsAnonymity && qualifiesFigures));
    })).toBe(true);
  });

  it('integrates two interpreted evidence views into every news essay', () => {
    expect(articles.every((item) => {
      const editorial = newsEditorial[item.slug];
      const placedViews = editorial.sections.flatMap((section) => section.exhibits?.filter((exhibit) => exhibit.kind === 'evidence') ?? []);
      const systemViews = editorial.sections.flatMap((section) => section.exhibits?.filter((exhibit) => exhibit.kind === 'system') ?? []);
      return placedViews.length === 2
        && new Set(placedViews.map((item) => item.view)).size === 2
        && systemViews.length === 1
        && [...placedViews, ...systemViews].every((item) => item.afterParagraph >= 0)
        && newsEvidenceViews[item.slug]?.length === 2
        && newsEvidenceViews[item.slug].every((view) => view.points.length >= 2 && view.source.length > 0 && view.interpretation?.establishes && view.interpretation.doesNotEstablish && view.interpretation.management);
    })).toBe(true);
  });

  it('provides one conclusion section and one action agenda per report', () => {
    expect(articles.every((item) => {
      const sections = newsEditorial[item.slug].sections;
      const conclusion = sections.at(-1);
      return Boolean(conclusion && conclusion.role === 'conclusion' && conclusion.paragraphs.length >= 3 && sections.filter((section) => section.role === 'conclusion').length === 1 && sections.filter((section) => section.role === 'counterargument').length === 1 && item.actions.length >= 3 && item.actions.length <= 4);
    })).toBe(true);
    expect(cases.every((item) => {
      const sections = caseEditorial[item.slug].sections;
      const conclusion = sections.at(-1);
      return Boolean(conclusion && conclusion.role === 'conclusion' && conclusion.paragraphs.length >= 3 && sections.filter((section) => section.role === 'conclusion').length === 1 && item.nextSteps.length >= 3 && item.nextSteps.length <= 4);
    })).toBe(true);
  });

  it('keeps every numerical body claim sourced or explicitly qualified', () => {
    const hasNumber = /\b\d+(?:\.\d+)?(?:%|x|:\d+)?\b/;
    const qualified = /illustrative|composite|modelled|design|target|measured|not (?:a |an )?measured|proposed|discovery|pilot|baseline|hypothesis|assumptions?|weeks?|minutes?|percent|survey|research/i;
    expect(articles.every((item) => newsEditorial[item.slug].sections.every((section) => section.paragraphs.every((paragraph) => !hasNumber.test(paragraph.text) || paragraph.sources?.length || qualified.test(paragraph.text))))).toBe(true);
    expect(cases.every((item) => caseEditorial[item.slug].sections.every((section) => section.paragraphs.every((paragraph) => !hasNumber.test(paragraph.text) || paragraph.sources?.length || qualified.test(paragraph.text) || item.status === 'Anonymised')))).toBe(true);
  });

  it('opens every article on a concrete situation that claims no client', () => {
    // The openings used to be labelled "composite vignette", which disclaimed
    // them rather than writing them. They are now descriptions of a situation
    // the reader will recognise, so what has to hold is that they are concrete
    // (a titled scene, developed over more than one paragraph) and that none of
    // them claims an engagement the firm cannot evidence.
    expect(articles.every((item) => {
      const editorial = newsEditorial[item.slug];
      const scene = editorial.sceneParagraphs.join(' ');
      const concrete = editorial.sceneTitle.length > 20 && editorial.sceneParagraphs.length >= 2;
      const claimsNoClient = !/(our client|we were engaged|Quiet Gears was)/i.test(scene);
      return concrete && claimsNoClient;
    })).toBe(true);
  });

  it('preserves reduced motion, focus visibility and accessible chart state', () => {
    const styles = readFileSync('app/globals.css', 'utf8');
    const chart = readFileSync('components/InteractiveEvidence.tsx', 'utf8');
    // Matched without regard to whitespace: the stylesheet is now formatted
    // for reading, so an exact minified string would fail on formatting alone.
    expect(styles.replace(/\s+/g, '')).toContain('@media(prefers-reduced-motion:reduce)');
    expect(styles).toContain(':focus-visible');
    expect(chart).toContain('aria-labelledby');
    expect(chart).toContain('aria-pressed');
    expect(chart).toContain('onFocus');
  });

  it('implements persistent, keyboard-operable reading controls with Advanced as the no-script default', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    const control = readFileSync('components/ReadingModeSwitch.tsx', 'utf8');
    const newsPage = readFileSync('app/news/[slug]/page.tsx', 'utf8');
    const casePage = readFileSync('app/case-studies/[slug]/page.tsx', 'utf8');
    expect(layout).toContain('data-reading-mode="advanced"');
    expect(layout).toContain('quiet-gears-reading-mode');
    expect(control).toContain('localStorage.setItem');
    expect(control).toContain('aria-pressed');
    expect(control).toContain('aria-controls');
    expect(control).toContain('<button');
    expect(newsPage).toContain('idPrefix={`${mode}-news-${article.slug}`}');
    expect(casePage).toContain('idPrefix={`${mode}-case-${study.slug}`}');
  });

  it('keeps headings and paragraph openings report-specific', () => {
    const reports = [
      ...articles.map((article) => ({ slug: article.slug, variants: getNewsVariants(article, newsEditorial[article.slug]) })),
      ...cases.map((study) => ({ slug: study.slug, variants: getCaseVariants(study, caseResearch[study.slug]) })),
    ];
    const headingOwners = new Map<string, Set<string>>();
    const openingOwners = new Map<string, Set<string>>();
    reports.forEach(({ slug, variants }) => {
      (['simple', 'advanced'] as const).forEach((mode) => variants[mode].sections.forEach((section) => {
        const heading = section.heading.toLowerCase();
        headingOwners.set(heading, (headingOwners.get(heading) ?? new Set()).add(slug));
        section.paragraphs.forEach(({ text }) => {
          const opening = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).slice(0, 7).join(' ');
          openingOwners.set(opening, (openingOwners.get(opening) ?? new Set()).add(slug));
        });
      }));
    });
    expect([...headingOwners.values()].every((owners) => owners.size === 1)).toBe(true);
    expect([...openingOwners.values()].every((owners) => owners.size === 1)).toBe(true);
  });

  it('contains no tables or prohibited editorial templates in published report data', () => {
    const corpus = JSON.stringify({ cases, articles, newsEditorial, caseEditorial, newsEvidenceViews, advancedNewsDepth, advancedCaseDepth, advancedNewsSections, advancedCaseSections, advancedNewsExtensionSections, advancedCaseExtensionSections }).toLowerCase();
    expect(corpus).not.toContain('rather than');
    expect(corpus).not.toContain('instead of');
    expect(corpus).not.toContain('the graphic establishes');
    expect(corpus).not.toContain('the unresolved question');
    expect(corpus).not.toContain('ai-powered transformation');
    expect(readFileSync('app/news/[slug]/page.tsx', 'utf8')).not.toContain('<table');
    expect(readFileSync('app/case-studies/[slug]/page.tsx', 'utf8')).not.toContain('<table');
  });

  it('places source links inside the news argument', () => {
    expect(articles.every((item) => newsEditorial[item.slug].sections.some((section) => section.paragraphs.some((paragraph) => paragraph.sources?.length)))).toBe(true);
  });

  it('spells out the client service and first-conversation pipeline', () => {
    expect(serviceJourney).toHaveLength(6);
    expect(servicePathways).toHaveLength(3);
    expect(firstConversation).toHaveLength(3);
  });

  it('does not use em dashes in published content', () => {
    expect(JSON.stringify({ cases, articles, caseResearch, articleResearch, serviceJourney, servicePathways, newsEditorial, caseEditorial, newsEvidenceViews, advancedNewsDepth, advancedCaseDepth, advancedNewsSections, advancedCaseSections, advancedNewsExtensionSections, advancedCaseExtensionSections })).not.toContain('—');
  });
});
