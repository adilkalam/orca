# OS 4.2 Django + React Lane Readme

**Lane:** Django + React TypeScript Full-Stack
**Domain:** `django-react`
**Entrypoints:** `/plan`, `/orca`, `/django-react`, `/project-memory`, `/project-code`

This document explains how the Django + React lane works in Vibe OS 4.2:

- How planning and specs work (`/plan`)
- How orchestration routes (`/orca`, `/django-react`)
- How the pipeline and phase state are structured
- Which agents and skills are involved
- How memory and Response Awareness integrate

---

## 1. When to Use the Django + React Lane

Use this lane when the task is clearly **Django backend + React TypeScript frontend** work:

- Django models, views, serializers (DRF)
- React components, hooks, state management
- Full-stack features spanning both layers
- API endpoint development with frontend integration
- Authentication, permissions, security

Examples:

- "Add user profile API and display it in React"
- "Implement JWT authentication with login form"
- "Build product listing with filtering"

---

## 2. Core Commands and Flow

### 2.1 Planning - `/plan`

For non-trivial work, always start with `/plan`:

- Creates a requirements folder:
  - `.claude/requirements/YYYY-MM-DD-HHMM-<slug>/`
- Populates:
  - `00-initial-request.md`
  - Discovery & detail Q/A (`01-05-*`)
  - `06-requirements-spec.md` - final spec
  - `metadata.json` - phase and progress tracking
- Integrates Response Awareness tags in the spec (e.g., `#PATH_DECISION`).

For **complex** Django + React tasks the spec is **required** before the full lane runs.

---

### 2.2 Global Orchestrator - `/orca`

`/orca` is the pure OS 4.2 orchestrator:

- Checks Workshop + vibe.db first (memory-first).
- Checks for an active requirements spec.
- Detects that the task is Django + React work.
- Routes to `/django-react` with:
  - Request summary
  - Any memory hits
  - Info about requirements/specs, if present

You can also call `/django-react` directly.

---

### 2.3 Django + React Orchestrator - `/django-react`

File: `commands/django-react.md`

- Accepts:

  ```bash
  /django-react "add user profile endpoint"              # Default: light + gates
  /django-react -tweak "fix form validation"             # Tweak: light, no gates
  /django-react --complex "implement auth flow"          # Complex: full pipeline
  /django-react "implement requirement <id>"             # With spec
  ```

- **Three-Tier Routing (OS 4.2):**

  | Mode | Flag | Path | Gates |
  |------|------|------|-------|
  | **Default** | (none) | Light + Gates | YES |
  | **Tweak** | `-tweak` | Light (pure) | NO |
  | **Complex** | `--complex` | Full pipeline | YES |

- Behavior:
  1. **Memory-first context**: searches Workshop and unified memory for Django/React decisions and code.
  2. **Flag detection**:
     - No flag -> **Default mode** (light path WITH gates)
     - `-tweak` -> **Tweak mode** (light path WITHOUT gates, user verifies)
     - `--complex` -> **Complex mode** (full pipeline, spec required)
  3. **Spec gating** (complex only):
     - Requires `.claude/requirements/<id>/06-requirements-spec.md`.
  4. **Routing**:
     - Default/tweak -> `django-react-light-orchestrator` (gates on default only)
     - Complex -> full Django + React lane with grand-architect and gates.

---

## 3. Pipeline and Phase State

### 3.1 Pipeline Spec

- `docs/pipelines/django-react-pipeline.md` - describes:
  - Context -> planning -> API contract -> implementation
  - Gates: backend standards + frontend standards
  - Verification and completion

### 3.2 Phase Config and `phase_state.json`

- `docs/reference/phase-configs/django-react-phase-config.yaml`
- State is stored in:
  - `.claude/orchestration/phase_state.json`
- Key phases for heavy tasks:
  - `context_query` - ProjectContext + memory summary
  - `api_contract_design` - OpenAPI schema design (unique to this lane)
  - `backend_planning` - Django architecture path
  - `frontend_planning` - React architecture path
  - `backend_implementation` - Django code changes + `ra_events`
  - `api_client_generation` - TypeScript from OpenAPI (unique to this lane)
  - `frontend_implementation` - React code changes + `ra_events`
  - `gates` - standards gate results
  - `verification` - build/test verification

Response Awareness:
- `implementation` outputs include `ra_events`.
- `gates` outputs include an RA audit (`ra_audit`) of tags seen.

---

## 4. Agents (13 Total)

### 4.1 Heavy Lane Agents (Full Pipeline)

Core agents (all Opus 4.5):

- `agents/django-react/django-react-grand-architect.md`
  - Orchestrates the entire Django + React lane.
  - Chooses backend and frontend architecture paths.
  - Assembles task force and coordinates phases.

- `agents/django-react/django-react-architect.md`
  - Plans the change:
    - `backend_planning` -> models, views, serializers, migrations.
    - `frontend_planning` -> components, hooks, state, types.
  - Uses RA tags (`#PATH_DECISION`, `#PATH_RATIONALE`) for important decisions.

- `agents/django-react/django-react-builder.md`
  - Implements plan under constraints:
    - Edit-not-rewrite.
    - Follow tooling: `uv` for Python, `bun` for frontend.
  - Emits `ra_events` during implementation.

