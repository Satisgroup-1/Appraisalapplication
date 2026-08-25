import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'yacht-operations',
    image: '/images/case-yacht.svg',
    sector: 'Marine',
    title: 'A calmer operating system for a growing yacht business',
    summary: 'Answering one customer’s question means opening several records and asking somebody. The engagement has specified how that cost will be counted, so the first release can be judged against it.',
    status: 'In progress',
    brief: 'The engagement is building a shared operating record for a specialist sailing business. Discovery has located the cost in the assembly a colleague performs to answer a routine customer question, and has specified the count that will measure it. Everything here describing the first release is a design target agreed for the work.',
    metrics: [
      { value: '5', label: 'record types the count will cover', detail: 'Mailbox, job sheet, supplier, accounts, colleague' },
      { value: '1', label: 'named colleague per open commitment', detail: 'Design target for the first release' },
      { value: '0', label: 'customer messages sent without approval', detail: 'Boundary agreed for the first release' },
    ],
    phases: [
      { label: 'Capture', detail: 'Take the event where the work already happens.' },
      { label: 'Resolve', detail: 'Attach it to one customer, vessel and project.' },
      { label: 'Derive', detail: 'Read project state from the recorded events.' },
      { label: 'Assign', detail: 'Put the next action in one named queue with a date.' },
    ],
    code: {
      title: 'One append-only history sits behind every derived state',
      lines: ['event = capture(mailbox, jobSheet, supplier)', 'identity = resolve(customer, vessel, project)', 'history.append(event, identity, actor)', 'state = derive(history)', 'queue = assign(state.nextAction, colleague)'],
      nodes: ['Mailbox and job sheet', 'Identity registry', 'Event history', 'Derived project state', 'Named action queue'],
    },
    nextSteps: ['Agree the project sample and take the count before the release ships', 'Release the shared record with capture inside existing tools', 'Review every open commitment carrying no named colleague weekly', 'Decide on connected documents only after the second count'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'This engagement is in progress. Discovery has produced a design and a measurement specification, and it has produced no measured result: the count of places a colleague opens to answer a status question is defined below and has not yet been taken. Every figure on this page is a design target agreed for the first release.',
  thesis: 'The cost this business carries is reconstruction. Answering one customer’s question means opening several records and asking somebody. The first release should therefore be designed so that the shared record is a by-product of work already being done, and it should be judged by a count of that assembly taken before the release ships and again once it has been in use.',
  sceneLabel: 'A Tuesday enquiry',
  openingTitle: 'Four places stand between a question and its answer',
  openingParagraphs: [
    'A customer emails on a Tuesday morning to ask when their boat will be back in the water. The colleague who picks it up opens the shared mailbox to find the thread where a date was promised in March, opens the job sheet to see which stages the yard has signed off, searches a separate supplier thread for the part that arrived late, and then walks across the workshop to ask the person who spoke to the rigger on Friday. An answer goes back within the hour. It is a good answer, and it is provisional.',
    'Nothing in that sequence is a failure. Every source consulted was the right source, every colleague asked knew something worth knowing, and the customer was told the truth. What the business pays for is the assembly. The same lookups are performed again the next time anyone asks, by whichever colleague happens to take the call, and no record is left behind that would make the next assembly shorter.',
    'Discovery has turned that assembly into the measure this project will answer to. For each live project, the count is the number of distinct places a colleague opens before a current answer exists, recorded by walking the project through with whoever answers for it. That count is specified and it has not yet been taken, so what follows argues from the shape of the problem and from evidence gathered outside this business.',
  ],
  centralQuestion: 'Whether a shared record is worth building here turns on two things: whether it removes the lookup a colleague performs today, and whether it can stay current without anyone typing the same fact a second time.',
  processTitle: 'From an event to one named queue',
  systemTitle: 'One history behind every derived project state',
  sections: [
    {
      heading: 'Reconstruction is the cost this business pays daily',
      paragraphs: [
        { text: 'That Tuesday enquiry is representative, and the engagement needs to know how representative. The trace is defined the same way every time: take a live project, ask the colleague who answers for it the question a customer would ask, and record which distinct places had to be opened before a current answer existed. Nothing about the method is clever. Its merit is that it can be run again after the release by the same people, asking the same question, so the two results are comparable.' },
        { text: 'What counts as a place has to be fixed before anybody counts, because the number is otherwise an opinion. A place is a distinct record a colleague has to open, read and interpret: a thread in the shared mailbox, a job sheet or planning board, a supplier or yard exchange, an accounting or invoicing entry, or a colleague asked directly and treated as a record like any other. Two searches inside one mailbox are one place. A colleague answering from memory without opening anything still counts, and that is the place a shared record is least able to replace.' },
        { text: 'Assembly cost of this kind is not peculiar to boats. A study published in Harvard Business Review instrumented 20 teams, 137 users, across three large firms for up to five weeks, and found workers switching between applications and windows around 1,200 times a day, spending just under four hours a week reorienting themselves afterwards, about 9 percent of their time at work. Microsoft’s workforce survey reports 62 percent of respondents struggling with the time they spend searching for information. Neither study looked at a marine business and neither measured what a shared record would change. They establish that the cost is ordinary, which is precisely why nobody budgets for it.', sources: [0, 1] },
        { text: 'Two features of this business sharpen an ordinary cost. The work is long, because a refit or a rebuild runs for months, so a promise made in March has to be honoured in September by somebody who may not have made it. The relationship is also personal, and the customer expects whoever answers to know their boat. British Marine reports a UK leisure and superyacht sector of roughly 5,800 businesses in which the nine largest firms hold only about a quarter of the market, which is to say that most of this work is done by companies too small to carry a project office.', sources: [3] },
      ],
    },
    {
      heading: 'Build the record from work people already do',
      transition: 'Because the specified count locates the cost in the assembly itself, the design has to remove the assembly without creating a second job of keeping a record fed.',
      paragraphs: [
        { text: 'One obvious response is to buy a customer system and require everybody to keep it current. That converts a lookup cost into a typing cost and moves the burden from the colleague answering the question to the colleague doing the work. It also fails quietly. A record people update when they remember is accurate for the projects that are going well and stale for the ones anybody would actually ask about. In a business where the same people quote, plan and turn a spanner, the hour set aside for keeping a record current is the hour a boat is waiting for.' },
        { text: 'The design being built takes the opposite route. Events are captured where the work already happens. A message sent to a customer from the shared mailbox, a stage signed off on the job sheet, a delivery date confirmed by a supplier: each is taken as it occurs, attached to a customer, a vessel and a project, and appended to a history. Nobody is asked to restate anything that has already been written down once.' },
        { text: 'Identity resolution decides whether that works, and it is the part most easily underestimated. An owner who bought a boat through the business eight years ago returns for a refit under a different email address and a company name. A vessel is sold and keeps its history. A project is quoted twice before it is won. Where those fragment into separate records, a shared record adds a sixth place to look. How far they have already fragmented is a question for the migration extract, and the answer decides how much of the first release is identity work.' },
        { text: 'Project state is then derived from the history and never typed. The current position of a project is a function of the events recorded against it, so a colleague reading an answer can open the history that produced it and see who said what and when. That property is what a status answer needs and what a field on a form cannot supply. The commitment made in March is still there in September, attributed, alongside the message it was made in.' },
        { text: 'The first release stops there deliberately. It drafts no messages, it sends nothing to a customer without a colleague pressing send, and it attempts no prediction of a completion date. Those are design boundaries agreed for the work and none has been tested in operation. The reason for them sits in the measure: a system writing fluent updates from a history nobody trusts would produce confident answers to the Tuesday question and no way to check them.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 1 }, { kind: 'system', afterParagraph: 3 }],
    },
    {
      heading: 'Case against building anything here',
      transition: 'A design that depends on capture happening inside existing work invites the objection that nothing has yet shown the capture will hold.',
      paragraphs: [
        { text: 'Published evidence on systems of this kind is unusable in either direction. CIO, reviewing a dozen frequently quoted analyst estimates of how often customer-relationship projects fail, found the numbers ranging from 18 to 69 percent depending on how each analyst defined failure, and put the average at about a third. A spread that wide carries no information about any particular project, and the firms quoting the top of it are usually selling the remedy.', sources: [4] },
        { text: 'A sharper objection is local. In a business this size the several places may matter less than the argument assumes, because the people are good and the context lives in their heads. A colleague who has worked on the same boats for a decade may give a better answer from memory than a record gives from a screen, and the assembly cost buys accuracy. Estimates that a searchable record cuts information-search time substantially, including the figure of up to 35 percent modelled by the McKinsey Global Institute in 2012, are projections from a period before this software existed in its present form. None of them was measured in a boatyard. The version of this objection that carries real weight concerns who absorbs the cost. Each assembly pulls a colleague off a job, so the delay lands inside the yard while the customer experiences a prompt reply.', sources: [2] },
        { text: 'Taken seriously, that objection sets the falsification test, and the engagement accepts it. Where colleagues still open the mailbox first after the record has been live for some weeks, the record has failed, however complete it looks in a demonstration. The same applies to migration. Weak identity matching that attached a commitment to the wrong vessel would do more damage in one afternoon than the assembly cost does in a year, which is why migration runs by source cohort with a quarantine queue and a rollback point. None of this has yet been observed under load.' },
      ],
    },
    {
      heading: 'Test the first release on one lookup',
      role: 'conclusion',
      transition: 'Since neither the published failure rates nor the team’s own confidence settles the question, the first release has to be built so the specified count can be taken before it ships and again after.',
      paragraphs: [
        { text: 'Discovery has produced an architecture and a measurement specification, and it has produced no result. What exists is a definition of the count, an identity model, an event history, a rule for deriving project state and a boundary around what the first release will do. Everything on the benefit side remains a design target.' },
        { text: 'Acceptance is that count taken twice. A sample of live projects drawn to span the range of work, from a short winter service to a refit running most of a year, counted once before the release ships and once after it has been in daily use for a full working month, by the same method with the same colleagues. It will be a small sample and it will support no percentage, so the result belongs in the report as a count and a direction.' },
        { text: 'Three secondary observations decide whether that count is telling the truth. Open commitments carrying no named colleague, because an action sitting in nobody’s queue is the failure the record was built to prevent. Duplicate identities surfacing after migration, because they are the mechanism by which a shared record becomes another place to look. And commitments appearing in the history before the customer has been told, because that is the point at which a well-kept record starts describing a business the customer would not recognise.' },
        { text: 'What follows from the second count is a narrow decision. Where the count falls and the history stays current without anybody maintaining it as a separate task, the next release can connect documents and reporting to the same record. Where the count holds, the fault lies in capture, and the work goes back to the places events are taken from. In neither case does this business acquire an assistant that writes to customers, until a colleague can answer the Tuesday question from one place and show where the answer came from.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '1,200 a day', finding: 'Instrumented workers switched between applications and windows about 1,200 times a day, losing just under four hours a week to reorientation', implication: 'The cost of assembling an answer from several places is ordinary enough to stay invisible in any budget, which is why it is rarely designed out.', source: 'Harvard Business Review, How Much Time and Energy Do We Waste Toggling Between Applications?, 2022', href: 'https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications' },
  { statistic: '62%', finding: 'Most survey respondents report struggling with the time they spend searching for information during the working day', implication: 'Search cost is reported across sectors, so a marine business exhibiting it is behaving normally and can expect no help from a benchmark.', source: 'Microsoft, Work Trend Index: Will AI Fix Work?, 2023', href: 'https://www.microsoft.com/en-us/worklab/work-trend-index/will-ai-fix-work' },
  { statistic: 'Up to 35%', finding: 'A searchable internal record was projected to cut the time employees spend searching for company information', implication: 'The projection is modelled and dates from 2012, so it sets an expectation to test locally and supports no business case on its own.', source: 'McKinsey Global Institute, The Social Economy, 2012', href: 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy' },
  { statistic: '5,800 businesses', finding: 'The UK leisure, superyacht and small commercial marine industry is composed mainly of small firms, with the nine largest holding about a quarter of the market', implication: 'Most operators in this sector cannot carry a project office, so coordinating work sits with the people doing the job.', source: 'British Marine, The Economic Benefits of the Leisure, Superyacht and Small Commercial Marine Industry, 2022-23', href: 'https://www.britishmarine.co.uk/resources/knowledge-centre/economic-benefits-leisure-superyacht-and-small-commercial-marine-industry-2022-2023' },
  { statistic: '18% to 69%', finding: 'A dozen frequently quoted analyst estimates of customer-relationship project failure ranged from 18 to 69 percent, averaging about a third', implication: 'The spread reflects disagreement about what counts as failure, so no published base rate can justify or refuse a build of this kind.', source: 'CIO, What to do when your CRM project fails, 2017', href: 'https://www.cio.com/article/288664/what-to-do-when-your-crm-project-fails.html' },
];
