---
status: draft
note: "Design pipeline concept from early OS versions. Not fully integrated -- has no dedicated command or phase config. Consider deprecating or refreshing for OS 5.1."
---

# Design Domain Pipeline

**Status:** OS 5.1 Pipeline (DesignPipeline)
**Last Updated:** 2025-11-27

The design pipeline handles design-first work: turning briefs and visual inputs
into structured design artifacts (`design-dna.json`, component/layout specs,
and optional Figma/HTML exports) that downstream pipelines (nextjs, brand)
can implement.

It combines:
- OS 5.1 primitives (ProjectContextServer, `phase_state.json`, code-index.db, Workshop)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- Design agents:
  - `design-system-architect` (lead)
  - `design-token-guardian` (validation)

**Entry Points:**
- `/design-dna` command - for design system work
- `/orca` with design-detected task - routes to design-system-architect

**Note:** The design pipeline is specialist-based (no grand-architect). Tasks route through `/orca` which delegates to `design-system-architect` to lead the workflow.

---
## Overview

High‑level flow:

```
Request (design-heavy)
    ↓
[Phase 1: Context & Brief]
    ↓
[Phase 2: Design Exploration]
    ↓
[Phase 3: System & Components]
    ↓
[Phase 4: Exports & Handoff]
    ↓
[Phase 5: Design QA Gate]
    ↓
[Phase 6: Completion]
```

Design work is domain‑specific but still follows OS principles:
- Context is mandatory (ProjectContextServer).
- Design-dna is the machine source of truth.
- Constraints (minimums, tokens, CSS architecture) are enforced.

---
## Phase 1: Context & Brief

**Agents:**  
- `/orca` (orchestrator)  
- ProjectContextServer (MCP)  
- Design brief helper (requirements pipeline, optional)

**Inputs:**
- User request (design‑heavy).  
- Optional visual inputs (screenshots/mockups) handled by the image/visual
  pipeline (see `visual-layout-analyzer` once implemented).

**Tasks:**
1. Use ProjectContextServer to load:
   - `designSystem` (existing `design-dna.json`, if present).
   - `relevantFiles` (design system docs, CSS architecture, key components).
   - `relatedStandards` (design standards in `code-index.db`).
2. If no structured brief exists, optionally invoke the requirements pipeline
   to create a short design brief document for this task.

**Outputs:**
- Brief/intent for the design task.  
- ContextBundle recorded in `phase_state.json` under a `design` domain.

---
## Phase 2: Design Exploration

**Agents (inspired by design-with-claude collection):**
- `design-creative-director` – overall concept & direction.
- `design-ui-designer` – UI structure and component-level decisions.
- `design-brand-strategist` – brand, voice, and visual language alignment.

**Inputs:**
- Design brief (from Phase 1).  
- ContextBundle, including any design-system docs:
  - `design-system-vX.X.md`
  - `bento-system-vX.X.md`
  - `CSS-ARCHITECTURE.md`

**Tasks:**
1. Propose design direction (layout, tone, key components) consistent with
   existing design system and brand.
2. Identify whether the request:
   - Reuses the current design system as‑is.
   - Extends it with new tokens/components.
   - Requires a scoped “micro‑system” for a new surface.

**Outputs:**
- Short design exploration summary:
  - Concept.
  - Layout primitives.
  - Components needed.
  - Which parts of the existing design system are reused vs extended.

---
## Phase 3: System & Components

**Agents:**
- `design-system-architect` – maps concepts to tokens/components.
- `design-component-author` – defines component structures & variants.

**Inputs:**
- Exploration summary from Phase 2.  
- Existing `design-dna.json` (if present) and source docs.

**Tasks:**
1. Update or synthesize `design-dna` fields for this task:
   - `tokens` (typography/colors/spacing) – reusing existing tokens where
     possible; new tokens only when justified.
   - `components` – especially bento cards, prose/article containers, navigation
     shells, or other named patterns.
   - `rules` – additional hard rules specific to this request (if any).
   - `css_architecture` references – which CSS files and modules are expected
     to host the implementation.
2. Produce a compact **implementation spec** for nextjs that describes:
   - Which components/pages are in scope.
   - Which design tokens and component variants they should use.
   - Any layout constraints or bento patterns to follow.

**Outputs:**
- Updated `design-dna.json` draft (schema per `docs/design/design-dna-schema.md`).  
- Implementation spec file, e.g.:
  - `.claude/design/specs/YYYY-MM-DD-[slug].md`

---
## Phase 4: Exports & Handoff (Optional)

**Agents/Tools:**
- Design export agent (can invoke CLI tools like design-with-claude).  
- Figma/export helpers if configured.

**Inputs:**
- Updated `design-dna.json`.  
- Implementation spec.

**Tasks:**
1. Optionally generate external artifacts:
   - Figma files with tokens/components/layouts.
   - HTML prototypes.
   - Storybook scaffolds.
2. Ensure artifacts are consistent with `design-dna.json` and the CSS
   architecture (e.g. tokens map directly to `css/design-system-tokens.css`).

**Outputs:**
- Exported design artifacts (paths recorded in `phase_state.json`).  
- Handoff note for the nextjs pipeline.

---
## Phase 5: Design QA Gate

**Agents:**
- `nextjs-design-reviewer` (reused from nextjs; review is design‑only
  at this stage, no implementation yet).

**Inputs:**
- Updated `design-dna.json`.  
- Implementation spec.  
- Any exports or visual references produced.

**Tasks:**
1. Review the proposed design against:
   - Existing design system docs.
   - Hard rules (typography minimums, spacing grid, color usage).
2. Compute a **Design Gate Score (0–100)**:
   - ≥ 90 → PASS.
   - 80–89 → CAUTION (acceptable with caveats).
   - < 80 → FAIL (requires revision).

**Outputs:**
- Design QA report summarizing:
  - Strengths/weaknesses.
  - Rule compliance.
  - Any required changes before implementation.

---
## Phase 6: Completion

**Agents:**  
- `/orca` (orchestrator)

**Tasks:**
1. Ensure:
   - `design-dna.json` is updated and stored.  
   - Implementation spec exists and is accessible to nextjs/expo pipelines.
   - Any design artifacts paths are recorded in `phase_state.json`.
2. Record decisions in `code-index.db`:
   - `decisions` – key design choices and rationale.  
   - `standards` – new rules that should be enforced by gate agents.  
   - `task_history` – linkage between this design task and future implementation.

**Outputs:**
- Completed design phase, ready for nextjs/brand pipelines to consume.
- Updated `phase_state.json` marking the design pipeline as `completed` or
  `completed_with_caveats`.
