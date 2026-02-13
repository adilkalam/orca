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
## Quick Adversarial Analysis: [Proposal Summary]

**Session:** [sessionId from response]

### Pre-mortem Causal Analysis
> "This failed. Here's the causal map of why:"

**Root Causes:**
- [cause 1] (strength: H/M/L) - [evidence]
- [cause 2] (strength: H/M/L) - [evidence]

**Cascade Effects:**
- [effect 1] - Likelihood: [H/M/L], Timeframe: [when]
- [effect 2] - Likelihood: [H/M/L], Timeframe: [when]

**Critical Causal Chain:**
[cause] -> [intermediate] -> [effect] (probability: X%)

**Quick Mitigations:**
1. [intervention 1]
2. [intervention 2]

**Assumptions to Validate First:**
1. [assumption] (confidence: H/M/L) -> If wrong: [impact]
2. [assumption] (confidence: H/M/L) -> If wrong: [impact]
3. [assumption] (confidence: H/M/L) -> If wrong: [impact]

**Top Edge Triggers:**
- [edge case 1]
- [edge case 2]
- [edge case 3]

**Quick Verdict:** [Proceed with caution / Needs more analysis / Red flags present]

*Analysis persisted to session. Run `/challenge --deep` for full analysis.*
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
## Adversarial Analysis: [Proposal Summary]

**Session:** [sessionId] | **Entries:** [totalEntries] | **Duration:** [sessionDuration]ms

---

### Phase 1: Causal Failure Analysis

**Phenomenon:** Failure of [proposal]

**Root Causes:**
| Factor | Type | Strength | Evidence |
|--------|------|----------|----------|
| [factor] | [root/contributing/trigger] | [H/M/L] | [evidence] |

**Cascade Effects:**
| Outcome | Likelihood | Timeframe |
|---------|------------|-----------|
| [outcome] | [H/M/L] | [timeframe] |

**Critical Causal Chains:**
1. [cause] -> [intermediate] -> [effect] (P: X%)
2. [cause] -> [intermediate] -> [effect] (P: X%)

**Interventions Identified:**
- [intervention 1]
- [intervention 2]
- [intervention 3]

---

### Phase 1.5: Assumptions, Edge Cases, and Failure Modes

**Assumptions (confidence + impact):**
| Assumption | Confidence | If Wrong |
|------------|------------|----------|
| [assumption] | [H/M/L] | [impact] |

**Edge Cases (minimum 10):**
- [edge case 1]
- [edge case 2]
- [edge case 3]
- [edge case 4]
- [edge case 5]
- [edge case 6]
- [edge case 7]
- [edge case 8]
- [edge case 9]
- [edge case 10]

**Failure Mode Catalog:**
| Component | How It Fails | Blast Radius | Detection |
|-----------|--------------|--------------|-----------|
| [component] | [failure mode] | [contained/cascading] | [signal] |

---

### Phase 2: Structured Counter-Arguments

**Claim:** This proposal should NOT be implemented because...

**Premises:**
1. [premise 1]
2. [premise 2]
3. [premise 3]

**Evidence:**
| Point | Source | Strength |
|-------|--------|----------|
| [point] | [source] | [strong/moderate/weak] |

**Steel-Man & Rebuttal:**
> "A proponent would argue: [argument for]"
> *Rebuttal:* [why that argument is flawed]

**Argumentation Conclusion:**
[synthesis]

---

### Phase 3: Final Decision

**Statement:** Should we proceed with [proposal]?

**Options Evaluated:**
| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| GO | Proceed | [pros] | [cons] |
| CONDITIONAL GO | Proceed with mitigations | [pros] | [cons] |
| NO GO | Do not proceed | [pros] | [cons] |

**Decision Criteria:**
1. [criterion 1]
2. [criterion 2]
3. [criterion 3]

**Analysis:**
[detailed analysis]

---

### Verdict

**Decision:** [GO / CONDITIONAL GO / NO GO]
**Confidence:** [X.X] (0-1 scale)
**Bias Check:** [identified biases]

**Required Mitigations (if CONDITIONAL GO):**
1. [mitigation 1]
2. [mitigation 2]

**Session Export:** Run `workshop export cognition [sessionId]` to retrieve full analysis
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

Same as Default Mode, plus:

```markdown
---

### Phase 2.5: Failure Simulation

**Scenario:** [proposal] implementation failure

**Initial Conditions:**
- [var 1]: [value]
- [var 2]: [value]

**Simulation Steps:**
| Step | Action | Outcome |
|------|--------|---------|
| 1 | [action] | [outcome] |
| 2 | [action] | [outcome] |
| 3 | [action] | [outcome] |
| 4 | [FAILURE POINT] | [catastrophic outcome] |

**Final State:** [description]

**Insights:**
- [insight 1]
- [insight 2]

**Alternative Outcomes:**
- If [X]: [alternative result]
- If [Y]: [alternative result]

---

### Phase 2.75: Ethical Analysis

**Situation:** Implementation of [proposal]

**Stakeholder Impact:**
| Group | Interests | Impact |
|-------|-----------|--------|
| [group] | [interests] | [impact] |

**Ethical Principles Applied:**
| Principle | Application | Weight |
|-----------|-------------|--------|
| [principle] | [application] | [0-1] |

**Ethical Scoring:**
| Option | Score | Reasoning |
|--------|-------|-----------|
| Proceed as-is | [0-1] | [reasoning] |
| Proceed with safeguards | [0-1] | [reasoning] |
| Do not proceed | [0-1] | [reasoning] |

**Ethical Recommendation:** [recommendation]
**Dissenting View:** [dissent]

---

### Revised Verdict (incorporating simulation + ethics)

[Updated verdict if needed]
```

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
