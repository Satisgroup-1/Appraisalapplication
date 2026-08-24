import type { ReportSection, ReportSource } from '@/lib/reportNarrative';

export type EditorialSource = ReportSource;
export type NewsExhibitPlacement =
  | { kind: 'evidence'; view: number; afterParagraph: number }
  | { kind: 'system'; afterParagraph: number };
export type EditorialSection = ReportSection<NewsExhibitPlacement>;

export type NewsEditorial = {
  title: string;
  standfirst: string;
  thesis: string;
  sceneLabel: string;
  sceneTitle: string;
  sceneParagraphs: string[];
  sections: EditorialSection[];
};

const ukBusinessData = { label: 'UK Business Data Survey 2026', href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026' };
const ukAdoption = { label: 'DSIT AI Adoption Research 2026', href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research' };
const oecdWorkforce = { label: 'OECD, Generative AI and the SME Workforce, 2025', href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html' };
const stanfordIndex = { label: 'Stanford HAI, AI Index 2025', href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf' };
const nistGenAi = { label: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' };
const metrStudy = { label: 'METR, Experienced Developer Productivity Study, 2025', href: 'https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf' };
const jaggedFrontier = { label: 'Harvard Business School, Navigating the Jagged Technological Frontier', href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf' };
const ncscOt = { label: 'NCSC, Operational Technology guidance', href: 'https://www.ncsc.gov.uk/collection/operational-technology' };
const ncscProtocols = { label: 'NCSC, Secure OT protocols, 2026', href: 'https://www.ncsc.gov.uk/collection/operational-technology/secure-connectivity/principle-4' };
const foodStandards = { label: 'Food Standards Agency, chilling guidance', href: 'https://www.food.gov.uk/business-guidance/chilling-food-correctly-in-your-business' };
const qjeStudy = { label: 'Quarterly Journal of Economics, Generative AI at Work, 2025', href: 'https://academic.oup.com/qje/article/140/2/889/7990658' };
const lawSocietyResearch = { label: 'Law Society, Conducting legal research in the age of AI', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' };
const sraAi = { label: 'Solicitors Regulation Authority, Artificial intelligence', href: 'https://www.sra.org.uk/solicitors/resources-archived/artificial-intelligence/' };
const icoAi = { label: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' };
const openAiIronclad = { label: 'OpenAI, Ironclad customer story', href: 'https://openai.com/index/ironclad/' };
const googleRadisson = { label: 'Google Cloud, Radisson Hotel Group customer story', href: 'https://cloud.google.com/customers/radisson' };
const googleTaua = { label: 'Google Cloud, Tauá Resorts customer story', href: 'https://cloud.google.com/customers/taua-resorts' };
const microsoftSno = { label: 'Microsoft, SNÖ Hotels customer story', href: 'https://www.microsoft.com/en/customers/story/25861-sno-hotels-dynamics-365-business-central' };
const openAiBooking = { label: 'OpenAI, Booking.com customer story', href: 'https://openai.com/index/booking-com/' };

export const newsEditorial: Record<string, NewsEditorial> = {
  'ai-integration-gap': {
    title: 'The AI integration gap is now a management problem',
    standfirst: 'Access to artificial intelligence has spread faster than the operating discipline required to make it useful. Workflow design, data ownership and sustained management attention will decide whether the next wave of spending produces operating value.',
    thesis: 'The competitive divide is shifting from who can obtain an AI tool to who can connect it to a material workflow, govern its decisions and improve it with evidence.',
    sceneLabel: 'Composite management vignette',
    sceneTitle: 'The licence dashboard is green. The operating dashboard has not moved',
    sceneParagraphs: [
      'At the monthly review of a 120-person services firm, the technology dashboard looks encouraging. Most employees can use an AI assistant and weekly activity is rising. The operating dashboard is less persuasive. Customer-response time, first-time quality and work in progress look much as they did six months earlier. The chief financial officer asks where the return has gone.',
      'Employees have improved drafts, summarised calls and accelerated research. Those personal gains have left the route from enquiry to accepted outcome largely unchanged. The meeting therefore needs to identify the organisational changes that would turn individual assistance into repeatable operating performance.',
    ],
    sections: [
      {
        heading: 'Adoption is not integration',
        purpose: 'Separate the spread of AI tools from evidence of business value.',
        paragraphs: [
          { text: 'The first difficulty for the finance team is that even adoption is not one number. The UK Business Data Survey reports AI use among businesses that handle digitised data, while separate government research measures use across the wider business population. The former found 41 percent use in its survey population; the latter found 16 percent of UK businesses using at least one AI technology. Different populations, definitions and survey designs explain much of the gap.', sources: [ukBusinessData, ukAdoption] },
          { text: 'Neither figure answers the chief financial officer. A business can count an employee researching with a general assistant and another firm running an embedded workflow under the same broad heading of AI use. One records access to a capability; the other may alter how work is controlled. The distinction means adoption can be an early signal of experimentation without being evidence of economic return.' },
          { text: 'Where the usage dashboard cannot establish value, the narrower measure is the share of that activity connected to a business system and an accountable outcome.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
      },
      {
        heading: 'System-integration gap',
        transition: 'Since adoption cannot establish value, the analysis next tests whether connection to operational systems is a more useful signal.',
        purpose: 'Show why reported system integration is a more useful, but still incomplete, indicator.',
        paragraphs: [
          { text: 'That narrower question exposes a genuine gap. Among businesses in the UK Business Data Survey that already used AI, 21 percent reported that their tools were integrated with an existing business system. The rate rose from 18 percent among sole traders to 57 percent among large businesses. The result suggests that resources and digital maturity matter, although the survey definition includes relatively light forms of integration such as an assistant embedded in office software.', sources: [ukBusinessData] },
          { text: 'Formal connection remains much less common than tool use. The figure says nothing about the value achieved by the other adopters, and it cannot establish causation between integration and performance. Its practical force lies elsewhere: a connector brings inputs, permissions, business rules, exceptions and accountability into the investment decision.' },
          { text: 'That evidence changes the monthly review. Licence counts reveal activity while leaving the intended customer or operating decision undefined. Management must choose that decision before it can design the surrounding workflow.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 0 }],
      },
      {
        heading: 'Workflow authority and measurement',
        transition: 'The integration gap identifies where to look; the next question is which authority and measurement choices make that connection operational.',
        purpose: 'Explain the causal mechanism between connected software and dependable performance.',
        paragraphs: [
          { text: 'Once a material decision is selected, integration becomes less about moving data and more about allocating authority. Management must decide which record is authoritative, which fields are sufficient, which outputs may proceed without review and which exception stops the workflow. A confidence score has no operating value unless low confidence changes the route, owner or service expectation.' },
          { text: 'The strongest design usually combines ordinary software with bounded AI. Required fields, calculations and known notifications should remain deterministic. A model belongs where language or variation makes fixed rules inadequate. Source attribution and evaluation then connect interpretation back to evidence, while an accountable person retains authority over consequential exceptions.' },
          { text: 'This architecture gives the finance team something measurable: elapsed time from eligible input to accepted outcome, first-time quality, rework and exception effort. Yet it also creates cost and control obligations. A formal workflow is not always worth that burden, and the threshold should be set before the work starts.' },
        ],
        exhibits: [{ kind: 'system', afterParagraph: 1 }],
      },
      {
        heading: 'Limits of informal use',
        role: 'counterargument',
        transition: 'Formal workflow creates cost and control obligations, so the argument must test when informal assistance remains sufficient.',
        purpose: 'Test whether disciplined experimentation can succeed before full integration.',
        paragraphs: [
          { text: 'Formal integration can be disproportionate. A researcher who drafts faster or a manager who prepares a meeting more efficiently may create real value without a new system of record. OECD respondents most often identified improved employee performance as a benefit of generative AI, although the survey did not measure the size of that improvement.', sources: [oecdWorkforce] },
          { text: 'Management should not suppress these gains merely because they are difficult to aggregate. Personal tools are sensible where consequences are low, context is local and the employee can judge the output. The case for integration begins when work crosses people or systems, when the decision recurs at meaningful volume, or when failure requires an accountable response.' },
          { text: 'That boundary resolves the apparent conflict. Informal assistance can remain a useful productivity layer, while investment discipline is reserved for workflows where repeatability, traceability and scale matter. The monthly review can now ask which activities belong on each side of that boundary.' },
        ],
      },
      {
        heading: 'CFO decision threshold',
        role: 'conclusion',
        transition: 'Having separated low-risk personal use from recurring operational work, the monthly review can now set an investment threshold.',
        purpose: 'Turn the monthly licence review into a bounded workflow decision.',
        paragraphs: [
          { text: 'The chief financial officer will not find the return by examining prompts or active users more closely. The next credible unit of analysis is one eligible workflow. Management should name its owner, record its baseline, define the accepted outcome and identify the data and authority required to move work safely.' },
          { text: 'A bounded release supplies the evidence missing from the licence dashboard. Improvement in cycle time, quality or capacity must survive the inclusion of review and exception effort. Without that improvement, higher activity supports a change of scope or an end to the programme.' },
          { text: 'The original dashboard was not wrong. It was incomplete. It showed that colleagues were willing to experiment. The management task is to convert that willingness into one governed route from input to outcome, and to fund the next route only when the first has produced evidence.' },
        ],
      },
    ],
  },
  'open-weight-price-war': {
    title: 'Cheaper AI models will not make implementation cheap',
    standfirst: 'The price of machine intelligence is falling quickly, widening the range of viable experiments. But inference is only one line in the cost of dependable automation. Review, integration and operational control will decide which apparent bargains create value.',
    thesis: 'Lower model prices increase strategic choice. The decisive economic measure is the full cost of work that meets the required standard and can be accepted into operations.',
    sceneLabel: 'Composite procurement vignette',
    sceneTitle: 'The model bill falls by 90 percent and the project still misses its budget',
    sceneParagraphs: [
      'A buyer replaces an expensive model in a document-processing service with a cheaper alternative. The inference invoice falls almost exactly as promised. The next operating review is less comfortable. Exception queues are longer, quality sampling has expanded and engineers have spent several weeks reproducing a feature that existed inside the former provider.',
      'The price decline remains real; the unit of analysis was wrong. Models generate outputs, while businesses incur the full cost of producing an accepted task. Procurement needs to measure every expense between those two events.',
    ],
    sections: [
      {
        heading: 'Inference price compression',
        purpose: 'Establish the scale and limits of the historical price decline.',
        paragraphs: [
          { text: 'The fall in headline inference prices is substantial. Stanford reports that the cost of querying a model above a stated GPT-3.5-level MMLU threshold fell from about $20 per million tokens in November 2022 to $0.07 by October 2024. The comparison is historical and offers no guarantee of equivalent performance in a live workflow. Even with that caveat, it materially lowers the cost of testing.', sources: [stanfordIndex] },
          { text: 'For a smaller firm, the immediate benefit is option value. Tasks that could not justify an expensive experiment can now be benchmarked against representative documents, messages or decisions. Lower prices also make it practical to compare several model families before signing a long contract.' },
          { text: 'The procurement team in the opening scene captured this input saving correctly. Its mistake was assuming that the input represented the whole service. The cost of an accepted task also carries review, exception handling, integration and monitoring.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
      },
      {
        heading: 'Cost per accepted task',
        transition: 'Price compression changes only one cost line; the next section follows a task through the full acceptance chain.',
        purpose: 'Replace token economics with end-to-end business economics.',
        paragraphs: [
          { text: 'That wider cost chain includes retrieval, infrastructure, monitoring, review, retries, exception handling, support and the engineering required when a prompt, provider or model changes. These costs scale differently. Inference follows usage; specialist review follows error and consequence; integration and control create fixed commitments before the first task is accepted.' },
          { text: 'Cost per accepted task therefore exposes false savings. A model that costs half as much but doubles correction effort is not cheaper. A highly accurate model may also be uneconomic if its rare failures require every output to pass through an expensive specialist. The appropriate comparison holds the business outcome and acceptance standard constant.' },
          { text: 'This explains the longer queue in the procurement vignette, but it raises a sourcing question. Where operating cost dominates the model bill, an open-weight deployment transfers responsibility to the buyer at least as much as it creates control.' },
        ],
      },
      {
        heading: 'Open-weight operating burden',
        transition: 'Once accepted-task cost is visible, open weights can be assessed as an exchange between supplier expense and internal responsibility.',
        purpose: 'Explain where open-weight control is economically valuable and where it is not.',
        paragraphs: [
          { text: 'Open-weight models can improve control over data location, latency, capacity and model choice. Benchmark gaps on selected measures have also narrowed, expanding the credible set of candidates. Performance still varies by task, so parity cannot be assumed. Even so, automatic dependence on one frontier supplier now requires a stronger justification.', sources: [stanfordIndex] },
          { text: 'The control comes with obligations. Licensing, provenance, security, patching, monitoring, hardware capacity and service continuity now sit with the deployer or its infrastructure partner. NIST treats risk as a lifecycle concern because a satisfactory release can deteriorate as models, data and use patterns change.', sources: [nistGenAi] },
          { text: 'The management test should begin with a constraint. Local deployment may be justified by a data boundary, latency requirement or resilience need. Avoiding a usage fee alone is a weak reason if the organisation lacks the people to operate the resulting service. The next complication is that managed providers may offer capabilities worth paying for.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 0 }],
      },
      {
        heading: 'Rational supplier lock-in',
        role: 'counterargument',
        transition: 'Control carries its own engineering and operating cost. The next section identifies the conditions under which a managed supplier remains the sounder economic choice.',
        purpose: 'Examine what managed platforms charge a premium for.',
        paragraphs: [
          { text: 'A rigid demand for portability can itself destroy value. Managed platforms may combine strong models with retrieval, security, observability and support that would be costly to reproduce. If those services materially improve accepted-task economics, a degree of dependency can be a rational commercial choice.' },
          { text: 'The discipline is to make that dependency visible. Business rules, representative test cases and acceptance criteria should remain controlled by the buyer even when execution uses proprietary features. A stable evaluation set is more important than a universal adapter because it allows the firm to determine whether a second provider can satisfy the same business standard.' },
          { text: 'In the opening procurement case, hidden engineering effort showed that dependency had never been priced. Buyers should retain dependencies that produce a measurable advantage and calculate the cost of leaving each one before signing.' },
        ],
        exhibits: [{ kind: 'system', afterParagraph: 1 }],
      },
      {
        heading: 'Model-sourcing decision',
        role: 'conclusion',
        transition: 'The trade-off between control and managed service leads to a sourcing rule that must remain valid as model prices move.',
        purpose: 'Reframe the delayed procurement decision around accepted-task cost.',
        paragraphs: [
          { text: 'The lower invoice remains valuable when the saving finances broader benchmarks, stronger evaluation and a realistic account of review and exceptions. Procurement, technology and the workflow owner should agree one denominator: accepted tasks at the required level of quality and consequence.' },
          { text: 'The organisation can then reserve expensive capability for tasks where it changes acceptance, use smaller models where evidence supports them and choose open-weight deployment where control solves a genuine constraint. The same test can be rerun as the market moves.' },
          { text: 'The project in the opening scene missed its budget because it changed a model before understanding the service around it. Its next sourcing decision should begin with that service. Falling prices create leverage only when buyers compare complete outcomes and resist the distraction of an attractive input price.' },
        ],
      },
    ],
  },
  'automation-before-agents': {
    title: 'Before hiring an AI agent, repair the workflow',
    standfirst: 'Agent demonstrations make complicated work appear smooth. Real organisations contain missing information, conflicting policies and awkward exceptions. Autonomy amplifies those conditions unless the underlying process is made explicit first.',
    thesis: 'An agent should inherit a well-defined operating system, not be asked to invent one while handling live work.',
    sceneLabel: 'Composite operating vignette',
    sceneTitle: 'The agent completed the task exactly as instructed. The customer still received the wrong answer',
    sceneParagraphs: [
      'In the demonstration, an agent reads an enquiry, updates the customer record and prepares a response. In live operation, the record contains two addresses, the latest policy is attached to an old email and a credit hold is known only to finance. The agent follows the visible path and misses the organisation’s invisible one.',
      'A colleague would probably pause and ask. That pause contains tacit knowledge: the sign that the case is unusual, the person who understands the exception and the consequence of proceeding. The management question is how to expose enough of that knowledge before software receives authority to act.',
    ],
    sections: [
      {
        heading: 'Demonstration-to-production gap',
        purpose: 'Trace the gap between a fluent demonstration and dependable production work.',
        paragraphs: [
          { text: 'The smooth demonstration is attractive because its input is complete, its policy is consistent and its successful ending has been selected in advance. Production work is less cooperative. Customers change their minds, records conflict and exceptions cross departmental boundaries. Employees resolve these cases through informal routes that a process map may never have captured.' },
          { text: 'Current adoption data supports caution about treating agency as a mature default. In DSIT research, agentic AI was the least used technology among AI adopters at 7 percent, compared with 85 percent using natural-language or text-generation tools. Reported use reveals neither safety nor value. It does show that operational experience remains relatively limited.', sources: [ukAdoption] },
          { text: 'The failed enquiry therefore needs to be observed as work, not reconstructed as a better demonstration. Follow the case from arrival to completion and record states, evidence, decisions, waiting and ownership. The next question is which parts of that route require intelligence at all.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
      },
      {
        heading: 'Deterministic workflow repair',
        transition: 'The demonstration fails because it omits ordinary constraints, so the first design task is to repair the deterministic path.',
        purpose: 'Show how ordinary software reduces ambiguity before an agent is introduced.',
        paragraphs: [
          { text: 'That observation usually exposes work that can be removed, standardised or validated. Ordinary workflow software should handle required fields, fixed calculations, known notifications and state changes. With those controls in place, the model faces fewer occasions on which it must infer what the organisation meant.' },
          { text: 'In the customer enquiry, address validation can expose the conflict, the current policy can be versioned and the credit hold can become a controlled field. AI may still help interpret free text or prepare a response, but it no longer has to invent the process while executing it.' },
          { text: 'This combined design is less theatrical than a general agent and more dependable. Once the workflow has a stable state and explicit exceptions, management can settle the point the demonstration avoided, which is how much authority the model should receive.' },
        ],
      },
      {
        heading: 'Authority by consequence',
        transition: 'A stable workflow makes selective interpretation possible; the next decision is how much authority each interpreted output should receive.',
        purpose: 'Connect task-specific evidence to draft, recommend and act permissions.',
        paragraphs: [
          { text: 'Drafting an internal summary, recommending a route and changing a customer record are not points on one technical scale. They create different consequences and require different evidence. A practical authority model separates draft, recommend and act, then gives each level the minimum tools and permissions it needs.' },
          { text: 'Research reinforces the need for task-level evaluation. One randomised METR study found experienced open-source developers took 19 percent longer with early-2025 AI tools on familiar repositories, while other studies found substantial gains in different occupations and tasks. The combined evidence rejects any universal effect for experts. Performance has to be established inside the relevant workflow.', sources: [metrStudy, jaggedFrontier] },
          { text: 'For the enquiry, a representative test set should include duplicate addresses, outdated attachments, credit holds and ambiguous requests. Safe completion, correction and rescue effort matter together. The authority gate can then expand only when those cases show that the system understands when to proceed and when to stop.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }, { kind: 'system', afterParagraph: 2 }],
      },
      {
        heading: 'Conditions for earlier autonomy',
        role: 'counterargument',
        transition: 'Consequence-based authority is conservative by design, so the argument must examine the strongest case for moving faster.',
        purpose: 'Keep governance proportional to consequence and exception risk.',
        paragraphs: [
          { text: 'The strongest counterargument is that some organisations already have clean records, stable policies and reversible actions. Requiring a long redesign before every release would waste that maturity. A bounded agent can remove real coordination work when the tools, inputs and fallback route are already dependable.' },
          { text: 'Controls should rise with consequence. A low-consequence internal task with strong observability may move quickly from recommendation to action. A financial, regulated or customer-facing commitment requires a higher evidence threshold. Human review adds value when the reviewer sees the source, proposed action and reason the case deserves attention.' },
          { text: 'Nominal oversight can still fail at this point. Relentless review volume or weak evidence turns approval into a reflex. Useful control measures include meaningful challenges, corrections and rescue effort; the presence of a human click carries little information by itself.' },
        ],
      },
      {
        heading: 'Controlled-pause decision',
        role: 'conclusion',
        transition: 'The case for earlier autonomy survives only under narrow conditions, which now define the release decision for the failed enquiry.',
        purpose: 'Revisit the failed enquiry with explicit authority and escalation rules.',
        paragraphs: [
          { text: 'When the original enquiry returns, the repaired workflow detects the address conflict, retrieves the current policy and exposes the credit hold. The agent can prepare a response, but the case routes to the finance owner before any external commitment is made. The pause that once depended on tacit knowledge has become an explicit control.' },
          { text: 'Management can now decide whether to expand authority using observed evidence: correct completion by risk category, material corrections, manual rescue, incidents and unresolved exception age. Greater autonomy is justified only when it improves the whole route without weakening recovery.' },
          { text: 'The agent did not need a more ambitious instruction. It needed an operating system that distinguished a normal case from a consequential exception. Repairing that system first turns autonomy from a product setting into a management decision.' },
        ],
      },
    ],
  },
  'cold-chain-collaboration': {
    title: 'Cold-chain operating value begins with accountable response',
    standfirst: 'Temperature-controlled operations already produce abundant readings. The harder problem is turning a material change into timely, accountable action while keeping the physical infrastructure and human evidence visible.',
    thesis: 'A credible cold-chain service must connect signal quality, operating context, response ownership and corrective evidence in one traceable exception case.',
    sceneLabel: 'Composite operating vignette',
    sceneTitle: 'A temperature excursion lasts eight minutes. The commercial consequence could last much longer',
    sceneParagraphs: [
      'An overnight operator sees a threshold breach. The number alone cannot explain whether a loading door opened, a unit entered defrost, a probe lost calibration or sensitive product faced a genuine excursion. Several systems hold fragments of the answer, while the response expectation depends on severity that has not yet been established.',
      'The decision clock starts before the evidence has assembled itself. The proposed collaboration creates value by building a trustworthy path from physical signal to owned response and recorded recovery; another alert would add little.',
    ],
    sections: [
      {
        heading: 'Contextual value of telemetry',
        purpose: 'Distinguish raw telemetry from an operational fact.',
        paragraphs: [
          { text: 'The same temperature can represent routine loading, a defrost cycle, a failing unit or a product risk. Duration, asset state, product, location and recent activity change the interpretation. A system that applies a threshold without this context increases alert volume while leaving the operator’s underlying question unanswered.' },
          { text: 'The proposed evidence model therefore combines the reading and duration with asset state, product context and operator observation. The relative weights in the graphic are modelled design priorities, not measured contributions to food safety or commercial performance.' },
          { text: 'For the eight-minute event, context is the difference between immediate escalation and documented observation. Yet context is useful only if the underlying signal can be trusted. The next step is to test the physical and digital path that produced it.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
      },
      {
        heading: 'Signal-quality controls',
        transition: 'Context can change the meaning of an excursion only if the underlying signal is reliable enough to support interpretation.',
        purpose: 'Anchor the software argument in sensors, networks and secure architecture.',
        paragraphs: [
          { text: 'Missing heartbeats, implausible jumps and uncertain calibration should be visible as data exceptions. Quietly filling a gap or presenting a weak reading with false precision makes the operating risk harder to see. Discovery must therefore document sensor placement, calibration, gateways, connectivity and known blind spots before automated classification is trusted.' },
          { text: 'NCSC guidance supports maintaining a definitive view of operational technology and validating data at trust boundaries. It also supports architectural separation when information moves from operational equipment into analytical services. These controls reduce the chance that monitoring creates an unnecessary route back into equipment.', sources: [ncscOt, ncscProtocols] },
          { text: 'In the overnight event, signal validation determines whether the queue contains a product case or an instrumentation case. Once that distinction is explicit, the service can turn the event into something an operator can own and close.' },
        ],
      },
      {
        heading: 'Exception-case operating model',
        transition: 'Validation clarifies the signal yet leaves ownership unresolved. The next section shows how context and responsibility turn that signal into an exception case.',
        purpose: 'Explain how evidence becomes accountable action and closure.',
        paragraphs: [
          { text: 'An alert records that a rule fired. An exception case assembles the validated signal, duration, operating context, applicable policy, assigned owner, corrective action and evidence of recovery. Missing information remains visible. The reviewer receives a decision object with enough context to act.' },
          { text: 'Every stage is necessary. Equal weighting in the control graphic denotes dependency and carries no claim about economic contribution. Validation without ownership leaves work unassigned; ownership without closure leaves the assurance record incomplete. Food-safety guidance likewise connects monitoring with effective corrective action while leaving responsibility with the operator.', sources: [foodStandards] },
          { text: 'For the eight-minute excursion, closure might record a loading event, stable subsequent readings and the operator’s inspection. Repeated cases can then reveal equipment or policy patterns. Before adopting this model, however, management should consider whether the additional structure risks overengineering routine monitoring.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }, { kind: 'system', afterParagraph: 1 }],
      },
      {
        heading: 'Monitoring without intervention',
        role: 'counterargument',
        transition: 'The exception case improves accountability, but the control case must still distinguish observation from equipment intervention.',
        purpose: 'Balance operational response, compliance evidence and analytical reuse.',
        paragraphs: [
          { text: 'Cold-chain data can create value without changing an immediate operating decision. Routine records support assurance, trend analysis, maintenance and retrospective investigation. A service that forces every minor movement into an elaborate case could increase workload and distract from material events.' },
          { text: 'The design should therefore distinguish routine evidence from qualifying exceptions. Continuous records can remain available for reporting and analysis, while a case is created only when signal quality, duration and context meet an agreed policy. Historical replay can test that policy before live escalation.' },
          { text: 'This narrower claim is stronger than saying data is useful only when it changes a decision. The collaboration should be judged by whether it improves attention and evidence where action is required without making ordinary monitoring harder.' },
        ],
      },
      {
        heading: 'Parallel-pilot decision',
        role: 'conclusion',
        transition: 'Once monitoring is separated from control, a parallel pilot becomes the appropriate test of attention quality and missed-event risk.',
        purpose: 'Carry the 02:13 excursion from detection to verified closure.',
        paragraphs: [
          { text: 'The eight-minute event should be replayed through the proposed service. The pilot would test whether the signal is validated correctly, whether the context changes severity, whether the right owner receives the case and whether closure preserves enough evidence for later review.' },
          { text: 'Management should compare the service with current practice using signal coverage, alert precision, unassigned exception age, response time, closure completeness and reporting effort. The proposed targets remain hypotheses until representative live and historical cases have been observed.' },
          { text: 'A successful pilot would not transfer responsibility to software. It would give the operator a faster, more reliable account of what happened and what still needs to be decided. That is the operating value the original alert could not provide on its own.' },
        ],
      },
    ],
  },
  'small-teams-ai-advantage': {
    title: 'Management speed can give smaller firms an AI advantage',
    standfirst: 'SMEs rarely possess the largest technology budgets or datasets. They may nevertheless move faster because operational knowledge, customer context and decision authority sit closer together. That advantage survives only if leadership concentrates its attention.',
    thesis: 'Short decision lines can produce faster AI learning, but only when a smaller firm concentrates on one material workflow and converts each release into reusable capability.',
    sceneLabel: 'Composite SME vignette',
    sceneTitle: 'Five people around one table can resolve a question that takes five committees elsewhere',
    sceneParagraphs: [
      'A customer-service lead describes a recurring exception. The managing director understands its commercial cost, the operations manager owns the process and the technical specialist can test a change that afternoon. Nobody needs to translate the problem through several layers before a decision is made.',
      'Proximity can shorten decisions, although the same firm may lack clean data, spare management capacity and specialist engineering. The meeting matters when it concentrates those scarce resources on a question capable of producing operating evidence.',
    ],
    sections: [
      {
        heading: 'Management proximity hypothesis',
        purpose: 'State the managerial advantage without presenting it as an empirical fact.',
        paragraphs: [
          { text: 'A smaller firm can place the process expert, user, sponsor and builder in one decision loop. That arrangement may reduce translation loss and shorten the interval between observing an exception and testing a change. This interpretation comes from operating logic; the adoption surveys cited here neither confirm nor refute it.' },
          { text: 'Large organisations retain important advantages: capital, specialist teams, data, procurement leverage and formal controls. Smaller firms compete when leadership proximity produces faster, better decisions and those decisions remain supported by evidence.' },
          { text: 'The group in the opening scene therefore needs more than permission to experiment. It needs to know whether AI is already producing measurable benefits in comparable firms and what those findings do, and do not, imply for its own workflow.' },
        ],
      },
      {
        heading: 'SME adoption evidence',
        transition: 'Management proximity is only a hypothesis; adoption and workforce data indicate how much real opportunity it may contain.',
        purpose: 'Use the strongest SME evidence to define the opportunity and its limits.',
        paragraphs: [
          { text: 'An OECD survey across seven countries found generative AI in use at 31 percent of SMEs. Among users, 65 percent reported improved employee performance and 39 percent of those with a recent skills gap said the technology helped compensate. At the same time, 83 percent reported no change in overall staffing need. These are reported experiences, not measured productivity magnitudes.', sources: [oecdWorkforce] },
          { text: 'The evidence shows that smaller firms can access AI and often perceive it as useful. It offers no basis for claims that they outperform large firms, that jobs will disappear or that a particular workflow will produce a positive return. Management can use the findings to justify a focused test, with no presumption about its result.' },
          { text: 'For the five-person group, the practical agenda is augmentation tied to a visible constraint. Better preparation, interpretation or coordination should release capacity or improve quality in one recurring part of the work.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
      },
      {
        heading: 'Focused workflow advantage',
        transition: 'Broad adoption data cannot prove advantage for one firm, so the next section defines the focused workflow test that can.',
        purpose: 'Explain why portfolio concentration is the mechanism behind the thesis.',
        paragraphs: [
          { text: 'A broad tool rollout distributes attention across functions and produces little shared learning. A focused portfolio begins with one constraint that is frequent, material and measurable. Leadership must also state what will not be pursued, because every additional pilot competes for the same process expertise, data ownership and review capacity.' },
          { text: 'UK research reinforces the readiness problem. Just over half of current AI users said they felt ready to scale, while roughly one third of prospective adopters felt ready to implement. These figures leave delivery design open while showing that access to tools has moved faster than organisational confidence.', sources: [ukAdoption] },
          { text: 'The opening group should therefore define an outcome, create a baseline and release the smallest complete workflow that can test it. A short decision line is useful only when each decision leaves evidence for the next one.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }, { kind: 'system', afterParagraph: 2 }],
      },
      {
        heading: 'Capacity and governance constraints',
        role: 'counterargument',
        transition: 'A focused workflow may exploit proximity, but the analysis must account for scarce capacity, weak controls and concentration risk.',
        purpose: 'Test the thesis against the strongest constraints facing smaller firms.',
        paragraphs: [
          { text: 'Scale still confers protection. Smaller firms often have weaker data, fewer specialist reviewers and little redundancy when one person becomes a bottleneck. Close customer knowledge may remain in memory, and rapid changes can bypass privacy, security or acceptance decisions that a larger organisation is forced to formalise.' },
          { text: 'A smaller firm needs a minimum set of owners before build: a sponsor for the result, a process owner for the work, a data owner for permitted context and a technical owner for the service. This provides accountability without importing enterprise bureaucracy. Each release should end with an expand, adjust, hold or stop decision.' },
          { text: 'A pilot that sends every exception to the same technical specialist concentrates operational risk and creates little leverage. Reusable evaluation cases, access patterns, logging and training belong in the first release because they determine whether the work can survive ordinary operations.' },
        ],
      },
      {
        heading: 'Repeatable decision cell',
        role: 'conclusion',
        transition: 'Capacity and governance constraints narrow the claim. Any durable advantage must appear in a repeatable operating process that converts proximity into disciplined decisions.',
        purpose: 'Convert the five-person meeting into an owned operating experiment.',
        paragraphs: [
          { text: 'The five people around the table should leave with one selected workflow, one accountable outcome and one not-now list. They should agree the evidence required for a bounded release and the conditions that would stop it. That is a more defensible advantage than merely being able to approve software quickly.' },
          { text: 'If the release improves the outcome, its evaluation cases, data decisions, controls and operating lessons should be reused. If it fails, the same decision process should redirect attention without defending sunk cost. Learning speed includes the ability to stop.' },
          { text: 'A short organisation chart creates no value on its own. Advantage appears when proximity produces a dense cycle of evidence and decision, supported by delivery routines that can be repeated. The meeting in the opening scene matters only if that discipline survives after everyone leaves the room.' },
        ],
      },
    ],
  },
  'measure-automation-value': {
    title: 'Automation value is easy to calculate and hard to realise',
    standfirst: 'Multiplying theoretical minutes saved by salary produces an attractive number and a weak business case. Credible value measurement begins with a counterfactual, includes exception effort and distinguishes released capacity from cash.',
    thesis: 'Automation should be judged through a transparent benefits ledger that connects operating change to financial consequence and records the confidence behind each claim.',
    sceneLabel: 'Composite investment-review vignette',
    sceneTitle: 'The programme reports 100 hours saved. Finance cannot find a single pound',
    sceneParagraphs: [
      'The calculation is familiar. A task once took ten minutes, the new workflow takes five and monthly volume is 1,200. The programme reports 100 hours saved and multiplies the result by salary. The number is precise, positive and disconnected from what happened next.',
      'Employees may have used only part of the system, reviewed difficult outputs or spent the released time on activity whose contribution was never measured. Cost did not leave the budget and capacity was not deliberately redeployed. The technology may still be valuable, but the financial claim has moved ahead of the evidence.',
    ],
    sections: [
      {
        heading: 'Counterfactual benefit baseline',
        purpose: 'Establish the operating baseline against which change can be judged.',
        paragraphs: [
          { text: 'The first question for the investment committee is what would have happened without the release. A representative baseline should cover eligible volume, elapsed time, hands-on effort, error, rework and service. One difficult week can flatter the project; staff estimates alone can create precision without a dependable denominator.' },
          { text: 'Where data is weak, the correct response is not to invent a stronger baseline. Management should record the uncertainty, identify the measures the pilot can improve and state the range of outcomes consistent with current knowledge.' },
          { text: 'The 100-hour claim assumes full adoption, stable demand and no new work. Testing those assumptions establishes how much of the theoretical saving remains available for the business to use.' },
        ],
      },
      {
        heading: 'Gross-to-net value bridge',
        transition: 'A credible counterfactual establishes gross change; the next section traces how that change is reduced before reaching economic value.',
        purpose: 'Trace the conversion from theoretical saving to operating and financial consequence.',
        paragraphs: [
          { text: 'The value bridge begins with eligible volume actually completed through the new process. Review, exception handling, support and workarounds reduce gross time released. The remainder is capacity, not cash. It becomes financial value only when cost is removed or avoided, or when the capacity is deliberately redirected to work with a measured contribution.' },
          { text: 'The graphic illustrates that logic using 100 theoretical hours. Every deduction is an assumption, so the result carries no predictive claim about another project or a 20 percent conversion into cash. Its value lies in separating the stages that management must record in the ledger.' },
          { text: 'In the opening case, finance could not find the saving because nobody owned the movement from released time to budget or output. Before assigning an owner, however, the committee must ask whether the original productivity assumption is credible for the target work.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
      },
      {
        heading: 'Workflow-specific productivity evidence',
        transition: 'The gross-to-net bridge depends on local assumptions, so external productivity evidence must be tested for transferability.',
        purpose: 'Use conflicting field evidence to reject imported benefit percentages.',
        paragraphs: [
          { text: 'A large field study of customer-support agents found AI assistance increased issues resolved per hour by about 15 percent on average, with substantial differences between workers. A separate randomised study found experienced open-source developers took 19 percent longer with early-2025 tools on familiar repositories. The occupations, systems and research designs differ, so the figures should not be averaged or treated as competing model scores.', sources: [qjeStudy, metrStudy] },
          { text: 'Taken together, the studies show wide variation. AI can accelerate a well-matched workflow and impede work where context, verification or interruption overwhelms the assistance. No imported study supplies the expected return for the programme in the opening scene; its own operating environment must provide that evidence.' },
          { text: 'The committee should therefore replace the borrowed productivity percentage with observed eligible volume, accepted output, net effort and correction demand. Yet a narrow focus on cash could still miss legitimate reasons to invest.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
      },
      {
        heading: 'Non-cash value conversion',
        role: 'counterargument',
        transition: 'Conflicting productivity studies weaken imported savings claims. They also direct attention to value that may convert through quality, capacity or risk.',
        purpose: 'Recognise quality, capacity and risk without blurring the value ledger.',
        paragraphs: [
          { text: 'Quality, service, resilience and risk can matter even when headcount or budget does not change. Faster response may improve conversion; fewer errors may reduce remediation; stronger evidence may lower the probability or consequence of control failure. Rejecting these effects because they are not immediate cash would produce an artificially narrow investment case.' },
          { text: 'Benefit types need separate treatment. DSIT found 56 percent of current AI users reporting higher employee productivity while 77 percent reported no revenue change. The self-reported findings leave the value of that productivity unresolved. They still show why an operating improvement and a financial result belong to different points in the causal chain.', sources: [ukAdoption] },
          { text: 'Each material benefit needs a mechanism, an owner and disconfirming evidence. A service claim should identify the customer measure expected to move. A risk claim should identify the exposure and control. Management can then value the benefit without disguising it as salary removed.' },
        ],
        exhibits: [{ kind: 'system', afterParagraph: 2 }],
      },
      {
        heading: 'Investment continuation threshold',
        role: 'conclusion',
        transition: 'Once cash and non-cash benefits share an explicit causal chain, the benefits ledger can support a continuation decision.',
        purpose: 'Give the finance director an evidence-based continuation decision.',
        paragraphs: [
          { text: 'The programme’s 100 hours should be restated as a hypothesis. Finance and the process owner should review the baseline, eligible adoption, net effort, quality, service and the named destination of any released capacity. Confidence should rise only as observed evidence replaces assumptions.' },
          { text: 'The review should conclude with one of four decisions: expand where the causal chain is working, adjust where a bottleneck is visible, hold where observation is insufficient, or stop where the result no longer justifies the operating cost. Measurement is worth its cost when it changes that choice.' },
          { text: 'Finance could not find a pound because the original calculation ended at the automated task. A credible case follows the effect until it reaches an operating or financial consequence, then states honestly what remains unproven. A range supported by that chain is stronger than a precise saving that exists only on a slide.' },
        ],
      },
    ],
  },
  'legal-ai-source-grounded-work': {
    title: 'Legal AI is trusted one proposition at a time',
    standfirst: 'Legal research and drafting can move faster without relaxing professional standards. The operating design must keep each proposition inside the matter boundary, attach it to valid authority and preserve a visible route to professional acceptance.',
    thesis: 'A legal AI service becomes decision-useful when every material proposition is linked to an approved source, checked for jurisdiction and date, protected by matter-level access and accepted by an accountable legal professional.',
    sceneLabel: 'Composite legal-operating vignette',
    sceneTitle: 'The citation exists. It does not answer the matter',
    sceneParagraphs: [
      'A solicitor reviews a polished note prepared for an urgent client call. One citation leads to a genuine decision, but the passage concerns a different legal test. Another authority predates a material change. The draft reads confidently and has saved no time because the reviewer must reconstruct its research route.',
      'This composite scene presents no real firm or client. It follows one proposition through matter scoping, retrieval, citation verification and sign-off to identify where assistance can shorten work without disguising uncertainty.',
    ],
    sections: [
      {
        heading: 'Proposition-level evidence',
        purpose: 'Define the unit of legal work that the system must support and the reviewer must accept.',
        paragraphs: [
          { text: 'The draft failed at proposition level. A document can look coherent while individual claims rest on weak, irrelevant or outdated authority. Law Society guidance directs practitioners to verify generated legal material and citations, which places source inspection inside the operating route and ahead of release.', sources: [lawSocietyResearch] },
          { text: 'Each material proposition needs a record of the question asked, the source passage retrieved, the authority and court or issuer, its effective date, jurisdiction and the model or workflow version that used it. The reviewer should see that record beside the draft. A bibliography at the end cannot show which authority supports which sentence.' },
          { text: 'The opening note therefore becomes a set of reviewable claims. That change improves diagnosis: an unsupported proposition can be rejected without discarding useful work elsewhere, and evaluation can distinguish fabricated authority, weak support, stale law and material omission.' },
          { text: 'Once the unit is defined, the next issue is the boundary around the evidence that a model may retrieve.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
      },
      {
        heading: 'Matter and source boundaries',
        transition: 'Proposition-level review exposes the evidence requirement; matter and source boundaries determine which evidence may enter the draft.',
        purpose: 'Specify authoritative sources, matter scope, access and temporal validity.',
        paragraphs: [
          { text: 'A matter workspace should begin with an authorised source manifest. It identifies matter documents, approved internal knowledge and external legal sources, then records the jurisdiction, effective period and access rules attached to each collection. Retrieval runs against that manifest, not an unrestricted pool assembled for convenience.' },
          { text: 'Matter scoping has a confidentiality function and an analytical function. It reduces cross-client disclosure risk while preventing facts or conclusions from another file from entering the answer. Access control must be enforced before retrieval and repeated when a source is opened, exported or cited. Logs should record the identity and purpose associated with each request.' },
          { text: 'Temporal validity requires more than document date. A source may have been superseded, amended, appealed or limited. The system can propose a validity flag from metadata and citator services, but professional review decides whether the authority remains applicable to the question.' },
          { text: 'ICO guidance makes data protection a lifecycle obligation, while SRA material places technology use within existing professional duties. Together they require the service owner to document purpose, data flow, supervision and incident response before scaling access.', sources: [icoAi, sraAi] },
        ],
      },
      {
        heading: 'Controlled research architecture',
        transition: 'The approved evidence boundary now allows the architecture to separate fixed controls from model-assisted interpretation.',
        purpose: 'Explain retrieval, provenance, drafting, verification and professional decision rights.',
        paragraphs: [
          { text: 'The architecture begins with authenticated matter access and a source index that retains passage-level provenance. Retrieval returns candidate material under jurisdiction and date filters. A model may compare, summarise or draft from those candidates, but the generated text carries identifiers back to the passages used.' },
          { text: 'A citation verifier then tests whether every cited source exists in the approved index and whether the quoted or paraphrased passage supports the associated proposition. This check is narrower than legal judgement. It can detect missing links or textual mismatch; it cannot decide the weight of competing authority or the answer to an unsettled question.' },
          { text: 'Deterministic gates control matter access, source eligibility, required metadata and release permissions. Model assistance handles language, comparison and issue spotting within that envelope. The professional sees original evidence, generated proposition, counterauthority and open questions before accepting the work.' },
          { text: 'The system diagram locates responsibility: software preserves provenance and tests formal conditions; the lawyer determines legal relevance, weight and advice. That boundary must survive time pressure, batch processing and downstream reuse.' },
        ],
        exhibits: [{ kind: 'system', afterParagraph: 2 }],
      },
      {
        heading: 'Evaluation and economics',
        transition: 'Architecture can preserve the route to evidence, but release depends on measured performance and the full cost of professional review.',
        purpose: 'Design evaluation sets, failure analysis and a task-level economic test.',
        paragraphs: [
          { text: 'A representative evaluation set should contain ordinary research questions, ambiguous instructions, outdated sources, similar cases from another jurisdiction, conflicting authorities and prompts that attempt to cross matter boundaries. Legal reviewers label the required propositions, acceptable authorities, material omissions and reasons for rejection.' },
          { text: 'The service should report proposition support, citation validity, material omission, confidentiality breach, correction category and professional review time. A single accuracy score would conceal the difference between a stylistic correction and a false authority. Release thresholds should be stricter where an error is harder to detect or more consequential.' },
          { text: 'Vendor stories show that bounded legal tasks can compress. OpenAI reports that Ironclad reduced one contract-review activity from about forty minutes to two in its implementation. That customer-reported figure concerns a specified workflow and supplier context. It neither forecasts research productivity nor changes the professional acceptance standard.', sources: [openAiIronclad] },
          { text: 'Economics should therefore use accepted propositions or completed matter tasks as the denominator. Retrieval, licences, data preparation, reviewer time, corrections, incidents and knowledge maintenance belong in the cost. The evidence view presents proposed release dimensions, not observed firm performance.' },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 3 }],
      },
      {
        heading: 'Professional scepticism at scale',
        role: 'counterargument',
        transition: 'Evaluation can show acceptable average performance; the strongest objection concerns how routine use changes professional attention.',
        purpose: 'Address automation bias, verification burden and the possibility that assistance creates little net benefit.',
        paragraphs: [
          { text: 'A source-grounded interface can make weak work look safer. Visible citations may encourage reviewers to inspect fewer sources, and a high rate of plausible outputs can reduce vigilance before a rare consequential error. Detailed provenance also adds interface and maintenance cost.' },
          { text: 'Some matters will remain faster with direct professional research, especially where the question is novel, the source set is small or authority turns on subtle procedural history. A service should permit a direct-research route and should not treat low automated usage as failure when the matter does not fit the evaluated scope.' },
          { text: 'The control response combines blind evaluation, sampled secondary review, error analysis by consequence and monitoring of inspection behaviour. If reviewers stop opening primary sources or correction time offsets drafting gains, the service has failed its purpose even when formal citation checks pass.' },
          { text: 'This objection narrows the recommendation. Assistance should expand by matter type and proposition class only after evidence shows that professional scepticism remains active.' },
        ],
      },
      {
        heading: 'Matter-scoped release decision',
        role: 'conclusion',
        transition: 'The risk of false reassurance makes the release boundary a professional operating decision, not a software availability decision.',
        purpose: 'Resolve the opening note through an auditable, matter-scoped acceptance route.',
        paragraphs: [
          { text: 'The solicitor in the opening scene should be able to select each proposition, open the supporting passage, see jurisdiction and date, inspect counterauthority and record acceptance or rejection. A proposition without that route remains a drafting suggestion and cannot enter accepted work.' },
          { text: 'The first release should cover one matter type, one approved source hierarchy and a defined set of professional users. It should stop on uncertain identity, inaccessible source, failed validity check or material evaluation regression. Expansion depends on support, omission, review-effort and confidentiality evidence from live supervised use.' },
          { text: 'Fluent output and a long reference list do not make legal AI trustworthy. It takes a bounded place in practice when evidence stays visible, professional authority stays attributable and the system makes weak support easier to detect.' },
        ],
      },
    ],
  },
  'hospitality-ai-guest-recovery': {
    title: 'Guest recovery begins with a shared operating state',
    standfirst: 'A disrupted stay becomes harder when reservation, property, loyalty and maintenance systems tell different versions of the same journey. AI can help staff explain and coordinate recovery after identity, entitlement and authority are reconciled.',
    thesis: 'A dependable guest-recovery service must reconcile guest identity, booking entitlement and live property state, then route feasible remedies through explicit compensation and escalation authority.',
    sceneLabel: 'Composite hospitality-operating vignette',
    sceneTitle: 'The guest has a confirmation and the room cannot be occupied',
    sceneParagraphs: [
      'After a delayed journey, a guest arrives with a valid confirmation. The property-management system shows the room assigned, a maintenance note marks it unavailable and the loyalty profile appears under a second email address. The front-desk colleague must resolve the stay while checking facts across several screens and waiting for authority to offer an alternative.',
      'This composite scene describes no real property or guest. It follows one disruption from identification to closure to show where connected records, controlled automation and human judgement can shorten recovery.',
    ],
    sections: [
      {
        heading: 'Recovery case formation',
        purpose: 'Turn the disrupted arrival into one owned item with a current operating state.',
        paragraphs: [
          { text: 'The confirmation proves a reservation, while leaving the feasible remedy unresolved. The colleague needs to know who the guest is, what was promised, which room and service alternatives exist now, what the policy permits and who can approve an exception.' },
          { text: 'A recovery case should therefore preserve guest and booking identifiers, promised product, disruption type, live property state, entitlement, proposed options, owner, customer communications and closure evidence. Every source retains its timestamp because availability and maintenance facts can change during the conversation.' },
          { text: 'The first evidence graphic treats all five record groups as required. Equal values express dependency and carry no measured contribution to satisfaction, speed or cost. A complete record will not guarantee a good recovery, but a missing identity or property state can make the proposed remedy invalid.' },
          { text: 'The scene now has a unit of work. The next problem is reconciling multiple identifiers without joining the wrong guest or booking.' },
        ],
        exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 2 }],
      },
      {
        heading: 'Identity and entitlement',
        transition: 'Once the recovery case is defined, identity resolution determines which promises and permissions legitimately belong inside it.',
        purpose: 'Explain matching confidence, privacy boundaries and entitlement calculation.',
        paragraphs: [
          { text: 'A guest may appear under a booking reference, channel identifier, loyalty number, email and telephone number. Exact matches can be deterministic. Probabilistic matches need confidence, visible evidence and manual review. The system should never silently merge profiles because an incorrect match can expose personal data and apply another guest’s preferences or entitlement.' },
          { text: 'Entitlement derives from the booked product, rate conditions, loyalty status, disruption and approved service policy. These inputs should be versioned and reviewable. A model may explain the result in natural language; it should not invent a benefit or reinterpret a failed eligibility rule.' },
          { text: 'Purpose limitation matters when CRM history or inferred preferences enter the case. ICO guidance requires lawful and accountable processing across the lifecycle. The recovery owner needs only information that helps resolve the current service failure, with retention and access aligned to that purpose.', sources: [icoAi] },
          { text: 'Identity and entitlement establish what may be offered. Live property state determines what can actually be delivered.' },
        ],
      },
      {
        heading: 'Property state and remedy options',
        transition: 'Entitlement sets the permitted remedy space; current operational state narrows it to options the property can fulfil.',
        purpose: 'Connect reservation, property, housekeeping and maintenance records to feasible recovery.',
        paragraphs: [
          { text: 'Reservation systems describe sold inventory and booking commitments. The property-management system carries room assignment and stay state. Housekeeping and maintenance records can make nominal inventory unavailable. Recovery logic must reconcile timestamps and source authority across those systems before proposing a room move, upgrade, external relocation or service credit.' },
          { text: 'The architecture uses connectors to form a read model for the recovery case. It does not replace source systems. Each option records the facts and policy version used, its capacity reservation and any dependency such as transport or manager approval. A stale connector places the option on hold.' },
          { text: 'First-party customer stories from Radisson, Tauá Resorts and SNÖ Hotels describe programmes built around more connected data and operating systems. They illustrate the feasibility of shared records in specific estates. The accounts do not establish a guest-recovery result for another group.', sources: [googleRadisson, googleTaua, microsoftSno] },
          { text: 'The system diagram shows where data converges and where authority remains. The colleague chooses among feasible options within policy, while a manager handles exceptions above the delegated limit.' },
        ],
        exhibits: [{ kind: 'system', afterParagraph: 3 }],
      },
      {
        heading: 'Authority and recovery economics',
        transition: 'Feasible options still require a controlled decision, so the operating design must connect service judgement with compensation authority and measurement.',
        purpose: 'Define delegated limits, escalation, closure and economic evidence.',
        paragraphs: [
          { text: 'Compensation policy should define bands by disruption, entitlement and local operating context. Front-desk colleagues need enough authority to resolve common cases during the interaction. Higher-cost, unusual or sensitive remedies move to a named approver with the same evidence view.' },
          { text: 'A language model can draft a clear explanation from approved facts and remedies. The owner confirms tone, accuracy and commitment before sending. Accepted communications become events in the recovery history so another colleague can continue without asking the guest to repeat the story.' },
          { text: 'Measurement begins with acknowledgement time, time to feasible option, handoffs, repeat contacts, policy adherence, compensation by band and closure completeness. Guest feedback and future behaviour may add outcome evidence, with careful treatment of attribution and privacy. The second evidence view is a measurement architecture, not a predicted uplift.' },
          { text: 'Booking.com describes AI use across travel planning and service contexts. Its first-party account shows the breadth of channel coordination at scale while supplying no forecast for the property-level recovery measures proposed here.', sources: [openAiBooking] },
        ],
        exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 2 }],
      },
      {
        heading: 'Human service can outrun integration',
        role: 'counterargument',
        transition: 'A controlled service can make evidence and authority clearer, but the strongest objection is that hospitality recovery depends on human discretion under local conditions.',
        purpose: 'Test whether integration cost and scripted decision routes could impede recovery.',
        paragraphs: [
          { text: 'An experienced colleague can often resolve disruption through local knowledge and discretion faster than a new system can reconcile imperfect records. A rigid workflow may narrow empathy, delay a simple gesture or turn policy into a ceiling when an unusual situation warrants generosity.' },
          { text: 'Integration can also create a fragile dependency. A central case that waits for every connector may be slower than direct inspection, and centralised identity increases privacy and security consequence. The right fallback is an explicit manual route with delegated authority, later reconciliation and no requirement to wait for generated text.' },
          { text: 'The service belongs on recurring cross-system failures where reconstruction and approval delay are material. It should stay out of a straightforward conversation that one colleague can resolve safely. Override reasons become evidence about where policy, data or interface design is too restrictive.' },
          { text: 'This counterargument keeps the release focused on coordination. It does not ask software to substitute for judgement or care.' },
        ],
      },
      {
        heading: 'Recovery release threshold',
        role: 'conclusion',
        transition: 'The value of local discretion defines the release test: connected evidence must improve coordination while preserving the colleague’s ability to act.',
        purpose: 'Resolve the disrupted arrival and state the evidence required for wider use.',
        paragraphs: [
          { text: 'For the guest in the opening scene, the service should reconcile identity, confirm the booking promise, surface the maintenance conflict, reserve a feasible alternative and show the colleague’s authority before a commitment is made. Uncertain identity, stale property state or an out-of-band remedy triggers review.' },
          { text: 'A pilot should cover one disruption type at a small group of properties and run beside current escalation. Release requires fewer reconstructive handoffs, controlled policy exceptions, reliable connector health, no material privacy incident and staff evidence that the case helps them resolve the guest’s problem.' },
          { text: 'The guest should experience one accountable conversation, not the architecture behind it. Connected systems matter when they give the colleague accurate options and authority at the moment recovery is still possible.' },
        ],
      },
    ],
  },
};
