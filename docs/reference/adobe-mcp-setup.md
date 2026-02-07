# Adobe MCP Setup Reference

MCP servers for AI control of Adobe Creative Suite applications via the [adb-mcp](https://github.com/mikechambers/adb-mcp) project.

**Location:** `mcp/adb-mcp/`
**Source:** [github.com/mikechambers/adb-mcp](https://github.com/mikechambers/adb-mcp) (MIT License)

---

## Architecture

```
Claude Code <-> MCP Server (Python/stdio) <-> Proxy Server (Node/WebSocket) <-> Adobe Plugin <-> Adobe App
```

All apps share a single proxy server on `localhost:3001`. Each app has its own MCP server and plugin.

| App | MCP Server | Plugin Type | Plugin Location |
|-----|-----------|-------------|-----------------|
| Photoshop | `ps-mcp.py` | UXP | `uxp/ps/` |
| Illustrator | `ai-mcp.py` | CEP | `cep/com.mikechambers.ai/` |
| Premiere Pro | `pr-mcp.py` | UXP | `uxp/pr/` |
| After Effects | `ae-mcp.py` | CEP | `cep/com.mikechambers.ae/` |
| InDesign | `id-mcp.py` | UXP | `uxp/id/` |

---

## Prerequisites

- Python 3 + [uv](https://docs.astral.sh/uv/)
- Node.js (for proxy server)
- Adobe UXP Developer Tools (for Photoshop/Premiere/InDesign plugins)
- Adobe Creative Suite apps (Photoshop 26.0+, Illustrator 28.0+)

---

## Startup Sequence

Every session requires these three things running:

### 1. Start the Proxy Server

```bash
cd /Users/adilkalam/ORCA-OS/mcp/adb-mcp/adb-proxy-socket && node proxy.js
```

Keep this terminal open. One instance serves all Adobe apps.

### 2. Launch the Adobe App and Connect the Plugin

**Photoshop (UXP):**
1. Open UXP Developer Tools (from Creative Cloud)
2. File > Add Plugin > select `mcp/adb-mcp/uxp/ps/manifest.json`
3. Click Load
4. In Photoshop: Plugins > Photoshop MCP Agent > click Connect

**Illustrator (CEP):**
1. Open Illustrator with a file (plugin won't launch without one)
2. Window > Extensions > Illustrator MCP Agent
3. Click Connect

**Premiere Pro (UXP):**
1. Open UXP Developer Tools
2. File > Add Plugin > select `mcp/adb-mcp/uxp/pr/manifest.json`
3. Click Load
4. In Premiere: Window > UXP Plugins > Premiere MCP Agent > click Connect

### 3. Start Claude Code

MCP servers are configured in `~/.claude.json` and start automatically with Claude Code.

---

## Claude Code Configuration

In `~/.claude.json` under `mcpServers`:

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

These are global MCP servers (available in all projects).

---

## Plugin Installation Details

### UXP Plugins (Photoshop, Premiere, InDesign)

Loaded via UXP Developer Tools each time the app starts. Enable developer mode first:

**Photoshop:** Settings > Plugins > Enable Developer Mode > restart

### CEP Plugins (Illustrator, After Effects)

Installed via symlink (persistent across restarts):

```bash
# Create extensions directory
mkdir -p ~/Library/Application\ Support/Adobe/CEP/extensions

# Illustrator
ln -s /Users/adilkalam/ORCA-OS/mcp/adb-mcp/cep/com.mikechambers.ai \
  ~/Library/Application\ Support/Adobe/CEP/extensions/com.mikechambers.ai

# After Effects
ln -s /Users/adilkalam/ORCA-OS/mcp/adb-mcp/cep/com.mikechambers.ae \
  ~/Library/Application\ Support/Adobe/CEP/extensions/com.mikechambers.ae
```

**Required:** Enable unsigned CEP extensions:

```bash
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```

Restart the Adobe app after running this command.

---

## Tool Inventory

### Photoshop (62 tools)

Full creative control including Firefly generative AI.

| Category | Tools |
|----------|-------|
| Document | create, open, save, save_as, duplicate, crop, get_info, get_image |
| Layers | create_pixel, create_text, delete, duplicate, move, group, flatten, rename, get_layers, get_bounds, get_image |
| Selection | rectangle, ellipse, polygon, subject, sky, invert, clear |
| Transform | scale, rotate, flip, translate, align |
| Generation | generate_image (Firefly), generative_fill (Firefly) |
| Adjustments | brightness/contrast, color_balance, vibrance, black_and_white |
| Effects | gaussian_blur, motion_blur, drop_shadow, stroke, gradient |
| Layer Props | visibility, blend_mode, opacity, fill_opacity, clipping_mask |
| Masks | add_from_selection, remove |
| Clipboard | copy, copy_merged, cut, paste |
| Other | remove_background, harmonize, rasterize, place_image, fill_selection, delete_selection |

### Illustrator (5 tools)

Focused on document management and ExtendScript execution.

| Tool | Description |
|------|-------------|
| `get_documents` | List all open documents |
| `get_active_document_info` | Get active document details |
| `open_file` | Open an .ai file |
| `export_png` | Export active document as PNG (with scale, transparency, matte options) |
| `execute_extend_script` | Run arbitrary ExtendScript code (full Illustrator scripting API access) |

The `execute_extend_script` tool gives the LLM access to the full Illustrator scripting API, making it effectively unlimited in capability.

### Premiere Pro (26 tools)

Timeline, clip, and sequence management.

### After Effects (1 tool)

ExtendScript execution (similar to Illustrator).

### InDesign (1 tool)

ExtendScript execution.

---

## Troubleshooting

**Blank CEP panel:** Enable unsigned extensions with `defaults write com.adobe.CSXS.12 PlayerDebugMode 1` and restart the app.

**Plugin won't connect:** Make sure the proxy server is running. Check the proxy terminal for connection messages like `Client registered for application: photoshop`.

**MCP server errors in Claude Code:** Ensure `uv` is installed and accessible at `/Users/adilkalam/.local/bin/uv`. Check the run script paths point to the correct directory.

**UXP plugin needs reload:** UXP plugins must be reloaded via UXP Developer Tools each time Photoshop/Premiere/InDesign restarts.

**Slow responses:** Start a new Claude Code conversation to reduce context size. Check if AI provider servers are under load.

---

_Source: [github.com/mikechambers/adb-mcp](https://github.com/mikechambers/adb-mcp) | Last updated: 2026-02-06_
