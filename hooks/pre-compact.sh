#!/usr/bin/env bash
# PreCompact Hook - Captures context before compaction
# Prevents information loss during context window compaction
#
# Called by Claude Code before context is compacted (auto or manual)

set -uo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR" || exit 0

WORKSHOP_DIR=".claude/memory"

# Get compaction reason from environment
REASON="${CLAUDE_PRECOMPACT_MATCHER:-unknown}"

# Check if workshop CLI is available
if ! command -v workshop >/dev/null 2>&1; then
  echo "PreCompact: Workshop CLI not available, skipping context capture" >&2
  exit 0
fi

# Record that compaction is happening
workshop --workspace "$WORKSHOP_DIR" note \
  "Context compaction triggered ($REASON) - preserving conversation state" \
  -t compaction -t "compaction-$REASON" 2>/dev/null || true

# Capture current state
if workshop --workspace "$WORKSHOP_DIR" state >/dev/null 2>&1; then
  echo "PreCompact: Preserved context before $REASON compaction" >&2
fi

exit 0
