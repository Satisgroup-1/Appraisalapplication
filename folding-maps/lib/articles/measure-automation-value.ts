import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { metrStudy, qjeStudy, ukAdoption } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Hours saved are not cash, and the gap between them can be measured',
  standfirst: 'Multiplying theoretical minutes saved by salary produces an attractive number and a weak business case. Credible value measurement begins with a counterfactual, includes exception effort and distinguishes released capacity from cash.',
  thesis: 'Automation should be judged through a transparent benefits ledger that connects operating change to financial consequence and records the confidence behind each claim.',
  sceneLabel: 'The situation',
  sceneTitle: 'The programme reports 100 hours saved. Finance cannot find a single pound',
  sceneParagraphs: [
    'The calculation is familiar. A task once took ten minutes, the new workflow takes five and monthly volume is 1,200. The programme reports 100 hours saved and multiplies the result by salary. The number is precise, positive and disconnected from what happened next.',
    'Employees may have used only part of the system, reviewed difficult outputs or spent the released time on activity whose contribution was never measured. Cost did not leave the budget and capacity was not deliberately redeployed. The technology may still be valuable, but the financial claim has moved ahead of the evidence.',
  ],
  sections: [
    {
      heading: 'Counterfactual benefit baseline',
      paragraphs: [
        { text: 'The first question for the investment committee is what would have happened without the release. A representative baseline should cover eligible volume, elapsed time, hands-on effort, error, rework and service. One difficult week can flatter the project; staff estimates alone can create precision without a dependable denominator.' },
        { text: 'Where data is weak, the correct response is not to invent a stronger baseline. Management should record the uncertainty, identify the measures the pilot can improve and state the range of outcomes consistent with current knowledge.' },
        { text: 'The 100-hour claim assumes full adoption, stable demand and no new work. Testing those assumptions establishes how much of the theoretical saving remains available for the business to use.' },
      ],
    },
    {
      heading: 'Gross-to-net value bridge',
      transition: 'A credible counterfactual establishes the gross change. That change is then reduced at several points before any of it reaches economic value.',
      paragraphs: [
        { text: 'The value bridge begins with eligible volume actually completed through the new process. Review, exception handling, support and workarounds reduce gross time released. The remainder is capacity. It becomes financial value only when cost is removed or avoided, or when the capacity is deliberately redirected to work with a measured contribution.' },
        { text: 'The graphic illustrates that logic using 100 theoretical hours. Every deduction is an assumption, so the result carries no predictive claim about another project or a 20 percent conversion into cash. Its value lies in separating the stages that management must record in the ledger.' },
        { text: 'In the opening case, finance could not find the saving because nobody owned the movement from released time to budget or output. Before naming anyone to run it, the committee must test whether the original productivity assumption is credible for this particular work.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
    },
    {
      heading: 'Workflow-specific productivity evidence',
      transition: 'The gross-to-net bridge depends on local assumptions, so external productivity evidence must be tested for transferability.',
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
      paragraphs: [
        { text: 'Quality, service, resilience and risk can matter even when headcount or budget does not change. Faster response may improve conversion; fewer errors may reduce remediation; stronger evidence may lower the probability or consequence of control failure. Rejecting these effects because they are not immediate cash would produce an artificially narrow investment case.' },
        { text: 'Benefit types need separate treatment. DSIT found 56 percent of current AI users reporting higher employee productivity while 77 percent reported no revenue change. The self-reported findings leave the value of that productivity unresolved. They still show why an operating improvement and a financial result belong to different points in the causal chain.', sources: [ukAdoption] },
        { text: 'Each material benefit needs a mechanism, a named manager and a result that would disprove it. A service claim should identify the customer measure expected to move. A risk claim should identify the exposure and control. Management can then value the benefit without disguising it as salary removed.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Investment continuation threshold',
      role: 'conclusion',
      transition: 'Once cash and non-cash benefits share an explicit causal chain, the benefits ledger can support a continuation decision.',
      paragraphs: [
        { text: 'The programme’s 100 hours should be restated as a hypothesis. Finance and the manager who runs the process should review the baseline, eligible adoption, net effort, quality, service and the named destination of any released capacity. Confidence should rise only as observed evidence replaces assumptions.' },
        { text: 'The review should conclude with one of four decisions: expand where the causal chain is working, adjust where a bottleneck is visible, hold where observation is insufficient, or stop where the result no longer justifies the operating cost. Measurement is worth its cost when it changes that choice.' },
        { text: 'Finance could not find a pound because the original calculation ended at the automated task. A credible case follows the effect until it reaches an operating or financial consequence, then states honestly what remains unproven. A range supported by that chain is stronger than a precise saving that exists only on a slide.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Observed outcomes',
    title: 'Productivity effects can point in opposite directions',
    summary: 'The two studies cover different occupations, tasks and operating contexts. The comparison demonstrates how much results vary by setting. It says nothing about relative model quality.',
    interpretation: {
      establishes: 'Credible studies have found both positive and negative productivity effects in different settings.',
      doesNotEstablish: 'The results cannot be averaged, compared as model performance or imported into another business case.',
      management: 'Measure the target workflow with its own baseline, adoption, review and exception costs.',
    },
    source: 'Quarterly Journal of Economics, 2025 and METR, 2025',
    href: 'https://academic.oup.com/qje/article/140/2/889/7990658',
    points: [
      { label: 'Customer-support agents', value: 115, display: '+15%', detail: 'Issues resolved per hour increased in a field study of 5,172 support agents.' },
      { label: 'Experienced developers', value: 81, display: '-19%', detail: 'Completion time worsened in the METR randomised study of experienced developers on familiar repositories.' },
    ],
  },
  {
    label: 'Value bridge',
    title: 'Gross time released contracts before it becomes financial value',
    summary: 'A modelled bridge showing why adoption, exceptions and redeployment must be observed before a cash claim is made.',
    interpretation: {
      establishes: 'A benefits case needs separate stages between theoretical task time, usable capacity and financial consequence.',
      doesNotEstablish: 'The values are modelled assumptions and do not predict a typical conversion rate.',
      management: 'Name the manager and the evidence required at each stage before reporting realised value.',
    },
    source: 'Quiet Gears benefits model (design values awaiting measurement)',
    points: [
      { label: 'Gross task time released', value: 100, display: '100 hours', detail: 'The theoretical saving before real operating friction is counted.' },
      { label: 'After adoption and exceptions', value: 72, display: '72 hours', detail: 'Capacity remaining after usage, review and rescue effort.' },
      { label: 'Redeployed to measured work', value: 48, display: '48 hours', detail: 'Capacity deliberately redirected to activity with an observed output.' },
      { label: 'Converted to cash impact', value: 20, display: '20 hours eq.', detail: 'The modelled portion linked to cost removed, avoided or verified contribution.' },
    ],
  },
];
