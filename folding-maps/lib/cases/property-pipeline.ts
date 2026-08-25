import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'property-pipeline',
    image: '/images/case-property.svg',
    sector: 'Real estate',
    title: 'Giving property teams one view of the pipeline',
    summary: 'A transaction workspace connecting enquiries, documents, decisions and follow-ups.',
    status: 'Anonymised',
    brief: 'Redesigning the property pipeline around stage gates, each with a named colleague who clears it. The client is not named here at their request, and the control allocations on this page are design judgements agreed for the work. The concept reduces duplicate entry, keeps documents linked to decisions and gives leadership a current view of progress and risk.',
    metrics: [
      { value: '1', label: 'pipeline view', detail: 'Across commercial and delivery teams' },
      { value: '5', label: 'stage gates', detail: 'From qualification to completion' },
      { value: '3', label: 'control roles', detail: 'Owner, reviewer and approver' },
    ],
    barSubtitle: 'Modelled share of control effort by transaction stage.',
    bars: [
      { label: 'Qualification', value: 52, display: '12%' },
      { label: 'Evidence collection', value: 100, display: '31%' },
      { label: 'Review and negotiation', value: 84, display: '26%' },
      { label: 'Completion readiness', value: 68, display: '21%' },
      { label: 'Close and archive', value: 32, display: '10%' },
    ],
    barNote: 'Source: Quiet Gears operating model. The percentages are a design allocation offered for discussion. None of them measures staff time.',
    phases: [
      { label: 'Qualify', detail: 'Capture the opportunity, parties and decision criteria.' },
      { label: 'Evidence', detail: 'Collect documents and validate the minimum data set.' },
      { label: 'Progress', detail: 'Coordinate decisions, deadlines and external parties.' },
      { label: 'Complete', detail: 'Confirm readiness, record approval and archive evidence.' },
    ],
    code: {
      title: 'One transaction record connects evidence and action',
      lines: ['deal = pipeline.open(enquiry)', 'evidence = documents.index(deal)', 'gate = stages.evaluate(deal, evidence)', 'action = exceptions.next(gate)', 'report = portfolio.aggregate(deal)'],
      nodes: ['Enquiries', 'Transaction record', 'Document index', 'Action queue', 'Portfolio reporting'],
    },
    nextSteps: ['Choose one repeatable transaction type', 'Agree stage-gate definitions with users', 'Import a representative set of live records', 'Measure flow and exception quality for six weeks'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'Naming the business would identify its counterparties, so it is withheld. The allocations, targets and expected benefits on this page are design judgements agreed for the work, and none has yet been measured in production.',
  thesis: 'A property pipeline becomes decision-useful only when one transaction can prove the stage it has reached through current evidence, a next action with a name against it, and any unresolved dependency in plain view.',
  sceneLabel: 'The situation',
  openingTitle: 'A busy transaction looks healthy until one missing approval changes the week',
  openingParagraphs: [
    'Calls have been made, emails exchanged and documents revised, so a transaction appears to be progressing. During the Friday review, a colleague asks for the approval supporting its current stage. The evidence cannot be found, the timetable moves and the team begins reconstructing what it believed had been settled.',
    'The representative transaction is fictional. It tests whether a workspace can expose missing evidence early without forcing professionals to maintain a second reporting process.',
  ],
  centralQuestion: 'Everything turns on whether one transaction record separates activity from readiness early enough to protect the timetable while leaving professional judgement intact.',
  evidenceTitle: 'Modelled control allocation by transaction stage',
  processTitle: 'Enquiry to evidence-backed completion',
  systemTitle: 'Transaction evidence and action architecture',
  evidenceInterpretation: {
    establishes: 'The allocation concentrates control effort in evidence collection, review and completion readiness.',
    doesNotEstablish: 'The percentages are not observed time, cost, risk frequency or outcomes from a live property portfolio.',
    management: 'The pilot should test stage definitions and early exception visibility before funding broader workflow scope.',
  },
  sections: [
    {
      heading: 'Transaction readiness gap',
      paragraphs: [
        { text: 'The transaction contains plenty of activity but cannot support the statement that it is ready to advance. The missing approval exposes a divergence between the stage the transaction is recorded at, the evidence actually held, and who is carrying the next decision. Document management accounts for only part of that failure.' },
        { text: 'Selected transactions provide the baseline. For each one, the stated stage should be checked against required evidence, the first visible sign of every late dependency dated, and review preparation measured. RICS research reports limited scaled AI adoption and material integration barriers, which favours a bounded workflow hypothesis with modest scope.', sources: [0, 1] },
        { text: 'The Friday review should operate as a decision forum. Testing that proposition requires tracing the missing approval back to the moment when the transaction first ceased to be evidence-ready.' },
      ],
    },
    {
      heading: 'Earliest visible dependency',
      transition: 'The missing approval invalidates the stated stage, so discovery reconstructs when the dependency first became knowable.',
      paragraphs: [
        { text: 'Reconstruction begins with the stage label, then asks which documents and approvals make it valid. The missing approval leads to an earlier message, which exposes an unanswered dependency, which reveals that nobody had been carrying it toward the deadline. A late document problem was therefore an earlier decision-architecture problem.' },
        { text: 'The allocation shows where control effort concentrates across qualification, evidence collection, review, completion readiness and archive. The percentages are a design position offered for challenge; they contain no measured staff time and no benefit forecast.' },
        { text: 'The allocation shows where control work is expected to concentrate in this transaction type. Its shares cannot be transferred to another type without fresh evidence. The turning point replaces activity-based status with an evidence test: a stage may advance only when named facts, documents and approval are current.' },
      ],
      exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
    },
    {
      heading: 'Evidence-backed stage gates',
      transition: 'Reconstruction shows that activity concealed readiness risk, which makes evidence-backed progression the central design requirement.',
      paragraphs: [
        { text: 'The target process qualifies the parties and objective, collects minimum evidence, coordinates decisions and dependencies, then confirms completion readiness and archives the record. Its five gates are a starting sequence. Whether five is enough has to be tested by transaction type.' },
        { text: 'The workspace connects enquiries, one transaction record, a source-linked document index, an exception queue and portfolio reporting. The system view shows how daily work and management review can draw from the same evidence. Platform selection remains open.' },
        { text: 'A larger CRM rollout was rejected because it could digitise activity without defining readiness. Fully automatic extraction was also rejected: fields may be proposed, but remain unconfirmed until a professional inspects the source. RICS guidance on responsible AI use supports this boundary.', sources: [2] },
        { text: 'The diagrams connect stage, evidence and action into one operating sequence. Extraction accuracy, adoption and completion timing sit outside their evidential reach. Live records and a comparison baseline are required before any of those outcomes can be claimed.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Single-transaction pilot',
      transition: 'The stage-gate model defines the target workflow; a narrow pilot must now test whether users maintain it under live variation.',
      paragraphs: [
        { text: 'The pilot starts with one repeatable transaction type because variation is a design risk. Users agree minimum evidence for each stage, import representative live records and operate the workspace for a bounded period with a clear route for exceptions.' },
        { text: 'Acceptance examines missing evidence by stage, unresolved dependency age, stage reversals, late escalations, manual reconciliations and material extraction corrections. Earlier visibility is the target. No reduction in delay, duplicate entry or reporting effort is treated as achieved before measurement.' },
        { text: 'The trade-off is between discipline and burden. Requiring evidence at every gate may slow low-risk work or encourage superficial completion. The design uses only data needed for the next decision and explicit exceptions. Parallel spreadsheets would be evidence that the model or interface is failing.' },
      ],
    },
    {
      heading: 'Expansion criteria',
      role: 'conclusion',
      transition: 'The single-transaction pilot creates evidence on visibility and burden, which must govern any expansion in scope.',
      paragraphs: [
        { text: 'What exists is a transaction model, control logic, architecture and evaluation plan. Implementation and measured improvement are still ahead of the work.' },
        { text: 'The Friday review sets the acceptance test. The pilot must show whether the missing approval appears as an owned exception early enough to protect the timetable and whether colleagues trust the record without rebuilding status elsewhere.' },
        { text: 'Expansion to another transaction type is justified only if stage evidence is maintained, dependencies appear earlier and the reporting effort does not simply move into another channel. Otherwise the stage model, scope or interface should be revised first.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '1%', finding: 'Only a small share of surveyed built-environment firms report AI scaled across projects', implication: 'The near-term opportunity is a bounded transaction workflow with governed data. The evidence will not carry a broad transformation claim.', source: 'RICS, Artificial Intelligence in Construction Report 2025', href: 'https://www.rics.org/news-insights/artificial-intelligence-in-construction-report' },
  { statistic: '37%', finding: 'System integration is a leading reported barrier in the RICS survey', implication: 'Connecting evidence, stage gates and actions is likely to matter more than adding a standalone assistant.', source: 'RICS, AI in Construction 2025 findings', href: 'https://www.rics.org/news-insights/optimism-high-for-ai-in-construction-but-skills-shortages-and-integration-challenges-adoption' },
  { statistic: 'Guardrails', finding: 'RICS guidance emphasises professional judgement and responsible AI use', implication: 'Extracted fields and generated summaries should remain proposals until the qualified professional confirms them.', source: 'RICS, Responsible use of AI in surveying practice', href: 'https://www.rics.org/profession-standards/rics-standards-and-guidance/conduct-competence/responsible-use-of-ai' },
  { statistic: '4 functions', finding: 'NIST structures AI risk activity around govern, map, measure and manage', implication: 'Transaction automation needs a named operating manager, a context map, evaluated controls and a live route for handling failure.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
];
