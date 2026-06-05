# Django + React TypeScript Domain Pipeline

**Status:** OS 7.0 Core Pipeline
**Last Updated:** 2026-02-13

## Overview

The Django + React pipeline handles **full-stack development** combining Django backend (with Django REST Framework) and React TypeScript frontend. It features:

- OS 7.0 primitives (ProjectContextServer, phase_state.json, code-index.db, Workshop, constraint framework)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- Four-tier routing (Light/Default/Tweak/Complex with default running gates)
- Spec gating (complex tasks require requirements spec)
- Response Awareness tagging (RA tags surface assumptions and decisions)
- API contract flow (OpenAPI schema generation, TypeScript client generation)
- End-to-end type safety from Django serializers to React components
- Full pipeline agents (13 agents total)

**Core Principles:**
1. Context is MANDATORY - No work without ContextBundle
2. API contracts drive type safety - OpenAPI schemas generate TypeScript clients
3. Edit, never rewrite - Respect existing code
4. Gates are strict - Must pass 90+ scores (backend and frontend)
5. Maximum 2 implementation passes

**Tooling (CRITICAL):**
- Backend: **`uv`** (NOT pip) - `uv run pytest`, `uv run manage.py`
- Frontend: **`bun`** (NOT npm) - `bun test`, `bun run build`

**Orchestration:**
- Django + React work SHOULD be run via the `/django-react` command.
- Phase state is tracked in `.orca/orchestration/phase_state.json` using the contract in `docs/reference/phase-configs/django-react-phase-config.yaml`.

---

## Four-Tier Routing (OS 7.0)

The Django + React pipeline uses four-tier routing:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work -- fast with quality |
| **Tweak** | `-tweak` | Builder direct | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Full pipeline | YES | Architecture, multi-endpoint, specs |

### Default Mode (Light + Gates)

Most tasks take this path. Fast execution with automated quality checks.

```bash
/django-react "fix serializer validation"     # -> light orchestrator -> builder -> gates
/django-react "update user profile endpoint"  # -> light orchestrator -> builder -> gates
```

**Gates run:** `django-react-standards-enforcer`

### Tweak Mode (`-tweak`)

Pure speed path. User explicitly accepts responsibility for verification.

```bash
/django-react -tweak "fix form error message"   # -> light orchestrator -> builder -> done
```

### Complex Mode (`--complex`)

Full pipeline with grand-architect planning. Spec required.

```bash
/django-react --complex "implement auth system"     # -> full pipeline
/django-react "build multi-step checkout flow"      # Auto-routes to --complex
```

| Tier | Files | Spec Required | Example |
|------|-------|---------------|---------|
| Default | 1-5 | No | Fix validation, change API field, update component |
| Tweak | 1-3 | No | Rapid iteration, exploring options |
| Complex | 5+ | **Required** | Multi-endpoint feature, auth UI, migrations |

---

## Agent Roster (13 Agents)

### Orchestration Layer

| Agent | Role | Tools |
|-------|------|-------|
| `django-react-grand-architect` | Tier-S orchestrator, assembles team, drives phases | Task, AskUserQuestion, Read, Grep, Glob, MCP tools |
| `django-react-light-orchestrator` | Light path coordinator (default/-tweak modes) | Task, Read, Grep, Glob, Bash, MCP tools |

### Planning Layer

| Agent | Role | Tools |
|-------|------|-------|
| `django-react-architect` | Plans backend and frontend architecture | Task, Read, Grep, Glob, Bash, AskUserQuestion, MCP tools |

### Implementation Layer

| Agent | Role | Tools |
|-------|------|-------|
| `django-react-builder` | Primary implementation (backend + frontend) | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |

### Django Specialists

| Agent | Role | Tools |
|-------|------|-------|
| `django-master` | Models, ORM, migrations, admin | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |
| `django-api-specialist` | DRF viewsets, serializers, permissions | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |
| `django-security-specialist` | JWT auth, CSRF, permissions, security | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |

### React Specialists

| Agent | Role | Tools |
|-------|------|-------|
| `react-typescript-wizard` | React 18+, hooks, TypeScript patterns | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |
| `react-state-specialist` | TanStack Query, Zustand, form state | Read, Write, Edit, MultiEdit, Grep, Glob, Bash |

### Gate & Verification

| Agent | Role | Tools |
|-------|------|-------|
| `django-react-standards-enforcer` | Code standards for both stacks | Read, Grep, Glob |
| `django-react-verification` | Build/test verification | Read, Grep, Bash |

### API Contract (Referenced)

| Agent | Role | Notes |
|-------|------|-------|
| `api-contract-specialist` | OpenAPI generation, TypeScript client | Used for type-safe API flow |

---

### Recording Context (OS 7.0)

Domain commands inject recording context (recent session history from `.orca/recording.db`) before delegating to agents. This is optional and silently skipped if no recording database exists.

---

## Pipeline Architecture

