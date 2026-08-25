# The article standard

The format the Quiet Gears insight articles are written to, derived from how
the major consultancy publications actually build a piece.

Every rule below carries the channel it came from:

- **[searched]** — established from retrieved search results: real titles, real
  section headings, real figures quoted back by the search index.
- **[reading]** — my own reading of the genre, marked as such because no page
  supporting it could be retrieved.

## Research channel, stated honestly

`WebFetch` is refused by the egress proxy for every consultancy domain. Confirmed
in this run against three targets, each returning `EGRESS_BLOCKED`:

| Target | Result |
| --- | --- |
| `www.mckinsey.com/quarterly/overview` | blocked |
| `hbr.org/topic/subject/artificial-intelligence` | blocked |
| `sloanreview.mit.edu/topic/artificial-intelligence-machine-learning/` | blocked |

No consultancy article was read in full. Everything marked **[searched]** comes
from `WebSearch` result blocks — titles, URLs and the index's own summaries of
page content. Those summaries are substantive enough to establish titles,
section headings and quoted findings, and they are not substantive enough to
establish paragraph counts, sentence rhythm or transition style. Where the
standard needs those, the rule is marked **[reading]** and should be treated as
an editorial judgement, not a finding.

### The corpus

Roughly fifty real titles were collected across six houses. The full list is in
[Appendix: the title corpus](#appendix-the-title-corpus). The pieces closest in
subject to the eight articles being rewritten, and therefore the ones the format
is drawn from:

- McKinsey, *The state of AI: How organizations are rewiring to capture value*
- McKinsey, *Agentic AI change management: Closing the adoption gap*
- McKinsey, *Reinventing marketing workflows with agentic AI*
- BCG, *AI at Work: Why Strategy Matters More Than Tools*
- BCG, *Return on AI: What CEOs Need to Know About the True Cost of Artificial Intelligence*
- BCG, *The New Economics of AI Compute Markets*
- Bain, *To Deploy Generative AI Successfully, Look to Earlier Automations*
- Bain, *Executive Survey: AI Moves from Pilots to Production*
- Deloitte, *Agentic AI is scaling faster than guardrails*
- Deloitte, *Rethinking operating models for humans with agents*
- MIT SMR, *AI Won't Fix This*
- MIT SMR, *Scaling AI With Adaptive Governance*
- Oliver Wyman, *Reimagining Technology Operations With AI And Digital Agents*

---

## 1. Length

**Rule: 1,500 to 2,500 words for a standard piece. Up to 3,000 only when the
subject genuinely needs a sixth movement.**

HBR's own contributor guidance puts practitioner articles at 1,500–2,500 words
and ideas pieces at up to 3,000. **[searched]** That is the tightest published
figure available for this genre and the rest of the field sits around it.

**Corollary rule: the stated reading time must be derived from the word count,
not chosen.** At 240 words per minute a 1,000-word article is a four-minute
read. **[reading]**

## 2. The argument comes first

**Rule: the governing thought is stated before the evidence for it, in the
standfirst and again in the first section. Sections are the load-bearing parts
of that argument, and nothing else is a section.**

The pyramid principle, developed by Barbara Minto at McKinsey, structures a
recommendation answer-first: governing thought at the top, two to three grouped
arguments below, evidence at the base. It inverts the analytical journey because
the reader wants the destination first and the supporting logic second. The SCQA
opening — situation, complication, question, answer — states facts the reader
already accepts, names the change that forces a decision, surfaces the question,
then delivers the recommendation. **[searched]**

The consequence for structure: a section exists because the argument cannot
stand without it. A section that surveys considerations is not part of an
argument. **[reading]**

## 3. Section count and shape

**Rule: three to five sections. Sections vary in length, because the parts of an
argument are not the same size.**

BCG's *AI at Work: Why Strategy Matters More Than Tools* runs three
recommendation sections. **[searched]** McKinsey's survey pieces run longer
because the evidence is the subject. **[reading]**

**Rule: a section heading states a claim or gives an instruction. It is not a
label for a topic.**

The three recovered section headings from the BCG piece are all imperatives that
carry the recommendation:

- "Invest in redesigning work end-to-end, not in more tools"
- "Put people at the heart of that redesign"
- "Govern it as a moving target, not a one-off program"

**[searched]** A reader who reads only the headings has read the argument. This
is the same discipline as the action title on an exhibit (§5).

> **Resolved, after this document was written.** `content.test.ts` enforced
> headings of six words or fewer that do not begin with an article. Two of the
> three BCG headings above would have failed on length. The six-word cap forced
> the site's headings into compressed noun stacks ("Gross-to-net value bridge",
> "Workflow authority and measurement"), which is the label form the genre
> avoids. **The cap is now nine words.** The ban on a leading article stands,
> and headings are expected to state a claim, which no test can check. Two of
> those BCG headings would still fail the house ban on the "x, not y"
> construction, and that ban stands: the construction was removed from this
> site twice and is now enforced in the suite.

