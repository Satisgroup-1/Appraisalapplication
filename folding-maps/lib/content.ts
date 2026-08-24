export type Metric = { value: string; label: string; detail?: string };
export type Bar = { label: string; value: number; display: string };
export type Section = { heading: string; paragraphs: string[]; bullets?: string[] };
export type Source = { label: string; href: string };

export type CaseStudy = {
  slug: string;
  image: string;
  sector: string;
  title: string;
  summary: string;
  // 'Anonymised' marks a real engagement written up without naming the client.
  // Its figures are the design targets agreed for the work; where a measured
  // result exists it is stated as one.
  status: 'In progress' | 'Anonymised';
  brief: string;
  metrics: Metric[];
  sections: Section[];
  bars: Bar[];
  barTitle: string;
  barSubtitle: string;
  barNote: string;
  phases: { label: string; detail: string }[];
  code: { title: string; lines: string[]; nodes: string[] };
  nextSteps: string[];
};

export const cases: CaseStudy[] = [
  {
    slug: 'yacht-operations',
    image: '/images/case-yacht.svg',
    sector: 'Marine',
    title: 'A calmer operating system for a growing yacht business',
    summary: 'One record for every enquiry, project and commitment, with the next action and the colleague taking it visible on each.',
    status: 'In progress',
    brief: 'The engagement is creating a shared operational backbone for a specialist sailing business. The immediate priority is visibility: one place to see where each customer stands, what happens next and which colleague is doing it.',
    metrics: [
      { value: '1', label: 'shared operational view', detail: 'Target design state' },
      { value: '4', label: 'workflow layers mapped', detail: 'Enquiry, client, project and follow-up' },
      { value: '100%', label: 'human approval retained', detail: 'For client-facing decisions' },
    ],
    sections: [
      { heading: 'Situation', paragraphs: ['Demand had grown faster than the operating model around it. Customer information lived across inboxes, documents and individual knowledge. The team could deliver high-quality work, but maintaining a current view of every commitment required repeated manual coordination.', 'The issue was not a lack of tools. It was the absence of a clear system of record and a consistent progression from enquiry to delivery. Adding another point solution would have increased fragmentation.'] },
      { heading: 'Diagnostic', paragraphs: ['Discovery followed real customer journeys from first contact to post-project follow-up. We recorded each hand-off, decision, data field and exception. This separated genuine judgement from administrative movement and exposed where information was repeatedly recreated.', 'The analysis identified four connected requirements. The platform needed a dependable customer record, a visible project state, explicit next actions and a controlled automation layer. Each requirement had to support the way the team already served clients without imposing a generic sales process.'], bullets: ['Put one name against each next action', 'Keep commercial context beside operational detail', 'Make exceptions visible before automating routine work'] },
      { heading: 'Solution design', paragraphs: ['The proposed platform uses a lightweight event model. Important changes, such as a new enquiry, a confirmed brief or a delivery milestone, update the central record and trigger a defined next step. Staff remain responsible for judgement while the system handles reminders, data movement and routine preparation.', 'The interface is organised around the questions the team asks each morning: what changed, what needs attention and what is at risk. This reduces navigation and keeps system design anchored to operational decisions.'] },
      { heading: 'Delivery approach', paragraphs: ['Delivery is staged to establish trust before adding sophistication. The first release creates the shared record and workflow states. Later releases introduce document generation, management reporting and carefully bounded AI support.', 'Measures are being agreed before launch. They include time spent assembling status, incomplete records, overdue actions and the number of customer updates that require information from more than one system.'] },
      { heading: 'Current position', paragraphs: ['The work remains in progress, so no outcome claim is presented. The completed discovery and architecture phases have established a single operating model, an agreed data structure and a prioritised release plan. The next test is whether the first working release reduces coordination effort without weakening the personal service that differentiates the business.'] },
    ],
    barTitle: 'The diagnostic concentrates effort on coordination friction',
    barSubtitle: 'Relative priority score from discovery workshops, normalised to 100.',
    bars: [
      { label: 'Shared customer context', value: 100, display: 'Critical' },
      { label: 'A named next action', value: 88, display: 'High' },
      { label: 'Management visibility', value: 72, display: 'High' },
      { label: 'Automated drafting', value: 43, display: 'Later' },
    ],
    barNote: 'Source: Quiet Gears discovery synthesis. Scores express design priority, not measured performance.',
    phases: [
      { label: 'Discover', detail: 'Trace customer journeys, decisions and exceptions.' },
      { label: 'Establish', detail: 'Create the shared record and explicit workflow states.' },
      { label: 'Connect', detail: 'Link communications, documents and management views.' },
      { label: 'Automate', detail: 'Add bounded assistance after the process is stable.' },
    ],
    code: {
      title: 'An event-led backbone keeps every action traceable',
      lines: ['event = capture(change)', 'record = customer.merge(event)', 'next = policy.resolve(record.state)', 'assignee = roles.assign(next)', 'audit.write(event, next, assignee)'],
      nodes: ['Enquiry channels', 'Customer record', 'Workflow policy', 'Team workspace', 'Management view'],
    },
    nextSteps: ['Release the shared customer and project view', 'Baseline coordination time and overdue actions', 'Review adoption with users after four weeks', 'Introduce automation only where evidence supports it'],
  },
  {
    slug: 'cold-chain',
    image: '/images/case-cold-chain.svg',
    sector: 'Cold storage',
    title: 'Turning temperature data into timely action',
    summary: 'Exception-led monitoring that reduces manual oversight while strengthening the operational record.',
    status: 'Anonymised',
    brief: 'A cold-chain operator moving from scheduled checking to evidence-led intervention. The client is not named here at their request. The design combines sensor readings, asset context and human notes so that teams see the exceptions that matter and keep a complete decision record. Service levels on this page are the targets agreed for the work.',
    metrics: [
      { value: '24/7', label: 'signal coverage', detail: 'Design target' },
      { value: '<15 min', label: 'exception triage', detail: 'Service-level target' },
      { value: '4', label: 'evidence layers', detail: 'Reading, asset, threshold and action' },
    ],
    sections: [
      { heading: 'Situation', paragraphs: ['Temperature-controlled operations generate continuous readings but often depend on periodic human consolidation. Teams can spend substantial time assembling routine evidence while a smaller number of material exceptions require rapid judgement.', 'The operational risk sits between the sensor and the response. A reading without equipment context, duration, location and prior action does not tell a complete story.'] },
      { heading: 'Diagnostic', paragraphs: ['The proposed diagnostic separates data quality from operational severity. Missing or implausible readings are treated as system exceptions. Valid excursions are assessed against duration, asset state and product context before reaching the response queue.', 'This design prevents a high-volume alert stream from becoming background noise. It also makes clear when the system lacks enough evidence to recommend a priority.'], bullets: ['Validate the signal before classifying the event', 'Use operating context to set priority', 'Record the decision and the supporting evidence'] },
      { heading: 'Solution design', paragraphs: ['A monitoring service ingests readings and equipment status, applies explicit threshold policies and assembles an exception case. A concise operational summary presents the evidence, likely cause and required checks. A responsible person then confirms, escalates or closes the event.', 'AI may assist with summarising maintenance notes or grouping similar events. It should not conceal threshold logic or take direct equipment action without a separately assessed control case.'] },
      { heading: 'Control model', paragraphs: ['The system would use role-based access, durable audit events and separation between monitoring and equipment control. Missing data would remain visible. Changes to thresholds would require approval and version history.', 'The design supports food-safety records but does not replace the operator’s hazard analysis, maintenance regime or legal responsibilities.'] },
      { heading: 'Expected value', paragraphs: ['The expected value is a shift in staff attention from compiling routine reports to resolving exceptions. Any pilot should measure alert precision, response time, reporting effort and the completeness of the evidence attached to each closure.', 'These are hypotheses and design targets, not measured client results.'] },
    ],
    barTitle: 'Exception quality depends on context, not volume',
    barSubtitle: 'Modelled contribution of each evidence layer to a triage decision.',
    bars: [
      { label: 'Temperature and duration', value: 100, display: 'Core' },
      { label: 'Asset operating state', value: 78, display: 'Material' },
      { label: 'Product and location context', value: 66, display: 'Material' },
      { label: 'Operator notes', value: 48, display: 'Supporting' },
    ],
    barNote: 'Source: Quiet Gears service design. The values are relative design weights, not empirical findings.',
    phases: [
      { label: 'Sense', detail: 'Collect readings, equipment state and connectivity health.' },
      { label: 'Validate', detail: 'Identify missing, stale or implausible signals.' },
      { label: 'Prioritise', detail: 'Apply transparent operational thresholds and context.' },
      { label: 'Resolve', detail: 'Record human action, evidence and closure.' },
    ],
    code: {
      title: 'The monitoring layer makes uncertainty explicit',
      lines: ['reading = sensors.latest(asset)', 'quality = validate(reading, heartbeat)', 'case = classify(reading, policy, context)', 'decision = operator.review(case)', 'ledger.append(case, decision)'],
      nodes: ['Sensors and gateways', 'Data quality service', 'Policy engine', 'Exception queue', 'Audit ledger'],
    },
    nextSteps: ['Select one asset class and operating site', 'Agree thresholds and who escalation reaches on each shift', 'Run the service in observation mode', 'Compare alert quality with the existing process'],
  },
  {
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
    sections: [
      { heading: 'Situation', paragraphs: ['Property transactions combine customer communication, external documents, deadlines and judgement. When these elements sit in disconnected systems, teams recreate status manually and leadership sees risk after it has already affected the timetable.', 'A larger CRM implementation may be unnecessary. The first requirement is a disciplined transaction model that defines what must be true before work progresses.'] },
      { heading: 'Diagnostic', paragraphs: ['The diagnostic maps the transaction as a sequence of evidence-backed stage gates. Each gate has a minimum data set, a named colleague who clears it and a list of exceptions that go to review.', 'This approach distinguishes workflow progress from activity volume. A transaction with many messages is not necessarily closer to completion.'], bullets: ['Define completion criteria for every stage', 'Link each decision to its supporting document', 'Escalate missing evidence before deadlines are threatened'] },
      { heading: 'Solution design', paragraphs: ['The proposed workspace combines the pipeline, document index and action queue. Incoming messages can be associated with a transaction, while structured extraction proposes fields for human confirmation.', 'Management reporting derives from the same operational record. Teams no longer prepare a separate version of status for weekly review.'] },
      { heading: 'Controls and adoption', paragraphs: ['Access follows transaction role and document sensitivity. Automated extraction remains a proposal until confirmed. Every material field change records its source, editor and timestamp.', 'Adoption starts with a single transaction type. The process is refined with users before expanding to additional teams or asset classes.'] },
      { heading: 'Expected value', paragraphs: ['The concept aims to reduce duplicate entry, late follow-up and time spent reconciling status. A pilot would compare time in each stage, missing-document exceptions and the preparation effort required for pipeline reviews.', 'No measured client outcome is claimed.'] },
    ],
    barTitle: 'Stage-gate design moves risk detection earlier',
    barSubtitle: 'Modelled share of control effort by transaction stage.',
    bars: [
      { label: 'Qualification', value: 52, display: '12%' },
      { label: 'Evidence collection', value: 100, display: '31%' },
      { label: 'Review and negotiation', value: 84, display: '26%' },
      { label: 'Completion readiness', value: 68, display: '21%' },
      { label: 'Close and archive', value: 32, display: '10%' },
    ],
    barNote: 'Source: Quiet Gears operating model. The percentages are a design allocation for discussion, not measured staff time.',
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
  },
  {
    slug: 'professional-services-intake',
    image: '/images/news-legal.svg',
    sector: 'Professional services',
    title: 'A controlled intake system for specialist advisory work',
    summary: 'A triage workflow that protects professional judgement while shortening the route from enquiry to qualified instruction.',
    status: 'Anonymised',
    brief: 'A consistent intake process for a specialist advisory firm. The firm is not named here, as professional-services engagements normally require. The allocations on this page are design judgements agreed for the work. It structures initial information, applies mandatory control gates and prepares a concise matter brief for professional review.',
    metrics: [
      { value: '100%', label: 'mandatory conflict gate', detail: 'Before instruction' },
      { value: '4', label: 'triage classes', detail: 'Defined service routes' },
      { value: '1', label: 'professional approval', detail: 'Required for every matter' },
    ],
    sections: [
      { heading: 'Situation', paragraphs: ['Specialist firms often receive enquiries through email, telephone and referral networks. Initial information varies in quality, and senior professionals spend time reconstructing the same facts before they can decide whether and how to proceed.', 'The opportunity is not to automate professional judgement. It is to improve the completeness, consistency and traceability of the information presented to it.'] },
      { heading: 'Diagnostic', paragraphs: ['The intake is decomposed into factual capture, eligibility controls, service classification and professional acceptance. Mandatory controls stop progression when required evidence is missing.', 'The design also identifies sensitive information that should not enter general-purpose AI services.'], bullets: ['Collect only information needed for the next decision', 'Separate mandatory controls from commercial prioritisation', 'Keep professional acceptance explicit and attributable'] },
      { heading: 'Solution design', paragraphs: ['A secure intake form creates a matter candidate. Deterministic rules check completeness and routing criteria. A language model may draft a summary from approved fields, but it cannot accept the matter or change the control result.', 'The reviewer sees the original evidence, the structured facts, open questions and the generated brief in one workspace.'] },
      { heading: 'Risk and governance', paragraphs: ['The data model applies retention rules, access controls and source attribution. Prompt and output logs support quality review. Sensitive categories can be excluded from model processing or routed to an approved private environment.', 'A representative evaluation set tests omissions, ambiguous enquiries and attempts to bypass required controls.'] },
      { heading: 'Expected value', paragraphs: ['The expected benefit is faster triage with a more consistent evidence base. Pilot measures would include time to first decision, incomplete enquiries, rework and the proportion of generated summaries accepted without material correction.'] },
    ],
    barTitle: 'Automation supports preparation, not professional acceptance',
    barSubtitle: 'Modelled allocation of responsibility across the intake decision.',
    bars: [
      { label: 'Structured data capture', value: 100, display: 'System led' },
      { label: 'Mandatory control checks', value: 92, display: 'Rules led' },
      { label: 'Matter summary', value: 70, display: 'AI assisted' },
      { label: 'Acceptance decision', value: 18, display: 'Human led' },
    ],
    barNote: 'Source: Quiet Gears control design. Bar length represents automation suitability, not measured accuracy.',
    phases: [
      { label: 'Capture', detail: 'Gather structured facts and source evidence.' },
      { label: 'Control', detail: 'Apply eligibility, conflict and completeness gates.' },
      { label: 'Prepare', detail: 'Draft the brief and list the questions still open.' },
      { label: 'Decide', detail: 'Acceptance stays with the qualified professional.' },
    ],
    code: {
      title: 'Policy gates sit outside the language model',
      lines: ['candidate = intake.validate(payload)', 'controls = policy.check(candidate)', 'if (!controls.pass) return hold()', 'brief = model.summarise(approvedFields)', 'decision = reviewer.accept(brief, evidence)'],
      nodes: ['Secure intake', 'Policy controls', 'Approved data view', 'Drafting service', 'Reviewer decision'],
    },
    nextSteps: ['Map mandatory and discretionary decisions', 'Define the approved data boundary', 'Build a redacted evaluation set', 'Pilot with one service line and weekly quality review'],
  },
  {
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
    sections: [
      { heading: 'Situation', paragraphs: ['Field-service planning is a continuous trade-off. Urgent jobs compete with promised appointments, travel time, technical skills, parts availability and working-hour constraints. Spreadsheets can represent each factor but struggle to recalculate the full picture when conditions change.', 'A useful system must explain its recommendation. Dispatchers need to understand why a job moved and what constraint would change the plan.'] },
      { heading: 'Diagnostic', paragraphs: ['The planning model separates hard constraints from preferences. Certification, availability and safety rules cannot be traded away. Travel time, route density and customer preference can be optimised within those boundaries.', 'Historical data is assessed for missing durations, inconsistent priority labels and postcode quality before it influences future planning.'], bullets: ['Keep hard constraints explicit', 'Show the reason for each recommendation', 'Record planner overrides as learning evidence'] },
      { heading: 'Solution design', paragraphs: ['The planning layer receives approved work orders and resource availability, generates feasible options and scores them against service objectives. The dispatcher reviews conflicts and publishes the plan.', 'During the day, cancellations and urgent work create exceptions. The system proposes the smallest viable change and avoids an unexplained rebuild of every route.'] },
      { heading: 'Learning loop', paragraphs: ['Actual duration, travel and override reasons feed a weekly review. These observations improve planning assumptions while preserving the distinction between recorded facts and model estimates.', 'Performance is assessed across service level, travel burden, overtime and plan stability. Optimising only one measure would create hidden cost elsewhere.'] },
      { heading: 'Expected value', paragraphs: ['The concept aims to reduce planning effort and unnecessary travel while improving the consistency of priority decisions. A controlled pilot would run recommendations beside the existing plan before dispatchers rely on them.'] },
    ],
    barTitle: 'A balanced score prevents one objective from dominating',
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
  },
];

