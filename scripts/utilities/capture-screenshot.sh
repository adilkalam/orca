#!/usr/bin/env bash
set -euo pipefail

# Capture a browser screenshot via MCP (request) and record evidence metadata.
# If --wait-for is provided, poll until the screenshot file exists or timeout.
#
# Usage:
#   bash scripts/capture-screenshot.sh <url> [--out <path.png>] [--selector <css>]
#       [--device <name>] [--full-page true|false] [--wait-for <seconds>] [--label <text>]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SCRIPT_DIR/evidence-utils.sh"

if [ ${#@} -lt 1 ]; then
  echo "Usage: $0 <url> [--out path.png] [--selector css] [--device name] [--full-page true|false] [--wait-for seconds] [--label text]" >&2
  exit 2
fi

URL="$1"; shift || true
OUT=""; SELECTOR=""; DEVICE=""; FULL_PAGE=""; WAIT_SECS=0; LABEL=""

while [ $# -gt 0 ]; do
  case "$1" in
    --out) OUT="$2"; shift 2;;
    --selector) SELECTOR="$2"; shift 2;;
    --device) DEVICE="$2"; shift 2;;
    --full-page) FULL_PAGE="$2"; shift 2;;
    --wait-for) WAIT_SECS="$2"; shift 2;;
    --label) LABEL="$2"; shift 2;;
    *) echo "Unknown option: $1" >&2; exit 2;;
  esac
done

ensure_evidence_dirs

ts="$(timestamp)"
if [ -z "$OUT" ]; then
  OUT=".claude/orchestration/evidence/screenshots/snap-$ts.png"
else
  case "$OUT" in
    .claude/orchestration/evidence/*) ;; # ok
    *) OUT=".claude/orchestration/evidence/screenshots/$(basename "$OUT")" ;;
  esac
fi

# Write MCP request file for a screenshot capture agent to fulfill
REQ=".claude/orchestration/evidence/requests/${ts}-screenshot.json"

# Build payload using python for robust JSON encoding
URL_ENV="$URL" OUT_ENV="$OUT" SELECTOR_ENV="$SELECTOR" DEVICE_ENV="$DEVICE" FULL_ENV="$FULL_PAGE" LABEL_ENV="$LABEL" \
python3 - "$REQ" <<'PY'
import os, sys, json, time
req_path = sys.argv[1]
payload = {
  "type": "screenshot",
  "url": os.environ.get("URL_ENV", ""),
  "output": os.environ.get("OUT_ENV", ""),
  "selector": os.environ.get("SELECTOR_ENV") or None,
  "device": os.environ.get("DEVICE_ENV") or None,
  "fullPage": (os.environ.get("FULL_ENV") or "").lower() in ("1","true","yes"),
  "label": os.environ.get("LABEL_ENV") or None,
  "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
  "cwd": os.getcwd(),
}
with open(req_path, 'w', encoding='utf-8') as f:
  json.dump(payload, f)
PY

# Record claimed screenshot path for Zero-Tag gate
append_impl_log "#SCREENSHOT_CLAIMED: $OUT"

echo "Requested screenshot: $URL" >&2
echo "Output (expected): $OUT" >&2
echo "Request written: $REQ" >&2

if [ "$WAIT_SECS" -gt 0 ]; then
  echo "Waiting up to ${WAIT_SECS}s for MCP to save $OUT ..." >&2
  end=$(( $(date +%s) + WAIT_SECS ))
  while [ $(date +%s) -lt $end ]; do
    if [ -f "$OUT" ]; then
      echo "Screenshot captured: $OUT" >&2
      exit 0
    fi
    sleep 1
  done
  echo "Timeout waiting for screenshot. File not found: $OUT" >&2
  exit 1
fi

exit 0

