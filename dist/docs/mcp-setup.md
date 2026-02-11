# ORCA-OS MCP Server Setup Guide

This guide covers the setup and configuration of MCP (Model Context Protocol) servers used by ORCA-OS.

## Automatically Configured MCPs

The installer automatically configures these MCP servers in `~/.claude.json`:

| MCP Server | Purpose | Package |
|------------|---------|---------|
| context7 | Up-to-date library documentation | `@upstash/context7-mcp` (npx) |
| sequential-thinking | Multi-step reasoning with revision | `@modelcontextprotocol/server-sequential-thinking` (npx) |
| cognition-mcp | Structured notepad for reasoning (38 operations) | Custom (bundled) |
| project-context | Project memory and semantic search | Custom (bundled) |

**Optional (prompted during install):**

| MCP Server | Purpose | Package |
|------------|---------|---------|
| playwright | Browser automation and testing | `@playwright/mcp` (npx) |
| puppeteer | Browser automation | `@anthropic-ai/puppeteer-mcp` (npx) |
| chrome-devtools | Chrome debugging and inspection | `chrome-devtools-mcp` (npx) |
| XcodeBuildMCP | iOS/macOS build automation | `xcodebuildmcp` (npx) |

Core MCPs are auto-configured. Optional MCPs require user confirmation during install.

---

## MCP Server Reference

### Context7 (Library Documentation)

Provides up-to-date documentation for any library directly in Claude's context.

**Tools:**
- `resolve-library-id` - Find a library by name
- `get-library-docs` - Fetch documentation for a specific library

**Example usage:**
```
# Claude will automatically use this when you ask about libraries
"How do I use React Server Components?"
→ Claude fetches latest Next.js/React docs via Context7
```

---

### Sequential Thinking

Enables multi-step reasoning with the ability to revise, branch, and backtrack.

**Tools:**
- `sequentialthinking` - Step-by-step reasoning with revision support

**When it's used:**
- Complex problem decomposition
- Planning with uncertainty
- Multi-step analysis requiring course correction

---

### Cognition MCP (Structured Reasoning)

A structured notepad for Claude's reasoning using the Accept-Store-Echo pattern. Provides 38 reasoning operations.

**Core Pattern:**
- **ACCEPT**: Claude provides structured thoughts
- **STORE**: MCP stores them unchanged
- **ECHO**: MCP returns them unchanged + session context

The MCP is a mirror - it never generates, suggests, enhances, or transforms content.

**Tools:**
- `cognition` - Single tool with multiple operations

**Operations (38 total):**

Core:
- `thought` - Sequential thinking steps with branching/revision
- `mental_model` - Apply mental models (first-principles, inversion, etc.)
- `debug` - Structured debugging approaches
- `decide` - Decision framework with options and criteria
- `meta` - Metacognitive monitoring and adjustments
- `systems` - Systems thinking maps
- `creative_thinking` - Brainstorming and ideation
- `visual_reasoning` - Spatial/diagram thinking

Collaborative:
- `collaborative_reasoning` - Multiple perspectives
- `socratic_method` - Question assumptions
- `structured_argumentation` - Formal arguments

Analysis:
- `research`, `analogical_reasoning`, `causal_analysis`, `statistical_reasoning`
- `simulation`, `optimization`, `ethical_analysis`, `visual_dashboard`
- `pdr_reasoning`, `custom_framework`, `code_execution`

Patterns:
- `tree_of_thought` - Branching exploration
- `beam_search` - Parallel path exploration
- `mcts` - Monte Carlo tree search
- `graph_of_thought` - Non-linear connections
- `orchestration_suggest` - Meta-pattern recommendation

Strategic:
- `ooda_loop` - Observe-Orient-Decide-Act cycles
- `ulysses_protocol` - Pre-commitment mechanisms

Session:
- `session_info`, `session_export`, `session_import`

**Usage:**
Used by `/think` command for persistent thought tracking.

---

### Project Context

ORCA's custom memory and context system.

**Tools:**
- `query_context` - Get relevant project context for a task
- `save_decision` - Log architectural decisions
- `save_standard` - Create standards from failures
- `save_task_history` - Record task completion
- `index_project` - Index a project for semantic search
- `reanalyze_project` - Rebuild project structure analysis

**Usage:**
Automatically invoked by orchestrators to load project context before any work.

---

### Playwright (Browser Automation)

Full browser automation for testing, screenshots, and interaction.

**Key Tools:**
- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Get accessibility tree (preferred over screenshots)
- `browser_click` - Click elements
- `browser_type` - Type text
- `browser_take_screenshot` - Capture screenshots

**Configuration options:**
- `--headless` - Run without visible browser
- `--caps vision` - Enable vision/screenshot capabilities

---

### Chrome DevTools

Debug and inspect Chrome browser instances.

**Key Tools:**
- `take_snapshot` - Get page accessibility tree
- `take_screenshot` - Capture page screenshots
- `click` - Click elements
- `fill` - Fill form fields
- `navigate_page` - Navigate to URLs
- `list_console_messages` - View console output
- `list_network_requests` - View network activity
- `performance_start_trace` - Start performance recording

**Usage:**
Works automatically when Chrome is open. The MCP connects to the active Chrome instance.

---

### XcodeBuildMCP (iOS/macOS Development)

Build, test, and deploy iOS/macOS applications.

**Key Tools:**
- `build_sim` - Build for simulator
- `build_device` - Build for physical device
- `test_sim` / `test_device` - Run tests
- `list_sims` - List available simulators
- `boot_sim` / `open_sim` - Manage simulators
- `screenshot` - Take simulator screenshots
- `describe_ui` - Get UI hierarchy for automation
- `tap` / `swipe` / `type_text` - UI interactions

**Requirements:**
- macOS with Xcode installed
- Valid Apple Developer account (for device deployment)

---

## Troubleshooting

### MCP Server Not Starting

```bash
# Check if npx can find the package
npx -y package-name --help

# Verify the path in ~/.claude.json is correct
cat ~/.claude.json | jq '.mcpServers'
```

### MCP Server Timeout

Set custom timeout:
```bash
export MCP_TIMEOUT=30000  # 30 seconds
```

### Missing Tools

If tools don't appear:
1. Restart Claude Code
2. Check `/mcp` command to see server status
3. Verify server configuration in `~/.claude.json`

### Debugging MCP Issues

Run Claude with MCP debug flag:
```bash
claude --mcp-debug
```

---

## Disabling MCPs Per-Project

In project's `.claude.json`:
```json
{
  "disabledMcpServers": ["XcodeBuildMCP", "playwright"]
}
```

Or toggle via `@` mention in chat:
```
@XcodeBuildMCP  (toggles on/off)
```

---

## Custom MCP Servers

You can add your own MCP servers. See:
- [MCP Specification](https://modelcontextprotocol.io/)
- [Building MCP Servers](https://docs.anthropic.com/en/docs/build-with-claude/mcp)
