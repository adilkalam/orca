/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
# OS 4.1 OS-Dev Lane Readme

**Lane:** OS / Tooling Configuration  
**Domain:** `os-dev`  
**Entrypoints:** `/plan`, `/orca-os-dev`, `/project-memory`, `/project-code`

This readme explains the OS-Dev lane, which manages changes to:

- Vibe OS 4.1 orchestration behavior
- Claude Code commands, agents, skills, MCPs, hooks
- Memory integration behavior

---

## 1. When to Use OS-Dev

Use OS-Dev lane when you want to change **how the system behaves**, not
application code:

- Add/modify lanes and phase configs
- Add or reconfigure MCPs
- Add OS‑level skills or adjust their usage
- Tweak hooks, scripts, and safety defaults for OS 4.1

---

## 2. Pipeline & Phase Config

- `docs/pipelines/os-dev-pipeline.md`
- `docs/reference/phase-configs/os-dev-phase-config.yaml`
- Phases:
  - `intake` (complexity tier)
  - `context_query` (memory + ProjectContext)
  - `planning`
  - `implementation_pass1`
  - `os_dev_standards_gate`
  - `implementation_pass2`
  - `verification`
  - `completion`

OS-Dev writes into `.claude/orchestration/phase_state.json` with
`domain: "os-dev"`.

---

## 3. Agents & Standards

Agents:

- `agents/dev/os-dev-grand-architect.md`
- `agents/dev/os-dev-architect.md`
- `agents/dev/os-dev-builder.md`
- `agents/dev/os-dev-standards-enforcer.md`
- `agents/dev/os-dev-verification.md`

Standards:

- `docs/architecture/os-dev-standards.md`
  - Safety, scope, consistency, rollback, RA.
  - MCP, hooks, skills, and ProjectContext integration standards.

Skill:

- `skills/os-dev-knowledge-skill/SKILL.md`

---

## 4. Memory & RA

- OS-Dev uses the same unified memory system (`/project-memory`,
  `/project-code`) as other lanes, but focused on OS/Claude config.
- RA tags and standards are exported via ProjectContext so future
  OS-Dev tasks can see past incidents and rules.

For concrete usage, see:

- `commands/orca-os-dev.md`
- `docs/architecture/os-dev-standards.md`
