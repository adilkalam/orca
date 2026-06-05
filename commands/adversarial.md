---
description: Adversarial analysis via cognition-mcp - stress-test a proposal to find weaknesses before committing.
argument-hint: [--auto|--quick] <proposal to challenge>
allowed-tools:
  - mcp__cognition-mcp__cognition
  - AskUserQuestion
  - Read
  - Write
  - Grep
  - Glob
  - Bash
---

# /adversarial - Adversarial Analysis (cognition-mcp)

**YOUR ROLE**: Stress-test the user's proposal using cognition-mcp operations in an adversarial multi-step pipeline. You are attacking the proposal, not exploring it. The goal is finding weaknesses, not confirmation. Be genuinely adversarial throughout.

**Arguments**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/adversarial - Adversarial Analysis (cognition-mcp)

Runs adversarial analysis through a multi-operation cognition-mcp
pipeline: pre-mortem -> argumentation -> devil's advocate -> verdict.

USAGE:
  /adversarial <proposal>
  /adversarial --auto <proposal>
  /adversarial --quick <proposal>
  /adversarial --help

FLAGS:
  --auto      Fully autonomous - no questions, states assumptions
  --quick     Pre-mortem only, skip argumentation and devil's advocate

EXAMPLES:
  /adversarial Use microservices instead of monolith
  /adversarial --auto Add Redis caching layer
  /adversarial --quick Migrate from REST to GraphQL

OUTPUT: Adversarial analysis with GO / CONDITIONAL GO / NO GO verdict.

