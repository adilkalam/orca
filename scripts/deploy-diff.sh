#!/usr/bin/env bash
#
# deploy-diff.sh -- content-based drift check between the ORCA-OS repo and the
# deployed ~/.claude tree.
#
# Why cksum, not mtime:
#   Deploy drift can run in BOTH directions. Some deployed files are newer than
#   the repo (a live redesign shipped straight to ~/.claude -- see the SC-1
#   cognition-direct family in scripts/deploy-protected.txt). mtime alone
#   mislabels this, so equality is decided by content (cksum). mtime is used
#   ONLY as a label to say which side is "newer" once content already differs.
#
# Classes per file:
#   SAME           content identical on both sides
#   REPO-NEWER     content differs; repo side looks newer (deploy would push it)
#   DEPLOYED-NEWER content differs; deployed side looks newer (do NOT clobber)
#   REPO-ONLY      exists in repo, not deployed
#   DEPLOYED-ONLY  exists deployed, not in repo
#   PROTECTED      basename matches scripts/deploy-protected.txt -- reported
#                  only, never actioned, excluded from the drift exit code
#
# Exit code:
#   non-zero if ANY non-protected drift class is non-empty (so verify-health.sh
#   can consume it); zero when the only differences are PROTECTED.
#
# Files that the deploy itself never syncs (archive/deprecated/shopify/
# liquid-quick) are skipped so they do not register as false-positive drift.
#
# -e is intentionally omitted: cksum/find/grep loops must not abort when one
# side is missing or a grep filters every line.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(dirname "$SCRIPT_DIR")"
CLAUDE="$HOME/.claude"
PROTECTED_LIST="$SCRIPT_DIR/deploy-protected.txt"
QUIET=0

usage() {
  cat <<USAGE
Usage: deploy-diff.sh [--quiet] [--protected-list <path>]
  --quiet                 summary counts only (no per-class file listings)
  --protected-list <path> override the protected list (default: $PROTECTED_LIST)
USAGE
}

while [ $# -gt 0 ]; do
  case "$1" in
    --quiet) QUIET=1; shift;;
    --protected-list) PROTECTED_LIST="${2:?--protected-list needs a path}"; shift 2;;
    --protected-list=*) PROTECTED_LIST="${1#*=}"; shift;;
    -h|--help) usage; exit 0;;
    *) echo "deploy-diff: unknown argument: $1" >&2; usage >&2; exit 2;;
  esac
done

DIRS="commands agents skills hooks scripts docs/reference docs/pipelines bin"
EXCLUDE_REGEX='archive|deprecated|shopify|liquid-quick'

# --- protected patterns ------------------------------------------------------
PROT_PATTERNS=()
load_protected() {
  if [ ! -f "$PROTECTED_LIST" ]; then
    echo "deploy-diff: WARNING protected list not found: $PROTECTED_LIST" >&2
    return 0
  fi
  local line
  while IFS= read -r line; do
    line="${line%%#*}"                       # drop comments (## header lines)
    line="$(printf '%s' "$line" | tr -d '[:space:]')"
    [ -n "$line" ] || continue
    PROT_PATTERNS+=("$line")
  done < "$PROTECTED_LIST"
}

is_protected() {
  local bn="$1" pat
  for pat in "${PROT_PATTERNS[@]:-}"; do
    [ -n "$pat" ] || continue
    case "$bn" in
      $pat) return 0;;
    esac
  done
  return 1
}

# --- mtime helpers (label only) ---------------------------------------------
# These decide ONLY which side is "newer" once content already differs; content
# equality is always cksum. Filesystem mtimes of committed repo files are
# unreliable (checkout resets them), so the repo timestamp prefers git commit
# time -- EXCEPT when the working tree has uncommitted changes (a fresh edit),
# where the on-disk mtime is the honest signal.
fs_mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0; }

