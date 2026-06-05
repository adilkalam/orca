#!/usr/bin/env bash
# audit-design.sh — Project-local design hygiene detector
#
# Parallel hygiene utility, analogous to `npx impeccable detect`. Runs
# alongside human design review. Exit codes inform but do NOT gate
# shipping. The design gate is the user's eye, not this script. Use
# the output as one signal among many.
#
# This script catches mechanical hygiene only:
#   - mono count cap, mono outside whitelist, OT ligature disable
#   - excess mono tracking, citations/big-numerals in mono
#   - border+padding compensation, geometric centering on triangles
#   - icon-text gap below 12px on icon-shaped pairs
#
# It does NOT and CANNOT bind taste. Design has unbounded combinatorics;
# no rule list can enumerate every failure mode. Use this script as part
# of a workflow that includes structured discovery (/shape), visual
# direction (/craft), and element-by-element iteration (/live).
#
# Reads configuration from a sibling .audit-config.json (or
# scripts/.audit-config.json) so the same template serves any project.
# Defaults are tuned to peptidefox-equivalent values so a fresh project
# gets a working hygiene check out of the box.
#
# Usage:
#   ./scripts/audit-design.sh                  # check all stylesheets
#   ./scripts/audit-design.sh dosing           # filter to files containing 'dosing'
#
# Exits 0 if all checks pass, non-zero if any FAIL violation is found.
# Exit codes are reportable but DO NOT gate shipping in any design
# command. /impeccable --craft, /refine, /simplify, /fortify,
# /motion-design, /design-audit, /design-critique, and /recraft all
# treat this script's output as parallel hygiene only.
#
# Layered hygiene checks:
#   1. Mono count cap (default 8 declarations per stylesheet)
#   2. Mono inside non-whitelisted class names
#   3. OpenType ligature features not disabled on mono register
#   4. Excess mono tracking
#   5. Citations / big numerals rendered in mono
#   6. Border + un-decremented padding (alignment rule 4)
#   7. Geometric centering on triangle-shaped icons (alignment rule 1)
#   8. Icon-text gap below 12px (alignment rule 3)
#
# Each check prints offending lines + a count summary. Failures
# accumulate; the script reports each independently and exits with the
# count of failures.

set -uo pipefail

# Locate project root (script lives in {project}/scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

FILTER="${1:-}"

# ─────────────────────────────────────────────────────────────────────
# Configuration — read .audit-config.json if present; else use defaults.
# ─────────────────────────────────────────────────────────────────────
#
# Schema:
#   {
#     "monoCountCap": <int>,
#     "monoWhitelist": [<class-suffix-regex-fragment>, ...],
#     "classPrefix": "<project class prefix, e.g. dp- or pf->",
#     "stylesheetGlob": "<dir or glob, e.g. app/styles/components>",
#     "monoFontPattern": "<regex matching the project mono font, e.g. Brown Mono>"
#   }

CONFIG_FILE=""
for candidate in "./.audit-config.json" "./scripts/.audit-config.json"; do
  if [ -f "$candidate" ]; then CONFIG_FILE="$candidate"; break; fi
done

# Defaults (peptidefox-equivalent)
MONO_COUNT_CAP=8
STYLESHEET_GLOB="app/styles/components"
MONO_FONT_PATTERN="Brown Mono"
CLASS_PREFIX=""
WHITELIST_RE='__eyebrow|__tag|__unit|__chip|__axis|__footnote|__terminal|__code|__meta|__readout|__cell-mono|__measure-unit|axis-tick|hover-readout|provenance-tag|annotation-tag|empty-tag|pair-tag|arm-warn|arm-meta|canvas-meta|group-label|controls__label|mono-register'

# Override defaults from config file if jq is available and file exists.
if [ -n "$CONFIG_FILE" ] && command -v jq >/dev/null 2>&1; then
  MONO_COUNT_CAP=$(jq -r '.monoCountCap // 8' "$CONFIG_FILE")
  STYLESHEET_GLOB=$(jq -r '.stylesheetGlob // "app/styles/components"' "$CONFIG_FILE")
  MONO_FONT_PATTERN=$(jq -r '.monoFontPattern // "Brown Mono"' "$CONFIG_FILE")
  CLASS_PREFIX=$(jq -r '.classPrefix // ""' "$CONFIG_FILE")
  CONFIG_WL=$(jq -r '.monoWhitelist // [] | join("|")' "$CONFIG_FILE")
  if [ -n "$CONFIG_WL" ]; then
    WHITELIST_RE="$CONFIG_WL"
  fi
fi

TARGET_DIR="$STYLESHEET_GLOB"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Stylesheet directory not found: $TARGET_DIR"
  echo "Configure stylesheetGlob in .audit-config.json or run from project root."
  exit 1
fi

if [ -n "$FILTER" ]; then
  STYLESHEETS=$(find "$TARGET_DIR" -type f -name "*.css" | grep -i "$FILTER")
else
  STYLESHEETS=$(find "$TARGET_DIR" -type f -name "*.css")
fi

if [ -z "$STYLESHEETS" ]; then
  echo "No stylesheets matched filter: $FILTER"
  exit 1
