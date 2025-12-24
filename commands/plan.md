---
description: "Unified OS 4.1 planner – requirements + RA blueprint (no implementation)"
argument-hint: "[-tweak] [-complex] [--visual|--systems|--debug|--model|--creative|--deepthink] <high-level task description>"
allowed-tools:
  ["Task", "Read", "Write", "Edit", "Glob", "Grep",
   "AskUserQuestion", "mcp__project-context__query_context", "mcp__project-context__save_decision",
   "mcp__cognition-mcp__cognition"]
---

# /plan – Requirements + Response-Aware Blueprint

Use this command to produce a **blueprint-quality requirements spec** for a task
before running any domain lane (`/nextjs`, `/ios`, `/expo`, etc.).
It combines:
- The OS 4.1 **requirements pipeline** (requirements folder + docs),
- **Response Awareness** tagging (RA tags as per `docs/reference/response-awareness.md`),
- **Cognition analysis** (optional) for deeper problem understanding,
- ProjectContextServer for context-aware analysis.

You never implement code from `/plan`; you only plan.

---

## 0. Cognition Integration (OS 4.1)

`/plan` supports optional cognition-mcp analysis modes that run **before** discovery questions. This produces smarter, context-aware questions instead of generic ones.

### Available Modes

| Flag | Cognition Operation | Best For |
|------|------------------------|----------|
| `--visual` | `visual_reasoning` | UI/UX features, user flows, screen layouts |
| `--systems` | `systems` | Architecture, integrations, data flow |
| `--debug` | `debug` | Bug fixes, performance issues, root causes |
| `--model` | `mental_model` (first_principles) | Foundational decisions, "why" questions |
| `--creative` | `creative_thinking` | New features, brainstorming, exploration |
| `--causal` | `causal_analysis` | Understanding cause-effect, debugging |
| `--decide` | `decide` | Choosing between options, trade-offs |
| **`--deepthink`** | **Full 8-step pipeline** | **Complex features, architectural decisions, high-risk implementations** |

### Usage Examples

```bash
# UI feature - visual reasoning first
/plan --visual Add dark mode toggle to settings

# Architecture change - systems thinking first
/plan --systems Migrate auth to OAuth2

# Bug investigation - debugging approach first
/plan --debug Fix intermittent checkout failures

# Foundational question - first principles
/plan --model Why is our API slow and what should we do?

# New feature exploration - creative thinking
/plan --creative Add gamification to user onboarding

# Complex architectural decision - full deepthink pipeline
/plan --deepthink Implement real-time collaboration features

# High-risk implementation - deepthink with complex tier
/plan --deepthink -complex Migrate from REST to GraphQL
```

### How It Works

When a Cognition flag is provided:

1. **Run Analysis First**: Before creating requirements folder, run cognition-mcp:
   ```
   mcp__cognition-mcp__cognition
     operation: <mapped operation>
     prompt: "Analyze for planning: $ARGUMENTS"
   ```

2. **Store Analysis**: Save output to `00-cognition-analysis.md` in requirements folder

3. **Inform Questions**: Use analysis insights to generate smarter discovery questions:
   - Questions reference specific components/flows identified
   - Questions address risks/concerns raised in analysis
   - Questions validate assumptions from analysis

4. **Tag Analysis Points**: Key findings become RA-tagged items in the spec:
   - Architectural insights → `#PATH_DECISION`
   - Uncertainties → `#COMPLETION_DRIVE`
   - Potential issues → `#POISON_PATH`

### Combining Flags

Cognition flags combine with tier flags:

```bash
# Quick tweak with visual analysis
/plan -tweak --visual Update button colors

# Complex task with systems analysis
/plan -complex --systems Migrate database to PostgreSQL

# Complex task with full deepthink analysis
/plan -complex --deepthink Implement multi-tenant architecture
```

---

## 0.2 DeepThink Planning Pipeline (`--deepthink`)

When `--deepthink` is provided, `/plan` runs the **full 8-step ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT pipeline** adapted for requirements planning. This is the most rigorous analysis mode, best for:

- Complex architectural decisions
- High-risk implementations
- Multi-phase features
- Migrations and refactors
- Features with significant unknowns

Unlike single-operation cognition modes, `--deepthink` executes **multiple sequential cognition operations** that build on each other, producing a comprehensive planning analysis before discovery questions.

### The Planning-Adapted Pipeline

| Phase | Steps | Planning Focus |
|-------|-------|----------------|
| **ORIENT** | 1. Orchestration, 2. Systems | Map the existing codebase/architecture the feature interacts with |
| **ANTICIPATE** | 3. Pre-Mortem | What could cause this implementation to fail? What requirements might we miss? |
| **GENERATE** | 4. Tree of Thought | Generate architectural/implementation approaches |
| **EVALUATE** | 5. Decide, 6. Challenge | Evaluate approaches; stress-test the recommended design |
| **COMMIT** | 7. Ulysses, 8. Meta | Lock in requirements commitments with safeguards; reflect on planning quality |

### DeepThink Execution Flow

When `--deepthink` is detected, execute the following pipeline (all with same sessionId):

#### Step 1: Orchestration Assessment

```typescript
mcp__cognition-mcp__cognition({
  operation: "orchestration_suggest",
  sessionTitle: "Plan DeepThink: <task summary>",
  sessionTags: ["plan", "deepthink", "requirements"],
  content: {
    task: "<task from $ARGUMENTS>",
    complexity: "complex",
    suggestedOperations: [
      { operation: "systems", reason: "Map affected components", order: 1 },
      { operation: "mental_model", reason: "Pre-mortem for requirement gaps", order: 2 },
      { operation: "tree_of_thought", reason: "Generate implementation approaches", order: 3 },
      { operation: "decide", reason: "Evaluate approaches", order: 4 },
      { operation: "ulysses_protocol", reason: "Lock in requirements", order: 5 }
    ],
    recommendation: "<1-2 sentence planning approach>"
  }
})
```

**Planning Output**: Note which areas of the codebase need exploration.

#### Step 2: Systems Mapping

```typescript
mcp__cognition-mcp__cognition({
  operation: "systems",
  sessionId: "<from step 1>",
  content: {
    system: "<feature/area being planned>",
    components: [
      { name: "<existing component 1>", function: "<what it does>" },
      { name: "<new component>", function: "<what it will do>" }
    ],
    relationships: [
      { from: "<component>", to: "<component>", type: "depends_on|influences|triggers" }
    ],
    feedbackLoops: ["<any cascading effects>"],
    boundaries: "<what's in scope vs out of scope for this feature>",
    keyLeveragePoints: ["<where the feature hooks into existing code>"]
  }
})
```

**Planning Output**: Identifies files to analyze, integration points, scope boundaries. Feeds `03-context-findings.md`.

#### Step 3: Pre-Mortem Analysis

```typescript
mcp__cognition-mcp__cognition({
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "<planning: what could cause this implementation to fail?>",
    setup: "It's 3 months post-launch. This feature has failed or caused problems. What went wrong?",
    steps: [
      "<failure mode 1: missing requirement led to...>",
      "<failure mode 2: integration issue with...>",
      "<failure mode 3: edge case not considered...>"
    ],
    rootCauses: [
      { failure: "<failure>", cause: "<root cause>", preventable: true/false }
    ],
    conclusion: "<requirements we must capture to prevent these failures>"
  }
})
```

**Planning Output**: Identifies risks → become `#POISON_PATH` tags and risk sections in spec.

#### Step 4: Implementation Approach Generation

```typescript
mcp__cognition-mcp__cognition({
  operation: "tree_of_thought",
  sessionId: "<sessionId>",
  content: {
    problem: "<how should we implement this feature?>",
    constraints: [
      "<existing architecture constraint>",
      "<risk from pre-mortem to avoid>"
    ],
    branches: [
      {
        id: "A",
        thought: "<Implementation Approach A>",
        evaluation: {
          score: 0.0-1.0,
          strengths: ["<strength>"],
          weaknesses: ["<weakness re: identified risks>"],
          feasibility: "high|medium|low"
        }
      },
      {
        id: "B",
        thought: "<Implementation Approach B>",
        evaluation: { ... }
      }
    ],
    bestPath: ["<recommended approach>"],
    synthesis: "<how best approach addresses requirements and risks>"
  }
})
```

