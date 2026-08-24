import type { CaseExhibitPlacement } from '@/lib/caseEditorial';
import { caseEditorial } from '@/lib/caseEditorial';
import type { Article, CaseStudy, ResearchFinding } from '@/lib/content';
import type { NewsEditorial, NewsExhibitPlacement } from '@/lib/newsEditorial';
import type { ReportParagraph, ReportSection, ReportVariant } from '@/lib/reportNarrative';
import { advancedCaseDepth, advancedCaseExtensionSections, advancedCaseSections, advancedNewsDepth, advancedNewsExtensionSections, advancedNewsSections } from '@/lib/advancedDepth';

const simpleNewsOpenings: Record<string, { title: string; paragraphs: string[] }> = {
  'ai-integration-gap': {
    title: 'A busy assistant can leave the workflow unchanged',
    paragraphs: ['A manager can see colleagues using AI every day while customer response, rework and queue age remain static. The missing link is usually the operating route between an input and an accepted outcome.', 'This executive version asks which workflow deserves integration and which evidence should govern the decision.'],
  },
  'open-weight-price-war': {
    title: 'A lower model invoice can hide a higher service cost',
    paragraphs: ['A procurement team can cut token expense and still increase review, exception and engineering work. The economic unit that matters is an accepted business task.', 'This executive version follows that task through quality, control and sourcing decisions.'],
  },
  'automation-before-agents': {
    title: 'An urgent exception reveals how much the workflow was hiding',
    paragraphs: ['A general agent can complete the normal path in a demonstration and fail when information is missing or authority is unclear. Live operations are defined by those awkward states.', 'This executive version sets a practical sequence for mapping work, allocating authority and testing reliability.'],
  },
  'cold-chain-collaboration': {
    title: 'One excursion needs more evidence than one temperature reading',
    paragraphs: ['An operator sees a threshold crossing but still needs duration, asset state, product context and corrective evidence. The operational decision begins after the alert.', 'This executive version explains the minimum exception record and the controls required for a parallel pilot.'],
  },
  'small-teams-ai-advantage': {
    title: 'Leadership proximity creates an opportunity, then a constraint',
    paragraphs: ['A specialist firm can assemble the process owner, user, sponsor and builder quickly. The same firm may have little spare data, review or delivery capacity.', 'This executive version explains where focus can convert short decision lines into useful operating evidence.'],
  },
  'measure-automation-value': {
    title: 'The hours appear in the calculation before they appear in the business',
    paragraphs: ['A project reports theoretical time released, while finance sees no cost change and operations sees no deliberate capacity decision. The missing step is a benefits chain with owners and evidence.', 'This executive version separates operating improvement, capacity, cash, quality and risk.'],
  },
  'legal-ai-source-grounded-work': {
    title: 'A plausible legal proposition still needs an authoritative source',
    paragraphs: ['A lawyer receives a polished research note whose citation does not support the proposition for the relevant court, date or jurisdiction. Fluency has shortened drafting while extending verification.', 'This executive version defines a source-grounded route from matter question to professional sign-off.'],
  },
  'hospitality-ai-guest-recovery': {
    title: 'A room failure becomes an identity and authority problem',
    paragraphs: ['A guest reaches the property after a delayed journey and finds that the reserved room is unavailable. Reservation, loyalty, maintenance and compensation facts sit in different systems.', 'This executive version follows the recovery decision across those records and identifies where human authority remains essential.'],
  },
};

const simpleCaseOpenings: Record<string, { title: string; paragraphs: string[] }> = {
  'yacht-operations': { title: 'One enquiry exposes four different records', paragraphs: ['A returning customer asks about a project linked to a vessel, a prior enquiry and several commitments. The team can answer only after reconciling messages, files and memory.', 'The first release is judged by identity, event history, current state, ownership and a safe migration route.'] },
  'cold-chain': { title: 'An eight-minute excursion begins as an incomplete case', paragraphs: ['A sensor crosses a threshold, while signal validity, asset state and product exposure remain unknown. This fictional item explains the proposed design and contains no client result.', 'The release question is whether a read-only service can assemble a more useful case without weakening existing controls.'] },
  'property-pipeline': { title: 'A transaction stalls behind one missing dependency', paragraphs: ['A busy file appears to be progressing until a required approval cannot be traced. This fictional transaction explains the design and contains no client result.', 'The release question is whether stage, evidence and dependencies can be maintained in one reviewable record.'] },
  'professional-services-intake': { title: 'A strong referral arrives with incomplete control evidence', paragraphs: ['Commercial interest starts immediately, while conflict, eligibility and scope checks remain incomplete. This fictional referral explains the design and contains no client result.', 'The release question is whether preparation can improve while professional acceptance stays attributable.'] },
  'field-service-planning': { title: 'An urgent job changes every promise around it', paragraphs: ['A dispatcher can insert the job only after checking skills, parts, travel, working limits and existing commitments. This fictional service item explains the design and contains no client result.', 'The release question is whether a planner can produce feasible options whose service trade-offs remain visible.'] },
};

