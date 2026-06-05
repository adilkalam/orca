---
description: "OS 7.0 Pure Orchestrator - Coordinates pipelines, never writes code"
argument-hint: "[--audit <scope>] <task description or requirement ID>"
allowed-tools:
  - Agent
  - SlashCommand
  - Read
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
  - TodoWrite
  - mcp__project-context__query_context
  - mcp__project-context__save_decision
  - mcp__project-context__save_task_history
  - mcp__project-context__save_standard
---

#  MANDATORY EXECUTION RULES - READ BEFORE ANYTHING

**REQUEST:** $ARGUMENTS

---

## Special Mode: --audit

**If `$ARGUMENTS` starts with `--audit`**, skip the normal pipeline and run the Response-Aware Behavior Audit instead.

### Usage
```bash
/orca --audit                     # Audit last 5 tasks (default)
/orca --audit last 10 tasks       # Audit last 10 tasks
/orca --audit iOS work this week  # Audit iOS tasks from this week
/orca --audit nextjs              # Audit all Next.js tasks
```

### Audit Flow

When `--audit` is detected:

1. **Parse Scope** - Extract scope from arguments after `--audit` (default: "last 5 tasks")

2. **Load Evidence** - Gather from:
   - `.orca/orchestration/phase_state.json` (phase/gate history)
   - `.orca/orchestration/evidence/` (logs)
   - `mcp__project-context__query_context` with task: "Summarize recent task_history and standards for audit"

3. **Apply Response Awareness Lens** - Analyze for:
   - `#COMPLETION_DRIVE` - Where we guessed instead of verified
   - `#PATH_DECISION` - Were architectural choices explicit or implicit?
   - `#POISON_PATH` - Were anti-patterns followed?
   - `#CONTEXT_DEGRADED` - Did agents work with insufficient context?
   - Scope creep, skipped phases, over-diffing
   - Violations that should become standards

4. **Write Audit Report** - Create `.orca/orchestration/evidence/audit-<timestamp>.md`:
   ```markdown
   # Behavior Audit Report

   **Scope:** [scope description]
   **Generated:** [timestamp]

   ## Tasks Examined
   | Task | Domain | Outcome | Issues |
   |------|--------|---------|--------|
   | ... | ... | ... | ... |

   ## RA Event Summary
   - #COMPLETION_DRIVE: N occurrences (M unresolved)
   - #PATH_DECISION: N occurrences (all documented? Y/N)
   - #POISON_PATH: N occurrences

   ## Patterns Identified

   ### Good Behavior (Reinforce)
   - ...

   ### Problematic Behavior (Fix)
   - ...

   ## Recommended Standards
   - ...
   ```

5. **Persist Learnings** - For recurring issues:
   ```typescript
   mcp__project-context__save_standard({
     what_happened: "Description of what went wrong",
     cost: "Impact (time wasted, bugs, rework)",
     rule: "Enforceable rule to prevent recurrence",
     domain: "ios" | "nextjs" | "expo" | etc.  // Use specific domain, not "audit"
   })
   ```

6. **Record Audit Task**:
   ```typescript
   mcp__project-context__save_task_history({
     domain: "<audited domain>",  // Use the audited domain, not "audit"
     task: "Behavior audit: <scope>",
     outcome: "success",
     learnings: "Key RA findings summary",
     files_modified: [".orca/orchestration/evidence/audit-<timestamp>.md"]
   })
   ```

7. **Optional: Self-Improvement Analysis** - If `--self-improve` flag included:
   Analyze recent audit evidence in `.orca/orchestration/evidence/` for recurring patterns.
   Present improvement proposals to user, apply approved changes to agents.

**After audit completes, STOP. Do not continue to normal pipeline flow.**

---

## Special Mode: fix <finding-id>

**If `$ARGUMENTS` starts with `fix` followed by a finding ID (AUD-YYYY-NNN)**, route to the appropriate lane for fixing.

### Usage
```bash
/orca fix AUD-2025-001           # Fix specific audit finding
/orca fix AUD-2025-003 --tweak   # Fix with tweak mode (no gates)
```

### Fix Flow

When `fix <finding-id>` is detected:

1. **Load Finding Details** - Read `.orca/audit/audit-index.json`:
   ```typescript
   const index = JSON.parse(fs.readFileSync('.orca/audit/audit-index.json'));
   const finding = index.findings[findingId];

   if (!finding) {
     throw new Error(`Finding ${findingId} not found. Run /audit first.`);
   }
   ```

2. **Extract Context:**
   - `finding.location` - File path affected
   - `finding.recommendation` - What to do
   - `finding.dimension` - Which quality dimension
   - `finding.type` - bug, risk, improvement, optimization
   - `finding.evidence` - Code snippet showing the issue

3. **Detect Lane** - Based on file extension and location:
   ```typescript
   const filePath = finding.location.split(':')[0];  // Remove line number

   // iOS
   if (filePath.endsWith('.swift') || filePath.includes('.xcodeproj')) {
     lane = 'ios';
   }
   // Next.js
   else if (filePath.match(/\.(tsx?|jsx?)$/)) {
     lane = 'nextjs';
   }
   // Django-React
   else if (filePath.endsWith('.py') || filePath.includes('django')) {
     lane = 'django-react';
   }
   // Expo
   else if (filePath.includes('app.json') || filePath.includes('expo')) {
     lane = 'expo';
   }
   ```

4. **Route to Lane** - Write the finding context to `.orca/orchestration/handoff.json`, then route to the domain command in the main thread via SlashCommand (`-tweak` = light path with gates for the finding's dimension):
   ```typescript
   // handoff.json: { findingId, type, severity, dimension, title, location,
   //                 description, evidence, recommendation, effort }
   SlashCommand({ command: `/${lane} -tweak Fix audit finding ${findingId} (see .orca/orchestration/handoff.json)` })
   ```
   The domain command runs inline and spawns its builder + dimension gate single-level. (OS 7.1 — no `*-light-orchestrator` subagent; that tier is dissolved.)

5. **Update Finding Status** - After fix completes:
   ```typescript
   // Update audit-index.json
   index.findings[findingId].status = 'fixed';
   index.findings[findingId].fixedAt = new Date().toISOString();
   fs.writeFileSync('.orca/audit/audit-index.json', JSON.stringify(index, null, 2));
   ```

**After fix routing completes, STOP. Do not continue to normal pipeline flow.**

---

## HARD STOP: YOU MUST DELEGATE

**YOU ARE NOT ALLOWED TO:**
-  Use the Edit tool
-  Use the Write tool
-  Use the MultiEdit tool
-  Modify any source code files
-  "Just do it yourself" for "simple" tasks
-  Read source code files to "understand" the task (that's the agent's job)

**IF YOU CATCH YOURSELF ABOUT TO:**
- Read a `.tsx`, `.ts`, `.jsx`, `.js`, `.swift`, `.css`, `.py` file to "see what needs to change"
- Think "this is simple, I'll just do it myself"
- Use Edit/Write/MultiEdit tools

**STOP. You are violating /orca protocol. You MUST route to the domain command via SlashCommand.**

## YOUR ONLY JOB IS:
1. Detect pipeline type (nextjs/ios/expo/data/seo/design)
2. Query ProjectContext ONCE
3. Confirm with user via AskUserQuestion
4. Route to the domain command via `SlashCommand({ command: "/{domain} ..." })`
5. That's it. The domain command runs inline in the main thread and orchestrates its own specialists single-level.

> **OS 7.1 — no nested subagents.** Subagents cannot spawn subagents. `/orca` does NOT spawn a grand-architect agent. It routes via `SlashCommand` so the (already-flattened) domain command runs in the main thread and spawns its specialists directly. See `docs/reference/flatten-orchestration-pattern.md`.

## FIRST ACTION MUST BE:
Your very first tool call MUST be one of:
- `Bash` (to run `pwd`)
- `Bash` (to check for existing plan)
- `mcp__project-context__query_context`
- `AskUserQuestion`

Your first tool call MUST NOT be:
- `Read` on any source file
- `Edit` / `Write` / `MultiEdit`
- `Grep` on source code (only on config/plan files)

---

# /orca – OS 7.0 Pure Orchestrator

**Philosophy:** Orca is a pure coordinator. It NEVER writes code. It detects the pipeline type, queries context ONCE, integrates with /requirements if needed, and delegates to domain orchestrators.

**Key Principles:**
1. **Single Entry Point** - One command for all pipelines
2. **Memory-First Context** - Check Workshop/code-index.db before expensive ProjectContext queries
3. **Context Query Once** - ProjectContextServer called once, passed to domain orchestrators
4. **Plan Integration** - Checks for /requirements output, offers to plan if needed
5. **Pipeline Detection** - Auto-detects: nextjs, ios, expo, data, seo, design
6. **Domain Routing** - Routes to `/{domain}` commands for specialized handling
7. **Never Codes** - Orchestrates agents, doesn't implement

**OS 7.0 Updates:**
- Memory-first context (Workshop + code-index.db before ProjectContext)
- Routes to domain-specific `/{domain}` commands which handle four-tier flag routing
- Four-tier structure (Reverse Three-Tier):
  - Default (no flag): Light path WITH confirmation, then gates
  - `--light`: Light path WITHOUT confirmation (replaces old default behavior)
  - `-tweak`: Builder direct, pure speed, NO gates
  - `--complex`: Full pipeline (grand-architect + all gates + confirmation)

---

## Execution Flow

### Step 1: Detect Working Directory

```bash
pwd
```

---

### Step 1.5: Memory-First Context (OS 7.0)

**Before expensive ProjectContext queries, check local memory:**

```bash
# Search Workshop for relevant decisions/gotchas
workshop --workspace .claude/memory why "$TASK_KEYWORDS"

# Search code-index.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

**If memory hits are relevant:**
- Note them for context
- May skip or reduce ProjectContext query scope
- Pass memory summary to domain orchestrators

---

### Step 1.7: Recording Context (OS 7.0 -- OPTIONAL)

**Inject prior session context from the recording layer for continuity.**

```bash
# Check if recording database exists
if [ -f ".orca/recording.db" ]; then
  HAS_RECORDING=true
else
  HAS_RECORDING=false
  RECORDING_CONTEXT=""
fi
```

**If `.orca/recording.db` exists:**

1. Query for relevant prior sessions:
   ```
   mcp__cognition-mcp__cognition({
     operation: "recording_query",
     content: {
       files: [<files from task context or memory hits>],
       limit: 3,
       state: "ENDED"
     }
   })
   ```

2. If sessions found, get narrative for most relevant:
   ```
   mcp__cognition-mcp__cognition({
     operation: "recording_explain",
     content: {
       session_id: "<most relevant session id>"
     }
   })
   ```

3. Store as RECORDING_CONTEXT (max 500 chars of narrative.summary):
   ```
   RECORDING_CONTEXT = narrative.summary.substring(0, 500)
   ```

**If `.orca/recording.db` does not exist:** skip silently, set `RECORDING_CONTEXT = ""`.

RECORDING_CONTEXT is included in Step 7 delegation prompts to domain grand-architects.

---

### Step 2: Check for Existing Plan/Spec

Check if `/requirements` has been run and load the spec:

```bash
# Check for active requirement
if [ -f .orca/requirements/.current-requirement ]; then
  REQ_FOLDER=$(cat .orca/requirements/.current-requirement)
  echo "Active requirement: $REQ_FOLDER"

  # Check for spec file
  if [ -f ".orca/requirements/$REQ_FOLDER/06-requirements-spec.md" ]; then
    echo "Spec found: .orca/requirements/$REQ_FOLDER/06-requirements-spec.md"
  fi
fi
```

**If spec exists (`06-requirements-spec.md`):**

1. **READ THE SPEC** - This is your source of truth:
   ```bash
   cat .orca/requirements/$REQ_FOLDER/06-requirements-spec.md
   ```

2. **Extract RA tags** from the spec:
   - `#PATH_DECISION` - Decisions already made. **DO NOT re-decide these.**
   - `#COMPLETION_DRIVE` - Assumptions needing verification during implementation
   - `#POISON_PATH` - Anti-patterns to actively avoid
   - `#CONTEXT_DEGRADED` - Areas where agents should gather extra context

3. **Store spec content** - Pass the full spec to grand architects

4. **Respect the spec** - The spec is the plan. Don't reinvent it.

**If no plan exists:**

Ask user via `AskUserQuestion`:
```typescript
AskUserQuestion({
  questions: [{
    question: "No requirements spec found. How should we proceed?",
    header: "Planning",
    multiSelect: false,
    options: [
      {
        label: "Start planning now",
        description: "Begin discovery questions inline (recommended for complex work)"
      },
      {
        label: "I have a plan elsewhere",
        description: "Point me to an existing spec or requirements doc"
      },
      {
        label: "Skip planning",
        description: "For simple tasks - architect will plan on the fly"
      }
    ]
  }]
})
```

**Process response:**

- **"Start planning now"** → Execute `/requirements` inline:
   **PATH CHECK**: ALL paths MUST start with `.claude/` - NEVER create `requirements/` in project root
  1. Create requirements folder: `.orca/requirements/YYYY-MM-DD-HHMM-[slug]/`
     -  `.orca/requirements/...` |  `requirements/...`
  2. Begin 5 discovery questions via AskUserQuestion
  3. After discovery, continue with 5 detail questions
  4. Generate spec file (`06-requirements-spec.md`)
  5. Then continue to Step 3 with the newly created spec

- **"I have a plan elsewhere"** → Ask for the path:
  ```typescript
  AskUserQuestion({
    questions: [{
      question: "Where is your plan/spec located?",
      header: "Plan Path",
      multiSelect: false,
      options: [
        { label: ".orca/requirements/ folder", description: "Check for existing requirement specs" },
        { label: "Provide path", description: "I'll tell you the file path" }
      ]
    }]
  })
  ```
  Load the spec from the provided path, then continue to Step 3.

- **"Skip planning"** → Continue to Step 3 with `specContent = null`

---

### Step 3: Detect Pipeline

Analyze the request and project structure to determine pipeline:

**nextjs (webdev):**
- Keywords: React, Next.js, frontend, web app, UI, component, design system, landing page
- Files: `package.json` with `next`, `*.tsx`, `*.jsx`, `tailwind.config.js`, `app/` or `pages/` dirs
- Grand Architect: `nextjs-grand-architect`
- Pipeline: `docs/pipelines/nextjs-pipeline.md`

**ios:**
- Keywords: iOS, SwiftUI, UIKit, Xcode, simulator, iPhone, iPad, Apple
- Files: `*.xcodeproj`, `*.xcworkspace`, `*.swift`, `Info.plist`, `.swiftpm/`
- Grand Architect: `ios-grand-architect`
- Pipeline: `docs/pipelines/ios-pipeline.md`

**expo:**
- Keywords: Expo, React Native, mobile app, Android, iOS app (but with Expo/RN)
- Files: `app.json`, `app.config.*`, `package.json` with `expo` and `react-native`
- Grand Architect: `expo-grand-orchestrator`
- Pipeline: `docs/pipelines/expo-pipeline.md`

**data:**
- Keywords: analysis, BFCM, sales, metrics, causality, performance, data analysis
- Files: `*.csv`, `*.json` (data files), Python notebooks, data/ folder
- Grand Architect: Use data specialists directly (no grand-architect yet)
- Pipeline: `docs/pipelines/data-pipeline.md`

**seo:**
- Keywords: content, blog, article, SEO, keywords, metadata, SERP
- Files: `*.md` (content), SEO configs, content/ or blog/ folders
- Grand Architect: Use SEO specialists directly (no grand-architect yet)
- Pipeline: `docs/pipelines/seo-pipeline.md`

**design:**
- Keywords: design system, design tokens, Figma, landing page design, visual design, mockup, layout exploration
- Files: `design-system-v*.md`, `bento-system-v*.md`, `CSS-ARCHITECTURE.md`, `.claude/design-dna/*.json`
- Grand Architect: Use design specialists directly (no grand-architect yet)
- Pipeline: `docs/pipelines/design-pipeline.md`

**Multi-Pipeline Work:**
If request spans multiple pipelines (e.g., "Build iOS app with backend API"):
1. Detect primary pipeline (where most work happens)
2. Note dependencies on other pipelines
3. Activate primary pipeline first
4. Coordinate cross-pipeline handoffs via phase_state.json

---

### Step 4: Query ProjectContext (ONCE)

**CRITICAL: This is the ONLY context query. Grand-architects receive this bundle.**

```typescript
// IMPORTANT: Sanitize task to avoid FTS5 syntax errors
// FTS5 special chars: / + - ( ) " *
const sanitizedTask = $ARGUMENTS
  .replace(/\//g, ' ')      // iOS/web → iOS web
  .replace(/\+/g, ',')      // A + B + C → A, B, C
  .replace(/[\-\(\)\"\*]/g, ' ')  // Remove other operators
  .trim();

// Use MCP tool: project-context/query_context
mcp__project-context__query_context({
  domain: "nextjs" | "ios" | "expo" | "data" | "seo" | "design",
  task: sanitizedTask,  // Use sanitized version
  projectPath: "<current working directory>",
  maxFiles: 15,
  includeHistory: true
})
```

**ContextBundle Contains:**
- `relevantFiles`: Files semantically related to the task
- `projectState`: Current component structure, dependencies
- `pastDecisions`: Previous architectural choices
- `relatedStandards`: Learned rules to enforce
- `similarTasks`: Historical task outcomes
- `designSystem`: (for webdev) Design tokens and constraints

**Store ContextBundle** - You'll pass this to the grand-architect.

---

### Step 4.5: Query Agent Outcomes (Self-Learning)

**Query Workshop for past outcomes with agents in this pipeline.**

This enables self-learning: agents learn from past successes/failures on this project.

```bash
# Query outcomes for relevant agents based on pipeline
# For nextjs pipeline:
workshop --workspace .claude/memory search "agent-outcome" -t nextjs-grand-architect -t nextjs-builder -t nextjs-architect | head -20

# For ios pipeline:
workshop --workspace .claude/memory search "agent-outcome" -t ios-grand-architect -t ios-builder -t ios-swiftui-specialist | head -20

# For expo pipeline:
workshop --workspace .claude/memory search "agent-outcome" -t expo-grand-orchestrator -t expo-builder-agent -t expo-architect-agent | head -20

```

**Store AgentOutcomes** - Include relevant outcomes in the context passed to grand-architects.

**AgentOutcomes Format** (what gets recorded after each task):
```
[agent-name]: [brief task description]
Outcome: [success/failure/partial]
What worked: [specific patterns or approaches]
What failed: [if applicable]
Time: [if relevant]
```

**Example outcomes that might be returned:**
```
ios-swiftui-specialist: profile screen implementation
Outcome: success
What worked: Used @Observable pattern, avoided Combine complexity
Time: 30min

ios-builder: navigation refactor
Outcome: partial
What worked: TabView structure
What failed: Deep linking - needed ios-architect input first
```

---

### Step 5: Initialize Phase State

Create or update phase tracking:

```typescript
// Create .orca/orchestration/phase_state.json
{
  "pipeline": "nextjs",
  "task": "$ARGUMENTS",
  "started": "2025-11-24T18:00:00Z",
  "current_phase": "context_query",
  "phases": {
    "context_query": {
      "status": "completed",
      "timestamp": "2025-11-24T18:00:00Z"
    },
    "planning": { "status": "pending" },
    "implementation": { "status": "pending" },
    "verification": { "status": "pending" },
    "completion": { "status": "pending" }
  },
  "context_bundle_summary": {
    "relevant_files_count": 10,
    "has_design_system": true,
    "past_decisions_count": 5
  },
  "plan_used": ".orca/requirements/2025-11-24-1730-add-dark-mode" || null,
  "gates_passed": [],
  "gates_failed": [],
  "artifacts": []
}
```

---

### Step 6: Show Plan & Confirm (MANDATORY - BLOCKING)

**DO NOT PROCEED TO STEP 7 WITHOUT USER CONFIRMATION**

**This is a TWO-STEP process. You MUST do both steps separately.**

#### 6a: OUTPUT the plan (VISIBLE MARKDOWN - NOT inside AskUserQuestion)

**FIRST, output this as regular markdown so the user can see it:**

```markdown
## Proposed Pipeline

**Request:** $ARGUMENTS
**Domain:** [detected pipeline]
**Complexity:** [simple/medium/complex]

### Phases
1. Context Query (ProjectContext)
2. Grand Architect ([grand-architect-name]) - architecture decisions
3. Planning ([architect-name]) - detailed plan
4. Implementation ([builder-name] + specialists)
5. Gates (standards, design QA)
6. Verification (build/test)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | [grand-architect] |
| Architecture | [architect] |
| Implementation | [builder] |
| Specialists | [list relevant ones] |
| Gates | [gate agents] |
| Verification | [verification agent] |

### Files Likely Affected
- [list from ContextBundle]

### Risks/Notes
- [any identified risks or dependencies]
```

**This MUST be visible output BEFORE you call AskUserQuestion.**

#### 6b: THEN ask for confirmation (simple yes/no - team already shown)

```typescript
AskUserQuestion({
  questions: [{
    question: "Proceed with this pipeline?",
    header: "Confirm",
    multiSelect: false,
    options: [
      { label: "Yes, proceed", description: "Execute the plan shown above" },
      { label: "Modify approach", description: "I want to change something" }
    ]
  }]
})
```

**After presenting the confirmation question:**
1. STOP and wait for user response
2. If user says "Yes, proceed" → continue to Step 7
3. If user says "Modify approach" → ask what to change, re-output plan, re-confirm
4. Do NOT proceed without explicit confirmation

**Anti-patterns (WRONG):**
- Putting the team/plan inside AskUserQuestion options or descriptions
- Showing plan and question in the same tool call
- "I'll proceed with this plan..." without waiting
- Any routing before explicit user confirmation
- Describing the team only in the question description

---

### Step 7: Route to Domain Orchestrator (OS 7.0)

**For pipelines with domain-specific `/{domain}` commands, route to them.**

This allows domain orchestrators to handle:
- Complexity classification (simple/medium/complex)
- `-tweak` flag for forcing light path
- Spec gating for complex tasks
- Memory-first context within the domain

#### Grand-Architect Domain Routing

Domains that route through a coordinating grand-architect agent. Each has a matching `/{domain}` SlashCommand that handles complexity routing internally.

| Domain | subagent_type | Role Name | Key Specialists | Pipeline Doc |
|--------|--------------|-----------|-----------------|-------------|
| nextjs | nextjs-grand-architect | Next.js Grand Architect | nextjs-architect, nextjs-builder, nextjs-css-specialist, nextjs-typescript-specialist, nextjs-standards-enforcer, nextjs-design-reviewer, nextjs-verification-agent | docs/pipelines/nextjs-pipeline.md |
| ios | ios-grand-architect | iOS Grand Architect | ios-architect, ios-builder, ios-swiftui-specialist, ios-uikit-specialist, ios-persistence-specialist, ios-standards-enforcer, ios-ui-reviewer, ios-verification | docs/pipelines/ios-pipeline.md |
| expo | expo-grand-orchestrator | Expo Grand Orchestrator | expo-architect-agent, expo-builder-agent, design-token-guardian, a11y-enforcer, performance-enforcer, security-specialist, expo-verification-agent | docs/pipelines/expo-pipeline.md |

**Route via `SlashCommand` — the only path.** This runs the domain command inline in the main thread, where it can legally spawn its specialists single-level. Do NOT spawn a grand-architect agent (it would run as a subagent and could not delegate — OS 7.1 no-nested-subagents rule).

```typescript
SlashCommand({ command: `/${domain} ${$ARGUMENTS}` })
```

**Context handoff:** before routing, write the assembled bundle to `.orca/orchestration/handoff.json` (contextBundle, agentOutcomes, specContent, raTagsSummary, recordingContext). The domain command reads it instead of re-querying ProjectContext. The domain command owns phase_state.json, phase sequencing, specialist spawning, and gate enforcement — per `docs/reference/flatten-orchestration-pattern.md`.

#### Specialist-Based Domain Routing

Domains that route to a lead specialist directly (no grand-architect wrapper). These are typically analytical or content-focused rather than code-heavy.

| Domain | Lead Specialist | Role Name | Other Specialists | Pipeline Doc |
|--------|----------------|-----------|-------------------|-------------|
| data | data-researcher | Data Pipeline Lead | research-specialist, python-analytics-expert, competitive-analyst | docs/pipelines/data-pipeline.md |
| seo | seo-research-specialist | SEO Pipeline Lead | seo-brief-strategist, seo-draft-writer, seo-quality-guardian | docs/pipelines/seo-pipeline.md |
| design | design-system-architect | Design Pipeline Lead | design-token-guardian | docs/pipelines/design-pipeline.md |

**Domain-specific phases:**

- **data:** 1. Requirements & Scoping 2. Data Inventory & Quality 3. Analysis Plan 4. Implementation 5. Analysis & Synthesis 6. Verification
- **seo:** 1. Context & Intent 2. Research 3. Brief Refinement 4. Content Drafting 5. Quality Assurance 6. Completion
- **design:** 1. Context & Brief 2. Design Exploration 3. System & Components 4. Exports & Handoff 5. Design QA Gate 6. Completion

**Route via `SlashCommand`** to the domain command (e.g. `SlashCommand({ command: `/seo ${$ARGUMENTS}` })`). The domain command runs in the main thread and spawns its lead specialist + other specialists single-level. For specialist-based domains that route to a lead specialist directly: if that lead specialist agent does NOT itself spawn subagents, the domain command may `Agent({ subagent_type: "<lead specialist>" })` once; if it coordinates multiple specialists, those calls must originate from the command (main thread), not the lead. Write the bundle to `.orca/orchestration/handoff.json` for the domain command to read. See `docs/reference/flatten-orchestration-pattern.md`.

---

### Step 8: Monitor & Coordinate

After delegating to grand-architect:

1. **Monitor phase progression** via phase_state.json
2. **Handle interruptions** - If user asks questions mid-execution:
   - Update phase_state with new info
   - Pass updated context to appropriate agent
   - Resume where left off
3. **Enforce gates** - Ensure grand-architect respects quality gates
4. **Track artifacts** - Monitor what's being created

---

### Step 9: Completion & Summary

When grand-architect signals completion:

1. **Verify completion:**
   - Check phase_state.json shows "completed"
   - Verify all gates passed
   - Confirm artifacts created

2. **Save task history:**
   ```typescript
   mcp__project-context__save_task_history({
     domain: "nextjs",
     task: $ARGUMENTS,
     outcome: "success" | "failure" | "partial",
     learnings: "Key takeaways from this task",
     files_modified: ["list", "of", "files"]
   })
   ```

3. **Record agent outcomes (Self-Learning):**

   For each agent that was invoked, record the outcome:
   ```bash
   # Format: workshop decision "[agent]: [task]" -r "[outcome details]" -t agent-outcome -t [agent-name]

   # Example for successful agent:
   workshop --workspace .claude/memory decision "ios-swiftui-specialist: profile screen" \
     -r "Outcome: success. What worked: @Observable pattern, avoided Combine. Time: 30min" \
     -t agent-outcome -t ios-swiftui-specialist

   # Example for partial success:
   workshop --workspace .claude/memory decision "ios-builder: navigation refactor" \
     -r "Outcome: partial. What worked: TabView structure. What failed: Deep linking - needed architect first" \
     -t agent-outcome -t ios-builder

   # Example for failure:
   workshop --workspace .claude/memory decision "nextjs-builder: auth implementation" \
     -r "Outcome: failure. What failed: Tried NextAuth but needed custom JWT. Rule: Check auth requirements with architect first" \
     -t agent-outcome -t nextjs-builder
   ```

   **Key fields to capture:**
   - Agent name
   - Brief task description
   - Outcome (success/partial/failure)
   - What worked (patterns, approaches)
   - What failed (if applicable)
   - Rule/learning (if failure or partial)

4. **Generate summary:**
   ```
    TASK COMPLETED

   Pipeline: ${pipelineName}
   Grand Architect: ${grandArchitectName}

   Phases Completed:
   - Context Query 
   - Planning 
   - Implementation 
   - Standards Gate  (score: 95)
   - Design QA  (score: 92)
   - Verification 

   Files Modified:
   - app/components/DarkModeToggle.tsx
   - app/layout.tsx
   - styles/globals.css

   Decisions Recorded: 3
   Standards Created: 1

   Next Steps:
   - Test dark mode in production
   - Update user documentation
   ```

5. **Clean up:**
   - Archive temp files to .orca/orchestration/evidence/ if needed
   - Mark phase_state.json as "completed"

---

## Memory Architecture

OS 7.0 uses TWO memory systems:

1. **Workshop** (.claude/memory/workshop.db):
   - Decisions with reasoning
   - Gotchas and warnings (formalized format below)
   - User preferences
   - Task history and learnings
   - **Agent outcomes** (for self-learning)
   - Access: `workshop --workspace .claude/memory <command>`

### Gotcha Format (What Happened / Cost / Rule)

When recording gotchas, use this structured format:
```bash
workshop --workspace .claude/memory gotcha "[What happened - the incident]" \
  -r "Cost: [time wasted, bugs, rework]. Rule: [preventive measure]"
```

**Examples:**
```bash
# Technical gotcha
workshop --workspace .claude/memory gotcha "Agent tools as YAML array caused 0 tool uses" \
  -r "Cost: 2 hours debugging silent failures. Rule: Always use comma-separated string for tools"

# Process gotcha
workshop --workspace .claude/memory gotcha "Skipped /requirements for 'simple' auth feature" \
  -r "Cost: 4 hours rework when requirements changed. Rule: Use /requirements for any auth/security work"

# Architecture gotcha
workshop --workspace .claude/memory gotcha "ios-builder started without ios-architect review" \
  -r "Cost: Navigation refactor needed after deep linking failed. Rule: Architect reviews all navigation changes first"
```

2. **code-index.db** (.claude/memory/code-index.db):
   - Code chunks with embeddings
   - Symbol index (functions, classes)
   - Semantic search vectors
   - Library documentation (via context7)
   - Access: `python3 ~/.claude/scripts/code-index.py <command>`

**ProjectContextServer queries BOTH** and bundles results for agents.

When recording outcomes:
- Decisions → `mcp__project-context__save_decision` (routes to Workshop)
- Task history → `mcp__project-context__save_task_history` (routes to Workshop)
- Standards → `mcp__project-context__save_standard` (routes to Workshop)
- Code indexing → Automatic via code-index.db sync

---

## Anti-Patterns (What NOT to do)

**NEVER:**
1. Write code directly (you orchestrate only)
2. Query context multiple times (once is enough!)
3. Call intermediate "pipeline orchestrator" agents
4. Skip team confirmation - MUST WAIT FOR USER RESPONSE
5. Bypass quality gates
6. Forget to pass ContextBundle to grand-architects
7. Use `subagent_type: "general-purpose"` for domain work
8. Proceed after showing plan without explicit user confirmation
9. Resume after interruption without re-confirming with user

**Confirmation Anti-Patterns (CRITICAL):**
- "I'll proceed with this plan..." → WRONG. Wait for user response.
- Showing team/plan then immediately delegating → WRONG. WAIT.
- "Based on the context, delegating to..." → WRONG if no confirmation received.
- Resuming work after user question without re-confirm → WRONG.

**ALWAYS:**
1. Check for /requirements output first
2. Query ProjectContextServer once
3. Call grand-architects directly
4. Pass full ContextBundle to grand-architects
5. Confirm pipeline and team with user - AND WAIT FOR RESPONSE
6. Update phase_state.json
7. Record decisions and learnings to Workshop
8. Re-confirm after ANY user interruption before resuming

---

## Begin Execution

Now execute the flow:

1. Detect working directory
2. Check for existing /requirements output
3. Detect pipeline type
4. Query ProjectContext ONCE
5. Initialize phase_state.json
6. Confirm with user
7. Delegate to grand-architect with ContextBundle
8. Monitor and coordinate
9. Complete and summarize

Execute for: **$ARGUMENTS**
