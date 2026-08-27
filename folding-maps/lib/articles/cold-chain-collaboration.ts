import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import type { ReportSource } from '@/lib/reportNarrative';
import { foodStandards, ncscOt, ncscProtocols } from '@/lib/sources';

/**
 * Cited only by this article for now. The orchestrator can hoist any of these
 * into lib/sources.ts if a second piece comes to rely on them.
 */
const vaccineChainReview: ReportSource = {
  label: 'Matthias and others, Freezing temperatures in the vaccine cold chain, Vaccine, 2007',
  href: 'https://pubmed.ncbi.nlm.nih.gov/17382434/',
};
const vaccineChainUpdate: ReportSource = {
  label: 'Hanson and others, Is freezing in the vaccine cold chain an ongoing issue, Vaccine, 2017',
  href: 'https://www.sciencedirect.com/science/article/pii/S0264410X16309471',
};
const alarmBenchmark: ReportSource = {
  label: 'ASM Consortium benchmarking against EEMUA 191, reported in Chemical Engineering',
  href: 'https://www.chemengonline.com/alarm-management-numbers/',
};

export const article: NewsEditorial = {
  title: 'A temperature excursion changes nothing until it triggers a defined response',
  standfirst: 'Studies that instrument every leg of a distribution path report excursion rates several times higher than studies that instrument a single storage point. Detection is the cheap half of the problem.',
  thesis: 'Cold-chain monitoring repays its cost where a qualifying excursion reaches a named colleague inside a stated time and closes with the reading, the operating context and the corrective action held together in one record.',
  sceneLabel: 'The excursion',
  sceneTitle: 'Eight minutes above threshold, and four systems holding part of the answer',
  sceneParagraphs: [
    'An overnight operator sees a chilled room breach its threshold and stay there for eight minutes. The reading alone cannot separate a loading door left open, a scheduled defrost, a drifting probe and a genuine risk to product. The building management system, the telemetry platform, the maintenance log and the shift notebook each hold a fragment of the answer.',
    'By the time those fragments are gathered the eight minutes are long past, and the decision that mattered was whether to hold the stock before it moved. A service that added a fifth alerting channel to that night would slow the gathering down. A service that shortened it would change the decision.',
  ],
  sections: [
    {
      heading: 'Coverage of the path decides the excursion count',
      paragraphs: [
        { text: 'Ask a temperature-controlled site for its excursion rate and the answer describes its sensors as much as its refrigeration. A site with one probe per chilled room, sampled every fifteen minutes, will report a low rate, because most of what happens to product happens between those points: on a dock, in a trailer, during a transfer, inside a pallet nobody instrumented. The rate is a property of the measurement design before it is a property of the plant.' },
        { text: 'Vaccine distribution is the part of this problem with a published literature, and the literature is blunt. A 2007 systematic review in Vaccine found that studies examining a single storage point or a single leg reported freezing exposure in 14 to 35 percent of cases, while the six studies that measured temperature through every segment of the chain found that between 75 and 100 percent of shipments had been exposed. A 2017 update reported freezing in transport in 16.7 percent of cases in higher-income settings and 35.3 percent in lower-income ones.', sources: [vaccineChainReview, vaccineChainUpdate] },
        { text: 'Chilled food distribution differs from vaccine distribution in tolerance and in consequence. The measurement lesson still applies, because it concerns instrumentation. Where a chain is watched at points, the record shows the points. Where it is watched continuously, the record shows the handovers, and handovers are where product spends most of its unprotected time. Any excursion count taken from a partly instrumented path understates exposure by an unknown margin.' },
        { text: 'For anyone specifying a monitoring service, two things follow. Establish which stretches of the path are dark, and establish whether the organisation is prepared to see a higher excursion count once they are lit. In chilled food operations those stretches are predictable: the transfer between dock and trailer, the hours when a third-party haulier holds the load, and any pallet whose position in the room differs from the probe. A site that installs continuous monitoring and then treats the resulting increase as a fault in the system will have the instrumentation switched off inside a quarter. Discovery should therefore settle current coverage, sampling interval and known blind spots before anybody agrees a threshold.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
    },
    {
      heading: 'Turn a validated reading into an assignable case',
      transition: 'Lighting the dark stretches multiplies readings, and a reading deserves attention only once it can be told apart from an instrument fault.',
      paragraphs: [
        { text: 'Wider coverage brings more ways to be wrong. Missing heartbeats, implausible jumps, probes reading through a defrost cycle and calibration that drifted three months ago all arrive looking like temperature data. Each of these should surface as a data exception in its own right, with the gap left visible on the record. Filling a gap by interpolation, or presenting a suspect reading to one decimal place, conceals exactly the operating risk that matters. A service unable to say which of its readings it trusts is producing an opinion with a unit attached.' },
        { text: 'Security guidance points the same way. NCSC operational technology guidance asks for a definitive view of what is deployed and for data to be validated where it crosses a trust boundary, and its connectivity principles ask for architectural separation when information moves from plant equipment into analytical services. Applied here, those principles stop the monitoring path from becoming a route back into refrigeration control.', sources: [ncscOt, ncscProtocols] },
        { text: 'With validation in place, the distinction the whole design rests on becomes affordable. An alert records that a rule fired. A case carries the validated reading and its duration, the state of the asset, the product and location, the policy that applies, the colleague it is assigned to, the action taken and the evidence that temperature recovered. Whatever is still missing stays visible on the face of the case. The reviewer receives a decision object.' },
        { text: 'Two of those fields do the real work: the named responder and the stated time to respond. Food Standards Agency guidance pairs monitoring with effective corrective action and leaves the judgement with the business, which means an unassigned excursion satisfies nothing at all. Closure should record what was inspected, what was moved or destroyed and what temperature did afterwards, so that the assurance file becomes a by-product of the response.', sources: [foodStandards] },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Most readings deserve a record and no response',
      role: 'counterargument',
      transition: 'Every case this route creates spends operator attention, which is the scarcest input in an overnight operation.',
      paragraphs: [
        { text: 'The case against building any of this is that operators are already saturated, and that a service converting routine movement into cases would deepen the saturation. Process operations have measured that problem for decades. EEMUA 191 recommends no more than one alarm per operator per ten minutes in normal running and no more than ten alarms in the first ten minutes of an upset, and it pairs those rates with an expected time to respond.', sources: [alarmBenchmark] },
        { text: 'Benchmarking by the ASM Consortium against that guide, across 37 operator consoles, found about a third holding the normal-operation rate and about a quarter more sitting in the band the guide calls manageable, which by subtraction leaves roughly two consoles in five above it. Only two of the 37 came close to the guideline for upset conditions. Those are refineries and chemical plants with dedicated control rooms. A chilled warehouse with one duty manager overnight has considerably less attention to spend.', sources: [alarmBenchmark] },
        { text: 'That objection survives, and it should change the design. Continuous records hold their place in assurance, trend analysis, maintenance planning and retrospective investigation without ever interrupting anybody. A case should form only where signal quality, duration, product and context together clear a threshold the operators themselves agreed, and the number of cases per shift belongs in the specification as a ceiling, tested against history before anything escalates live. A ceiling of that kind is unusual in monitoring specifications and ordinary in process control, which is where the evidence on operator attention comes from. The service should be judged on whether its cases displace work the operator was doing anyway.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
    },
    {
      heading: 'Replay the year before escalating anything live',
      role: 'conclusion',
      transition: 'A ceiling on cases per shift is a claim about the future, and history is the only cheap place to test it.',
      paragraphs: [
        { text: 'All of this points to a narrow proposal. Take twelve months of existing telemetry, maintenance records and shift notes for one asset class at one site, and replay them through the proposed policy in observation mode, with nothing reaching a phone. The replay answers three questions before money is committed: how many cases the policy would have raised per shift, which recorded incidents it would have missed, and how many of its cases would have closed as instrumentation faults.' },
        { text: 'Observation mode also prices the dark stretches. Where the replay raises a case that the available data cannot resolve, that case closes as unresolvable, and the count of unresolvable cases is the argument for extending coverage, expressed in the unit an operation cares about, which is decisions it could not make. That count is worth more than a sensor quotation, because it comes from events the site has already had. The same replay shows which of the current alerts nobody acted on, and that list is usually cheaper to fix than the sensor estate.' },
        { text: 'Comparison with current practice should use measures a duty manager recognises: the share of the path under valid signal, the proportion of cases closing as instrumentation faults, the age of the oldest unassigned case, the time from breach to first human action, and the effort now spent assembling evidence for an audit. Any target set against those measures stays a hypothesis until the replay and a live parallel run have produced numbers of their own.' },
        { text: 'None of this moves the decision away from the operator. Judgement about whether product is safe stays with the people accountable for it, and a monitoring service implying otherwise would be a liability to the business that bought it. The design offers a faster and more complete account of what happened, assembled while the eight minutes still matter, and a record afterwards that somebody can defend.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Measured coverage',
    title: 'Excursions found rise with the share of the path measured',
    summary: 'Two reviews of the vaccine cold chain, ten years apart. Each bar is the share of studied storage points, transport legs or shipments found to have been exposed to freezing, grouped by how much of the distribution path the underlying studies measured.',
    interpretation: {
      establishes: 'How much of a distribution path is instrumented changes the excursion rate that path appears to have, by a wide margin and in one direction.',
      doesNotEstablish: 'These are vaccine studies. They carry no figure for chilled food, and no claim about what any particular site would find.',
      management: 'Treat the current excursion rate as a measurement artefact until the coverage of the path is known, and expect the rate to rise when coverage improves.',
    },
    source: 'Matthias and others, Vaccine, 2007; Hanson and others, Vaccine, 2017',
    href: 'https://pubmed.ncbi.nlm.nih.gov/17382434/',
    points: [
      { label: 'Transport legs, higher-income settings', value: 17, display: '16.7%', detail: 'The 2017 review found freezing during transport in 16.7 percent of cases in developed countries.' },
      { label: 'Single storage points or single legs', value: 35, display: '14% to 35%', detail: 'Across the scenarios reviewed in 2007, studies of one refrigerator or one leg found freezing exposure in 14 to 35 percent of cases.' },
      { label: 'Transport legs, lower-income settings', value: 35, display: '35.3%', detail: 'The same 2017 review found 35.3 percent in developing countries.' },
      { label: 'Whole path, measured end to end', value: 100, display: '75% to 100%', detail: 'In the six studies that measured temperature longitudinally through every segment of the chain, between 75 and 100 percent of shipments had been exposed to freezing.' },
    ],
  },
  {
    label: 'Alarm burden',
    title: 'Two consoles in five run above the manageable alarm rate',
    summary: 'Benchmarking of 37 operator consoles in process plants against the EEMUA 191 guide. Each bar is the share of consoles in that band. The third bar is the residual of the two published shares, derived here for this chart.',
    interpretation: {
      establishes: 'Alert volume beyond what an operator can work through is a measured condition in process operations, and it persists where alarms are added without a rate discipline.',
      doesNotEstablish: 'The benchmark covers refineries and chemical plants. No equivalent published rate exists for chilled storage, and these bars should not be read as one.',
      management: 'Agree a ceiling on cases per shift before the policy goes live, and treat a breach of that ceiling as a defect in the policy.',
    },
    source: 'ASM Consortium benchmarking against EEMUA 191, reported in Chemical Engineering',
    href: 'https://www.chemengonline.com/alarm-management-numbers/',
    points: [
      { label: 'Held the normal-operation rate', value: 33, display: 'About 1 in 3', detail: 'Under one alarm per operator per ten minutes, the rate EEMUA 191 recommends for normal running.' },
      { label: 'Reached the manageable band only', value: 25, display: 'About 1 in 4', detail: 'One to two alarms per ten minutes, which the guide describes as manageable.' },
      { label: 'Ran above the manageable band', value: 42, display: 'The remainder', detail: 'Derived by subtracting the two published shares, so roughly two consoles in five ran above the band the guide calls manageable.' },
      { label: 'Near the upset-condition guideline', value: 5, display: '2 of 37', detail: 'Only two consoles came close to the guideline of no more than ten alarms in the first ten minutes of a plant upset.' },
    ],
  },
];
