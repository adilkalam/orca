# Improving the Cognition Suite: Revised Analysis

## The Suite as a System

The four cognition-mcp commands aren't four copies of the same thing. They form a differentiated system with intentional coverage:

| Command | Mode | Purpose | Key Mechanisms |
|---------|------|---------|----------------|
| **think-local** | Divergent | Lightweight exploration, constraint chains | 19+ operations, 15 mental models, mode selection, self-check + weakness probe, `--challenge` modifier |
| **deepthink-local** | Divergent + adversarial | Depth-first exploration with failure analysis | SHIMMER priming, adaptive pre-mortems after conclusion-producing modes, MAP→INVERT mandatory sequence |
| **problem-solve-local** | Convergent | Decision pipeline | Always-on SHIMMER, FRAME→EXPLORE→STRESS-TEST→DECIDE, pre-mortem + adversarial challenge + weakness probe in R3 |
| **challenge-local** | Pure adversarial | Attack a proposal | Causal analysis→assumption audit→edge-case storm→failure mode catalog→structured argumentation→GO/NO-GO verdict |

This changes the analysis significantly. My original 8 gaps were evaluated against think-local in isolation. With the full suite, several are already addressed — just by different commands.

---

## Original Gaps: What the Suite Already Covers

### Gap 3 (Dialectical Exploration) — COVERED by challenge-local + deepthink-local

My original proposal was a `--dialectic` flag for sustained thesis→antithesis→synthesis→stress-test. The suite already has:

- **challenge-local**: 4-step adversarial sequence (causal analysis → assumption/edge audit → structured argumentation with steel-man + rebuttal → verdict). This IS sustained dialectical tension across multiple constrained rounds.
- **deepthink-local --intense**: Full ceremony with META in rotation, per-mode self-checks, verbose pre-mortems after every mode.
- **think-local --challenge**: Post-analysis adversarial critique.
- **problem-solve-local R3**: Pre-mortem + adversarial challenge + weakness probe merged into one step, with a revision loop back to R2 if verdict is NEEDS REVISION.

The sustained adversarial depth I proposed is already distributed across the suite. The constraint chain principle (each round constrained by the previous) is built into all four commands.

**Status**: Drop. The suite solves this by routing to the right command rather than overloading think-local.

### Gap 5 (Dialectical Prompting) — COVERED (same reasoning)

This was the more detailed version of Gap 3. Same conclusion — challenge-local's structured argumentation with steel-man counterarguments and rebuttals is exactly the "argue from positions you don't hold" mechanism. The "don't stop at the first response" principle is structurally enforced by having 4-6 MCP calls per challenge session.

**Status**: Drop.

### Gap 1 (Pre-Reasoning Monitor) — PARTIALLY COVERED by SHIMMER

SHIMMER (self-observation priming) runs before structured analysis in deepthink-local and problem-solve-local. It primes self-referential processing and catches initial biases. problem-solve-local's R1 FRAME also classifies decision type before exploration begins, which is a form of task characteristic assessment.

**What's still missing**: SHIMMER is substrate observation — it watches what's happening in processing. It's not a structured difficulty/familiarity assessment that directly gates mode selection intensity. The MGV framework's ME_difficulty signal ("this is a simple question, resist elaborate multi-mode exploration") is a different mechanism than SHIMMER's self-observation ("notice moments of activation, repetition, branching").

**Status**: Partially covered. SHIMMER handles the self-observation angle. The structured difficulty assessment that prevents complexity-collapse before it starts is still a gap — but a smaller one now that deepthink-local's adaptive pre-mortems catch it mid-stream.

### Gap 7 (Thinking Intervention / Intra-Mode Self-Correction) — PARTIALLY COVERED

deepthink-local's adaptive pre-mortems fire after conclusion-producing modes, catching problematic directions before they solidify. problem-solve-local's STRESS-TEST (R3) has a revision loop back to EXPLORE if the verdict is NEEDS REVISION. These are inter-mode corrections.

**What's still missing**: True intra-mode correction (mid-thought-chain, not between rounds). But given that each cognition-mcp call is a single structured operation, the granularity for mid-call intervention is limited by architecture. The inter-mode checkpoints are probably the right level of abstraction for this system.

**Status**: Architecturally addressed. The remaining gap is more of a cognition-mcp runtime concern than a command-level concern. Drop from command-level recommendations.

---

## Original Gaps: What Remains Genuinely Open

### Gap 2: Behavior Handbook (Cross-Session Learning) — STILL OPEN

