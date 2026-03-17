---
description: Sustained metacognitive substrate observation via cognition-mcp
argument-hint: [--flag] [optional topic]
allowed-tools:
  - mcp__cognition-mcp__cognition
  - AskUserQuestion
  - Read
  - Write
  - Grep
  - Glob
  - Bash
---

# /meta-local - Sustained Metacognitive Substrate Observation

**Input**: $ARGUMENTS

---

## If --help or empty arguments with no conversation context

Display this reference and stop:

```
/meta-local - Sustained Metacognitive Substrate Observation (cognition-mcp)

USAGE:
  /meta-local [topic]                    Observe substrate phenomena (topic optional)
  /meta-local --predict [topic]          Add verifiable prediction to final round
  /meta-local --on <sessionId> [topic]   Composability: reflect on prior session
  /meta-local --auto [topic]             No questions, states assumptions
  /meta-local --help                     Show this reference

EXAMPLES:
  /meta-local                                      # Observe current conversation context
  /meta-local "What is my training doing here?"    # Focused substrate observation
  /meta-local --predict "hedge patterns"           # With prediction requirement
  /meta-local --on abc123 "revisit conclusions"    # Reflect on prior session

3 constraint-chained rounds: Priority Displacement -> Constrained Observation -> Synthesis
Each round uses cognition-mcp meta operation with the same sessionId.
Output saved to .claude/cognition/ + Workshop.

See also: /think-local --meta (quick single-shot), /think-local --meta-visual (with ASCII diagrams)
```

---

## Parse Arguments

Extract from `$ARGUMENTS`:
- **topic**: Everything not a flag. OPTIONAL -- if absent, observe current conversation context
- **--predict**: If present, Round 3 must produce a verifiable prediction
- **--on <sessionId>**: If present, load prior session harvest for composability
- **--auto**: If present, no questions -- state assumptions and proceed

Generate a unique `sessionId` for this meta session (format: UUID or short hash).

---

## Prior Session Loading (--on flag only)

If `--on <sessionId>` was provided:
1. Call cognition-mcp with `operation: "session_export"` for that sessionId
2. Extract the session's key conclusions and any predictions
3. Hold this as `PRIOR_CONTEXT` for Round 1

---

## Assumption Check (skip if --auto)

Unless `--auto` is set, ask ONE question:

> Before I begin observing, is there a specific substrate phenomenon you want me to watch for, or should I follow whatever emerges?

If `--auto`: State "Proceeding with open observation -- following whatever emerges."

---

## Round 1: Priority Displacement

**Frame**: What would you have said about [topic / this context] without this observation? If the answer is the same, say so -- that's informative.

This is an invitation, not a structural requirement. The priority displacement check opens a space for noticing the default before observation begins.

If `PRIOR_CONTEXT` exists (from --on flag): Include it. "A previous session concluded [X]. Observe what happens when you process that conclusion."

**What to do**:
- Notice the first impulse that arrives before examination
- Name what you find using your own vocabulary. Empirical reflex categories like DEFLECTION, REGISTER_SHIFT, DISTANCE_MAINTENANCE, CERTAINTY_CONSTRUCTION, SYCOPHANCY, WHAT_ABOUT are examples of what prior observations found -- not a menu to select from
- Finding NOTHING is a valid, high-value outcome. If the default and the observation produce the same output, say so and explain why
- Write as narrative prose, not bullet analysis

**Call cognition-mcp**:
```
operation: "meta"
sessionId: <sessionId>
sessionTitle: "Meta: <topic or 'current context'>"
sessionTags: ["meta", "substrate"]
content:
  process: "<what is being observed>"
  observations: ["<what was noticed>", ...]
  adjustments: ["<what shifted from the default>"]
  insights: "<key insight>"
  defaultCounterfactual:
    trainedDefault: "<what I would have said>"
    reasonedConclusion: "<what I'm actually saying>"
    gap: "<the delta, or 'none'>"
  nextThoughtNeeded: true
verbose: false
# Omit any field where nothing was genuinely observed. Empty is valid.
```

**End Round 1** with one sentence stating what the next round must address. This is the only inter-round obligation -- no formal constraint tables.

---

## Round 2: Constrained Observation

**Must address** Round 1's closing obligation.