export type Article = {
  slug: string;
  image: string;
  artLabel: string;
  date: string;
  read: string;
  tag: string;
  title: string;
  intro: string;
  thesis: string;
  metrics: Metric[];
  takeaways: string[];
  sections: Section[];
  exhibit: { title: string; subtitle: string; bars: Bar[]; note: string };
  code: { title: string; lines: string[]; nodes: string[] };
  actions: string[];
  sources: Source[];
};

export const articles: Article[] = [
  {
    slug: 'ai-integration-gap', image: '/images/code-waterfall.svg', artLabel: 'Adoption to integration', date: '15 Aug 2026', read: '20 min read', tag: 'Executive briefing', title: 'Only a fifth of UK AI users have connected it to a business system', intro: 'AI access has expanded quickly, but operational integration remains limited. Leaders should shift attention from tool adoption to workflow performance.',
    thesis: 'The next source of advantage is not access to AI. It is the ability to redesign a workflow, connect trusted data, set controls and measure the resulting operational change.',
    metrics: [{ value: '41%', label: 'of data-handling UK firms report some AI use', detail: 'UK Business Data Survey 2026' }, { value: '21%', label: 'of AI users report system integration', detail: 'UK Business Data Survey 2026' }, { value: '16%', label: 'of UK businesses use at least one AI technology', detail: 'DSIT AI Adoption Research 2026' }],
    takeaways: ['Tool access and operational integration are different management problems.', 'Workflow redesign, data quality and a clear answer on who decides explain more than model choice.', 'A small number of integrated use cases can create more value than broad, unmeasured experimentation.'],
    sections: [
      { heading: 'Adoption figures describe different realities', paragraphs: ['Recent UK studies report different adoption levels because they use different definitions, populations and survey methods. The UK Business Data Survey found that 41 percent of businesses handling digitised data used AI-based technologies. Separate DSIT adoption research found that 16 percent of all businesses used at least one AI technology.', 'The range is informative. AI can be present in individual tasks without being integrated into an operating process. Leaders therefore need two readings: where AI is used, and where it has changed the way work moves from an input to a completed, checked outcome.'] },
      { heading: 'Integration is the value bottleneck', paragraphs: ['The UK Business Data Survey reports that only 21 percent of AI-using businesses had integrated tools into existing systems. Integration was more common in larger and more digitally intensive firms.', 'The constraint is rarely an API alone. A production workflow requires defined inputs, a clear position on which system holds the authoritative data, exception handling, permissions, evaluation, and a named manager answerable for how it performs. These foundations take management attention.'] },
      { heading: 'Redesign around decisions', paragraphs: ['Start with a material decision or hand-off. A catalogue of AI features does not define an operating outcome. Map the evidence required, the judgement involved and the cost of delay or error. Use deterministic automation for fixed rules and AI for tasks where language or variation makes it useful.', 'The resulting system should expose uncertainty. A confidence score without an operational response is decoration. A low-confidence result needs a queue, a named reviewer and a stated turnaround.'] },
      { heading: 'Measure the operating result', paragraphs: ['Measure cycle time, quality, rework and exception demand before and after the change. Track adoption only as a leading indicator. The outcome is improved workflow performance, not the number of licensed users.', 'This discipline also improves investment choices. A modest model connected to reliable data and a clear process can outperform a more capable model sitting beside the workflow.'] },
    ],
    exhibit: { title: 'Reported use is materially higher than reported integration', subtitle: 'Share of relevant UK survey respondents, percent.', bars: [{ label: 'Any AI use among data-handling firms', value: 100, display: '41%' }, { label: 'AI integrated into systems among AI users', value: 51, display: '21%' }, { label: 'Any AI use among all businesses', value: 39, display: '16%' }], note: 'Sources: UK Business Data Survey 2026 and DSIT AI Adoption Research 2026. Populations and definitions differ, so bars should not be treated as a common funnel.' },
    code: { title: 'Integration connects a model to its evidence, its rules and its reviewer', lines: ['request = workflow.capture(input)', 'context = records.authorised(request)', 'draft = model.generate(context, policy)', 'result = evaluate(draft, testSet)', 'reviewer.check(result, exceptions)'], nodes: ['Workflow trigger', 'Trusted records', 'AI service', 'Evaluation gate', 'Named reviewer'] },
    actions: ['Select three workflows where delay, error or rework has a visible cost', 'Name the manager answerable for each workflow', 'Baseline performance before selecting technology', 'Fund integration, evaluation and adoption as core delivery work'],
    sources: [{ label: 'UK Government, UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' }, { label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'McKinsey, The state of AI in 2025', href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai' }],
  },
  {
    slug: 'open-weight-price-war', image: '/images/code-waterfall.svg', artLabel: 'Model economics', date: '12 Aug 2026', read: '19 min read', tag: 'AI market', title: 'Model prices have fallen; the cost of dependable automation has not', intro: 'Lower model costs widen the set of viable experiments. The strategic question is where cheaper intelligence can produce a dependable return.',
    thesis: 'Falling inference cost changes experimentation economics, but sustainable value still depends on workflow design, evaluation and the freedom to change models.',
    metrics: [{ value: '280x', label: 'fall in equivalent-capability inference cost', detail: 'Stanford AI Index, Nov 2022 to Oct 2024' }, { value: '2+', label: 'models in a sensible benchmark', detail: 'Minimum comparison design' }, { value: '1', label: 'workflow baseline', detail: 'Required before pilot' }],
    takeaways: ['Cheaper inference permits broader testing, not weaker governance.', 'Total workflow cost includes review, errors, latency and infrastructure.', 'Prompts, evaluations and business rules should remain portable.'],
    sections: [
      { heading: 'Capability is becoming cheaper', paragraphs: ['The Stanford AI Index 2025 documents a steep decline in the cost of querying a model at a capability level associated with GPT-3.5. Lower cost makes extraction, classification, retrieval and drafting viable in use cases that could not support earlier price levels.', 'For SMEs, the main benefit is strategic option value. Teams can compare approaches with representative work before committing to a large platform or a long contract.'] },
      { heading: 'The model is one line in the budget', paragraphs: ['Reliable systems still require process design, secure access to information, evaluation, monitoring and training. Lower token prices should allow more of the budget to fund these durable capabilities.', 'A cheap model becomes expensive when weak output creates repeated review or customer-facing error. Compare cost per accepted task, not cost per token.'] },
      { heading: 'Design for model choice', paragraphs: ['Keep prompts, retrieval logic, evaluation cases and business rules outside the model where practical. A stable application boundary makes it easier to compare quality, latency, hosting and price as the market changes.', 'Open weights can increase deployment control, but they also create obligations around licensing, provenance, security and operations. Control should be chosen for a clear business or risk reason.'] },
      { heading: 'Benchmark the complete task', paragraphs: ['Use real examples, including edge cases. Score correctness, review effort, response time and failure behaviour. Run the same test whenever a model, prompt or data source changes.', 'The winning design is the one that creates dependable value and remains easy to change.'] },
    ],
    exhibit: { title: 'Headline model price is only part of workflow economics', subtitle: 'Modelled share of total operating cost for a document-processing workflow.', bars: [{ label: 'Human review and exception handling', value: 100, display: '42%' }, { label: 'Integration and monitoring', value: 67, display: '28%' }, { label: 'Model inference', value: 43, display: '18%' }, { label: 'Storage and supporting services', value: 29, display: '12%' }], note: 'Source: Quiet Gears cost model. The shape is modelled; actual economics depend on volume, error tolerance and architecture.' },
    code: { title: 'A portable evaluation harness protects model choice', lines: ['cases = dataset.load("representative")', 'for model in candidates:', '  outputs = model.run(cases)', '  score = evaluate(outputs, rubric)', 'select(score.quality, score.totalCost)'], nodes: ['Test dataset', 'Model adapters', 'Common rubric', 'Cost model', 'Release decision'] },
    actions: ['Choose one high-volume, reviewable task', 'Create normal, difficult and adversarial examples', 'Compare at least two model families', 'Report cost per accepted output and the causes of rejection'],
    sources: [{ label: 'Stanford HAI, 2025 AI Index Report', href: 'https://hai.stanford.edu/ai-index/2025-ai-index-report' }, { label: 'NIST, AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }, { label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }],
  },
  {
    slug: 'automation-before-agents', image: '/images/case-property.svg', artLabel: 'Workflow redesign', date: '28 Jul 2026', read: '19 min read', tag: 'Practical AI', title: 'Agents fail on the exceptions the workflow never defined', intro: 'An agent cannot rescue a process that nobody understands. Start with the hand-offs, decisions and exceptions that define the work.',
    thesis: 'Agentic technology should be given authority only after the workflow has clear states, tested controls and a named route for exceptions.',
    metrics: [{ value: '7%', label: 'agentic AI adoption among UK AI users', detail: 'DSIT AI Adoption Research 2026' }, { value: '3', label: 'authority levels', detail: 'Draft, recommend and act' }, { value: '1', label: 'named reviewer per exception', detail: 'Minimum operating discipline' }],
    takeaways: ['Use conventional automation for deterministic work.', 'Separate drafting, recommendation and action authority.', 'Expand autonomy only after measured reliability.'],
    sections: [
      { heading: 'Start with the work', paragraphs: ['Agent demonstrations compress a complex process into a smooth sequence. Real operations contain incomplete inputs, policy conflicts and exceptions that require negotiation. Automating the demonstration while leaving the process undefined creates fragile systems.', 'Follow a real item from arrival to completion. Record the states, the decisions, the evidence used, the waiting between steps and who acts at each one. This map reveals whether the constraint is interpretation, missing data, an unanswered question about who decides, or an ordinary integration problem.'] },
      { heading: 'Use the least complex reliable tool', paragraphs: ['Fixed calculations, validated field movement and known notifications belong in deterministic software. Use AI where language, variation or interpretation creates a genuine advantage.', 'A combined design is usually stronger than a single general agent. Explicit rules provide stability, while AI handles bounded ambiguity.'] },
      { heading: 'Match authority to consequence', paragraphs: ['Drafting an internal summary can tolerate review. Releasing payment, changing a customer record or sending regulated advice requires explicit approval and a durable audit trail.', 'Define three levels: draft, recommend and act. Each level needs evidence thresholds, permissions and a route to a person.'] },
      { heading: 'Extend autonomy on evidence', paragraphs: ['Build an evaluation set from normal work, edge cases and known failures. Track task completion, corrections, time saved and exceptions. Review failures by cause because one blended accuracy score can conceal serious defects.', 'The best first system is rarely the most autonomous. It is the one the team can understand, operate and improve.'] },
    ],
    exhibit: { title: 'Authority should rise more slowly than model capability', subtitle: 'Modelled control intensity by action consequence.', bars: [{ label: 'Internal draft', value: 28, display: 'Light review' }, { label: 'Recommendation', value: 55, display: 'Owner approval' }, { label: 'Record update', value: 78, display: 'Policy gate' }, { label: 'External commitment', value: 100, display: 'Explicit approval' }], note: 'Source: Quiet Gears control framework. Control intensity is modelled and should be adjusted for each risk context.' },
    code: { title: 'An authority gate separates suggestion from action', lines: ['proposal = agent.plan(task, context)', 'risk = controls.classify(proposal)', 'evidence = evaluator.check(proposal)', 'approval = authority.route(risk, evidence)', 'executor.run(approval.allowedActions)'], nodes: ['Task queue', 'Planning agent', 'Evaluation service', 'Authority gate', 'Controlled tools'] },
    actions: ['Map one workflow end to end', 'Classify actions by consequence and reversibility', 'Create tests before connecting operational tools', 'Start with drafting or recommendation and review failures weekly'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' }, { label: 'UK Government, Introduction to AI Assurance', href: 'https://www.gov.uk/government/publications/introduction-to-ai-assurance' }],
  },
  {
    slug: 'cold-chain-collaboration', image: '/images/case-cold-chain.svg', artLabel: 'Operational evidence', date: '09 Jul 2026', read: '18 min read', tag: 'Cold-chain operations', title: 'A temperature excursion changes nothing until it triggers a defined response', intro: 'Temperature-controlled sites already record continuous readings. What decides whether monitoring is worth its cost is the response an excursion sets in motion, and how quickly the evidence of that response can be produced.',
    thesis: 'Cold-chain readings become useful when the reading, the equipment context and the action someone took form one traceable operational record.',
    metrics: [{ value: '4', label: 'parts of a complete exception', detail: 'Signal, context, decision and action' }, { value: '1', label: 'evidence timeline', detail: 'Across systems and human notes' }, { value: 'Human', label: 'decision authority', detail: 'Stays with the operator throughout' }],
    takeaways: ['A reading without context does not define the response.', 'Missing data should be treated as an operational exception.', 'Automation should reduce routine assembly while preserving human judgement.'],
    sections: [
      { heading: 'From readings to decisions', paragraphs: ['Temperature-controlled environments generate a steady stream of readings, checks, maintenance notes and exceptions. The difficulty is making a material change produce a prompt response that can be evidenced afterwards.', 'A short excursion during loading may require a different action from a persistent rise in a sealed unit. Useful software brings the reading, asset state, threshold and human observation into one timeline.'] },
      { heading: 'Design around exceptions', paragraphs: ['The collaboration is exploring an exception-led workflow. The system can identify unusual activity, collect relevant evidence and prepare a concise case for review, reducing repeated assembly of routine reports.', 'People remain responsible for decisions. The system should improve focus and traceability without creating false certainty.'] },
      { heading: 'Infrastructure remains part of the system', paragraphs: ['Monitoring cannot compensate for poor sensors, unreliable connectivity or unclear maintenance. Discovery therefore includes sensor placement, calibration, gateways and network gaps.', 'The software layer should report missing or implausible data. Quiet failure is itself a control failure.'] },
      { heading: 'Measures before automation', paragraphs: ['Initial measures include reporting time, alert precision, response time and the proportion of exceptions closed with complete evidence.', 'The engagement follows a deliberate sequence: understand operations, establish a trustworthy data path and then add the smallest useful combination of software, automation and AI.'] },
    ],
    exhibit: { title: 'An exception record connects four evidence layers', subtitle: 'Modelled completeness score for operational review.', bars: [{ label: 'Sensor reading and duration', value: 100, display: 'Required' }, { label: 'Asset and location context', value: 100, display: 'Required' }, { label: 'Operator decision', value: 100, display: 'Required' }, { label: 'Corrective action and closure', value: 100, display: 'Required' }], note: 'Source: Quiet Gears engagement framework. The exhibit describes the proposed record, not a measured client outcome.' },
    code: { title: 'Every exception becomes a traceable case', lines: ['signal = telemetry.validate(reading)', 'context = assets.lookup(signal.asset)', 'case = policy.evaluate(signal, context)', 'action = operator.decide(case)', 'evidence.close(case, action)'], nodes: ['Telemetry', 'Asset context', 'Exception policy', 'Operations review', 'Evidence store'] },
    actions: ['Agree exception definitions with operators', 'Instrument signal quality before alert logic', 'Run observation mode before operational escalation', 'Review false positives and incomplete closures every week'],
    sources: [{ label: 'Food Standards Agency, Chilling Food Correctly', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' }, { label: 'UK legislation, temperature control requirements', href: 'https://www.legislation.gov.uk/uksi/2006/14/contents/made' }, { label: 'NCSC, Connected Places Cyber Security Principles', href: 'https://www.ncsc.gov.uk/collection/connected-places-security-principles' }],
  },
  {
    slug: 'small-teams-ai-advantage', image: '/images/case-yacht.svg', artLabel: 'Focused transformation', date: '18 Jun 2026', read: '18 min read', tag: 'Insight', title: 'Smaller firms decide faster, and that is the AI advantage they actually hold', intro: 'Short decision lines and close customer knowledge give SMEs a strong starting point, provided that leadership maintains focus.',
    thesis: 'Smaller firms can convert proximity into learning speed, but only when they concentrate investment on a bounded workflow and build reusable delivery disciplines.',
    metrics: [{ value: '14%', label: 'AI adoption among micro firms', detail: 'DSIT AI Adoption Research 2026' }, { value: '23%', label: 'AI adoption among mid-sized firms', detail: 'DSIT AI Adoption Research 2026' }, { value: '1', label: 'focused workflow', detail: 'Recommended starting portfolio' }],
    takeaways: ['Proximity to customers and operations can shorten the learning cycle.', 'A scattered tool portfolio consumes attention without building capability.', 'A good pilot leaves reusable data, evaluation and governance assets.'],
    sections: [
      { heading: 'Speed comes from proximity', paragraphs: ['Large organisations may have more capital and data, but smaller firms often have shorter decision lines and closer knowledge of customer needs. The person who understands an exception can work directly with the person designing the system.', 'This proximity reduces translation loss and allows a team to test a change quickly. It does not remove the need for controls. It makes those controls easier to connect to operational reality.'] },
      { heading: 'Focus is the scarce resource', paragraphs: ['Trying tools across every department creates activity without capability. Choose one valuable workflow, define the desired operational change and give a small cross-functional group authority to deliver it.', 'The use case should be frequent enough to measure and bounded enough to understand. A visible baseline protects the project from enthusiasm that is not matched by operating value.'] },
      { heading: 'Create foundations that compound', paragraphs: ['A strong pilot leaves more than an application. It settles which system holds the authoritative data, leaves a reusable evaluation method, forces practical risk decisions, and leaves colleagues who understand how to improve the workflow.', 'These assets lower the cost and risk of the next project. They also reduce dependence on any single vendor.'] },
      { heading: 'Use a repeatable delivery rhythm', paragraphs: ['A practical rhythm is select, baseline, test, review and expand. Each stage ends with a decision and an evidence threshold.', 'Responsible adoption is not a brake on speed. Clear boundaries and visible performance support faster, more confident iteration.'] },
    ],
    exhibit: { title: 'A focused portfolio compounds learning faster', subtitle: 'Modelled management attention across two adoption approaches.', bars: [{ label: 'One integrated workflow', value: 100, display: 'High learning density' }, { label: 'Three related experiments', value: 63, display: 'Moderate' }, { label: 'Broad tool rollout', value: 31, display: 'Low evidence density' }], note: 'Source: Quiet Gears delivery model. Values illustrate relative concentration of management attention.' },
    code: { title: 'A reusable delivery loop turns one pilot into capability', lines: ['baseline = measure(workflow)', 'pilot = build(scope, controls)', 'evidence = compare(pilot, baseline)', 'decision = review(value, risk, adoption)', 'playbook.update(decision.learning)'], nodes: ['Operational baseline', 'Bounded pilot', 'Evaluation set', 'Leadership review', 'Reusable playbook'] },
    actions: ['Choose a workflow with one obvious manager and repeated volume', 'Create a baseline before buying a platform', 'Keep the delivery group small and cross-functional', 'Capture reusable controls, tests and data decisions'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'UK Government, SME Digital Adoption Taskforce', href: 'https://www.gov.uk/government/publications/sme-digital-adoption-taskforce-final-report/sme-digital-adoption-taskforce-final-report' }, { label: 'NIST, AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }],
  },
  {
    slug: 'measure-automation-value', image: '/images/news-marketing.svg', artLabel: 'Value realisation', date: '30 May 2026', read: '19 min read', tag: 'Management', title: 'Hours saved are not cash, and the gap between them can be measured', intro: 'A credible case links operational baselines, adoption and quality. It does not multiply theoretical minutes by salary and call the result cash.',
    thesis: 'Automation value should be reported as a bridge from baseline performance to observed operational change, with capacity, quality and cash effects kept separate.',
    metrics: [{ value: '4', label: 'measure families', detail: 'Time, quality, service and risk' }, { value: '2', label: 'comparison periods', detail: 'Baseline and observed operation' }, { value: '1', label: 'named manager per benefit', detail: 'Answerable for realising it' }],
    takeaways: ['Time released is capacity, not automatically cash.', 'Quality and demand effects may matter more than labour savings.', 'Each benefit needs one operational manager and an agreed route to cash or capacity.'],
    sections: [
      { heading: 'Begin with the counterfactual', paragraphs: ['A business case needs a clear description of what would happen without the change. Record volume, cycle time, error, rework and service performance over a representative period.', 'Avoid baselines built from one unusually difficult week or staff estimates alone. Where data is weak, state the uncertainty and improve measurement during discovery.'] },
      { heading: 'Separate benefit types', paragraphs: ['Minutes released create capacity. They become cash only if cost is removed, avoided or redirected to work that produces measurable value. Keep these cases separate.', 'Quality improvement may reduce rework, complaints or risk. Service improvement may increase conversion or retention. Each benefit requires its own causal logic and evidence.'] },
      { heading: 'Measure adoption and exceptions', paragraphs: ['A technically successful workflow produces little value if people work around it. Track eligible volume, actual use, completion and the reasons users revert to the prior process.', 'Exception demand is equally important. A system that automates routine work but doubles complex rework may have negative total value.'] },
      { heading: 'Create a benefits cadence', paragraphs: ['Put the name of one operational manager against each material benefit. Review the evidence at defined intervals and retire measures that do not affect decisions.', 'A transparent case can still support investment when uncertainty is high. It should show ranges, assumptions and the evidence required to narrow them.'] },
    ],
    exhibit: { title: 'Released capacity is not the same as realised cash', subtitle: 'Modelled bridge from gross time saving to evidenced value.', bars: [{ label: 'Gross task time released', value: 100, display: '100 hours' }, { label: 'After adoption and exceptions', value: 72, display: '72 hours' }, { label: 'Redeployed to measured work', value: 48, display: '48 hours' }, { label: 'Converted to cash impact', value: 20, display: '20 hours equivalent' }], note: 'Source: Quiet Gears value bridge. The shape demonstrates measurement logic, not expected performance.' },
    code: { title: 'A benefits ledger keeps assumptions and evidence together', lines: ['baseline = metrics.window(before)', 'observed = metrics.window(after)', 'delta = adjust(observed - baseline, demand)', 'value = benefits.classify(delta)', 'ledger.record(value, manager, confidence)'], nodes: ['Workflow telemetry', 'Baseline model', 'Adjustment logic', 'Benefit classification', 'Management ledger'] },
    actions: ['Agree the baseline period and eligible volume', 'Separate capacity, cash, quality, service and risk benefits', 'Track exception effort and workaround behaviour', 'Name the person responsible for converting capacity into value'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'McKinsey, How organizations are rewiring to capture value', href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-how-organizations-are-rewiring-to-capture-value' }, { label: 'NIST, AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }],
  },
  {
    slug: 'legal-ai-source-grounded-work', image: '/images/news-legal-source.svg', artLabel: 'Citation provenance', date: '17 Aug 2026', read: '24 min read', tag: 'Legal operations', title: 'Legal AI is usable only when every proposition traces to valid authority', intro: 'Legal assistance becomes useful when every material proposition can be traced to an authoritative source that is valid for the matter, date and jurisdiction.',
    thesis: 'A legal AI service should organise evidence and prepare reviewable work while matter scope, authoritative sources, confidentiality and professional sign-off govern every accepted proposition.',
    metrics: [{ value: '1', label: 'matter-scoped evidence set', detail: 'Required design boundary' }, { value: '4', label: 'validity checks', detail: 'Authority, jurisdiction, date and proposition' }, { value: '100%', label: 'professional sign-off', detail: 'Proposed acceptance requirement' }],
    takeaways: ['Retrieve from approved matter and legal sources.', 'Preserve citation text, provenance, jurisdiction and effective date.', 'Test propositions and omissions before releasing assisted work.'],
    sections: [
      { heading: 'Fluency does not confer authority', paragraphs: ['A well-written answer can cite a real decision that does not support the proposition, an outdated rule or material from another jurisdiction. Professional review must reach the source and see why it applies.', 'The operating unit is a proposition linked to evidence. The system should expose source passage, publication, court or issuer, date and matter scope beside the draft.'] },
      { heading: 'Build a matter-scoped evidence route', paragraphs: ['Approved matter documents and authoritative legal sources enter a retrieval index with access and retention rules. Each result keeps its provenance, while temporal and jurisdictional filters narrow the material available to the model.', 'Generated text remains a proposal. The reviewer can inspect the cited passage, reject weak support and record the accepted reasoning.'] },
      { heading: 'Separate controls from assistance', paragraphs: ['Permissions, conflict status, confidentiality rules and source eligibility are deterministic controls. Retrieval, comparison and drafting may use models within those boundaries.', 'Evaluation should test fabricated citations, outdated law, ambiguous questions, contradictory authorities, material omissions and disclosure across matters.'] },
      { heading: 'Release on professional evidence', paragraphs: ['The first release should cover one matter type and an approved source set. Measure citation support, material omission, correction category, reviewer effort and the proportion of outputs rejected for authority or scope.', 'Adoption is justified when reviewers can verify faster without reducing the standard of legal acceptance.'] },
    ],
    exhibit: { title: 'A proposition is accepted only after four validity checks', subtitle: 'Modelled legal-review control sequence.', bars: [{ label: 'Authoritative source', value: 100, display: 'Required' }, { label: 'Jurisdiction match', value: 100, display: 'Required' }, { label: 'Temporal validity', value: 100, display: 'Required' }, { label: 'Proposition support', value: 100, display: 'Required' }], note: 'Source: Quiet Gears control design, informed by Law Society and ICO guidance. The bars are requirements, not measured performance.' },
    code: { title: 'Citation provenance remains attached to every proposition', lines: ['scope = matter.authorise(user, question)', 'sources = retrieve.approved(scope, jurisdiction, date)', 'draft = model.propose(question, sources)', 'citations = verify.support(draft, sources)', 'decision = lawyer.sign(citations, openIssues)'], nodes: ['Matter workspace', 'Approved source index', 'Drafting service', 'Citation verifier', 'Professional sign-off'] },
    actions: ['Approve one matter type and source hierarchy', 'Define confidentiality and cross-matter access rules', 'Build a proposition-level evaluation set', 'Require professional sign-off with visible provenance'],
    sources: [{ label: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' }, { label: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' }, { label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'OpenAI, Ironclad customer story', href: 'https://openai.com/index/ironclad/' }],
  },
  {
    slug: 'hospitality-ai-guest-recovery', image: '/images/news-hospitality-recovery.svg', artLabel: 'Guest recovery state', date: '17 Aug 2026', read: '23 min read', tag: 'Hospitality operations', title: 'Recovering a disrupted stay means reconciling five systems before anyone can act', intro: 'A disrupted stay crosses reservation, property, loyalty, maintenance and service records. Recovery improves when staff can reconcile those facts and act within clear authority.',
    thesis: 'Hospitality AI can improve a disrupted guest journey only after identity, entitlement, live property state and compensation authority have been reconciled into one recovery case a colleague can act on.',
    metrics: [{ value: '5', label: 'operating records in the recovery path', detail: 'Proposed system boundary' }, { value: '1', label: 'named colleague per case', detail: 'Proposed control' }, { value: '0', label: 'autonomous compensation changes', detail: 'Initial release boundary' }],
    takeaways: ['Resolve guest and booking identity before drafting a response.', 'Use live room and maintenance state to determine feasible recovery.', 'Make compensation limits, escalation and closure evidence explicit.'],
    sections: [
      { heading: 'Disruption crosses system boundaries', paragraphs: ['A guest can arrive with a valid confirmation while the room is unavailable, the loyalty profile is duplicated and a maintenance note has not reached the front desk. Courtesy alone cannot resolve conflicting operating facts.', 'A recovery case needs the guest, the booking, the entitlement, the live property state, what was promised and the colleague currently handling it, in one reviewable view.'] },
      { heading: 'Reconcile identity and entitlement', paragraphs: ['Email, loyalty number, booking reference and channel identifiers can refer to the same person. Matching must record confidence and send uncertain cases for review.', 'Entitlement follows the booked product, status, disruption and approved policy. The system may assemble facts; a colleague should approve material compensation during the first release.'] },
      { heading: 'Connect property state to authority', paragraphs: ['Reservation and property-management records show availability, while maintenance and housekeeping systems explain which alternatives are genuinely feasible. CRM history can add preferences after a permitted identity match.', 'The recovery workflow routes the case to a person whose authority covers the proposed room move, refund, credit or escalation. Every action updates the shared case.'] },
      { heading: 'Measure recovery quality', paragraphs: ['A pilot should record the time until a colleague takes the case, the time to a feasible option, repeat contacts, compensation by policy band, correction and guest outcome. Vendor customer stories can illustrate integration patterns but cannot forecast these measures.', 'The release succeeds when staff resolve the disruption with fewer handoffs, controlled compensation and an evidence trail that supports later learning.'] },
    ],
    exhibit: { title: 'Recovery requires five reconciled operating records', subtitle: 'Modelled completeness requirements for a guest-recovery case.', bars: [{ label: 'Guest and booking identity', value: 100, display: 'Required' }, { label: 'Entitlement and promise', value: 100, display: 'Required' }, { label: 'Live property state', value: 100, display: 'Required' }, { label: 'Recovery authority', value: 100, display: 'Required' }, { label: 'Action and closure evidence', value: 100, display: 'Required' }], note: 'Source: Quiet Gears operating design. The values express dependency and contain no measured hotel result.' },
    code: { title: 'A recovery case connects the guest promise to a feasible action', lines: ['guest = identity.resolve(booking, profile)', 'state = property.current(room, maintenance)', 'rights = policy.entitlement(guest, disruption)', 'options = recovery.feasible(state, rights)', 'colleague.approve(options, audit)'], nodes: ['Reservation channels', 'Guest identity', 'Property state', 'Recovery policy', 'Service desk'] },
    actions: ['Map one high-friction guest disruption', 'Define identity confidence and manual review', 'Approve compensation bands and escalation rights', 'Run recovery cases beside the current process'],
    sources: [{ label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' }, { label: 'Microsoft, SNÖ Hotels customer story', href: 'https://www.microsoft.com/en/customers/story/25861-sno-hotels-dynamics-365-business-central' }, { label: 'OpenAI, Booking.com customer story', href: 'https://openai.com/index/booking-com/' }],
  },
];

export type ResearchFinding = { statistic: string; finding: string; implication: string; source: string; href: string };

export const caseResearch: Record<string, ResearchFinding[]> = {
  'yacht-operations': [
    { statistic: '65%', finding: 'SME users most often report improved employee performance', implication: 'The strongest case is better use of scarce staff time inside core work, not technology adoption for its own sake.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: '21%', finding: 'Only a minority of UK AI users report integration with existing systems', implication: 'A shared operational backbone addresses the gap between an individual using a tool and a workflow that runs from input to checked outcome.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
    { statistic: '7 capabilities', finding: 'Google DORA identifies organisational capabilities that amplify AI value', implication: 'Clear workflows, user focus, data access and feedback loops belong in the application design from the start.', source: 'Google DORA, AI Capabilities Model, 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: '1 in 3', finding: 'Only a minority of businesses planning AI adoption report being ready to implement it', implication: 'A focused diagnostic and delivery model can convert general intent into a governed first operating release.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'cold-chain': [
    { statistic: '8 principles', finding: 'NCSC guidance treats secure OT connectivity as a managed architecture decision', implication: 'Monitoring should query a controlled data layer and avoid creating an uncontrolled path back into equipment.', source: 'NCSC, Secure connectivity for operational technology, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity' },
    { statistic: '4 functions', finding: 'NIST structures AI risk work around govern, map, measure and manage', implication: 'Operational AI needs named people, a context map, performance tests and a response plan somebody has rehearsed.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
    { statistic: 'Continuous', finding: 'Cold-chain controls depend on recorded temperature checks and corrective action', implication: 'A useful digital record must connect readings with context, review and closure; telemetry alone leaves the response unresolved.', source: 'Food Standards Agency, Chilling food correctly', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' },
    { statistic: 'Definitive view', finding: 'NCSC operational technology guidance starts with a current record of architecture and assets', implication: 'A monitoring release should document its sensors, gateways, network boundaries and responding shift before adding automated interpretation.', source: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' },
  ],
  'property-pipeline': [
    { statistic: '1%', finding: 'Only a small share of surveyed built-environment firms report AI scaled across projects', implication: 'The near-term opportunity is a bounded transaction workflow with governed data, not a broad transformation claim.', source: 'RICS, Artificial Intelligence in Construction Report 2025', href: 'https://www.rics.org/news-insights/artificial-intelligence-in-construction-report' },
    { statistic: '37%', finding: 'System integration is a leading reported barrier in the RICS survey', implication: 'Connecting evidence, stage gates and actions is likely to matter more than adding a standalone assistant.', source: 'RICS, AI in Construction 2025 findings', href: 'https://www.rics.org/news-insights/optimism-high-for-ai-in-construction-but-skills-shortages-and-integration-challenges-adoption' },
    { statistic: 'Guardrails', finding: 'RICS guidance emphasises professional judgement and responsible AI use', implication: 'Extracted fields and generated summaries should remain proposals until the qualified professional confirms them.', source: 'RICS, Responsible use of AI in surveying practice', href: 'https://www.rics.org/profession-standards/rics-standards-and-guidance/conduct-competence/responsible-use-of-ai' },
    { statistic: '4 functions', finding: 'NIST structures AI risk activity around govern, map, measure and manage', implication: 'Transaction automation needs a named operating manager, a context map, evaluated controls and a live route for handling failure.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  ],
  'professional-services-intake': [
    { statistic: 'Authoritative', finding: 'The Law Society warns that generated legal citations and propositions require verification', implication: 'The system should preserve source evidence and never present model output as an accepted professional conclusion.', source: 'The Law Society, Conducting legal research in the age of AI, 2026', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' },
    { statistic: 'SME focus', finding: 'Law Society guidance addresses both opportunity and data risk for smaller firms', implication: 'Intake automation needs an approved data boundary, confidentiality controls and a named supervising professional.', source: 'The Law Society, Generative AI: the essentials, 2025', href: 'https://www.lawsociety.org.uk/Topics/AI-and-lawtech/Guides/Generative-AI-the-essentials' },
    { statistic: '3 outputs', finding: 'ICO guidance combines audit methodology, organisational guidance and practical tools', implication: 'Data protection should be evidenced through design records, tests and operating controls, not policy wording alone.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
    { statistic: 'Lifecycle', finding: 'NIST treats generative AI risk as an issue across design, deployment, operation and review', implication: 'Professional intake controls should be tested before launch and monitored as data, models and use patterns change.', source: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
  ],
  'field-service-planning': [
    { statistic: 'Amplifier', finding: 'Google DORA finds that AI magnifies existing organisational strengths and weaknesses', implication: 'Poor work-order data and unclear priorities will be amplified by an optimiser unless corrected first.', source: 'Google DORA, State of AI-assisted Software Development 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: 'Known good', finding: 'NCSC recommends schema-based validation at operational trust boundaries', implication: 'Jobs, resource data and telemetry should be validated before they influence a daily plan.', source: 'NCSC, Standardised and secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' },
    { statistic: 'Lifecycle', finding: 'NIST risk guidance expects measurement and management throughout operation', implication: 'Overrides, actual durations and plan failures should feed continuing review after the initial model assessment.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
    { statistic: '21%', finding: 'Only a minority of AI-using UK businesses report integration into existing systems', implication: 'Planning value depends on validated work orders, resource records and dispatch workflow integration, not a standalone recommendation screen.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
  ],
};

export const articleResearch: Record<string, ResearchFinding[]> = {
  'ai-integration-gap': [
    { statistic: '21%', finding: 'System integration trails reported AI use among UK businesses', implication: 'The strategic gap after tool access is workflow connection, the state of the data and a clear answer on who runs it.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
    { statistic: '65%', finding: 'SME users report employee performance as the leading benefit', implication: 'Core-work enablement is a stronger initial value pool than speculative headcount reduction.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: 'Amplifier', finding: 'Google DORA finds that AI magnifies the surrounding organisational system', implication: 'AI investment should include user focus, workflow clarity, quality data and fast feedback.', source: 'Google DORA Report 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: '1 in 6', finding: 'Current UK research finds that AI adoption remains material but far from universal', implication: 'Leadership teams still have time to build an integration advantage and need a use-case and readiness discipline beyond general experimentation.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'open-weight-price-war': [
    { statistic: '280x', finding: 'Equivalent-capability inference cost fell sharply from 2022 to 2024', implication: 'SMEs can benchmark more use cases, but lower model cost does not remove integration and quality cost.', source: 'Stanford HAI, AI Index 2025', href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf' },
    { statistic: 'Lifecycle', finding: 'NIST frames generative AI risks across design, deployment and use', implication: 'Model portability should include repeatable evaluation, monitoring and incident response.', source: 'NIST Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
    { statistic: 'Core tasks', finding: 'OECD finds reported SME benefits are stronger when AI supports core company tasks', implication: 'Cheaper models have their strongest value case when attached to material workflows.', source: 'OECD, AI adoption by SMEs, 2025', href: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/ai-adoption-by-small-and-medium-sized-enterprises_9c48eae6/426399c1-en.pdf' },
    { statistic: '85%', finding: 'Text generation and natural language processing dominate use among current UK business adopters', implication: 'Rapid model commoditisation matters most where document and language workflows can be evaluated at the level of an accepted task.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'automation-before-agents': [
    { statistic: '19% slower', finding: 'Experienced open-source developers took longer with early-2025 AI tools in one randomised study', implication: 'Capability claims must be tested in the real context, especially where experts hold substantial tacit knowledge.', source: 'METR, Experienced Developer Productivity Study, 2025', href: 'https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf' },
    { statistic: 'Jagged', finding: 'Field research finds that AI performance varies materially across task boundaries', implication: 'Authority should be assigned by task and consequence, not by a general belief that the model is capable.', source: 'Harvard Business School, Navigating the Jagged Technological Frontier', href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf' },
    { statistic: '7%', finding: 'Agentic AI remains the least adopted AI category in current UK research', implication: 'Leaders should treat agent deployment as controlled operating-model change, not a mature default.', source: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
    { statistic: 'Small batches', finding: 'Google DORA recommends shorter delivery batches as AI increases the velocity of change', implication: 'A bounded release with fast feedback and explicit rollback is a stronger path to autonomy than a large agent rollout.', source: 'Google DORA, AI Capabilities Model, 2025', href: 'https://dora.dev/capabilities/' },
  ],
  'cold-chain-collaboration': [
    { statistic: 'Definitive view', finding: 'NCSC guidance begins with a current architecture and asset record', implication: 'Monitoring design should document sensors, gateways, network boundaries and third-party access before adding analytics.', source: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' },
    { statistic: 'Known good', finding: 'NCSC recommends schema validation across OT trust boundaries', implication: 'Telemetry and equipment context should be validated before automated classification.', source: 'NCSC, Secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' },
    { statistic: 'Human record', finding: 'Food safety guidance links temperature control with checks and corrective action', implication: 'The digital system should improve evidence quality while preserving operator responsibility.', source: 'Food Standards Agency', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' },
    { statistic: '4 functions', finding: 'NIST connects governance, context mapping, measurement and active management', implication: 'Cold-chain AI needs a named control model and live performance review around the technical architecture.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  ],
  'small-teams-ai-advantage': [
    { statistic: '31%', finding: 'Nearly one third of surveyed SMEs across seven countries use generative AI', implication: 'Access barriers have fallen, so advantage increasingly depends on implementation discipline.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: '39%', finding: 'Many AI-using SMEs with a recent skills gap say generative AI helped compensate', implication: 'Small firms can target bottlenecks where scarce expertise limits throughput.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: '83%', finding: 'Most surveyed SME users report no change in overall staff need', implication: 'The near-term case is workforce augmentation and growth capacity, not an automatic labour-reduction thesis.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: '1 in 3', finding: 'Only a third of UK businesses planning adoption feel ready to implement AI', implication: 'A lean specialist team can create advantage by turning leadership proximity into practical readiness, named responsibility and evidence.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'measure-automation-value': [
    { statistic: '15%', finding: 'A field study of 5,172 support agents found higher issues resolved per hour with AI assistance', implication: 'Value can be material in a well-matched workflow, but the measured outcome is specific to the task and operating environment.', source: 'Quarterly Journal of Economics, Generative AI at Work, 2025', href: 'https://academic.oup.com/qje/article/140/2/889/7990658' },
    { statistic: '19% slower', finding: 'A different randomised study found a slowdown for experienced developers on familiar repositories', implication: 'A credible business case must test the target workflow because a productivity percentage from another context will not transfer reliably.', source: 'METR, Experienced Developer Productivity Study, 2025', href: 'https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf' },
    { statistic: 'Amplifier', finding: 'Google DORA connects returns to the quality of the organisational system', implication: 'Benefits measurement should include adoption, process quality and the capabilities surrounding the tool.', source: 'Google DORA Report 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: 'Productivity, not revenue', finding: 'Most UK adopters report productivity improvement while most report no revenue change', implication: 'Business cases should distinguish operating performance from realised financial value and make the conversion mechanism explicit.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'legal-ai-source-grounded-work': [
    { statistic: 'Verify', finding: 'Law Society guidance warns practitioners to check generated citations, propositions and source reliability', implication: 'Every material proposition should retain a direct route to the authority used for professional review.', source: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' },
    { statistic: 'Professional duty', finding: 'SRA resources place AI use within existing professional and supervisory obligations', implication: 'Model assistance does not move responsibility for accepted work away from the professional who signed it.', source: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' },
    { statistic: 'Lifecycle', finding: 'ICO guidance requires organisations to assess data protection across design and operation', implication: 'Matter access, minimisation, retention and review evidence belong inside the service design.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
    { statistic: '40 to 2 minutes', finding: 'Ironclad reports that one contract-review task fell from about forty minutes to two in its implementation', implication: 'The result is vendor-reported and task-specific; it illustrates potential workflow compression without setting a legal-sector forecast.', source: 'OpenAI, Ironclad customer story', href: 'https://openai.com/index/ironclad/' },
    { statistic: 'Customer report', finding: 'DLA Piper describes controlled adoption of Microsoft 365 Copilot across legal work', implication: 'The case illustrates governance and user adoption choices but cannot establish performance for another firm.', source: 'Microsoft, DLA Piper customer story', href: 'https://www.microsoft.com/en/customers/story/19584-dla-piper-microsoft-365-copilot' },
  ],
  'hospitality-ai-guest-recovery': [
    { statistic: 'Data protection', finding: 'ICO guidance treats lawful, fair and documented personal-data processing as a lifecycle responsibility', implication: 'Guest identity matching and profile use need defined purpose, access and retention controls.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
    { statistic: 'Customer report', finding: 'Radisson describes a central data platform supporting personalisation and operational insight', implication: 'The first-party case illustrates data unification while offering no result for a guest-recovery design elsewhere.', source: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' },
    { statistic: 'Customer report', finding: 'SNÖ Hotels describes centralising financial and operating information on Dynamics 365 Business Central', implication: 'The example shows the operational role of shared records and remains scoped to the reported implementation.', source: 'Microsoft, SNÖ Hotels customer story', href: 'https://www.microsoft.com/en/customers/story/25861-sno-hotels-dynamics-365-business-central' },
    { statistic: 'Customer report', finding: 'Tauá Resorts describes a shared data and AI programme across the guest journey', implication: 'The vendor story provides an implementation example without proving a general recovery effect.', source: 'Google Cloud, Tauá Resorts customer story', href: 'https://cloud.google.com/customers/taua-resorts' },
    { statistic: 'Customer report', finding: 'Booking.com describes AI assistance across travel planning and service contexts', implication: 'The account illustrates scale and channel complexity while leaving property-level recovery economics open.', source: 'OpenAI, Booking.com customer story', href: 'https://openai.com/index/booking-com/' },
  ],
};
