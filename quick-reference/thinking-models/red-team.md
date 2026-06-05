---
name: red-team
title: Red Team
tags: [risk-analysis, validation]
---

# Red Team

Actively try to break the proposal from an adversary's perspective. Not "what could go wrong" (pre-mortem) but "how would I, as an attacker or hostile user, defeat this?"

## When to Use
- Security-relevant decisions
- Reliability-critical systems (load, partial failure, abuse)
- User-facing features where misuse is plausible
- Public commitments where competitors may exploit weaknesses

## Process

### Step 1: Identify the Adversary
Who would attack this and why? Be specific. Adversaries can be:
- Malicious user (wants unauthorized access, data, or disruption)
- Careless user (wants their goal, ignores safety rails)
- Competitor (wants to embarrass or out-execute)
- Nature / load (random failures, traffic spikes, hardware faults)

### Step 2: Enumerate Attack Vectors
For each adversary, list concrete attack paths. Be hostile and creative.
- Input you didn't validate
- State transitions you didn't enumerate
- Trust boundaries you assumed wouldn't be crossed
- Rate / volume assumptions
- Race conditions

### Step 3: Rank by Likelihood x Impact
Not all attacks deserve mitigation. Triage:
- High likelihood + high impact -> must mitigate
- High likelihood + low impact -> mitigate cheaply
- Low likelihood + high impact -> document, monitor, plan response
- Low likelihood + low impact -> accept

### Step 4: Propose Mitigations or Accept Residual Risk
For each prioritized attack, either propose a concrete mitigation or explicitly accept the residual risk in writing. Silent acceptance is the bug.

### Step 5: Verify the Mitigations
Mitigations are themselves attack surfaces. Red-team them too.

## Key Principle
Red-teaming is adversarial, not pessimistic. Pre-mortem imagines failure. Red team causes failure. The output is a list of attacks you have either closed or knowingly accepted -- never attacks you forgot to consider.

## Example Application

**Proposal:** Public API endpoint `/api/export` returns user's data as CSV.

1. Adversaries: malicious authenticated user, careless integrator, competitor scraping.
2. Attack vectors:
   - Authenticated user exports another user's data via parameter manipulation
   - Integrator pulls full export every minute -> bandwidth abuse
   - CSV injection (formula in cell) when opened in Excel
   - Timing attack reveals existence of accounts
3. Rank:
   - Cross-tenant access: high/high -> must mitigate (enforce ownership check server-side)
   - Bandwidth abuse: high/medium -> rate limit + caching
   - CSV injection: medium/medium -> sanitize cells
   - Timing: low/low -> accept, document
4. Mitigations written into spec.

## Common Mistakes / Anti-patterns
- Pulling punches ("our users wouldn't do that")
- Stopping at the first attack class found
- Treating mitigations as attack-free
- Conflating with pre-mortem (pre-mortem is failure-imagination, red team is adversarial-causation)
- Not writing accepted risks down
