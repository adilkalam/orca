#!/usr/bin/env bash
# SessionEnd Hook v2 - Extract actual session content
# - Runs workshop import to extract decisions/gotchas from JSONL transcripts
# - Falls back to git status note if import fails
# - Cleans up temp files
#
# This hook captures REAL session content, not just git status

set -uo pipefail  # Don't use -e, handle errors explicitly

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR" || exit 0

# ============================================================
# PROJECT WHITELIST - Only run for critical projects
# Add your project paths here
# ============================================================
CRITICAL_PROJECTS=(
  "$HOME/ORCA-OS"
  # Add your other projects here, e.g.:
  # "$HOME/my-project"
)

is_critical_project() {
  local normalized_root
  normalized_root=$(cd "$ROOT_DIR" 2>/dev/null && pwd -P)
  for project in "${CRITICAL_PROJECTS[@]}"; do
    local normalized_project
    normalized_project=$(cd "$project" 2>/dev/null && pwd -P 2>/dev/null) || continue
    if [[ "$normalized_root" == "$normalized_project" ]]; then
      return 0
    fi
  done
  return 1
}

# Skip non-critical projects silently
if ! is_critical_project; then
  exit 0
fi

# All paths under .claude/
CLAUDE_DIR=".claude"
MEMORY_DIR="$CLAUDE_DIR/memory"
TEMP_DIR="$CLAUDE_DIR/orchestration/temp"
WORKSHOP_DB="$MEMORY_DIR/workshop.db"
ERROR_LOG="$TEMP_DIR/session-end-errors.log"

# Ensure directories exist
mkdir -p "$TEMP_DIR" 2>/dev/null || true

# Clear previous error log
> "$ERROR_LOG" 2>/dev/null || true

log_error() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] ERROR: $1" >> "$ERROR_LOG"
}

log_info() {
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] INFO: $1" >> "$ERROR_LOG"
}

# Check if Workshop is available
if ! command -v workshop >/dev/null 2>&1; then
  echo "Workshop not installed - session not captured"
  echo "Install: pip install claude-workshop"
  exit 0
fi

# Check if Workshop is initialized
if [ ! -f "$WORKSHOP_DB" ]; then
  echo "Workshop not initialized in .claude/memory/"
  echo "Run: workshop --workspace .claude/memory init"
  exit 0
fi

# ============================================================
# PRIMARY: Import from JSONL transcripts
# ============================================================

IMPORT_SUCCESS=false
IMPORT_COUNT=0
LLM_USED=false
LLM_SOURCE=""

# Check for local LLM availability
# Priority: Ollama (already running for vibe.db) > LM Studio > Heuristic
OLLAMA_ENDPOINT="http://localhost:11434/v1"
LMSTUDIO_ENDPOINT="http://localhost:1234/v1"

# Check Ollama first (already running for vibe.db embeddings)
# Needs a chat model like mistral, llama3, etc (not just nomic-embed-text)
OLLAMA_AVAILABLE=false
if curl -s --connect-timeout 1 http://localhost:11434/v1/models 2>/dev/null | grep -q '"id"'; then
  # Check if there's a chat model (not just embedding model)
  if curl -s http://localhost:11434/api/tags 2>/dev/null | grep -qE '"name":"(mistral|llama|qwen|phi|gemma)'; then
    OLLAMA_AVAILABLE=true
  fi
fi

# Check LM Studio as fallback
LMSTUDIO_AVAILABLE=false
if curl -s --connect-timeout 1 http://localhost:1234/v1/models >/dev/null 2>&1; then
  LMSTUDIO_AVAILABLE=true
fi

# Run workshop import to extract actual session content
# QUALITY: LLM extraction produces much better results than heuristics
if [ "$OLLAMA_AVAILABLE" = true ]; then
  log_info "Ollama detected with chat model - using for quality extraction"
  if workshop --workspace "$MEMORY_DIR" import --execute --llm-local --llm-endpoint "$OLLAMA_ENDPOINT" 2>"$ERROR_LOG"; then
    IMPORT_SUCCESS=true
    LLM_USED=true
    LLM_SOURCE="Ollama"
    log_info "Ollama import completed successfully"
  else
    log_error "Ollama import failed, trying LM Studio"
  fi
