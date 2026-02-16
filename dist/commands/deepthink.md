---
description: Depth-first exploration with constraint chain and mandatory self-check
argument-hint: [--light|--rigorous] <problem or question to explore>
---

# /deepthink - Depth-First Exploration

**YOUR ROLE**: Execute depth-first exploration with route-based mode selection. This is for DIVERGENT thinking - exploring questions, generating hypotheses, finding what you don't know. For CONVERGENT decision-making, use `/problem-solve` instead.

**Question/Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink - Depth-First Exploration

Divergent exploration with constraint chain (default) and mandatory self-check.

USAGE:
  /deepthink <problem or question>
  /deepthink --light <problem>     (quick: 1 mode, no constraints)
  /deepthink --rigorous <problem>  (full pre-mortem after each mode + constraints)
  /deepthink --help

MODES (selected based on need):
  MAP          - Confused, need to see territory (systems, visual_reasoning)
  INVERT       - Have position, need weaknesses (pre-mortem)
  PERSPECTIVES - Stuck in one viewpoint (collaborative_reasoning, socratic_method)
  EDGES        - Need options, analogies (creative_thinking, analogical_reasoning)
  META         - Feeling too comfortable (substrate observation)
  DEEP         - One question needs focus (3-chain self-consistency)

CONSTRAINT CHAIN (default behavior):
  - After each mode: generate constraints (FORWARD, FORBIDDEN, QUESTION)
  - Before next mode: respond to all constraints (RESOLVED, ACKNOWLEDGED, DEFERRED)
  - Cannot finish until ALL constraints have responses (hard block)
  - DEFERRED constraints listed in final output

VALID OUTPUTS:
  - "I'm more confused now but in useful ways"
  - "These 5 questions are more important than the one I started with"
  - "I discovered constraints I didn't know existed"
  - "Here are 3 hypotheses worth testing"

EXAMPLES:
  /deepthink Why does user retention drop after day 3?
  /deepthink --light Quick question about caching strategy
  /deepthink --rigorous What are the deep implications of adopting microservices?

RELATED:
  /problem-solve  - Convergent 8-step decision pipeline (for decisions)
  /think          - Single cognitive operations
```

---

## Phase 0: Parse Arguments & Determine Intensity

**Parse $ARGUMENTS for intensity level**:

| Flag | Intensity | Constraints | Description |
|------|-----------|-------------|-------------|
| --light | Quick | NO | ORIENT + 1 mode + brief HARVEST (escape hatch) |
| (none) | Standard | YES | Full ORIENT + 2-3 modes + constraint chain + depth gates + HARVEST |
| --rigorous | Thorough | YES + pre-mortem | Extended ORIENT + constraint chain + full pre-mortem after each mode + META encouraged |

**Constraint Chain** (default and --rigorous only):
- After each mode: generate constraints that bind subsequent exploration
- Before proceeding: respond to all prior constraints
- Cannot finish until ALL constraints have responses

**Extract question/problem**: Everything after the flag (or entire $ARGUMENTS if no flag)

---

## Verbose Flag

Include `verbose: false` in every cognition MCP call from /deepthink. This command makes 3-8 calls per session; the minimal ACK response saves tokens. Claude already has the content in its output history.

## Phase 1: ENTER

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionTitle: "DeepThink: <problem summary>",
  sessionTags: ["deepthink", "exploration", "divergent"],
  content: {
    thought: "Entering exploration of: <problem>. Initial state: <what I know so far>. Uncertainty: <what I'm uncertain about>",
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true
  }
}
```

**Output**: Brief summary of the entry point. Note the sessionId for subsequent calls.

---

## Phase 2: ORIENT

Assess current state and determine what mode helps most.

### SCOPE Check (Before Mode Selection)

Before mapping the presumed cause, enumerate ALL components the SYMPTOM could touch.

**Questions:**
1. "What is the SYMPTOM (what the user observes failing)?"
2. "What components could POSSIBLY cause this symptom?"
   (Not what you think is likely - list ALL possibilities including destination components)
3. "If this action succeeds, where does control flow NEXT?"
   (The destination page/component - often missed but critical)

