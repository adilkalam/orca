# OS-Dev Domain Pipeline

**Status:** OS 7.0 Core Pipeline
**Domain:** `os-dev`
**Last Updated:** 2026-02-13

## Overview

The OS-Dev pipeline handles **Claude Code / Vibe OS configuration work**:

- OS 7.0 orchestration behavior (lanes, phase configs, gates)
- Claude Code commands, agents, skills, hooks, and MCP integration
- Memory and context integration behavior for OS 7.0

Use this lane when you want to change **how the system itself behaves**, not a user project.

**IMPORTANT: This pipeline is LOCAL to this repo only.** It should NOT be deployed to `~/.claude` global config. The OS-Dev lane exists specifically to work on this configuration repository.

Examples:

- Add a new orchestration lane (e.g. backend or infra lane)
- Configure or replace an MCP for all OS 7.0 lanes
- Adjust default models/tiers or RA behavior for lanes
- Tighten or relax safety constraints for commands/agents

The OS-Dev lane is driven by `/orca-os-dev` and recorded in
`.claude/orchestration/phase_state.json` according to
`docs/reference/phase-configs/os-dev-phase-config.yaml`.

---

## Core Principles

1. **Config is code** – Treat changes to OS / Claude Code config as seriously as production code.
2. **Specs for complex changes** – Global or risky changes require requirements specs.
3. **Memory first** – Search Workshop + code-index.db before expensive context.
4. **Orchestrator only** – `/orca-os-dev` and `os-dev-grand-architect` never edit files.
5. **Two-pass implementation** – Implementation + corrective pass with strict gates.
6. **Safety and rollback** – Every risky change needs a rollback story.

---

## Pipeline Architecture

High-level flow (simplified):

```
Request
  ↓
[Phase 0: Intake & Complexity]
  ↓
[Phase 1: Memory-First Context]
  ↓
[Phase 2: ProjectContext Query (cached)]
  ↓
If complex → [Spec Required: .claude/requirements/<id>/06-requirements-spec.md]
  ↓
[Phase 3: Planning (os-dev-architect)]
  ↓
[Phase 4: Implementation - Pass 1 (os-dev-builder)]
  ↓
[Phase 5: Standards & Safety Gate (os-dev-standards-enforcer)]
  ↓
If FAIL → [Phase 4b: Implementation - Pass 2 (Corrective)]
  ↓
[Phase 6: Verification (os-dev-verification)]
  ↓
[Phase 7: Completion & Learning]
```

See `docs/reference/phase-configs/os-dev-phase-config.yaml` for the detailed
phase_state schema.

---

## Phases

### Phase 0: Intake & Complexity Classification

**Agent:** `os-dev-grand-architect`  
**Source:** `/orca-os-dev`

Tasks:

- Restate the request in 1–3 bullets.
- Classify **complexity tier**:
  - `simple` – small tweaks, 1–2 files.
  - `medium` – changes to a lane, single MCP/Skill, a few files.
  - `complex` – global hooks, safety changes, phase config rewrites.
- Identify initial risk:
  - Does this touch hooks that run every session?
  - Does this alter safety or permissions?
  - Does this affect how all lanes route or gate work?

Outputs (phase_state.intake):

- `task_summary`
- `complexity_tier`
- `initial_risks`

---

### Phase 1: Memory-First Context

**Agent:** `os-dev-grand-architect` (via `/orca-os-dev` using Bash + scripts)

Tasks:

- Call the unified memory search script (see memory docs) to retrieve:
  - Past Workshop decisions/gotchas about OS / Claude config.
  - Relevant code-index.db matches around OS-Dev files.
- Summarize important findings:
  - Prior incidents (e.g. “never default to dangerous flags”).
  - Established patterns for lanes/MCP/skills/hooks.

Outputs (phase_state.context_query):

- `memory_summary`
- `code_matches` (optional)

---

### Phase 2: ProjectContext Query (Cached)

**Agent:** ProjectContextServer (MCP)  
**Invoker:** `/orca-os-dev`

Tasks:

- Call `mcp__project-context__query_context` with:
  - `domain: "os-dev"`
  - `task`: short summary
  - `projectPath`: repo root
  - `maxFiles`: ~15
  - `includeHistory: true`
- Assume SharedContext caching is configured; do not re-query unnecessarily.

Outputs:

- ContextBundle with:
  - `relevantFiles` – config and orchestration files.
  - `projectState` – known lanes/agents/commands/skills/MCPs.
  - `pastDecisions` – existing OS-Dev decisions.
  - `relatedStandards` – OS-Dev standards harvested by audits.

