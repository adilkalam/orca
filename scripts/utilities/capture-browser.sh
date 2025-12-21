#!/usr/bin/env bash
set -euo pipefail

# Simple macOS screen capture to a file. Optionally waits N seconds.
# Usage: scripts/capture-browser.sh <output_path.png> [delay_seconds]

OUT="${1:-}"
DELAY="${2:-0}"

if [ -z "$OUT" ]; then
  echo "Usage: $0 <output_path.png> [delay_seconds]" >&2
  exit 2
fi

mkdir -p "$(dirname "$OUT")"

if [ "$DELAY" -gt 0 ] 2>/dev/null; then
  echo "Capturing in $DELAY seconds..."
  sleep "$DELAY"
fi

# Full screen capture (macOS)
if command -v screencapture >/dev/null 2>&1; then
  screencapture -x "$OUT"
  echo "Saved screenshot to $OUT"
else
  echo "screencapture not found (macOS)." >&2
  exit 1
fi

