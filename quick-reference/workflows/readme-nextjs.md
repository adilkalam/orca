# OS 5.2 Next.js Lane Readme

**Lane:** Next.js / Frontend  
**Domain:** `nextjs`  
**Entrypoints:** `/plan`, `/orca`, `/nextjs`, `/project-memory`, `/project-code`

This document explains how the Next.js lane works in OS 5.2:

- How planning and specs work (`/plan`)
- How orchestration routes (`/orca`, `/nextjs`)
- How the pipeline and phase state are structured
- Which agents and skills are involved
- How memory (`/project-memory`, `/project-code`) and Response Awareness integrate

---

## 1. When to Use the Next.js Lane

Use this lane when the task is clearly **Next.js / React frontend** work:

- Editing `app/**`, `pages/**`, `components/**`, `src/**` with React/Next.js
- Layout/spacing/typography changes
- Adding or updating UI components/pages
- SEO and performance tuning in the frontend

Examples:

- “Refine the pricing page layout”
- “Add skeleton loaders to dashboard cards”
- “Improve CLS and LCP on the landing page”

---

## 2. Core Commands and Flow

### 2.1 Planning – `/plan`

For non‑trivial work, always start with `/plan`:

- Creates a requirements folder:
  - `.claude/requirements/YYYY-MM-DD-HHMM-<slug>/`
- Populates:
  - `00-initial-request.md`
  - Discovery & detail Q/A (`01–05-*`)
  - `06-requirements-spec.md` – final spec
  - `metadata.json` – phase and progress tracking
- Integrates Response Awareness tags in the spec (e.g., `#PATH_DECISION`).

For **complex** Next.js tasks the spec is **required** before the full lane runs.

---

### 2.2 Global Orchestrator – `/orca`

`/orca` is the pure OS 5.2 orchestrator:

- Checks Workshop + code-index.db first (memory‑first).
- Checks for an active requirements spec.
- Detects that the task is Next.js work.
- Routes to `/nextjs` with:
  - Request summary
  - Any memory hits
  - Info about requirements/specs, if present

You can also call `/nextjs` directly.

---

### 2.3 Next.js Orchestrator – `/nextjs`

File: `commands/nextjs.md`

- Accepts:

  ```bash
  /nextjs "fix button spacing"                    # Default: light + gates
  /nextjs -tweak "try different padding"         # Tweak: light, no gates
  /nextjs --complex "implement auth flow"        # Complex: full pipeline
  /nextjs "implement requirement <id>"           # With spec
  ```

- **Routing Modes (OS 5.2):**

  | Mode | Flag | Path | Gates |
  |------|------|------|-------|
  | **Default** | (none) | Light + Gates | YES |
  | **Tweak** | `-tweak` | Light (pure) | NO |
  | **Complex** | `--complex` | Full pipeline | YES |

- Behavior:
  1. **Memory‑first context**: searches Workshop and unified memory for Next.js decisions and code.
  2. **Flag detection**:
     - No flag → **Default mode** (light path WITH gates)
     - `-tweak` → **Tweak mode** (light path WITHOUT gates, user verifies)
     - `--complex` → **Complex mode** (full pipeline, spec required)
  3. **Spec gating** (complex only):
     - Requires `.claude/requirements/<id>/06-requirements-spec.md`.
  4. **Routing**:
     - Default/tweak → `nextjs-light-orchestrator` (gates on default only)
     - Complex → full Next.js lane with grand‑architect and gates.
       - In **CSS Architecture Refactor Mode**, complex runs an additional
         `nextjs-css-architecture-gate` to score structural CSS/layout quality
         (global vs local styles, @layer structure, design tokens, duplication).

---

## 3. Pipeline and Phase State

### 3.1 Pipeline Spec

- `docs/pipelines/nextjs-pipeline.md` – describes:
  - Context → planning → customization gate → analysis → implementation
  - Gates: standards + design QA
  - Verification and completion

### 3.2 Phase Config and `phase_state.json`

- `docs/reference/phase-configs/nextjs-phase-config.yaml`
- State is stored in:
  - `.claude/orchestration/phase_state.json`
- Key phases for heavy tasks:
  - `context_query` – ProjectContext + memory summary
  - `requirements_impact` – impact classification
  - `planning` – architecture path and stepwise plan
  - `analysis` – layout and component tree
  - `implementation` – `nextjs-builder` changes + `ra_events`
  - `design_qa` – design QA gate
  - `standards` – standards gate (RA‑aware)
  - `verification` – build/test verification

Response Awareness:
- `implementation` outputs include `ra_events`.
- `standards` outputs include an RA audit (`ra_audit`) of tags seen.

---

## 4. Agents

### 4.1 Heavy Lane Agents (Full Pipeline)

Core agents (all Opus 4.6):

- `agents/nextjs/nextjs-grand-architect.md`
  - Orchestrates the entire Next.js lane.
  - Chooses architecture path (App Router vs Pages, RSC vs client).
  - Assembles task force and coordinates phases.

- `agents/nextjs/nextjs-architect.md`
  - Plans the change:
    - `requirements_impact` → change type, affected routes/components.
    - `planning` → architecture path, plan summary, assigned agents.
  - Uses RA tags (`#PATH_DECISION`, `#PATH_RATIONALE`) for important decisions.

