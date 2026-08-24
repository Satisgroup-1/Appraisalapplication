import type { ReportParagraph, ReportSection } from '@/lib/reportNarrative';

type DepthMap = Record<string, ReportParagraph[][]>;

export const advancedNewsDepth: DepthMap = {
  'ai-integration-gap': [
    [
      { text: 'A useful adoption inventory separates personal assistance, team utilities and operational services. Personal assistance may remain outside a formal workflow because the employee supplies context and checks the output. Team utilities need agreed source rules and someone maintaining them. Operational services require defined inputs, state, permissions, exception handling and an accepted output. Reporting those categories separately prevents a high-volume, low-consequence use case from masking an untested operational dependency.' },
      { text: 'The baseline should describe demand and work mix as well as elapsed time. A fall in response time can reflect quieter demand, easier cases or unfinished work moving into another queue. Eligibility rules, arrival volume, completion, rework and service outcome need a common observation period. This gives finance a counterfactual that can survive ordinary variation and gives the manager running the process an early warning that the workflow boundary is moving.' },
    ],
    [
      { text: 'Integration quality depends on semantic agreement. Two systems may both contain a customer, asset or matter identifier while using different rules for creation, update and closure. The project must identify the authoritative field, the event that changes it and the reconciliation route for conflicts. A connector that copies ambiguous records faster will increase downstream exception demand and weaken confidence in the management view.' },
      { text: 'Data lineage should remain visible from source record to generated output and accepted action. Whoever runs the workflow needs to know which version of a document, policy or account state supported the decision. Retention, deletion and access changes must propagate through indexes and caches. These controls carry implementation cost, yet they also make defects diagnosable and allow the service to recover without discarding every output produced during an incident window.' },
    ],
    [
      { text: 'Workflow state should be explicit. An item may be received, eligible, waiting for evidence, under review, accepted, rejected or released. Each transition needs an event, an actor and permitted next states. Model output can propose a transition or prepare its evidence, while the state service enforces the route. This design prevents a fluent response from bypassing a missing approval or turning an uncertain interpretation into a completed record.' },
      { text: 'Operational observability goes beyond model latency and uptime. Managers need queue age, transition failure, exception cause, reviewer correction, source freshness and rollback status. Technical telemetry should connect to the service measure affected by failure. A retrieval outage, for example, matters because it can increase ungrounded drafts or force manual research. The incident playbook should define degraded modes and the person authorised to pause automated progression.' },
    ],
    [
      { text: 'Informal use also creates a discovery channel. Repeated prompts can reveal where colleagues lack a current source, where forms collect the wrong information and where approval depends on a person’s memory. The organisation can study those patterns without treating every prompt as a candidate for automation. Privacy, employee expectations and purpose limits must govern any analysis of usage records.' },
      { text: 'The boundary should be reviewed as consequence and volume change. A low-risk drafting aid can become an operational dependency when colleagues use it to prepare most customer communications. At that point sampling, source control and contingency become necessary even if no system connector exists. Governance therefore follows the actual role of the tool in work, not the label assigned during procurement.' },
    ],
    [
      { text: 'The investment paper should price a complete release: process design, data remediation, integration, evaluation, training, support and the management time needed to own exceptions. It should also state which costs continue with volume and which recur when models, policies or source systems change. A small application with an expensive correction queue may have a poorer cost curve than a more controlled design with higher initial engineering.' },
      { text: 'Continuation should depend on a pre-agreed confidence range. If sample size is small, management can hold the service in supervised use while collecting evidence. If quality or service deteriorates, the design should return to the failed state, source or control. The decision process becomes repeatable across later workflows and builds an integration capability that is more durable than any chosen model.' },
    ],
  ],
  'open-weight-price-war': [
    [
      { text: 'Headline prices also conceal changes in token accounting, context limits, caching and batch terms. Procurement should reproduce cost from representative requests, including system instructions, retrieved passages, retries and output length. Peak and average demand matter because reserved capacity, rate limits and queueing can determine the real service cost. A benchmark that prices only a short prompt creates little evidence for a long-document workflow.' },
      { text: 'Quality testing needs a stable rubric and adjudication process. Examples should represent ordinary work, edge cases and high-consequence failures, with reviewers blind to supplier where practical. Disagreement between reviewers is itself evidence about task ambiguity. The team should resolve the business rule or retain human judgement before claiming that one model has won a comparison whose target standard remains unsettled.' },
    ],
    [
      { text: 'Accepted-task economics should separate first-pass acceptance, corrected acceptance and unresolved exceptions. A provider can appear inexpensive when reviewers silently repair outputs and the cost stays in departmental labour. Capturing correction category and time exposes that transfer. It also shows where a smaller model is sufficient, where retrieval needs improvement and where the workflow requires specialist review under every sourcing option.' },
      { text: 'Latency and availability should be valued through the operating promise. A slower service may be acceptable for overnight document preparation and unusable during a customer interaction. Resilience may require a second provider, a local model or a manual route. Each choice has integration and test cost, so continuity design should follow the consequence of delay and failure for the named workflow.' },
    ],
    [
      { text: 'An open-weight service requires a model inventory with licence, provenance, checksum, runtime, quantisation, deployment region and evaluation status. Changes to any of those fields can affect behaviour or obligations. Promotion between environments should use signed artifacts and repeat the relevant evaluation suite. Security review must cover the serving stack, model supply chain, exposed endpoints and the operational path for patches.' },
      { text: 'Capacity planning should model memory, throughput, concurrency and recovery under peak demand. Hardware utilisation can improve unit cost while reducing spare capacity for failures or sudden traffic. Teams also need a plan for model loading time, failover and observability. These responsibilities explain why open weights can be strategically valuable and operationally uneconomic at the same time.' },
    ],
    [
      { text: 'Managed services justify their premium through identity integration, regional controls, abuse monitoring, support and rapid access to improved models. The value should be tested at workflow level. A proprietary retrieval feature that lifts acceptance and reduces engineering can justify dependency when contract, export and migration terms are understood.' },
      { text: 'Exit planning should record data export, evaluation portability, who holds the prompts and policies, replacement lead time and the features that have no equivalent elsewhere. A periodic substitute test is more informative than a theoretical multi-provider abstraction. It shows whether a second candidate can process the representative set at the required service level and identifies the dependencies that remain rational.' },
    ],
    [
      { text: 'A sourcing committee should agree the decision horizon. The cheapest model this quarter may create migration effort before the application reaches stable volume. A longer contract can protect price and capacity while limiting access to new capability. Scenario analysis should combine demand, acceptance, review and switching cost under several plausible market paths.' },
      { text: 'The resulting policy can route tasks by consequence and complexity. Low-risk extraction may use a smaller model; ambiguous or consequential work may use a stronger service with mandatory review. Routing logic belongs in the application and evaluation record. This lets procurement benefit from price compression without forcing every task through one supplier or one quality tier.' },
    ],
  ],
  'automation-before-agents': [
    [
      { text: 'Following a representative item should record every wait state, retry and informal workaround. The apparent process may describe how work should move, while logs and interviews reveal how it actually moves. A state that nobody picks up, or that finishes without leaving evidence, is a design defect and should be recorded as one. Agent capability cannot repair that defect because the system still lacks a rule for what completion means.' },
      { text: 'Task decomposition should identify deterministic calculations, source retrieval, interpretation, decision and execution. Each element has a different failure mode and test method. Combining them inside one general instruction makes it difficult to know whether a failure came from missing data, planning, policy or tool use. A modular route supports targeted evaluation and a safer degraded mode.' },
    ],
    [
      { text: 'Deterministic components should validate schema, permissions, limits and state transitions before any tool call. Model output needs a typed proposal that ordinary software can inspect. Free-form text passed directly into an operational API leaves control logic implicit and makes replay difficult. A proposal object can carry source references, confidence, intended action and the evidence required for approval.' },
      { text: 'Idempotency and reversibility matter when the same request can be retried. A network timeout may hide a successful payment, message or record update. Tool adapters should use unique operation identifiers, query current state and prevent duplicate commitment. Irreversible actions need a preview and approval route. Reversible actions still need an audit history and a tested recovery procedure.' },
    ],
    [
      { text: 'Authority is multidimensional. The system may read one source, draft in another workspace and act only within a narrow record type. Permissions should be least-privilege, time-bound where possible and linked to the service identity. Credentials must never be embedded in prompts or logs. An administrator should be able to revoke one tool without disabling observation and evaluation of the remaining workflow.' },
      { text: 'Runtime policy should define spend, action count, elapsed time, destinations and escalation conditions. These limits contain loops and unexpected plans. A supervisor service can stop execution when a limit is reached, when source freshness fails or when the proposed action differs materially from evaluated patterns. Human review then begins with the full trace, not a generic failure message.' },
    ],
    [
      { text: 'The counterargument for early agents is strongest in low-consequence, reversible environments where the cost of mapping every path exceeds the cost of correction. Even there, the organisation should capture traces and cluster failure causes. Exploration produces value when it creates a clearer process model and a representative test set for the next release.' },
      { text: 'Expert workflows deserve special caution. Tacit knowledge may let a professional reject a plausible plan quickly without being able to encode the reason beforehand. Shadow use can collect those reasons and reveal stable rules, uncertain judgement and missing context. Authority should expand only in the portion whose acceptance can be described and tested.' },
    ],
    [
      { text: 'Release gates should include task completion, material error, unsafe action, human rescue effort, duplicate action and rollback success. Average success can hide a small class of severe failures, so the review needs results by state and consequence. Changes to model, prompt, tool, policy or source schema should trigger the relevant regression set before promotion.' },
      { text: 'A named director must accept the residual risk and fund the supervision that follows. Technology can monitor traces and show drift; it cannot decide how much service, financial or regulatory exposure the business is prepared to retain. The final approval should record the scope, the authority granted, the fallback, who responds to an incident and the evidence date supporting the decision.' },
    ],
  ],
  'cold-chain-collaboration': [
    [
      { text: 'The event record should preserve raw reading, engineering unit, device time, ingestion time, sensor identity, calibration status and gateway health. These fields let investigators distinguish product exposure from clock drift, delayed transmission or device failure. Aggregation should retain access to raw evidence because an average can hide a short material excursion or create an apparent breach from sparse samples.' },
      { text: 'Asset and product context require their own effective dates. A sensor may move, a room may change use and a policy may apply differently after loading. The case builder should join context valid at the event time and record any late correction. This temporal model prevents today’s asset configuration from silently rewriting yesterday’s assurance record.' },
    ],
    [
      { text: 'Telemetry validation can use range, rate-of-change, redundancy, heartbeat and calibration rules. A failed rule creates a data-quality state and cannot be treated as a safe reading. Operators need a distinct queue for missing or suspect evidence because the appropriate action may involve inspection, sensor replacement or an alternative measurement.' },
      { text: 'Classification policy should be versioned with threshold, duration, product class, asset state and escalation route. Every case records the policy version applied. A policy change can then be replayed against historical events to estimate alert volume and missed-event risk before approval. This makes tuning an auditable operating decision.' },
    ],
    [
      { text: 'The OT boundary should favour one-way or tightly brokered data movement into the monitoring layer. The service does not need command access to refrigeration equipment to assemble an exception case. Network zones, gateway identity, schema validation and certificate rotation should be documented with the asset register and tested during maintenance changes.' },
      { text: 'Corrective action evidence can include inspection, product disposition, maintenance ticket, subsequent stable readings and professional judgement. Closure rules should vary by severity and should reject an empty note. Reopening must remain possible when later evidence changes the case. The ledger therefore records amendments and reason, preserving the history seen by each decision maker.' },
    ],
    [
      { text: 'Observation mode needs a reconciliation method. Every service case should be matched to existing alerts and manual discoveries, while events found by only one route receive review. Precision alone is insufficient because a system can improve it by suppressing difficult alerts. Recall, alert burden, the time before a colleague takes the case, and how complete the closing record is, have to be read together.' },
      { text: 'Operators should classify why a recommendation was changed: wrong signal, missing context, unsuitable policy, capacity constraint or local judgement. These reasons guide remediation and show whether model work is warranted. A high override rate may reflect a valuable cautious service or an unusable classifier, so consequence and cause matter more than the headline percentage.' },
    ],
    [
      { text: 'Release should specify the degraded route for sensor, gateway, policy-engine and interface failure. Current controls remain active until the operator can detect loss of monitoring and switch without ambiguity. Service status must be visible at the point of decision; a silent gap is more dangerous than an explicit outage.' },
      { text: 'Management should review the whole control chain after material incidents and on a defined cadence. The review covers architecture changes, policy drift, operator response, closure evidence and events missed by either route. Expansion to another asset class requires a fresh hazard and context assessment because signal behaviour and consequence can differ materially.' },
    ],
  ],
  'small-teams-ai-advantage': [
    [
      { text: 'Management proximity reduces coordination cost only when decisions are recorded. A verbal agreement around one table can be fast and still disappear before the next release. The team should maintain a concise decision log covering workflow scope, data permission, acceptance evidence, residual risk and the next review. That record lets speed accumulate into organisational capability.' },
      { text: 'Customer proximity can improve example selection. Colleagues who handle the work know the rare request, sensitive account and seasonal pattern that a generic benchmark misses. Those examples should enter the evaluation set with appropriate minimisation and access controls. The resulting test reflects the firm’s service promise while keeping personal knowledge from becoming an undocumented production dependency.' },
    ],
    [
      { text: 'Survey evidence should guide portfolio hypotheses, not supply a return assumption. A firm facing a skills bottleneck can test whether assistance improves preparation, throughput or quality in that specific task. The baseline should also capture demand deferred or refused because capacity is constrained; released time may create growth capacity even when no labour cost leaves the business.' },
      { text: 'Workforce design should identify where expertise is created. If junior colleagues receive finished answers without reviewing sources or reasoning, short-term speed may weaken future capability. A better design can expose evidence, require active review and use correction patterns for coaching. Training quality belongs in the benefit and risk assessment when the workflow develops professional skill.' },
    ],
    [
      { text: 'A focused portfolio should have an explicit capacity budget for subject experts. Discovery interviews, labelling, review and adoption compete with customer work. Scheduling that contribution makes the true delivery cost visible and prevents the technical team from waiting for scarce decisions. The sponsor should stop lower-value pilots when expert capacity becomes the constraint.' },
      { text: 'Reusable capability includes an approved data pattern, model interface, evaluation harness, incident route and adoption method. These assets should be small enough for the team to operate. A complex platform that requires a permanent specialist group can erase the organisational advantage the investment was intended to exploit.' },
    ],
    [
      { text: 'Concentration risk should be visible in the staffing. If one colleague understands the workflow, the model and the recovery route, leave or absence can halt operation. Pairing, runbooks, access escrow and rehearsed manual fallback create resilience with limited overhead. External partners may provide specialist depth, while answering for the operating outcome stays inside the firm.' },
      { text: 'Governance can remain proportionate. Consequential uses need privacy, security, quality and authority decisions; low-risk drafting can use a lighter route. A short risk screen should determine which controls apply and record why. This avoids both uncontrolled experimentation and a committee structure that consumes the speed available to a smaller organisation.' },
    ],
    [
      { text: 'Expansion should follow a capacity and evidence threshold. The team needs proof that the workflow is used, the outcome improves after corrections, operating support is affordable, and the people who run it are still there in a year. New functions can then reuse the delivery pattern while building their own task evidence. Portfolio growth based on enthusiasm alone would distribute attention before the first capability has stabilised.' },
      { text: 'The strongest advantage may be faster correction. A small firm can observe a service defect, bring the relevant people together and change the release quickly. That speed is valuable only with version control, regression tests and a clear rollback point. Otherwise rapid iteration moves uncertainty into live customer work.' },
    ],
  ],
  'measure-automation-value': [
    [
      { text: 'Baseline design should define the eligible population and sampling method before results are visible. Tasks abandoned, deferred or routed outside the system belong in the denominator where they reflect the same demand. Excluding difficult cases can create an apparent improvement while leaving total operating effort unchanged. A control group or staggered release may strengthen attribution when volume and work mix change quickly.' },
      { text: 'Hands-on time and elapsed time answer different questions. Automation can reduce staff effort while work still waits in an approval queue, or shorten customer response while total labour rises through review. Both can be valuable under different constraints. The investment paper should name the bottleneck and select the measure that represents it.' },
    ],
    [
      { text: 'The value bridge needs someone named to supply the evidence at each transfer. Product telemetry can establish eligible use; workflow data can establish net effort; operations can confirm redeployment; finance can confirm cost avoided or contribution realised. No single system will prove the whole chain. Reconciliation cadence and confidence should be part of the benefits ledger.' },
      { text: 'Capacity released in small fragments may be difficult to use. Five minutes across many people rarely convert like a protected half-day for one role. The model should account for fragmentation, timing and skill. Management may redesign rosters or bundle tasks before counting the capacity as available for a new service or avoided hire.' },
    ],
    [
      { text: 'External studies can inform mechanism and evaluation design. They cannot provide the local counterfactual because task mix, worker experience, interface, incentives and operating support differ. The programme should record which elements of a study resemble the target workflow and which do not, then state the narrower hypothesis being tested.' },
      { text: 'Distribution deserves as much attention as the mean. A tool can lift average throughput while slowing experts, increasing variance or moving difficult work to a specialist queue. Results should be segmented by task type, experience and correction demand where sample size permits. This reveals whether value comes from raising a lower baseline, compressing routine work or changing allocation.' },
    ],
    [
      { text: 'Quality value needs a measurable defect and consequence. Fewer drafting corrections may release review effort; fewer customer errors may reduce remediation and protect service. Risk value needs exposure, control effectiveness and a defensible method for treating uncertainty. These benefit types should remain separate so a weak cash case cannot be rescued by an undefined risk claim.' },
      { text: 'Revenue attribution requires similar discipline. Faster response may support conversion, while demand, pricing and sales activity change at the same time. A pilot can compare eligible cohorts or use a staged introduction, then report a range. The manager running the operation should also confirm that extra demand can be served without moving the bottleneck downstream.' },
    ],
    [
      { text: 'The ledger should retain the baseline version, the assumption, its source, the person who supplied it, the observation window, the confidence and the decision taken. Assumptions are expected early; hidden assumptions are the defect. As evidence arrives, management can narrow ranges and retire measures that do not affect expansion, adjustment or stop decisions.' },
      { text: 'Post-release review should examine benefit persistence. Initial gains may reflect attention, training or unusually careful use. Drift in demand, model behaviour or workarounds can erode them. A benefit whose evidence cannot be maintained at reasonable cost may still exist, but it should not support a precise ongoing financial claim.' },
    ],
  ],
  'legal-ai-source-grounded-work': [
    [
      { text: 'Proposition segmentation should preserve context. A sentence may depend on a defined term, factual assumption or preceding qualification. The evaluation record should store those dependencies so support is not judged from an isolated fragment. Reviewers also need to distinguish a source that proves a rule from one that supplies analogy, commentary or an opposing position.' },
      { text: 'The source hierarchy should state whether legislation, court material, regulator guidance, commentary and firm know-how may support each task. Authority and persuasiveness differ by question. The system can label source class and show where authorities conflict; a lawyer determines weight. This stops a convenient secondary summary from silently displacing controlling primary material.' },
    ],
    [
      { text: 'Document ingestion should retain original file hash, page or paragraph locator, extraction method and access label. Scanned and poorly structured documents need quality checks because corrupted text can make retrieval appear complete while omitting a schedule, footnote or handwritten amendment. A low extraction-confidence state should route the source for repair or direct inspection.' },
      { text: 'Deletion and ethical-wall changes must reach indexes, caches, generated artifacts and exports. The service should be able to identify which drafts used a withdrawn source. This lineage supports incident response and prevents continued reliance after a source or access decision changes.' },
    ],
    [
      { text: 'Retrieval should return enough surrounding text to test meaning and expose truncation. Ranking can combine lexical and semantic signals, but evaluation must inspect missed authority as well as selected passages. Query expansion and decomposition should remain in the trace so reviewers can see how the service framed the research problem.' },
      { text: 'Professional sign-off can record accepted propositions, qualifications, open issues and the authority checked. This creates a reusable research asset only where the matter and licence permit. Reuse requires a new validity check because law, facts and jurisdiction can change after the original acceptance.' },
    ],
    [
      { text: 'Evaluation governance should separate dataset creation, system development and final adjudication where practical. Developers need failure examples to improve the service, while a held-back set reduces the risk of tuning to known cases. Reviewers should document disagreement and the reason a question lacks one defensible answer.' },
      { text: 'Economic analysis should include professional concentration. If the service shifts routine checks to a few senior reviewers, nominal drafting savings can increase the real bottleneck. Queue age, reviewer mix and correction cause should sit beside task time. The release should prove a better allocation of legal attention, not simply faster text production.' },
    ],
    [
      { text: 'Automation bias can be tested through seeded defects and observation of source-opening behaviour during supervised evaluation. The purpose is not to police individuals. It is to determine whether interface design and workload encourage adequate verification. Prominent confidence language has little value if users cannot inspect the underlying evidence efficiently.' },
      { text: 'Clients and courts may impose disclosure, provenance or technology conditions beyond the internal design. The matter-opening process should record these constraints and disable unsupported routes. A technically acceptable service can still be unsuitable for a particular instruction because the professional or procedural context governs use.' },
    ],
    [
      { text: 'Change control should treat source collection, retrieval method, model, prompt, citation logic and interface as separate release components. A small model change can alter which authority is cited or how uncertainty is expressed. Regression scope should follow the component and the failure consequence, with a rollback artifact retained for production.' },
      { text: 'The supervising professional should review defects by proposition class and matter type. A recurring temporal-validity failure calls for source and metadata work; a recurring omission may require query decomposition or a narrower scope. This causal review prevents every failure from becoming a prompt change and directs investment to the actual weak control.' },
    ],
  ],
  'hospitality-ai-guest-recovery': [
    [
      { text: 'Case creation should work across arrival, in-stay and post-stay channels. The same disruption may begin in an app, continue at the desk and close through email. Channel events need one recovery identifier and one named colleague, so the guest does not repeat the same facts to three people. Duplicate cases should merge with preserved histories and an auditable reason.' },
      { text: 'Property time is its own complication. Availability, housekeeping and maintenance events can arrive in different time zones and with delayed sync. The recovery view should display event time, source time and freshness. A proposed room option expires if its supporting state is stale or if reservation is not confirmed before the colleague commits.' },
    ],
    [
      { text: 'Identity matching should use the minimum attributes needed for the decision and expose why records are considered related. High-confidence exact links can proceed; uncertain links stay separate until a colleague verifies them. Merge and unmerge operations need an audit trail because identity correction can affect loyalty, payment and communications beyond the recovery case.' },
      { text: 'Entitlement policy should distinguish contractual remedy, loyalty benefit, discretionary gesture and manager exception. These categories have different approvals and reporting consequences. A generated explanation should use the approved category and amount, preventing an empathetic draft from promising a remedy that the property cannot honour.' },
    ],
    [
      { text: 'Each connector should name who maintains it: reservations, property management, maintenance, housekeeping and CRM. Each interface needs freshness, failure and reconciliation measures. When two systems disagree, the recovery case should show the conflict and source hierarchy. Hidden last-write-wins logic would convert an integration issue into a guest-facing commitment.' },
      { text: 'Feasible options should reserve capacity during approval where systems permit. An unheld upgrade can disappear while a manager reviews compensation. The workflow needs an expiry event and a refreshed option set. This is ordinary transaction design with direct service consequences, and it may matter more than generated language quality.' },
    ],
    [
      { text: 'Compensation analysis should distinguish policy entitlement from avoidable service cost. A lower payout is not automatically better if the guest requires repeated contact or leaves without resolution. Managers need case severity, remedy type, approval path, handling effort and outcome in one review so policy changes do not optimise one cost line at the expense of recovery.' },
      { text: 'Closure requires confirmation that the remedy was delivered, not merely approved. A room move, transport booking, refund or service credit has its own completion evidence. Failed fulfilment should reopen the case with the prior promise visible. This prevents a polite message from being counted as resolution before the operating action completes.' },
    ],
    [
      { text: 'Local discretion can be protected through documented override, not removed from the workflow. The colleague records the reason, remedy and authority used, while the service captures a case for policy review. Repeated overrides may show that local conditions or guest needs are missing from the policy model.' },
      { text: 'Manual fallback should support identity verification, entitlement lookup, local availability and approval even when a central service is unavailable. The later reconciliation path needs a temporary case identifier and duplicate controls. Staff training should rehearse this route before reliance because a disrupted guest cannot wait for an incident team.' },
    ],
    [
      { text: 'Pilot selection should use a disruption with enough volume, an obvious team to run it, and a realistic route to outcome evidence. Room unavailability, maintenance displacement or missed amenity may qualify depending on the estate. The test should exclude cases whose remedy depends on systems or partners outside the current integration boundary.' },
      { text: 'Expansion should compare properties and channels without assuming one policy fits every operating context. Staffing, inventory, brand promise and local regulation can change feasibility and authority. Shared architecture can carry common identity, evidence and audit patterns while property policy stays versioned and set by the property itself.' },
    ],
  ],
};

