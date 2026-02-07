# Self-Improvement System

**Version:** OS 5.2 | **Last Updated:** 2026-01-24

OS 5.2 provides an agent self-improvement loop that enables agents to learn from execution history and improve their prompts over time.

---

## System Overview

OS 5.2 provides learning at three levels:

| Level | Mechanism | Storage | Trigger |
|-------|-----------|---------|---------|
| **Agent-level** | Pattern tracking per agent | `.claude/agent-knowledge/*/patterns.json` | Task completion |
| **Pipeline-level** | Improvement loop | `task_history` -> patterns -> proposals -> agent definitions | `/audit` |
| **Conversation-level** | Transcript analysis | `/reflect` -> CLAUDE.md + Workshop preferences | `/reflect` |

Each level complements the others: agents learn local patterns, pipelines surface systemic issues, and conversations capture user preferences.

---

## Unified Improvement Bus

While the levels above operate independently, the **Improvement Bus** unifies them into a single event stream with explicit routing.

**See:** [Improvement Bus](improvement-bus.md) for full documentation.

### Quick Overview

All improvement sources write to `.claude/improvement-events/improvement_event.jsonl`:

```
Sources                    Improvement Bus              Sinks
-------                    ---------------              -----
Reflexion (gates)    -->                          -->  Agent patterns
CoVe failures        -->   improvement_event.jsonl -->  CLAUDE.md rules
/reflect rules       -->          |               -->  Workshop standards
/audit proposals     -->          v               -->  Gate checklists
Agent discoveries    -->   /self-improve          -->  phase_state constraints
```

**Trigger:** Run `/self-improve` to process pending events, or configure as session-end hook.

### Reflexion-as-Constraint

The Improvement Bus enables **constraint injection**: reflexion gotchas are synthesized into constraint bullets and injected into `phase_state.plan.constraints` for the source agent only. This ensures past failures actively inform future planning without context bloat.

### CoVe Question Mining

Verification questions that repeatedly fail are persisted and injected as **mandatory checks** for future verification runs. This turns CoVe from a one-time check into a cumulative verification system.

---

## Agent-Level Learning

In addition to the centralized self-improvement loop, agents can now learn patterns locally via file-based knowledge persistence.

### Architecture

```
.claude/agent-knowledge/
 README.md                    # System documentation
 nextjs-builder/
    patterns.json           # Patterns for Next.js builder
 ios-builder/
    patterns.json           # Patterns for iOS builder
 expo-builder-agent/
    patterns.json           # Patterns for Expo builder
 research-lead-agent/
    patterns.json           # Patterns for research
```

### Pattern Schema

```json
{
  "patterns": [
    {
      "id": "pattern-001",
      "description": "Human-readable description of the pattern",
      "category": "css|architecture|performance|security|...",
      "successCount": 0,
      "failureCount": 0,
      "successRate": 0,
      "status": "candidate|promoted|deprecated",
      "lastUsed": "2025-11-28",
      "examples": ["code example 1", "code example 2"]
    }
  ],
  "metadata": {
    "agentName": "agent-name",
    "promotionThreshold": {
      "successRate": 0.85,
      "minOccurrences": 10
    }
  }
}
```

### Pattern Lifecycle

1. **Discovery**: Agent finds effective pattern during task
2. **Candidate**: Pattern added with `status: "candidate"`
3. **Tracking**: Success/failure counts updated each use
4. **Promotion**: When `successRate >= 0.85` AND `successCount >= 10`, status becomes `"promoted"`
5. **Deprecation**: If success rate drops below 0.5, flag for review

### Agent Integration

All 124 agents have Knowledge Loading sections:

```markdown
## Knowledge Loading

Before starting any task:
1. Check if `.claude/agent-knowledge/{agent-name}/patterns.json` exists
2. If exists, read and apply relevant patterns to your work
3. Track which patterns you apply during this task
```

Builder and writer agents (17 total) also have Knowledge Persistence footers:

```markdown
## Knowledge Persistence

After completing your task:
1. If you discovered a new effective pattern: add it
2. If you applied an existing pattern successfully: increment successCount
3. If a pattern failed: increment failureCount
```

### User Feedback Signal

Pattern success/failure is primarily tracked through:
- User accepting changes without modification
- User requesting corrections (indicates pattern failure)
- Build/test success after applying pattern
- Gate scores improving after applying pattern

---

## The Problem

