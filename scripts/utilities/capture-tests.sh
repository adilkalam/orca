#!/usr/bin/env bash
set -euo pipefail

# Run tests and capture logs to evidence + logs.
#
# Usage:
#   bash scripts/capture-tests.sh               # auto-detect
#   bash scripts/capture-tests.sh -- npm test   # explicit command after --

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$SCRIPT_DIR/evidence-utils.sh"

ensure_evidence_dirs

CMD=( )
if [ "$#" -gt 0 ] && [ "$1" = "--" ]; then
  shift
  if [ "$#" -eq 0 ]; then
    echo "No command provided after --" >&2
    exit 2
  fi
  CMD=( "$@" )
else
  if [ -f package.json ] && grep -q '"test"' package.json; then
    CMD=( npm test --silent )
  elif command -v pytest >/dev/null 2>&1; then
    CMD=( pytest -q )
  elif [ -f Cargo.toml ] && command -v cargo >/dev/null 2>&1; then
    CMD=( cargo test --quiet )
  else
    echo "No known test configuration found. Provide command after --" >&2
    exit 2
  fi
fi

ts="$(timestamp)"
EVID=".claude/orchestration/evidence/tests/tests-${ts}.log"
LOG=".claude/orchestration/logs/test-output.log"

set -o pipefail
echo "Running: ${CMD[*]}" | tee "$LOG" | tee "$EVID" >/dev/null
"${CMD[@]}" 2>&1 | tee -a "$LOG" | tee -a "$EVID" >/dev/null
rc=$?

append_impl_log "#FILE_CREATED: $EVID"
exit $rc

