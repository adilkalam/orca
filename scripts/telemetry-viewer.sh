#!/usr/bin/env bash
# telemetry-viewer.sh - Human-readable trace viewer
# Usage: telemetry-viewer.sh [trace-id]
#        telemetry-viewer.sh --recent

set -euo pipefail

TELEMETRY_DIR=".claude/telemetry/sessions"

show_usage() {
    echo "Usage: telemetry-viewer.sh [trace-id | --recent | --list]"
    echo ""
    echo "Options:"
    echo "  trace-id    View specific trace by ID"
    echo "  --recent    View most recent trace"
    echo "  --list      List all available traces"
    echo ""
    echo "Examples:"
    echo "  telemetry-viewer.sh nextjs-20260124T120000-a1b2"
    echo "  telemetry-viewer.sh --recent"
}

list_traces() {
    echo "Available traces:"
    echo ""
    ls -1t "$TELEMETRY_DIR"/trace-*.jsonl 2>/dev/null | head -20 | while read -r f; do
        trace_id=$(basename "$f" .jsonl | sed 's/^trace-//')
        # Extract status from pipeline_end if present
        status=$(jq -r 'select(.type=="pipeline_end") | .data.status // "in-progress"' "$f" 2>/dev/null | tail -1)
        task=$(jq -r 'select(.type=="pipeline_start") | .data.task // "unknown"' "$f" 2>/dev/null | head -1 | cut -c1-50)
        echo "  $trace_id  [$status]  $task"
    done
}

view_trace() {
    local trace_id="$1"
    local trace_file="$TELEMETRY_DIR/trace-$trace_id.jsonl"

    if [[ ! -f "$trace_file" ]]; then
        echo "Error: Trace not found: $trace_id"
        echo "Use --list to see available traces"
        exit 1
    fi

    echo "=== Trace: $trace_id ==="
    echo ""

    # Pipeline start
    jq -r 'select(.type=="pipeline_start") | "PIPELINE START: \(.data.domain) | \(.data.mode) | \(.data.task)"' "$trace_file"
    echo ""

    # Gate results
    local gate_count=$(jq -r 'select(.type=="gate_result")' "$trace_file" | wc -l)
    if [[ $gate_count -gt 0 ]]; then
        echo "GATES:"
        jq -r 'select(.type=="gate_result") | "  \(.data.gate): \(.data.score) [\(.data.decision)] (\(.data.issues_count // 0) issues)"' "$trace_file"
        echo ""
    fi

    # Pipeline end
    jq -r 'select(.type=="pipeline_end") | "PIPELINE END: \(.data.status) | \(.data.duration_sec)s | \(.data.files_modified // 0) files"' "$trace_file"
}

# Main
if [[ $# -eq 0 ]]; then
    show_usage
    exit 0
fi

case "$1" in
    --help|-h)
        show_usage
        ;;
    --list)
        list_traces
        ;;
    --recent)
        recent=$(ls -1t "$TELEMETRY_DIR"/trace-*.jsonl 2>/dev/null | head -1)
        if [[ -z "$recent" ]]; then
            echo "No traces found in $TELEMETRY_DIR"
            exit 1
        fi
        trace_id=$(basename "$recent" .jsonl | sed 's/^trace-//')
        view_trace "$trace_id"
        ;;
    *)
        view_trace "$1"
        ;;
esac
