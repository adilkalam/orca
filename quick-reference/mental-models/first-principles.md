---
name: first-principles
title: First Principles Thinking
tags: [architecture, validation]
---

# First Principles Thinking

Break down to fundamentals and rebuild from there, rather than reasoning by analogy.

## When to Use
- Stuck in "this is how it's always been done"
- Conventional approaches aren't working
- Need innovative solution, not incremental improvement
- Challenging industry assumptions

## Process

### Step 1: Identify and Challenge Assumptions
List all assumptions about the problem.
- "Users need accounts to use the product"
- "We need a database"
- "This must be real-time"

### Step 2: Break Down to Fundamental Truths
For each assumption, ask: "What is absolutely, provably true?"
- Strip away conventions, traditions, analogies
- Get to physics, mathematics, or logic-level truths
- "Users need a way to save their progress" (more fundamental than "accounts")

### Step 3: Reason Up from Fundamentals
Given only these fundamental truths, how would you solve the problem?
- Don't ask "How do others solve this?"
- Ask "What is the simplest possible way to achieve this?"

### Step 4: Compare to Current Approach
How different is the first-principles solution from the current approach?
- If very different: explore why conventions exist (may have good reason)
- If similar: validates current approach
- If simpler: you may have found a better way

### Step 5: Test the First-Principles Solution
What would it take to try this approach?
- Build a prototype
- Test assumptions
- Validate it solves the actual problem

## Key Principle
Reasoning by analogy ("X is like Y, so solve it like Y") can trap you in local maxima. First principles lets you find global maxima.

## Example Application

**Problem:** "How to make electric cars viable?"

**Conventional wisdom (reasoning by analogy):**
- Electric cars are expensive because batteries are expensive
- Batteries are expensive, that's just how it is
- Therefore electric cars will always be niche luxury items

**First principles breakdown:**
- What are batteries made of? Carbon, nickel, aluminum, polymers
- What do these materials cost on commodity market? ~$80/kWh in raw materials
- What do assembled battery packs cost? ~$600/kWh
- Why the gap? Manufacturing, not fundamental material cost

**First-principles conclusion:**
- If we can improve manufacturing, batteries can be much cheaper
- Electric cars can be mass-market, not just luxury
- This led to Tesla's Gigafactory approach

## Common First-Principles Questions

**In software:**
- "Why do we need a server?" (Can it run client-side?)
- "Why do we need a database?" (Can we use files? Local storage?)
- "Why do we need user accounts?" (Can we use links? Temporary sessions?)

**In product:**
- "Why do users need this feature?" (What actual goal are they trying to achieve?)
- "Why this interface?" (What's the simplest possible interaction?)

**In architecture:**
- "Why microservices?" (What problem are we actually solving?)
- "Why real-time?" (What's the actual latency requirement?)

## Common Mistakes / Anti-patterns
- Not going deep enough (stopping at conventions)
- Ignoring valid reasons for current approaches
- Assuming simpler is always better
- Not testing if first-principles solution actually works