const simpleCaseHeadings: Record<string, string[]> = {
  'yacht-operations': ['Fragmented customer history', 'Identity and state diagnosis', 'Event-led release design', 'Staged migration controls', 'Live-use decision'],
  'cold-chain': ['Incomplete excursion evidence', 'Telemetry validity first', 'Read-only exception service', 'Policy and OT controls', 'Observation-mode decision'],
  'property-pipeline': ['Activity without transaction proof', 'Stage and dependency diagnosis', 'Provenance-led workspace', 'Gate controls and adoption', 'Single-type pilot decision'],
  'professional-services-intake': ['Referral evidence gap', 'Control and judgement split', 'Matter-candidate workspace', 'Confidentiality and evaluation', 'Professional release decision'],
  'field-service-planning': ['Urgent-job planning conflict', 'Constraint and confidence diagnosis', 'Feasible-option service', 'Dispatcher control loop', 'Shadow-planning decision'],
};

function sourceParagraph(text: string, sources: { label: string; href: string }[]): ReportParagraph {
  return { text, sources: /\b\d+(?:\.\d+)?(?:%|x)?\b/.test(text) ? sources : undefined };
}

function addDepth<TExhibit>(slug: string, sections: ReportSection<TExhibit>[], depth: Record<string, ReportParagraph[][]>) {
  return sections.map((section, index) => ({
    ...section,
    paragraphs: [...section.paragraphs, ...(depth[slug]?.[index] ?? [])],
  }));
}

function insertSections<TExhibit>(sections: ReportSection<TExhibit>[], additions: ReportSection<never>[], beforeRole: 'counterargument' | 'conclusion') {
  const insertionIndex = sections.findIndex((section) => section.role === beforeRole);
  if (insertionIndex < 0) return sections;
  return [...sections.slice(0, insertionIndex), ...additions, ...sections.slice(insertionIndex)];
}

export function getNewsVariants(article: Article, advanced: NewsEditorial): Record<'simple' | 'advanced', ReportVariant<NewsExhibitPlacement>> {
  const simpleSections: ReportSection<NewsExhibitPlacement>[] = article.sections.map((section, index) => ({
    heading: section.heading,
    purpose: index === article.sections.length - 1 ? 'Resolve the executive decision.' : `Advance the decision through ${section.heading.toLowerCase()}.`,
    role: index === article.sections.length - 1 ? 'conclusion' : 'analysis',
    paragraphs: section.paragraphs.map((paragraph) => sourceParagraph(paragraph, article.sources)),
    exhibits: index === 1 ? [{ kind: 'evidence', view: 0, afterParagraph: 0 }] : undefined,
  }));
  const opening = simpleNewsOpenings[article.slug];

  return {
    simple: {
      standfirst: article.intro,
      thesis: article.thesis,
      opening: { label: 'Executive operating question', title: opening.title, paragraphs: opening.paragraphs },
      sections: simpleSections,
      actionAgenda: article.actions.slice(0, 3),
      estimatedReadingTime: '6 to 8 minutes',
    },
    advanced: {
      standfirst: advanced.standfirst,
      thesis: advanced.thesis,
      opening: { label: advanced.sceneLabel, title: advanced.sceneTitle, paragraphs: advanced.sceneParagraphs },
      sections: insertSections(addDepth(article.slug, advanced.sections, advancedNewsDepth), [...(advancedNewsSections[article.slug] ?? []), ...(advancedNewsExtensionSections[article.slug] ?? [])], 'counterargument'),
      actionAgenda: article.actions,
      estimatedReadingTime: article.read,
    },
  };
}

function researchSources(research: ResearchFinding[]) {
  return research.map(({ source, href, finding }) => ({ label: source, href, detail: finding }));
}

export function getCaseVariants(study: CaseStudy, research: ResearchFinding[]): Record<'simple' | 'advanced', ReportVariant<CaseExhibitPlacement>> {
  const advanced = caseEditorial[study.slug];
  const sources = researchSources(research);
  const opening = simpleCaseOpenings[study.slug];
  const simpleSections: ReportSection<CaseExhibitPlacement>[] = study.sections.map((section, index) => ({
    heading: simpleCaseHeadings[study.slug][index],
    purpose: index === study.sections.length - 1 ? 'State the current evidence and next release decision.' : `Explain ${section.heading.toLowerCase()} for the representative item of work.`,
    role: index === study.sections.length - 1 ? 'conclusion' : 'analysis',
    paragraphs: section.paragraphs.map((text) => sourceParagraph(text, sources)),
    exhibits: index === 1 ? [{ kind: 'evidence', afterParagraph: 0 }] : undefined,
  }));

  return {
    simple: {
      standfirst: study.summary,
      thesis: study.status === 'In progress' ? advanced.thesis : study.brief,
      opening: { label: study.status === 'In progress' ? 'Representative engagement item' : 'Illustrative operating item', title: opening.title, paragraphs: opening.paragraphs, centralQuestion: advanced.centralQuestion },
      sections: simpleSections,
      actionAgenda: study.nextSteps.slice(0, 3),
      estimatedReadingTime: '6 to 8 minutes',
    },
    advanced: {
      standfirst: study.summary,
      thesis: advanced.thesis,
      opening: { label: advanced.sceneLabel, title: advanced.openingTitle, paragraphs: advanced.openingParagraphs, centralQuestion: advanced.centralQuestion },
      sections: insertSections(addDepth(study.slug, advanced.sections.map((section) => ({
        ...section,
        paragraphs: section.paragraphs.map((paragraph) => ({ text: paragraph.text, sources: paragraph.sources?.map((index) => sources[index]) })),
      })), advancedCaseDepth), [...(advancedCaseSections[study.slug] ?? []), ...(advancedCaseExtensionSections[study.slug] ?? [])], 'conclusion'),
      actionAgenda: study.nextSteps,
      estimatedReadingTime: '18 to 24 minutes',
    },
  };
}
