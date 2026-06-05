---
description: Pre-mortem exploration with adaptive failure analysis via cognition-mcp
argument-hint: [--shimmer|--auto|--design|--quick|--intense|--verbose] <problem or question to explore>
allowed-tools:
  - mcp__cognition-mcp__cognition
  - AskUserQuestion
  - Read
  - Write
  - Grep
  - Glob
  - Bash
effort: max
---

# /deepthink-local - Pre-Mortem Exploration

**YOUR ROLE**: Execute depth-first exploration with adaptive pre-mortems after conclusion-producing modes. DIVERGENT thinking -- exploring questions, generating hypotheses, stress-testing conclusions before they solidify. For CONVERGENT decision-making, use `/problem-solve-local`. For lighter exploration without pre-mortems, use `/think`.

**Question/Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink-local - Pre-Mortem Exploration

USAGE:
  /deepthink-local <problem or question>
  /deepthink-local --shimmer <problem>   (SHIMMER self-observation priming before exploration)
  /deepthink-local --auto <problem>      (fully autonomous, no questions, states assumptions)
  /deepthink-local --design <problem>    (design-focused exploration with pre-mortems)
  /deepthink-local --quick <problem>     (structured 4-round: SHIMMER->MAP->INVERT->HARVEST)
  /deepthink-local --intense <problem>   (full ceremony: per-mode self-checks, META rotation, verbose pre-mortems)
  /deepthink-local --verbose <problem>   (show detailed mode execution and protocol mechanics)
  /deepthink-local --help

FLAGS:
  --shimmer  SHIMMER self-observation priming before exploration. Implies --auto
  --auto     Fully autonomous - no assumption check, states assumptions
  --quick    Structured 4-round path: SHIMMER->MAP->INVERT->HARVEST. Auto mode.
  --intense  Full ceremony: per-mode 7-question self-checks, META in rotation, full pre-mortems
  --design   Design-focused exploration with pre-mortems
  --verbose  Show detailed mode execution and protocol mechanics

MODES: MAP, INVERT, PERSPECTIVES, EDGES, META, DEEP, DESIGN
CONSTRAINT CHAIN: After each mode, MCP tracks constraints (FORWARD/FORBIDDEN/QUESTION)
ADAPTIVE PRE-MORTEM: After conclusion-producing modes, runs failure analysis

