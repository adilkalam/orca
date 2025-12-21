#!/bin/bash
# ORCA-OS Installation Validator
# Verifies the installation is complete and correct

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CLAUDE_DIR="$HOME/.claude"
ERRORS=0
WARNINGS=0

echo ""
echo "ORCA-OS Installation Validator"
echo "=============================="
echo ""

# Check function
check() {
    local path="$1"
    local desc="$2"
    local required="${3:-true}"

    if [ -e "$path" ]; then
        echo -e "  ${GREEN}[OK]${NC} $desc"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "  ${RED}[MISSING]${NC} $desc"
            ((ERRORS++))
        else
            echo -e "  ${YELLOW}[OPTIONAL]${NC} $desc"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# Count files in directory
count_files() {
    local dir="$1"
    local pattern="${2:-*}"
    if [ -d "$dir" ]; then
        find "$dir" -name "$pattern" -type f 2>/dev/null | wc -l | tr -d ' '
    else
        echo "0"
    fi
}

# Check directory exists
echo "Checking directory structure..."
check "$CLAUDE_DIR" "~/.claude directory"
check "$CLAUDE_DIR/agents" "agents directory"
check "$CLAUDE_DIR/commands" "commands directory"
check "$CLAUDE_DIR/skills" "skills directory"
check "$CLAUDE_DIR/hooks" "hooks directory"
check "$CLAUDE_DIR/scripts" "scripts directory"
check "$CLAUDE_DIR/docs" "docs directory"
check "$CLAUDE_DIR/quick-reference" "quick-reference directory"
check "$CLAUDE_DIR/mcp" "mcp directory"
check "$CLAUDE_DIR/memory" "memory directory" false

echo ""
echo "Checking agents..."
check "$CLAUDE_DIR/agents/iOS" "iOS agents"
check "$CLAUDE_DIR/agents/dev" "Next.js/OS-Dev agents"
check "$CLAUDE_DIR/agents/expo" "Expo agents"
check "$CLAUDE_DIR/agents/research" "Research agents"
check "$CLAUDE_DIR/agents/seo" "SEO agents" false
check "$CLAUDE_DIR/agents/data" "Data agents" false

# Count agents
ios_agents=$(count_files "$CLAUDE_DIR/agents/iOS" "*.md")
nextjs_agents=$(count_files "$CLAUDE_DIR/agents/dev" "*.md")
expo_agents=$(count_files "$CLAUDE_DIR/agents/expo" "*.md")
research_agents=$(count_files "$CLAUDE_DIR/agents/research" "*.md")
total_agents=$((ios_agents + nextjs_agents + expo_agents + research_agents))
echo "  Agents found: $total_agents (iOS:$ios_agents, Next.js:$nextjs_agents, Expo:$expo_agents, Research:$research_agents)"

echo ""
echo "Checking commands..."
check "$CLAUDE_DIR/commands/plan.md" "/plan command"
check "$CLAUDE_DIR/commands/orca.md" "/orca command"
check "$CLAUDE_DIR/commands/ios.md" "/ios command"
check "$CLAUDE_DIR/commands/nextjs.md" "/nextjs command"
check "$CLAUDE_DIR/commands/expo.md" "/expo command"
check "$CLAUDE_DIR/commands/research.md" "/research command"
check "$CLAUDE_DIR/commands/think.md" "/think command"
check "$CLAUDE_DIR/commands/challenge.md" "/challenge command"

commands_count=$(count_files "$CLAUDE_DIR/commands" "*.md")
echo "  Commands found: $commands_count"

echo ""
echo "Checking skills..."
check "$CLAUDE_DIR/skills/cursor-code-style" "cursor-code-style skill"
check "$CLAUDE_DIR/skills/lovable-pitfalls" "lovable-pitfalls skill"
check "$CLAUDE_DIR/skills/search-before-edit" "search-before-edit skill"
check "$CLAUDE_DIR/skills/debugging-first" "debugging-first skill"

skills_count=$(find "$CLAUDE_DIR/skills" -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
echo "  Skills found: $((skills_count - 1))"

echo ""
echo "Checking hooks..."
check "$CLAUDE_DIR/hooks/session-start.sh" "session-start hook"
check "$CLAUDE_DIR/hooks/session-end.sh" "session-end hook"
check "$CLAUDE_DIR/hooks/detect-project-type.sh" "detect-project-type hook"

echo ""
echo "Checking MCP configuration..."
if [ -f "$HOME/.claude.json" ]; then
    echo -e "  ${GREEN}[OK]${NC} ~/.claude.json exists"

    # Check for MCP servers using python
    python3 << 'PYTHON' 2>/dev/null || true
import json
import os

try:
    with open(os.path.expanduser("~/.claude.json"), 'r') as f:
        config = json.load(f)

    servers = config.get('mcpServers', {})
    expected = ['context7', 'sequential-thinking', 'project-context', 'playwright', 'chrome-devtools', 'XcodeBuildMCP']

    for server in expected:
        if server in servers:
            print(f"  \033[32m[OK]\033[0m MCP: {server}")
        else:
            print(f"  \033[33m[OPTIONAL]\033[0m MCP: {server} (not configured)")
except Exception as e:
    print(f"  \033[31m[ERROR]\033[0m Could not read ~/.claude.json: {e}")
PYTHON
else
    echo -e "  ${YELLOW}[OPTIONAL]${NC} ~/.claude.json not found"
    ((WARNINGS++))
fi

echo ""
echo "Checking ProjectContext MCP..."
check "$CLAUDE_DIR/mcp/project-context-server" "ProjectContext MCP directory"
check "$CLAUDE_DIR/mcp/project-context-server/dist/index.js" "ProjectContext MCP build" false

echo ""
echo "Checking documentation..."
check "$CLAUDE_DIR/docs/concepts" "Concept docs"
check "$CLAUDE_DIR/docs/pipelines" "Pipeline docs"
check "$CLAUDE_DIR/quick-reference/os2-architecture.md" "Architecture reference"
check "$CLAUDE_DIR/quick-reference/os2-commands.md" "Commands reference"
check "$CLAUDE_DIR/quick-reference/os2-agents.md" "Agents reference"

# Verify no excluded content
echo ""
echo "Verifying exclusions..."
exclusion_issues=0

if [ -d "$CLAUDE_DIR/agents/OBDN" ]; then
    echo -e "  ${RED}[ISSUE]${NC} agents/OBDN should not be installed"
    ((exclusion_issues++))
fi

if [ -d "$CLAUDE_DIR/agents/shopify" ]; then
    echo -e "  ${RED}[ISSUE]${NC} agents/shopify should not be installed"
    ((exclusion_issues++))
fi

if [ -f "$CLAUDE_DIR/commands/kg.md" ]; then
    echo -e "  ${RED}[ISSUE]${NC} commands/kg.md should not be installed"
    ((exclusion_issues++))
fi

if [ -f "$CLAUDE_DIR/commands/shopify.md" ]; then
    echo -e "  ${RED}[ISSUE]${NC} commands/shopify.md should not be installed"
    ((exclusion_issues++))
fi

if [ -d "$CLAUDE_DIR/skills/mm-comps" ] || [ -d "$CLAUDE_DIR/skills/mm-copy" ]; then
    echo -e "  ${RED}[ISSUE]${NC} mm-* skills should not be installed"
    ((exclusion_issues++))
fi

if [ -d "$CLAUDE_DIR/skills/uxscii-component-creator" ]; then
    echo -e "  ${RED}[ISSUE]${NC} uxscii-* skills should not be installed"
    ((exclusion_issues++))
fi

if [ -d "$CLAUDE_DIR/commands/_archive" ]; then
    echo -e "  ${RED}[ISSUE]${NC} commands/_archive should not be installed"
    ((exclusion_issues++))
fi

if [ $exclusion_issues -eq 0 ]; then
    echo -e "  ${GREEN}[OK]${NC} No excluded content found"
fi

# Summary
echo ""
echo "=============================="
echo "Validation Summary"
echo "=============================="
echo ""

if [ $ERRORS -eq 0 ] && [ $exclusion_issues -eq 0 ]; then
    echo -e "${GREEN}Installation is valid!${NC}"
    echo ""
    echo "  Agents: ~$total_agents"
    echo "  Commands: $commands_count"
    echo "  Skills: $((skills_count - 1))"
    echo ""
    echo "Run 'claude' to start using ORCA-OS"
else
    echo -e "${RED}Installation has issues:${NC}"
    echo "  Errors: $ERRORS"
    echo "  Exclusion issues: $exclusion_issues"
    echo "  Warnings: $WARNINGS"
    echo ""
    echo "Re-run the installer or check the documentation."
fi

exit $ERRORS
