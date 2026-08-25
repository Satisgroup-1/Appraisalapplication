import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'field-service-planning',
    image: '/images/news-industries.svg',
    sector: 'Field services',
    title: 'Planning field work around priority, capacity and evidence',
    summary: 'A planning layer that turns work orders, skills and location constraints into a reviewable daily plan.',
    status: 'Anonymised',
    brief: 'Supporting dispatch teams by assembling a feasible daily plan from operational constraints. The client is not named here at their request, and the planning weights on this page are design values calibrated against their own operating data. It keeps planners in control while reducing the manual effort required to reconcile urgency, skills, geography and customer commitments.',
    metrics: [
      { value: '6', label: 'planning inputs', detail: 'Joined in one decision layer' },
      { value: '3', label: 'priority bands', detail: 'With explicit override rules' },
      { value: 'Daily', label: 'plan refresh', detail: 'Plus event-led exceptions' },
    ],
    barSubtitle: 'Modelled decision weight in a daily planning model.',
    bars: [
      { label: 'Safety and eligibility', value: 100, display: 'Gate' },
      { label: 'Customer service level', value: 86, display: '30%' },
      { label: 'Operational priority', value: 80, display: '28%' },
      { label: 'Travel efficiency', value: 68, display: '24%' },
      { label: 'Plan stability', value: 52, display: '18%' },
    ],
    barNote: 'Source: Quiet Gears planning model. The weights require calibration against operational data before use.',
    phases: [
      { label: 'Prepare', detail: 'Validate work orders, capacity and mandatory constraints.' },
      { label: 'Optimise', detail: 'Generate feasible options against balanced objectives.' },
      { label: 'Review', detail: 'Explain conflicts and capture dispatcher judgement.' },
      { label: 'Learn', detail: 'Compare plan assumptions with completed work.' },
    ],
    code: {
      title: 'The optimiser proposes, while dispatch retains authority',
      lines: ['inputs = validate(jobs, people, parts)', 'feasible = constraints.solve(inputs)', 'ranked = objectives.score(feasible)', 'plan = dispatcher.review(ranked.first)', 'learning.record(plan, actuals, overrides)'],
      nodes: ['Work orders', 'Constraint solver', 'Option scoring', 'Dispatcher console', 'Performance store'],
    },
    nextSteps: ['Clean six weeks of representative work-order data', 'Agree hard constraints and balanced measures', 'Run shadow planning against live operations', 'Review overrides before enabling recommendations'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'Anonymity here is at the operator’s request. The weights on this page are calibrated against their own operating data, and every improvement figure is a target awaiting audit.',
  thesis: 'A field-service planner creates value only after it separates non-negotiable feasibility from scored preferences and lets dispatchers see the disruption transferred by each option.',
  sceneLabel: 'The situation',
  openingTitle: 'At 07:10, one urgent job changes a plan that took an hour to assemble',
  openingParagraphs: [
    'The dispatcher has balanced engineer skills, locations, parts, promised appointments and working-hour limits. An urgent job arrives. Inserting it may protect one customer while delaying another, increasing travel or breaking a certification rule.',
    'The representative job is fictional. It tests whether a planning layer can produce feasible, explainable options while the dispatcher retains authority over the published day.',
  ],
  centralQuestion: 'The service is worth running if it absorbs an urgent job with visible trade-offs and no breach of a hard constraint, and without imposing unacceptable churn on customers and engineers.',
  evidenceTitle: 'Daily planning gate and weights',
  processTitle: 'Work order to published plan',
  systemTitle: 'Feasible-option planning architecture',
  evidenceInterpretation: {
    establishes: 'The score treats safety and eligibility as a gate, then balances service, priority, travel and stability.',
    doesNotEstablish: 'The weights remain uncalibrated and carry no evidence about route, service, overtime or planning improvements.',
    management: 'Shadow planning must reveal whether the objectives and constraints produce acceptable options before dispatch relies on them.',
  },
  sections: [
    {
      heading: 'Urgent-job planning conflict',
      paragraphs: [
        { text: 'The urgent job carries far more than a postcode: priority, scope, likely duration, parts requirements and eligibility conditions. Existing assignments carry the same operational facts plus a customer promise. A route that minimises distance can still move the wrong appointment or assign an ineligible engineer.' },
        { text: 'Work-order fields, rejection reasons, reassignment, disruption and the gap between planned and actual duration and travel form the baseline. Research describing AI as an amplifier supports the risk hypothesis: weak inputs and unclear priorities are likely to propagate faster unless the design corrects them.', sources: [0] },
        { text: 'The central question is whether the 07:10 job can be absorbed through a feasible and explainable change. Before scoring alternatives, discovery must establish whether work and resource data can support any valid plan.' },
      ],
    },
    {
      heading: 'Feasibility before scoring',
      transition: 'The urgent job exposes competing promises, so discovery must first establish which assignments are valid before comparing their desirability.',
      paragraphs: [
        { text: 'Discovery validates the job’s scope, location, duration, parts and priority. Missing duration makes the day appear to fit when it may not. It then checks engineer availability, certification and working-hour rules. Only after those conditions are satisfied can travel, service, urgency and stability be compared.' },
        { text: 'The decision model begins with a safety and eligibility gate, then allocates preference weight across service, priority, travel and stability. Every percentage is proposed for calibration and contains no measured preference or performance.' },
        { text: 'The feasibility view rules out any assignment that breaches a hard constraint, regardless of its score. Choosing among the remaining options still requires a calibrated balance of preferences. This separation displaced the original idea of one blended optimisation score.' },
      ],
      exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
    },
    {
      heading: 'Constraint and preference architecture',
      transition: 'Separating hard rules from preferences changes the machinery required to generate and explain a plan.',
      paragraphs: [
        { text: 'Validated work orders and capacity feed the generation of feasible options. The dispatcher sees the trade-offs, publishes a decision and later records actuals. This proposed process contains no evidence that a solver has improved a live plan.' },
        { text: 'Approved work orders flow through a constraint solver and option scoring into the dispatcher console, with actuals stored for later review. The solver removes invalid assignments, the score ranks valid options and the dispatcher decides. The architecture is a design position, and deliberately vendor-neutral.' },
        { text: 'A distance-only optimiser was rejected because it can transfer cost into missed service or unstable plans. Continuous automatic replanning was rejected because each mathematically better route may break a commitment. NCSC guidance supports validating work orders and resources before they influence the plan.', sources: [1] },
        { text: 'The two views keep feasibility, preference and authority distinct. Accuracy of duration, travel and parts data remains unknown, so shadow planning must measure it as an input to every recommendation.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Shadow-planning evidence',
      transition: 'The architecture defines feasible options and dispatcher authority; shadow operation must test whether its assumptions survive real work.',
      paragraphs: [
        { text: 'The pilot runs recommendations beside the live plan for representative weeks. Dispatchers see feasible alternatives but continue to publish the schedule. Each rejection or amendment carries a reason such as missing local knowledge, unrealistic duration, customer sensitivity or an unmodelled constraint.' },
        { text: 'Acceptance requires every assignment to pass skill, availability, safety and parts checks. Among feasible plans, service, travel, overtime and stability must remain within agreed bounds. Explanation quality, churn, override reasons and error by job category provide evidence. No improvement is claimed before comparison with actuals.' },
        { text: 'Shadow operation consumes attention and delays reliance. In return, overrides reveal whether errors arise from the model, data or policy. NIST lifecycle guidance supports continuing measurement and management across the operating life of the system.', sources: [2] },
      ],
    },
    {
      heading: 'Live recommendation threshold',
      role: 'conclusion',
      transition: 'Override and actuals data from shadow planning provide the balanced evidence required before recommendations enter the live workspace.',
      paragraphs: [
        { text: 'The case defines the inputs, constraint logic, preference weights, architecture and pilot measures. Travel, overtime, planning effort and service failure have yet to be measured.' },
        { text: 'The 07:10 urgent job supplies the release test. A recommendation must absorb it without an invalid assignment, explain which commitments move and remain defensible after actual duration, travel and service impact are known.' },
        { text: 'Recommendations may enter the live workspace only with feasible assignments, balanced outcomes, understandable rationale and a learning loop that prevents rejected suggestions from recurring. If route efficiency improves while service or stability deteriorates, the correct decision is to recalibrate or stop.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: 'Amplifier', finding: 'Google DORA finds that AI magnifies existing organisational strengths and weaknesses', implication: 'Poor work-order data and unclear priorities will be amplified by an optimiser unless corrected first.', source: 'Google DORA, State of AI-assisted Software Development 2025', href: 'https://dora.dev/research/2025/dora-report/' },
  { statistic: 'Known good', finding: 'NCSC recommends schema-based validation at operational trust boundaries', implication: 'Jobs, resource data and telemetry should be validated before they influence a daily plan.', source: 'NCSC, Standardised and secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' },
  { statistic: 'Lifecycle', finding: 'NIST risk guidance expects measurement and management throughout operation', implication: 'Overrides, actual durations and plan failures should feed continuing review after the initial model assessment.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { statistic: '21%', finding: 'Only a minority of AI-using UK businesses report integration into existing systems', implication: 'Planning value depends on validated work orders, resource records and integration with the dispatch workflow. A standalone recommendation screen delivers none of it.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
];