- `agents/nextjs/nextjs-layout-analyzer.md`
  - Analyzes layout structure, component hierarchy, style sources.

- `agents/nextjs/nextjs-builder.md`
  - Implements plan under constraints:
    - Edit‑not‑rewrite.
    - Design tokens; no inline styles. CSS-agnostic.
  - Emits `ra_events` during implementation.

- `agents/nextjs/nextjs-standards-enforcer.md`
  - Standards gate:
    - Code quality, architecture, design token usage.
    - Reads `ra_events` and produces `ra_audit`.

- `agents/nextjs/nextjs-design-reviewer.md`
  - Design QA gate:
    - Visual quality, design DNA, responsive behavior.

- `agents/nextjs/nextjs-verification-agent.md`
  - Runs lint/build/tests; drives the build gate.

Specialists:

- `nextjs-css-specialist` (semantic CSS), `nextjs-layout-specialist`, `nextjs-typescript-specialist`,
  `nextjs-performance-specialist`, `nextjs-accessibility-specialist`,
  `nextjs-seo-specialist` -- all under `agents/nextjs/`.
- `tailwind-specialist` (if Tailwind detected), `shadcn-specialist` (if shadcn detected)
  -- cross-cutting agents under `agents/dev/`.

### 4.2 Light Lane Agent

- `agents/nextjs/nextjs-light-orchestrator.md`
  - Handles **default** and **tweak** modes.
  - Simplified flow:
    - Minimal context (small ProjectContext or grep).
    - Route directly to `nextjs-builder` (+ at most one specialist).
    - **Default mode**: Runs gates (`nextjs-standards-enforcer` + `nextjs-design-reviewer`)
    - **Tweak mode** (`-tweak`): Skips gates (user verifies)
  - Escalates back to full `/nextjs --complex` when it detects hidden complexity.

---

## 5. Skills and Knowledge

### Domain Skills

- `skills/nextjs-knowledge-skill/SKILL.md`
  - Next.js concepts, App Router patterns, RSC/client boundaries, data fetching.
- `skills/design-dna-skill/SKILL.md`
  - Design tokens and design DNA behavior.
- `skills/design-qa-skill/SKILL.md`
  - Design QA heuristics and checks.

### Universal Skills

All 14 Next.js agents now reference these 5 universal skills:

- `skills/cursor-code-style/SKILL.md` - Variable naming, control flow, comments
- `skills/lovable-pitfalls/SKILL.md` - Common mistakes to avoid
- `skills/search-before-edit/SKILL.md` - Always grep before modifying files
- `skills/linter-loop-limits/SKILL.md` - Max 3 attempts on linter errors
- `skills/debugging-first/SKILL.md` - Debug tools before code changes

### Lane-Specific Patterns

Next.js builder agents have inline V0/Lovable design rules:

- **Color:** Maximum 3-5 colors total (COUNT EXPLICITLY)
- **Typography:** Maximum 2 font families
- **Contrast:** WCAG 4.5:1 for normal text, 3:1 for large text
- **Component Size:** <50 lines per component
- **Spacing:** Use proper scale (4, 8, 12, 16, 24, 32, 48, 64)
- **Touch targets:** Minimum 44x44px on mobile

### Agent-Level Learning

Agents can discover and persist patterns to `.claude/agent-knowledge/nextjs-builder/patterns.json`.

---

## 6. Memory Integration

Two primary commands:

- `/project-memory` – Workshop:
  - `status`, `why`, `decide`, `gotcha`, `recent`, `search`, `review`.
  - Stores decisions, gotchas, and session summaries that later appear
    as `relatedStandards` / `pastDecisions` in ContextBundle.
- `/project-code` – code-index.db + Context7:
  - `sync`, `search`, `symbol`, `files`, `docs <library> [topic]`.
  - Semantic + symbol search across code plus library docs.

Unified memory search:

- The OS 5.2 hooks and scripts provide a unified search that:
  - Queries Workshop and code-index.db together.
  - Is used by `/orca` and `/nextjs` before ProjectContext.

---

## 7. Response Awareness & Gates

- RA tags:
  - Architects/builders tag decisions and assumptions:
    - `#PATH_DECISION`, `#PATH_RATIONALE`, `#COMPLETION_DRIVE`, etc.
- Standards gate:
  - Scans for RA tags and reports on them in `ra_audit`.
  - Critical RA signals (e.g. unresolved safety assumptions) influence
    gate decision.

This ties in with `/audit`, which can inspect RA events across tasks to
promote new standards or adjust defaults.

---

## 8. Quick Mental Model

For Next.js work in OS 5.2 (routing modes):

| Mode | Command | Path |
|------|---------|------|
| **Default** | `/nextjs "fix spacing"` | Light + gates |
| **Tweak** | `/nextjs -tweak "try padding"` | Light, no gates |
| **Complex** | `/nextjs --complex "auth flow"` | Full pipeline |

- **Most work**: Default mode (light path WITH gates)
- **Exploration**: Tweak mode (light path, no gates, you verify)
- **Features**: Complex mode (full pipeline, spec required)
- Memory and RA run through everything:
  - Unified memory first.
  - Specs and RA tags guide architecture and gates.
