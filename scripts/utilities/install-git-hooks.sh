#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || (echo "Not a git repo" >&2; exit 1))"
cd "$ROOT_DIR"

HOOKS_DIR=".git/hooks"
# Use repository-provided hook scripts in ./hooks
# (The repo does not ship a ./githooks directory)
SRC_DIR="hooks"

mkdir -p "$HOOKS_DIR"

install_hook() {
  local name="$1"
  local src="$SRC_DIR/$name"
  local dst="$HOOKS_DIR/$name"
  if [ ! -f "$src" ]; then
    echo "Skipping $name (not found at $src)"
    return
  fi
  chmod +x "$src"
  ln -sf "../../$src" "$dst"
  echo "Installed $name -> $dst"
}

install_hook pre-commit
install_hook pre-push

echo "Git hooks installed."
echo "- pre-commit blocks commits without fresh .verified"
echo "- pre-push blocks pushes without fresh .verified"
echo "Run: bash scripts/finalize.sh to generate .verified"
