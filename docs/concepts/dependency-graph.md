# Dependency Graph

**Version:** OS 5.0 | **Last Updated:** 2026-01-24

The dependency graph is the source of truth for ORCA-OS artifact relationships. It ensures documentation stays synchronized when lanes, agents, commands, or MCPs are added or modified.

## Location

**Source of truth:** `docs/reference/os-dependency-graph.yaml`

## Problem Solved

Without the dependency graph, documentation drifts from actual state:
- Agent counts become inaccurate (e.g., "85 agents" when there are 90)
- New commands aren't documented
- MCP configurations are inconsistent
- Lane documentation misses recent additions

The dependency graph solves this by:
1. Defining explicit relationships between artifacts
2. Providing impact rules for each change type
3. Enabling gates to validate documentation sync

## Artifact Types

### Lane
A domain pipeline containing agents, commands, and documentation.

```yaml
lane:
  contains: [agents, commands]
  documented_in:
    - docs/pipelines/{lane}-pipeline.md
    - docs/reference/phase-configs/{lane}-phase-config.yaml
    - quick-reference/ORCA-OS/ORCA-architecture.md
  may_use: [mcps]
```

### Agent
A specialized subagent with specific tools and responsibilities.

```yaml
agent:
  belongs_to: lane
  documented_in:
    - quick-reference/ORCA-OS/ORCA-agents.md
    - docs/pipelines/{lane}-pipeline.md
  requires: [mcps, skills]
```

### Command
A slash command entry point that orchestrates agents.

```yaml
command:
  orchestrates: agents
  documented_in:
    - quick-reference/ORCA-OS/ORCA-commands.md
    - quick-reference/workflows/{lane}.md
```

### MCP
A Model Context Protocol server providing tools to agents.

```yaml
mcp:
  scope: global | project
  used_by: [agents]
  documented_in:
    - quick-reference/ORCA-OS/ORCA-mcps.md
    - docs/reference/mcp-scoping-strategy.md
```

## Impact Rules

### Adding a New Lane

**Must create:**
- `commands/{lane}.md`
- `agents/{domain}/*.md` (at least orchestrator, builder, gate)
- `docs/pipelines/{lane}-pipeline.md`
- `docs/reference/phase-configs/{lane}-phase-config.yaml`
- `quick-reference/workflows/readme-{lane}.md`

**Must update:**
- `quick-reference/ORCA-OS/ORCA-agents.md` (new section + count)
- `quick-reference/ORCA-OS/ORCA-commands.md` (new entry)
- `quick-reference/ORCA-OS/ORCA-architecture.md` (lane table)
- `docs/reference/os-dependency-graph.yaml` (lane registry)

**If lane requires MCPs:**
- Create project `.mcp.json` files
- Update `~/.claude.json` project entries
- Update `quick-reference/ORCA-OS/ORCA-mcps.md`

### Adding a New Agent

**Must create:**
- `agents/{domain}/{agent-name}.md`

**Must update:**
- `quick-reference/ORCA-OS/ORCA-agents.md` (count + listing)
- `docs/pipelines/{lane}-pipeline.md` (agent table)
- `docs/reference/os-dependency-graph.yaml` (lane.agents array)

**Must verify:**
- Required MCPs exist and are configured
- Command references agent in Task delegation

### Adding a New Command

**Must create:**
- `commands/{command}.md`

**Must update:**
- `quick-reference/ORCA-OS/ORCA-commands.md`
- `quick-reference/workflows/readme-{related-lane}.md` (if applicable)
- `docs/reference/os-dependency-graph.yaml` (commands registry)

**Must verify:**
- Referenced agents exist
- Required tools are in allowed-tools

### Adding a New MCP

**If global:**
- Update `~/.claude.json` mcpServers
- Update `quick-reference/ORCA-OS/ORCA-mcps.md`

**If project-scoped:**
- Create/update project `.mcp.json`
- Update `~/.claude.json` enabledMcpjsonServers
- Update `quick-reference/ORCA-OS/ORCA-mcps.md`

**Must update:**
- `docs/reference/os-dependency-graph.yaml` (mcp_registry)
- Agent files that use the MCP

## Integration with OS-Dev Pipeline

The dependency graph is enforced through the OS-Dev pipeline:

### os-dev-architect
Reads the dependency graph and outputs:
- `files_to_create` - new files from impact rules
- `files_to_update` - existing files requiring updates
- `documentation_updates` - specific ORCA-*.md files
- `dependency_graph_update` - whether graph needs update

### os-dev-builder
Must sync documentation:
- Update ALL files in `documentation_updates`
- Update `os-dependency-graph.yaml` if adding artifacts
- Output `docs_synced` and `dependency_graph_updated`

### os-dev-standards-enforcer
Validates documentation sync:
- Missing doc sync = CRITICAL violation (-25 points)
- Missing graph update = HIGH violation (-15 points)
- Gate will BLOCK if documentation not synced

## CLAUDE.md Rule

```markdown
- **[rule-007]** Doc Sync: When adding/modifying agents, commands, or MCPs,
  update corresponding ORCA-*.md files AND os-dependency-graph.yaml
```

## Verification

To verify documentation is in sync:

```bash
# Check agent count
find agents -name "*.md" | wc -l

# Check command count
find commands -name "*.md" | wc -l

# Compare against documented counts in ORCA-agents.md
grep "Total Agents" quick-reference/ORCA-OS/ORCA-agents.md
```

## Example: Adding a New Agent

1. **Read graph:** `docs/reference/os-dependency-graph.yaml`
2. **Identify change type:** `agent_add`
3. **Create agent file:** `agents/ios/ios-new-specialist.md`
4. **Update ORCA-agents.md:** Increment iOS count, add to table
5. **Update pipeline doc:** Add to `docs/pipelines/ios-pipeline.md`
6. **Update graph:** Add to `lanes.ios.agents` array
7. **Gate validates:** All updates present = PASS

---

_See also: `docs/reference/os-dependency-graph.yaml` for the complete graph definition._
