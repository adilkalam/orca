# OS 4.1 Expo Lane Readme

**Lane:** Expo / React Native  
**Domain:** `expo`  
**Entrypoints:** `/plan`, `/orca`, `/expo`, `/project-memory`, `/project-code`

This readme explains the Expo lane in Vibe OS 4.1:

- Planning & specs for Expo tasks
- Orchestration via `/orca` and `/expo`
- Pipeline and phase configs
- Agents and specialists
- Skills and memory integration
- Response Awareness and gates

---

## 1. When to Use the Expo Lane

Use this lane for Expo/React Native mobile work:

- Components/screens under React Native/Expo directories
- Navigation flows (Expo Router)
- Platform‑specific behavior (iOS/Android through Expo)

Examples:

- “Add pull‑to‑refresh to the product list”
- “Implement deep linking for the onboarding flow”
- “Refactor auth flow to use SecureStore”

---

## 2. Core Commands and Flow

### 2.1 Planning – `/plan`

For non‑trivial Expo tasks:

- `/plan "..."` creates a spec under `.claude/requirements/`.
- Complex flows (multi‑screen auth, offline, sensitive data) should
  have a spec before the full Expo lane runs.

---

### 2.2 Global Orchestrator – `/orca`

`/orca`:

- Runs memory‑first search across Workshop + vibe.db.
- Detects `expo` domain.
- Checks for a requirements spec.
- Routes to `/expo` with relevant context and spec info.

You can also call `/expo` directly.

---

### 2.3 Expo Orchestrator – `/expo`

File: `commands/expo.md`

- Accepts:

  ```bash
  /expo "fix button spacing"                      # Default: light + gates
  /expo -tweak "try different padding"           # Tweak: light, no gates
  /expo --complex "implement auth flow"          # Complex: full pipeline
  /expo "implement requirement <id>"             # With spec
  ```

- **Three-Tier Routing (OS 4.1):**

  | Mode | Flag | Path | Gates |
  |------|------|------|-------|
  | **Default** | (none) | Light + Gates | YES |
  | **Tweak** | `-tweak` | Light (pure) | NO |
  | **Complex** | `--complex` | Full pipeline | YES |

- Behavior:
  1. **Memory‑first** – queries Workshop/vibe.db for relevant Expo incidents and patterns.
  2. **Flag detection**:
     - No flag → **Default mode** (light path WITH gates)
     - `-tweak` → **Tweak mode** (light path WITHOUT gates, user verifies)
     - `--complex` → **Complex mode** (full pipeline, spec required)
  3. **Spec gating**:
     - For `complex`, require `.claude/requirements/<id>/06-requirements-spec.md`.
  4. **Routing**:
     - Default/tweak → `expo-light-orchestrator` (gates on default only)
     - Complex → full Expo pipeline with grand‑orchestrator and gates.

---

## 3. Pipeline and Phase State

### 3.1 Pipeline Spec

- `docs/pipelines/expo-pipeline.md`:
  - Describes Expo pipeline: context → planning → implementation → multiple gates (design tokens, accessibility, aesthetics) → verification.

### 3.2 Phase Config and `phase_state.json`

- `docs/reference/phase-configs/expo-phase-config.yaml`
- Uses `.claude/orchestration/phase_state.json` with `domain: "expo"`.
- Key phases:
  - `context_query`, `planning`, `implementation`, `design_tokens`, `accessibility`, `aesthetics`, and verification/summary.
- Expo implementation outputs `ra_events` to capture RA tags.

---

## 4. Agents

Heavy lane agents:

- `agents/expo/expo-grand-orchestrator.md`
  - Opus, coordinates full Expo lane.
  - Chooses architecture (Expo Router patterns, navigation structure).

- `agents/expo/expo-architect-agent.md`
  - Plans changes, including navigation/state decisions.
  - Uses RA tags for path decisions and tradeoffs.

- `agents/expo/expo-builder-agent.md`
  - Implements plan with localized diffs.
  - Emits `ra_events` for RA runtime.

- `agents/expo/expo-verification-agent.md`
  - Runs `expo`‑level verification (doctor, tests/lints where configured).

Specialists:

- `api-guardian`, `bundle-assassin`, `impact-analyzer`, `refactor-surgeon`, `test-generator`,
  `expo-aesthetics-specialist`, `a11y-enforcer`, `performance-enforcer`.

Light lane agent:

- `agents/expo/expo-light-orchestrator.md`
  - Handles **default** and **tweak** modes.
  - Direct delegation to `expo-builder-agent` plus at most one specialist.
  - **Default mode**: Runs gates (`design-token-guardian` + `expo-aesthetics-specialist`)
  - **Tweak mode** (`-tweak`): Skips gates (user verifies)

---

## 5. Skills and Memory

### Domain Skills

- `skills/design-dna-skill/SKILL.md` - Design tokens and design DNA rules
- `skills/design-qa-skill/SKILL.md` - General design QA standards

### Universal Skills

All 11 Expo agents now reference these 5 universal skills:

- `skills/cursor-code-style/SKILL.md` - Variable naming, control flow, comments
- `skills/lovable-pitfalls/SKILL.md` - Common mistakes to avoid
- `skills/search-before-edit/SKILL.md` - Always grep before modifying files
- `skills/linter-loop-limits/SKILL.md` - Max 3 attempts on linter errors
- `skills/debugging-first/SKILL.md` - Debug tools before code changes

### Lane-Specific Patterns

Expo builder agents have inline React Native best practices:

- **Performance:** FlatList for lists >20 items, getItemLayout for fixed heights
- **Styling:** StyleSheet.create, all colors from theme, all spacing from scale
- **Platform:** Respect iOS vs Android conventions, use Platform.select
- **Accessibility:** accessibilityLabel, accessibilityRole, accessibilityHint, 44x44pt touch targets

### Agent-Level Learning

Agents can discover and persist patterns to `.claude/agent-knowledge/expo-builder-agent/patterns.json`.

### Memory

- `/project-memory`:
  - Records Expo incidents, gotchas (e.g. navigation pitfalls, performance issues).
- `/project-code`:
  - Indexed Expo/React Native code and integration points.

Unified memory search is used by `/orca` and `/expo` before ProjectContext.

---

## 6. Response Awareness & Gates

Expo pipeline includes:

- RA tagging in planning and implementation (`ra_events`).
- Multiple gates (design tokens, accessibility, aesthetics) that can use RA
  context to prioritize or block issues.

---

## 7. Mental Model

For Expo work in OS 4.1 (three-tier routing):

| Mode | Command | Path |
|------|---------|------|
| **Default** | `/expo "fix spacing"` | Light + gates |
| **Tweak** | `/expo -tweak "try padding"` | Light, no gates |
| **Complex** | `/expo --complex "auth flow"` | Full pipeline |

- **Most work**: Default mode (light path WITH gates)
- **Exploration**: Tweak mode (light path, no gates, you verify)
- **Features**: Complex mode (full pipeline, spec required)
