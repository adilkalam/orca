---
name: impact-effort-grid
title: Impact/Effort Grid
tags: [prioritization]
---

# Impact/Effort Grid

Prioritize by plotting options on impact versus effort axes.

## When to Use
- Have a backlog of options to prioritize
- Need quick visual prioritization
- Communicating priorities to stakeholders
- Sprint or roadmap planning

## Process

### Step 1: List All Options
Gather everything that needs prioritization.
- Features, bugs, tech debt items, experiments

### Step 2: Define Impact
What does "impact" mean for this context?
- User value
- Revenue potential
- Risk reduction
- Strategic importance
- Learning value

### Step 3: Define Effort
What does "effort" mean for this context?
- Development time
- Complexity
- Dependencies
- Risk/uncertainty
- Coordination required

### Step 4: Estimate Each Option
For each item, rate:
- Impact: High / Medium / Low
- Effort: High / Medium / Low

Use relative comparison, not absolute measures.

### Step 5: Plot on Grid

```
          HIGH IMPACT
               │
    Quick      │      Big
    Wins       │      Bets
               │
LOW ───────────┼─────────── HIGH
EFFORT         │           EFFORT
               │
    Fill       │      Money
    Ins        │      Pits
               │
          LOW IMPACT
```

### Step 6: Prioritize by Quadrant

1. **Quick Wins** (High impact, Low effort) - Do first
2. **Big Bets** (High impact, High effort) - Plan carefully, do strategically
3. **Fill Ins** (Low impact, Low effort) - Do when convenient
4. **Money Pits** (Low impact, High effort) - Avoid or reconsider

## Key Principle
Don't just compare impact alone. A huge-impact feature that takes 6 months may be worse than a medium-impact feature that takes 2 days.

## Example Application

**Context:** Prioritizing next sprint

**Items:**
1. Fix login bug affecting 10% of users
2. Build new dashboard
3. Update dependencies
4. Add export to PDF feature
5. Refactor auth module
6. Fix typo in footer

**Assessment:**

| Item | Impact | Effort | Quadrant |
|------|--------|--------|----------|
| Login bug fix | High | Low | Quick Win |
| New dashboard | High | High | Big Bet |
| Update deps | Medium | Low | Fill In |
| PDF export | Medium | Medium | Fill In |
| Refactor auth | Low | High | Money Pit |
| Fix typo | Low | Low | Fill In |

**Priority order:**
1. Login bug fix (Quick Win - do now)
2. New dashboard (Big Bet - plan and schedule)
3. Update deps, Fix typo (Fill In - spare time)
4. PDF export (Fill In - if time permits)
5. Refactor auth (Money Pit - defer or cut scope)

## Common Mistakes / Anti-patterns
- Plotting everything as High Impact
- Not considering dependencies between items
- Using absolute instead of relative estimates
- Not revisiting after learning more
- Doing Money Pits because someone asked loudly
- Skipping Quick Wins for exciting Big Bets
