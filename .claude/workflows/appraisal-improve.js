export const meta = {
  name: 'appraisal-improve',
  description: 'One improvement cycle: plan an item, build it, audit it under hard veto, commit only if approved',
  whenToUse:
    'The recurring Satis Appraisal improvement loop. Runs planner -> builder -> reviewer with up to 2 rework rounds; commits and pushes only on APPROVE.',
  phases: [
    { title: 'Preflight', detail: 'refuse to start on stranded, stale or already-built work' },
    { title: 'Plan', detail: 'pick and specify one item from the backlog or the three goals' },
    { title: 'Build', detail: 'implement it with failing-first tests' },
    { title: 'Review', detail: 'audit on property/accounting/modelling/UX axes; hard veto' },
    { title: 'Land', detail: 'push first, then record what actually landed' },
  ],
};

const MAX_REWORKS = 2;

const PREFLIGHT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['OK', 'WARN', 'BLOCK'] },
    reason: { type: 'string' },
    coveredItems: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Backlog ids the branch has already closed that this checkout still shows as open. The planner must not pick any of them.',
    },
    remediedBy: {
      type: 'string',
      description: 'What was done to clear a BLOCK, verbatim (e.g. "git pull --ff-only"), or "" if nothing was.',
    },
  },
  required: ['verdict', 'reason', 'coveredItems', 'remediedBy'],
  additionalProperties: false,
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    skip: { type: 'boolean', description: 'True when there is nothing safe to do this cycle.' },
    skipReason: { type: 'string' },
    id: { type: 'string', description: 'IMPROVEMENTS.md id (e.g. A4, D3) or NEW-<slug> for additive work.' },
    title: { type: 'string' },
    specification: {
      type: 'string',
      description:
        'The full brief: what is wrong, the number proving it, intended behaviour in property/accounting terms, files in and out of scope, backward-compatibility plan, acceptance criteria, blast radius.',
    },
    blockedQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Client decisions this cycle could not proceed without, if any.',
    },
  },
  required: ['skip', 'id', 'title', 'specification', 'blockedQuestions'],
  additionalProperties: false,
};

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'False when the spec proved wrong or impossible.' },
    summary: { type: 'string' },
    report: { type: 'string', description: 'What changed, failing-then-passing evidence, verification output, pins moved.' },
  },
  required: ['ok', 'summary', 'report'],
  additionalProperties: false,
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['APPROVE', 'REQUEST_CHANGES'] },
    requiredChanges: { type: 'array', items: { type: 'string' } },
    observations: { type: 'array', items: { type: 'string' }, description: 'Real but out-of-scope findings, for the backlog.' },
    evidence: { type: 'string', description: 'The numbers actually recomputed, and the green-bar output.' },
  },
  required: ['verdict', 'requiredChanges', 'observations', 'evidence'],
  additionalProperties: false,
};

const CONTEXT = `Repo: /home/user/Appraisalapplication (Satis Appraisal — UK property development
appraisal desktop app). Read .claude/appraisal-loop.md FIRST; its standing
decisions and hard limits bind you. Branch: claude/audit-application-appraisal-model-3ih1fl.`;

// ---------------------------------------------------------------------------

// --- preflight: is it safe to start new work at all? -----------------------
//
// A cycle used to open by planning. That is how one came to plan, build and
// pass review on A4 and A8 while the branch had already closed both: it
// started from a checkout nine commits stale and found out only at landing
// time, after the whole cycle was spent. Nothing is planned now until the
// repo state has been checked.

phase('Preflight');
const pre = await agent(
  `${CONTEXT}

Run \`./scripts/loop-preflight.sh --json\` and report exactly what it found.

If the verdict is BLOCK, clear it ONLY where the remedy is mechanical and
loses nothing, then re-run the script and report the second result:

- behind the branch, or the branch has closed items this checkout shows as
  open -> \`git pull --ff-only\`. This is the common case and it is safe.
- commits here that were never pushed -> push them
  (\`git push -u origin claude/audit-application-appraisal-model-3ih1fl\`).
  They do NOT survive this session; pushing them is the whole point.

Never clear a BLOCK by discarding work. Do not \`git checkout -- .\`, do not
\`git clean\`, do not force-push, do not reset over commits you did not make
in this cycle. If the tree is dirty with someone else's work in progress, or
anything else cannot be cleared safely, report BLOCK and stop — a cycle
skipped costs an hour, and force-pushing over another cycle's work costs the
work.

Report coveredItems from the FINAL run of the script.`,
  { label: 'preflight', phase: 'Preflight', agentType: 'appraisal-planner', schema: PREFLIGHT_SCHEMA },
);