**Planning Output**: Implementation options → become `#PATH_DECISION` tags in spec.

#### Step 5: Approach Evaluation

```typescript
mcp__cognition-mcp__cognition({
  operation: "decide",
  sessionId: "<sessionId>",
  content: {
    statement: "<which implementation approach should we require?>",
    options: [
      {
        name: "<Approach A>",
        pros: ["<pro>"],
        cons: ["<con, linked to risks>"]
      },
      {
        name: "<Approach B>",
        pros: ["<pro>"],
        cons: ["<con>"]
      }
    ],
    criteria: [
      "Addresses pre-mortem risks",
      "Fits existing architecture",
      "Maintainability",
      "Implementation complexity"
    ],
    weights: { ... },
    choice: "<recommended approach>",
    confidence: 0.0-1.0
  }
})
```

#### Step 6: Adversarial Challenge (Inline)

Generate critique of the recommended approach:

- **Assumptions being made** about the codebase or requirements
- **What could still go wrong** even with this approach
- **Devil's advocate** argument for alternative approach
- **Blind spots** in the planning analysis

**Planning Output**: Uncovers hidden assumptions → become `#COMPLETION_DRIVE` tags.

#### Step 7: Requirements Commitments (Ulysses Protocol)

```typescript
mcp__cognition-mcp__cognition({
  operation: "ulysses_protocol",
  sessionId: "<sessionId>",
  content: {
    goal: "<implement chosen approach with identified requirements>",
    context: "<why these requirements commitments matter>",
    temptations: [
      {
        trigger: "<situation during implementation>",
        temptation: "<what might cause requirement drift>",
        risk: "<why giving in is dangerous>"
      }
    ],
    commitments: [
      {
        commitment: "<specific requirement that MUST be met>",
        enforcement: "<how spec/tests will enforce it>",
        consequences: "<what breaks if not met>"
      }
    ],
    safeguards: [
      {
        safeguard: "<protective requirement>",
        trigger: "<when it matters>",
        linkedRisk: "<which pre-mortem risk it addresses>"
      }
    ],
    reviewPoints: [
      { milestone: "<implementation checkpoint>", criteria: "<what to verify>" }
    ],
    escapeHatch: "<when it's OK to revisit these requirements>"
  }
})
```

**Planning Output**: Hard requirements → core of `06-requirements-spec.md`. Safeguards become acceptance criteria.

#### Step 8: Planning Reflection

```typescript
mcp__cognition-mcp__cognition({
  operation: "meta",
  sessionId: "<sessionId>",
  content: {
    process: "DeepThink planning pipeline",
    observations: [
      "<what was most valuable in this analysis>",
      "<what surprised us about the requirements>"
    ],
    adjustments: ["<what to probe deeper in discovery questions>"],
    effectiveness: 0.0-1.0,
    insights: "<metacognitive insight about the planning>",
    transferable: "<patterns applicable to similar features>"
  }
})
```

### DeepThink Output Artifacts

After running the pipeline, create `00-deepthink-analysis.md`:

```markdown
# DeepThink Planning Analysis

**Task**: <$ARGUMENTS>
**Session ID**: <sessionId>
**Generated**: <timestamp>

---

## Phase 1: ORIENT

### Systems Map
[ASCII diagram of components and relationships]

**Key Integration Points:**
- ...

**Scope Boundaries:**
- In scope: ...
- Out of scope: ...

---

## Phase 2: ANTICIPATE

### Pre-Mortem: "This feature failed because..."

1. **[Failure Mode 1]** - Root cause: ...
2. **[Failure Mode 2]** - Root cause: ...
3. **[Failure Mode 3]** - Root cause: ...

**Risks to Address in Requirements:**
- ... `#POISON_PATH`

