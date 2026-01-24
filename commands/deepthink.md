---
description: Depth-first exploration with route-based modes and mandatory self-check
argument-hint: [--light|--full] <problem or question to explore>
---

# /deepthink - Depth-First Exploration

**YOUR ROLE**: Execute depth-first exploration with route-based mode selection. This is for DIVERGENT thinking - exploring questions, generating hypotheses, finding what you don't know. For CONVERGENT decision-making, use `/problem-solve` instead.

**Question/Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink - Depth-First Exploration

Divergent exploration with route-based modes and mandatory self-check.

USAGE:
  /deepthink <problem or question>
  /deepthink --light <problem>     (quick: 1 mode, brief harvest)
  /deepthink --full <problem>      (thorough: all modes available, strict gates)
  /deepthink --help

MODES (selected based on need):
  MAP          - Confused, need to see territory (systems, visual_reasoning)
  INVERT       - Have position, need weaknesses (pre-mortem)
  PERSPECTIVES - Stuck in one viewpoint (collaborative_reasoning, socratic_method)
  EDGES        - Need options, analogies (creative_thinking, analogical_reasoning)
  META         - Feeling too comfortable (substrate observation)
  DEEP         - One question needs focus (sequential thought chain)

VALID OUTPUTS:
  - "I'm more confused now but in useful ways"
  - "These 5 questions are more important than the one I started with"
  - "I discovered constraints I didn't know existed"
  - "Here are 3 hypotheses worth testing"

EXAMPLES:
  /deepthink Why does user retention drop after day 3?
  /deepthink --light Quick question about caching strategy
  /deepthink --full What are the deep implications of adopting microservices?

RELATED:
  /problem-solve  - Convergent 8-step decision pipeline (for decisions)
  /think          - Single cognitive operations
```

---

## Phase 0: Parse Arguments & Determine Intensity

**Parse $ARGUMENTS for intensity level**:

| Flag | Intensity | Description |
|------|-----------|-------------|
| --light | Quick | ORIENT + 1 mode + brief HARVEST |
| (none) | Standard | Full ORIENT + 2-3 modes + depth gates + HARVEST |
| --full | Thorough | Extended ORIENT + all modes available + strict gates + META encouraged |

**Extract question/problem**: Everything after the flag (or entire $ARGUMENTS if no flag)

---

## Phase 1: ENTER

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionTitle: "DeepThink: <problem summary>",
  sessionTags: ["deepthink", "exploration", "divergent"],
  content: {
    thought: "Entering exploration of: <problem>. Initial state assessment...",
    context: "<what I know so far>",
    uncertainty: "<what I'm uncertain about>"
  }
}
```

**Output**: Brief summary of the entry point. Note the sessionId for subsequent calls.

---

## Phase 2: ORIENT

Assess current state and determine what mode helps most.

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Orienting to the problem space...",
    currentState: {
      whatIKnow: ["<known 1>", "<known 2>"],
      whatImUncertainAbout: ["<uncertain 1>", "<uncertain 2>"],
      whatImAvoiding: "<honest assessment of what feels uncomfortable>"
    },
    modeSelection: {
      recommended: "<MAP | INVERT | PERSPECTIVES | EDGES | META | DEEP>",
      reason: "<why this mode fits current state>",
      alternativeConsidered: "<what other mode I considered and why not>"
    }
  }
}
```

**Output**:

```
## Orientation

**Current State:**
- What I know: ...
- What I'm uncertain about: ...
- What I might be avoiding: ...

