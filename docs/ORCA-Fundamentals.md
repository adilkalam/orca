# ORCA-OS Fundamentals: Verified Architecture and Re-wire Plan

**Date**: 2026-02-28
**Status**: VERIFIED failure analysis complete. Implementation spec ready.
**Cognition sessions**:
- `bbc28370` (verified failure analysis - THIS IS THE ONE TO USE)
- `16fed291` (harvest checkpoint)
- `82f1cce3` (initial phantom analysis - SUPERSEDED)

**Key insight**: Previous analyses kept assuming mechanisms work without verifying. This document contains VERIFIED findings from reading actual code and querying actual databases.

---

## Part 1: What's Actually Broken (Verified)

### 1.1 Workshop Gotchas Are Garbage

**Verified by**: `sqlite3 .claude/memory/workshop.db "SELECT content FROM entries WHERE type='gotcha' LIMIT 5"`

**Finding**: 65 gotchas exist. ALL are truncated conversation fragments:
```
"This is a gotcha worth recording:|"
"I understand the constraints: - READ-ONLY mode..."
"0 summary)"
"Document any gotchas discovered"
"Let me record this as a gotcha"
```

**Root cause**: Gate agents call `workshop gotcha "<text>"` via Bash. This captures whatever nearby text exists, not structured rules. The gotchas have no `what_happened / cost / rule` structure.

**Fix**:
1. Delete all 65 garbage gotchas: `sqlite3 .claude/memory/workshop.db "DELETE FROM entries WHERE type='gotcha';"`
2. Change 11 gate agents from `workshop gotcha` to `mcp__project-context__save_standard` MCP call

### 1.2 Exploration Commands Don't Read Memory Before Starting

**Verified by**: `grep -n 'workshop' commands/deepthink.md` → only writes at line 392-397, never reads

**Finding**: `/deepthink`, `/think`, `/problem-solve` all:
- Start fresh from the problem statement
- Write a note to Workshop at the END (harvest phase)
- NEVER query "what do we already know about this topic?"

**The loop doesn't loop**: Session N writes findings. Session N+1 starts fresh. The write is wasted.

