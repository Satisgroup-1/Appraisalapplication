import type { EvidenceView } from '@/lib/editorialGraphics';
import type { NewsEditorial } from '@/lib/newsEditorial';
import { metrStudy, qjeStudy, ukAdoption } from '@/lib/sources';

const metrRerun = { label: 'METR, Changing our developer productivity experiment design, 2026', href: 'https://metr.org/blog/2026-02-24-uplift-update/' };
const danishRecords = { label: 'Humlum and Vestergaard, Large Language Models, Small Labor Market Effects, NBER, 2025', href: 'https://www.nber.org/system/files/working_papers/w33777/w33777.pdf' };
const usAdoptionSurvey = { label: 'Bick, Blandin and Deming, The Rapid Adoption of Generative AI, NBER, 2024', href: 'https://www.nber.org/papers/w32966' };
const genaiDivide = { label: 'MIT NANDA, The GenAI Divide: State of AI in Business 2025', href: 'https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf' };

export const article: NewsEditorial = {
  title: 'Hours saved reach the budget only when someone moves them',
  standfirst: 'A field study found customer-support productivity up 15 percent. A randomised trial found experienced developers 19 percent slower. Neither figure belongs in a business case, and the reason it does not is the whole method.',
  thesis: 'Automation value should be reported as a bridge from an observed baseline to a financial or operating consequence, with each stage evidenced separately and the confidence behind every claim recorded beside it.',
  sceneLabel: 'The business case',
  sceneTitle: 'Finance cannot locate the hundred hours the programme reported',
  sceneParagraphs: [
    'The arithmetic is familiar. A task took ten minutes and now takes five. Monthly volume is 1,200. The programme reports 100 hours released, multiplies by a loaded hourly rate and presents the product as a saving. The figure is precise, positive and unconnected to anything the finance system will ever record.',
    'What the arithmetic omits is everything between the task and the ledger. Part of the volume never reached the new route. Some outputs came back for correction. The time genuinely released landed in whatever the team did next, which nobody was measuring. A year on, the operating cost is unchanged and the productivity claim is still on the slide.',
  ],
  sections: [
    {
      heading: 'Opposite findings agree about who gains from assistance',
      paragraphs: [
        { text: 'Two of the most cited measurements of AI at work disagree in direction. Brynjolfsson, Li and Raymond studied 5,172 customer-support agents and found issues resolved per hour rose 15 percent on average once the assistant was available. METR randomised 246 real tasks across 16 experienced open-source maintainers working in repositories they knew intimately, and found completion times 19 percent worse with the tools than without.', sources: [qjeStudy, metrStudy] },
        { text: 'Presented as competing headline percentages the two results are unusable, and averaging them would be worse. Read at the level of who was measured, they converge. The support study found its gains concentrated among the least experienced and lowest-skilled agents, with the most experienced showing small speed gains and small declines in quality. METR measured maintainers who already held years of context in the exact codebase they were asked to change.', sources: [qjeStudy, metrStudy] },
        { text: 'What transfers between the two studies is a moderator. Assistance pays most where the worker lacks context the model can supply, and pays least, or costs time, where the worker already holds more context than the model can reconstruct. METR published a second reading of its own experiment in February 2026, reporting a smaller and statistically inconclusive slowdown among newly recruited developers. That is the direction the moderator predicts.', sources: [metrStudy, metrRerun] },
        { text: 'For an investment committee the consequence is direct. A percentage lifted from either study describes the workforce that study observed. The equivalent local measurement is eligible volume, the share of it completed through the new route, the effort spent reviewing and correcting output, and elapsed time from request to accepted result, taken over a window long enough to survive one unrepresentative week. Staff estimates cannot stand in for that measurement. METR asked its developers to forecast the effect before the trial and to estimate it afterwards. They predicted a 24 percent speed-up, believed after the fact that they had gained 20 percent, and had in fact lost 19. A programme whose baseline rests on what the team believes the tool saved is reading the instrument that produced that error.', sources: [metrStudy] },
      ],
      exhibits: [{ kind: 'evidence', view: 0, afterParagraph: 1 }],
    },
    {
      heading: 'Gross hours contract three times before reaching cash',
      transition: 'Because the moderator has to be measured locally, the arithmetic that turns a local measurement into money has to be built stage by stage.',
      paragraphs: [
        { text: 'Gross released time is the starting quantity, and three deductions stand between it and a financial consequence. Eligible volume that never reached the new route removes the first slice. Review, exception handling, support and the workarounds people invent for themselves remove the second. What survives both is capacity, and capacity becomes money only where a cost leaves the budget or where the freed hours are deliberately pointed at work whose output is already counted. None of the three deductions is exotic. Each is a quantity the workflow can produce once somebody decides that it should.' },
        { text: 'The exhibit below runs that logic across 100 modelled hours. Its stages matter more than its values. Each stage is a point at which a programme can lose the entire benefit while continuing to report it, and each is answered by a different person holding a different piece of evidence.' },
        { text: 'Exception effort is the deduction programmes most often omit, because it accrues to people who were never part of the pilot. A checker who reads every output before release, a supervisor who fields the cases the system declines, a colleague who keeps the old spreadsheet alive for the awkward accounts: all three are real hours, all three are caused by the automation, and none of them appears in a before-and-after comparison of task time. Counting that effort requires a decision about scope before the pilot begins, because it stays invisible to any measurement bounded by the automated step.' },
        { text: 'Redeployment decides whether anything financial happens at all. Released capacity absorbed into general availability leaves no trace in any account, and it is indistinguishable from a benefit that never existed. Capacity pointed at a named queue, a named backlog or a piece of demand the business already counts can be observed moving. The ledger structure below shows which reading supports each stage and where the confidence level attaches.' },
        { text: 'Recording the bridge honestly usually reduces the headline number by a large fraction, and that is the point of building it. A programme carrying a modelled twenty-hour cash equivalent against a hundred theoretical hours sits in a defensible position, because it can say where the other eighty went and what would have to change to recover any of them. A committee can interrogate that position. It can ask why adoption stalled short of eligible volume, whether the review step is permanent or an artefact of an immature model, and which queue the redeployed capacity was meant to reach. None of those questions is available against a single multiplied figure.' },
      ],
      exhibits: [{ kind: 'evidence', view: 1, afterParagraph: 1 }, { kind: 'system', afterParagraph: 3 }],
    },
    {
      heading: 'Requiring a cash trace would decline almost everything',
      role: 'counterargument',
      transition: 'Following the bridge to its last stage exposes how rarely the final conversion can be evidenced, which turns the method into an argument against the investments it was built to assess.',
      paragraphs: [
        { text: 'The strongest objection to this method is that almost nothing survives it. DSIT’s UK adoption research found 56 percent of current AI users reporting higher employee productivity while 77 percent reported no change in revenue. Humlum and Vestergaard, using Danish administrative records for occupations with high adoption, found users reporting time savings of about 2.8 percent of work hours and no significant effect on earnings or recorded hours, with confidence intervals ruling out effects above one percent. A nationally representative US survey by Bick, Blandin and Deming put self-reported savings at 5.4 percent of work hours among users. The pattern across all three is the same. Reported hours move and reported money does not.', sources: [ukAdoption, danishRecords, usAdoptionSurvey] },
        { text: 'MIT’s NANDA review of more than 300 enterprise initiatives arrived at the same place from the opposite direction, reporting that 95 percent of organisations could show no measurable profit-and-loss return from generative AI pilots. Applied as a gate at the point of decision, a cash trace would have stopped the programmes that later mattered alongside the ones that never did, because at that point the two are indistinguishable.', sources: [genaiDivide] },
        { text: 'Benefits that never pass through a salary line can still be the reason to invest. Faster response can change conversion on a pipeline the sales team already quotes. Fewer errors can reduce a remediation cost the business already books. Better-evidenced decisions can lower the probability or the consequence of a control failure. Refusing all of these because they arrive as quality, service or risk would leave a firm holding the most conservative investment case in its market and none of the option value. There is a timing problem underneath this. Capability built on one workflow lowers the cost of the next one, and that transfer is real even though it never appears in the benefits case for the workflow that paid for it.' },
        { text: 'The concession the method has to make is about pricing, and about how confidence is carried. A benefit may sit in the ledger with a named mechanism, a named manager and a stated result that would disprove it, at low confidence and with no pound attached. The programme in the opening arithmetic reported as cash a quantity it had never observed. That is the defect, and it survives whatever the true benefit turns out to be.' },
      ],
    },
    {
      heading: 'Report confidence alongside every figure in the ledger',
      role: 'conclusion',
      transition: 'Since a cash test on its own would reject benefits the firm has good reason to buy, the ledger has to carry claims it cannot yet price and say plainly that it cannot.',
      paragraphs: [
        { text: 'Restate the hundred hours as a hypothesis with a date on it. The entry should hold the baseline period and eligible volume, the observed share completed through the new route, the effort spent on review and exceptions, the named destination of any released capacity, and a confidence level that starts low and moves only as observation replaces assumption. Confidence is the field that does the work, because it is the one a programme cannot inflate without being caught by its own next reading. It also fixes the reporting cadence, since a claim held at low confidence has to name the reading that would raise it and the date by which that reading will exist.' },
        { text: 'Two disciplines keep the ledger honest at low cost. Measure the workflow you are actually changing, since the research shows the effect size belongs to the worker and the task and travels badly between them. Then separate the operating change from the financial one at the point of entry, so that a genuine improvement in handling time is never quietly promoted into a saving nobody has found.' },
        { text: 'Measurement repays its cost when it changes a decision, and the decision it should change most often is how much to claim. A programme that reports a range with its causal chain visible, and marks the stages it has not yet observed, gives an investment committee something it can act on. A precise figure with no route to the accounts gives it something to repeat. Most committees see more automation proposals than they can fund. The one to fund first is the one whose arithmetic they can check.' },
      ],
    },
  ],
};