Before self-improvement:
- Agent failures didn't propagate learnings back to prompts
- Same mistakes recurred across sessions
- Manual discovery and fixing of agent issues
- No systematic outcome tracking

## The Solution

A structured loop that:
1. **Records** execution outcomes at pipeline end
2. **Identifies** patterns when same issue occurs 3+ times
3. **Proposes** improvements in structured format
4. **Applies** approved changes to agent definitions
5. **Measures** impact by tracking recurrence

## Architecture

```

                                                                 
  Execute Pipeline (via /orca-{domain})                         
       ↓                                                         
  Grand-Architect Records Outcome                                
       ↓                                                         
  Workshop task_history Entry                                    
       ↓                                                         
  /audit Triggers Pattern Analysis                               
       ↓                                                         
  Identify Patterns (3+ occurrences)                             
       ↓                                                         
  Generate Improvement Proposal                                  
       ↓                                                         
  User Approves/Rejects                                          
       ↓                                                         
  Apply to Agent Definition                                      
       ↓                                                         
  Measure Impact (track if issue recurs)                         
       
```

## Outcome Recording

Grand-architects record task outcomes at the end of every pipeline:

```bash
workshop --workspace .claude/memory task_history add \
  --domain "ios" \
  --task "Build Auth UI" \
  --outcome "partial" \
  --json '{"agents_used": ["ios-builder", "ios-verification"], "issues": [...]}'
```

Task history can also be recorded via the MCP tool `mcp__project-context__save_task_history`, which provides the same functionality through the ProjectContext server.

### Outcome Schema

```json
{
  "task_id": "ios-build-auth-2025-11-27",
  "domain": "ios",
  "agents_used": ["ios-builder", "ios-verification-agent"],
  "outcome": "success | failure | partial",
  "issues": [
    {
      "agent": "ios-builder",
      "type": "compilation_error",
      "description": "Used NavigationStack which requires iOS 16+",
      "severity": "high"
    }
  ],
  "files_modified": ["Auth/AuthView.swift", "Auth/AuthViewModel.swift"],
  "duration_seconds": 312,
  "gate_scores": {"design": 8, "standards": 9}
}
```

## Pattern Recognition

Patterns are identified when the same issue type occurs 3+ times from the same agent:

```json
{
  "pattern_id": "ios-builder-ios-version-mismatch",
  "agent": "ios-builder",
  "issue_type": "compilation_error",
  "occurrences": 5,
  "first_seen": "2025-11-20",
  "last_seen": "2025-11-27",
  "severity": "high",
  "example_descriptions": [
    "Used NavigationStack which requires iOS 16+",
    "Used .scrollDismissesKeyboard which requires iOS 16+"
  ]
}
```

### Analysis

Pattern analysis is handled inline by the `/self-improve` command, which scans Workshop task history, identifies recurring patterns, and generates improvement proposals.

Output: `.claude/orchestration/temp/improvement-proposals.json`

## Improvement Proposals

Proposals follow a Pantheon-inspired schema:

```json
{
  "proposal_id": "improve-ios-builder-2025-11-27",
  "agent_name": "ios-builder",
  "issue_description": "Agent generates SwiftUI code using APIs that require iOS 16+ without checking deployment target",
  "recommended_changes": "Add instruction: 'Before using SwiftUI APIs, verify they are available for the project's minimum iOS deployment target.'",
  "priority": "high",
  "pattern_id": "ios-builder-ios-version-mismatch",
  "occurrences": 5,
  "status": "pending | approved | rejected | applied"
}
```

## User Approval Flow

1. Run `/audit` to see pending proposals
2. Review each proposal
3. Approve, Reject, or Modify
4. Approved proposals move to "approved" status

**User approval is always required** - agents are never auto-modified.

## Applying Improvements

Approved improvements are applied via the `/self-improve` command, which processes pending proposals and updates agent definitions.

This adds a "Learned Rules" section to agent definitions:

```markdown
## Learned Rules (Self-Improvement)
<!-- Auto-generated from improvement proposals -->
- **iOS Version Check**: Before using SwiftUI APIs, verify they are available for the project's minimum iOS deployment target.
```

## Measuring Impact

After improvements are applied:
- Track if the same issue type recurs
- Calculate effectiveness: `(before - after) / before`
- Store metrics in Workshop notes

## Commands and Scripts