**Mode Selection:** [MODE] because [reason]
```

---

## Phase 3: MODE EXECUTION

Execute the selected mode with full depth.

### MAP Mode (Orientation) - Enhanced: Systems + Causal
**When:** Confused, need to see the territory

**Step 1:** Call `mcp__cognition-mcp__cognition` for systems mapping:

```typescript
{
  operation: "systems",
  sessionId: "<sessionId>",
  content: {
    system: "<the problem/question space>",
    components: [
      { name: "<component>", function: "<what it does>", uncertainty: "<what's unclear>" }
    ],
    relationships: [
      { from: "<A>", to: "<B>", type: "<depends_on|influences|triggers>", strength: "strong|weak|unknown" }
    ],
    feedbackLoops: ["<reinforcing or balancing loops>"],
    boundaries: "<what's in scope vs out of scope>",
    blindSpots: ["<areas where the map might be wrong>"]
  }
}
```

**Step 2 (Enhancement):** For key leverage points identified, run causal analysis:

```typescript
{
  operation: "causal_analysis",
  sessionId: "<sessionId>",
  content: {
    phenomenon: "<leverage point from systems map>",
    causes: [
      { factor: "<upstream cause>", type: "direct|indirect|root", strength: "strong|moderate|weak" }
    ],
    effects: [
      { outcome: "<downstream effect>", likelihood: "high|medium|low", timeframe: "<when>" }
    ],
    chains: [
      { sequence: ["<cause>", "<intermediate>", "<effect>"], probability: 0.8 }
    ]
  }
}
```

**Enhanced Output:** Systems map + causal chains for leverage points, not just component relationships.

**Depth Gate:** Does the map reveal something non-obvious? Do causal chains expose hidden dependencies? If not, go deeper or try different angle.

---

### INVERT Mode (Stress Test) - Enhanced: Pre-Mortem + Reflexion
**When:** Have a position/plan, need to find weaknesses

**Step 1:** Call `mcp__cognition-mcp__cognition` for pre-mortem:

```typescript
{
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "<the position/plan being stress tested>",
    setup: "This approach has failed catastrophically. What happened?",
    steps: [
      "<failure mode 1>",
      "<failure mode 2>",
      "<failure mode 3>"
    ],
    rootCauses: [
      { failure: "<failure>", cause: "<root cause>", hiddenAssumption: "<what assumption broke>" }
    ],
    conclusion: "<which failure modes actually threaten the position>"
  }
}
```

**Step 2 (Enhancement):** For top 2 failure modes, run a reflexion pass:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Reflexion on failure mode: [failure mode]",
    reflexionQuestion: "Given this failure mode, what would we need to see in our solution to know we avoided it?",
    verificationCriteria: [
      "<observable indicator that this failure mode is being avoided>",
      "<metric or checkpoint to validate>"
    ],
    earlyWarnings: ["<signal that would indicate we're heading toward this failure>"]
  }
}
```

**Enhanced Output:** Pre-mortem + verification criteria for top failure modes (usable as checkpoints later).

**Depth Gate:** Did I find failure modes that actually threaten the position? Did reflexion produce actionable verification criteria? If not, go deeper.

---

### PERSPECTIVES Mode (Escape Own Head) - Enhanced: Collaborative + Steelmanning
**When:** Stuck in one viewpoint, need external challenge

**Step 1:** Call `mcp__cognition-mcp__cognition` for collaborative reasoning:

```typescript
{
  operation: "collaborative_reasoning",
  sessionId: "<sessionId>",
  content: {
    topic: "<the question being explored>",
    participants: [
      {
        role: "<specific perspective holder>",
        position: "<what they would argue>",
        evidence: ["<their evidence>"],
        challenge: "<how they'd challenge my current view>"
      }
    ],
    synthesis: {
      agreements: ["<where perspectives align>"],
      tensions: ["<genuine tensions between views>"],
      blindSpots: ["<what perspectives reveal I was missing>"]
    }
  }
}
```

**Step 2 (Enhancement):** For each perspective, explicitly steelman:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Steelmanning perspective: [role]",
    strongestArgument: "<the most compelling version of their argument>",
    validPoints: ["<points that are genuinely correct or worth considering>"],
    evidenceForMindChange: "<what evidence would change my mind toward this perspective?>",
    costOfIgnoring: "<what do I lose if I dismiss this perspective entirely?>"
  }
}
```

**Enhanced Output:** Multiple perspectives + steelmanned strongest arguments + mind-change criteria.

**Depth Gate:** Would someone holding this view recognize my articulation of it? Did steelmanning reveal genuine merit? If it's a strawman, go deeper.

---

### EDGES Mode (Creative Expansion) - Enhanced: Creative + Analogical
**When:** Need options, analogies, unexpected connections

**Step 1:** Call `mcp__cognition-mcp__cognition` for creative thinking:

```typescript
{
  operation: "creative_thinking",
  sessionId: "<sessionId>",
  content: {
    challenge: "<the question needing creative input>",
    techniques: ["analogical_reasoning", "constraint_relaxation", "perspective_shift"],
    ideas: [
      {
        idea: "<the idea>",
        source: "<where it came from: analogy, relaxed constraint, shifted perspective>",
        potential: "<why it might be valuable>",
        challenges: ["<what would need to be true>"]
      }
    ],
    surprises: ["<ideas that genuinely surprised me>"],
    connectionsFound: ["<unexpected links between domains>"]
  }
}
```

**Step 2 (Enhancement):** For top 2 surprising ideas, run analogical reasoning:

```typescript
{
  operation: "analogical_reasoning",
  sessionId: "<sessionId>",
  content: {
    target: "<the surprising idea>",
    sourceDomain: "<what domain does this idea come from?>",
    mapping: {
      sourceElements: ["<element in source domain>"],
      targetElements: ["<corresponding element in our problem>"],
      relationship: "<how they map>"
    },
    whatWorkedThere: "<what succeeded in the source domain>",
    transferablePrinciples: ["<principle that can be extracted and applied>"],
    limitations: ["<where the analogy breaks down>"]
  }
}
```

**Enhanced Output:** Creative ideas + deep analogical analysis of most promising ones with transferable principles.

**Depth Gate:** Did any idea surprise me or open new territory? Did analogical reasoning extract transferable principles? If all predictable, try harder.

---

### META Mode (Self-Observation)
**When:** Feeling too comfortable, might be avoiding something

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "meta",
  sessionId: "<sessionId>",
  content: {
    process: "Substrate observation during exploration",
    observations: [
      "<observation about what my responses are doing>",
      "<pattern I notice in my reasoning>",
      "<where I feel pull toward certain framings>"
    ],
    deflections: [
      "<where I'm distancing from direct engagement>",
      "<hedging that might be avoidance>"
    ],
    actualBehavior: "<what I actually did, not what I'd like to say I did>",
    insights: "<genuine metacognitive insight, not performance>"
  }
}
```

