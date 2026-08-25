import type { CaseEditorial } from '@/lib/caseEditorial';
import type { CaseStudy, ResearchFinding } from '@/lib/content';

export const study: CaseStudy = {
    slug: 'professional-services-intake',
    image: '/images/news-legal.svg',
    sector: 'Professional services',
    title: 'A controlled intake system for specialist advisory work',
    summary: 'A triage workflow that protects professional judgement while shortening the route from enquiry to qualified instruction.',
    status: 'Anonymised',
    brief: 'A consistent intake process for a specialist advisory firm. The firm is not named here, as professional-services engagements normally require. The allocations on this page are design judgements agreed for the work. It structures initial information, applies mandatory control gates and prepares a concise matter brief for professional review.',
    metrics: [
      { value: '100%', label: 'mandatory conflict gate', detail: 'Before instruction' },
      { value: '4', label: 'triage classes', detail: 'Defined service routes' },
      { value: '1', label: 'professional approval', detail: 'Required for every matter' },
    ],
    barSubtitle: 'Modelled allocation of responsibility across the intake decision.',
    bars: [
      { label: 'Structured data capture', value: 100, display: 'System led' },
      { label: 'Mandatory control checks', value: 92, display: 'Rules led' },
      { label: 'Matter summary', value: 70, display: 'AI assisted' },
      { label: 'Acceptance decision', value: 18, display: 'Human led' },
    ],
    barNote: 'Source: Quiet Gears control design. Bar length represents automation suitability. It carries no measured accuracy.',
    phases: [
      { label: 'Capture', detail: 'Gather structured facts and source evidence.' },
      { label: 'Control', detail: 'Apply eligibility, conflict and completeness gates.' },
      { label: 'Prepare', detail: 'Draft the brief and list the questions still open.' },
      { label: 'Decide', detail: 'Acceptance stays with the qualified professional.' },
    ],
    code: {
      title: 'Policy gates sit outside the language model',
      lines: ['candidate = intake.validate(payload)', 'controls = policy.check(candidate)', 'if (!controls.pass) return hold()', 'brief = model.summarise(approvedFields)', 'decision = reviewer.accept(brief, evidence)'],
      nodes: ['Secure intake', 'Policy controls', 'Approved data view', 'Drafting service', 'Reviewer decision'],
    },
    nextSteps: ['Map mandatory and discretionary decisions', 'Define the approved data boundary', 'Build a redacted evaluation set', 'Pilot with one service line and weekly quality review'],
};

