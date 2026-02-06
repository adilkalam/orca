---
name: assumption-surfacing
title: Assumption Surfacing
tags: [validation, planning]
---

# Assumption Surfacing

Explicitly identify and examine the hidden assumptions underlying a plan or decision.

## When to Use
- Starting work based on someone else's requirements
- Inherited codebase or system
- Plan seems "obvious" (dangerous signal)
- Stakeholders aren't aligned despite agreeing on words

## Process

### Step 1: List Explicit Assumptions
What has been stated directly?
- "We're assuming 10K daily active users"
- "We're assuming the API is stable"

### Step 2: Probe for Implicit Assumptions
For each statement or decision, ask:
- "What must be true for this to work?"
- "What am I taking for granted here?"
- "What would surprise me if it were false?"

Categories to probe:
- **Technical:** Performance, compatibility, availability
- **User:** Behavior, needs, capabilities
- **Business:** Timeline, resources, priorities
- **Environmental:** Dependencies, integrations, constraints

### Step 3: Rate Each Assumption
For each surfaced assumption:
- **Confidence:** How sure are we this is true? (High/Medium/Low)
- **Impact:** If wrong, how bad? (High/Medium/Low)
- **Testability:** Can we verify this? (Easy/Hard/Impossible)

### Step 4: Prioritize Validation
Focus on: Low confidence + High impact + Testable
These are your critical assumptions to validate BEFORE proceeding.

### Step 5: Design Validation Tests
For priority assumptions:
- What evidence would confirm or refute this?
- What's the cheapest way to test this?
- What's our threshold for proceeding vs pivoting?

## Key Principle
Unexamined assumptions are the most dangerous. The plan that "obviously" works often fails on an assumption no one thought to question.

## Example Application

**Statement:** "We'll use PostgreSQL for this project"

**Surfaced assumptions:**
1. Our data model is relational (Confidence: High)
2. We won't need to scale writes beyond single-node (Confidence: Medium, Impact: High)
3. Team has PostgreSQL experience (Confidence: Medium, Impact: Medium)
4. Hosting supports PostgreSQL (Confidence: High)
5. No need for specialized features (time-series, graph) (Confidence: Low, Impact: High)

**Priority validation:** #2 and #5 need investigation before committing

## Common Mistakes / Anti-patterns
- Assuming "we all know" the assumptions
- Only surfacing technical assumptions
- Surfacing but not validating
- Treating assumptions as fixed rather than testable
