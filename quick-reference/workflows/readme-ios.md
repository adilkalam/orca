# OS 7.0 iOS Lane Readme

**Lane:** iOS / Native Apple Platforms  
**Domain:** `ios`  
**Entrypoints:** `/requirements`, `/orca`, `/ios`, `/project-memory`, `/project-code`

This document explains how the iOS lane works in OS 7.0:

- Planning & specs (`/requirements`)
- Orchestration (`/orca`, `/ios`)
- Pipeline & phases
- Agents and specialists
- Skills and memory integration
- Response Awareness and gates

---

## 1. When to Use the iOS Lane

Use this lane for native Apple platform work:

- Swift/SwiftUI/UIKit code under `*.swift`
- Xcode projects/workspaces, schemes, targets
- iOS app behavior, UI, navigation, networking, persistence

Examples:

- “Add haptic feedback to save button”
- “Implement offline caching for article list”
- “Refactor networking layer to use async/await”

---

## 2. Core Commands and Flow

### 2.1 Planning – `/requirements`

For non‑trivial iOS work:

- Run `/requirements "..."` to create a spec:
  - `.orca/requirements/YYYY-MM-DD-HHMM-<slug>/`
  - Q/A files (`01–05-*`) and final spec `06-requirements-spec.md`
  - RA tags in the spec indicate important decisions and assumptions.

Complex features (multi‑screen, architecture/data changes, auth/payments,
offline) must have a spec before the iOS lane runs in full.

---

### 2.2 Global Orchestrator – `/orca`

`/orca`:

- Runs memory‑first search (Workshop + code-index.db).
- Checks for existing requirements/specs.
- Detects the iOS domain for the task.
- Routes to `/ios` with:
  - Task summary
  - Memory context
  - Spec information (if any)

You can also call `/ios` directly.

---

### 2.3 iOS Orchestrator – `/ios`

File: `commands/ios.md`

- Accepts:

  ```bash
  /ios "fix button padding"                       # Default: light + gates
  /ios --tweak "experiment with animation"        # Tweak: light, no gates
  /ios --complex "implement auth flow"           # Complex: full pipeline
  /ios "implement requirement <id>"              # With spec
  ```

- **Routing Modes (OS 7.0):**

  | Mode | Flag | Path | Gates |
  |------|------|------|-------|
  | **Default** | (none) | Light + Gates | YES |
  | **Tweak** | `--tweak` | Light (pure) | NO |
  | **Complex** | `--complex` | Full pipeline | YES |

- Behavior:
  1. **Memory‑first** – searches Workshop and unified memory for `domain: "ios"` decisions and code.
  2. **Flag detection**:
     - No flag → **Default mode** (light path WITH gates)
     - `--tweak` → **Tweak mode** (light path WITHOUT gates, user verifies)
     - `--complex` → **Complex mode** (full pipeline, spec required)
  3. **Spec gating** (for `complex`):
     - Requires `.orca/requirements/<id>/06-requirements-spec.md`.
  4. **Routing**:
     - Default/tweak → `ios-light-orchestrator` (gates on default only)
     - Complex → full iOS lane with grand‑architect and gates.

---

## 3. Pipeline and Phase State

### 3.1 Pipeline Spec

- `docs/pipelines/ios-pipeline.md` – describes:
  - Context → requirements & impact → architecture & plan
  - Implementation → standards gate → UI review gate
  - Verification → completion & learning

### 3.2 Phase Config and `phase_state.json`

- `docs/reference/phase-configs/ios-phase-config.yaml`
- Uses `.orca/orchestration/phase_state.json`
- Key phases:
  - `context_query` – ProjectContext query for `domain: "ios"`.
  - `requirements_impact` – change_type, impact, risks.
  - `planning` – architecture path (SwiftUI vs UIKit vs MVVM/TCA), data strategy.
  - `implementation_pass1` – `ios-builder` output + `ra_events`.
  - `standards_gate` – `ios-standards-enforcer` results (RA‑aware).
  - `ui_review_gate` – `ios-ui-reviewer` code review (tokens, patterns, a11y in code - NO simulator).
  - `implementation_pass2` – corrective pass when gates fail.
  - `verification` – `ios-verification` build/tests/visual (ONLY agent with XcodeBuildMCP).

Response Awareness:
- Implementation phases include `ra_events`.
- Standards gate outputs include `ra_audit`/RA findings.

---

## 4. Agents

### 4.1 Heavy Lane Agents

Core agents:

- `agents/iOS/ios-grand-architect.md`
  - Opus grand architect for iOS.
  - Chooses architecture (SwiftUI vs existing MVVM/TCA/UIKit).
  - Chooses data strategy (SwiftData vs Core Data vs GRDB).
  - Assembles task force and coordinates phases.