---

## Phase 3: GENERATE

### Implementation Approaches

| Approach | Score | Strengths | Weaknesses |
|----------|-------|-----------|------------|
| A: ... | 0.7 | ... | ... |
| B: ... | 0.85 | ... | ... |

**Recommended**: Approach B `#PATH_DECISION`

---

## Phase 4: EVALUATE

### Decision Matrix
[Weighted comparison table]

**Confidence**: 0.82

### Adversarial Critique

**Assumptions Made:** `#COMPLETION_DRIVE`
- ...

**Remaining Risks:**
- ...

**Stress Test Result**: PASSED WITH CAVEATS

---

## Phase 5: COMMIT

### Requirements Commitments

| Commitment | Enforcement | Linked Risk |
|------------|-------------|-------------|
| ... | ... | ... |

### Safeguards (Acceptance Criteria)
- [ ] ...
- [ ] ...

### Review Points
- [ ] ...

---

## Planning Insights

**Key Discovery Questions to Ask:**
1. ...
2. ...

**Areas Needing User Input:**
- ...

**RA Tags Identified:**
- `#PATH_DECISION`: [list]
- `#COMPLETION_DRIVE`: [list]
- `#POISON_PATH`: [list]
```

### How DeepThink Feeds Discovery

After the DeepThink pipeline completes:

1. **Discovery questions are NOT generic** - they directly probe:
   - Assumptions identified in Phase 4 (`#COMPLETION_DRIVE`)
   - Risk areas from Phase 2 pre-mortem
   - Scope boundaries from Phase 1 systems map
   - Alternative approaches from Phase 3 that need validation

2. **Context findings are pre-populated** with:
   - Files identified in systems mapping
   - Integration points
   - Risk areas to watch

3. **The spec inherits**:
   - `#PATH_DECISION` tags from approach selection
   - Safeguards become acceptance criteria
   - Commitments become hard requirements
   - Pre-mortem risks become "out of scope" or explicit warnings

### When to Use --deepthink

| Scenario | Use --deepthink? |
|----------|------------------|
| Simple UI change | No - use `--visual` |
| New API endpoint | Maybe - depends on complexity |
| Database migration | **Yes** |
| New authentication system | **Yes** |
| Multi-service integration | **Yes** |
| Major refactor | **Yes** |
| Feature with many unknowns | **Yes** |
| High-risk production change | **Yes** |

**Rule of thumb**: If you'd use `/deepthink` before making a decision, use `/plan --deepthink` before writing requirements.

---

## 0.1 Three-Tier Planning Depth

`/plan` supports three planning depths that match `/orca-*` execution tiers:

| Flag | Planning Depth | Use Case |
|------|----------------|----------|
| (default) | **Standard** – Full discovery + detail questions, complete spec | Most features |
| `-tweak` | **Quick** – 2-3 scope questions, minimal spec | Small changes, config updates |
| `-complex` | **Deep** – Extended analysis, risk assessment, multi-phase breakdown | Architecture changes, refactors |

### Behavior by Tier

**Default (no flag):**
- 5 discovery questions → context findings → 5 detail questions → spec
- Standard `06-requirements-spec.md` output
- Recommended for most feature work

**`-tweak`:**
- Skip discovery phase entirely
- 2-3 quick scope confirmation questions only
- Minimal spec focused on: what changes, where, acceptance criteria
- Fast path: ~2 minutes to spec
- Output: `06-requirements-spec.md` with `tier: tweak` in metadata

