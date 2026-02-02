# OS 5.0 MCP Reference

**Last Updated:** 2026-01-23
**Version:** OS 5.0

---

## MCP Scoping Strategy (OS 5.0)

MCPs are now project-scoped to reduce token bloat:

### Global MCPs (Always Available)
Core MCPs in `~/.claude.json` global mcpServers:
- `cognition-mcp` - Sequential thinking storage (accept-store-echo pattern)
- `project-context` - Project context queries
- `sequential-thinking` - Multi-step reasoning with revision
- `context7` - Library documentation (disabled by default)

### Project-Scoped MCPs
Heavy MCPs defined in project `.mcp.json` + enabled via `enabledMcpjsonServers`:

| Project | MCPs |
|---------|------|
| `/peptidefox-ios` | XcodeBuildMCP |
| `/obsidian-peptides` | chrome-devtools, puppeteer, crawl4ai |
| `/peptidefox` | chrome-devtools, puppeteer, crawl4ai |

---

## Global MCP Configurations

### cognition-mcp

Sequential thinking storage with accept-store-echo pattern.

```json
{
  "cognition-mcp": {
    "type": "stdio",
    "command": "node",
    "args": ["~/.claude/mcp/cognition-mcp/dist/cli.js"]
  }
}
```

**Tool:** `cognition` (single tool)

**Accept-Store-Echo Pattern:**
This MCP is a MIRROR - it stores and echoes, never generates content.
```
MCP receives: { thought: "X" }
MCP stores:   { thought: "X" }
MCP returns:  { thought: "X" }  <- UNCHANGED
```

**Operations (38 total):**

| Category | Operations |
|----------|------------|
| **Core (10)** | `thought`, `mental_model`, `debug`, `decide`, `meta`, `systems`, `creative_thinking`, `visual_reasoning`, `checkpoint`, `scientific_method` |
| **Collaborative (3)** | `collaborative_reasoning`, `socratic_method`, `structured_argumentation` |
| **Analysis (11)** | `research`, `analogical_reasoning`, `causal_analysis`, `statistical_reasoning`, `simulation`, `optimization`, `ethical_analysis`, `visual_dashboard`, `pdr_reasoning`, `custom_framework`, `code_execution` |
| **Patterns (5)** | `tree_of_thought`, `beam_search`, `mcts`, `graph_of_thought`, `orchestration_suggest` |
| **Strategic (2)** | `ooda_loop`, `ulysses_protocol` |
| **Notebook (4)** | `notebook_create`, `notebook_add_cell`, `notebook_run_cell`, `notebook_export` |
| **Session (3)** | `session_info`, `session_export`, `session_import` |

**Sequential Flow:**
- Claude makes MULTIPLE calls to build reasoning chains
- Session continuity via `sessionId` parameter
- Set `nextThoughtNeeded: false` to signal completion

**Capstone Pattern:**
Structured operations complete sequential thinking with substantive content - they are NOT standalone operations.

**Full documentation:** See `quick-reference/guide-think.md`

### project-context

Mandatory context provider for all agents.

```json
{
  "project-context": {
    "type": "stdio",
    "command": "node",
    "args": ["~/.claude/mcp/project-context-server/dist/index.js"]
  }
}
```

**Tools:**
- `query_context` - Get context bundle (returns pastDecisions, relevantFiles, standards)
- `save_decision` - Log decisions
- `save_standard` - Create standards
- `save_task_history` - Record task completion
- `recall` - Retrieve full archived tool output by ID (ORCA-Mem)

**Implementation (OS 5.0):**
- **Reads:** SQLite direct access to `workshop.db` via `better-sqlite3`
- **Writes:** Workshop CLI for schema migration compatibility
- **Symlink:** Auto-creates `.workshop -> .claude/memory` on macOS/Linux

See `docs/concepts/memory-systems.md` for full architecture.