**CRITICAL**: Include the component you land on AFTER the action completes.
Example: Login redirect -> must include what /admin/orders/ page needs to render.

**Soft Verification** (Recommended):
Before proceeding, verify at least one claim empirically if possible (query run, file read).
If not verifiable, note this gap.

### Orient to Problem Space

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
      { failure: "<failure>", cause: "<root cause>", preventable: true }
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
    perspectives: [
      {
        role: "<specific perspective holder>",
        viewpoint: "<what they would argue>",
        arguments: ["<their key arguments>"]
      }
    ],
    commonGround: ["<where perspectives align>"],
    tensions: ["<genuine tensions between views>"],
    synthesis: "<what perspectives reveal I was missing>"
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
    analogs: [
      { domain: "<source domain>", description: "<what succeeded there>", similarity: 0.8 }
    ],
    mappings: [
      { targetElement: "<element in our problem>", analogElement: "<element in source domain>", relationship: "<how they map>" }
    ],
    insights: ["<principle that can be extracted and applied>"],
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

**Step 1:** Run thinking chain with analytical framing:

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Chain 1 (Framing: analytical): <deep thinking on the focused question>",
    framing: "analytical",
    chainNumber: 1,
    totalChains: 3,
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

Continue for 5 thoughts (incrementing thoughtNumber), then note conclusion.

**Step 2:** Run chain with intuitive/holistic framing:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Chain 2 (Framing: intuitive/holistic): <same question, different lens>",
    framing: "intuitive",
    chainNumber: 2,
    totalChains: 3,
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

Continue for 5 thoughts, then note conclusion.

**Step 3:** Run chain with adversarial/skeptical framing:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Chain 3 (Framing: adversarial/skeptical): <same question, challenge assumptions>",
    framing: "adversarial",
    chainNumber: 3,
    totalChains: 3,
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

Continue for 5 thoughts, then note conclusion.

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

## Attempt Tracking (Per Session)

Track fix attempts within the current session.
After 2 failed attempts, display warning before attempt #3:

---
**WARNING: You have attempted 2 fixes without success.**

Before attempting fix #3, STOP and complete:
1. **VERIFY** current hypothesis: Run query/command that PROVES it
2. **LIST** 2 alternative hypotheses for this symptom
3. **CHECK**: What does the destination page/component need?

If you cannot complete these steps, consider:
- The problem may be different from what you're investigating
- Expand scope to include components you've dismissed
---

---

## Phase 4.5: CONSTRAINT CHAIN (Default and --rigorous only)

**SKIP THIS PHASE if --light flag is set.**

After the 6-question self-check, generate constraints that bind subsequent exploration. These constraints create the forcing function for genuine depth.

### Step 1: Generate Constraints (End of Each Mode)

Based on self-check findings, identify what MUST happen next. Use global IDs: C1, C2, C3... across entire session.

**Constraint Types:**

| Type | Meaning | When to Use |
|------|---------|-------------|
| FORWARD | Must explore this next | Gap in understanding, causal chain to trace |
| FORBIDDEN | Cannot conclude this yet | Claim requires evidence not yet obtained |
| QUESTION | Unknown that remains open | Critical question surfaced during exploration |

**Output Constraint Table:**

```markdown
## Constraints Generated

| ID | Type | Constraint |
|----|------|------------|
| C1 | FORWARD | Must trace causal chain from X to Y |
| C2 | FORBIDDEN | Cannot conclude API is bottleneck without profiling |
| C3 | QUESTION | What happens under concurrent access? |
```

**Minimum Constraints:**
- Default mode: At least 2 constraints per mode
- Rigorous mode: At least 3 constraints per mode

### Step 2: Respond to Prior Constraints (Start of Each Mode After First)

Before executing the next mode, respond to ALL constraints from previous modes.

**Response Types:**

| Response | Meaning | When to Use |
|----------|---------|-------------|
| RESOLVED | Addressed this constraint | Constraint was explored/answered in this mode |
| ACKNOWLEDGED | Aware of this limitation | For FORBIDDEN - confirming awareness, avoiding the claim |
| DEFERRED | Explicitly punting | Cannot answer now, will surface in final output |