**`-complex`:**
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
→ Recommended tier: default (standard feature, clear scope)
→ Proceeding with standard planning...
```

```
Analyzing: "Refactor CSS architecture to use design tokens"
→ Recommended tier: -complex (architectural change, multi-file impact)
→ Suggest running: /plan -complex "Refactor CSS architecture..."
→ Proceed with standard planning anyway? [y/n]
```

The user can override the recommendation.

---
## 1. Initialize or Reuse a Requirement

 **CRITICAL PATH RULE**: ALL requirements artifacts go in `.claude/requirements/`, NEVER in `requirements/` at project root.
-  CORRECT: `.claude/requirements/2025-11-29-1430-dark-mode/`
-  WRONG: `requirements/2025-11-29-1430-dark-mode/`
- Before ANY Write/mkdir: verify path starts with `.claude/`

1. If there is NO active requirement:
   - Slugify the request (e.g. `"New onboarding flow"` → `new-onboarding-flow`).
   - Create a timestamped folder at `.claude/requirements/YYYY-MM-DD-HHMM-[slug]`:
     - First ensure `.claude/requirements/` exists
     - Path MUST be: `.claude/requirements/YYYY-MM-DD-HHMM-[slug]`
     - Inside that folder create:
       - `00-initial-request.md` – write the user’s request and any initial notes.
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

## 1.5 Cognition Analysis Phase (If Flag Provided)

If the user provided a Cognition flag (`--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--deepthink`):

### Step 0: Check for DeepThink

**If `--deepthink` is provided**: Skip this section entirely. Instead, execute the full **DeepThink Planning Pipeline** from Section 0.2. The pipeline will produce `00-deepthink-analysis.md` and feed directly into discovery questions.

For all other cognition flags, continue with the single-operation flow below.

### Step 1: Parse the Flag

Map the flag to Cognition operation:

| Flag | Operation | Parameters |
|------|-----------|------------|
| `--visual` | `visual_reasoning` | - |
| `--systems` | `systems` | - |
| `--debug` | `debug` | - |
| `--model` | `mental_model` | `model: "first_principles"` |
| `--creative` | `creative_thinking` | - |
| `--causal` | `causal_analysis` | - |
| `--decide` | `decide` | - |
| `--deepthink` | *See Section 0.2* | *Full pipeline* |

### Step 2: Run Cognition Analysis

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

### Step 3: Store Analysis

Save the Cognition output to `00-cognition-analysis.md` in the requirements folder:

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

### Step 4: Update Metadata

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

For `--deepthink`, the metadata structure is different:
```json
{
  "cognition": {
    "mode": "deepthink",
    "pipeline": "full",
    "sessionId": "<cognition session ID>",
    "analysisFile": "00-deepthink-analysis.md",
    "phases": {
      "orient": "completed",
      "anticipate": "completed",
      "generate": "completed",
      "evaluate": "completed",
      "commit": "completed"
    },
    "pathDecisions": ["<list of #PATH_DECISION items>"],
    "completionDrives": ["<list of #COMPLETION_DRIVE items>"],
    "poisonPaths": ["<list of #POISON_PATH items>"],
    "timestamp": "<ISO timestamp>"
  }
}
```

### Step 5: Proceed to Discovery

Continue to Phase 2, but use the Cognition analysis to:
- Generate more targeted discovery questions
- Reference specific components identified in analysis
- Address risks/concerns raised
- Validate assumptions

**The discovery questions should NOT be generic** when Cognition analysis is available. They should directly reference insights from the analysis.

---

## 2. Discovery & Detail with RA Awareness

Operate like the legacy `/requirements-status`, but with **Response Awareness** tags:

- Use RA tags from `docs/reference/response-awareness.md`:
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
       - A short “Why this default makes sense” note.
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
## 3. Generate Blueprint `spec.md`

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
## 4. Next Steps – Execute with /orca

After `/plan` completes, suggest the matching domain command with the **same tier**:

| Plan Tier | Suggested Next Command |
|-----------|------------------------|
| `-tweak` | `/{domain} -tweak Implement requirement <id>` |
| (default) | `/{domain} Implement requirement <id>` |
| `-complex` | `/{domain} -complex Implement requirement <id>` |

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

**Important:** The spec contains RA tags that inform implementation:
- `#PATH_DECISION` - Architectural choices already made
- `#COMPLETION_DRIVE` - Assumptions that need verification
- `#POISON_PATH` - Patterns to avoid
- `#CONTEXT_DEGRADED` - Areas needing extra context gathering

Grand architects should respect these tags and not re-decide settled `#PATH_DECISION` items.

