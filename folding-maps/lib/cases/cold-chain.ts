import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'cold-chain',
    image: '/images/case-cold-chain.svg',
    sector: 'Cold storage',
    title: 'Giving every excursion an addressee and a record',
    summary: 'An operator whose temperature alerts arrive within a minute, reach nobody in particular, and carry no state beyond sent.',
    status: 'Anonymised',
    brief: 'A cold-chain operator whose overnight excursion alerts have no named recipient and no closing record. The client is not named here at their request. Discovery is reading a month of alerts against the maintenance log and the shift record, classifying each by whether anything connects it to an action. Those counts are not in yet. The design that follows routes a qualifying excursion to a named role on the rota and requires evidence before a case can close. Service levels on this page are the targets agreed for the work.',
    metrics: [
      { value: '1 month', label: 'of alerts being classified against the record', detail: 'Discovery sample, one chilled site' },
      { value: '<15 min', label: 'acknowledgement of a qualifying excursion', detail: 'Service-level target agreed for the pilot' },
      { value: '24/7', label: 'coverage of the assignment rota', detail: 'Design target' },
    ],
    phases: [
      { label: 'Raise', detail: 'Capture the reading, the asset state and the alert that fired.' },
      { label: 'Check', detail: 'Test the signal for staleness, gaps and implausible jumps.' },
      { label: 'Assign', detail: 'Route a qualifying excursion to the named role on that night’s rota.' },
      { label: 'Close', detail: 'Log the inspection, the disposition and the evidence that closed it.' },
    ],
    code: {
      title: 'Routing decides who answers before anything is classified',
      lines: ['alert = feed.readonly(site, window)', 'signal = validate(alert, heartbeat, calibration)', 'case = policy.qualify(signal, asset, product)', 'assignee = rota.oncall(case.severity, shift)', 'ledger.close(case, assignee, evidence)'],
      nodes: ['Sensor feed', 'Signal checks', 'Qualifying policy', 'On-call rota', 'Closure ledger'],
    },
    nextSteps: ['Finish classifying the month of alerts already extracted', 'Fix the qualifying rule with the shift managers', 'Name the acknowledging role for every night of the rota', 'Run four weeks in observation mode with nothing routed'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'The operator has asked not to be named. Discovery is still reading the alert extract, so this page carries no count from it and no chart. Every service level and expected benefit is a design target agreed for the work, and none should be read as an audited outcome.',
  thesis: 'At this operator the weak link sits after the alert and before the response, so the first release addresses a qualifying excursion to a named colleague and requires closing evidence, leaving thresholds and automated interpretation until that path exists.',
  sceneLabel: 'Half past four',
  openingTitle: 'Half past four, and the alert has no name attached to it',
  openingParagraphs: [
    'Half past four on a January morning, a chilled room at a distribution site crosses its upper limit and stays above it. The monitoring platform sends its alert inside a minute, to a mailbox four people read during office hours and a message group that reaches whoever has a phone beside the bed.',
    'By seven the room is back within limits. Somebody may have moved a pallet away from the door, a defrost cycle may have ended on schedule, or the probe may have recovered on its own. The shift book records the temperature and the time. It does not record which of those three things happened, and by the following week nobody can say.',
  ],
  centralQuestion: 'The test set for this work is whether a qualifying excursion can reach one contactable colleague inside an agreed time and close with the evidence that closed it, before any threshold or interpretation model is adjusted.',
  processTitle: 'Excursion from first reading to signed closure',
  systemTitle: 'Read-only feed with assignment and closure ledger',
  sections: [
    {
      heading: 'Alerts reach a shared inbox and stop there',
      paragraphs: [
        { text: 'Monitoring at the site works. Probes report, the platform applies a threshold, and an alert leaves the building within a minute of a limit being crossed. What the platform cannot do is address that alert to anybody. It holds no view of the rota, no way of telling whether the recipient is on the yard, in a vehicle or asleep, and no state for the alert beyond sent.' },
        { text: 'An alert with no addressee cannot fail in a way that anyone sees. When the duty manager acts, the response is quick and usually right, because the people doing it have run chilled space for years. When nobody acts, nothing at all happens, and both cases leave an identical trace behind them. Escalation depends on who is awake, which is a staffing accident carrying the weight of a control.' },
        { text: 'That is a claim about the record as much as about the response, so discovery is testing it against alerts the site has already produced. Opening with a threshold review would have been the easier piece of work and would have sharpened a signal that still had nowhere to arrive. It would also assume that the thresholds are the binding constraint here, and the extract offers a way of testing that assumption before anybody acts on it.' },
      ],
    },
    {
      heading: 'Classify every alert by what the record answers',
      transition: 'Since an alert leaves no evidence of what followed it, the only available test is to take alerts already raised and see how far their outcomes can be reconstructed after the fact.',
      paragraphs: [
        { text: 'Discovery is reading a month of alerts from one chilled site against the maintenance log, the shift record and, where a colleague who was there can still be asked, their recollection. Each alert is classified by whether anything on the record connects it to an action. The work is deliberately manual, because the question being put is what this site can reconstruct with the records it already keeps.' },
        { text: 'Four categories carry the exercise. An alert is complete when the record holds an inspection, a disposition and the temperature that followed. It is accounted for when a maintenance or defrost entry explains the reading while no response of its own was written down. It is recoverable when nothing was written but a colleague can still say what happened. It is dark when neither the record nor anybody available connects it to an action.' },
        { text: 'Those categories describe the record and stop short of describing the response. Some dark alerts will have been handled by somebody who saw the message, walked to the room and went back to work. Counting them is worth the effort for that reason: the site cannot separate that night from the one where the message was never opened, and neither can an auditor asking about a specific date six months later.' },
        { text: 'The classification will settle nothing about product safety. It carries no view on whether the thresholds are correct, whether the probes hold their calibration, or whether any alert in the window put stock at risk. What it can settle is the order of the work, by showing how much of the response this site is able to evidence at all. No share from that reading is published here, because the extract has not been read to the end.' },
        { text: 'Food safety practice has expected that link to exist for a long time. Food Standards Agency guidance on chilled storage expects a breached limit to be followed by action, and the HACCP scheme behind it makes the corrective action and the record of it two of its seven principles. A monitoring stream producing neither is an instrument reading, and the site already had plenty of those.', sources: [1, 2] },
      ],
    },
    {
      heading: 'Give every excursion an addressee before tuning thresholds',
      transition: 'With the gap located after the alert, the design work reduces to two matters of routing: which excursions qualify for a person, and which person they reach that night.',
      paragraphs: [
        { text: 'The target path has four steps and no inference in the first release. Raise takes the reading, the asset state and the alert that fired. Check tests the signal for staleness, gaps and implausible jumps, and raises any failure as a signal fault with a queue of its own. Assign puts a qualifying excursion in front of the named role on that night’s rota with an acknowledgement time. Close requires an artefact before the case can leave the queue.' },
        { text: 'Assignment is the part the site does not currently have, and a neighbouring sector under a stricter regime shows how far the principle can be taken. European good distribution practice for medicines requires a designated Responsible Person, expected to discharge the role personally and to be continuously contactable. Chilled food distribution sits under nothing of the kind and the operator would not welcome the overhead. The transferable part is modest: an excursion is addressed to a person, and the address is known before the excursion happens.', sources: [3] },
        { text: 'The system sits alongside the plant and stays out of it. A read-only feed leaves the monitoring platform, signal checks run outside the control network, a versioned policy decides what qualifies, and a ledger holds the case, the assignee and the closing evidence. NCSC guidance treats the boundary between plant equipment and anything analysing its output as an architectural control, which is why the asset register is drawn before the policy is written and why the design carries no write path back to refrigeration.', sources: [0, 4] },
        { text: 'Two alternatives were rejected in discovery. Automated control of the equipment moves the hazard boundary and the security boundary at the same time, for a benefit the site has never asked for. A better classifier over the present data would deliver a sharper signal to the same shared mailbox. Both stay open once assignment and closure are working, and both become easier to argue for when the ledger can show what recent excursions have cost in attention.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Recording a response can become its own ritual',
      transition: 'An assignment rule and a closure field both add work to a night shift, which is where the case against this design begins.',
      paragraphs: [
        { text: 'The objection worth taking seriously is that a closure record invites completion for its own sake. A field that must be filled will be filled. Overnight cover at a chilled site is one or two people with a yard to run, and a design converting a glance at a screen into a queue item, an acknowledgement and an artefact has spent their attention to produce a document. If the pilot improves the record while leaving the response unchanged, it has produced paperwork and should be described that way. Volume is the weaker half of the objection, and the classification will price it, because the number of alerts in the window is the first figure the exercise produces. If that figure is large, the qualifying rule tightens before anything is routed to a person, and this design stands or falls on the quality of what it interrupts somebody for.' },
        { text: 'The exercise behind the design has limits built into it. A month at one site is one season, one staffing pattern and one set of doors. Defrost schedules differ between rooms, and the mix of alerts in a summer month would differ from the window being read. A second extract from another quarter would test whether the shape holds, and none is scheduled.' },
        { text: 'Both objections shape the release. Assignment goes to a rota the site already operates, so no new watch is created, and any night on which the on-call engineer cannot absorb what qualifies is treated as a scoping error to be surfaced during the pilot. Closure requires something that existed before the field: a probe reading, a photograph, a disposition against a batch. The classification is then repeated at the end of the pilot by the same method, so the comparison runs between two like extracts.' },
      ],
    },
    {
      heading: 'Observation mode decides whether this path holds',
      role: 'conclusion',
      transition: 'Because the design will be judged by a repeat of the count that produced it, the pilot can run without anything being routed to a phone.',
      paragraphs: [
        { text: 'First release runs in observation mode at one site for four weeks. The service qualifies excursions, forms cases and proposes an assignee, and sends nothing. Shift managers review the queue the following morning against what they remember of the night. The measures are the share of qualifying excursions with a named acknowledger, the share closing with an artefact, and the age of the oldest case nobody touched. Acknowledgement inside fifteen minutes is the service level agreed for the work and stays a target until a live run produces a figure.' },
        { text: 'Three outcomes would send the design back. If shift managers report that the closing artefact is being assembled to satisfy the queue, the qualifying rule is too loose and the threshold conversation moves forward. If the on-call rota cannot absorb what qualifies, the scope is wrong before the technology is. If signal checks disqualify a large share of readings, the sensor estate is the real project and this one should wait behind it.' },
        { text: 'The claim being made here is narrow and worth stating plainly. Judgement about whether chilled stock is safe belongs to the people accountable for it, and this design moves none of that. What changes is that an excursion at half past four arrives somewhere specific and leaves something behind, so that the following week the site can say what was done and who did it. The classification that opened the work is the measure that will decide whether the design deserves a second site.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '8 principles', finding: 'NCSC guidance treats secure OT connectivity as a managed architecture decision', implication: 'Monitoring should query a controlled data layer and avoid creating an uncontrolled path back into equipment.', source: 'NCSC, Secure connectivity for operational technology, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity' },
  { statistic: 'Continuous', finding: 'Cold-chain controls depend on recorded temperature checks and corrective action', implication: 'A useful digital record must connect readings with context, review and closure; telemetry alone leaves the response unresolved.', source: 'Food Standards Agency, Chilling food correctly', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' },
  { statistic: '2 of 7', finding: 'Two of the seven HACCP principles cover corrective action and record keeping', implication: 'A monitored control point is incomplete until a predetermined corrective action and a record of what was done both exist.', source: 'FDA, HACCP Principles and Application Guidelines', href: 'https://www.fda.gov/food/hazard-analysis-critical-control-point-haccp/haccp-principles-application-guidelines' },
  { statistic: '1 person', finding: 'EU good distribution practice names one Responsible Person who is expected to act personally and stay continuously contactable', implication: 'A neighbouring regulated sector treats a named, reachable individual as a control in its own right; the addressing principle transfers even where the regime does not.', source: 'European Commission, Guidelines on Good Distribution Practice of medicinal products for human use (2013/C 343/01)', href: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=uriserv:OJ.C_.2013.343.01.0001.01.ENG' },
  { statistic: 'Definitive view', finding: 'NCSC operational technology guidance starts with a current record of architecture and assets', implication: 'A monitoring release should document its sensors, gateways, network boundaries and responding shift before adding automated interpretation.', source: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' },
];
