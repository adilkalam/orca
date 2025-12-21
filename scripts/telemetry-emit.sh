#!/bin/bash
# ORCA OS Telemetry Emit Script
# Handles trace creation with proper index.json updates
#
# Usage:
#   telemetry-emit.sh start <domain> <task> <mode>
#   telemetry-emit.sh end <trace_id> <status> <duration> <delegations> <gates> <files>
#
# Examples:
#   TRACE_ID=$(telemetry-emit.sh start os-dev "fix bug" default)
#   telemetry-emit.sh end "$TRACE_ID" success 120 3 1 5

set -uo pipefail

TELEMETRY_DIR="${TELEMETRY_DIR:-.claude/telemetry}"
ACTION="${1:-}"

ts() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }

gen_id() {
    local domain="$1"
    echo "${domain}-$(date +%Y%m%dT%H%M%S)-$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)"
}

update_index() {
    local trace_id="$1"
    local domain="$2"
    local task="$3"
    local status="${4:-started}"
    local index_file="$TELEMETRY_DIR/index.json"

    if [[ ! -f "$index_file" ]]; then
        echo '{"version":"2.5.0","created_at":"'"$(ts)"'","last_cleanup":null,"sessions":[]}' > "$index_file"
    fi

    if command -v jq &> /dev/null; then
        local tmp=$(mktemp)
        local session_entry="{\"trace_id\":\"$trace_id\",\"domain\":\"$domain\",\"task\":\"$task\",\"status\":\"$status\",\"started_at\":\"$(ts)\"}"

        if [[ "$status" == "started" ]]; then
            # Add new session
            jq --argjson entry "$session_entry" '.sessions = [$entry] + .sessions' "$index_file" > "$tmp" && mv "$tmp" "$index_file"
        else
            # Update existing session status
            jq --arg id "$trace_id" --arg status "$status" --arg ended "$(ts)" \
                '(.sessions[] | select(.trace_id == $id)) |= . + {status: $status, ended_at: $ended}' \
                "$index_file" > "$tmp" && mv "$tmp" "$index_file"
        fi
    fi
}

emit_start() {
    local domain="$1"
    local task="$2"
    local mode="${3:-default}"

    mkdir -p "$TELEMETRY_DIR/sessions" "$TELEMETRY_DIR/metrics"

    local trace_id=$(gen_id "$domain")
    local trace_file="$TELEMETRY_DIR/sessions/trace-$trace_id.jsonl"

    # Emit pipeline_start event
    echo "{\"type\":\"pipeline_start\",\"trace_id\":\"$trace_id\",\"ts\":\"$(ts)\",\"data\":{\"domain\":\"$domain\",\"task\":\"$task\",\"mode\":\"$mode\"}}" >> "$trace_file"

    # Update index.json
    update_index "$trace_id" "$domain" "$task" "started"

    # Return trace_id
    echo "$trace_id"
}

emit_end() {
    local trace_id="$1"
    local status="$2"
    local duration="${3:-0}"
    local delegations="${4:-0}"
    local gates="${5:-0}"
    local files="${6:-0}"

    local trace_file="$TELEMETRY_DIR/sessions/trace-$trace_id.jsonl"

    if [[ ! -f "$trace_file" ]]; then
        echo "Error: Trace file not found: $trace_file" >&2
        return 1
    fi

    # Emit pipeline_end event
    echo "{\"type\":\"pipeline_end\",\"trace_id\":\"$trace_id\",\"ts\":\"$(ts)\",\"data\":{\"status\":\"$status\",\"duration_sec\":$duration,\"total_delegations\":$delegations,\"gates_run\":$gates,\"files_modified\":$files}}" >> "$trace_file"

    # Update index.json with final status
    local domain=$(echo "$trace_id" | cut -d- -f1)
    update_index "$trace_id" "$domain" "" "$status"

    echo "Trace $trace_id completed with status: $status"
}

# Main dispatch
case "$ACTION" in
    start)
        if [[ $# -lt 3 ]]; then
            echo "Usage: $0 start <domain> <task> [mode]" >&2
            exit 1
        fi
        emit_start "$2" "$3" "${4:-default}"
        ;;
    end)
        if [[ $# -lt 3 ]]; then
            echo "Usage: $0 end <trace_id> <status> [duration] [delegations] [gates] [files]" >&2
            exit 1
        fi
        emit_end "$2" "$3" "${4:-0}" "${5:-0}" "${6:-0}" "${7:-0}"
        ;;
    *)
        echo "Usage: $0 {start|end} ..." >&2
        echo "  start <domain> <task> [mode]" >&2
        echo "  end <trace_id> <status> [duration] [delegations] [gates] [files]" >&2
        exit 1
        ;;
esac