if (!pre || pre.verdict === 'BLOCK') {
  const why = pre?.reason ?? 'preflight returned nothing';
  log(`Preflight BLOCKED this cycle: ${why}`);
  return { landed: false, blockedByPreflight: true, reason: why, coveredItems: pre?.coveredItems ?? [] };
}
if (pre.remediedBy) log(`Preflight cleared a block with: ${pre.remediedBy}`);
if (pre.coveredItems?.length) log(`Already built, must not be re-picked: ${pre.coveredItems.join(', ')}`);

phase('Plan');
const plan = await agent(
  `${CONTEXT}

Choose and specify ONE item for this cycle. Correctness backlog first
(IMPROVEMENTS.md), then the three additive goals. Skip anything blocked on a
client decision and record it under blockedQuestions instead of guessing.
${
  pre.coveredItems?.length
    ? `
ALREADY BUILT — do not pick any of these, whatever IMPROVEMENTS.md says about
them. The branch has closed them and this checkout's backlog is simply behind:
${pre.coveredItems.map((i) => `  - ${i}`).join('\n')}
If one of them looks like the best available item, that is the staleness
talking. Pick the next one that is genuinely open.`
    : ''
}

${args?.steer ? `Extra steer from the client for this cycle: ${args.steer}` : ''}`,
  { label: 'plan', phase: 'Plan', agentType: 'appraisal-planner', schema: PLAN_SCHEMA },
);

if (!plan || plan.skip) {
  log(`Nothing built this cycle: ${plan?.skipReason ?? 'planner returned nothing'}`);
  return {
    landed: false,
    reason: plan?.skipReason ?? 'planner returned nothing',
    blockedQuestions: plan?.blockedQuestions ?? [],
  };
}

log(`Item: ${plan.id} — ${plan.title}`);
if (plan.blockedQuestions?.length) log(`Blocked questions raised: ${plan.blockedQuestions.length}`);

// --- build / review with a hard veto and bounded rework ---------------------

let build = null;
let review = null;
let round = 0;

while (round <= MAX_REWORKS) {
  phase('Build');
  const rework =
    round === 0
      ? ''
      : `
This is rework round ${round} of ${MAX_REWORKS}. The reviewer REFUSED the
previous attempt. Its required changes, which you must address in full:

${review.requiredChanges.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Reviewer's evidence:
${review.evidence}

Fix these specifically. Do not start over, and do not argue the findings in
code — if you believe one is wrong, say so in your report with the number that
disproves it.`;

  build = await agent(
    `${CONTEXT}

Implement this specification. Failing-first tests, green typecheck and tests
before you report.

--- SPECIFICATION (${plan.id}: ${plan.title}) ---
${plan.specification}
--- END ---
${rework}`,
    { label: round === 0 ? 'build' : `rework-${round}`, phase: 'Build', agentType: 'appraisal-builder', schema: BUILD_SCHEMA },
  );

  if (!build || !build.ok) {
    log(`Builder stopped: ${build?.summary ?? 'no report'}`);
    break;
  }

  phase('Review');
  review = await agent(
    `${CONTEXT}

Audit the change now in the working tree. You hold a hard veto. Recompute the
numbers yourself and run the green bar yourself — do not take the builder's
word for either.

--- SPECIFICATION (${plan.id}: ${plan.title}) ---
${plan.specification}
--- END SPECIFICATION ---

--- BUILDER'S REPORT ---
${build.report}
--- END REPORT ---`,
    { label: round === 0 ? 'review' : `review-${round}`, phase: 'Review', agentType: 'appraisal-reviewer', schema: REVIEW_SCHEMA },
  );

  if (!review) {
    log('Reviewer returned nothing — treating as a refusal, nothing will be committed.');
    break;
  }
  if (review.verdict === 'APPROVE') {
    log(`Approved after ${round} rework round(s).`);
    break;
  }
  log(`Refused (round ${round}): ${review.requiredChanges.length} required change(s).`);
  round += 1;
}

const approved = !!build?.ok && review?.verdict === 'APPROVE';

// --- land, or revert and log ------------------------------------------------

