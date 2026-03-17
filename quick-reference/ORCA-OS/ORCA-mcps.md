# OS 7.0 MCP Reference

**Last Updated:** 2026-03-16
**Version:** OS 7.0

---

## MCP Scoping Strategy (OS 7.0)

MCPs are now project-scoped to reduce token bloat:

### Global MCPs (Always Available)
Core MCPs in `~/.claude.json` global mcpServers (user-scoped):
- `cognition-mcp` - Sequential thinking storage (accept-store-echo pattern)
- `project-context` - Project context queries
- `crawl4ai` - Web content extraction (SSE, Docker at localhost:11235)
- `sequential-thinking` - Multi-step reasoning with revision
- `chrome-devtools` - Browser automation and visual QA (headless, isolated)
- `context7` - Library documentation (disabled by default)

### Project-Scoped MCPs
Heavy MCPs defined in project `.mcp.json` + enabled via `enabledMcpjsonServers`:

| Project | MCPs |
|---------|------|
| `/peptidefox-ios` | XcodeBuildMCP |
| `/obsidian-peptides` | chrome-devtools, puppeteer, crawl4ai, analytics-mcp, mcp-gsc |
| `/peptidefox` | chrome-devtools, puppeteer, crawl4ai, analytics-mcp, mcp-gsc |
| `/rvry` | analytics-mcp, mcp-gsc |

---

## Global MCP Configurations

### cognition-mcp

Sequential thinking storage with accept-store-echo pattern and protocol state management.
Session storage: `~/.orca-cognition/sessions/` (global, all sessions regardless of project).

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

**Accept-Store-Echo Pattern + Protocol State:**
This MCP stores and echoes content unchanged. Enhanced checkpoint operation manages protocol state (constraint tracking, gate evaluation, auto-persist at harvest) as free MCP-side computation.
```
MCP receives: { thought: "X" }
MCP stores:   { thought: "X" }
MCP returns:  { thought: "X" }  <- UNCHANGED

Checkpoint with protocol fields returns: { protocolState: { activeConstraints, gateStatus, blocked } }
```

**Operations (49 total):**

| Category | Operations |
|----------|------------|
| **Core (7)** | `thought`, `mental_model`, `list_mental_models`, `debug`, `decide`, `meta`, `systems` |
| **Extended Core (4)** | `creative_thinking`, `visual_reasoning`, `checkpoint`, `scientific_method` |
| **Collaborative (3)** | `collaborative_reasoning`, `socratic_method`, `structured_argumentation` |
| **Analysis (11)** | `research`, `analogical_reasoning`, `causal_analysis`, `statistical_reasoning`, `simulation`, `optimization`, `ethical_analysis`, `visual_dashboard`, `pdr_reasoning`, `custom_framework`, `code_execution` |
| **Patterns (5)** | `tree_of_thought`, `beam_search`, `mcts`, `graph_of_thought`, `orchestration_suggest` |
| **Orchestration (1)** | `blind_orchestrate` (agent delegation without context leakage) |
| **Strategic (2)** | `ooda_loop`, `ulysses_protocol` |
| **Notebook (4)** | `notebook_create`, `notebook_add_cell`, `notebook_run_cell`, `notebook_export` |
| **Audit (1)** | `audit` |
| **Session (3)** | `session_info`, `session_export`, `session_import` |
| **Stats (1)** | `reasoning_stats` |
| **Recording (7)** | `recording_status`, `recording_query`, `recording_checkpoint`, `recording_compare`, `recording_quality`, `recording_explain`, `recording_rewind` |

**Sequential Flow:**
- Claude makes MULTIPLE calls to build reasoning chains
- Session continuity via `sessionId` parameter
- Set `nextThoughtNeeded: false` to signal completion

**Capstone Pattern:**
Structured operations complete sequential thinking with substantive content - they are NOT standalone operations.

**Recording Operations (cognitive fusion with orca-record):**

The recording extension connects cognition-mcp to the orca-record recording layer, enabling queries that combine code changes with reasoning context.

