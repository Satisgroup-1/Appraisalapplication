import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
  slug: 'field-service-planning',
  image: '/images/news-industries.svg',
  sector: 'Field services',
  title: 'Planning field work around priority, capacity and evidence',
  summary: 'A planning layer built around the conditions that bind every assignment, and around the disruption each insertion transfers to another customer.',
  status: 'Anonymised',
  brief: 'Supporting dispatch teams by reducing a day of work orders to the assignments that are permitted at all, then stating what each of those assignments would cost the customers already booked. The client is not named here at their request. No count from their operation appears on this page: the work-order extract that would produce one has been specified and not yet supplied, and every improvement figure is a design target awaiting audit.',
  metrics: [
    { value: '6 weeks', label: 'work-order extract specified for discovery', detail: 'One region, awaiting supply' },
    { value: '3', label: 'hard conditions on every assignment', detail: 'Certification, working hours, parts' },
    { value: '0', label: 'preference weights published', detail: 'Withdrawn pending calibration' },
  ],
  phases: [
    { label: 'Count', detail: 'Establish the condition load across a representative extract.' },
    { label: 'Filter', detail: 'Remove every assignment that breaches a hard condition, with the reason.' },
    { label: 'Price', detail: 'State which existing commitments each surviving option would move.' },
    { label: 'Decide', detail: 'Dispatcher publishes and records a coded reason for any divergence.' },
  ],
  code: {
    title: 'Conditions filter first, then displacement is described',
    lines: ['candidates = pairings(jobs, engineers)', 'permitted = conditions.apply(candidates)', 'options = displacement.describe(permitted)', 'choice = dispatcher.decide(options, reasonCode)', 'record.compare(choice, actuals)'],
    nodes: ['Validated work orders', 'Condition filter', 'Displacement model', 'Dispatcher console', 'Outcome record'],
  },
  nextSteps: ['Supply the six-week work-order extract for one region', 'Replay published plans through the condition filter', 'Run shadow planning with coded divergence reasons', 'Agree the stop condition before any live recommendation'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'The operator is not named here at their request. No count from their operation is published on this page, because the work-order extract that would produce one has been specified and not yet supplied. Every performance improvement described is a design target awaiting audit.',
  thesis: 'Field-service planning is mostly a feasibility problem. A planning layer proves useful by removing the assignments that breach a hard condition, stating which commitments each surviving option would move, and keeping the dispatcher’s reason for the option they choose.',
  sceneLabel: 'The urgent job',
  openingTitle: 'At 07:12 an urgent job lands on a plan already published',
  openingParagraphs: [
    'The plan for the day went out at six. At 07:12 an urgent job arrives from the contact centre with a four-hour response clock attached. Somewhere in the region there is an engineer who holds the right certification, carries the right part and can reach the address in time. Finding that engineer takes the dispatcher a few minutes. Working out whose appointment has to move to make room takes considerably longer, and that is the part the customer feels.',
    'The operator runs a regional field force with mandatory certifications, customer appointment windows and working-hour limits attached to every assignment. Its dispatchers are experienced and its plans go out on time. The operator had no way to see the consequence of an insertion before making it, and any record afterwards of why one commitment was moved and another protected.',
    'The 07:12 job is the test this design has to pass. It runs through the account below because absorbing an urgent job is the moment when every condition, every promise and every judgement in the day become visible at once.',
  ],
  centralQuestion: 'This service justifies its cost only if a dispatcher can see, for every permitted way of absorbing an urgent job, which existing commitments it moves and which of those customers have already been moved this week.',
  processTitle: 'Count, filter, price, decide',
  systemTitle: 'Condition filter, displacement model, dispatcher decision',
  sections: [
    {
      heading: 'Feasibility binds a dispatcher’s day before distance',
      paragraphs: [
        { text: 'Discovery opens by specifying a count the operator has never run. Six consecutive weeks of work orders from a single region, each job read for the conditions that must hold before an engineer can be sent to it at all. A named certification. An appointment window agreed with the customer. A part that no van stocks as standard. All three fields already exist in the operator’s work-order records. Nobody has put them together and asked how much of an ordinary week they describe, and until somebody does, any claim about where planning effort should go is a claim about a distribution nobody has seen.' },
        { text: 'Two things turn on that count, and they pull in opposite directions. Where a job combines a certification requirement with a customer appointment window, the engineers who could lawfully and practically take the work are a small fraction of the roster on shift, and distance enters the problem only after that reduction has happened. Where a job has neither, the whole roster is available and something else has to choose between them. Dispatchers at this operator describe the first case as the common one. That is a recollection offered in interviews, and the design should be built so that the count is free to contradict it.' },
        { text: 'Operations research reached the same ordering long before this engagement. Savelsbergh established in 1985 that finding a feasible solution to the vehicle routing problem with time windows is NP-hard, and that constructing a feasible route for even one vehicle under time windows is already NP-hard. The expensive computation is establishing that a plan is permitted at all. Ranking permitted plans against preferences is the cheaper half of the problem, and it is the half most planning products advertise.', sources: [0] },
      ],
    },
    {
      heading: 'Filtering before scoring retired the preference weights',
      transition: 'Because feasibility is the expensive half of the problem, the weighting scheme this design had started from was tested against that ordering and did not survive.',
      paragraphs: [
        { text: 'Quiet Gears entered this engagement with a scoring model of its own. It ranked candidate assignments on four preference weights covering service level, operational priority, travel efficiency and plan stability, each printed to the nearest percentage point. An earlier version of this page published those weights. They were the firm’s own view of what a dispatcher should care about, and no part of them had been calibrated against the operator’s data or against any dispatcher’s revealed choices.' },
        { text: 'Applying a condition filter before any weighting shows where such weights could bite at all. On a job that needs both a certification and an appointment window, so few assignments survive the filter that the ranking among them rarely turns on which weighting is used. On a job subject to neither, the weights would govern the answer completely, and there the design was asking dispatchers to accept a preference nobody had measured. Neither case justifies publishing a percentage. The count will establish how much of the week falls into each case, which changes the size of the problem and leaves the verdict on the weights where it already stood.' },
        { text: 'So the weights were withdrawn. A filter and a statement replaced them. The filter removes every assignment that breaches a certification, working-hours or parts condition, and reports which condition removed it. The statement describes, for each surviving option, exactly which existing commitments would move and by how long. The dispatcher then chooses between options that are all permitted, on a description of consequences with no hidden coefficient inside it.' },
        { text: 'The defect reaches beyond this engagement, because planning software is full of it. A number printed to a percentage point tells a reader that somebody measured a preference and found it to be that. Where the measurement never happened, the precision does rhetorical work the analysis cannot support, and a footnote conceding as much removes none of the impression the chart has already made. The same test applies to a chart of operational counts, so this page publishes none until the extract arrives.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 2 }],
    },
    {
      heading: 'Displacement is the figure dispatch needs',
      transition: 'Withdrawing the blended score left the choice among permitted options unmade, and the operator’s own reassignment behaviour is where that choice does its damage.',
      paragraphs: [
        { text: 'Reassignment after publication is the second figure discovery has asked for, and it is the one that prices the design. Every reassignment is a commitment moved, and this operator’s dispatchers currently find out which commitment by scrolling through the day. The cost of moving the wrong one reaches well beyond travel. Aquant’s 2025 field service benchmark, a vendor study drawn from roughly 160 service organisations and more than 600,000 technician service records, reports that a failed first visit adds two further visits on average and extends resolution by fourteen days.', sources: [1] },
        { text: 'That cost is what this planning layer exists to make visible before it is incurred. For every permitted insertion of the urgent job, the system states which appointments move, how far each one moves, whether any of those customers has already been moved during the current week, and which engineer absorbs the additional travel. The dispatcher sees the transfer before making it. None of that calculation requires a model to hold an opinion about which customer deserves more.' },
        { text: 'Four components make up the planner. Work orders and roster records pass a validation step at the boundary, because a missing duration estimate makes a day appear to fit when it does not. A condition filter reduces the candidate assignments and records its reasons. A displacement model describes each survivor in moved commitments. A dispatcher console presents them and captures the decision. NCSC guidance on operational technology supports validating those inputs before they reach the planner.', sources: [4] },
        { text: 'Three objections deserve a hearing. A distance-minimising optimiser costs less to buy and would cut travel from next month, while this design declines to optimise anything at all. Under morning pressure a displacement statement may be scrolled past exactly as the schedule it replaced was scrolled past. And explainability guarantees nothing about use: a systematic review of the algorithm aversion literature reports that models people can inspect are sometimes overruled more often than opaque ones, because a reviewer who can follow the reasoning finds grounds to disagree with it.', sources: [2] },
        { text: 'Of those three, the first is answerable and the other two are open. Travel saved by an optimiser that sends an uncertified engineer to a certified job is repaid twice over in return visits, and the reassignment figure will show how often this operator is already paying that price. Whether dispatchers read a displacement statement under morning pressure, and whether reading one improves the choices they make, are matters no work-order extract can settle. Shadow running is the only instrument that reaches them.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Overrides decide whether this reaches live planning',
      role: 'conclusion',
      transition: 'Since the design now rests on a figure the dispatcher has to act on, the release test is whether dispatchers act on it and what they say when they set it aside.',
      paragraphs: [
        { text: 'Shadow running is therefore specified before anything is recommended into a live plan. For an agreed number of weeks the planner produces its filter output and its displacement statement alongside the plan the dispatcher publishes by hand. The published plan stays the dispatcher’s throughout. Every divergence between the two is recorded with a coded reason, and the codes are agreed with dispatchers in advance so that they describe how dispatchers think about a day.' },
        { text: 'Those reasons are the evidence. Sorted into model error, data error and policy gap, they say whether a divergence means the filter was wrong, the work-order record was wrong, or the operator’s own rules have never been written down. The NIST AI Risk Management Framework treats measurement and management as continuing obligations across an operating life, and these reason codes are what makes that continuation possible here.', sources: [3] },
        { text: 'Acceptance is defined before the extract arrives, which is the only order that keeps the test honest. Replayed across the six weeks, the condition filter must exclude no assignment the operator considers valid and admit none that breaches a stated condition. In shadow operation the divergence rate must fall across successive weeks, and the divergences that remain must concentrate in policy gaps the operator can then write down. The stop condition is agreed at the same time: if the filter is still excluding valid assignments at the end of shadow running, the condition rules are wrong and the work returns to discovery. Every improvement figure attached to travel, overtime or repeat visits remains a design target and none of it has been measured.' },
        { text: 'Applied to the job that arrives at 07:12, a defensible answer takes this illustrative shape. A short list of permitted insertions, each showing its certification and parts conditions as satisfied, each stating which appointments move and by how long, and one of them flagged because a customer it displaces was displaced on Tuesday. The dispatcher picks, and says why. Where that record shows dispatchers steadily disagreeing with the filter, the correct response is to stop and count again.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: 'NP-hard', finding: 'Finding a feasible solution to the vehicle routing problem with time windows is NP-hard, and constructing a feasible single-vehicle route under time windows is already NP-hard', implication: 'Feasibility is the expensive half of a dispatch problem, so a planning layer should spend its effort filtering permitted assignments before ranking them.', source: 'Savelsbergh, Local search in routing problems with time windows, Annals of Operations Research, 1985', href: 'https://link.springer.com/article/10.1007/BF02022044' },
  { statistic: '2 visits', finding: 'A failed first visit adds two further visits on average and extends resolution by fourteen days', implication: 'The cost of a wrong assignment sits in repeat visits and elapsed days, which is why displacement matters more than route length. This is a vendor benchmark drawn from roughly 160 service organisations and over 600,000 service records, and it is the only comparator of its kind available.', source: 'Aquant, 2025 Field Service Benchmark Report (vendor study)', href: 'https://www.globenewswire.com/news-release/2025/02/13/3026225/0/en/Aquant-s-2025-Field-Service-Benchmark-Report-Reveals-AI-Enabling-39-Faster-Machinery-Repairs-and-More.html' },
  { statistic: 'Aversion', finding: 'A systematic review of algorithm aversion finds that models users can inspect are sometimes overruled more often than opaque ones', implication: 'Explaining a recommendation may raise the override rate, so override reasons have to be captured and read before the design is judged.', source: 'Mahmud and others, What influences algorithmic decision-making? A systematic literature review on algorithm aversion, Technological Forecasting and Social Change, 2021', href: 'https://www.sciencedirect.com/science/article/pii/S0040162521008210' },
  { statistic: 'Lifecycle', finding: 'NIST risk guidance expects measurement and management throughout the operating life of a system', implication: 'Divergence codes, actual durations and failed visits should feed continuing review long after the first assessment.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { statistic: 'Known good', finding: 'NCSC recommends schema-based validation at operational trust boundaries', implication: 'Work orders, roster records and duration estimates should be validated before they influence a published plan.', source: 'NCSC, Standardised and secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' },
];