**ORCA-Mem Integration:**
The `recall` tool works with the ORCA-Mem PostToolUse hook. When tool outputs exceed 4000 chars:
1. Hook truncates to HEAD (1500) + TAIL (500) chars
2. Full output archived at `~/.claude/archives/{date}/{id}.txt`
3. Truncation message includes: `[Full output: recall('id')]`
4. Use `recall` tool to retrieve full content when needed

Archives have 7-day retention (cleaned by `scripts/archive-cleanup.sh`).

### context7

Library documentation lookup.

```json
{
  "context7": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

**Tools:**
- `resolve-library-id` - Find library ID
- `get-library-docs` - Fetch documentation

**Note:** Disabled by default (in `disabledMcpServers`)

---

## Project-Scoped MCP Configurations

### XcodeBuildMCP (iOS)

iOS/macOS development automation.

```json
{
  "XcodeBuildMCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "xcodebuildmcp@latest"]
  }
}
```

**Used by:** ios-verification agent
**Projects:** /peptidefox-ios

### chrome-devtools (Web)

Live page inspection and debugging.

```json
{
  "chrome-devtools": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"]
  }
}
```

**Used by:** nextjs-design-reviewer, ios-ui-reviewer, expo-aesthetics-specialist
**Projects:** (project-specific configuration)

### puppeteer (Web)

Browser automation and visual testing. Simpler and more lightweight than Playwright.

```json
{
  "puppeteer": {
    "type": "stdio",
    "command": "node",
    "args": ["~/.claude/mcp/puppeteer-mcp-server/dist/index.js"]
  }
}
```

**Tools:**
- `puppeteer_connect_active_tab` - Connect to existing Chrome with remote debugging
- `puppeteer_navigate` - Navigate to URL
- `puppeteer_screenshot` - Take screenshot (with optional width/height)
- `puppeteer_click` - Click element by CSS selector
- `puppeteer_fill` - Fill input field
- `puppeteer_select` - Select dropdown option
- `puppeteer_hover` - Hover over element
- `puppeteer_evaluate` - Execute JavaScript in browser

**Used by:** nextjs-design-reviewer
**Projects:** /obsidian-peptides, /peptidefox

### crawl4ai (Research)

Web content extraction for research. Connects to local Crawl4AI server via SSE.

```json
{
  "crawl4ai": {
    "type": "sse",
    "url": "http://localhost:11235/mcp/sse"
  }
}
```

**Requires manual server start:**
```bash
crawl-server  # alias for ~/.crawl4ai-server/bin/python server.py
```

**Used by:** research-* agents, seo-* agents
**Projects:** Global (configured in ~/.claude.json)

---

## Lane-MCP Matrix

| Lane | MCPs Required |
|------|---------------|
| iOS | XcodeBuildMCP |
| Next.js | chrome-devtools, puppeteer |
| Django-React | (none) |
| Expo | (none) |
| Research | crawl4ai |
| SEO | ahrefs, crawl4ai |
| Data | (none) |
| Audit | cognition-mcp |
| OS-Dev | (none) |

---

## Configuration Files

### Project .mcp.json

Define available MCPs for a project:

```json
{
  "mcpServers": {
    "chrome-devtools": { ... },
    "puppeteer": { ... }
  }
}
```

### ~/.claude.json enabledMcpjsonServers

Enable project MCPs in global config:

```json
{
  "projects": {
    "/Users/yourname/project": {
      "enabledMcpjsonServers": ["chrome-devtools", "puppeteer"]
    }
  }
}
```

**Note:** `disabledMcpServers` only works in `~/.claude.json`, NOT in project `.mcp.json`

---

## Troubleshooting

### MCP Not Connecting
```bash
# Check global config
cat ~/.claude.json | jq '.mcpServers'

# Check project config
cat .mcp.json

# Test MCP manually
npx -y xcodebuildmcp@latest
```

### Project MCPs Not Loading
Check `enabledMcpjsonServers` in `~/.claude.json` for your project path.

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_MCP scoping: `docs/reference/mcp-scoping-strategy.md`_
_Last sync: 2026-01-23_
