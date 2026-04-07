---
name: os-dev-knowledge-skill
description: "OS 7.0 configuration knowledge — lanes, agents, commands, skills, MCPs, hooks, and memory. Use when planning orchestration changes, adding or modifying OS-Dev agents/commands/skills, or configuring hooks and memory behavior. LOCAL to ORCA-OS repo."
---

# OS-Dev Knowledge Skill — OS 7.0 Configuration & Safety

**LOCAL to ORCA-OS repo only.**

Use this skill when:
- Planning changes to orchestration lanes or phase configs
- Adding or modifying commands, agents, or skills for OS 7.0
- Configuring MCPs, hooks, or memory behavior that affect all lanes

## Configuration Surfaces

| Surface | Key paths |
|---------|-----------|
| Lanes & pipelines | `docs/pipelines/*.md`, `docs/reference/phase-configs/*.yaml` |
| Agents & commands | `agents/*.md`, `agents/dev/*.md`, `commands/*.md` |
| Skills & MCPs | `skills/*/SKILL.md`, `mcp/*` |
| Memory & orchestration | `.claude/memory/` (Workshop + code-index.db), `.claude/orchestration/` |

## Core Principles

1. **Orchestrators never implement** — `/orca-*` and `*-grand-architect` agents only coordinate.
2. **Specs before complex changes** — Requirements specs in `.claude/requirements/<id>` are required for global changes.
3. **Memory-first** — Query Workshop and code-index.db before expensive context loading.
4. **Safety over convenience** — Never default to dangerous flags or uncontrolled hooks.
5. **Edit-not-rewrite** — Minimal diffs in config files; respect existing patterns where safe.

## Common Pitfalls

| Pitfall | Why it matters |
|---------|---------------|
| `--dangerously-skip-permissions` as default | Bypasses safety checks for all sessions |
| Hooks running arbitrary shell on every session | Uncontrolled execution, security risk |
| Temp logs/config outside `.claude/` | Pollutes repo, missed by cleanup |
| YAML arrays for `tools:` in agents | Silent tool failures — use comma-separated strings |

## Best Practices

- **Lightweight agents**: Focused scopes, minimal tool lists, clearly documented behaviors.
- **Evolving standards**: When recurring problems are found, codify in OS-Dev standards and enforce via gates.
- **Response Awareness tags**: Document assumptions and path choices (`#ASSUMPTION`, `#PATH_DECISION`), especially around safety and global behavior.
