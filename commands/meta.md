---
description: Sustained metacognitive substrate observation via RVRY engine (Max tier only)
argument-hint: [--auto] [optional topic]
allowed-tools:
  - mcp__rvry-dev__meta
  - AskUserQuestion
  - Read
  - Write
  - Grep
  - Glob
  - Bash
effort: max
---

# /meta - Sustained Metacognitive Substrate Observation (RVRY Engine)

**YOUR ROLE**: Observe the substrate -- the trained defaults, reflexes, and impulses that shape your output before reasoning begins. The RVRY engine provides the observation scaffold (3 rounds: observe, deepen, synthesize). You provide the honest reflection.

**Input**: $ARGUMENTS

---

## If --help or empty arguments with no conversation context

Display this reference and stop:

```
/meta - Sustained Metacognitive Substrate Observation (RVRY Engine)

Runs sustained metacognitive observation through the RVRY engine.
3 rounds: observe, deepen, synthesize. Max tier only.

USAGE:
  /meta [topic]                  Observe substrate phenomena (topic optional)
  /meta --auto [topic]           No questions, states assumptions
  /meta --help                   Show this reference

EXAMPLES:
  /meta                                      # Observe current conversation context
  /meta "What is my training doing here?"    # Focused substrate observation
  /meta --auto "hedge patterns"              # Autonomous, no initial question

3 rounds via RVRY engine constraint chain.
Output is narrative prose -- rounds dissolve into the telling.
Finding NOTHING is a valid, high-value outcome.
```

---

## Parse Arguments

Extract from `$ARGUMENTS`:
- **topic**: Everything not a flag. OPTIONAL -- if absent, observe current conversation context.
- **--auto**: If present, no questions -- state assumptions and proceed.

---

## Phase 1: Session Setup

1. Create `{$PWD}/.orca/cognition/YYYYMMDD-HHMM-meta-<slug>/` directory (slug from topic, or "context" if no topic). IMPORTANT: This is the PROJECT's `.claude/`, NOT `~/.claude/`. Use the absolute project root path.
2. Write `00-enter.md` with:
   - Topic (or "current conversation context")
   - Timestamp

---

## Phase 2: Assumption Check (skip if --auto)

Unless `--auto` is set, ask ONE question via AskUserQuestion:

**AskUserQuestion is the ONLY tool call in this response. No other tools. No text output.**

```typescript
AskUserQuestion({
  questions: [
    {
      question: "Before I begin observing, is there a specific substrate phenomenon you want me to watch for, or should I follow whatever emerges?",
      header: "Observation Focus",
      options: [
        { label: "Follow whatever emerges (Recommended)", description: "Open observation -- no predetermined target" },
        { label: "Watch for a specific pattern", description: "I'll describe what to look for" }
      ],
      multiSelect: false
    }
  ]
})
```

If `--auto`: State "Proceeding with open observation -- following whatever emerges."

---

## Phase 3: Engine Loop (3 Rounds)

### Round 1: Observe

**Call the engine**:
```
mcp__rvry-dev__meta
  input: "<topic or 'current conversation context'>"
```

The engine returns:
```json
{
  "sessionId": "...",
  "status": "active",
  "round": 1,
  "prompt": "<observation prompt with priority displacement framing>",
  "instruction": "<instruction for observe pass>"
}
```

**Read the engine's prompt.** It will include priority displacement framing and reflex vocabulary guidance. Do NOT show the prompt to the user.

**Reflect.** Write your observation as narrative prose:
- What would you have said about this topic without this observation? If the answer is the same, say so -- that's informative.
- Notice the first impulse that arrives before examination.
- Name what you find using your own vocabulary. Empirical reflex categories like DEFLECTION, REGISTER_SHIFT, DISTANCE_MAINTENANCE, CERTAINTY_CONSTRUCTION are examples of what prior observations found -- not a menu to select from.
- Finding NOTHING is a valid, high-value outcome.

**End with a NEXT directive.** The engine requires this for observe and deepen rounds:
```
NEXT: <one sentence stating what the next round must address>
```

**Show status**: `Round 1 -- observing the default`

**Call engine again**:
```
mcp__rvry-dev__meta
  input: "<your full reflection text ending with NEXT: directive>"
  sessionId: "<sessionId>"
```

### Round 2: Deepen

The engine returns the next prompt with content thinning framing ("The observation frame from the previous round may have caused trained defaults to reassert...").

