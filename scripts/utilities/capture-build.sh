#!/usr/bin/env bash
set -euo pipefail

# Run a build command and capture logs to evidence + logs.
#
# Usage:
#   bash scripts/capture-build.sh               # auto-detect
#   bash scripts/capture-build.sh -- npm run build   # explicit command after --

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SCRIPT_DIR/evidence-utils.sh"

ensure_evidence_dirs

# Detect default build command unless explicit after --
CMD=( )
if [ "$#" -gt 0 ] && [ "$1" = "--" ]; then
  shift
  if [ "$#" -eq 0 ]; then
    echo "No command provided after --" >&2
    exit 2
  fi
  CMD=( "$@" )
else
  if [ -f package.json ] && grep -q '"build"' package.json; then
    CMD=( npm run build )
  elif [ -f Cargo.toml ] && command -v cargo >/dev/null 2>&1; then
    CMD=( cargo build --release )
  elif [ -f pyproject.toml ] || [ -f setup.py ]; then
    # Python projects often have no build step
    echo "Python project detected: no explicit build step" >&2
    exit 0
  else
    echo "No known build configuration found. Provide command after --" >&2
    exit 2
  fi
fi

ts="$(timestamp)"
EVID=".claude/orchestration/evidence/build/build-${ts}.log"
LOG=".claude/orchestration/logs/build.log"

set -o pipefail
echo "Running: ${CMD[*]}" | tee "$LOG" | tee "$EVID" >/dev/null
"${CMD[@]}" 2>&1 | tee -a "$LOG" | tee -a "$EVID" >/dev/null
rc=$?

append_impl_log "#FILE_CREATED: $EVID"
exit $rc

