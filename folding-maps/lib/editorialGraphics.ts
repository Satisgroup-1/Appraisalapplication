export type EvidencePoint = {
  label: string;
  value: number;
  display: string;
  detail: string;
};

export type EvidenceView = {
  label: string;
  title: string;
  summary: string;
  interpretation?: {
    establishes: string;
    doesNotEstablish: string;
    management: string;
  };
  source: string;
  href?: string;
  points: EvidencePoint[];
};

export const newsEvidenceViews: Record<string, EvidenceView[]> = {
  'ai-integration-gap': [
    {
      label: 'Adoption context',
      title: 'Use has spread further than operating integration',
      summary: 'These figures use different respondent bases. The contrast is useful as context, not as a conversion funnel.',
      interpretation: {
        establishes: 'Reported AI use is widespread in a digitally active survey population, while reported connection to business systems is less common.',
        doesNotEstablish: 'The bars do not share one denominator and do not measure a progression from adoption to value.',
        management: 'Treat usage as evidence of experimentation, then evaluate value at the level of a defined workflow.',
      },
      source: 'UK Business Data Survey 2026',
      href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
      points: [
        { label: 'AI use among data-handling firms', value: 41, display: '41%', detail: 'Share of businesses handling digitised data that reported using AI for any purpose.' },
        { label: 'System integration among AI users', value: 21, display: '21%', detail: 'Share of AI-using businesses that reported integration with an existing business system.' },
        { label: 'Comfort with external model training', value: 18, display: '18%', detail: 'Share comfortable with business data being used to train an external AI model.' },
      ],
    },
    {
      label: 'Integration by size',
      title: 'Scale still buys an integration advantage',
      summary: 'Among businesses already using AI, larger firms report materially higher integration with existing systems.',
      interpretation: {
        establishes: 'Larger AI-using businesses report system integration more frequently than smaller adopters.',
        doesNotEstablish: 'The survey does not prove that size caused integration or that every reported connection changed operating performance.',
        management: 'Smaller firms should budget for data, ownership and workflow work because the connector rarely supplies those capabilities.',
      },
      source: 'UK Business Data Survey 2026',
      href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
      points: [
        { label: 'Sole traders', value: 18, display: '18%', detail: 'Reported system integration among sole traders already using AI.' },
        { label: 'Micro businesses', value: 27, display: '27%', detail: 'Reported system integration among AI-using micro businesses.' },
        { label: 'Small businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using small businesses.' },
        { label: 'Medium businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using medium businesses.' },
        { label: 'Large businesses', value: 57, display: '57%', detail: 'Reported system integration among AI-using large businesses.' },
      ],
    },
  ],
  'open-weight-price-war': [
    {
      label: 'Query economics',
      title: 'Equivalent-capability inference became dramatically cheaper',
      summary: 'The comparison uses the lowest-priced model exceeding a GPT-3.5-level MMLU threshold in each period.',
      interpretation: {
        establishes: 'The price of querying a model above one historical benchmark threshold fell sharply between November 2022 and October 2024.',
        doesNotEstablish: 'A shared MMLU threshold does not imply equivalent quality, reliability or total cost on a business workflow.',
        management: 'Use lower prices to broaden representative testing, not to weaken acceptance standards.',
      },
      source: 'Stanford HAI, AI Index 2025',
      href: 'https://hai.stanford.edu/news/ai-index-2025-state-of-ai-in-10-charts',
      points: [
        { label: 'November 2022', value: 20, display: '$20.00', detail: 'Approximate cost per million tokens at the stated capability threshold.' },
        { label: 'October 2024', value: 0.07, display: '$0.07', detail: 'Approximate cost per million tokens for Gemini 1.5 Flash 8B at the same threshold.' },
      ],
    },
    {
      label: 'Open-weight gap',
      title: 'Open-weight models narrowed part of the benchmark gap',
      summary: 'A smaller benchmark gap expands buyer choice, but it does not remove deployment, evaluation or licensing obligations.',
      interpretation: {
        establishes: 'Open-weight candidates became more competitive on selected benchmarks during the reported period.',
        doesNotEstablish: 'The comparison does not demonstrate parity across tasks or account for the cost of operating an open-weight service.',
        management: 'Benchmark the actual task and price the responsibilities that move from supplier to buyer.',
      },
      source: 'Stanford HAI, AI Index 2025',
      href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf',
      points: [
        { label: 'Earlier reported gap', value: 8, display: '8.0 pts', detail: 'Reported closed versus open-weight performance difference on selected benchmarks.' },
        { label: '2024 reported gap', value: 1.7, display: '1.7 pts', detail: 'The narrowed difference reported by Stanford on selected benchmarks.' },
      ],
    },
  ],
  'automation-before-agents': [
    {
      label: 'Productivity evidence',
      title: 'The empirical record is positive, negative and highly task-specific',
      summary: 'Results come from different studies, tasks and populations. They should not be averaged or treated as a forecast for another workflow.',
      interpretation: {
        establishes: 'Observed AI effects vary materially across occupations, tasks and operating contexts.',
        doesNotEstablish: 'The studies are not a league table of models and cannot be combined into an expected return for agent deployment.',
        management: 'Require representative workflow tests before granting broader authority or importing a productivity assumption.',
      },
      source: 'OECD research synthesis and METR, 2025',
      href: 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/',
      points: [
        { label: 'Customer-support study', value: 114, display: '+14%', detail: 'Reported performance uplift in a customer-support setting cited by the OECD.' },
        { label: 'Consulting-task study', value: 140, display: 'nearly +40%', detail: 'Reported performance uplift on selected consulting tasks cited by the OECD.' },
        { label: 'Programming-task study', value: 150, display: 'over +50%', detail: 'Reported uplift in a bounded programming experiment cited by the OECD.' },
        { label: 'Experienced developers', value: 81, display: '-19%', detail: 'METR found experienced open-source developers took longer with early-2025 tools on their own repositories.' },
      ],
    },
    {
      label: 'Adoption maturity',
      title: 'Agentic systems remain a minority use case',
      summary: 'Language use dominates current adoption, while agentic systems remain relatively uncommon in the UK research sample.',
      interpretation: {
        establishes: 'Reported agentic AI use is much less common than text and language use among current UK adopters.',
        doesNotEstablish: 'Low adoption does not prove that agents are ineffective, unsafe or unsuitable for a particular mature workflow.',
        management: 'Treat deployment as an emerging operating-model decision and demand stronger evidence for consequential tool access.',
      },
      source: 'DSIT, AI Adoption Research 2026',
      href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research',
      points: [
        { label: 'Text and language use', value: 85, display: '85%', detail: 'Share of adopting organisations reporting text generation or natural-language processing.' },
        { label: 'Agentic AI use', value: 7, display: '7%', detail: 'Share reporting agentic AI, the least adopted category in the study.' },
      ],
    },
  ],
  'cold-chain-collaboration': [
    {
      label: 'Evidence model',
      title: 'A useful exception combines signal and operating context',
      summary: 'This is a modelled design weighting. It shows how a case can become more decision-ready without pretending that every input is equally important.',
      interpretation: {
        establishes: 'The proposed design needs more than a temperature number to support a reviewable operating decision.',
        doesNotEstablish: 'The weights are not measured contributions to food safety, response quality or financial value.',
        management: 'Test the evidence model against historical and live cases before using it to set severity.',
      },
      source: 'Quiet Gears service design, informed by FSA and NCSC guidance',
      points: [
        { label: 'Temperature and duration', value: 100, display: 'Core', detail: 'The observed excursion and its duration establish the initial operational question.' },
        { label: 'Asset operating state', value: 78, display: 'Material', detail: 'Defrost cycles, loading and equipment state can change the interpretation of a reading.' },
        { label: 'Product and location context', value: 66, display: 'Material', detail: 'Product sensitivity and sensor location influence consequence and priority.' },
        { label: 'Operator evidence', value: 48, display: 'Supporting', detail: 'Notes, inspection and corrective action complete the decision record.' },
      ],
    },
    {
      label: 'Control sequence',
      title: 'The value chain fails if any control stage is skipped',
      summary: 'A modelled control profile following the argument above. Equal weighting reflects dependency, not measured contribution.',
      interpretation: {
        establishes: 'The proposed exception route depends on signal validation, contextual classification, ownership and evidenced closure.',
        doesNotEstablish: 'Equal bars do not mean the stages contribute equally to risk reduction or economic value.',
        management: 'Evaluate the complete route in parallel with current controls; optimisation of one isolated stage is insufficient.',
      },
      source: 'Quiet Gears synthesis of FSA, NCSC and NIST guidance',
      points: [
        { label: 'Validate signal', value: 100, display: 'Required', detail: 'Missing, stale or implausible readings must remain visible.' },
        { label: 'Classify context', value: 100, display: 'Required', detail: 'Threshold, duration, asset and product context establish materiality.' },
        { label: 'Assign response', value: 100, display: 'Required', detail: 'Every qualifying exception needs a named owner and response expectation.' },
        { label: 'Evidence closure', value: 100, display: 'Required', detail: 'Closure should preserve decision, corrective action and recovery evidence.' },
      ],
    },
  ],
  'small-teams-ai-advantage': [
    {
      label: 'SME workforce',
      title: 'Adoption is meaningful, while labour effects remain nuanced',
      summary: 'The OECD survey spans seven countries. Each measure has its own respondent base and should be read separately.',
      interpretation: {
        establishes: 'Generative AI is used by a material share of surveyed SMEs and is often associated with reported performance or skills benefits.',
        doesNotEstablish: 'The survey does not measure the size of productivity gains or show that smaller firms outperform larger organisations.',
        management: 'Use the evidence to justify a focused test, not a general labour-reduction or competitive-advantage claim.',
      },
      source: 'OECD, Generative AI and the SME Workforce, 2025',
      href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html',
      points: [
        { label: 'SMEs using generative AI', value: 31, display: '31%', detail: 'Nearly one third of surveyed SMEs reported generative AI use.' },
        { label: 'Skills-gap relief', value: 39, display: '39%', detail: 'Share of relevant AI-using SMEs reporting that generative AI helped compensate for a recent skills gap.' },
        { label: 'No change in staff need', value: 83, display: '83%', detail: 'Most surveyed SME users reported no change in overall staffing need.' },
      ],
    },
    {
      label: 'UK readiness',
      title: 'Interest exceeds implementation readiness',
      summary: 'Readiness is a management capability question, not simply a technology-purchasing question.',
      interpretation: {
        establishes: 'Many current and prospective adopters do not report being ready to implement or scale AI.',
        doesNotEstablish: 'Self-reported readiness does not identify which delivery model will work or predict project success.',
        management: 'Concentrate scarce ownership, data and evaluation capacity on one bounded workflow.',
      },
      source: 'DSIT, AI Adoption Research 2026',
      href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research',
      points: [
        { label: 'Businesses currently using AI', value: 16, display: '16%', detail: 'Around one in six UK businesses reported current use of at least one AI technology.' },
        { label: 'Prospective adopters ready to implement', value: 33, display: '1 in 3', detail: 'Only about one third of businesses planning adoption reported readiness to implement.' },
        { label: 'Current users ready to scale', value: 54, display: '54%', detail: 'Just over half of current users felt ready to scale their use.' },
      ],
    },
  ],
  'measure-automation-value': [
    {
      label: 'Observed outcomes',
      title: 'Productivity effects can point in opposite directions',
      summary: 'The two studies cover different occupations, tasks and operating contexts. The comparison demonstrates heterogeneity, not relative model quality.',
      interpretation: {
        establishes: 'Credible studies have found both positive and negative productivity effects in different settings.',
        doesNotEstablish: 'The results cannot be averaged, compared as model performance or imported into another business case.',
        management: 'Measure the target workflow with its own baseline, adoption, review and exception costs.',
      },
      source: 'Quarterly Journal of Economics, 2025 and METR, 2025',
      href: 'https://academic.oup.com/qje/article/140/2/889/7990658',
      points: [
        { label: 'Customer-support agents', value: 115, display: '+15%', detail: 'Issues resolved per hour increased in a field study of 5,172 support agents.' },
        { label: 'Experienced developers', value: 81, display: '-19%', detail: 'Completion time worsened in the METR randomised study of experienced developers on familiar repositories.' },
      ],
    },
    {
      label: 'Value bridge',
      title: 'Gross time released contracts before it becomes financial value',
      summary: 'A modelled bridge showing why adoption, exceptions and redeployment must be observed before a cash claim is made.',
      interpretation: {
        establishes: 'A benefits case needs separate stages between theoretical task time, usable capacity and financial consequence.',
        doesNotEstablish: 'The values are modelled assumptions and do not predict a typical conversion rate.',
        management: 'Name the owner and evidence required at each stage before reporting realised value.',
      },
      source: 'Quiet Gears benefits model (design values, not measured findings)',
      points: [
        { label: 'Gross task time released', value: 100, display: '100 hours', detail: 'The theoretical saving before real operating friction is counted.' },
        { label: 'After adoption and exceptions', value: 72, display: '72 hours', detail: 'Capacity remaining after usage, review and rescue effort.' },
        { label: 'Redeployed to measured work', value: 48, display: '48 hours', detail: 'Capacity deliberately redirected to activity with an observed output.' },
        { label: 'Converted to cash impact', value: 20, display: '20 hours eq.', detail: 'The modelled portion linked to cost removed, avoided or verified contribution.' },
      ],
    },
  ],
  'legal-ai-source-grounded-work': [
    {
      label: 'Validity chain',
      title: 'Every accepted proposition needs four independent checks',
      summary: 'This is a modelled control sequence informed by professional guidance. Equal values express dependency and contain no measured legal-work result.',
      interpretation: {
        establishes: 'The proposed service treats authority, jurisdiction, date and textual support as separate conditions for professional review.',
        doesNotEstablish: 'The exhibit provides no accuracy, productivity or risk-reduction evidence for a deployed legal system.',
        management: 'Release criteria should test each failure class separately because one blended score could hide a consequential defect.',
      },
      source: 'Quiet Gears control design informed by Law Society and ICO guidance',
      href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai',
      points: [
        { label: 'Authoritative source', value: 100, display: 'Required', detail: 'The source must belong to the approved hierarchy for the matter.' },
        { label: 'Jurisdiction match', value: 100, display: 'Required', detail: 'The source must be relevant to the legal system and forum in question.' },
        { label: 'Temporal validity', value: 100, display: 'Required', detail: 'The service must surface amendment, appeal and effective-date information for review.' },
        { label: 'Proposition support', value: 100, display: 'Required', detail: 'The cited passage must support the claim made in the draft.' },
      ],
    },
    {
      label: 'Release evidence',
      title: 'Legal evaluation must separate unlike failure classes',
      summary: 'Modelled evaluation priorities for a matter-scoped pilot. The values express control criticality and are not empirical weights.',
      interpretation: {
        establishes: 'Citation fabrication, weak support, omission, confidentiality and reviewer behaviour require distinct evidence.',
        doesNotEstablish: 'The bars do not predict defect frequency or assign financial value to any control.',
        management: 'Set thresholds by consequence and keep professional review effort inside the economic denominator.',
      },
      source: 'Quiet Gears evaluation design (design values, not measured findings)',
      points: [
        { label: 'Citation existence', value: 100, display: 'Blocking', detail: 'A fabricated or inaccessible source prevents acceptance.' },
        { label: 'Material proposition support', value: 100, display: 'Blocking', detail: 'A material claim without adequate authority prevents acceptance.' },
        { label: 'Cross-matter disclosure', value: 100, display: 'Blocking', detail: 'Unauthorised disclosure is a release-stopping control failure.' },
        { label: 'Material omission', value: 92, display: 'Critical', detail: 'The evaluation must detect missing issues that could change the legal conclusion.' },
        { label: 'Reviewer inspection', value: 78, display: 'Monitor', detail: 'Source-opening behaviour helps detect false reassurance during supervised use.' },
      ],
    },
  ],
  'hospitality-ai-guest-recovery': [
    {
      label: 'Case completeness',
      title: 'Recovery depends on five reconciled records',
      summary: 'A modelled dependency model for a guest-recovery case. Equal values are requirements and contain no measured hotel outcome.',
      interpretation: {
        establishes: 'The proposed route needs identity, promise, property state, authority and closure evidence before it can support accountable recovery.',
        doesNotEstablish: 'A complete case does not guarantee guest satisfaction, faster resolution or lower compensation.',
        management: 'Test connector freshness and ownership before measuring generated communication quality.',
      },
      source: 'Quiet Gears hospitality operating design (design values, not measured findings)',
      points: [
        { label: 'Guest and booking identity', value: 100, display: 'Required', detail: 'The case must link the right guest, stay and channel reference.' },
        { label: 'Entitlement and promise', value: 100, display: 'Required', detail: 'The booked product and policy determine the permitted remedy space.' },
        { label: 'Live property state', value: 100, display: 'Required', detail: 'Room, housekeeping and maintenance state determine what can be fulfilled.' },
        { label: 'Recovery authority', value: 100, display: 'Required', detail: 'A named colleague or approver must hold authority for the remedy.' },
        { label: 'Action and closure evidence', value: 100, display: 'Required', detail: 'Commitments and outcomes must remain visible to the next colleague.' },
      ],
    },
    {
      label: 'Pilot measures',
      title: 'Recovery quality cannot be reduced to compensation cost',
      summary: 'Modelled measurement priorities for a parallel pilot. Values show proposed decision relevance, not expected improvement.',
      interpretation: {
        establishes: 'The evaluation must cover ownership, feasibility, handoffs, policy and guest outcome across the complete recovery route.',
        doesNotEstablish: 'The weights do not predict satisfaction, loyalty, revenue or operating savings.',
        management: 'Use a balanced review so lower compensation cannot disguise slower or less humane recovery.',
      },
      source: 'Quiet Gears evaluation design (design values, not measured findings)',
      points: [
        { label: 'Time to named ownership', value: 90, display: 'Core', detail: 'Measure when one colleague becomes accountable for the case.' },
        { label: 'Time to feasible option', value: 100, display: 'Core', detail: 'Measure when a deliverable remedy becomes available, not when text is generated.' },
        { label: 'Repeat contacts and handoffs', value: 82, display: 'Material', detail: 'Repeated explanation is evidence of coordination failure.' },
        { label: 'Policy and compensation control', value: 88, display: 'Material', detail: 'Track approved bands, overrides and escalation decisions.' },
        { label: 'Guest outcome evidence', value: 78, display: 'Material', detail: 'Use feedback and subsequent behaviour carefully because attribution is incomplete.' },
      ],
    },
  ],
};
