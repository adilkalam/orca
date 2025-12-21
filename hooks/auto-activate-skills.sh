#!/usr/bin/env bash
# Auto-activates design-related helper skills (placeholder) when task looks design-oriented.
# Writes an activation note to .claude/orchestration/temp/logs/skills.log

set -euo pipefail
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

LOG_DIR=".claude/orchestration/temp/logs"
mkdir -p "$LOG_DIR"

TASK_TEXT="${1:-}"
TS=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

if printf "%s" "$TASK_TEXT" | grep -Eiq "design|ui|ux|typography|spacing|layout|component|swiftui"; then
  echo "[$TS] Activate design helpers: (placeholder) Fluxwing/uxscii for task: ${TASK_TEXT}" >> "$LOG_DIR/skills.log"
  echo "Design helpers activation logged."
else
  echo "[$TS] No design activation for task: ${TASK_TEXT}" >> "$LOG_DIR/skills.log"
  echo "No activation (task not design-oriented)."
fi
