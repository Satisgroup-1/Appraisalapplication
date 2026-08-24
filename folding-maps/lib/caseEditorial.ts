import type { ReportSection } from '@/lib/reportNarrative';

export type CaseExhibitPlacement = { kind: 'evidence' | 'process' | 'system'; afterParagraph: number };
export type CaseEditorialParagraph = { text: string; sources?: number[] };
export type CaseEditorialSection = Omit<ReportSection<CaseExhibitPlacement>, 'paragraphs'> & {
  paragraphs: CaseEditorialParagraph[];
};
export type CaseEditorial = {
  statusStatement: string;
  thesis: string;
  sceneLabel: string;
  openingTitle: string;
  openingParagraphs: string[];
  centralQuestion: string;
  evidenceTitle: string;
  processTitle: string;
  systemTitle: string;
  evidenceInterpretation: { establishes: string; doesNotEstablish: string; management: string };
  sections: CaseEditorialSection[];
};

export const caseEditorial: Record<string, CaseEditorial> = {
  'yacht-operations': {
    statusStatement: 'This engagement is in progress. Discovery and architecture work are complete; the first operating release and its outcomes have not yet been evaluated.',
    thesis: 'The first release must separate customer, vessel, enquiry and project identities, record every material event, derive a reviewable project state and put the next action in one named colleague’s queue. Its acceptance test is whether colleagues can reconstruct one customer commitment from the audit history while duplicate identities, migration exceptions and client-facing approvals remain under human control.',
    sceneLabel: 'Representative item of work from an engagement in progress',
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
  },

  'cold-chain': {
    statusStatement: 'The operator has asked not to be named. Every service level, weight and expected benefit on this page is a design target agreed for the work, and none should be read as an audited outcome.',
    thesis: 'A useful cold-chain monitoring service must turn a temperature reading into a traceable exception case before it attempts to prioritise human attention.',
    sceneLabel: 'Operating vignette from the engagement',
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
  },

  'property-pipeline': {
    statusStatement: 'Naming the business would identify its counterparties, so it is withheld. The allocations, targets and expected benefits on this page are design judgements agreed for the work, and none has yet been measured in production.',
    thesis: 'A property pipeline becomes decision-useful only when one transaction can prove the stage it has reached through current evidence, a next action with a name against it, and any unresolved dependency in plain view.',
    sceneLabel: 'Operating vignette from the engagement',
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
          { text: 'The target process qualifies the parties and objective, collects minimum evidence, coordinates decisions and dependencies, then confirms completion readiness and archives the record. Its five gates are a starting sequence whose sufficiency has to be tested by transaction type, never assumed.' },
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
          { text: 'What exists is a transaction model, control logic, architecture and evaluation plan. Implementation and measured improvement remain ahead of the work, not behind it.' },
          { text: 'The Friday review sets the acceptance test. The pilot must show whether the missing approval appears as an owned exception early enough to protect the timetable and whether colleagues trust the record without rebuilding status elsewhere.' },
          { text: 'Expansion to another transaction type is justified only if stage evidence is maintained, dependencies appear earlier and the reporting effort does not simply move into another channel. Otherwise the stage model, scope or interface should be revised first.' },
        ],
      },
    ],
  },

  'professional-services-intake': {
    statusStatement: 'Professional privilege keeps the firm anonymous in this account. The triage, quality and elapsed-time figures are design targets agreed for the work, and they remain unmeasured.',
    thesis: 'The intake service should automate the preparation of a professional decision while keeping mandatory controls deterministic and acceptance attributable to a qualified person.',
    sceneLabel: 'Operating vignette from the engagement',
    openingTitle: 'A valuable referral arrives before it is safe to accept',
    openingParagraphs: [
      'A trusted referrer introduces a prospective client and signals urgency. The email contains enough information to create commercial interest but not enough to complete conflict, eligibility or service-routing checks. A senior professional begins searching correspondence while an assistant asks for missing facts.',
      'The representative referral is fictional. It tests whether the firm can respond quickly on a more complete evidence base without allowing a model to make or obscure a professional acceptance decision.',
    ],
    centralQuestion: 'The design is worth having only if intake preparation becomes faster and more consistent while mandatory controls and professional acceptance stay explicit, reproducible and attributable.',
    evidenceTitle: 'Responsibility by intake decision',
    processTitle: 'Referral to professional acceptance',
    systemTitle: 'Controlled intake architecture',
    evidenceInterpretation: {
      establishes: 'The design assigns structured capture and mandatory checks to systems while reserving acceptance for a professional.',
      doesNotEstablish: 'Bar length is a design judgement about automation suitability, not measured accuracy, time saved or capacity.',
      management: 'The pilot should test completeness, reproducibility and summary fidelity before it tests higher throughput.',
    },
    sections: [
      {
        heading: 'Referral intake gap',
        paragraphs: [
          { text: 'The referral creates two clocks. Commercially, the firm wants a prompt response. Professionally, it cannot proceed until identity, conflict, eligibility and scope questions are answered. Experienced people bridge the gap by searching, reformatting and requesting information.' },
          { text: 'A representative sample should capture what is available at first review, trace each mandatory control, measure clarification and preparation effort, and identify which information enters which service. Law Society and ICO guidance makes verification, confidentiality and data-protection evidence material design requirements.', sources: [0, 2] },
          { text: 'A model can summarise the referral; that capability leaves the operating problem unresolved. The engagement has to establish whether the whole matter can reach the point of professional acceptance with less reconstruction, and with the mandatory checks still intact. Discovery begins by separating the kinds of work hidden inside intake.' },
        ],
      },
      {
        heading: 'Three layers of intake work',
        transition: 'The referral combines missing facts, mandatory checks and professional judgement, so discovery separates those layers before assigning technology.',
        paragraphs: [
          { text: 'First, the referral lacks required facts, which structured capture can expose. Second, identity, conflict and eligibility rules must give the same result for the same approved facts, so deterministic controls should apply them. Third, urgency, complexity, service fit and acceptance require the judgement of the qualified professional whose name goes on the file.' },
          { text: 'The authority bars translate this allocation into visible responsibility. Their lengths express design judgements about automation suitability, and carry no measured share of work, accuracy or elapsed time. Systems lead or assist preparation; a professional retains acceptance.' },
          { text: 'The authority map locates the boundary between preparation and professional judgement; it contains no evidence about tool performance. This changed the design because intake could no longer be treated as one classification task. Factual preparation, mandatory gates and professional judgement each require different controls.' },
        ],
        exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
      },
      {
        heading: 'Preparation and acceptance boundary',
        transition: 'Separating intake into three kinds of work allows the architecture to automate preparation while acceptance authority stays with the professional.',
        paragraphs: [
          { text: 'Required facts and documents enter first, followed by deterministic checks and routing through an approved taxonomy. The item then reaches professional acceptance. The diagram proposes this progression and offers no proof of faster triage.' },
          { text: 'The system creates a matter candidate, stores source evidence, applies rules and prepares a workspace containing original material, structured facts, unanswered questions and an assisted summary. The architecture is a design position; it represents no live firm environment and no approved model route.' },
          { text: 'Automated acceptance was rejected because a model should not reinterpret a failed gate or make an unattributable professional decision. An unrestricted general-purpose summariser was also rejected because confidentiality and retention must follow an approved data boundary. Law Society guidance reinforces this joint view of opportunity and data risk.', sources: [1] },
          { text: 'The paired views show how preparation reaches judgement and where automation stops. Summary fidelity, reviewer trust and throughput remain open empirical questions, each requiring a measure in evaluation.' },
        ],
        exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 1 }],
      },
      {
        heading: 'Intake pilot acceptance criteria',
        transition: 'The authority boundary defines a safe design; the pilot must now test completeness, reproducibility and professional trust across the whole service.',
        paragraphs: [
          { text: 'The pilot uses representative enquiries, including ambiguous referrals, missing documents and attempts to bypass required fields. Professionals compare the structured brief with original evidence and inspect every mandatory result. Sensitive categories follow an approved processing route or remain outside model processing.' },
          { text: 'Acceptance requires complete first review, reproducible control results, reduced preparation effort and no material omission or distortion in an accepted summary. Time to first substantive decision, clarification rate, reclassification, correction category and queue age are proposed measures, not outcomes.' },
          { text: 'Stricter capture can make the opening exchange less personal or increase abandonment. The design therefore requests only facts needed for the next decision and preserves a human route for unusual matters. Faster preparation is rejected as success if work simply queues longer for acceptance.' },
        ],
      },
      {
        heading: 'Assisted-summary release decision',
        role: 'conclusion',
        transition: 'The pilot measures both preparation and acceptance, providing the evidence needed to retain, restrict or remove assisted summaries.',
        paragraphs: [
          { text: 'The available evidence is an architecture and an evaluation plan. It contains no accelerated client intake, no validated firm-specific control and no measured summary-acceptance rate. A reader should hold it to that limit.' },
          { text: 'The referral supplies the acceptance test. A professional should be able to decide from the workspace without repeating the original search, while still identifying every fact and control that determines acceptance. The pilot must demonstrate lower reconstructive effort alongside intact scepticism.' },
          { text: 'Assisted summaries remain only if mandatory gates are reproducible, material omissions stay within tolerance and reviewers use evidence links. Otherwise assistance should be restricted or removed while the underlying capture and control flow remains.' },
        ],
      },
    ],
  },

  'field-service-planning': {
    statusStatement: 'Anonymity here is at the operator’s request. The weights on this page are calibrated against their own operating data, and every improvement figure is a target awaiting audit.',
    thesis: 'A field-service planner creates value only after it separates non-negotiable feasibility from scored preferences and lets dispatchers see the disruption transferred by each option.',
    sceneLabel: 'Operating vignette from the engagement',
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
  },
};
