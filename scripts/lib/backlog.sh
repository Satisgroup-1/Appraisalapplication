#!/usr/bin/env bash
# Shared reader for the IMPROVEMENTS.md backlog.
#
# Sourced by scripts/loop-status.sh and scripts/loop-preflight.sh. It lives
# here because both need to agree on what "open" means: a preflight that
# disagreed with the status view about which items are outstanding would be
# worse than no preflight at all.
#
# Items appear in TWO formats. The A/C/D findings are "###" headings; the B
# (missing mechanics) and E (process) items are bullets. Reading only headings
# once hid 12 items and every B/E closure, so both are parsed here.

# backlog_items <file> -> "ID<TAB>open|done<TAB>title", one per line.
backlog_items() {
  local file="${1:-IMPROVEMENTS.md}"
  [[ -f "$file" ]] || return 0
  grep -hE '^(### |- (~~)?\*\*)[A-E][0-9]+ (—|-) ' "$file" \
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

# backlog_ids <file> -> every id that exists in the backlog, one per line.
#
# The preflight intersects commit-message matches with this set, which is what
# stops workbook cell references being read as backlog ids: the model is full
# of tokens shaped exactly like item ids — E29 (facility estimate), F33, C42,
# D01 — and none of them are findings. Only ids the backlog actually defines
# survive the intersection.
backlog_ids() {
  backlog_items "${1:-IMPROVEMENTS.md}" | cut -f1 | sort -u
}

# backlog_state <id> <file> -> "open", "done", or "" when the id is unknown.
backlog_state() {
  local id="$1" file="${2:-IMPROVEMENTS.md}"
  backlog_items "$file" | awk -F'\t' -v id="$id" '$1 == id { print $2; exit }'
}
