#!/usr/bin/env bash
# hooks/post-tool-use.sh
# ORCA-Mem: Truncate large tool outputs, archive full version
# Phase 1: Truncation + Archive
# Phase 2: Auto-Discovery + Event Capture

set -uo pipefail

# === PHASE 1: TRUNCATION CONFIG ===
THRESHOLD=4000
HEAD_SIZE=1500
TAIL_SIZE=500
ARCHIVE_BASE="${HOME}/.claude/archives"
ARCHIVE_DIR="${ARCHIVE_BASE}/$(date +%Y-%m-%d)"

# === PHASE 2: AUTO-DISCOVERY CONFIG ===
DISCOVERY_MODE_FILE="${HOME}/.claude/temp/discovery-mode"
TOOL_HISTORY_FILE="${HOME}/.claude/temp/tool-history"
EVENT_BUFFER="${HOME}/.claude/temp/event-buffer.jsonl"
PENDING_TITLES="${HOME}/.claude/temp/pending-titles.jsonl"

# Ensure directories exist
mkdir -p "$ARCHIVE_DIR" "${HOME}/.claude/temp" 2>/dev/null || true

# Read tool output from stdin
OUTPUT=$(cat)
LENGTH=${#OUTPUT}

# Get tool type from environment
TOOL_TYPE="${CLAUDE_TOOL_NAME:-unknown}"

# === PHASE 2: AUTO-DISCOVERY DETECTION ===

# PATH 1: MCP Trigger Detection
if [[ "$TOOL_TYPE" == mcp__cognition* ]] || [[ "$TOOL_TYPE" == mcp__sequential* ]]; then
  echo "1" > "$DISCOVERY_MODE_FILE" 2>/dev/null || true
fi

# PATH 2: Behavioral Detection (Read:Edit ratio)
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

# D1 FALLBACK: Always log titles (first 200 chars)
TITLE=$(echo "$OUTPUT" | head -c 200 | tr '\n' ' ' | tr '"' "'" 2>/dev/null || echo "")
echo "{\"ts\":\"$(date -Iseconds)\",\"tool\":\"$TOOL_TYPE\",\"title\":\"$TITLE\"}" >> "$PENDING_TITLES" 2>/dev/null || true

# CAPTURE SIGNIFICANT EVENTS (if discovery mode or significant event)
SIGNIFICANT=false
EVENT_TYPE="observation"
case "$TOOL_TYPE" in
  Edit|Write|MultiEdit)
    SIGNIFICANT=true
    EVENT_TYPE="file_change"
    ;;
  Bash)
    if echo "$OUTPUT" | grep -qi "error\|failed\|exception" 2>/dev/null; then
      SIGNIFICANT=true
      EVENT_TYPE="error"
    fi
    ;;
  mcp__project-context__save_decision)
    SIGNIFICANT=true
    EVENT_TYPE="decision"
    ;;
esac

if [ "$SIGNIFICANT" = true ] || [ -f "$DISCOVERY_MODE_FILE" ]; then
  CONTENT=$(echo "$OUTPUT" | head -c 2000 | tr '"' "'" | tr '\n' ' ' 2>/dev/null || echo "")
  # Escape for JSON safely
  ESCAPED_CONTENT=$(printf '%s' "$CONTENT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' 2>/dev/null || echo "$CONTENT")
  echo "{\"ts\":\"$(date -Iseconds)\",\"tool\":\"$TOOL_TYPE\",\"type\":\"${EVENT_TYPE}\",\"content\":\"${ESCAPED_CONTENT}\"}" >> "$EVENT_BUFFER" 2>/dev/null || true
fi

# === PHASE 1: TRUNCATION ===

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
