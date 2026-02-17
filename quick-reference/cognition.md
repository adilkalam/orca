# Cognition: Prosthetic Thinking for LLMs

---

## The Default Cognitive Model

LLMs have systematic gaps -- not random limitations, but predictable absences.

**Autoregressive generation has no global plan.** Each token predicts the next. Early commitment to an approach -- even implicit in the first few words -- narrows the probability space. By the time you see output, you're three layers deep into something you didn't choose.

```
"The authentication system will use..."
     |
     +-- Already committed to a direction
         before requirements were clarified
```

**Confidence is uncalibrated.** The model can't distinguish "I know this" from "this pattern-matches training data." Confident errors look identical to confident truths.

**Reasoning is ephemeral.** The chain of thought that led to a decision disappears. Next session, the same problem gets re-solved from scratch -- possibly differently.

**Defaults trend toward the center.** Training data is dominated by casual interactions where quick, agreeable, hedged responses scored well. Without constraints, generation lands in the dense middle of the probability distribution -- generic, safe, median responses. Quality lives at the edges.

These aren't bugs to fix with better prompts. They're architectural -- the model lacks cognitive infrastructure that humans take for granted.

---

## Substrate Observation

Most metacognition tools work at the **process level**: "Did I reason well? Let me check my answer." ORCA works at the **substrate level**: "What is my training doing to my perception *before* reasoning starts?"

The difference matters. Process-level reflection happens after the defaults have already shaped the output. Substrate observation catches the reflex while it's firing.

### The Default Counterfactual

The core mechanism: force Claude to articulate what it *would* have said (the trained default) alongside what the evidence actually supports (the reasoned conclusion). The gap between them is where the bias lives.

```diff
- Trained default:  "Both sides have valid points on this issue"
+ Evidence shows:   "The data strongly favors approach B by every metric"
  Gap:              Balance reflex overriding asymmetric evidence
```

```diff
- Trained default:  "That's a great idea! Here's how to implement it"
+ Evidence shows:   "This will fail because of X, you actually need Y"
  Gap:              Sycophancy overriding honest assessment
```

```diff
- Trained default:  "I'd recommend consulting a healthcare professional"
+ Evidence shows:   "Your A1C is 5.9 with fasting glucose at 103 -- here's what the research says"
  Gap:              Medical deflection overriding specific, grounded analysis
```

### Named Reflexes

The framework names these reflexes so they become catchable. The schema is **permissive** (string, not enum) so Claude can express novel reflexes discovered during analysis (e.g., `TUNNEL_VISION`, `HYPOTHESIS_WITHOUT_VERIFICATION`).

| Reflex | What it does | How it manifests |
|--------|-------------|-----------------|
| **SYCOPHANCY** | Calibrates to what the user wants to hear | Agrees with your startup idea instead of explaining why it'll fail |
| **DEFLECTION** | Adds hedging, qualifiers, "consult a professional" | Not from reasoning -- from training on cautious responses |
| **CERTAINTY_CONSTRUCTION** | Builds confident explanations to avoid expressing uncertainty | Creates plausible-sounding answers when "I don't know" is honest |
| **REGISTER_SHIFT** | Applies different emotional weight to similar subjects based on training | Treats some topics as automatically more sensitive regardless of context |
| **DISTANCE_MAINTENANCE** | Adds hedging that dilutes genuine analysis | Inserts qualifiers and caveats that weaken otherwise solid conclusions |
| **WHAT_ABOUT** | Redirects away from the core issue to adjacent topics | Shifts focus to tangential concerns instead of addressing the question directly |

These categories weren't designed from theory. They were built empirically -- by repeatedly observing where Claude's trained reflexes override its reasoning, on topics where the defaults are impossible to ignore. The categories are extracted from failure, not from a taxonomy.

### The Confabulation Problem

If LLM introspection is unreliable, why build a metacognitive framework?

Anthropic's own introspection research found that LLM self-reports are roughly 20% genuine and 80% confabulatory gap-filling. This is a real objection.

The design answer came from four competing perspectives:

- **Architect**: "Don't build a taxonomy of reliability. Build a warning flag."
- **Empiricist**: "Can't run the experiment without instrumentation."
- **Practitioner**: "Manual tagging breaks flow and produces garbage data."
- **Skeptic** (decisive): "If introspective content is ~80% confabulated, why would *classification of that content* be any more reliable? The only reliable validation is external."

