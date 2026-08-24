export const meta = {
  name: 'appraisal-improve',
  description: 'One improvement cycle: plan an item, build it, audit it under hard veto, commit only if approved',
  whenToUse:
    'The recurring Satis Appraisal improvement loop. Runs planner -> builder -> reviewer with up to 2 rework rounds; commits and pushes only on APPROVE.',
  phases: [
    { title: 'Preflight', detail: 'refuse to run on the quarantined folding-maps branch' },
    { title: 'Plan', detail: 'pick and specify one item from the backlog or the three goals' },
    { title: 'Build', detail: 'implement it with failing-first tests' },
    { title: 'Review', detail: 'audit on property/accounting/modelling/UX axes; hard veto' },
    { title: 'Land', detail: 'commit and push, or revert and log the objection' },
  ],
};

const MAX_REWORKS = 2;

// The loop's own branch, and the branch it must never run on. See
// DO-NOT-MERGE.md and .claude/appraisal-loop.md § Out of scope.
const LOOP_BRANCH = 'claude/audit-application-appraisal-model-3ih1fl';
const QUARANTINE_BRANCH = 'claude/folding-maps-repo-nvhf78';

const PREFLIGHT_SCHEMA = {
  type: 'object',
  properties: {
    branch: { type: 'string', description: 'Output of `git rev-parse --abbrev-ref HEAD`, verbatim.' },
    foldingMapsPresent: { type: 'boolean', description: 'True if a folding-maps/ directory exists at the repo root.' },
  },
  required: ['branch', 'foldingMapsPresent'],
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
decisions and hard limits bind you. Branch: claude/audit-application-appraisal-model-3ih1fl.

Out of scope, absolutely: the folding-maps/ directory, if it exists in this
tree. It is a separate vendored project, not part of this app. Exclude it from
every search and every diff, and never edit it.`;

// ---------------------------------------------------------------------------

phase('Preflight');
const pre = await agent(
  `Report this repo's state. Run exactly these two commands in
/home/user/Appraisalapplication and report what they print — nothing else. Make
no edits, no commits, no pushes.

1. \`git rev-parse --abbrev-ref HEAD\`
2. \`test -d folding-maps && echo yes || echo no\``,
  { label: 'branch-check', phase: 'Preflight', agentType: 'appraisal-planner', schema: PREFLIGHT_SCHEMA, effort: 'low' },
);

// Fail closed: an unreadable branch is as disqualifying as the wrong one.
if (!pre) {
  log('Preflight could not determine the current branch — refusing to run.');
  return { landed: false, refused: true, reason: 'preflight failed to read the current branch' };
}
if (pre.branch === QUARANTINE_BRANCH) {
  log(`On ${QUARANTINE_BRANCH} — quarantined. See DO-NOT-MERGE.md. Nothing will run.`);
  return {
    landed: false,
    refused: true,
    reason: `the improvement loop must never run on ${QUARANTINE_BRANCH}: it holds the unrelated folding-maps project, and a cycle here would commit it onto ${LOOP_BRANCH}. Check out ${LOOP_BRANCH} and start again.`,
  };
}
if (pre.branch !== LOOP_BRANCH) {
  log(`On '${pre.branch}', not ${LOOP_BRANCH} — refusing to run.`);
  return {
    landed: false,
    refused: true,
    reason: `the loop only runs on ${LOOP_BRANCH}; HEAD is '${pre.branch}'`,
  };
}
if (pre.foldingMapsPresent) {
  log('A folding-maps/ directory is present in the tree — it is out of scope for every agent this cycle.');
}

phase('Plan');
const plan = await agent(
  `${CONTEXT}

Choose and specify ONE item for this cycle. Correctness backlog first
(IMPROVEMENTS.md), then the three additive goals. Skip anything blocked on a
client decision and record it under blockedQuestions instead of guessing.

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
    ? `The reviewer APPROVED this change. Land it:

1. Re-run \`npx tsc --noEmit\` and \`npm test\`. If either fails, STOP and
   revert with \`git checkout -- . && git clean -fd\` — do not commit red.
2. Append a one-line record to LOOP-LOG.md (create it with a
   \`# Loop log\` heading if absent), in EXACTLY this pipe format so
   \`scripts/loop-status.sh\` can parse it:
   \`| <YYYY-MM-DD HH:MM> | LANDED | ${plan.id} | <title> | <rework rounds> | <one-line what changed> |\`
3. \`git add -A\` and commit. The message must explain, in prose, what was
   wrong and what the change does, with the numbers that make it concrete;
   mention any moved golden pin and its provenance. End with the two trailers
   below, verbatim.
4. \`git push -u origin claude/audit-application-appraisal-model-3ih1fl\`,
   retrying up to 4 times with exponential backoff on network failure only.

Trailers:
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_0165x9TDjfiyzzoXdEYbNa5N

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