```
Request
    |
[Phase 1: Context Query] <- MANDATORY
    |
[Phase 2: Grand Architect] <- Complex mode only
    |
[Phase 3: API Contract Design] <- If API changes involved
    |
[Phase 4: Backend Planning]
    |
[Phase 5: Frontend Planning]
    |
[Phase 6: Backend Implementation]
    |
    +-> Django specialists as needed:
        - django-master (models/ORM)
        - django-api-specialist (DRF)
        - django-security-specialist (auth/security)
    |
[Phase 7: API Client Generation] <- TypeScript from OpenAPI
    |
[Phase 8: Frontend Implementation]
    |
    +-> React specialists as needed:
        - react-typescript-wizard (React/TS)
        - react-state-specialist (state)
    |
[Phase 9: Gate Checks]
    Standards Enforcement (backend + frontend)
    API Contract Validation (soft warning)
    |
Decision Point:
 All gates >= thresholds -> [Phase 10: Verification]
 Any gate < threshold -> [Pass 2: Corrective] (ONE pass only)
    |
[Phase 10: Verification]
    Backend: uv run pytest, uv run manage.py check
    Frontend: bun test, bun run build, bun run typecheck
    |
[GATE: Build Gate] <- Must succeed
    |
[Phase 11: Completion]
```

---


### Phase 0: Design-First (Pre-Implementation)

**Agent:** `design-system-architect` (invoked as subagent via Task delegation)

**Purpose:** Enforce design approach quality before any implementation begins. Research from Nov 2025 identified design-first architecture as the top quality driver -- gates exist post-implementation but catch output violations, not approach failures.

**Two Components:**

1. **Manifesto Priming (ALL tiers including tweak)**
   A DESIGN_AWARENESS context block containing five verified LLM failure modes with CSS is injected into ALL delegation prompts. This ensures every agent working on UI has metacognitive awareness of how LLMs actually fail with styling.

2. **Design-DNA Gate (tiered by complexity)**

   | Tier | Gate Behavior |
   |------|---------------|
   | **Tweak** | Manifesto priming only. No file check, no blocking. |
   | **Default** | Check `design-dna.json` existence. If missing, invoke design-system-architect to create it. If exists, inject path. |
   | **Complex** | Always invoke design-system-architect (even if file exists). Block implementation until confirmed. |

**Output:** `design-dna.json` with `methodology` field:
- `"semantic-css"`: includes `roles` + `role_mappings`
- `"tailwind"`: includes `components` + `allowed_utilities`

**Methodology Detection:**
- `tailwind.config.*` or `@import 'tailwindcss'` -> Tailwind mode
- `@layer`, `.module.css`, semantic class naming -> Semantic CSS mode
- No methodology detected -> Default to semantic CSS guidance

**Django-React Frontend Detection:** The design-first phase applies ONLY to tasks touching frontend/React code. Backend-only tasks (APIs, migrations, serializers) skip the design gate entirely.

---

## Phase Definitions

### Phase 1: Context Query (MANDATORY)

**Agent:** ProjectContextServer (MCP tool)

**Input:**
```json
{
  "domain": "django-react",
  "task": "<user request>",
  "projectPath": "<cwd>",
  "maxFiles": 10-20,
  "includeHistory": true
}
```

**Output:** ContextBundle containing:
- `relevantFiles`: Files semantically related to task
- `projectState`: Current Django/React structure
- `pastDecisions`: Previous full-stack decisions
- `relatedStandards`: Standards from memory (workshop/vibe)
- `similarTasks`: Historical task outcomes

**Success Criteria:**
- ContextBundle received
- Relevant files found for both stacks
- Memory context loaded

---

### Phase 2: Grand Architect (Complex Mode)

**Agent:** `django-react-grand-architect`

**Tasks:**
1. Detect full-stack domain requirements
2. Choose backend architecture (DRF viewsets vs generic views, auth method)
3. Choose frontend architecture (React patterns, state management)
4. Decide API contract strategy
5. Assemble task force
6. Record decisions via ProjectContextServer

**Output:**
- Architecture path
- API contract decision
- Type safety flow decision
- Risk assessment
- Task force plan

---

### Phase 3: API Contract Design

**Agent:** `api-contract-specialist`

**Purpose:** Design/update OpenAPI schema before implementation

**When triggered:**
- Task modifies Django models backing API endpoints
- Task adds/modifies DRF serializers or viewsets
- Frontend needs to call new/modified endpoints

**Output:**
- OpenAPI schema path
- Contract changes needed
- drf-spectacular configuration

---

### Phase 4-5: Planning (Backend & Frontend)

**Agent:** `django-react-architect`

**Backend Planning Output:**
- Change type: model_change | view_change | serializer_change | migration
- Affected models, views, serializers
- Migration requirements
- Risks

**Frontend Planning Output:**
- Change type: component | hook | state | type
- Affected components, hooks
- State management changes
- Type updates required

**Response Awareness:** Tags applied during planning:
- `#PATH_DECISION` for architecture choices
- `#PATH_RATIONALE` for reasoning
- `#COMPLETION_DRIVE` for assumptions

---

### Phase 6: Backend Implementation

**Agent:** `django-react-builder` + Django specialists

**Specialists:**
- `django-master` - Models, ORM, migrations, admin
- `django-api-specialist` - DRF viewsets, serializers, permissions
- `django-security-specialist` - JWT auth, CSRF, security

