import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { icoAi, lawSocietyResearch, openAiIronclad, sraAi } from '@/lib/sources';

export const article: NewsEditorial = {
  title: 'Legal AI is usable only when every proposition traces to valid authority',
  standfirst: 'Legal research and drafting can move faster without relaxing professional standards. The operating design must keep each proposition inside the matter boundary, attach it to valid authority and preserve a visible route to professional acceptance.',
  thesis: 'A legal AI service becomes decision-useful when every material proposition is linked to an approved source, checked for jurisdiction and date, protected by matter-level access, and accepted by the qualified professional whose name goes on the advice.',
  sceneLabel: 'The situation',
  sceneTitle: 'The citation exists. It does not answer the matter',
  sceneParagraphs: [
    'A solicitor reviews a polished note prepared for an urgent client call. One citation leads to a genuine decision, but the passage concerns a different legal test. Another authority predates a material change. The draft reads confidently and has saved no time because the reviewer must reconstruct its research route.',
    'This composite scene presents no real firm or client. It follows one proposition through matter scoping, retrieval, citation verification and sign-off to identify where assistance can shorten work without disguising uncertainty.',
  ],
  sections: [
    {
      heading: 'Proposition-level evidence',
      paragraphs: [
        { text: 'The draft failed at proposition level. A document can look coherent while individual claims rest on weak, irrelevant or outdated authority. Law Society guidance directs practitioners to verify generated legal material and citations, which places source inspection inside the operating route and ahead of release.', sources: [lawSocietyResearch] },
        { text: 'Each material proposition needs a record of the question asked, the source passage retrieved, the authority and court or issuer, its effective date, jurisdiction and the model or workflow version that used it. The reviewer should see that record beside the draft. A bibliography at the end cannot show which authority supports which sentence.' },
        { text: 'The opening note therefore becomes a set of reviewable claims. That change improves diagnosis: an unsupported proposition can be rejected without discarding useful work elsewhere, and evaluation can distinguish fabricated authority, weak support, stale law and material omission.' },
        { text: 'Once the unit is defined, the next issue is the boundary around the evidence that a model may retrieve.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
    },
    {
      heading: 'Matter and source boundaries',
      transition: 'Proposition-level review exposes the evidence requirement; matter and source boundaries determine which evidence may enter the draft.',
      paragraphs: [
        { text: 'A matter workspace should begin with an authorised source manifest. It identifies matter documents, approved internal knowledge and external legal sources, then records the jurisdiction, effective period and access rules attached to each collection. Retrieval runs against that manifest. An unrestricted pool assembled for convenience is what the manifest exists to prevent.' },
        { text: 'Matter scoping has a confidentiality function and an analytical function. It reduces cross-client disclosure risk while preventing facts or conclusions from another file from entering the answer. Access control must be enforced before retrieval and repeated when a source is opened, exported or cited. Logs should record the identity and purpose associated with each request.' },
        { text: 'Temporal validity requires more than document date. A source may have been superseded, amended, appealed or limited. The system can propose a validity flag from metadata and citator services, but professional review decides whether the authority remains applicable to the question.' },
        { text: 'ICO guidance makes data protection a lifecycle obligation, while SRA material places technology use within existing professional duties. Together they require whoever runs the service to document its data flow, supervision and incident response before access is widened.', sources: [icoAi, sraAi] },
      ],
    },
    {
      heading: 'Controlled research architecture',
      transition: 'The approved evidence boundary now allows the architecture to separate fixed controls from model-assisted interpretation.',
      paragraphs: [
        { text: 'The architecture begins with authenticated matter access and a source index that retains passage-level provenance. Retrieval returns candidate material under jurisdiction and date filters. A model may compare, summarise or draft from those candidates, but the generated text carries identifiers back to the passages used.' },
        { text: 'A citation verifier then tests whether every cited source exists in the approved index and whether the quoted or paraphrased passage supports the associated proposition. This check is narrower than legal judgement. It can detect missing links or textual mismatch; it cannot decide the weight of competing authority or the answer to an unsettled question.' },
        { text: 'Deterministic gates control matter access, source eligibility, required metadata and release permissions. Model assistance handles language, comparison and issue spotting within that envelope. The professional sees original evidence, generated proposition, counterauthority and open questions before accepting the work.' },
        { text: 'The system diagram locates responsibility: software preserves provenance and tests formal conditions; the lawyer determines legal relevance, weight and advice. That boundary must survive time pressure, batch processing and downstream reuse.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 2 }],
    },
    {
      heading: 'Evaluation and economics',
      transition: 'Architecture can preserve the route to evidence, but release depends on measured performance and the full cost of professional review.',
      paragraphs: [
        { text: 'A representative evaluation set should contain ordinary research questions, ambiguous instructions, outdated sources, similar cases from another jurisdiction, conflicting authorities and prompts that attempt to cross matter boundaries. Legal reviewers label the required propositions, acceptable authorities, material omissions and reasons for rejection.' },
        { text: 'The service should report proposition support, citation validity, material omission, confidentiality breach, correction category and professional review time. A single accuracy score would conceal the difference between a stylistic correction and a false authority. Release thresholds should be stricter where an error is harder to detect or more consequential.' },
        { text: 'Vendor stories show that bounded legal tasks can compress. OpenAI reports that Ironclad reduced one contract-review activity from about forty minutes to two in its implementation. That customer-reported figure concerns a specified workflow and supplier context. It neither forecasts research productivity nor changes the professional acceptance standard.', sources: [openAiIronclad] },
        { text: 'Economics should therefore use accepted propositions or completed matter tasks as the denominator. Retrieval, licences, data preparation, reviewer time, corrections, incidents and knowledge maintenance belong in the cost. The evidence view presents proposed release dimensions. No firm performance has been observed.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 3 }],
    },
    {
      heading: 'Scepticism when volume rises',
      role: 'counterargument',
      transition: 'Evaluation can show acceptable average performance; the strongest objection concerns how routine use changes professional attention.',
      paragraphs: [
        { text: 'A source-grounded interface can make weak work look safer. Visible citations may encourage reviewers to inspect fewer sources, and a high rate of plausible outputs can reduce vigilance before a rare consequential error. Detailed provenance also adds interface and maintenance cost.' },
        { text: 'Some matters will remain faster with direct professional research, especially where the question is novel, the source set is small or authority turns on subtle procedural history. A service should permit a direct-research route and should not treat low automated usage as failure when the matter does not fit the evaluated scope.' },
        { text: 'The control response combines blind evaluation, sampled secondary review, error analysis by consequence and monitoring of inspection behaviour. If reviewers stop opening primary sources or correction time offsets drafting gains, the service has failed its purpose even when formal citation checks pass.' },
        { text: 'This objection narrows the recommendation. Assistance should expand by matter type and proposition class only after evidence shows that professional scepticism remains active.' },
      ],
    },
    {
      heading: 'Matter-scoped release decision',
      role: 'conclusion',
      transition: 'The risk of false reassurance makes the release boundary a professional operating decision, which is a different question from whether the software is ready.',
      paragraphs: [
        { text: 'The solicitor in the opening scene should be able to select each proposition, open the supporting passage, see jurisdiction and date, inspect counterauthority and record acceptance or rejection. A proposition without that route remains a drafting suggestion and cannot enter accepted work.' },
        { text: 'The first release should cover one matter type, one approved source hierarchy and a defined set of professional users. It should stop on uncertain identity, inaccessible source, failed validity check or material evaluation regression. Expansion depends on support, omission, review-effort and confidentiality evidence from live supervised use.' },
        { text: 'Fluent output and a long reference list do not make legal AI trustworthy. It takes a bounded place in practice when evidence stays visible, professional authority stays attributable and the system makes weak support easier to detect.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Validity chain',
    title: 'Every accepted proposition needs four independent checks',
    summary: 'This is a modelled control sequence informed by professional guidance. Equal values express dependency and contain no measured legal-work result.',
    interpretation: {
      establishes: 'The proposed service treats authority, jurisdiction, date and textual support as separate conditions for professional review.',
      doesNotEstablish: 'The exhibit provides no accuracy, productivity or risk-reduction evidence for a deployed legal system.',
      management: 'Release criteria should test each failure class separately because one blended score could hide a consequential defect.',
    },
    source: 'Quiet Gears control design informed by Law Society and ICO guidance',
    href: 'https://www.lawsociety.org.uk/topics/ai-and-lawtech/conducting-legal-research-in-the-age-of-ai',
    points: [
      { label: 'Authoritative source', value: 100, display: 'Required', detail: 'The source must belong to the approved hierarchy for the matter.' },
      { label: 'Jurisdiction match', value: 100, display: 'Required', detail: 'The source must be relevant to the legal system and forum in question.' },
      { label: 'Temporal validity', value: 100, display: 'Required', detail: 'The service must show amendment, appeal and effective-date information for review.' },
      { label: 'Proposition support', value: 100, display: 'Required', detail: 'The cited passage must support the claim made in the draft.' },
    ],
  },
  {
    label: 'Release evidence',
    title: 'Legal evaluation must separate unlike failure classes',
    summary: 'Modelled evaluation priorities for a matter-scoped pilot. The values express control criticality and are not empirical weights.',
    interpretation: {
      establishes: 'Citation fabrication, weak support, omission, confidentiality and reviewer behaviour require distinct evidence.',
      doesNotEstablish: 'The bars do not predict defect frequency or assign financial value to any control.',
      management: 'Set thresholds by consequence and keep professional review effort inside the economic denominator.',
    },
    source: 'Quiet Gears evaluation design (design values awaiting measurement)',
    points: [
      { label: 'Citation existence', value: 100, display: 'Blocking', detail: 'A fabricated or inaccessible source prevents acceptance.' },
      { label: 'Material proposition support', value: 100, display: 'Blocking', detail: 'A material claim without adequate authority prevents acceptance.' },
      { label: 'Cross-matter disclosure', value: 100, display: 'Blocking', detail: 'Unauthorised disclosure is a release-stopping control failure.' },
      { label: 'Material omission', value: 92, display: 'Critical', detail: 'The evaluation must detect missing issues that could change the legal conclusion.' },
      { label: 'Reviewer inspection', value: 78, display: 'Monitor', detail: 'Source-opening behaviour helps detect false reassurance during supervised use.' },
    ],
  },
];
