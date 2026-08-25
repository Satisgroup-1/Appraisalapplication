import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
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
};

export const editorial: CaseEditorial = {
  statusStatement: 'This engagement is in progress. Discovery and architecture work are complete; the first operating release and its outcomes have not yet been evaluated.',
  thesis: 'The first release must separate customer, vessel, enquiry and project identities, record every material event, derive a reviewable project state and put the next action in one named colleague’s queue. Its acceptance test is whether colleagues can reconstruct one customer commitment from the audit history while duplicate identities, migration exceptions and client-facing approvals remain under human control.',
  sceneLabel: 'The situation',
  openingTitle: 'One customer asks for an update, and the operating system has to reconstruct the answer',
  openingParagraphs: [
    'A customer enquiry has moved from an initial email into a confirmed project. When the customer later asks for an update, the commercial promise sits in one message, delivery detail in a document and the latest change in a colleague’s memory. The team can answer, but only after rebuilding the history of one item of work.',
    'That enquiry provides the engagement test. Any proposed system has to show the current position, the next action and the colleague who will take it, without flattening a specialist customer relationship into a generic sales sequence.',
  ],
  centralQuestion: 'The work stands or falls on whether one shared record reduces reconstruction and unowned work without eroding the judgement and personal attention the service depends on.',
  evidenceTitle: 'Discovery priority by operating need',
  processTitle: 'Enquiry to a named next action',
  systemTitle: 'Event-led customer record',
  evidenceInterpretation: {
    establishes: 'The completed discovery synthesis ranked shared context and a named next action ahead of automated drafting as design priorities.',
    doesNotEstablish: 'Time saved, adoption, service quality and client outcomes remain outside the scope of these normalised scores.',
    management: 'The first release should spend its limited change capacity on making the record trustworthy and the next action visible, before adding broader assistance.',
  },
  sections: [
    {
      heading: 'Customer update reconstruction',
      paragraphs: [
        { text: 'The enquiry reaches the right people, yet every status request creates a small investigation. The team checks messages for commitments, documents for operational detail and colleagues for changes that have not reached either source. No single failure is dramatic. Repetition is the problem: each handoff increases the chance that an action is late, duplicated or understood differently.' },
        { text: 'External research on smaller firms associates credible technology value with stronger core work. It cannot predict the outcome of this workflow. Local evidence therefore begins with systems consulted per review, missing required fields, overdue next actions and the time it takes one colleague to assemble an accurate update for a customer.', sources: [0] },
        { text: 'The engagement asks a narrower question than a digital-transformation brief: can the representative enquiry move through one dependable record while the judgement stays with the team? Discovery followed the item from arrival to response, using the available tools only as evidence about where the journey broke.' },
      ],
    },
    {
      heading: 'Context, state and who acts next',
      transition: 'The reconstruction problem is visible in one enquiry; discovery now follows that item to identify which missing operating facts create it.',
      paragraphs: [
        { text: 'Following the enquiry exposed a sequence of missing links. Customer identity alone could not answer the request; the team also needed the current project state. A status with no next action and nobody named beside it still left the coordination to somebody’s memory. Management visibility, in turn, had to come from the same record used in daily work.' },
        { text: 'Discovery workshops ranked shared customer context as critical, with a named next action and management visibility close behind. Automated drafting came later. The normalised workshop scores report the resulting priority order. They are measured outputs from the synthesis, expressed as ordinal design judgements with no claim about performance.' },
        { text: 'That priority order changed the proposed investment. An assistant could write quickly while drawing on fragmented or stale facts. A dependable operating record would first make an accurate draft possible; any later drafting feature would inherit its context from that record. Savings and service effects remain questions for the pilot.' },
      ],
      exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
    },
    {
      heading: 'Event-led operating record',
      transition: 'Discovery ranks shared context and a named next actionship ahead of drafting, so the target design must organise the record around the next decision.',
      paragraphs: [
        { text: 'Moving the discussion away from tool selection allowed the design to follow the decisions attached to the enquiry. A change is captured, the shared record is updated, the workflow rules identify the next permitted action, that action appears in one named colleague’s queue, and the decision enters an audit history. The process view defines a target sequence and makes no claim about benefit.' },
        { text: 'The sequence establishes and connects the record before automating it. A broad CRM rollout was rejected because it would add fields and migration effort before proving which decisions matter. Immediate autonomous drafting was rejected because a polished message assembled from incomplete context would increase relationship risk.' },
        { text: 'An architectural view translates those decisions into enquiry channels, an identity registry, an append-only event history, derived workflow state, a team workspace and a management view. Identity resolution prevents one returning customer, vessel or project from fragmenting into duplicate records. State is derived from validated events so that the current view can be checked against the history that produced it. The pattern remains proposed; vendor selection and source connectivity are open decisions.' },
        { text: 'The workflow defines what the record must prove. The architecture makes each state transition, each hand-off between colleagues, each exception and each client-facing release traceable. External evidence linking AI value to organisational capabilities supports the need for workflow clarity and feedback, while leaving the local hypothesis to be tested.', sources: [2] },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Trust-first release scope',
      transition: 'The event-led design defines the target state; the next issue is how little of it must ship to test trust safely.',
      paragraphs: [
        { text: 'The first release follows the representative enquiry only as far as a shared customer and project view, an explicit state, and one owned next action. Client-facing decisions retain human approval. This boundary sacrifices some immediate automation in exchange for a cleaner test of whether staff will maintain and rely on the record.' },
        { text: 'Acceptance rests on observable conditions. Sampled journeys must contain the agreed minimum context, every active item must name the colleague acting next and the date it is due, and assembling an accurate status should require fewer cross-checks between systems. Client communications must also avoid a material increase in correction. These criteria define proposed baseline measures; no result has yet been achieved.' },
        { text: 'Migration runs by source cohort with reconciliation counts, duplicate review and an explicit rollback point. Weak matching could attach a commitment to the wrong customer or vessel; partial histories could create false confidence; optional maintenance could push work back into inboxes. Quarantine queues, a required name against each item and approval before anything reaches a client address those risks, but cannot substitute for live adoption evidence. The pilot must observe the record during real work.' },
      ],
    },
    {
      heading: 'Second-release decision',
      role: 'conclusion',
      transition: 'The bounded first release creates measurable adoption evidence, which must determine whether broader automation is justified.',
      paragraphs: [
        { text: 'Discovery and architecture have produced a target record, a state model, a rule for who picks up each action and a release boundary. Evidence about coordination time, overdue actions and customer-response effort will emerge only through live use, so the case makes no improvement claim.' },
        { text: 'The customer’s request remains the decisive test. During four weeks of use, can a colleague choose the shared record, find a current answer and trust the stated next action without repeating the old search? Missing-field patterns, systems consulted, overdue work and material corrections will determine the answer.' },
        { text: 'If the record is maintained and reduces reconstruction without weakening personal service, the next release can consider connected documents, reporting and bounded drafting. If trust remains low, the fix is in how work is assigned, how the old records were migrated or how the interface reads, and it comes before any automation.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '65%', finding: 'SME users most often report improved employee performance', implication: 'The strongest case is better use of scarce staff time inside core work. Technology adoption for its own sake makes a weaker one.', source: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' },
  { statistic: '21%', finding: 'Only a minority of UK AI users report integration with existing systems', implication: 'A shared operational backbone addresses the gap between an individual using a tool and a workflow that runs from input to checked outcome.', source: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' },
  { statistic: '7 capabilities', finding: 'Google DORA identifies organisational capabilities that amplify AI value', implication: 'Clear workflows, user focus, data access and feedback loops belong in the application design from the start.', source: 'Google DORA, AI Capabilities Model, 2025', href: 'https://dora.dev/research/2025/dora-report/' },
  { statistic: '1 in 3', finding: 'Only a minority of businesses planning AI adoption report being ready to implement it', implication: 'A focused diagnostic and delivery model can convert general intent into a governed first operating release.', source: 'DSIT, AI Adoption Research, 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' },
];
