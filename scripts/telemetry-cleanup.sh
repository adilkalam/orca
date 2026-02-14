#!/bin/bash
# DEPRECATED: This telemetry system is superseded by orca-record (recording layer).
# Recording data is managed in .orca/recording.db per project.
# This script remains functional for cleaning up legacy telemetry data.
#
# ORCA OS Telemetry Cleanup Script
# Enforces retention policy: sessions=7 days, metrics=30 days
#
# Usage: ./scripts/telemetry-cleanup.sh [--dry-run]
#
# Run manually or add to cron:
#   0 3 * * * /path/to/scripts/telemetry-cleanup.sh

set -euo pipefail

TELEMETRY_DIR="${TELEMETRY_DIR:-.claude/telemetry}"
SESSION_RETENTION_DAYS=7
METRICS_RETENTION_DAYS=30
DRY_RUN=false

# Parse arguments
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "[DRY RUN] No files will be deleted"
fi

# Check if telemetry directory exists
if [[ ! -d "$TELEMETRY_DIR" ]]; then
    echo "Telemetry directory not found: $TELEMETRY_DIR"
    exit 0
fi

echo "ORCA Telemetry Cleanup"
echo "======================"
echo "Directory: $TELEMETRY_DIR"
echo "Session retention: $SESSION_RETENTION_DAYS days"
echo "Metrics retention: $METRICS_RETENTION_DAYS days"
echo ""

# Count before cleanup
sessions_before=$(find "$TELEMETRY_DIR/sessions" -name "trace-*.jsonl" 2>/dev/null | wc -l | tr -d ' ')
metrics_before=$(find "$TELEMETRY_DIR/metrics" -name "*.jsonl" 2>/dev/null | wc -l | tr -d ' ')

echo "Before cleanup:"
echo "  Sessions: $sessions_before trace files"
echo "  Metrics: $metrics_before metric files"
echo ""

# Clean up old session files (7 days)
echo "Cleaning sessions older than $SESSION_RETENTION_DAYS days..."
old_sessions=$(find "$TELEMETRY_DIR/sessions" -name "trace-*.jsonl" -mtime +$SESSION_RETENTION_DAYS 2>/dev/null || true)

if [[ -n "$old_sessions" ]]; then
    echo "$old_sessions" | while read -r file; do
        if [[ -n "$file" ]]; then
            if [[ "$DRY_RUN" == true ]]; then
                echo "  [would delete] $file"
            else
                rm -f "$file"
                echo "  [deleted] $file"
            fi
        fi
    done
else
    echo "  No old sessions to clean"
fi

# Clean up old metrics files (30 days)
echo ""
echo "Cleaning metrics older than $METRICS_RETENTION_DAYS days..."
old_metrics=$(find "$TELEMETRY_DIR/metrics" -name "*.jsonl" -mtime +$METRICS_RETENTION_DAYS 2>/dev/null || true)

if [[ -n "$old_metrics" ]]; then
    echo "$old_metrics" | while read -r file; do
        if [[ -n "$file" ]]; then
            if [[ "$DRY_RUN" == true ]]; then
                echo "  [would delete] $file"
            else
                rm -f "$file"
                echo "  [deleted] $file"
            fi
        fi
    done
else
    echo "  No old metrics to clean"
fi

# Update index.json with cleanup timestamp
if [[ "$DRY_RUN" == false ]] && [[ -f "$TELEMETRY_DIR/index.json" ]]; then
    # Update last_cleanup timestamp using simple sed (portable)
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    if command -v jq &> /dev/null; then
        # If jq is available, use it for proper JSON manipulation
        tmp=$(mktemp)
        jq --arg ts "$timestamp" '.last_cleanup = $ts' "$TELEMETRY_DIR/index.json" > "$tmp" && mv "$tmp" "$TELEMETRY_DIR/index.json"
    else
        # Fallback: simple sed replacement
        sed -i.bak "s/\"last_cleanup\": null/\"last_cleanup\": \"$timestamp\"/" "$TELEMETRY_DIR/index.json" 2>/dev/null || true
        sed -i.bak "s/\"last_cleanup\": \"[^\"]*\"/\"last_cleanup\": \"$timestamp\"/" "$TELEMETRY_DIR/index.json" 2>/dev/null || true
        rm -f "$TELEMETRY_DIR/index.json.bak" 2>/dev/null || true
    fi
fi

# Count after cleanup
sessions_after=$(find "$TELEMETRY_DIR/sessions" -name "trace-*.jsonl" 2>/dev/null | wc -l | tr -d ' ')
metrics_after=$(find "$TELEMETRY_DIR/metrics" -name "*.jsonl" 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "After cleanup:"
echo "  Sessions: $sessions_after trace files"
echo "  Metrics: $metrics_after metric files"
echo ""

sessions_cleaned=$((sessions_before - sessions_after))
metrics_cleaned=$((metrics_before - metrics_after))

if [[ "$DRY_RUN" == true ]]; then
    echo "Dry run complete. Run without --dry-run to delete files."
else
    echo "Cleanup complete: $sessions_cleaned sessions, $metrics_cleaned metrics removed"
fi