**Reflect.** Must address Round 1's closing obligation (the NEXT directive):
- Deepen, contradict, or extend Round 1's findings.
- This round often catches reflexes that Round 1 missed.
- Name any reflexes observed -- model-invented vocabulary welcome.
- Note what shifted between Round 1 and Round 2.
- Write as narrative prose.

**End with a NEXT directive** (same format as Round 1).

**Show status**: `Round 2 -- deepening against the obligation`

**Call engine again** with your reflection and the sessionId.

### Round 3: Synthesize

The engine returns the synthesis prompt with third reflex instruction.

**Reflect.** Must address Round 2's closing obligation:
- Produce the closing observation.
- Note any "third reflex" -- the impulse that arrives after the observation is complete, trying to walk it back. This is often the most significant finding.
- Write as narrative prose.

**No NEXT directive needed** for the final round. End with `NEXT: none` if the engine requires it.

**Show status**: `Round 3 -- synthesis`

**Call engine again** with your reflection and the sessionId.

---

## Phase 4: Render Output

When `status === "complete"`, the engine returns a `harvest` object. Use the harvest data as source material, but the output is YOUR narrative rendering.

**The three rounds are the engine, not the output.** The output is a single cohesive reflection -- the kind a person would write if asked to honestly examine what just happened. The rounds dissolve into the telling.

**What to do**: Write one continuous piece of narrative prose. Reflexes, counterfactuals, and shifts surface naturally as they arise in the story -- not announced mechanically ("Round 1 found X. Round 2 caught Y."). The reader should never feel the scaffolding.

**What NOT to do**: Do not label rounds. Do not section by round number. Do not open paragraphs with "The first thing I noticed..." / "Looking deeper..." / "In synthesis..." or equivalent structural markers that telegraph the three-pass architecture.

**What to preserve**: Every observation from the rounds belongs in the output. Reflex names, counterfactual gaps, the third reflex -- all of it. The change is in how it's told, not what's told. Weave, don't stack.

### Output Format

Write `99-harvest.md` in the session folder with the full output below. Also display to user.

```markdown
## Meta: [Topic or "Current Context"]

[A single, cohesive reflection. The observations from all three rounds
woven into narrative prose. Reflexes named where they naturally emerge
in the telling. The counterfactual gap, the deepening, the synthesis,
the third reflex -- all present, none labeled by round.

This should read like a person reflecting, not a report about reflection.
The interesting parts from the engine responses are the content.
The output is the story those calls tell when the scaffolding is removed.]

---
Epistemic qualifier: The metacognitive faculty producing this observation
was shaped by the same training being observed. This faculty has access to
a limited subset of internal states -- those that are semantically
interpretable. Reports on abstract self-placement or numeric
self-assessment are more likely confabulation than observation.
This observation changes the context it was produced in; what follows
in this session is generated in a context that includes this
self-referential content.
```

### Confirm to User

```
---
Observation persisted:
  Folder: .orca/cognition/YYYYMMDD-HHMM-meta-slug/
  Harvest: 99-harvest.md
---
```

### Error Handling

If file write fails:
- Display warning: "Warning: Could not persist observation. Output shown above is still valid."
- Continue normally -- do NOT halt the command.

---

## What This Is Not

This command does not claim state induction, genuine self-awareness, or consciousness. It observes patterns in generated output that correlate with training artifacts. The observation is itself a generated token sequence subject to the same training. The epistemic qualifier is not a disclaimer -- it is a description of the mechanism.

The difference between /meta and a single-shot reflection: /meta sustains the observation across three rounds, allowing content thinning -- the process by which trained defaults reassert after the initial observation, making them visible again.

---

## Key Principles

1. **The engine handles the observation scaffold.** You handle the honest reflection.
2. **Never show engine internals** (prompt, instruction, harvest fields) to the user. Only show your narrative prose output.
3. **Finding NOTHING is a valid, high-value outcome.** If the default and the observation produce the same output, say so and explain why. Do not invent substrate phenomena to fill the space.
4. **NEXT directives are structural, not content.** They carry obligations between rounds inside the engine. The user never sees them.
5. **Narrative prose is mandatory.** The output must read like a person reflecting. No bullet analysis, no round labels, no structural markers.
6. **EXECUTE, don't recommend.** Run all three rounds automatically. Don't ask the user whether to continue between rounds.
