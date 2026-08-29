import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { articles, cases, articleResearch, caseResearch } from '@/lib/content';
import { caseEditorial } from '@/lib/caseEditorial';
import { newsEditorial } from '@/lib/newsEditorial';
import { newsEvidenceViews } from '@/lib/editorialGraphics';
import { industries } from '@/lib/industries';
import { services } from '@/lib/services';

/**
 * The house style, in one place.
 *
 * Every rule below was a real defect first. Each had been removed by hand at
 * least once and came back on the next editing pass, which is the argument for
 * a test rather than a note. The bans used to be spread across three files and
 * applied to different subsets of the content, so a phrase banned in an article
 * survived in a sector note. They apply to everything published here.
 */

const PUBLISHED = {
  articles,
  cases,
  articleResearch,
  caseResearch,
  newsEditorial,
  caseEditorial,
  newsEvidenceViews,
  industries,
  services,
};

const corpus = JSON.stringify(PUBLISHED);
const lower = corpus.toLowerCase();

/** Every string a reader could see, so a rule can be reported against its sentence. */
function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, out));
  return out;
}
const sentences = collectStrings(PUBLISHED).filter((s) => s.length > 25 && !s.startsWith('http'));

/** Headings, titles and labels, which is where several of these tics concentrate. */
const headings = [
  ...articles.flatMap((item) => newsEditorial[item.slug].sections.map((section) => section.heading)),
  ...cases.flatMap((item) => caseEditorial[item.slug].sections.map((section) => section.heading)),
  ...cases.flatMap((item) => [caseEditorial[item.slug].processTitle, caseEditorial[item.slug].systemTitle, caseEditorial[item.slug].evidenceTitle]),
  ...industries.flatMap((item) => [item.contextTitle, item.opportunitiesTitle, item.decisionsTitle, item.controlTitle, item.roadmapTitle]),
  ...services.map((item) => item.title),
].filter((value): value is string => typeof value === 'string');

const offenders = (pattern: RegExp) =>
  sentences.flatMap((s) => (s.match(pattern) ?? []).map((hit) => `${hit}  ←  ${s.slice(0, 110)}`));