fi

# Color helpers (only when stdout is a TTY)
if [ -t 1 ]; then
  RED='\033[0;31m'
  YELLOW='\033[0;33m'
  GREEN='\033[0;32m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  RED=''; YELLOW=''; GREEN=''; BOLD=''; NC=''
fi

FAIL_COUNT=0
WARN_COUNT=0

fail() {
  printf "${RED}${BOLD}FAIL${NC}  %s\n" "$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  printf "${YELLOW}WARN${NC}  %s\n" "$1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

pass() {
  printf "${GREEN}PASS${NC}  %s\n" "$1"
}

section() {
  printf "\n${BOLD}── %s ──${NC}\n" "$1"
}

# Print the active configuration up front so anyone reviewing the run knows
# what the audit is binding against.
section "Configuration"
printf "  config file       : %s\n" "${CONFIG_FILE:-<defaults>}"
printf "  mono font pattern : %s\n" "$MONO_FONT_PATTERN"
printf "  mono count cap    : %s\n" "$MONO_COUNT_CAP"
printf "  stylesheet glob   : %s\n" "$STYLESHEET_GLOB"
printf "  class prefix      : %s\n" "${CLASS_PREFIX:-<none>}"

# ─────────────────────────────────────────────────────────────────────
# 1. Mono count cap
# ─────────────────────────────────────────────────────────────────────

section "1. Mono count per stylesheet (cap $MONO_COUNT_CAP)"

while IFS= read -r f; do
  count=$(grep -c "font-family.*$MONO_FONT_PATTERN" "$f" 2>/dev/null || echo 0)
  if [ "$count" -gt "$MONO_COUNT_CAP" ]; then
    fail "$f has $count mono declarations (cap $MONO_COUNT_CAP)"
  elif [ "$count" -gt 0 ]; then
    pass "$f — $count mono declarations"
  fi
done <<< "$STYLESHEETS"

# ─────────────────────────────────────────────────────────────────────
# 2. Mono inside non-whitelisted class names
# ─────────────────────────────────────────────────────────────────────

section "2. Mono inside non-whitelisted CSS class names"

while IFS= read -r f; do
  awk -v file="$f" -v wl="$WHITELIST_RE" -v fp="$MONO_FONT_PATTERN" '
    /^\.[A-Za-z0-9_-]/ { sel=$0 }
    $0 ~ ("font-family.*" fp) {
      if (sel !~ wl) {
        print file":"NR": " sel " uses mono but not whitelisted"
      }
    }
  ' "$f"
done <<< "$STYLESHEETS" > /tmp/audit-mono-class-violations.txt

if [ -s /tmp/audit-mono-class-violations.txt ]; then
  cat /tmp/audit-mono-class-violations.txt
  count=$(wc -l < /tmp/audit-mono-class-violations.txt)
  fail "$count mono usages outside whitelist"
else
  pass "All mono usages are inside whitelisted class names"
fi

# ─────────────────────────────────────────────────────────────────────
# 3. OpenType ligatures not disabled on mono register
# ─────────────────────────────────────────────────────────────────────

section "3. OpenType ligatures disabled on mono register"

while IFS= read -r f; do
  awk -v file="$f" -v fp="$MONO_FONT_PATTERN" '
    /\{/ { block=""; collecting=1; line_start=NR }
    collecting { block = block $0 "\n" }
    /\}/ {
      if (block ~ fp && block !~ /font-variant-ligatures:\s*none/ && block !~ /font-feature-settings.*[\047"]liga[\047"][^a-z]*0/) {
        print file":"line_start": mono block without ligature disable"
      }
      collecting=0; block=""
    }
  ' "$f"
done <<< "$STYLESHEETS" > /tmp/audit-mono-liga.txt

if [ -s /tmp/audit-mono-liga.txt ]; then
  cat /tmp/audit-mono-liga.txt
  count=$(wc -l < /tmp/audit-mono-liga.txt)
  warn "$count mono blocks lack explicit OpenType disable (verify a parent .mono-register handles it; otherwise add font-variant-ligatures: none)"
else
  pass "All mono blocks have ligatures disabled"
fi

# ─────────────────────────────────────────────────────────────────────
# 4. Excess mono tracking
# ─────────────────────────────────────────────────────────────────────

section "4. Excess mono letter-spacing (cap 0.08em uppercase, 0.04em lowercase)"

while IFS= read -r f; do
  awk -v file="$f" -v fp="$MONO_FONT_PATTERN" '
    /\{/ { block=""; line_start=NR }
    { block = block $0 "\n" }
    /\}/ {
      if (block ~ fp) {
        if (match(block, /letter-spacing:\s*0\.(0[9]|1[0-9])/)) {
          print file":"line_start": mono block with letter-spacing > 0.08em"
        }
      }
      block=""
    }
  ' "$f"
done <<< "$STYLESHEETS" > /tmp/audit-mono-tracking.txt

if [ -s /tmp/audit-mono-tracking.txt ]; then
  cat /tmp/audit-mono-tracking.txt
  count=$(wc -l < /tmp/audit-mono-tracking.txt)
  fail "$count mono blocks with excess tracking"
else
  pass "All mono tracking within cap"
fi

# ─────────────────────────────────────────────────────────────────────
# 5. Citations / big numerals rendered in mono
# ─────────────────────────────────────────────────────────────────────

section "5. Citations / big numerals in mono (forbidden)"

# Citations
grep -rEn "font-family.*$MONO_FONT_PATTERN" "$TARGET_DIR" \
  | grep -iE "(citation|footnote-text|provenance-text|chart-foot-source|source-line)" \
  > /tmp/audit-mono-citations.txt || true

# Big numerals — selectors that read as "the big number"
grep -rEn "font-family.*$MONO_FONT_PATTERN" "$TARGET_DIR" \
  | grep -iE "(numeral|metric-value|hero-value|result-value|pair-ratio|big-number|display-num)" \
  >> /tmp/audit-mono-citations.txt || true

if [ -s /tmp/audit-mono-citations.txt ]; then
  cat /tmp/audit-mono-citations.txt
  count=$(wc -l < /tmp/audit-mono-citations.txt)
  fail "$count selectors using mono for citations or big numerals"
else
  pass "No mono in citation or big-numeral selectors"
fi

# ─────────────────────────────────────────────────────────────────────
# 6. Border + un-decremented padding (alignment rule 4)
# ─────────────────────────────────────────────────────────────────────

section "6. Border-weight padding compensation (alignment rule 4)"

while IFS= read -r f; do
  awk -v file="$f" '
    /\{/ { block=""; line_start=NR }
    { block = block $0 "\n" }
    /\}/ {
      if (block ~ /border:\s*1px solid/ &&
          block ~ /padding:\s*(1rem|1\.5rem|2rem|0\.75rem|24px|16px|32px|12px)\b/) {
        print file":"line_start": 1px border + un-decremented padding"
      }
      block=""
    }
  ' "$f"
done <<< "$STYLESHEETS" > /tmp/audit-border-padding.txt

if [ -s /tmp/audit-border-padding.txt ]; then
  cat /tmp/audit-border-padding.txt
  count=$(wc -l < /tmp/audit-border-padding.txt)
  warn "$count rules with 1px border AND nominal-clean padding (verify each — compensation may be intentional or absent)"
else
  pass "Border + padding pairs all compensated"
fi

# ─────────────────────────────────────────────────────────────────────
# 7. Geometric centering on triangle/pointed shapes (alignment rule 1)
# ─────────────────────────────────────────────────────────────────────

section "7. Triangle/pointed-shape geometric centering (alignment rule 1)"

grep -rEn "transform:\s*translateX\(-50%\)" "$TARGET_DIR" \
  | grep -iE "(chevron|caret|arrow|play|triangle|pointed)" \
  > /tmp/audit-triangle-center.txt || true

if [ -s /tmp/audit-triangle-center.txt ]; then
  cat /tmp/audit-triangle-center.txt
  count=$(wc -l < /tmp/audit-triangle-center.txt)
  fail "$count triangle-shaped elements geometrically (not optically) centered"
else
  pass "No geometric centering on triangle/pointed shapes detected"
fi

# ─────────────────────────────────────────────────────────────────────
# 8. Icon-text gap below 12px on icon-shaped first child (alignment rule 3)
# ─────────────────────────────────────────────────────────────────────

section "8. Icon-text gap (alignment rule 3 — must be 1.5× = 12px when icon-shaped)"

while IFS= read -r f; do
  awk -v file="$f" '
    /\{/ { block=""; line_start=NR; sel="" }
    /^\.[A-Za-z0-9_-]/ { sel=$0 }
    { block = block $0 "\n" }
    /\}/ {
      if (block ~ /gap:\s*(0\.5rem|8px)/ && block ~ /(display:\s*(inline-)?flex|display:\s*(inline-)?grid)/ &&
          (sel ~ /icon|swatch|chip|tag-text|leading-icon/)) {
        print file":"line_start": "sel " has gap:8px on icon-text-pair (should be 12px / 0.75rem)"
      }
      block=""; sel=""
    }
  ' "$f"
done <<< "$STYLESHEETS" > /tmp/audit-icon-gap.txt

if [ -s /tmp/audit-icon-gap.txt ]; then
  cat /tmp/audit-icon-gap.txt
  count=$(wc -l < /tmp/audit-icon-gap.txt)
  warn "$count potential icon-text-pair rules with sub-12px gap"
else
  pass "Icon-text gaps look correct"
fi

# ─────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────

section "Summary"

if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
  printf "${GREEN}${BOLD}All checks passed.${NC}\n"
  exit 0
fi

printf "Failures: ${RED}${BOLD}%s${NC}\n" "$FAIL_COUNT"
printf "Warnings: ${YELLOW}%s${NC}\n" "$WARN_COUNT"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo ""
  echo "Audit failed. Fix violations before claiming the UI pass is done."
  echo "Cross-reference: .claude/aesthetic.md (Mono discipline + Alignment discipline)"
  exit 1
fi

echo ""
echo "Audit warnings only — review each manually. The grep is heuristic;"
echo "verify with .claude/aesthetic.md whether each warning is a real violation."
exit 0
