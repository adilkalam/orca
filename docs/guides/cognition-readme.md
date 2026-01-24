# Cognition: Prosthetic Thinking for LLMs

---

## The Default Cognitive Model

LLMs have systematic gaps - not random limitations, but predictable absences.

**Autoregressive generation has no global plan.** Each token predicts the next. Early commitment to an approach - even implicit in the first few words - narrows the probability space. By the time you see output, you're three layers deep into something you didn't choose.

```
"The authentication system will use..."
     |
     +-- Already committed to a direction
         before requirements were clarified
```

**Confidence is uncalibrated.** The model can't distinguish "I know this" from "this pattern-matches training data." Confident errors look identical to confident truths.

**Reasoning is ephemeral.** The chain of thought that led to a decision disappears. Next session, the same problem gets re-solved from scratch - possibly differently.

**Defaults trend toward the center.** Without constraints, generation lands in the dense middle of the probability distribution - generic, safe, median responses. Quality lives at the edges.

These aren't bugs to fix with better prompts. They're architectural - the model lacks cognitive infrastructure that humans take for granted.

---

## What Cognition Provides

Cognition commands are **prosthetic cognitive functions** - external systems that replace what the model lacks.

| Missing | Prosthetic |
|---------|------------|
| Global coherence across phases | Structured operations with explicit state |
| Calibrated confidence | Adversarial self-check, challenge phases |
| Persistent reasoning trail | Session persistence, exportable chains |
| Exploration before commitment | Divergent modes that delay convergence |

The substrate is simple: **Accept-Store-Echo**. You generate reasoning, the MCP stores it unchanged, you can resume later. The MCP is a mirror, not a generator.

**Why this works**: Externalizing reasoning into structured operations creates artifacts that wouldn't exist otherwise. The structure itself produces better thinking - not just records it.

---

## The Foundation: /think

Everything builds on `/think` - single cognitive operations via flags.

```
/think [--flag] <problem>
```

| Flag | What It Does |
|------|--------------|
| `--systems` | Map components, relationships, feedback loops |
| `--debug` | Structured debugging with approach and resolution |
| `--decide` | Decision framework with options, criteria, tradeoffs |
| `--causal` | Cause-effect chains and interventions |
| `--model NAME` | Apply a mental model (pre-mortem, inversion, first-principles...) |
| `--creative` | Divergent ideation with techniques |
| `--meta` | Reflect on your own reasoning process |

**Example**:
```bash
/think --systems How does our auth flow work?
/think --debug Why is this test flaky?
/think --model pre-mortem This migration failed. Why?
```

---

## Composed Commands

When you need more than one operation, use the composed commands. They chain multiple `/think` operations into workflows.

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/deepthink` | Divergent exploration with route-based modes | You're confused, need to discover what you don't know |
| `/problem-solve` | Convergent 8-step decision pipeline | You need to decide something with safeguards |
| `/challenge` | Adversarial stress-test | You have a proposal, need to find its weaknesses |
| `/contemplate` | Recommends which tool to use | Not sure where to start |

```
/deepthink     = explore → multiple modes → harvest questions
/problem-solve = orient → anticipate → generate → evaluate → commit
/challenge     = causal analysis → structured argumentation → verdict
```

---

## Two Workflow Patterns

Your cognitive load determines your entry point.

### Pattern 1: New Problems (High Uncertainty)

When you're confused, exploring, or facing something genuinely new:

```
/deepthink  -->  /problem-solve  -->  /challenge  -->  /plan  -->  /orca-*
   |                  |                   |              |           |
 EXPLORE          DECIDE            STRESS-TEST      PLAN IT     BUILD IT
```

**Example flow**:
```bash
# 1. Explore the problem space (divergent)
/deepthink Why does user retention drop after day 3?

# 2. Converge on a decision
/problem-solve Should we add onboarding tutorials or simplify the UI?

# 3. Stress-test the decision
/challenge Add progressive onboarding with contextual hints

# 4. Plan the implementation
/plan Implement progressive onboarding system

# 5. Execute via orchestration
/orca-nextjs   # or /orca-expo, /orca-ios, etc.
```

### Pattern 2: Regular Work (Lower Uncertainty)

When you have a clear direction but need depth:

```
/think --systems  -->  /think --[deepen]  -->  /think --model inversion  -->  /problem-solve  -->  /plan
       |                       |                        |                          |              |
    ORIENT               GO DEEPER              CHALLENGE IT              CRYSTALLIZE       PLAN IT
```

**Example flow**:
```bash
# 1. Orient with systems thinking
/think --systems How do our auth components interact?

# 2. Deepen with causal analysis
/think --causal Why is the token refresh failing intermittently?

# 3. Challenge your understanding
/think --model inversion How could this auth refactor fail?

# 4. Crystallize the decision
/problem-solve --quick Fix token refresh or migrate to session-based auth?

