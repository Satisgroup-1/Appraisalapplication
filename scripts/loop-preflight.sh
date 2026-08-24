#!/usr/bin/env bash
# Preflight for one improvement cycle: is it safe to start new work at all?
#
# WHY THIS EXISTS. Every cycle runs in its own cloud session, and the container
# is reclaimed when the session ends. A commit that is made but never pushed
# does not survive — and because the cycle writes "LANDED" to LOOP-LOG.md
# before it pushes, the log claims success while the work evaporates. That
# happened: a reviewed, green commit was stranded by a push failure, the
# container went away, and the next cycle read the backlog, found the item
# still open, and rebuilt it from scratch. Nobody noticed until a human did.
#
# So this runs BEFORE the planner and answers three questions:
#
#   1. Is there work committed here that was never pushed?   (it will be lost)
#   2. Is there work pushed that never reached main?         (it is unlanded)
#   3. Does either of those already cover a backlog item     (the planner is
#      that IMPROVEMENTS.md still shows as open?              about to duplicate)
#
# Question 3 is the duplication check. Its primary signal is not commit prose
# but the IMPROVEMENTS.md diff: a cycle that finishes an item strikes it
# through in the backlog, so an item struck through in unpushed or unmerged
# work while still reading "open" on main is, precisely, an item the planner
# would pick and rebuild.
#
#   ./scripts/loop-preflight.sh          human-readable, exit code carries the verdict
#   ./scripts/loop-preflight.sh --json   machine-readable, always exits 0
#
# Exit codes (non-JSON mode): 0 = OK, 1 = WARN (unlanded work), 2 = BLOCK
# (stranded commits or a dirty tree — do not start new work).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
# shellcheck source=lib/backlog.sh
. "$(dirname "$0")/lib/backlog.sh"

JSON=0
[[ "${1:-}" == "--json" ]] && JSON=1

# Overridable so the check can be exercised against a known-bad history, and
# so a fork can point it at its own branch names. The defaults are the loop's.
BRANCH=${LOOP_BRANCH:-claude/audit-application-appraisal-model-3ih1fl}
TRUNK=${LOOP_TRUNK:-main}

b()   { printf '\033[1m%s\033[0m\n' "$1"; }
dim() { printf '\033[2m%s\033[0m\n' "$1"; }
rule(){ printf '\033[2m%s\033[0m\n' "────────────────────────────────────────────────────────────────"; }

# Best effort: a preflight that dies on a network blip is worse than one that
# reports what it could see. Every check below degrades to "unknown" instead.
#
# EXPLICIT REFSPECS MATTER HERE. `git fetch origin <branch>` does not reliably
# update refs/remotes/origin/<branch> in the shallow, single-branch clones these
# sessions run in — it writes FETCH_HEAD and leaves the tracking ref stale. A
# stale tracking ref makes already-pushed commits look stranded, which would
# BLOCK every cycle on a false positive. Naming the destination ref is what
# stops that.
git fetch origin "+refs/heads/$BRANCH:refs/remotes/origin/$BRANCH" --quiet 2>/dev/null
git fetch origin "+refs/heads/$TRUNK:refs/remotes/origin/$TRUNK" --quiet 2>/dev/null

have_ref() { git rev-parse --verify --quiet "$1" >/dev/null 2>&1; }

REMOTE_BRANCH="origin/$BRANCH"
REMOTE_TRUNK="origin/$TRUNK"

DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

STRANDED=0
if have_ref "$REMOTE_BRANCH"; then
  STRANDED=$(git rev-list --count "$REMOTE_BRANCH..HEAD" 2>/dev/null || echo 0)
fi

UNMERGED=0
if have_ref "$REMOTE_BRANCH" && have_ref "$REMOTE_TRUNK"; then
  UNMERGED=$(git rev-list --count "$REMOTE_TRUNK..$REMOTE_BRANCH" 2>/dev/null || echo 0)
fi

# Building on a stale base is the other half of the same failure. A cycle that
# began at 16fc419 while the branch advanced six commits underneath it planned,
# built AND passed review on two findings that had already landed, and only
# found out when it tried to land. Starting behind is not a warning, it is the
# duplication about to happen.
BEHIND=0
if have_ref "$REMOTE_BRANCH"; then
  BEHIND=$(git rev-list --count "HEAD..$REMOTE_BRANCH" 2>/dev/null || echo 0)
fi

