#!/usr/bin/env bash
# SessionStart Hook (Hardened v3 - Lean Output)
# - Loads session context FROM Workshop (source of truth)
# - Initializes/syncs code-index.db for local context cache
# - Output: .claude/orchestration/temp/session-context.md
#
# v3 changes: Stdout capped to ~2-5KB. Detailed data goes to session-context.md only.
# Workshop context, recent entries, and static reminders removed from stdout.
# These were duplicated from CLAUDE.md or session-context.md, wasting ~85KB of context.
#
# Error Handling Strategy:
# - Each component can fail independently
# - Failures are logged but don't block session start
# - Hook always succeeds (exit 0) to not block Claude Code

# Don't use -e (exit on error) - we handle errors explicitly
set -uo pipefail

# ============================================================
# CONFIGURATION
# ============================================================

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR" || exit 0

ORCH_DIR=".claude/orchestration"
TEMP_DIR="$ORCH_DIR/temp"
OUT_MD="$TEMP_DIR/session-context.md"
ERROR_LOG="$TEMP_DIR/session-start-errors.log"
DB_PATH=".claude/memory/workshop.db"
WORKSHOP_DIR=".claude/memory"
CODE_INDEX_DB="$WORKSHOP_DIR/code-index.db"
CODE_INDEX_SCRIPT="$HOME/.claude/scripts/code-index.py"

# ============================================================
# UTILITIES
# ============================================================

ts() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }

log_error() {
  local component="$1"
  local message="$2"
  echo "[$(ts)] [$component] ERROR: $message" >> "$ERROR_LOG"
}

log_info() {
  local component="$1"
  local message="$2"
  echo "[$(ts)] [$component] INFO: $message" >> "$ERROR_LOG"
}

# ============================================================
# SETUP
# ============================================================

# Create directories (fail silently)
mkdir -p "$ORCH_DIR" "$TEMP_DIR" "$WORKSHOP_DIR" 2>/dev/null || true

# Clear previous error log
> "$ERROR_LOG" 2>/dev/null || true

# ============================================================
# ACTIVE TASK CONTEXT INJECTION (Session Persistence)
# ============================================================
# Outputs saved task context to STDOUT so Claude sees it immediately.
# This runs BEFORE Workshop loading to front-load the most relevant context.
#
# Safeguards:
#   1. 48h freshness - skip if file older than 48 hours
#   2. 2000 char limit - truncate with indicator if exceeded
#   3. Graceful missing file - silent continue if not found
#   4. Absolute paths - uses $ORCH_DIR prefix
#   5. Resume mode awareness - documented that --continue provides full transcript

ACTIVE_TASK="$ORCH_DIR/active-task.md"
MAX_AGE=172800  # 48 hours in seconds
MAX_CHARS=2000