## 4. Transitions

**Rule: one signpost per seam, and it justifies its place by stating the causal step.
A section does not both end by announcing the next section and get announced
again by the next section's transition.** **[reading]**

I could not retrieve transition prose from any consultancy page, so this rule
rests on my reading. It is included because the current articles break it
systematically and the redundancy is visible without a comparator (§9.4).

## 5. Exhibits

**Rule: the exhibit's title states the conclusion the exhibit supports. The
source sits in the footer. The caveat belongs with the exhibit, not in the body
text.**

Every McKinsey slide follows the same pattern: one action title stating the
insight, one exhibit that proves it, nothing else competing for attention. The
action title articulates the takeaway or "so what". The exhibit provides
evidence; the title provides interpretation. Source lines appear on every
exhibit, small, in the footer, so the number can be traced. **[searched]**

**Rule: the body text uses the exhibit to make a step in the argument, then moves
on. It does not narrate the exhibit.** **[reading]**

## 6. Numbers

**Rule: figures appear where they change the argument, attributed in line, and
are not averaged across incompatible studies.**

The houses put the number in the body with its base attached: "88 percent this
year, an increase of ten percentage points from 2024"; "only 7 percent
reported that AI had been fully scaled"; "42% of frontline employees who
regularly use AI save eight hours per week"; "only 21% say their organizations
have a mature governance model in place for agentic AI". **[searched]**

