#!/usr/bin/env bash
# PreCompact Hook - Captures context before compaction
# Prevents information loss during context window compaction
#
# Called by Claude Code before context is compacted (auto or manual)
# Receives JSON on stdin with transcript_path and trigger fields
#
# LOCAL ONLY - no API calls, no network requests

set -o pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR" || exit 0

WORKSHOP_DIR=".claude/memory"
SNAPSHOT_FILE=".orca/orchestration/temp/pre-compact-snapshot.md"

# Read JSON from stdin (Claude Code passes hook data via stdin)
HOOK_INPUT=$(cat 2>/dev/null || echo "")
TRANSCRIPT=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty' 2>/dev/null || echo "")
TRIGGER=$(echo "$HOOK_INPUT" | jq -r '.trigger // "unknown"' 2>/dev/null || echo "unknown")

# Ensure temp directory exists
mkdir -p "$(dirname "$SNAPSHOT_FILE")" 2>/dev/null || true

# Extract last portion of transcript as context snapshot
SNAPSHOT_PREVIEW=""
if [ -n "$TRANSCRIPT" ] && [ -f "$TRANSCRIPT" ]; then
  {
    echo "# Pre-Compact Context Snapshot"
    echo "**Trigger**: $TRIGGER"
    echo "**Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "**Transcript**: $TRANSCRIPT"
    echo ""
    echo "## Recent Context (last 50 entries)"
    echo ""
    # Extract last 50 lines of transcript for key signals
    # Transcript is JSONL -- try jq extraction first, fall back to raw tail
    tail -50 "$TRANSCRIPT" 2>/dev/null | \
      jq -r 'select(.type == "assistant" or .type == "tool_result") |
        .content[:200] // .text[:200] // empty' 2>/dev/null || \
      tail -50 "$TRANSCRIPT" 2>/dev/null || echo "(transcript not readable)"
  } > "$SNAPSHOT_FILE" 2>/dev/null || true

  SNAPSHOT_PREVIEW=$(head -c 200 "$SNAPSHOT_FILE" 2>/dev/null | tr '\n' ' ')
else
  # No transcript available -- write minimal snapshot
  {
    echo "# Pre-Compact Context Snapshot"
    echo "**Trigger**: $TRIGGER"
    echo "**Timestamp**: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "**Transcript**: (not available)"
    echo ""
    echo "No transcript path provided or file not found."
  } > "$SNAPSHOT_FILE" 2>/dev/null || true
fi

echo "PreCompact: Snapshot written to $SNAPSHOT_FILE (trigger=$TRIGGER)" >&2

exit 0
