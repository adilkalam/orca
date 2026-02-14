#!/usr/bin/env bash
# hooks/post-tool-use.sh
# ORCA-Mem: Truncate large tool outputs, archive full version
# Also detects discovery mode (used by other systems)
#
# Event capture is handled by orca-record (recording layer).
# This hook only handles: truncation + archive, discovery mode detection.

set -uo pipefail

# === TRUNCATION CONFIG ===
THRESHOLD=4000
HEAD_SIZE=1500
TAIL_SIZE=500
ARCHIVE_BASE="${HOME}/.claude/archives"
ARCHIVE_DIR="${ARCHIVE_BASE}/$(date +%Y-%m-%d)"

# === DISCOVERY MODE CONFIG ===
DISCOVERY_MODE_FILE="${HOME}/.claude/temp/discovery-mode"

# Ensure directories exist
mkdir -p "$ARCHIVE_DIR" "${HOME}/.claude/temp" 2>/dev/null || true

# Read JSON from stdin (Claude Code passes hook data via stdin)
HOOK_INPUT=$(cat)
TOOL_TYPE=$(echo "$HOOK_INPUT" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")

# Extract tool response for truncation logic
OUTPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_response // empty' 2>/dev/null || echo "")
LENGTH=${#OUTPUT}

# === DISCOVERY MODE DETECTION ===

# PATH 1: MCP Trigger Detection
if [[ "$TOOL_TYPE" == mcp__cognition* ]] || [[ "$TOOL_TYPE" == mcp__sequential* ]]; then
  echo "1" > "$DISCOVERY_MODE_FILE" 2>/dev/null || true
fi

# PATH 2: Behavioral Detection (Read:Edit ratio)
# Uses a lightweight in-memory approach via the discovery mode file
# Note: detailed tool tracking is now handled by orca-record
TOOL_HISTORY_FILE="${HOME}/.claude/temp/tool-history-discovery"
echo "$TOOL_TYPE" >> "$TOOL_HISTORY_FILE" 2>/dev/null || true
if [ -f "$TOOL_HISTORY_FILE" ]; then
  RECENT=$(tail -10 "$TOOL_HISTORY_FILE" 2>/dev/null || echo "")
  READ_COUNT=$(echo "$RECENT" | grep -c "Read\|Grep\|Glob" 2>/dev/null || echo "0")
  EDIT_COUNT=$(echo "$RECENT" | grep -c "Edit\|Write" 2>/dev/null || echo "0")

  # Ensure counts are valid integers
  [[ "$READ_COUNT" =~ ^[0-9]+$ ]] || READ_COUNT=0
  [[ "$EDIT_COUNT" =~ ^[0-9]+$ ]] || EDIT_COUNT=0

  if [ "$EDIT_COUNT" -gt 0 ]; then
    RATIO=$((READ_COUNT / EDIT_COUNT))
    if [ "$RATIO" -ge 5 ]; then
      echo "1" > "$DISCOVERY_MODE_FILE" 2>/dev/null || true
    fi
  elif [ "$READ_COUNT" -ge 8 ]; then
    # Mostly reads, likely exploration
    echo "1" > "$DISCOVERY_MODE_FILE" 2>/dev/null || true
  fi
fi

# === TRUNCATION ===

DISCOVERY_ACTIVE=""
if [ -f "$DISCOVERY_MODE_FILE" ]; then
  DISCOVERY_ACTIVE="[Discovery Mode: Enhanced capture active]"
fi

if [ "$LENGTH" -gt "$THRESHOLD" ]; then
  # Generate unique ID
  RANDOM_PART=$(head -c 6 /dev/urandom 2>/dev/null | base64 2>/dev/null | tr -dc 'a-zA-Z0-9' | head -c 8 2>/dev/null || echo "$$")
  ID="$(date +%s)-${RANDOM_PART}"

  # Archive full output
  echo "$OUTPUT" > "$ARCHIVE_DIR/$ID.txt" 2>/dev/null || true

  # Calculate token estimates
  APPROX_TOKENS=$((LENGTH / 4))
  TRUNCATE_TO=$((HEAD_SIZE + TAIL_SIZE))
  SAVED_TOKENS=$(((LENGTH - TRUNCATE_TO) / 4))

  # HEAD + TAIL truncation
  HEAD="${OUTPUT:0:$HEAD_SIZE}"
  TAIL="${OUTPUT: -$TAIL_SIZE}"

  # Return truncated version
  echo "$HEAD"
  echo ""
  echo "[... $SAVED_TOKENS tokens omitted ...]"
  echo ""
  echo "$TAIL"
  echo ""
  echo "---"
  echo "[Truncated: ${APPROX_TOKENS} -> $((TRUNCATE_TO / 4)) tokens]"
  echo "[Full output: recall('$ID')]"
  if [ -n "$DISCOVERY_ACTIVE" ]; then
    echo "$DISCOVERY_ACTIVE"
  fi
else
  echo "$OUTPUT"
  if [ -n "$DISCOVERY_ACTIVE" ]; then
    echo ""
    echo "$DISCOVERY_ACTIVE"
  fi
fi

exit 0
