import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { gartnerAgents, nistGenAi, stanfordIndex } from '@/lib/sources';

const fortuneJevons = { label: 'Fortune, on cheaper tokens and rising AI spending, June 2026', href: 'https://fortune.com/2026/06/17/why-is-ai-spending-increasing-as-tokens-get-cheaper-jevons-paradox/' };
const artificialAnalysis = { label: 'Artificial Analysis, language model benchmarking methodology', href: 'https://artificialanalysis.ai/methodology' };
const lorikeetEconomics = { label: 'Lorikeet, AI support resolution rates and unit economics, 2026 (vendor material)', href: 'https://www.lorikeetcx.ai/articles/ai-support-resolution-rate-roi-ranked-2026' };

export const article: NewsEditorial = {
  title: 'Model prices have fallen; the cost of dependable automation has not',
  standfirst: 'Cheaper tokens have not produced cheaper automation. Consumption rises as the unit price falls, and most of what an accepted task costs sits outside the model bill entirely.',
  thesis: 'Suppliers should be compared on the fully loaded cost of one task accepted into operations. Open weights are worth buying where they resolve a constraint that a managed service cannot.',
  sceneLabel: 'The procurement paper',
  sceneTitle: 'Ninety percent off the model bill and a longer exception queue',
  sceneParagraphs: [
    'A procurement paper recommends swapping the model inside a document-processing service for a cheaper alternative. The inference invoice duly falls. At the next operating review the picture is less flattering. The exception queue is longer, quality sampling has been widened to cover it, and two engineers have spent a month rebuilding a retrieval feature the previous provider supplied as standard. Buyers of language technology will recognise the shape of this.',
    'Nothing in the paper was arithmetically wrong. The unit was wrong. A model supplies tokens; a business pays for work that somebody is willing to accept. Everything between those two events is where the saving went.',
  ],
  sections: [
    {
      heading: 'Token prices collapsed and AI bills grew anyway',
      paragraphs: [
        { text: 'The fall in the price of machine intelligence is one of the few facts in this market nobody disputes. Stanford records the cost of querying a model above a GPT-3.5-level MMLU threshold falling from about $20.00 per million tokens in November 2022 to $0.07 by October 2024. That threshold is historical and says nothing about whether either model would hold up in a live workflow. As a statement about the price of a unit of capability, it stands.', sources: [stanfordIndex] },
        { text: 'Budgets did not follow prices down. Reporting through 2026 has traced the opposite movement, with enterprise AI spending climbing while the price of a token keeps falling, and economists reaching for Jevons paradox to account for it. A cheaper input is an invitation to consume more of it. Cheaper tokens made whole categories of work worth attempting that had never justified the meter before.', sources: [fortuneJevons] },
        { text: 'Consumption is where the compounding happens. Retrieval widened the average prompt. Reasoning models generate long internal traces the buyer pays for and never reads. Agentic patterns loop, retry and call tools, so a request that cost a fraction of a penny as a single completion costs considerably more once it is rebuilt as a sequence of steps. Independent evaluation has already adjusted to this: Artificial Analysis prices a model on the total tokens it consumes across a task, reasoning tokens included, divided by the number of tasks.', sources: [artificialAnalysis] },
        { text: 'So the headline price per million tokens has stopped being a decision variable. It sets a floor under a bill whose size is settled elsewhere: by how much work the organisation sends, how many attempts each piece of work takes, and how much of the output survives review. A procurement process that optimises the floor is optimising the part of the bill it controls least.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'Cost per accepted task exposes false bargains',
      transition: 'If the token price sets only the floor, the comparison that decides a supplier has to be assembled from the lines above it.',
      paragraphs: [
        { text: 'One task accepted into operations carries more than an inference call. It carries retrieval and orchestration. It carries the attempts that failed and had to be retried. It carries the share of work a person finished by hand, and the review effort spent checking the share a person did not. It carries evaluation, monitoring, and the engineering that falls due again every time a prompt, a provider or a model version changes.' },
        { text: 'Those lines do not move together. Inference scales with volume. Review scales with the error rate multiplied by the consequence of an error, which is why a small quality regression in a regulated workflow is expensive and the same regression in an internal draft is tolerable. Integration and control are close to fixed, and they are incurred before a single task has been accepted. A comparison that holds only the first of these constant has compared very little.' },
        { text: 'Assembling the full figure requires a harness the buyer controls: a set of representative cases including the difficult and the adversarial ones, a rubric that does not move between candidates, and a cost model that attaches review and exception effort to each candidate’s output. The comparison is then between complete services at a fixed acceptance standard. It can be rerun in the week a new model appears, which is the only way a sourcing decision survives a market moving at this speed.' },
        { text: 'Run that way, the comparison strips out false bargains quickly. A model at half the price that doubles the rejection rate has raised the cost of an accepted task. A very accurate model can be uneconomic too, if its rare failures oblige every output to pass an expensive specialist. Customer support has already reached this conclusion commercially. Several vendors now charge per resolution and bill nothing for conversations the system fails to resolve, and their published arithmetic shows a platform that resolves a smaller share of contacts at a lower unit price losing to a dearer one once the human-handled remainder is priced at a human cost.', sources: [lorikeetEconomics] },
        { text: 'Open-weight models deserve the same test and now survive it more often. Stanford tracked the performance gap between the best closed and the best open model on the Chatbot Arena leaderboard narrowing from 8.0 percent in January 2024 to roughly 4.2 percent by the middle of that year and 1.7 percent by February 2025. Proximity on a leaderboard is no guarantee of proximity on a particular document set, and any candidate still has to be benchmarked on the actual work. What has changed is that automatic dependence on a single frontier supplier now needs a reason.', sources: [stanfordIndex] },
        { text: 'That reason cannot be the invoice alone. Self-hosting removes a usage fee and adds licensing, provenance, patching, capacity planning, security monitoring and service continuity, all of which land on the buyer or its infrastructure partner. It also exposes utilisation. An accelerator held against bursty traffic sits idle most of the time, and an idle accelerator is an expensive way to serve a token. NIST treats generative AI risk as a lifecycle matter for a related reason, since a release that passed on the day it shipped degrades as models, data and usage patterns change. A data boundary, a latency requirement or a resilience obligation is a good reason to run a model locally. Avoiding a metered fee, on its own, will not survive the first quarter of operating one.', sources: [nistGenAi] },
      ],
      exhibits: [
        { kind: 'system', afterParagraph: 2 },
        { kind: 'evidence', view: 1, afterParagraph: 4 },
      ],
    },
    {
      heading: 'Paying a premium supplier can lower total cost',
      role: 'counterargument',
      transition: 'Since the burden of running a model transfers to whoever runs it, the case for staying with a managed supplier deserves to be put at its strongest.',
      paragraphs: [
        { text: 'A demand for portability has a price, and it is usually paid in engineering. Managed platforms arrive with retrieval, evaluation tooling, safety filters, observability, identity integration and a support contract that answers at three in the morning. A buyer who insists on an abstraction layer thin enough to swap providers at will gives up most of that and funds the replacement internally. Where the bundled services materially improve the cost of an accepted task, the resulting dependency is a commercial judgement that pays for itself.' },
        { text: 'Operating capacity is the harder constraint. Gartner has forecast that more than 40 percent of agentic AI projects will be cancelled by the end of 2027, attributing the cancellations to escalating costs, unclear business value and inadequate risk controls. Those are the failure modes of organisations that acquired more system than they could run. A firm without the people to operate a model service will find that the open weights it downloaded were the cheapest part of the undertaking.', sources: [gartnerAgents] },
        { text: 'The concession has a boundary. What the buyer must keep is the evaluation set, the rubric, the acceptance thresholds and the business rules, because those are what make a second supplier assessable at all. Execution can sit inside proprietary features. The cost of leaving should be calculated before signing, written down and revisited at renewal, so that the dependency remains a decision the firm has taken at a known price.' },
      ],
    },
    {
      heading: 'Set one denominator before the next model switch',
      role: 'conclusion',
      transition: 'Because the managed route and the self-hosted route can each be defended on their own terms, the choice has to be settled by a measure that applies to both.',
      paragraphs: [
        { text: 'Procurement, engineering and the manager answerable for the workflow should agree a single denominator before any of them looks at a price list. Tasks accepted into operations, at the required standard of quality and consequence. Every candidate is then quoted in one currency, and arguments about model families become arguments about numbers.' },
        { text: 'With the denominator in place the sourcing rules are short. Reserve expensive capability for the tasks where it changes whether work is accepted. Use a smaller or open-weight model wherever the harness shows it clears the same bar. Deploy locally where a constraint requires it and the firm can staff the consequences. Repeat the comparison on a schedule, because the price and the capability of every candidate will have moved before the contract ends.' },
        { text: 'This price war is real, and it is being fought over the smallest line in the bill. Buyers who read it as a discount will keep finding the saving reappear somewhere else on the same page. Buyers who read it as headroom, and spend it on evaluation, on connecting the workflow properly and on staffing the exceptions, will get the dependable automation the lower price was supposed to make affordable.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Query economics',
    title: 'Querying at a fixed capability threshold became far cheaper',
    summary: 'Each point is the lowest-priced model exceeding a GPT-3.5-level MMLU threshold in that period, per million tokens.',
    interpretation: {
      establishes: 'The price of querying a model above one historical benchmark threshold fell by more than two orders of magnitude between November 2022 and October 2024.',
      doesNotEstablish: 'A shared MMLU threshold does not imply equivalent quality, reliability or total cost on a business workflow.',
      management: 'Spend the saving on broader benchmarking. Hold the acceptance standard where it is.',
    },
    source: 'Stanford HAI, AI Index 2025',
    href: 'https://hai.stanford.edu/news/ai-index-2025-state-of-ai-in-10-charts',
    points: [
      { label: 'November 2022', value: 20, display: '$20.00', detail: 'Approximate cost per million tokens at the stated capability threshold.' },
      { label: 'October 2024', value: 0.07, display: '$0.07', detail: 'Approximate cost per million tokens for Gemini 1.5 Flash 8B at the same threshold.' },
    ],
  },
  {
    label: 'Open-weight gap',
    title: 'Open weights closed most of the leaderboard gap in one year',
    summary: 'Reported difference between the best closed and the best open-weight model on the Chatbot Arena leaderboard, at three points.',
    interpretation: {
      establishes: 'On one public leaderboard, the best open-weight model moved close to the best closed model between January 2024 and February 2025.',
      doesNotEstablish: 'Leaderboard proximity says nothing about performance on a specific document set, and nothing about the cost of operating an open-weight service.',
      management: 'Treat open weights as a credible candidate and benchmark them on the real work at a fixed acceptance standard.',
    },
    source: 'Stanford HAI, AI Index 2025',
    href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf',
    points: [
      { label: 'January 2024', value: 8, display: '8.0%', detail: 'Reported gap between the best closed and best open-weight model on Chatbot Arena.' },
      { label: 'Mid-2024', value: 4.2, display: '4.2%', detail: 'Approximate reported gap at the midpoint of the tracked period.' },
      { label: 'February 2025', value: 1.7, display: '1.7%', detail: 'Reported gap at the end of the period covered by the 2025 index.' },
    ],
  },
];