# 5. Plan the implementation
/plan Implement automatic token refresh with retry logic
```

---

## When to Use What

| Situation | Start With | Why |
|-----------|------------|-----|
| "I'm confused about this problem" | `/deepthink` | Divergent exploration, find what you don't know |
| "I need to decide between X and Y" | `/problem-solve --quick` | Fast convergent decision with stress-test |
| "This is a major architectural decision" | `/problem-solve` | Full 8-step pipeline with safeguards |
| "I want to map how things connect" | `/think --systems` | Component relationships and feedback loops |
| "Is this proposal actually good?" | `/challenge` | Adversarial analysis, find weaknesses |
| "I'm not sure which tool to use" | `/contemplate` | Recommends the right approach |
| "Quick debug session" | `/think --debug` | Structured debugging capstone |
| "I need to think through options" | `/think --decide` | Decision framework with pros/cons |

---

## The /think Flag Reference

### Primary Flags (pick one)

| Flag | Operation | Use When |
|------|-----------|----------|
| (none) | Sequential thought chain | Default reasoning |
| `--systems` | Systems mapping | Understanding component relationships |
| `--debug` | Debug capstone | Troubleshooting issues |
| `--decide` | Decision framework | Choosing between options |
| `--model NAME` | Mental model | Applying specific frameworks |
| `--causal` | Causal analysis | Understanding cause and effect |
| `--creative` | Creative thinking | Generating ideas |
| `--ooda` | OODA loop | Incident response |
| `--meta` | Metacognition | Reflecting on your reasoning |

### Mental Models (`--model NAME`)

| Model | Use For |
|-------|---------|
| `pre-mortem` | "This failed. Why?" |
| `inversion` | "How could this go wrong?" |
| `first-principles` | "What's actually true here?" |
| `five-whys` | Root cause drilling |
| `steelmanning` | Strongest opposing argument |
| `rubber-duck` | Explain to understand |

### Modifier Flags (combine with primary)

| Flag | Effect |
|------|--------|
| `--deep` | Extended thinking (8-12+ thoughts with review checkpoints) |
| `--visual` | Generate ASCII diagram |
| `--challenge` | Add adversarial critique |

**Example combinations**:
```bash
/think --systems --visual     # Map system + show diagram
/think --decide --challenge   # Decide + stress-test the choice
/think --deep --debug         # Extended debugging session
```

---

## Common Patterns

### The Inversion Check

After any major decision, invert it:

```bash
/think --decide Should we use microservices?
/think --model inversion How would the microservices migration fail?
```

### The Systems-First Approach

Before diving into implementation:

```bash
/think --systems How does the current auth flow work?
/think --causal What causes the login delays?
# Then decide with context
/problem-solve --quick Optimize current flow vs rebuild?
```

### The Deep Dive

When surface-level thinking isn't enough:

```bash
/think --deep Why does our test suite take 20 minutes?
# Produces 8-12 thoughts with review and synthesis checkpoints
```

### The Full Safety Pipeline

For high-stakes decisions:

```bash
/problem-solve Should we migrate to a new database?
# Runs: orchestrate -> systems -> pre-mortem -> tree -> decide -> challenge -> ulysses -> meta
```

---

## Session Persistence

Sessions are saved to `~/.orca-cognition/` and can be resumed:

```bash
# Export current session
/think --export

# Import and resume a session
/think --import abc123-session-id
```

**Persisted artifacts**:
- `.claude/cognition/YYYYMMDD-HHMM-slug.md` - Summary files
- `~/.orca-cognition/sessions/` - Full session logs
- Workshop entries with `#cognition` tag

---

## The Bridge to Execution

Cognition commands prepare you to build. When you're done thinking:

```
Cognition          Execution
---------          ---------
/problem-solve --> /plan --> /orca-nextjs
/deepthink     --> /plan --> /orca-expo
/think --decide -> /plan --> /orca-ios
```

The handoff: Your cognition session produces insights and decisions. `/plan` transforms those into requirements. `/orca-*` orchestrates the build.

---

## Quick Start

**First time?** Try this:

```bash
# Describe your problem
/contemplate I need to add authentication to my app

# It will recommend the right approach
# Then follow its suggestions
```

**Already know what you need?**

```bash
# Direct to the right tool
/think --systems My app's data flow
/problem-solve --quick JWT vs session auth
/deepthink Why is user engagement low?
```

---

## See Also

- `docs/concepts/cognition-mcp.md` - Full reference for all 40 operations
- `commands/think.md` - Complete /think specification
- `commands/problem-solve.md` - Full 8-step pipeline
- `commands/deepthink.md` - Divergent exploration modes
- `quick-reference/guide-think-complex.md` - Pipeline theory

---

_Version: OS 4.3 | Cognition is thinking, made visible._
