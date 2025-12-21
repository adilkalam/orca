#!/usr/bin/env bash
set -euo pipefail

# Quick Confirm (Tweak Mode)
# Purpose: Fast confirmation that UI tweaks landed without heavy gates or screenshots.
# - Summarizes diffs for changed UI files (css/scss/sass/js/ts/jsx/tsx/html)
# - Runs Design UI Guard in warn-only mode (can be disabled via mode.json or env)
# - Writes report to .claude/orchestration/temp/verification/tweak-report.md
# - Emits a lightweight .tweak_verified marker

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

ORCH_DIR=".claude/orchestration/temp"
VER_DIR="$ORCH_DIR/verification"
REPORT_MD="$VER_DIR/tweak-report.md"
MARKER="$ORCH_DIR/.tweak_verified"

mkdir -p "$VER_DIR"

# Perf timing (optional)
PERF_T0=""
if [ -f "scripts/perf-log.sh" ]; then
  . scripts/perf-log.sh
  PERF_T0="$(now_ms)"
  perf_log quick_confirm_start
fi

ui_guard_mode() {
  # env overrides file
  if [ -n "${TWEAK_GUARD:-}" ]; then echo "$TWEAK_GUARD"; return; fi
  if [ -f "$ORCH_DIR/mode.json" ]; then
    sed -n 's/.*"tweak_ui_guard"\s*:\s*"\([^"]*\)".*/\1/p' "$ORCH_DIR/mode.json" | head -1
  fi
}

GUARD_MODE="$(ui_guard_mode)"
GUARD_MODE=${GUARD_MODE:-warn}

# Gather changed files vs HEAD (staged or unstaged), include untracked
CHANGED_FILES=$(git diff --name-only HEAD -- . ':!node_modules' 2>/dev/null || true)
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git ls-files -m 2>/dev/null || true)
fi
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || true)

UI_EXTS="css scss sass js ts jsx tsx html swift"
UI_FILES=()
while IFS= read -r f; do
  for ext in $UI_EXTS; do
    case "$f" in
      *.$ext) UI_FILES+=("$f"); break ;;
    esac
  done
done < <(printf "%s\n" "$CHANGED_FILES")

echo "# Tweak Quick Confirm" > "$REPORT_MD"
echo >> "$REPORT_MD"
echo "- Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$REPORT_MD"
echo "- Changed UI files: ${#UI_FILES[@]}" >> "$REPORT_MD"
echo "- UI Guard mode: $GUARD_MODE (warn-only)" >> "$REPORT_MD"
echo >> "$REPORT_MD"

TOTAL_HUNKS=0
TOTAL_LINES=0
if [ ${#UI_FILES[@]} -gt 0 ]; then
  echo "## Diffs (unified, context 0)" >> "$REPORT_MD"
  for f in "${UI_FILES[@]}"; do
    DIFF=$(git diff --unified=0 -- "$f" || true)
    if [ -n "$DIFF" ]; then
      echo >> "$REPORT_MD"
      echo "### $f" >> "$REPORT_MD"
      echo '```diff' >> "$REPORT_MD"
      echo "$DIFF" >> "$REPORT_MD"
      echo '```' >> "$REPORT_MD"
      # count lines changed (+/-)
      LINES=$(
        printf "%s\n" "$DIFF" | grep -E '^[+-][^+-]' | wc -l | tr -d ' '
      )
      TOTAL_LINES=$((TOTAL_LINES + LINES))
      HUNKS=$(printf "%s\n" "$DIFF" | grep -c '^@@' || true)
      TOTAL_HUNKS=$((TOTAL_HUNKS + HUNKS))
    else
      # If untracked new file, synthesize a simple diff for reporting
      if printf "%s\n" "$UNTRACKED" | grep -Fxq "$f"; then
        echo >> "$REPORT_MD"
        echo "### $f (new file)" >> "$REPORT_MD"
        echo '```diff' >> "$REPORT_MD"
        echo "+++ b/$f" >> "$REPORT_MD"
        echo "@@" >> "$REPORT_MD"
        sed -n '1,200p' -- "$f" | sed 's/^/+ /' >> "$REPORT_MD" || true
        echo '```' >> "$REPORT_MD"
        LINES=$(wc -l < "$f" | tr -d ' ')
        TOTAL_LINES=$((TOTAL_LINES + LINES))
        TOTAL_HUNKS=$((TOTAL_HUNKS + 1))
      fi
    fi
  done
fi

echo >> "$REPORT_MD"
echo "- Total hunks: $TOTAL_HUNKS" >> "$REPORT_MD"
echo "- Total changed lines (approx): $TOTAL_LINES" >> "$REPORT_MD"

# Run Design Guard unless off
GUARD_VIOLATIONS="skipped"
if [ "$GUARD_MODE" != "off" ] && command -v python3 >/dev/null 2>&1; then
  if python3 scripts/design_ui_guard.py >/dev/null 2>&1; then
    if [ -f "$VER_DIR/design-guard-summary.json" ]; then
      GUARD_VIOLATIONS=$(sed -n 's/.*"violations"\s*:\s*\([0-9][0-9]*\).*/\1/p' "$VER_DIR/design-guard-summary.json" | head -1)
      echo >> "$REPORT_MD"
      echo "## Design Guard" >> "$REPORT_MD"
      echo "- Violations: $GUARD_VIOLATIONS (warn-only)" >> "$REPORT_MD"
    fi
  fi
fi

STATUS="FAIL"
REASON="No UI changes detected"
if [ ${#UI_FILES[@]} -gt 0 ] && [ "$TOTAL_LINES" -gt 0 ]; then
  STATUS="PASS"
  REASON="Changes detected in ${#UI_FILES[@]} files"
fi

{
  echo "status: $STATUS"
  echo "timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "files_changed: ${#UI_FILES[@]}"
  echo "hunks: $TOTAL_HUNKS"
  echo "lines_changed: $TOTAL_LINES"
  echo "ui_guard: $GUARD_MODE"
  echo "design_guard_violations: $GUARD_VIOLATIONS"
  echo "report: $REPORT_MD"
  echo "reason: $REASON"
} > "$MARKER"

echo "Quick confirm $STATUS — $REASON"
echo "See $REPORT_MD"
# Memory refresh removed - memory-index.py no longer exists

# Perf end
if [ -n "$PERF_T0" ]; then
  PERF_T1="$(now_ms)"
  perf_log quick_confirm_end status=$STATUS duration_ms=$(( PERF_T1 - PERF_T0 )) files_changed=${#UI_FILES[@]} lines_changed=$TOTAL_LINES
fi

if [ "$STATUS" = "PASS" ]; then exit 0; else exit 1; fi
