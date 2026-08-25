import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { oecdWorkforce, ukAdoption, ukBusinessData } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Only a fifth of UK AI users have connected it to a business system',
  standfirst: 'Access to artificial intelligence has spread faster than the operating discipline required to make it useful. Workflow design, the state of the underlying data and sustained management attention will decide whether the next wave of spending produces operating value.',
  thesis: 'The competitive divide is shifting from who can obtain an AI tool to who can connect it to a material workflow, govern its decisions and improve it with evidence.',
  sceneLabel: 'The situation',
  sceneTitle: 'The licence dashboard is green. The operating dashboard has not moved',
  sceneParagraphs: [
    'At the monthly review of a 120-person services firm, the technology dashboard looks encouraging. Most employees can use an AI assistant and weekly activity is rising. The operating dashboard is less persuasive. Customer-response time, first-time quality and work in progress look much as they did six months earlier. The chief financial officer asks where the return has gone.',
    'Employees have improved drafts, summarised calls and accelerated research. Those personal gains have left the route from enquiry to accepted outcome largely unchanged. The meeting therefore needs to identify the organisational changes that would turn individual assistance into repeatable operating performance.',
  ],
  sections: [
    {
      heading: 'Adoption is not integration',
      paragraphs: [
        { text: 'The first difficulty for the finance team is that even adoption is not one number. The UK Business Data Survey reports AI use among businesses that handle digitised data, while separate government research measures use across the wider business population. The former found 41 percent use in its survey population; the latter found 16 percent of UK businesses using at least one AI technology. Different populations, definitions and survey designs explain much of the gap.', sources: [ukBusinessData, ukAdoption] },
        { text: 'Neither figure answers the chief financial officer. A business can count an employee researching with a general assistant and another firm running an embedded workflow under the same broad heading of AI use. One records access to a capability; the other may alter how work is controlled. The distinction means adoption can be an early signal of experimentation without being evidence of economic return.' },
        { text: 'Where the usage dashboard cannot establish value, the narrower measure is the share of that activity connected to a business system and to a decision the business already tracks.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'System-integration gap',
      transition: 'Since adoption cannot establish value, the more useful question is how much of that use is connected to an operational system.',
      paragraphs: [
        { text: 'That narrower question exposes a genuine gap. Among businesses in the UK Business Data Survey that already used AI, 21 percent reported that their tools were integrated with an existing business system. The rate rose from 18 percent among sole traders to 57 percent among large businesses. The result suggests that resources and digital maturity matter, although the survey definition includes relatively light forms of integration such as an assistant embedded in office software.', sources: [ukBusinessData] },
        { text: 'Formal connection remains much less common than tool use. The figure says nothing about the value achieved by the other adopters, and it cannot establish causation between integration and performance. Its practical force lies elsewhere: a connector forces the investment decision to confront the inputs, the permissions, the business rules, the exceptions and the question of who answers when it goes wrong.' },
        { text: 'That evidence changes the monthly review. Licence counts reveal activity while leaving the intended customer or operating decision undefined. Management must choose that decision before it can design the surrounding workflow.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 0 }],
    },
    {
      heading: 'Workflow authority and measurement',
      transition: 'The integration gap identifies where to look; the next question is which authority and measurement choices make that connection operational.',
      paragraphs: [
        { text: 'Once a material decision is selected, integration becomes less about moving data and more about allocating authority. Management must decide which record is authoritative, which fields are sufficient, which outputs may proceed without review and which exception stops the workflow. A confidence score has no operating value unless a low score changes what happens next: a different route, a second pair of eyes, or a longer promised turnaround.' },
        { text: 'The strongest design usually combines ordinary software with bounded AI. Required fields, calculations and known notifications should remain deterministic. A model belongs where language or variation makes fixed rules inadequate. Source attribution and evaluation then connect interpretation back to evidence, while a named reviewer decides the exceptions that carry commercial or regulatory weight.' },
        { text: 'This architecture gives the finance team something measurable: elapsed time from eligible input to accepted outcome, first-time quality, rework and exception effort. Yet it also creates cost and control obligations. A formal workflow is not always worth that burden, and the threshold should be set before the work starts.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Limits of informal use',
      role: 'counterargument',
      transition: 'Formal workflow carries cost and control obligations, so there is a threshold below which informal assistance remains the better answer.',
      paragraphs: [
        { text: 'Formal integration can be disproportionate. A researcher who drafts faster or a manager who prepares a meeting more efficiently may create real value without a new system of record. OECD respondents most often identified improved employee performance as a benefit of generative AI, although the survey did not measure the size of that improvement.', sources: [oecdWorkforce] },
        { text: 'Management should not suppress these gains merely because they are difficult to aggregate. Personal tools are sensible where consequences are low, context is local and the employee can judge the output. The case for integration begins when work crosses people or systems, when the decision recurs at meaningful volume, or when a failure has to be answered for outside the team that caused it.' },
        { text: 'That boundary resolves the apparent conflict. Informal assistance can remain a useful productivity layer, while investment discipline is reserved for workflows where repeatability, traceability and scale matter. The monthly review can now ask which activities belong on each side of that boundary.' },
      ],
    },
    {
      heading: 'CFO decision threshold',
      role: 'conclusion',
      transition: 'Having separated low-risk personal use from recurring operational work, the monthly review can now set an investment threshold.',
      paragraphs: [
        { text: 'The chief financial officer will not find the return by examining prompts or active users more closely. The next credible unit of analysis is one eligible workflow. Management should name the manager answerable for it, record what it currently costs in time and rework, define what an accepted outcome looks like, and identify the data and permissions the work needs.' },
        { text: 'A bounded release supplies the evidence missing from the licence dashboard. Improvement in cycle time, quality or capacity must survive the inclusion of review and exception effort. Without that improvement, higher activity supports a change of scope or an end to the programme.' },
        { text: 'The original dashboard was not wrong. It was incomplete. It showed that colleagues were willing to experiment. The management task is to convert that willingness into one governed route from input to outcome, and to fund the next route only when the first has produced evidence.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Adoption context',
    title: 'Use has spread further than operating integration',
    summary: 'These figures use different respondent bases. The contrast is useful as context. It does not describe a conversion funnel.',
    interpretation: {
      establishes: 'Reported AI use is widespread in a digitally active survey population, while reported connection to business systems is less common.',
      doesNotEstablish: 'The bars do not share one denominator and do not measure a progression from adoption to value.',
      management: 'Treat usage as evidence of experimentation, then evaluate value at the level of a defined workflow.',
    },
    source: 'UK Business Data Survey 2026',
    href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
    points: [
      { label: 'AI use among data-handling firms', value: 41, display: '41%', detail: 'Share of businesses handling digitised data that reported using AI for any purpose.' },
      { label: 'System integration among AI users', value: 21, display: '21%', detail: 'Share of AI-using businesses that reported integration with an existing business system.' },
      { label: 'Comfort with external model training', value: 18, display: '18%', detail: 'Share comfortable with business data being used to train an external AI model.' },
    ],
  },
  {
    label: 'Integration by size',
    title: 'Scale still buys an integration advantage',
    summary: 'Among businesses already using AI, larger firms report materially higher integration with existing systems.',
    interpretation: {
      establishes: 'Larger AI-using businesses report system integration more frequently than smaller adopters.',
      doesNotEstablish: 'The survey does not prove that size caused integration or that every reported connection changed operating performance.',
      management: 'Smaller firms should budget for the data work, the workflow redesign and the staff time to run it, because the connector supplies none of that.',
    },
    source: 'UK Business Data Survey 2026',
    href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
    points: [
      { label: 'Sole traders', value: 18, display: '18%', detail: 'Reported system integration among sole traders already using AI.' },
      { label: 'Micro businesses', value: 27, display: '27%', detail: 'Reported system integration among AI-using micro businesses.' },
      { label: 'Small businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using small businesses.' },
      { label: 'Medium businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using medium businesses.' },
      { label: 'Large businesses', value: 57, display: '57%', detail: 'Reported system integration among AI-using large businesses.' },
    ],
  },
];
