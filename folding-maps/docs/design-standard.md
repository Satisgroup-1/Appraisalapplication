# Design and editorial standard

The register to build against: the AI practices of the large strategy firms
(McKinsey QuantumBlack, BCG X, Bain Vector) and the credible independent AI
consultancies. What follows is the working standard for this site. Where a
judgement is contestable it is written as a rule anyway, because a site with
one opinion reads better than a site with several.

## What those firms actually do

**Navigation is capability-led and short.** Five or six top-level items, named
for what a buyer is looking for — Industries, Services, Insights, About — not
for the firm's internal structure. The contact route is present but quiet: a
single link, not a shouting button. Executives arriving on these sites are
looking for evidence of specific expertise, not for an offer.

**The hero states what the firm is, not what the reader should feel.** It is
declarative and unexcited. There is no imperative slogan, no exclamation, no
second-person command. The subhead adds a concrete fact — where the firm
works, what it builds, who it serves — rather than restating the headline in
different words.

**Insight is the proof.** The centre of gravity is published thinking, not
testimonials. A firm demonstrates competence by reasoning in public about hard
problems in its clients' industries. This is the single largest difference
between a consultancy site and a software marketing site, and the one most
often missed.

**Numbers are sourced or absent.** Every figure carries its provenance and its
date. A number without a source is worse than no number, because it invites
the one question the site cannot answer.

**Restraint signals seniority.** Near-monochrome palette, one accent used
sparingly, hairline rules instead of drop-shadowed cards, generous whitespace,
no decorative illustration. The visual language says the work is the point.

## Rules for this site

### Colour

- An unbleached ground (`#f4f2ea`), a warm near-black ink (`#16160f`), and one
  olive accent (`#4a5d23`). Nothing else.
- The accent marks interactive elements and nothing else: never a decorative
  fill, never a highlight for emphasis in prose.
- No gradients, no texture, no paper grain, no background ornament, and no
  shadows. Nothing on the page pretends to float above it.
- Contrast: body text at least 7:1 on its background, interface text at least
  4.5:1. Test rather than assume. The current palette measures 16.2:1 for ink
  on paper, 6.0:1 for the mid-tone, 6.5:1 for the accent.

### Typography

- One superfamily, two cuts. IBM Plex Sans carries everything a visitor reads.
  IBM Plex Mono is reserved for structural labels, counts, metadata and index
  numerals: the parts of the page that name its own machinery.
- The mono is a structural device, not a stylistic one. It never sets a
  sentence, and prose never uses it for emphasis.
- The display size tops out where a headline still reads as a sentence, not as
  a poster. Nothing on this site needs 124px.
- Display tracking is tight (-0.04em at h1). Headlines are dense and flush
  left.
- Measure: 62–75 characters for prose. Longer is unreadable; shorter is choppy.
- Tabular figures for anything numeric so columns align.

### Form

- Nothing is rounded. `--radius` is `0px`, and it stays a token so the intent
  is one edit rather than forty. A rounded corner would be the only soft thing
  on the page.
- Structure is carried by rules and space. Where a rule divides two columns,
  both columns are padded off it.

### Page titles

- A page title names the page: Services, Work, Insights, About, Contact. It
  does not comment, summarise or argue.
- Where the old editorialised title carried a fact worth keeping, the fact
  moves to the kicker as a count: `10 services`, `26 sectors`, `5 projects`.
- Article and project titles are the exception. Those are the titles of
  documents and carry a proposition.

### Layout

- One grid, twelve columns, consistent gutters, consistent vertical rhythm.
- Section spacing comes from a scale, not from ad-hoc pixel values.
- Rules and space do the separating. A card needs a border only when it is
  genuinely a discrete object.

### Imagery

- One band per marketing page, running edge to edge. It is the only element on
  the site that breaks the container, which is what makes it read as a division
  between sections and not as an illustration inside one.
- Each band cycles three photographs on a 27-second round: two of planting,
  then one of structure. Planting leads, so a band reads as greenery before it
  reads as concrete, and the first frame is the one a reduced-motion visitor
  sees and the one the browser fetches first.
- Nothing with a person, a screen or a stock-photograph gesture in it.
- The planting frames keep about half their saturation and are pulled toward
  the site's olive; the structure frames are duotoned flat. A band may not
  introduce a colour the palette does not have.
- The cycle is CSS, so it runs with scripting off and costs nothing on the
  main thread. The motion is a crossfade and a slow push across the frame. No
  slide, no parallax, no zoom that draws the eye off the text above it.
- Motion that starts on its own needs a way to stop it. Every band carries a
  pause control in its plate, and `prefers-reduced-motion` freezes it on the
  first frame.
- Nothing is written across a band beyond the mono plate. A caption would
  reinstate the text the band exists to replace.
- Only CC0 material is used. `public/images/ground/CREDITS.json` records the
  title, creator, licence and source URL for every file, and is the licence
  record: anything added to that directory is added there in the same commit.
- Article and project pages take no band. They carry their own exhibits, and a
  decorative image inside an argued piece competes with them.

### Density

- A heading and a standfirst that say the same thing are one thing written
  twice. Index and marketing pages carry the heading.
- The closing enquiry band is a heading and a button. The paragraph that used
  to sit between them repeated the contact page on eight pages at once.
- This applies to the marketing surfaces only. Case studies and news articles
  are argued documents and are held to length by their own structure, not by
  this rule.

### Motion and interactivity

- Motion is functional: it shows state changing or content arriving. 150–250ms,
  ease-out, opacity and small translations only.
- Every interactive element has a visible hover, focus-visible and active
  state, and the focus ring is never removed.
- `prefers-reduced-motion` is honoured everywhere, not on the hero alone.
- Interactivity must do something. A control that only animates is decoration
  with a click target; either give it a job or delete it.

## Rules for the writing

The test for every sentence: **would a partner say this out loud to a client
without embarrassment?** If not, cut it.

### Banned

- Imperative slogans and exhortation: *put AI to work*, *let's build*,
  *ready to transform?*
- The vocabulary of the AI marketing cycle: *unlock*, *leverage*, *empower*,
  *supercharge*, *seamless*, *cutting-edge*, *game-changing*, *revolutionise*,
  *harness the power of*, *in today's fast-paced world*, *journey*.
- Claims with no referent: *industry-leading*, *world-class*, *bespoke
  solutions*, *end-to-end*, *tailored to your needs*.
- Sentences that survive deletion. If removing it changes nothing, remove it.
- Exclamation marks. All of them.

### Required

- **Specifics carry the argument.** A named constraint, a real number with its
  source, a decision that could have gone the other way.
- **Reasoning, not assertion.** Say why the approach is right, and what it
  costs. An argument that acknowledges its own trade-off is more persuasive
  than one that does not.
- **Say what is not true.** Where the evidence is thin, the limit is stated.
  This reads as confidence, not weakness, and it is the register the large
  firms actually use in their published work.
- **Plain English.** Active voice. 15–25 words a sentence on average. Technical
  vocabulary only where it is load-bearing, and defined the first time.
- **British spelling**, consistently: organisation, prioritise, programme.

### Structure of a page

Every substantial page answers, in this order: what is the problem, why is it
hard, what do we do about it, what would tell you it worked, and what are the
limits. A page that skips the fourth and fifth is a brochure.