**Tooling (CRITICAL):**
```bash
# Tests
uv run pytest
uv run pytest backend/tests/test_views.py -v

# Django commands
uv run manage.py migrate
uv run manage.py makemigrations
uv run manage.py check
```

**Constraints:**
- Follow plan strictly
- Use design patterns from planning phase
- Run verification after changes
- Emit RA tags for assumptions

---

### Phase 7: API Client Generation

**Agent:** `api-contract-specialist`

**Purpose:** Generate TypeScript client from OpenAPI after backend changes

**Output:**
- TypeScript client path
- Generated types
- Type safety verification

**Tools:** openapi-ts or openapi-generator

---

### Phase 8: Frontend Implementation

**Agent:** `django-react-builder` + React specialists

**Specialists:**
- `react-typescript-wizard` - React 18+, hooks, TypeScript
- `react-state-specialist` - TanStack Query, Zustand, forms

**Tooling (CRITICAL):**
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

**Constraints:**
- Use generated TypeScript types
- Follow TanStack Query patterns for server state
- Use Zustand for client state
- React Hook Form + Zod for forms

---

### Phase 9: Gate Checks

#### Standards Enforcement

**Agent:** `django-react-standards-enforcer`

**Checks:**
- Backend: PEP8, type hints, docstrings, Django patterns
- Frontend: TypeScript strict, React best practices, ESLint

**Thresholds:**
- Backend standards: >= 90 (hard block)
- Frontend standards: >= 90 (hard block)

#### API Contract Gate

**Agent:** `api-contract-specialist`

**Checks:**
- OpenAPI schema alignment
- Type mismatches between backend and frontend

**Threshold:** Soft warning (not blocking)

---

### Phase 10: Verification

**Agent:** `django-react-verification`

**Backend Verification:**
```bash
uv run manage.py check         # Django system check
uv run manage.py migrate --check  # Migration status
uv run pytest -v               # All tests
```

**Frontend Verification:**
```bash
bun run typecheck              # TypeScript
bun run lint                   # ESLint
bun test                       # Tests
bun run build                  # Build
```

**Gate:** Build must succeed (hard block)

---

### Phase 11: Completion

**Tasks:**
1. Verify all gates passed
2. Collect all artifacts
3. Save task history to code-index.db
4. Update phase_state.json to "completed"
5. Generate final summary

---

## Gate Thresholds

| Gate | Threshold | Type |
|------|-----------|------|
| Backend Standards | >= 90 | Hard block |
| Frontend Standards | >= 90 | Hard block |
| API Contract | warn | Soft warning |
| Backend Build | success | Hard block |
| Frontend Build | success | Hard block |

---

## Configuration

### Tooling Preferences

```yaml
backend:
  package_manager: uv
  test_command: "uv run pytest"
  django_commands: "uv run manage.py"
  migration_command: "uv run manage.py migrate"
  check_command: "uv run manage.py check"

frontend:
  package_manager: bun
  test_command: "bun test"
  build_command: "bun run build"
  typecheck_command: "bun run typecheck"
  lint_command: "bun run lint"
```

### File Limits

| Tier | Max Files |
|------|-----------|
| Simple | 5 |
| Medium | 12 |
| Complex | 25 |

### Implementation Pass Limits

```yaml
implementation:
  max_passes: 2
  pass_1: "Initial implementation"
  pass_2: "Corrective only (if gates fail)"
  pass_3: "FORBIDDEN - Never allowed"
```

---

## Example Execution

**Request:** "Add user profile API with avatar upload"

**Phase 1:** Context Query
- Finds: User model, existing serializers, React profile components
- Standards: "Use DRF viewsets", "TanStack Query for API calls"

**Phase 2:** Grand Architect
- Backend: DRF ViewSet with custom upload action
- Frontend: TanStack Query mutation + file input
- API Contract: Add upload endpoint to OpenAPI

**Phase 3:** API Contract Design
- Update OpenAPI schema with profile endpoints
- Define file upload field type

**Phase 4-5:** Planning
- Backend: UserProfileViewSet, ProfileSerializer, upload action
- Frontend: useProfile hook, ProfileForm component, avatar upload

**Phase 6:** Backend Implementation
- Create UserProfileViewSet
- Add ProfileSerializer with ImageField
- Configure upload handling
- Run: `uv run pytest`

**Phase 7:** API Client Generation
- Generate TypeScript types from OpenAPI
- Export ProfileType, UploadResponse

**Phase 8:** Frontend Implementation
- Create useProfile hook with TanStack Query
- Build ProfileForm with React Hook Form
- Add avatar upload with preview
- Run: `bun test`, `bun run build`

**Phase 9:** Gates
- Backend standards: 95 (PASS)
- Frontend standards: 92 (PASS)
- API contract: Aligned (PASS)

**Phase 10:** Verification
- `uv run pytest` - All pass
- `bun test` - All pass
- `bun run build` - Success

**Result:** Success, all gates passed

---

_Last updated: 2026-02-13_
_Version: 3.0.0_
