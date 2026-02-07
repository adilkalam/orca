# Research Domain Pipeline

**Status:** OS 5.2 Pipeline (Research)  
**Last Updated:** 2025-11-27

---

## Overview

The Research pipeline handles work where the primary output is a **research
artifact**, not a code change:

- Deep web research with citations (Perplexity / Anthropic-style).
- Market maps and competitive analyses.
- Literature reviews and technical deep dives.
- Cross-doc / cross-repo investigations where the result is a report.

It combines:

- OS 5.2 primitives (`phase_state.json`, Workshop, code-index.db, ProjectContext).
- A dedicated **Research lane** with `/research` as entrypoint.
- Crawl4AI MCP for web crawling and content extraction.
- Direct orchestration from `/research` command (flat agent hierarchy).
- Writer and gate agents modeled after Perplexity and Anthropic research
  systems.

The goal is to produce **cited, trustworthy, and structurally consistent**
research outputs while making tool limits and uncertainties explicit.

---

## Scope & Domain

Use this pipeline when:

- The user’s question is primarily about **information**, not code edits.
- You expect to consult multiple web sources or long-form documents.
- The output should be:
  - A structured answer with citations, or
  - A deep report (e.g. `/research --deep`).

Avoid this pipeline when:

- The task is a direct implementation request – use `/orca` and domain lanes.
- The question can be answered from immediate context without research.

---

## Entry Point and Modes

- `/research "question"` – Standard mode.
  - `/research` orchestrates directly, spawning subagents sequentially.
  - Uses `research-answer-writer` for output.
- `/research --deep "question"` – Deep mode.
  - Same pipeline, but:
    - Complexity defaults to `deep`.
    - Multiple evidence loops allowed.
    - Uses `research-deep-writer` for long-form output.

In both modes, `/research` is an **orchestrator-only** command:
- It never edits project code.
- It spawns subagents directly via `Task` (flat hierarchy, no nested delegation).

---

## Phase State Contract (`phase_state.json`)

All Research pipeline work shares a common phase state file:

```text
.claude/orchestration/phase_state.json
```

For `domain: "research"`, see
`docs/reference/phase-configs/research-phase-config.yaml` for full details.
Key top-level fields:

- `domain`: `"research"`.
- `mode`: `"standard"` or `"deep"`.
- `complexity_tier`: `"simple" | "medium" | "deep"`.
- `current_phase`: current phase name.
- `tool_status`: map of tool health (`crawl4ai`, `web_search`, etc.).
- `tool_error_events`: list of Crawl4AI/WebSearch error events.

Each phase writes a structured entry under `phase_state.phases.<name>`:

- `scoping` – user intent, scope, timeframe, initial questions.
- `memory_context` – memory hits and project links.
- `research_plan` – subquestions, strategies, evaluation criteria.
- `evidence_gathering` – evidence artifacts, source summary, RA events.
- `synthesis_pass1` – outline, key findings, remaining gaps.
- `gap_analysis` – additional queries, unresolved questions, more-research
  decision.
- `report_draft` – draft report path and style.
- `citation_gate` – report with citations, citations status.
- `consistency_gate` – quality score, gate decision, issues.
- `completion` – final report path, outcome, learnings.

---

## Pipeline Architecture

```text
Request (Research question)
    ↓
/research (standard or --deep)
    ↓
[Phase 1: Parse & Plan]         ← /research plans subquestions directly
    ↓
[Phase 2: Evidence Gathering]   ← spawns web-search/site-crawler subagents SEQUENTIALLY
    ↓
[Phase 3: Evidence Synthesis]   ← /research reads Evidence Notes, checks gaps
    ↓
[Phase 3.5: Gap Analysis]       ← more research? (max 3 iterations)
    ↓
[Phase 4: Report Draft]         ← spawns research-answer-writer or research-deep-writer
    ↓
[Phase 5: Citation Gate]        ← spawns research-citation-gate
    ↓
[Phase 6: Consistency Gate]     ← spawns research-consistency-gate
    ↓
[Phase 7: Return Results]       ← /research returns final report to user
```

**Note:** Claude Code does not support nested subagent spawning. All agents are
spawned directly by `/research` (flat hierarchy).

---

## Agents