| Operation | Purpose |
|-----------|---------|
| `recording_status` | Current session recording state (IDLE/ACTIVE/ACTIVE_COMMITTED/ENDED) |
| `recording_query` | Query sessions by date range, files touched, quality metrics |
| `recording_checkpoint` | Get checkpoint details including code state and cognitive context |
| `recording_compare` | Diff two checkpoints: code changes and reasoning chain changes |
| `recording_quality` | Session quality analytics: gate results, rewind rates, error patterns |
| `recording_explain` | Human-readable narrative of what happened, why, and how well |
| `recording_rewind` | Query rewind data from recording history |

These operations read from `.orca/recording.db` (per-project SQLite) and cross-reference with cognition-mcp session data.

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

**Implementation (OS 7.0):**
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

Browser automation and visual QA. **Canonical browser tool for ORCA-OS** (global, headless, isolated).

**Install globally:**
```bash
claude mcp add -s user chrome-devtools -- npx chrome-devtools-mcp@latest --headless=true --isolated=true
```

```json
{
  "chrome-devtools": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest", "--headless=true", "--isolated=true"]
  }
}
```

**Used by:** nextjs-design-reviewer
**Scope:** Global (user-level)

**puppeteer-mcp-server** -- Deprecated in OS 7.0. Use chrome-devtools-mcp instead.

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
**Scope:** Global (user-scoped), disabled per-project via `disabledMcpServers` where not needed

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
**Scope:** Global (user-level)

### bambu-3mf (3D Printing)

Programmatic Bambu Studio 3MF print settings manipulation and OrcaSlicer CLI analysis.
Reads and writes settings inside 3MF ZIP archives via JSZip. Runs headless slicing for
time/cost estimates. Enforces gcode key protection.

**Settings Tools (4):**
- `list_presets` - Scan ~/3D-Models/_presets/ for available filament and process presets
- `read_settings` - Extract settings from a 3MF file (excludes gcode blocks)
- `apply_preset` - Merge a preset into a 3MF at a specific filament slot
- `update_settings` - Surgical key-value override on a 3MF file

**Slicer Tools (4) -- require OrcaSlicer CLI:**
- `slice_analyze` - Run slicer on current settings for baseline time/cost/weight metrics
- `slice_compare` - Compare current settings against preset profiles via actual slicing
- `slice_batch` - Calculate batch production estimates for N units
- `read_orca_config` - Parse Orca_print.config XML metadata (no CLI needed)

**Safety:** 6 gcode keys are SACRED and never modified.
**Slicer:** OrcaSlicer CLI auto-discovered at /Applications/OrcaSlicer.app or via ORCASLICER_PATH env var. Tools return helpful install instructions when CLI is absent.
**Source:** `mcp/bambu-3mf/`
**Scope:** Project-scoped (3D-Models)

```json
{
  "bambu-3mf": {
    "type": "stdio",
    "command": "node",
    "args": ["/Users/adilkalam/.claude/mcp/bambu-3mf/dist/index.js"]
  }
}
```

### openscad-mcp (3D Rendering - Experimental)

OpenSCAD 3D rendering and STL analysis capabilities for AI assistants. Provides tools for rendering OpenSCAD models, analyzing STL geometry, and comparing STL files.

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
- `check_openscad` - Verify OpenSCAD installation
- `analyze_stl` - Extract dimensions, volume, cross-sections, and wall thickness from STL files
- `compare_stl` - Compare two STL files with boolean difference via manifold3d

