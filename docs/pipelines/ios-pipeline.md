# iOS Domain Pipeline

**Status:** OS 7.0 Core Pipeline (Native iOS)
**Last Updated:** 2026-02-13

## Overview

The iOS pipeline handles **native iOS app development** using Swift 6.x and modern Apple frameworks (SwiftUI, UIKit, Swift Concurrency). It combines:

- OS 7.0 primitives (ProjectContextServer, phase_state.json, code-index.db, Workshop, constraint framework)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- Four-tier routing (Light/Default/Tweak/Complex)
- Spec gating (complex tasks require requirements spec)
- Response Awareness tagging (RA tags surface assumptions and decisions)
- Swift/iOS specialist agents including `ios-light-orchestrator` for quick tasks
- Full pipeline agents (`ios-grand-architect`, `ios-architect`, `ios-builder`, `ios-standards-enforcer`, `ios-ui-reviewer`, `ios-verification`)
- Design DNA/tokens for UI work; persistence strategy (SwiftData vs Core Data/GRDB) when relevant.

Goal: implement and evolve native iOS features with **architecture-aware plans**, **safety and concurrency guarantees**, **structured gates** for quality, and **learning loops** that harden the system over time.

---

## Four-Tier Routing (OS 7.0)

The iOS pipeline uses four-tier routing:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work -- fast with quality |
| **Tweak** | `-tweak` | Builder direct | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Full pipeline | YES | Architecture, multi-file, specs |

### Default Mode (Light + Gates)

Most tasks take this path. Fast execution with automated quality checks.

```bash
/ios "fix button padding"        # → light orchestrator → builder → gates
/ios "add haptic feedback"       # → light orchestrator → builder → gates
```

**Gates run:** `ios-standards-enforcer` + `ios-ui-reviewer`

### Tweak Mode (`-tweak`)

Pure speed path. User explicitly accepts responsibility for verification.

```bash
/ios -tweak "fix padding"        # → light orchestrator → builder → done
```

### Complex Mode (`--complex`)

Full pipeline with grand-architect planning. Spec required.

```bash
/ios --complex "implement auth flow"   # → full pipeline
/ios "build multi-screen onboarding"   # Auto-routes to --complex
```

| Tier | Files | Spec Required | Example |
|------|-------|---------------|---------|
| Default | 1-5 | No | Fix padding, add haptic, update color |
| Tweak | 1-3 | No | Rapid iteration, exploring options |
| Complex | 5+ | **Required** | Multi-screen flow, architecture |

---

## Standards Inputs (OS 7.0 Learning Loop)

Standards flow into and out of the iOS pipeline:

### Input Sources

1. **ContextBundle.relatedStandards** (from ProjectContext/code-index.db)
   - iOS-specific standards saved from past tasks
   - Architecture decisions and patterns
   - Gotchas and anti-patterns

2. **Workshop.gotchas** (from session memory)
   - Recent gotchas tagged with "ios"
   - Decisions with reasoning

3. **/audit-derived standards** (from past audits)
   - Standards created via `mcp__project-context__save_standard`
   - Pattern: "What happened → Cost → Rule"

### Gate Enforcement

`ios-standards-enforcer` MUST:
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

## Scope & Domain

Use this pipeline when:
- The task clearly concerns a native iOS (or Apple platform) app:
  - Keywords: "iOS app", "SwiftUI", "UIKit", "Xcode", "iPhone", "iPad".
  - Files: `*.xcodeproj`, `*.xcworkspace`, `Sources/**/*.swift`, Swift packages.

If the request is for:
- Expo/React Native mobile → use the **Expo** pipeline.
- Browser-based React/Next.js work → use the **nextjs** pipeline.

---

### Recording Context (OS 7.0)

Domain commands inject recording context (recent session history from `.orca/recording.db`) before delegating to agents. This is optional and silently skipped if no recording database exists.

---

## Pipeline Architecture

