#!/bin/bash
# ORCA-OS Installation Validator
# Verifies the installation is complete and correct

# Don't use set -e as arithmetic expressions can return non-zero

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
            ERRORS=$((ERRORS + 1))
        else
            echo -e "  ${YELLOW}[OPTIONAL]${NC} $desc"
            WARNINGS=$((WARNINGS + 1))
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
check "$CLAUDE_DIR/agents/nextjs" "Next.js agents"
check "$CLAUDE_DIR/agents/dev" "Cross-cutting agents"
check "$CLAUDE_DIR/agents/expo" "Expo agents"
check "$CLAUDE_DIR/agents/django-react" "Django-React agents"
check "$CLAUDE_DIR/agents/os-dev" "OS-Dev agents"
check "$CLAUDE_DIR/agents/research" "Research agents"
check "$CLAUDE_DIR/agents/seo" "SEO agents"
check "$CLAUDE_DIR/agents/data" "Data agents"
check "$CLAUDE_DIR/agents/audit" "Audit agents"
check "$CLAUDE_DIR/agents/shopify" "Shopify agents"
check "$CLAUDE_DIR/agents/kg" "KG agents"
check "$CLAUDE_DIR/agents/typography" "Typography agents"

# Count all agents
total_agents=0
for domain_dir in "$CLAUDE_DIR/agents/"*/; do
    count=$(count_files "$domain_dir" "*.md")
    total_agents=$((total_agents + count))
done
echo "  Agents found: $total_agents"

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
check "$CLAUDE_DIR/hooks/post-tool-use.sh" "post-tool-use hook"

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
    core = ['context7', 'sequential-thinking', 'project-context', 'cognition-mcp']
    optional = ['crawl4ai', 'playwright', 'puppeteer', 'chrome-devtools', 'XcodeBuildMCP']

    print("  Core MCP servers:")
    for server in core:
        if server in servers:
            print(f"    \033[32m[OK]\033[0m {server}")
        else:
            print(f"    \033[31m[MISSING]\033[0m {server}")

    print("  Optional MCP servers:")
    for server in optional:
        if server in servers:
            print(f"    \033[32m[OK]\033[0m {server}")
        else:
            print(f"    \033[33m[--]\033[0m {server}")
except Exception as e:
    print(f"  \033[31m[ERROR]\033[0m Could not read ~/.claude.json: {e}")
PYTHON
else
    echo -e "  ${YELLOW}[OPTIONAL]${NC} ~/.claude.json not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "Checking MCP server installations..."

# Test ProjectContext MCP
echo "  Testing ProjectContext MCP..."
if [ -f "$CLAUDE_DIR/mcp/project-context-server/dist/index.js" ]; then
    if [ -d "$CLAUDE_DIR/mcp/project-context-server/node_modules" ]; then
        # Actually test the server
        cd "$CLAUDE_DIR/mcp/project-context-server"
        result=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | timeout 5 node dist/index.js 2>&1)
        if echo "$result" | grep -q '"protocolVersion"'; then
            echo -e "    ${GREEN}[OK]${NC} ProjectContext MCP works"
        else
            echo -e "    ${RED}[ERROR]${NC} ProjectContext MCP failed to respond"
            echo "    Output: $(echo "$result" | head -1)"
            ERRORS=$((ERRORS + 1))
        fi
        cd - > /dev/null 2>&1
    else
        echo -e "    ${RED}[ERROR]${NC} node_modules missing - run: cd ~/.claude/mcp/project-context-server && npm install"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "    ${RED}[ERROR]${NC} dist/index.js missing - MCP not built"
    ERRORS=$((ERRORS + 1))
fi

# Test Cognition MCP
echo "  Testing Cognition MCP..."
if [ -f "$CLAUDE_DIR/mcp/cognition-mcp/dist/index.js" ]; then
    if [ -d "$CLAUDE_DIR/mcp/cognition-mcp/node_modules" ]; then
        cd "$CLAUDE_DIR/mcp/cognition-mcp"
        result=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | timeout 5 node dist/index.js 2>&1)
        if echo "$result" | grep -q '"protocolVersion"'; then
            echo -e "    ${GREEN}[OK]${NC} Cognition MCP works"
        else
            echo -e "    ${RED}[ERROR]${NC} Cognition MCP failed to respond"
            echo "    Output: $(echo "$result" | head -1)"
            ERRORS=$((ERRORS + 1))
        fi
        cd - > /dev/null 2>&1
    else
        echo -e "    ${RED}[ERROR]${NC} node_modules missing - run: cd ~/.claude/mcp/cognition-mcp && npm install"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "    ${RED}[ERROR]${NC} dist/index.js missing - MCP not built"
    ERRORS=$((ERRORS + 1))
fi

# Crawl4AI - user installs separately
echo "  Crawl4AI MCP (required for /research, /seo, /orca-pipeline)..."
echo -e "    ${YELLOW}[INFO]${NC} Install separately: https://docs.crawl4ai.com/core/installation/"

echo ""
echo "Checking documentation..."
check "$CLAUDE_DIR/docs/concepts" "Concept docs"
check "$CLAUDE_DIR/docs/pipelines" "Pipeline docs"
check "$CLAUDE_DIR/quick-reference/ORCA-OS" "ORCA-OS quick reference"

# Verify no excluded content
echo ""
echo "Verifying exclusions..."
exclusion_issues=0

if [ -d "$CLAUDE_DIR/agents/OBDN" ]; then
    echo -e "  ${RED}[ISSUE]${NC} agents/OBDN should not be installed"
    exclusion_issues=$((exclusion_issues + 1))
fi

if [ -d "$CLAUDE_DIR/skills/mm-comps" ] || [ -d "$CLAUDE_DIR/skills/mm-copy" ]; then
    echo -e "  ${RED}[ISSUE]${NC} mm-* skills should not be installed"
    exclusion_issues=$((exclusion_issues + 1))
fi

if [ -d "$CLAUDE_DIR/skills/uxscii-component-creator" ]; then
    echo -e "  ${RED}[ISSUE]${NC} uxscii-* skills should not be installed"
    exclusion_issues=$((exclusion_issues + 1))
fi

if [ -d "$CLAUDE_DIR/commands/_archive" ]; then
    echo -e "  ${RED}[ISSUE]${NC} commands/_archive should not be installed"
    exclusion_issues=$((exclusion_issues + 1))
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
