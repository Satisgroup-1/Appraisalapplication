# The no-ai-slop audit

Run of the [no-ai-slop](https://github.com/petergyang/no-ai-slop) skill over the
whole site: 59 pages, 4,390 sentences. The skill is vendored unmodified at
`.claude/skills/no-ai-slop/`, with its commit recorded in `PROVENANCE.md`
beside it.

The detect pass was run mechanically, against the rendered pages rather than
the source, so nothing hid in a template and no code comment was counted as
copy. The scanner is `scan.py` in the session scratchpad; every rule in the
skill's *Words to cut* and *Patterns to cut* sections has a regex, and every
hit is reported with its sentence so the finding can be checked rather than
trusted.

## What was found and changed

Eight edits. All of them are in this repository's history under the commit that
carries this file.

| Pattern | Where | Change |
|---|---|---|
| Fake-profound kicker | `legal-ai-source-grounded-work` | Cut "A firm that cannot show its own numbers is better off quoting nobody else's." The paragraph now ends on the evaluation set, which is the mechanism the sentence was gesturing at. |
| Fake-profound kicker | `legal-ai-source-grounded-work` | Cut "A firm that cannot meet the third condition has bought a faster route to being wrong." The piece ends on the three conditions. |
| Fake-profound kicker | `measure-automation-value` | Cut "Most committees see more automation proposals than they can fund. The one to fund first is the one whose arithmetic they can check." Ends on the contrast between a checkable range and a precise figure with no route to the accounts. |
| Fake-profound kicker | `small-teams-ai-advantage` | "a capacity problem no meeting can solve by meeting harder" → "a capacity problem". |
| Rhetorical closer | `open-weight-price-war` | "Buyers who read it as a discount… Buyers who read it as headroom…" was a real distinction dressed as a symmetry. Flattened to "Taken as a discount… Spent on evaluation…", meaning unchanged. |
| Fake-strong verb | `/about` | "an inbox that functions as a queue" → "an inbox used as a queue". |
| Empty adverb | `/services` | "where effort actually goes" → "where effort goes". The contrast is already carried by "which usually contradicts the process map". |
| Empty adverb | `industries.ts`, metals and mining | "may simply have moved to the next constraint" → "may have moved". |

Four of the eight are the same defect: an aphorism in the last sentence,
standing in for a conclusion the piece had not reached. It is the one pattern
this corpus had at any density.

## What the scanner flagged and was kept

A count that is not a finding is worse than no count, so each of these is
recorded with its reason.

**Colon reveals: 83 hits, 0 real.** The skill's rule is a *noun phrase*, a
colon, then a lowercase dramatic reveal. Every hit here is a full clause
followed by an enumeration ("The constraint around it varies: the regulation,
the shift pattern, the margin"), a label ("Sources:"), or a source title
("Benchmarking employee turnover: latest trends and insights"). The skill
permits colons for lists, labels and quotes. A second pass restricted to
noun-phrase-fronted colons returned 13, all of them labels or citations.

**Importance puffery: 19 hits, 0 real.** Sixteen are `significant` in
`hospitality-ai-guest-recovery`, where it means statistical significance and is
reporting a meta-analysis. The rest are `critical` and `essential` in sector
notes, meaning safety-critical systems and essential services. Both are the
precise word.

**Banned words: 7 hits, 0 real.** `empowerment` appears in the title of a
paper in the *International Journal of Hospitality Management* and in a
sentence reporting that paper's finding. `harness` is the noun: an evaluation
harness is a test rig, and the site's own house-style test already bans the
verb forms ("harness the power", "harness the potential").

**Empty phrases: 2 hits, 0 real.** Both are "in the age of" inside the Law
Society's document title *Conducting legal research in the age of AI*.

**Empty adverbs: 6 remaining, kept.** Each marks a real contrast:
"gathered honestly in an afternoon" and "Recording the bridge honestly" are
about numbers not being massaged, and "what a release actually did" is set
against what it was claimed to do. The skill's rule is to cut them when they
add nothing, not on sight.

**Robotic rhythm: 15 consecutive same-opening pairs, 1 real.** The rest are
genuine parallel distinctions where the shape carries the meaning: "Where a job
combines a certification requirement with a customer appointment window… Where
a job has neither…", and the "Establish…" run in the hospitality piece, which
is a list of steps. The one real hit was the `open-weight-price-war` closer,
edited above.

**Two endings kept, against a close reading.** `automation-before-agents` ends
"the first written record of the decision will be a complaint", and
`professional-services-intake` ends "The gates hold their position either way."
Both have the rhythm of a kicker. Both also name a checkable outcome about the
system just described rather than a maxim about a class of firm, which is the
line the skill draws.

## Where the skill and this site disagree

**Active voice.** The skill asks for active voice with human subjects. About
21% of sentences here carry a passive, and on `/contact` it is 40%. That is not
drift: the register was set deliberately, modelled on how Accenture and Infosys
write their own procedural pages, and the whole point of "Enquiries are read by
one of the two lead consultants" is that it describes a standing practice
rather than making the reader the object of a pitch. The house-style test
enforces the same thing from the other side, capping second-person address at
one instance per page.

The site's standard wins here. It is the register the firm asked for, and the
skill is a general editing tool with no view on this site's brief.

## What now holds the line

Every rule on this site that was not tested has come back on a later editing
pass, so the two defects with a precise shape are now unit tests in
`tests/house-style.test.ts`:

- **ends a report on its subject, not on a maxim** — the final sentence of every
  article and project body may not take the form "A *noun* that cannot *verb* …
  is/has …". The same sentence earlier in a piece is a claim about a specific
  artefact and is left alone, which is why the rule is scoped to the closing
  sentence.
- **does not close a point with a turn of phrase** — bans "no *X* can *Y* by
  *Z*-ing", and two consecutive sentences opening with the same word followed by
  "who".

Both were verified against the pre-edit text: each fails when the removed
kickers are put back.

The rest of the skill's rules were already covered. Em dashes, `rather than`,
`instead of`, "x, not y" binary contrasts, interrogative headings, pseudo-clefts,
the marketing vocabulary and the hedge-adverb budget have been enforced in
`tests/house-style.test.ts` since an earlier pass. The scanner returned zero on
throat-clearing openers, faux-insight setups, weasel attribution, superficial
`-ing` analysis, negative listing, dramatic fragmentation, rhetorical setups,
summary-recap endings and em dashes.

## Not audited

`lib/email.ts` holds the acknowledgement sent to a visitor. Its body is copy the
firm wrote and is pinned verbatim by a test, deliberately, so that an editing
pass over `lib/` cannot quietly reword an email going to a prospective client.
It was left alone. Changing it means changing the pin in the same commit.
