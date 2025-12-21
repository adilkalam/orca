#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
LOG="$ROOT_DIR/.claude/orchestration/logs/perf.jsonl"

if [ ! -f "$LOG" ]; then
  echo "No perf log found at $LOG" >&2
  exit 1
fi

last() {
  grep -E "$1" "$LOG" | tail -1
}

fmt() {
  local line="$1"
  local event=$(echo "$line" | sed -n 's/.*"event":"\([^"]*\)".*/\1/p')
  local dur=$(echo "$line" | sed -n 's/.*"duration_ms":\([0-9]*\).*/\1/p')
  local status=$(echo "$line" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')
  if [ -n "$dur" ]; then
    echo "$event: ${dur}ms${status:+ (status=$status)}"
  else
    echo "$event: (no duration)"
  fi
}

f_end=$(last '"event":"finalize_end"') || true
q_end=$(last '"event":"quick_confirm_end"') || true
d_end=$(last '"event":"detect_end"') || true

[ -n "${d_end:-}" ] && fmt "$d_end"
[ -n "${q_end:-}" ] && fmt "$q_end"
[ -n "${f_end:-}" ] && fmt "$f_end"

