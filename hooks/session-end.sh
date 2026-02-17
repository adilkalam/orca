#!/usr/bin/env bash
# hooks/session-end.sh
# Session end: save summary to Workshop + write session summary file
# Recording layer (orca-record) handles detailed event capture.
# This hook handles only Workshop memory and session summary persistence.
# LOCAL ONLY - no API calls, no network requests

set -o pipefail

WORKSHOP_DIR=".claude/memory"
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
RECORDING_DB="$ROOT_DIR/.orca/recording.db"

# ============================================================
# WORKSHOP NOTE (session memory)
# ============================================================

NOTE_CONTENT="Session ended at $(date -u +%Y-%m-%dT%H:%M:%SZ)."

# If recording database exists, pull summary from it
if [ -f "$RECORDING_DB" ] && command -v sqlite3 >/dev/null 2>&1; then
  ACTIVE_SESSION=$(sqlite3 "$RECORDING_DB" \
    "SELECT id FROM sessions WHERE state IN ('ACTIVE','ACTIVE_COMMITTED') ORDER BY started_at DESC LIMIT 1;" 2>/dev/null || echo "")
  if [ -n "$ACTIVE_SESSION" ]; then
    STEP_COUNT=$(sqlite3 "$RECORDING_DB" \
      "SELECT step_count FROM sessions WHERE id='$ACTIVE_SESSION';" 2>/dev/null || echo "0")
    FILES_TOUCHED=$(sqlite3 "$RECORDING_DB" \
      "SELECT files_touched_json FROM sessions WHERE id='$ACTIVE_SESSION';" 2>/dev/null || echo "[]")
    # Build semantic summary from recording data (extract user prompts)
    USER_PROMPTS=$(sqlite3 "$RECORDING_DB" "
      SELECT substr(
        json_extract(hook_input_json, '$.prompt'),
        1, 100
      )
      FROM events
      WHERE session_id = '$ACTIVE_SESSION'
        AND event_type = 'prompt_submit'
      ORDER BY rowid ASC
      LIMIT 3
    " 2>/dev/null | head -c 300 || echo "")

    if [ -n "$USER_PROMPTS" ]; then
      NOTE_CONTENT="Session $ACTIVE_SESSION: $STEP_COUNT steps. Files: $FILES_TOUCHED. User prompts: $USER_PROMPTS"
    else
      NOTE_CONTENT="Session $ACTIVE_SESSION: $STEP_COUNT steps. Files: $FILES_TOUCHED"
    fi
  fi
fi

# Save to Workshop
if command -v workshop >/dev/null 2>&1; then
  workshop --workspace "$WORKSHOP_DIR" note "$NOTE_CONTENT" -t session -t auto 2>/dev/null || true
  echo "SessionEnd: Saved to Workshop"
else
  echo "SessionEnd: Workshop CLI not found"
fi

# ============================================================
# BUILD STRUCTURED SESSION SUMMARY
# ============================================================
# Writes a minimal summary for next-session loading
# All LOCAL -- no API calls

SUMMARY_FILE="$ROOT_DIR/.claude/orchestration/temp/session-summary.md"
mkdir -p "$(dirname "$SUMMARY_FILE")" 2>/dev/null || true

{
  echo "# Session Summary"
  echo "**Date**: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo ""

  # Pull from recording database if available
  if [ -f "$RECORDING_DB" ] && command -v sqlite3 >/dev/null 2>&1 && [ -n "${ACTIVE_SESSION:-}" ]; then
    echo "**Recording Session**: $ACTIVE_SESSION"
    echo "**Steps**: ${STEP_COUNT:-0}"
    echo "**Files**: ${FILES_TOUCHED:-[]}"
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

# Cleanup legacy temp files if they still exist
rm -f "${HOME}/.claude/temp/event-buffer.jsonl" \
      "${HOME}/.claude/temp/discovery-mode" \
      "${HOME}/.claude/temp/tool-history" \
      "${HOME}/.claude/temp/pending-titles.jsonl" 2>/dev/null || true

echo "SessionEnd: Complete"
exit 0