**Django Specialists:**

- `agents/django-react/django-master.md`
  - Models, ORM, migrations, admin.

- `agents/django-react/django-api-specialist.md`
  - DRF viewsets, serializers, permissions.

- `agents/django-react/django-security-specialist.md`
  - JWT auth, CSRF, permissions, security.

**React Specialists:**

- `agents/django-react/react-typescript-wizard.md`
  - React 18+, hooks, TypeScript patterns.

- `agents/django-react/react-state-specialist.md`
  - TanStack Query, Zustand, form state.

**Gate & Verification:**

- `agents/django-react/django-react-standards-enforcer.md` (referenced)
  - Code standards for both stacks.

- `agents/django-react/django-react-verification.md`
  - Build/test verification.

### 4.2 Light Lane Agent

- `agents/django-react/django-react-light-orchestrator.md`
  - Handles **default** and **tweak** modes.
  - Simplified flow:
    - Minimal context (small ProjectContext or grep).
    - Route directly to `django-react-builder` (+ specialists).
    - **Default mode**: Runs gates (`django-react-standards-enforcer`)
    - **Tweak mode** (`-tweak`): Skips gates (user verifies)
  - Escalates back to full `/django-react --complex` when it detects hidden complexity.

---

## 5. Tooling (CRITICAL)

### Backend (Django) - Use `uv`

**NEVER use pip, python, or ./manage.py directly.**

```bash
# Tests
uv run pytest
uv run pytest backend/tests/test_views.py -v

# Django commands
uv run manage.py migrate
uv run manage.py makemigrations
uv run manage.py check

# Shell
uv run manage.py shell
```

### Frontend (React) - Use `bun`

**NEVER use npm, yarn, or npx directly.**

```bash
# Tests
bun test
bun test src/components/__tests__/

# Build
bun run build

# Type checking
bun run typecheck

# Lint
bun run lint
```

---

## 6. Skills and Knowledge

### Domain Skills

All Django + React agents apply:

- `skills/cursor-code-style/SKILL.md` - Variable naming, control flow, comments
- `skills/lovable-pitfalls/SKILL.md` - Common mistakes to avoid
- `skills/search-before-edit/SKILL.md` - Always grep before modifying files
- `skills/linter-loop-limits/SKILL.md` - Max 3 attempts on linter errors
- `skills/debugging-first/SKILL.md` - Debug tools before code changes

### Agent-Level Learning

Agents can discover and persist patterns to `.claude/agent-knowledge/<agent-name>/patterns.json`.

---

## 7. Memory Integration

Two primary commands:

- `/project-memory` - Workshop:
  - `status`, `why`, `decide`, `gotcha`, `recent`, `search`, `review`.
  - Stores decisions, gotchas, and session summaries that later appear
    as `relatedStandards` / `pastDecisions` in ContextBundle.
- `/project-code` - vibe.db + Context7:
  - `sync`, `search`, `symbol`, `files`, `docs <library> [topic]`.
  - Semantic + symbol search across code plus library docs.

Unified memory search:

- The OS 4.2 hooks and scripts provide a unified search that:
  - Queries Workshop and vibe.db together.
  - Is used by `/orca` and `/django-react` before ProjectContext.

---

## 8. Response Awareness & Gates

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

## 9. Quick Mental Model

For Django + React work in OS 4.2 (three-tier routing):

| Mode | Command | Path |
|------|---------|------|
| **Default** | `/django-react "add endpoint"` | Light + gates |
| **Tweak** | `/django-react -tweak "fix validation"` | Light, no gates |
| **Complex** | `/django-react --complex "auth system"` | Full pipeline |

- **Most work**: Default mode (light path WITH gates)
- **Exploration**: Tweak mode (light path, no gates, you verify)
- **Features**: Complex mode (full pipeline, spec required)
- Memory and RA run through everything:
  - Unified memory first.
  - Specs and RA tags guide architecture and gates.

---

## 10. Common Commands Reference

### Quick Fix (No Gates)

```bash
/django-react -tweak "fix email validation in UserSerializer"
```

Result: Light orchestrator -> builder -> done (fast iteration)

### Standard Work (With Gates)

```bash
/django-react "add phone field to user profile"
```

Result: Light orchestrator -> builder -> standards gate -> done

### Feature Development

```bash
# First, create spec
/plan "implement user authentication with JWT"

# Then, implement
/django-react --complex "implement requirement 2025-01-15-0930-auth"
```

Result: Grand architect -> full pipeline -> all gates -> verification

### Audit Mode

```bash
/django-react --audit "review API security"
```

Result: Security specialist audit -> report (no code changes)

---

## 11. API Contract Flow

For type-safe full-stack development:

1. **Backend first**: Implement Django models and DRF serializers
2. **OpenAPI generation**: Use drf-spectacular to generate schema
3. **TypeScript generation**: Use openapi-ts to generate client types
4. **Frontend**: Use generated types in React components

```bash
# After backend changes
uv run manage.py spectacular --file schema.yaml

# Generate TypeScript client
bunx openapi-ts schema.yaml -o src/api/

# Frontend now has typed API calls
```

---

_Last updated: 2025-12-15_
_Version: 3.0.0_
