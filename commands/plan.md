---
description: "Unified OS 5.2 planner -- requirements + RA blueprint (no implementation)"
argument-hint: "<task> [--problem-solve] [--explore] [--complex] [--tweak] [--debug] [--visual] [--systems] [--model] [--creative] [--causal] [--decide] [--from-brief [path]]"
allowed-tools:
  ["Task (model: opus only)", "Read", "Write", "Edit", "Glob", "Grep",
   "AskUserQuestion", "mcp__project-context__query_context", "mcp__project-context__save_decision",
   "mcp__cognition-mcp__cognition"]
---

# /plan -- Requirements + Response-Aware Blueprint

Use this command to produce a **blueprint-quality requirements spec** for a task
before running any domain lane (`/nextjs`, `/ios`, `/expo`, etc.).
It combines:
- The OS 5.2 **requirements pipeline** (requirements folder + docs),
- **Response Awareness** tagging (RA tags as per `docs/concepts/response-awareness.md`),
- **Cognition analysis** (optional) for deeper problem understanding,
- ProjectContextServer for context-aware analysis.

You never implement code from `/plan`; you only plan.

---

## Step 0: Route Check

This is /plan, not /deepthink or /think.

- OUTPUT goes to: `.claude/requirements/` (ALWAYS)
- NOT to: `.claude/cognition/` (that's for /deepthink and /think)
- Cognition flags (--problem-solve, --visual, --systems, etc.) are ANALYSIS INPUTS,
  not output destinations.

If you find yourself saving to .claude/cognition/ -- STOP. You are in the wrong pipeline.

---

## CRITICAL: Requirements Folder First

REGARDLESS of any cognition flags (--visual, --systems, --problem-solve, etc.):

1. FIRST: Create the requirements folder at `.claude/requirements/YYYY-MM-DD-HHMM-slug/`
2. THEN: Run cognition analysis (if flagged) and save output INTO that folder
3. THEN: Run discovery questions
4. THEN: Generate spec

Cognition analysis is an INPUT to the requirements process, not a replacement for it.
Never save /plan output to `.claude/cognition/` -- that directory is for /deepthink and /think only.

---

## 0.1 Parse Arguments

### Tier Flags

`/plan` supports four planning depths that match `/orca-*` execution tiers:

| Flag | Planning Depth | Use Case |
|------|----------------|----------|
| (default) | **Standard** -- Full discovery + detail questions, complete spec | Most features |
| `--tweak` | **Quick** -- 2-3 scope questions, minimal spec | Small changes, config updates |
| `--complex` | **Deep** -- Extended analysis, risk assessment, multi-phase breakdown | Architecture changes, refactors |
| `--explore` | **Exploratory** -- Full divergent exploration, tentative brief | Half-baked ideas, early-stage thinking |
| `--problem-solve` | **Convergent** -- Structured 8-step analysis before planning | Complex decisions, architectural choices |

### Mutual Exclusivity

`--explore` is mutually exclusive with `--tweak`, `--complex`, and `--problem-solve`:
- `--explore` produces a TENTATIVE brief (uncommitted)
- `--tweak`, `--complex`, `--problem-solve` produce COMMITTED specs

**Valid combinations:**
- `--explore --debug` (exploration with debug focus)
- `--problem-solve --debug` (convergent analysis with debug focus)

**Invalid combinations (will error):**
- `--explore --tweak` (conflicting workflows)
- `--explore --complex` (conflicting workflows)
- `--explore --problem-solve` (divergent vs convergent conflict)

### Behavior by Tier

**Default (no flag):**
- 5 discovery questions, context findings, 5 detail questions, spec
- Standard `06-requirements-spec.md` output
- Recommended for most feature work

**`--tweak`:**
- Skip discovery phase entirely
- 2-3 quick scope confirmation questions only
- Minimal spec focused on: what changes, where, acceptance criteria
- Fast path
- Output: `06-requirements-spec.md` with `tier: tweak` in metadata

**`--complex`:**
- Full discovery + detail phases (10 questions total)
- Extended context analysis with risk assessment
- Multi-phase breakdown in spec (Phase 1, Phase 2, etc.)
- Dependency mapping between phases
- Output: `06-requirements-spec.md` with `tier: complex` in metadata
- May recommend splitting into multiple requirements

### Tier Detection

If no flag is provided, `/plan` will analyze the task and **recommend** a tier:

```
Analyzing: "Add dark mode toggle to settings"
-> Recommended tier: default (standard feature, clear scope)
-> Proceeding with standard planning...
```

```
Analyzing: "Refactor CSS architecture to use design tokens"
-> Recommended tier: --complex (architectural change, multi-file impact)
-> Suggest running: /plan "Refactor CSS architecture..." --complex
-> Proceed with standard planning anyway? [y/n]
```

The user can override the recommendation.

### Additional Flags

| Flag | Purpose | Best For |
|------|---------|----------|
| `--debug` | Debug-focused analysis | Bug fixes, performance issues, root causes |
| `--from-brief` | Convert exploration brief to spec | After `--explore`, when ready to commit |

**`--from-brief` behavior:**
- No path argument: Auto-detects most recent exploration brief in `.claude/requirements/`
- With path: Uses specified brief (for older briefs or specific selection)

```bash
/plan "Fix login timeout" --debug
/plan --from-brief                           # Auto-detect recent brief
/plan --from-brief .claude/requirements/2026-02-04-1840-my-idea/06-exploration-brief.md
```

These flags are processed in Section 2 AFTER the requirements folder is created.

---

## 0.3 Tool Routing

All cognitive work in /plan MUST use the correct tool. Do not rely on defaults.

| Purpose | Tool | When |
|---------|------|------|
| All thinking/analysis (modes, systems mapping, pre-mortem, creative thinking, etc.) | `mcp__cognition-mcp__cognition` | ALWAYS for cognitive work |
| Codebase exploration | `Task` with `subagent_type="Explore"`, `model: "opus"` | When needing to search code |
| Context loading | `mcp__project-context__query_context` | Section 1 initialization |

**Model constraint:** If you spawn ANY Task subagent during /plan, you MUST pass `model: "opus"`. Planning requires deep reasoning -- never downgrade to Sonnet or Haiku.

**Explicit prohibition:** NEVER use `mcp__sequential-thinking__sequentialthinking` as the default thinking tool. It is a linear chain tool. For exploratory, multi-mode thinking, ALWAYS use `mcp__cognition-mcp__cognition`.

---

## 1. Initialize or Reuse a Requirement

**THIS SECTION RUNS FIRST -- BEFORE ANY COGNITION ANALYSIS.**

**CRITICAL PATH RULE**: ALL requirements artifacts go in `.claude/requirements/`, NEVER in `requirements/` at project root.
- CORRECT: `.claude/requirements/2025-11-29-1430-dark-mode/`
- WRONG: `requirements/2025-11-29-1430-dark-mode/`
- Before ANY Write/mkdir: verify path starts with `.claude/`

1. If there is NO active requirement:
   - Slugify the request (e.g. `"New onboarding flow"` -> `new-onboarding-flow`).
   - Create a timestamped folder at `.claude/requirements/YYYY-MM-DD-HHMM-[slug]`:
     - First ensure `.claude/requirements/` exists
     - Path MUST be: `.claude/requirements/YYYY-MM-DD-HHMM-[slug]`
     - Inside that folder create:
       - `00-initial-request.md` -- write the user's request and any initial notes.
       - `metadata.json` with:
         - `id`, `started`, `lastUpdated`, `status: "active"`, `phase: "discovery"`.
         - `progress.discovery: { answered: 0, total: 5 }`.
         - `progress.detail: { answered: 0, total: 5 }`.
         - `contextFiles: []`, `relatedFeatures: []`.
     - Write the folder name to `.claude/requirements/.current-requirement`.
   - Call `mcp__project-context__query_context` with:
     - `domain`: inferred from the request (e.g. `"nextjs"`, `"ios"`, `"expo"`, `"data"`, `"seo"`),
     - `task`: `$ARGUMENTS`,
     - `projectPath`: repo root,
     - `maxFiles`: ~15,
     - `includeHistory`: `true`.
   - Use the ContextBundle to:
     - Identify key files and existing features,
     - Populate `metadata.json.contextFiles`,
     - Initialize `.claude/orchestration/phase_state.json.requirements` with:
       - `status: "in_progress"`,
       - `requirement_id`: the slug,
       - `folder`: the requirements folder path.

2. If there IS an active requirement for the same task:
   - Reuse it and continue from its current phase.

---

## 2. Cognition Analysis Phase (If Flag Provided)

**Prerequisites**: The requirements folder from Section 1 MUST exist before this section runs.

If the user provided a cognition flag (`--debug`, `--problem-solve`, `--visual`, `--systems`, `--model`, `--creative`, `--causal`, `--decide`), run the appropriate analysis now. All analysis output is saved INTO the requirements folder created in Section 1.

### --problem-solve Mode

When `--problem-solve` is provided, run a structured analysis BEFORE discovery questions:

1. **Requirements folder already exists** (Section 1 -- completed above, non-negotiable)
2. Run cognition-mcp operations: systems mapping, pre-mortem, approach generation, evaluation
3. Save the full analysis to `00-problem-solve-analysis.md` in the requirements folder
4. Use the analysis to inform smarter discovery questions (Section 3)
5. Continue with the standard requirements pipeline

The analysis should cover:
- Systems map of affected components
- Pre-mortem: what could cause this to fail?
- 2-3 implementation approaches with trade-offs
- Recommended approach with confidence level
- Key risks tagged as `#POISON_PATH`
- Architectural decisions tagged as `#PATH_DECISION`
- Assumptions tagged as `#COMPLETION_DRIVE`

Do NOT treat `--problem-solve` as a standalone thinking exercise.
It is an analysis step WITHIN the requirements pipeline.

**When to use --problem-solve**: Database migrations, new auth systems, multi-service integrations, major refactors, features with significant unknowns, high-risk production changes. Rule of thumb: if you would use extended thinking before making a decision, use `/plan --problem-solve`.

### --debug Mode

For debug-focused planning (bug fixes, performance issues, root causes):

**Step 1: Run Debug Analysis**

Uses cognition-mcp `debug` operation:

**Step 2: Run Cognition Analysis**

```
mcp__cognition-mcp__cognition
  operation: <mapped operation>
  prompt: "Analyze this task for requirements planning: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide analysis that will inform discovery questions:
1. Key components/systems involved
2. Potential risks or concerns
3. Dependencies and integration points
4. Unknowns that need clarification
5. Suggested areas to probe in discovery"
  parameters: <if applicable>
```

**Step 3: Store Analysis**

Save the cognition output to `00-cognition-analysis.md` in the requirements folder:

```markdown
# Cognition Analysis

**Mode**: <flag used>
**Task**: <$ARGUMENTS>
**Generated**: <timestamp>

---

<Cognition output here>

---

## Key Insights for Discovery

### Components Identified
- ...

### Risks/Concerns
- ...

### Integration Points
- ...

### Unknowns to Clarify
- ...
```

**Step 4: Update Metadata**

Add to `metadata.json`:
```json
{
  "cognition": {
    "mode": "<flag>",
    "operation": "<operation>",
    "analysisFile": "00-cognition-analysis.md",
    "timestamp": "<ISO timestamp>"
  }
}
```

For `--problem-solve`, the metadata structure is:
```json
{
  "cognition": {
    "mode": "problem-solve",
    "pipeline": "full",
    "sessionId": "<cognition session ID>",
    "analysisFile": "00-problem-solve-analysis.md",
    "timestamp": "<ISO timestamp>"
  }
}
```

### --visual Mode

For UI/UX-focused planning (layouts, flows, component design):

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `visual_reasoning` operation:

```
mcp__cognition-mcp__cognition
  operation: visual_reasoning
  prompt: "Analyze the visual/UI aspects of this task for requirements planning: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide visual analysis that will inform discovery questions:
1. UI components involved and their relationships
2. Layout considerations and responsive behavior
3. User flow and interaction patterns
4. Visual hierarchy and accessibility concerns
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --visual**: Onboarding wizards, dashboard redesigns, checkout flows, component library work, responsive layout changes.

### --systems Mode

For architecture and data-flow-focused planning:

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `systems` operation:

```
mcp__cognition-mcp__cognition
  operation: systems
  prompt: "Map the system architecture relevant to this task: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide systems analysis that will inform discovery questions:
1. Components and their boundaries
2. Data flow between components
3. Integration points and dependencies
4. Feedback loops and failure modes
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --systems**: API integrations, backend architecture, microservice design, database schema changes, event-driven workflows.

### --model Mode

For first-principles and mental-model-focused planning:

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `mental_model` operation:

```
mcp__cognition-mcp__cognition
  operation: mental_model
  prompt: "Apply first-principles analysis to this task: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide mental model analysis that will inform discovery questions:
1. Core assumptions and first principles
2. Mental models applicable to this problem
3. Analogies from other domains
4. Constraints and invariants
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --model**: Foundational design decisions, domain modeling, choosing paradigms, evaluating trade-offs from first principles.

### --creative Mode

For brainstorming and divergent-thinking-focused planning:

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `creative_thinking` operation:

```
mcp__cognition-mcp__cognition
  operation: creative_thinking
  prompt: "Brainstorm creative approaches to this task: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide creative analysis that will inform discovery questions:
1. Alternative approaches beyond the obvious
2. Unconventional solutions worth considering
3. Analogies from other products or domains
4. User experience innovations
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --creative**: New feature ideation, UX innovation, exploring non-obvious solutions, brainstorming before converging.

### --causal Mode

For cause-and-effect analysis in planning:

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `causal_analysis` operation:

```
mcp__cognition-mcp__cognition
  operation: causal_analysis
  prompt: "Analyze the causal chains relevant to this task: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide causal analysis that will inform discovery questions:
1. Root causes and contributing factors
2. Causal chains and cascading effects
3. Confounding variables and hidden dependencies
4. Intervention points and leverage
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --causal**: Debugging complex system interactions, understanding why something fails intermittently, tracing side effects across modules.

### --decide Mode

For trade-off analysis and decision-focused planning:

1. **Requirements folder already exists** (Section 1)
2. Run cognition-mcp with `decide` operation:

```
mcp__cognition-mcp__cognition
  operation: decide
  prompt: "Analyze the decision trade-offs for this task: $ARGUMENTS

Context from project:
- Domain: <detected domain>
- Key files: <from ContextBundle>
- Related decisions: <from ProjectContext>

Provide decision analysis that will inform discovery questions:
1. Options available and their trade-offs
2. Criteria for evaluation
3. Risks and benefits of each option
4. Reversibility and commitment level
5. Suggested areas to probe in discovery"
```

3. Save output to `00-cognition-analysis.md` in the requirements folder
4. Continue with standard discovery flow (Section 3)

**When to use --decide**: Choosing between frameworks, buy-vs-build decisions, prioritizing competing features, evaluating migration strategies.

### How Cognition Analysis Feeds Discovery

After cognition analysis completes, continue to Section 3 with these enhancements:
- Generate more targeted discovery questions referencing specific components identified
- Address risks/concerns raised in the analysis
- Validate assumptions from the analysis
- Discovery questions should NOT be generic when cognition analysis is available

---

## 2.5 Explore Mode (--explore flag)

**When `--explore` is provided, run a DIVERGENT exploration workflow instead of the standard committed planning flow.**

The key difference: `--explore` produces a TENTATIVE brief (not committed), while standard `/plan` produces a COMMITTED spec.

### Prerequisites

1. Requirements folder from Section 1 MUST exist
2. Check mutual exclusivity: error if `-tweak`, `-complex`, or `--problem-solve` also provided

### Step 1: Run Full Deepthink-Style Exploration

Execute a depth-first exploration using route-based mode selection:

**ORIENT Phase:**
- Assess the current state of the idea/problem
- Identify uncertainties, assumptions, and unknowns
- Determine which exploration modes are relevant

**MODE SELECTION:**
Based on problem characteristics, select from:
- **MAP**: Systems mapping, causal analysis (for integration/architecture questions)
- **INVERT**: Pre-mortem, reflexion (for risk identification)
- **PERSPECTIVES**: Collaborative reasoning, steelmanning (for stakeholder concerns)
- **EDGES**: Creative thinking, analogical reasoning (for novel approaches)
- **META**: Self-reflection on reasoning process
- **DEEP**: Self-consistency via 3 parallel reasoning chains (for high-stakes decisions)

**Mode-to-Operation Mapping:**

| Mode | Cognition Operation(s) | deepthink.md Reference |
|------|----------------------|----------------------|
| MAP | `systems` + `causal_analysis` | Phase 3: MAP Mode |
| INVERT | `mental_model` (pre-mortem) | Phase 3: INVERT Mode |
| PERSPECTIVES | `collaborative_reasoning` | Phase 3: PERSPECTIVES Mode |
| EDGES | `creative_thinking` + `analogical_reasoning` | Phase 3: EDGES Mode |
| META | `meta` | Phase 3: META Mode |

Execute modes using `mcp__cognition-mcp__cognition` following the call patterns defined in `deepthink.md` Phase 3: MODE EXECUTION. Each mode subsection in deepthink.md has the exact TypeScript call template to follow.

**Example (MAP mode adapted for planning):**

```typescript
mcp__cognition-mcp__cognition({
  operation: "systems",
  sessionTitle: "Plan Explore: <task summary>",
  sessionTags: ["plan", "explore", "<domain>"],
  content: {
    system: "<the problem/opportunity being explored>",
    components: [
      { name: "<component>", function: "<what it does>", uncertainty: "<what's unclear>" }
    ],
    relationships: [
      { from: "<A>", to: "<B>", type: "<depends_on|influences|triggers>", strength: "strong|weak|unknown" }
    ],
    feedbackLoops: ["<reinforcing or balancing loops>"],
    boundaries: "<planning scope>",
    blindSpots: ["<areas where the map might be wrong>"]
  }
})
```

Use the same `sessionId` across all modes to maintain exploration continuity.

**Execute all relevant modes** -- do NOT artificially bound to a single mode. The value of `--explore` is thorough divergent exploration.

**MANDATORY SELF-CHECK** after each mode:
1. What did this mode reveal that wasn't obvious before?
2. What new questions emerged?
3. What assumptions were challenged?
4. Am I missing any external-facing considerations?
5. What would a critic say about these findings?
6. What's the most important unknown remaining?

**HARVEST Phase:**
- Gather all findings from modes executed
- Identify patterns across modes
- Surface key unknowns and risks
- Note potential approaches (without committing)

### Step 2: Save Exploration (Dual-Save)

Save exploration to TWO locations:

1. **Cognition archive**: `.claude/cognition/YYYYMMDD-HHMM-<slug>.md`
   - Full exploration output with all mode results
   - Preserves thinking for future `/think --import` reference

2. **Requirements folder**: `00-exploration-analysis.md`
   - Summary of exploration for this requirement
   - Links to full cognition file

### Step 3: Ask Minimal Clarifying Questions

After exploration, ask 2-3 questions (not the standard 10):

1. Questions should be INFORMED by exploration findings:
   - Address key unknowns surfaced during exploration
   - Validate critical assumptions exposed
   - Confirm constraints discovered

2. Generate questions in `01-exploration-questions.md`
3. Ask via `AskUserQuestion`
4. Record answers in `02-exploration-answers.md`

These are NOT generic discovery questions -- they are targeted based on what the exploration revealed.

### Step 4: Generate Exploration Brief

Create `06-exploration-brief.md` with the following REQUIRED structure:

```markdown
# Exploration Brief: [Topic]

**ID**: <slug>
**Date**: YYYY-MM-DD
**Status**: exploratory (not committed)
**Exploration Session**: <cognition sessionId>

---

## 1. Opportunity

Why consider this? What problem or opportunity does it address?

## 2. Key Unknowns

What we'd need to learn to proceed confidently:
- [Unknown 1]
- [Unknown 2]

## 3. Rough Shape (If We Proceed)

High-level approach if we decide to move forward:
- Major components/changes
- Estimated scope (small/medium/large)
- Key technical considerations

## 4. Risks & Concerns

What could go wrong? Why might we NOT do this?
- [Risk 1]
- [Risk 2]

## 5. Go/No-Go Criteria [REQUIRED]

How would we decide whether to proceed to full planning?

**Proceed if**:
- [Criterion 1]
- [Criterion 2]

**Abandon if**:
- [Criterion 1]
- [Criterion 2]

---

## Next Steps

| Decision | Recommended Action |
|----------|-------------------|
| Proceed to full planning | `/plan --from-brief` |
| Need more exploration | `/deepthink "[specific question]"` |
| Abandon | Archive this requirement |

---
*This is an exploration brief, not a committed specification.*
*Exploration preserved at: .claude/cognition/YYYYMMDD-HHMM-<slug>.md*
```

**CRITICAL**: Section 5 (Go/No-Go Criteria) is REQUIRED, not optional. This is what distinguishes an exploration brief from a committed spec.

### Step 5: Update Metadata

Update `metadata.json` with explore-specific fields:

```json
{
  "tier": "explore",
  "artifact": "exploration-brief",
  "status": "exploratory",
  "exploration": {
    "sessionId": "<cognition session ID>",
    "cognitionFile": ".claude/cognition/YYYYMMDD-HHMM-<slug>.md",
    "modesRun": ["MAP", "PERSPECTIVES", "EDGES"],
    "harvestTimestamp": "<ISO timestamp>"
  }
}
```

### Step 6: Present Next Steps

Output to user:

```
Exploration complete: .claude/requirements/<id>/06-exploration-brief.md
Status: exploratory (NOT committed)

Full exploration saved to: .claude/cognition/YYYYMMDD-HHMM-<slug>.md

Next steps:
  - Review the brief and Go/No-Go criteria
  - If proceeding: /plan --from-brief
  - If more exploration needed: /deepthink "[specific question]"
  - If abandoning: Archive this requirement folder
```

---

## 2.6 From-Brief Mode (--from-brief flag)

**Convert an exploration brief into a committed requirements spec.**

### Invocation

```bash
/plan --from-brief                    # Auto-detect most recent brief
/plan --from-brief <path>             # Use specific brief
```

### Step 0: Locate Brief

**If no path provided (auto-detect):**
1. Scan `.claude/requirements/*/06-exploration-brief.md`
2. Find the most recently modified brief
3. Confirm with user: "Found brief at [path]. Convert this brief? [y/n]"

**If path provided:**
1. Use the specified path directly

### Step 1: Read and Validate Brief

1. Read the exploration brief
2. Validate it has the required sections (Opportunity, Key Unknowns, Rough Shape, Risks, Go/No-Go)
3. Extract the exploration session reference

### Step 2: Create or Reuse Requirements Folder

If the brief is in an existing requirements folder, reuse it.
If not, create a new requirements folder and copy the brief.

### Step 3: Use Brief as Context

The brief content becomes INPUT context, not a fresh start:

1. **From "Key Unknowns"** -> Inform discovery questions
2. **From "Rough Shape"** -> Inform detail questions
3. **From "Risks & Concerns"** -> Include in context findings
4. **From "Go/No-Go Criteria"** -> Inform acceptance criteria

### Step 4: Run Standard Discovery (5 questions)

Generate 5 discovery questions, but informed by the brief's content:
- Questions should address Key Unknowns from the brief
- Questions should validate assumptions in Rough Shape
- Skip questions already answered in the brief

### Step 5: Run Standard Detail (5 questions)

Generate 5 detail questions, informed by the brief:
- Questions should refine Rough Shape into concrete requirements
- Questions should address Risks with specific mitigations
- Questions should establish acceptance criteria

### Step 6: Generate Committed Spec

Create `06-requirements-spec.md` (the committed artifact):
- Problem statement from brief's Opportunity section
- Requirements from discovery + detail answers
- Technical requirements from Rough Shape + detail answers
- Acceptance criteria informed by Go/No-Go criteria

### Step 7: Update Metadata

Update `metadata.json`:

```json
{
  "tier": "default",
  "artifact": "requirements-spec",
  "status": "complete",
  "convertedFrom": "<path-to-exploration-brief>",
  "exploration": {
    "briefPath": "<path>",
    "originalSessionId": "<from brief>"
  }
}
```

### Step 8: Present Next Steps

Output follows standard `/plan` completion (Section 5 below).

---

## 3. Discovery & Detail with RA Awareness

Operate like the legacy `/requirements-status`, but with **Response Awareness** tags:

- Use RA tags from `docs/concepts/response-awareness.md`:
  - `#PATH_DECISION` for important architectural choices,
  - `#COMPLETION_DRIVE` where you must guess due to limited context,
  - `#POISON_PATH` if you notice framing or terminology that leads toward a known-bad pattern,
  - `#CONTEXT_DEGRADED` when context is clearly insufficient.

Phases:

1. **Discovery (5 yes/no questions)**:
   - Generate 5 high-level yes/no questions in `01-discovery-questions.md`:
     - Focus on UX surface, data sensitivity, related features, perf/scale, offline needs.
     - Each question MUST include:
       - A smart default,
       - A short "Why this default makes sense" note.
   - Ask questions using `AskUserQuestion` (never free-form text questions):
     - Normalize answers to yes/no/default,
     - Record them in `02-discovery-answers.md`,
     - Update `metadata.progress.discovery.answered`.
   - When all 5 answered, set `metadata.phase = "context"`.

2. **Context Findings**:
   - Using ContextBundle + code/doc inspection, fill `03-context-findings.md`:
     - Note relevant files, patterns, standards, and risks.
     - Tag key decisions and risks with RA tags where helpful.
   - Set `metadata.phase = "detail"` when context findings are in a good state.

3. **Detail Questions (5 yes/no questions)**:
   - Create `04-detail-questions.md` with 5 PM/architect-level yes/no questions tied to concrete code paths/files.
   - Ask them with `AskUserQuestion` (same pattern as discovery).
   - Record answers in `05-detail-answers.md`, update `metadata.progress.detail.answered`.
   - Use RA tags where:
     - There are hard tradeoffs (`#PATH_DECISION`),
     - Context is thin (`#CONTEXT_DEGRADED` / `#COMPLETION_DRIVE`).

At the end of this phase, the requirements folder should contain:
- Initial request, questions/answers,
- Context findings with RA tags,
- Updated `metadata.json` tracking progress.

---
## 4. Generate Blueprint `spec.md`

When enough questions are answered (or the user explicitly asks for a blueprint):

1. Generate a blueprint-style spec file:
   - Path: `.claude/requirements/<id>/06-requirements-spec.md`
   - Contents:
     - Problem statement and solution overview,
     - Functional requirements,
     - Technical requirements with specific file paths/patterns,
     - Explicit list of RA-tagged decisions:
       - All `#PATH_DECISION` points and chosen paths,
       - Assumptions with `#COMPLETION_DRIVE`,
       - Any `#POISON_PATH` warnings or mitigations.
     - Acceptance criteria.

2. Update `metadata.json`:
   - `status: "complete"` (or `"blueprint"`),
   - `phase: "complete"`,
   - `lastUpdated`.

3. Update `.claude/requirements/index.md` with an entry for this requirement.

4. Update `.claude/orchestration/phase_state.json.requirements`:
   - `status: "completed"`,
   - `spec_path`: path to `06-requirements-spec.md`.

5. Call `mcp__project-context__save_decision` with a concise summary:
   - Domain, task description,
   - Key architecture/requirements decisions,
   - Pointer to the spec path.

No production code should be written during `/plan`.

---
## 5. Next Steps -- Execute with /orca

After `/plan` completes, suggest the matching domain command with the **same tier**:

| Plan Tier | Suggested Next Command |
|-----------|------------------------|
| `-tweak` | `/{domain} -tweak Implement requirement <id>` |
| (default) | `/{domain} Implement requirement <id>` |
| `-complex` | `/{domain} -complex Implement requirement <id>` |
| `--explore` | `/plan --from-brief <path>` (then domain command) |

### Standard Tiers (Committed Specs)

Example output:
```
Spec complete: .claude/requirements/2025-11-27-1430-dark-mode/06-requirements-spec.md
Tier: default
Domain detected: nextjs

Suggested next step:
  /nextjs Implement requirement dark-mode
```

The domain command will:
1. Detect the spec at `.claude/requirements/<id>/06-requirements-spec.md`
2. Read the `tier` from spec metadata and match execution depth
3. Pass the spec + RA tags to the grand architect
4. Treat the spec as **source of truth** for requirements and planning

### Explore Tier (Tentative Briefs)

For `--explore` mode, the output is different because the brief is NOT committed:

```
Exploration complete: .claude/requirements/2025-11-27-1430-new-feature/06-exploration-brief.md
Status: exploratory (NOT committed)
Full exploration: .claude/cognition/20251127-1430-new-feature.md

Next steps:
  - Review brief and Go/No-Go criteria
  - If proceeding: /plan --from-brief
  - If more exploration: /deepthink "[specific question]"
  - If abandoning: Archive this requirement
```

The user must EXPLICITLY decide to convert the brief to a committed spec via `--from-brief`.

**Important:** The spec contains RA tags that inform implementation:
- `#PATH_DECISION` - Architectural choices already made
- `#COMPLETION_DRIVE` - Assumptions that need verification
- `#POISON_PATH` - Patterns to avoid
- `#CONTEXT_DEGRADED` - Areas needing extra context gathering

Grand architects should respect these tags and not re-decide settled `#PATH_DECISION` items.

