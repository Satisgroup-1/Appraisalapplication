import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { gartnerAgents, jaggedFrontier, ukAdoption } from '@/lib/sources';

// Citations used only by this article. The orchestrator hoists anything that
// turns out to be shared into lib/sources.ts.
const agentBenchmark = { label: 'TheAgentCompany benchmark, Carnegie Mellon University, 2025', href: 'https://arxiv.org/abs/2412.14161' };
const crmBenchmark = { label: 'CRMArena-Pro, Salesforce AI Research, 2025', href: 'https://arxiv.org/abs/2505.18878' };
const humanAiMeta = { label: 'Vaccaro, Almaatouq and Malone, Nature Human Behaviour, 2024', href: 'https://www.nature.com/articles/s41562-024-02024-1' };

export const article: NewsEditorial = {
  title: 'Agents fail on the exceptions the workflow never defined',
  standfirst: 'Model capability varies from one task to the adjacent one, and nothing in an agent’s output marks the boundary. Fixed rules, a bounded model and a named person on exceptions put that boundary where management can see it.',
  thesis: 'Authority over live work should be granted in tiers by consequence, and only once the fixed parts of the workflow run deterministically and every known exception routes to a named person.',
  sceneLabel: 'The demonstration',
  sceneTitle: 'Between the demonstration and the live queue, one enquiry gains three complications',
  sceneParagraphs: [
    'In the demonstration the agent reads an enquiry, updates the customer record and returns a courteous reply in under a minute. The same enquiry in the live queue carries two addresses that disagree, a policy superseded by an attachment nobody re-filed, and a credit hold that finance applied on Friday and mentioned to no one. The agent takes the visible path and completes the task. The answer it sends is wrong.',
    'An experienced colleague would have stopped somewhere in the middle. That stop appears nowhere in the documented process. It comes from recognising the shape of an unusual case, knowing which person holds the missing fact, and knowing what it costs to be wrong. Software inherits the documented process. It does not inherit the stop.',
  ],
  sections: [
    {
      heading: 'Demonstrations select away the conditions that break agents',
      paragraphs: [
        { text: 'Every agent demonstration is a selected path through work that also contains unselected ones. The record is clean because a clean record was chosen. The policy is current because the demonstration was built in the week the policy changed. The task ends well because a task that ended well is the one anybody would show. None of that is dishonest. It is a poor guide to the distribution of cases a live queue produces in a week.' },
        { text: 'Benchmarks built on unselected work read differently. In TheAgentCompany, a simulated firm of 175 long-horizon professional tasks with colleagues to consult and internal systems to navigate, the strongest agent tested completed 30.3 percent of tasks outright and scored 39.3 percent when partial credit was allowed. Salesforce’s CRMArena-Pro reports a similar shape: roughly 58 percent success on single-exchange business tasks, falling to about 35 percent once the same work runs over several turns of interaction. That second benchmark also reports close to no inherent awareness of confidentiality among the agents it tested, improvable by prompting and at some cost to task performance.', sources: [agentBenchmark, crmBenchmark] },
        { text: 'UK adoption sits about where those numbers would predict. DSIT’s 2026 research found agentic AI the least used category among adopters at 7 percent, against 85 percent using text generation and natural-language tools. Gartner forecasts that more than 40 percent of agentic projects will be cancelled by the end of 2027, and the reasons it gives are managerial: escalating cost, unclear business value, weak risk controls. Model capability appears nowhere in that list.', sources: [ukAdoption, gartnerAgents] },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
    },
    {
      heading: 'Capability is jagged and its edge is unmarked',
      transition: 'A selected demonstration establishes that one path exists, which leaves open the harder matter of predicting where capability stops on work nobody selected.',
      paragraphs: [
        { text: 'Harvard Business School and BCG ran a pre-registered field experiment with 758 consultants to find out where that boundary falls. On tasks inside the reach of the model, consultants working with it completed 12.2 percent more tasks, worked 25.1 percent faster and produced results graded more than 40 percent higher in quality. Those are large effects, and they are the ones quoted in most vendor material.', sources: [jaggedFrontier] },
        { text: 'The same experiment included a task built to sit outside that reach, requiring quantitative data and interview evidence to be reconciled before any answer was possible. On that task, consultants using the model were 19 percentage points less likely to reach the correct solution than consultants working without it. Same people, same tool, same week. From the outside the task looked no harder.', sources: [jaggedFrontier] },
        { text: 'The researchers called the resulting shape a jagged frontier, and the jaggedness is the operational problem. Difficulty as a person judges it does not predict which side of the line a step falls on. A workflow arrives as a sequence of steps, none of them labelled. An agent chains those steps, so a crossing at step three is inherited by steps four and five, and what would have been a wrong sentence becomes a completed action. The fall from single-exchange to multi-turn success in the CRM benchmark is what that compounding looks like once somebody measures it.', sources: [crmBenchmark] },
        { text: 'In office work the line tends to fall on the exception. The routine case is well represented in the material the model learned from and well represented in the workflow’s own design. The exception is where the record disagrees with itself, where the policy is newer than the document that states it, where the decisive fact sits with another department and was never written down. Those cases are also the ones a process map is least likely to contain.' },
        { text: 'Hence the difficulty of catching the failure in review. An agent produces the same register, the same structure and the same apparent confidence on both sides of the frontier. Nothing in the output separates a step the model handled from a step it improvised. That separation has to come from the workflow, because it will not come from the text.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
    },
    {
      heading: 'Rebuild the fixed path, then grant authority in tiers',
      transition: 'An unmarked boundary cannot be managed by better instructions, so the workable response is to shrink the territory in which the model is required to guess.',
      paragraphs: [
        { text: 'Most business processes contain three kinds of work, and three different mechanisms should hold them. Required fields, calculations, entitlement checks, state transitions and standard notifications belong in ordinary workflow software, where they behave identically every time and can be tested once. Language and variation belong to the model, which is where its advantage is real. Every exception the first two cannot settle belongs to a named person, identified while the release is being designed.' },
        { text: 'Applied to the failed enquiry, that division does most of the work before the model is involved at all. Address validation makes the conflict visible at intake. Versioned policy means retrieval returns the text in force on the date of the enquiry. The credit hold becomes a field with a rule attached, so a promise about payment cannot be composed while it is set. The model is left with an awkwardly worded request to read and a reply to draft, which is the part it is good at.' },
        { text: 'Authority over the result should then be granted in three tiers. Drafting produces text a person sends. Recommending produces a proposed action a person approves. Acting changes a record, a commitment or a customer’s money with no further intervention. These are separate decisions with separate evidence thresholds, and consequence and reversibility set the tier. A general impression that the model has become capable is evidence for none of them.' },
        { text: 'Moving a workflow up a tier calls for a test set holding the awkward cases in something close to their real proportions: duplicate records, superseded attachments, held accounts, requests that ask two things at once. The test turns on safe completion, the effort spent correcting near-misses, and the effort spent rescuing cases the agent should have stopped on. A system that stops where it should deserves more authority than one that finishes everything.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Bounded agents can hold authority before redesign finishes',
      role: 'counterargument',
      transition: 'Granting authority by consequence delays useful work, and the objection that the delay costs more than the failures it prevents deserves its strongest statement.',
      paragraphs: [
        { text: 'The strongest case against sequencing the work this way is that the sequence never finishes. Defining a process end to end is a project most organisations have started and abandoned more than once, and part of what makes the model attractive is its tolerance of the undefined parts. Where actions are reversible, volumes are modest and the cost of a wrong output is an apology, running a bounded agent and reading what it produces is cheaper than rebuilding the workflow around it. Some firms already hold clean records and stable policy, and asking them to prove that again is waste.' },
        { text: 'That argument holds under conditions it should be made to state. The action has to be reversible. The output has to be observable. The volume has to stay inside what a reviewer can read. The reviewer has to see the source material and the reason the case was flagged. All four conditions rest on the review being real.' },
        { text: 'Review is where the argument is weakest. A meta-analysis of 106 experiments published in Nature Human Behaviour found that human and system combinations performed on average worse than the better of the human alone or the system alone, with the losses concentrated in decision tasks. Approval under volume pressure degrades into acknowledgement, and the presence of a human click carries little information by itself. Report the rate at which reviewers change something, the corrections that still reach the customer, and the effort spent on rescue.', sources: [humanAiMeta] },
      ],
    },
    {
      heading: 'Autonomy becomes a management decision once exceptions surface',
      role: 'conclusion',
      transition: 'Because early autonomy is defensible only where review is more than a click, the release decision turns on what the repaired workflow can show about its own exceptions.',
      paragraphs: [
        { text: 'Put the same enquiry back through the repaired process and the sequence changes. Validation raises the address conflict at intake. Retrieval returns the policy in force. The credit hold blocks any composed promise about payment and routes the case to the finance manager, who sees the enquiry, the hold and the draft together. A colleague noticing something odd used to be the whole control. It is now a property of the system.' },
        { text: 'From there the authority decision can be taken on evidence the organisation already holds: correct completion by risk band, material corrections made downstream, cases rescued by hand, incidents, and the age of exceptions still open. A tier should expand when those measures improve together, and the decision belongs at a scheduled review attended by the manager who works the exception queue, so that the tier moves on a record the reviewers can inspect. Where completion rises and rescue effort rises with it, the workflow has moved cost around and the tier should hold.' },
        { text: 'The agent in the demonstration needed no more ambitious instruction. It needed a process that separates an ordinary case from a consequential one, and a route for the second kind. Where an organisation cannot state that separation, its agent will make the separation on the organisation’s behalf, one live case at a time, and the first written record of the decision will be a complaint.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Task-level effects',
    title: 'One tool, one week, opposite results on adjacent tasks',
    summary: 'The first three bars index the treated group against a control group set at 100. The last bar is a percentage-point difference in correct answers, placed on the same scale for comparison.',
    interpretation: {
      establishes: 'A single model produced large gains on tasks inside its reach and a material loss of accuracy on a task outside it, among the same people in the same experiment.',
      doesNotEstablish: 'It does not locate the frontier for any other organisation, and neither effect size will transfer to a different task, population or workflow.',
      management: 'Test the specific steps of the target workflow before granting authority, and treat confident output as uninformative about which side of the frontier a step fell on.',
    },
    source: 'Dell’Acqua and others, Harvard Business School working paper 24-013, 2023',
    href: 'https://www.hbs.edu/ris/download.aspx?name=24-013.pdf',
    points: [
      { label: 'Tasks completed, inside reach', value: 112, display: '+12.2%', detail: 'Consultants working with the model completed 12.2 percent more tasks than the control group.' },
      { label: 'Speed per task, inside reach', value: 125, display: '25.1% faster', detail: 'Tasks inside the reach of the model were completed 25.1 percent more quickly.' },
      { label: 'Quality grade, inside reach', value: 140, display: 'over +40%', detail: 'Graded output quality was more than 40 percent higher than the control group.' },
      { label: 'Correct answers, outside reach', value: 81, display: '19pp lower', detail: 'On a task built to sit outside the reach of the model, consultants using it were 19 percentage points less likely to reach the correct solution.' },
    ],
  },
  {
    label: 'Unassisted completion',
    title: 'Agents finish a minority of realistic multi-step office tasks',
    summary: 'Two independent benchmarks of business work, reported side by side. The environments differ and the figures should not be combined into a single completion rate.',
    interpretation: {
      establishes: 'Current agents complete well under half of long-horizon business tasks without help, and success falls further once the work runs over several turns.',
      doesNotEstablish: 'Benchmark scores do not predict performance on one firm’s workflow, and neither study measures an agent operating inside deterministic controls.',
      management: 'Treat unattended completion as the exception at present and design the release so an unfinished case stops somewhere a person will see it.',
    },
    source: 'TheAgentCompany (Carnegie Mellon University, 2025) and CRMArena-Pro (Salesforce AI Research, 2025)',
    href: 'https://arxiv.org/abs/2412.14161',
    points: [
      { label: 'Office tasks completed outright', value: 30.3, display: '30.3%', detail: 'Best agent tested across 175 long-horizon tasks in a simulated software company.' },
      { label: 'Same tasks, partial credit', value: 39.3, display: '39.3%', detail: 'Score on the same 175 tasks when partially completed work is given credit.' },
      { label: 'CRM tasks, single exchange', value: 58, display: 'about 58%', detail: 'Reported success for leading agents on single-turn business tasks in CRMArena-Pro.' },
      { label: 'CRM tasks, multi-turn dialogue', value: 35, display: 'about 35%', detail: 'Success on the same benchmark once the task requires several turns of interaction.' },
    ],
  },
];