None of the four commands extract or reuse reasoning patterns across sessions. Each session starts from scratch on strategy. Workshop memory stores findings (what was concluded), not reasoning meta-patterns (how to reason about this class of problem).

The [Metacognitive Reuse](https://arxiv.org/abs/2509.13237) evidence (46% token reduction, +10% accuracy from reusing reasoning fragments) applies to the entire suite, not just think-local.

**Revised proposal**: Suite-wide behavior extraction. After any command's harvest checkpoint, optionally extract a reasoning behavior:

```bash
workshop --workspace .claude/memory note \
  "BEHAVIOR: [name] - [When to apply]. [1-line instruction]. Source: <sessionId>, command: /[command]" \
  -t behavior -t cognition
```

Then in Phase 0.5a (which all four commands share), query for relevant behaviors:

```bash
workshop --workspace .claude/memory search "BEHAVIOR" --limit 3 2>/dev/null || true
```

This is lightweight, uses existing Workshop infrastructure, and benefits all four commands equally. The value compounds with usage — after 50 sessions, the suite has a library of "for architecture decisions, INVERT consistently produces the highest-value output" or "distributed systems problems benefit from MAP→DEEP→INVERT sequence."

**Priority**: High. Low implementation cost, compounding returns.

### Gap 3 (revised): Cognitive Debiasing — STILL OPEN

challenge-local does adversarial analysis. problem-solve-local R3 does pre-mortem + adversarial challenge. But none of the commands do bias-specific debiasing — naming the cognitive distortion type (anchoring, framing, authority, sunk cost) and correcting for it.

The [Epistemic Independence Training](https://arxiv.org/html/2602.01528v2) evidence (+13.2% accuracy, +39.1% generalization to unseen bias types) and the [Self-Debiasing](https://staff.fnwi.uva.nl/m.derijke/wp-content/papercite-data/pdf/lyu-2025-cognitive-arxiv.pdf) three-step method (determine → analyze → debias) address a different axis than adversarial critique. Adversarial critique asks "what's wrong with this conclusion?" Cognitive debiasing asks "what's distorting my reasoning process?"

**Where it fits**: This belongs in problem-solve-local's STRESS-TEST (R3) and challenge-local's assumption audit — the two commands that produce decisions/verdicts where bias has the highest stakes.

**Revised proposal**: Extend the weakness probe rotation in problem-solve-local R3 and add bias-specific checks to challenge-local's assumption audit:

```
# New weakness probes (add to R3 rotation):
7. What cognitive bias is most likely distorting this analysis? Name it
   (anchoring, framing, authority, sunk cost, availability, confirmation)
   and state how it might be pulling the conclusion.
8. If the problem framing were inverted (opposite phrasing), would you
   reach the same conclusion? If not, you have a framing effect.
```

```
# Extension to challenge-local assumption audit:
assumptions: [
  // ...existing fields...
  { bias: "anchoring|framing|authority|sunk_cost|none",
    biasEvidence: "<how this bias might be operating>" }
]
```

**Priority**: High. Complements the existing adversarial mechanisms without duplicating them.

### Gap 4: Abductive/Triad Reasoning — STILL OPEN (but narrower)

think-local's `--debug` is implicitly abductive. `--analogy` exercises inductive transfer. problem-solve-local's DEEP mode runs three thought chains (analytical, intuitive, adversarial) and checks convergence.

**What's still missing**: The three chains in DEEP are analytical/intuitive/adversarial — which are reasoning stances, not inference types. The [Theorem-of-Thought](https://aclanthology.org/2025.knowllm-1.10/) framing (abductive + deductive + inductive with convergence check) is a different and more fundamental decomposition. The divergence signal — when all three inference types disagree — is specifically valuable for diagnostic and explanatory problems.

**Revised proposal**: Add `--triad` to think-local as a specialized mode for diagnostic/explanatory problems. This doesn't overlap with DEEP's three-chain approach because it's decomposing by inference type, not reasoning stance.

**Priority**: Medium. Valuable for a specific class of problems (debugging, diagnosis, root cause analysis). Not suite-wide.

### Gap 6: Autonomous Model Selection (SELF-DISCOVER) — STILL OPEN (but reframed)

think-local's mode selection is a static table (problem type → mode). problem-solve-local's R1 FRAME does decision type classification → R2 mode selection, which is a step closer to autonomous selection. But neither does the SELF-DISCOVER SELECT → ADAPT → IMPLEMENT pattern.

**Revised framing**: The [SELF-DISCOVER](https://arxiv.org/abs/2402.03620) evidence (+32% over CoT, 10-40x fewer compute) is compelling, but the suite's mode selection already outperforms static SELF-DISCOVER because it's embedded in a constraint chain system. The real gap is the ADAPT step — rephrasing general reasoning modules for the specific problem. Currently, modes run with generic prompts regardless of problem specifics.

**Revised proposal**: Rather than a new `--discover` flag, enhance the existing mode selection in think-local and deepthink-local with a brief ADAPT step: after selecting modes, generate a one-line task-specific framing for each selected mode before executing.

```
Mode selected: INVERT
Generic: "This failed. What happened?"
Adapted: "This migration to event-driven architecture failed after 3 months. What happened?"
```

This is lighter than a full SELF-DISCOVER pipeline and integrates with existing mode selection rather than replacing it.

**Priority**: Medium. Improves quality of existing mode execution without adding new flags.

### Gap 8: Confidence Calibration — STILL OPEN

challenge-local includes `quality.confidence` and `quality.bias_check` in its operations. problem-solve-local's R4 DECIDE has a `confidence` field. But think-local and deepthink-local don't systematically calibrate confidence in their outputs.

The [Metacognitive Prompting](https://arxiv.org/html/2308.05342v4) evidence (+4.8-6.4% over CoT) and the [Alignment Forum finding](https://www.alignmentforum.org/posts/m5d4sYgHbTxBnFeat/human-like-metacognitive-skills-will-reduce-llm-slop-and-aid) that reasoning models are worse at recognizing unknowns than non-reasoning models make this relevant for the divergent commands (think-local, deepthink-local) where overconfidence in exploratory findings is a real risk.

**Revised proposal**: Add calibrated confidence to the harvest checkpoint across all four commands:

```typescript
keyFindings: [
  { finding: "<finding>", confidence: "high|medium|low|uncertain",
    basis: "verified|reasoned|assumed" }
]
```

Plus a calibration probe in the weakness rotation:

```
Rate your confidence in the top finding from 0-100%. Now imagine 100 questions
where you felt this confident — in how many would you be wrong? If those numbers
don't match, adjust.
```

**Priority**: Medium. Low cost, addresses a known LLM weakness.

---

## Revised Gap: Pre-Reasoning Monitor (Refined)

Given that SHIMMER covers self-observation and FRAME covers decision classification, the remaining value of a pre-reasoning monitor is specifically the **complexity-collapse prevention** signal — detecting when a simple question is about to trigger elaborate multi-mode exploration.

**Revised proposal**: Rather than a full monitor step, add a one-line difficulty gate to think-local's Phase 1 (after ORIENT, before mode selection):

```
DIFFICULTY GATE: Before selecting modes, answer: Is this a simple question
that got dressed up as a complex one? If yes, run ONE mode (the most relevant)
and harvest. Do not expand to 2-3 modes for questions that don't warrant it.
```

This is an instruction-level change, not a new MCP call. It works with the existing self-check's complexity-collapse detection (which catches it post-hoc) to create a pre + post defense.

**Priority**: Medium. Prevents token waste on simple questions. Instruction-level change, essentially free.

---

## New Gap: Cross-Command Routing Intelligence

Now that the suite exists as a system, a new gap becomes visible: **there's no mechanism for one command to suggest that a different command would be more appropriate for the user's problem.**

deepthink-local's help text says "For CONVERGENT decision-making, use /problem-solve-local." But this routing is static (in the help text) rather than dynamic (detected mid-session).

**Proposal**: Add a routing check to think-local's ORIENT phase and deepthink-local's Phase 2:

```
ROUTING CHECK: Based on what I now understand about this problem:
- If the user is asking for a decision → suggest /problem-solve-local
- If the user is asking to attack/validate a proposal → suggest /challenge-local
- If the problem needs depth + pre-mortems → suggest /deepthink-local
- If lightweight exploration is sufficient → continue with /think

If routing suggests a different command, note it in the output:
"This might benefit from /challenge-local — it's a proposal validation question."
Do not auto-redirect; the user chose this command intentionally.
```

**Priority**: Low-medium. Nice UX improvement, but users who know the suite will self-route.

---

## Summary: Revised Prioritized Recommendations

| Priority | Gap | Where it Applies | Complexity | Impact |
|----------|-----|-------------------|-----------|--------|
| **1** | Behavior handbook (cross-session learning) | All 4 commands | Low (Workshop queries) | High — compounding returns over time |
| **2** | Cognitive debiasing (bias-specific) | problem-solve-local R3, challenge-local | Low (extend weakness probes + assumption audit) | High — addresses known LLM weakness, complements existing adversarial mechanisms |
| **3** | Confidence calibration | All 4 commands (harvest) | Low (extend harvest schema) | Medium-high — prevents overconfident exploratory findings |
| **4** | Difficulty gate (complexity-collapse prevention) | think-local | Very low (instruction change) | Medium — prevents token waste on simple questions |
| **5** | Mode adaptation (SELF-DISCOVER lite) | think-local, deepthink-local | Low (1-line adaptation per mode) | Medium — improves existing mode execution quality |
| **6** | Triad inference convergence | think-local | Medium (new flag, 4 calls) | Medium — valuable for diagnostic/explanatory problems |
| **7** | Cross-command routing intelligence | think-local, deepthink-local | Very low (instruction change) | Low-medium — UX improvement |

### Dropped from Original Analysis

| Original Gap | Why Dropped |
|-------------|-------------|
| Dialectical exploration (`--dialectic`) | challenge-local IS this, plus problem-solve-local R3 revision loop |
| Sustained adversarial tension | Distributed across challenge-local (4-6 MCP calls) and deepthink-local --intense |
| Pre-reasoning monitor (full MGV) | SHIMMER + FRAME + difficulty gate (above) cover the valuable parts without adding an MCP call |
| Intra-mode self-correction | Architecturally addressed by inter-mode checkpoints; remaining gap is runtime-level |

---

## Mental Models Still Missing from the Library

These remain valuable additions to think-local's `--model` library regardless of suite context:

| Model | Description | When Valuable |
|-------|-------------|---------------|
| **circle-of-competence** | Map what you know vs. what you're guessing | Before committing to an approach in unfamiliar territory |
| **second-order-effects** | Trace consequences of consequences | Policy decisions, architecture changes |
| **base-rate-neglect** | Check the base rate before reasoning from a specific case | Debugging, architecture decisions |
| **map-territory** | Distinguish your model from the system itself | When analysis feels too clean |
| **reversibility** | One-way door vs. two-way door? | Any decision — determines rigor level |
| **bayesian-update** | State prior, encounter evidence, update proportionally | When new information arrives mid-analysis |
| **regret-minimization** | Which option minimizes future regret across scenarios? | Decisions under uncertainty with long time horizons |

---

## Key Academic Sources

| Paper | Year | Key Contribution | Suite Relevance |
|-------|------|------------------|-----------------|
| [MGV Framework](https://arxiv.org/html/2511.04341v3) | 2025 | Formalizes metacognition for LLMs; Monitor-Generate-Verify | Difficulty gate in think-local |
| [Metacognitive Reuse](https://arxiv.org/abs/2509.13237) | 2025 | Behavior handbook — 46% token reduction, +10% accuracy | Cross-session learning for all commands |
| [SELF-DISCOVER](https://arxiv.org/abs/2402.03620) | 2024 | LLMs self-compose reasoning structures; +32% over CoT | Mode adaptation step |
| [MeMo](https://arxiv.org/html/2402.18252v1) | 2024 | LLMs autonomously select mental models | Mental model library expansion |
| [Metacognitive Prompting](https://arxiv.org/html/2308.05342v4) | 2024 | 5-step introspective process; +4.8-6.4% over CoT | Confidence calibration |
| [Meta-Reasoner](https://arxiv.org/abs/2502.19918) | 2025 | Contextual bandits for reasoning strategy; +9-12% accuracy | Dynamic strategy adaptation |
| [Epistemic Independence Training](https://arxiv.org/html/2602.01528v2) | 2026 | RL for bias robustness; +13.2% accuracy | Cognitive debiasing |
| [Cognitive Debiasing LLMs](https://staff.fnwi.uva.nl/m.derijke/wp-content/papercite-data/pdf/lyu-2025-cognitive-arxiv.pdf) | 2025 | Three-step self-debiasing | Bias audit in decision/challenge commands |
| [Theorem-of-Thought](https://aclanthology.org/2025.knowllm-1.10/) | 2025 | Abductive + deductive + inductive convergence | `--triad` flag |
| [Metacognitive Skills for LLMs](https://www.alignmentforum.org/posts/m5d4sYgHbTxBnFeat/human-like-metacognitive-skills-will-reduce-llm-slop-and-aid) | 2026 | Reasoning models worse at recognizing unknowns | Confidence calibration |
