# Requirements Domain Pipeline

**Status:** OS 3.0 Core Requirements Pipeline
**Last Updated:** 2025-11-27

## Overview

The requirements pipeline turns fuzzy feature requests into **structured, code-aware specs** before any heavy implementation. It combines:

- OS 3.0 primitives (ProjectContextServer, phase_state.json, vibe.db, Workshop)
- The Claude Requirements Builder workflow (00–06 docs)
- Response Awareness tags for metacognitive tracking
- **Three-tier planning depth** matching `/orca-*` execution tiers

Output: a durable `06-requirements-spec.md` that upstreams into `/orca` domain pipelines.

## Role in OS 3.0

**The requirements pipeline is NOT a separate execution path.** It is:

1. **Implemented by `/plan`** - The `/plan` command creates requirements specs
2. **Consumed by domain orchestrators** - `/orca-{domain}` commands read specs
3. **Required for complex tasks** - Spec gating blocks complex work without specs

### When Requirements Are Created

- **User runs `/plan <description>`** → Creates `.claude/requirements/<id>/06-requirements-spec.md`
- **Complex task detected by `/orca-{domain}`** → User prompted to run `/plan` first

### When Requirements Are Consumed

- **Domain orchestrators** check for `requirements_spec_path` in phase_state
- **Architects** (nextjs-architect, expo-architect-agent, ios-architect) read spec first
- **Spec is authoritative** - constraints and acceptance criteria override analysis

### Three-Tier Planning Depth (OS 3.0)

`/plan` supports three planning depths that align with `/orca-*` execution tiers:

| Flag | Planning Depth | Phases Used | Output |
|------|----------------|-------------|--------|
| `-tweak` | **Quick** | Skip discovery, 2-3 scope questions | Minimal spec |
| (default) | **Standard** | Full 5+5 questions | Complete spec |
| `-complex` | **Deep** | Full questions + risk analysis | Multi-phase spec |

**Tier passthrough:** The spec's `tier` metadata tells `/orca-*` which execution depth to use:
- `-tweak` spec → `-tweak` execution (light orchestrator, minimal gates)
- Standard spec → Default execution (full pipeline)
- `-complex` spec → `-complex` execution (extended gates, multi-phase)

**Auto-detection:** If no flag is provided, `/plan` analyzes the task and recommends a tier. User can override.

### Complexity Gating (OS 3.0)

| Complexity | Spec Required | Behavior |
|------------|---------------|----------|
| Simple | No | Direct to light orchestrator |
| Medium | Recommended | Full pipeline, spec helpful |
| Complex | **Required** | BLOCKED until `/plan` creates spec |

---

## File Structure

Requirements live under:

```text
.claude/requirements/
 .current-requirement          # Name of active requirement folder (if any)
 index.md                      # Summary of all requirements
 YYYY-MM-DD-HHMM-slug/         # Individual requirement folders
     metadata.json             # Status and progress tracking
     00-initial-request.md     # User's original request
     01-discovery-questions.md # 5 context questions
     02-discovery-answers.md   # User's answers
     03-context-findings.md    # AI's code/context analysis
     04-detail-questions.md    # 5 expert questions
     05-detail-answers.md      # User's detailed answers
     06-requirements-spec.md   # Final requirements spec
```

This structure is shared by:
- `/requirements-*` commands
- `/response-awareness-plan` and `/response-awareness-implement` (when used)
- Domain pipelines that consume requirements specs as input.

---

## Phase Architecture

High-level flow:

```text
User Request
    ↓
[/requirements-start]            ← Phase 0/1: Setup + Initial Context
    ↓
Discovery Questions (5 yes/no)   ← Phase 2
    ↓
Context Findings (code-aware)    ← Phase 3
    ↓
Expert Questions (5 yes/no)      ← Phase 4
    ↓
Requirements Spec (06-*.md)      ← Phase 5
    ↓
[/orca] activates domain pipeline with spec
```

Requirements are domain-agnostic; domain pipelines (webdev, expo, ios, data, seo)
read the spec and map it into their own phases.

---

## Phase Definitions

### Phase 0/1: Initial Setup & Context

**Command:** `/requirements-start`  
**Agents:** Requirements helper (command), ProjectContextServer

Tasks:
- Create timestamped requirement folder:
  - `.claude/requirements/YYYY-MM-DD-HHMM-[slug]`
