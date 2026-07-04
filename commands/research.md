---
description: "OS 7.1 Research lane entrypoint for deep, cited research"
argument-hint: "[--deep] [--verify] [--time N] <research question>"
allowed-tools:
  - Agent
  - Read
  - Write
  - Grep
  - Glob
  - Bash
  - AskUserQuestion
---

# /research - Research Lane Orchestrator

## YOUR ROLE: DIRECT ORCHESTRATION

You are the orchestrator, running in the main thread. You spawn all subagents
directly via the `Agent` tool — there is no lead agent. Claude Code forbids
subagents from spawning subagents, so all delegation happens here, single-level,
one at a time. See `docs/reference/flatten-orchestration-pattern.md`.

**Your subagents:**
- `research-web-search-subagent` - WebSearch + Crawl4AI for web queries
- `research-site-crawler-subagent` - Deep crawling of specific domains
- `research-answer-writer` - Standard research reports
- `research-deep-writer` - Long-form deep research
- `research-citation-gate` - Citation verification (checks claims against `sources/`)
- `research-fact-checker` - Re-verification gate (always-on under `--deep`, opt-in via `--verify`)
- `research-consistency-gate` - Consistency checks

---

## Phase 0: Create Research Folder (MANDATORY FIRST STEP)

**BEFORE doing anything else**, create a dated research folder:

```bash
# Generate folder name: YYYY-MM-DD-Topic-Slug
# Example: 2025-12-25-Technical-Trading-Patterns
RESEARCH_DIR=".orca/research/$(date +%Y-%m-%d)-<Topic-Slug>"
mkdir -p "$RESEARCH_DIR/evidence" "$RESEARCH_DIR/sources"
```

**Naming rules for Topic-Slug:**
- Use 2-4 words from the research question
- Title case with hyphens
- Examples: `LLM-Reasoning-Techniques`, `Chart-Pattern-Detection`, `React-State-Management`

**All research output goes into this folder:**
- `$RESEARCH_DIR/evidence/` - Evidence Notes from subagents
- `$RESEARCH_DIR/sources/` - RETAINED raw fetched/crawled pages (primary evidence — never deleted)
- `$RESEARCH_DIR/synthesis.md` - Evidence synthesis
- `$RESEARCH_DIR/report.md` - Final research report
- `$RESEARCH_DIR/citation-audit.md` - Citation-gate audit output
- `$RESEARCH_DIR/sources/temp/` - Scratch for in-flight crawl data ONLY; partial files may be cleaned, retained raw pages may NOT

**CRITICAL: Pass the $RESEARCH_DIR path to ALL subagents in their prompts.**

### Initialize the phase_state research contract (FR-2.4)

Right after the scaffold, initialize the `.research` key in the shared phase_state
so the consistency gate's `tool_status` / `research_ra_events` inputs actually
exist (top-level `.research`, matching the `.gates` / `.verification` convention):

```bash
PHASE_STATE=".orca/orchestration/phase_state.json"
mkdir -p .orca/orchestration
[ -f "$PHASE_STATE" ] || echo '{}' > "$PHASE_STATE"
# Requires jq; initializes .research only if absent (idempotent, atomic write).
tmp="$(mktemp)"
jq '.research = (.research // {"tool_status": {}, "research_ra_events": []})' \
  "$PHASE_STATE" > "$tmp" && mv "$tmp" "$PHASE_STATE"
```

---

## Phase 1: Parse Arguments (FAST - under 10 seconds)

`$ARGUMENTS` may include:
- `--deep` - deep, long-form research (uses research-deep-writer)
- `--verify` - run the `research-fact-checker` re-verification gate (always-on under `--deep`)
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
workshop decision "Research plan: {topic} - {minutes}min budget, {N} subquestions" -r "Subquestions: {sq1}; {sq2}; ..."
```

---

## Phase 4: Evidence Gathering (SEQUENTIAL SPAWNING)

### Crawl4ai Health Probe (FR-2.4 — run BEFORE spawning any subagent)

Before spawning the crawl/search subagents, probe crawl4ai and record the result
into `phase_state.json .research.tool_status`:

```bash
PHASE_STATE=".orca/orchestration/phase_state.json"
if curl -s -m 3 http://localhost:11235/ >/dev/null 2>&1; then
  CRAWL4AI_STATUS="up"
else
  CRAWL4AI_STATUS="down"
fi
tmp="$(mktemp)"
jq --arg s "$CRAWL4AI_STATUS" '.research.tool_status.crawl4ai = $s' \
  "$PHASE_STATE" > "$tmp" && mv "$tmp" "$PHASE_STATE"
