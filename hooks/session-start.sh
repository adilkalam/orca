#!/usr/bin/env bash
# SessionStart Hook (Hardened v2)
# - Loads session context FROM Workshop (source of truth)
# - Initializes/syncs vibe.db for local context cache
# - Displays CLAUDE.md instructions
# - Output: .claude/orchestration/temp/session-context.md
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
# TELEMETRY INITIALIZATION (OS 3.0)
# ============================================================

TELEMETRY_DIR=".claude/telemetry"
TELEMETRY_SESSIONS="$TELEMETRY_DIR/sessions"
TELEMETRY_METRICS="$TELEMETRY_DIR/metrics"
TELEMETRY_STATUS="not initialized"

# Create telemetry directories (fail silently)
if mkdir -p "$TELEMETRY_SESSIONS" "$TELEMETRY_METRICS" 2>/dev/null; then
  TELEMETRY_STATUS="ready"

  # Initialize index.json if missing
  if [ ! -f "$TELEMETRY_DIR/index.json" ]; then
    CREATED_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    cat > "$TELEMETRY_DIR/index.json" 2>/dev/null << EOF || true
{
  "version": "2.5.0",
  "created_at": "$CREATED_TS",
  "last_cleanup": null,
  "sessions": []
}
EOF
    if [ -f "$TELEMETRY_DIR/index.json" ]; then
      log_info "telemetry" "Initialized telemetry directory"
    else
      log_error "telemetry" "Failed to create index.json"
      TELEMETRY_STATUS="init-partial"
    fi
  fi
else
  log_error "telemetry" "Failed to create telemetry directories"
  TELEMETRY_STATUS="init-failed"
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
    WORKSHOP_CONTEXT=$(workshop --workspace "$WORKSHOP_DIR" context 2>&1) && WORKSHOP_STATUS="loaded" || {
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
# GENERATE SESSION CONTEXT
# ============================================================

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
  echo "- Telemetry: $TELEMETRY_STATUS"
  if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "- Errors: $ERROR_COUNT (see $ERROR_LOG)"
  fi
  echo
  echo "## Workshop Context (Source of Truth)"
  echo
  echo "$WORKSHOP_CONTEXT"
  echo
} > "$OUT_MD" 2>/dev/null || {
  # If we can't write the file, just continue
  log_error "output" "Could not write to $OUT_MD"
}

# Report success (even if some components had issues)
if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "SessionStart:startup hook success (with $ERROR_COUNT warnings): SessionStart context written: $OUT_MD"
else
  echo "SessionStart:startup hook success: SessionStart context written: $OUT_MD"
fi

# Project context auto-load instruction
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "PROJECT CONTEXT AUTO-LOAD"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Memory systems available:"
echo "  - Workshop: workshop --workspace .claude/memory <command>"
echo "  - Code Index: python3 ~/.claude/scripts/code-index.py <command>"
echo "  - ProjectContext MCP: mcp__project-context__query_context"
echo ""
echo "Quick commands:"
echo "  workshop --workspace .claude/memory why \"<topic>\"  # Query past decisions"
echo "  workshop --workspace .claude/memory recent         # Recent activity"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Show recent Workshop entries for immediate context
if [ "$WORKSHOP_STATUS" = "loaded" ] && command -v workshop >/dev/null 2>&1; then
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo "RECENT WORKSHOP ENTRIES (last 5)"
  echo "═══════════════════════════════════════════════════════════"
  echo ""
  workshop --workspace "$WORKSHOP_DIR" recent --limit 5 2>/dev/null || echo "(Could not load recent entries)"
  echo ""
fi

# === ORCA-MEM PHASE 4: EPISODE INJECTION ===
# Query recent episodes from workshop.db entries table (notes with #episode tag)
# Inject ~500 tokens of context at session start

if [ -f "$DB_PATH" ]; then
  # Query notes tagged with 'episode' (auto-captured by session-end.sh)
  RECENT_EPISODES=$(sqlite3 -separator '|' "$DB_PATH" "
    SELECT
      substr(content, 1, 80) as title,
      CASE
        WHEN content LIKE '%architecture%' THEN 'architecture'
        WHEN content LIKE '%debug%' OR content LIKE '%fix%' THEN 'debugging'
        WHEN content LIKE '%explore%' OR content LIKE '%research%' THEN 'exploration'
        ELSE 'implementation'
      END as category,
      substr(content, 1, 200) as preview
    FROM entries
    WHERE type = 'note'
      AND entry_metadata LIKE '%episode%'
    ORDER BY timestamp DESC
    LIMIT 5
  " 2>/dev/null || echo "")

  if [ -n "$RECENT_EPISODES" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "RECENT SESSION EPISODES (ORCA-Mem)"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "$RECENT_EPISODES" | while IFS='|' read -r title category preview; do
      if [ -n "$title" ]; then
        echo "- [$category] $title"
      fi
    done
    echo ""
  fi
fi

# Architecture reminder for this repo
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "OS 4.2 ARCHITECTURE - ALWAYS CONSIDER ALL LAYERS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "When modifying orchestration behavior, you MUST update ALL affected layers:"
echo ""
echo "  1. commands/*.md          → Entry points (orca-*, plan, etc.)"
echo "  2. agents/**/*.md         → Implementation (orchestrators, builders, reviewers)"
echo "  3. docs/pipelines/*.md    → Pipeline documentation"
echo "  4. docs/reference/phase-configs/*.yaml → Phase definitions"
echo "  5. docs/concepts/*.md     → Conceptual docs (routing, RA, etc.)"
echo ""
echo "These are NOT independent. A routing change affects ALL layers."
echo "Before finalizing any spec, enumerate EVERY file that needs updating."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# NOTE: CLAUDE.md is NOT output here - Claude Code loads it natively
# Outputting it here would duplicate content and waste ~8KB of context tokens

# Always exit successfully to not block Claude Code startup
exit 0