| Component | Purpose |
|-----------|---------|
| `/audit` | Triggers pattern analysis, shows proposals |
| `/self-improve` | Process improvement bus events, apply approved changes |

## Storage Locations

| Data | Storage |
|------|---------|
| Execution outcomes | Workshop `task_history` entries |
| Identified patterns | Workshop `gotcha` entries (tagged `pattern`) |
| Improvement proposals | `.claude/orchestration/temp/improvement-proposals.json` |
| Applied changes | Agent definitions (Markdown) + Workshop `decision` entries |
| Impact metrics | Workshop `note` entries (tagged `metrics`) |

## Design Principles

### Pain-to-Pattern Process
Inspired by Equilateral Agents:
```
Incident → Cost Analysis → Root Cause → Standard → Enforcement → Measurement
```

Formula: "What Happened + The Cost + The Rule = Standard"

### User Control
- Never auto-modify agents
- User reviews and approves all changes
- Rejected proposals are recorded for learning

### Threshold-Based Detection
- 3+ occurrences trigger a proposal
- Balances signal vs noise
- Prevents one-off issues from polluting prompts

---

# /reflect - Claude Code Self-Improvement

While the agent self-improvement system learns from pipeline executions, `/reflect` provides a complementary system for learning from **standard Claude Code interactions**.

## The Problem

Claude Code interactions generate implicit learnings:
- Corrections: "No, use strict mode instead"
- Instructions: "Always run lint before committing"
- Feedback: "That broke the build"

But these don't persist. Each session starts fresh, leading to:
- Same corrections given repeatedly
- Same preferences re-explained
- Same mistakes recurring
- No systematic improvement over time

## The Solution

`/reflect` extracts learning signals from JSONL conversation transcripts:

```

                                                                 
  JSONL Transcripts (~/.claude/projects/<hash>/)                
       ↓                                                         
  /reflect Analyzes Transcripts                                  
       ↓                                                         
  Extract Signals (corrections, instructions, feedback)          
       ↓                                                         
  Learning Journal (.claude/orchestration/temp/reflect-journal.json)
       ↓                                                         
  Pattern Meets Threshold?                                       
       ↓                                                         
  User Reviews & Approves                                        
       ↓                                                         
  CLAUDE.md (hard rules) or Workshop (soft preferences)          
       
```

## Signal Types

| Type | Detection Pattern | Severity | Threshold |
|------|-------------------|----------|-----------|
| Correction | "no", "don't", "instead", "wrong" | High | 1 |
| Instruction | "always", "never", "make sure", "remember" | Medium | 2 |
| Positive Feedback | "perfect", "great", "exactly" | Low | 3+ |
| Negative Feedback | "broke", "failed", "error" | High | 1 |

## Commands

```bash
/reflect                     # Analyze transcripts, review patterns
/reflect status              # Show learning journal summary
/reflect learn <rule>        # Explicitly add rule to CLAUDE.md
/reflect learn <rule> --soft # Add as Workshop preference
/reflect unlearn <rule>      # Archive or remove a rule
/reflect history             # Show all rules (active + archived)
```

## Learning Journal

Pre-promotion signals accumulate in `.claude/orchestration/temp/reflect-journal.json`:

```json
{
  "version": "1.0",
  "project": "my-project",
  "signals": [
    {
      "id": "sig-abc123",
      "type": "correction",
      "content": "Use strict TypeScript",
      "occurrences": 3,
      "first_seen": "2025-11-20",
      "last_seen": "2025-11-27",
      "severity": "high",
      "status": "pending"
    }
  ],
  "learned_rules": []
}
```

## CLAUDE.md Integration

Promoted rules go to a "Learned Rules" section:

```markdown
## Learned Rules (via /reflect)
<!-- Auto-managed by /reflect - manual edits may be overwritten -->

### Active Rules
- **[rule-001]** Always use TypeScript strict mode (learned: 2025-11-27)
- **[rule-002]** Run lint before committing (learned: 2025-11-25)

### Archived Rules
<!-- Rules no longer active but kept for history -->
- **[rule-003]** Use npm not yarn (archived: 2025-11-26, reason: switched to bun)
```

## Workshop Integration

Soft learnings go to Workshop preferences:

```bash
workshop --workspace .claude/memory note "[/reflect] Prefer concise responses #preference #code_style"
```

## Key Differences from Agent Self-Improvement

