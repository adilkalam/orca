---
name: time-horizon-shifting
title: Time Horizon Shifting
tags: [planning, decision-making]
---

# Time Horizon Shifting

Evaluate decisions across multiple time scales to reveal different priorities.

## When to Use
- Short-term pressure conflicting with long-term goals
- Quick fix vs proper solution decisions
- Technical debt discussions
- Strategic planning

## Process

### Step 1: State the Decision
What are you trying to decide?
- "Should we add this feature using a hack or do it properly?"

### Step 2: Evaluate at Multiple Horizons
For each option, consider impact at:
- **1 week:** Immediate consequences
- **1 month:** Short-term effects
- **1 year:** Medium-term implications
- **5 years:** Long-term outcomes

### Step 3: Identify Reversibility at Each Horizon
- At what point does this become hard to change?
- When do we lock in consequences?
- What's the cost of changing course later?

### Step 4: Notice Where Options Diverge
- At which horizon do the options start to differ significantly?
- This reveals what time scale matters most for this decision

### Step 5: Choose Based on Appropriate Horizon
Match decision importance to time horizon:
- Trivial decision → optimize for 1 week
- Important decision → consider 1 year
- Strategic decision → consider 5 years

## Key Principle
Decisions that seem obvious at one time horizon often look different at another. Shifting horizons reveals hidden costs and benefits.

## Example Application

**Decision:** "Add feature with hardcoded values vs build config system"

**Option A: Hardcoded values**

| Horizon | Outcome |
|---------|---------|
| 1 week | Ship fast, users happy |
| 1 month | Need to change value, requires deploy |
| 1 year | 10 hardcoded values scattered in code, changes are risky |
| 5 years | Major refactor needed, no one knows where values are |

**Option B: Config system**

| Horizon | Outcome |
|---------|---------|
| 1 week | Delayed ship, more complexity |
| 1 month | Easy to adjust values |
| 1 year | All config centralized, changes are safe |
| 5 years | Foundation for feature flags, A/B testing |

**Analysis:**
Options diverge significantly at 1-year horizon. If this feature will be around for years, Option B is clearly better despite 1-week cost.

## Common Mistakes / Anti-patterns
- Always optimizing for immediate (accumulates debt)
- Always optimizing for long-term (never ships)
- Not checking reversibility
- Treating all decisions as equally strategic
