# Improving /think: Mental Models Research & Recommendations

## What /think Already Does Well

The command is unusually sophisticated. It already implements:

- **Constraint chain exploration** with inter-mode obligations (the core ORCA-OS thesis)
- **Priority displacement** over neutral framing (via `--meta` substrate observation)
- **Model-invented vocabulary** over predefined categories (Dadfar-aligned)
- **Content thinning** across multiple rounds (3-question self-check + weakness probe)
- **Verify-or-defer** obligation (no dismiss pattern — prevents raising-then-arguing-away)
- **Complexity-collapse detection** (harvest pre-mortem checks if recommendation outgrew the problem)
- **Candidate reframing** (prevents convergence bias when modes produce conclusions)

The existing mental model library (15 models from `five-whys` to `first-principles`) and the 19+ specialized operations (`--tree`, `--beam`, `--mcts`, `--argue`, `--analogy`, etc.) already cover substantial ground.

This analysis focuses on **gaps the research reveals** — mental models and mechanisms that would meaningfully extend what `/think` can do, not duplicate what exists.

---

## Gap 1: Monitor-Before-Generate (Pre-Reasoning Metacognition)

### The Research

The **Monitor-Generate-Verify (MGV) framework** ([Formalising Metacognitive Theory for Language Model Reasoning](https://arxiv.org/html/2511.04341v3), Nov 2025) formalizes Flavell's metacognitive theory and identifies that current reasoning systems (including CoT, Self-Consistency, Tree-of-Thought) all skip the *monitoring phase* that precedes generation in human cognition.

Key constructs:
- **ME_difficulty** — a pre-generation difficulty assessment that determines *how* to reason before reasoning starts
- **MK_Agent** — self-models of performance patterns, strengths, and limitations
- **MK_Task** — knowledge of task characteristics (familiarity, complexity, demands)
- **Strategy selection as a two-phase process**: interpret difficulty signal → activate corresponding strategy

The paper documents a "prefix dominance trap" where models commit early to suboptimal reasoning paths (20% accuracy loss), which explicit pre-generation monitoring could prevent.

### What /think Currently Does

Phase 0.5a queries Workshop memory and cognition files for prior context. The ORIENT phase (Step 2) identifies what's uncertain. Mode Selection (Step 3) picks 2-3 modes based on problem type.

### The Gap

Mode selection currently maps problem type → mode (e.g., "confused → MAP", "stuck → PERSPECTIVES"). This is a **one-shot static mapping**. There's no:
- Explicit difficulty assessment before starting
- Self-model awareness ("I tend to over-engineer architecture questions" or "I'm weakest on distributed systems causal chains")
- Task characteristic analysis beyond "what is uncertain"

### Concrete Proposal: Pre-Reasoning Monitor Step

Add between ORIENT and Mode Selection:

```typescript
// New: Difficulty + Familiarity Assessment (before mode selection)
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Pre-reasoning assessment...",
    monitor: {
      difficultySignal: "high|medium|low",  // How complex is the reasoning required?
      familiaritySignal: "high|medium|low", // How familiar am I with this domain?
      trapRisk: "prefix_dominance|complexity_collapse|trained_default|none",
      strategyImplication: "<what the difficulty/familiarity combination suggests about mode selection>"
    },
    thoughtNumber: 0,
    totalThoughts: 8,
    nextThoughtNeeded: true
  }
}
```

**Why this matters for /think specifically**: The command already detects complexity-collapse *after* the fact (harvest pre-mortem). A monitor step could catch it *before* it starts — "this is a simple question, I should resist the pull toward elaborate multi-mode exploration."

---

## Gap 2: Metacognitive Reuse (Behavior Handbook)

### The Research

**Metacognitive Reuse** ([Didolkar et al., 2025](https://arxiv.org/abs/2509.13237)) demonstrates that LLMs re-derive the same intermediate reasoning steps across problems, inflating token usage and saturating the context window. Their mechanism converts recurring reasoning fragments into concise, reusable "behaviors" (name + instruction) stored in a "behavior handbook."

Results:
- Up to **46% reduction** in reasoning tokens while matching or improving accuracy
- **10% higher accuracy** than critique-and-revise baseline when the model leverages behaviors from its own past attempts
- The key insight: "turning slow derivations into fast procedural hints enables LLMs to **remember how to reason**, not just what to conclude"

### What /think Currently Does

Workshop entries and cognition session files persist *findings* — what was concluded. The `--import` flag can restore a session. But there's no mechanism for extracting and reusing *reasoning patterns* across sessions.

### The Gap

If a user runs `/think` 50 times on architecture decisions, the command never learns that "for architecture questions, the INVERT mode consistently produces the most useful output" or "causal chains in distributed systems benefit from the MAP → DEEP sequence." Each session starts from scratch on strategy.

### Concrete Proposal: Reasoning Behavior Extraction

After harvest, optionally extract a reasoning behavior:

```bash
# New step after Workshop entry:
# If this session produced a novel reasoning pattern or strategy insight,
# extract it as a reusable behavior

workshop --workspace .claude/memory note \
  "BEHAVIOR: [behavior-name] - [When to apply]. [1-line instruction]. Source: <sessionId>" \
  -t think -behavior
```

Then in Phase 0.5a, query for relevant behaviors:

```bash
workshop --workspace .claude/memory search "BEHAVIOR" --limit 3 2>/dev/null || true
```

If matching behaviors found, include in the pre-reasoning monitor:

```typescript
monitor: {
  // ... existing fields ...
  relevantBehaviors: ["<behavior name>: <instruction>"],
  behaviorApplied: true|false
}
```

This is lightweight — it uses the existing Workshop infrastructure. No new MCP operations needed.

---

## Gap 3: Epistemic Independence / Cognitive Debiasing

### The Research

Two papers converge on the same problem from different angles:

1. **Epistemic Independence Training** ([Training Robust LLM Reasoning via RL](https://arxiv.org/html/2602.01528v2), Feb 2026) — LLMs alter their reasoning when faced with spurious prompt-level cues (consensus claims, authority appeals). Their EIT framework improved adversarial-bias accuracy by +13.2% and generalized to unseen bias types (+39.1% on distraction robustness).

2. **Self-Debiasing** ([Cognitive Debiasing LLMs for Decision-Making](https://staff.fnwi.uva.nl/m.derijke/wp-content/papercite-data/pdf/lyu-2025-cognitive-arxiv.pdf), 2025) — a three-step prompting method: bias determination → bias analysis → cognitive debiasing. Outperforms both advanced prompt engineering and other debiasing techniques.

Key cognitive biases identified in LLM decision-making:
- **Anchoring** (over-relying on first piece of information)
- **Bandwagon** (consensus = correct)
- **Authority** (source prestige overrides evidence quality)
- **Framing** (presentation affects conclusion)
- **Sunk cost** (prior investment biases continuation)

### What /think Currently Does

The `--challenge` modifier generates adversarial critique *after* primary analysis. The 3-question self-check asks "What am I avoiding?" and "What would a skeptic challenge?" The `--meta` substrate observation catches trained reflexes (DEFLECTION, SYCOPHANCY, REGISTER_SHIFT, etc.).

### The Gap

The existing debiasing is post-hoc (catch reflexes after they've shaped the output) or generic (adversarial critique of conclusions). There's no **bias-specific** debiasing that names the *type* of cognitive distortion operating and corrects for it.

### Concrete Proposal: Bias Audit as Weakness Probe Extension

Extend the weakness probe rotation (currently 6 probes) with bias-specific probes:

```
7. What cognitive bias is most likely distorting this analysis? (anchoring, framing,
   authority, sunk cost, availability, confirmation). Name it and state how it might
   be pulling the conclusion.
8. If the problem framing were inverted (the opposite phrasing), would you reach the
   same conclusion? If not, you have a framing effect.
9. Which piece of information arrived first in your context, and how much weight are
   you giving it relative to later information? (anchoring check)
```

Additionally, for `--decide` mode specifically, add an explicit debiasing pass:

```typescript
// After the decide operation, before presenting:
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Cognitive debiasing pass on the decision...",
    biasAudit: {
      biasesChecked: ["anchoring", "framing", "sunk_cost", "authority", "bandwagon"],
      biasesDetected: [
        { bias: "<type>", evidence: "<how it's showing up>", correction: "<adjusted reasoning>" }
      ],
      decisionStable: true|false  // Does the decision survive debiasing?
    },
    thoughtNumber: N,
    totalThoughts: N,
    nextThoughtNeeded: false
  }
}
```

---

## Gap 4: Abductive Reasoning (Missing Inference Mode)

### The Research

**Theorem-of-Thought (ToTh)** ([ACL 2025](https://aclanthology.org/2025.knowllm-1.10/)) demonstrates that modeling reasoning as collaboration among three parallel agents — **abductive**, **deductive**, and **inductive** — with Bayesian belief propagation across their reasoning graphs, consistently outperforms CoT, Self-Consistency, and CoT-Decoding.

The key insight: most LLM reasoning frameworks only exercise **deductive** reasoning (given premises, derive conclusions). They neglect:
- **Abductive reasoning** — inference to the best explanation. Given observations, what's the most plausible hypothesis? (This is what doctors, detectives, and debuggers actually do.)
- **Inductive reasoning** — pattern generalization. Given examples, what's the rule?

### What /think Currently Does

`--debug` is inherently abductive (symptom → cause). `--analogy` exercises inductive pattern transfer. But there's no explicit mode that runs all three inference types in parallel and reconciles them.

### The Gap

For complex diagnostic or explanatory problems, running deductive + abductive + inductive in parallel and checking for convergence/divergence would catch more than any single mode.

### Concrete Proposal: --triad Flag (Three-Inference Convergence)

```
--triad    Three-inference convergence (abductive + deductive + inductive)
```

Implementation: three `thought` calls, each framed with a different inference mode, then a synthesis call that checks convergence:

```typescript
// Call 1: Abductive (best explanation)
{ thought: "Given these observations, what's the most plausible explanation? ..." }

// Call 2: Deductive (logical derivation)
{ thought: "Given what we know as premises, what necessarily follows? ..." }

// Call 3: Inductive (pattern generalization)
{ thought: "What pattern do the examples/evidence suggest? ..." }

// Call 4: Convergence check
{
  thought: "Convergence analysis...",
  triadConvergence: {
    abductiveConclusion: "<best explanation>",
    deductiveConclusion: "<derived conclusion>",
    inductiveConclusion: "<generalized pattern>",
    convergence: "full|partial|divergent",
    divergenceSignal: "<where they disagree and what that means>"
  }
}
```

**Divergence is the signal.** When all three modes agree, confidence is high. When they diverge, the divergence points are exactly where more investigation is needed.

---

## Gap 5: Dialectical Prompting (Sustained Adversarial Tension)

### The Research

[The Dialectical Machine](https://bionicwriter.com/p/dialectical-machine-prompts-think-against-yourself) (Jan 2026) argues that the default LLM interaction pattern is validation — "they give flimsy ideas the appearance of rigor." The framework proposes four modes of adversarial engagement:

1. **Assumption Excavation** — surface every assumption, test each one
2. **Steelman Opposition** — construct the strongest possible counter-argument
3. **Perspective Multiplication** — argue from positions you don't hold
4. **Consequence Tracing** — follow implications to uncomfortable endpoints

The key principle: "Don't stop at the first response... Go five, ten, twenty exchanges deep."

The [HuggingFace discussion on Multi-Dimensional Reasoning](https://discuss.huggingface.co/t/make-your-llm-think-differently-multi-dimensional-reasoning-prompts/159175) introduces "Productive Dissonance" — deliberately creating internal conflict within the LLM's reasoning processes, then resolving it. The insight: "The system doesn't aim to converge toward a single resolution, but to maintain a dynamic equilibrium between poles."

### What /think Currently Does

`--challenge` runs adversarial critique after primary analysis. `--argue` does structured argumentation. The PERSPECTIVES mode in constraint chains does collaborative reasoning + steelman. The candidate reframing mechanism prevents convergence bias.

### The Gap

Current adversarial engagement is **single-pass** — one challenge after the primary analysis. Research shows the value emerges from *sustained* dialectical tension across multiple exchanges. The `/meta` command achieves this with 3 constraint-chained rounds, but the adversarial/dialectical path doesn't have the same sustained structure.

### Concrete Proposal: --dialectic Flag (Sustained Opposition)

```
--dialectic    Sustained dialectical exploration (thesis → antithesis → synthesis → stress test)
```

Four-call sequence:

```typescript
// Round 1: Thesis (strongest case for the position)
{ operation: "thought", content: { thought: "Build the strongest possible case for [position]..." } }

// Round 2: Antithesis (constrained by Round 1 — must address specific claims, not generalities)
{ operation: "thought", content: {
  thought: "Now construct the strongest counter-argument. You must address each specific claim from Round 1...",
  dialecticConstraint: "Must respond to Round 1's three strongest points by name"
} }

// Round 3: Synthesis (what survives both rounds?)
{ operation: "thought", content: {
  thought: "What position survives both the thesis and antithesis? This is not a compromise — it's what remains when both sides' strongest arguments have been heard...",
  dialecticConstraint: "Must name what was abandoned from each side and why"
} }

// Round 4: Stress test (try to break the synthesis)
{ operation: "thought", content: {
  thought: "Attempt to break the synthesis from Round 3. What scenario, edge case, or assumption failure would make it collapse?",
  dialecticConstraint: "Must find at least one genuine vulnerability or state why none exists"
} }
```

This differs from `--challenge` because:
- It's **four rounds**, not one
- Each round is **constrained by the previous** (ORCA-OS constraint chain principle)
- The synthesis must explicitly **name what was abandoned** (not a vague compromise)
- The stress test attempts to **break** the synthesis, not just critique it

---

## Gap 6: MeMo-Style Autonomous Model Selection

### The Research

**MeMo (Mental Models)** ([Zhou et al., 2024](https://arxiv.org/html/2402.18252v1)) and **SELF-DISCOVER** ([Zhou et al., NeurIPS 2024](https://arxiv.org/abs/2402.03620)) both demonstrate that LLMs can autonomously select appropriate reasoning strategies when given a definition + examples, outperforming human-selected strategies.

SELF-DISCOVER's key result: **up to 32% improvement over CoT** with **10-40x fewer inference compute** via SELECT → ADAPT → IMPLEMENT:
1. SELECT: Choose relevant reasoning modules from a library
2. ADAPT: Rephrase selected modules to fit the specific task
3. IMPLEMENT: Compose into a step-by-step reasoning plan

MeMo showed that LLMs selecting their own mental models outperformed task-specific baselines across STEM, logical reasoning, and commonsense reasoning without any per-task customization.

### What /think Currently Does

Mode selection in Step 3 is a **table lookup** (problem type → mode). The `--model` flag requires the user to specify which mental model to use. There's no mechanism for the model to autonomously select and compose multiple mental models.

### The Gap

The mode selection table is static and maps to broad categories (MAP, INVERT, PERSPECTIVES, etc.). The SELF-DISCOVER evidence shows that letting the LLM select *and adapt* reasoning modules per-task significantly outperforms static mapping.

### Concrete Proposal: --discover Flag (Autonomous Strategy Composition)

```
--discover    Self-discover reasoning structure (SELECT → ADAPT → IMPLEMENT)
```

```typescript
// Step 1: SELECT — Given the full mental model library, which are relevant?
{
  operation: "thought",
  content: {
    thought: "Analyzing the problem to select relevant reasoning modules...",
    select: {
      problem: "<problem statement>",
      candidateModels: ["five-whys", "inversion", "first-principles", "steelmanning",
        "abstraction-laddering", "decomposition", "pre-mortem", "constraint-relaxation",
        "time-horizon-shifting", "assumption-surfacing"],
      selected: ["<model 1>", "<model 2>", "<model 3>"],
      selectionRationale: "<why these models fit this specific problem>"
    }
  }
}

// Step 2: ADAPT — Rephrase selected models for this specific problem
{
  operation: "thought",
  content: {
    thought: "Adapting selected models to the specific problem...",
    adapt: {
      adaptations: [
        { model: "<model 1>", originalFrame: "<general description>",
          adaptedFrame: "<how it applies to THIS problem specifically>" },
        // ...
      ]
    }
  }
}

// Step 3: IMPLEMENT — Compose into a unified reasoning plan and execute
{
  operation: "thought",
  content: {
    thought: "Executing the composed reasoning plan...",
    implement: {
      plan: ["<step 1 using adapted model 1>", "<step 2 using adapted model 2>", ...],
      result: "<conclusion from the composed reasoning>"
    }
  }
}
```

---

## Gap 7: Thinking Intervention (Mid-Reasoning Correction)

### The Research

**Thinking Intervention** ([arXiv 2503.24370](https://arxiv.org/html/2503.24370v3), Mar 2025) proposes inserting or revising reasoning tokens mid-generation rather than only controlling input prompts. Results:
- **+6.7% accuracy** on instruction-following over vanilla prompting
- **+15.4%** on instruction hierarchy reasoning
- **+40.0%** increase in refusal rates for unsafe prompts

The key insight: prompt engineering operates on inputs, but reasoning models expose intermediate steps that can be *intervened on during generation*. First-person narrative interventions ("I should ensure...") outperform third-person reminders ("Ensure the answer...").

### What /think Currently Does

The self-check + weakness probe operates *between* modes. The constraint checkpoint reads gate status and potentially routes to another mode. But within a single mode execution, there's no mid-reasoning correction mechanism.

### What This Could Mean for /think

This is less about adding a flag and more about evolving how constraint checkpoints work. Currently, checkpoints happen **between** modes. The research suggests value in **intra-mode** self-correction — a mechanism where, mid-thought, the model notices it's drifting and corrects.

This may be more relevant for cognition-mcp's architecture than for /think's command structure, but it could manifest as a principle in the command instructions:

```
INTRA-MODE SELF-CORRECTION: During any mode execution, if you notice your reasoning
drifting toward a trained default or away from the constraint obligations, pause and
insert a first-person correction ("I notice I'm drifting toward [pattern]. Let me
return to [obligation]."). Do not wait for the self-check to catch this.
```

---

## Gap 8: Confidence Calibration

### The Research

**Metacognitive Prompting (MP)** ([Wang & Zhao, 2024](https://arxiv.org/html/2308.05342v4)) adds a five-step process where the final step is explicit confidence gauging (0-100% with explanation). Results: consistent improvements across 10 NLU datasets, outperforming CoT by +4.8-6.4% and PS by +2.8-4.1%.

**Meta-Reasoner** ([Sui et al., 2025](https://arxiv.org/abs/2502.19918)) uses contextual multi-armed bandits to dynamically evaluate reasoning progress and decide whether to backtrack, switch approaches, or continue. Results: +9-12% accuracy with 28-35% less inference time.

The [Alignment Forum post on metacognitive skills](https://www.alignmentforum.org/posts/m5d4sYgHbTxBnFeat/human-like-metacognitive-skills-will-reduce-llm-slop-and-aid) (Feb 2026) specifically calls out **AbstentionBench** findings that reasoning models are *worse* at recognizing when they don't know something than non-reasoning models.

### What /think Currently Does

The `effectiveness` field in `--meta` (0-1 rating) and `confidence` in `--stats` and `--mcts` capture some calibration. But there's no systematic confidence assessment across all modes.

### The Gap

Most modes produce conclusions without explicit confidence calibration. The harvest summary doesn't distinguish between "high-confidence finding" and "plausible but uncertain finding."

### Concrete Proposal: Calibrated Confidence in Harvest

Add to the harvest checkpoint:

```typescript
keyFindings: [
  { finding: "<finding 1>", confidence: "high|medium|low|uncertain",
    basis: "<what the confidence is based on — verified, reasoned, assumed>" },
  // ...
],
```

And add a **calibration check** to the weakness probe rotation:

```
10. Rate your confidence in the top finding from 0-100%. Now imagine 100 questions
    where you felt this confident — in how many would you be wrong? If those numbers
    don't match, adjust.
```

---

## Summary: Prioritized Recommendations

| Priority | Gap | Proposal | Complexity | Impact |
|----------|-----|----------|-----------|--------|
| **1** | Pre-reasoning monitor | Add difficulty/familiarity assessment before mode selection | Low (1 new thought call) | High — prevents prefix dominance and complexity-collapse earlier |
| **2** | Cognitive debiasing | Extend weakness probes with bias-specific checks; add bias audit to `--decide` | Low (extend existing rotation) | High — addresses a known LLM weakness directly |
| **3** | Dialectical exploration | `--dialectic` flag for 4-round sustained opposition | Medium (new flag, 4 calls) | High — fills gap between single-pass `--challenge` and `--meta` depth |
| **4** | Abductive/triad reasoning | `--triad` for three-inference convergence | Medium (new flag, 4 calls) | Medium-high — valuable for diagnostic/explanatory problems |
| **5** | Confidence calibration | Calibrated findings in harvest; calibration probe | Low (extend harvest schema) | Medium — addresses overconfidence systematically |
| **6** | Autonomous model selection | `--discover` for SELF-DISCOVER-style strategy composition | Medium (new flag, 3 calls) | Medium — research shows big gains but may overlap with existing mode selection |
| **7** | Behavior handbook | Extract reasoning patterns after harvest; query before mode selection | Low (Workshop queries) | Medium — grows more valuable over time with usage |
| **8** | Intra-mode self-correction | Principle in command instructions for mid-reasoning correction | Very low (instruction change) | Low-medium — depends on model compliance |

---

## Mental Models Not Yet in the Library

Based on the research, these models from the [MeMo](https://arxiv.org/html/2402.18252v1) and [Munger](https://www.reddit.com/r/PromptEngineering/comments/1pfn3jv/i_converted_charlie_mungers_mental_models_into_ai/) traditions are missing from the current 15 and have demonstrated value in LLM reasoning contexts:

| Model | Description | When Valuable |
|-------|-------------|---------------|
| **circle-of-competence** | Map what you know vs. what you're guessing; find the boundary | Before committing to an approach in unfamiliar territory |
| **second-order-effects** | Trace consequences of consequences (not just direct effects) | Policy decisions, architecture changes, process changes |
| **base-rate-neglect** | Check the base rate before reasoning from a specific case | Debugging (most bugs are in code, not compiler), architecture decisions |
| **map-territory** | Distinguish your model of the system from the system itself | When analysis feels too clean or complete |
| **reversibility** | Is this decision reversible? One-way door vs. two-way door? | Any decision point — determines how much rigor is warranted |
| **bayesian-update** | State prior belief, encounter evidence, update proportionally | When new information arrives mid-analysis |
| **red-team** | Actively try to break your own proposal from an adversary's perspective | Security, reliability, anything user-facing |
| **regret-minimization** | Which option minimizes future regret across scenarios? | Decisions under uncertainty with long time horizons |

---

## Key Academic Sources

| Paper | Year | Key Contribution | Relevance to /think |
|-------|------|------------------|---------------------------|
| [MGV Framework](https://arxiv.org/html/2511.04341v3) | 2025 | Formalizes Flavell/Nelson-Narens metacognition for LLMs; Monitor-Generate-Verify | Pre-reasoning monitor step |
| [Metacognitive Reuse](https://arxiv.org/abs/2509.13237) | 2025 | Behavior handbook — 46% token reduction, +10% accuracy from reusing reasoning patterns | Behavior extraction after harvest |
| [SELF-DISCOVER](https://arxiv.org/abs/2402.03620) | 2024 | LLMs self-compose reasoning structures; +32% over CoT, 10-40x fewer compute | Autonomous model selection |
| [MeMo (Mental Models)](https://arxiv.org/html/2402.18252v1) | 2024 | LLMs autonomously select mental models; matches/beats task-specific prompting | Mental model library expansion |
| [Metacognitive Prompting](https://arxiv.org/html/2308.05342v4) | 2024 | 5-step introspective process; +4.8-6.4% over CoT across 10 NLU datasets | Confidence calibration step |
| [Meta-Reasoner](https://arxiv.org/abs/2502.19918) | 2025 | "Think about how to think" via contextual bandits; +9-12% accuracy, -28-35% time | Dynamic strategy adaptation |
| [MetaCrit](https://www.semanticscholar.org/paper/63493a761908d01586d62364e39ad5cbc5e96686) | 2025 | Nelson-Narens regulation as multi-agent: object-level, monitor, control, synthesizer | Multi-agent decomposition of reasoning |
| [Epistemic Independence Training](https://arxiv.org/html/2602.01528v2) | 2026 | RL for bias robustness; +13.2% accuracy, generalizes to unseen bias types | Cognitive debiasing approach |
| [Cognitive Debiasing LLMs](https://staff.fnwi.uva.nl/m.derijke/wp-content/papercite-data/pdf/lyu-2025-cognitive-arxiv.pdf) | 2025 | Three-step self-debiasing: determine → analyze → debias | Bias audit in decision modes |
| [Theorem-of-Thought](https://aclanthology.org/2025.knowllm-1.10/) | 2025 | Abductive + deductive + inductive with Bayesian propagation | Three-inference convergence |
| [Thinking Intervention](https://arxiv.org/html/2503.24370v3) | 2025 | Mid-reasoning token intervention; +6.7% instruction following | Intra-mode self-correction |
| [Metacognitive Skills for LLMs](https://www.alignmentforum.org/posts/m5d4sYgHbTxBnFeat/human-like-metacognitive-skills-will-reduce-llm-slop-and-aid) | 2026 | Metacognition as "dark matter of intelligence"; LLMs worse at recognizing unknowns | Confidence calibration, abstention |
| [Dialectical Machine](https://bionicwriter.com/p/dialectical-machine-prompts-think-against-yourself) | 2026 | Sustained adversarial dialogue > single-pass critique | Dialectic flag design |
| [Cognitive Upgrade Framework](https://www.petervanhees.com/chain-of-thought-prompting-is-dead-cognitive-upgrade-framework/) | 2025 | CoT now delivers 2.9% accuracy on reasoning models; need native reasoning scaffolding | Validates that /think's approach (constraint chains > CoT) is directionally correct |
