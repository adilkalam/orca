# Learning: Improvement Without Weight Updates

---

## The Problem

The same mistake, repeated across sessions, is the signature failure of LLM workflows.

Session 12 hits the same bug that session 3 hit. Session 20 makes the same architectural error as session 8. The model has no memory of failing. It has no felt experience of "this broke last time." Every session starts from zero.

```
SESSION 3                    SESSION 8                    SESSION 12
+-----------+                +-----------+                +-----------+
| Use API   |                | Skip iOS  |                | Use API   |
| that needs|                | version   |                | that needs|
| iOS 16+   |                | check     |                | iOS 16+   |
+-----------+                +-----------+                +-----------+
     |                            |                            |
     v                            v                            v
  [fails]                     [fails]                      [fails]
     |                            |                            |
     v                            v                            v
 [forgotten]                 [forgotten]                 [forgotten]
```

Without learning, you're the only quality memory in the system. You catch the same errors, give the same corrections, explain the same constraints. The model never improves.

---

## What Learning Provides

ORCA learns at three levels -- all file-based, no weight updates, no fine-tuning.

| Level | What it learns from | What it produces | Storage |
|-------|-------------------|-----------------|---------|
| **Agent-level** | Task outcomes | Pattern knowledge per agent | `.claude/agent-knowledge/*/patterns.json` |
| **Gate-level** | CAUTION/FAIL decisions | Reflexions (what failed and why) | Workshop + improvement bus |
| **Conversation-level** | Your corrections and instructions | Permanent rules in CLAUDE.md | CLAUDE.md + Workshop |

The research backing: Reflexion (Shinn et al., NeurIPS 2023) achieved 88% pass@1 on HumanEval -- compared to GPT-4's 67% -- through verbal feedback stored in episodic memory. Chain of Verification (Dhuliawala et al., Meta AI 2023) showed 2x precision improvement through structured verification questions. ORCA implements both, adapted for multi-agent pipelines.

---

## Agent-Level Learning

Agents track patterns that work and patterns that fail.

### How It Works

```
Agent completes task
    |
    v
Did a pattern succeed?  -->  Increment successCount
Did a pattern fail?     -->  Increment failureCount
New effective pattern?  -->  Add as candidate
    |
    v
Over time: patterns accumulate statistics
    |
    v
successRate >= 85% AND 10+ uses  -->  PROMOTED (permanent knowledge)
successRate < 50%                 -->  Flagged for deprecation
```

### What It Looks Like

```
.claude/agent-knowledge/
  nextjs-builder/
    patterns.json        # Patterns for Next.js builder
  ios-builder/
    patterns.json        # Patterns for iOS builder
  expo-builder-agent/
    patterns.json        # Patterns for Expo builder
```

Each pattern tracks:

```json
{
  "id": "pattern-001",
  "description": "Use Suspense boundaries around async components",
  "category": "architecture",
  "successCount": 12,
  "failureCount": 1,
  "successRate": 0.92,
  "status": "promoted",
  "lastUsed": "2026-01-15"
}
```

### Agent Integration

Every agent checks for learned patterns before starting work:

1. Read `.claude/agent-knowledge/{agent-name}/patterns.json`
2. Apply relevant promoted patterns
3. Track which patterns were used
4. Update success/failure counts after task completion

Success is tracked through: user accepting changes, build/test passing, gate scores, and whether corrections were needed.

---

## Gate-Level Learning (Reflexion)

When a gate reports CAUTION or FAIL, it generates a reflexion: what failed, why, and what would have prevented it.

### How It Works

```
Gate runs  -->  CAUTION or FAIL
    |
    v
Generate reflexion:
  "NavigationStack used without checking iOS 16+ deployment target"
    |
    v
Store in Workshop (tagged #reflexion)
    |
    v
Emit to improvement bus
    |
    v
Future runs: orchestrator loads past reflexions BEFORE delegating
    |
    v
Builder receives: "Active constraints from past failures:
  - iOS 16+ API check required before using NavigationStack"
```

The reflexion becomes a constraint for future work. The builder that caused the failure gets the constraint. Other builders in different domains don't -- this prevents context bloat.

### Reflexion-as-Constraint

Past reflexions are synthesized into constraint bullets and injected into the plan for the relevant agent:

```markdown
## Active Constraints (from past failures)

These constraints are derived from past failures by this agent. Apply them:

- iOS 16+ API check required before using NavigationStack
- No force unwraps in async closures
- Verify Tailwind classes exist before using

Failure to apply these constraints will result in gate failure.
```

This is based on Reflexion (Shinn et al., NeurIPS 2023): verbal feedback stored in episodic memory enables improvement without weight updates. The agent doesn't need to "understand" why the constraint exists. It just needs to follow it.

---

## Conversation-Level Learning (/reflect)

Your interactions generate implicit learnings:
- Corrections: "No, use strict mode instead"
- Instructions: "Always run lint before committing"
- Feedback: "That broke the build"

`/reflect` extracts these signals from conversation transcripts and promotes them to permanent rules.

### Commands

```bash
/reflect                     # Analyze transcripts, review patterns
/reflect --source recording  # Analyze from recording.db instead of JSONL
/reflect status              # Show learning journal summary
/reflect learn <rule>        # Explicitly add a rule to CLAUDE.md
/reflect learn <rule> --soft # Add as Workshop preference (softer)
/reflect unlearn <rule>      # Archive or remove a rule
/reflect history             # Show all rules (active + archived)
```

