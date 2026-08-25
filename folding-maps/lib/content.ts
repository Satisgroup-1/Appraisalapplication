export type Metric = { value: string; label: string; detail?: string };
export type Bar = { label: string; value: number; display: string };
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
  bars: Bar[];
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
    barSubtitle: 'Relative priority score from discovery workshops, normalised to 100.',
    bars: [
      { label: 'Shared customer context', value: 100, display: 'Critical' },
      { label: 'A named next action', value: 88, display: 'High' },
      { label: 'Management visibility', value: 72, display: 'High' },
      { label: 'Automated drafting', value: 43, display: 'Later' },
    ],
    barNote: 'Source: Quiet Gears discovery synthesis. Scores express design priority. None of them measures performance.',
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
    barSubtitle: 'Modelled contribution of each evidence layer to a triage decision.',
    bars: [
      { label: 'Temperature and duration', value: 100, display: 'Core' },
      { label: 'Asset operating state', value: 78, display: 'Material' },
      { label: 'Product and location context', value: 66, display: 'Material' },
      { label: 'Operator notes', value: 48, display: 'Supporting' },
    ],
    barNote: 'Source: Quiet Gears service design. The values are relative design weights. None is an empirical finding.',
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
    barSubtitle: 'Modelled allocation of responsibility across the intake decision.',
    bars: [
      { label: 'Structured data capture', value: 100, display: 'System led' },
      { label: 'Mandatory control checks', value: 92, display: 'Rules led' },
      { label: 'Matter summary', value: 70, display: 'AI assisted' },
      { label: 'Acceptance decision', value: 18, display: 'Human led' },
    ],
    barNote: 'Source: Quiet Gears control design. Bar length represents automation suitability. It carries no measured accuracy.',
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
  date: string;
  read: string;
  tag: string;
  title: string;
  intro: string;
  thesis: string;
  metrics: Metric[];
  code: { title: string; lines: string[]; nodes: string[] };
  actions: string[];
  sources: Source[];
};

