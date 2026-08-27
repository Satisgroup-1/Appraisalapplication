import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { icoAi, lawSocietyResearch, sraAi } from '@/lib/sources';

const ayindeJudgment = { label: 'Ayinde v London Borough of Haringey and Al-Haroun v Qatar National Bank [2025] EWHC 1383 (Admin)', href: 'https://www.judiciary.uk/judgments/ayinde-v-london-borough-of-haringey-and-al-haroun-v-qatar-national-bank/' };
const stanfordLegalRag = { label: 'Stanford RegLab, Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools, Journal of Empirical Legal Studies 2025', href: 'https://onlinelibrary.wiley.com/doi/full/10.1111/jels.12413' };
const sraWarning = { label: 'Solicitors Regulation Authority, Misuse of AI warning notice', href: 'https://www.sra.org.uk/solicitors/guidance/misuse-ai/' };
const sraRiskOutlook = { label: 'SRA Risk Outlook, The use of artificial intelligence in the legal market', href: 'https://www.sra.org.uk/sra/research-publications/artificial-intelligence-legal-market/' };
const valsBenchmark = { label: 'Vals AI legal research benchmark, October 2025, as reported by LawSites', href: 'https://www.lawnext.com/2025/10/vals-ais-latest-benchmark-finds-legal-and-general-ai-now-outperform-lawyers-in-legal-research-accuracy.html' };
const hallucinationDatabase = { label: 'Damien Charlotin, AI Hallucination Cases database', href: 'https://www.damiencharlotin.com/hallucinations/' };

