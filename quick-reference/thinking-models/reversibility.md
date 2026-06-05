---
name: reversibility
title: Reversibility
tags: [decision-making, risk-analysis]
---

# Reversibility

Classify the decision as a one-way door (irreversible) or a two-way door (reversible). Match decision rigor to reversibility -- not to perceived importance.

## When to Use
- Any decision point. This is a meta-tool that determines how much effort other tools deserve.
- Especially valuable when the team is over-deliberating reversible choices or under-deliberating irreversible ones.

## Process

### Step 1: State the Decision
Be concrete about what would change.

### Step 2: Identify Rollback Cost and Time
If this turns out wrong, what does undoing it cost in time, money, reputation, and lost work?

### Step 3: Rate Reversibility
- **Irreversible**: cannot be undone (data loss, public statement, hire/fire, public API removal).
- **Expensive-to-reverse**: undoing is possible but costs weeks/months or significant trust (architecture migration, vendor contract, org structure).
- **Easily reversible**: rollback in minutes/hours with negligible cost (feature flag, internal tool config, A/B test).

### Step 4: Match Rigor to Reversibility
- Irreversible -> maximum caution: pre-mortem, adversarial review, second opinions, slow down.
- Expensive-to-reverse -> structured analysis: trade-off matrix, written rationale, explicit reversal conditions.
- Easily reversible -> bias to action: ship it, learn, iterate. Over-deliberation is the bigger risk here.

### Step 5: State Reversal Conditions
For non-trivial decisions, write the conditions under which you'd reverse. Makes future revisits cheap.

## Key Principle
Two-way doors should be walked through quickly. One-way doors deserve the full weight of analysis. Conflating the two -- treating reversible decisions as irreversible -- is one of the most common forms of organizational paralysis.

## Example Application

**Decision:** Switch the team's project tracker from Linear to Jira.

1. State: migrate active projects + history to Jira.
2. Rollback cost: ~2 weeks of re-migration + lost velocity + team annoyance.
3. Rating: expensive-to-reverse.
4. Rigor: structured analysis -- list trade-offs, talk to 2 teams using Jira, set 60-day evaluation window.
5. Reversal conditions: if NPS drops > 20pts after 60 days OR cycle time increases > 25%, switch back.

**Contrast:** "Should we add a #design Slack channel?" -> easily reversible -> just create it.

## Common Mistakes / Anti-patterns
- Treating every decision as one-way (analysis paralysis)
- Treating irreversible decisions as two-way (rushing public commitments)
- Not writing reversal conditions, then never revisiting
- Confusing "important" with "irreversible" -- they are not the same
