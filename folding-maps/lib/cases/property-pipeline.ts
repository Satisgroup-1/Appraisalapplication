import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
  slug: 'property-pipeline',
  image: '/images/case-property.svg',
  sector: 'Real estate',
  title: 'Making a property pipeline prove the stage it reports',
  summary: 'A transaction workspace in which a stage advances only on evidence somebody can point to.',
  status: 'Anonymised',
  brief: 'Redesigning a property pipeline around four stages, each with a minimum evidence set and a named colleague who clears it. Discovery takes a sample of live and recently closed transactions in one asset class and checks, for each, whether the stage recorded in the tracker is supported by the evidence actually held. The client is not named at their request. The workspace described here is a design, the benefits attached to it are targets agreed for the work, and the completed sample has not yet been supplied.',
  metrics: [
    { value: '4', label: 'stages a transaction clears', detail: 'Qualify, evidence, progress and complete' },
    { value: '5', label: 'kinds of evidence gap', detail: 'The categories the check records against each transaction' },
    { value: '1', label: 'list of open questions', detail: 'Every item carries a named holder and a date' },
  ],
  phases: [
    { label: 'Qualify', detail: 'Record the parties, the asset and the decision criteria.' },
    { label: 'Evidence', detail: 'Assemble the minimum document set the next stage requires.' },
    { label: 'Progress', detail: 'Carry every open question to a named holder and a date.' },
    { label: 'Complete', detail: 'Confirm the evidence set is current, then approve and archive.' },
  ],
  code: {
    title: 'Every stage change tests the evidence behind it',
    lines: ['deal = pipeline.open(enquiry)', 'evidence = documents.index(deal)', 'gate = stages.test(deal, evidence)', 'question = openItems.assign(gate.missing)', 'view = portfolio.aggregate(deal, question)'],
    nodes: ['Enquiries', 'Transaction record', 'Document index', 'Open-question queue', 'Portfolio view'],
  },
  nextSteps: ['Agree the minimum evidence set for each of the four stages', 'Run the gap check across a sample of live and closed transactions', 'Give every open question a named holder and a date', 'Repeat the same check after six weeks of live use'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'The client is not named here, because naming the business would identify its counterparties. The stage model, the workspace design and the benefits attached to them are targets agreed for the work, and none has been measured in production. The gap check described below sets out what the engagement is measuring. The firm has not yet supplied the completed sample, so no figure from it appears on this page.',
  thesis: 'A property pipeline is worth rebuilding only where a transaction can be tested against the evidence its recorded stage implies, and this engagement is built to test one proposition: that the delay everybody attributes to third parties begins with a question which entered the file weeks earlier and was assigned to nobody.',
  sceneLabel: 'Six weeks in',
  openingTitle: 'Six weeks of progress rest on an approval nobody can produce',
  openingParagraphs: [
    'Six weeks into a transaction the file looks healthy. Calls have been logged, three drafts of the report have gone back and forth, and the tracker shows the deal sitting comfortably in review. At the Thursday pipeline meeting somebody asks to see the approval that let it leave the evidence stage. Nobody can produce one. The hour that follows is spent establishing whether the approval was given and never written down, or was never given at all.',
    'That hour is the visible part. The invisible part started in week two, when a question about a restriction on the title arrived in an email addressed to two people, was read by both and was carried by neither. The tracker recorded none of it, because the tracker records stages and the stage had already been set.',
    'The situation above is drawn from the transactions this engagement read. No single deal is described and no counterparty is identifiable. The shape of it is what the engagement set out to test: work accumulates, the stage advances alongside the work, and the evidence the stage implies gets assembled later or left where it fell.',
  ],
  centralQuestion: 'Everything turns on whether one transaction record can carry a stage that is testable against the documents held, together with a list of open questions each of which has somebody’s name against it.',
  processTitle: 'Four stages, each with a minimum evidence set',
  systemTitle: 'One record connects evidence, questions and reporting',
  sections: [
    {
      heading: 'Recorded stage says nothing about evidence held',
      paragraphs: [
        { text: 'Property pipelines are usually built to record what people did. A call is logged, a document is uploaded, a stage is moved along, and the tracker shows a deal advancing. None of that is a claim anybody can test. The stage is set by whoever last touched the record, while the evidence that stage implies sits across inboxes, a shared drive and a data room three firms can write to. A pipeline assembled this way reports activity accurately and reports readiness by inference.' },
        { text: 'Discovery therefore measures the gap directly. The check draws a sample of transactions in one asset class, live and recently closed. For each of them it reads the stage recorded in the tracker, writes down the documents and approvals that stage implies, and marks which of those exist and are current on the day of the reading. Where the two disagree, the disagreement is classified into one of five kinds: an approval given but never recorded, a document whose current version cannot be identified, an open question with no named holder, a third-party reply that arrived and was never filed, and a deadline held in one place only. A file can carry more than one of them.' },
        { text: 'None of this would be peculiar to one firm. HM Land Registry has reported that of more than 4.4 million applications received in a year, more than 947,000 required a requisition, an average of 11.7 for every hundred applications from businesses filing register updates. It puts the cost to the conveyancing sector at £19.1 million a year, and the delay at up to three weeks for an affected registration. Every one of those is work submitted to a gate without the evidence the gate required, and discovered by the body on the far side of it.', sources: [0] },
        { text: 'Better document management would close only part of this. One of the five categories is a question raised in writing and carried by nobody, which no storage system detects at all. A document store answers where a file is. It does not answer whether the set is complete for the stage being claimed, or whose week the next step belongs in. Those are the two questions a pipeline meeting actually asks, and both are currently answered from memory.' },
      ],
    },
    {
      heading: 'Every late document began as an unassigned question',
      transition: 'Since a missing document is the symptom and a missing decision is the cause, the second half of the check dates the point at which each blocking item first appeared in writing.',
      paragraphs: [
        { text: 'Reconstruction runs backwards from the missed date. Take a transaction that completed three weeks late, find the item that held it, then find the earliest written trace of that item. The traces the check looks for are mundane ones. A solicitor mentions an unusual restriction in a covering email. A surveyor notes an access arrangement in passing. A lender asks for a document that will need a counterparty signature. At the moment each of them appears, none is yet a problem, and none has a name against it.' },
        { text: 'An early note becomes a late completion when there is nowhere to put it. The pipeline has stages, and each stage has a colleague accountable for clearing it. It has no list of open questions, so an item raised during evidence and falling due at completion has a home in neither. It lives in the memory of whoever read the email, and it surfaces again on the day the deadline makes it urgent.' },
        { text: 'The market treats delay of this kind as a fact of life. Figures published with the government’s home buying and selling reform roadmap in June 2026 put the average purchase at around 120 days, with one sale in three falling through, costing sellers about £400 million a year and the wider economy up to £1.5 billion. A paper from the Digital Property Market Steering Group attributes up to 8 percent of failed transactions to missing upfront information alone. Those are residential figures and this engagement is commercial, so they carry as context and no further. What they do establish is that a national reform programme has settled on the same mechanism: information assembled after an offer when it could have been assembled before one.', sources: [1, 3] },
        { text: 'That points the design at the stage boundary. A stage may advance when the named facts, documents and approvals belonging to it are present and current, and every question raised at any stage joins one list with a holder and a date until it is closed. Both halves are needed. An evidence test on its own leaves a question with nowhere to sit, and a question list on its own leaves the stage label untested. Together they turn the pipeline meeting into a review of exceptions.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 1 }],
    },
    {
      heading: 'Gate every stage and list every question',
      transition: 'With both halves of the test agreed, the design question becomes which part of the check software should perform and which part has to stay with a qualified professional.',
      paragraphs: [
        { text: 'Minimum evidence sets are the smaller half of the build. For each of the four stages the team writes down the documents, facts and approvals without which the stage cannot be claimed, and the workspace refuses the change until they are present. The list has to be short. A gate demanding everything a careful firm might one day want gets cleared by attaching whatever is to hand, which produces a compliant record and the same blind pipeline. Discovery holds each list to the items a colleague can name from the last deal that went wrong.' },
        { text: 'Extraction is where the temptation sits. A model reading a lease or a title register can propose the dates, parties and restrictions a gate asks for, and doing that well removes most of the typing. Closing the gate is a different act. RICS surveyed 3,148 chartered surveyors for its 2026 report on AI in commercial property and construction and found more than three quarters of commercial property respondents reporting some use of AI, 39 percent running early-stage pilots, and around 6 percent reporting widespread integration. The distance between trying a tool and depending on one is the distance this design has to cross, so extracted fields arrive as proposals and a qualified colleague confirms them before a stage moves.', sources: [2] },
        { text: 'The architecture underneath is deliberately ordinary. Enquiries create one transaction record. Documents are indexed against that record with their source and their date. The stage test runs against the index and returns what is missing. Anything missing becomes an item on the open-question list with a holder and a date, and the portfolio view is assembled from those two things alone. No separate reporting step exists, which is the point of the arrangement. The moment a status report is compiled by hand it will disagree with the record, and the record will lose.' },
        { text: 'Two objections deserve a hearing. The first is that gates slow good work down. A transaction that would have moved on Tuesday now waits while an approval is written down, and in a market where speed wins instructions that is a real cost paid on every deal to prevent a failure on a few. The second is that a larger platform would do all of this and more. A full CRM rollout was considered and set aside, because it would have digitised the activity record faster and left the readiness question exactly where it sits today.' },
        { text: 'The first objection is the more serious of the two, and it has a visible failure mode. Once colleagues start keeping a private spreadsheet of where the deals really are, the gates have been priced above what the work will bear and the design is wrong. So the pilot measures the burden as carefully as the benefit: minutes spent clearing each gate, the number of times a gate is overridden, and how many overrides are still open a week later. An override route has to exist, because a design without one gets defeated quietly.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Count the same gaps twice, six weeks apart',
      role: 'conclusion',
      transition: 'Because the burden and the benefit will both become visible inside the same six weeks, the acceptance test has to name in advance what gets counted on the last day of them.',
      paragraphs: [
        { text: 'What exists at this point is a stage model, an evidence set for each stage, an architecture and a specification for measuring the gap. No figure from that measurement has been supplied yet, nothing has been built into production, and no improvement has been observed. Every number attached to the business case for this work is therefore a target agreed with the client, and it should be treated as unproven until the firm returns the completed sample and the pilot reports.' },
        { text: 'The pilot loads the sampled transactions into the workspace, agrees the four evidence sets with the people who will clear them, and runs for six weeks with a live route for exceptions. The gap check runs once before the workspace goes live and once at the end, on the same definitions and by the same method. That comparison is the whole of the acceptance test. A single count would describe a sample; the second count is what turns it into evidence about the design.' },
        { text: 'Three results would justify extending the workspace to a second asset class: fewer transactions carrying a stage their evidence cannot support, open questions reaching the list within days of the email that raised them, and a gate-clearing burden colleagues will accept without keeping a second record. Falling short on the first two sends the stage definitions back for revision. Falling short on the third points at the interface before it points at the model. The test the whole design has to pass is the Thursday meeting, where somebody asks for the approval and the answer is either one click or the name of the person getting it.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '947,000', finding: 'More than 947,000 of over 4.4 million HM Land Registry applications in a year required a requisition, an average of 11.7 per hundred applications from business filers', implication: 'Work submitted to a gate without the evidence the gate requires is a measured, costed feature of UK property practice, and the party on the far side of the gate is the one who finds it.', source: 'HM Land Registry, The scale and cost of requisitions, 2024', href: 'https://hmlandregistry.blog.gov.uk/2024/10/22/the-scale-and-cost-of-requisitions/' },
  { statistic: '1 in 3', finding: 'Government figures published with the 2026 home buying and selling reform roadmap put the average purchase at around 120 days, with one sale in three falling through', implication: 'Late assembly of information is treated at national policy level as the mechanism behind delay and failure, which supports designing the pipeline around upfront evidence.', source: 'MHCLG, Home buying and selling reform roadmap, June 2026', href: 'https://www.gov.uk/government/consultations/home-buying-and-selling-reform/outcome/home-buying-and-selling-reform-roadmap' },
  { statistic: '6%', finding: 'RICS surveyed 3,148 chartered surveyors and found around 6 percent of commercial property respondents reporting widespread AI integration, against more than three quarters reporting some use', implication: 'Pilots are common in this sector and dependence is rare, so a design should place model output in front of a professional who confirms it before a decision moves.', source: 'RICS, AI in commercial property and construction report 2026', href: 'https://www.rics.org/news-insights/ai-in-commercial-property-and-construction-report-2026' },
  { statistic: '8%', finding: 'The Digital Property Market Steering Group attributes up to 8 percent of failed transactions to missing upfront information alone', implication: 'A share of transaction failure is caused by information that existed and was not available at the point of decision, which is the class of defect a stage gate can address.', source: 'Digital Property Market Steering Group, Smart Property Data Trust Framework', href: 'https://www.rics.org/content/dam/ricsglobal/documents/latest-news/DPMSG-Smart-Property-Data-Trust_V2.pdf' },
  { statistic: '4 functions', finding: 'NIST structures AI risk activity around govern, map, measure and manage', implication: 'Transaction automation needs a named operating manager, a context map, evaluated controls and a live route for handling failure.', source: 'NIST AI Risk Management Framework', href: 'https://www.nist.gov/itl/ai-risk-management-framework' },
];