| Aspect | Agent Self-Improvement | /reflect |
|--------|----------------------|----------|
| **Input** | Pipeline execution outcomes | JSONL transcripts |
| **Learns from** | Agent-specific failures | General interactions |
| **Output** | Agent prompt modifications | CLAUDE.md rules + Workshop preferences |
| **Trigger** | `/audit` after pipelines | `/reflect` manual invocation |
| **Scope** | Domain-specific agents | Project-wide Claude Code behavior |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/reflect-analyze.py` | Parse JSONL, extract signals, update journal |
| `scripts/reflect-apply.py` | Add/archive/remove rules in CLAUDE.md |

## Design Principles

### User Approval Required
- All promotions require explicit user approval
- No auto-applying rules

### Project Scope
- Rules go to project CLAUDE.md only
- No global `~/.claude/CLAUDE.md` modifications

### Full Lifecycle
- Learn (add rules)
- Update (modify rules)
- Unlearn (archive/remove obsolete rules)

### Conflict Detection
- Warns when new rules conflict with existing
- User decides: replace, keep existing, or keep both

---

# Reflexion-Enhanced Gates (OS 5.2)

OS 5.2 introduces Reflexion-enhanced gates based on research by Shinn et al. (NeurIPS 2023). Gates now learn from failures through verbal reinforcement stored in episodic memory (Reflexion-style episodic memory).

## The Research

Reflexion (Shinn et al., 2023) demonstrates that agents can improve through **verbal feedback stored in episodic memory** without weight updates. Key findings:
- 88% pass@1 on HumanEval (vs GPT-4's 67%)
- Learning from failures through natural language reflection
- Episodic memory enables improvement across trials

**Paper:** arXiv:2303.11366

## How It Works

When a gate produces a CAUTION or FAIL decision:

```
Gate Run → CAUTION/FAIL Decision
    ↓
Generate Reflexion: "What failed and why"
    ↓
Store in Workshop: workshop gotcha "reflexion: [text]" -t reflexion -t {domain}
    ↓
Include in Gate Output
    ↓
Future Runs: Load reflexions before gating
```

## Gate Integration

All 10 gate agents now include:

```markdown
## Reflexion on Failure (OS 5.2)

When `gate_decision` is CAUTION or FAIL:

1. Generate a reflexion explaining:
   - What specific check failed
   - Why it failed (root cause)
   - What would have prevented the failure

2. Store the reflexion:
   workshop --workspace .claude/memory gotcha "reflexion: {text}" -t reflexion -t {domain}

3. Include in gate output:
   reflexion: "..."
```

## Reflexion Loading

Lane orchestrators load past reflexions before delegating:

```bash
workshop --workspace .claude/memory search "reflexion" -t {domain} --limit 5
```

This ensures gates benefit from past failure learnings.

These stored reflexions are later mined by `/audit` and `/self-improve` when generating improvement proposals, closing the loop between runtime failures and agent prompt updates.

### Improvement Bus Integration

In addition to Workshop storage, gates now emit improvement events:

```bash
# After storing Workshop gotcha, also emit to improvement bus
echo '{"id":"evt-'$(date +%Y%m%d)'-'$(cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | head -c 4)'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","source":"reflexion","source_agent":"nextjs-standards-enforcer","domain":"nextjs","event_type":"failure","content":{"description":"[reflexion text]","severity":"high","evidence":"[file:line]"},"routing":{"targets":["agent_patterns"],"status":"pending"}}' >> .claude/improvement-events/improvement_event.jsonl
```

This enables cross-layer propagation: reflexions can become agent patterns, workshop standards, or constraint injections.

## Affected Gates

| Gate | Domain |
|------|--------|
| nextjs-standards-enforcer | Next.js |
| nextjs-design-reviewer | Next.js |
| ios-standards-enforcer | iOS |
| ios-ui-reviewer | iOS |
| expo-verification-agent | Expo |
| expo-standards-enforcer | Expo |
| shopify-theme-checker | Shopify |
| shopify-ui-reviewer | Shopify |
| django-react-standards-enforcer | Django+React |
| os-dev-standards-enforcer | OS-Dev |

---

# Chain of Verification (OS 5.2)

OS 5.2 introduces Chain of Verification (CoVe) based on Meta AI research (Dhuliawala et al., 2023). Verification agents now use structured verification questions to catch errors before reporting (CoVe-style question-then-verify loop).

## The Research

CoVe (Meta AI, 2023) demonstrates that structured verification improves accuracy:
- 2x precision improvement on fact-checking tasks (17% → 36%)
- Independent question answering prevents bias
- Aggregation catches errors baseline responses miss

**Paper:** arXiv:2309.11495

## How It Works

```
Initial Verification Pass
    ↓
