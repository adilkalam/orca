#!/usr/bin/env bash
set -euo pipefail

# Lightweight perf logger
# Writes JSONL to .claude/orchestration/logs/perf.jsonl

PERF_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
PERF_LOG_DIR="$PERF_ROOT/.claude/orchestration/logs"
PERF_LOG_FILE="$PERF_LOG_DIR/perf.jsonl"
mkdir -p "$PERF_LOG_DIR"

now_ms() {
  if command -v python3 >/dev/null 2>&1; then
    python3 - << 'PY'
import time, sys
print(int(time.time()*1000))
PY
  else
    # Fallback: seconds → ms
    echo "$(( $(date +%s) * 1000 ))"
  fi
}

# Usage: perf_log EVENT key=value ...
perf_log() {
  local event="$1"; shift || true
  local ts
  ts="$(now_ms)"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$PERF_LOG_FILE" "$ts" "$event" "$@" << 'PY'
import json, sys
out = sys.argv[1]
ts = int(sys.argv[2])
event = sys.argv[3]
pairs = sys.argv[4:]
obj = {"ts_ms": ts, "event": event}
for kv in pairs:
    if "=" not in kv:
        continue
    k, v = kv.split("=", 1)
    try:
        obj[k] = int(v)
    except ValueError:
        obj[k] = v
with open(out, "a", encoding="utf-8") as f:
    f.write(json.dumps(obj, ensure_ascii=False) + "\n")
PY
  else
    # Fallback: write minimal line
    echo "{\"ts_ms\":$ts,\"event\":\"$event\"}" >> "$PERF_LOG_FILE"
  fi
}
