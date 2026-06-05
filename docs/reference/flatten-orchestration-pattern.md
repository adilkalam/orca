# Flatten Orchestration Pattern (OS 7.1)

**Status:** Canonical. Governs the migration of all ORCA command lanes off the broken nested-subagent model.

**Why:** Current Claude Code forbids subagents from spawning subagents (`sub-agents.md` lines 62/359/759). The `Task` tool is renamed to `Agent`. ORCA's old model — `/command → orchestrator agent (grand-architect/light-orchestrator) → specialist agents` — has a dead second hop: the orchestrator runs as a subagent and its delegation calls are no-ops. Orchestrators are Write-less, so nothing gets built.

See decision: `.orca/cognition/20260527-1506-orca-orchestration-migration/99-harvest.md`.

---

## The pattern

**The command file IS the orchestrator.** A slash command runs in the **main thread**, so it may legally spawn subagents. The orchestrator-agent tier dissolves into the command.

```
OLD (broken):
  /ios → main spawns ios-grand-architect [subagent]
              └─ tries to spawn ios-builder, gates [ILLEGAL nested]

NEW (flat):
  /ios → main agent executes the command's phase script directly:
         ├─ Agent(ios-architect)        → returns a PLAN (single-level)   ✅
         ├─ Agent(ios-builder)          → writes code (single-level)      ✅
         ├─ Agent(ios-standards-enforcer) → gate, checked output          ✅
         └─ Agent(ios-verification)     → build/test gate                 ✅
```

### Rules

1. **Main thread owns delegation.** All `Agent()` calls happen from the command (main thread), one at a time, reading each result before the next.
2. **Dissolve sub-spawning orchestrators.** Any agent whose job is to coordinate + delegate (`*-grand-architect`, `*-grand-orchestrator`, `*-light-orchestrator`) is removed; its routing/sequencing logic moves into the command's steps. Archive the file to `.archived/`, do not delete.
3. **Keep pure-planning agents.** An agent that only *produces a plan/analysis and returns it* (e.g. `ios-architect`) stays as a single-level callable. It must NOT itself call `Agent()`. If it does, strip that — it returns a plan; the command acts on it.
4. **Specialists/builders/gates stay as single-level subagents.** Unchanged except the rename. They are spawned by the command, not by an orchestrator.
5. **Gates are explicit, checked `Agent()` calls** — not prose hopes. The command spawns the gate agent, reads its score/verdict, and branches. Never "the orchestrator enforces gates."
6. **Phase state persists to `.orca/orchestration/phase_state.json`** — written by the command between steps. This offloads context (fights main-thread bloat) and survives interruption.
7. **`Task` → `Agent` everywhere.** Tool name in `tools:` frontmatter, and `Task({subagent_type, description, prompt})` call syntax → `Agent({subagent_type, description, prompt})`.

### Meta-router (`/orca`) special case

`/orca` routes to domain lanes. It must NOT spawn a grand-architect. Instead route via `SlashCommand`, which runs the domain command inline in the main thread:

```typescript
SlashCommand({ command: `/${domain} ${$ARGUMENTS}` })
```

`/orca`'s own job shrinks to: detect dir → memory/context once → detect pipeline → confirm plan → `SlashCommand(/domain)`. The domain command (already flattened) does the single-level specialist spawning. Pass the context bundle to the domain command via its arguments / a handoff file in `.orca/orchestration/`.

---

## Per-lane migration checklist

- [ ] Identify the lane's orchestrator agent(s) → dissolve into command steps; archive files.
- [ ] Identify pure-planning agents → keep, strip any `Agent()`/`Task()` calls inside them.
- [ ] Rewrite the command so the main agent runs the phase sequence and spawns specialists/gates via `Agent()` single-level.
- [ ] Wire gates as explicit checked calls; persist phase_state between steps.
- [ ] `Task` → `Agent` rename (command body + every agent `tools:` line touched).
- [ ] Remove "YOU MUST DELEGATE to a grand-architect" / "NEVER spawn specialists yourself" mandates that encoded the old tier; replace with the flat phase script.
- [ ] Verify: no agent reachable from this lane has `Agent`/`Task` in its `tools:` (no second hop remains).

## Lane classification

- **Tier-dissolution (11):** /orca, /ios, /expo, /django-react, /nextjs, /rvry-dev, /rvry-research, /orca-os-dev, /orca-pipeline, /seo, /enhance.
- **Rename + chain-check (~13):** the rest — already single-level from the command; rename + confirm no called agent sub-spawns.
