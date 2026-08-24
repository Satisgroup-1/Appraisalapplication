#!/usr/bin/env bash
# Status of the hourly improvement loop.
#
# Every cycle runs in its own cloud session, so the durable record is this repo:
# the git history, LOOP-LOG.md, and IMPROVEMENTS.md. This reads all three and
# prints where the loop has got to. Safe to run any time; changes nothing.
#
#   ./scripts/loop-status.sh          summary
#   ./scripts/loop-status.sh --full   summary plus every log row and the backlog
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

FULL=0
[[ "${1:-}" == "--full" || "${1:-}" == "-f" ]] && FULL=1

BRANCH=claude/audit-application-appraisal-model-3ih1fl
b()  { printf '\033[1m%s\033[0m\n' "$1"; }
dim(){ printf '\033[2m%s\033[0m\n' "$1"; }
rule(){ printf '\033[2m%s\033[0m\n' "────────────────────────────────────────────────────────────────"; }

b "Satis Appraisal — improvement loop"
dim "$(date -u '+%Y-%m-%d %H:%M UTC')   branch: $BRANCH"
rule

# --- is the branch current with the remote? --------------------------------
b "Branch"
CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
if [[ "$CUR" != "$BRANCH" ]]; then
  echo "  on '$CUR', NOT the loop branch — cycles push to $BRANCH"
fi
git fetch origin "$BRANCH" --quiet 2>/dev/null
LOCAL=$(git rev-parse HEAD 2>/dev/null | cut -c1-7)
REMOTE=$(git rev-parse "origin/$BRANCH" 2>/dev/null | cut -c1-7 || echo '?')
AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo '?')
BEHIND=$(git rev-list --count "HEAD..origin/$BRANCH" 2>/dev/null || echo '?')
echo "  local $LOCAL   remote $REMOTE   ahead $AHEAD   behind $BEHIND"
[[ "$BEHIND" != "0" && "$BEHIND" != "?" ]] && echo "  -> $BEHIND cycle(s) landed since your last pull; run: git pull --ff-only"
DIRTY=$(git status --short | wc -l | tr -d ' ')
[[ "$DIRTY" != "0" ]] && echo "  -> working tree has $DIRTY uncommitted change(s): a cycle may be mid-run"
rule

# --- the green bar ---------------------------------------------------------
b "Green bar"
if [[ ! -d node_modules ]]; then
  echo "  dependencies not installed (run: npm ci)"
else
  if npx tsc --noEmit >/dev/null 2>&1; then echo "  typecheck  PASS"; else echo "  typecheck  FAIL  <-- the loop will fix this before anything else"; fi
  TESTOUT=$(npm test 2>&1 | grep -E '^ *Tests +' | tail -1 | sed 's/^ *//')
  echo "  tests      ${TESTOUT:-unknown}"
fi
rule

# --- cycles ----------------------------------------------------------------
b "Cycles"
if [[ -f LOOP-LOG.md ]]; then
  ROWS=$(grep -cE '^\| [0-9]{4}-[0-9]{2}-[0-9]{2}' LOOP-LOG.md || true)
  LANDED=$(grep -cE '^\| .* \| LANDED \|' LOOP-LOG.md || true)
  ABANDONED=$(grep -cE '^\| .* \| ABANDONED \|' LOOP-LOG.md || true)
  echo "  $ROWS recorded   $LANDED landed   $ABANDONED abandoned"
  echo
  echo "  most recent:"
  grep -E '^\| [0-9]{4}-[0-9]{2}-[0-9]{2}' LOOP-LOG.md | tail -$([[ $FULL == 1 ]] && echo 100 || echo 6) \
    | awk -F'|' '{printf "    %-17s %-10s %-6s %s\n", $2, $3, $4, $5}' | sed 's/  */ /3g'
else
  echo "  no LOOP-LOG.md yet — no cycle has recorded a result"
fi
rule

# --- what the loop has actually committed ----------------------------------
b "Recent commits on the branch"
git log --oneline -$([[ $FULL == 1 ]] && echo 30 || echo 8) 2>/dev/null | sed 's/^/    /'
rule

# --- backlog ---------------------------------------------------------------
# Items appear in TWO formats in IMPROVEMENTS.md: the A/C/D findings are "###"
# headings, while the B (missing mechanics) and E (process) items are bullets.
# Counting only headings hid 12 items and every B/E closure, so both are read.
b "Backlog (IMPROVEMENTS.md)"
if [[ -f IMPROVEMENTS.md ]]; then
  items() {  # -> "ID<TAB>state<TAB>title"
    grep -hE '^(### |- (~~)?\*\*)[A-E][0-9]+ (—|-) ' IMPROVEMENTS.md \
      | sed -E 's/^### //; s/^- //' \
      | awk '{ closed = (/~~/ || /FIXED/ || /CLOSED/) ? "done" : "open";
               line = $0;
               gsub(/\*\*/, "", line); gsub(/~~/, "", line);
               match(line, /^[A-E][0-9]+/); id = substr(line, RSTART, RLENGTH);
               sub(/^[A-E][0-9]+ (—|-) /, "", line);
               sub(/^(HIGH|MEDIUM\/HIGH|MEDIUM|LOW\/MEDIUM|LOW) · /, "", line);
               sub(/ · (FIXED|CLOSED).*$/, "", line);
               printf "%s\t%s\t%s\n", id, closed, line }'
  }
  ALL=$(items)
  TOTAL=$(printf '%s\n' "$ALL" | grep -c . || true)
  DONE=$(printf '%s\n' "$ALL" | grep -cP '\tdone\t' || true)
  OPEN=$((TOTAL - DONE))
  echo "  $TOTAL findings   $DONE done   $OPEN open"
  echo
  LIMIT=$([[ $FULL == 1 ]] && echo 100 || echo 6)
  echo "  next open:"
  printf '%s\n' "$ALL" | grep -P '\topen\t' | head -$LIMIT \
    | awk -F'\t' '{ printf "    %-4s %s\n", $1, substr($3, 1, 88) }'
  if [[ $FULL == 1 ]]; then
    echo
    echo "  done:"
    printf '%s\n' "$ALL" | grep -P '\tdone\t' \
      | awk -F'\t' '{ printf "    %-4s %s\n", $1, substr($3, 1, 88) }'
  fi
fi
rule

# --- what needs a human ----------------------------------------------------
b "Awaiting the client"
if [[ -f LOOP-LOG.md ]] && grep -q '## Awaiting the client' LOOP-LOG.md; then
  sed -n '/## Awaiting the client/,$p' LOOP-LOG.md | sed '1d' \
    | sed -e '/^## /,$d' | sed 's/\*\*//g' | fold -s -w 96 | sed 's/^/  /' | sed '/^  *$/d'
else
  echo "  nothing recorded"
fi
rule

# --- reviewer observations queued for the backlog --------------------------
if [[ -f LOOP-LOG.md ]] && grep -q '## Candidate backlog' LOOP-LOG.md; then
  b "Candidate backlog (reviewer observations)"
  sed -n '/## Candidate backlog/,$p' LOOP-LOG.md | sed '1d' \
    | sed -e '/^## /,$d' | fold -s -w 96 | sed 's/^/  /' | sed '/^  *$/d'
  rule
fi

dim "The Routine itself (schedule, last run) lives outside the repo — ask Claude"
dim "to run list_triggers, or see claude.ai/code for each firing's session."
