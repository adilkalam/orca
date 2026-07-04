# Next.js Domain Pipeline

**Status:** OS 7.1 Core Pipeline (Next.js / React frontend)
**Last Updated:** 2026-07-03 (restored — flat pattern)

## Overview

The Next.js pipeline handles **browser-based React / Next.js UI work** (App Router,
React Server Components, TypeScript, semantic CSS). It follows the **flat orchestration
pattern** (`docs/reference/flatten-orchestration-pattern.md`):

- The `/nextjs` command runs in the **main thread** and IS the orchestrator. No
  orchestrator-tier coordinator subagents exist in this lane — that layer was dissolved
  in the 2026-05-27 flatten migration and is NOT reintroduced here.
- The orchestrator spawns the **8 real nextjs agents** single-level via `Agent()`,
  one at a time, reading each result before the next. Subagents never sub-spawn.
- Memory-first context (Workshop + `memory-search-unified.py`) before ProjectContext.
- Four-tier routing (Light / Default / Tweak / Complex); `--complex` requires a spec.
- Two mechanical gate floors, both enforced by `hooks/gate-enforcement.sh`:
  the **standards score gate** (`gates.standards`, `docs/reference/gate-contract.md`)
  and, for UI-affecting tasks, the **web design lane floor** (`gates.design_lane`,
  `docs/reference/design-lane.md`).

Goal: implement and evolve Next.js features with architecture-aware plans, mechanical
quality floors, and a design floor that keeps named slop out of the UI — without any
orchestrator-tier ceremony.

---

## The 8-Agent Roster (the complete team — nothing else exists)

| Role | Agent | Responsibility |
|------|-------|----------------|
| Planning / analysis | `nextjs-architect` | Impact analysis, architecture plan, component/layout/style-source map |
| Implementation | `nextjs-builder` | All code, **including CSS / layout / tokens** (auto-adapts to `css_approach`) |
| Standards gate | `nextjs-standards-enforcer` | Code standards + safety; writes `gates.standards` score |
| Verification gate | `nextjs-verification-agent` | Build / lint / typecheck; writes `verification` |
| Specialist | `nextjs-typescript-specialist` | Complex types, generics, type errors |
| Specialist | `nextjs-performance-specialist` | Bundle size, render hotspots |
| Specialist | `nextjs-accessibility-specialist` | WCAG / a11y |
| Specialist | `nextjs-seo-specialist` | Metadata, routing structure, crawlability |

> **CSS / layout / tokens have no dedicated specialist agents.** The design-fork
> archived every CSS / layout / token / design-review specialist that used to sit in this
> lane. That work is now owned by `nextjs-builder` + the design lane floor. The command
> detects the styling stack (Tailwind / shadcn / semantic CSS), records `css_approach` in
> `phase_state.tech_stack`, and passes it to the builder in the ContextBundle.

---

## Four-Tier Routing

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Command (main thread) → builder → gates | YES | Confident users, skip confirmation |
| **Default** | (none) | Command + confirmation → builder → gates | YES | Most work — fast with quality |
| **Tweak** | `--tweak` | Command → builder direct | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Command → architect → builder → all gates → verification | YES | Multi-page, App Router restructure, specs |

All four routes run in the main thread; the command owns the sequence. `--complex`
BLOCKS without a `.orca/requirements/<id>/06-requirements-spec.md`.

---

## Pipeline Architecture (Complex path)

```text
Request (Next.js feature / bug / refactor)
    |
[Phase 1: Context Query]  <- ProjectContextServer (after memory-first)
    |
[Phase 2: Requirements & Impact]  nextjs-architect
    |
[Phase 3: Architecture & Plan]    nextjs-architect (App Router / RSC / data patterns)
    |
[Phase 3.5: Analysis]             nextjs-architect (component / layout / style-source map)
    |
[Phase 4: Implementation Pass 1]  nextjs-builder (+ specialists as needed)
    |
[Phase 5: Standards Gate]         nextjs-standards-enforcer -> gates.standards
    |
[Phase 6: Design Gate]            design-validator + detector -> gates.design_lane   (UI-affecting only)
    |
Decision Point:
  gates PASS -> [Phase 7: Verification]
  gate BLOCK -> [Phase 4b: Corrective Pass]  (nextjs-builder, MAX N=2, then escalate)
    |
[Phase 7: Verification]           nextjs-verification-agent (build / lint / typecheck)
    |
[Phase 8: Completion & Learning]  save_task_history
```

Phase config: `docs/reference/phase-configs/nextjs-phase-config.yaml`.

---

## The Two Mechanical Gate Contracts

### Standards score gate (`gates.standards`)

`docs/reference/gate-contract.md`. After `nextjs-standards-enforcer` returns, the
orchestrator writes:

```json
{ "gates": { "standards": {
    "score": 93, "threshold": 90, "gate_decision": "PASS", "lane": "nextjs" } } }
```

**Binary mapping (the live-hook safety hinge):** the enforcer emits a *graduated*
decision (PASS / WARN / ERROR / BLOCK). Write `gate_decision: "PASS"` ONLY when the
enforcer decision is `PASS` AND `score >= 90`; otherwise `"BLOCK"`. ALWAYS write `score`
as a NUMBER. `hooks/gate-enforcement.sh` exit-2 blocks a PASS with a missing/non-numeric
score or a score below threshold. The corrective loop increments `gates.standards.attempts`.

### Design lane floor (`gates.design_lane`) — UI-affecting tasks only

`docs/reference/design-lane.md`. "UI-affecting" = the task touches
`*.css/scss/sass/less/module.css`, or `*.tsx/jsx` with `className=` / `style=` / a CSS
import, or files under `app/` `components/` `pages/`. Pure server-action / route / config
changes SKIP the design gate.