```text
Request (iOS feature/bug/refactor)
    ↓
[Phase 1: Context Query] ← MANDATORY (ProjectContextServer)
    ↓
[Phase 2: Requirements & Impact (iOS Architect)]
    ↓
[Phase 3: Architecture & Plan (iOS Architect + Swift/SwiftUI patterns)]
    ↓
[Phase 4: Implementation – Pass 1 (SwiftUI/Swift developers)]
    ↓
[Phase 5: Standards & Safety Gate (iOS Standards Enforcer)]
    ↓
[Phase 6: UI/Interaction QA Gate (iOS UI Reviewer)]
    ↓
Decision Point:
 All gates ≥ thresholds → [Phase 7: Build & Test Verification]
 Any gate fails → [Phase 4b: Implementation – Pass 2] (ONE corrective pass)
    ↓
[Phase 7: Build & Test Verification (iOS Verification Agent)]
    ↓
[Phase 8: Completion & Learning (code-index.db)]
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

---

## Phase Definitions

### Phase 1: Context Query (MANDATORY)

**Agent:** ProjectContextServer (MCP tool)  
**Invoker:** `/orca`

**Input:**
```json
{
  "domain": "ios",
  "task": "<user request>",
  "projectPath": "<cwd>",
  "maxFiles": 15,
  "includeHistory": true
}
```

**Output:** ContextBundle containing:
- `relevantFiles` – Swift/SwiftUI/UIKit files for the feature/bug.
- `projectState` – targets, schemes, modules, architecture hints (SwiftUI vs UIKit, MVVM/TCA/MVC).
- `pastDecisions` – prior iOS decisions, refactors, gotchas.
- `relatedStandards` – iOS standards from `code-index.db` (architecture, concurrency, safety, design DNA pointers).
- `similarTasks` – previous iOS tasks and outcomes.

**Artifacts:**
- ContextBundle stored in `phase_state.json`.
- Context event logged in `code-index.db.events`.

---

### Phase 2: Requirements & Impact Analysis

**Agent:** `ios-architect`

**Tasks:**
1. Restate the request clearly (what feature/bug/refactor is needed).
2. Identify:
   - Affected screens/views (SwiftUI views, view controllers, navigation flows).
   - Affected state/business logic (stores, reducers, view models, services).
   - External dependencies (APIs, persistence, feature flags).
   - Design DNA / token sources if UI changes are in scope.
3. Classify change type:
   - `bugfix`, `small_feature`, `multi_screen_feature`, `structural`.
4. Estimate impact and risk:
   - Modules and targets touched.
   - Sensitive areas (auth, payments, offline, critical flows).

**Artifacts:**
- Impact summary in `phase_state.json`.
- Optional decision note saved via ProjectContextServer.

---

### Phase 3: Architecture & Plan

**Agents:**
- `ios-architect` (primary planner)
- iOS specialists (e.g. `ios-swiftui-specialist` indirectly)

**Tasks:**
1. Choose architecture path:
   - **Modern SwiftUI path** (Swift 6, SwiftUI 18/26, `@Observable` + `@Environment(Object.self)`):
     - For SwiftUI-first features/projects without entrenched MVVM/TCA.
   - **Existing architecture path** (MVVM, TCA, UIKit/MVC):
     - Follow existing patterns; do not forcibly rewrite architecture.
   - Choose data layer strategy (SwiftData for iOS 17+/Swift 6 unless project is locked to Core Data/GRDB; do not migrate implicitly).
2. Define:
   - Which types/modules will be extended or created.
   - How state and data flow should be wired (reducers/view models/stores).
   - How UI and navigation will change.
   - Testing strategy (what tests should exist, Swift Testing vs XCTest per project).
3. Produce a concise, stepwise plan:
   - UI changes.
   - Logic changes.
   - Tests.
   - Verification.

**Artifacts:**
- Plan stored in `phase_state.json`.
- Optional plan spec: `.claude/orchestration/specs/ios-feature-YYYY-MM-DD.md`.

---

### Phase 4: Implementation – Pass 1

**Agents:** `ios-builder` (primary), with specialists as needed:
- SwiftUI work: `ios-swiftui-specialist`.
- UIKit-heavy work: `ios-uikit-specialist`.
- Tokens: `design-dna-guardian` to enforce design DNA.
- Data: `ios-persistence-specialist` when persistence is touched.
- Networking: `ios-networking-specialist` for API work.
- Testing: `ios-testing-specialist` / `ios-ui-testing-specialist`.

**Constraints (HARD):**
- Use Swift 6.x semantics and modern concurrency by default.
- Respect architecture plan from Phase 3:
  - If SwiftUI-native: prefer `@Observable` + `@Environment` over new view models.
  - If MVVM/TCA/UIKit: follow the dominant pattern.
- Use the project’s design DNA/tokens for UI-forward work; do not hardcode ad-hoc styling.
- Keep edits cohesive and scoped to the modules/features identified.
- Add/update tests where new logic is introduced.

**Tasks:**
1. Apply the architecture plan:
   - Implement or update views/controllers and logic.
2. Add tests:
   - Unit tests for business logic.
   - Reducer/view model tests if applicable.
3. Run local checks (via Xcode tools when available):
   - Build the affected module/target.
   - Run relevant tests.

**Artifacts:**
- Modified files recorded in `phase_state.json`.
- Implementation summary in an implementation log (optional).

---

### Phase 5: Standards & Safety Gate

**Agent:** `ios-standards-enforcer`

**Inputs:**
- Modified Swift/SwiftUI/UIKit files.
- ContextBundle (architecture, standards, past decisions).

**Checks:**
- Architecture:
  - No unexpected patterns contrary to the chosen path.
- Concurrency:
  - Proper use of `async/await`, actors, `@MainActor`.
  - Avoid unnecessary GCD where Swift Concurrency is available.
- Safety:
  - Force unwraps and unsafe casts only where justified.
  - Reasonable error handling paths (no silent failures).
- Testing:
  - New logic has tests where appropriate.

**Output:**
- Standards Score (0–100).
- Gate label: PASS / CAUTION / FAIL.

---

### Phase 6: UI / Interaction QA Gate (Code Review)

**Agent:** `ios-ui-reviewer`

**Mode:** Code review only (no simulator access)

**Inputs:**
- Modified files from ios-builder
- Design DNA/tokens reference
- Any UX spec or Figma snapshots

**Checks (Code-Based):**
- Design token usage (no hardcoded colors/spacing/fonts)
- SwiftUI/UIKit patterns (LazyVStack, modifier ordering, state management)
- Accessibility labels in code (.accessibilityLabel, .accessibilityHint)
- State handling (loading/empty/error/success defined in code)

**Does NOT Check (Deferred to Phase 7):**
- Actual visual layout on device
- Pixel measurements
- Screenshot comparisons

**Output:**
- Code Review Score (0-100)
- Gate label: PASS / CAUTION / FAIL
- List of items requiring visual verification in Phase 7

---

### Gates and Corrective Pass

Gate thresholds (suggested):
- **Standards Gate:** PASS if Standards Score ≥ 90 and no critical issues.
- **UI/Interaction Gate:** PASS if Score ≥ 90 and no blockers.

If any critical gate FAILS:
- Allow exactly **one** corrective **Implementation Pass 2**:
  - Scope only to gate-surfaced issues.
  - Re-run Phase 5 and Phase 6 afterwards.
- If still failing:
  - Mark outcome as “partial / standards not met” and require human decision.

---

### Phase 4b: Implementation – Pass 2 (Corrective)

Same implementation agents as Phase 4, but:
- Scope strictly to issues from Standards and UI gates.
- No new features or expansions.

---

### Phase 7: Build, Test & Visual Verification

**Agent:** `ios-verification`

**Mode:** ONLY agent with simulator access (XcodeBuildMCP)

**Tasks:**
1. Build the iOS app for the appropriate scheme/target:
   - Uses XcodeBuildMCP (boots simulator, builds project)
2. Run tests:
   - Relevant unit/integration/UI tests
3. Visual verification (if requested or Phase 6 flagged items):
   - Take screenshots via XcodeBuildMCP
   - Pixel measurements via describe_ui
   - Compare to user-provided screenshots if any
4. Capture:
   - Build status
   - Test results and failures
   - Screenshots saved to `.claude/orchestration/evidence/`

**Visual Verification Protocol:**
- Zero tolerance for pixel mismatches when expected value exists
- Explicit side-by-side comparison when user provided screenshot
- Claim "fixed" only with measurement proof

**Gate:**
- PASS only if build succeeds AND tests pass AND visual verification passes (if applicable)

---

### Phase 8: Completion & Learning

**Agents:** `/orca` + ProjectContextServer integrations

**Tasks:**
1. Confirm gate outcomes and artifacts:
   - Standards, UI, Build/Test gates passed or explicitly waived.
   - Evidence (logs, screenshots) stored where appropriate.
2. Save task history:
   - Domain: `ios`.
   - Task description.
   - Outcome (`success` | `partial` | `failure`).
   - Files/modules modified.
   - Gate scores and decisions.
3. Update memory:
   - Insert new events/standards into `code-index.db`.
   - Save architecture decisions via ProjectContextServer.

**Artifacts:**
- Task history record in `code-index.db`.
- Updated iOS standards where applicable.

---

## Failure Scenarios & Recovery

### Scenario 1: Build/Test Gate Fails After Corrective Pass

**What happened:** Standards/UI gates passed, but build or tests fail.

**Cause:** Code compiles locally but breaks in full build context, or tests fail due to integration issues.

**Recovery:**
1. Mark task as "partial completion" in `code-index.db`.
2. Log failure with gate scores + build/test errors.
3. Present user with:
   - Build/test errors with file/line references.
   - Options: manual fix | rollback changes | accept partial state.
4. If rollback chosen: `git checkout HEAD~1 -- <files_modified>`.

---

### Scenario 2: Both Gates Fail After Pass 2

**What happened:** Corrective pass (Pass 2) didn't meet 90+ threshold on Standards or UI gates.

**Cause:** Issues too complex for single corrective iteration; architectural problems requiring redesign.

**Recovery:**
1. BLOCK pipeline completion.
2. Report final scores (e.g., Standards: 82, UI: 75).
3. Save violations as new standards via ProjectContextServer to prevent future occurrences.
4. Require human decision:
   - Manual fix (continue outside pipeline).
   - Accept partial (merge with known issues).
   - Rollback entirely (restore original state).

---

### Scenario 3: Design DNA Missing (Hard Block)

**What happened:** `design-dna-guardian` blocks UI implementation due to missing design tokens.

**Cause:** No `design-dna.json` or `DesignTokens.swift` found in project or `.claude/design-dna/`.

**Detection:** ios-grand-architect identifies early in Phase 2 (Requirements & Impact).

**Recovery:**
1. BLOCK pipeline immediately.
2. Ask user via AskUserQuestion:
   - "Create minimal design DNA now?" → Quick-start wizard.
   - "Use universal-taste.json?" → Copy from `~/.claude/design-dna/universal-taste.json`.
   - "Skip UI work, logic only?" → Proceed with backend/logic changes only.
3. If design DNA created, save decision and restart from Phase 2.
4. If skipped, adjust plan scope to exclude UI changes.

---

### Scenario 4: ProjectContextServer Timeout

**What happened:** MCP tool `mcp__project-context__query_context` doesn't respond within 10s.

**Cause:** Large repository, slow vector database, network latency, or MCP server crash.

**Recovery:**
1. Retry once with extended timeout (30s).
2. If still fails, enter DEGRADED mode:
   - Use `Grep`/`Glob` to manually locate relevant Swift files.
   - Skip `pastDecisions`, `relatedStandards`, and `similarTasks`.
   - Warn: "Context quality reduced – operating with limited history".
3. Log degraded context event to `code-index.db`.
4. Proceed with available context (architect makes more conservative decisions).

---

### Scenario 5: Rollback After Broken Implementation

**What happened:** New implementation breaks existing features not covered by tests.

**Cause:** Side effects, unexpected dependencies, or regression in untested paths.

**Detection:** User reports: "Feature X is now broken after your changes".

**Recovery:**
1. Identify files modified via `phase_state.json` → `implementation.filesModified`.
2. Git rollback: `git checkout HEAD~1 -- <files_modified>`.
3. Log failure to `code-index.db`:
   - Outcome: `failure`.
   - Learnings: "Implementation caused regression in Feature X".
4. Save as new standard: "When modifying Y, verify Feature X still works".
5. Optionally restart pipeline with stricter constraints:
   - Add Feature X to verification checklist.
   - Require manual QA gate before completion.

---

## Agent Communication Protocol

### Phase State Structure

Agents communicate via a shared `phase_state.json` file located at `.claude/orchestration/phase_state.json`.

**Structure:**
```json
{
  "domain": "ios",
  "task": "Add biometric login",
  "phase": "implementation_pass_1",
  "status": "in_progress",

  "context": {
    "relevantFiles": ["LoginView.swift", "AuthService.swift"],
    "architectureChoice": "SwiftUI + @Observable",
    "dataStrategy": "SwiftData",
    "designDNA": ".claude/design-dna/app-tokens.json"
  },

  "plan": {
    "scope": "Add Face ID/Touch ID to login flow",
    "changeType": "small_feature",
    "complexity": "medium",
    "filesAffected": 3,
    "steps": ["UI", "Logic", "Tests", "Verification"],
    "constraints": ["tokens-only styling", "no force unwraps", "async/await"]
  },

  "implementation": {
    "pass": 1,
    "filesModified": [
      "LoginView.swift",
      "BiometricAuth.swift",
      "LoginTests.swift"
    ],
    "changesApplied": "Added LocalAuthentication integration with fallback",
    "localChecks": {
      "swiftlint": "passed",
      "build": "passed",
      "tests": "passed"
    }
  },

  "gates": {
    "standards": {
      "score": 95,
      "status": "PASS",
      "violations": []
    },
    "ui": {
      "score": 92,
      "status": "PASS",
      "findings": [
        {
          "severity": "minor",
          "issue": "Biometric icon could be 4pt larger for better tap target"
        }
      ]
    },
    "build": "pending",
    "test": "pending"
  },

  "artifacts": {
    "standards_report": ".claude/orchestration/evidence/ios-standards-20251122-1430.md",
    "ui_review": ".claude/orchestration/evidence/ios-ui-review-20251122-1432.md"
  }
}
```

---

### Handoff Protocol

**Phase 1: ProjectContextServer → ios-grand-architect**
- **Input:** `domain`, `task`, `projectPath`, `maxFiles`, `includeHistory`.
- **Output:** ContextBundle with `relevantFiles`, `projectState`, `pastDecisions`, `relatedStandards`, `designTokens`.
- **Signal:** ContextBundle stored in `phase_state.json` → `context` field.

**Phase 2: ios-grand-architect → ios-architect**
- **Input:** ContextBundle + user request.
- **Output:** `architectureChoice` (SwiftUI/MVVM/TCA), `dataStrategy` (SwiftData/CoreData), `designDNA` path.
- **Signal:** Decision saved via `mcp__project-context__save_decision`; `phase_state.json` updated.

**Phase 3: ios-architect → ios-builder**
- **Input:** Plan with `scope`, `changeType`, `complexity`, `steps`, `constraints`.
- **Output:** Concrete implementation instructions and specialist assignments.
- **Signal:** `phase_state.json` updated with `plan` field.

**Phase 4: ios-builder → Specialists**
- **Input:** Plan + architecture constraints + design tokens.
- **Output:** Modified files + local check results.
- **Signal:** `phase_state.json` updated with `implementation` field (pass number, files, checks).

**Phase 5: ios-builder → ios-standards-enforcer**
- **Input:** `filesModified` + `relatedStandards` from context.
- **Output:** `standardsScore` (0-100) + `violations` array + `gateStatus` (PASS/CAUTION/FAIL).
- **Signal:** `phase_state.json` → `gates.standards` updated.

**Phase 6: ios-standards-enforcer → ios-ui-reviewer**
- **Input:** Feature/flow description + navigation steps + target devices.
- **Output:** `uiScore` (0-100) + `findings` array + `gateStatus`.
- **Signal:** `phase_state.json` → `gates.ui` updated.

**Phase 7: Gates → ios-builder (Corrective Pass)**
- **Trigger:** If `gates.standards.status === "FAIL"` OR `gates.ui.status === "FAIL"` AND `implementation.pass === 1`.
- **Input:** `violations` + `findings` from failed gates.
- **Output:** Scoped fixes addressing only gate issues (NO new features).
- **Signal:** `phase_state.json` → `implementation.pass` incremented to 2; gates re-run.

**Phase 8: ios-ui-reviewer → ios-verification**
- **Input:** Scheme + device/OS + test plan.
- **Output:** `buildStatus` (success/fail) + `testResults` (passed/failed).
- **Signal:** `phase_state.json` → `gates.build` and `gates.test` updated.

**Phase 9: ios-verification → Completion**
- **Input:** All phase results + gate outcomes + artifacts.
- **Output:** Final summary + task history record.
- **Signal:** `code-index.db` updated; `phase_state.json` → `status: "completed"` or `"partial"`.
