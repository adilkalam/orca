# Contributing to ORCA-OS

Thank you for your interest in contributing to ORCA-OS.

## Development Setup

1. Clone the repository
2. ORCA-OS deploys to `~/.claude/` - all development happens in this repo
3. Changes are auto-deployed via hooks when editing deployable directories

## Repository Structure

- `agents/` - Agent definitions (117 agents across 12 lanes)
- `commands/` - Slash command specifications
- `docs/` - Pipeline and reference documentation
- `hooks/` - Session lifecycle hooks
- `mcp/` - MCP server configurations
- `scripts/` - Helper scripts
- `quick-reference/` - Quick reference documentation

## Guidelines

### Agent Format

```yaml
# Tools MUST be comma-separated strings, NOT YAML arrays
tools: Read, Edit, Grep, Glob, Bash

# Never specify model - Opus 4.5 is default
```

### File Locations

- All orchestration artifacts go in `.claude/`
- Never create files in repository root
- Working files go in `.claude/orchestration/temp/`

### Documentation Sync

When modifying agents, commands, or MCPs:
1. Update the primary file
2. Update `docs/reference/os-dependency-graph.yaml`
3. Update corresponding `quick-reference/ORCA-OS/ORCA-*.md`

### Deployment

- NEVER deploy `_archive/` or `deprecated/` directories
- Deploy to `~/.claude/{subdir}/`, never to `~/.claude/` root
- Auto-deploy hook handles most deployments

## Code Style

- Shell scripts use `#!/usr/bin/env bash`
- Functions under 50 lines
- Guard clauses over nested conditions
- Meaningful error messages

## Testing

Run basic validation before submitting:
```bash
# Check YAML syntax
python3 -c "import yaml; yaml.safe_load(open('docs/reference/os-dependency-graph.yaml'))"

# Verify agent counts match
grep -c "\.md$" agents/**/*.md
```

## Questions

Open an issue for questions or discussions.
