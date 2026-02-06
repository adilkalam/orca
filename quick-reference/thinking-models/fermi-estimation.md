---
name: fermi-estimation
title: Fermi Estimation
tags: [estimation]
---

# Fermi Estimation

Make reasonable order-of-magnitude estimates by breaking down unknowns into tractable components.

## When to Use
- Need a rough number to guide decisions
- No data available or time to gather it
- Want to sanity-check someone else's number
- Scoping work: "how big is this?"

## Process

### Step 1: Clarify What You're Estimating
Be specific about the quantity and constraints.
- Not: "How much storage do we need?"
- But: "How much storage for user uploads in year one, 95th percentile?"

### Step 2: Break Into Components
Decompose into factors you can estimate more easily.
- Storage = (Users) × (Uploads per user) × (Avg upload size)

### Step 3: Estimate Each Component
For each factor:
- Use anchor points you know
- Make conservative and aggressive bounds
- Pick a reasonable middle

### Step 4: Combine Estimates
Multiply/add components.
- Round aggressively—precision is false here
- 10K users × 50 uploads × 2MB = 1TB

### Step 5: Sanity Check
- Does this pass the smell test?
- What would make this 10x wrong?
- Compare to known reference points

## Key Principle
Being within an order of magnitude (10x) is success. Don't optimize for precision—optimize for "good enough to decide."

## Example Application

**Question:** "How many API calls will our new feature generate per month?"

**Decomposition:**
- Monthly active users using feature
- Sessions per user per month
- Feature uses per session
- API calls per use

**Estimates:**
- MAU with feature: 50K (10% of 500K total users adopt)
- Sessions/user/month: 20 (daily users, ~20 work days)
- Uses/session: 3 (estimate from similar feature)
- Calls/use: 2 (one load, one save)

**Calculation:**
50,000 × 20 × 3 × 2 = 6,000,000 calls/month

**Sanity check:**
- Per second: 6M / (30×24×60×60) ≈ 2.3 req/s average
- Peak (10x average): ~23 req/s
- Seems reasonable for this user base

## Common Mistakes / Anti-patterns
- False precision ("1,247,832 calls")
- Not stating assumptions (makes it uncheckable)
- Single-point estimates without bounds
- Not doing the sanity check
