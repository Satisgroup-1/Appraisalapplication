---
name: audit-dcf
description: Full financial audit of the DCF engine. Use after any change to src/core/dcf.ts, audit.ts, pricing.ts or types.ts, before committing, or whenever asked to audit the model. Fans out the dcf-financial-auditor and dcf-numeric-verifier agents in parallel, collates their findings, and drives fixes to green.
---

# DCF financial audit

Run the two audit agents IN PARALLEL (one message, two Agent calls):

1. **dcf-financial-auditor** — adversarial mechanics review of the current
   diff and the whole engine, with numeric probes.
2. **dcf-numeric-verifier** — the verification battery (typecheck, tests,
   LibreOffice crosscheck, auditor self-test) plus independent recomputation
   of headline figures.

Pass each agent the same context: what changed (paste the diff summary or the
commit range) and why. Do not truncate their briefs — the agent definitions
carry the domain knowledge; your prompt only needs the change description.

## When the reports come back

- Collate findings; where the two agents disagree about a number, that
  disagreement is itself a finding — resolve it with your own probe before
  touching code.
- For each confirmed finding: write a failing test in tests/model2.test.ts
  (or tests/appaudit.test.ts for auditor gaps) FIRST, then fix, then re-run
  the battery. A fix without a test that failed beforehand does not count.
- If a regression pin in tests/dcf.test.ts must move, state the delta and its
  mechanic in the test comment and in the commit message.
- Update AUDIT.md's findings table with anything confirmed (severity, defect,
  fix) — the audit history is part of the model's credibility.
- The in-app auditor (src/core/audit.ts) must be extended whenever a new
  failure class is found: add the identity it violated as a check, and prove
  the check catches the seeded defect in tests/appaudit.test.ts.

## Definition of done

- Both agents report clean (or every finding fixed with a proving test)
- `npm test` green, `npx tsc --noEmit` clean, `./scripts/crosscheck.sh` agrees
- AUDIT.md updated if anything was found
- Report to the user: findings table (or "none found, here is what was
  probed"), pins moved and why, and the battery results.