repo_mtime() {                                # $1 = relpath from repo root; $2 = abs path
  local rel="$1" abs="$2" t
  # uncommitted working-tree change (staged or unstaged) vs HEAD -> trust disk
  if ! git -C "$REPO" diff --quiet HEAD -- "$rel" 2>/dev/null; then
    fs_mtime "$abs"; return
  fi
  # untracked file -> trust disk
  if [ -z "$(git -C "$REPO" ls-files -- "$rel" 2>/dev/null)" ]; then
    fs_mtime "$abs"; return
  fi
  t="$(git -C "$REPO" log -1 --format=%ct -- "$rel" 2>/dev/null)"
  [ -n "$t" ] && echo "$t" || fs_mtime "$abs"
}

# --- classification ----------------------------------------------------------
load_protected

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
for c in SAME REPO-NEWER DEPLOYED-NEWER REPO-ONLY DEPLOYED-ONLY PROTECTED; do
  : > "$TMP/$c"
done

list_files() {                                # $1 = base dir; prints relative paths
  [ -d "$1" ] || return 0
  ( cd "$1" && find . -type f 2>/dev/null | sed 's|^\./||' )
}

for d in $DIRS; do
  repo_dir="$REPO/$d"
  claude_dir="$CLAUDE/$d"
  { list_files "$repo_dir"; list_files "$claude_dir"; } \
    | grep -Ev "$EXCLUDE_REGEX" \
    | sort -u > "$TMP/union"
  while IFS= read -r rel; do
    [ -n "$rel" ] || continue
    rp="$repo_dir/$rel"
    cp="$claude_dir/$rel"
    disp="$d/$rel"
    bn="$(basename "$rel")"
    if is_protected "$bn"; then
      echo "$disp" >> "$TMP/PROTECTED"
      continue
    fi
    if [ -f "$rp" ] && [ -f "$cp" ]; then
      if [ "$(cksum < "$rp")" = "$(cksum < "$cp")" ]; then
        echo "$disp" >> "$TMP/SAME"
      else
        rt="$(repo_mtime "$disp" "$rp")"
        ct="$(fs_mtime "$cp")"
        if [ "${rt:-0}" -ge "${ct:-0}" ]; then
          echo "$disp" >> "$TMP/REPO-NEWER"
        else
          echo "$disp" >> "$TMP/DEPLOYED-NEWER"
        fi
      fi
    elif [ -f "$rp" ]; then
      echo "$disp" >> "$TMP/REPO-ONLY"
    elif [ -f "$cp" ]; then
      echo "$disp" >> "$TMP/DEPLOYED-ONLY"
    fi
  done < "$TMP/union"
done

count() { wc -l < "$TMP/$1" | tr -d ' '; }

# --- report ------------------------------------------------------------------
echo "ORCA-OS deploy-diff (content / cksum based)"
echo "repo:      $REPO"
echo "deployed:  $CLAUDE"
echo "protected: $PROTECTED_LIST"
echo

if [ "$QUIET" -eq 0 ]; then
  for c in REPO-NEWER DEPLOYED-NEWER REPO-ONLY DEPLOYED-ONLY PROTECTED; do
    n="$(count "$c")"
    echo "== $c ($n) =="
    if [ "$n" -gt 0 ]; then sort "$TMP/$c" | sed 's/^/  /'; fi
    echo
  done
fi

echo "Summary:"
for c in SAME REPO-NEWER DEPLOYED-NEWER REPO-ONLY DEPLOYED-ONLY PROTECTED; do
  printf "  %-15s %s\n" "$c" "$(count "$c")"
done
echo

drift=0
for c in REPO-NEWER DEPLOYED-NEWER REPO-ONLY DEPLOYED-ONLY; do
  drift=$((drift + $(count "$c")))
done

if [ "$drift" -gt 0 ]; then
  echo "DRIFT: $drift non-protected file(s) differ -- reconcile before deploying."
  echo "  DEPLOYED-NEWER on non-protected files means the live copy is ahead;"
  echo "  the owner decides direction before any sync. PROTECTED files (SC-1) are"
  echo "  never synced in either direction."
  exit 1
fi

echo "OK: no non-protected drift (PROTECTED files reported above are expected)."
exit 0
