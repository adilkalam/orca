#!/bin/bash
# ORCA-OS Health Check -- regression test for known failure modes
# Usage: bash scripts/verify-health.sh
# Exit: 0 if all pass, 1 if any fail

PASS=0; FAIL=0; TOTAL=0
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
cd "$REPO" || exit 1

check() {
  TOTAL=$((TOTAL + 1))
  if eval "$2" > /dev/null 2>&1; then
    echo "[PASS] $1"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $1"
    FAIL=$((FAIL + 1))
  fi
}

# Inverted check: PASS when grep finds NOTHING
no_match() {
  TOTAL=$((TOTAL + 1))
  local result
  result=$(eval "$2" 2>/dev/null)
  if [ -z "$result" ]; then
    echo "[PASS] $1"
    PASS=$((PASS + 1))
  else
    echo "[FAIL] $1"
    echo "       $result" | head -3
    FAIL=$((FAIL + 1))
  fi
}

echo "ORCA-OS Health Check"
echo "===================="

# 1. PHANTOM REFS
EXCL="--exclude-dir=.claude --exclude-dir=.archived --exclude-dir=temp --exclude=changelog.md --exclude=ORCA-Fundamentals.md"
no_match "No phantom agent-knowledge refs" "grep -r $EXCL 'agent-knowledge' agents/"
no_match "No phantom patterns.json refs" "grep -r $EXCL 'patterns\.json' agents/"
no_match "No phantom improvement-event refs" "grep -r $EXCL 'improvement-event' agents/"
no_match "No phantom improvement-bus refs" "grep -r $EXCL 'improvement.bus\|Improvement Bus' agents/ commands/ quick-reference/ README.md dist/README.md"
no_match "No phantom self-improvement.md refs in docs/concepts" "grep -r 'self-improvement\.md' docs/concepts/"

# 2. BINARY HEALTH
check "orca-record binary exists" "test -x ~/.claude/bin/orca-record"
check "orca-record version exits 0" "~/.claude/bin/orca-record version"
ORCA_VER=$(~/.claude/bin/orca-record version 2>/dev/null)
check "orca-record exits 0 from non-git dir" "(cd /tmp && ~/.claude/bin/orca-record stop < /dev/null)"

# 3. VERSION CONSISTENCY
SRC_VER=$(grep 'const VERSION' mcp/orca-record/src/index.ts | grep -o '"[^"]*"' | tr -d '"')
check "Binary version matches source ($SRC_VER)" "echo \"$ORCA_VER\" | grep -q \"$SRC_VER\""
no_match "No OS 6.3/6.4 strings in commands" "grep -r 'OS 6\.[34]' commands/"

# 4. CROSS-REFERENCE INTEGRITY
no_match "No links to self-improvement.md" "grep -r 'self-improvement\.md' docs/concepts/"
no_match "No links to improvement-bus.md" "grep -r --exclude=changelog.md --exclude=ORCA-Fundamentals.md 'improvement-bus\.md' docs/"

# 5. WORKSHOP HEALTH
if command -v workshop >/dev/null 2>&1; then
  ENTRY_COUNT=$(workshop --workspace .claude/memory count 2>/dev/null || echo "0")
  if [ "$ENTRY_COUNT" -gt 600 ] 2>/dev/null; then
    echo "[WARN] Workshop entry count high: $ENTRY_COUNT (max recommended: 600)"
  else
    echo "[PASS] Workshop entry count: $ENTRY_COUNT"
    PASS=$((PASS + 1))
  fi
  TOTAL=$((TOTAL + 1))

  PINNED_COUNT=$(workshop --workspace .claude/memory search "pinned" 2>/dev/null | grep -c "pinned" || echo "0")
  if [ "$PINNED_COUNT" -gt 50 ] 2>/dev/null; then
    echo "[WARN] Workshop pinned count high: $PINNED_COUNT (max recommended: 50)"
  fi
fi

# 6. ORCA-LINT (reality checker; baseline-suppressed known debt)
# Non-fatal on known debt: --baseline silences the seeded findings, --strict makes
# a NON-baseline (i.e. NEW / regression) finding the only thing that flips this
# check to FAIL. --no-drift keeps it fast; drift is informational only.
check "orca-lint: no new findings (baseline OK)" \
  "python3 \"$SCRIPT_DIR/orca-lint.py\" --strict --baseline \"$SCRIPT_DIR/orca-lint-baseline.txt\" --no-drift"

echo "===================="
echo "Result: $PASS/$TOTAL PASSED, $FAIL FAILED"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