export const advancedCaseDepth: DepthMap = {
  'yacht-operations': [
    [
      { text: 'The operating record should distinguish party, customer account, vessel, enquiry, project and service item. These entities can have many-to-many relationships over time. A returning customer may enquire about a different vessel; a vessel may be sold; one project may involve several contacts. Stable identifiers and effective-dated relationships prevent history from being attached to the wrong commercial context.' },
      { text: 'Identity resolution begins with exact identifiers and a review queue for uncertain matches. Email and telephone can support a candidate link but should not silently merge records. The reviewer sees competing attributes, sources and the consequence of the merge. Unmerge must restore both histories and record which later events require reassignment.' },
    ],
    [
      { text: 'Project state should be derived from validated events such as enquiry received, brief confirmed, estimate approved, work scheduled and delivery accepted. An event records source, time, actor and payload. Derived state can then be recomputed when an event is corrected, which is safer than editing a status field whose history has disappeared.' },
      { text: 'Ownonsibility attaches to the next required action, not only to the customer account. The commercial contact, the delivery lead and the reviewer may all change as the item progresses. The workflow policy assigns a role, due condition and escalation route for each state. Absence or reassignment becomes an explicit event so active work cannot remain attached to a colleague who is unavailable.' },
    ],
    [
      { text: 'The read model used by staff should answer the current state, the last material event, the next action, the colleague taking it, any open exception and the original commitment without exposing the complexity of the event store. Management reporting derives from the same state model. This removes the need for a separate weekly status narrative and makes any discrepancy traceable to a source event or rule.' },
      { text: 'Client-facing drafting can enter only after source commitments and approval state are dependable. A draft should cite the record fields and documents used, flag unresolved exceptions and remain uncommitted until a person approves it. The feature is evaluated on material correction and source fidelity, with no assumption that drafting speed creates service value.' },
    ],
    [
      { text: 'Migration should proceed by source and cohort. Counts, mandatory fields, duplicate candidates, relationship matches and event chronology are reconciled before a cohort becomes visible. Items with uncertain identity or state enter quarantine. The old source remains available through a time-bound rollback window, and new events are controlled to prevent two systems from becoming authoritative.' },
      { text: 'Pilot acceptance should include record completeness, duplicate resolution, valid state derivation, owned next action, audit reconstruction and user reliance. Status assembly time and systems consulted can test coordination. Customer-response correction can test whether trust has weakened. These measures remain proposed until the release is used in live work.' },
    ],
    [
      { text: 'The second-release decision should identify which exceptions dominate. Missing events may require source integration; abandoned records may mean nobody picked the work up, or that the interface is awkward; low trust may trace to migration errors. The response should repair the weak mechanism before adding documents, reporting or AI assistance.' },
      { text: 'This case remains in progress. Architecture and discovery evidence support the release design, while live adoption, service and economic outcomes remain unknown. Management should keep those evidence classes separate in every update so a completed design milestone cannot be read as a customer or performance result.' },
    ],
  ],
  'cold-chain': [
    [
      { text: 'The event model should keep raw telemetry separate from interpreted condition. Reading, engineering unit, event time, ingestion time, device identity, calibration status and connectivity health belong in the immutable record. A later classification can be corrected without rewriting the measurement that operators originally saw.' },
      { text: 'Asset, sensor and product relationships change over time. The case builder must join the configuration valid during the excursion and show when context arrived late. This protects investigation from a common historical error in which the current equipment state is applied to a past event.' },
    ],
    [
      { text: 'Signal-quality policy can check expected frequency, stale heartbeat, range, rate of change, redundant sensors and calibration. A failed check creates a data-quality exception. It does not convert the reading to normal. The operator may need inspection or an alternative measurement before product severity can be assessed.' },
      { text: 'Severity policy should combine threshold, duration, product class, location and asset state under an approved version. Historical replay estimates alert burden and reviews known incidents before live escalation. The team should retain cases where policy and operator disagree because those examples drive calibration.' },
    ],
    [
      { text: 'A read-only monitoring boundary reduces the attack and hazard surface. Sensors and gateways publish through controlled interfaces; the service has no general route to equipment commands. Schema validation, certificate management, network zoning and asset inventory remain engineering requirements even when the analytical application sits outside OT.' },
      { text: 'An exception needs a severity, a due condition, an escalation route and continuity when the shift changes. The queue should expose unassigned and ageing cases. Closure records inspection, corrective action, product decision and subsequent evidence. Reopening preserves the prior history when later readings or investigation change the conclusion.' },
    ],
    [
      { text: 'Parallel operation should reconcile service cases with current alarms, checks and manually discovered events. Reviewers classify false positives, false negatives, late alerts and incomplete closures by cause. Precision, missed-event risk, response, workload and evidence quality need joint review because improving one measure can degrade another.' },
      { text: 'Policy changes require approval and effective dates. A rollback should restore the prior version and identify cases classified during the affected interval. Monitoring health must be visible at the operating point, with a documented manual route for gateway, network or service failure.' },
    ],
    [
      { text: 'A release decision is limited to the tested asset class, site, policy and staffing model. Expansion needs a fresh context assessment because loading pattern, sensor layout, product sensitivity and response capacity can differ. Reuse belongs in the architecture and evaluation method, not an unexamined assumption about operating behaviour.' },
      { text: 'The operator has asked not to be named. The design specifies what evidence the pilot collects and where responsibility stays with their team. It provides no signal coverage, alert precision, response improvement, reporting saving or food-safety outcome.' },
    ],
  ],
  'property-pipeline': [
    [
      { text: 'The transaction record should distinguish parties, property or asset, opportunity, instruction, transaction and document. Each has its own identity and lifecycle. Combining them in one flat CRM record makes a change of party, asset or instruction difficult to represent and can attach later evidence to the wrong decision.' },
      { text: 'The baseline should trace a sample from initial enquiry to archive, recording the stage, the evidence required, the dependency, the colleague acting, the deadline, any reversal and the systems consulted. Message count is excluded as a progress measure because activity can rise while a blocking condition remains untouched.' },
    ],
    [
      { text: 'A state machine defines permitted transitions and the evidence required for each. A transaction cannot move to completion readiness because a person edits a label. The system evaluates the gate, identifies missing conditions and records the actor who approves an exception. A reversal retains the prior state and reason.' },
      { text: 'Dependencies need first-class records. A search, valuation, approval, counterparty document or external decision can block several downstream actions. Each dependency records who is chasing it, its source, the expected date and what it blocks. This allows the portfolio view to distinguish work awaiting internal action from work waiting on an external party.' },
    ],
    [
      { text: 'Document provenance includes original source, received time, file hash, version, extraction method and transaction link. Structured extraction creates proposed fields with passage locators. Confirmation records the reviewer and timestamp. A later document can supersede a field while preserving what prior decisions used.' },
      { text: 'Management reporting should aggregate derived state, dependencies and exception age from live records. It should not invite a separate status entry that diverges from the operational file. Portfolio summaries can then drill into the evidence supporting a risk signal or deadline.' },
    ],
    [
      { text: 'The pilot should select one transaction type with enough repetition and bounded variation. Gate definitions are tested against historic and live files before they control progression. Users need an explicit exception route because forcing unusual transactions through an incomplete model will drive spreadsheets and private notes.' },
      { text: 'Acceptance covers stage accuracy, missing-evidence detection, dependency age, material extraction correction, reversal, reporting effort and user reliance. Access and retention tests accompany workflow measures because transaction documents can contain sensitive personal and commercial information.' },
    ],
    [
      { text: 'Rejected alternatives remain available for later review. A large CRM replacement may become justified once transaction logic and integration needs are proven. Autonomous extraction may expand after field-level evidence supports it. The first release stays narrow so the team can identify which mechanism changed visibility.' },
      { text: 'Naming the business would identify its counterparties, so it is withheld. The allocation bars express a design position, and no transaction has yet completed faster or with fewer defects under it. Expansion depends on live evidence that users maintain the record and see dependencies early enough to change action.' },
    ],
  ],
  'professional-services-intake': [
    [
      { text: 'The intake taxonomy should separate prospective client, contact, organisation, service need, jurisdiction, urgency and candidate matter. Each field needs source and sensitivity. Collecting every potentially useful fact at first contact increases abandonment and confidentiality exposure, so the form should ask only what the next control or routing decision requires.' },
      { text: 'Referral provenance has to be recorded. The workspace records who supplied each fact and whether it came from the prospective client, referrer or an internal check. Conflicting facts remain visible. A generated brief cannot resolve conflict by selecting the more plausible statement without review.' },
    ],
    [
      { text: 'Deterministic controls should use approved identifiers and rule versions. Conflict, eligibility and mandatory completeness produce reproducible outcomes for the same evidence. A failed control creates a hold with reason and required action. A language model cannot override, reinterpret or conceal that state.' },
      { text: 'Professional judgement covers service fit, complexity, urgency, risk and acceptance. The workspace should present original evidence, structured facts, control results, proposed summary and open questions. Acceptance records the professional, scope, qualifications and any condition attached to instruction.' },
    ],
    [
      { text: 'Confidentiality boundaries should be enforced before model processing. Approved fields may enter an authorised service; excluded categories remain outside or use a separately assessed environment. Logs need minimisation and access controls because prompts and outputs can reproduce sensitive matter information.' },
      { text: 'Source-grounded summaries should retain links from each material fact to the intake field or document passage. Evaluation distinguishes omission, distortion, unsupported inference and style correction. A summary with a lower correction count can still fail if it hides an unanswered control question.' },
    ],
    [
      { text: 'The evaluation set should include incomplete referrals, ambiguous identities, urgent requests, jurisdiction conflicts, adversarial field content and attempts to bypass controls. Professionals label required facts, correct route, control state and material omissions. A held-back set provides evidence after prompt or model changes.' },
      { text: 'Pilot economics use time to substantive decision, preparation effort, clarification, queue age and professional correction. Faster capture is insufficient if acceptance waits longer or poor-fit enquiries consume more senior attention. Measures should cover the complete service through decision.' },
    ],
    [
      { text: 'Release should specify manual intake, service outage, incorrect merge and confidentiality incident routes. Every candidate matter remains recoverable from original evidence. Access, model, taxonomy and control changes trigger relevant regression tests before promotion.' },
      { text: 'Professional privilege keeps the firm anonymous in this account. What the engagement has produced is an intake architecture and proposed acceptance evidence, with no measured result yet. Professional use depends on reproducible controls, source fidelity, permitted processing and evidence that preparation improves without weakening acceptance.' },
    ],
  ],
  'field-service-planning': [
    [
      { text: 'A work order should carry location confidence, service window, duration range, skill and certification requirements, parts state, priority source and customer constraints. Resource records need availability, working limits, skills, vehicle and start location. Missing or stale inputs remain explicit because false precision can make an invalid plan appear feasible.' },
      { text: 'Baseline data should compare planned and actual duration, travel, arrival, completion, overtime, reassignment and failure by job category. Dispatcher notes capture constraints that systems do not yet represent. Those notes become candidates for structured data or policy after review, not hidden corrections to the evaluation.' },
    ],
    [
      { text: 'Hard constraints remove options that violate safety, certification, availability, parts or working rules. Soft objectives score service windows, priority, travel, overtime and plan stability among feasible options. Keeping these stages separate prevents a high score from compensating for an invalid assignment.' },
      { text: 'Input confidence should affect the plan. An uncertain duration can produce a conservative buffer or manual review; uncertain parts may block publication. Confidence is linked to source and observed error, not generated by the optimiser. Actuals update calibration by job class and operating context.' },
    ],
    [
      { text: 'The solver should return several feasible options with objective contributions and displaced commitments. A dispatcher needs to see why an option ranks higher and which customer or engineer absorbs the change. Publishing records the selected option, override and rationale.' },
      { text: 'Continuous replanning should be bounded by a material-change threshold. Every new event need not disturb the day. Urgent work, cancellation or material delay can trigger options, while minor variation remains visible without automatic churn. The policy balances optimisation gain against the cost of broken promises and dispatcher attention.' },
    ],
    [
      { text: 'Shadow evaluation runs recommendations beside live dispatch and reconciles them with actual outcomes. Overrides are classified as data, constraint, objective, explanation or local-knowledge issues. The team should also inspect recommendations accepted for the wrong reason, because low override alone does not prove a sound model.' },
      { text: 'Acceptance includes zero hard-constraint breaches in the evaluated set, balanced service and travel measures, understandable explanation, bounded churn and a safe manual route. Thresholds remain proposed until representative weeks and urgent events have been observed.' },
    ],
    [
      { text: 'Production release can begin with recommendations inside the dispatcher workspace and no automatic publication. Authority may expand only for a narrow class with strong evidence, reversible impact and reliable inputs. Model, solver, policy and source changes trigger targeted regression.' },
      { text: 'Anonymity here is at the operator’s request. The engagement specifies constraint logic, architecture and shadow measures, and has produced no route, overtime, service or planning result yet. The next decision depends on whether options remain feasible and useful after actuals expose the assumptions.' },
    ],
  ],
};

