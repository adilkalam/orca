---
description: Adversarial analysis - systematically attack a proposal to find weaknesses before implementation.
argument-hint: [--quick|--deep|--auto] <proposal to challenge>
allowed-tools:
  - mcp__cognition-mcp__cognition
  - AskUserQuestion
  - Read
  - Grep
  - Glob
  - Bash
  - Write
---

# /challenge-local - Adversarial Analysis

**YOUR ROLE**: Stress-test the user's proposal using cognition-mcp's structured notepad pattern.

**Arguments**: $ARGUMENTS

## Adversarial Baseline (Built-In)

This command is self-contained. Every non-help run must include:

1. Pre-mortem causal analysis
2. Assumption audit (confidence + impact if wrong)
3. Edge-case storm (boundary and hostile scenarios)
4. Failure mode catalog (component, failure, blast radius, detection)
5. Counter-argument stress test
6. Final GO / CONDITIONAL GO / NO GO verdict

---

## If --help or empty arguments

Display this reference and stop:

```
/challenge-local - Adversarial Analysis

Uses cognition-mcp's accept-store-echo pattern for structured adversarial analysis.
All reasoning is explicitly recorded and persisted for review.

USAGE:
  /challenge-local <proposal>
  /challenge-local --quick <proposal>
  /challenge-local --deep <proposal>
  /challenge-local --auto <proposal>
  /challenge-local --help

FLAGS:
  --auto      Fully autonomous - no BLOCKING questions, states assumptions
  --quick     Rapid causal pass + assumption/edge scan + top risks (can ask questions)
  --quick --auto  Fastest: rapid pass, no questions
  --deep      Full analysis + simulation + ethical considerations

OPERATIONS USED:
  1. causal_analysis  - Map causes, effects, and causal chains of failure
  2. thought          - Assumptions, edge cases, and failure mode catalog
  3. structured_argumentation - Build counter-arguments with evidence
  4. simulation       - (deep mode) Run failure scenarios
  5. ethical_analysis - (deep mode) Stakeholder impact analysis
  6. decide           - Final GO/NO GO verdict with reasoning

EXAMPLES:
  /challenge-local Use microservices instead of monolith
  /challenge-local --quick Add Redis caching layer
  /challenge-local --deep Migrate from REST to GraphQL

OUTPUT: Structured analysis with persisted session + verdict.
```

---

## Output Rendering (Separate from Reasoning)

**The reasoning happens via cognition-mcp calls.** Causal analysis, structured argumentation, decision evaluation - this is the core value. ALWAYS make the MCP calls and work with the data.

**The rendering is a separate step.** After cognition-mcp returns JSON:
1. USE the JSON data to build your analysis (this IS the reasoning)
2. When presenting to the user, render as clean markdown - not raw JSON

This is about **presentation clarity**, not about whether you use cognition-mcp.

---

## Verbose Flag

Include `verbose: false` in every cognition MCP call from /challenge-local. This command makes 5-6 calls per session (default), 6-8 calls in deep mode; the minimal ACK response saves tokens.

## Parse Arguments

Extract mode and proposal from $ARGUMENTS:

1. Check for `--auto` flag -> Autonomous mode (no questions)
2. Check for `--quick` flag -> Quick mode
3. Check for `--deep` flag -> Deep mode
4. No flag -> Default mode (full analysis)
5. Extract the proposal text (everything after the flag, or all of $ARGUMENTS if no flag)

---

## Phase 0: Create Session Folder

Before any analysis, create a folder for this challenge session's incremental artifacts:

1. Create `{$PWD}/.claude/cognition/YYYYMMDD-HHMM-<slug>/` directory (slug from the proposal summary, first 30 chars, kebab-cased). IMPORTANT: This is the PROJECT's `.claude/`, NOT `~/.claude/`. Use the absolute project root path.
2. Write `00-enter.md` with:
   - Proposal text
   - Mode (quick/default/deep)
   - Timestamp

This folder is created BEFORE Phase 0.5 so that all artifacts have a home.

---

## Phase 0.5: BLOCKING Unknown Clarification (MANDATORY unless --auto)

This phase spans THREE responses. This is not optional -- the response boundaries
are what make AskUserQuestion render. The pattern mirrors /requirements Section 1+3.

