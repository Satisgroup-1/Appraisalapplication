import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { caseEditorial } from '@/lib/caseEditorial';
import { articleResearch, articles, caseResearch, cases } from '@/lib/content';
import { newsEvidenceViews } from '@/lib/editorialGraphics';
import { firstConversation, serviceJourney, servicePathways } from '@/lib/serviceModel';
import { newsEditorial } from '@/lib/newsEditorial';
import { getCaseReport, getNewsReport } from '@/lib/reportModel';

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

  it('publishes every report as one text with no reading-level variants', () => {
    const reports = [
      ...articles.map((article) => getNewsReport(article, newsEditorial[article.slug])),
      ...cases.map((study) => getCaseReport(study, caseResearch[study.slug])),
    ];
    expect(reports).toHaveLength(13);
    expect(reports.every((report) => report.thesis.length > 0
      && report.opening
      && report.sections.length >= 4
      && report.sections.filter((section) => section.role === 'conclusion').length === 1
      && report.actionAgenda.length >= 3)).toBe(true);
  });

  it('keeps every news report evidentially complete', () => {
    expect(articles.every((article) => {
      const report = getNewsReport(article, newsEditorial[article.slug]);
      const placements = report.sections.flatMap((section) => section.exhibits ?? []);
      const evidence = placements.filter((placement) => placement.kind === 'evidence').length;
      return report.sections.filter((section) => section.role === 'counterargument').length === 1
        && evidence >= 1 && evidence <= 2
        && placements.filter((placement) => placement.kind === 'system').length === 1;
    })).toBe(true);
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
      const titles = [editorial.evidenceTitle, editorial.processTitle, editorial.systemTitle, ...editorial.sections.map((section) => section.heading)].filter((title): title is string => Boolean(title));
      return titles.every((title) => title.split(/\s+/).length <= 9 && !/^(the|a|an)\s/i.test(title));
    })).toBe(true);
  });

  it('gives every article one title, not one per file', () => {
    // The index reads newsEditorial and the home page reads content, so a
    // divergence here shows the same piece under two names. It did.
    expect(articles.every((item) => newsEditorial[item.slug].title === item.title)).toBe(true);
  });

  it('uses report-specific, information-led news headings', () => {
    expect(articles.every((item) => newsEditorial[item.slug].sections.every((section) => section.heading.split(/\s+/).length <= 9 && !/^(the|a|an)\s/i.test(section.heading)))).toBe(true);
  });

  it('places each case graphic inside its argument with interpretation after it', () => {
    expect(cases.every((item) => {
      const editorial = caseEditorial[item.slug];
      const placements = editorial.sections.flatMap((section) => (section.exhibits ?? []).map((placement) => ({ placement, paragraphCount: section.paragraphs.length })));
      const kinds = placements.map(({ placement }) => placement.kind);
      // Process and system always. An evidence placement only where the firm
      // has supplied the count behind the chart, since the page renders
      // nothing for one that has no data.
      return kinds.includes('process')
        && kinds.includes('system')
        && kinds.includes('evidence') === Boolean(item.chart)
        && new Set(kinds).size === kinds.length
        && placements.every(({ placement, paragraphCount }) => placement.afterParagraph < paragraphCount - 1)
        && (!editorial.evidenceInterpretation || (editorial.evidenceInterpretation.establishes.length > 0
          && editorial.evidenceInterpretation.doesNotEstablish.length > 0
          && editorial.evidenceInterpretation.management.length > 0));
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

  it('integrates interpreted evidence views into every news essay', () => {
    expect(articles.every((item) => {
      const editorial = newsEditorial[item.slug];
      const views = newsEvidenceViews[item.slug] ?? [];
      const placedViews = editorial.sections.flatMap((section) => section.exhibits?.filter((exhibit) => exhibit.kind === 'evidence') ?? []);
      const systemViews = editorial.sections.flatMap((section) => section.exhibits?.filter((exhibit) => exhibit.kind === 'system') ?? []);
      return views.length >= 1
        && views.length <= 2
        && placedViews.length === views.length
        && new Set(placedViews.map((item) => item.view)).size === views.length
        && placedViews.every((item) => item.view < views.length)
        && systemViews.length === 1
        && [...placedViews, ...systemViews].every((item) => item.afterParagraph >= 0)
        && views.every((view) => view.points.length >= 2 && view.source.length > 0 && view.interpretation?.establishes && view.interpretation.doesNotEstablish && view.interpretation.management);
    })).toBe(true);
  });

  it('rests at least one chart per article on evidence the firm did not produce', () => {
    // Three articles used to satisfy the two-exhibit rule by charting the
    // firm's own design weightings and then disclaiming them in the adjacent
    // paragraph. A chart of our own priors is an illustration; it cannot be
    // the only evidence an argument stands on.
    expect(articles.every((item) => (newsEvidenceViews[item.slug] ?? []).some((view) => !/^quiet gears/i.test(view.source)))).toBe(true);
  });

  it('states a reading time the article can actually support', () => {
    const bodyWords = (slug: string) => {
      const editorial = newsEditorial[slug];
      return [editorial.standfirst, editorial.thesis, ...editorial.sceneParagraphs,
        ...editorial.sections.flatMap((section) => [section.transition ?? '', ...section.paragraphs.map((paragraph) => paragraph.text)])]
        .join(' ').trim().split(/\s+/).length;
    };
    // Every stated time once overran the piece by a factor of four or five,
    // which is the most easily checked false claim a publisher can make.
    articles.forEach((item) => {
      const claimed = Number(item.read.match(/\d+/)?.[0]);
      const actual = bodyWords(item.slug) / 225;
      expect(Math.abs(claimed - actual)).toBeLessThanOrEqual(2);
    });
  });

  it('publishes no project chart that its own note says establishes nothing', () => {
    // Every one of the five charted the firm's own modelled weightings and
    // then disclaimed the whole chart in its note: 'None of them measures
    // performance', 'None is an empirical finding'. A chart that has to be
    // withdrawn in its own footnote is not an exhibit. Report what discovery
    // actually counted, or drop the chart and make the point in prose.
    const withdrawn = /none (of them )?(measures|is an empirical)|carries no measured|is not an empirical/i;
    expect(cases.every((item) => !item.chart || !withdrawn.test(item.chart.note))).toBe(true);
  });

  it('reserves percentages on a project chart for figures somebody counted', () => {
    // A modelled allocation printed as 31 percent is a fabricated number in a
    // suit. Percentages are permitted where the note says the figure was
    // observed in the engagement.
    const observed = /observed|counted|measured|sampled|recorded in|from the (audit|log|sample)/i;
    expect(cases.every((item) => !item.chart || item.chart.bars.every((bar) => !/%$/.test(bar.display)) || observed.test(item.chart.note))).toBe(true);
  });

  it('does not write every project to one skeleton', () => {
    const shapes = cases.map((item) => caseEditorial[item.slug].sections.map((section) => section.paragraphs.length).join(','));
    expect(new Set(shapes).size).toBeGreaterThanOrEqual(4);
    expect(new Set(cases.map((item) => caseEditorial[item.slug].sceneLabel)).size).toBe(cases.length);
  });

  it('runs each project long enough to carry the reasoning the index promises', () => {
    // The index page says these run longer than a case study usually does
    // because the reasoning is the part worth reading. At 811 to 1,149 words
    // they did not.
    cases.forEach((item) => {
      const editorial = caseEditorial[item.slug];
      const words = [item.summary, editorial.thesis, ...editorial.openingParagraphs, editorial.centralQuestion,
        ...editorial.sections.flatMap((section) => [section.transition ?? '', ...section.paragraphs.map((paragraph) => paragraph.text)])]
        .join(' ').trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(1400);
    });
  });

  it('does not write every article to one skeleton', () => {
    // Six of the eight were 5 sections of exactly 3 paragraphs and the other
    // two were 6 of exactly 4. Uniformity that exact is a template, not a set
    // of arguments that each found their own length.
    const shapes = articles.map((item) => newsEditorial[item.slug].sections.map((section) => section.paragraphs.length).join(','));
    expect(new Set(shapes).size).toBeGreaterThanOrEqual(6);
    expect(new Set(articles.map((item) => newsEditorial[item.slug].sceneLabel)).size).toBe(articles.length);
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

  it('serves one reading level, with no client-side gate on the body text', () => {
    const layout = readFileSync('app/layout.tsx', 'utf8');
    const styles = readFileSync('app/globals.css', 'utf8');
    const newsPage = readFileSync('app/news/[slug]/page.tsx', 'utf8');
    const casePage = readFileSync('app/case-studies/[slug]/page.tsx', 'utf8');
    expect(existsSync('components/ReadingModeSwitch.tsx')).toBe(false);
    [layout, styles, newsPage, casePage].forEach((file) => {
      expect(file).not.toContain('reading-mode');
      expect(file).not.toContain('data-report-mode');
    });
  });

  it('keeps headings and paragraph openings report-specific', () => {
    const reports = [
      ...articles.map((article) => ({ slug: article.slug, report: getNewsReport(article, newsEditorial[article.slug]) })),
      ...cases.map((study) => ({ slug: study.slug, report: getCaseReport(study, caseResearch[study.slug]) })),
    ];
    const headingOwners = new Map<string, Set<string>>();
    const openingOwners = new Map<string, Set<string>>();
    reports.forEach(({ slug, report }) => {
      report.sections.forEach((section) => {
        const heading = section.heading.toLowerCase();
        headingOwners.set(heading, (headingOwners.get(heading) ?? new Set()).add(slug));
        section.paragraphs.forEach(({ text }) => {
          const opening = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).slice(0, 7).join(' ');
          openingOwners.set(opening, (openingOwners.get(opening) ?? new Set()).add(slug));
        });
      });
    });
    expect([...headingOwners.values()].every((owners) => owners.size === 1)).toBe(true);
    expect([...openingOwners.values()].every((owners) => owners.size === 1)).toBe(true);
  });

  it('contains no tables or prohibited editorial templates in published report data', () => {
    const corpus = JSON.stringify({ cases, articles, newsEditorial, caseEditorial, newsEvidenceViews}).toLowerCase();
    expect(corpus).not.toContain('rather than');
    expect(corpus).not.toContain('instead of');
    expect(corpus).not.toContain('the graphic establishes');
    expect(corpus).not.toContain('the unresolved question');
    expect(corpus).not.toContain('ai-powered transformation');
    // Two tics that have now been removed from this site twice. The 'x, not y'
    // construction and 'earns' phrasing both reappeared during the article
    // rewrite, so they are enforced rather than remembered.
    // 'not yet' is temporal and legitimate; the banned tic is the rhetorical
    // contrast pair, 'a decision, not a tool'.
    expect(corpus).not.toMatch(/,\s+not\s+(?!yet\b)/);
    expect(corpus).not.toMatch(/\bearn(s|ed|ing)?\b/);
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
    expect(JSON.stringify({ cases, articles, caseResearch, articleResearch, serviceJourney, servicePathways, newsEditorial, caseEditorial, newsEvidenceViews})).not.toContain('—');
  });
});