export const evidenceViews: EvidenceView[] = [
  {
    label: 'Measured effects',
    title: 'Measured effect tracks how much context the worker already holds',
    summary: 'Three measurements from two randomised or quasi-experimental designs, ordered by how much task-specific context the measured workers brought with them.',
    interpretation: {
      establishes: 'Published studies have found positive, negative and statistically inconclusive productivity effects, and the differences track worker experience with the task.',
      doesNotEstablish: 'The figures cannot be averaged, read as model quality, or transferred into a business case for a different workforce.',
      management: 'Measure the target workflow with its own baseline, adoption share, review effort and exception cost.',
    },
    source: 'Quarterly Journal of Economics 2025; METR 2025 and 2026',
    href: 'https://academic.oup.com/qje/article/140/2/889/7990658',
    points: [
      { label: 'Customer-support agents', value: 115, display: '+15%', detail: 'Issues resolved per hour across 5,172 agents, with gains concentrated among the least experienced.' },
      { label: 'Newly recruited developers', value: 96, display: '-4%', detail: 'METR’s 2026 re-run, with a confidence interval running from -15% to +9%, so the direction is unresolved.' },
      { label: 'Maintainers on own repositories', value: 81, display: '-19%', detail: 'Completion time worsened for experienced developers working in codebases they knew well.' },
    ],
  },
  {
    label: 'Value bridge',
    title: 'Three deductions separate released time from a financial consequence',
    summary: 'A modelled bridge across 100 theoretical hours, built to show where the evidence for each stage has to come from.',
    interpretation: {
      establishes: 'A benefits case needs distinct stages between theoretical task time, completed volume, usable capacity and a financial consequence.',
      doesNotEstablish: 'The values are Quiet Gears design assumptions and predict no conversion rate for any programme.',
      management: 'Name the person and the reading required at each stage before any realised value is reported.',
    },
    source: 'Quiet Gears benefits model (design values awaiting measurement)',
    points: [
      { label: 'Gross task time released', value: 100, display: '100 hours', detail: 'The theoretical saving, before any operating friction is counted.' },
      { label: 'Completed through the new route', value: 82, display: '82 hours', detail: 'Eligible volume that actually travelled the new path, which the workflow can count directly.' },
      { label: 'Net of review and exceptions', value: 72, display: '72 hours', detail: 'What remains after checking, rescue work and the workarounds people build for themselves.' },
      { label: 'Redeployed to counted work', value: 48, display: '48 hours', detail: 'Capacity pointed at a named queue or backlog whose output is already measured.' },
      { label: 'Modelled cash equivalent', value: 20, display: '20 hours eq.', detail: 'The portion the model links to cost removed, cost avoided or verified contribution.' },
    ],
  },
];