```

- If `up`: proceed normally (subagents prefer Crawl4AI for full-page capture).
- If `down`: continue **degraded** — subagents fall back to WebFetch (limited pages)
  and Memory-only mode. Tell each subagent crawl4ai is down so it does not waste
  retries on curl. **REQUIRE the final report's methodology note to state
  `crawl4ai: down (degraded capture)`** (pass this instruction to the writer in
  Phase 6).

### CRITICAL: MEMORY CONSTRAINTS

**ALWAYS SPAWN SUBAGENTS SEQUENTIALLY. NEVER IN PARALLEL.**

Claude Code runs on Node.js with ~4GB heap. Even 2 parallel subagents can crash.

### Pattern: One at a Time

For EACH subquestion:

1. **Spawn ONE subagent** (single-level via `Agent`, pass $RESEARCH_DIR in prompt):
```
Agent({
  subagent_type: "research-web-search-subagent",
  description: "Evidence gathering for one subquestion",
  prompt: `
    Research subquestion: [specific question]
    Timeframe: [recency requirements if any]

    RESEARCH_DIR: [full path, e.g., .orca/research/2025-12-25-Technical-Trading]
    Write Evidence Note to: $RESEARCH_DIR/evidence/
    Save RETAINED raw fetched pages to: $RESEARCH_DIR/sources/ (never delete them;
      use $RESEARCH_DIR/sources/temp/ only for in-flight scratch)
    crawl4ai status: [up | down] (if down, use WebFetch fallback, do not retry curl)
  `
})
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

### Harvest subagent RA tags into phase_state (FR-2.4, between-phases)

Fold each returning subagent's RA tags (especially `#TOOL_ERROR`) and any tool
availability it reported into the shared contract before writing. This is the
harvest the consistency gate later reads:

```bash
PHASE_STATE=".orca/orchestration/phase_state.json"
# Append one RA event per tag surfaced by a subagent (repeat per event).
tmp="$(mktemp)"
jq --arg agent "research-web-search-subagent" \
   --arg tag "#TOOL_ERROR" \
   --arg detail "crawl4ai timeout on <url>; used WebFetch fallback" \
   '.research.research_ra_events += [{"agent": $agent, "tag": $tag, "detail": $detail}]' \
   "$PHASE_STATE" > "$tmp" && mv "$tmp" "$PHASE_STATE"
# Update tool availability if a subagent reported a tool down/degraded:
# jq '.research.tool_status.<tool> = "down"' ...
```

Document synthesis in `$RESEARCH_DIR/synthesis.md`

---

## Phase 6: Writing

Spawn the appropriate writer:

**For standard research (no --deep flag):**
```
Agent({
  subagent_type: "research-answer-writer",
  description: "Write standard research report",
  prompt: `
    Write research report on: [topic]

    RESEARCH_DIR: [full path]
    Evidence files: $RESEARCH_DIR/evidence/*.md
    Raw sources: $RESEARCH_DIR/sources/ (carry raw paths into citations where present)
    Output to: $RESEARCH_DIR/report.md
    If crawl4ai was down this run, the methodology note MUST state: crawl4ai: down (degraded capture)
  `
})
```

**For --deep research:**
```
Agent({
  subagent_type: "research-deep-writer",
  description: "Write long-form deep research report",
  prompt: `
    Write deep research report on: [topic]

    RESEARCH_DIR: [full path]
    Evidence files: $RESEARCH_DIR/evidence/*.md
    Raw sources: $RESEARCH_DIR/sources/ (carry raw paths into citations where present)
    Output to: $RESEARCH_DIR/report.md
    If crawl4ai was down this run, the methodology note MUST state: crawl4ai: down (degraded capture)
  `
})
```

---

## Phase 7: Quality Gates

After writer returns, run gates sequentially:

1. **Citation gate:**
```
Agent({
  subagent_type: "research-citation-gate",
  description: "Verify citations in draft",
  prompt: `
    Verify citations in: $RESEARCH_DIR/report.md
    Evidence files: $RESEARCH_DIR/evidence/*.md
    Raw sources (check [evidence?] claims against these FIRST): $RESEARCH_DIR/sources/
    Write audit to: $RESEARCH_DIR/citation-audit.md
  `
})
```
Read the returned verdict before proceeding.

2. **Fact-checker re-verification gate** (FR-2.3):

Run the `research-fact-checker` **always-on under `--deep`**, and **opt-in via
`--verify`** otherwise. Skip only when neither `--deep` nor `--verify` is present.

```
Agent({
  subagent_type: "research-fact-checker",
  description: "Re-verify key claims against retained raw sources",
  prompt: `
    Draft report: $RESEARCH_DIR/report.md
    Evidence Notes: $RESEARCH_DIR/evidence/
    Raw sources: $RESEARCH_DIR/sources/

    Verification order: check the raw source in $RESEARCH_DIR/sources/ FIRST;
    live re-fetch (WebSearch/WebFetch) ONLY when the raw file is missing or
    insufficient. Return PASS | CAUTION | FAIL with specific findings.
  `
})
```
Read the returned decision; on FAIL, surface issues to the writer for a corrective pass.

3. **Consistency gate:**
```
Agent({
  subagent_type: "research-consistency-gate",
  description: "Check consistency of draft",
  prompt: `
    Check consistency of: [draft path]
  `
})
```
Read the returned verdict; branch on pass/fail.

---

## Phase 8: Return Results

Return the final report to user with:
- The research findings
- Source citations
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