export const article: NewsEditorial = {
  title: 'Legal AI is usable only when every proposition traces to valid authority',
  standfirst: 'English courts have referred lawyers to their regulators over citations that did not exist. Proposition-level review is the control that answers that failure, and a source-grounded research tool does not supply it on its own.',
  thesis: 'Legal AI becomes usable at the point where every material proposition carries its own authority, jurisdiction and effective date, and a named professional accepts or rejects it with the supporting passage in view.',
  sceneLabel: 'The research note',
  sceneTitle: 'One citation is real and answers a different question',
  sceneParagraphs: [
    'A solicitor opens a research note an hour before a client call. The first citation leads to a real decision, and the passage it relies on concerns a different legal test. A second authority predates an amendment that changes the answer. The note itself reads with complete confidence from beginning to end.',
    'Nothing in the document is flagged, and nothing shows which sentence rests on which passage. Checking the note means repeating the research that produced it, so the hour saved in drafting is spent twice over in review. The name on the advice belongs to the solicitor either way.',
  ],
  sections: [
    {
      heading: 'Every proposition is a separate act of reliance',
      paragraphs: [
        { text: 'Legal drafts fail one claim at a time. A note can be coherent, well organised and correctly formatted while a single sentence inside it rests on an authority that was superseded, decided under another jurisdiction or never existed at all. Law Society guidance directs practitioners to verify generated legal material and the citations attached to it, which places source inspection inside the working route and ahead of release. The obligation attaches to the sentence, and the review has to attach there too.', sources: [lawSocietyResearch] },
        { text: 'English courts have already tested what happens when that inspection is skipped. In Ayinde v London Borough of Haringey the claimant’s grounds cited five decisions that do not exist, one of them attributed to the Court of Appeal. In Al-Haroun v Qatar National Bank, eighteen of the forty-five authorities placed before the court were fabricated. The Divisional Court declined to begin contempt proceedings and referred the lawyers to their regulators, holding that a practitioner who uses generative tools for research has a professional duty to check the result against authoritative sources before relying on it.', sources: [ayindeJudgment] },
        { text: 'Licensing a tool that retrieves from a law library does not discharge that duty either. Stanford researchers benchmarked the two dominant retrieval-based legal research products and found hallucinated content in 17 percent of Lexis+ AI responses and 33 percent of responses from Westlaw’s AI-Assisted Research, against 43 percent for a general model with no legal index. The same study found the tools returning incomplete answers between 18 and 62 percent of the time depending on the product. Both suppliers had marketed their products as free of hallucination.', sources: [stanfordLegalRag] },
        { text: 'Treating the note as a single artefact leaves a reviewer two options, both bad: trust the whole document or reproduce the whole document. Treating it as a set of propositions changes that arithmetic. Each material claim arrives with the question that produced it, the passage retrieved, the issuing court or body, the effective date, the jurisdiction and the version of the workflow that assembled it. A bad claim can then be struck without discarding the sound work around it, and the reasons for striking it become countable across matters.' },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 2 }],
    },
    {
      heading: 'Valid authority is bounded by jurisdiction and date',
      transition: 'Because the reviewable unit is now the proposition, the service has to settle in advance which sources a proposition is permitted to rest on.',
      paragraphs: [
        { text: 'Retrieval should run against an approved list and nothing wider. A matter workspace opens with a manifest that names the matter documents, the internal precedent and know-how cleared for reuse, and the external collections the firm licenses, each with its jurisdiction, its effective period and the people entitled to see it. Anything absent from the manifest is unavailable to the model, including material the firm holds elsewhere. An unrestricted pool assembled because it was convenient to assemble is the condition the manifest exists to prevent.' },
        { text: 'Matter scope does two jobs at once. It limits cross-client disclosure, and it keeps facts and conclusions from a different file out of the answer, which is an analytical protection as much as a confidentiality one. ICO guidance treats data protection as a lifecycle obligation running through design and operation, and SRA material places technology use inside existing professional and supervisory duties. Access therefore has to be enforced before retrieval and enforced again whenever a source is opened, exported or quoted, with the identity and purpose behind each request recorded.', sources: [icoAi, sraAi] },
        { text: 'Publication date settles very little on its own. An authority can be amended, appealed, distinguished or confined to its facts long after the document itself stops changing, and a note that cites it correctly can still be wrong about the law on the day the client reads it. A service can raise a validity flag from metadata and citator data, and that flag is a prompt for the professional to look. Whether the authority still reaches the question in front of the firm is a legal judgement that stays with the lawyer.' },
        { text: 'Boundaries of this kind also discipline what a firm can say about itself. The SRA has issued a warning notice on the misuse of AI, and its risk research records that three quarters of the largest solicitors’ firms were already using the technology in some form. Adoption at that level, sitting on top of a review record that cannot say which authority supported which sentence, leaves a firm unable to answer a regulator’s question about one specific piece of advice.', sources: [sraWarning, sraRiskOutlook] },
      ],
    },
    {
      heading: 'Verification tests form and cannot weigh authority',
      transition: 'Narrowing the sources a proposition may rest on removes one class of error and leaves the harder check, which is whether the retrieved passage supports the claim made from it.',
      paragraphs: [
        { text: 'Provenance has to survive generation, and that is an engineering requirement before it is an editorial one. The workable design holds a passage-level index behind authenticated matter access, filters candidate passages by jurisdiction and effective date before the model sees any of them, and links every generated sentence back to the passages that produced it. That last link is the expensive part of the build. It is also the only part that makes everything downstream of it reviewable.' },
        { text: 'A citation verifier can then run two narrow tests. The first asks whether each cited source exists in the approved index, which catches outright fabrication. The second asks whether the quoted or paraphrased passage bears on the proposition it has been attached to, which catches the more common failure of a real authority stretched past what it says. Both tests are mechanical, and both can run across every proposition in a draft in the time it takes to open one of them by hand.' },
        { text: 'Neither test touches the judgement the client is paying for. A verifier holds no view on which of two competing lines of authority a court would follow, on whether an argument is worth running at all, or on the issue the note never raised. Those are the failures with the largest consequences and the ones no formal check will detect. The professional therefore needs the original passage, the generated proposition, any counterauthority and the open questions in view together at the moment of acceptance.' },
        { text: 'Evaluation should be built out of the failure classes, and four of them behave differently enough to be counted apart: a fabricated authority, a real authority that does not support the claim attached to it, an authority that has ceased to be good law, and a material issue the note left out. A representative set mixes ordinary research questions with ambiguous instructions, superseded sources, near-identical cases from another jurisdiction, conflicting lines of authority and prompts that reach across matter boundaries. Legal reviewers label the required propositions, the acceptable authorities and the reason for each rejection.' },
        { text: 'One accuracy score would hide all four. A stylistic correction and a false authority cost a firm entirely different amounts, so release thresholds should be set by consequence and the measures reported separately: proposition support, citation validity, material omission, cross-matter disclosure and professional review time. Review time belongs in the denominator as well as the numerator. Work that is fast to produce and slow to check has moved cost from one part of the firm to another without removing any of it.' },
      ],
      exhibits: [{ kind: 'system', afterParagraph: 1 }],
    },
    {
      heading: 'Provenance can substitute for professional scepticism',
      role: 'counterargument',
      transition: 'Separating the failure classes shows what the service would measure, and it also exposes the objection that the interface changes how carefully anyone looks in the first place.',
      paragraphs: [
        { text: 'A source-grounded interface can make weak work look safer. Citations displayed beside every sentence signal that checking has already happened, and a long run of outputs that turn out to be sound is the condition under which a reviewer stops opening sources. The rare consequential error then reaches a reader whom the interface has trained to expect none. Detailed provenance also costs money to build and to keep current, and that cost falls on the firm whether or not a single reviewer clicks through to a passage.' },
        { text: 'The economic case against proposition-level review is stronger than the firm would prefer. A benchmark reported in October 2025 scored three legal research systems and one general model against a lawyer control group on research questions, and the lawyer baseline finished last at 69 percent while the tools scored between 74 and 78 percent. An earlier round of the same benchmark placed assisted tools ahead of the lawyer group on four of seven document tasks. If assisted research is already more accurate on average than the professional checking it, a control built around professional scepticism is buying reduced variance at a real price in time.', sources: [valsBenchmark] },
        { text: 'Averages are the wrong instrument for a liability that arrives one matter at a time. A public database of decisions in which courts identified fabricated citations recorded 1,668 entries in early July 2026, of which practising lawyers filed 653, so the exposure sits in a tail that a mean score conceals. The workable response is to evaluate blind, sample a second review, analyse errors by consequence and monitor whether reviewers still open primary sources. Where that monitoring shows inspection falling away, the service has failed its purpose even while its citation checks pass.', sources: [hallucinationDatabase] },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }],
    },
    {
      heading: 'Release one matter type and watch the reviewers',
      role: 'conclusion',
      transition: 'Since the control depends on reviewers continuing to look, the first release has to be small enough that somebody can tell whether they are still looking.',
      paragraphs: [
        { text: 'A proposition either carries its route back to authority or it stays a suggestion. The reviewer should be able to select any material claim in a draft, open the passage behind it, see the issuing court, the date and the jurisdiction, read whatever cuts against it, and record acceptance or rejection under their own name. A claim that cannot be opened that way has no business inside advice going out under a practising certificate.' },
        { text: 'Scope the first release to one matter type, one approved source hierarchy and a named group of professional users. Give it stop conditions that need no meeting to invoke: an identity that cannot be confirmed, a source that cannot be reached, a validity check that fails, a regression against the evaluation set. Expansion should turn on evidence from supervised live use about proposition support, material omission, reviewer effort and confidentiality, and on nothing softer than that.' },
        { text: 'None of this yet supports a productivity claim. The compressions that suppliers report come from bounded contract tasks inside their own implementations, and no figure quoted here was produced by measuring a firm running the design described above. The evaluation set is the mechanism through which a firm would establish such a claim for itself. A firm that cannot show its own numbers is better off quoting nobody else’s.' },
        { text: 'Fluency and a long reference list are evidence of neither accuracy nor care. A legal AI service holds a bounded place in practice on three conditions: the evidence behind each proposition stays visible at the point of review, responsibility for the accepted claim stays attributable to a named professional, and weak support becomes easier to find than it was before the service arrived. A firm that cannot meet the third condition has bought a faster route to being wrong.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Grounded accuracy',
    title: 'Source grounding reduces fabrication and does not remove it',
    summary: 'Share of benchmark legal research queries returning hallucinated content, from the Stanford RegLab study published in the Journal of Empirical Legal Studies in 2025. Both commercial suppliers had described their products as free of hallucination.',
    interpretation: {
      establishes: 'Two retrieval-based commercial legal research products returned hallucinated content on a material share of benchmark queries, far above the rate their marketing implied.',
      doesNotEstablish: 'The benchmark predates current model versions, uses United States research questions, and reports nothing about how often a supervising lawyer would catch each error.',
      management: 'Set acceptance thresholds against a measured error rate for the specific tool and question type in use, and re-measure after every model or index change.',
    },
    source: 'Stanford RegLab, Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools, JELS 2025',
    href: 'https://onlinelibrary.wiley.com/doi/full/10.1111/jels.12413',
    points: [
      { label: 'Lexis+ AI', value: 17, display: '17%', detail: 'Share of benchmark queries returning hallucinated content.' },
      { label: 'Westlaw AI-Assisted Research', value: 33, display: '33%', detail: 'Roughly double the rate recorded for the other commercial tool tested.' },
      { label: 'GPT-4, no legal index', value: 43, display: '43%', detail: 'General model answering the same questions without legal retrieval.' },
    ],
  },
  {
    label: 'Lawyer baseline',
    title: 'Assisted research scored above the lawyer control group',
    summary: 'Accuracy on legal research questions for three legal AI systems and one general model, each measured against a lawyer control group, in the Vals AI benchmark reported in October 2025.',
    interpretation: {
      establishes: 'On these research questions every assisted system scored above the lawyer control group, and the four systems finished within a few points of one another.',
      doesNotEstablish: 'The comparison covers questions with gradable answers. It measures no matter outcome, no liability and no rate of consequential error.',
      management: 'Read the average as an argument for assistance and set the review control against the tail, because one fabricated authority is what reaches a regulator.',
    },
    source: 'Vals AI legal research benchmark, October 2025, as reported by LawSites',
    href: 'https://www.lawnext.com/2025/10/vals-ais-latest-benchmark-finds-legal-and-general-ai-now-outperform-lawyers-in-legal-research-accuracy.html',
    points: [
      { label: 'Counsel Stack', value: 78, display: '78%', detail: 'Highest scoring system on the reported research questions.' },
      { label: 'Alexi', value: 77, display: '77%', detail: 'Within one point of the leading system.' },
      { label: 'Midpage', value: 76, display: '76%', detail: 'Third of the three dedicated legal systems tested.' },
      { label: 'ChatGPT', value: 74, display: '74%', detail: 'General model included for comparison with the legal systems.' },
      { label: 'Lawyer control group', value: 69, display: '69%', detail: 'Human baseline, around seven points below the average of the tools.' },
    ],
  },
];
