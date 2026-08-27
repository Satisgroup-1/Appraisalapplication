import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { googleRadisson, icoAi } from '@/lib/sources';

const cipdTurnover = { label: 'CIPD, Benchmarking employee turnover: latest trends and insights', href: 'https://www.cipd.org/uk/views-and-insights/thought-leadership/cipd-voice/benchmarking-employee-turnover/' };
const sonaPineapple = { label: 'Hotel Magazine, reporting Sona and Pineapple hospitality workforce analysis, 2025', href: 'https://thehotelmagazine.co.uk/hospitality-staff-turnover-drops-by-close-to-10/' };
const deMatosRecovery = { label: 'de Matos, Henrique and Vargas Rossi, Service Recovery Paradox: A Meta-Analysis, Journal of Service Research, 2007', href: 'https://journals.sagepub.com/doi/10.1177/1094670507303012' };
const doubleDeviation = { label: 'International Journal of Consumer Studies, The Burden of Double Deviation in Services: A Systematic Review, 2022', href: 'https://onlinelibrary.wiley.com/doi/10.1111/ijcs.12836' };
const empowermentRecovery = { label: 'International Journal of Hospitality Management, Service recovery through empowerment? HRM, employee performance and job satisfaction in hotels', href: 'https://www.sciencedirect.com/science/article/abs/pii/S0278431918306960' };