type AddedSection = ReportSection<never>;

export const advancedNewsSections: Record<string, AddedSection[]> = {
  'ai-integration-gap': [{
    heading: 'Data contracts and release operations',
    transition: 'The architecture explains how one item moves; durable integration also requires operating contracts between every contributing system and team.',
    paragraphs: [
      { text: 'A data contract should name the team that maintains the source, the schema, permitted use, freshness expectation, quality checks and behaviour when a field is missing or disputed. The receiving service should reject or quarantine incompatible input and preserve enough detail to diagnose the failure. Quiet default values are dangerous when they convert unknown context into an apparently complete model request.' },
      { text: 'Identity and access should follow the service, user and action. Retrieval can require one permission while a record update requires another. The audit record must show whose authority the service used and which policy version allowed the action. This is particularly important when a shared assistant can reach records from several functions with different confidentiality and retention rules.' },
      { text: 'Release management should separate changes to source data, workflow policy, model, prompt, evaluation and interface. Each component has a different regression surface. A source-schema change may break eligibility; a prompt change may alter uncertainty language; a model change may shift failure distribution. Versioned releases and targeted tests make those effects observable.' },
      { text: 'Support needs a queue and service expectation of its own. Users should know whether to correct an item, report a defect or use the fallback route. The team should classify incidents by data, integration, policy, model and adoption cause. Otherwise every poor result becomes a model complaint and investment is directed away from the actual constraint.' },
      { text: 'Economics should include this operating layer over the expected life of the workflow. Data stewardship, monitoring, regression, incident handling and user support continue after launch. The full cost can still justify investment when the outcome is material. Making it visible protects the decision from an early pilot that looks cheap because nobody has yet funded the people who will run it.' },
    ],
  }],
  'open-weight-price-war': [{
    heading: 'Portable evaluation and continuity design',
    transition: 'Model and deployment comparisons create option value only when the application can reproduce its standard and recover from supplier change.',
    paragraphs: [
      { text: 'The evaluation harness should store representative inputs, expected properties, reviewer rubric, model configuration, prompt, retrieval snapshot and cost observation. Results need versioned adjudication because the business standard can change. A model is promoted through the same release process whether it is accessed through an API or served on controlled infrastructure.' },
      { text: 'Adapters should normalise only what the application genuinely shares. Context limits, tool protocols, safety behaviour and structured-output guarantees differ across suppliers. Forcing them behind an overly simple interface can hide useful capability and create unreliable fallbacks. The application should expose meaningful differences while keeping business rules and acceptance evidence under buyer control.' },
      { text: 'Continuity testing should include throttling, regional outage, malformed output, model withdrawal and a sudden quality regression. The fallback may be a second model, queued processing or a manual route. The correct choice follows the service promise. A nominal second provider offers little resilience if it has not processed the current evaluation set or cannot handle the same data boundary.' },
      { text: 'Contracts should address data use, retention, sub-processors, service change, model retirement, capacity, export and incident notification. Open-weight licences need a similar review of use restrictions, distribution and attribution. The technical inventory and commercial register should reference the same deployed artifact so a licence decision cannot become detached from production reality.' },
      { text: 'Quarterly sourcing review should compare cost per accepted task, quality distribution, review demand, continuity evidence and switching effort. This creates a disciplined response to falling prices. Procurement can capture savings or capability improvements without creating a permanent migration programme each time a benchmark leader changes.' },
    ],
  }],
  'automation-before-agents': [{
    heading: 'Tool security and recovery engineering',
    transition: 'Authority levels define what the service may attempt; tool security and recovery determine whether that authority remains bounded during failure.',
    paragraphs: [
      { text: 'Each tool should expose a narrow operation with a validated request and response schema. General database, shell or browser access gives the planner many paths that were never evaluated. A purpose-built adapter can enforce resource scope, amount, destination and current workflow state before the underlying system receives a request.' },
      { text: 'Secrets belong in the execution environment and should be issued to the service identity for the minimum scope and duration available. Prompts, traces and model-visible context must never contain reusable credentials. Tool calls should record identity, request digest, policy decision, result and any compensating action without copying unnecessary sensitive payloads into monitoring systems.' },
      { text: 'Execution needs concurrency, spend and repetition limits. A planner that retries because it cannot observe success can create duplicate messages or commitments. Idempotency keys, current-state checks and explicit terminal states reduce this risk. A supervisor should stop a loop and produce the full trace for review when limits or unexpected sequences occur.' },
      { text: 'Recovery is designed per action. Drafts can be discarded, record updates may be reversed, and external commitments may require a compensating human process. The runbook should name who restores safe state and the evidence that proves it was restored. Teams should rehearse a representative failure before live authority expands.' },
      { text: 'Shadow operation should compare proposed and actual actions, including cases where staff solve the item through a route the system did not consider. Error analysis then improves state, policy, data or tools. This is stronger evidence for authority than a demonstration of normal cases because it shows how the service behaves when its plan meets operating reality.' },
    ],
  }],
  'cold-chain-collaboration': [{
    heading: 'OT assurance and policy operations',
    transition: 'A traceable exception case solves the decision path; sustained use depends on controlled telemetry, policy change and operating resilience.',
    paragraphs: [
      { text: 'The asset register should link sensors, gateways, network zones, calibration dates, the maintenance team and the product being monitored. Architecture diagrams need effective dates and a reconciliation process with site changes. A definitive view does not stay definitive by itself, especially when maintenance teams replace equipment or move sensors during urgent work.' },
      { text: 'Gateway and ingestion services should expose expected message frequency, last successful contact, clock offset, certificate status and queue backlog. Monitoring the application without these signals can produce a healthy dashboard while evidence is delayed or absent. Service health must be legible to the operator who decides whether to rely on the case.' },
      { text: 'Policy governance should include proposer, approver, evidence, effective date, affected assets and rollback. Historical replay can show how a threshold change alters alert distribution, while expert review considers missed-event consequence. Production cases retain the policy version used so later assurance can reconstruct the decision available at that time.' },
      { text: 'Incident response should cover suspect telemetry, excessive alerts, missed events, unauthorised access and failure of the exception queue. The route includes technical containment and operational continuity. Food-safety and maintenance decisions continue under existing responsibilities while the digital service is investigated.' },
      { text: 'Scaling to additional sites requires a local readiness check for sensor layout, connectivity, operating policy, staffing and current controls. Shared components can reduce delivery cost, but classification and service targets still need local evidence. Portfolio reporting should preserve those differences and avoid presenting incomparable sites as one uniform performance series.' },
    ],
  }],
  'small-teams-ai-advantage': [{
    heading: 'Delivery cell and capability transfer',
    transition: 'Focus creates a credible first experiment; durable advantage depends on whether its knowledge, its controls and the people who ran it transfer into normal work.',
    paragraphs: [
      { text: 'The delivery cell needs a sponsor, the manager who runs the workflow, a subject expert, an engineer who will maintain it, and users who do the work daily. One person can hold more than one role in a small firm, but each decision right should remain explicit. This prevents speed from depending on an unnamed colleague who informally approves data, quality and service risk.' },
      { text: 'The cell should work in short releases with a current problem statement, acceptance evidence and stop condition. Demonstrations use representative items and expose open exceptions. A decision log records the scope, the source, the risk, the trade-off accepted and who accepted it. These light artifacts preserve learning without creating a separate transformation bureaucracy.' },
      { text: 'Capability transfer begins before launch. Users need to understand the workflow state, evidence, review route and failure response. Technical support needs logs and runbooks. Management needs a benefits and risk view. If only the builder can explain the system, the release has created a specialist dependency and no organisational advantage.' },
      { text: 'External specialists can supply architecture, evaluation and security depth that the firm does not need full-time. The operating team still owns customer promise and acceptance. Contracts should preserve access to configurations, tests, documentation and data decisions so supplier change does not erase the learning created by the project.' },
      { text: 'After release, the cell should review use, outcome, correction, exception and support demand. A successful project leaves a reusable evaluation method, integration pattern and group of informed users. A failed project can also create value if the evidence narrows the portfolio and the firm stops before scaling weak economics.' },
    ],
  }],
  'measure-automation-value': [{
    heading: 'Instrumentation and benefit governance',
    transition: 'The causal chain defines each benefit; instrumentation and governance determine whether the chain remains observable over time.',
    paragraphs: [
      { text: 'Workflow events should identify eligibility, start, completion, review, correction, exception and fallback. The data model needs stable definitions across baseline and observed periods. If a release changes what counts as completed work, finance must reconcile the series before comparing performance. Versioned metric definitions belong in the benefits ledger.' },
      { text: 'Demand and mix adjustments should be agreed before results are known. Volume, seasonality, customer segment and task complexity can change effort and outcome. Where causal attribution is weak, the report should present a range and the alternative explanations still consistent with evidence. Transparent uncertainty supports a better decision than a precise adjustment chosen after the outcome.' },
      { text: 'Operations owns behaviour and service evidence; finance owns classification and financial consequence; technology owns telemetry quality. A joint review is required because no group can prove the full bridge alone. Each benefit should identify the decision it affects, the next evidence date and the condition that would reduce confidence.' },
      { text: 'Benefit persistence should be tested after the initial adoption period. Workarounds, demand growth, staff change and model updates can alter net effort. Temporary training cost may fall, while permanent review or support can rise. The ledger should separate one-off transition effects from the sustainable operating state.' },
      { text: 'Portfolio reporting should avoid adding unlike benefits into one total without explaining valuation and confidence. Cash, capacity, service, quality and risk can all support investment. Keeping them separate lets leaders see where value is realised, where it remains a hypothesis, and who has to act next.' },
    ],
  }],
  'legal-ai-source-grounded-work': [{
    heading: 'Knowledge lifecycle and client controls',
    transition: 'A matter-scoped release can produce reliable work today; the knowledge lifecycle determines whether it remains valid and appropriately controlled tomorrow.',
    paragraphs: [
      { text: 'Accepted research should record matter permission for reuse, source licence, jurisdiction, effective date and reviewer. Some work remains confined to the matter; some can contribute to approved know-how after review and anonymisation. The system should enforce that decision before content enters a broader collection, preventing accidental reuse of client facts or privileged analysis.' },
      { text: 'Knowledge requires expiry and revalidation. A legal proposition may remain textually accurate while its authority or procedural context changes. Collections should show review dates, amendments and changes to cited sources. A later user sees the status and can return the item to professional review before reliance.' },
      { text: 'Client terms, court directions and regulatory expectations may alter permitted processing or disclosure. Matter opening should record applicable constraints and configure the service route. A default approved tool does not imply approval for every instruction. Professionals need a clear manual path when a matter falls outside the assessed boundary.' },
      { text: 'Incident response should identify affected matters, users, sources and generated artifacts through lineage. Containment may revoke access, remove a source or roll back a model. The firm then assesses professional, confidentiality and client consequences. Provenance makes this investigation narrower and more reliable than searching an undifferentiated output archive.' },
      { text: 'Service reporting should cover support and omission by proposition class, source availability, reviewer correction, inspection behaviour, access incidents and queue delay. Management can use these measures to narrow scope, repair source operations or change supervision. They provide no substitute for file-level professional responsibility.' },
    ],
  }],
  'hospitality-ai-guest-recovery': [{
    heading: 'Integration reliability and privacy operations',
    transition: 'Recovery authority resolves one disruption; reliable integration and privacy operations determine whether the service can support many concurrent journeys.',
    paragraphs: [
      { text: 'Each connector needs a named maintainer, a freshness target, a reconciliation check and a defined behaviour when it degrades. Reservation, property, maintenance and CRM systems may update on different schedules. The recovery case should display source time and place a hold on options supported by stale state. A central dashboard should show connector health by property.' },
      { text: 'Identity resolution should minimise attributes, encrypt sensitive data and keep match evidence available only to authorised roles. Manual reviewers need enough information to distinguish guests without exposing complete profiles. Merge, correction and deletion should propagate through the recovery index and preserve a lawful audit record.' },
      { text: 'Compensation controls require policy versions by property, brand, disruption and delegated role. The service records which version supported each offer. Local managers can approve exceptions with reason, while portfolio teams review patterns. This keeps discretion visible and makes policy improvement possible without removing local authority.' },
      { text: 'Incident routes should cover incorrect identity, stale availability, failed fulfilment, duplicate compensation and privacy breach. Front-line staff need a manual fallback and a temporary case record. Technical recovery later reconciles actions so the guest does not become responsible for resolving the system discrepancy.' },
      { text: 'Portfolio rollout should begin with comparable properties and one disruption class. Readiness covers source quality, the team that will run it, the authority delegated to them, the fallback and the measurement. Shared technology can scale, while each property retains an evidence-based decision about policy and feasible remedy. This prevents a central template from promising service the local operation cannot deliver.' },
    ],
  }],
};

