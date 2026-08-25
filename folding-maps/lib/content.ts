import { study as yacht_operations, research as yacht_operations_research } from '@/lib/cases/yacht-operations';
import { study as cold_chain, research as cold_chain_research } from '@/lib/cases/cold-chain';
import { study as property_pipeline, research as property_pipeline_research } from '@/lib/cases/property-pipeline';
import { study as professional_services_intake, research as professional_services_intake_research } from '@/lib/cases/professional-services-intake';
import { study as field_service_planning, research as field_service_planning_research } from '@/lib/cases/field-service-planning';

export type Metric = { value: string; label: string; detail?: string };
// `detail` is the tooltip shown when a reader selects a bar. It is optional
// because some projects chart a design priority and some chart something
// discovery counted, and those two need different wording.
export type Bar = { label: string; value: number; display: string; detail?: string };
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
  // A project publishes an evidence chart only when the firm has supplied the
  // count behind it. Absent means the engagement has specified what it is
  // measuring and the figures are not in yet, so the page shows the process
  // and system exhibits and the text says what is being counted.
  chart?: { subtitle: string; note: string; bars: Bar[] };
  phases: { label: string; detail: string }[];
  code: { title: string; lines: string[]; nodes: string[] };
  nextSteps: string[];
};

/** One file per project, under lib/cases. */
export const cases: CaseStudy[] = [
  yacht_operations,
  cold_chain,
  property_pipeline,
  professional_services_intake,
  field_service_planning,
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
    slug: 'legal-ai-source-grounded-work', image: '/images/news-legal-source.svg', date: '17 Aug 2026', read: '9 min read', tag: 'Legal operations', title: 'Legal AI is usable only when every proposition traces to valid authority', intro: 'Legal assistance becomes useful when every material proposition can be traced to an authoritative source that is valid for the matter, date and jurisdiction.',
    thesis: 'A legal AI service should organise evidence and prepare reviewable work while matter scope, authoritative sources, confidentiality and professional sign-off govern every accepted proposition.',
    metrics: [{ value: '1', label: 'matter-scoped evidence set', detail: 'Required design boundary' }, { value: '33%', label: 'hallucination rate, leading legal tool', detail: 'Stanford RegLab, JELS 2025' }, { value: '100%', label: 'professional sign-off', detail: 'Proposed acceptance requirement' }],
                code: { title: 'Citation provenance remains attached to every proposition', lines: ['scope = matter.authorise(user, question)', 'sources = retrieve.approved(scope, jurisdiction, date)', 'draft = model.propose(question, sources)', 'citations = verify.support(draft, sources)', 'decision = lawyer.sign(citations, openIssues)'], nodes: ['Matter workspace', 'Approved source index', 'Drafting service', 'Citation verifier', 'Professional sign-off'] },
    actions: ['Approve one matter type and source hierarchy', 'Define confidentiality and cross-matter access rules', 'Build a proposition-level evaluation set', 'Require professional sign-off with visible provenance'],
    sources: [{ label: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' }, { label: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' }, { label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'Ayinde v Haringey and Al-Haroun v Qatar National Bank [2025] EWHC 1383 (Admin)', href: 'https://www.judiciary.uk/judgments/ayinde-v-london-borough-of-haringey-and-al-haroun-v-qatar-national-bank/' }, { label: 'Stanford RegLab, Hallucination-Free? Assessing Leading AI Legal Research Tools, JELS 2025', href: 'https://onlinelibrary.wiley.com/doi/full/10.1111/jels.12413' }],
  },
  {
    slug: 'hospitality-ai-guest-recovery', image: '/images/news-hospitality-recovery.svg', date: '17 Aug 2026', read: '7 min read', tag: 'Hospitality operations', title: 'Guest recovery depends on the colleague most likely to leave', intro: 'An experienced colleague resolves a ruined stay faster than any integration can assemble the case. Hospitality also loses those colleagues faster than any other UK sector.',
    thesis: 'Connected guest records pay off on the shifts when nobody with years of local knowledge is working, which makes the weakest shift the design target and limits the claimable return to handling cost and avoided second failures.',
    metrics: [{ value: '52%', label: 'annual attrition in UK hospitality', detail: 'CIPD sector benchmarking' }, { value: '1', label: 'named colleague per case', detail: 'Proposed control' }, { value: '0', label: 'autonomous compensation changes', detail: 'Initial release boundary' }],
                code: { title: 'A recovery case connects the guest promise to a feasible action', lines: ['guest = identity.resolve(booking, profile)', 'state = property.current(room, maintenance)', 'rights = policy.entitlement(guest, disruption)', 'options = recovery.feasible(state, rights)', 'colleague.approve(options, audit)'], nodes: ['Reservation channels', 'Guest identity', 'Property state', 'Recovery policy', 'Service desk'] },
    actions: ['Roster the pilot onto the night shift', 'Fix the compensation a colleague may offer unaided', 'Measure handling time and repeat contacts by colleague', 'Report the spread across the team alongside the mean'],
    sources: [{ label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' }, { label: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' }, { label: 'CIPD, Labour turnover benchmarking', href: 'https://www.cipd.org/uk/knowledge/factsheets/turnover-retention-factsheet/' }, { label: 'de Matos, Henrique and Vargas Rossi, Service Recovery Paradox: A Meta-Analysis, Journal of Service Research, 2007', href: 'https://journals.sagepub.com/doi/10.1177/1094670507303012' }],
  },
];