fi

# Try LM Studio if Ollama failed or unavailable
if [ "$IMPORT_SUCCESS" = false ] && [ "$LMSTUDIO_AVAILABLE" = true ]; then
  log_info "LM Studio detected - using for quality extraction"
  if workshop --workspace "$MEMORY_DIR" import --execute --llm-local 2>"$ERROR_LOG"; then
    IMPORT_SUCCESS=true
    LLM_USED=true
    LLM_SOURCE="LM Studio"
    log_info "LM Studio import completed successfully"
  else
    log_error "LM Studio import failed, falling back to heuristic"
  fi
fi

# Heuristic fallback
if [ "$IMPORT_SUCCESS" = false ]; then
  log_info "No local LLM available - using heuristic import (lower quality)"
  log_info "For better quality: ollama pull mistral"
  if workshop --workspace "$MEMORY_DIR" import --execute 2>"$ERROR_LOG"; then
    IMPORT_SUCCESS=true
    log_info "Heuristic import completed successfully"
  else
    log_error "Workshop import failed - see error log"
  fi
fi

# ============================================================
# FALLBACK: Record git status note if import didn't capture anything
# ============================================================

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-git")
CHANGED_FILES=$(git status --short 2>/dev/null | wc -l | tr -d ' ')

# Check for recent commits (last 2 hours)
RECENT_COMMIT=""
if git log -1 --since="2 hours ago" --oneline 2>/dev/null | grep -q .; then
  RECENT_COMMIT=$(git log -1 --oneline 2>/dev/null)
fi

# Only add a git status note if we have meaningful changes
if [ "$CHANGED_FILES" -gt 0 ] || [ -n "$RECENT_COMMIT" ]; then
  SESSION_SUMMARY="Session on branch: $BRANCH"
  if [ "$CHANGED_FILES" -gt 0 ]; then
    SESSION_SUMMARY="$SESSION_SUMMARY | $CHANGED_FILES file(s) changed"
  fi
  if [ -n "$RECENT_COMMIT" ]; then
    SESSION_SUMMARY="$SESSION_SUMMARY | Commit: $RECENT_COMMIT"
  fi

  workshop --workspace "$MEMORY_DIR" note "$SESSION_SUMMARY" \
    --tags "session" "auto-captured" 2>/dev/null || true
fi

# ============================================================
# CLEANUP: Remove old temp files
# ============================================================

if [ -d "$TEMP_DIR" ]; then
  # Remove temp files older than 24 hours
  find "$TEMP_DIR" -type f -mtime +1 -delete 2>/dev/null || true
  # Remove empty directories
  find "$TEMP_DIR" -type d -empty -delete 2>/dev/null || true
fi

# Manual pruning: workshop clear "30 days ago" --type note

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo "==============================================================="
echo "SESSION END"
echo "==============================================================="
echo ""
if [ "$IMPORT_SUCCESS" = true ]; then
  if [ "$LLM_USED" = true ]; then
    echo "Workshop import: LLM extraction via $LLM_SOURCE (high quality)"
  else
    echo "Workshop import: heuristic extraction (lower quality)"
    echo "  Tip: ollama pull mistral (for better extraction)"
  fi
else
  echo "Workshop import: skipped (no new content or error)"
fi
echo "Branch: $BRANCH"
if [ "$CHANGED_FILES" -gt 0 ]; then
  echo "Changed files: $CHANGED_FILES"
fi
if [ -n "$RECENT_COMMIT" ]; then
  echo "Recent commit: $RECENT_COMMIT"
fi
echo ""
echo "Review: workshop --workspace .claude/memory recent"
echo "==============================================================="

exit 0
