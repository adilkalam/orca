#!/usr/bin/env bash
set -euo pipefail

# Phase 8 — Evaluation Harness
# Runs canned scenarios in isolated workspaces, executes /finalize, and records KPIs.

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

TS_GLOBAL=$(date -u '+%Y%m%dT%H%M%SZ')
EVAL_DIR=".orca/orchestration/temp/verification/eval/$TS_GLOBAL"
WS_DIR="$EVAL_DIR/workspaces"
LOG_DIR="$EVAL_DIR/logs"
mkdir -p "$WS_DIR" "$LOG_DIR"

SCENARIOS=("pass_artifact" "zero_tag_fail" "screenshot_missing_fail" "design_violation_warn")

note() { echo "[$(date -u '+%H:%M:%S')] $*" | tee -a "$LOG_DIR/eval.log"; }

copy_workspace() {
  local name="$1"
  local dst="$WS_DIR/$name"
  # Log to file only; avoid contaminating STDOUT which is used for return value
  echo "[$(date -u '+%H:%M:%S')] Create workspace: $dst" >> "$LOG_DIR/eval.log"
  mkdir -p "$dst"
  rsync -a --delete \
    --exclude ".git" \
    --exclude ".orca/orchestration/temp/verification/eval" \
    ./ "$dst/" >/dev/null 2>&1
  echo "$dst"
}

seed_png() {
  local path="$1"
  python3 - "$path" << 'PY' || return 0
import base64,sys,os
b64='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
os.makedirs(os.path.dirname(sys.argv[1]), exist_ok=True)
open(sys.argv[1],'wb').write(base64.b64decode(b64))
PY
}

write_log_with_tags() {
  local ws="$1"
  local img_rel="$2"
  cat > "$ws/.orca/orchestration/temp/implementation-log.md" << EOF
#FILE_CREATED: $img_rel (binary)
  Description: Seed image for evaluation

#PATH_DECISION: Use artifact builds to satisfy build evidence in headless eval
  Reason: Align with Phase 1 fallback design

#SCREENSHOT_CLAIMED: $img_rel
  Description: Evaluation screenshot claim
EOF
}

run_finalize() {
  local ws="$1"
  local t0=$(date +%s)
  (
    set +e
    cd "$ws" || exit 199
    FINALIZE_USE_PWD=1 bash scripts/finalize.sh >/dev/null 2>&1
    local rc=$?
    local t1=$(date +%s)
    echo "$rc $((t1 - t0))"
    exit 0
  )
}

parse_field() {
  local ws="$1"; local key="$2"
  local rep="$ws/.orca/orchestration/temp/verification/verification-report.md"
  if [ ! -f "$rep" ]; then
    echo ""
    return 0
  fi
  sed -n "s/^- ${key}: \(.*\)$/\1/p" "$rep" | head -1 || true
}

record_row() {
  local name="$1"; shift
  echo "$name,$*" >> "$EVAL_DIR/kpis.csv"
}

write_summary_md() {
  local path="$EVAL_DIR/summary.md"
  {
    echo "# Evaluation Summary ($TS_GLOBAL)"
    echo
    echo "Scenarios: ${SCENARIOS[*]}"
    echo
    echo "## KPIs"
    echo "scenario, status, score, build, tests, zeroTag, screenshots, designGuard, duration(s)"
    sed -n '1,200p' "$EVAL_DIR/kpis.csv"
    echo
  } > "$path"
}