export const articles: Article[] = [
  {
    slug: 'ai-integration-gap', image: '/images/code-waterfall.svg', date: '15 Aug 2026', read: '7 min read', tag: 'Executive briefing', title: 'Only a fifth of UK AI users have connected it to a business system', intro: 'AI access has expanded quickly, but operational integration remains limited. Leaders should shift attention from tool adoption to workflow performance.',
    thesis: 'The next source of advantage is not access to AI. It is the ability to redesign a workflow, connect trusted data, set controls and measure the resulting operational change.',
    metrics: [{ value: '41%', label: 'of data-handling UK firms report some AI use', detail: 'UK Business Data Survey 2026' }, { value: '21%', label: 'of AI users report system integration', detail: 'UK Business Data Survey 2026' }, { value: '16%', label: 'of UK businesses use at least one AI technology', detail: 'DSIT AI Adoption Research 2026' }],
                code: { title: 'Integration connects a model to its evidence, its rules and its reviewer', lines: ['request = workflow.capture(input)', 'context = records.authorised(request)', 'draft = model.generate(context, policy)', 'result = evaluate(draft, testSet)', 'reviewer.check(result, exceptions)'], nodes: ['Workflow trigger', 'Trusted records', 'AI service', 'Evaluation gate', 'Named reviewer'] },
    actions: ['Select three workflows where delay, error or rework has a visible cost', 'Name the manager answerable for each workflow', 'Baseline performance before selecting technology', 'Fund integration, evaluation and adoption as core delivery work'],
    sources: [{ label: 'UK Government, UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' }, { label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'McKinsey, The state of AI in 2025', href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai' }],
  },
  {
    slug: 'open-weight-price-war', image: '/images/code-waterfall.svg', date: '12 Aug 2026', read: '7 min read', tag: 'AI market', title: 'Model prices have fallen; the cost of dependable automation has not', intro: 'Lower model costs widen the set of viable experiments. The strategic question is where cheaper intelligence can produce a dependable return.',
    thesis: 'Falling inference cost changes experimentation economics, but sustainable value still depends on workflow design, evaluation and the freedom to change models.',
    metrics: [{ value: '280x', label: 'fall in equivalent-capability inference cost', detail: 'Stanford AI Index, Nov 2022 to Oct 2024' }, { value: '2+', label: 'models in a sensible benchmark', detail: 'Minimum comparison design' }, { value: '1', label: 'workflow baseline', detail: 'Required before pilot' }],
                code: { title: 'A portable evaluation harness protects model choice', lines: ['cases = dataset.load("representative")', 'for model in candidates:', '  outputs = model.run(cases)', '  score = evaluate(outputs, rubric)', 'select(score.quality, score.totalCost)'], nodes: ['Test dataset', 'Model adapters', 'Common rubric', 'Cost model', 'Release decision'] },
    actions: ['Choose one high-volume, reviewable task', 'Create normal, difficult and adversarial examples', 'Compare at least two model families', 'Report cost per accepted output and the causes of rejection'],
    sources: [{ label: 'Stanford HAI, 2025 AI Index Report', href: 'https://hai.stanford.edu/ai-index/2025-ai-index-report' }, { label: 'NIST, AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }, { label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }],
  },
  {
    slug: 'automation-before-agents', image: '/images/case-property.svg', date: '28 Jul 2026', read: '8 min read', tag: 'Practical AI', title: 'Agents fail on the exceptions the workflow never defined', intro: 'An agent cannot rescue a process that nobody understands. Start with the hand-offs, decisions and exceptions that define the work.',
    thesis: 'Agentic technology should be given authority only after the workflow has clear states, tested controls and a named route for exceptions.',
    metrics: [{ value: '7%', label: 'agentic AI adoption among UK AI users', detail: 'DSIT AI Adoption Research 2026' }, { value: '3', label: 'authority levels', detail: 'Draft, recommend and act' }, { value: '1', label: 'named reviewer per exception', detail: 'Minimum operating discipline' }],
                code: { title: 'An authority gate separates suggestion from action', lines: ['proposal = agent.plan(task, context)', 'risk = controls.classify(proposal)', 'evidence = evaluator.check(proposal)', 'approval = authority.route(risk, evidence)', 'executor.run(approval.allowedActions)'], nodes: ['Task queue', 'Planning agent', 'Evaluation service', 'Authority gate', 'Controlled tools'] },
    actions: ['Move fixed rules, checks and state changes into ordinary software', 'Name the person who receives each class of exception', 'Build a test set weighted to the awkward cases', 'Grant draft, recommend and act as separate decisions'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'Harvard Business School, Navigating the Jagged Technological Frontier', href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf' }, { label: 'TheAgentCompany benchmark, Carnegie Mellon University, 2025', href: 'https://arxiv.org/abs/2412.14161' }, { label: 'Vaccaro, Almaatouq and Malone, Nature Human Behaviour, 2024', href: 'https://www.nature.com/articles/s41562-024-02024-1' }],
  },
  {
    slug: 'cold-chain-collaboration', image: '/images/case-cold-chain.svg', date: '09 Jul 2026', read: '7 min read', tag: 'Cold-chain operations', title: 'A temperature excursion changes nothing until it triggers a defined response', intro: 'Temperature-controlled sites already record continuous readings. What decides whether monitoring is worth its cost is the response an excursion sets in motion, and how quickly the evidence of that response can be produced.',
    thesis: 'Cold-chain readings become useful when the reading, the equipment context and the action someone took form one traceable operational record.',
    metrics: [{ value: '4', label: 'parts of a complete exception', detail: 'Signal, context, decision and action' }, { value: '1', label: 'evidence timeline', detail: 'Across systems and human notes' }, { value: 'Human', label: 'decision authority', detail: 'Stays with the operator throughout' }],
                code: { title: 'Every exception becomes a traceable case', lines: ['signal = telemetry.validate(reading)', 'context = assets.lookup(signal.asset)', 'case = policy.evaluate(signal, context)', 'action = operator.decide(case)', 'evidence.close(case, action)'], nodes: ['Telemetry', 'Asset context', 'Exception policy', 'Operations review', 'Evidence store'] },
    actions: ['Agree exception definitions with operators', 'Instrument signal quality before alert logic', 'Run observation mode before operational escalation', 'Review false positives and incomplete closures every week'],
    sources: [{ label: 'Food Standards Agency, Chilling Food Correctly', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' }, { label: 'UK legislation, temperature control requirements', href: 'https://www.legislation.gov.uk/uksi/2006/14/contents/made' }, { label: 'NCSC, Connected Places Cyber Security Principles', href: 'https://www.ncsc.gov.uk/collection/connected-places-security-principles' }],
  },
  {
    slug: 'small-teams-ai-advantage', image: '/images/case-yacht.svg', date: '18 Jun 2026', read: '7 min read', tag: 'Insight', title: 'Deciding takes a morning. Delivering takes capacity a small firm must build', intro: 'Proximity makes the decision cheap. The data work, review time and engineering attention needed to act on it are what a firm of twenty is short of.',
    thesis: 'For a firm of twenty the binding constraint on AI is the data work, review time and engineering attention available in a quarter, and a first release should be sized to that count.',
    metrics: [{ value: '14%', label: 'AI adoption among micro firms', detail: 'DSIT AI Adoption Research 2026' }, { value: '23%', label: 'AI adoption among mid-sized firms', detail: 'DSIT AI Adoption Research 2026' }, { value: '4', label: 'roles that must be named', detail: 'Director, process manager, data owner, engineer' }],
                code: { title: 'A reusable delivery loop turns one pilot into capability', lines: ['baseline = measure(workflow)', 'pilot = build(scope, controls)', 'evidence = compare(pilot, baseline)', 'decision = review(value, risk, adoption)', 'playbook.update(decision.learning)'], nodes: ['Operational baseline', 'Bounded pilot', 'Evaluation set', 'Leadership review', 'Reusable playbook'] },
    actions: ['Count the review hours, engineering days and where the records sit', 'Name the director, process manager, data owner and engineer', 'Write down what will not be attempted this quarter', 'End each release with an expand, adjust, hold or stop decision'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' }, { label: 'US SBA Office of Advocacy, AI in Business, 2025', href: 'https://advocacy.sba.gov/wp-content/uploads/2025/09/Research-Spotlight-AI-in-Business-Small-Firms-Closing-In_-092425.pdf' }],
  },
  {
    slug: 'measure-automation-value', image: '/images/news-marketing.svg', date: '30 May 2026', read: '7 min read', tag: 'Management', title: 'Hours saved reach the budget only when someone moves them', intro: 'A credible case links operational baselines, adoption and quality. It does not multiply theoretical minutes by salary and call the result cash.',
    thesis: 'Automation value should be reported as a bridge from baseline performance to observed operational change, with capacity, quality and cash effects kept separate.',
    metrics: [{ value: '4', label: 'measure families', detail: 'Time, quality, service and risk' }, { value: '2', label: 'comparison periods', detail: 'Baseline and observed operation' }, { value: '1', label: 'named manager per benefit', detail: 'Answerable for realising it' }],
                code: { title: 'A benefits ledger keeps assumptions and evidence together', lines: ['baseline = metrics.window(before)', 'observed = metrics.window(after)', 'delta = adjust(observed - baseline, demand)', 'value = benefits.classify(delta)', 'ledger.record(value, manager, confidence)'], nodes: ['Workflow telemetry', 'Baseline model', 'Adjustment logic', 'Benefit classification', 'Management ledger'] },
    actions: ['Agree the baseline period and eligible volume', 'Separate capacity, cash, quality, service and risk benefits', 'Track exception effort and workaround behaviour', 'Name the person responsible for converting capacity into value'],
    sources: [{ label: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' }, { label: 'McKinsey, How organizations are rewiring to capture value', href: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-how-organizations-are-rewiring-to-capture-value' }, { label: 'NIST, AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' }],
  },
  {
    slug: 'legal-ai-source-grounded-work', image: '/images/news-legal-source.svg', date: '17 Aug 2026', read: '24 min read', tag: 'Legal operations', title: 'Legal AI is usable only when every proposition traces to valid authority', intro: 'Legal assistance becomes useful when every material proposition can be traced to an authoritative source that is valid for the matter, date and jurisdiction.',
    thesis: 'A legal AI service should organise evidence and prepare reviewable work while matter scope, authoritative sources, confidentiality and professional sign-off govern every accepted proposition.',
    metrics: [{ value: '1', label: 'matter-scoped evidence set', detail: 'Required design boundary' }, { value: '4', label: 'validity checks', detail: 'Authority, jurisdiction, date and proposition' }, { value: '100%', label: 'professional sign-off', detail: 'Proposed acceptance requirement' }],
                code: { title: 'Citation provenance remains attached to every proposition', lines: ['scope = matter.authorise(user, question)', 'sources = retrieve.approved(scope, jurisdiction, date)', 'draft = model.propose(question, sources)', 'citations = verify.support(draft, sources)', 'decision = lawyer.sign(citations, openIssues)'], nodes: ['Matter workspace', 'Approved source index', 'Drafting service', 'Citation verifier', 'Professional sign-off'] },
    actions: ['Approve one matter type and source hierarchy', 'Define confidentiality and cross-matter access rules', 'Build a proposition-level evaluation set', 'Require professional sign-off with visible provenance'],
    sources: [{ label: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' }, { label: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' }, { label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'OpenAI, Ironclad customer story', href: 'https://openai.com/index/ironclad/' }],
  },
  {
    slug: 'hospitality-ai-guest-recovery', image: '/images/news-hospitality-recovery.svg', date: '17 Aug 2026', read: '23 min read', tag: 'Hospitality operations', title: 'Recovering a disrupted stay means reconciling five systems before anyone can act', intro: 'A disrupted stay crosses reservation, property, loyalty, maintenance and service records. Recovery improves when staff can reconcile those facts and act within clear authority.',
    thesis: 'Hospitality AI can improve a disrupted guest journey only after identity, entitlement, live property state and compensation authority have been reconciled into one recovery case a colleague can act on.',
    metrics: [{ value: '5', label: 'operating records in the recovery path', detail: 'Proposed system boundary' }, { value: '1', label: 'named colleague per case', detail: 'Proposed control' }, { value: '0', label: 'autonomous compensation changes', detail: 'Initial release boundary' }],
                code: { title: 'A recovery case connects the guest promise to a feasible action', lines: ['guest = identity.resolve(booking, profile)', 'state = property.current(room, maintenance)', 'rights = policy.entitlement(guest, disruption)', 'options = recovery.feasible(state, rights)', 'colleague.approve(options, audit)'], nodes: ['Reservation channels', 'Guest identity', 'Property state', 'Recovery policy', 'Service desk'] },
    actions: ['Map one high-friction guest disruption', 'Define identity confidence and manual review', 'Approve compensation bands and escalation rights', 'Run recovery cases beside the current process'],
    sources: [{ label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' }, { label: 'Microsoft, SNÖ Hotels customer story', href: 'https://www.microsoft.com/en/customers/story/25861-sno-hotels-dynamics-365-business-central' }, { label: 'OpenAI, Booking.com customer story', href: 'https://openai.com/index/booking-com/' }],
  },
];

export type ResearchFinding = { statistic: string; finding: string; implication: string; source: string; href: string };

export const caseResearch: Record<string, ResearchFinding[]> = {
  'yacht-operations': [
    { statistic: '65%', finding: 'SME users most often report improved employee performance', implication: 'The strongest case is better use of scarce staff time inside core work. Technology adoption for its own sake makes a weaker one.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
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
    { statistic: '1%', finding: 'Only a small share of surveyed built-environment firms report AI scaled across projects', implication: 'The near-term opportunity is a bounded transaction workflow with governed data. The evidence will not carry a broad transformation claim.', source: 'RICS, Artificial Intelligence in Construction Report 2025', href: 'https://www.rics.org/news-insights/artificial-intelligence-in-construction-report' },
    { statistic: '37%', finding: 'System integration is a leading reported barrier in the RICS survey', implication: 'Connecting evidence, stage gates and actions is likely to matter more than adding a standalone assistant.', source: 'RICS, AI in Construction 2025 findings', href: 'https://www.rics.org/news-insights/optimism-high-for-ai-in-construction-but-skills-shortages-and-integration-challenges-adoption' },
    { statistic: 'Guardrails', finding: 'RICS guidance emphasises professional judgement and responsible AI use', implication: 'Extracted fields and generated summaries should remain proposals until the qualified professional confirms them.', source: 'RICS, Responsible use of AI in surveying practice', href: 'https://www.rics.org/profession-standards/rics-standards-and-guidance/conduct-competence/responsible-use-of-ai' },
    { statistic: '4 functions', finding: 'NIST structures AI risk activity around govern, map, measure and manage', implication: 'Transaction automation needs a named operating manager, a context map, evaluated controls and a live route for handling failure.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  ],
  'professional-services-intake': [
    { statistic: 'Authoritative', finding: 'The Law Society warns that generated legal citations and propositions require verification', implication: 'The system should preserve source evidence and never present model output as an accepted professional conclusion.', source: 'The Law Society, Conducting legal research in the age of AI, 2026', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' },
    { statistic: 'SME focus', finding: 'Law Society guidance addresses both opportunity and data risk for smaller firms', implication: 'Intake automation needs an approved data boundary, confidentiality controls and a named supervising professional.', source: 'The Law Society, Generative AI: the essentials, 2025', href: 'https://www.lawsociety.org.uk/Topics/AI-and-lawtech/Guides/Generative-AI-the-essentials' },
    { statistic: '3 outputs', finding: 'ICO guidance combines audit methodology, organisational guidance and practical tools', implication: 'Data protection should be evidenced through design records, tests and operating controls. Policy wording on its own evidences little.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
    { statistic: 'Lifecycle', finding: 'NIST treats generative AI risk as an issue across design, deployment, operation and review', implication: 'Professional intake controls should be tested before launch and monitored as data, models and use patterns change.', source: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
  ],
  'field-service-planning': [
    { statistic: 'Amplifier', finding: 'Google DORA finds that AI magnifies existing organisational strengths and weaknesses', implication: 'Poor work-order data and unclear priorities will be amplified by an optimiser unless corrected first.', source: 'Google DORA, State of AI-assisted Software Development 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: 'Known good', finding: 'NCSC recommends schema-based validation at operational trust boundaries', implication: 'Jobs, resource data and telemetry should be validated before they influence a daily plan.', source: 'NCSC, Standardised and secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' },
    { statistic: 'Lifecycle', finding: 'NIST risk guidance expects measurement and management throughout operation', implication: 'Overrides, actual durations and plan failures should feed continuing review after the initial model assessment.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
    { statistic: '21%', finding: 'Only a minority of AI-using UK businesses report integration into existing systems', implication: 'Planning value depends on validated work orders, resource records and integration with the dispatch workflow. A standalone recommendation screen delivers none of it.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
  ],
};

export const articleResearch: Record<string, ResearchFinding[]> = {
  'ai-integration-gap': [
    { statistic: '21%', finding: 'System integration trails reported AI use among UK businesses', implication: 'The strategic gap after tool access is workflow connection, the state of the data and a named person answerable for it.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
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
    { statistic: '30.3%', finding: 'The strongest agent tested completed under a third of 175 long-horizon office tasks unaided', implication: 'Design the release so that an unfinished case stops where a person will see it.', source: 'TheAgentCompany benchmark, Carnegie Mellon University, 2025', href: 'https://arxiv.org/abs/2412.14161' },
    { statistic: 'Jagged', finding: 'Field research finds that AI performance varies materially across task boundaries', implication: 'Authority should be assigned task by task, according to consequence. A general belief that the model is capable is the wrong basis.', source: 'Harvard Business School, Navigating the Jagged Technological Frontier', href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf' },
    { statistic: '7%', finding: 'Agentic AI remains the least adopted AI category in current UK research', implication: 'Leaders should treat agent deployment as a controlled change to the operating model. It is not yet a mature default.', source: 'UK Government, AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
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
    { statistic: '83%', finding: 'Most surveyed SME users report no change in overall staff need', implication: 'The near-term case is workforce augmentation and growth capacity. A labour-reduction thesis does not follow automatically.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
    { statistic: '1 in 3', finding: 'Only a third of UK businesses planning adoption feel ready to implement AI', implication: 'A lean specialist team can create advantage by turning leadership proximity into practical readiness, named responsibility and evidence.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
  ],
  'measure-automation-value': [
    { statistic: '15%', finding: 'A field study of 5,172 support agents found higher issues resolved per hour with AI assistance', implication: 'Value can be material in a well-matched workflow, but the measured outcome is specific to the task and operating environment.', source: 'Quarterly Journal of Economics, Generative AI at Work, 2025', href: 'https://academic.oup.com/qje/article/140/2/889/7990658' },
    { statistic: '19% slower', finding: 'A different randomised study found a slowdown for experienced developers on familiar repositories', implication: 'A credible business case must test the target workflow because a productivity percentage from another context will not transfer reliably.', source: 'METR, Experienced Developer Productivity Study, 2025', href: 'https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf' },
    { statistic: 'Amplifier', finding: 'Google DORA connects returns to the quality of the organisational system', implication: 'Benefits measurement should include adoption, process quality and the capabilities surrounding the tool.', source: 'Google DORA Report 2025', href: 'https://dora.dev/research/2025/dora-report/' },
    { statistic: 'Productivity gains, flat revenue', finding: 'Most UK adopters report productivity improvement while most report no revenue change', implication: 'Business cases should distinguish operating performance from realised financial value and make the conversion mechanism explicit.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
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