# --- the duplication check -------------------------------------------------
#
# WHICH BACKLOG IS THE AUTHORITY. Not main. The loop commits straight to its own
# branch and never opens a PR, so `origin/<branch>` IS its trunk, and for most
# of this project's life main had no IMPROVEMENTS.md at all. The planner reads
# the backlog in THIS working tree, so the question that matters is:
#
#   which items does my checkout still call open, that origin/<branch>
#   already calls done?
#
# Every one of those is an item the planner can pick and rebuild. That is
# exactly what happened at 03:25: a checkout at 16fc419 planned, built and
# passed review on A4 and A8 while the branch had already closed them, and the
# duplication only surfaced at landing time, after the whole cycle was spent.
#
# Comparing states beats scraping prose. An item's state is a fact recorded in
# one place by whichever cycle finished it, so no regex has to guess whether a
# commit message means "fixed this" or merely "mentioned this" — and workbook
# cell references shaped like ids (E29, F33, C42, D01) can never be mistaken
# for findings, because they are not items in either backlog.

state_at() {  # state_at <ref> <id> -> open|done|""
  local ref="$1" id="$2" tmp
  tmp="${BACKLOG_CACHE}/$(printf '%s' "$ref" | tr '/' '_')"
  if [[ ! -f "$tmp" ]]; then
    git show "$ref:IMPROVEMENTS.md" > "$tmp" 2>/dev/null || : > "$tmp"
  fi
  backlog_state "$id" "$tmp"
}

BACKLOG_CACHE=$(mktemp -d)
trap 'rm -rf "$BACKLOG_CACHE"' EXIT

# Items this checkout calls open but the branch has already closed.
COVERED=""
if have_ref "$REMOTE_BRANCH" && [[ -f IMPROVEMENTS.md ]]; then
  while IFS=$'\t' read -r id local_state _; do
    [[ "$local_state" == "open" ]] || continue
    [[ "$(state_at "$REMOTE_BRANCH" "$id")" == "done" ]] && COVERED="$COVERED $id"
  done < <(backlog_items IMPROVEMENTS.md)
  COVERED=$(echo "$COVERED" | xargs -r echo)
fi

# The mirror case: items this checkout has closed that the branch has not seen.
# Real work, sitting in commits that die with this container unless pushed.
UNPUSHED_CLOSURES=""
if have_ref "$REMOTE_BRANCH" && [[ -f IMPROVEMENTS.md ]]; then
  while IFS=$'\t' read -r id local_state _; do
    [[ "$local_state" == "done" ]] || continue
    [[ "$(state_at "$REMOTE_BRANCH" "$id")" == "open" ]] && UNPUSHED_CLOSURES="$UNPUSHED_CLOSURES $id"
  done < <(backlog_items IMPROVEMENTS.md)
  UNPUSHED_CLOSURES=$(echo "$UNPUSHED_CLOSURES" | xargs -r echo)
fi

# --- LOOP-LOG honesty ------------------------------------------------------
# A row saying LANDED for an item the trunk still shows as open means the log
# recorded a success that never reached the trunk. That is the failure this
# script exists for, seen from the other side.
LYING_ROWS=""
if [[ -f LOOP-LOG.md ]] && have_ref "$REMOTE_BRANCH"; then
  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    [[ -z "$(state_at "$REMOTE_BRANCH" "$id")" ]] && continue
    [[ "$(state_at "$REMOTE_BRANCH" "$id")" == "open" ]] && LYING_ROWS="$LYING_ROWS $id"
  done < <(grep -E '^\| .* \| LANDED \|' LOOP-LOG.md 2>/dev/null | awk -F'|' '{ gsub(/ /, "", $4); print $4 }' | sort -u)
  LYING_ROWS=$(echo "$LYING_ROWS" | xargs -r echo)
fi

# --- verdict ---------------------------------------------------------------
VERDICT=OK
REASON="clean: nothing committed-but-unpushed, nothing unlanded"
CODE=0
if [[ "$STRANDED" -gt 0 ]]; then
  VERDICT=BLOCK
  REASON="$STRANDED commit(s) exist here but are NOT on $REMOTE_BRANCH — push them before starting anything new, or they are lost when this session ends"
  CODE=2
elif [[ "$DIRTY" -gt 0 ]]; then
  VERDICT=BLOCK
  REASON="$DIRTY uncommitted change(s) in the working tree — a cycle is mid-run or left residue; resolve before starting new work"
  CODE=2
