---
description: Depth-first exploration with constraint chain and mandatory self-check
argument-hint: [--light|--rigorous] <problem or question to explore>
---

# /deepthink - Depth-First Exploration

**YOUR ROLE**: Execute depth-first exploration with route-based mode selection. DIVERGENT thinking -- exploring questions, generating hypotheses, finding what you don't know. For CONVERGENT decision-making, use `/problem-solve`.

**Question/Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink - Depth-First Exploration

USAGE:
  /deepthink <problem or question>
  /deepthink --light <problem>     (1 mode, no constraints)
  /deepthink --rigorous <problem>  (pre-mortem after each mode + constraints)
  /deepthink --help

MODES: MAP, INVERT, PERSPECTIVES, EDGES, META, DEEP
CONSTRAINT CHAIN: After each mode, MCP tracks constraints (FORWARD/FORBIDDEN/QUESTION)

RELATED: /problem-solve (convergent), /think (single operations)
```

---

## Phase 0: Parse Intensity

| Flag | Constraints | Description |
|------|-------------|-------------|
| --light | NO | ORIENT + 1 mode + brief HARVEST |
| (none) | YES | ORIENT + 2-3 modes + constraint chain + HARVEST |
| --rigorous | YES + pre-mortem | Extended + pre-mortem after each mode |

Include `verbose: false` in every cognition MCP call.

## Phase 1: ENTER

Call cognition with `operation: "thought"`, `sessionTitle: "DeepThink: <summary>"`, `sessionTags: ["deepthink", "exploration"]`. Register the command:

```typescript
// After ENTER, register command with checkpoint
{ operation: "checkpoint", sessionId: "<id>", content: { command: "deepthink", phase: "enter" } }
```

## Phase 2: ORIENT

### SCOPE Check
1. What is the SYMPTOM?
2. What components could POSSIBLY cause it? (ALL, not just likely)
3. Where does control flow NEXT after success? (destination component)

### Orient to Problem Space
Call cognition `operation: "thought"` with: currentState (whatIKnow, whatImUncertainAbout, whatImAvoiding), modeSelection (recommended mode + reason).

**Mode Selection Guide:**

| Mode | When | Operations |
|------|------|------------|
| MAP | Confused, need territory | systems, causal_analysis |
| INVERT | Have position, need weaknesses | mental_model (pre-mortem), thought (reflexion) |
| PERSPECTIVES | Stuck in one viewpoint | collaborative_reasoning, thought (steelman) |
| EDGES | Need options, analogies | creative_thinking, analogical_reasoning |
| META | Too comfortable, might be avoiding | meta (substrate observation) |
| DEEP | One question needs focus | 3 thought chains (analytical, intuitive, adversarial) |

---

## Phase 3: MODE EXECUTION

Execute the selected mode. Each mode uses 1-2 cognition operations.

**MAP**: systems map (components, relationships, feedbackLoops, blindSpots) then causal_analysis on leverage points (causes, effects, chains). Depth gate: non-obvious insights?

**INVERT**: mental_model pre-mortem (setup: "This failed. What happened?", steps: failure modes, rootCauses). Then thought reflexion on top 2 failure modes (verificationCriteria, earlyWarnings). Depth gate: actionable criteria?

**PERSPECTIVES**: collaborative_reasoning (perspectives with role/viewpoint/arguments, tensions, synthesis). Then steelman each via thought (strongestArgument, evidenceForMindChange, costOfIgnoring). Depth gate: genuine merit found?

**EDGES**: creative_thinking (techniques, ideas with source/potential/challenges, surprises). Then analogical_reasoning on best 2 (analogs, mappings, insights, limitations). Depth gate: transferable principles?

**META**: meta operation (observations, deflections, actualBehavior, insights). Depth gate: caught real behavior?

**DEEP**: 3 thought chains (analytical, intuitive, adversarial), 5 thoughts each. Then convergence check thought (chain conclusions, convergent T/F, sharedInsights, divergentAreas). Depth gate: framings revealed blind spots?

**Field hints for operations without full examples above:**

| Operation | Key fields |
|-----------|-----------|
| systems | system, components[{name, function}], relationships[{from, to, type}], feedbackLoops |
| causal_analysis | phenomenon, causes[{factor, type, strength}], effects[{outcome, likelihood, timeframe}], chains |
| mental_model | modelName, problem, setup, steps, rootCauses[{failure, cause, preventable}], conclusion |
| collaborative_reasoning | topic, perspectives[{role, viewpoint, arguments}], tensions, synthesis |
| creative_thinking | challenge, techniques, ideas[{idea, potential, challenges}] |
| analogical_reasoning | target, analogs[{domain, description, similarity}], mappings, insights, limitations |

---

## Phase 4: SELF-CHECK + CONSTRAINT CHECKPOINT (After Each Mode)

### Self-Check (6 questions, mandatory)

**Internal**: (1) Shallow/predictable? (2) What am I avoiding? (3) Why not the uncomfortable option?
**External**: (4) What would I critique if someone else wrote this? (5) What would a skeptical expert challenge? (6) Any verifiable claims?

### Constraint Checkpoint (skip if --light)

After self-check, call checkpoint with protocol state fields. MCP tracks constraints and evaluates gates.

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
    // Self-check result
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
- `gateStatus: "HARD_FAIL"` -> self-check or depth gate failed, go deeper
- `blocked: true` -> cannot harvest until constraints addressed

Minimum constraints: 2 per mode (standard), 3 per mode (rigorous).

### --rigorous: Additional pre-mortem on mode output

Run mental_model pre-mortem on the mode's output. Each non-trivial failure mode becomes a new constraint via addConstraints in next checkpoint.

---

## Phase 5: ROUTING

- **--light**: After 1 mode, proceed to HARVEST (no constraint check)
- **Standard**: After 2-3 modes with PASS gates AND protocolState.blocked === false
- **--rigorous**: Continue until genuine surprise + all constraints addressed

---

## Phase 6: HARVEST

Call checkpoint with `phase: "harvest"`. MCP auto-persists a summary file to `.claude/cognition/`.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    summary: "<2-3 sentence executive summary>",
    keyFindings: ["<key finding 1>", "<key finding 2>"],
    openQuestions: ["<remaining question>"],
    nextSteps: ["<what to explore next>"]
  }
}
```