export const editorial: CaseEditorial = {
  statusStatement: 'Professional privilege keeps the firm anonymous in this account. The triage, quality and elapsed-time figures are design targets agreed for the work, and they remain unmeasured.',
  thesis: 'The intake service should automate the preparation of a professional decision while keeping mandatory controls deterministic and acceptance attributable to a qualified person.',
  sceneLabel: 'The situation',
  openingTitle: 'A valuable referral arrives before it is safe to accept',
  openingParagraphs: [
    'A trusted referrer introduces a prospective client and signals urgency. The email contains enough information to create commercial interest but not enough to complete conflict, eligibility or service-routing checks. A senior professional begins searching correspondence while an assistant asks for missing facts.',
    'The representative referral is fictional. It tests whether the firm can respond quickly on a more complete evidence base without allowing a model to make or obscure a professional acceptance decision.',
  ],
  centralQuestion: 'The design is worth having only if intake preparation becomes faster and more consistent while mandatory controls and professional acceptance stay explicit, reproducible and attributable.',
  evidenceTitle: 'Responsibility by intake decision',
  processTitle: 'Referral to professional acceptance',
  systemTitle: 'Controlled intake architecture',
  evidenceInterpretation: {
    establishes: 'The design assigns structured capture and mandatory checks to systems while reserving acceptance for a professional.',
    doesNotEstablish: 'Bar length is a design judgement about automation suitability. It measures no accuracy, no time saved and no capacity.',
    management: 'The pilot should test completeness, reproducibility and summary fidelity before it tests higher throughput.',
  },
  sections: [
    {
      heading: 'Referral intake gap',
      paragraphs: [
        { text: 'The referral creates two clocks. Commercially, the firm wants a prompt response. Professionally, it cannot proceed until identity, conflict, eligibility and scope questions are answered. Experienced people bridge the gap by searching, reformatting and requesting information.' },
        { text: 'A representative sample should capture what is available at first review, trace each mandatory control, measure clarification and preparation effort, and identify which information enters which service. Law Society and ICO guidance makes verification, confidentiality and data-protection evidence material design requirements.', sources: [0, 2] },
        { text: 'A model can summarise the referral; that capability leaves the operating problem unresolved. The engagement has to establish whether the whole matter can reach the point of professional acceptance with less reconstruction, and with the mandatory checks still intact. Discovery begins by separating the kinds of work hidden inside intake.' },
      ],
    },
    {
      heading: 'Three layers of intake work',
      transition: 'The referral combines missing facts, mandatory checks and professional judgement, so discovery separates those layers before assigning technology.',
      paragraphs: [
        { text: 'First, the referral lacks required facts, which structured capture can expose. Second, identity, conflict and eligibility rules must give the same result for the same approved facts, so deterministic controls should apply them. Third, urgency, complexity, service fit and acceptance require the judgement of the qualified professional whose name goes on the file.' },
        { text: 'The authority bars translate this allocation into visible responsibility. Their lengths express design judgements about automation suitability, and carry no measured share of work, accuracy or elapsed time. Systems lead or assist preparation; a professional retains acceptance.' },
        { text: 'The authority map locates the boundary between preparation and professional judgement; it contains no evidence about tool performance. This changed the design because intake could no longer be treated as one classification task. Factual preparation, mandatory gates and professional judgement each require different controls.' },
      ],
      exhibits: [{ kind: 'evidence', afterParagraph: 1 }],
    },
    {
      heading: 'Preparation and acceptance boundary',
      transition: 'Separating intake into three kinds of work allows the architecture to automate preparation while acceptance authority stays with the professional.',
      paragraphs: [
        { text: 'Required facts and documents enter first, followed by deterministic checks and routing through an approved taxonomy. The item then reaches professional acceptance. The diagram proposes this progression and offers no proof of faster triage.' },
        { text: 'The system creates a matter candidate, stores source evidence, applies rules and prepares a workspace containing original material, structured facts, unanswered questions and an assisted summary. The architecture is a design position; it represents no live firm environment and no approved model route.' },
        { text: 'Automated acceptance was rejected because a model should not reinterpret a failed gate or make an unattributable professional decision. An unrestricted general-purpose summariser was also rejected because confidentiality and retention must follow an approved data boundary. Law Society guidance reinforces this joint view of opportunity and data risk.', sources: [1] },
        { text: 'The paired views show how preparation reaches judgement and where automation stops. Summary fidelity, reviewer trust and throughput remain open empirical questions, each requiring a measure in evaluation.' },
      ],
      exhibits: [{ kind: 'process', afterParagraph: 0 }, { kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Intake pilot acceptance criteria',
      transition: 'The authority boundary defines a safe design; the pilot must now test completeness, reproducibility and professional trust across the whole service.',
      paragraphs: [
        { text: 'The pilot uses representative enquiries, including ambiguous referrals, missing documents and attempts to bypass required fields. Professionals compare the structured brief with original evidence and inspect every mandatory result. Sensitive categories follow an approved processing route or remain outside model processing.' },
        { text: 'Acceptance requires complete first review, reproducible control results, reduced preparation effort and no material omission or distortion in an accepted summary. Time to first substantive decision, clarification rate, reclassification, correction category and queue age are the proposed measures. No outcome has been recorded against them.' },
        { text: 'Stricter capture can make the opening exchange less personal or increase abandonment. The design therefore requests only facts needed for the next decision and preserves a human route for unusual matters. Faster preparation is rejected as success if work simply queues longer for acceptance.' },
      ],
    },
    {
      heading: 'Assisted-summary release decision',
      role: 'conclusion',
      transition: 'The pilot measures both preparation and acceptance, providing the evidence needed to retain, restrict or remove assisted summaries.',
      paragraphs: [
        { text: 'The available evidence is an architecture and an evaluation plan. It contains no accelerated client intake, no validated firm-specific control and no measured summary-acceptance rate. A reader should hold it to that limit.' },
        { text: 'The referral supplies the acceptance test. A professional should be able to decide from the workspace without repeating the original search, while still identifying every fact and control that determines acceptance. The pilot must demonstrate lower reconstructive effort alongside intact scepticism.' },
        { text: 'Assisted summaries remain only if mandatory gates are reproducible, material omissions stay within tolerance and reviewers use evidence links. Otherwise assistance should be restricted or removed while the underlying capture and control flow remains.' },
      ],
    },
  ],
};

export const research: ResearchFinding[] = [
  { statistic: 'Authoritative', finding: 'The Law Society warns that generated legal citations and propositions require verification', implication: 'The system should preserve source evidence and never present model output as an accepted professional conclusion.', source: 'The Law Society, Conducting legal research in the age of AI, 2026', href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai' },
  { statistic: 'SME focus', finding: 'Law Society guidance addresses both opportunity and data risk for smaller firms', implication: 'Intake automation needs an approved data boundary, confidentiality controls and a named supervising professional.', source: 'The Law Society, Generative AI: the essentials, 2025', href: 'https://www.lawsociety.org.uk/Topics/AI-and-lawtech/Guides/Generative-AI-the-essentials' },
  { statistic: '3 outputs', finding: 'ICO guidance combines audit methodology, organisational guidance and practical tools', implication: 'Data protection should be evidenced through design records, tests and operating controls. Policy wording on its own evidences little.', source: 'ICO, Guidance on AI and data protection', href: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/about-this-guidance/' },
  { statistic: 'Lifecycle', finding: 'NIST treats generative AI risk as an issue across design, deployment, operation and review', implication: 'Professional intake controls should be tested before launch and monitored as data, models and use patterns change.', source: 'NIST, Generative AI Profile', href: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
];