**Output Response Table:**

```markdown
## Constraints Addressed

| ID | Response | How Addressed |
|----|----------|---------------|
| C1 | RESOLVED | Traced chain in section above |
| C2 | ACKNOWLEDGED | Avoided bottleneck claims, focused on flow |
| C3 | DEFERRED | Requires testing, deferred to implementation |
```

### Step 3: --rigorous Mode Additional Step

**ONLY if --rigorous flag is set:** After generating constraints, run a full pre-mortem on the mode's output.

```typescript
mcp__cognition-mcp__cognition({
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "This mode's output: [summary of what was produced]",
    setup: "This analysis was wrong or missed something critical. What happened?",
    steps: [
      "<failure mode 1: how this output could mislead>",
      "<failure mode 2: what was overlooked>",
      "<failure mode 3: what assumption is hiding>"
    ],
    rootCauses: [
      { failure: "<failure>", cause: "<root cause>", preventable: true }
    ],
    conclusion: "<which failure modes require additional constraints>"
  }
})
```

**Pre-mortem findings generate additional constraints:**
- Each non-trivial failure mode becomes a FORWARD or QUESTION constraint
- Add to the constraint table with next available ID

---

## Phase 5: DEPTH GATE & ROUTING

Based on mode execution, self-check, and constraint status, determine next action.

### Constraint Blocking (Default and --rigorous only)

**HARD BLOCK if attempting to finish with unresolved constraints:**

Before proceeding to HARVEST, verify ALL constraints have responses:
1. Collect all constraint IDs generated (C1, C2, C3...)
2. Collect all constraint IDs addressed (from response tables)
3. If any ID is missing from responses: **BLOCK**

**Block Output:**
```
CONSTRAINT BLOCK: Cannot proceed to HARVEST.

Missing responses for: C2, C5, C7

You must address these constraints before finishing:
- C2: [constraint text]
- C5: [constraint text]
- C7: [constraint text]

Options:
1. Run another mode to RESOLVE these constraints
2. ACKNOWLEDGE limitations (for FORBIDDEN constraints)
3. Explicitly DEFER with justification
```

### Depth Gate

| Depth Gate Result | Action |
|------------------|--------|
| PASS (genuine insight) + constraints resolved | Route to next needed mode OR proceed to HARVEST |
| PASS but constraints unresolved | Route to next mode (cannot finish yet) |
| FAIL (shallow/predictable) | Go deeper in current mode or try different angle |

**Routing Logic:**
- If --light: After 1 mode, proceed to HARVEST (no constraint check)
- If standard: After 2-3 modes with passing depth gates AND all constraints addressed, proceed to HARVEST
- If --rigorous: Continue until genuine uncertainty/surprise achieved + all constraints addressed, META encouraged

---

## Phase 6: HARVEST

Gather what emerged from exploration.

**Before HARVEST (default and --rigorous only):** Verify all constraints are addressed. If any constraint lacks a response, you cannot proceed (see Phase 5 blocking).

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
      surprises: ["<what genuinely surprised me>"],
      deferredConstraints: ["<C3: What happens under concurrent access?>"]
    },
    honestAssessment: "<did this exploration produce genuine insight or just text?>"
  }
}
```

**DEFERRED Constraints (default and --rigorous only):**

Collect ALL constraints marked DEFERRED and include in harvest. These are explicitly punted items the user should know about.

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

#### Constraints Generated
| ID | Type | Constraint |
|----|------|------------|
| C1 | FORWARD | [Must explore X] |
| C2 | QUESTION | [What about Y?] |

### Mode: [MODE 2] (if applicable)

#### Constraints Addressed
| ID | Response | How Addressed |
|----|----------|---------------|
| C1 | RESOLVED | [Explored in section above] |
| C2 | DEFERRED | [Requires testing] |

[Key findings]
**Depth Check:** [Honest assessment]

#### Constraints Generated
| ID | Type | Constraint |
|----|------|------------|
| C3 | FORBIDDEN | [Cannot claim Z without evidence] |

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

### Deferred Constraints (items explicitly punted)
- C2: [What about Y?] - Requires testing
- [Any other DEFERRED constraints]

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