if [ -f "$ACTIVE_TASK" ]; then
  file_age=$(( $(date +%s) - $(stat -f %m "$ACTIVE_TASK" 2>/dev/null || echo 0) ))

  if [ "$file_age" -lt "$MAX_AGE" ]; then
    content=$(cat "$ACTIVE_TASK" 2>/dev/null || echo "")

    if [ -n "$content" ]; then
      echo ""
      echo "==============================================================="
      echo "PREVIOUS SESSION CONTEXT"
      echo "==============================================================="
      echo ""

      # Truncate if too long
      if [ ${#content} -gt $MAX_CHARS ]; then
        echo "${content:0:$MAX_CHARS}"
        echo ""
        echo "[... truncated, $(( ${#content} - $MAX_CHARS )) chars omitted ...]"
      else
        echo "$content"
      fi

      echo ""
      echo "==============================================================="
      echo ""
    fi
  else
    # File is stale (>48h), log but don't output
    log_info "active-task" "Skipping stale context ($(( file_age / 3600 ))h old)"
  fi
fi

# ============================================================
# PREVIOUS SESSION SUMMARY LOADING (FR-2.3)
# ============================================================
# Loads structured session summary from previous session if recent (<24h).
# Previous session summary. Truncated to 1000 chars max.
# LOCAL ONLY - no API calls, no network requests.

SESSION_SUMMARY="$TEMP_DIR/session-summary.md"
MAX_SUMMARY_AGE=86400  # 24 hours in seconds

if [ -f "$SESSION_SUMMARY" ]; then
  summary_age=$(( $(date +%s) - $(stat -f %m "$SESSION_SUMMARY" 2>/dev/null || echo 0) ))
  if [ "$summary_age" -lt "$MAX_SUMMARY_AGE" ]; then
    echo ""
    echo "==============================================================="
    echo "PREVIOUS SESSION SUMMARY"
    echo "==============================================================="
    # Truncate to 1000 chars max
    head -c 1000 "$SESSION_SUMMARY" 2>/dev/null || true
    echo ""
    echo "==============================================================="
    echo ""
  else
    log_info "session-summary" "Skipping stale session summary ($(( summary_age / 3600 ))h old)"
  fi
fi

# ============================================================
# NATIVE MEMORY (CLAUDE.md)
# ============================================================

NATIVE_PATH=""
NATIVE_NOTE="missing"

if [ -f "CLAUDE.md" ]; then
  NATIVE_PATH="CLAUDE.md"
elif [ -f ".claude/CLAUDE.md" ]; then
  NATIVE_PATH=".claude/CLAUDE.md"
fi

if [ -n "$NATIVE_PATH" ]; then
  NATIVE_NOTE="$(wc -l < "$NATIVE_PATH" 2>/dev/null | tr -d ' ') lines" || NATIVE_NOTE="exists"
fi

# ============================================================
# WORKSHOP CONTEXT (Primary memory store)
# ============================================================

WORKSHOP_CONTEXT=""
WORKSHOP_STATUS="unknown"

if [ -f "$DB_PATH" ]; then
  if command -v workshop >/dev/null 2>&1; then
    # Filter out fileStructure blocks that can bloat context (251KB+ of recursive file tree)
    WORKSHOP_CONTEXT=$(workshop --workspace "$WORKSHOP_DIR" context 2>&1 | grep -v '"fileStructure"' | head -c 4096) && WORKSHOP_STATUS="loaded" || {
      log_error "workshop" "Failed to load context: $WORKSHOP_CONTEXT"
      WORKSHOP_CONTEXT="Workshop context load failed - check $ERROR_LOG"
      WORKSHOP_STATUS="error"
    }
  else
    WORKSHOP_CONTEXT="Workshop CLI not found - install: pip install claude-workshop"
    WORKSHOP_STATUS="cli-missing"
    log_error "workshop" "CLI not in PATH"
  fi
else
  WORKSHOP_CONTEXT="Workshop not initialized - run: workshop --workspace .claude/memory init"
  WORKSHOP_STATUS="not-initialized"
  log_info "workshop" "Database not found at $DB_PATH"
fi

# ============================================================
# CODE-INDEX.DB (Local code/doc context with embeddings)
# ============================================================

CODE_INDEX_STATUS="not initialized"

if [ -f "$CODE_INDEX_DB" ]; then
  CODE_INDEX_SIZE=$(du -h "$CODE_INDEX_DB" 2>/dev/null | cut -f1) || CODE_INDEX_SIZE="?"
  CODE_INDEX_STATUS="ready ($CODE_INDEX_SIZE)"

  # Optionally sync on session start (if code-index.py exists)
  if [ -f "$CODE_INDEX_SCRIPT" ] && command -v python3 >/dev/null 2>&1; then
    # Run sync in background to not block startup
    (python3 "$CODE_INDEX_SCRIPT" sync >/dev/null 2>&1 &) || {
      log_error "code-index" "Background sync failed"
    }
  fi
else
  # Try to initialize code-index.db
  if [ -f "$CODE_INDEX_SCRIPT" ] && command -v python3 >/dev/null 2>&1; then
    if python3 "$CODE_INDEX_SCRIPT" init >/dev/null 2>&1; then
      CODE_INDEX_STATUS="initialized"
      log_info "code-index" "Database initialized"
    else
      CODE_INDEX_STATUS="init-failed"
      log_error "code-index" "Failed to initialize database"
    fi
  else
    CODE_INDEX_STATUS="script-missing"
    log_info "code-index" "code-index.py not found at $CODE_INDEX_SCRIPT"
  fi
fi

# ============================================================
# RECENT WORKSHOP ENTRIES (for session-context.md only)
# ============================================================
# Capture recent entries for the file but NOT stdout.
# Cap at 2000 chars to prevent file-list bloat.
# Note: capture full output first, then truncate in bash to avoid
# SIGPIPE from head under pipefail.

RECENT_ENTRIES=""
if [ "$WORKSHOP_STATUS" = "loaded" ] && command -v workshop >/dev/null 2>&1; then
  _raw_entries=$(workshop --workspace "$WORKSHOP_DIR" recent --limit 5 2>/dev/null) || _raw_entries=""
  if [ -n "$_raw_entries" ]; then
    RECENT_ENTRIES="${_raw_entries:0:2000}"
  fi
  unset _raw_entries
fi

# ============================================================
# GENERATE SESSION CONTEXT FILE
# ============================================================
# This file gets all the detailed data. Agents can read it when needed.
# Stdout only gets a compact summary.

# Count errors if any
ERROR_COUNT=0
if [ -f "$ERROR_LOG" ]; then
  ERROR_COUNT=$(grep -c "ERROR:" "$ERROR_LOG" 2>/dev/null | tr -d '[:space:]') || ERROR_COUNT=0
  # Ensure ERROR_COUNT is a valid integer
  [[ "$ERROR_COUNT" =~ ^[0-9]+$ ]] || ERROR_COUNT=0
fi

{
  echo "# Session Context"
  echo
  echo "- Timestamp: $(ts)"
  echo "- Native Memory: ${NATIVE_PATH:-none} (${NATIVE_NOTE})"
  echo "- Workshop: $WORKSHOP_STATUS"
  echo "- Code Index: $CODE_INDEX_STATUS"
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "- Errors: $ERROR_COUNT (see $ERROR_LOG)"
  fi
  echo
  echo "## Workshop Context (Source of Truth)"
  echo
  echo "$WORKSHOP_CONTEXT"
  echo
  if [ -n "$RECENT_ENTRIES" ]; then
    echo "## Recent Workshop Entries"
    echo
    echo "$RECENT_ENTRIES"
    echo
  fi
} > "$OUT_MD" 2>/dev/null || {
  # If we can't write the file, just continue
  log_error "output" "Could not write to $OUT_MD"
}

# ============================================================
# STDOUT OUTPUT (compact summary only, ~2-5KB max)
# ============================================================
# Claude Code injects stdout into system-reminder TWICE.
# Every byte here costs double. Keep it minimal.

# Success message
if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "SessionStart: success (with $ERROR_COUNT warnings). Context: $OUT_MD"
else
  echo "SessionStart: success. Context: $OUT_MD"
fi

# Recording layer status (small, actionable)
if [ -f ".orca/recording.db" ]; then
  RECORDING_SESSIONS=$(sqlite3 ".orca/recording.db" "SELECT COUNT(*) FROM sessions;" 2>/dev/null || echo "0")

  if [ "$RECORDING_SESSIONS" != "0" ]; then
    echo "Recording: $RECORDING_SESSIONS session(s) tracked. Use /continue to resume, /orca-status for details."
  fi
fi

# Recent session episodes (ORCA-Mem) - compact one-liners, limit 3
if [ -f "$DB_PATH" ]; then
  RECENT_EPISODES=$(sqlite3 -separator '|' "$DB_PATH" "
    SELECT
      substr(e.content, 1, 80) as title,
      CASE
        WHEN e.content LIKE '%architecture%' THEN 'architecture'
        WHEN e.content LIKE '%debug%' OR e.content LIKE '%fix%' THEN 'debugging'
        WHEN e.content LIKE '%explore%' OR e.content LIKE '%research%' THEN 'exploration'
        ELSE 'implementation'
      END as category
    FROM entries e
    JOIN tags t ON e.id = t.entry_id
    WHERE e.type = 'note'
      AND t.tag IN ('session', 'auto', 'cognition', 'architecture', 'deepthink', 'problem-solve')
    ORDER BY e.timestamp DESC
    LIMIT 3
  " 2>/dev/null || echo "")

  if [ -n "$RECENT_EPISODES" ]; then
    echo ""
    echo "Recent episodes:"
    echo "$RECENT_EPISODES" | while IFS='|' read -r title category; do
      if [ -n "$title" ]; then
        echo "  [$category] $title"
      fi
    done
  fi
fi

# NOTE: CLAUDE.md is NOT output here - Claude Code loads it natively
# NOTE: Workshop context is in session-context.md, not stdout
# NOTE: Architecture reminders are in CLAUDE.md, not duplicated here

# Always exit successfully to not block Claude Code startup
exit 0
