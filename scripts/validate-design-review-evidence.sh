#!/usr/bin/env bash
# validate-design-review-evidence.sh
# Lightweight structural validator for design review evidence files.
# Used by gate-enforcement.sh to block PASS decisions without real measurements.

set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: validate-design-review-evidence.sh <evidence-file> [...]" >&2
  exit 1
fi

STATUS=0

for evidence_file in "$@"; do
  if [ ! -f "$evidence_file" ]; then
    echo "Missing design review evidence file: $evidence_file" >&2
    STATUS=1
    continue
  fi

  # Require core sections so reports are structured and comparable.
  if ! grep -q "COVERAGE DECLARATION" "$evidence_file"; then
    echo "Design review evidence missing COVERAGE DECLARATION: $evidence_file" >&2
    STATUS=1
  fi

  if ! grep -q "MEASUREMENTS" "$evidence_file"; then
    echo "Design review evidence missing MEASUREMENTS section: $evidence_file" >&2
    STATUS=1
  fi

  if ! grep -q "PIXEL COMPARISON" "$evidence_file"; then
    echo "Design review evidence missing PIXEL COMPARISON section: $evidence_file" >&2
    STATUS=1
  fi

  if ! grep -q "VERIFICATION RESULT" "$evidence_file"; then
    echo "Design review evidence missing VERIFICATION RESULT section: $evidence_file" >&2
    STATUS=1
  fi

  # Require at least one explicit pixel measurement (e.g. "24px").
  if ! grep -Eq '[0-9]+px' "$evidence_file"; then
    echo "Design review evidence has no explicit pixel measurements (e.g. 24px): $evidence_file" >&2
    STATUS=1
  fi
done

exit "$STATUS"