- Write:
  - `00-initial-request.md` with user request.
  - `metadata.json` with:
    - `id`, `started`, `lastUpdated`, `status`, `phase`, `progress`, `contextFiles`.
  - Update `.claude/requirements/.current-requirement` with folder name.
- Call `ProjectContextServer.query_context`:
  - `domain`: inferred from request (`webdev`, `expo`, etc.).
  - `task`: user request.
  - `projectPath`: repo root.
- Seed `.claude/orchestration/phase_state.json`:
  - Add/merge a `requirements` phase with:
    - `status`, `requirement_id`, `folder`, `spec_path` (once available).

Output:
- Initialized requirement folder.
- Initial context from ProjectContextServer.

---

### Phase 2: Discovery Questions (5 Yes/No)

**Commands:** `/requirements-start`, `/requirements-status`  
**Files:** `01-discovery-questions.md`, `02-discovery-answers.md`

Tasks:
- Generate **5 high-level yes/no questions** about:
  - User interactions & workflows.
  - Devices/surfaces (mobile/desktop).
  - Data sensitivity.
  - Existing workarounds.
  - Offline or special constraints.
- Write all 5 questions (with smart defaults) to `01-discovery-questions.md` before asking any.
- Ask questions **one at a time** with default explicitly shown.
- Record answers in `02-discovery-answers.md` once all 5 have been asked.
- Update `metadata.json.progress.discovery`.

Constraints:
- Yes/no only + `idk` (use documented default).
- No implementation; stay at problem/behavior level.

---

### Phase 3: Targeted Context Findings

**Command:** `/requirements-status` (auto-advances)  
**File:** `03-context-findings.md`  
**Agents:** Requirements helper + ProjectContextServer

Tasks:
- Use ContextBundle (and any tools like `Read`, `Grep`, `Glob`) to:
  - Identify specific files likely involved.
  - Find similar existing features.
  - Note architectural patterns and constraints.
- Document in `03-context-findings.md`:
  - `files_to_touch`
  - `similar_features`
  - `patterns_to_follow`
  - `constraints` (perf, security, platform).
- Update `metadata.json.contextFiles` and `phase` to `"context"`.

Optional:
- Apply Response Awareness tags in findings where appropriate:
  - e.g. `#PATH_DECISION`, `#POISON_PATH`, `#COMPLETION_DRIVE`.

---

### Phase 4: Expert Requirements Questions (5 Yes/No)

**Commands:** `/requirements-status`, `/requirements-remind`  
**Files:** `04-detail-questions.md`, `05-detail-answers.md`

Tasks:
- Generate 5 detailed yes/no questions as if talking to a non-technical PM:
  - Reference specific files/components from `03-context-findings.md`.
  - Clarify architecture choices, data flows, integrations, and edge cases.
- Write all 5 questions (with defaults) to `04-detail-questions.md`.
- Ask them one at a time.
- Record answers in `05-detail-answers.md` after all have been asked.
- Update `metadata.json.progress.detail` and `phase`.

Constraints:
- Still no implementation.
- Keep questions concrete and tied to observed code structure.

---

### Phase 5: Requirements Spec

**Command:** `/requirements-end`  
**File:** `06-requirements-spec.md`

Tasks:
- Generate a structured spec combining:
  - Problem statement & overview.
  - Functional requirements (from all yes/no answers).
  - Technical requirements with explicit file paths.
  - Implementation hints & patterns (from context findings).
  - Acceptance criteria.
  - **Assumptions** for any unanswered questions (prefixed `ASSUMED:`).
- Update `metadata.json.status` to `"complete"` or `"incomplete"` depending on user choice.
- Clear or update `.current-requirement` (depending on end option).
- Append/refresh entry in `.claude/requirements/index.md`.
- Log a `save_decision` to `vibe.db` summarizing the requirement.
- Update `phase_state.json`:
  - Mark `requirements` phase as `"completed"`.
  - Store final `spec_path`.

Output:
- Durable spec that `/orca` and domain pipelines can consume.

---

## Commands Summary

- `/requirements-start [description]` – create requirement folder and begin Discovery.
- `/requirements-status` – show progress and continue asking questions / advance phases.
- `/requirements-current` – view full status (read-only).
- `/requirements-end` – finalize (spec, incomplete, or cancel/delete).
- `/requirements-list` – list all requirements and their status.
- `/requirements-remind` – reinforce requirements rules if behavior drifts.

All commands MUST:
- Respect the 00–06 file structure.
- Use ProjectContextServer for context-aware analysis.
- Avoid implementation – they exist purely for requirements.
