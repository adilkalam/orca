#!/usr/bin/env bash
# ORCA-OS Diagnostic Export
# Exports system state for post-mortem investigation
#
# Usage:
#   scripts/diagnostic-export.sh [--verbose]
#
# Output: .orca/orchestration/evidence/diagnostic-YYYY-MM-DD-HHMM/
#   - workshop-recent.json    (last 50 Workshop entries)
#   - recording-sessions.json (all sessions from recording.db)
#   - cognition-files.txt     (list of .orca/cognition/ files)
#   - phase-state.json        (current orchestration state)
#   - mcp-health.json         (health check results for all MCPs)
#   - timeline.md             (human-readable narrative)

set -euo pipefail

VERBOSE="${1:-}"

log() {
    echo "[DIAGNOSTIC] $1"
}

log_verbose() {
    [[ "$VERBOSE" == "--verbose" ]] && echo "  $1"
}

# Detect project root
find_project_root() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -d "$dir/.claude/memory" ]] || [[ -f "$dir/CLAUDE.md" ]]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    echo "$PWD"
}

PROJECT_ROOT=$(find_project_root)
TIMESTAMP=$(date '+%Y-%m-%d-%H%M')
OUTPUT_DIR="$PROJECT_ROOT/.orca/orchestration/evidence/diagnostic-$TIMESTAMP"

log "Starting diagnostic export"
log "Project root: $PROJECT_ROOT"
log "Output directory: $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR"

# 1. Workshop recent entries
log "Exporting Workshop recent entries..."
WORKSHOP_FILE="$OUTPUT_DIR/workshop-recent.json"
if command -v workshop &> /dev/null; then
    # Try to get recent entries as JSON
    if workshop --workspace "$PROJECT_ROOT/.claude/memory" recent --limit 50 --json > "$WORKSHOP_FILE" 2>/dev/null; then
        log_verbose "Workshop export: success"
    elif workshop recent --limit 50 --json > "$WORKSHOP_FILE" 2>/dev/null; then
        log_verbose "Workshop export: success (default workspace)"
    elif workshop --workspace "$PROJECT_ROOT/.claude/memory" recent > "$WORKSHOP_FILE" 2>/dev/null; then
        log_verbose "Workshop export: success (text format)"
    else
        echo '{"error": "Workshop query failed", "available": false}' > "$WORKSHOP_FILE"
        log_verbose "Workshop export: failed"
    fi
else
    echo '{"error": "Workshop CLI not installed", "available": false}' > "$WORKSHOP_FILE"
    log_verbose "Workshop not installed"
fi

# 2. Recording sessions
log "Exporting recording sessions..."
RECORDING_FILE="$OUTPUT_DIR/recording-sessions.json"
RECORDING_DB="$PROJECT_ROOT/.orca/recording.db"
if [[ -f "$RECORDING_DB" ]] && command -v sqlite3 &> /dev/null; then
    # Export sessions table as JSON
    sqlite3 -json "$RECORDING_DB" "SELECT * FROM sessions ORDER BY started_at DESC LIMIT 50;" > "$RECORDING_FILE" 2>/dev/null || \
    echo '{"error": "SQL query failed", "database_exists": true}' > "$RECORDING_FILE"
    log_verbose "Recording export: success"
else
    echo '{"error": "recording.db not found or sqlite3 not available", "database_exists": false}' > "$RECORDING_FILE"
    log_verbose "Recording database not found"
fi

# 3. Cognition files list
log "Listing cognition files..."
COGNITION_FILE="$OUTPUT_DIR/cognition-files.txt"
COGNITION_DIR="$PROJECT_ROOT/.cognition"
if [[ -d "$COGNITION_DIR" ]]; then
    find "$COGNITION_DIR" -name "*.md" -type f -exec ls -la {} \; 2>/dev/null > "$COGNITION_FILE" || \
    echo "No cognition files found" > "$COGNITION_FILE"
    FILE_COUNT=$(wc -l < "$COGNITION_FILE" | tr -d ' ')
    log_verbose "Cognition files: $FILE_COUNT"
else
    echo "Cognition directory does not exist: $COGNITION_DIR" > "$COGNITION_FILE"
    log_verbose "Cognition directory not found"
fi

# 4. Phase state
log "Exporting phase state..."
PHASE_FILE="$OUTPUT_DIR/phase-state.json"
PHASE_STATE="$PROJECT_ROOT/.orca/orchestration/phase_state.json"
if [[ -f "$PHASE_STATE" ]]; then
    cp "$PHASE_STATE" "$PHASE_FILE"
    log_verbose "Phase state: copied"
else
    echo '{"error": "phase_state.json not found", "exists": false}' > "$PHASE_FILE"
    log_verbose "Phase state not found"
fi