Step 1: Generate 3-5 Verification Questions
    ↓
Step 2: Answer Each Question Independently (YES/NO/UNCERTAIN)
    ↓
Step 3: Aggregate Results into Verification Table
    ↓
Step 4: Determine Final Status (PASS/CAUTION/FAIL)
```

## Verification Agent Integration

All 6 verification agents now include:

```markdown
## Chain of Verification Protocol (OS 5.2)

Before finalizing verification status:

### Step 1: Generate Verification Questions
Create 3-5 specific, answerable questions, e.g.:
- "Does the build succeed without warnings?"
- "Are all new files properly imported?"
- "Do all tests pass?"

### Step 2: Answer Questions Independently
For each question, determine:
- YES: Verified correct
- NO: Verified incorrect
- UNCERTAIN: Cannot determine

### Step 3: Aggregate Verification
| Question | Answer | Evidence |
|----------|--------|----------|
| Build succeeds? | YES | Exit code 0 |
| Tests pass? | NO | 2 failures |

### Step 4: Determine Status
- All YES → PASS
- Any NO → FAIL
- Only UNCERTAIN → CAUTION
```

## Affected Verification Agents

| Agent | Domain |
|-------|--------|
| nextjs-verification-agent | Next.js |
| ios-verification | iOS |
| expo-verification-agent | Expo |
| django-react-verification | Django+React |
| os-dev-verification | OS-Dev |

## Benefits

1. **Structured thinking** - Forces systematic verification
2. **Independent evaluation** - Prevents confirmation bias
3. **Evidence-based** - Each answer requires supporting evidence
4. **Transparent** - Verification table shows exactly what was checked

## Evidentiary Use

The verification questions and table are part of the gate output and serve as structured evidence. This is valuable when:
- Gates disagree (e.g., standards-enforcer says PASS but design-reviewer says FAIL)
- Auditing failures post-hoc via `/audit`
- Understanding why a verification passed or failed
- Comparing verification thoroughness across runs

## CoVe Persistence

Verification agents now persist their CoVe tables to `phase_state.gates.verification`:

```json
{
  "gates": {
    "verification": {
      "cove_table": [
        {"question": "Build succeeds?", "answer": "YES", "evidence": "exit 0"},
        {"question": "Use client correct?", "answer": "NO", "evidence": "Missing directive in UserForm.tsx:1"}
      ],
      "status": "FAIL"
    }
  }
}
```

Questions with NO answers are also emitted to the improvement bus:

```bash
# For each NO answer in CoVe table
echo '{"id":"evt-...","source":"cove","source_agent":"nextjs-verification-agent","domain":"nextjs","event_type":"verification_question","content":{"question":"Are use client directives correct?","answer":"NO","evidence":"Missing directive in UserForm.tsx:1"},"routing":{"targets":["gate_checklist"],"status":"pending"}}' >> .claude/improvement-events/improvement_event.jsonl
```

When `/self-improve` runs, questions that fail 2+ times become **mandatory checks** in `.claude/agent-knowledge/{agent}/mandatory_checks.json`. Future verification runs load these and include them automatically.

## Mandatory Check Loading

Verification agents check for mandatory checks before generating questions:

```markdown
## Before generating CoVe questions:

1. Check if `.claude/agent-knowledge/{agent-name}/mandatory_checks.json` exists
2. If exists, load active checks and include them as required questions
3. These questions MUST appear in the CoVe table with explicit YES/NO answers
```

**Current status:** Mandatory check loading is implemented in `nextjs-verification-agent`. Other verification agents (`ios-verification`, `expo-verification-agent`, `django-react-verification`, `os-dev-verification`) have CoVe protocols but do not yet load mandatory checks from the improvement bus. Extending this to all verification agents is a planned enhancement.

This creates a cumulative verification system where past failures inform future checks.

---

## See Also

- [Response Awareness](response-awareness.md) - RA tags in audit
- [Memory Systems](memory-systems.md) - Workshop integration
- [Complexity Routing](complexity-routing.md) - Team scaling
- [Graduated Gate Scoring](../reference/graduated-gate-scoring.md) - Gate thresholds
