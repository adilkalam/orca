# MCP Project Configuration Reference

How to configure project-specific MCPs in Claude Code.

## File Structure

```
~/your-project/
├── .mcp.json                    # Define available MCPs
└── .claude/
    └── settings.local.json      # Enable/disable MCPs from .mcp.json
```

## Step 1: Define MCPs in `.mcp.json`

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "my-mcp": {
      "type": "stdio",
      "command": "uv",
      "args": ["run", "--directory", "/path/to/mcp", "python", "-m", "my_mcp.server"]
    }
  }
}
```

### Common Patterns

**uvx (published package):**
```json
"alpaca": {
  "type": "stdio",
  "command": "uvx",
  "args": ["alpaca-mcp-server", "serve"],
  "env": {
    "ALPACA_API_KEY": "xxx",
    "ALPACA_SECRET_KEY": "xxx"
  }
}
```

**uv run (local project):**
```json
"my-local-mcp": {
  "type": "stdio",
  "command": "uv",
  "args": ["run", "--directory", "/path/to/mcp/my-mcp-server", "my-mcp", "API_KEY"]
}
```

**Python module with transport flag:**
```json
"my-python-mcp": {
  "type": "stdio",
  "command": "uv",
  "args": [
    "run",
    "--directory",
    "/path/to/mcp/my-mcp-project",
    "python",
    "-m",
    "my_mcp.server",
    "--transport",
    "stdio"
  ]
}
```

## Step 2: Enable MCPs in `settings.local.json`

Create `.claude/settings.local.json` in your project:

```json
{
  "enabledMcpjsonServers": [
    "my-mcp",
    "my-local-mcp",
    "my-python-mcp"
  ]
}
```

**CRITICAL:** MCPs defined in `.mcp.json` are NOT automatically enabled. You MUST add them to `enabledMcpjsonServers` or they won't load.

**Alternative:** `enabledMcpjsonServers` can also be placed in `~/.claude.json` under a project-specific key:

```json
{
  "projects": {
    "/Users/yourname/project": {
      "enabledMcpjsonServers": ["my-mcp", "my-local-mcp"]
    }
  }
}
```

See `quick-reference/ORCA-OS/ORCA-mcps.md` for the project mapping approach used by ORCA-OS.

## Step 3: Restart Claude

After changing either file, restart your Claude Code session in that project directory.

Verify with `/mcp` command - all enabled MCPs should show as connected.

## Troubleshooting

### MCP not showing up
1. Check `.mcp.json` syntax (valid JSON?)
2. Check `settings.local.json` has the MCP name in `enabledMcpjsonServers`
3. Restart Claude session

### MCP shows but won't connect
1. Test the command manually in terminal
2. Check paths are absolute, not relative
3. Check environment variables if required

### Global vs Project MCPs

| Location | Scope | File |
|----------|-------|------|
| `~/.claude.json` | Global (all projects) | `projects.{path}.mcpServers` |
| `project/.mcp.json` | Project only | Root of project |
| `project/.claude/settings.local.json` | Project whitelist | Enables from `.mcp.json` |

## Example Project Structure

```
~/my-project/
├── .mcp.json
│   └── defines: my-mcp, my-local-mcp, puppeteer
└── .claude/
    └── settings.local.json
        └── enabledMcpjsonServers: ["my-mcp", "my-local-mcp", "puppeteer"]
```

---
_Last updated: 2026-02-07_