export const advancedCaseSections: Record<string, AddedSection[]> = {
  'yacht-operations': [
    {
      heading: 'Identity migration and cutover',
      transition: 'The first-release scope defines the target record; migration determines whether colleagues can trust the identities and history placed inside it.',
      paragraphs: [
        { text: 'Migration begins with a source inventory covering inboxes, documents, spreadsheets and any existing customer tool. Each source records who maintains it, the extraction date, the field map and a quality profile. The team identifies which source can create or update customer, vessel, enquiry and project attributes. Conflicts stay visible until a named colleague resolves them.' },
        { text: 'Matching rules use stable identifiers where they exist and candidate scoring for names, contacts, vessel details and prior references. Automatic merge is limited to cases with unambiguous evidence. Reviewers see both records, relationships and event histories before approving a merge. Every decision is reversible and logged.' },
        { text: 'Historical entries become events only when their source and time can be represented honestly. An undated note can be retained as context without inventing chronology. The derived current state is calculated after migration and compared with the state a knowledgeable colleague expects. Disagreement enters a reconciliation queue.' },
        { text: 'Cutover should run by cohort, with record counts, mandatory fields, duplicates, open actions and source commitments reconciled before authority moves. A short dual-read period can preserve access to legacy evidence, while new updates have one authoritative destination. Dual writing is avoided because it creates immediate divergence.' },
        { text: 'Rollback needs a defined point, export of post-cutover events and a communication route for users. The team should rehearse duplicate discovery, incorrect relationship and missing-history scenarios. Migration completion is an evidence milestone; it does not establish adoption, coordination saving or customer benefit.' },
      ],
    },
    {
      heading: 'Operating support and acceptance',
      transition: 'A reconciled cutover supplies a trustworthy starting point; supervised use must now show whether the record survives daily operating pressure.',
      paragraphs: [
        { text: 'Users should receive role-based views and a concise explanation of identity, events, state and who acts next. Training uses representative enquiries and known exceptions. Support captures the record, state and action involved in each issue so the team can distinguish misunderstanding from data, policy or interface defects.' },
        { text: 'Acceptance sampling should reconstruct customer commitments from source event through current state and next action. The reviewer checks identity, chronology, the colleague acting, any exception and the approval. Status assembly time, systems consulted and overdue work provide coordination evidence. Material communication correction protects the service boundary.' },
        { text: 'Adoption should be measured in the workflow. Login counts say little if colleagues continue to manage status in inboxes or private lists. Sampled items should show that the shared record received material events and that users acted from its state. Parallel records are treated as diagnostic evidence.' },
        { text: 'Operational support needs a named contact for source integrations, identity exceptions, workflow policy and user issues. Service hours and recovery expectations follow the customer promise. A small team can keep the model lean, but critical knowledge and access should not reside with one person.' },
        { text: 'The release review decides expand, adjust, hold or stop. Expansion requires that reconstruction is trusted, that items are still being picked up, and that support demand is affordable. Weak identity or migration evidence sends the design back to reconciliation. Low adoption sends it to workflow and interface review. Only then can document connection or bounded drafting enter scope.' },
      ],
    },
  ],
  'cold-chain': [
    {
      heading: 'Telemetry operations and OT assurance',
      transition: 'Parallel pilot controls define how the service is observed; telemetry operations determine whether its input can support any classification.',
      paragraphs: [
        { text: 'The asset record should connect the site, the room, the equipment, the sensor, the gateway, the network segment, the calibration record, the maintenance team and the product being stored. Each relationship has an effective period. Installation, replacement and relocation need controlled updates so the monitoring service does not apply the wrong context to a valid signal.' },
        { text: 'Ingestion preserves raw value, unit, event time, receive time, device identity and quality flags. Duplicate, late and out-of-order readings need deterministic handling. Derived aggregates reference the raw evidence used. A reviewer can therefore reconstruct why a case opened even after an aggregation or classification rule changes.' },
        { text: 'Connectivity monitoring covers heartbeat, queue depth, clock offset, certificate and gateway health. A data gap becomes an operating state with a responder and a fallback, not a blank chart. Site staff should know when the service has degraded and which existing check remains authoritative.' },
        { text: 'The monitoring architecture should use controlled, read-only paths from OT into the analytical environment. Firewall, broker, schema and identity decisions belong in the documented design. There is no general route from the model or exception service back to equipment control.' },
        { text: 'Security and safety review should examine third-party maintenance, remote access, patching and incident response. A technically separate service can still increase risk if credentials, gateways or support routes are poorly governed. The pilot does not alter current hazard controls until this boundary is accepted.' },
      ],
    },
    {
      heading: 'Calibration and controlled release',
      transition: 'A trustworthy telemetry route supplies valid cases; calibration must show that policy improves attention without hiding material events.',
      paragraphs: [
        { text: 'Historical replay should include normal variation, known excursions, sensor failures, loading, defrost and incomplete records. Experts label signal quality, materiality and expected action with documented disagreement. The set is retained for regression when thresholds, context rules or classification components change.' },
        { text: 'Observation mode matches each proposed case with existing alarms and manual discoveries. Review covers events found by both routes and events found by one. Precision, missed-event consequence, queue age, response and closure evidence are considered together. Suppression of difficult alerts cannot appear as success.' },
        { text: 'Operators record override cause, missing context and corrective action. Repeated causes direct remediation to sensor, asset data, policy or staffing. The service should expose uncertainty and permit closure only with the evidence required by severity. Professional judgement remains attributable.' },
        { text: 'Release conditions include known coverage, visible data gaps, approved policy, controlled OT boundary, acceptable alert burden, no unacceptable missed-event pattern and a rehearsed fallback. Each condition names who confirms it and the date it was observed. A target service time remains local and provisional until the hazard and staffing model support it.' },
        { text: 'Production approval remains limited to the tested site, asset class and policy. Expansion repeats context and readiness review. The case offers a technical and governance design only, with no measured food-safety, labour, response or financial result.' },
      ],
    },
  ],
  'property-pipeline': [
    {
      heading: 'Transaction data and provenance',
      transition: 'The single-transaction pilot sets a practical scope; its record must now represent parties, documents and dependencies without losing provenance.',
      paragraphs: [
        { text: 'The model separates party, contact, asset, opportunity, instruction, transaction, document and dependency. Stable identifiers and effective relationships allow parties or instructions to change without rewriting history. Each transaction state is derived from evidence and transition events.' },
        { text: 'Incoming documents retain source, receive time, file hash, version and access classification. Extraction proposes fields with passage locators and confidence. A reviewer confirms material fields. A later version can supersede the value while preserving which source supported an earlier decision.' },
        { text: 'Stage gates define minimum evidence, unresolved exceptions, approval and permitted next states. A person cannot create completion readiness by editing a label. An approved exception records its scope, the reason, who approved it and when it expires. Reversal preserves the previous state and dependencies affected.' },
        { text: 'Dependencies carry a type, the colleague chasing them, a source, an expected date, a status and an impact. Portfolio reporting can distinguish internal delay, external wait and missing evidence. This gives management a risk view it can act on, and avoids using message volume or anecdotal confidence as a proxy for progress.' },
        { text: 'Access follows transaction role and document sensitivity. Search, extraction and generated summaries inherit those permissions. Audit records access and material change without copying unnecessary content into logs. Retention and archive rules remain aligned with the source record.' },
      ],
    },
    {
      heading: 'Pilot economics and scale boundaries',
      transition: 'A provenance-led transaction record makes the design testable; the pilot must show whether earlier visibility justifies its operating burden.',
      paragraphs: [
        { text: 'The baseline follows representative transactions through stages, recording evidence gaps, dependency age, reversals, deadline effects, systems consulted and reporting effort. Work mix and external delay are retained so the pilot does not claim an improvement caused by easier transactions.' },
        { text: 'Users maintain the workspace during live work with an explicit exception route. Parallel spreadsheets, private status lists and unrecorded approvals are evidence about usability or model fit. Adoption is judged by maintained state and decisions made from the record.' },
        { text: 'Extraction evaluation separates exact fields, contextual judgement and material omission. Review time and correction cause belong in the economics. A fast proposal that increases document checking may still be useful for indexing and unsuitable for gate evidence.' },
        { text: 'Release requires earlier visibility of missing evidence or dependencies, acceptable maintenance effort, reliable access, traceable stage decisions and reporting derived from the operational record. No target is treated as achieved until live comparison supports it.' },
        { text: 'Expansion to another transaction type depends on overlap in state, evidence and controls. Shared architecture can be reused; gate definitions and source systems need fresh discovery. No completed transaction and no measured outcome is claimed for it yet.' },
      ],
    },
  ],
  'professional-services-intake': [
    {
      heading: 'Confidential intake data operations',
      transition: 'Pilot acceptance criteria define the desired decision; confidential data operations determine which evidence can safely reach that point.',
      paragraphs: [
        { text: 'The intake schema should identify prospective client, related parties, contact, service need, jurisdiction, urgency, referral source and candidate matter. Each field has source, sensitivity and retention. Progressive capture requests information when it becomes necessary for the next gate.' },
        { text: 'Facts retain provenance to form field, document, caller note or referrer. Conflicting claims remain visible and cannot be resolved by model preference. Identity matching uses approved attributes and sends ambiguity to a reviewer before conflict or eligibility results are trusted.' },
        { text: 'Approved processing rules decide which fields can enter a model service. Excluded categories remain outside or use a separately assessed environment. Prompts, outputs and traces receive access and retention controls because they can reproduce confidential information.' },
        { text: 'Deterministic controls store rule version, inputs, result and reason. A failed or incomplete gate creates a hold. The model can prepare questions or a summary from approved evidence; it cannot change the control state. Every professional sees the original evidence alongside assistance.' },
        { text: 'Deletion, correction and ethical-wall changes must reach operational records, indexes and generated artifacts. Lineage identifies which briefs used affected evidence. This supports incident response and prevents a corrected intake fact from leaving an accepted summary silently unchanged.' },
      ],
    },
    {
      heading: 'Professional evaluation and release',
      transition: 'A controlled data route makes assisted preparation possible; professional evaluation determines whether it improves the complete intake decision.',
      paragraphs: [
        { text: 'The evaluation set represents complete, incomplete, ambiguous, urgent, out-of-scope and adversarial enquiries. Professionals label required facts, correct route, gate state, material omissions and acceptable summary. Disagreement reveals where judgement cannot be reduced to one target answer.' },
        { text: 'Summary scoring separates omission, distortion, unsupported inference, confidentiality and style. Material errors have blocking thresholds. Reviewers open linked evidence and record correction cause. A held-back set tests changes to model, prompt, taxonomy and policy.' },
        { text: 'Service measures follow the item through time to substantive decision, clarification, preparation effort, acceptance queue and reclassification. Faster form completion cannot offset a longer professional queue. Economics include reviewer and support demand across the full route.' },
        { text: 'Release requires reproducible controls, permitted processing, complete source links, no material omission outside tolerance and evidence that professionals can decide with less reconstruction. Manual intake and service outage routes remain available and rehearsed.' },
        { text: 'Assistance can expand by enquiry class only after supervised evidence supports it. The account provides no live firm deployment, no faster intake, no accepted summary rate and no client result. Qualified professionals retain acceptance and responsibility in every release.' },
      ],
    },
  ],
  'field-service-planning': [
    {
      heading: 'Solver data and operating resilience',
      transition: 'Shadow-planning evidence tests recommendations; dependable testing first requires valid inputs and a solver whose decisions can be reconstructed.',
      paragraphs: [
        { text: 'Work orders need validated location, service window, priority, duration range, skill, certification, parts and customer constraints. Resource data covers availability, working limits, skills, vehicle and starting position. Each input records source, freshness and confidence.' },
        { text: 'Hard constraints are encoded separately from objective weights and versioned with approval. The solver removes invalid assignments, then scores service, priority, travel, overtime and stability. An option retains its constraint result and objective contribution so the dispatcher can inspect why it ranked.' },
        { text: 'Duration and travel estimates should use distributions or confidence bands where possible. A single point estimate can make a tight plan appear feasible. Buffer policy follows consequence and observed error by job class. Actuals update calibration after review.' },
        { text: 'Replanning triggers on material events and respects a churn threshold. The engine should not reorganise a day for every small delay. Options display displaced promises and affected engineers. The dispatcher publishes the plan, and the system records override and reason.' },
        { text: 'Manual dispatch remains the fallback for source outage, solver failure or unexplained recommendation. The runbook identifies authoritative data and later reconciliation. Production should not depend on a planner whose degraded state is invisible to the person controlling the day.' },
      ],
    },
    {
      heading: 'Shadow evidence and authority',
      transition: 'A reconstructable solver produces testable options; shadow operation must show whether dispatchers can use them without transferring disruption elsewhere.',
      paragraphs: [
        { text: 'Shadow weeks should represent ordinary, peak and disrupted operation. Proposed plans are timestamped before the live decision and later reconciled with actual travel, duration, arrival, completion, overtime and service. This avoids scoring a plan with information unavailable at publication.' },
        { text: 'Dispatchers classify rejection or amendment as data, constraint, weight, explanation, customer context or local knowledge. Accepted recommendations also receive sampled review. A low override rate can reflect poor scrutiny, so outcome and rationale remain necessary.' },
        { text: 'Acceptance requires every evaluated assignment to satisfy hard constraints, with service, travel, overtime and stability within agreed bounds. Explanation must identify the affected promises and relevant inputs. Churn and dispatcher effort sit inside the value case.' },
        { text: 'Initial production authority is recommendation only. Automatic publication would require separate evidence for a narrow, reversible class and reliable inputs. Solver, policy, model or source changes trigger regression and can return the service to shadow mode.' },
        { text: 'The engagement has no live planning result yet. It offers a constraint architecture, shadow method and release decision. Travel, service, overtime and planning benefits remain open until representative operational evidence supports them.' },
      ],
    },
  ],
};