export type ResearchFinding = { statistic: string; finding: string; implication: string; source: string; href: string };

export const caseResearch: Record<string, ResearchFinding[]> = {
  'yacht-operations': yacht_operations_research,
  'cold-chain': cold_chain_research,
  'property-pipeline': property_pipeline_research,
  'professional-services-intake': professional_services_intake_research,
  'field-service-planning': field_service_planning_research,
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
    { statistic: 'Five fabricated cases', finding: 'A Divisional Court found five non-existent decisions cited in one set of grounds and eighteen of forty-five authorities fabricated in another matter', implication: 'Document-level review did not catch the failure. The unit that needs checking is the individual proposition.', source: 'Ayinde v Haringey and Al-Haroun v Qatar National Bank [2025] EWHC 1383 (Admin)', href: 'https://www.judiciary.uk/judgments/ayinde-v-london-borough-of-haringey-and-al-haroun-v-qatar-national-bank/' },
    { statistic: '17% and 33%', finding: 'A peer-reviewed study measured hallucination rates for the two leading retrieval-based legal research tools, both marketed as hallucination-free', implication: 'Buying a source-grounded tool does not discharge the duty to check research against authoritative sources.', source: 'Stanford RegLab, Hallucination-Free? Assessing Leading AI Legal Research Tools, JELS 2025', href: 'https://onlinelibrary.wiley.com/doi/full/10.1111/jels.12413' },
  ],
  'hospitality-ai-guest-recovery': [
    { statistic: 'Data protection', finding: 'ICO guidance treats lawful, fair and documented personal-data processing as a lifecycle responsibility', implication: 'Guest identity matching and profile use need defined purpose, access and retention controls.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
    { statistic: 'About 52%', finding: 'Annual staff turnover in UK accommodation and food services runs near double the all-industry average', implication: 'A recovery design should assume the colleague on shift is new, because in this sector they usually are.', source: 'CIPD, Labour turnover benchmarking', href: 'https://www.cipd.org/uk/knowledge/factsheets/turnover-retention-factsheet/' },
    { statistic: 'Satisfaction only', finding: 'A meta-analysis found the service recovery paradox significant for satisfaction and not for repurchase, word of mouth or corporate image', implication: 'Recovery investment should be argued on handling cost and on avoided second failures. Recovered loyalty will not carry it.', source: 'de Matos, Henrique and Vargas Rossi, Journal of Service Research, 2007', href: 'https://journals.sagepub.com/doi/10.1177/1094670507303012' },
    { statistic: 'Second failure', finding: 'A systematic review of double deviation finds a failed recovery erodes trust further than the original failure', implication: 'The measure that matters is the rate of repeat contact on the same disruption.', source: 'The Burden of Double Deviation in Services, International Journal of Consumer Studies, 2022', href: 'https://onlinelibrary.wiley.com/doi/10.1111/ijcs.12798' },
    { statistic: 'Customer report', finding: 'Radisson describes a central data platform supporting personalisation and operational insight', implication: 'Published examples of connected guest data come from groups with central engineering, which is a reason to doubt the design transfers to a small operator.', source: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' },
  ],
};
