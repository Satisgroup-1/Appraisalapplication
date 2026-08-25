import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'professional-services-intake',
    image: '/images/news-legal.svg',
    sector: 'Professional services',
    title: 'Intake built around the checks a matter has to pass',
    summary: 'Intake rebuilt around the five facts every mandatory test needs, so the firm can accept or decline on the facts it asked for at the start.',
    status: 'Anonymised',
    brief: 'An intake redesign for a specialist advisory practice. The firm is not named here, as professional work of this kind normally requires. The design asks for the items the mandatory tests need before anyone senior reads the referral, runs those tests as rules that leave a record, and keeps acceptance with a qualified professional. What the engagement is measuring, and has not yet measured, is how complete referrals are when they arrive.',
    metrics: [
      { value: '5', label: 'items required before any test can run', detail: 'Defined with the firm' },
      { value: '4', label: 'mandatory tests run as rules', detail: 'Identity, conflict, funding, eligibility' },
      { value: '1', label: 'named professional records every decision', detail: 'Accept, decline or hold' },
    ],
    phases: [
      { label: 'Request', detail: 'Name the missing items and ask the referrer for those alone.' },
      { label: 'Test', detail: 'Run identity, conflict, funding and eligibility as rules over the approved facts.' },
      { label: 'Assemble', detail: 'Build the file: referral as received, completed fields, test evidence, open questions.' },
      { label: 'Record', detail: 'A named professional accepts, declines or holds, and the reason is written down.' },
    ],
    code: {
      title: 'Tests resolve before the drafting service sees anything',
      lines: ['referral = intake.capture(payload)', 'missing = requirements.diff(referral)', 'if (missing.length) return request(missing)', 'results = policy.run(referral.approvedFacts)', 'file = assemble(referral, results, openQuestions)', 'decision = professional.record(file)'],
      nodes: ['Referral capture', 'Requirement check', 'Policy tests', 'Matter file', 'Recorded decision'],
    },
    nextSteps: ['Agree the five required items with the referring network', 'Count first-pass completeness across one service line before any build', 'Build the test set so each result writes its own evidence', 'Review declines and holds by test with the supervising professional'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'Professional privilege keeps the firm unnamed in this account. The firm has not yet supplied the first-pass extract, so what follows states what the engagement is measuring and publishes no count. Every service-level figure, including elapsed time and completeness, is a design target and has not been measured.',
  thesis: 'Delay at the start of a matter is mostly the cost of assembling facts that never arrived, so the design makes the request for those facts the first automated act, runs each mandatory test as a rule that writes its own evidence, and leaves acceptance with the professional whose name goes on the file.',
  sceneLabel: 'A referral arrives',
  openingTitle: 'Referral that cannot yet be accepted or declined',
  openingParagraphs: [
    'A referral lands on Thursday afternoon from a contact the firm has worked with for years. It names a prospective client, sets out the problem in three sentences and says the matter is urgent. It does not name the other side. It does not say who is paying, and it does not attach the document those three sentences turn on. Every commercial instinct in the building says answer today.',
    'None of the tests standing between that email and an instruction can run on what the email contains. A partner starts searching old correspondence for a counterparty name that may or may not be there. An assistant drafts a reply asking for identification. By Monday the firm has spent senior attention on questions that could have been asked in the first minute, and it still holds no decision either way.',
    'The referral is worth having. The firm cannot say so until it knows who the client is, who the other side is, who funds the work and which of its service routes the matter belongs on. Those four answers are administrative. The person assembling them is usually the most expensive person free that afternoon.',
  ],
  centralQuestion: 'The design is worth building only if the same referral reaches a recorded acceptance or a recorded decline sooner, with every mandatory test running on the same facts each time and the reasoning still attributable to a named professional.',
  processTitle: 'From referral to a recorded decision',
  systemTitle: 'Gates settle before any drafting begins',
  sections: [
    {
      heading: 'Referrals arrive without the facts tests need',
      paragraphs: [
        { text: 'Intake looks like a judgement call and behaves like a collection problem. The judgement at the end of it is genuinely difficult and genuinely brief: a qualified person reads an assembled file and decides whether the firm can act, on what terms and for whom. Almost everything before that moment is the gathering of facts the firm already knew it would need. The engagement therefore starts by measuring how the time between a referral landing and a decision being recorded divides between the two.' },
        { text: 'What the firm is counting is the first pass. Each referral reaching one service line is read exactly as it arrived, before anyone has asked a follow-up question, and marked against the five items the mandatory tests require: identity evidence for the prospective client, every counterparty named in full, the documents the referral refers to, a stated basis for who pays, and scope specific enough to route the matter to a service. The number worth having is how many referrals carry all five on arrival, and nobody in the firm can currently say what it is.' },
        { text: 'Absent facts are only half of the failure, and regulatory file review documents the other half at a scale no single practice could. The Solicitors Regulation Authority examined 5,873 client files at 833 firms during 2024 and 2025 and reported 11 percent with no source of funds check at all, 18 percent where evidence had been gathered without being scrutinised, and 8 percent where the source recorded on the ledger was unsupported by the material on the file. Its own summary of the pattern is that firms collect evidence and stop short of assessing it. That is a finding about method, and it holds across firms of every size.', sources: [0] },
        { text: 'Two conclusions follow. The first is that the wait at the start of a matter is created by absence, which makes what the firm asks for and how early it asks the cheapest thing in the process to change. The second is the harder one to build, and the regulator has already stated it. A test that has run and left no assessable record is worth about what an unrun test is worth, so the evidence of reasoning has to fall out of the same step that produces the answer.' },
      ],
    },
    {
      heading: 'Five items decide whether the matter can move',
      transition: 'Since a missing fact is what stops a test running at all, the content and the timing of the firm’s first request become the first thing the design has to settle.',
      paragraphs: [
        { text: 'Each of the five items exists because a named test cannot run without it. Identity evidence supports client due diligence. Full counterparty names support the conflict search, which returns a different answer when a name is partial, and regulatory rules expect a firm to identify conflicts before a matter is opened. The funding basis decides whether enhanced enquiry applies. The referenced documents establish what the matter concerns. Scope decides the service route and the supervising professional. Nothing joined the list because it might be useful later, and the list is short for that reason.', sources: [2] },
        { text: 'Asking is therefore the first automated act. Within minutes of a referral landing, the system reads what has come in, works out which of the five items are absent, and returns a short request naming only those, in plain language, with one line on what each is for. A referrer asked for four specific things has a task in front of them. A referrer asked to send more information has a chore of unknown size, and unknown size is what delays a reply.' },
        { text: 'Verification then runs as rules over the approved facts, and each rule writes its own evidence. Identity, conflict, funding and eligibility tests return the same outcome on the same inputs, and each records what it checked, against which source, on what date and with what result. Legal sector anti-money laundering guidance treats due diligence as something a firm has to be able to demonstrate on a risk-sensitive basis, and data protection guidance treats lawful basis and retention as design questions settled before collection begins.', sources: [1, 3] },
        { text: 'Language work sits outside the gates. A model normalises an unstructured referral into the five fields, drafts the request that goes back to the referrer, and writes the summary that reaches the supervising professional. It holds no gate, releases nothing and reverses no result. Where a test fails, the matter stops at that test and a person decides what happens next. Where a field is ambiguous the model marks it as ambiguous, and the ambiguity travels with the file to whoever reads it.' },
        { text: 'What the sequence produces is a file in four parts: the referral as it was received, the five fields as they were completed, the result and evidence of each test, and the questions still open. A professional reading it can see which facts the referrer supplied, which the firm found and which remain assumptions. That separation is the working difference between a summary and a brief, and it is the part a reviewer has to be able to trust without reconstructing it.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 1 }],
    },
    {
      heading: 'Faster decline is the gain worth buying',
      transition: 'With the request and the tests running in sequence the firm reaches an answer earlier, and on the evidence of the referrals that prompted this work the answer will often be some form of no.',
      paragraphs: [
        { text: 'Business cases for intake automation are usually written around conversion and speed to instruction. This one argues for a different emphasis. Where a referral cannot become an instruction on the day it arrives, the reachable gain is knowing sooner which ones will, and telling the others quickly. A decline given on the Thursday with its reason attached costs the referring relationship far less than the same decline given a fortnight later after two rounds of questions. Matters held open are expensive in a way no intake dashboard displays.' },
        { text: 'Confidentiality sets the shape of the build. Referral material arrives before the firm knows whether it can act, which is the one moment at which it holds sensitive information about a person who may never become a client and may be adverse to an existing one. The approved data boundary therefore has to cover the intake store as well as the matter store, retention for declined referrals is settled before the first referral is declined, and risk frameworks treat that boundary as something re-tested as data and use patterns change.', sources: [4] },
        { text: 'Two objections deserve more than a hearing. The first is that a five-item request sent minutes after a warm introduction reads as bureaucracy, and a referrer who feels processed introduces the next client to somebody else. Friction at first contact is exactly where prospective work disengages, and the firm would lose matters it would have taken and never learn which ones. The second is that a well-assembled file is persuasive on its own account. A thin matter presented in five neat fields with four passed tests beside it carries an authority the underlying facts may not support, and a reviewer reading twenty a week will drift towards reading the fields and away from reading the referral.' },
        { text: 'Neither objection is answered by design alone. The request can explain itself, it can go out over a partner’s name, and unusual matters can keep a human route from the first minute. Those help and they settle nothing. What settles it is measurement: referral volume by source before and after release, and a second reader on a sample of accepted files comparing the summary against the referral it came from. If introductions fall away at a source that used to send work, the design is wrong for that source whatever the elapsed time says.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Measure the first pass before widening anything',
      role: 'conclusion',
      transition: 'Because both objections turn on how referrers and reviewers behave once the system is live, the first release has to be small enough to watch and cheap enough to withdraw.',
      paragraphs: [
        { text: 'Evidence at this point consists of an architecture, a specification of what is being measured, and one external finding that the design answers. No elapsed time has been measured here, no completeness figure has been produced for referrals as they arrive, and nothing in this account shows that a single matter has been accepted or declined faster than it would otherwise have been. Readers should hold the design to that limit, and so should the firm proposing it.' },
        { text: 'The count runs twice. The first pass through one service line establishes what completeness on arrival currently looks like, and it is worth running before any software is built, because it decides whether the problem is the one described here. The same reading repeated after release, against the same five items, gives the only directly comparable figure this work will produce. Four measures sit around it: elapsed time from referral to recorded decision, the number of return passes a matter needs before it is complete, declines and holds broken down by the test that produced them, and referrer response to the request. Stop conditions are set in advance, among them a test returning different results on the same facts, a referral source going quiet, and an accepted file whose summary misstates the referral it came from.' },
        { text: 'What lasts is the record. For every matter the firm took and every one it turned away, it should be able to show which facts it held, which test produced the answer and who put their name to it. That record is worth building whether or not any drafting is ever automated, and it is the thing the regulator’s file reviews keep finding absent. Assisted summarising stays while it shortens assembly and leaves the tests untouched, and it goes the moment a second reader finds a summary carrying weight the referral does not support. The gates hold their position either way.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: '5,873 files', finding: 'SRA file review found 11 percent with no source of funds check and 18 percent where evidence was gathered without scrutiny', implication: 'Collection and assessment are separate acts. Intake should produce the assessment and its evidence in the same step that produces the answer.', source: 'Solicitors Regulation Authority, Thematic review of source of funds and wealth compliance, 2025', href: 'https://www.sra.org.uk/sra/research-publications/thematic-review-source-funds-wealth-compliance/' },
  { statistic: 'Risk-based', finding: 'Legal sector guidance requires client due diligence before a business relationship is established, applied on a risk-sensitive basis and capable of being demonstrated', implication: 'The required items at intake are defined by the tests, and each test has to leave evidence a supervisor can read later.', source: 'Legal Sector Affinity Group, Anti-money laundering guidance for the legal sector, 2025', href: 'https://www.lawsociety.org.uk/topics/anti-money-laundering/anti-money-laundering-guidance' },
  { statistic: 'Before opening', finding: 'SRA conduct rules require firms to have systems that identify conflicts of interest before a matter is opened', implication: 'A conflict search needs every counterparty named in full at first contact, which makes the name an intake requirement and not a later correction.', source: 'Solicitors Regulation Authority, Conflict of interest guidance', href: 'https://www.sra.org.uk/solicitors/guidance/conflict-of-interest/' },
  { statistic: '3 outputs', finding: 'ICO guidance combines audit methodology, organisational guidance and practical tools', implication: 'Data protection should be evidenced through design records, tests and operating controls. Policy wording on its own evidences little.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
  { statistic: 'Lifecycle', finding: 'NIST treats generative AI risk as an issue across design, deployment, operation and review', implication: 'Intake controls should be tested before launch and monitored as data, models and use patterns change.', source: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
];