describe('house style', () => {
  it('bans the constructions that have been removed from this site more than once', () => {
    // Each of these was cut by hand and reappeared on a later pass.
    expect(lower).not.toContain('rather than');
    expect(lower).not.toContain('instead of');
    expect(offenders(/,\s+not\s+(?!yet\b)/g)).toEqual([]);
    expect(offenders(/\bearn(s|ed|ing)?\b/gi)).toEqual([]);
    expect(corpus).not.toContain('—');
  });

  it('opens no heading or label with an interrogative word', () => {
    // "What we do", "How the work runs", "Where the value is". Eighteen of
    // these were removed at once; the shape reads as a slide deck, and the
    // genre states a claim in its headings.
    const bad = headings.filter((heading) => /^(what|where|how|why|when|which|who|whether)\b/i.test(heading));
    expect(bad).toEqual([]);
  });

  it('states a subject rather than clefting around one', () => {
    // "What the arithmetic omits is everything between the task and the
    // ledger" says no more than "The arithmetic omits everything between the
    // task and the ledger", and announces itself as machine-written.
    expect(offenders(/(?:^|(?<=[.;] ))What\b[^.]{5,110}?\bis\b/g)).toEqual([]);
  });

  it('makes a judgement instead of gesturing at one', () => {
    expect(offenders(/\bworth (?:having|building|naming|knowing|reading|saying)\b/gi)).toEqual([]);
    expect(offenders(/which is (?:the point|precisely why)/gi)).toEqual([]);
    expect(offenders(/\bEverything turns on\b/gi)).toEqual([]);
  });

  it('keeps filler intensifiers scarce', () => {
    // Not banned: each can mark a real contrast. Banned in bulk, because
    // "genuinely difficult and genuinely brief" is what the habit looks like
    // once it is established.
    const hedges = offenders(/\b(genuinely|actually|quietly|precisely|simply|merely)\b/gi);
    expect(hedges.length).toBeLessThanOrEqual(6);
    // Never twice in one sentence.
    const doubled = sentences.filter((s) => (s.match(/\b(genuinely|actually|quietly|precisely)\b/gi) ?? []).length > 1);
    expect(doubled).toEqual([]);
  });

  it('does not reach for one verb every few hundred words', () => {
    // "carries" reached 38 uses and "sits" 23 across the site, concentrated at
    // seven in a single two-thousand-word project. One per report is invisible;
    // four is a writer on autopilot.
    const perReport = [
      ...articles.map((item) => ({ slug: item.slug, text: JSON.stringify(newsEditorial[item.slug]) })),
      ...cases.map((item) => ({ slug: item.slug, text: JSON.stringify(caseEditorial[item.slug]) })),
    ];
    const heavy = perReport
      .map(({ slug, text }) => ({
        slug,
        carry: (text.match(/\bcarr(y|ies|ied|ying)\b/gi) ?? []).length,
        sit: (text.match(/\bsits?\b/gi) ?? []).length,
      }))
      .filter((row) => row.carry > 3 || row.sit > 3);
    expect(heavy).toEqual([]);
  });

  it('keeps the marketing vocabulary out', () => {
    // Banned outright. Each is a word that sounds like meaning.
    expect(offenders(/\b(seamless|holistic|pivotal|unlock|empower|elevate|delve|cutting-edge|game-chang\w+|synerg\w+|tapestry|realm)\b/gi)).toEqual([]);
    // Verb forms only. An evaluation harness is a test rig, and "a harness the
    // buyer controls" is that rig with a relative clause; only the brochure
    // sense is banned. Likewise "bespoke work" names a category of work while
    // "Bespoke AI systems" sells one.
    expect(offenders(/\bharness(?:es|ing)?\s+the\s+(?:power|potential|full|value)/gi)).toEqual([]);
    expect(offenders(/\bleverag(?:e|es|ed|ing)\s+(?:the|its|your|our)\b/gi)).toEqual([]);
    // "Journey" survives only where somebody is on one.
    expect(offenders(/\b(learner|resident|asset|transaction|installed-base) journey\b/gi)).toEqual([]);
    // The marketing surfaces are held tighter than the argued prose.
    const pitch = JSON.stringify({ services, industries });
    expect(pitch.toLowerCase()).not.toContain('bespoke');
    expect(pitch.toLowerCase()).not.toContain('robust');
  });

  it('leaves no sentence stump behind an edit', () => {
    // A previous pass cut "The constraint is not X, it is Y" and shipped "The
    // constraint is." to the industries page. Nothing catches that but a test.
    const stumps = sentences.flatMap((s) =>
      (s.match(/(?:^|(?<=[.] ))[A-Z][a-z]*(?: \w+){0,3} (?:is|are|was|were|does|has|can|will)\.(?= |$)/g) ?? []),
    );
    expect(stumps).toEqual([]);
  });

  it('addresses the reader as an institution would, not as a pitch', () => {
    // Five of the eight contact bands opened on the same imperative ("Tell us
    // where the work is getting stuck"), and the contact page led with it. The
    // register these pages are written to is Infosys's "please complete the
    // form below" and Accenture's "Contact Accenture via the contact
    // information on this page": procedural, third person, and carrying no
    // diagnosis of a reader the firm has not met.
    const pages = ['app/page.tsx', 'app/about/page.tsx', 'app/services/page.tsx', 'app/services/[slug]/page.tsx',
      'app/industries/page.tsx', 'app/industries/[slug]/page.tsx', 'app/case-studies/page.tsx',
      'app/case-studies/[slug]/page.tsx', 'app/news/page.tsx', 'app/contact/page.tsx']
      .map((path) => ({ path, copy: readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '') }));

    pages.forEach(({ path, copy }) => {
      // No heading may instruct the reader.
      const headings = [...copy.matchAll(/<h[12][^>]*>([^<]{4,})<\/h[12]>/g)].map((match) => match[1].trim());
      const commands = headings.filter((heading) => /^(tell us|start with|send |describe |give us|talk to|let us|get in touch)/i.test(heading));
      expect(`${path}: ${commands.join(' | ')}`).toBe(`${path}: `);
    });

    // Second person belongs in the legal notices and the form, where the
    // reader is being addressed about their own data. It is a pitch anywhere
    // a prospective client's situation is being characterised for them.
    const pitching = pages
      .map(({ path, copy }) => ({ path, count: (copy.match(/\byour\b/gi) ?? []).length }))
      .filter((row) => row.count > 1);
    expect(pitching).toEqual([]);
  });

  it('ends a report on its subject, not on a maxim', () => {
    // The no-ai-slop pass removed four kickers: an aphorism standing in for
    // the argument, in the last sentence, where it reads as a conclusion the
    // piece never actually reached. "A firm that cannot meet the third
    // condition has bought a faster route to being wrong." The shapes below
    // are the three that were there; the same sentence earlier in a piece is
    // a claim about a specific artefact and is left alone.
    const closings = [
      ...articles.map((item) => ({ slug: item.slug, sections: newsEditorial[item.slug].sections })),
      ...cases.map((item) => ({ slug: item.slug, sections: caseEditorial[item.slug].sections })),
    ].map(({ slug, sections }) => {
      const paragraphs = sections[sections.length - 1].paragraphs;
      const last = paragraphs[paragraphs.length - 1];
      const sentences = last.text.split(/(?<=[.!?])\s+/);
      return { slug, sentence: sentences[sentences.length - 1] };
    });

    expect(closings.length).toBeGreaterThan(10);
    const maxims = closings.filter(({ sentence }) =>
      /^(?:A|An|The)\s+\w+(?:\s+\w+)?\s+that\s+cannot\s+[^.]{3,70}?\s+(?:is|has|will|becomes|remains)\b/.test(sentence),
    );
    expect(maxims).toEqual([]);
  });

  it('does not close a point with a turn of phrase', () => {
    // "producing that something is a capacity problem no meeting can solve by
    // meeting harder", and the paired "Buyers who read it as a discount...
    // Buyers who read it as headroom..." that framed a real distinction as a
    // rhetorical symmetry.
    expect(offenders(/\bno \w+ can \w+ (?:by|through) \w+ing\b/gi)).toEqual([]);
    const paired = sentences.flatMap((paragraph) => {
      const parts = paragraph.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
      return parts.flatMap((s, index) => {
        const next = parts[index + 1];
        if (!next) return [];
        const [a1, a2] = s.split(' ');
        const [b1, b2] = next.split(' ');
        return a1?.toLowerCase() === b1?.toLowerCase() && a2?.toLowerCase() === b2?.toLowerCase() && a2?.toLowerCase() === 'who'
          ? [`${s.slice(0, 60)} / ${next.slice(0, 60)}`]
          : [];
      });
    });
    expect(paired).toEqual([]);
  });

  it('keeps the closing enquiry band to a heading and a button', () => {
    // The same paragraph, reworded eight times, sat between them on every page
    // and repeated what /contact says once. The band is signage: a statement
    // and a way through.
    const withBands = readdirSync('app', { recursive: true, encoding: 'utf8' })
      .filter((name) => name.endsWith('page.tsx'))
      .map((name) => ({ path: `app/${name}`, copy: readFileSync(`app/${name}`, 'utf8') }))
      .filter(({ copy }) => copy.includes('contact-band'));

    expect(withBands.length).toBeGreaterThan(4);
    const wordy = withBands
      .map(({ path, copy }) => ({
        path,
        prose: copy.slice(copy.indexOf('contact-band')).match(/<p>/g)?.length ?? 0,
      }))
      .filter((row) => row.prose > 0);
    expect(wordy).toEqual([]);
  });

  it('records a licence for every ground image it ships', () => {
    // The band imagery is CC0 and stays that way only if the record is kept
    // in step with the directory. A file with no entry is a file nobody can
    // prove the site is allowed to publish.
    const credits: { file: string; licence: string; source: string }[] = JSON.parse(
      readFileSync('public/images/ground/CREDITS.json', 'utf8'),
    );
    const shipped = readdirSync('public/images/ground').filter((name) => name.endsWith('.jpg'));
    const recorded = new Set(credits.map((entry) => entry.file.replace(/^ground\//, '')));
    expect(shipped.filter((name) => !recorded.has(name))).toEqual([]);
    expect(credits.filter((entry) => !/^cc0/i.test(entry.licence) || !entry.source)).toEqual([]);
  });

  it('holds the page copy to the same bans as the content data', () => {
    // The content files are data; these are the pages a visitor lands on
    // first, and they were drifting under a separate standard.
    const pages = ['app/page.tsx', 'app/about/page.tsx', 'app/services/page.tsx', 'app/industries/page.tsx', 'app/case-studies/page.tsx', 'app/news/page.tsx', 'app/contact/page.tsx']
      .map((path) => ({ path, text: readFileSync(path, 'utf8') }));
    pages.forEach(({ path, text }) => {
      // Comments record past defects on purpose and are not copy.
      const copy = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(`${path}: ${copy}`).not.toContain('rather than');
      expect(`${path}: ${copy}`).not.toContain('instead of');
      expect(`${path}: ${copy}`).not.toMatch(/<(h1|h2|h3)[^>]*>\s*(What|Where|How|Why)\b/);
    });
  });
});