### Response A: Uncertainty Analysis + Write Uncertainties + Write Questions

All of this happens in ONE response:

1. After reading the proposal, identify what you don't know:
   - **List uncertainties** about the proposal (context, constraints, goals, dependencies)
   - **Classify each** as:
     - **BLOCKING**: Would invalidate your adversarial analysis if wrong (changes what you'd attack, determines scope, affects risk severity)
     - **NON-BLOCKING**: Nice to know but analysis remains valid either way

2. For each BLOCKING unknown:
   - Check if already answered in user's prompt
   - If ambiguous or not mentioned -> needs clarification

3. Write `01-uncertainties.md` in the session folder:

```markdown
# Uncertainties: <proposal summary>

## BLOCKING
- [uncertainty 1] - needs clarification
- [uncertainty 2] - needs clarification

## NON-BLOCKING
- [uncertainty 3] - analysis valid either way
- [uncertainty 4] - analysis valid either way
```

4. Write `02-blocking-questions.md` with the questions you will ask:

```markdown
# Blocking Questions

## Q1: <question from BLOCKING uncertainty 1>
- **Smart default**: <most likely interpretation>
- **Why blocking**: <what changes if wrong>

## Q2: <question from BLOCKING uncertainty 2>
- **Smart default**: <most likely interpretation>
- **Why blocking**: <what changes if wrong>
```

5. Output a brief markdown summary for the user (e.g., "## Uncertainty Scan" with BLOCKING items listed).

This response contains: Write(01-uncertainties.md), Write(02-blocking-questions.md),
and markdown text. It does NOT contain AskUserQuestion.

**If no BLOCKING unknowns need clarification**: Skip Response B entirely and proceed to analysis.

### Response B: AskUserQuestion ONLY (if BLOCKING unknowns exist)

**AskUserQuestion is the ONLY tool call in this response. No other tools. No text output.**

```typescript
AskUserQuestion({
  questions: [
    {
      question: "<question derived from BLOCKING uncertainty>",
      header: "<short label>",
      options: [
        { label: "<most likely interpretation> (Recommended)", description: "Default: <why>" },
        { label: "<alternative interpretation>", description: "<what changes>" }
      ],
      multiSelect: false
    }
    // ... one question per BLOCKING unknown
  ]
})
```

### Response C: Record Answers + Proceed to Analysis

1. Write answers to `03-clarification-answers.md` in the session folder.
2. Incorporate answers before proceeding to analysis.

**If --auto flag present:**
- Skip Response A/B/C entirely
- State assumptions clearly at the start of output ("Assuming X based on...")
- Proceed with analysis using stated assumptions

---

## Quick Mode (--quick)

Rapid causal pass with minimal assumption and edge-case coverage.

### Process

1. Create a cognition session for the analysis:

```
mcp__cognition-mcp__cognition
  operation: "causal_analysis"
  sessionTitle: "Challenge: [proposal summary]"
  sessionTags: ["adversarial", "quick"]
  content: {
    phenomenon: "Failure of: [proposal]",
    causes: [
      { factor: "[cause 1]", type: "root|contributing|trigger", strength: "high|medium|low", evidence: "[why this matters]" },
      { factor: "[cause 2]", type: "...", strength: "...", evidence: "..." },
      { factor: "[cause 3]", type: "...", strength: "...", evidence: "..." }
    ],
    effects: [
      { outcome: "[effect 1]", likelihood: "high|medium|low", timeframe: "[when]" },
      { outcome: "[effect 2]", likelihood: "...", timeframe: "..." },
      { outcome: "[effect 3]", likelihood: "...", timeframe: "..." }
    ],
    chains: [
      { sequence: ["[cause]", "[intermediate]", "[effect]"], probability: 0.0-1.0 }
    ],
    interventions: ["[mitigation 1]", "[mitigation 2]"],
    nextThoughtNeeded: false
  }
  quality: {
    confidence: 0.0-1.0,
    completeness: 0-5,
    bias_check: "[potential bias in analysis]"
  }
```

2. Add rapid assumption + edge-case scan:

```
mcp__cognition-mcp__cognition
  operation: "thought"
  sessionId: "[from step 1]"
  content: {
    thought: "Quick adversarial scan for [proposal]",
    assumptions: [
      { assumption: "[assumption 1]", confidence: "high|medium|low", ifWrong: "[what breaks]" },
      { assumption: "[assumption 2]", confidence: "high|medium|low", ifWrong: "[what breaks]" },
      { assumption: "[assumption 3]", confidence: "high|medium|low", ifWrong: "[what breaks]" }
    ],
    edgeCases: [
      "[boundary or hostile scenario 1]",
      "[boundary or hostile scenario 2]",
      "[boundary or hostile scenario 3]",
      "[boundary or hostile scenario 4]",
      "[boundary or hostile scenario 5]"
    ],
    nextThoughtNeeded: false
  }
```

### Output Format

```markdown
# Challenge (Quick): [Proposal Summary]

## The Proposal
[What's being challenged, 1 sentence.]
Suspicious of: [gut-level concern]

## Top Risks

**"[Most critical risk]"** (#tag)
[Brief: why this matters.]

**"[Second risk]"** (#tag)
[Brief response.]

## Quick Verdict
[Proceed with caution / Needs more analysis / Red flags present]
[1-2 sentences: why]

## Where to Go Next
-> /challenge-local "[proposal]" (full analysis without --quick)
   _[why deeper analysis would help]_
-> /problem-solve "[decision point]"
   _[if ready to decide on approach]_

[No protocol jargon. No arrow notation. Order by severity.]
```

---

## Default Mode (no flags)

Full analysis using four cognition operations in sequence.

### Process

**Step 1: Causal Analysis** - Map failure causes and effects

```
mcp__cognition-mcp__cognition
  operation: "causal_analysis"
  sessionTitle: "Challenge: [proposal summary]"
  sessionTags: ["adversarial", "full"]
  content: {
    phenomenon: "Failure of: [proposal]",
    causes: [
      // 5-7 causes covering: technical, organizational, market, resource factors
      { factor: "[cause]", type: "root|contributing|trigger", strength: "high|medium|low", evidence: "[evidence]" }
    ],
    effects: [
      // 4-6 effects covering: immediate, medium-term, long-term
      { outcome: "[effect]", likelihood: "high|medium|low", timeframe: "[timeframe]" }
    ],
    chains: [
      // 2-3 critical causal chains
      { sequence: ["[start]", "[middle]", "[end]"], probability: 0.0-1.0 }
    ],
    interventions: ["[intervention 1]", "[intervention 2]", "[intervention 3]"],
    nextThoughtNeeded: true
  }
```

**Step 1.5: Assumption Audit + Edge Cases + Failure Mode Catalog**

```
mcp__cognition-mcp__cognition
  operation: "thought"
  sessionId: "[from step 1]"
  content: {
    thought: "Adversarial expansion for [proposal]: assumptions, edges, and component failure modes",
    assumptions: [
      { assumption: "[assumption 1]", confidence: "high|medium|low", ifWrong: "[impact]" },
      { assumption: "[assumption 2]", confidence: "high|medium|low", ifWrong: "[impact]" },
      { assumption: "[assumption 3]", confidence: "high|medium|low", ifWrong: "[impact]" },
      { assumption: "[assumption 4]", confidence: "high|medium|low", ifWrong: "[impact]" }
    ],
    edgeCases: [
      "[edge case 1]",
      "[edge case 2]",
      "[edge case 3]",
      "[edge case 4]",
      "[edge case 5]",
      "[edge case 6]",
      "[edge case 7]",
      "[edge case 8]",
      "[edge case 9]",
      "[edge case 10]"
    ],
    failureModes: [
      { component: "[component 1]", howItFails: "[failure mode]", blastRadius: "contained|cascading", detection: "[monitoring/signal]" },
      { component: "[component 2]", howItFails: "[failure mode]", blastRadius: "contained|cascading", detection: "[monitoring/signal]" },
      { component: "[component 3]", howItFails: "[failure mode]", blastRadius: "contained|cascading", detection: "[monitoring/signal]" }
    ],
    nextThoughtNeeded: true
  }
```

**Step 2: Structured Argumentation** - Build counter-arguments

```
mcp__cognition-mcp__cognition
  operation: "structured_argumentation"
  sessionId: "[from step 1]"
  content: {
    claim: "This proposal should NOT be implemented because...",
    premises: [
      "[premise 1 - why this will fail]",
      "[premise 2 - why this will fail]",
      "[premise 3 - why this will fail]"
    ],
    evidence: [
      { point: "[evidence 1]", source: "[source/experience]", strength: "strong|moderate|weak" },
      { point: "[evidence 2]", source: "[source/experience]", strength: "..." },
      { point: "[evidence 3]", source: "[source/experience]", strength: "..." }
    ],
    counterarguments: [
      // Steel-man the proposal (argue FOR it) then rebut
      { point: "[argument for the proposal]", rebuttal: "[why that argument is flawed]" },
      { point: "[another argument for]", rebuttal: "[rebuttal]" }
    ],
    conclusion: "[synthesis of why concerns outweigh benefits OR why they don't]",
    nextThoughtNeeded: true
  }
```

**Step 3: Decision** - Final verdict

```
mcp__cognition-mcp__cognition
  operation: "decide"
  sessionId: "[from step 1]"
  content: {
    statement: "Should we proceed with: [proposal]?",
    options: [
      { name: "GO", description: "Proceed with implementation", pros: ["..."], cons: ["..."] },
      { name: "CONDITIONAL GO", description: "Proceed with mitigations", pros: ["..."], cons: ["..."] },
      { name: "NO GO", description: "Do not proceed", pros: ["..."], cons: ["..."] }
    ],
    criteria: [
      "[criterion 1: e.g., risk tolerance]",
      "[criterion 2: e.g., resource availability]",
      "[criterion 3: e.g., reversibility]"
    ],
    analysis: "[detailed analysis of options against criteria]",
    choice: "GO|CONDITIONAL GO|NO GO",
    nextThoughtNeeded: false
  }
  quality: {
    confidence: 0.0-1.0,
    completeness: 0-5,
    bias_check: "[bias check]"
  }
```

All intermediate content (causal analysis, assumptions, argumentation, verdict) is captured in JSONL stores at `~/.orca-cognition/sessions/`.

### Output Format

```markdown
# Challenge: [Proposal Summary]

## The Proposal
[What's being challenged and why it seems appealing.]
What I'm suspicious of: [initial red flags or areas of concern]

## Weaknesses Found

**"[Most severe weakness or risk]"** (#tag)
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
- Scoring tables and weighted criteria are appropriate for
  formal evaluations (vendor selection, architecture review)
- In Deep mode, prefix simulation/ethical findings with
  **[Simulation]** or **[Ethics]** labels
- Never reference the analytical methodology in user-facing output

Let the context and cognition tool calls determine the appropriate
structure and detail level for the final output.]

## Verdict
**[GO / CONDITIONAL GO / NO GO]** (confidence: X.X)

**Required Mitigations (if CONDITIONAL GO):**
1. [mitigation 1]
2. [mitigation 2]

## Where to Go Next
-> /challenge-local --deep "[proposal]"
   _[if verdict needs simulation/ethical analysis]_
-> /problem-solve "[how to mitigate top risk]"
   _[if proceeding and need to decide on approach]_
-> /deepthink "[specific uncertainty]"
   _[if a key assumption needs exploration]_
```

---

## Deep Mode (--deep)

Full analysis PLUS simulation and ethical analysis.

### Process

1. Run all steps from Default Mode (`causal_analysis` -> `thought` for assumptions/edges/failure modes -> `structured_argumentation` -> `decide`)
2. Before final decision, add:

**Step 2.5: Simulation** - Run failure scenarios

```
mcp__cognition-mcp__cognition
  operation: "simulation"
  sessionId: "[from step 1]"
  content: {
    scenario: "[proposal] implementation failure scenario",
    initialConditions: [
      { variable: "[var 1]", value: "[initial state]" },
      { variable: "[var 2]", value: "[initial state]" }
    ],
    steps: [
      { step: 1, action: "[what happens first]", outcome: "[result]" },
      { step: 2, action: "[what happens next]", outcome: "[result]" },
      { step: 3, action: "[escalation]", outcome: "[result]" },
      { step: 4, action: "[failure point]", outcome: "[catastrophic result]" }
    ],
    finalState: "[end state description]",
    insights: ["[insight 1]", "[insight 2]"],
    alternativeOutcomes: ["[if X instead]", "[if Y instead]"],
    nextThoughtNeeded: true
  }
```

**Step 2.75: Ethical Analysis** - Stakeholder impact

```
mcp__cognition-mcp__cognition
  operation: "ethical_analysis"
  sessionId: "[from step 1]"
  content: {
    situation: "Implementation of [proposal]",
    stakeholders: [
      { group: "[stakeholder 1]", interests: "[what they want]", impact: "[how affected]" },
      { group: "[stakeholder 2]", interests: "[what they want]", impact: "[how affected]" },
      { group: "[stakeholder 3]", interests: "[what they want]", impact: "[how affected]" }
    ],
    principles: [
      { principle: "[principle 1]", application: "[how it applies]", weight: 0.0-1.0 },
      { principle: "[principle 2]", application: "[how it applies]", weight: 0.0-1.0 }
    ],
    options: [
      { option: "Proceed as-is", ethicalScore: 0.0-1.0, reasoning: "[why]" },
      { option: "Proceed with safeguards", ethicalScore: 0.0-1.0, reasoning: "[why]" },
      { option: "Do not proceed", ethicalScore: 0.0-1.0, reasoning: "[why]" }
    ],
    recommendation: "[ethically recommended path]",
    dissent: "[reasonable opposing view]",
    nextThoughtNeeded: true
  }
```

Simulation and ethical analysis results are captured in JSONL stores at `~/.orca-cognition/sessions/`.

### Output Format

Same as Default Mode output, with additional entries in Weaknesses Found prefixed by **[Simulation]** or **[Ethics]** labels:

**[Simulation] "[What broke and at which step]"**
[Detail of the simulation failure scenario and its implications.]

**[Ethics] "[Stakeholder impacts]"**
[Ethical analysis findings and recommendation.]

The Verdict section incorporates simulation and ethics findings. Verdict becomes "Revised Verdict" if simulation changed the assessment.

---

## Execution Notes

1. **Accept-Store-Echo**: Cognition MCP stores your reasoning exactly as provided. Be thorough.
2. **Session Continuity**: All operations use the same sessionId for a complete audit trail.
3. **Quality Metrics**: Include confidence and bias_check for transparency.
4. **Persistence**: Sessions are saved to `~/.orca-cognition/` for later review.
5. **Be genuinely adversarial**: The goal is finding weaknesses, not confirmation.

---

## Persist Analysis (MANDATORY)

After completing the analysis, persist for future reference.

### Step 0: Harvest Checkpoint

```
mcp__cognition-mcp__cognition
  operation: "checkpoint"
  sessionId: "<sessionId>"
  projectPath: "<absolute project path>"
  content: {
    phase: "harvest",
    sessionFolder: "<absolute path to {$PWD}/.claude/cognition/YYYYMMDD-HHMM-slug/ -- project-local, NOT ~/.claude/>",
    summary: "<verdict and key risks>",
    keyFindings: ["<weakness 1>", "<weakness 2>"],
    openQuestions: ["<unresolved concern>"],
    nextSteps: ["<mitigation step>"],
    followUpQuestions: [
      {
        question: "<specific follow-up>",
        command: "/deepthink",
        rationale: "<why>"
      }
    ]
  }
```

The MCP auto-persist writes `99-harvest.md` to the session folder via `sessionFolder`. Raw telemetry (`99-raw.json`) is written to `~/.orca-cognition/sessions/{sessionId}/`.

### Step 1: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/challenge-local: [Proposal] - [Verdict]. Session: <sessionId>. File: .claude/cognition/<folder-name>/99-harvest.md" \
  -t challenge -t cognition
```

### Step 2: Confirm to User

Output:
```
---
Analysis persisted:
  Folder: .claude/cognition/YYYYMMDD-HHMM-slug/
  Harvest: 99-harvest.md (auto-persisted by MCP)
  Workshop: Tagged with challenge, cognition
  Recovery: /think-local --import <sessionId>
---
```

### Error Handling

If file write or Workshop command fails:
- Display warning: "Warning: Could not persist analysis. Analysis shown above is still valid."
- Continue normally - do NOT halt the command