- `agents/iOS/ios-architect.md`
  - Architecture planner and impact analyst.
  - Fills `requirements_impact` and `planning`.
  - Uses RA tags for major architecture/data decisions.

- `agents/iOS/ios-builder.md`
  - Plan‑driven implementation.
  - Enforces design DNA, Swift 6 concurrency, architecture fidelity.
  - Emits `ra_events` in implementation phases.

- `agents/iOS/ios-standards-enforcer.md`
  - Standards gate:
    - Architecture adherence, concurrency, safety, tests, persistence rules.
    - RA‑aware: scans for RA tags and includes them in decisions.

- `agents/iOS/ios-ui-reviewer.md`
  - Code-based UI review (tokens, patterns, accessibility in code).
  - NO simulator access - defers visual verification to ios-verification.

- `agents/iOS/ios-verification.md`
  - Build/test/visual gate using XcodeBuildMCP.
  - ONLY iOS agent with simulator access (screenshot, describe_ui).

Specialists:

- `ios-swiftui-specialist`, `ios-uikit-specialist`,
  `ios-persistence-specialist`, `ios-networking-specialist`,
  `ios-testing-specialist`, `ios-ui-testing-specialist`,
  `ios-performance-specialist`, `ios-security-specialist`,
  `ios-accessibility-specialist`, `ios-spm-config-specialist`,
  `ios-fastlane-specialist`.

### 4.2 Light Lane Agent

- `agents/iOS/ios-light-orchestrator.md`
  - Handles **default** and **tweak** modes.
  - Minimal context (grep/quick reads or small ProjectContext query).
  - Routes directly to `ios-builder` (+ one specialist if needed).
  - **Default mode**: Runs gates (`ios-standards-enforcer` + `ios-ui-reviewer`)
  - **Tweak mode** (`--tweak`): Skips gates (user verifies)

---

## 5. Skills and Knowledge

### Domain Skills

- `skills/ios-knowledge-skill/SKILL.md`
  - iOS architecture/data patterns, concurrency, testing.
- `skills/ios-testing-skill/SKILL.md`
  - Swift Testing framework patterns.
- `skills/design-dna-skill/SKILL.md`
  - Design tokens and design DNA rules, including iOS surfaces.
- `skills/design-qa-skill/SKILL.md`
  - General design QA standards.

### Universal Skills

All 19 iOS agents now reference these 5 universal skills:

- `skills/cursor-code-style/SKILL.md` - Variable naming, control flow, comments
- `skills/lovable-pitfalls/SKILL.md` - Common mistakes to avoid
- `skills/search-before-edit/SKILL.md` - Always grep before modifying files
- `skills/linter-loop-limits/SKILL.md` - Max 3 attempts on linter errors
- `skills/debugging-first/SKILL.md` - Debug tools before code changes

### Lane-Specific Patterns

iOS builder agents have inline swift-agents patterns:

- **iOS Version:** Check deployment target before using new APIs
- **Concurrency:** Use @MainActor for UI updates, prefer async/await
- **Data:** SwiftData for new projects, Core Data/GRDB for legacy
- **Accessibility:** VoiceOver, accessibilityLabel, accessibilityHint

---

## 6. Memory Integration

Same pattern as other lanes:

- `/project-memory` (Workshop):
  - Records iOS architecture decisions, gotchas, and standards.
  - Frequently appears in ContextBundle as `relatedStandards` and `pastDecisions`.

- `/project-code` (code-index.db + Context7):
  - Indexes Swift/SwiftUI/UIKit code and test targets.
  - Can fetch Apple/Point‑Free/other docs via Context7 libraries for deeper iOS patterns.

Unified memory search is used by `/orca` and `/ios` before
ProjectContext for fast recall.

---

## 7. Response Awareness & Gates

- RA tags:
  - `ios-architect` tags `#PATH_DECISION` and assumptions around architecture/data.
  - `ios-builder` tags assumptions and path choices in `ra_events`.
- `ios-standards-enforcer`:
  - Reads RA signals and treats unresolved safety/architecture RA tags
    as at least CAUTION, potentially blocking.

This provides the RA runtime context that `/audit` and OS‑Dev can use to
promote standards and refine lane behavior over time.

---

## 8. Mental Model

For iOS work in OS 7.0 (routing modes):

| Mode | Command | Path |
|------|---------|------|
| **Default** | `/ios "fix padding"` | Light + gates |
| **Tweak** | `/ios --tweak "try animation"` | Light, no gates |
| **Complex** | `/ios --complex "auth flow"` | Full pipeline |

- **Most work**: Default mode (light path WITH gates)
- **Exploration**: Tweak mode (light path, no gates, you verify)
- **Features**: Complex mode (full pipeline, spec required)