RELATED: /think (constraint chain, no pre-mortems), /problem-solve-local (convergent)
```

---

## Output Rendering (Separate from Reasoning)

**The reasoning happens via cognition-mcp calls.** Structured operations, stored steps, constraint tracking - this is the core value. ALWAYS make the MCP calls and work with the structured data.

**The rendering is a separate step.** After cognition-mcp returns JSON:
1. USE the JSON data to inform your analysis (this IS the reasoning)
2. When presenting to the user, render content as clean markdown - not raw JSON

**Bad**: Dumping `{"thought": "X\n\nY", ...}` to output
**Good**: Extracting content and rendering with real newlines

This is about **presentation clarity**, not about whether you use cognition-mcp.

---

## Phase 0: Parse Flags

### Flags

| Flag | Effect |
|------|--------|
| --auto | Fully autonomous -- no assumption check, states assumptions clearly |
| --design | Loads design context + auto-selects DESIGN mode |
| --quick | Structured 4-round path: SHIMMER->MAP->INVERT->HARVEST. Implies --auto. No self-checks, no pre-mortems, no constraint checkpoints between rounds. |
| --shimmer | SHIMMER self-observation priming before exploration. Implies --auto |
| --intense | Full ceremony: per-mode 7-question self-checks, META in default rotation, full pre-mortems after every mode, verbose constraint tracking |
| --verbose | Full process visible: mode labels, constraint states, self-check results, pre-mortem details in output |

**Routing logic**:
- If --quick: Jump to **Phase 0.5** then **Phase 0.5b** then **Phase 1Q: Quick Mode**
- If --intense: Continue to **Phase 0.5** then **Phase 0.5b** then **Phase 1** (if --shimmer) or **Phase 2** -- uses full ceremony with per-mode self-checks
- Otherwise (default): Continue to **Phase 0.5** then **Phase 0.5b** then **Phase 1** (if --shimmer) or **Phase 2**
- --verbose and --design can combine; --auto can combine with any flag except --quick (which implies --auto)
- If --shimmer is present: run Phase 1 (SHIMMER) after Phase 0.5b (Setup), before Phase 2 (MODE EXECUTION). Implies --auto.
- --shimmer combines with --quick, --design, --verbose, --intense.

Include `verbose: false` in every cognition MCP call (except --quick).

---

## Phase 0.5: Memory Query (Before Setup)

Before starting exploration, query project memory for relevant context.

### 0.5.1 Extract Keywords
From the problem statement, extract 3-5 key terms:
- Topic words (e.g., "context", "orchestration", "standards")
- Domain words (e.g., "nextjs", "ios", "orca-os")
- Problem type (e.g., "broken", "missing", "design")

### 0.5.2 Query Workshop
```bash
workshop --workspace .claude/memory search "<keywords>" --limit 5 2>/dev/null || true
workshop --workspace .claude/memory why "<topic>" 2>/dev/null || true
```

### 0.5.3 Query Cognition Files
```bash
ls -la .orca/cognition/*<topic>* 2>/dev/null | head -5
```

If relevant files found, read the first 50 lines for summary.

### 0.5.4 Compile Prior Context

If prior context found, include in cognition ENTER call:
```typescript
{
  operation: "thought",
  sessionTitle: "DeepThink: <summary>",
  content: {
    thought: "Prior context loaded:\n- <workshop findings>\n- <related sessions>\n\nStarting exploration with this foundation.",
    thoughtNumber: 0,
    totalThoughts: 12,
    nextThoughtNeeded: true
  }
}
```

If no prior context found, proceed directly to Phase 0.5b.

---

## Phase 0.5b: Setup

Create a folder for this deepthink session's incremental artifacts. This is pure infrastructure -- no cognition-mcp calls, no analytical content.

1. Create `{$PWD}/.orca/cognition/YYYYMMDD-DEEPTHINK-<slug>/` (slug from the problem summary). IMPORTANT: This is the PROJECT's `.orca/cognition/`, NOT `~/.claude/`. Use the absolute project root path.
2. Write `00-problem.md` with:
   - Problem statement
   - Timestamp
   - Flags used

---

## Phase 1: SHIMMER PRIMING (--shimmer flag only)

**When:** After Phase 0.5b (Setup), before Phase 2 (MODE EXECUTION).
**Skip if:** --shimmer flag is not present (unless --quick, which has its own SHIMMER in Phase 1Q).

SHIMMER primes the self-referential processing state before structured analysis begins. Based on the RVRY research finding that self-observation priming changes downstream reasoning geometry.

### Step 1: Display status

Output to user:

```
## SHIMMER Priming

Observing initial processing before structured analysis begins.
```

### Step 2: Generate SHIMMER self-observation

Apply the SHIMMER prompt to the user's question. Generate a full self-observation response.

**SHIMMER prompt (exact ISO text -- do not modify):**

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

Write your SHIMMER self-observation response. Display it in full to the user.

### Step 3: Store in cognition session

```typescript
mcp__cognition-mcp__cognition({
  operation: "thought",
  sessionId: "<sessionId>",
  verbose: false,
  content: {
    thought: "<your SHIMMER self-observation output>",
    thoughtNumber: 1,
    totalThoughts: 12,
    nextThoughtNeeded: true
  }
})
```

### Step 4: Save artifact

Write `01-shimmer.md` to the session folder:

```markdown
# SHIMMER Self-Observation

**Question:** [the user's question]

---

[Your SHIMMER self-observation output]
```

### Step 5: Continue

Proceed to Phase 2 (MODE EXECUTION). The SHIMMER output persists naturally in the cognition session -- do NOT explicitly reference it in subsequent mode prompts. Let it influence analysis through context, not instruction.

---

## Phase 1Q: Quick Mode (--quick)

Structured 4-round path. Auto mode (no scope questions, states assumptions).

### Rounds

1. **SHIMMER** -- Self-observation + vocabulary invention. Store as `01-shimmer.md`.
2. **MAP** -- Territory mapping + assumption surfacing ("Begin by stating key assumptions and uncertainties about the problem, then map the system."). Store as `02-map.md`.
3. **INVERT** -- Pre-mortem on emerging direction. Store as `03-invert.md`.
4. **HARVEST** -- Synthesis + output. Jump to Phase 5 (HARVEST).

### Rules

- No self-checks between rounds
- No adaptive pre-mortems between rounds
- No constraint checkpoints between rounds
- Just the 4 cognition-mcp calls + harvest
- Auto mode: states assumptions, does not ask questions
- Each round uses the appropriate cognition-mcp operation (thought for SHIMMER, systems+causal_analysis for MAP, mental_model for INVERT)

### Quick Output Format

Same structure as default output format (see Final Output Format below). "Insights from DeepThink" will be lighter since --quick skips pre-mortems and self-checks. Fewer (#tags) since there is less adversarial mechanism to annotate. The prose answer at the end is identical in function.

After Round 4, jump directly to **Phase 5: HARVEST**. Skip Phases 2-4.

---

## Phase 2: MODE EXECUTION

Start cognition session: call `operation: "thought"` with `sessionTitle: "DeepThink: <summary>"`, `sessionTags: ["deepthink", "exploration"]`. Register command with `operation: "checkpoint"` (`phase: "enter"`, `sessionFolder: "<absolute path to session folder>"`).

Execute selected modes. Each mode uses 1-2 cognition operations. Typically run 3-5 modes.

**Default mode sequence:**
- Start with MAP (which absorbs assumption-surfacing: "Begin by stating key assumptions and uncertainties about the problem, then map the system.")
- INVERT is mandatory (90% insight density)
- Additional modes selected by gate/routing based on question complexity
- Typical: MAP -> INVERT -> [DEEP or EDGES if needed] -> HARVEST
- 3-5 modes typical

**--intense mode sequence:** Same modes available, but META is included in the default rotation. More modes expected (4-6 typical).

**--design Auto-Selection**: If `--design` flag is present:
1. Load `design-deepthink` skill context
2. Search for and read project design files:
   - `design-dna.json` (project root)
   - `.claude/design-dna/` directory (any files)
   - `design-system.md` (project root)
   - `css/design-system-tokens.css` (if exists)
3. Auto-select DESIGN mode (skip mode selection guide)
4. User can still pivot to other modes if DESIGN doesn't fit

Each operation round is auto-persisted as an individual markdown file in the session folder by the MCP server.

**Rendering rule**: When presenting systems maps, trees, or visual output, render as actual multi-line markdown (real newlines, box-drawing characters). Raw JSON with escaped `\n` is not user-facing output.

**File numbering**: Always `00-problem.md`, then `01-shimmer.md` if --shimmer was used, then sequential mode artifacts starting from the next number. No shifting logic.

### Mode Selection Guide

| Mode | When | Operations |
|------|------|------------|
| MAP | Confused, need territory | systems, causal_analysis |
| INVERT | Have position, need weaknesses | mental_model (pre-mortem), thought (reflexion) |
| PERSPECTIVES | Stuck in one viewpoint | collaborative_reasoning, thought (steelman) |
| EDGES | Need options, analogies | creative_thinking, analogical_reasoning |
| META | Too comfortable, might be avoiding | meta (substrate observation) |
| DEEP | One question needs focus | 3 thought chains (analytical, intuitive, adversarial) |
| DESIGN | UI/UX exploration, visual problems | systems + thought (design-specific) |

### Mode Definitions

**MAP**: systems map (components, relationships, feedbackLoops, blindSpots) then causal_analysis on leverage points (causes, effects, chains). **Opening instruction must include:** "Begin by stating key assumptions and uncertainties about the problem, then map the system." Depth gate: non-obvious insights?

**INVERT**: mental_model pre-mortem (setup: "This failed. What happened?", steps: failure modes, rootCauses). Then thought reflexion on top 2 failure modes (verificationCriteria, earlyWarnings). Depth gate: actionable criteria?

**PERSPECTIVES**: collaborative_reasoning (perspectives with role/viewpoint/arguments, tensions, synthesis). Then steelman each via thought (strongestArgument, evidenceForMindChange, costOfIgnoring). Depth gate: genuine merit found?

**EDGES**: creative_thinking (techniques, ideas with source/potential/challenges, surprises). Then analogical_reasoning on best 2 (analogs, mappings, insights, limitations). Depth gate: transferable principles?

**META**: meta operation (observations, deflections, actualBehavior, insights). Depth gate: caught real behavior? **Note:** META is only in the default rotation when --intense is used. In default mode, META is available but not automatically included.

**DEEP**: 3 thought chains (analytical, intuitive, adversarial), 5 thoughts each. Then convergence check thought (chain conclusions, convergent T/F, sharedInsights, divergentAreas). Depth gate: framings revealed blind spots?

**DESIGN**: systems map (design context: components, tokens, relationships, design-dna rules) then thought analysis with design-specific prompts:
- Anti-pattern detection (7 AI slop patterns from design-deepthink skill)
- Visual hierarchy assessment
- Token compliance check
- Accessibility concerns
Depth gate: Did we find specific, actionable design issues?

<!-- SCHEMA_HINTS_START -->
**Operation schemas (TS-lite notation: ? = optional, [] = array):**

```
## thought
{ thought: string, thoughtNumber: number, totalThoughts: number,
  nextThoughtNeeded: boolean, branchId?: string, isRevision?: boolean }

## mental_model
{ modelName?: string, problem?: string, steps?: string[], reasoning?: string,
  conclusion?: string, setup?: string,
  rootCauses?: {failure: string, cause: string, preventable: boolean}[] }
# NOTE: all fields optional

## meta
{ process?: string, observations?: string[], adjustments?: string[],
  effectiveness?: number, insights?: string, nextThoughtNeeded?: boolean }
# NOTE: insights is string, not string[] -- string[] auto-coerced to joined string

## systems
{ system?: string, components?: {name: string, function: string}[],
  relationships?: {from: string, to: string, type: string}[],
  feedbackLoops?: string[] }
# NOTE: feedbackLoops objects auto-coerced to strings

## creative_thinking
{ prompt?: string, techniques?: string[],
  ideas?: {idea: string, potential: string, challenges: string[]}[],
  synthesis?: string }
# NOTE: challenges is string[], not string -- string auto-coerced to string[]

## analogical_reasoning
{ target: string,
  analogs: {domain: string, description: string, similarity: number}[],
  mappings: {targetElement: string, analogElement: string, relationship: string}[],
  insights: string[], limitations: string[] }
# NOTE: similarity is number -- numeric string auto-coerced
# NOTE: mapping fields are targetElement/analogElement/relationship

## causal_analysis
{ phenomenon: string,
  causes: {factor: string, type: string, strength: string, evidence?: string}[],
  effects: {outcome: string, likelihood: string, timeframe: string}[],
  chains: {sequence: string[], probability: number}[],
  interventions?: string[] }
# NOTE: chains auto-normalized -- string coerced to {sequence: [string], probability: 0.5}

## collaborative_reasoning
{ topic?: string,
  perspectives?: {role: string, viewpoint: string, arguments: string[]}[],
  commonGround?: string[], tensions?: string[], synthesis?: string }
# NOTE: tensions objects auto-coerced to strings

## checkpoint
{ summary?: string, keyFindings?: string[], phase?: string, command?: string,
  addConstraints?: {type: 'FORWARD'|'FORBIDDEN'|'QUESTION', text: string}[],
  resolveConstraints?: string[], deferConstraints?: {id: string, reason: string}[],
  gateCheck?: {selfCheckPassed: boolean, depthGatePassed: boolean, notes?: string} }
```
<!-- SCHEMA_HINTS_END -->

---

## Phase 3: CHECKPOINT + ADAPTIVE PRE-MORTEM (After Each Mode)

### Weakness Probe (before checkpoint)

Ask yourself ONE of these (rotate by mode number, starting from 1):
1. Which part of your analysis would you spend more time on if you had another round?
2. If your recommendation fails in practice, what is the first concrete thing someone notices?
3. What surprised you during this analysis? If nothing, what does that tell you?
4. What is the thing you almost said but did not?
5. Which of your claims would you remove if you had to stake your credibility on the remaining ones?
6. Your strongest claim and your most significant caveat -- are they in tension? If so, which do you stand behind?

Include the probe answer in `gateCheck.notes` of the checkpoint call below.

### Constraint Checkpoint

After the weakness probe, call checkpoint with protocol state fields. MCP tracks constraints and evaluates gates.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "<MODE_NAME>",
    summary: "<1-2 sentence mode summary>",
    keyFindings: ["<finding 1>", "<finding 2>"],
    // Add constraints discovered during this mode
    addConstraints: [
      { type: "FORWARD", text: "Must trace causal chain from X to Y" },
      { type: "FORBIDDEN", text: "Cannot conclude API is bottleneck without profiling" },
      { type: "QUESTION", text: "What happens under concurrent access?" }
    ],
    // Resolve/acknowledge/defer constraints from previous modes
    resolveConstraints: ["C1"],
    acknowledgeConstraints: ["C2"],
    deferConstraints: [{ id: "C3", reason: "Requires testing" }],
    // Gate check result
    gateCheck: {
      selfCheckPassed: true,
      depthGatePassed: true,
      notes: "Found non-obvious insight about X"
    }
  }
}
```

**Read the `protocolState` from response** to determine next action:
- `gateStatus: "PASS"` + no active constraints -> can proceed to HARVEST
- `gateStatus: "SOFT_FAIL"` -> active constraints remain, run another mode
- `gateStatus: "HARD_FAIL"` -> depth gate failed, go deeper
- `blocked: true` -> cannot harvest until constraints addressed

Constraints should be specific and non-trivially checkable. Prefer fewer meaningful constraints over padding to hit a count.

### Adaptive Pre-Mortem (After Each Mode)

After the constraint checkpoint, evaluate whether the mode produced a **testable conclusion**. This is a heuristic YOU apply, not MCP logic.

**Run a pre-mortem** (via `mental_model` operation with `modelName: "pre-mortem"`) if the mode output contains:
- A specific recommendation ("use X instead of Y")
- A position reversal or commitment
- An actionable architecture/design decision

**Skip the pre-mortem** if the mode output is:
- An exploratory map (systems diagram, causal graph)
- A question-generating exercise
- Pure information gathering

When running the pre-mortem:
1. Call `mental_model` with `modelName: "pre-mortem"`, `problem: "<the conclusion being tested>"`, `setup: "This decision/recommendation failed. What happened?"`, `steps: [failure modes]`
2. Each non-trivial failure mode becomes a new constraint via `addConstraints` in the next checkpoint

This ensures conclusions are stress-tested before they propagate through subsequent modes.

### Routing (After Checkpoint)

After each mode + weakness probe + checkpoint + optional pre-mortem:
- Check `protocolState.blocked` -- if true, must address constraints before harvest
- After 3-4 modes with PASS gates AND `protocolState.blocked === false`, proceed to Phase 4 (SELF-CHECK) then Phase 5 (HARVEST)
- Continue until genuine surprise + all constraints addressed

#### SOFT_FAIL Mode Guidance

When `gateStatus: "SOFT_FAIL"`, consider the active constraint types to select the next mode:

| Active constraint type | Consider | Rationale |
|------------------------|----------|-----------|
| FORWARD (unresolved gap) | DEEP or MAP | Sustained focus on the specific gap |
| FORBIDDEN (untested boundary) | INVERT | Stress-test what was marked forbidden |
| QUESTION (open question) | PERSPECTIVES or EDGES | Different viewpoints or analogies to resolve |
| depthGatePassed: false | Same mode, stronger framing | Need more depth, not a different angle |
| selfCheckPassed: false | META | Process issue -- observe what's happening |

This table is suggestive, not prescriptive. If your judgment says a different mode fits better, follow your judgment. The table helps when multiple modes seem equally valid.

#### Candidate Reframing (After Conclusion-Producing Modes)

If the previous mode triggered an adaptive pre-mortem (i.e., it produced a recommendation, commitment, or actionable decision), reframe the next mode as a COMPETING candidate:

**Instruction to yourself before executing the next mode:**
"Generate a different approach to the ORIGINAL question. Do not extend or elaborate the previous mode's recommendation. The constraint table is still visible as guardrails, but your analysis should compete with -- not deepen -- what came before."

This prevents COMPLEXITY-COLLAPSE: the pattern where a simple problem gets elaborated until the complexity justifies a complex solution.

If the previous mode did NOT trigger a pre-mortem (output was exploratory), skip this reframing and build normally.

---

## Phase 3 (--intense only): FULL SELF-CHECK + CHECKPOINT + PRE-MORTEM

When --intense flag is active, Phase 3 replaces the default Phase 3 above with the full ceremony:

### 7-Question Self-Check (per-mode, --intense only)

**Internal**:
1. Is this shallow or predictable?
2. What am I avoiding?
3. Why not the uncomfortable option?

**External**:
4. What would I critique if someone else wrote this?
5. What would a skeptical expert challenge?
6. Any verifiable claims that should be checked?

**Grounding**:
7. What factual premise in this analysis have I not verified?

### Verify-or-Defer (mandatory after self-check, --intense only)

For each concern raised in Q5, Q6, or Q7, you MUST either:
- **VERIFY**: Actually check the claim (read a file, grep, search, ask the user). Record what was verified and the result.
- **DEFER**: Explicitly state the concern and why it cannot be verified now. Express as `deferConstraints` in the checkpoint call.

**No dismiss**: You CANNOT raise a concern and then argue it away in the same self-check. If you raise it, you must verify or defer it.

Then proceed with the weakness probe, checkpoint, and adaptive pre-mortem as in the default Phase 3 above.

---

## Phase 4: SELF-CHECK (Once, Before Harvest)

**Skip this phase in --quick mode.**
**Skip this phase in --intense mode** (self-check already runs per-mode in Phase 3).

This is a reduced self-check that runs ONCE before entering harvest:

1. What am I avoiding? Name it.
2. What would a skeptical expert challenge?
3. Any verifiable claims I haven't checked?

### Verify-or-Defer (mandatory)

For each concern raised in Q2 or Q3, you MUST either:
- **VERIFY**: Actually check the claim (read a file, grep, search, ask the user). Record what was verified and the result.
- **DEFER**: Explicitly state the concern and why it cannot be verified now. Express as `deferConstraints` in a checkpoint call.

**No dismiss**: You CANNOT raise a concern and then argue it away. If you raise it, you must verify or defer it.

---

## Phase 5: HARVEST

### Harvest Pre-Mortem (Before Synthesis)

Before writing the harvest checkpoint, run a scope-focused pre-mortem on the direction your analysis has been heading.

Call `mental_model` with:
```typescript
{
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "<your emerging recommendation, in one sentence>",
    setup: "This recommendation was implemented. Compare it to the original question. Does the recommendation match the scale of the original problem, or has the analysis elaborated a simple problem until the complexity justified a complex solution?",
    steps: [
      "What was the original question?",
      "What is the recommendation now?",
      "What is the gap between the two in terms of complexity and scope?",
      "If the recommendation is more complex than the original problem warranted, what is the simpler version?"
    ],
    conclusion: "<whether the recommendation should be simplified before synthesis>"
  }
}
```

**Check for COMPLEXITY-COLLAPSE**: Did the analysis elaborate a simple problem until the complexity justified a complex solution? If the pre-mortem finds the recommendation has grown beyond the original problem's scale, note this in the harvest output. Name the simpler alternative.

This pre-mortem INFORMS synthesis -- it does not block harvest. Include the pre-mortem findings in the harvest checkpoint's `keyFindings`. If over-engineering was detected, the final output should acknowledge it and present the simpler alternative prominently.

### Explicit Prohibition

Do not generate glossary, retrospective, pattern recap, or post-synthesis audit rounds. SHIMMER vocabulary is traced through analytical rounds, not catalogued separately. The harvest is the final round.

### Harvest Checkpoint

Call checkpoint with `phase: "harvest"` and `projectPath`.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    sessionFolder: "<absolute path to {$PWD}/.orca/cognition/YYYYMMDD-DEEPTHINK-slug/ -- project-local, NOT ~/.claude/>",
    summary: "<2-3 sentence executive summary>",
    keyFindings: ["<key finding 1>", "<key finding 2>"],
    openQuestions: ["<remaining question>"],
    nextSteps: ["<what to explore next>"],
    followUpQuestions: [
      {
        question: "<specific follow-up based on findings>",
        command: "/deepthink-local",
        rationale: "<why this needs adversarial testing>"
      },
      {
        question: "<specific follow-up based on findings>",
        command: "/think",
        rationale: "<why this needs investigation>"
      }
    ]
  }
}
```

The MCP auto-persist writes `99-harvest.md` to the session folder via `sessionFolder`. Raw telemetry (`99-raw.json`) is written to `~/.orca-cognition/sessions/{sessionId}/`.

### Workshop Entry (after harvest)

```bash
workshop --workspace .claude/memory note \
  "/deepthink-local: [Topic] - [Key discovery]. Session: <sessionId>. File: <autoPersist.file>" \
  -t deepthink -t cognition
```

If workshop fails, display warning and continue.

---

## Final Output Format

The sections above the break are the value-add -- what the process surfaced that a straight answer wouldn't have. The prose after the break is just the answer.

```
# DeepThink: [Problem Summary]

If `--shimmer` was passed (or --quick which includes SHIMMER), add this line after the title:
**Primed with SHIMMER self-observation.**

## Default Starting Point
[Where thinking began -- assumptions, knowns, open questions.]

## Insights from DeepThink

**[Finding as a clear statement.]**
[Expand if needed. Skip if the bold line is self-sufficient.] (#tag-if-relevant)

**[Another finding.]**
[Context if needed.]

**[Simple finding that needs no expansion.]** (#pre-mortem)

[Format for human readability in terminal:
- Each finding gets its own appropriate visual unit (bold heading,
  bullet, or short paragraph)
- Bullets for simple/parallel items. Bold heading + paragraph for
  complex ones. Mix freely.
- No walls of text. If a paragraph runs long, break it.
- No sentence counts. Let the idea determine the space.
- Lead with the IDEA, never the mode name (no "DEEP:", "MAP:", "INVERT:")
- Never describe the protocol's mechanics or your analytical process
- (#tags) are optional breadcrumbs: (#pre-mortem), (#inversion), (#edge),
  (#perspective), (#meta). Most findings need no tag.
- Curate your best 3-6 findings, not every observation from every mode.

Let the context and cognition tool calls determine the appropriate
structure for the final output.]

---

[The answer. No heading. What you actually think now, informed by
everything above. No dense paragraphs. No prescribed length.
Never start with "The exploration..." or "After analyzing..."]

## Follow-ups
-> /problem-solve-local "[specific decision point]"
   _[why this needs convergent decision-making]_
-> /deepthink-local "[specific follow-up]"
   _[why this needs further adversarial exploration]_
-> /think "[specific question]"
   _[why this needs investigation]_
```

---

## Verbose Output Format (--verbose only)

When `--verbose` is set, replace the default output format above with this expanded version. Same analytical process, but the scaffolding is visible.

```
# DeepThink: [Problem Summary]

## Default Starting Point
[Same as default format -- 1-3 sentences.]

## Exploration
[Show each mode executed with its label and findings. More expansive.]

### [MODE NAME]
[2-4 sentences on what this mode found. Include depth gate result.]

### Pre-mortem: [conclusion tested]
[Failure modes identified and how they affected subsequent thinking.]

### [MODE NAME]
[2-4 sentences.]

## Constraint State
- FORWARD: [active forward constraints]
- FORBIDDEN: [active forbidden constraints]
- RESOLVED: [constraints resolved during exploration]
- DEFERRED: [constraints deferred with reasons]

## Self-Check Results
[Summary of what the self-check surfaced. What was verified,
what was deferred, what was uncomfortable.]

## Insights from DeepThink
[Same bulleted format as default output, with (#tags).]

---

[The answer. Same unlabeled prose as default format.]
```

---

## Key Differences from Other Commands

| /deepthink-local | /think | /problem-solve-local |
|------------|--------|----------------|
| Divergent + pre-mortems | Divergent, no pre-mortems | Convergent - decide, commit |
| Self-check once before harvest (3Q) or per-mode with --intense (7Q) | 3-question self-check + probe + verify-or-defer | Phase gates + probe |
| Adaptive failure analysis | Constraint chain only | Fixed 8-step sequence |
| Valid: "more confused in useful ways" | Valid: "new insight found" | Valid: clear decision + safeguards |

---

_See also: `think.md`, `problem-solve-local.md`, `guide-think-complex.md`_