phase('Land');
const landing = await agent(
  `${CONTEXT}

${
  approved
    ? `The reviewer APPROVED this change. Land it.

READ THIS FIRST. A cycle is not finished when it commits, it is finished when
it PUSHES. This session's container is reclaimed when the session ends, and a
commit that was never pushed dies with it. That has happened: a reviewed,
green commit was stranded by a push failure, the container went away, the log
still said LANDED, and the next cycle rebuilt the whole item from scratch. So
the push comes BEFORE the log entry, and the log records what actually
reached the remote — never what was merely intended.

1. Re-run \`npx tsc --noEmit\` and \`npm test\`. If either fails, STOP and
   revert with \`git checkout -- . && git clean -fd\` — do not commit red.

2. Re-run \`./scripts/loop-preflight.sh --json\`. This cycle has been running
   for a while and the branch may have moved under it. If coveredItems now
   contains ${plan.id}, another cycle has already built this: do NOT land it.
   Skip to the ABANDON path below, recording "superseded on the branch while
   this cycle ran" as the reason, and keep any reviewer observations that are
   still true of the branch as it now stands. If the checkout is merely
   behind, \`git pull --ff-only\` and re-run the green bar before continuing.

3. \`git add -A\` and commit. The message must explain, in prose, what was
   wrong and what the change does, with the numbers that make it concrete;
   mention any moved golden pin and its provenance. End with the trailer
   below, verbatim.

4. \`git push -u origin claude/audit-application-appraisal-model-3ih1fl\`,
   retrying up to 4 times with exponential backoff on network failure only.

5. ONLY NOW, and only if step 4 actually succeeded, append the record to
   LOOP-LOG.md (create it with a \`# Loop log\` heading if absent) in EXACTLY
   this pipe format so \`scripts/loop-status.sh\` can parse it:
   \`| <YYYY-MM-DD HH:MM> | LANDED | ${plan.id} | <title> | <rework rounds> | <one-line what changed> |\`
   Then commit and push that row too.

   If the push in step 4 could NOT be made to succeed, write the row as
   \`STRANDED\` instead of \`LANDED\`, say in the note that the work is
   committed locally and will be lost, and state the commit sha. Then say so
   plainly in your report. A cycle that cannot push has failed, and recording
   it as landed is the one outcome that guarantees the work is repeated.

Trailer:
Co-Authored-By: Claude <noreply@anthropic.com>

Do NOT create a pull request. Do NOT push any other branch.`
    : `The change was NOT approved${review ? '' : ' (no usable review)'}. Do not commit it.

1. Revert the working tree completely: \`git checkout -- . && git clean -fd\`.
   Verify with \`git status --short\` that it is clean and that HEAD is unmoved.
2. Append a one-line record to LOOP-LOG.md (create it with a \`# Loop log\`
   heading if absent), in EXACTLY this pipe format so
   \`scripts/loop-status.sh\` can parse it:
   \`| <YYYY-MM-DD HH:MM> | ABANDONED | ${plan.id} | <title> | ${round} | <the blocking reason, one line> |\`
   Then, BELOW the table under a \`## Abandoned: ${plan.id}\` heading, write
   the reviewer's required changes verbatim so the next attempt starts
   informed rather than repeating the same mistake.
3. Commit ONLY that documentation change, and push it.`
}

Then record the cycle's outcome. Item: ${plan.id} — ${plan.title}.
${
  review?.observations?.length
    ? `\nAlso append these reviewer observations to LOOP-LOG.md under a "## Candidate backlog (reviewer observations)" heading (do not act on them):\n${review.observations.map((o) => `- ${o}`).join('\n')}`
    : ''
}${
    plan.blockedQuestions?.length
      ? `\nAlso ensure these blocked client questions are listed under IMPROVEMENTS.md's "Open questions" (add only if not already there), and mirror them in LOOP-LOG.md under a "## Awaiting the client" heading so the status view surfaces them:\n${plan.blockedQuestions.map((q) => `- ${q}`).join('\n')}`
      : ''
  }`,
  { label: approved ? 'commit' : 'revert', phase: 'Land', agentType: 'appraisal-builder' },
);

return {
  landed: approved,
  item: `${plan.id} — ${plan.title}`,
  reworkRounds: round,
  requiredChanges: approved ? [] : (review?.requiredChanges ?? []),
  observations: review?.observations ?? [],
  blockedQuestions: plan.blockedQuestions ?? [],
  landingNote: landing,
};
