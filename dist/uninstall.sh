#!/bin/bash
# ORCA-OS Uninstaller
# Removes ORCA-OS configuration from ~/.claude

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CLAUDE_DIR="$HOME/.claude"

echo ""
echo -e "${YELLOW}ORCA-OS Uninstaller${NC}"
echo ""

if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "${RED}No ~/.claude directory found. Nothing to uninstall.${NC}"
    exit 0
fi

echo "This will remove the following:"
echo "  - ~/.claude/agents/"
echo "  - ~/.claude/bin/"
echo "  - ~/.claude/commands/"
echo "  - ~/.claude/skills/"
echo "  - ~/.claude/hooks/"
echo "  - ~/.claude/scripts/"
echo "  - ~/.claude/docs/"
echo "  - ~/.claude/quick-reference/"
echo "  - ~/.claude/mcp/"
echo "  - ~/.claude/CLAUDE.md"
echo ""
echo -e "${YELLOW}This will NOT remove:${NC}"
echo "  - ~/.claude.json (MCP server configs)"
echo "  - ~/.claude/memory/ (your Workshop data)"
echo "  - ~/.claude/orchestration/ (session artifacts)"
echo ""

read -p "Continue? [y/N]: " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Removing ORCA-OS files..."

rm -rf "$CLAUDE_DIR/agents"
rm -rf "$CLAUDE_DIR/bin"
rm -rf "$CLAUDE_DIR/commands"
rm -rf "$CLAUDE_DIR/skills"
rm -rf "$CLAUDE_DIR/hooks"
rm -rf "$CLAUDE_DIR/scripts"
rm -rf "$CLAUDE_DIR/docs"
rm -rf "$CLAUDE_DIR/quick-reference"
rm -rf "$CLAUDE_DIR/mcp"
rm -f "$CLAUDE_DIR/CLAUDE.md"
rm -f "$CLAUDE_DIR/settings.local.json"
rm -f "$CLAUDE_DIR/statusline.sh"

echo ""
echo -e "${GREEN}ORCA-OS has been removed.${NC}"
echo ""
echo "To also remove MCP server configurations, edit ~/.claude.json"
echo "To restore a backup: mv ~/.claude-backup-* ~/.claude"
echo ""
