import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { nistGenAi, stanfordIndex } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Model prices have fallen; the cost of dependable automation has not',
  standfirst: 'The price of machine intelligence is falling quickly, widening the range of viable experiments. But inference is only one line in the cost of dependable automation. Review, integration and operational control will decide which apparent bargains create value.',
  thesis: 'Lower model prices increase strategic choice. The decisive economic measure is the full cost of work that meets the required standard and can be accepted into operations.',
  sceneLabel: 'The situation',
  sceneTitle: 'The model bill falls by 90 percent and the project still misses its budget',
  sceneParagraphs: [
    'A buyer replaces an expensive model in a document-processing service with a cheaper alternative. The inference invoice falls almost exactly as promised. The next operating review is less comfortable. Exception queues are longer, quality sampling has expanded and engineers have spent several weeks reproducing a feature that existed inside the former provider.',
    'The price decline remains real; the unit of analysis was wrong. Models generate outputs, while businesses incur the full cost of producing an accepted task. Procurement needs to measure every expense between those two events.',
  ],
  sections: [
    {
      heading: 'Inference price compression',
      paragraphs: [
        { text: 'The fall in headline inference prices is substantial. Stanford reports that the cost of querying a model above a stated GPT-3.5-level MMLU threshold fell from about $20 per million tokens in November 2022 to $0.07 by October 2024. The comparison is historical and offers no guarantee of equivalent performance in a live workflow. Even with that caveat, it materially lowers the cost of testing.', sources: [stanfordIndex] },
        { text: 'For a smaller firm, the immediate benefit is option value. Tasks that could not justify an expensive experiment can now be benchmarked against representative documents, messages or decisions. Lower prices also make it practical to compare several model families before signing a long contract.' },
        { text: 'The procurement team in the opening scene captured this input saving correctly. Its mistake was assuming that the input represented the whole service. The cost of an accepted task also carries review, exception handling, integration and monitoring.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'Cost per accepted task',
      transition: 'Price compression changes only one cost line. Following a single task to the point of acceptance shows the others.',
      paragraphs: [
        { text: 'That wider cost chain includes retrieval, infrastructure, monitoring, review, retries, exception handling, support and the engineering required when a prompt, provider or model changes. These costs scale differently. Inference follows usage; specialist review follows error and consequence; integration and control create fixed commitments before the first task is accepted.' },
        { text: 'Cost per accepted task therefore exposes false savings. A model that costs half as much but doubles correction effort is not cheaper. A highly accurate model may also be uneconomic if its rare failures require every output to pass through an expensive specialist. The appropriate comparison holds the business outcome and acceptance standard constant.' },
        { text: 'This explains the longer queue in the procurement vignette, but it raises a sourcing question. Where operating cost dominates the model bill, an open-weight deployment transfers responsibility to the buyer at least as much as it creates control.' },
      ],
    },
    {
      heading: 'Open-weight operating burden',
      transition: 'Once accepted-task cost is visible, open weights can be assessed as an exchange between supplier expense and internal responsibility.',
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
      transition: 'Control carries its own engineering and operating cost, and there are conditions under which a managed supplier remains the sounder economic choice.',
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
      paragraphs: [
        { text: 'The lower invoice remains valuable when the saving finances broader benchmarks, stronger evaluation and a realistic account of review and exceptions. Procurement, technology and the manager who runs the workflow should agree one denominator: accepted tasks at the required level of quality and consequence.' },
        { text: 'The organisation can then reserve expensive capability for tasks where it changes acceptance, use smaller models where evidence supports them and choose open-weight deployment where control solves a genuine constraint. The same test can be rerun as the market moves.' },
        { text: 'The project in the opening scene missed its budget because it changed a model before understanding the service around it. Its next sourcing decision should begin with that service. Falling prices create leverage only when buyers compare complete outcomes and resist the distraction of an attractive input price.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Query economics',
    title: 'Equivalent-capability inference became dramatically cheaper',
    summary: 'The comparison uses the lowest-priced model exceeding a GPT-3.5-level MMLU threshold in each period.',
    interpretation: {
      establishes: 'The price of querying a model above one historical benchmark threshold fell sharply between November 2022 and October 2024.',
      doesNotEstablish: 'A shared MMLU threshold does not imply equivalent quality, reliability or total cost on a business workflow.',
      management: 'Use lower prices to broaden representative testing. Acceptance standards should hold where they are.',
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
    title: 'Open-weight models narrowed part of the benchmark gap',
    summary: 'A smaller benchmark gap expands buyer choice, but it does not remove deployment, evaluation or licensing obligations.',
    interpretation: {
      establishes: 'Open-weight candidates became more competitive on selected benchmarks during the reported period.',
      doesNotEstablish: 'The comparison does not demonstrate parity across tasks or account for the cost of operating an open-weight service.',
      management: 'Benchmark the actual task and price the responsibilities that move from supplier to buyer.',
    },
    source: 'Stanford HAI, AI Index 2025',
    href: 'https://hai.stanford.edu/assets/files/hai_ai_index_report_2025.pdf',
    points: [
      { label: 'Earlier reported gap', value: 8, display: '8.0 pts', detail: 'Reported closed versus open-weight performance difference on selected benchmarks.' },
      { label: '2024 reported gap', value: 1.7, display: '1.7 pts', detail: 'The narrowed difference reported by Stanford on selected benchmarks.' },
    ],
  },
];