Artifacts (phase_state.context_query):

- `context_bundle_summary`

---

### Spec Integration (Complex Tasks)

For `complex` changes:

- Require a requirements spec:
  - `.claude/requirements/<id>/06-requirements-spec.md`
- `/orca-os-dev` must:
  - Resolve `requirement_id` and `requirements_spec_path`.
  - Refuse to continue if missing, and instruct the user to run `/requirements`.

Artifacts:

- `phase_state.requirement_id`
- `phase_state.requirements_spec_path`

---

### Phase 3: Planning (os-dev-architect)

**Agent:** `os-dev-architect`

Tasks:

- Read:
  - Requirements spec (if present).
  - `memory_summary`.
  - ContextBundle.
  - OS-Dev knowledge skill.
- Decide:
  - Which files are in-scope vs explicitly frozen.
  - Change pattern: additive vs targeted refactor vs limited rewrite.
  - Safety envelope: what must remain true post-change.
  - Rollback strategy: how to revert changes if verification fails.
- Use Response Awareness tags:
  - `#PATH_DECISION` + `#PATH_RATIONALE` for major choices.
  - `#COMPLETION_DRIVE` / `#CONTEXT_DEGRADED` where assumptions are made.

Outputs (phase_state.planning):

- `plan_summary`
- `files_targeted`
- `change_type`
- `risk_assessment`
- `complexity_tier`
- `ra_events` (summary)

---

### Phase 4: Implementation – Pass 1 (os-dev-builder)

**Agent:** `os-dev-builder`

Tasks:

- Implement changes **only** for files listed in `files_targeted`.
- Apply minimal diffs; avoid full rewrites of config files.
- Ensure configs remain syntactically valid.
- Write Rollback notes (what to restore if needed).
- Use RA tags where necessary (assumptions, pattern momentum).

Outputs (phase_state.implementation_pass1):

- `files_modified`
- `changes_manifest`
- `rollback_notes`
- `ra_events`

---

### Phase 5: Standards & Safety Gate (os-dev-standards-enforcer)

**Agent:** `os-dev-standards-enforcer`

Tasks:

- Enforce OS-Dev standards from:
  - ContextBundle.relatedStandards.
  - `docs/architecture/os-dev-standards.md`.
- Check:
  - Safety: no new dangerous defaults, no uncontrolled hooks.
  - Scope: no files outside allowed surfaces were changed.
  - Consistency: config/agent/command definitions match patterns.
  - RA: unresolved critical RA tags are surfaced.

Outputs (phase_state.gates.os_dev_standards):

- `standards_score` (0–100)
- `gate_decision` (`PASS | CAUTION | FAIL`)
- `violations`
- `ra_status`

---

### Phase 4b: Implementation – Pass 2 (Corrective)

**Agent:** `os-dev-builder`

Trigger:

- When `os_dev_standards` gate fails and corrective work is allowed.

Tasks:

- Fix only gate violations and critical RA issues.
- Do not expand scope or change unrelated files.

Outputs (phase_state.implementation_pass2):

- `files_modified`
- `fixes_applied`

---

### Phase 6: Verification (os-dev-verification)

**Agent:** `os-dev-verification`

Tasks:

- Run safe, non-destructive checks:
  - Validate JSON/YAML for modified configs.
  - Optionally run limited CLI checks to ensure the config parses.
- No destructive commands; no network calls.

Outputs (phase_state.verification):

- `verification_status` (`PASS | FAIL`)
- `commands_run`
- `errors`

---

### Phase 7: Completion & Learning

**Agent:** `os-dev-grand-architect`

Tasks:

- Ensure all required phases completed and gates are resolved.
- Produce a change report under:
  - `.claude/orchestration/evidence/os-dev-change-<timestamp>.md`
- Save task history via ProjectContext:
  - `mcp__project-context__save_task_history` with `domain: "os-dev"`.
- Where recurring issues were solved, promote them to standards via:
  - `mcp__project-context__save_standard`.
- **Session logging** (for significant changes):
  - Create a log file in `logs/` with naming `Claude-Topic-YYYY-MM-DD.md`
  - Include required frontmatter: Agent, Topic, Description, Files Edited, Date, Time
  - Log complex changes, multi-file refactors, and architecture decisions
  - See `logs/README.md` for full conventions

---

## Safety & Rollback

- OS-Dev changes can break your entire orchestration environment.
- For anything beyond simple tweaks:
  - Always require a plan and rollback story.
  - Never default to dangerous flags or broad hooks.
  - Favor additive, opt-in behavior over implicit behavior changes.
