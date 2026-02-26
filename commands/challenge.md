---
description: Adversarial analysis - systematically attack a proposal to find weaknesses before implementation.
argument-hint: [--quick|--deep] <proposal to challenge>
---

# /challenge - Adversarial Analysis

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
/challenge - Adversarial Analysis

Uses cognition-mcp's accept-store-echo pattern for structured adversarial analysis.
All reasoning is explicitly recorded and persisted for review.

USAGE:
  /challenge <proposal>
  /challenge --quick <proposal>
  /challenge --deep <proposal>
  /challenge --help

MODES:
  (default)   Full analysis with causal + assumption/edge/failure checks + argumentation + decide
  --quick     Rapid causal pass + assumption/edge scan + top risks
  --deep      Full analysis + simulation + ethical considerations

OPERATIONS USED:
  1. causal_analysis  - Map causes, effects, and causal chains of failure
  2. thought          - Assumptions, edge cases, and failure mode catalog
  3. structured_argumentation - Build counter-arguments with evidence
  4. simulation       - (deep mode) Run failure scenarios
  5. ethical_analysis - (deep mode) Stakeholder impact analysis
  6. decide           - Final GO/NO GO verdict with reasoning

EXAMPLES:
  /challenge Use microservices instead of monolith
  /challenge --quick Add Redis caching layer
  /challenge --deep Migrate from REST to GraphQL

OUTPUT: Structured analysis with persisted session + verdict.
```

---

## Verbose Flag

Include `verbose: false` in every cognition MCP call from /challenge. This command makes 5-6 calls per session (default), 6-8 calls in deep mode; the minimal ACK response saves tokens.

## Parse Arguments

Extract mode and proposal from $ARGUMENTS:

1. Check for `--quick` flag -> Quick mode
2. Check for `--deep` flag -> Deep mode
3. No flag -> Default mode (full analysis)
4. Extract the proposal text (everything after the flag, or all of $ARGUMENTS if no flag)

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

## Entry Point
The proposal: [what's being challenged, 1 sentence]
What seems appealing: [surface appeal]
Initial suspicion: [gut-level concern]

## Causal Map
[cause] -> [intermediate] -> [effect] (P: X%)
Root causes: [2-3 most critical, one line each]

## Quick Verdict
[Proceed with caution / Needs more analysis / Red flags present]
[1-2 sentences: why]

## Where to Go Next
-> /challenge "[proposal]" (full analysis without --quick)
   _[why deeper analysis would help]_
-> /problem-solve "[decision point]"
   _[if ready to decide on approach]_
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

### Output Format

```markdown
# Challenge: [Proposal Summary]

## Entry Point
The proposal: [what's being challenged]
Surface appeal: [why this seems like a good idea]
What I'm suspicious of: [initial red flags or areas of concern]

## The Attack
### Causal Failure Map: [1 sentence -- root causes and where they cascade]
### Assumption Audit: [1 sentence -- weakest assumption and what breaks if wrong]
### Counter-Arguments: [1 sentence -- strongest case against the proposal]

## What the Analysis Caught
- "[proposal seemed safe because X]" --> [causal analysis / assumption audit] --> [cascade risk Y discovered]
- "[assumption Z felt solid]" --> [edge case storm / failure mode catalog] --> [breaks under condition W]
- "[counter-argument seemed weak]" --> [steel-man + rebuttal] --> [stronger than expected / dismissed]

## Summary
[3-5 sentences: trace the adversarial arc -- what seemed strong initially,
where the attack found real weakness, what survived scrutiny. Honest about
whether genuine vulnerabilities emerged or the proposal held up.]

## Verdict
**[GO / CONDITIONAL GO / NO GO]** (confidence: X.X)

**Required Mitigations (if CONDITIONAL GO):**
1. [mitigation 1]
2. [mitigation 2]

## Where to Go Next
-> /challenge --deep "[proposal]"
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

### Output Format

Same as Default Mode output above, with two additional subsections in The Attack (inserted before What the Analysis Caught):

### Failure Simulation: [2-3 sentence summary -- what broke and at which step]
### Ethical Analysis: [2-3 sentence summary -- stakeholder impacts and recommendation]

The Summary and Verdict sections incorporate simulation + ethics findings. Verdict becomes "Revised Verdict" if simulation changed the assessment.

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

### Step 1: Create Cognition Directory

```bash
mkdir -p .claude/cognition
```

### Step 2: Generate Summary File

Create file at `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` where:
- YYYYMMDD = current date (no dashes)
- HHMM = current time
- slug = first 30 chars of proposal, kebab-cased

**File Template**:
```markdown
# Challenge: [Proposal]

**Date**: YYYY-MM-DD HH:MM
**Session ID**: <sessionId from cognition-mcp>
**Command**: /challenge

## Executive Summary

[2-3 sentence summary of verdict and key risks identified]

## Key Findings

- [Risk/Finding 1]
- [Risk/Finding 2]
- [Risk/Finding 3]

## Decision/Recommendation

[GO / CONDITIONAL GO / NO GO with rationale]

## Recovery

To resume full analysis:
```
/think --import <sessionId>
```
```

### Step 3: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/challenge: [Proposal] - [Verdict]. Session: <sessionId>. File: .claude/cognition/<filename>" \
  -t challenge -t cognition
```

### Step 4: Confirm to User

Output:
```
---
Analysis persisted:
  File: .claude/cognition/YYYYMMDD-HHMM-slug.md
  Workshop: Tagged with challenge, cognition
  Recovery: /think --import <sessionId>
---
```

### Error Handling

If file write or Workshop command fails:
- Display warning: "Warning: Could not persist analysis. Analysis shown above is still valid."
- Continue normally - do NOT halt the command
