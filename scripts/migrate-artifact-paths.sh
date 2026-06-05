#!/usr/bin/env bash
# migrate-artifact-paths.sh
# Consolidates work artifact dirs into .orca/ subdirectories.
# Pass 1: .claude/{x} -> .{x} (already done)
# Pass 2: .{x} -> .orca/{x} (current)
# Safe: skips if source missing or destination exists.

set -euo pipefail

PROJECTS=(
  "$HOME/peptidefox"
  "$HOME/RVRY"
  "$HOME/rvry-engine"
  "$HOME/obsidian-peptides"
  "$HOME/peptidefox-mobile/peptidefox-ios"
)

# Pass 2: consolidate into .orca/
MIGRATIONS=(
  ".orchestration:.orca/orchestration"
  ".cognition:.orca/cognition"
  ".requirements:.orca/requirements"
  ".audit:.orca/audit"
)

# Also handle any leftover pass-1 sources (.claude/{x} -> .orca/{x})
LEGACY_MIGRATIONS=(
  ".claude/orchestration:.orca/orchestration"
  ".claude/cognition:.orca/cognition"
  ".claude/requirements:.orca/requirements"
  ".claude/audit:.orca/audit"
)

for project in "${PROJECTS[@]}"; do
  if [[ ! -d "$project" ]]; then
    echo "SKIP: $project (project not found)"
    continue
  fi

  echo ""
  echo "=== $project ==="

  # Ensure .orca/ exists
  mkdir -p "$project/.orca"

  for mapping in "${MIGRATIONS[@]}" "${LEGACY_MIGRATIONS[@]}"; do
    src="${mapping%%:*}"
    dst="${mapping##*:}"

    src_path="$project/$src"
    dst_path="$project/$dst"

    if [[ ! -d "$src_path" ]]; then
      continue
    fi

    if [[ -d "$dst_path" ]]; then
      echo "  SKIP: $dst (destination already exists, source: $src)"
      continue
    fi

    mv "$src_path" "$dst_path"
    echo "  MOVED: $src -> $dst"
  done
done

echo ""
echo "Migration complete."
