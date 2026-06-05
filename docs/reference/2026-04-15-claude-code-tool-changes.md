# Claude Code Tool & Command Changes — Notes

**Date:** 2026-04-15
**Scope:** Claude Code v2.1.100–2.1.109 (early April 2026) + MCP spec 2025-06-18

## Tool Invocation Changes

### Deferred Tools + ToolSearch
Most MCP tools are no longer loaded upfront. Only names are exposed in a
`<system-reminder>`; schemas must be fetched on demand before calling.

- Load by name: `ToolSearch` with `query: "select:<name>,<name2>"`
- Load by keyword: `ToolSearch` with `query: "notebook jupyter"`
- Calling a deferred tool without loading its schema fails with
  `InputValidationError`.
- Reduces context bloat for sessions with large MCP surfaces (runpod,
  crawl4ai, gmail, project-context, etc.).

### Monitor Tool (v2.1.105)
Streams events from background processes. Complements `run_in_background`
on Bash/Agent. Each stdout line becomes a notification; use an
`until <check>; do sleep 2; done` pattern to poll-until-done without
burning cache.

### Skill Tool Invokes Built-in Slash Commands (v2.1.101)
Model can self-invoke `/init`, `/review`, `/security-review`, etc. via
the Skill tool. Agents can now chain standard commands without user
prompting.

## Slash Command Changes

- `/undo` — alias for `/rewind` (v2.1.108)
- `/recap` — session recap on return; configurable in `/config`;
  env override `CLAUDE_CODE_ENABLE_AWAY_SUMMARY`
- Unknown slash commands suggest closest match
- `/model` warns before mid-conversation switches (cache invalidation
  cost)

## Skills

- Skill `description` cap raised 250 → 1,536 chars (v2.1.105)
- `disableSkillShellExecution` setting (v2.1.91) blocks inline shell in
  skills, custom slash commands, plugin commands
- Plugin skills use frontmatter `name` for stable invocation (was dir
  basename)

## Hooks / Permissions

- `PreCompact` hook can block compaction via exit code 2
- `PermissionDenied` hook fires after auto-mode classifier denials
- Hooks support conditional `if` field with permission rule syntax

## Prompt Caching

- `ENABLE_PROMPT_CACHING_1H` — opt into 1h TTL on API key, Bedrock,
  Vertex, Foundry (deprecates `ENABLE_PROMPT_CACHING_1H_BEDROCK`)
- `FORCE_PROMPT_CACHING_5M` — force 5m TTL

## Error Messages

- Server rate limits distinguished from plan usage limits
- 5xx / 529 errors link to status.claude.com

## MCP Content Block Annotations (spec 2025-06-18)

Not a Claude Code feature — an MCP spec feature usable by any custom
MCP server (project-context, cognition-mcp, bambu-3mf, orca-record).

Any content block in a tool result can carry:

```json
{
  "type": "text",
  "text": "...",
  "annotations": {
    "audience": ["user", "assistant"],
    "priority": 0.7,
    "lastModified": "2026-04-15T12:00:00Z"
  }
}
```

### Fields

- **audience** — `["user"]` surface to human but deprioritize for model
  context; `["assistant"]` model-only, hide from UI;
  `["user","assistant"]` both
- **priority** — 0–1; clients truncate/collapse low-priority first when
  context is tight
- **lastModified** — resource cache invalidation

### Practical Use for ORCA-OS MCPs

Wrap verbose diagnostic output with
`audience: ["user"], priority: 0.3` and keep the terse summary at
`audience: ["user","assistant"], priority: 0.9`. Model stops drowning in
logs, user still sees them.

### Not to Be Confused With Tool Annotations

Tool-definition-level hints (`readOnlyHint`, `destructiveHint`,
`idempotentHint`, `openWorldHint`) live on the tool declaration, not on
result content blocks.

## Impact on ORCA-OS

- **Agent surfaces** — agents with many MCP tools now pay a ToolSearch
  lookup cost per unique tool. Consider grouping related tools or
  pre-loading at agent start.
- **Self-chaining** — agents can invoke `/review`, `/security-review`
  via Skill tool; worth revisiting lane orchestrators.
- **Output hygiene** — custom MCPs (project-context, cognition-mcp,
  bambu-3mf) should adopt content-block `annotations` to keep noisy
  output from poisoning model context.

## Sources

- https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- https://code.claude.com/docs/en/changelog
- https://releasebot.io/updates/anthropic/claude-code
- https://modelcontextprotocol.io/specification/2025-06-18/server/tools
- https://forgecode.dev/blog/mcp-spec-updates/