**Source:** [github.com/quellant/openscad-mcp](https://github.com/quellant/openscad-mcp)
**Status:** Experimental (project-scoped, no dedicated lane)
**Location:** `mcp/openscad-mcp/`

### analytics-mcp (SEO/Analytics)

Google Analytics 4 data access for SEO effectiveness reporting. Authenticates via service account key file.

```json
{
  "analytics-mcp": {
    "command": "pipx",
    "args": ["run", "analytics-mcp"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "/Users/adilkalam/.config/google/seo-service-account.json",
      "GOOGLE_PROJECT_ID": "stream-391021"
    }
  }
}
```

**Auth Setup (Service Account):**
1. GCP Console -> Enable 3 APIs: Analytics Admin API, Analytics Data API, Search Console API
2. Create a service account (IAM -> Service Accounts -> Create)
3. Download the JSON key file to a secure location (e.g., `~/.config/google/seo-service-account.json`)
4. In GA4 Admin -> Property Access Management -> add the service account email as Editor
5. `pipx` installed (`brew install pipx && pipx ensurepath`)

**Tools (6):**
- `run_report` - Run GA4 reports (sessions, users, engagement, conversions)
- `run_realtime_report` - Real-time GA4 data
- `get_account_summaries` - List GA4 properties and accounts
- `get_property_details` - GA4 property metadata
- `get_custom_dimensions_and_metrics` - Custom GA4 dimensions/metrics
- `list_google_ads_links` - Google Ads links for the property

**Used by:** seo-optimizer (audit mode + auto-pull during optimization)
**Projects:** peptidefox, obsidian-peptides, rvry (project-scoped via .mcp.json)
**Scope:** Project-scoped only (configured in each project's `.mcp.json`, NOT global)

### mcp-gsc (SEO/Search Console)

Google Search Console data for search query performance. npm package is `mcp-server-gsc`, but the key in `.mcp.json` is `"mcp-gsc"` (so tool names are `mcp__mcp-gsc__*`). Authenticates via service account key file. Very token-efficient (~500 tokens for a comprehensive audit).

```json
{
  "mcp-gsc": {
    "command": "npx",
    "args": ["-y", "mcp-server-gsc"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "/Users/adilkalam/.config/google/seo-service-account.json"
    }
  }
}
```

**Auth Setup (Service Account):**
1. Same service account as analytics-mcp (shared key file)
2. In Google Search Console -> Settings -> Users and permissions -> add the service account email as Full user
3. The service account needs Search Console API enabled in GCP (same step as analytics-mcp)

**Tools (4):**
- `list_sitemaps` - List all sitemaps for a Search Console property
- `get_sitemap` - Get details for a specific sitemap
- `enhanced_search_analytics` - Search performance data with built-in quick wins detection (queries, impressions, clicks, CTR, position)
- `index_inspect` - Inspect URL indexing status

**Used by:** seo-optimizer (audit mode + auto-pull), seo-research-specialist (pre-research check)
**Projects:** peptidefox, obsidian-peptides, rvry (project-scoped via .mcp.json)
**Scope:** Project-scoped only (configured in each project's `.mcp.json`, NOT global)

**annotated-mcp** -- Removed in OS 7.0.

### mcp-send-email (Email Integration)

Resend-based email sending MCP for transactional and broadcast emails.

```json
{
  "mcp-send-email": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "mcp-send-email"]
  }
}
```

**Source:** `mcp/mcp-send-email/`
**Scope:** Project-scoped

---

## Lane-MCP Matrix

| Lane | MCPs Required (beyond globals) |
|------|---------------|
| iOS | XcodeBuildMCP |
| Next.js | chrome-devtools (global) |
| Django-React | (none) |
| Expo | (none) |
| Research | crawl4ai (global) |
| SEO | ahrefs, crawl4ai (global), cognition-mcp (--think, global), analytics-mcp, mcp-gsc |
| RVRY | analytics-mcp, mcp-gsc |
| Data | (none) |
| Audit | cognition-mcp (global) |
| Typography | (none) |
| OS-Dev | (none) |
| orca-pipeline | (none) |
| 3D Printing | bambu-3mf, openscad-mcp |
| Creative Design | adb-mcp (adobe-photoshop, adobe-illustrator) |

---

## Configuration Files

### Project .mcp.json

Define available MCPs for a project:

```json
{
  "mcpServers": {
    "chrome-devtools": { ... },
  }
}
```

### ~/.claude.json enabledMcpjsonServers

Enable project MCPs in global config:

```json
{
  "projects": {
    "/Users/yourname/project": {
      "enabledMcpjsonServers": ["chrome-devtools"]
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
_Last sync: 2026-03-16_
