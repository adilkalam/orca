#!/bin/bash
# Sync ORCA-OS to ~/orca (public distribution repo)
#
# IMPORTANT: This script handles special cases:
# 1. Uses exclude-patterns.txt for filtering
# 2. Does NOT copy root README.md - uses dist/README.md instead
# 3. Copies dist/QUICK-START.md to docs/QUICK-START.md
#
# Usage: ./scripts/sync-to-orca.sh [--dry-run]

set -e

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCA_OS_ROOT="$(dirname "$SCRIPT_DIR")"
ORCA_DIST="$HOME/orca"
EXCLUDE_FILE="$ORCA_OS_ROOT/dist/exclude-patterns.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check for dry-run flag
DRY_RUN=""
if [[ "$1" == "--dry-run" ]] || [[ "$1" == "-n" ]]; then
    DRY_RUN="--dry-run"
    echo -e "${YELLOW}DRY RUN MODE - no changes will be made${NC}"
    echo ""
fi

echo -e "${CYAN}Syncing ORCA-OS → ~/orca${NC}"
echo "Source: $ORCA_OS_ROOT"
echo "Dest:   $ORCA_DIST"
echo ""

# Verify paths exist
if [[ ! -d "$ORCA_OS_ROOT" ]]; then
    echo -e "${RED}ERROR: Source directory not found: $ORCA_OS_ROOT${NC}"
    exit 1
fi

if [[ ! -d "$ORCA_DIST" ]]; then
    echo -e "${RED}ERROR: Destination directory not found: $ORCA_DIST${NC}"
    echo "Create it first with: mkdir -p ~/orca && cd ~/orca && git init"
    exit 1
fi

if [[ ! -f "$EXCLUDE_FILE" ]]; then
    echo -e "${RED}ERROR: Exclude patterns file not found: $EXCLUDE_FILE${NC}"
    exit 1
fi

# Step 1: Main rsync (excludes root README.md)
echo -e "${GREEN}[1/3]${NC} Syncing main content..."
rsync -av $DRY_RUN \
    --exclude-from="$EXCLUDE_FILE" \
    --exclude="README.md" \
    --exclude="scripts/sync-to-orca.sh" \
    --delete \
    "$ORCA_OS_ROOT/" "$ORCA_DIST/"

# Step 2: Copy dist/README.md → ~/orca/README.md
echo ""
echo -e "${GREEN}[2/3]${NC} Copying dist/README.md → README.md..."
if [[ -z "$DRY_RUN" ]]; then
    cp "$ORCA_OS_ROOT/dist/README.md" "$ORCA_DIST/README.md"
    echo "    Copied README.md"
else
    echo "    Would copy: dist/README.md → README.md"
fi

# Step 3: Copy dist/QUICK-START.md → ~/orca/docs/QUICK-START.md
echo ""
echo -e "${GREEN}[3/3]${NC} Copying dist/QUICK-START.md → docs/QUICK-START.md..."
if [[ -z "$DRY_RUN" ]]; then
    mkdir -p "$ORCA_DIST/docs"
    cp "$ORCA_OS_ROOT/dist/QUICK-START.md" "$ORCA_DIST/docs/QUICK-START.md"
    echo "    Copied QUICK-START.md"
else
    echo "    Would copy: dist/QUICK-START.md → docs/QUICK-START.md"
fi

echo ""
echo -e "${GREEN}Sync complete!${NC}"
echo ""
echo "Next steps:"
echo "  cd ~/orca"
echo "  git status"
echo "  git add -A && git commit -m 'Sync from ORCA-OS'"
