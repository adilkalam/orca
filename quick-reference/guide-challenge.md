# /challenge Quick Reference

**Command:** `/challenge [--quick|--deep] <proposal>`
**Purpose:** Adversarial analysis - stress-test proposals before implementation
**MCP:** cognition-mcp (accept-store-echo pattern)

---

## Quick Start

```bash
/challenge Use microservices for the new service
/challenge --quick Add caching layer
/challenge --deep Migrate database to PostgreSQL
```

---

## Three Modes

| Mode | Operations | Use When |
|------|------------|----------|
| `--quick` | causal_analysis only | Quick gut check |
| (default) | causal_analysis + structured_argumentation + decide | Standard analysis |
| `--deep` | All above + simulation + ethical_analysis | Critical decisions |

---

## Cognition MCP Operations Used

| Operation | Purpose |
|-----------|---------|
| `causal_analysis` | Map failure causes, effects, and causal chains |
| `structured_argumentation` | Build counter-arguments with evidence |
| `simulation` | (deep) Run failure scenario step-by-step |
| `ethical_analysis` | (deep) Stakeholder impact analysis |
| `decide` | Final GO/NO GO verdict |

---

## Output Examples

### Quick Mode Output

```markdown
## Quick Adversarial Analysis: Add Redis Caching

**Session:** a1b2c3d4-e5f6-...

### Pre-mortem Causal Analysis
> "This failed. Here's the causal map of why:"

**Root Causes:**
| Factor | Type | Strength | Evidence |
|--------|------|----------|----------|
| Cache invalidation complexity | root | H | Multi-source writes make invalidation logic error-prone |
| No fallback on Redis failure | root | H | Single point of failure, no circuit breaker |
| Memory exhaustion under load | contributing | M | Unbounded cache growth without eviction policy |

**Cascade Effects:**
| Outcome | Likelihood | Timeframe |
|---------|------------|-----------|
| Stale data shown to users | H | 1-2 weeks |
| Complete outage during Redis restart | H | 1 month |
| Memory costs exceed budget | M | 3 months |

**Critical Causal Chain:**
Cache key collision -> Corrupted session data -> User complaints -> Emergency rollback (P: 60%)

**Quick Mitigations:**
1. Implement cache-aside pattern with fallback to DB
2. Add TTL and eviction policies from day 1
3. Circuit breaker for Redis failures

**Quick Verdict:** Proceed with caution

*Analysis persisted to session. Run `/challenge --deep` for full analysis.*
```

### Default Mode Output

```markdown
## Adversarial Analysis: Use Microservices

**Session:** b2c3d4e5-f6a7-... | **Entries:** 3 | **Duration:** 1200ms

---

### Phase 1: Causal Failure Analysis

**Phenomenon:** Failure of microservices architecture

**Root Causes:**
| Factor | Type | Strength | Evidence |
|--------|------|----------|----------|
| Team size vs complexity mismatch | root | H | 5-person team managing 12 services |
| Distributed debugging impossible | root | H | No distributed tracing, logs scattered |
| Network latency multiplication | contributing | M | Service A -> B -> C adds 50ms each hop |

**Cascade Effects:**
| Outcome | Likelihood | Timeframe |
|---------|------------|-----------|
| Response time degradation | H | 2 weeks |
| Deployment coordination failures | H | 1 month |
| Team burnout from operational load | M | 3 months |

**Critical Causal Chains:**
1. Partial deployment -> Version mismatch -> Data corruption -> Rollback (P: 70%)
2. Service failure -> Cascading timeout -> Full outage -> Lost revenue (P: 50%)

**Interventions Identified:**
- Start with max 3 services
- Distributed tracing from day 1
- Circuit breakers mandatory

---

### Phase 2: Structured Counter-Arguments

**Claim:** This proposal should NOT be implemented because...

**Premises:**
1. Team lacks operational maturity for microservices
2. Domain boundaries aren't well understood yet
3. Debugging distributed systems requires tooling we don't have

**Evidence:**
| Point | Source | Strength |
|-------|--------|----------|
| "Microservices are for teams of 50+" | Industry consensus | strong |
| Domain-driven design requires stable domain knowledge | Fowler, Evans | strong |
| Mean time to recovery increases 3x with distributed systems | Google SRE book | moderate |

**Steel-Man & Rebuttal:**
> "A proponent would argue: Microservices enable independent scaling"
> *Rebuttal:* We don't have scaling problems yet. Premature optimization.

> "A proponent would argue: Teams can work independently"
> *Rebuttal:* With 5 people, coordination overhead exceeds independence benefits.

**Argumentation Conclusion:**
The operational and cognitive costs outweigh the theoretical benefits at our current scale.

---

### Phase 3: Final Decision

**Statement:** Should we proceed with microservices architecture?

**Options Evaluated:**
| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| GO | Full microservices | Scalability, independence | Complexity, ops burden |
| CONDITIONAL GO | 2-3 services max | Limited benefits, manageable complexity | Partial gains |
| NO GO | Stay monolithic | Simplicity, team fit | Future scaling concerns |

**Decision Criteria:**
1. Team operational capacity (weight: high)
2. Current scaling needs (weight: medium)
3. Reversibility of decision (weight: medium)

---

### Verdict

**Decision:** CONDITIONAL GO
**Confidence:** 0.75 (0-1 scale)
**Bias Check:** May be biased toward monolith due to recent failure stories. Microservices do work at scale.

**Required Mitigations:**
1. Maximum 3 services initially
2. Distributed tracing mandatory (Jaeger/Zipkin)
3. Circuit breakers on all service calls

**Session Export:** Analysis persisted to ~/.orca-cognition/
```