**Response includes**: `autoPersist: { persisted: true, file: "<path>" }` and `protocolState` with deferred constraints.

### Workshop Entry (after harvest)

```bash
workshop --workspace .claude/memory note \
  "/deepthink: [Topic] - [Key discovery]. Session: <sessionId>. File: <autoPersist.file>" \
  -t deepthink -t cognition
```

If workshop fails, display warning and continue.

---

## Final Output Format

```
# DeepThink Exploration: [Problem Summary]

## Entry Point
[What I knew and didn't know]

## Exploration Journey
### Mode: [MODE 1]
[Key findings]
**Depth Check:** [Assessment]

### Mode: [MODE 2] (if applicable)
[Key findings]

## Harvest
- Questions Discovered: ...
- Hypotheses Worth Testing: ...
- Constraints Found: ...
- Assumptions Exposed: ...
- Surprises: ...
- Deferred Constraints: [from protocolState]

## Honest Assessment
[Genuine insight or just text?]

## Next Steps
→ /problem-solve "[hypothesis]"  (if hypotheses found)
→ /deepthink "[question]"        (if deeper questions found)
→ /think --systems "[system]"    (if systems exposed)
```

---

## Key Differences from /problem-solve

| /deepthink | /problem-solve |
|------------|----------------|
| Divergent - explore, question | Convergent - decide, commit |
| Valid: "more confused in useful ways" | Valid: clear decision + safeguards |
| Route based on need | Fixed 8-step sequence |

---

_See also: `problem-solve.md`, `think.md`, `guide-think-complex.md`_
