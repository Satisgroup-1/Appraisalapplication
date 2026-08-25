import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { oecdWorkforce, ukAdoption } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Smaller firms decide faster, and that is the AI advantage they actually hold',
  standfirst: 'SMEs rarely possess the largest technology budgets or datasets. They may nevertheless move faster because operational knowledge, customer context and decision authority sit closer together. That advantage survives only if leadership concentrates its attention.',
  thesis: 'Short decision lines can produce faster AI learning, but only when a smaller firm concentrates on one material workflow and converts each release into reusable capability.',
  sceneLabel: 'The situation',
  sceneTitle: 'Five people around one table can resolve a question that takes five committees elsewhere',
  sceneParagraphs: [
    'A customer-service lead describes a recurring exception. The managing director understands its commercial cost, the operations manager knows every step of the process, and the technical specialist can test a change that afternoon. Nobody needs to translate the problem through several layers before a decision is made.',
    'Proximity can shorten decisions, although the same firm may lack clean data, spare management capacity and specialist engineering. The meeting matters when it concentrates those scarce resources on a question capable of producing operating evidence.',
  ],
  sections: [
    {
      heading: 'Management proximity hypothesis',
      paragraphs: [
        { text: 'A smaller firm can place the process expert, user, sponsor and builder in one decision loop. That arrangement may reduce translation loss and shorten the interval between observing an exception and testing a change. This interpretation comes from operating logic; the adoption surveys cited here neither confirm nor refute it.' },
        { text: 'Large organisations retain important advantages: capital, specialist teams, data, procurement leverage and formal controls. Smaller firms compete when leadership proximity produces faster, better decisions and those decisions remain supported by evidence.' },
        { text: 'The group in the opening scene therefore needs more than permission to experiment. It needs to know whether AI is already producing measurable benefits in comparable firms and what those findings do, and do not, imply for its own workflow.' },
      ],
    },
    {
      heading: 'SME adoption evidence',
      transition: 'Management proximity is only a hypothesis; adoption and workforce data indicate how much real opportunity it may contain.',
      paragraphs: [
        { text: 'An OECD survey across seven countries found generative AI in use at 31 percent of SMEs. Among users, 65 percent reported improved employee performance and 39 percent of those with a recent skills gap said the technology helped compensate. At the same time, 83 percent reported no change in overall staffing need. These are experiences respondents reported. No productivity magnitude was measured.', sources: [oecdWorkforce] },
        { text: 'The evidence shows that smaller firms can access AI and often perceive it as useful. It offers no basis for claims that they outperform large firms, that jobs will disappear or that a particular workflow will produce a positive return. Management can use the findings to justify a focused test, with no presumption about its result.' },
        { text: 'For the five-person group, the practical agenda is augmentation tied to a visible constraint. Better preparation, interpretation or coordination should release capacity or improve quality in one recurring part of the work.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'Focused workflow advantage',
      transition: 'Broad adoption data cannot prove advantage for any one firm. A focused workflow test can.',
      paragraphs: [
        { text: 'A broad tool rollout distributes attention across functions and produces little shared learning. A focused portfolio begins with one constraint that is frequent, material and measurable. Leadership must also state what will not be pursued, because every additional pilot competes for the same process expertise, the same data work and the same review capacity.' },
        { text: 'UK research reinforces the readiness problem. Just over half of current AI users said they felt ready to scale, while roughly one third of prospective adopters felt ready to implement. These figures leave delivery design open while showing that access to tools has moved faster than organisational confidence.', sources: [ukAdoption] },
        { text: 'The opening group should therefore define an outcome, create a baseline and release the smallest complete workflow that can test it. A short decision line is useful only when each decision leaves evidence for the next one.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }, { kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Capacity and governance constraints',
      role: 'counterargument',
      transition: 'A focused workflow may exploit proximity, but scarce capacity, weak controls and concentration risk all cut the other way.',
      paragraphs: [
        { text: 'Scale still confers protection. Smaller firms often have weaker data, fewer specialist reviewers and little redundancy when one person becomes a bottleneck. Close customer knowledge may remain in memory, and rapid changes can bypass privacy, security or acceptance decisions that a larger organisation is forced to formalise.' },
        { text: 'A smaller firm needs four named people before it builds anything: a director answerable for the result, the manager who runs the process day to day, whoever controls the data the service is allowed to read, and the engineer who will maintain it. In a firm of twenty that may be three people and one of them wearing two hats, which is the point: the roles have to be named, and naming them is not the same as hiring for them. Each release should end with an expand, adjust, hold or stop decision.' },
        { text: 'A pilot that sends every exception to the same technical specialist concentrates operational risk and creates little leverage. Reusable evaluation cases, access patterns, logging and training belong in the first release because they determine whether the work can survive ordinary operations.' },
      ],
    },
    {
      heading: 'Repeatable decision cell',
      role: 'conclusion',
      transition: 'Capacity and governance constraints narrow the claim. Any durable advantage must appear in a repeatable operating process that converts proximity into disciplined decisions.',
      paragraphs: [
        { text: 'The five people around the table should leave with one selected workflow, one measurable outcome and one list of things they are not doing yet. They should agree the evidence required for a bounded release and the conditions that would stop it. That is a more defensible advantage than merely being able to approve software quickly.' },
        { text: 'If the release improves the outcome, its evaluation cases, data decisions, controls and operating lessons should be reused. If it fails, the same decision process should redirect attention without defending sunk cost. Learning speed includes the ability to stop.' },
        { text: 'A short organisation chart creates no value on its own. Advantage appears when proximity produces a dense cycle of evidence and decision, supported by delivery routines that can be repeated. The meeting in the opening scene matters only if that discipline survives after everyone leaves the room.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'SME workforce',
    title: 'Adoption is meaningful, while labour effects remain nuanced',
    summary: 'The OECD survey spans seven countries. Each measure has its own respondent base and should be read separately.',
    interpretation: {
      establishes: 'Generative AI is used by a material share of surveyed SMEs and is often associated with reported performance or skills benefits.',
      doesNotEstablish: 'The survey does not measure the size of productivity gains or show that smaller firms outperform larger organisations.',
      management: 'Use the evidence to justify a focused test. It will not support a general labour-reduction or competitive-advantage claim.',
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
    summary: 'Readiness is a question about management capability before it is a question about what to buy.',
    interpretation: {
      establishes: 'Many current and prospective adopters do not report being ready to implement or scale AI.',
      doesNotEstablish: 'Self-reported readiness does not identify which delivery model will work or predict project success.',
      management: 'Concentrate the scarce management attention, data work and evaluation capacity on one bounded workflow.',
    },
    source: 'DSIT, AI Adoption Research 2026',
    href: 'https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research',
    points: [
      { label: 'Businesses currently using AI', value: 16, display: '16%', detail: 'Around one in six UK businesses reported current use of at least one AI technology.' },
      { label: 'Prospective adopters ready to implement', value: 33, display: '1 in 3', detail: 'Only about one third of businesses planning adoption reported readiness to implement.' },
      { label: 'Current users ready to scale', value: 54, display: '54%', detail: 'Just over half of current users felt ready to scale their use.' },
    ],
  },
];