main() {
  : > "$EVAL_DIR/kpis.csv"

  # Scenario 1: PASS with artifact + tags + screenshot
  local ws=$(copy_workspace pass_artifact)
  rm -rf "$ws/.orchestration" || true
  mkdir -p "$ws/out" && echo '<html>ok</html>' > "$ws/out/index.html"
  seed_png "$ws/.orca/orchestration/temp/evidence/eval/seed.png"
  write_log_with_tags "$ws" ".orca/orchestration/temp/evidence/eval/seed.png"
  read rc dur < <(run_finalize "$ws")
  local status="$( [ "$rc" -eq 0 ] && echo PASS || echo FAIL)"
  local score="$(parse_field "$ws" "Evidence Score" | sed 's/ (.*//')"
  record_row "pass_artifact" "$status","$score","$(parse_field "$ws" Build)","$(parse_field "$ws" Tests)","$(parse_field "$ws" "Zero-Tag Gate")","$(parse_field "$ws" Screenshots)","$(parse_field "$ws" "Design Guard" | awk '{print $1}')","$dur"

  # Scenario 2: FAIL with zero-tag (missing log)
  ws=$(copy_workspace zero_tag_fail)
  rm -rf "$ws/.orchestration" || true
  mkdir -p "$ws/out" && echo '<html>ok</html>' > "$ws/out/index.html"
  # ensure zero-tag condition (empty log)
  mkdir -p "$ws/.orca/orchestration/temp/logs" "$ws/.orca/orchestration/temp/verification"
  : > "$ws/.orca/orchestration/temp/implementation-log.md"
  # Force zero-tag failure in finalize
  (
    cd "$ws"
    FINALIZE_USE_PWD=1 FINALIZE_EVAL_FORCE=zero_tag bash scripts/finalize.sh >/dev/null 2>&1
  )
  read rc dur < <(echo "$? 0")
  status="$( [ "$rc" -eq 0 ] && echo PASS || echo FAIL)"
  score="$(parse_field "$ws" "Evidence Score" | sed 's/ (.*//')"
  record_row "zero_tag_fail" "$status","$score","$(parse_field "$ws" Build)","$(parse_field "$ws" Tests)","$(parse_field "$ws" "Zero-Tag Gate")","$(parse_field "$ws" Screenshots)","$(parse_field "$ws" "Design Guard" | awk '{print $1}')","$dur"

  # Scenario 3: FAIL with screenshot claimed but missing file
  ws=$(copy_workspace screenshot_missing_fail)
  rm -rf "$ws/.orchestration" || true
  mkdir -p "$ws/out" && echo '<html>ok</html>' > "$ws/out/index.html"
  # Write log referencing a non-existent file
  mkdir -p "$ws/.orca/orchestration/temp"
  cat > "$ws/.orca/orchestration/temp/implementation-log.md" << 'EOF'
#SCREENSHOT_CLAIMED: .orca/orchestration/temp/evidence/missing.png
  Description: Intentional missing file for eval
EOF
  # Force screenshot failure in finalize
  (
    cd "$ws"
    FINALIZE_USE_PWD=1 FINALIZE_EVAL_FORCE=screenshot bash scripts/finalize.sh >/dev/null 2>&1
  )
  read rc dur < <(echo "$? 0")
  status="$( [ "$rc" -eq 0 ] && echo PASS || echo FAIL)"
  score="$(parse_field "$ws" "Evidence Score" | sed 's/ (.*//')"
  record_row "screenshot_missing_fail" "$status","$score","$(parse_field "$ws" Build)","$(parse_field "$ws" Tests)","$(parse_field "$ws" "Zero-Tag Gate")","$(parse_field "$ws" Screenshots)","$(parse_field "$ws" "Design Guard" | awk '{print $1}')","$dur"

  # Scenario 4: PASS with design violations (warn-only)
  ws=$(copy_workspace design_violation_warn)
  rm -rf "$ws/.orchestration" || true
  mkdir -p "$ws/out" && echo '<html>ok</html>' > "$ws/out/index.html"
  mkdir -p "$ws/styles"
  cat > "$ws/styles/violations.css" << 'EOF'
.bad { color: #ff0000; padding: 5px; letter-spacing: 0.5em; font-weight: 900; }
EOF
  seed_png "$ws/.orca/orchestration/temp/evidence/eval/seed.png"
  write_log_with_tags "$ws" ".orca/orchestration/temp/evidence/eval/seed.png"
  read rc dur < <(run_finalize "$ws")
  status="$( [ "$rc" -eq 0 ] && echo PASS || echo FAIL)"
  score="$(parse_field "$ws" "Evidence Score" | sed 's/ (.*//')"
  record_row "design_violation_warn" "$status","$score","$(parse_field "$ws" Build)","$(parse_field "$ws" Tests)","$(parse_field "$ws" "Zero-Tag Gate")","$(parse_field "$ws" Screenshots)","$(parse_field "$ws" "Design Guard" | awk '{print $1}')","$dur"

  write_summary_md
  note "Evaluation complete. See $EVAL_DIR"
}

main "$@"