**Fix**: Add Phase 0.5 Memory Query to all three commands:
```markdown
## Phase 0.5: Memory Query (Before ENTER)

1. Extract keywords from problem statement
2. Query Workshop: `workshop search "<keywords>" --limit 5`
3. Query cognition files: `ls .claude/cognition/*<topic>*`
4. If prior context found, include in ORIENT phase
```

### 1.3 Session-Start Output Is Ignored

**Verified by**: Reading `hooks/session-start.sh` lines 269-278

**Finding**: The hook outputs Workshop context to STDOUT. Claude (parent conversation) sees it. But:
- Exploration commands don't reference it in their instructions
- I (Claude) saw it at conversation start and didn't use it
- The output appears but nothing acts on it

**Fix**: Exploration commands should query Workshop directly instead of relying on stdout context that gets ignored.

### 1.4 Cognition-MCP Is Isolated

**Verified by**: `grep -r 'workshop\|Workshop' mcp/cognition-mcp/src/` → no matches

**Finding**: Cognition-mcp stores session reasoning in `.claude/cognition/`. It has:
- Zero Workshop integration
- Zero project-context MCP integration
- Each session is an island

**Fix (deferred)**: Either add Workshop integration to cognition-mcp, or keep them separate and have commands query both.

### 1.5 Subagent Context Gap

**Verified by**: Reading `agents/nextjs/nextjs-light-orchestrator.md` lines 121-156

**Finding**: Lane commands query `query_context` and receive `ContextBundle` with `relatedStandards`. Orchestrators:
- Extract: files, tokens, patterns
- DO NOT extract: `relatedStandards`
- Task prompts sent to builders contain: MODE, REQUEST, CONTEXT, CONSTRAINTS
- Task prompts DO NOT contain: standards from Workshop

**Fix**: Add to orchestrator Task prompts:
```markdown
ACTIVE STANDARDS (from project memory):
<for each standard in relatedStandards:>
- <standard.rule> (learned from: <standard.what_happened>)

Apply these rules learned from past failures.
```

### 1.6 Phantom Infrastructure (Dead Code)

**Verified by**: `ls -la .claude/agent-knowledge/` → directory doesn't exist

| Component | Files Affected | Status |
|-----------|----------------|--------|
| `.claude/agent-knowledge/` | 127 agents reference it | Never created |
| `.claude/improvement-events/` | 9 agents write to it | Never created |
| Knowledge Loading blocks | 127 agents (~5 lines each) | Dead code |
| Knowledge Persistence blocks | ~20 builder agents (~10 lines each) | Dead code |
| Reflexion Loading sections | 7 lane commands (~30 lines each) | Dead code |
| `docs/concepts/improvement-bus.md` | 400 lines | Phantom spec |
| `docs/concepts/self-improvement.md` | 707 lines | Phantom spec |
| `/self-improve` command | 330 lines | Phantom 10-step router |

---

## Part 2: What Actually Works

### 2.1 Thinking Tools
Commands: `/deepthink`, `/think`, `/problem-solve`, `/challenge`

Single agent, single session, structured prompts. cognition-mcp stores intermediate reasoning. Forces exploration that default Claude skips.

**Status**: WORKS. Enhancement needed (Phase 0.5 Memory Query).

### 2.2 Planning Pipeline
Command: `/requirements`

Structured Q&A protocol. Forces user to answer questions. Produces specs that survive context compaction.

**Status**: WORKS.

### 2.3 Lane Routing
Commands: `/nextjs`, `/ios`, `/expo`, `/django-react`, `/rvry`, `/seo`

Flag parsing, complexity detection, agent selection. Role separation (architect, builder, reviewer, gate).

**Status**: Routing WORKS. Context passing BROKEN. Dead middleware present.

### 2.4 Memory Storage
Systems: Workshop SQLite, auto-memory, project-context MCP

Storage mechanisms work. Data goes in.

**Status**: Storage WORKS. Retrieval BROKEN (nothing reads before acting).

### 2.5 Quality Gates
Systems: `gate-enforcement.sh`, standards-enforcer agents, verification agents

Hook-based gates work. Blueprint gate blocks code during planning. Verification gate checks commands ran.

**Status**: WORKS. Write-side BROKEN (garbage gotchas).

---

## Part 3: Visual Architecture (End-State)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        WORKSHOP SQLite (workshop.db)                         │
│                                                                              │
│   decisions(121)    gotchas(0 after cleanup)    notes(611)                   │
│                                                                              │
└───────────┬──────────────────────────────────────────────────────┬───────────┘
            │                                                      │
            │  READ PATHS                              WRITE PATHS │
            │                                                      │
     ┌──────┴──────┐ ┌────────────────┐           ┌──────┴──────┐ ┌────────────────┐
     │             │ │                │           │             │ │                │
     ▼             ▼ ▼                │           ▼             ▼ ▼                │
┌────────────┐ ┌─────────────────┐    │    ┌────────────┐ ┌─────────────────┐     │
│ EXPLORATION│ │ LANE COMMANDS   │    │    │ EXPLORATION│ │ GATE AGENTS     │     │
│            │ │                 │    │    │            │ │                 │     │
│ /deepthink │ │ /nextjs         │    │    │ /deepthink │ │ standards-      │     │
│ /think     │ │ /ios            │    │    │ /think     │ │ enforcer        │     │
│ /problem-  │ │ /expo           │    │    │ /problem-  │ │ ui-reviewer     │     │
│ solve      │ │ query_context   │    │    │ solve      │ │ verification    │     │
└─────┬──────┘ └───────┬─────────┘    │    └─────┬──────┘ └───────┬─────────┘     │
      │                │              │          │                │               │
      │ workshop       │ returns      │          │ workshop       │ save_standard │
      │ search         │ ContextBundle│          │ note           │ MCP call      │
      │ workshop why   │ with         │          │ (harvest)      │ [FIX]         │
      │ [FIX]          │ relatedStds  │          │                │               │
      │                │              │          │                │               │
      ▼                ▼              │          ▼                ▼               │
                                      │                                           │
┌─────────────────────────────────────┴───────────────────────────────────────────┘
│                                                                                  │
│                       COGNITION (.claude/cognition/)                             │
│                                                                                  │
│   Session files persisted per exploration                                        │
│   [FIX] Explorations list related files before starting                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATORS (17 files)                               │
│                                                                                  │
│   Receive ContextBundle with relatedStandards from lane command                  │
│   [FIX] Extract standards, include ACTIVE STANDARDS in Task prompt               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Task() with ACTIVE STANDARDS
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           BUILDER AGENTS                                         │
│                                                                                  │
│   Receive prompt with standards visible                                          │
│   Can apply standards during implementation                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Implementation Spec

### TIER 1: Fix Exploration Read-Side (Priority: HIGHEST)

**Impact**: Explorations will use prior context instead of starting fresh every time.

**Files**:
- `commands/deepthink.md`
- `commands/think.md`
- `commands/problem-solve.md`

**Change**: Add Phase 0.5 Memory Query (~30 lines each)

```markdown
## Phase 0.5: Memory Query (Before ENTER)

Before starting exploration, query project memory for relevant context.

### 0.5.1 Extract Keywords
From the problem statement, extract 3-5 key terms:
- Topic words (e.g., "context", "orchestration", "standards")
- Domain words (e.g., "nextjs", "ios", "orca-os")
- Problem type (e.g., "broken", "missing", "design")

### 0.5.2 Query Workshop
```bash
workshop --workspace .claude/memory search "<keywords>" --limit 5 2>/dev/null || true
workshop --workspace .claude/memory why "<topic>" 2>/dev/null || true
```

### 0.5.3 Query Cognition Files
```bash
ls -la .claude/cognition/*<topic>* 2>/dev/null | head -5
```

If relevant files found, read the first 50 lines for summary.

### 0.5.4 Compile Prior Context

If prior context found, include in cognition ENTER call:
```typescript
{
  operation: "thought",
  sessionTitle: "DeepThink: <summary>",
  content: {
    thought: "Prior context loaded:\n- <workshop findings>\n- <related sessions>\n\nStarting exploration with this foundation.",
    thoughtNumber: 0,
    totalThoughts: 12,
    nextThoughtNeeded: true
  }
}
```

If no prior context found, proceed directly to Phase 1.
```

### TIER 2: Fix Write-Side (Priority: HIGH)

**Impact**: Future gotchas will be structured and useful.

**A. Clean garbage gotchas**:
```bash
sqlite3 .claude/memory/workshop.db "DELETE FROM entries WHERE type='gotcha';"
```

**B. Fix gate agents (11 files)**:

Files:
- `agents/os-dev/os-dev-standards-enforcer.md`
- `agents/nextjs/nextjs-design-reviewer.md`
- `agents/nextjs/nextjs-standards-enforcer.md`
- `agents/iOS/ios-standards-enforcer.md`
- `agents/iOS/ios-ui-reviewer.md`
- `agents/expo/expo-standards-enforcer.md`
- `agents/expo/expo-verification-agent.md`
- `agents/typography/typography-orchestrator.md`
- `agents/django-react/django-react-standards-enforcer.md`

Change from:
```bash
workshop --workspace .claude/memory gotcha "<text>"
```

Change to:
```typescript
mcp__project-context__save_standard({
  what_happened: "<specific failure that occurred>",
  cost: "<consequence of the failure>",
  rule: "<actionable rule to prevent recurrence>",
  domain: "<domain: nextjs/ios/expo/etc>"
})
```

### TIER 3: Fix Subagent Context (Priority: MEDIUM)

**Impact**: Builders will see standards from Workshop.

**Files**: 17 orchestrator files (10 light + 7 grand)

Light orchestrators:
- `agents/nextjs/nextjs-light-orchestrator.md`
- `agents/expo/expo-light-orchestrator.md`
- `agents/iOS/ios-light-orchestrator.md`
- `agents/django-react/django-react-light-orchestrator.md`
- `agents/rvry/rvry-grand-architect.md`
- `agents/os-dev/os-dev-grand-architect.md`

**Change 1**: In "Extract" section, add:
```markdown
- relatedStandards (array of rules from project memory)
```

**Change 2**: In Task prompt template, add after CONSTRAINTS:
```markdown
ACTIVE STANDARDS (from project memory):
<for each standard in relatedStandards:>
- <standard.rule> (learned from: <standard.what_happened>)
<if no standards:>
(No standards recorded for this domain yet.)

These rules were learned from past failures in this project. Apply them.
```

### TIER 4: Strip Phantom Code (Priority: LOW)

**Impact**: Cleanup. Removes dead code and wasted context tokens.

| Task | Files | Method |
|------|-------|--------|
| Remove Knowledge Loading | ~127 agents | `grep -r 'agent-knowledge' agents/`, remove ~5-line blocks |
| Remove Knowledge Persistence | ~20 builders | `grep -r 'Knowledge Persistence' agents/`, remove ~10-15-line blocks |
| Remove Reflexion Loading | 7 lane commands | Remove `### 1.1.1 Reflexion Loading` sections |
| Delete phantom docs | 2 files | `rm docs/concepts/improvement-bus.md docs/concepts/self-improvement.md` |
| Rewrite /self-improve | 1 file | 330 lines → ~50 lines showing Workshop stats |

**Verification**: `grep -r 'agent-knowledge\|improvement-event\|patterns.json' agents/ commands/ docs/` = 0 matches

---

## Part 5: Self-Improvement Loop (Actual Design)

The phantom improvement-bus had 10 steps and 1,107 lines of documentation. Here's what actually needs to exist:

### 5.1 What the Loop Should Do

```
Gate detects failure
    ↓
Gate writes structured standard via save_standard MCP
    ↓
Standard stored in Workshop (gotcha type)
    ↓
Next task in same domain triggers lane command
    ↓
Lane command calls query_context
    ↓
query_context calls queryStandards(domain)
    ↓
Standards returned in ContextBundle
    ↓
Orchestrator extracts standards
    ↓
Orchestrator includes in Task prompt to builder
    ↓
Builder sees and applies standards
    ↓
Fewer failures → fewer new standards needed
```

### 5.2 What's Missing From This Loop

1. **Explorations don't participate**: /deepthink, /think, /problem-solve don't query standards. They could benefit from knowing "we've analyzed this topic before."

2. **No cross-domain learning**: Standards are domain-scoped. A pattern learned in nextjs doesn't help in expo even if it's applicable.

3. **No promotion path**: Frequently-applied standards should be promoted to CLAUDE.md rules. Currently manual.

4. **No staleness cleanup**: Old standards accumulate. No decay or archival.

### 5.3 /self-improve Rewrite

Current: 330 lines describing phantom 10-step event router.

New (~50 lines):
```markdown
# /self-improve - Workshop Standards Management

Show standards status and manage the learning loop.

## Usage
/self-improve                    # Show stats
/self-improve --domain nextjs    # Show domain-specific standards
/self-improve --cleanup          # Remove stale standards (>90 days)
/self-improve --promote          # Suggest standards for CLAUDE.md promotion

## Stats Display
```bash
# Count standards per domain
sqlite3 .claude/memory/workshop.db "
  SELECT
    CASE WHEN content LIKE '%[nextjs]%' THEN 'nextjs'
         WHEN content LIKE '%[ios]%' THEN 'ios'
         WHEN content LIKE '%[expo]%' THEN 'expo'
         ELSE 'other' END as domain,
    COUNT(*)
  FROM entries
  WHERE type='gotcha'
  GROUP BY domain
"
```

## Promotion Criteria
Standards that appear in 3+ sessions should be considered for CLAUDE.md:
- Extract the rule text
- Add to project CLAUDE.md "Learned Rules" section
- Delete from Workshop (now enforced at higher level)
```

---

## Part 6: Verification Protocol

After implementing each tier, verify:

### TIER 1 Verification (Exploration Read-Side)
```bash
# 1. Run /deepthink on a topic with prior sessions
/deepthink "context passing in ORCA-OS"

# 2. Check that ORIENT includes "Prior context loaded:"
# 3. Verify Workshop search was called in Phase 0.5
```

### TIER 2 Verification (Write-Side)
```bash
# 1. Trigger a gate failure intentionally
# 2. Check that save_standard MCP was called (not workshop gotcha)
# 3. Query Workshop:
sqlite3 .claude/memory/workshop.db "SELECT * FROM entries WHERE type='gotcha' ORDER BY timestamp DESC LIMIT 1"
# 4. Verify structure has what_happened, cost, rule fields
```

### TIER 3 Verification (Subagent Context)
```bash
# 1. Add a test standard:
mcp__project-context__save_standard({
  what_happened: "Test failure",
  cost: "Test cost",
  rule: "Test rule for verification",
  domain: "nextjs"
})

# 2. Run /nextjs on a task
# 3. Check builder's Task prompt contains "ACTIVE STANDARDS"
# 4. Verify "Test rule for verification" appears
```

---

## Part 7: Session Resume Info

To continue this work in a new session:

1. Read this document first
2. Check cognition session `bbc28370` for verified analysis details
3. Start with TIER 1 (exploration read-side) - highest impact
4. Use `/requirements` to create implementation spec before coding

Key files to read:
- `commands/deepthink.md` (add Phase 0.5)
- `agents/nextjs/nextjs-light-orchestrator.md` (example orchestrator)
- `mcp/project-context-server/src/workshop.ts` (how standards are stored/queried)

---

*This document contains VERIFIED findings. Previous analyses assumed mechanisms work without checking. If something in this document seems wrong, verify it by reading actual code and querying actual databases.*

---

## Part 8: Implementation Status (OS 7.0)

**Updated**: 2026-02-28

### Completed Tiers

| Tier | Description | Status |
|------|-------------|--------|
| TIER 1 | Fix Exploration Read-Side (Phase 0.5a) | DONE - Added to /deepthink, /think, /problem-solve |
| TIER 2 | Fix Write-Side (save_standard MCP) | DONE - 11 gate agents updated |
| TIER 3 | Fix Subagent Context (ACTIVE STANDARDS) | DONE - 17 orchestrators updated |
| TIER 4 | Strip Phantom Code | DONE - Removed from 113 agent files |
| TIER 5 | Clarify Flag for Thinking Commands | DONE - Optional deeper exploration |
| TIER 6 | Delete Phantom Docs | DONE - improvement-bus.md, self-improvement.md deleted |
| TIER 7 | Version Bump to 7.0 | DONE - All files updated |

### Verification Results

```bash
# Phantom code removed
grep -r 'agent-knowledge' agents/ | wc -l  # 0
grep -r 'patterns.json' agents/ | wc -l    # 0
grep -r 'improvement-event' agents/ | wc -l # 0

# Version updated
grep -r 'OS 7.0' agents/ | wc -l           # 189
grep -r 'OS 7.0' commands/ | wc -l         # 6
```

### OS 7.0 Architecture Summary

1. **Four Feedback Loops**: Exploration Read-Side, Gate Write-Side, Subagent Context, Session Continuity
2. **ProjectContext as Hub**: All memory access through single MCP
3. **Structured Standards**: `save_standard` MCP replaces garbage `workshop gotcha`
4. **Clean Agents**: No phantom Knowledge Loading/Persistence sections

---

_OS 7.0 implementation complete. No phantom code. All feedback loops verified._
