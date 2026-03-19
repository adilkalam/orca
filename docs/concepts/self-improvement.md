# Self-Improvement

**Version:** OS 7.0 | **Last Updated:** 2026-03-18

The self-improvement system is a closed-loop learning mechanism. Gate failures produce standards. Standards prevent future failures. The loop is automatic -- no human intervention required after the initial infrastructure is in place.

## The Learning Loop

```
Gate detects failure (ERROR or BLOCK)
    |
    v
Gate emits VIOLATIONS_JSON block in output
    |
    v
Orchestrator parses VIOLATIONS_JSON
    |
    v
Orchestrator spawns standards-persistence-agent (fire-and-forget)
    |
    v
standards-persistence-agent calls save_standard() for each violation
    |
    v
Standard stored in Workshop DB as gotcha entry
    |
    v
Next task: orchestrator calls query_context(domain, task)
    |
    v
queryStandards() reads from Workshop DB, parses stored standards
    |
    v
ContextBundle.relatedStandards populated
    |
    v
Orchestrator injects "ACTIVE STANDARDS" into builder delegation prompt
    |
    v
Builder applies standards, avoids repeating the failure
```

The loop is genuine feedback: failures create constraints, constraints prevent future failures.

## Architecture

### The Write Path

Gate agents detect violations during quality checks. When a gate returns ERROR or BLOCK, it emits a structured `VIOLATIONS_JSON` block:

```json
<!-- VIOLATIONS_JSON
[
  {
    "rule": "Check deployment target before using iOS 16+ APIs",
    "what_happened": "NavigationStack used without iOS 16 deployment check",
    "cost": "Gate failed, required manual fix",
    "domain": "ios"
  }
]
-->
```

The orchestrator (light or grand-architect) detects this block and spawns the `standards-persistence-agent` as a background task. The agent:

1. Parses the VIOLATIONS_JSON
2. Deduplicates against existing standards (calls `query_context` first)
3. Calls `save_standard()` for each new violation

The `save_standard()` call goes through Workshop CLI's `saveGotcha()`, which flattens the 4 fields into a single content string:

```
[ios] Check deployment target before using iOS 16+ APIs (Cost: Gate failed, required manual fix. Cause: NavigationStack used without iOS 16 deployment check)
```

This flattened format is stored in the Workshop SQLite database as a `gotcha` entry.

### The Read Path

When an orchestrator calls `query_context(domain, task)`, the ProjectContext MCP's `queryStandards()` method:

1. Opens the Workshop SQLite database using `better-sqlite3`
2. Queries entries where `type = 'gotcha'` and `content LIKE '%[{domain}]%'`
3. Parses each entry's flattened content string back into structured fields using regex:
   - Pattern: `[{domain}] {rule} (Cost: {cost}. Cause: {what_happened})`
4. Returns an array of `Standard` objects in `ContextBundle.relatedStandards`

The orchestrator extracts these standards and injects them into the builder's delegation prompt as an "ACTIVE STANDARDS" section.

### Why standards-persistence-agent

Gate agents previously called `save_standard` directly (attempt 3 in the history below). This had problems:

- Gate agents are quality checkers -- adding persistence responsibility complicates their role
- 12 gate agents would need identical persistence logic
- Deduplication is better handled centrally

The `standards-persistence-agent` is a dedicated cross-domain agent spawned by all light orchestrators. It has one job: parse violations and persist them. This separation of concerns means gate agents only need to emit VIOLATIONS_JSON, and the persistence logic lives in one place.

The agent lives at `agents/cross-domain/standards-persistence-agent.md` and is registered in `docs/reference/os-dependency-graph.yaml` under `cross_domain`.

## Serialization Details

The write and read paths must agree on format. This is how they connect:

| Operation | Method | Format |
|-----------|--------|--------|
| Write | `saveGotcha()` via Workshop CLI | Flattens to: `[{domain}] {rule} (Cost: {cost}. Cause: {what_happened})` |
| Storage | Workshop SQLite `entries` table | Single `content` column, `type = 'gotcha'` |
| Read | `queryStandards()` via better-sqlite3 | Regex extracts: domain, rule, cost, what_happened from content |

The regex pattern used for extraction:

```
/^\[([^\]]+)\]\s*(.+?)\s*\(Cost:\s*(.+?)\.\s*Cause:\s*(.+?)\)$/s
```

If the regex does not match (e.g., manually written gotchas), the raw content is used as `what_happened` and the `rule` field falls back to the `reasoning` column.

## Maintenance

### After Node.js Upgrades

The ProjectContext MCP uses `better-sqlite3`, a native Node module compiled against a specific Node ABI. After upgrading Node.js, the module must be rebuilt:

```bash
cd ~/.claude/mcp/project-context-server && npm rebuild better-sqlite3
```

Without this rebuild, `openDatabase()` throws an ABI mismatch error. The catch block returns an empty array, so `queryStandards()` silently returns no standards. The learning loop appears functional but produces no results.

### Verifying the Loop Works

To confirm standards are being saved and read:

```bash
# Check if any gotcha entries exist
sqlite3 .claude/memory/workshop.db "SELECT COUNT(*) FROM entries WHERE type='gotcha'"

# Check if standards contain domain tags
sqlite3 .claude/memory/workshop.db "SELECT content FROM entries WHERE type='gotcha' LIMIT 5"

# Verify ProjectContext can read them
# Run a task in a domain where standards exist and check ContextBundle.relatedStandards
```

## History

The learning loop took 4 attempts to get working. Every attempt addressed architecture or agent wiring. The actual bugs were infrastructure.

| Attempt | Date | What | Why It Failed |
|---------|------|------|---------------|
| 1 | 2025-11-27 | Improvement Bus spec (330 lines) | Never implemented -- pure vaporware |
| 2 | 2026-02-27 | Three-layer fix plan | Addressed prompt compliance, not the actual bug |
| 3 | 2026-03-10 | Added MUST to 12 gate agents | Deployed, zero standards saved -- agents called save_standard but read path was broken |
| 4 | 2026-03-13 | standards-persistence-agent | Correct architecture, but read path still broken |
| 5 | 2026-03-18 | Fixed better-sqlite3 ABI + serialization regex | Both bugs fixed. Loop works end-to-end. |

The lesson: when a system silently returns empty results, the bug is in the infrastructure (native modules, serialization), not the architecture (agent wiring, prompt instructions).

## See Also

- `quick-reference/ORCA-OS/ORCA-learning.md` -- Learning loop quick reference
- `docs/concepts/memory-systems.md` -- Memory architecture including Workshop and ProjectContext
- `agents/cross-domain/standards-persistence-agent.md` -- The persistence agent
- `docs/reference/os-dependency-graph.yaml` -- Cross-domain agent registry

---

_Version: OS 7.0 | Self-improvement is infrastructure, not architecture._