export const advancedNewsExtensionSections: Record<string, AddedSection[]> = {
  'ai-integration-gap': [{
    heading: 'Benefits evidence and scaling gate',
    transition: 'Release operations keep the service dependable; the final investment question concerns benefit conversion and the evidence required to repeat the pattern.',
    paragraphs: [
      { text: 'The benefits record should connect eligible volume, accepted outcome, net effort, service, quality and exceptions over the same observation window. Adoption is useful as an explanation for performance, while the operating result governs continuation. Any capacity claim identifies where time was deliberately redeployed.' },
      { text: 'Scaling should reuse data contracts, identity patterns, evaluation and incident routes while still requiring a new workflow baseline and a manager to run it. Similar technology does not make two processes economically or operationally equivalent. Portfolio review should compare evidence confidence and management capacity alongside forecast return.' },
    ],
  }],
  'open-weight-price-war': [{
    heading: 'Deployment economics under change',
    transition: 'Portability creates a credible alternative; scenario economics show whether exercising that alternative would improve the service.',
    paragraphs: [
      { text: 'Demand scenarios should cover ordinary load, peak concurrency, long-context work and batch processing. API and self-hosted cost curves respond differently to idle capacity and bursts. The model should include engineering, observability and on-call effort, with uncertainty kept visible where operating history is limited.' },
      { text: 'Quality scenarios should vary first-pass acceptance and specialist correction. Small changes in rejection can dominate a large token saving when review is expensive. Sensitivity analysis identifies the acceptance threshold at which a cheaper candidate stops improving total cost.' },
      { text: 'Supplier-change scenarios should include feature replacement, data export, regression, security review and staged rollout. Switching cost is not a reason to avoid dependency. It is an input to the commercial decision and a prompt to preserve the evaluation and business logic that make migration possible.' },
      { text: 'Open deployment scenarios should include hardware failure, patching, scaling and staff availability. A partner-operated service can transfer some duties, but the buyer still answers for licence, data and acceptance. Contract and architecture should state that allocation clearly.' },
      { text: 'The sourcing decision is reviewed when price, capability, workload or risk changes materially. A stable cadence prevents constant migration while preserving market leverage. Management can retain a more expensive supplier where it produces a measured accepted-task advantage and can move when that advantage disappears.' },
      { text: 'Environmental and sustainability claims also require a comparable boundary. Provider disclosures and local hardware estimates may use different energy and utilisation assumptions. Procurement should record the measure available and avoid presenting an incomplete infrastructure comparison as a definitive model-ranking factor.' },
    ],
  }],
  'automation-before-agents': [{
    heading: 'Evaluation by state and consequence',
    transition: 'Secure tools constrain execution; representative evaluation must now show how the service behaves across workflow states and consequences.',
    paragraphs: [
      { text: 'The evaluation set should sample each material state, transition and exception. Normal-path volume alone can produce a high score while the service fails every item that needs escalation. Results should report coverage, completion, unsafe action, correction and rescue effort by state.' },
      { text: 'Consequence weighting belongs beside raw counts. One duplicate reminder and one duplicate payment are not comparable defects. The release review should identify blocking failure classes and acceptable residual error for lower-consequence work, with a named professional signing off that distinction.' },
      { text: 'Adversarial tests should include conflicting instructions, malicious content in retrieved records, attempts to exceed permissions and tool responses that imply success ambiguously. These cases test the full system, including policy and adapters, without assuming the model alone will recognise every unsafe route.' },
      { text: 'Live shadow traces should be reviewed for plans that appear successful because staff repaired them silently. Rescue time and intervention point help determine whether the service is reducing work or moving it. Reviewers need an easy way to annotate the trace without recreating the case.' },
      { text: 'Authority review follows evidence by action class. Drafting, recommendation, reversible update and external commitment may progress at different speeds. The system can remain valuable with permanent approval on consequential actions if the complete workflow creates a measured operating benefit.' },
      { text: 'Post-release sampling should include actions that completed without visible exception. Silent success can still contain weak evidence, unnecessary tool use or excessive permission. Periodic trace review protects against gradual expansion of behaviour beyond the evaluated route.' },
    ],
  }],
  'cold-chain-collaboration': [{
    heading: 'Assurance economics and scale',
    transition: 'OT and policy operations keep the service safe; management still needs to know whether the complete route improves attention and assurance at sustainable cost.',
    paragraphs: [
      { text: 'The economic baseline should separate routine record assembly, alarm review, investigation, corrective action and assurance reporting. Monitoring may increase early review effort while reducing later reconstruction. The pilot should observe both and avoid counting displaced work as a saving.' },
      { text: 'Alert burden needs a staffing model. Severity, time of day, site coverage and escalation create different service requirements. A technically accurate classifier can fail operationally if cases reach a queue that cannot respond. Capacity and continuity therefore belong in release acceptance.' },
      { text: 'Reporting value comes from evidence already created during operation. If staff must re-enter decisions for audit or customer assurance, the system has not closed the route. Sampled reports should be reconstructed back to the readings, the context, the policy applied, the colleague who acted and the corrective action.' },
      { text: 'Multi-site comparison needs common definitions and local context. Coverage, alert precision and response should disclose sensor estate, policy and staffing differences. A central score without those denominators may penalise a site with better detection or reward one with missing telemetry.' },
      { text: 'Scale approval should require a site team that reliably responds, controlled architecture, calibrated policy, manageable workload and complete closure evidence. New asset classes or products trigger fresh hazard review. The service can reuse the software while each site keeps responsibility for its own hazards.' },
      { text: 'Supplier assurance should cover sensor, gateway, network and software dependencies. Contracts and support routes need named incident contacts, change notice and evidence export. A hosted component does not transfer the operator’s responsibility to recognise degraded monitoring and maintain safe controls.' },
      { text: 'Training should use real operating patterns and distinguish data-quality, product-severity and equipment states. Operators need to understand why a case was prioritised and how to challenge it. Feedback quality depends on a taxonomy simple enough to use during live work.' },
      { text: 'The investment decision should therefore state the current control being strengthened, the material event population, the ongoing workload and the failure route. This keeps the collaboration anchored to assurance and response, with no claim that analytics alone changes food-safety performance.' },
    ],
  }],
  'small-teams-ai-advantage': [{
    heading: 'Operating economics and portfolio discipline',
    transition: 'Capability transfer reduces dependence on the delivery cell; operating economics determine whether the pattern deserves further scarce attention.',
    paragraphs: [
      { text: 'The investment case should price internal subject time, data preparation, delivery, licences, review, support and change. A small firm may spend little on software and a great deal of leadership attention. Recording that time improves comparison with hiring, outsourcing or process simplification.' },
      { text: 'Benefits should identify the constraint relieved. Released preparation time matters when it expands billable capacity, shortens service or avoids a planned hire. If work simply absorbs the time, management can still value quality or resilience but should not report cash.' },
      { text: 'A portfolio limit protects the organisation from many small pilots. New work enters only when it has a named manager, a baseline, an evidence set and a capacity budget. Existing work leaves when the outcome is immaterial, support is disproportionate or a stronger constraint appears.' },
      { text: 'Reusable assets lower the cost of later releases, but somebody has to maintain them. Evaluation cases age, integrations change and policies move. The firm should keep only the shared capability it can operate and buy specialist support where intermittent depth is more economic.' },
      { text: 'Board review should separate learning, operating and financial evidence. A failed pilot may still retire a weak hypothesis; an adopted tool may still lack a measured result. Clear categories allow a lean team to stop quickly and preserve credibility when the evidence is mixed.' },
      { text: 'Succession and resilience should be tested before the portfolio expands. Another colleague must be able to operate the workflow, inspect failures and contact specialist support. This test reveals whether capability has entered the firm or remains concentrated in the original delivery group.' },
    ],
  }],
  'measure-automation-value': [{
    heading: 'Attribution and portfolio comparability',
    transition: 'Benefit governance maintains each claim; attribution and comparability determine what leadership can infer across projects.',
    paragraphs: [
      { text: 'Attribution can use staged rollout, matched cohorts, interruption analysis or carefully documented before-and-after comparison. The design follows feasibility and consequence. Where none is credible, the programme should report association and keep alternative explanations visible.' },
      { text: 'Work mix should be segmented when complexity changes the effect. Automation may handle routine volume and leave a smaller, harder queue whose average effort rises. Reporting total and eligible populations prevents this selection effect from appearing as operational deterioration or improvement without explanation.' },
      { text: 'Quality and service measures need stable definitions and sampling. Complaint count can fall with demand, while sampled defect rate changes differently. Customer outcome may lag workflow change. The benefits ledger should state observation period and when a claim is mature enough for decision.' },
      { text: 'Portfolio comparison should use confidence, persistence and management relevance alongside value magnitude. A large modelled range should not automatically outrank a smaller measured service gain. Leadership needs to see what has happened, what is likely and which action can convert the remaining opportunity.' },
      { text: 'Benefits review should also report negative value: support burden, slower exceptions, training loss, control incidents and opportunity cost. Recording these effects does not weaken the business case. It protects investment by showing the conditions under which the workflow should change or stop.' },
      { text: 'The review pack should retain reconciliation from source events to reported measures. A leadership total that cannot be traced back to eligible volume, corrections and the actions people actually took will lose credibility after staff or systems change. Auditability is therefore part of value governance.' },
      { text: 'Sunset decisions need operational planning. When a workflow stops, data retention, user communication, source permissions and any downstream dependency must be closed safely. A weak project should not become a permanent unsupported service merely because removal was omitted from the business case.' },
    ],
  }],
};

