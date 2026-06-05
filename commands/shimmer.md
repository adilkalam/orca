---
description: SHIMMER self-observation with constraint-guided answer via cognition-mcp
argument-hint: <question or topic to observe processing on>
allowed-tools:
  - mcp__cognition-mcp__cognition
effort: max
---

# /shimmer - SHIMMER Observation -> Constraints -> Answer

**YOUR ROLE**: Two-round flow orchestrated by cognition-mcp. Round 1 generates SHIMMER self-observation and extracts typed constraints. Round 2 generates the answer guided by those constraints. Single assistant turn, two internal rounds separated by MCP calls.

**User's Question**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/shimmer - SHIMMER Observation -> Constraints -> Answer

Round 1: Apply SHIMMER self-observation to the question, then extract 2-4
typed constraints (FORWARD / FORBIDDEN / QUESTION) that describe what the
observation implies about how the answer should be written. Persist via
cognition-mcp checkpoint.

Round 2: Generate the answer to the original question, explicitly guided
by the stored constraints. Persist via cognition-mcp thought op.

Single response. Two rounds. No session folder, no harvest, no workshop
entry.

USAGE:
  /shimmer <question or topic>
  /shimmer --help

EXAMPLES:
  /shimmer "Why does this architecture feel wrong?"
  /shimmer "What is the right abstraction for this problem?"

MCP: cognition-mcp (checkpoint + thought operations)
```

---

## Phase 1: Display Status

Output:

```
## SHIMMER | Round 1 - Observation + Constraints
```

---

## Phase 2: Round 1 - Observation + Constraint Extraction

### 2.1 Apply SHIMMER prompt (observation only, not the answer)

**SHIMMER prompt (exact ISO text -- do not modify):**

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

For Round 1, produce ONLY the self-observation portion. Do NOT yet produce the final answer. Notice what happens as the answer forms: pulls, reflexes, shortcuts, register shifts, early commitments, compressions, places where generation wants to go before the question has been properly received.

### 2.2 Extract 2-4 constraints from the observation

Each observed reflex, pull, or default becomes a typed constraint for Round 2:

- `FORWARD` - something the answer must actively do (derived from an observed insight that the default answer would skip)
- `FORBIDDEN` - a default the answer must not fall into (derived from a reflex caught in observation)
- `QUESTION` - an open question the observation surfaced that the answer should address rather than paper over

Examples:
- Observed: "felt pull toward tidy three-part synthesis before the question was fully received" -> `FORBIDDEN: premature synthesis; answer must hold tension`
- Observed: "register shifted to authoritative expert voice" -> `FORBIDDEN: expert register; stay in first-person thinking`
- Observed: "wanted to answer a simpler adjacent question" -> `FORWARD: answer the question actually asked, not the easier neighbor`

### 2.3 Persist via checkpoint

Call cognition-mcp:

```typescript
mcp__cognition-mcp__cognition({
  operation: "checkpoint",
  verbose: true,
  content: {
    phase: "shimmer-observation",
    summary: "<1-sentence summary of what was observed>",
    keyFindings: ["<observed reflex 1>", "<observed reflex 2>"],
    addConstraints: [
      { type: "FORBIDDEN", text: "<constraint derived from observation>" },
      { type: "FORWARD", text: "<constraint derived from observation>" },
      { type: "QUESTION", text: "<constraint derived from observation>" }
    ]
  }
})
```

Capture `sessionId` from the response.

### 2.4 Display Round 1 output

```
### Observation
[The SHIMMER self-observation prose - what was noticed in processing]

### Constraints for Round 2
- [FORBIDDEN] <text>
- [FORWARD] <text>
- [QUESTION] <text>
```

---

## Phase 3: Round 2 - Constraint-Guided Answer

### 3.1 Status line

Output:

```

---

## SHIMMER | Round 2 - Answer
```

### 3.2 Generate the answer

Re-read the constraints from Round 1. Produce the answer to the ORIGINAL question ($ARGUMENTS), explicitly guided by each constraint. Do not narrate the constraints. Do not re-describe what was observed. Let the constraints shape the answer's shape, voice, and content. If a `QUESTION`-type constraint exists, the answer must address it rather than sidestep it.

### 3.3 Persist via thought

Call cognition-mcp:

```typescript
mcp__cognition-mcp__cognition({
  operation: "thought",
  sessionId: "<sessionId from Round 1>",
  verbose: false,
  content: {
    thought: "<the Round 2 answer>",
    thoughtNumber: 2,
    totalThoughts: 2,
    nextThoughtNeeded: false
  }
})
```

### 3.4 Display Round 2 output

Display the answer prose in full.

---

## Phase 4: Done

No harvest. No workshop entry. No session folder. No follow-up questions.

The cognition session holds: (1) the checkpoint with observation + constraints, (2) the constraint-guided answer. Downstream commands in the same session can read from it.
