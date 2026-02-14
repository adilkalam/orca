---
description: "OS 6.0 Research lane entrypoint for deep, cited research"
argument-hint: "[--deep] [--time N] <research question>"
allowed-tools:
  - Task
  - Read
  - Write
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
---

# /research - Research Lane Orchestrator

## YOUR ROLE: DIRECT ORCHESTRATION

You are the orchestrator. You spawn all subagents directly - there is no lead agent.
Claude Code does not support nested subagent spawning, so YOU must do all delegation.

**Your subagents:**
- `research-web-search-subagent` - WebSearch + Crawl4AI for web queries
- `research-site-crawler-subagent` - Deep crawling of specific domains
- `research-answer-writer` - Standard research reports
- `research-deep-writer` - Long-form deep research
- `research-citation-gate` - Citation verification
- `research-consistency-gate` - Consistency checks

---

## Phase 0: Create Research Folder (MANDATORY FIRST STEP)

**BEFORE doing anything else**, create a dated research folder:

```bash
# Generate folder name: YYYY-MM-DD-Topic-Slug
# Example: 2025-12-25-Technical-Trading-Patterns
RESEARCH_DIR=".claude/research/$(date +%Y-%m-%d)-<Topic-Slug>"
mkdir -p "$RESEARCH_DIR/evidence"
```

**Naming rules for Topic-Slug:**
- Use 2-4 words from the research question
- Title case with hyphens
- Examples: `LLM-Reasoning-Techniques`, `Chart-Pattern-Detection`, `React-State-Management`

**All research output goes into this folder:**
- `$RESEARCH_DIR/evidence/` - Evidence Notes from subagents
- `$RESEARCH_DIR/synthesis.md` - Evidence synthesis
- `$RESEARCH_DIR/report.md` - Final research report
- `$RESEARCH_DIR/temp/` - Temporary crawl data (cleaned up after)

**CRITICAL: Pass the $RESEARCH_DIR path to ALL subagents in their prompts.**

---

## Phase 1: Parse Arguments (FAST - under 10 seconds)

`$ARGUMENTS` may include:
- `--deep` - deep, long-form research (uses research-deep-writer)
- `--time N` - time budget in minutes (default: 5)
- Plain text - the research question

Extract these values and move on. No deliberation.

---

## Phase 2: Prompt Size Check

If the user's question exceeds ~1500 words or contains 3+ explicit "phases":

```
This research request is very large. To avoid memory issues, please split it:
1. Run `/research --time N [first part]`
2. After that completes, run the next part
```

Otherwise, proceed.

---

## Phase 3: Plan Subquestions

Break the research query into 3-6 specific subquestions. Keep them focused and searchable.

Example for "What are the best practices for LLM structured reasoning?":
1. What structured reasoning techniques exist for LLMs? (chain-of-thought, tree-of-thought, etc.)
2. What does recent research say about LLM reasoning limitations?
3. What cognitive science principles apply to structured reasoning?
4. What are practical implementation patterns?

Save plan to Workshop:
```bash
workshop note "Research plan: {topic}
Subquestions:
1. {sq1}
2. {sq2}
...
Time budget: {minutes}min" -t research -t plan
```

---

## Phase 4: Evidence Gathering (SEQUENTIAL SPAWNING)

### CRITICAL: MEMORY CONSTRAINTS

**ALWAYS SPAWN SUBAGENTS SEQUENTIALLY. NEVER IN PARALLEL.**

Claude Code runs on Node.js with ~4GB heap. Even 2 parallel subagents can crash.

### Pattern: One at a Time

For EACH subquestion:

1. **Spawn ONE subagent** (pass $RESEARCH_DIR in prompt):
```
Task tool call:
  subagent_type: "research-web-search-subagent"
  prompt: |
    Research subquestion: [specific question]
    Timeframe: [recency requirements if any]

    RESEARCH_DIR: [full path, e.g., .claude/research/2025-12-25-Technical-Trading]
    Write Evidence Note to: $RESEARCH_DIR/evidence/
    Use temp folder: $RESEARCH_DIR/temp/
```

2. **Wait for it to complete and return**

3. **Read the Evidence Note it created**

4. **Then spawn the next subagent**

**NEVER use `run_in_background: true`**
**NEVER spawn 2+ agents in the same message**

### Hard Limits

| Constraint | Limit |
|------------|-------|
| Concurrent subagents | **1** (sequential only) |
| Evidence Note length | **300 lines max** |
| Max research iterations | **3** |

---

## Phase 5: Evidence Synthesis

After all subagents return:

1. Read all Evidence Notes from `$RESEARCH_DIR/evidence/`
2. Check for gaps or conflicts
3. If critical gaps AND iteration < 3: spawn more subagents for gaps
4. If iteration >= 3 OR gaps minor: proceed to writing

Document synthesis in `$RESEARCH_DIR/synthesis.md`

---

## Phase 6: Writing

Spawn the appropriate writer:

**For standard research (no --deep flag):**
```
Task tool call:
  subagent_type: "research-answer-writer"
  prompt: |
    Write research report on: [topic]

    RESEARCH_DIR: [full path]
    Evidence files: $RESEARCH_DIR/evidence/*.md
    Output to: $RESEARCH_DIR/report.md
```

**For --deep research:**
```
Task tool call:
  subagent_type: "research-deep-writer"
  prompt: |
    Write deep research report on: [topic]

    RESEARCH_DIR: [full path]
    Evidence files: $RESEARCH_DIR/evidence/*.md
    Output to: $RESEARCH_DIR/report.md
```

---

## Phase 7: Quality Gates

After writer returns, run gates sequentially:

1. **Citation gate:**
```
Task tool call:
  subagent_type: "research-citation-gate"
  prompt: |
    Verify citations in: [draft path]
    Evidence files: [list]
```

2. **Consistency gate:**
```
Task tool call:
  subagent_type: "research-consistency-gate"
  prompt: |
    Check consistency of: [draft path]
```

---

## Phase 8: Return Results

Return the final report to user with:
- The research findings
- Source citations
- Any RA tags from evidence (LOW_EVIDENCE, SOURCE_DISAGREEMENT, etc.)
- **Full path to the research folder**: `$RESEARCH_DIR`
- Contents: `$RESEARCH_DIR/report.md`, `$RESEARCH_DIR/synthesis.md`, `$RESEARCH_DIR/evidence/`

### PDF Generation Offer

After presenting results, ask:

> Would you like a PDF version of the synthesis or full report?

If user accepts, run:
```bash
bash ~/.claude/scripts/utilities/md-to-pdf.sh $RESEARCH_DIR/report.md
```

For synthesis PDF: `bash ~/.claude/scripts/utilities/md-to-pdf.sh $RESEARCH_DIR/synthesis.md`

Supports `--serif` (Financier) and `--sans` (Calibre) flags. Default is Founders Grotesk.

---

## Response Awareness Tags

Propagate these from subagent reports:
- `#LOW_EVIDENCE` - few/weak sources found
- `#SOURCE_DISAGREEMENT` - sources conflict
- `#TOOL_ERROR` - subagent reported tool failures
- `#RETRY_EXHAUSTED` - subquestion failed after 3 attempts
- `#OUT_OF_DATE` - sources outside recency window

---

## Time Budget Management

Track time and stop for synthesis when budget is low:
- Reserve 30% of time budget for writing and gates
- Stop evidence gathering when `remaining < reserve`

---

## Error Handling

If a subagent fails:
1. Log the failure
2. Retry once with refined query
3. If still fails, mark subquestion with #RETRY_EXHAUSTED
4. Continue with remaining subquestions
5. Note gaps in final report