Core agents for this lane (all spawned directly by `/research`):

- `research-web-search-subagent` – WebSearch + Crawl4AI for web search and
  content extraction, producing Evidence Notes.
- `research-site-crawler-subagent` – Crawl4AI crawl specialist for deep
  coverage of specific domains.
- `research-answer-writer` – Perplexity-style answer writer (standard mode).
- `research-deep-writer` – long-form academic writer (deep mode).
- `research-citation-gate` – citation insertion and audit.
- `research-consistency-gate` – consistency, coverage, and RA/limitations gate.
- `research-fact-checker` – optional fact verification agent.

### Agent Roles Note

**Exception: research-citation-gate**

Unlike other gates that only validate, `research-citation-gate` has Write permission
and modifies the report to insert citations. This follows Anthropic's architecture
where the Citation Agent produces the final cited output. The "gate" naming reflects
its position in the pipeline (post-draft, pre-consistency) rather than write restrictions.

Existing Data agents (`research-specialist`, `data-researcher`,
`python-analytics-expert`, `competitive-analyst`) can be invoked via `Task`
for quantitative analysis or competitive mapping when needed.

---

## Crawl4AI & Fallback Strategy

The Research lane uses **WebSearch + Crawl4AI**:

- Preferred tools:
  - `WebSearch` for open web queries and discovery.
  - `mcp__crawl4ai__md` for extracting markdown from specific URLs.
  - `mcp__crawl4ai__crawl` for batch URL crawling.
- Fallbacks when Crawl4AI is unavailable:
  - `WebFetch` for content retrieval.
  - Memory-only synthesis (Workshop + code-index.db + prior reports).

Tool errors are treated as **first-class signals**, not random failures:

- Subagents record `#TOOL_ERROR` and `#CONTEXT_DEGRADED` RA tags when
  tool failures affect coverage.
- `tool_status.crawl4ai` and `tool_error_events[]` capture details in
  `phase_state`.
- Writers and gates must surface these limitations explicitly in the final
  report (Methodology and Limitations sections).

---

## RA in Research

Research-specific RA tags include:

- `#LOW_EVIDENCE` – important claim with thin evidence.
- `#SOURCE_DISAGREEMENT` – credible sources conflict.
- `#SUSPECT_SOURCE` – low-credibility or heavily biased sources.
- `#OUT_OF_DATE` – evidence older than the requested time window.
- `#TOOL_ERROR` – Crawl4AI or other tools encountered errors.
- `#CONTEXT_DEGRADED` – had to operate with partial context or memory only.
- `#SCOPE_EXCEEDED` – query demands more time/budget than available.

Gates use these tags to decide whether to:

- Pass the report.
- Return with **CAUTION** and highlight limitations.
- Fail and suggest rerunning with narrower scope or more budget.

---

## Memory Management

**Claude Code runs on Node.js with a default ~4GB heap limit.** Deep research
tasks can exhaust this limit, causing crashes.

### Constraints Enforced

1. **Sequential spawning only** - `/research` spawns ONE subagent at a time,
   waits for completion, then spawns the next. Never parallel.
2. **Evidence Note size limit** - subagents keep notes under 300 lines.
3. **Page extraction limits** - max 3 pages per web search, max 5 pages per
   site crawl.

### Symptoms of Memory Exhaustion

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

If this occurs:
- Reduce concurrent agents to 2
- User can increase heap: `export NODE_OPTIONS="--max-old-space-size=8192"`
- Consider running deep research in multiple shorter sessions

### Why This Happens

- Each Task agent keeps full conversation context in memory
- 6+ parallel agents = 6x context accumulation
- Large Evidence Notes (500+ lines each) compound the problem
- Conversation compaction happens at 95% capacity, often too late

---

## Completion & Learning Loop

On completion, `/research`:

- Saves task history via `mcp__project-context__save_task_history` with:
  - `domain: "research"`.
  - `task`: original question.
  - `outcome`: `success`, `partial`, or `failure`.
  - `learnings`: notable patterns (e.g., common RA issues, Crawl4AI usage).
- Future research tasks can query this history via Workshop and ProjectContext,
  allowing the lane to:
  - Reuse prior research artifacts.
  - Harden standards around evidence coverage and limitations.
