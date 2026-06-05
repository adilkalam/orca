#!/usr/bin/env bash
set -euo pipefail

# Evidence utilities shared by capture scripts

ensure_evidence_dirs() {
  mkdir -p .orca/orchestration/evidence/screenshots \
           .orca/orchestration/evidence/build \
           .orca/orchestration/evidence/tests \
           .orca/orchestration/evidence/requests \
           .orca/orchestration/logs
}

timestamp() {
  date -u '+%Y%m%d-%H%M%S'
}

append_impl_log() {
  local line="$1"
  mkdir -p .orca/orchestration/temp
  printf '%s\n' "$line" >> .orca/orchestration/temp/implementation-log.md
}