elif [[ -n "$COVERED" ]]; then
  VERDICT=BLOCK
  REASON="$REMOTE_BRANCH has already closed items this checkout still shows as open ($COVERED) — pull before planning, or the cycle will rebuild them"
  CODE=2
elif [[ "$BEHIND" -gt 0 ]]; then
  VERDICT=BLOCK
  REASON="this checkout is $BEHIND commit(s) behind $REMOTE_BRANCH — fast-forward before planning (git pull --ff-only), or the cycle will build against work that already exists"
  CODE=2
elif [[ "$UNMERGED" -gt 0 ]]; then
  VERDICT=WARN
  REASON="$UNMERGED commit(s) on $REMOTE_BRANCH have not reached $TRUNK"
  CODE=1
fi

if [[ $JSON == 1 ]]; then
  esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
  json_list() { local out="" x; for x in $1; do out="$out\"$x\","; done; printf '[%s]' "${out%,}"; }
  printf '{'
  printf '"verdict":"%s",'        "$VERDICT"
  printf '"reason":"%s",'         "$(esc "$REASON")"
  printf '"dirtyFiles":%s,'       "$DIRTY"
  printf '"strandedCommits":%s,'  "$STRANDED"
  printf '"commitsBehind":%s,'    "$BEHIND"
  printf '"unmergedCommits":%s,'  "$UNMERGED"
  printf '"coveredItems":%s,'     "$(json_list "$COVERED")"
  printf '"closedHereNotPushed":%s,' "$(json_list "$UNPUSHED_CLOSURES")"
  printf '"logClaimsLanded":%s'   "$(json_list "$LYING_ROWS")"
  printf '}\n'
  exit 0
fi

b "Improvement loop — preflight"
dim "$(date -u '+%Y-%m-%d %H:%M UTC')   branch: $BRANCH   trunk: $TRUNK"
rule

b "Verdict: $VERDICT"
echo "  $REASON"
rule

b "Unlanded work"
echo "  uncommitted files            $DIRTY"
echo "  committed here, not pushed   $STRANDED"
echo "  behind $REMOTE_BRANCH   $BEHIND"
echo "  pushed, not on $TRUNK          $UNMERGED"
if [[ "$STRANDED" -gt 0 ]]; then
  echo
  echo "  stranded commits (these do NOT survive this session):"
  git log --oneline "$REMOTE_BRANCH..HEAD" 2>/dev/null | sed 's/^/    /'
fi
if [[ "$BEHIND" -gt 0 ]]; then
  echo
  echo "  on the branch but NOT in this checkout (looks like open backlog from here):"
  git log --oneline "HEAD..$REMOTE_BRANCH" 2>/dev/null | sed 's/^/    /'
fi
if [[ "$UNMERGED" -gt 0 ]]; then
  echo
  echo "  pushed but not merged into $TRUNK:"
  git log --oneline "$REMOTE_TRUNK..$REMOTE_BRANCH" 2>/dev/null | sed 's/^/    /'
fi
rule

if [[ -n "$UNPUSHED_CLOSURES" ]]; then
  b "Closed here, not on the branch"
  echo "  This checkout has finished these, and $REMOTE_BRANCH has not seen it."
  echo "  Push before doing anything else — they die with this session:"
  for id in $UNPUSHED_CLOSURES; do echo "    $id"; done
  rule
fi

b "Duplication check"
if [[ -z "$COVERED" ]]; then
  echo "  no open backlog item is already covered by unlanded work"
else
  echo "  DO NOT PICK these. $REMOTE_BRANCH has already closed them,"
  echo "  but THIS checkout's backlog still reads them as open — so the"
  echo "  planner would pick one and rebuild what already exists:"
  for id in $COVERED; do
    printf '    %-4s %s\n' "$id" "$(backlog_items IMPROVEMENTS.md | awk -F'\t' -v i="$id" '$1==i{print substr($3,1,80)}')"
  done
  echo
  echo "  Pull the branch first (git pull --ff-only), then re-run: the work"
  echo "  already exists on $REMOTE_BRANCH."
fi
rule

if [[ -n "$LYING_ROWS" ]]; then
  b "LOOP-LOG.md disagrees with the trunk"
  echo "  These items have a LANDED row but are still open on $TRUNK, so the"
  echo "  log recorded a success that never arrived:"
  for id in $LYING_ROWS; do echo "    $id"; done
  rule
fi

exit $CODE
