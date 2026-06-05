---
name: second-order-effects
title: Second-Order Effects
tags: [planning, decision-making, risk-analysis]
---

# Second-Order Effects

Trace consequences of consequences, not just direct effects. First-order thinking stops at "what happens." Second-order thinking asks "and then what?"

## When to Use
- Policy decisions (rules create incentives that create behaviors)
- Architecture changes (new component changes how others are used)
- Process changes (workflow changes change team dynamics)
- Anything with feedback loops or human responses

## Process

### Step 1: List First-Order Effects
What does this decision directly cause? Be concrete.
- "Add rate limit" -> first-order: requests above N/sec are rejected.

### Step 2: For Each First-Order Effect, List Second-Order Effects
What do those direct effects, in turn, cause?
- "Requests rejected" -> second-order: clients implement retry-with-backoff -> traffic spikes after outages -> thundering herd.

### Step 3: Check for Feedback Loops
Does any second-order effect amplify or dampen the first-order effect?
- Rate limit triggers retries triggers more rate-limit hits. Reinforcing loop.

### Step 4: Identify Contradictions
Which second-order effects contradict the original goal?
- Goal: protect the service. Second-order: thundering herd makes outages worse.

### Step 5: Decide
Adjust the decision to account for second-order effects, or accept them explicitly.

## Key Principle
Most bad decisions are first-order-correct and second-order-disastrous. The discipline is to keep asking "and then what?" at least one level past where intuition stops.

## Example Application

**Decision:** Pay engineers a bonus per bug fixed.

1. First-order: more bugs get fixed.
2. Second-order: engineers introduce bugs to fix later; bug count rises; quality declines.
3. Feedback loop: more bugs -> more bonus -> more incentive to introduce bugs.
4. Contradiction: goal was fewer defects; outcome is more defects.

**Adjusted decision:** Reward defect-prevention metrics (escaped defects per release), not fix volume.

## Common Mistakes / Anti-patterns
- Stopping at first-order ("the rule will work because the rule says so")
- Ignoring human responses (people optimize for whatever is measured)
- Failing to check feedback loops
- Treating "unintended" consequences as unforeseeable when they were predictable