**Rule: numbers rarely appear in the headline.** Four of roughly fifty collected
titles carry a number, and where one appears it counts items ("Five Questions
Every CEO Should Ask") rather than reporting a statistic. **[searched]**

## 7. Headlines and standfirsts

From the fifty-title corpus **[searched]**:

- **Length: five to eleven words.** Median about eight.
- **They assert.** "AI Will Reshape More Jobs Than It Replaces". "AI Sovereignty
  Is an Illusion. Resilience Is Real". "AI Won't Fix This". "Agentic AI is
  scaling faster than guardrails". The assertion is a proposition the reader
  could disagree with.
- **The colon-subtitle shape is the second common form**, used where the piece is
  a recurring survey: "The state of AI: How organizations are rewiring to capture
  value"; "AI agents are only the beginning: The path to agentic transformation".
- **Questions are rare** and, where used, are answered immediately in the same
  title: "Want More Out of Your AI Investments? Think People First".
- **Two-sentence titles are permitted** where the second sentence turns the first:
  "AI Sovereignty Is an Illusion. Resilience Is Real".

**Rule for the standfirst: 10 to 15 words is the journalistic convention for a
dek; the headline intrigues in 6–10 words and the dek supplies essential context
in 10–15.** **[searched]** For a long-form consultancy piece I would allow up to
about 30 **[reading]**, but the standfirst must add the mechanism or the number
the title omits. It must not restate the title in longer words.

## 8. Register

**[searched]**, from the retrieved summaries:

- **Attribution is explicit and the base is named.** "according to BCG's 2026
  research"; "the latest McKinsey Global Survey"; "Based on analysis conducted by
  the Oliver Wyman Forum".
- **Uncertainty is expressed once, structurally, not repeatedly.** The houses
  qualify by naming the survey and its population, then argue. They do not append
  a disclaimer to each claim.
- **The imperative is used freely in recommendations**, as the BCG headings show.
- **The first person plural appears as institutional attribution**, not as
  narrative voice.

**[reading]**: the second person is used in recommendation sections and avoided
in analysis; the third person is used for named organisations throughout.

## 9. Where the genre goes wrong

The failure modes to check against. All **[searched]** except where noted.

**9.1 Fabricated or unsupported citation.** All four Big Four firms have now been
caught publishing "thought leadership" alleged to be largely machine-generated.
PwC Middle East published reports on AI and electric vehicles carrying fake
footnotes, misattributed claims and unverifiable information, including an
entire section about a framework called "Citizen Pulse" that did not exist.
Reports contained "claims that are unrelated to or contradicted by the cited
source".

**9.2 Jargon that obscures rather than compresses.** Consultancy prose uses
phrases that "sound vivid, exciting, and meaningful but express only the most
banal ideas". Some expressions are euphemism doing real work: "quick wins" and
"low-hanging fruit" for layoffs, "directionally correct" for wrong. The most
severe documented case is McKinsey's Purdue Pharma work, where corporate
register was used to avoid describing deaths as deaths.

**9.3 Friction as a substitute for depth.** "When ideas arrive wrapped in jargon,
caveats, and long setup, readers experience friction — they don't think 'This
person is deep,' they think 'This is work.'" The caveat is named alongside the
jargon as a symptom, not a virtue.

**9.4 Reader contempt for machine-shaped prose is now a market fact.** Mentions
of "AI slop" rose ninefold in 2025, with negative sentiment reaching 54% by
October; "AI;DR" entered use in early 2026. A firm publishing generic prose is
not merely dull, it is legible as generic.

**9.5 The uniform template.** **[reading]** Sections of equal length, an equal
number of paragraphs in each, and the same rhetorical move at the same point in
every piece. No house in the corpus writes this way; a survey piece and a
recommendation piece do not share a skeleton. Uniformity across a set of articles
is the clearest available signature of writing to a length target.

---

## 10. How the current eight articles depart from this standard

Measured, not asserted. Body word counts include standfirst, thesis, scene and
all section paragraphs.

| Slug | Words | Sections | Paragraphs | Claimed read | Actual read at 240 wpm |
| --- | --- | --- | --- | --- | --- |
| `ai-integration-gap` | 981 | 5 | 15 | 20 min | ~4 min |
| `open-weight-price-war` | 853 | 5 | 15 | 19 min | ~4 min |
| `automation-before-agents` | 867 | 5 | 15 | 19 min | ~4 min |
| `cold-chain-collaboration` | 796 | 5 | 15 | 18 min | ~3 min |
| `small-teams-ai-advantage` | 875 | 5 | 15 | 18 min | ~4 min |
| `measure-automation-value` | 842 | 5 | 15 | 19 min | ~4 min |
| `legal-ai-source-grounded-work` | 1,127 | 6 | 23 | 24 min | ~5 min |
| `hospitality-ai-guest-recovery` | 1,082 | 6 | 23 | 23 min | ~5 min |

### 10.1 The stated reading times are wrong by a factor of four to five

Every `read` value in `content.ts` overstates the article by 14 to 19 minutes.
Even counting the rendered exhibit interpretations, the action agenda and the
source list, no article approaches ten minutes. This is the single most
checkable false claim on the site and it is visible to any reader with a watch.

### 10.2 The articles are short, not long

The brief for this run described the articles as "about 3,000 words". They are
796 to 1,127. Six of the eight are under 900. Against §1 they are roughly half
the length of the shortest thing HBR would publish. **The problem is not that
they need cutting to reach the standard. It is that after the padding is cut
there will be very little argument left, and the gap has to be filled with
something researched.** This is the central finding of the audit.

### 10.3 The template is uniform to the paragraph

Six of eight articles are exactly 5 sections × 3 paragraphs. The remaining two
are exactly 6 sections × 4 paragraphs. All eight open with `sceneLabel: 'The
situation'`. All eight place the counterargument in the penultimate section and
the conclusion last. All eight close their final paragraph with a callback to
the opening scene ("the opening scene", "the opening group", "the opening
procurement case", "the opening note" — eleven instances). This violates §9.5
and it is the structural signature the user identified in the reading-level
split.

### 10.4 Every seam is signposted twice

The last paragraph of section *n* ends by announcing section *n+1*; section
*n+1* then opens with a `transition` field restating the same causal step. Two
examples of about thirty:

> §0 ends: "Where the usage dashboard cannot establish value, the narrower
> measure is the share of that activity connected to a business system…"
> §1 transition: "Since adoption cannot establish value, the more useful question
> is how much of that use is connected to an operational system."

> §0 ends: "…The next step is to test the physical and digital path that produced
> it."
> §1 transition: "Context can change the meaning of an excursion only if the
> underlying signal is reliable enough to support interpretation."

Seven sections across the set end on a bare "The next question / step / problem /
issue / complication is…" sentence whose only content is that another section
follows. Against §4, all of those sentences are deletable.

### 10.5 The hedging is applied by rule, not by need

Fourteen body sentences exist only to disclaim the exhibit they sit beside:
"carries no claim about economic contribution"; "predicts no uplift"; "No firm
performance has been observed"; "cannot establish causation"; "neither confirm
nor refute it". Every one of these is already stated in the exhibit's own
`interpretation.doesNotEstablish` field, which the page renders. Against §5 the
caveat belongs with the exhibit; against §9.3 the accumulated caveats read as
friction. The honesty is right and the placement is wrong.

### 10.6 Section headings label topics

"Workflow authority and measurement". "Gross-to-net value bridge". "Contextual
value of telemetry". "Matter and source boundaries". A reader who reads only
these headings learns the article's table of contents and none of its argument.
Against §3. See the flagged test conflict in §3 before changing them.

### 10.7 The standfirsts are twice the length of a dek and restate the title

29 to 39 words against the 10–15 convention (§7), and several give back the
title. `ai-integration-gap` is titled "Only a fifth of UK AI users have connected
it to a business system" and its standfirst opens "Access to artificial
intelligence has spread faster than the operating discipline required to make it
useful" — the same proposition, longer.

### 10.8 Two "composite" disclaimers survived the earlier pass

`legal-ai-source-grounded-work`: "This composite scene presents no real firm or
client." `hospitality-ai-guest-recovery`: "This composite scene describes no real
property or guest." The comment in `content.test.ts` records that the "composite
vignette" labelling was removed because it disclaimed the openings instead of
writing them. These two survived. The other six articles carry no such sentence
and are no less honest for it.

### 10.9 Surviving tics from earlier passes

Checked across `newsEditorial.ts` and `content.ts`:

- **Rhetorical questions: none.** Clean.
- **Em dashes: none.** Clean.
- **"why x matters" / "where x earns": none.** Clean.
- **"X, and what happened to Y" headlines: none.** Clean.
- **"x, not y": no literal survivors**, but the move survives recast as a bare
  negation carrying the emphasis: "Adoption is not integration" (a heading);
  "The cost of an accepted task is not cheaper"; "the correct response is not to
  invent a stronger baseline"; "naming them is not the same as hiring for them".
  These are legitimate negations, not the banned construction, but the rhythm is
  the same one and it recurs often enough to notice.
- **Ownership vocabulary: one borderline survivor.** `content.ts` line 319:
  "a clear answer on who runs it". Also "nobody owned the movement from released
  time to budget" in `measure-automation-value`.

### 10.10 Three passages are duplicated across articles in substance

The seven-word-opening test catches none of these, because the sentences are
worded differently while saying the same thing. This is the clearest evidence
available that the articles were assembled from a common stock of moves.

**The deterministic-core paragraph, in three articles.** The claim "keep the
fixed parts of the workflow in ordinary software, give the model the language
and variation, put a named human on the exceptions" appears as a paragraph in
`ai-integration-gap`, `automation-before-agents` and
`legal-ai-source-grounded-work`:

> "The strongest design usually combines ordinary software with bounded AI.
> Required fields, calculations and known notifications should remain
> deterministic. A model belongs where language or variation makes fixed rules
> inadequate." — `ai-integration-gap`

> "Ordinary workflow software should handle required fields, fixed calculations,
> known notifications and state changes. With those controls in place, the model
> faces fewer occasions on which it must infer what the organisation meant."
> — `automation-before-agents`

> "Deterministic gates control matter access, source eligibility, required
> metadata and release permissions. Model assistance handles language,
> comparison and issue spotting within that envelope."
> — `legal-ai-source-grounded-work`

Each of the three would sit unchanged in either of the other two. It is the
firm's actual house position, so it should be stated once, in the article whose
argument depends on it, and referred to rather than restated in the others.

**The four-way review decision, in two articles.** "Each release should end with
an expand, adjust, hold or stop decision" (`small-teams-ai-advantage`) and
"expand where the causal chain is working, adjust where a bottleneck is visible,
hold where observation is insufficient, or stop where the result no longer
justifies the operating cost" (`measure-automation-value`).

**The METR finding, in two articles.** "Experienced open-source developers took
19 percent longer with early-2025 AI tools on familiar repositories" appears in
both `automation-before-agents` and `measure-automation-value`, in both cases as
the sourced evidence paragraph of a middle section, and in both cases making the
same point about task-specificity. One of the two should keep it.

---

## Appendix: the title corpus

Fifty-one titles, all from `WebSearch` result blocks. **[searched]**

**McKinsey / QuantumBlack (11)**
The state of AI in 2025: Agents, innovation, and transformation ·
The state of AI: How organizations are rewiring to capture value ·
A new year's resolution for leaders: Redesign work for people and AI ·
Agentic AI change management: Closing the adoption gap ·
Reconfiguring work: Change management in the age of gen AI ·
How agentic AI is transforming the AEC industry ·
Reinventing marketing workflows with agentic AI ·
The State of Organizations 2026: Three tectonic forces that are reshaping organizations ·
AI at work but not at scale ·
State of AI trust in 2026: Shifting to the agentic era ·
Building the AI-powered organization

**BCG / BCG Henderson Institute (11)**
The Corporate Strategy Function in an AI-First World ·
AI Has Made Work Reinvention a CEO Mandate ·
AI Will Reshape More Jobs Than It Replaces ·
When Everyone Uses AI, Companies Risk Losing Critical Skills ·
AI at Work: Why Strategy Matters More Than Tools ·
AI Sovereignty Is an Illusion. Resilience Is Real ·
Why AI Change Is Actually a People Change ·
The New Economics of AI Compute Markets ·
Return on AI: What CEOs Need to Know About the True Cost of Artificial Intelligence ·
From AI Upskilling to AI Performance: Five Questions Every CEO Should Ask ·
AI Is Reshaping Jobs Faster Than Companies Are Reshaping Work

**Bain (8)**
Will the Pandemic Accelerate Adoption of Artificial Intelligence? ·
To Deploy Generative AI Successfully, Look to Earlier Automations ·
How AI Is Reshaping Industrial Automation Profit Pools ·
Automation Scorecard 2024: Lessons Learned Can Inform Deployment of Generative AI ·
Executive Survey: AI Moves from Pilots to Production ·
Want More Out of Your AI Investments? Think People First ·
Updating Enterprise Technology to Scale to "AI Everywhere" ·
Proprietary Intelligence: How to Win with AI

**Deloitte Insights (8)**
Agentic AI strategy ·
The State of AI in the Enterprise 2026 ·
AI in the Workplace: Tech Reshaping Your Workforce ·
AI agents are only the beginning: The path to agentic transformation ·
Unleashing agentic AI's true potential: Strategic approaches for a silicon-based workforce ·
Rethinking operating models for humans with agents ·
Agentic AI is scaling faster than guardrails ·
Autonomous workforce planning

**MIT Sloan Management Review (5)**
AI Won't Fix This ·
Scaling AI With Adaptive Governance ·
AI Trends in 2026: Key Insights for Leaders ·
Our Guide to the Summer 2026 Issue ·
AI in Action

**Oliver Wyman (8)**
Reimagining Technology Operations With AI And Digital Agents ·
A Government Roadmap On How To Navigate The AI Revolution ·
Understanding AI's Impact On Job And Industry Transformation ·
How Businesses Can Use AI Applications To Boost Planning ·
Shaping The Future Of AI And Quantum In Financial Services ·
AI's Next Frontier For Financial Services Leaders ·
Unlocking The Transformative Potential Of Generative AI ·
Embracing A New Era Of Healthcare With Generative AI

## Appendix: searches run

- McKinsey Quarterly article structure / word count / sections — thin, no structural data returned
- `mckinsey.com`: AI adoption workflow redesign article
- `mckinsey.com`: "the state of AI" sections headings structure survey findings
- `bcg.com`: BCG Henderson Institute AI article 2026
- "AI at Work: Why Strategy Matters More Than Tools" sections subheadings — returned real section headings
- `bain.com`: Bain insights brief artificial intelligence adoption automation
- `deloitte.com`: Deloitte Insights article AI agents workforce 2026
- `sloanreview.mit.edu`: MIT Sloan Management Review AI implementation 2026
- `oliverwyman.com`: Oliver Wyman insights artificial intelligence article
- Minto pyramid principle / SCQA / governing thought / answer-first
- McKinsey exhibit caption style / action title / takeaway
- HBR word count / editorial guidelines / dek
- standfirst vs dek conventions, headline word length
- criticism of consultancy writing style, jargon, vague prose
- consulting thought leadership AI slop criticism 2026
