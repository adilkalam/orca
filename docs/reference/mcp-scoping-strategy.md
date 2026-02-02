# MCP Scoping Strategy

## Problem

The Claude Code compaction system was leaving 135k tokens after compaction, giving only ~20k tokens of working space. This was untenable for OS 5.0 orchestration.

## Root Cause

MCP tool definitions are injected into EVERY system prompt. Heavy MCPs were adding massive overhead:

| MCP Server | Estimated Tokens | Tools |
|------------|-----------------|-------|
| puppeteer | ~2,000 | 8 browser tools |
| XcodeBuildMCP | ~5,000 | Xcode build tools |
| chrome-devtools | ~3,000 | Browser debugging |
| crawl4ai | ~2,000 | Web scraping |

## Solution: Project-Scoped MCPs

Move heavy/domain-specific MCPs to project-level `.mcp.json` files instead of global config.

### Essential MCPs (Global - ~/.claude.json)

Only these 4 MCPs remain in global config:

```json
{
  "mcpServers": {
    "context7": { ... },           // Documentation lookup (DISABLED by default)
    "sequential-thinking": { ... }, // Reasoning chains
    "project-context": { ... },    // Project memory/context
    "cognition-mcp": { ... }       // Structured reasoning notepad (Accept-Store-Echo)
  },
  "disabledMcpServers": ["context7"]
}
```

**Note:** `context7` is globally disabled by default to prevent unnecessary token usage. Enable per-project as needed.

### Project-Level Configurations

Each project has its own `.mcp.json` with only the MCPs it needs:

#### iOS Projects (`/peptidefox-ios`)
```json
{
  "mcpServers": {
    "XcodeBuildMCP": { "type": "stdio", "command": "npx", "args": ["-y", "xcodebuildmcp@latest"] }
  },
  "disabledMcpServers": ["context7"]
}
```

#### Web Projects
```json
{
  "mcpServers": {
    "chrome-devtools": { ... },
    "puppeteer": { ... },
    "crawl4ai": { ... }
  },
  "disabledMcpServers": ["context7", "crawl4ai"]
}
```

### Token Budget After Fix

| Component | Before | After |
|-----------|--------|-------|
| MCP Tools | ~80k | ~8k |
| System Prompt | ~135k | ~50k |
| Working Space | ~20k | ~105k |

## Implementation Checklist

1. Global config (`~/.claude.json`): Only 4 essential MCPs
2. `context7` disabled globally (enable per-project when needed)
3. Heavy MCPs moved to project `.mcp.json` files
4. Each project gets only the MCPs it needs
5. NEVER add heavy MCPs to ORCA-OS (config repo)

## Example Project Mappings

| Project Type | MCPs | Notes |
|--------------|------|-------|
| iOS Project | XcodeBuildMCP | iOS development |
| Web Project | chrome-devtools, puppeteer, crawl4ai | Web (crawl4ai disabled by default) |

## Commands

Check MCP status:
```bash
claude mcp list
```

Enable/disable MCP for current project:
```bash
claude mcp enable <server-name>
claude mcp disable <server-name>
```

## Troubleshooting

**Symptom:** High token usage after compaction
**Check:** Run `claude mcp list` and verify only expected MCPs are connected

**Symptom:** MCP not available in project
**Fix:** Add to project's `.mcp.json` and ensure not in `disabledMcpServers`
