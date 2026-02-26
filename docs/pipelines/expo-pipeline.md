# Expo / React Native Domain Pipeline

**Status:** OS 6.4 Core Pipeline (ExpoPipeline)
**Last Updated:** 2026-02-13

## Overview

The Expo pipeline handles **React Native mobile development** for projects using Expo SDK 50+ / React Native 0.74+ with TypeScript. It combines:

- OS 6.4 primitives (ProjectContextServer, phase_state.json, code-index.db, Workshop, constraint framework)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- Four-tier routing (Light/Default/Tweak/Complex)
- Spec gating (complex tasks require requirements spec)
- Response Awareness tagging (RA tags surface assumptions and decisions)
- SenaiVerse's Expo agent system (Grand Orchestrator + design/a11y/perf/security agents)
- React Native best practices (from Agent Farm's REACT_NATIVE_BEST_PRACTICES)

Goal: build and maintain high-quality Expo apps with structural guarantees around design tokens, accessibility, performance, and security.

---
## Scope & Domain

Use this pipeline when:
- The task clearly concerns an Expo/React Native mobile app
  (keywords: "Expo", "React Native", "mobile app", "iOS app", "Android app").
- The repo contains typical Expo/RN surfaces:
  - `app.json`, `app.config.*`, `App.tsx`/`App.js`.
  - `app/**`, `src/**`, `screens/**`, `navigation/**`, `ios/**`, `android/**`.

If the work is purely web/frontend (Next.js/React without mobile shells), use
the **nextjs** pipeline instead. If it targets pure native iOS without Expo,
use the **iOS** pipeline.

---

## Four-Tier Routing (OS 6.4)

The Expo pipeline uses four-tier routing:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work -- fast with quality |
| **Tweak** | `-tweak` | Builder direct | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Full pipeline | YES | Architecture, multi-file, specs |

### Default Mode (Light + Gates)

Most tasks take this path. Fast execution with automated quality checks.

```bash
/expo "fix button spacing"        # → light orchestrator → builder → gates
/expo "change label text"         # → light orchestrator → builder → gates
```

**Gates run:** `design-token-guardian` + `expo-aesthetics-specialist`

### Tweak Mode (`-tweak`)

Pure speed path. User explicitly accepts responsibility for verification.

```bash
/expo -tweak "fix padding"        # → light orchestrator → builder → done
```

### Complex Mode (`--complex`)

Full pipeline with grand-orchestrator planning. Spec required.

```bash
/expo --complex "implement auth flow"   # → full pipeline
/expo "build offline sync"              # Auto-routes to --complex
```

| Tier | Files | Spec Required | Example |
|------|-------|---------------|---------|
| Default | 1-5 | No | Fix spacing, change label, add haptic |
| Tweak | 1-3 | No | Rapid iteration, exploring options |
| Complex | 5+ | **Required** | Multi-screen flow, auth, offline |

---

## Standards Inputs (OS 6.4 Learning Loop)

Standards flow into and out of the Expo pipeline:

### Input Sources

1. **ContextBundle.relatedStandards** (from ProjectContext/code-index.db)
   - Expo/React Native-specific standards saved from past tasks
   - Architecture decisions and patterns
   - Gotchas and anti-patterns

2. **Workshop.gotchas** (from session memory)
   - Recent gotchas tagged with "expo" or "react-native"
   - Decisions with reasoning

3. **/audit-derived standards** (from past audits)
   - Standards created via `mcp__project-context__save_standard`
   - Pattern: "What happened → Cost → Rule"

### Gate Enforcement

`design-token-guardian`, `a11y-enforcer`, `performance-enforcer` MUST:
- Read `relatedStandards` from ContextBundle
- Treat them as **enforceable rules**, not suggestions
- Tag violations to the specific standard they break
- This enables `/audit` to track "standard X keeps being violated"

### Output (Learning Loop Closure)

After task completion:
1. Recurring violations → `mcp__project-context__save_standard` (via /audit)
2. New standards flow into future `relatedStandards`
3. Future tasks see and enforce the new standard

```
violation → /audit → save_standard → code-index.db → future relatedStandards → gate enforcement
```

---

## Phase State Contract (`phase_state.json`)

All Expo pipeline work shares a common phase state file:

```text
.claude/orchestration/phase_state.json
```

For Expo, the contract is:

- Top-level:
  - `domain`: must be `"expo"` for this pipeline.
  - `current_phase`: one of:
    - `"context_query"`, `"requirements_impact"`, `"architecture_plan"`,
      `"implementation_pass1"`, `"standards_budgets"`, `"power_checks"`,
      `"implementation_pass2"`, `"verification"`, `"completion"`.
  - `phases`: object keyed by phase name (see below).
  - `gates_passed` / `gates_failed`: arrays of gate identifiers:
    - e.g. `"design_tokens"`, `"a11y"`, `"performance"`, `"security"`, `"verification"`.
  - `artifacts`: list of repo-relative paths to important artifacts
    (reports, logs, spec/plan docs).

Each phase SHOULD write a structured entry under `phases.<phase_name>`:

- `context_query`
  - `status`: `"pending" | "in_progress" | "completed" | "blocked"`.
  - `timestamp`: ISO string when completed.
  - `summary`: short text summary (e.g. key files, stack).
- `requirements_impact`
  - `status`.
  - `change_type`: `"bugfix" | "feature" | "multi_feature" | "architecture_change"`.
  - `impacted_screens`: list of route/screen identifiers.
  - `impacted_modules`: list of store/hooks/api modules.
- `architecture_plan`
  - `status`.
  - `architecture_path`: short label for chosen approach (e.g. `"expo-router + react-query + zustand"`).
  - `plan_summary`: 3–7 bullet-style sentences (stored as text).
  - `assigned_agents`: list of agent ids expected for downstream phases
    (e.g. `["expo-builder-agent","design-token-guardian","a11y-enforcer",...]`).
- `implementation_pass1`
  - `status`.
  - `files_modified`: list of repo-relative paths touched in Pass 1.
  - `notes`: optional short freeform description.
- `standards_budgets`
  - `status`.
  - `design_tokens_score`: number 0–100 (from `design-token-guardian`).
  - `a11y_score`: number 0–100 (from `a11y-enforcer`).
  - `aesthetics_score`: number 0–100 (from `expo-aesthetics-specialist`).
  - `performance_score`: number 0–100 (from `performance-enforcer`).
- `power_checks`
  - `status`.
  - `perf_findings_ref`: optional path to perf report artifact.
  - `security_findings_ref`: optional path to security report artifact.
- `implementation_pass2`
  - `status`.
  - `files_modified`: list of repo-relative paths touched in corrective pass.
  - `notes`: what was fixed vs Phase 5/6 findings.
- `verification`
  - `status`.
  - `verification_status`: `"pass" | "fail" | "partial"`.
  - `commands_run`: list of verification commands executed.
- `completion`
  - `status`.
  - `outcome`: `"success" | "partial" | "failure"`.
  - `learnings`: short text (what worked, what didn’t).

Agents in this pipeline (`expo-architect-agent`, `expo-builder-agent`,
Expo gate agents, and `expo-verification-agent`) MUST update the
appropriate phase entries when they complete their work.

---

## Agent Handoff Protocol

Agents communicate through `phase_state.json` to coordinate multi-phase workflows. This section defines the handoff patterns and state update protocols.

### Handoff Pattern 1: Architect → Builder

**Scenario:** Architecture planning complete, ready for implementation

**Architect Output (Phase 3):**
```json
{
  "domain": "expo",
  "current_phase": "architecture_plan",
  "phases": {
    "architecture_plan": {
      "status": "completed",
      "architecture_path": "expo-router + react-query + zustand",
      "plan_summary": "Add product filtering screen. Use Expo Router for navigation. React Query for API data fetching (GET /api/products?category=X). Zustand for filter state (category, price range). FlatList for product list with ProductCard component.",
      "assigned_agents": ["expo-builder-agent", "design-token-guardian", "a11y-enforcer"]
    }
  }
}
```

**Builder Reads:**
1. `architecture_path` → Use specified tech stack
2. `plan_summary` → Implementation requirements
3. `assigned_agents` → Knows which gate agents will review work

**Builder Updates (Phase 4):**
```json
{
  "current_phase": "implementation_pass1",
  "phases": {
    "implementation_pass1": {
      "status": "completed",
      "files_modified": [
        "app/(tabs)/products/filter.tsx",
        "src/components/ProductCard.tsx",
        "src/hooks/useProducts.ts",
        "src/store/filterStore.ts"
      ],
      "notes": "Implemented product filtering screen with category/price filters. Used design tokens for styling."
    }
  }
}
```

---

### Handoff Pattern 2: Builder → Gate Agents (Parallel)

**Scenario:** Implementation complete, ready for quality gates

**Builder Output (Phase 4):**
```json
{
  "current_phase": "standards_budgets",
  "phases": {
    "implementation_pass1": {
      "status": "completed",
      "files_modified": ["app/(tabs)/products/filter.tsx", "src/components/ProductCard.tsx"]
    }
  }
}
```

**Gate Agents Read:**
1. `files_modified` → Know which files to audit
2. `current_phase` → Confirms they should run

**Gate Agents Update (Phase 5 - in parallel):**

**design-token-guardian:**
```json
{
  "phases": {
    "standards_budgets": {
      "design_tokens_score": 92,
      "status": "in_progress"
    }
  }
}
```

**a11y-enforcer:**
```json
{
  "phases": {
    "standards_budgets": {
      "a11y_score": 78,
      "status": "in_progress"
    }
  }
}
```

**performance-enforcer:**
```json
{
  "phases": {
    "standards_budgets": {
      "performance_score": 88,
      "status": "in_progress"
    }
  }
}
```

**All Complete:**
```json
{
  "current_phase": "standards_budgets",
  "phases": {
    "standards_budgets": {
      "status": "completed",
      "design_tokens_score": 92,
      "a11y_score": 78,
      "aesthetics_score": 85,
      "performance_score": 88
    }
  },
  "gates_passed": ["design_tokens", "aesthetics", "performance"],
  "gates_failed": ["a11y"]
}
```

---

### Handoff Pattern 3: Gate Failure → Corrective Pass

**Scenario:** Accessibility gate failed (score 78, threshold 90)

**Orchestrator Reads:**
1. `gates_failed: ["a11y"]` → Trigger corrective pass
2. `phases.standards_budgets.a11y_score: 78` → Know severity

**Orchestrator Updates:**
```json
{
  "current_phase": "implementation_pass2",
  "phases": {
    "implementation_pass2": {
      "status": "in_progress",
      "scope": "Fix accessibility violations from a11y-enforcer",
      "target_gates": ["a11y"]
    }
  }
}
```

**Builder Reads:**
1. `phases.implementation_pass2.scope` → Only fix a11y issues
2. `target_gates` → Focus on specific gates

**Builder Updates:**
```json
{
  "phases": {
    "implementation_pass2": {
      "status": "completed",
      "files_modified": ["app/(tabs)/products/filter.tsx", "src/components/ProductCard.tsx"],
      "notes": "Added accessibilityLabel/Role/Hint to all interactive elements. Increased touch targets to 44x44."
    }
  },
  "current_phase": "standards_budgets"
}
```

**Re-run a11y-enforcer:**
```json
{
  "phases": {
    "standards_budgets": {
      "a11y_score": 95
    }
  },
  "gates_passed": ["design_tokens", "a11y", "aesthetics", "performance"],
  "gates_failed": []
}
```

---

### Handoff Pattern 4: All Gates Pass → Verification

**Scenario:** All quality gates passed, ready for build/test

**Orchestrator Reads:**
1. `gates_failed: []` → All gates passed
2. `gates_passed: ["design_tokens", "a11y", "aesthetics", "performance"]` → Confirms readiness

**Orchestrator Updates:**
```json
{
  "current_phase": "verification",
  "phases": {
    "verification": {
      "status": "in_progress"
    }
  }
}
```

**Verification Agent Reads:**
1. `current_phase: "verification"` → Knows to run
2. `files_modified` → Can run selective tests if needed

**Verification Agent Updates:**
```json
{
  "phases": {
    "verification": {
      "status": "completed",
      "verification_status": "pass",
      "commands_run": ["npm test", "npm run lint", "expo doctor"]
    }
  },
  "gates_passed": ["design_tokens", "a11y", "aesthetics", "performance", "verification"],
  "current_phase": "completion"
}
```

---

### Handoff Pattern 5: Power Checks (Optional)

**Scenario:** Run deep performance/security analysis before verification

**Orchestrator Reads:**
1. User requested power checks OR high-risk change detected
2. `gates_passed` includes basic gates

**Orchestrator Updates:**
```json
{
  "current_phase": "power_checks",
  "phases": {
    "power_checks": {
      "status": "in_progress"
    }
  }
}
```

**Performance Prophet Updates:**
```json
{
  "phases": {
    "power_checks": {
      "perf_findings_ref": ".claude/orchestration/evidence/perf-report-2025-11-19.md",
      "status": "in_progress"
    }
  }
}
```

**Security Specialist Updates:**
```json
{
  "phases": {
    "power_checks": {
      "security_findings_ref": ".claude/orchestration/evidence/security-report-2025-11-19.md",
      "status": "completed"
    }
  },
  "gates_passed": ["design_tokens", "a11y", "aesthetics", "performance", "security"],
  "current_phase": "verification"
}
```

---

### State Update Rules

**Rule 1: Atomic Updates**
- Each agent updates ONLY its phase entry
- Never overwrite other agents' data
- Use merge strategy, not replace

**Rule 2: Status Progression**
```text
pending → in_progress → completed
                     ↓
                   blocked (if cannot proceed)
```

**Rule 3: Gate Registration**
- Agent adds to `gates_passed` when score ≥ threshold
- Agent adds to `gates_failed` when score < threshold
- Orchestrator reads these arrays to decide next phase

**Rule 4: Current Phase Coordination**
- Only orchestrator (`/orca`) updates `current_phase`
- Agents read `current_phase` to know if they should execute
- Linear progression: context_query → requirements → architecture → implementation → gates → verification → completion

**Rule 5: Artifact Tracking**
- Agents add report paths to `artifacts` array
- Use repo-relative paths (`.claude/orchestration/evidence/...`)
- Never absolute paths

---

### Example: Complete Phase State After Successful Run

```json
{
  "domain": "expo",
  "current_phase": "completion",
  "phases": {
    "context_query": {
      "status": "completed",
      "timestamp": "2025-11-19T10:23:45Z",
      "summary": "Product filtering feature. Screens: app/(tabs)/products/filter.tsx. Stack: Expo Router, React Query, Zustand."
    },
    "requirements_impact": {
      "status": "completed",
      "change_type": "feature",
      "impacted_screens": ["products", "products/filter"],
      "impacted_modules": ["useProducts", "filterStore"]
    },
    "architecture_plan": {
      "status": "completed",
      "architecture_path": "expo-router + react-query + zustand",
      "plan_summary": "Add product filtering with category/price filters. FlatList + ProductCard components.",
      "assigned_agents": ["expo-builder-agent", "design-token-guardian", "a11y-enforcer", "performance-enforcer"]
    },
    "implementation_pass1": {
      "status": "completed",
      "files_modified": [
        "app/(tabs)/products/filter.tsx",
        "src/components/ProductCard.tsx",
        "src/hooks/useProducts.ts",
        "src/store/filterStore.ts"
      ],
      "notes": "Implemented filtering screen with design tokens, accessible labels, optimized FlatList."
    },
    "standards_budgets": {
      "status": "completed",
      "design_tokens_score": 92,
      "a11y_score": 95,
      "aesthetics_score": 88,
      "performance_score": 91
    },
    "implementation_pass2": {
      "status": "completed",
      "files_modified": ["app/(tabs)/products/filter.tsx"],
      "notes": "Fixed a11y violations: added accessibilityHint, increased touch targets."
    },
    "verification": {
      "status": "completed",
      "verification_status": "pass",
      "commands_run": ["npm test", "npm run lint", "expo doctor"]
    },
    "completion": {
      "status": "completed",
      "outcome": "success",
      "learnings": "Design tokens enforced early prevented rework. A11y gate caught missing hints."
    }
  },
  "gates_passed": ["design_tokens", "a11y", "aesthetics", "performance", "verification"],
  "gates_failed": [],
  "artifacts": [
    ".claude/orchestration/evidence/design-tokens-report.md",
    ".claude/orchestration/evidence/a11y-report.md"
  ]
}
```

---

### Recording Context (OS 6.4)

Domain commands inject recording context (recent session history from `.orca/recording.db`) before delegating to agents. This is optional and silently skipped if no recording database exists.

---

## Pipeline Architecture

```text
Request (Expo/React Native)
    ↓
[Phase 1: Context Query] ← MANDATORY (ProjectContextServer)
    ↓
[Phase 2: Requirements & Impact (Expo Grand Architect + OS)]
    ↓
[Phase 3: Architecture & Plan (Grand Architect + RN best practices)]
    ↓
[Phase 4: Implementation - Pass 1 (Expo/React Native builders)]
    ↓
[Phase 5: Standards & Budgets]
    ↓
  
    Design Token Guardian (design tokens)     
    A11y Enforcer (WCAG 2.2)                  
    Performance Enforcer (runtime budgets)    
  
    ↓
[Phase 6: Power Checks (optional)]
   Performance Prophet (predictive perf)
   Security Specialist (OWASP mobile)
    ↓
Decision Point:
 All gates ≥ thresholds → [Phase 7: Verification]
 Any gate fails → [Phase 4b: Implementation - Pass 2] (ONE corrective pass)
    ↓
[Phase 7: Verification] (build/test)
    ↓
[Phase 8: Completion & Learning]
```

---

## Phase Definitions

### Phase 1: Context Query (MANDATORY)

**Agent:** ProjectContextServer (MCP tool)  
**Invoker:** `/orca`

**Input:**
```json
{
  "domain": "expo",
  "task": "<user request>",
  "projectPath": "<cwd>",
  "maxFiles": 15,
  "includeHistory": true
}
```

**Output:** ContextBundle containing:
- `relevantFiles`: Expo/React Native files related to the task (screens, components, navigation, config).
- `projectState`: app entry points, navigation structure, state management approach.
- `pastDecisions`: prior Expo decisions (navigation choices, state patterns, perf fixes).
- `relatedStandards`: Expo/React Native standards from `code-index.db` and RN best-practices.
- `similarTasks`: historical Expo tasks and outcomes.

**Artifacts:**
- ContextBundle stored in `phase_state.json`.
- Event logged to `code-index.db.events`.

---

### Phase 2: Requirements & Impact

**Agents:**
- `expo-architect-agent` (Expo pipeline architect)
- `/orca` + OS 6.4 constraint framework

**Tasks:**
1. Restate the request in clear, concrete terms (feature, bugfix, refactor).
2. Identify:
   - Affected screens/routes (e.g. app router segments).
   - Affected feature modules (state, APIs, components).
   - Cross-cutting concerns (offline mode, push, auth, payments).
3. Classify change type:
   - `bugfix`, `feature`, `multi-feature`, `architecture_change`.
4. Estimate impact:
   - Files/modules likely to change.
   - Risk areas (navigation, auth, payment, sync).

**Artifacts:**
- Impact summary recorded to `phase_state.json` and optionally to `code-index.db`.

---

### Phase 3: Architecture & Plan

**Agents:**
- `expo-architect-agent` (primary planner)
- Optionally: future specialists such as `state-auditor`, `impact-analyzer`, `test-architect`

**Tasks:**
1. Choose or confirm architecture path:
   - Feature-based folder structure.
   - Navigation (Expo Router, React Navigation).
   - State management (React Query, Zustand, Redux, etc.).
2. Decompose the feature into phases and atomic tasks:
   - UI layout & navigation.
   - State and data flow.
   - Offline/perf/security considerations.
   - Testing strategy.
3. Map tasks to agents:
   - Builders (e.g. Expo/React Native implementation).
   - Design/a11y/perf/security enforcers.

**Artifacts:**
- Plan file (optional for complex work): `.claude/orchestration/specs/expo-feature-YYYY-MM-DD.md`.
- Plan summary stored in `phase_state.json`.

---

### Phase 4: Implementation – Pass 1

**Agents:** `expo-builder-agent` (Expo/React Native implementation)

**Deployment Strategy:**
- **Sequential (default):** Single `expo-builder-agent` handles all implementation
- **Parallel:** Multiple `expo-builder-agent` instances work concurrently on independent components

Use parallel deployment when:
-  Multiple independent screens/components (different files, no shared state)
-  No inter-dependencies (component A doesn't need B's output)
-  Same implementation scope (all UI wiring, or all data layer work, etc.)

See `commands/orca.md` Section 7.3 and `.claude/orchestration/playbooks/parallel-agent-deployment.md` for implementation details.

**Constraints (HARD):**
- Respect Expo/React Native best practices:
  - React Native 0.74+, Expo SDK 50+.
  - TypeScript, Fabric architecture where applicable.
- Follow the architecture plan from Phase 3.
- Prefer localized edits (screen/module specific) over sweeping rewrites.
- Maintain platform conventions (iOS/Android UX parity).

**Tasks:**
1. Implement UI and navigation changes for the requested feature.
2. Wire state and data flow according to the plan.
3. Maintain design-tokens usage (no arbitrary color/spacing).
4. Add or update tests for new logic (unit/integration/UI).
5. Run local checks:
   - `npm test` (or `bun test`/`yarn test` as configured).
   - `expo doctor` or other health checks.

**Artifacts:**
- Modified files (tracked in `phase_state.json`).
- Implementation log: `.claude/orchestration/temp/expo-implementation-TIMESTAMP.md`.

---

### Phase 5: Standards & Budgets

**Agents (Tier 1):**
- `design-token-guardian`
- `a11y-enforcer`
- `expo-aesthetics-specialist`
- `performance-enforcer`

**Inputs:**
- Modified files from Phase 4.
- ContextBundle (design system, standards, past decisions, design-dna).

**Tasks:**
1. **Design Token Guardian**
   - Check design token usage:
     - No hard-coded colors/spacing where tokens exist.
     - Components and styles follow the design system.
2. **A11y Enforcer**
   - Validate accessibility (WCAG 2.2):
     - Proper labels, roles, focus handling, contrast, touch targets.
3. **Expo Aesthetics Specialist**
   - Evaluate visual quality and cohesiveness:
     - Typography hierarchy and intentional token usage.
     - Cohesive color story (avoid generic "AI slop" palettes).
     - Purposeful spacing, layout, and visual hierarchy.
     - Appropriate motion and depth (backgrounds/elevation).
     - Flag anti-patterns: generic UI, visual noise, weak mobile patterns.
4. **Performance Enforcer**
   - Check performance budgets:
     - Bundle size, critical path, runtime warnings.

**Outputs:**
- Per-agent scores (0–100) for design tokens, a11y, aesthetics, and performance.
- Combined **Standards/A11y/Aesthetics/Perf status** in `phase_state.json`.
- Findings and recommendations for corrective pass if needed.

---

### Phase 6: Power Checks (Optional but Recommended)

**Agents (Tier 2):**
- `performance-prophet`
- `security-specialist`

**Tasks:**
1. **Performance Prophet**
   - Predictive and deeper performance analysis:
     - Identify emerging bottlenecks.
     - Propose optimizations before users feel them.
2. **Security Specialist**
   - Security audit focusing on OWASP Mobile Top 10:
     - Storage, network, auth flows, environment variables, etc.

**Outputs:**
- Perf/security reports.
- Recommendations logged as potential standards in `code-index.db`.

---

### Gates: Standards, A11y, Aesthetics, Performance, Security

Gate thresholds (suggested):
- **Design Tokens / Standards:** PASS if ≥90, CAUTION 70–89, FAIL <70.
- **Accessibility:** PASS if no critical WCAG violations; FAIL if any blocking issues.
- **Aesthetics:** PASS if ≥90, CAUTION 75–89, FAIL 60–74, BLOCK <60 (generic "AI slop" UI).
- **Performance:** PASS if within budgets; FAIL on meaningful regressions.
- **Security:** PASS if no critical OWASP issues; FAIL otherwise.

If any critical gate FAILS:
- Allow exactly **one corrective Implementation Pass 2**.
- After Pass 2 re-run Phase 5/6 checks.
- If still failing:
  - Mark as "partial / standards not met" and let user decide next steps.

**Note on Aesthetics Gate:**
- Aesthetics is a **soft gate** by default (CAUTION/FAIL don't block progress).
- BLOCK status (<60) indicates severe visual quality issues requiring UX/design rethink.
- User may choose to prioritize aesthetics refinement based on project phase and audience.

---

### Phase 4b: Implementation – Pass 2 (Corrective)

Same agents and constraints as Phase 4, but:
- Scope **only** to issues reported by design/a11y/aesthetics/perf/security agents.
- No new features or expansions.
- Prioritize critical gate failures (accessibility, security) over aesthetics refinements.

---

### Phase 7: Verification (Build/Test)

**Agent:** `expo-verification-agent` (Expo/React Native verification)

**Tasks:**
1. Run project build and tests:
   - `npm test` / `yarn test` / `bun test`.
   - `expo doctor`.
   - Any configured E2E tests (Detox, etc.) as appropriate.
2. Capture:
   - Build/test status.
   - Key logs/errors.

**Gate:**
- Verification PASS only if:
  - Build/tests succeed.
  - No new critical warnings introduced.

---

### Phase 8: Completion & Learning

**Agent:** `/orca` + ProjectContextServer integrations

**Tasks:**
1. Confirm:
   - All relevant gates passed or are explicitly waived by the user.
   - Artifacts (reports, logs) are stored in `.claude/orchestration/evidence/`.
2. Save task history:
   - Domain: `expo`.
   - Task description.
   - Outcome (`success` | `partial` | `failure`).
   - Files/modules modified.
   - Gate scores and results.
3. Update memory:
   - Record new standards in `code-index.db` where recurring issues were found.
   - Store any important decisions via ProjectContextServer `save_decision`.

**Artifacts:**
- Task history record in `code-index.db`.
- Final summary for the user and future context.

---

## Failure Recovery Scenarios

This section documents common failure modes and standard recovery protocols for the Expo pipeline. Use these patterns when gates fail or unexpected issues arise.

### Scenario 1: Design Token Gate Failure (<90 score)

**Failure Signal:**
```json
{
  "phases": {
    "standards_budgets": {
      "design_tokens_score": 72,
      "status": "completed"
    }
  },
  "gates_failed": ["design_tokens"]
}
```

**Common Causes:**
- Hardcoded colors/spacing in new components (`#007AFF`, `padding: 16`)
- Missing theme imports (`useTheme()` not used)
- Arbitrary values instead of design tokens

**Recovery Protocol:**
1. Read findings from `design-token-guardian` output
2. Trigger **Phase 4b: Corrective Pass 2** with scope limited to design token violations
3. For each violation:
   ```typescript
   //  Before (violation)
   <View style={{ backgroundColor: '#007AFF', padding: 16 }} />

   //  After (compliant)
   const { colors, spacing } = useTheme();
   <View style={{ backgroundColor: colors.primary, padding: spacing.md }} />
   ```
4. Re-run `design-token-guardian` to verify score ≥90
5. Update `phase_state.json`:
   ```json
   {
     "gates_passed": ["design_tokens"],
     "gates_failed": []
   }
   ```

**Escalation:** If score still <90 after Pass 2, flag for manual design review before proceeding.

---

### Scenario 2: Accessibility Gate Failure (WCAG violations)

**Failure Signal:**
```json
{
  "phases": {
    "standards_budgets": {
      "a11y_score": 58,
      "status": "completed"
    }
  },
  "gates_failed": ["a11y"]
}
```

**Common Causes:**
- Missing `accessibilityLabel` on buttons/icons
- Touch targets <44x44 points
- Low contrast ratios (<4.5:1)
- Missing `accessibilityRole`

**Recovery Protocol:**
1. Read findings from `a11y-enforcer` (prioritize WCAG Level A violations)
2. Trigger **Phase 4b: Corrective Pass 2** focused only on accessibility fixes
3. Apply fixes in priority order:
   - **CRITICAL (Level A):** Missing labels, missing roles, touch targets
   - **HIGH (Level AA):** Contrast ratios, keyboard navigation
   - **MEDIUM:** Hints, state announcements
4. Example fix:
   ```typescript
   //  Before (WCAG 4.1.2 violation)
   <TouchableOpacity onPress={onPress}>
     <Icon name="cart" size={20} />
   </TouchableOpacity>

   //  After (compliant)
   <TouchableOpacity
     onPress={onPress}
     accessibilityLabel="Add to cart"
     accessibilityRole="button"
     accessibilityHint="Double tap to add item to shopping cart"
   >
     <Icon name="cart" size={20} />
   </TouchableOpacity>
   ```
5. Re-run `a11y-enforcer` to verify no critical violations
6. Update `phase_state.json` to mark gate passed

**Escalation:** Accessibility is a **hard gate** - do not proceed to Phase 7 with critical WCAG violations (risk of App Store rejection).

---

### Scenario 3: Performance Gate Failure (Budget exceeded)

**Failure Signal:**
```json
{
  "phases": {
    "standards_budgets": {
      "performance_score": 65,
      "status": "completed"
    }
  },
  "gates_failed": ["performance"]
}
```

**Common Causes:**
- Bundle size over budget (Android >25MB, iOS >30MB)
- FlatList without optimization (`getItemLayout`, `React.memo`)
- Heavy synchronous operations on UI thread
- Excessive bridge calls (>60/sec)

**Recovery Protocol:**
1. Read findings from `performance-enforcer` (identify highest impact issues)
2. Trigger **Phase 4b: Corrective Pass 2** scoped to performance optimizations
3. Apply optimizations by category:

   **Bundle Size:**
   ```typescript
   //  Heavy import
   import moment from 'moment'; // 983KB

   //  Lightweight alternative
   import { format } from 'date-fns'; // 71KB
   ```

   **FlatList Performance:**
   ```typescript
   //  No optimization
   <FlatList data={products} renderItem={({item}) => <ProductCard product={item} />} />

   //  Optimized
   const ProductCardMemo = React.memo(ProductCard);
   const getItemLayout = (data, index) => ({
     length: 120, offset: 120 * index, index
   });

   <FlatList
     data={products}
     renderItem={({item}) => <ProductCardMemo product={item} />}
     getItemLayout={getItemLayout}
     removeClippedSubviews
     maxToRenderPerBatch={10}
   />
   ```

4. Re-run `performance-enforcer` to verify score ≥90
5. Update `phase_state.json` to mark gate passed

**Escalation:** If bundle size >30% over budget, consider breaking implementation into smaller increments or lazy-loading heavy features.

---

### Scenario 4: Security Gate Failure (OWASP violations)

**Failure Signal:**
```json
{
  "phases": {
    "power_checks": {
      "security_findings_ref": ".claude/orchestration/evidence/security-report-2025-11-19.md",
      "status": "completed"
    }
  },
  "gates_failed": ["security"]
}
```

**Common Causes:**
- Sensitive data in AsyncStorage (tokens, passwords)
- Hardcoded API keys/secrets
- Insecure HTTP connections
- Missing certificate pinning for sensitive endpoints

**Recovery Protocol:**
1. Read security report from `security-specialist` (prioritize CRITICAL/HIGH CVSS scores)
2. **BLOCK IMMEDIATELY** - Do not proceed to Phase 7 with critical security issues
3. Trigger **Phase 4b: Corrective Pass 2** scoped to security fixes
4. Apply fixes by OWASP category:

   **M2: Insecure Storage**
   ```typescript
   //  CRITICAL (CVSS 9.1)
   await AsyncStorage.setItem('authToken', token);

   //  SECURE
   import * as SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('authToken', token, {
     keychainAccessible: SecureStore.WHEN_UNLOCKED
   });
   ```

   **M3: Insecure Communication**
   ```typescript
   //  CRITICAL (CVSS 8.2)
   fetch('http://api.example.com/payment')

   //  SECURE
   fetch('https://api.example.com/payment', {
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${await SecureStore.getItemAsync('token')}`
     }
   })
   ```

5. Re-run `security-specialist` to verify no critical issues
6. Update `phase_state.json` to mark gate passed

**Escalation:** Security is a **hard gate** - never proceed with CVSS 9+ (CRITICAL) vulnerabilities. Consult security expert for complex auth/payment flows.

---

### Scenario 5: Verification Gate Failure (Build/test failures)

**Failure Signal:**
```json
{
  "phases": {
    "verification": {
      "verification_status": "fail",
      "status": "completed",
      "commands_run": ["npm test", "expo doctor"]
    }
  },
  "gates_failed": ["verification"]
}
```

**Common Causes:**
- Test regressions (existing tests fail after changes)
- Build errors (TypeScript errors, import issues)
- Expo doctor warnings (version mismatches, config issues)

**Recovery Protocol:**
1. Read verification output from `expo-verification-agent`
2. Categorize failures:
   - **Build errors:** Fix immediately (TypeScript, imports, syntax)
   - **Test failures:** Distinguish regression vs outdated tests
   - **Expo doctor:** Configuration issues (dependencies, SDK version)

3. **For test regressions:**
   ```bash
   # Identify failing tests
   npm test -- --verbose

   # Example failure:
   # FAIL src/hooks/useAuth.test.ts
   #  useAuth › should logout user
   #   Expected: user to be null after logout
   #   Received: user still present
   ```

   Trigger **Phase 4b: Corrective Pass 2** to fix implementation bug causing regression

4. **For build errors:**
   ```typescript
   //  TypeScript error
   // Property 'name' does not exist on type 'Product'
   <Text>{product.name}</Text>

   //  Fix type definition
   interface Product {
     id: string;
     name: string;  // ← Add missing field
     price: number;
   }
   ```

5. Re-run verification (`npm test` + `expo doctor`)
6. Update `phase_state.json`:
   ```json
   {
     "verification": {
       "verification_status": "pass",
       "commands_run": ["npm test", "expo doctor"]
     },
     "gates_passed": ["verification"]
   }
   ```

**Escalation:** If verification fails after Pass 2, rollback changes and investigate root cause before retrying implementation.

---

### Recovery Decision Tree

```text
Gate Failure Detected
    ↓
Is it a CRITICAL issue? (Security CVSS 9+, Accessibility WCAG A violation)
     YES → BLOCK: Fix immediately, do not proceed
     NO → Continue
        ↓
Have we already done Pass 2 (corrective)?
     NO → Trigger Phase 4b (Pass 2) with scoped fixes
            ↓
        Re-run failed gates
            ↓
        Gates pass? → Proceed to Phase 7
        Gates fail? → Mark "partial", user decides next steps
    
     YES (already did Pass 2) → Mark "partial", consult user
             ↓
         Options:
         1. Manual intervention (design review, security audit)
         2. Waive non-critical gates (aesthetics, minor perf)
         3. Rollback and re-plan implementation
```