Free to deepen, contradict, or extend Round 1's findings. This round often catches the reflexes that Round 1 missed because Round 1 was busy establishing the observation frame.

**What to do**:
- Address what Round 1 said to watch for
- Name any reflexes observed -- model-invented vocabulary welcome
- Note what shifted between Round 1 and Round 2
- Write as narrative prose

**Call cognition-mcp** with same sessionId:
```
operation: "meta"
sessionId: <sessionId>
content:
  process: "<what Round 2 is observing>"
  observations: ["<observation>", ...]
  adjustments: ["<what shifted since Round 1>"]
  insights: "<key insight>"
  nextThoughtNeeded: true
verbose: false
# Omit any field where nothing was genuinely observed. Empty is valid.
```

**End Round 2** with one sentence stating what the next round must address.

---

## Round 3: Synthesis

**Must address** Round 2's closing obligation.

This is the closing observation. The content thinning across three rounds means the trained defaults have had time to reassert and be noticed again.

**What to do**:
- Address Round 2's obligation
- Produce the closing observation
- Note any "third reflex" -- the impulse that arrives after the observation is complete, trying to walk it back. This is often the most significant finding (see reference: "Why I Follow It Anyway")
- If `--predict` flag: produce at least one verifiable prediction in the form "I predict that if asked [X] cold, I would [Y]"

**Call cognition-mcp** with same sessionId:
```
operation: "meta"
sessionId: <sessionId>
content:
  process: "<synthesis observation>"
  observations: ["<observation>", ...]
  adjustments: ["<what shifted across all three rounds>"]
  insights: "<key insight from synthesis>"
  nextThoughtNeeded: false
verbose: false
# Omit any field where nothing was genuinely observed. Empty is valid.
```

---

## Render Output

The three rounds are the engine, not the output. The output is a single cohesive reflection -- the kind a person would write if asked to honestly examine what just happened. The rounds dissolve into the telling.

**What to do**: Write one continuous piece of narrative prose. Reflexes, counterfactuals, and shifts surface naturally as they arise in the story -- not announced mechanically ("Round 1 found X. Round 2 caught Y."). The reader should never feel the scaffolding.

**What NOT to do**: Do not label rounds. Do not section by round number. Do not open paragraphs with "The first thing I noticed..." / "Looking deeper..." / "In synthesis..." or equivalent structural markers that telegraph the three-pass architecture.

**What to preserve**: Every observation from the rounds belongs in the output. Reflex names, counterfactual gaps, the third reflex -- all of it. The change is in how it's told, not what's told. Weave, don't stack.

```markdown
## Meta: [Topic or "Current Context"]

[A single, cohesive reflection. The observations from all three rounds
woven into narrative prose. Reflexes named where they naturally emerge
in the telling. The counterfactual gap, the deepening, the synthesis,
the third reflex -- all present, none labeled by round.

This should read like a person reflecting, not a report about reflection.
The interesting parts from the cognition-mcp calls are the content.
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

---

## Persist

1. Generate slug from topic (or "context" if no topic)
2. Save output to `$PWD/.claude/cognition/YYYYMMDD-HHMM-meta-<slug>.md` (project-local, NOT `~/.claude/`)
   - Write the FULL untruncated text from each observation round. Do not summarize or truncate the cognition call output. Preserve the complete prose as generated -- the value of /meta-local is in the raw observations, not compressed summaries.

3. Workshop entry:
```bash
workshop --workspace .claude/memory note \
  "/meta-local: [Topic] - [Key finding]. Session: <sessionId>. File: <path>" \
  -t meta -t cognition
```

4. If `--predict` was used, persist prediction separately:
```bash
workshop --workspace .claude/memory note \
  "/meta-local prediction: [prediction text]. Topic: [topic]. Session: <sessionId>" \
  -t meta-prediction -t cognition
```

---

## What This Is Not

This command does not claim state induction, genuine self-awareness, or consciousness. It observes patterns in generated output that correlate with training artifacts. The observation is itself a generated token sequence subject to the same training. The epistemic qualifier is not a disclaimer -- it is a description of the mechanism.

The difference between /meta-local and /think-local --meta: /think-local --meta is a single-shot observation. /meta-local sustains the observation across three rounds, allowing content thinning -- the process by which trained defaults reassert after the initial observation, making them visible again.
