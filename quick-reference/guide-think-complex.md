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

### /problem-solve - For Decisions (Convergent)

Runs the full 8-step pipeline automatically for convergent decision-making:

```bash
/problem-solve Should we migrate from monolith to microservices?
/problem-solve --quick Which database: PostgreSQL vs MongoDB?
/problem-solve --strategic 3-year platform modernization
```

**Phase Gates:** Each phase includes verification checkpoints to ensure genuine progress before advancing. Gates prevent shallow completion-drive behavior.

### /deepthink - For Exploration (Divergent)

Depth-first exploration with route-based modes:

```bash
/deepthink "Why does user retention drop after day 3?"
/deepthink --light "Quick question about caching"
/deepthink --full "Major architectural exploration"
```

**Modes:** MAP (orientation), INVERT (stress test), PERSPECTIVES (escape own head), EDGES (creative expansion), META (self-observation), DEEP (intensive focus)

**Enhanced Mode Combinations:** Modes can combine with reasoning patterns for deeper analysis:
- MAP + causal analysis for dependency mapping
- INVERT + reflexion for iterative stress testing
- PERSPECTIVES + collaborative reasoning for multi-stakeholder analysis

**External Verification:** Each mode generates verification questions that can be answered by external sources (documentation, tests, user input) to ground the exploration.

### /plan --problem-solve - For Requirements

Runs the same convergent pipeline adapted for **requirements planning**:

```bash
/plan --problem-solve Implement real-time collaboration
/plan -complex --problem-solve Migrate from REST to GraphQL
```

**Key difference:** `/problem-solve` produces a decision + commitment protocol. `/plan --problem-solve` produces a requirements spec with RA tags that feeds into domain lanes (`/nextjs`, `/ios`, etc.).

| Command | Purpose | Output | Next Step |
|---------|---------|--------|-----------|
| `/deepthink <question>` | Divergent exploration | Questions, hypotheses, insights | Refined understanding |
| `/problem-solve <problem>` | Convergent decision | Decision + Ulysses Protocol | Implement decision |
| `/plan --problem-solve <task>` | Requirements planning | Spec + RA tags | `/nextjs Implement requirement <id>` |

**Rule of thumb:**
- Use `/deepthink` when you're **confused** and need to explore
- Use `/problem-solve` when you need to **decide** something
- Use `/plan --problem-solve` to define **WHAT and HOW** before implementing

---

## Cross-Command Handoff

Commands provide explicit handoff guidance in their outputs:

| From | Handoff Condition | To |
|------|-------------------|-----|
| `/contemplate` | Problem type identified | Recommended reasoning command with flags |
| `/deepthink` | Exploration complete, decision needed | `/problem-solve` with key insights |
| `/problem-solve` | Decision made, implementation needed | `/plan` or domain command with decision context |
| `/think --deep` | Extended analysis complete | Summary with next-step recommendation |

Handoff outputs include:
- Key insights to carry forward
- Recommended next command with specific flags
- Context that should NOT be lost in transition

---

_See also: `guide-think.md` for operation reference, `docs/concepts/cognition-mcp.md` for full details_