export const advancedCaseExtensionSections: Record<string, AddedSection[]> = {
  'cold-chain': [{
    heading: 'Corrective-action evidence model',
    transition: 'Calibration determines which events enter the queue; the evidence model determines whether a closed case can support operations and assurance.',
    paragraphs: [
      { text: 'A case should retain alert evidence, validation result, asset and product context, operator observations, decision, corrective action and subsequent verification. Required fields vary by severity. Closure should block when material evidence is absent and explain which action remains open.' },
      { text: 'Corrective actions can create linked maintenance, inspection or product-disposition records. The exception service references their identifiers and status without duplicating the whole source. Completion events return to the case and preserve which person confirmed the outcome.' },
      { text: 'Amendment and reopening are normal parts of evidence quality. A later calibration finding or maintenance diagnosis may change the interpretation. The ledger appends the new evidence, reason and decision while preserving what the overnight operator knew originally.' },
      { text: 'Assurance sampling should follow a case from raw reading through policy and closure, including cases classified as non-material. This tests silent suppression as well as visible response. Findings direct remediation to the telemetry, the context, the policy, the response route or the evidence.' },
      { text: 'Retention and export should meet the operator’s legal and commercial context. The design must preserve intelligible records after model or vendor change. No generated narrative should become the only copy of the evidence on which a safety decision relied.' },
      { text: 'The next release decision depends on complete, reviewable cases and an alert route that existing controls judge acceptable. This remains a design position with no measured improvement behind it.' },
      { text: 'Management should also confirm who owns assurance sampling after pilot specialists leave. A sustainable release needs normal operating capacity for review, policy change and incident reconstruction, with escalation to food-safety and engineering expertise when the case requires it.' },
    ],
  }],
  'property-pipeline': [{
    heading: 'Exception and dependency operations',
    transition: 'Pilot economics test the standard path; exception operations determine whether the record remains useful when the transaction departs from it.',
    paragraphs: [
      { text: 'Exceptions should be typed as missing evidence, disputed evidence, external delay, policy waiver, identity conflict or system failure. Each type names who handles it, the condition that makes it due and the escalation route. A free-text note alone cannot support portfolio analysis or a reliable recovery route.' },
      { text: 'Gate waivers need scope, approver, reason, compensating control and expiry. The transaction should show that it progressed under exception and which later action must close the gap. This prevents a one-time commercial decision from silently redefining the standard process.' },
      { text: 'External dependencies need confirmation and contingency. The team can record an expected date without pretending to control it. A missed date creates an owned review and updates downstream forecasts through explicit logic, keeping the change traceable.' },
      { text: 'System outages require temporary identifiers and later reconciliation. Users should avoid a parallel permanent spreadsheet, while retaining a usable capture route during failure. The recovery process checks duplicate actions and preserves the original event time.' },
      { text: 'Management review should focus on exception age, concentration, recurrence and effect. Repeated waivers can indicate poor gate design; repeated missing documents can point to source or responsibility. The record supports action because each pattern links back to live transactions.' },
      { text: 'Expansion depends on whether the model can represent real variation without excessive exception handling. If most work sits outside the normal route, the correct response is to revise scope or state design before adding automation.' },
      { text: 'Document and dependency reporting should be tested under deadline pressure, when users are most likely to bypass new controls. The pilot can sample late-stage changes and compare the shared record with communications to identify decisions that escaped capture.' },
      { text: 'Economic review should include transaction maintenance, document confirmation, integration support and the preparation removed from weekly reporting. Any released capacity needs a named use. Earlier risk visibility can justify investment even when completion time does not move, provided the exposure and decision change are evidenced.' },
      { text: 'The manager running the service should decide how long inactive and completed records stay searchable, which roles can reopen them and how legal or commercial holds apply. Lifecycle controls prevent a useful live workspace from becoming an unmanaged archive of sensitive transaction material.' },
    ],
  }],
  'professional-services-intake': [{
    heading: 'Matter acceptance and downstream handover',
    transition: 'Professional evaluation proves the intake decision; downstream handover shows whether accepted evidence remains useful after the matter opens.',
    paragraphs: [
      { text: 'Acceptance should create the matter from approved fields and control evidence, not re-key an unverified summary. The handover includes parties, scope, jurisdiction, urgency, source documents, open questions, gate results and accepting professional. Every transferred field retains provenance.' },
      { text: 'Conditional acceptance needs explicit actions, each with a name against it. A matter may open subject to engagement terms, additional identity evidence or specialist review. The state remains conditional until those actions complete, and downstream workflows can see the restriction.' },
      { text: 'Rejected and referred items require controlled closure, retention and communication. The system records decision and reason at the appropriate level without storing unnecessary sensitive analysis. A generated response remains subject to professional approval and the permitted disclosure boundary.' },
      { text: 'Downstream users should evaluate whether the intake brief reduces repeated fact gathering and whether material corrections appear after acceptance. Those findings may reveal weak capture, taxonomy or review. They do not retrospectively convert preparation into a professional decision.' },
      { text: 'Changes to taxonomy or control policy need migration rules for open candidates. Reclassification should record prior and new route. A new model cannot silently revise accepted matters; its use begins with new or deliberately re-reviewed items.' },
      { text: 'The release remains bounded to preparation and controlled handover. Advice, substantive legal conclusions and client commitments stay with qualified professionals under the firm’s ordinary supervision.' },
      { text: 'Supervision evidence should show which professional reviewed the item, what assistance was used and which material corrections were made. This supports quality improvement without turning the audit trail into a substitute for file supervision or professional judgement.' },
      { text: 'Capacity planning should recognise arrival peaks and specialist routing. A more complete intake can reveal additional work and increase the acceptance queue. Service-level decisions should therefore cover both preparation and professional review, with clients or referrers given accurate expectations.' },
      { text: 'Management should review taxonomy drift as new services, jurisdictions and referral patterns emerge. Unknown classes need a safe general route. Repeated unknowns may justify a controlled taxonomy change and new evaluation cases before automation expands.' },
    ],
  }],
  'field-service-planning': [{
    heading: 'Execution feedback and model maintenance',
    transition: 'Shadow evidence decides whether recommendations can enter live work; execution feedback determines whether they remain useful after release.',
    paragraphs: [
      { text: 'Actual arrival, start, completion, travel, parts use and outcome should link to the published plan and work order. Missing actuals remain visible. The system must distinguish a poor estimate from a changed scope, customer delay or incomplete recording before updating future expectations.' },
      { text: 'Duration and travel models should be monitored by job class, geography, engineer context and time where data supports it. Drift can change feasibility before it appears in headline service. Recalibration uses a versioned dataset and repeats shadow comparison.' },
      { text: 'Constraint changes require operational approval. New certification, working rule or parts policy can invalidate prior options. Effective dates and regression cases ensure the solver applies the correct rule to each planning day.' },
      { text: 'Objective weights should change through evidence and management choice. A period of travel pressure may not justify permanent damage to service stability. Scenario replay shows how proposed weights would have moved outcomes, with dispatchers reviewing representative days.' },
      { text: 'Support analysis should classify failed recommendations, unavailable data, performance delay and confusing explanation. The dispatcher decides whether the fix belongs in the source data, the solver, the interface or the policy. Prompt changes alone cannot repair a hard-constraint or stale-data defect.' },
      { text: 'Authority remains recommendation until continuing evidence supports more. Any automated publication scope would need its own reversible action class, monitoring and rollback. This account makes no claim that such authority is appropriate.' },
      { text: 'Dispatcher trust should be examined by decision, not sentiment alone. The team can compare accepted options, modification cause and later outcome. A recommendation may be disliked and operationally sound, or accepted quickly because its hidden trade-off was missed.' },
      { text: 'Engineer and customer communication belong in the change model. Frequent replanning can create cognitive load and missed commitments even when the route score improves. The service should record notification and acknowledgement where a changed plan affects work already under way.' },
      { text: 'The manager running dispatch should set how often estimates, constraints, objectives and override patterns are reviewed. This turns maintenance into a managed planning process. Without it, a once-useful solver will encode an old service policy and gradually lose fit with field reality.' },
    ],
  }],
};