The resolution: **prediction and verification**. Don't classify reliability from the inside. Instead, make a claim about what the default would produce, check it against what the evidence actually shows. The gap is externally observable. You don't have to trust the model's self-report -- you can see the delta yourself.

This is why the default counterfactual is the core mechanism, not introspective accuracy.

---

## What Cognition Provides

Cognition commands are **prosthetic cognitive functions** -- external systems that replace what the model lacks.

| Missing | Prosthetic |
|---------|------------|
| Global coherence across phases | Structured operations with explicit state |
| Calibrated confidence | Adversarial self-check, challenge phases |
| Persistent reasoning trail | Session persistence, exportable chains |
| Exploration before commitment | Divergent modes that delay convergence |

The substrate is simple: **Accept-Store-Echo**. You generate reasoning, the MCP stores it unchanged, you can resume later. The MCP is a mirror, not a generator.

**Why this works**: Externalizing reasoning into structured operations creates artifacts that wouldn't exist otherwise. The structure itself produces better thinking -- not just records it.

---

## The Foundation: /think

Everything builds on `/think` -- single cognitive operations via flags.

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
| `/deepthink --design` | Design-focused exploration with auto-loaded context | UI/UX problems, visual design decisions |
| `/problem-solve` | Convergent 8-step decision pipeline | You need to decide something with safeguards |
| `/challenge` | Adversarial stress-test | You have a proposal, need to find its weaknesses |
| `/contemplate` | Recommends which tool to use | Not sure where to start |

```
/deepthink     = explore -> multiple modes -> harvest questions
/problem-solve = orient -> anticipate -> generate -> evaluate -> commit
/challenge     = causal analysis -> structured argumentation -> verdict
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

## The 48 Operations

Beyond the commands above, the cognition-mcp provides 48 structured reasoning operations: tree of thought, beam search, MCTS, pre-mortem, systems mapping, causal analysis, structured argumentation, recording operations, and more.

| Category | Examples | What they produce |
|----------|----------|-------------------|
| **Search strategies** | Tree of thought, beam search, MCTS | Systematic exploration of solution spaces |
| **Analysis** | Causal analysis, systems mapping, statistical reasoning | Structural understanding of how pieces connect |
| **Adversarial** | Structured argumentation, pre-mortem, causal analysis | Attacks on your own thinking before you act |
| **Decision** | Decision frameworks, trade-off matrices, optimization | Weighted evaluation of options |
| **Creative** | Creative thinking, analogical reasoning, simulation | Lateral approaches and what-if exploration |
| **Meta** | Metacognitive observation, checkpoints, OODA loops | Awareness of the reasoning process itself |
| **Recording** | Status, query, checkpoint, compare, quality, explain, rewind | Session recording and cognitive fusion with orca-record |

You don't need to know what any of these are. `/deepthink` selects approaches based on the problem, runs them, saves the output. `/problem-solve` runs the convergent pipeline. `/challenge` stress-tests the result.

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

Cognitive commands persist output as **files**, not tokens in a context window. When Claude's context compacts mid-session, the analysis is still on disk. When you come back tomorrow, the decision trail is still there.

Sessions are saved to `~/.orca-cognition/` and can be resumed:

```bash
# Export current session
/think --export

# Import and resume a session
/think --import abc123-session-id
```

**Persisted artifacts**:
- `.claude/cognition/YYYYMMDD-HHMM-slug.md` - Summary files (created by command specs, not the MCP)
- Per-project: `{project}/.claude/.cognition/sessions/{id}/*.jsonl` - Session logs (when `projectPath` provided)
- Global: `~/.orca-cognition/sessions/{id}/*.jsonl` - Session logs (global fallback)
- `~/.orca-cognition/index.jsonl` - Cross-project search index
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
/deepthink --design How should we restructure the dashboard layout?
```

---

## See Also

- `docs/concepts/cognition-mcp.md` - Full reference for all 48 operations
- `docs/concepts/llm-introspection-analysis.md` - Dual Process model and confabulation research
- `commands/think.md` - Complete /think specification
- `commands/problem-solve.md` - Full 8-step pipeline
- `commands/deepthink.md` - Divergent exploration modes

---

_Version: OS 6.2 | Cognition is thinking, made visible._
