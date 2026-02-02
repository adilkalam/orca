---
description: "Unified OS 5.0 planner -- requirements + RA blueprint (no implementation)"
argument-hint: "[-tweak] [-complex] [--visual|--systems|--debug|--model|--creative|--problem-solve] <high-level task description>"
allowed-tools:
  ["Task", "Read", "Write", "Edit", "Glob", "Grep",
   "AskUserQuestion", "mcp__project-context__query_context", "mcp__project-context__save_decision",
   "mcp__cognition-mcp__cognition"]
---

# /plan -- Requirements + Response-Aware Blueprint

Use this command to produce a **blueprint-quality requirements spec** for a task
before running any domain lane (`/nextjs`, `/ios`, `/expo`, etc.).
It combines:
- The OS 5.0 **requirements pipeline** (requirements folder + docs),
- **Response Awareness** tagging (RA tags as per `docs/reference/response-awareness.md`),
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

`/plan` supports three planning depths that match `/orca-*` execution tiers:

| Flag | Planning Depth | Use Case |
|------|----------------|----------|
| (default) | **Standard** -- Full discovery + detail questions, complete spec | Most features |
| `-tweak` | **Quick** -- 2-3 scope questions, minimal spec | Small changes, config updates |
| `-complex` | **Deep** -- Extended analysis, risk assessment, multi-phase breakdown | Architecture changes, refactors |

### Behavior by Tier

**Default (no flag):**
- 5 discovery questions, context findings, 5 detail questions, spec
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
-> Recommended tier: default (standard feature, clear scope)
-> Proceeding with standard planning...
```

```
Analyzing: "Refactor CSS architecture to use design tokens"
-> Recommended tier: -complex (architectural change, multi-file impact)
-> Suggest running: /plan -complex "Refactor CSS architecture..."
-> Proceed with standard planning anyway? [y/n]
```

The user can override the recommendation.

### Cognition Flags (Optional)

| Flag | Cognition Operation | Best For |
|------|------------------------|----------|
| `--visual` | `visual_reasoning` | UI/UX features, user flows, screen layouts |
| `--systems` | `systems` | Architecture, integrations, data flow |
| `--debug` | `debug` | Bug fixes, performance issues, root causes |
| `--model` | `mental_model` (first_principles) | Foundational decisions, "why" questions |
| `--creative` | `creative_thinking` | New features, brainstorming, exploration |
| `--causal` | `causal_analysis` | Understanding cause-effect, debugging |
| `--decide` | `decide` | Choosing between options, trade-offs |
| **`--problem-solve`** | **Structured multi-step analysis** | **Complex features, architectural decisions, high-risk implementations** |

Cognition flags combine with tier flags:

```bash
/plan -tweak --visual Update button colors
/plan -complex --systems Migrate database to PostgreSQL
/plan -complex --problem-solve Implement multi-tenant architecture
```

These flags are processed in Section 2 AFTER the requirements folder is created.

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

If the user provided a cognition flag (`--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--problem-solve`), run the appropriate analysis now. All analysis output is saved INTO the requirements folder created in Section 1.

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

### All Other Cognition Flags (--visual, --systems, --debug, etc.)

For single-operation cognition flags:

**Step 1: Parse the Flag**

Map the flag to cognition operation:

| Flag | Operation | Parameters |
|------|-----------|------------|
| `--visual` | `visual_reasoning` | - |
| `--systems` | `systems` | - |
| `--debug` | `debug` | - |
| `--model` | `mental_model` | `model: "first_principles"` |
| `--creative` | `creative_thinking` | - |
| `--causal` | `causal_analysis` | - |
| `--decide` | `decide` | - |

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

### How Cognition Analysis Feeds Discovery

After cognition analysis completes, continue to Section 3 with these enhancements:
- Generate more targeted discovery questions referencing specific components identified
- Address risks/concerns raised in the analysis
- Validate assumptions from the analysis
- Discovery questions should NOT be generic when cognition analysis is available

---

## 3. Discovery & Detail with RA Awareness

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