Sequence (light per-task floor):

1. **Lightweight bind** — the command hand-builds a small `BOUND_CONSTRAINTS` JSON:
   FORBIDDEN ids drawn from the web detector rule ids the task can trip
   (`tailwind-palette-utilities`, `tailwind-hex-values`, `reflex-fonts`, `geist-imports`,
   `purple-pink-gradients`, `gradient-text`, `side-stripe-borders`, `inset-highlight-shadow`,
   `default-ease-transition`, `bouncy-easing`) + at least one FORWARD felt-state obligation.
   MUST include >=1 FORBIDDEN AND >=1 FORWARD (empty -> validator returns
   `NO-BOUND-CONSTRAINTS` BLOCK). Serialized to `.orca/orchestration/temp/`.
2. **Validate** — spawn a fresh-context `Agent(design-validator)` with ONLY the builder's
   changed-file `ARTIFACT_PATHS` + `BOUND_CONSTRAINTS` + the injected hub. It exports
   `DESIGN_OVERRIDES_PATH={project}/.design-overrides.json` before the detector run. Never
   pass the builder's reasoning. Parse `GATE_VERDICT: PASS|BLOCK`.
3. **Branch** — on PASS write `gates.design_lane = { gate_decision:"PASS",
   artifact_paths:[<non-empty>], validator_score:<SCORE>, bound_constraint_ids:[...],
   attempts:<0-2>, active_overrides:[] }`. The live hook re-runs `designcheck` on
   `artifact_paths` and exit-2 blocks on a missed P0; `artifact_paths` MUST be non-empty.
   On BLOCK -> one corrective `nextjs-builder` pass with the validator's
   `UNSATISFIED_CONSTRAINTS` + `FINDINGS`, re-validate, MAX N=2, then escalate
   (`escalated: true`).

The orchestrator never judges its own output — adjudication is external (detector +
fresh-context validator).

---

## The /impeccable Boundary

`/nextjs` runs a **LIGHT per-task design floor** (the sequence above). Heavy / holistic
aesthetic work — multi-verb design passes, `--craft`, the full cognition bind, register
harvest — routes to **`/impeccable`**. This mirrors the `/ios` ↔ `/ios-impeccable`
split: the dev lane keeps the floor; the design command owns the ceiling.

---

## Scope & Domain

Use this pipeline when the task concerns browser-based React / Next.js work:
- Keywords: "Next.js", "App Router", "React", "RSC", "page", "layout", "component".
- Files: `app/**`, `components/**`, `pages/**`, `*.tsx`, `*.jsx`, `next.config.*`.

If the request is for:
- Native iOS → use the **iOS** pipeline (`/ios`).
- Expo / React Native mobile → use the **Expo** pipeline (`/expo`).
- Django + React full-stack → use the **Django + React** pipeline (`/django-react`).

---

## Standards Learning Loop

`nextjs-standards-enforcer` reads `relatedStandards` from the ContextBundle and treats
them as enforceable rules (not suggestions), tagging each violation to the standard it
breaks. `/audit` promotes recurring violations to new standards via
`mcp__project-context__save_standard`, which flow into future `relatedStandards`:

```
violation -> /audit -> save_standard -> code-index.db -> future relatedStandards -> gate enforcement
```

---

## Failure Scenarios & Recovery

### Standards gate blocks after the corrective pass
Mark the task partial, report the score, save violations as standards, require a human
decision (manual fix / accept partial / rollback `git checkout HEAD~1 -- <files>`).

### Design gate escalates (N=2 exhausted)
Surface the unresolved `UNSATISFIED_CONSTRAINTS` + `FINDINGS` to the user and set
`gates.design_lane.escalated: true`. The hook blocks a PASS written past N=2 without
that flag — the lane never silently ships a runaway loop.

### Broken UI with no screenshot
Do NOT spawn a design-reviewer agent (archived). Use `nextjs-architect` to map the
structure / layout, OR route the aesthetic diagnosis to `/impeccable --audit`.

### ProjectContextServer timeout
Retry once (30s), then degrade: `Grep`/`Glob` to locate files, skip `pastDecisions` /
`relatedStandards`, warn about reduced context, proceed conservatively.

---

## Phase State

Agents communicate via `.orca/orchestration/phase_state.json`:

```json
{
  "domain": "nextjs",
  "routing_mode": "complex",
  "current_phase": "implementation_pass1",
  "tech_stack": { "tailwind": true, "shadcn": false, "css_approach": "tailwind" },
  "implementation_pass1": { "files_modified": ["app/pricing/page.tsx"] },
  "gates": {
    "standards": { "score": 93, "threshold": 90, "gate_decision": "PASS", "lane": "nextjs", "attempts": 0 },
    "design_lane": {
      "gate_decision": "PASS",
      "artifact_paths": ["app/pricing/page.tsx"],
      "validator_score": 95,
      "bound_constraint_ids": ["N1", "N2"],
      "attempts": 0,
      "active_overrides": []
    }
  },
  "verification": { "verification_status": "pass", "commands_run": ["pnpm build", "pnpm lint"] }
}
```

---

## Related References

- Command: `commands/nextjs.md`
- Phase config: `docs/reference/phase-configs/nextjs-phase-config.yaml`
- Standards contract: `docs/reference/gate-contract.md`
- Design lane contract: `docs/reference/design-lane.md`
- Flat pattern: `docs/reference/flatten-orchestration-pattern.md`
- Design validator agent: `agents/design/design-validator.md`
