import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { jaggedFrontier, metrStudy, ukAdoption } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Agents fail on the exceptions the workflow never defined',
  standfirst: 'Agent demonstrations make complicated work appear smooth. Real organisations contain missing information, conflicting policies and awkward exceptions. Autonomy amplifies those conditions unless the underlying process is made explicit first.',
  thesis: 'An agent should inherit a well-defined operating system. Asking it to invent one while handling live work is where these deployments fail.',
  sceneLabel: 'The situation',
  sceneTitle: 'The agent completed the task exactly as instructed. The customer still received the wrong answer',
  sceneParagraphs: [
    'In the demonstration, an agent reads an enquiry, updates the customer record and prepares a response. In live operation, the record contains two addresses, the latest policy is attached to an old email and a credit hold is known only to finance. The agent follows the visible path and misses the organisation’s invisible one.',
    'A colleague would probably pause and ask. That pause contains tacit knowledge: the sign that the case is unusual, the person who understands the exception and the consequence of proceeding. The management question is how to expose enough of that knowledge before software receives authority to act.',
  ],
  sections: [
    {
      heading: 'Demonstration-to-production gap',
      paragraphs: [
        { text: 'The smooth demonstration is attractive because its input is complete, its policy is consistent and its successful ending has been selected in advance. Production work is less cooperative. Customers change their minds, records conflict and exceptions cross departmental boundaries. Employees resolve these cases through informal routes that a process map may never have captured.' },
        { text: 'Current adoption data supports caution about treating agency as a mature default. In DSIT research, agentic AI was the least used technology among AI adopters at 7 percent, compared with 85 percent using natural-language or text-generation tools. Reported use reveals neither safety nor value. It does show that operational experience remains relatively limited.', sources: [ukAdoption] },
        { text: 'The failed enquiry therefore needs to be observed as work. Reconstructing it as a better demonstration teaches nothing. Follow the case from arrival to completion and record the states it passes through, the evidence used, the decisions taken, the waiting between them and who acts at each step. The next question is which parts of that route require intelligence at all.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
    },
    {
      heading: 'Deterministic workflow repair',
      transition: 'The demonstration fails because it omits ordinary constraints, so the first design task is to repair the deterministic path.',
      paragraphs: [
        { text: 'That observation usually exposes work that can be removed, standardised or validated. Ordinary workflow software should handle required fields, fixed calculations, known notifications and state changes. With those controls in place, the model faces fewer occasions on which it must infer what the organisation meant.' },
        { text: 'In the customer enquiry, address validation can expose the conflict, the current policy can be versioned and the credit hold can become a controlled field. AI may still help interpret free text or prepare a response, but it no longer has to invent the process while executing it.' },
        { text: 'This combined design is less theatrical than a general agent and more dependable. Once the workflow has a stable state and explicit exceptions, management can settle the point the demonstration avoided, which is how much authority the model should receive.' },
      ],
    },
    {
      heading: 'Authority by consequence',
      transition: 'A stable workflow makes selective interpretation possible; the next decision is how much authority each interpreted output should receive.',
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
      transition: 'Consequence-based authority is conservative by design, and the strongest case against it is worth stating at full strength.',
      paragraphs: [
        { text: 'The strongest counterargument is that some organisations already have clean records, stable policies and reversible actions. Requiring a long redesign before every release would waste that maturity. A bounded agent can remove real coordination work when the tools, inputs and fallback route are already dependable.' },
        { text: 'Controls should rise with consequence. A low-consequence internal task with strong observability may move quickly from recommendation to action. A financial, regulated or customer-facing commitment requires a higher evidence threshold. Human review adds value when the reviewer sees the source, proposed action and reason the case deserves attention.' },
        { text: 'Nominal oversight can still fail at this point. Relentless review volume or weak evidence turns approval into a reflex. Useful control measures include meaningful challenges, corrections and rescue effort; the presence of a human click carries little information by itself.' },
      ],
    },
    {
      heading: 'Controlled-pause decision',
      role: 'conclusion',
      transition: 'The case for earlier autonomy survives only under narrow conditions, and those conditions define the release decision for the failed enquiry.',
      paragraphs: [
        { text: 'When the original enquiry returns, the repaired workflow detects the address conflict, retrieves the current policy and exposes the credit hold. The agent can prepare a response, but the case goes to the finance manager before anything is promised to the customer. The pause that once depended on tacit knowledge has become an explicit control.' },
        { text: 'Management can now decide whether to expand authority using observed evidence: correct completion by risk category, material corrections, manual rescue, incidents and unresolved exception age. Greater autonomy is justified only when it improves the whole route without weakening recovery.' },
        { text: 'The agent did not need a more ambitious instruction. It needed an operating system that distinguished a normal case from a consequential exception. Repairing that system first turns autonomy from a product setting into a management decision.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
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
];
