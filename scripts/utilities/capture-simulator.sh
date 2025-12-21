#!/usr/bin/env bash
set -euo pipefail

# Capture screenshot from the currently booted iOS simulator
# Usage: scripts/capture-simulator.sh .claude/orchestration/evidence/<task>/after.png

OUT="${1:-}"
if [ -z "$OUT" ]; then
  echo "Usage: $0 <output_path.png>" >&2
  exit 2
fi

mkdir -p "$(dirname "$OUT")"

DEVICE_ID=$(xcrun simctl list devices | awk '/Booted/{print $NF}' | tr -d '()' | head -1)
if [ -z "$DEVICE_ID" ]; then
  echo "No booted simulator found. Launch Simulator and try again." >&2
  exit 1
fi

xcrun simctl io "$DEVICE_ID" screenshot "$OUT"
echo "Saved simulator screenshot to $OUT"

