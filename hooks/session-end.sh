#!/usr/bin/env bash
# hooks/session-end.sh
# ORCA-Mem: Save session events to Workshop at session end
# Writes structured session summary for next-session loading (FR-2.2)
# No external API dependencies - just local storage
# LOCAL ONLY - no API calls, no network requests

set -o pipefail

EVENT_BUFFER="${HOME}/.claude/temp/event-buffer.jsonl"
DISCOVERY_MODE_FILE="${HOME}/.claude/temp/discovery-mode"
TOOL_HISTORY_FILE="${HOME}/.claude/temp/tool-history"
PENDING_TITLES="${HOME}/.claude/temp/pending-titles.jsonl"
WORKSHOP_DIR=".claude/memory"

# Check if there are events to process
if [ ! -f "$EVENT_BUFFER" ] || [ ! -s "$EVENT_BUFFER" ]; then
  echo "SessionEnd: No events to save"
  rm -f "$DISCOVERY_MODE_FILE" "$TOOL_HISTORY_FILE" "$PENDING_TITLES" 2>/dev/null || true
  exit 0
fi

EVENT_COUNT=$(wc -l < "$EVENT_BUFFER" 2>/dev/null | tr -d ' ') || EVENT_COUNT=0
echo "SessionEnd: Saving $EVENT_COUNT events..."

# Build summary from events (no LLM, just structured extraction)
SUMMARY=""
TOOLS_USED=""
FILES_CHANGED=""
ERRORS=""

while IFS= read -r line; do
  TOOL=$(echo "$line" | grep -o '"tool":"[^"]*"' | sed 's/"tool":"//;s/"$//' 2>/dev/null || echo "")
  TYPE=$(echo "$line" | grep -o '"type":"[^"]*"' | sed 's/"type":"//;s/"$//' 2>/dev/null || echo "")

  [ -n "$TOOL" ] && TOOLS_USED="$TOOLS_USED $TOOL"

  if [ "$TYPE" = "file_change" ]; then
    FILES_CHANGED="$FILES_CHANGED $TOOL"
  elif [ "$TYPE" = "error" ]; then
    ERRORS="$ERRORS [error detected]"
  fi
done < "$EVENT_BUFFER"

# Deduplicate tools
UNIQUE_TOOLS=$(echo "$TOOLS_USED" | tr ' ' '\n' | sort -u | tr '\n' ' ' | xargs)

# Create note content
NOTE_CONTENT="Session events ($EVENT_COUNT total). Tools: $UNIQUE_TOOLS"
[ -n "$ERRORS" ] && NOTE_CONTENT="$NOTE_CONTENT | Errors detected"

# Save to workshop
if command -v workshop >/dev/null 2>&1; then
  workshop --workspace "$WORKSHOP_DIR" note "$NOTE_CONTENT" -t session -t auto 2>/dev/null || true
  echo "SessionEnd: Saved to Workshop"
else
  echo "SessionEnd: Workshop CLI not found"
fi

# ============================================================
# BUILD STRUCTURED SESSION SUMMARY (FR-2.2)
# ============================================================
# Writes a structured summary for next-session loading (FR-2.3)
# All LOCAL -- no API calls

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SUMMARY_FILE="$ROOT_DIR/.claude/orchestration/temp/session-summary.md"
mkdir -p "$(dirname "$SUMMARY_FILE")" 2>/dev/null || true

{
  echo "# Session Summary"
  echo "**Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "**Events**: $EVENT_COUNT"
  echo "**Tools**: $UNIQUE_TOOLS"
  echo ""

  # Files changed
  if [ -n "$FILES_CHANGED" ]; then
    echo "## Files Changed"
    echo "$FILES_CHANGED" | tr ' ' '\n' | sort -u | while read -r f; do
      [ -n "$f" ] && echo "- $f"
    done
    echo ""
  fi

  # Errors
  if [ -n "$ERRORS" ]; then
    echo "## Errors Encountered"
    echo "$ERRORS"
    echo ""
  fi

  # Pre-compact snapshot (if available)
  SNAPSHOT="$ROOT_DIR/.claude/orchestration/temp/pre-compact-snapshot.md"
  if [ -f "$SNAPSHOT" ]; then
    echo "## Pre-Compact Context"
    cat "$SNAPSHOT" 2>/dev/null || echo "(snapshot not readable)"
    echo ""
  fi
} > "$SUMMARY_FILE" 2>/dev/null || true

echo "SessionEnd: Session summary written to $SUMMARY_FILE"

# Cleanup temp files (but NOT session-summary.md -- needed by next session-start)
rm -f "$EVENT_BUFFER" "$DISCOVERY_MODE_FILE" "$TOOL_HISTORY_FILE" "$PENDING_TITLES" 2>/dev/null || true

echo "SessionEnd: Complete"
exit 0
