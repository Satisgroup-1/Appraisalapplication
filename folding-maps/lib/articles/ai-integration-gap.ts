import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { oecdWorkforce, ukAdoption, ukBusinessData } from '@/lib/sources';

const onsBusinessAi = {
  label: 'ONS, Artificial intelligence in UK businesses, 2023 to 2026',
  href: 'https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/articles/artificialintelligenceinukbusinesses/2023to2026',
};

const klarnaLaunch = {
  label: 'Klarna, AI assistant handles two-thirds of customer service chats in its first month, February 2024',
  href: 'https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/',
};

const klarnaReversal = {
  label: 'Forbes, Klarna reverses AI push, says customers prefer human support, May 2025',
  href: 'https://www.forbes.com/sites/quickerbettertech/2025/05/18/business-tech-news-klarna-reverses-on-ai-says-customers-like-talking-to-people/',
};

export const article: NewsEditorial = {
  title: 'Only a fifth of UK AI users have connected it to a business system',
  standfirst: 'Reported AI use keeps climbing while the depth of that use barely moves. The firms closing the gap join one model to the system that runs the work and watch a number they already report.',
  thesis: 'AI produces an operating return when it is joined to the system of record, and the test of that join is movement in a measure the business was already reporting before the tool arrived.',
  sceneLabel: 'The monthly review',
  sceneTitle: 'Every licence is in use and the cycle time has not moved',
  sceneParagraphs: [
    'The monthly review of a services firm with a hundred and twenty staff opens on the technology page. Almost every employee holds an assistant licence, weekly use has risen again, and the head of technology has the chart to prove it. The operating page follows. Time from enquiry to proposal, first-time quality and work in progress all sit close to where they were in February. The finance director asks what the licences have bought.',
    'The answers around the table are all true and none of them settles the question. Drafts come back faster. Research that took an afternoon takes an hour. Meeting notes write themselves. Every one of those gains lands inside an individual’s working day, while the route from enquiry to accepted proposal still runs through four people and two systems, and no part of that route has changed.',
    'The firm is neither unusual nor badly run. It has bought the part of AI that arrives ready to use, and it has not yet commissioned the part that has to be built.',
  ],
  sections: [
    {
      heading: 'Adoption counts differ by survey and none measures return',
      paragraphs: [
        { text: 'Three UK surveys published within a year of each other put business AI use at 41 percent, 29 percent and 16 percent. The UK Business Data Survey asked businesses that handle digitised data and found 41 percent using AI for at least one purpose. The Office for National Statistics asked the wider business population in June 2026 and found 29 percent using at least one AI technology. Government adoption research, working to a different definition again, found 16 percent.', sources: [ukBusinessData, onsBusinessAi, ukAdoption] },
        { text: 'None of those figures is wrong and none of them answers a finance director. A survey that counts any use will count an analyst who summarised a call on Tuesday alongside a firm whose credit checks now pass through a model. The first is a personal habit that leaves the operating record untouched. The second alters how work is controlled, who answers for an error, and what the firm can safely promise a customer. Both count toward the same headline percentage.' },
        { text: 'The ONS series also measures how far use has travelled inside the firms reporting it. Since September 2023 the average number of AI technologies in use per adopting business has moved from about 1.4 to about 1.6, while the share of businesses reporting any use has roughly tripled. Adoption is spreading sideways across the economy and going very little deeper inside each firm. A headline that triples on a base that barely moves describes distribution, and it says nothing about depth.', sources: [onsBusinessAi] },
        { text: 'That is the shape of the problem the review has to solve. Licence counts and weekly active users record how many people have been given access to a capability. The narrower measure is the share of that activity joined to a system that carries the work, and pointed at a number the firm was already reporting. Two firms with identical licence counts can fall on opposite sides of that measure, and the operating page will tell them apart long before the technology page does.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 0 }],
    },
    {
      heading: 'Connecting one system forces every buried decision into view',
      transition: 'A count of adopters cannot show a return, so the figure to ask for is the one that records whether the tool has been joined to work the firm already measures.',
      paragraphs: [
        { text: 'Among UK businesses already using AI, 21 percent reported that their tools were integrated with an existing business system. The rate runs from 18 percent among sole traders to 57 percent among large businesses, with small and medium firms level at 31 percent. The spread by sector is wider still: 39 percent in information and communication against 12 percent in manufacturing and 14 percent in construction. Integration is most common where the work already sits inside software.', sources: [ukBusinessData] },
        { text: 'Those figures flatter the field. The survey counts an assistant embedded in office software as integration, so the 21 percent includes connections that changed no decision at all. The number is best read as a ceiling. Even on that generous definition, four in five AI-using businesses have their tools running alongside the systems where the work is recorded.', sources: [ukBusinessData] },
        { text: 'Building the connection repays its cost through what it obliges a firm to settle. It has to decide which record is authoritative when two of them disagree, which fields must be present before work can start, which outputs may pass without a human reading them, and which exception stops the run and goes to a named person. A firm can leave all of that open while the tool sits beside the work. It cannot leave it open once the tool is inside the work.' },
        { text: 'Klarna’s customer service assistant is the clearest public account of what that changes. In February 2024 the company reported that the assistant had handled 2.3 million conversations in its first month, about two thirds of its service chats, that average resolution time had fallen from 11 minutes to under 2 minutes, and that repeat enquiries had dropped by a quarter. Resolution time and repeat contact were on Klarna’s operating report before the assistant existed, which is the reason the change could be seen at all.', sources: [klarnaLaunch] },
        { text: 'The transferable step has nothing to do with that volume. A services firm should choose the measure before the connector: elapsed time from an eligible enquiry to an accepted outcome, first-time quality, rework, and the effort spent clearing exceptions. A measure invented for the pilot, and reported only by the team running it, will not survive its first contact with the finance function.' },
      ],
      exhibits: [
        { kind: 'evidence', view: 1, afterParagraph: 0 },
        { kind: 'system', afterParagraph: 2 },
      ],
    },
    {
      heading: 'Connection scales a mistake as fast as a gain',
      role: 'counterargument',
      transition: 'Forcing those decisions into the open carries a cost, and a connected tool can also drive a poor decision further and faster than an informal habit ever could.',
      paragraphs: [
        { text: 'Klarna went on to make the case against itself. In May 2025 its chief executive said publicly that the company had pushed cost efficiency too hard, that quality had suffered as a result, and that it would recruit human agents again for the work the assistant handled badly. The integration was real and the reported measures did move. The measures chosen were resolution time and repeat contact, and neither would register a customer who was answered quickly, was answered poorly, and never came back.', sources: [klarnaReversal] },
        { text: 'Below that scale the objection is simpler. A formal connection has a build cost, a control burden and a permanent maintenance obligation, and a good deal of the value being reported today falls outside any workflow at all. OECD survey respondents most often named improved employee performance as the benefit of generative AI, although the survey did not measure how large that improvement was or where in the working day it landed. The shallow pattern the ONS series records is open to a reading that favours the sceptic as well. Firms may be holding AI at the edge of the work deliberately, because the cheap half of the benefit arrives with the licence and the expensive half rests on assumptions about volume and quality that a mid-sized firm cannot yet test.', sources: [oecdWorkforce] },
        { text: 'So the boundary deserves stating plainly. Personal assistance is the right answer where the consequence is local, the volume is low, and the person using the output is competent to judge it. Integration repays its cost where work crosses people or systems, where the same decision recurs often enough to repay being designed, and where a failure has to be explained outside the team that caused it. On either side of that line, one throughput measure and one quality measure should be named before anything is built.' },
      ],
    },
    {
      heading: 'Fund one workflow, one connector and one measure',
      role: 'conclusion',
      transition: 'If a connection can amplify an error as readily as a gain, the choice of measure has to be settled before the connector is commissioned.',
      paragraphs: [
        { text: 'For the finance director the next unit of analysis is a single workflow. Name the manager answerable for it. Record what it costs today in elapsed time, rework and exception handling. Define what an accepted outcome looks like in that particular workflow, and list the records and permissions the work needs before a model is allowed near it.' },
        { text: 'Then commission the connection against two figures that already appear in the management pack, one for throughput and one for quality, and agree in advance what movement in them would justify funding a second workflow. Any improvement has to survive the review time and exception effort added to produce it, which is where reported gains most often disappear. Set the observation window before the release as well, because a workflow that runs a few times a week needs a longer look than one that runs a hundred times a day.' },
        { text: 'The size gradient in the survey reads as a budget statement. Large businesses report integration more often because they fund the data preparation, the redesign and the staff time around the licence, while smaller firms commonly fund the licence alone and expect the rest to follow. That difference is a spending decision, and it is available to a hundred-person firm on one workflow at a time. It is not available across ten at once.' },
        { text: 'None of this makes the technology page wrong. It reports something real, which is that colleagues are willing to use these tools and have found their own uses for them. The management task is to take one of those uses, put it inside the operating record, and let a number the firm already publishes decide whether the next connection gets funded.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Adoption counts',
    title: 'One question about AI use, three official answers',
    summary: 'Three UK statistical sources covering the same period report materially different adoption rates, because each asks a different population a differently worded question.',
    interpretation: {
      establishes: 'Reported UK business AI use ranges from 16 to 41 percent depending on the survey population and the definition of use applied.',
      doesNotEstablish: 'The three bars share no denominator, so the differences between them cannot be read as growth, decline or a conversion funnel.',
      management: 'Name the survey and its population whenever an adoption rate is quoted, and avoid building an investment case on the highest available figure.',
    },
    source: 'UK Business Data Survey 2026; ONS Business Insights and Conditions Survey, June 2026; DSIT AI Adoption Research 2026',
    href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
    points: [
      { label: 'Businesses handling digitised data', value: 41, display: '41%', detail: 'UK Business Data Survey 2026: share of businesses handling digitised data that reported using AI for at least one purpose.' },
      { label: 'All UK businesses, June 2026', value: 29, display: '29%', detail: 'ONS Business Insights and Conditions Survey: share of UK businesses reporting at least one AI technology in use.' },
      { label: 'DSIT adoption research', value: 16, display: '16%', detail: 'DSIT AI Adoption Research 2026: share of UK businesses using at least one AI technology on that survey’s definition.' },
    ],
  },
  {
    label: 'Integration by size',
    title: 'Integration climbs with size and stalls in the middle',
    summary: 'Among UK businesses already using AI, the share reporting integration with an existing business system rises from 18 percent at sole traders to 57 percent at large businesses, with small and medium firms level at 31 percent.',
    interpretation: {
      establishes: 'Reported system integration among AI users is around three times as common in large businesses as among sole traders, and flat across the small and medium bands.',
      doesNotEstablish: 'The survey does not show that size caused integration, and it counts light forms of connection such as an assistant embedded in office software.',
      management: 'Budget the data preparation, the workflow redesign and the staff time separately from the licence, because the connector supplies none of them.',
    },
    source: 'UK Business Data Survey 2026',
    href: 'https://www.gov.uk/government/statistics/uk-business-data-survey-2026/uk-business-data-survey-2026',
    points: [
      { label: 'All AI-using businesses', value: 21, display: '21%', detail: 'Share of AI-using businesses reporting that their tools are integrated with an existing business system.' },
      { label: 'Sole traders', value: 18, display: '18%', detail: 'Reported system integration among sole traders already using AI.' },
      { label: 'Micro businesses', value: 27, display: '27%', detail: 'Reported system integration among AI-using micro businesses.' },
      { label: 'Small businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using small businesses.' },
      { label: 'Medium businesses', value: 31, display: '31%', detail: 'Reported system integration among AI-using medium businesses.' },
      { label: 'Large businesses', value: 57, display: '57%', detail: 'Reported system integration among AI-using large businesses.' },
    ],
  },
];
