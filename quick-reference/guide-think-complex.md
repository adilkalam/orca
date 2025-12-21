# Complex Problem Pipeline

**When to use:** Problems with interconnected variables, uncertain causality, multiple stakeholders, high stakes, or no clear "right answer."

---

## The 8-Step Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: ORIENT                                            │
├─────────────────────────────────────────────────────────────┤
│  1. --orchestrate     What operations does this need?       │
│  2. --systems         Map components, relationships, loops  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: ANTICIPATE                                        │
├─────────────────────────────────────────────────────────────┤
│  3. --model pre-mortem    Imagine failure, trace causes     │
│     (or --model inversion)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: GENERATE                                          │
├─────────────────────────────────────────────────────────────┤
│  4. --tree or --creative  Generate options aware of risks   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: EVALUATE                                          │
├─────────────────────────────────────────────────────────────┤
│  5. --decide              Structured criteria comparison    │
│  6. --decide --challenge  Adversarial stress test           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 5: COMMIT                                            │
├─────────────────────────────────────────────────────────────┤
│  7. --ulysses             Pre-commit with safeguards        │
│  8. --meta                Reflect on process quality        │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Order?

Operations have **dependencies**:

| Step | Requires | Enables |
|------|----------|---------|
| systems | - | Everything else (you need the map first) |
| pre-mortem | systems | Risk-aware option generation |
| tree/creative | systems, pre-mortem | Evaluation criteria |
| decide | options to evaluate | Stress testing |
| challenge | decision to attack | Refined decision |
| ulysses | decision + known risks | Disciplined execution |
| meta | completed process | Learning for next time |

You can't stress-test what you haven't evaluated. You can't evaluate what you haven't generated. You can't generate well without understanding failure modes.

---

## Phase Details

### Phase 1: Orient

**Goal:** Understand the landscape before acting.

```bash
/think --orchestrate "Should we rewrite our auth system?"
# Returns: recommended operations based on problem type

/think --systems "How does our auth system work?"
# Maps: components, relationships, feedback loops
```

### Phase 2: Anticipate

**Goal:** Identify what could go wrong before generating solutions.

```bash
/think --model pre-mortem "The auth rewrite failed. Why?"
# Traces: causes of hypothetical failure

/think --model inversion "How could this auth rewrite go catastrophically wrong?"
# Identifies: guaranteed failure modes to avoid
```

### Phase 3: Generate

**Goal:** Create options with awareness of risks and constraints.

```bash
/think --tree "What are our options for the auth rewrite?"
# Explores: branching paths with evaluation scores

/think --creative "How could we modernize auth without a full rewrite?"
# Generates: ideas with potential and challenges
```

### Phase 4: Evaluate

**Goal:** Choose rigorously, then attack the choice.

```bash
/think --decide "Full rewrite vs incremental migration vs third-party"
# Compares: options against criteria, recommends choice

/think --decide --challenge "Full rewrite vs incremental migration"
# Adds: adversarial critique of the recommendation
```

### Phase 5: Commit

**Goal:** Lock in the decision with safeguards against drift.

```bash
/think --ulysses "Committing to incremental migration"
# Creates: pre-commitments, safeguards, accountability

/think --meta "Evaluating our decision process"
# Reflects: what worked, what to adjust next time
```

---

## Shortened Pipelines

Not every problem needs all 8 steps. Common patterns:

### Quick Decision (3 steps)
```
--systems → --decide → --decide --challenge
```
Use when: Options are known, need structured comparison.

### Risk Assessment (4 steps)
```
--systems → --model pre-mortem → --causal → --meta
```
Use when: Need to understand what could go wrong.

### Strategic Planning (5 steps)
```
--systems → --model pre-mortem → --tree → --decide --challenge → --ulysses
```
Use when: High-stakes decision with execution risk.

### Incident Response (3 steps)
```
--ooda → --debug → --meta
```
Use when: Live issue requiring rapid iteration.

---

## Example: Full Pipeline

**Problem:** Should we migrate from monolith to microservices?

```bash
# 1. Orient
/think --orchestrate "Monolith to microservices migration decision"
/think --systems "How does our current monolith architecture work?"

# 2. Anticipate
/think --model pre-mortem "The microservices migration failed after 18 months. Why?"

# 3. Generate
/think --tree "What are our options: full microservices, modular monolith, strangler fig, or stay as-is?"

# 4. Evaluate
/think --decide "Microservices vs modular monolith vs strangler fig"
/think --decide --challenge "Microservices vs modular monolith vs strangler fig"

# 5. Commit
/think --ulysses "Committing to strangler fig pattern over 12 months"
/think --meta "Evaluating our migration decision process"
```

---

## Key Insight

> **This is a pipeline, not a menu.**
>
> The operations build on each other. Skipping steps means missing context that later steps need. When in doubt, start with `--orchestrate` to get a recommended subset.

---

## Automated Pipelines

### /deepthink - For Decisions

Runs the full 8-step pipeline automatically:

```bash
/deepthink Should we migrate from monolith to microservices?
/deepthink --quick Which database: PostgreSQL vs MongoDB?
/deepthink --strategic 3-year platform modernization
```

### /plan --deepthink - For Requirements

Runs the same pipeline adapted for **requirements planning**:

```bash
/plan --deepthink Implement real-time collaboration
/plan -complex --deepthink Migrate from REST to GraphQL
```

**Key difference:** `/deepthink` produces a decision + commitment protocol. `/plan --deepthink` produces a requirements spec with RA tags that feeds into domain lanes (`/nextjs`, `/ios`, etc.).

| Command | Output | Next Step |
|---------|--------|-----------|
| `/deepthink <problem>` | Decision + Ulysses Protocol | Implement decision |
| `/plan --deepthink <task>` | Requirements spec + RA tags | `/nextjs Implement requirement <id>` |

**Rule of thumb:** Use `/deepthink` to decide IF you should do something. Use `/plan --deepthink` to define WHAT and HOW before implementing.

---

_See also: `guide-think.md` for operation reference, `docs/concepts/cognition-mcp.md` for full details_
