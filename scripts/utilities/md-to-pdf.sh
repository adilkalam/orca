#!/usr/bin/env bash
set -euo pipefail

# Convert a Markdown file to PDF using md-to-pdf with ORCA-OS defaults.
# Usage: scripts/utilities/md-to-pdf.sh [--serif|--sans] <input.md> [output.pdf]
#   (no flag)  = Sharp Sans No. 2 headings + Tiempos Text body (default)
#   --serif    = Financier
#   --sans     = Sharp Sans No. 2

STYLE="default"

# Parse flags
while [[ "${1:-}" == --* ]]; do
  case "$1" in
    --serif) STYLE="serif"; shift ;;
    --sans)  STYLE="sans"; shift ;;
    *) echo "Unknown flag: $1" >&2; exit 2 ;;
  esac
done

IN="${1:-}"
OUT_ARG="${2:-}"

if [ -z "$IN" ]; then
  echo "Usage: $0 [--serif|--sans] <input.md> [output.pdf]" >&2
  exit 2
fi

if [ ! -f "$IN" ]; then
  echo "Input file not found: $IN" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$ROOT_DIR/config/md-to-pdf.json"

IN_ABS="$(cd "$ROOT_DIR" && cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
IN_DIR="$(cd "$(dirname "$IN_ABS")" && pwd)"
IN_BASE="$(basename "$IN_ABS")"

if [[ "$IN_BASE" == *.md ]]; then
  BASE_NO_EXT="${IN_BASE%.md}"
else
  BASE_NO_EXT="$IN_BASE"
fi

GENERATED_PDF="$IN_DIR/$BASE_NO_EXT.pdf"

if [ -z "$OUT_ARG" ]; then
  TARGET_PDF="$IN_DIR/PDF/$BASE_NO_EXT.pdf"
else
  OUT="$OUT_ARG"
  if [[ "$OUT" = /* ]]; then
    TARGET_PDF="$OUT"
  else
    TARGET_PDF="$IN_DIR/$OUT"
  fi

  case "$TARGET_PDF" in
    *.pdf) ;;
    *) TARGET_PDF="$TARGET_PDF.pdf" ;;
  esac
fi

if command -v md-to-pdf >/dev/null 2>&1; then
  TOOL=(md-to-pdf)
elif command -v npx >/dev/null 2>&1; then
  TOOL=(npx md-to-pdf)
else
  echo "md-to-pdf not found." >&2
  echo "Install globally with: npm install -g md-to-pdf" >&2
  echo "or run via npx: npx md-to-pdf <input.md>" >&2
  exit 1
fi

# Resolve stylesheet based on style flag
MD_TO_PDF_PKG="$(dirname "$(command -v md-to-pdf 2>/dev/null || echo "")")/../lib/node_modules/md-to-pdf"
if [ ! -d "$MD_TO_PDF_PKG" ]; then
  MD_TO_PDF_PKG="/opt/homebrew/lib/node_modules/md-to-pdf"
fi

case "$STYLE" in
  serif)
    CSS_SRC="$ROOT_DIR/config/md-to-pdf/markdown-serif.css"
    echo "Style: serif (Financier)"
    ;;
  sans)
    CSS_SRC="$ROOT_DIR/config/md-to-pdf/markdown-sans.css"
    echo "Style: sans (Sharp Sans No. 2)"
    ;;
  *)
    CSS_SRC="$ROOT_DIR/config/md-to-pdf/markdown.css"
    ;;
esac

if [ -f "$CSS_SRC" ] && [ -d "$MD_TO_PDF_PKG" ]; then
  cp "$CSS_SRC" "$MD_TO_PDF_PKG/markdown.css"
fi

cd "$ROOT_DIR"

ARGS=("$IN_ABS")
if [ -f "$CONFIG_FILE" ]; then
  ARGS+=("--config-file" "$CONFIG_FILE")
fi

"${TOOL[@]}" "${ARGS[@]}"

if [ ! -f "$GENERATED_PDF" ]; then
  echo "Expected generated PDF not found: $GENERATED_PDF" >&2
  exit 1
fi

if [ "$GENERATED_PDF" != "$TARGET_PDF" ]; then
  mkdir -p "$(dirname "$TARGET_PDF")"
  mv "$GENERATED_PDF" "$TARGET_PDF"
fi

echo "Generated PDF: $TARGET_PDF"
