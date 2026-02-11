# OS 5.2 MCP Reference

**Last Updated:** 2026-02-07
**Version:** OS 5.2

---

## MCP Scoping Strategy (OS 5.2)

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
    "args": ["~/.claude/mcp/cognition-mcp/dist/index.js"]
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

**Operations (41 total):**

| Category | Operations |
|----------|------------|
| **Core (7)** | `thought`, `mental_model`, `list_mental_models`, `debug`, `decide`, `meta`, `systems` |
| **Extended Core (4)** | `creative_thinking`, `visual_reasoning`, `checkpoint`, `scientific_method` |
| **Collaborative (3)** | `collaborative_reasoning`, `socratic_method`, `structured_argumentation` |
| **Analysis (11)** | `research`, `analogical_reasoning`, `causal_analysis`, `statistical_reasoning`, `simulation`, `optimization`, `ethical_analysis`, `visual_dashboard`, `pdr_reasoning`, `custom_framework`, `code_execution` |
| **Patterns (5)** | `tree_of_thought`, `beam_search`, `mcts`, `graph_of_thought`, `orchestration_suggest` |
| **Strategic (2)** | `ooda_loop`, `ulysses_protocol` |
| **Notebook (4)** | `notebook_create`, `notebook_add_cell`, `notebook_run_cell`, `notebook_export` |
| **Audit (1)** | `audit` |
| **Session (3)** | `session_info`, `session_export`, `session_import` |
| **Stats (1)** | `reasoning_stats` |

**Sequential Flow:**
- Claude makes MULTIPLE calls to build reasoning chains
- Session continuity via `sessionId` parameter
- Set `nextThoughtNeeded: false` to signal completion

**Capstone Pattern:**
Structured operations complete sequential thinking with substantive content - they are NOT standalone operations.

**Full documentation:** See `quick-reference/cognition.md`

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
- `index_project` - Index project files for context analysis
- `reanalyze_project` - Re-analyze project after changes
- `recall` - Retrieve full archived tool output by ID (ORCA-Mem)

**Implementation (OS 5.2):**
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
**Projects:** Project-scoped (configured in project `.mcp.json` + `enabledMcpjsonServers`)

### ahrefs (SEO)

Keyword research and SERP intelligence for the SEO content pipeline. npx-based MCP that launches externally (not from the `mcp/` directory).

```json
{
  "ahrefs": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "ahrefs-mcp"]
  }
}
```

**Tools:**
- `keywords_explorer_overview` - Keyword volume, difficulty, CPC, traffic potential
- `keywords_explorer_related_terms` - LSI keywords, "also rank for" terms
- `serp_overview_serp_overview` - Top 10 SERP results, features, PAA

**Used by:** seo-research-specialist, seo-optimizer
**Projects:** Project-scoped (configured in project `.mcp.json` + `enabledMcpjsonServers`)

### adb-mcp (Adobe Creative Suite)

AI control of Adobe Photoshop and Illustrator via MCP protocol. Python-based MCP server communicates through a Node proxy to UXP plugins.

```json
"adobe-photoshop": {
  "type": "stdio",
  "command": "/Users/adilkalam/ORCA-OS/mcp/adb-mcp/mcp/run-ps-mcp.sh",
  "args": [],
  "env": {}
},
"adobe-illustrator": {
  "type": "stdio",
  "command": "/Users/adilkalam/ORCA-OS/mcp/adb-mcp/mcp/run-ai-mcp.sh",
  "args": [],
  "env": {}
}
```

**Note:** Each Adobe app has its own MCP server entry. The shell scripts handle `uv` environment setup. See `docs/reference/adobe-mcp-setup.md` for full configuration details.

**Installer:** Available as an optional MCP during `dist/install.sh`. The installer clones the adb-mcp repo, generates run scripts with correct paths, and configures `~/.claude.json`.

**Architecture:** AI <-> MCP Server (Python/stdio) <-> Proxy Server (Node/WebSocket) <-> Adobe Plugin <-> Adobe App

**Requires:**
- Adobe Photoshop 26.0+ or Adobe Illustrator 29.0+
- Adobe UXP Developer Tool (via Creative Cloud)
- Node proxy server running (`adb-proxy-socket`)
- UXP plugin loaded in target Adobe app

**Tools (Photoshop):** Document management, layer operations, selections, filters, effects, text, shapes, colors, transforms, blend modes, masks, smart objects, batch operations

**Tools (Illustrator):** execute_extend_script, get_documents, get_active_document_info, export_png, open_file

**Source:** [github.com/mikechambers/adb-mcp](https://github.com/mikechambers/adb-mcp)
**Used by:** (project-specific configuration)
**Projects:** (project-specific configuration)

### openscad-mcp (3D Rendering - Experimental)

OpenSCAD 3D rendering capabilities for AI assistants. Provides tools for single and multi-view rendering of OpenSCAD models.

```json
{
  "openscad": {
    "type": "stdio",
    "command": "uv",
    "args": ["run", "--with", "git+https://github.com/quellant/openscad-mcp.git", "openscad-mcp"],
    "env": {
      "OPENSCAD_PATH": "/usr/bin/openscad"
    }
  }
}
```

**Tools:**
- `render_single` - Render a single view of an OpenSCAD model
- `render_perspectives` - Render multiple perspective views
- `check_openscad` - Verify OpenSCAD installation

**Source:** [github.com/quellant/openscad-mcp](https://github.com/quellant/openscad-mcp)
**Status:** Experimental (project-scoped, no dedicated lane)
**Location:** `mcp/openscad-mcp/`

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
| Typography | (none) |
| OS-Dev | (none) |
| orca-pipeline | (none) |

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
_Last sync: 2026-02-09_