---

## When to Use Each Mode

| Situation | Mode | Why |
|-----------|------|-----|
| "Should we try X?" brainstorm | `--quick` | Fast causal analysis |
| Architecture decision | default | Need argumentation + verdict |
| Tech stack choice | default | All phases relevant |
| Database migration | `--deep` | Irreversible, run simulation |
| Security-sensitive change | `--deep` | Ethical analysis matters |
| Time pressure | `--quick` | Something > nothing |

---

## Verdict Meanings

| Verdict | Meaning | Action |
|---------|---------|--------|
| **GO** | Weaknesses are minor/manageable | Proceed with normal diligence |
| **CONDITIONAL GO** | Significant weaknesses exist | Address mitigations first |
| **NO GO** | Critical weaknesses identified | Reconsider approach |

---

## Session Persistence

All /challenge analyses are persisted:

```
~/.orca-cognition/exports/<session-id>.json
```

Retrieve later with:
```bash
cat ~/.orca-cognition/exports/<session-id>.json | jq
```

---

## Related Tools: Choosing the Right One

`/challenge` is one of several adversarial thinking tools. Here's when to use each:

### Comparison

| Tool | Operations | Output | Use When |
|------|------------|--------|----------|
| `--model inversion` | 1 | Failure modes list | Quick "how could this fail?" |
| `--model pre-mortem` | 1 | Imagined causes | "It failed. Why?" framing |
| `--challenge` modifier | 0 (inline) | Critique section | Add critique to any analysis |
| `/challenge --quick` | 1 | Causal map + quick verdict | Time-boxed risk check |
| `/challenge` | 3 | Full verdict | Standard proposal stress-test |
| `/challenge --deep` | 5 | Verdict + simulation + ethics | High-stakes decisions |

### Depth Spectrum

```
Quick risk brainstorm ◄──────────────────────────────► Full adversarial analysis

--model inversion    /challenge --quick    /challenge    /challenge --deep
     │                      │                   │                │
  1 operation            1 operation        3 operations    5 operations
  Failure modes          Causal map         + Arguments     + Simulation
     only                + verdict          + Verdict       + Ethics
```

### Decision Tree

```
Need to find failure modes?
├─► Quick brainstorm → /think --model inversion "How could X fail?"
├─► Imagined past failure → /think --model pre-mortem "X failed. Why?"
└─► Full stress test → /challenge "X"

Adding critique to existing analysis?
└─► /think --decide --challenge "X vs Y"

Time pressure?
└─► /challenge --quick "X"

High stakes / irreversible?
└─► /challenge --deep "X"
```

### Examples

```bash
# Quick failure brainstorm (1 operation)
/think --model inversion "How could this caching layer fail?"

# Pre-mortem framing (1 operation)
/think --model pre-mortem "The cache migration failed. What went wrong?"

# Add critique to a decision (inline, no MCP call)
/think --decide --challenge "Redis vs Memcached"

# Quick adversarial check (1 operation + verdict)
/challenge --quick "Add Redis caching"

# Full adversarial analysis (3 operations)
/challenge "Migrate to microservices"

# Deep analysis with simulation (5 operations)
/challenge --deep "Replace PostgreSQL with MongoDB"
```

---

## Integration with Other Tools

### Before /challenge
- `/contemplate <proposal>` - Get reasoning strategy recommendation first

### After /challenge
- `/plan` - If GO/CONDITIONAL GO, plan the implementation
- `/think --model second-order` - Explore consequences of consequences
- `/think --ulysses` - Create pre-commitments for the chosen path

---

## Key Features of cognition-mcp

| Aspect | Description |
|--------|-------------|
| Pattern | Accept-Store-Echo (structured notepad) |
| Persistence | Saved to ~/.orca-cognition/ |
| Operations | Multiple operations, each persisted |
| Audit Trail | Exportable session with entries |
| Bias Tracking | Explicit `bias_check` field |
| Confidence | Explicit numeric score |

---

_Version: OS 5.1_
_Updated: 2025-12-24_