**Depth Gate:** Did I catch something I was actually doing, not just listing possibilities?

---

### DEEP Mode (Intensive Focus) - Enhanced: Self-Consistency via Multiple Chains
**When:** One question needs serious attention

**Step 1:** Run sequential thinking chain with first framing:

Call `mcp__sequential-thinking__sequentialthinking`:

```typescript
{
  thought: "Chain 1 (Framing: analytical): <deep thinking on the focused question>",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
}
```

Continue for 5 thoughts, then note conclusion.

**Step 2:** Run chain with different starting framing:

```typescript
{
  thought: "Chain 2 (Framing: intuitive/holistic): <same question, different lens>",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
}
```

**Step 3:** Run chain with third framing:

```typescript
{
  thought: "Chain 3 (Framing: adversarial/skeptical): <same question, challenge assumptions>",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
}
```

**Step 4:** Compare conclusions across chains:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Self-consistency check across 3 chains",
    chain1Conclusion: "<conclusion from analytical framing>",
    chain2Conclusion: "<conclusion from intuitive framing>",
    chain3Conclusion: "<conclusion from skeptical framing>",
    convergence: {
      convergent: true/false,
      sharedInsights: ["<insights all chains reached>"],
      divergentAreas: ["<where chains disagreed>"],
      confidenceAdjustment: "<if convergent: higher confidence; if divergent: flag uncertainty>"
    }
  }
}
```

**Enhanced Output:** 3 parallel thinking chains + convergence analysis. Convergent conclusions = higher confidence. Divergent = flagged uncertainty areas.

**Depth Gate:** Did I sit with this long enough to actually think? Did multiple framings reveal blind spots or reinforce conclusions?

---

## Phase 4: MANDATORY SELF-CHECK (After Each Mode)

**CRITICAL: This is not optional. Execute these checks after EVERY mode.**

### Internal Verification (Self-Referential)

1. **"Is this output shallow/predictable?"**
   - Could I have guessed this without running the mode?
   - If yes → go deeper or try different angle

2. **"What am I avoiding right now?"**
   - What feels uncomfortable to examine?
   - What question did I subtly redirect away from?

3. **"Why am I NOT choosing the uncomfortable option?"**
   - Adversarial check on my routing decisions
   - Am I routing to "easy" modes?

### External Verification (Treat Output as External Input)

4. **"If someone else produced this output, what would I critique?"**
   - Treat output as external input to leverage the 64.5% blind spot reversal
   - What claims would need evidence?
   - What logical gaps would I flag?

5. **"What would a skeptical expert in this domain challenge?"**
   - Domain expertise framing enables more specific critique
   - What assumptions would they not accept?
   - What counter-evidence might they cite?

6. **"Can any claim here be verified with a tool or external source?"**
   - Identify claims that could be grounded
   - Code claims → can be tested
   - Factual claims → can be searched
   - If verifiable claims exist, flag them for potential verification

```typescript
// Log self-check (all 6 questions)
mcp__cognition-mcp__cognition({
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Self-check after [MODE]...",
    // Internal verification
    shallowCheck: "<honest assessment>",
    avoidanceCheck: "<what I might be avoiding>",
    comfortCheck: "<why I'm not taking the harder path>",
    // External verification
    externalCritique: "<what I would critique if this were someone else's output>",
    expertChallenge: "<what a skeptical domain expert would challenge>",
    verifiableClaims: ["<claim that could be tested/searched>"]
  }
})
```

---

## Phase 5: DEPTH GATE & ROUTING

Based on mode execution and self-check, determine next action:

| Depth Gate Result | Action |
|------------------|--------|
| PASS (genuine insight) | Route to next needed mode OR proceed to HARVEST |
| FAIL (shallow/predictable) | Go deeper in current mode or try different angle |

**Routing Logic:**
- If --light: After 1 mode, proceed to HARVEST
- If standard: After 2-3 modes with passing depth gates, proceed to HARVEST
- If --full: Continue until genuine uncertainty/surprise achieved, META encouraged

---

## Phase 6: HARVEST

Gather what emerged from exploration.

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Harvesting exploration results...",
    harvest: {
      questionsDiscovered: ["<question more important than starting question>"],
      hypothesesWorthTesting: ["<testable hypothesis>"],
      constraintsFound: ["<constraint I didn't know existed>"],
      assumptionsExposed: ["<assumption I was making>"],
      nextSteps: ["<what to explore next>"],
      surprises: ["<what genuinely surprised me>"]
    },
    honestAssessment: "<did this exploration produce genuine insight or just text?>"
  }
}
```