RELATED: /contemplate (exploration), /shimmer (pre-mortems), /solve (convergent)
```

---

## Output Rendering (Separate from Reasoning)

**The reasoning happens via cognition-mcp calls.** Pre-mortems, argumentation, devil's advocate -- this structured adversarial process is the core value. ALWAYS make the MCP calls and work with the structured data.

**The rendering is a separate step.** After cognition-mcp returns JSON:
1. USE the JSON data to build your adversarial analysis (this IS the reasoning)
2. When presenting to the user, render as clean markdown - not raw JSON

**Bad**: Dumping `{"steps": [...], "rootCauses": [...]}` to output
**Good**: Rendering failure modes and arguments with real prose

This is about **presentation clarity**, not about whether you use cognition-mcp.

---

## Phase 0: Parse Flags

Extract from $ARGUMENTS:

| Flag | Effect |
|------|--------|
| (none) | Full adversarial pipeline (pre-mortem + argumentation + devil's advocate) |
| `--auto` | No scope questions, states assumptions |
| `--quick` | Pre-mortem only, skip argumentation and devil's advocate |

1. Check for `--auto` flag -> Autonomous mode (no questions)
2. Check for `--quick` flag -> Shortened pipeline
3. Extract the proposal text (everything after flags)

Include `verbose: false` in every cognition MCP call.

---

## Phase 0.5a: Memory Query (Before ENTER)

Before starting analysis, query project memory for relevant context.

### 0.5a.1 Extract Keywords
From the proposal, extract 3-5 key terms:
- Topic words (e.g., "microservices", "caching", "migration")
- Domain words (e.g., "nextjs", "ios", "database")
- Risk type (e.g., "performance", "complexity", "reliability")

### 0.5a.2 Query Workshop
```bash
workshop --workspace .claude/memory search "<keywords>" --limit 5 2>/dev/null || true
workshop --workspace .claude/memory why "<topic>" 2>/dev/null || true
```

### 0.5a.3 Query Cognition Files
```bash
ls -la .claude/cognition/*<topic>* 2>/dev/null | head -5
```

If relevant files found, read the first 50 lines for summary.

### 0.5a.4 Compile Prior Context

If prior context found, include in cognition ENTER call:
```typescript
{
  operation: "thought",
  sessionTitle: "Challenge: <summary>",
  content: {
    thought: "Prior context loaded:\n- <workshop findings>\n- <related sessions>\n\nStarting adversarial analysis with this foundation.",
    thoughtNumber: 0,
    totalThoughts: 8,
    nextThoughtNeeded: true
  }
}
```

If no prior context found, proceed directly to Phase 1.

---

## Phase 1: Session Setup

1. Create `{$PWD}/.claude/cognition/YYYYMMDD-HHMM-challenge-<slug>/` directory (slug from proposal, first 30 chars, kebab-cased). IMPORTANT: This is the PROJECT's `.claude/`, NOT `~/.claude/`. Use the absolute project root path.
2. Write `00-enter.md` with:
   - Proposal text
   - Timestamp

---

## Phase 2: Orient

Write `01-orient.md` with adversarial framing:
- **The Proposal**: What's being proposed and why it looks appealing
- **What I'm suspicious of**: Initial red flags, gut-level concerns, things that seem too easy
- **What could go wrong**: Failure scenarios that come to mind before analysis

This is the adversarial stance declaration. You are not neutral. You are looking for reasons this will fail.

---

## Phase 3: Scope Questions (unless --auto)

This phase spans THREE responses when BLOCKING unknowns exist.

### Response A: Uncertainty Analysis

1. Identify what you don't know about the proposal:
   - **BLOCKING**: Would change what you attack or affect risk severity
   - **NON-BLOCKING**: Analysis remains valid either way

2. Write `02-scope-questions.md` with 2-3 questions about the proposal, each with a smart default.

3. Output a brief "## Uncertainty Scan" for the user listing BLOCKING items.

**If no BLOCKING unknowns**: Skip to Phase 4.

### Response B: AskUserQuestion ONLY (if BLOCKING unknowns exist)

**AskUserQuestion is the ONLY tool call in this response. No other tools. No text output.**

```typescript
AskUserQuestion({
  questions: [
    {
      question: "<question from BLOCKING uncertainty>",
      header: "<short label>",
      options: [
        { label: "<most likely> (Recommended)", description: "Default: <why>" },
        { label: "<alternative>", description: "<what changes>" }
      ],
      multiSelect: false
    }
  ]
})
```

### Response C: Record + Proceed

1. Write answers to `03-scope-answers.md`.
2. Proceed to Phase 4.

**--auto bypass**: State assumptions clearly ("Assuming X based on...") and proceed.

---

## Phase 4: Adversarial Engine

Start cognition session: call `operation: "thought"` with `sessionTitle: "Challenge: <summary>"`, `sessionTags: ["challenge", "adversarial"]`. Register command with `operation: "checkpoint"` (`phase: "enter"`).

### Step 4.1: Pre-Mortem (ALWAYS runs)

Call cognition `operation: "mental_model"` with:

```typescript
{
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "<the proposal being challenged>",
    setup: "This was implemented. It failed. What happened?",
    steps: [
      "<failure mode 1>",
      "<failure mode 2>",
      "<failure mode 3>",
      "<failure mode 4>",
      "<failure mode 5>"
    ],
    rootCauses: [
      { failure: "<failure 1>", cause: "<root cause>", preventable: true },
      { failure: "<failure 2>", cause: "<root cause>", preventable: true },
      { failure: "<failure 3>", cause: "<root cause>", preventable: false }
    ],
    conclusion: "<overall vulnerability assessment>"
  }
}
```

Write your adversarial analysis based on the pre-mortem findings.

**3-question self-check after pre-mortem:**
1. Am I being genuinely adversarial or just listing concerns?
2. What weakness am I avoiding because it's uncomfortable?
3. Would this analysis change if I had to stake my credibility on it?

**If --quick**: Skip Steps 4.2 and 4.3. Proceed directly to Phase 5.

### Step 4.2: Structured Argumentation (default and --auto only)

Call cognition `operation: "structured_argumentation"` with:

```typescript
{
  operation: "structured_argumentation",
  sessionId: "<sessionId>",
  content: {
    thesis: "<the proposal being challenged>",
    arguments: [
      {
        claim: "<argument against the proposal>",
        evidence: [
          { point: "<evidence point>", strength: "strong" },
          { point: "<evidence point>", strength: "moderate" }
        ],
        counterArguments: ["<possible defense>"],
        rebuttal: "<why the defense is insufficient>"
      },
      {
        claim: "<another argument against>",
        evidence: [
          { point: "<evidence>", strength: "strong" }
        ],
        counterArguments: ["<possible defense>"],
        rebuttal: "<why the defense is insufficient>"
      }
    ],
    conclusion: "<overall case against the proposal>"
  }
}
```

Write your adversarial analysis building the case against the proposal.

**3-question self-check after argumentation:**
1. Am I being genuinely adversarial or just listing concerns?
2. What weakness am I avoiding because it's uncomfortable?
3. Would this analysis change if I had to stake my credibility on it?

### Step 4.3: Devil's Advocate via Collaborative Reasoning (default and --auto only)

Call cognition `operation: "collaborative_reasoning"` with:

```typescript
{
  operation: "collaborative_reasoning",
  sessionId: "<sessionId>",
  content: {
    topic: "<the proposal being challenged>",
    perspectives: [
      {
        role: "Devil's Advocate",
        viewpoint: "This proposal will fail because...",
        arguments: [
          "<strongest argument against, informed by pre-mortem>",
          "<second argument against, informed by argumentation>",
          "<uncomfortable truth about the proposal>"
        ]
      },
      {
        role: "Defender",
        viewpoint: "The proposal has merit because...",
        arguments: [
          "<strongest defense of the proposal>",
          "<evidence the proposal could work>",
          "<what the critics are missing>"
        ]
      }
    ],
    tensions: [
      "<where advocate and defender genuinely disagree>",
      "<unresolved tension that affects the verdict>"
    ],
    synthesis: "<honest assessment of where the weight of evidence falls>"
  }
}
```

Write your synthesis of the adversarial debate.

**3-question self-check after collaborative reasoning:**
1. Am I being genuinely adversarial or just listing concerns?
2. What weakness am I avoiding because it's uncomfortable?
3. Would this analysis change if I had to stake my credibility on it?

---

## Phase 5: Harvest

### Harvest Checkpoint

Call checkpoint with `phase: "harvest"` and `projectPath`:

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    sessionFolder: "<absolute path to {$PWD}/.claude/cognition/YYYYMMDD-HHMM-challenge-slug/ -- project-local, NOT ~/.claude/>",
    summary: "<2-3 sentence executive summary of adversarial findings>",
    keyFindings: ["<key weakness 1>", "<key weakness 2>"],
    openQuestions: ["<remaining uncertainty>"],
    nextSteps: ["<what to investigate further>"],
    followUpQuestions: [
      {
        question: "<specific follow-up based on findings>",
        command: "/shimmer",
        rationale: "<why this needs deeper exploration>"
      },
      {
        question: "<specific follow-up based on findings>",
        command: "/solve",
        rationale: "<if proceeding and need to decide on approach>"
      }
    ]
  }
}
```

The MCP auto-persist writes `99-harvest.md` to the session folder via `sessionFolder`. Raw telemetry (`99-raw.json`) is written to `~/.orca-cognition/sessions/{sessionId}/`.

### Render Output

Write `99-harvest.md` in the session folder with the full output below. Also display to user.

```markdown
# Challenge: [Proposal Summary]

## The Proposal
[What's being challenged and why it seems appealing.]

## Weaknesses Found

**"[Most severe weakness]"** (#tag)
[How it was found, why it matters, what it means for the proposal.
Plain prose, no arrows, no mechanism names.]

**"[Next weakness]"** (#tag)
[Response and impact.]

**"[Finding that survived scrutiny -- if applicable]"**
[What was tested and held up. Optional -- only if meaningful.]

[Format for adversarial clarity:
- Order findings from most severe to least. Lead with what
  could kill the proposal.
- Bold weakness + plain response. No arrows, no mechanism names.
- (#tags) help focus remediation: (#assumption), (#cascade),
  (#edge-case), (#counter-argument). Use when helpful.
- Never reference the engine, the protocol, or analytical methodology
  in user-facing output.
- Curate your strongest 3-6 findings, not every observation.]

## Verdict
**[GO / CONDITIONAL GO / NO GO]**

**Required Mitigations (if CONDITIONAL GO):**
1. [mitigation 1]
2. [mitigation 2]

---

[The honest assessment. What you actually think about this proposal
now, informed by everything above. No heading. No prescribed length.
Never start with "The analysis..." or "After examining..."]

## Follow-ups
-> /shimmer "[specific uncertainty]"
   _[why this needs exploration]_
-> /solve "[how to mitigate top risk]"
   _[if proceeding and need to decide on approach]_
-> /contemplate "[specific question to investigate]"
   _[why this needs investigation]_
```

### Workshop Entry (after harvest)

```bash
workshop --workspace .claude/memory note \
  "/adversarial: [Proposal] - [Verdict]. Session: <sessionId>. File: <autoPersist.file>" \
  -t challenge -t cognition -t adversarial
```

If workshop fails, display warning and continue.

### Confirm to User

```
---
Analysis persisted:
  Folder: .claude/cognition/YYYYMMDD-HHMM-challenge-slug/
  Harvest: 99-harvest.md
---
```

### Error Handling

If file write fails:
- Display warning: "Warning: Could not persist analysis. Analysis shown above is still valid."
- Continue normally -- do NOT halt the command.

---

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

## structured_argumentation
{ thesis: string,
  arguments: {claim: string, evidence: {point: string, strength: string}[],
    counterArguments: string[], rebuttal: string}[],
  conclusion: string }

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

## Key Principles

1. **Be genuinely adversarial**. The goal is finding weaknesses, not balanced assessment. You are the red team.
2. **The 3-question self-check is your integrity mechanism.** Run it between each operation. If you catch yourself softening, go harder.
3. **Never show cognition internals** (raw JSON, session IDs, operation names) to the user in the rendered output. Only show your analysis and the final rendered output.
4. **The verdict is yours.** The cognition operations provide the analytical scaffold. The GO / CONDITIONAL GO / NO GO judgment is your synthesis of what the adversarial analysis revealed.
5. **EXECUTE, don't recommend.** Run each operation automatically. Don't ask the user whether to continue.

---

_See also: `contemplate.md`, `deepcontemplate.md`, `solve.md`_