### Signal Detection

| Type | Detection Pattern | Threshold |
|------|-------------------|-----------|
| Correction | "no", "don't", "instead", "wrong" | 1 occurrence |
| Instruction | "always", "never", "make sure" | 2 occurrences |
| Positive feedback | "perfect", "great", "exactly" | 3+ occurrences |
| Negative feedback | "broke", "failed", "error" | 1 occurrence |

### Where Rules Live

Promoted rules go to your project's CLAUDE.md:

```markdown
## Learned Rules (via /reflect)
<!-- Auto-managed by /reflect -->

### Active Rules
- **[rule-001]** Always use TypeScript strict mode
- **[rule-002]** Run lint before committing

### Archived Rules
- **[rule-003]** Use npm not yarn (archived: switched to bun)
```

Soft learnings go to Workshop preferences, which agents load via ProjectContext.

---

## The Improvement Bus

All three levels feed a unified event stream. A learning at one level can propagate to others.

```
Sources                    Improvement Bus              Sinks
-------                    ---------------              -----
Reflexion (gates)    -->                          -->  Agent patterns
CoVe failures        -->   improvement_event.jsonl -->  CLAUDE.md rules
/reflect rules       -->          |               -->  Workshop standards
/audit proposals     -->          v               -->  Gate checklists
Agent discoveries    -->   /self-improve          -->  phase_state constraints
```

### How Events Flow

A single gate failure can cascade:

```
Gate failure: "NavigationStack used without checking iOS 16+"
    |
    +---> Agent constraint (ios-builder checks deployment target next time)
    +---> Workshop standard (all iOS agents load this)
    +---> Mandatory verification question (future gates must check)
```

### CoVe Question Mining

Verification questions that fail repeatedly become mandatory checks. If "Are 'use client' directives correct?" fails 2+ times across different tasks, it becomes a required question in all future Next.js verification runs.

```
CoVe question fails  -->  Count failures across tasks
    |
    v
Failed 2+ times  -->  Emit to improvement bus
    |
    v
Route to gate_checklist
    |
    v
Future verification: "Mandatory Questions (from past failures):
  1. Are 'use client' / 'use server' directives correct? (failed 3 times)"
```

This turns verification from a one-time check into a cumulative system where past failures inform future checks.

### Running the Bus

```bash
/self-improve              # Process pending events, show report
/self-improve --dry-run    # Show what would be routed without applying
/self-improve --domain ios # Only process events for iOS domain
```

---

## What This Looks Like Over Time

### Session 1

Agent knows nothing project-specific. Uses general knowledge. Makes mistakes. Gates catch some. You catch others.

### Session 10

Agent has learned: your TypeScript preferences, 3 project patterns, 2 reflexion constraints. Gates have 4 mandatory verification questions from past failures. Fewer corrections needed.

### Session 50

Agent has promoted patterns with 85%+ success rates. Reflexion constraints cover known failure modes. `/reflect` rules encode your accumulated preferences. Verification catches what it missed before.

Session 50 is different from session 1.

---

## Practical Usage

### See What's Been Learned

```bash
# Check learned rules
/reflect status

# See agent patterns
/reflect history

# Check improvement bus health
/self-improve --dry-run
```

### Teach Explicitly

```bash
# Add a hard rule (goes to CLAUDE.md)
/reflect learn "Always check deployment target before using new APIs"

# Add a soft preference (goes to Workshop)
/reflect learn "Prefer functional components" --soft
```

### Remove Bad Rules

```bash
# Archive a rule that no longer applies
/reflect unlearn rule-003
```

### Trigger Pattern Analysis

```bash
# Run improvement analysis across recent work
/audit

# Process pending improvement events
/self-improve
```

---

## Design Principles

**File-based, not weight-based.** All learning is stored in JSON files and markdown. Nothing modifies the model itself. This means learnings are inspectable, editable, and portable.

**User approval required.** No auto-modifying agents. You review and approve all promoted rules and patterns. Rejected proposals are recorded for learning.

**Threshold-based detection.** 3+ occurrences trigger a pattern proposal. This balances signal vs noise and prevents one-off issues from polluting agent knowledge.

**Scoped injection.** Constraints go to the agent that needs them. `nextjs-builder` doesn't see iOS constraints. This prevents context bloat.

---

## Storage Locations

| Data | Location |
|------|----------|
| Agent patterns | `.claude/agent-knowledge/{agent}/patterns.json` |
| Gate checklists | `.claude/agent-knowledge/{agent}/mandatory_checks.json` |
| Improvement events | `.claude/improvement-events/improvement_event.jsonl` |
| Learning journal | `.claude/orchestration/temp/reflect-journal.json` |
| Learned rules | Project CLAUDE.md |
| Soft preferences | Workshop entries |

---

## See Also

- `docs/concepts/self-improvement.md` - Full technical reference
- `docs/concepts/improvement-bus.md` - Event routing specification
- `commands/self-improve.md` - /self-improve command spec
- `commands/reflect.md` - /reflect command specification

---

_Version: OS 6.4 | Learning is improvement, made cumulative._
