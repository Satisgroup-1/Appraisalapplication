import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
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
};

export const editorial: CaseEditorial = {
  statusStatement: 'The operator has asked not to be named. Every service level, weight and expected benefit on this page is a design target agreed for the work, and none should be read as an audited outcome.',
  thesis: 'A useful cold-chain monitoring service must turn a temperature reading into a traceable exception case before it attempts to prioritise human attention.',
  sceneLabel: 'The situation',
  openingTitle: 'At 02:13, an eight-minute excursion begins with a number and ends with an operating decision',
  openingParagraphs: [
    'A sensor reports a temperature excursion. The overnight operator can see the value, but not yet whether a door was open, a unit was defrosting, the sensor was healthy or product was exposed. The decision clock has started before the evidence has assembled itself.',
    'This representative excursion is fictional and explains the design only. The case asks how a reading becomes an action taken by a named colleague, and how that is evidenced afterwards, without displacing the operator’s hazard analysis, maintenance schedule or legal obligations.',
  ],
  centralQuestion: 'The test is whether continuous monitoring improves the precision and completeness of exception handling without producing alert fatigue or an unsafe dependence on incomplete telemetry.',
  evidenceTitle: 'Evidence layers in an exception decision',
  processTitle: 'Signal to closed exception case',
  systemTitle: 'Read-only monitoring and exception ledger',
  evidenceInterpretation: {
    establishes: 'The design gives greatest decision weight to temperature and duration, then adds asset, product and operator context.',
    doesNotEstablish: 'Observed predictive accuracy, alert precision and performance at a real site cannot be inferred from the weights.',
    management: 'A pilot must test whether these evidence layers separate the cases worth acting on from the rest, before anyone relies on them.',
  },
  sections: [
    {
      heading: 'Excursion triage problem',
      paragraphs: [
        { text: 'The first reading confirms a threshold crossing while leaving product exposure, equipment failure and the required response unresolved. Equal treatment of every crossing creates alert fatigue, yet habitual discounting can obscure the case that matters.' },
        { text: 'Pilot evidence must separate signal availability from decision quality. Expected readings, heartbeat and calibration records should be reconciled before incidents are traced from alert through action and closure. Food-safety guidance links temperature checks with corrective action and supports a durable human record alongside telemetry.', sources: [2] },
        { text: 'The service must shorten the path between a reading and a colleague acting on it while making missing evidence visible. The next step is to follow the eight-minute excursion as each additional fact changes its meaning.' },
      ],
    },
    {
      heading: 'Signal validation and operating context',
      transition: 'A threshold breach cannot specify the response, so discovery adds evidence in the order needed to determine materiality.',
      paragraphs: [
        { text: 'Discovery first asks whether the signal is trustworthy. A stale heartbeat or implausible step change makes it a data-quality exception. If the signal survives, duration changes a momentary breach into a sustained event. Asset state may explain a defrost, while product and location context determine consequence. Operator notes reveal whether corrective action is already under way.' },
        { text: 'The weights make the proposed evidence hierarchy visible. They are design judgements offered for challenge, and carry no measured contribution from a validated classifier. Temperature and duration remain core, while asset, product and human context qualify the response.' },
        { text: 'The weighted graphic shows how a raw alert leaves severity underdetermined. It offers no calibration for the final threshold, and additional context may sometimes add noise. The design therefore treats the assembled exception case as the working unit and subjects its weighting to pilot review.' },
      ],
      exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
    },
    {
      heading: 'Exception-case architecture',
      transition: 'Severity now depends on assembled context. The system must preserve that context, put the case in front of the duty operator and record how it was resolved.',
      paragraphs: [
        { text: 'For the 02:13 excursion, the target process senses the reading and equipment state, validates signal quality, prioritises the case against a versioned policy and records human resolution. The diagram depicts the proposed decision path; live operation has yet to measure it.' },
        { text: 'The system design follows the same path. Sensors and gateways feed a read-only data-quality service, a policy engine assembles the exception, an operator reviews it in a queue, and a ledger records evidence, action and closure. The architecture assumes no privileged access to an operational-technology estate; where one exists, that integration boundary is the first assumption to re-examine.' },
        { text: 'Direct equipment control is rejected because it changes the hazard and security boundary. A threshold-to-message service is also rejected because it transfers ambiguity to the operator. NCSC guidance treats OT connectivity as an architectural control question, supporting separation, validated schemas and a definitive asset view.', sources: [0, 3] },
        { text: 'Together, the diagrams locate the points where uncertainty may be reduced and human authority remains decisive. Sensor coverage, policy quality and response capacity are still unknown. Each becomes an explicit pilot condition with a named source of evidence.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Parallel pilot controls',
      transition: 'The exception-case architecture preserves human authority, but its signal and policy assumptions still require testing beside the existing process.',
      paragraphs: [
        { text: 'The pilot selects one asset class at one site and runs beside the existing process. Historic replay supplies representative excursions if observation contains too few. Operators continue with their existing controls while the team compares how the service classified each event, who it reached and what evidence closing it produced.' },
        { text: 'Acceptance requires known signal coverage, visible missing-data states, reviewed alert precision, assignment within an agreed severity target and complete closure records. Triage within fifteen minutes is a proposed service target whose suitability depends on local hazards and staffing. No measured result supports it yet.' },
        { text: 'Parallel running creates duplicate effort and delays efficiency, but exposes false positives, false negatives and unsafe assumptions before reliance. Threshold changes require approval and version history; monitoring remains read-only; closure requires corrective evidence.' },
      ],
    },
    {
      heading: 'Monitoring release threshold',
      role: 'conclusion',
      transition: 'Parallel operation produces the precision, response and missed-event evidence needed for a controlled release decision.',
      paragraphs: [
        { text: 'At present, the 02:13 excursion demonstrates an operating hypothesis only. The design shows how signal, duration, asset state, product context and notes should meet in one case. It cannot show that a deployment would detect every event, reduce reporting effort or improve response time.' },
        { text: 'The overnight operator supplies the final test: does the assembled case improve the decision while preserving scepticism about weak telemetry? Pilot evidence must cover invalid-signal detection, alert precision, unassigned case age, response timing, closure completeness and events found only by the existing process.' },
        { text: 'Monitoring may become an accepted triage source only with evidence of better attention allocation and no unacceptable loss of material-event detection. Otherwise the design goes back to signal coverage, the threshold policy, or the question of which shift responds.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '8 principles', finding: 'NCSC guidance treats secure OT connectivity as a managed architecture decision', implication: 'Monitoring should query a controlled data layer and avoid creating an uncontrolled path back into equipment.', source: 'NCSC, Secure connectivity for operational technology, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity' },
  { statistic: '4 functions', finding: 'NIST structures AI risk work around govern, map, measure and manage', implication: 'Operational AI needs named people, a context map, performance tests and a response plan somebody has rehearsed.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { statistic: 'Continuous', finding: 'Cold-chain controls depend on recorded temperature checks and corrective action', implication: 'A useful digital record must connect readings with context, review and closure; telemetry alone leaves the response unresolved.', source: 'Food Standards Agency, Chilling food correctly', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' },
  { statistic: 'Definitive view', finding: 'NCSC operational technology guidance starts with a current record of architecture and assets', implication: 'A monitoring release should document its sensors, gateways, network boundaries and responding shift before adding automated interpretation.', source: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' },
];
