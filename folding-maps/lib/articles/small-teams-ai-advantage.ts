import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { oecdWorkforce, ukAdoption } from '@/lib/sources';

const sbaAdvocacy = { label: 'US SBA Office of Advocacy, AI in Business, 2025', href: 'https://advocacy.sba.gov/wp-content/uploads/2025/09/Research-Spotlight-AI-in-Business-Small-Firms-Closing-In_-092425.pdf' };

export const article: NewsEditorial = {
  title: 'Deciding takes a morning. Delivering takes capacity a small firm must build',
  standfirst: 'Proximity makes the decision cheap. Acting on it needs data somebody has cleaned, a reviewer with hours in the diary and an engineer who will still be there in six months. OECD survey evidence puts fewer than a third of SME adopters near any of that.',
  thesis: 'For a firm of twenty people the binding constraint on AI is the stock of data work, review time and engineering attention available in a quarter, and that stock is far smaller than the speed of the decision suggests.',
  sceneLabel: 'Twenty people',
  sceneTitle: 'Everyone who matters fits round one table by half past nine',
  sceneParagraphs: [
    'In a firm of twenty, the person who knows the process, the person who pays for it and the person who would build it are already in the same room on a Tuesday morning. An hour of argument settles which recurring job to go after, what a good result would look like and who needs to be told. The decision costs one morning of one week, and it is often a better decision than a larger organisation would reach in a quarter.',
    'That hour cannot settle when the work starts. The person who would build it also maintains the order system, the person who knows the process is the process, and the records the idea depends on sit in a spreadsheet nobody has reconciled since March. The meeting produced a decision. It did not produce an engineer, a clean field or an afternoon of review time.',
  ],
  sections: [
    {
      heading: 'Decision speed is the cheapest thing on the table',
      paragraphs: [
        { text: 'Proximity is real. A firm of twenty has no translation layer between the person who sees the exception and the person who can authorise a change, so the interval between noticing a problem and agreeing to do something about it runs in days. That interval is where most published advice for smaller firms stops. It is also the part of the sequence that was never expensive, which is why it explains very little about the number of smaller firms with nothing running.' },
        { text: 'Adoption tracks headcount closely enough to be suspicious of any advantage story. DSIT research for the UK government, drawing on a survey of 3,500 businesses, records AI use at 14 percent of micro businesses with five to nine staff, 23 percent of medium-sized businesses and 36 percent of large ones. If short decision lines were the binding constraint, that gradient would run the other way. Something that scales with headcount is doing the work, and headcount buys specialists, review time and slack.', sources: [ukAdoption] },
        { text: 'Three things scale with size, and none of them was in the room on Tuesday morning. The first is data somebody has already made fit to use. The second is review capacity, meaning a person qualified to judge whether an output is right who is not also the person who produced it. The third is engineering attention that outlives the pilot, because a service nobody maintains stops being a service within two release cycles. Review capacity is the scarcest of the three, because it is the one thing that cannot be bought in for a fortnight and handed back. A morning of agreement buys none of the three.' },
      ],
    },
    {
      heading: 'Four named roles stand between decision and release',
      transition: 'Because all three scarce inputs are forms of somebody’s attention, the constraint resolves into a question about who, specifically, is available to give it.',
      paragraphs: [
        { text: 'A smaller firm needs four named people before it builds anything: a director answerable for the result, the manager who runs the process day to day, whoever controls the data the service is allowed to read, and the engineer who will maintain it. In a firm of twenty that may be three people and one of them wearing two hats. The roles still have to be named, and naming them is not the same as hiring for them.' },
        { text: 'Naming them is useful because it exposes double-counting immediately. If the manager who runs the process is also the person who will review the output, what the firm has is a second opinion from the author. If the engineer who will maintain the service already maintains everything else, the maintenance commitment is being taken out of work that is already scheduled. Neither problem is visible in a decision meeting. Both are visible the moment four roles are written on one page. A large organisation hides double-counting inside a headcount plan. A firm of twenty cannot hide it and gains nothing by trying.' },
        { text: 'The OECD surveyed more than 5,000 SMEs across seven countries and found generative AI in use at 31 percent of them. Among those users, 28.6 percent had issued any internal guidance on how staff should use it, and under 30 percent reported employees taking part in AI-related training. The report’s own summary is that a third or fewer of SME adopters are doing anything about training, guidelines or the legal position. Use has arrived in these firms. The capacity that supports it has not.', sources: [oecdWorkforce] },
        { text: 'That gap sets what a first release has to produce beyond a working feature. It needs an evaluation set somebody can rerun, a written rule about which records the service may read, and a log of what it did that a reviewer can read in ten minutes. Each release should then end with an expand, adjust, hold or stop decision, taken by the named director on the evidence the release produced.' },
        { text: 'None of that is governance in the sense a large organisation means the word. It is the minimum record that lets a second person take the work over. In a firm where one resignation removes a quarter of the technical capability, the ability to hand a service to somebody else is the control that matters most, and it costs a few hours per release to keep current.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 2 }, { kind: 'system', afterParagraph: 3 }],
    },
    {
      heading: 'Gap is closing faster than this argument allows',
      role: 'counterargument',
      transition: 'A capacity argument holds only if capacity is what holds smaller firms back, and the adoption series has recently started to point the other way.',
      paragraphs: [
        { text: 'Small firms are catching up, and quickly. The US Census Bureau’s Business Trends and Outlook Survey, read by the Small Business Administration’s Office of Advocacy, put AI use among firms under 250 employees at 6.3 percent in early 2025 and 8.8 percent by that August, against 11.1 percent for large firms at the earlier reading. The Advocacy note describes small firms as roughly a year behind large ones and closing. On that trajectory the capacity problem is being solved without anyone naming a role.', sources: [sbaAdvocacy] },
        { text: 'The mechanism behind that closing is real. Most of what a smaller firm wants from AI now arrives inside software it already rents, so there is no build, no data pipeline and no engineer to name. Drafting, summarising, transcription and search turn up as features in the customer system and the accounting package. An argument about delivery capacity aimed at bespoke work says nothing about a firm that gets most of the benefit by turning on a setting.' },
        { text: 'There is a worse version of the same objection. A firm told that it needs four named roles, an evaluation set and a data rule before it starts will conclude that it should not start, and it will be right to conclude that if the first candidate is a bespoke workflow. Advice built on constraints has an obvious failure mode, which is that it supplies a reason to wait, and waiting is what most of these firms have been doing already.' },
        { text: 'Both points hold for tools bought off the shelf, and neither holds once a service touches the firm’s own records. When something reads a customer file, writes to an order or produces output a client sees, the roles reappear, because somebody has to decide what it may read and somebody has to answer for it when it is wrong. The useful line runs between use that stays inside one person’s working day and use that enters the operating record. The first needs almost nothing. The second needs all four.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 0 }],
    },
    {
      heading: 'Size the first release to the capacity available',
      role: 'conclusion',
      transition: 'Since the four roles bind only once a service reaches the firm’s own records, the practical question is how large a first release the available capacity will support.',
      paragraphs: [
        { text: 'Start by counting, before choosing. Capacity is countable in a small firm in a way it is not in a large one: the hours per week the process manager can give to review, the days per month the engineer is not already committed, and whether the records the idea needs are in one place or three. Those three numbers, gathered honestly in an afternoon, set the size of the first release. Most firms pick the workflow first and meet the numbers later, which is where the pilot stalls.' },
        { text: 'A release sized to that count looks unambitious and is the only kind that finishes. One recurring job, one outcome measured before the work starts, one reviewer with named hours in the diary, and a written list of what the firm has decided not to attempt this quarter. The exclusions do more work than the inclusions, because every extra candidate competes for the same manager, the same records and the same engineer. The same count decides what the firm should refuse to promise anyone outside the delivery group, since a release sized to one reviewer will not absorb a second department’s requests.' },
        { text: 'Proximity remains an advantage, and it does more for the second release than the first. A firm of twenty can look at what a release actually did, take the expand, adjust, hold or stop decision on that evidence, and act on it the same week. Large organisations struggle at that point. Short decision lines pay once there is something to decide on, and producing that something is a capacity problem.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'SME preparation',
    title: 'Use has outrun the preparation that would support it',
    summary: 'A representative 2024 OECD survey of more than 5,000 SMEs in seven countries. Each measure has its own respondent base and should be read on its own.',
    interpretation: {
      establishes: 'Generative AI is in use across a material share of surveyed SMEs, while internal guidance and staff training remain uncommon among those same users.',
      doesNotEstablish: 'The survey does not measure delivery capacity, does not show that unprepared use fails, and does not compare results between prepared and unprepared firms.',
      management: 'Treat written guidance, training and a named reviewer as part of the first release, on the evidence that most surveyed peers have deferred all three.',
    },
    source: 'OECD, Generative AI and the SME Workforce, 2025',
    href: 'https://www.oecd.org/en/publications/generative-ai-and-the-sme-workforce_2d08b99d-en/full-report.html',
    points: [
      { label: 'SMEs using generative AI', value: 31, display: '31%', detail: 'Just under a third of surveyed SMEs reported generative AI in use.' },
      { label: 'Users with internal guidance', value: 28.6, display: '28.6%', detail: 'Share of SME users that had issued guidance to staff on how generative AI should be used.' },
      { label: 'Users reporting staff training', value: 30, display: 'under 30%', detail: 'Fewer than three in ten SME users reported employees taking part in AI-related training.' },
    ],
  },
  {
    label: 'Adoption gap',
    title: 'Smaller firms are closing the gap on their own',
    summary: 'Census BTOS surveys around 200,000 US businesses every two weeks. The two small-firm readings are six months apart and cover firms under 250 employees.',
    interpretation: {
      establishes: 'Reported AI use among US small firms rose over the six months to August 2025 and moved closer to the large-firm rate.',
      doesNotEstablish: 'The survey does not say what the AI was used for, whether it touched operating records, or whether the reported use was sustained.',
      management: 'Read rising peer adoption as a reason to scope a first release now, and read the remaining gap as a limit on how ambitious that release should be.',
    },
    source: 'US SBA Office of Advocacy, AI in Business, 2025',
    href: 'https://advocacy.sba.gov/wp-content/uploads/2025/09/Research-Spotlight-AI-in-Business-Small-Firms-Closing-In_-092425.pdf',
    points: [
      { label: 'Small firms, early 2025', value: 6.3, display: '6.3%', detail: 'Share of US firms under 250 employees reporting AI use in production about six months before August 2025.' },
      { label: 'Small firms, August 2025', value: 8.8, display: '8.8%', detail: 'The same measure taken again in August 2025.' },
      { label: 'Large firms, earlier reading', value: 11.1, display: '11.1%', detail: 'Reported AI use among firms of 250 employees or more at the earlier of the two readings.' },
    ],
  },
];
