# DO NOT MERGE THIS BRANCH

**Branch:** `claude/folding-maps-repo-nvhf78`
**Rule:** this branch must **NEVER** be merged, rebased, squashed or cherry-picked into `main`.

## Why

This branch is a quarantined workspace holding a **separate project** — the
`rohancampion/folding-maps` repository (the *quiet gears* Next.js marketing site),
vendored under `folding-maps/`. It is unrelated to the Satis Appraisal application
that lives on `main`. It shares this repository only as a convenient place to work on it.

## The rule, precisely

- No pull request from `claude/folding-maps-repo-nvhf78` into `main` may be merged.
- No commit from this branch may reach `main` by any route — merge, rebase, squash,
  cherry-pick, or a direct push.
- `main` must never contain a `folding-maps/` directory.
- Work flows one way only: `main` may be merged **into** this branch to keep it current.
  Never the reverse.

## How it is enforced

`.github/workflows/no-merge-to-main.yml` on this branch enforces the rule in CI:

1. **`block-pr-to-main`** — fails any pull request whose head is this branch and whose
   base is `main`, so the PR can never go green.
2. **`assert-main-is-clean`** — runs on every push to `main`. If the workflow file ever
   arrives on `main` (i.e. someone merged this branch anyway), the job fails loudly and
   the merge is visible in the Actions tab immediately.

CI is a backstop, not permission to try. If you need something from this branch on
`main`, copy the specific files into a fresh branch cut from `main` — do not merge.