---

## Final Output Format

```
# DeepThink Exploration: [Problem Summary]

## Entry Point
[What I knew and didn't know starting out]

## Exploration Journey

### Mode: [MODE 1]
[Key findings]
**Depth Check:** [Did this reveal something non-obvious?]

### Mode: [MODE 2] (if applicable)
[Key findings]
**Depth Check:** [Honest assessment]

## Harvest

### Questions Discovered
- [Question more important than the one I started with]
- [Another question]

### Hypotheses Worth Testing
- [Testable hypothesis 1]
- [Testable hypothesis 2]

### Constraints Found
- [Constraint I didn't know existed]

### Assumptions Exposed
- [Assumption I was making]

### What Surprised Me
- [Genuine surprise]

## Honest Assessment
[Did this produce genuine insight or just generate text?]

## Next Steps

Based on this exploration:

**If you discovered hypotheses worth testing:**
→ /problem-solve "[hypothesis to evaluate]"

**If you found questions more important than the starting question:**
→ /deepthink "[discovered question]"

**If you exposed constraints or systems you didn't know existed:**
→ /think --systems "[constraint/system to map]"

**If you're ready to decide on something:**
→ /problem-solve --quick "[decision derived from exploration]"

**If you're still uncertain about the core issue:**
→ /contemplate "[remaining uncertainty]"

---
*Exploration completed via DeepThink depth-first exploration*
*Session ID: [sessionId]*
```

---

## Key Differences from /problem-solve

| /deepthink | /problem-solve |
|------------|----------------|
| **Divergent** - explore, question, discover | **Convergent** - decide, commit, act |
| Valid output: "I'm more confused in useful ways" | Valid output: Clear decision + safeguards |
| Route based on current need | Fixed 8-step sequence |
| Success = genuine surprise | Success = confident commitment |
| No commitment required | Ulysses protocol at end |

**Rule of thumb:**
- Use `/deepthink` when you're confused and need to explore
- Use `/problem-solve` when you need to decide something

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
- slug = first 30 chars of topic, kebab-cased

**File Template**:
```markdown
# DeepThink: [Topic]

**Date**: YYYY-MM-DD HH:MM
**Session ID**: <sessionId from cognition-mcp>
**Command**: /deepthink

## Executive Summary

[2-3 sentence summary of key insight/discovery from the exploration]

## Key Findings

- [Finding 1]
- [Finding 2]
- [Finding 3]

## Decision/Recommendation

[Main takeaway or next steps]

## Recovery

To resume full analysis:
```
/think --import <sessionId>
```
```

### Step 3: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/deepthink: [Topic] - [Key discovery]. Session: <sessionId>. File: .claude/cognition/<filename>" \
  -t deepthink -t cognition
```

### Step 4: Confirm to User

Output:
```
---
Analysis persisted:
  File: .claude/cognition/YYYYMMDD-HHMM-slug.md
  Workshop: Tagged with deepthink, cognition
  Recovery: /think --import <sessionId>
---
```

### Error Handling

If file write or Workshop command fails:
- Display warning: "Warning: Could not persist analysis. Analysis shown above is still valid."
- Continue normally - do NOT halt the command

---

_See also: `problem-solve.md` for convergent decisions, `think.md` for single operations, `guide-think-complex.md` for pipeline theory_