export const article: NewsEditorial = {
  title: 'Guest recovery depends on the colleague most likely to leave',
  standfirst: 'An experienced colleague resolves a ruined stay faster than any integration can assemble the case. Hospitality also loses those colleagues faster than any other UK sector.',
  thesis: 'Connected guest records pay off on the shifts when nobody with years of local knowledge is working. That makes the weakest shift the design target, and it makes handling cost and avoided second failures the only returns the published evidence will support.',
  sceneLabel: 'The late arrival',
  sceneTitle: 'Quarter past one, and the assigned room is unusable',
  sceneParagraphs: [
    'The guest reaches the desk at quarter past one after a diverted flight. The reservation is confirmed and paid, the property management system shows the room assigned, and a maintenance note taken in the early evening marks it out of service. The loyalty record sits under an older email address, so the profile on screen shows no status at all. One colleague is on duty. The duty manager is asleep on site and can be woken.',
    'Whether this stay is recovered in ten minutes or ninety depends almost entirely on who is standing at that desk. A colleague in their fourth year knows which rooms are genuinely unusable, which maintenance notes are stale, what the duty manager will approve without being woken, and which nearby property will take a walked guest at that hour. A colleague in their third week knows none of it.',
  ],
  sections: [
    {
      heading: 'Experienced colleagues beat the recovery case on speed',
      paragraphs: [
        { text: 'That advantage is real and it is not sentimental. The colleague in their fourth year is running a reconciliation in their head that no connector has been asked to perform. They hold the booking, the current state of the floor, the standing arrangement with the property across the square, the manager’s tolerance for a waived night, and the guest’s face. They reach a decision while a case-management screen is still resolving identity.' },
        { text: 'Set out formally, that work has five parts. Establish who the guest is across booking reference, channel identifier and loyalty record. Establish what was sold to them. Establish what the building can deliver tonight, which depends on housekeeping and maintenance as much as on inventory. Establish what the colleague may offer without asking permission. Record what was promised, so the morning shift is not told a different story.' },
        { text: 'Written down, the sequence looks like a specification, and the specification is the part of this subject that has been published most often. It is also the part nobody argues with. Every operator agrees that identity should resolve correctly and that a colleague should know the limit of their own authority. Agreement at that level costs nothing and decides nothing, because the question a property faces is whether building it changes an outcome the experienced colleague was already producing.' },
        { text: 'The honest answer, for that colleague, is that it does not. With them on shift, a connected recovery record is a slower route to a decision they can already reach, and a badly designed one will stop them reaching it at all. That is a real cost and it is paid on every shift the system sits in the way. Front-of-house teams already carry several systems introduced on the same reasoning, and each one added a screen to be checked before a decision could be made. Any case for building the thing has to be made somewhere else.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Hospitality cannot keep the experience recovery relies on',
      transition: 'Because the case for a recovery record cannot be won against the best colleague on the rota, it has to be argued against the composition of the rota itself.',
      paragraphs: [
        { text: 'Attrition in the sector is the highest in the economy. CIPD’s benchmarking of UK employee turnover puts hospitality at around 52 percent a year against an all-industry average near 34 percent, with public administration and defence at about 25 percent. The same benchmarking records accommodation and food services as having the lowest average tenure of any industry group.', sources: [cipdTurnover] },
        { text: 'Improvement does not change the order of magnitude. An analysis by Sona and Pineapple covering more than 35,000 hospitality employees reported annual turnover falling from about 75 percent to about 67 percent in the year to late 2025, and the trade press covered that as a substantial improvement. It is one. A property at 67 percent still replaces two thirds of its people every year.', sources: [sonaPineapple] },
        { text: 'Read those figures against the rota and the design question changes shape. A property cannot schedule its failures, so the colleague who takes the call is drawn from the whole rota, and at this rate of churn the experienced part of that rota is being replaced continuously. The spread of recovery quality inside a single property is therefore wide, and the wide part is at the bottom. Most operators know this and manage it by rostering a strong colleague onto the difficult shifts, which works until that person resigns, takes leave or is needed elsewhere in the building. The design has to answer for the nights when that cover fails, and for what the property owes the guest on them.' },
        { text: 'A much smaller system than the specification implies follows from that. The colleague in their third week does not need a recovery workflow. They need four facts they cannot otherwise assemble at speed: which guest this is across the booking and loyalty records, what was sold, what the building has available tonight, and what they may offer before waking anyone. Matching a guest across records is the only item on that list carrying a data protection consequence, and ICO guidance expects the purpose, access and retention for that processing to be documented before it runs.', sources: [icoAi] },
        { text: 'Permission is the item most often left out, and it decides whether the record helps or obstructs. A screen that shows a colleague what is available while leaving them to guess what they may offer has moved the delay from the search to the approval, and the guest waits either way. Studies of frontline hotel employees report empowerment as a positive predictor of service recovery performance, which is a finding about permission, and no quantity of connected data supplies it.', sources: [empowermentRecovery] },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'Recovery may not buy what the business case assumes',
      role: 'counterargument',
      transition: 'Setting the design target at the weakest shift invites the two hardest objections, and both of them attack the return: whether recovery pays for itself at all, and whether a property with this rate of churn can keep any record accurate.',
      paragraphs: [
        { text: 'Evidence on service recovery does not support the loyalty claim usually attached to it. The meta-analysis by de Matos, Henrique and Vargas Rossi pooled the published studies and found the recovery effect significant and positive on satisfaction, and nonsignificant on repurchase intentions, word of mouth and corporate image. A well-handled failure makes the guest feel better about the failure. The pooled evidence does not show it bringing them back.', sources: [deMatosRecovery] },
        { text: 'Take that seriously and the return most recovery business cases are written on disappears. If the payoff is absent from repeat stays, what remains is narrower and duller: the labour cost of the handling itself, the compensation given because nobody could establish what the guest was owed, and the failures that get worse because the first attempt to fix them failed. Service research calls the last of those a double deviation, and reviews of it find the second failure eroding trust further than the original one did.', sources: [doubleDeviation] },
        { text: 'Churn cuts the other way as well. A property replacing most of its front-of-house staff each year will struggle to keep any system accurate, and a recovery record is worth no more than the maintenance notes and room states feeding it. Few people train hard on a tool they expect to use for a single season. Override reasons go unrecorded, connectors drift, and the record becomes another screen that has to be checked against a phone call. Published examples of connected guest data come from groups such as Radisson with central engineering teams, described in their vendor’s own account, and a four-property operator has none of that.', sources: [googleRadisson] },
        { text: 'Those objections narrow the case and they do not close it. Handling cost and avoided second failures are smaller prizes than loyalty, and they have the advantage of being measurable at one property in one quarter, which loyalty has never been. The maintenance risk is real and it argues for connecting less, so the number of things that can drift stays small enough for one named person to check on a Monday morning. The sharpest form of the objection is that the same budget would buy retention, and a property that held on to its people for another year would need less of this. That is probably true. It is also unavailable to most operators at the wage the sector currently pays, and the connected record is what remains once the retention argument has been made and lost.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 0 }],
    },
    {
      heading: 'Build for the third week, measure the handling',
      role: 'conclusion',
      transition: 'Once the return is stated as handling cost and avoided second failures, the release test follows from it, and it is a test about the least experienced person on the rota.',
      paragraphs: [
        { text: 'For the guest at quarter past one, success is a colleague in their third week reaching the decision the fourth-year colleague would have reached, in a comparable time, without waking anyone who did not need waking. That is the whole specification. It is narrower than a recovery platform, and it can be tested on a single night shift.' },
        { text: 'Staff the pilot deliberately, because this is where parallel runs usually go wrong. Running it on the day shift with the strongest team measures the case where the system has least to offer, and it produces a flattering result nobody can act on. Run it at night, on one disruption type, at a small number of properties, and compare handling time, compensation given, escalations and repeat contacts with the same shift before the change. Report the spread across colleagues, because the argument here concerns the bottom of that spread.' },
        { text: 'Two results should stop the release. One is a colleague reaching a worse decision because the screen was authoritative and stale. The other is an experienced colleague slowed by a route built for somebody else, which is the version of this failure the industry has already had once with printed policy manuals. Neither of those is a reason to leave the property on five systems and a good memory, and both are reasons to keep the built part small.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Sector attrition',
    title: 'Experience is the input hospitality retains worst',
    summary: 'Approximate annual attrition by UK sector, as reported in CIPD benchmarking of employee turnover. The hospitality figure covers accommodation and food services.',
    interpretation: {
      establishes: 'A property cannot assume that the colleague handling a service failure has been there long enough to know the building.',
      doesNotEstablish: 'The rates say nothing about how well any individual colleague handles a disruption, and nothing about whether a connected record improves it.',
      management: 'Set the design target at the colleague in their first month, and report the spread across the team alongside the average.',
    },
    source: 'CIPD, benchmarking of UK employee turnover (sector attrition rates)',
    href: 'https://www.cipd.org/uk/views-and-insights/thought-leadership/cipd-voice/benchmarking-employee-turnover/',
    points: [
      { label: 'Hospitality', value: 52, display: 'About 52%', detail: 'Accommodation and food services records the highest churn and the lowest tenure of any UK industry group.' },
      { label: 'All UK industries', value: 34, display: 'About 34%', detail: 'The all-industry average against which the sector figure should be read.' },
      { label: 'Public administration and defence', value: 25, display: 'About 25%', detail: 'The lowest-churn sector in the same benchmarking, included to show the range.' },
    ],
  },
  {
    label: 'Recovery outcomes',
    title: 'Recovery restores satisfaction and little else',
    summary: 'Pooled findings of a meta-analysis of the service recovery paradox. Bar length marks whether the cumulative mean effect was reported as significant. It is not an effect size.',
    interpretation: {
      establishes: 'Across the pooled studies a good recovery raised satisfaction, and it did not raise repurchase intention, word of mouth or corporate image.',
      doesNotEstablish: 'The analysis covers service recovery in general and tests no hotel system, so it cannot say what a connected recovery record would do at one property.',
      management: 'Write the business case on handling cost and avoided second failures, and treat any loyalty benefit as unproven until the property measures it.',
    },
    source: 'de Matos, Henrique and Vargas Rossi, Service Recovery Paradox: A Meta-Analysis, Journal of Service Research, 2007',
    href: 'https://journals.sagepub.com/doi/10.1177/1094670507303012',
    points: [
      { label: 'Satisfaction', value: 100, display: 'Significant positive effect', detail: 'The cumulative mean effect supported the recovery paradox on stated satisfaction.' },
      { label: 'Repurchase intentions', value: 0, display: 'No significant effect', detail: 'The pooled effect on intention to buy again was reported as nonsignificant.' },
      { label: 'Word of mouth', value: 0, display: 'No significant effect', detail: 'The pooled effect on what customers told other people was reported as nonsignificant.' },
      { label: 'Corporate image', value: 0, display: 'No significant effect', detail: 'The pooled effect on how customers regarded the firm was reported as nonsignificant.' },
    ],
  },
];