# 5. MCP health check
log "Checking MCP health..."
MCP_FILE="$OUTPUT_DIR/mcp-health.json"
{
    echo '{'
    echo '  "timestamp": "'"$(date -u '+%Y-%m-%dT%H:%M:%SZ')"'",'
    echo '  "mcps": {'
    
    # Check each MCP server
    MCP_CHECKS=""
    
    # project-context
    if [[ -f ~/.claude/mcp/project-context-server/dist/index.js ]]; then
        MCP_CHECKS="$MCP_CHECKS\"project-context\": {\"deployed\": true, \"path\": \"~/.claude/mcp/project-context-server/dist/index.js\"},"
    else
        MCP_CHECKS="$MCP_CHECKS\"project-context\": {\"deployed\": false},"
    fi
    
    # cognition-mcp
    if [[ -f ~/.claude/mcp/cognition-mcp/dist/index.js ]]; then
        MCP_CHECKS="$MCP_CHECKS\"cognition-mcp\": {\"deployed\": true, \"path\": \"~/.claude/mcp/cognition-mcp/dist/index.js\"},"
    else
        MCP_CHECKS="$MCP_CHECKS\"cognition-mcp\": {\"deployed\": false},"
    fi
    
    # orca-record binary
    if [[ -f ~/.claude/bin/orca-record ]]; then
        MCP_CHECKS="$MCP_CHECKS\"orca-record\": {\"deployed\": true, \"path\": \"~/.claude/bin/orca-record\"},"
    else
        MCP_CHECKS="$MCP_CHECKS\"orca-record\": {\"deployed\": false},"
    fi
    
    # workshop CLI
    if command -v workshop &> /dev/null; then
        WORKSHOP_PATH=$(which workshop)
        MCP_CHECKS="$MCP_CHECKS\"workshop\": {\"installed\": true, \"path\": \"$WORKSHOP_PATH\"}"
    else
        MCP_CHECKS="$MCP_CHECKS\"workshop\": {\"installed\": false}"
    fi
    
    echo "    $MCP_CHECKS"
    echo '  }'
    echo '}'
} > "$MCP_FILE"
log_verbose "MCP health: complete"

# 6. Human-readable timeline
log "Generating timeline..."
TIMELINE_FILE="$OUTPUT_DIR/timeline.md"
{
    echo "# ORCA-OS Diagnostic Timeline"
    echo ""
    echo "**Generated**: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Project**: $PROJECT_ROOT"
    echo ""
    echo "---"
    echo ""
    
    echo "## System Status"
    echo ""
    
    # Workshop status
    echo "### Workshop (Memory)"
    if [[ -f "$WORKSHOP_FILE" ]] && ! grep -q '"error"' "$WORKSHOP_FILE" 2>/dev/null; then
        echo "- Status: Available"
        if [[ -d "$PROJECT_ROOT/.claude/memory" ]]; then
            echo "- Workspace: $PROJECT_ROOT/.claude/memory"
        fi
    else
        echo "- Status: Not available or not configured"
    fi
    echo ""
    
    # Recording status
    echo "### Recording Layer"
    if [[ -f "$RECORDING_DB" ]]; then
        echo "- Status: Active"
        echo "- Database: $RECORDING_DB"
        if command -v sqlite3 &> /dev/null; then
            SESSION_COUNT=$(sqlite3 "$RECORDING_DB" "SELECT count(*) FROM sessions;" 2>/dev/null || echo "unknown")
            echo "- Sessions recorded: $SESSION_COUNT"
        fi
    else
        echo "- Status: Not initialized"
    fi
    echo ""
    
    # Cognition status
    echo "### Cognition Layer"
    if [[ -d "$COGNITION_DIR" ]]; then
        COGNITION_COUNT=$(find "$COGNITION_DIR" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
        echo "- Status: Active"
        echo "- Checkpoint files: $COGNITION_COUNT"
    else
        echo "- Status: No cognition directory"
    fi
    echo ""
    
    # Phase state
    echo "### Orchestration"
    if [[ -f "$PHASE_STATE" ]]; then
        echo "- Phase state: Present"
        if command -v jq &> /dev/null; then
            CURRENT_PHASE=$(jq -r '.currentPhase // "unknown"' "$PHASE_STATE" 2>/dev/null || echo "unknown")
            echo "- Current phase: $CURRENT_PHASE"
        fi
    else
        echo "- Phase state: Not found"
    fi
    echo ""
    
    echo "---"
    echo ""
    echo "## Files Exported"
    echo ""
    echo "| File | Description |"
    echo "|------|-------------|"
    echo "| workshop-recent.json | Last 50 Workshop entries |"
    echo "| recording-sessions.json | Recording database sessions |"
    echo "| cognition-files.txt | List of cognition checkpoint files |"
    echo "| phase-state.json | Current orchestration state |"
    echo "| mcp-health.json | MCP server deployment status |"
    echo "| timeline.md | This file |"
    echo ""
    echo "---"
    echo ""
    echo "_Export complete. Review files for detailed diagnostics._"
    
} > "$TIMELINE_FILE"

log "Diagnostic export complete"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "Files created:"
ls -la "$OUTPUT_DIR"
