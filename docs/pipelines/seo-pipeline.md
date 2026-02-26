# SEO Domain Pipeline

**Status:** OS 6.4 Pipeline (SEOPipeline)
**Last Updated:** 2026-02-13

## Overview

The SEO pipeline turns a target keyword + project context into:
- A research-backed SEO brief.
- A long-form draft optimized for clarity, search, and compliance.
- A structured QA report with explicit gates.

It combines:
- OS 6.4 primitives (ProjectContextServer, `phase_state.json`, code-index.db, Workshop)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- GA4 (analytics-mcp) and GSC (mcp-gsc) integration for data-driven optimization
- SEO agents:
  - `seo-research-specialist` (lead) -- with GSC pre-research check
  - `seo-brief-strategist`
  - `seo-draft-writer`
  - `seo-quality-guardian`
  - `seo-optimizer` (content optimization against SERP + GA4/GSC audit mode)



The detailed configuration lives in `docs/reference/phase-configs/seo-phase-config.yaml`.

**Note:** The SEO pipeline is specialist-based (no grand-architect). The `/seo` command or `/orca` delegates to `seo-research-specialist` to lead the workflow.

---
## Entry Points

- `/seo` command - preferred entry point
- `/seo --optimize` - content optimization mode
- `/seo --audit` - quick effectiveness report (GA4/GSC data)
- `/seo --audit-full` - comprehensive effectiveness analysis
- `/orca` with SEO-detected task - routes to seo-research-specialist

---
## GA4/GSC Integration

The SEO pipeline integrates with Google Analytics 4 (analytics-mcp) and Google Search Console (mcp-gsc) for data-driven SEO decisions.

### MCP Requirements

| MCP | npm Package | Type | Purpose |
|-----|-------------|------|---------|
| analytics-mcp | `analytics-mcp` | pipx (stdio) | GA4 organic traffic, engagement, conversions |
| mcp-gsc | `mcp-server-gsc` | npx (stdio) | Search queries, positions, CTR, impressions (~500 tokens for comprehensive audit) |

Both authenticate via service account key file at `GOOGLE_APPLICATION_CREDENTIALS`. See `quick-reference/ORCA-OS/ORCA-mcps.md` for full auth setup.

### Integration Points

1. **Audit Mode (seo-optimizer):** `/seo --audit` and `/seo --audit-full` pull GA4 organic traffic (`run_report`) and GSC query data (`enhanced_search_analytics` with built-in quick wins detection) to generate effectiveness reports saved to `docs/SEO/audit-YYYY-MM-DD.md`.

2. **Auto-Pull During Optimization (seo-optimizer):** When `--optimize url` is used, the optimizer automatically pulls GA4 engagement data (`run_report`) and GSC query positions (`enhanced_search_analytics`) for the target URL to enrich optimization recommendations.

3. **Pre-Research GSC Check (seo-research-specialist):** Before keyword research begins, checks GSC (`enhanced_search_analytics`) for existing rankings. If we already rank for the keyword, shifts strategy from "create new content" to "optimize existing content."

### Graceful Degradation

All GA4/GSC integrations are optional. If MCPs are not configured:
- `--audit` displays setup instructions instead of failing
- `--optimize` proceeds with content-only analysis (current behavior)
- Research specialist skips GSC check silently

## Scope & Domain

Use this pipeline when:
- The request is clearly SEO/content focused:
  - e.g. "write SEO article on X", "optimize this page for Y keyword",
    "create SEO brief for topic Z".
- There is a clear target keyword or topic to rank for.

This pipeline assumes:
- Access to SEO research outputs (SERP analyses, KG files) when configured.
- Content lives in or is written to SEO output folders (e.g. `outputs/seo/`).

---
## Pipeline Architecture (High Level)

```text
Request (SEO brief/article/optimization)
    ↓
[Phase 1: Context & Intent]
    ↓
[Phase 2: Research (seo-research-specialist)]
    ↓
[Phase 3: Brief Refinement (seo-brief-strategist)]
    ↓
[Phase 4: Content Drafting (seo-draft-writer)]
    ↓
[Phase 5: Quality Assurance (seo-quality-guardian)]
    ↓
[Phase 6: Completion & Handoff]
```

---
## Phase Summaries

### Phase 1: Context & Intent

**Invoker:** `/seo-orca` (or equivalent orchestrator)

Tasks:
- Identify the primary keyword/topic and user intent.
- Initialize session metadata (slug, output directory, tracking).
- Query ProjectContextServer (`domain: "seo"`) to bring in:
  - Relevant project files.
  - Past decisions/standards for SEO.
  - Any existing SEO outputs for this project.

Artifacts:
- Phase state entry in `.claude/orchestration/phase_state.json` for domain `seo`.
- Session metadata (keyword, slug, output directory).

---

### Phase 2: Research

**Agent:** `seo-research-specialist`

Research Sources (in priority order):
1. **SERP Intelligence** (Ahrefs MCP) - Keyword data, search intent, SERP features
2. **Direct File Research** (PRIMARY) - Before checking KG:
   - `/obsidian-peptides/docs/research/` - Curated research documents
   - `/obsidian-peptides/data/peptides/` - Peptide-specific data files
3. **Knowledge Graph** (SUPPLEMENTARY) - Can miss things, supplements direct files
4. **Web Research** (crawl4ai MCP):
   - Top 3-5 SERP competitor pages scraped and analyzed
   - Gap research from authoritative external sources
5. **External Research Papers** - E-E-A-T citations from research index

Tasks:
- Perform SERP analysis via Ahrefs MCP
- Search direct research files in obsidian-peptides (PRIMARY source)
- Supplement with knowledge graph analysis (KG can miss things)
- Scrape and analyze top SERP competitors via crawl4ai
- Fill research gaps with authoritative external sources
- Identify:
  - Primary/secondary keywords
  - Search intent and SERP features
  - Competitor content structure and gaps
  - Unique angles vs competition

Outputs (see `seo-phase-config.yaml` for exact files):
- SERP summary (`serp.json`, `serp-summary.md`)
- Competitor analysis (`competitor-analysis.json`)
- Research report / JSON for downstream phases

---

### Phase 3: Brief Refinement

**Agent:** `seo-brief-strategist`

Tasks:
- Take the research pack and:
  - Refine the keyword strategy (primary, secondary, LSI).
  - Propose content structure (H1/H2/H3, sections).
  - Define E‑E‑A‑T signals and compliance notes.
  - Flag gaps or risky claims that need more data.

Outputs:
- Refined brief (e.g. `outputs/seo/${SLUG}-brief.md`).
- Strategic notes and TODO markers for missing data/compliance items.

---

### Phase 4: Content Drafting

**Agent:** `seo-draft-writer`

Tasks:
- Write a long-form draft aligned with:
  - The refined brief and research.
  - Project tone/voice.
  - Clarity and progressive disclosure heuristics.
- Apply the **plain-language-first rule**:
  - Never lead with jargon or exam-style definitions.
  - First explain the idea in clear, relevant, real-world terms.
  - Only then introduce scientific terminology in parentheses or short follow-ups.
  - “Explaining” means making the concept useful and contextual, not just defining a term.
- Ensure:
  - Target word count range (e.g. 1,500–2,500+ words).
  - Clear structure and scanability.

Outputs:
- Draft content file (e.g. `outputs/seo/${SLUG}-draft.md`).

---

### Phase 5: Quality Assurance (Gate)

**Agent:** `seo-quality-guardian`

Tasks:
- Run a multi-dimensional QA pass including:
  - Clarity/readability (clarity gates script).
  - Keyword usage and density.
  - Technical SEO (meta, headings, links, alt text opportunities).
  - Content depth and citations.
  - Compliance/safety (FDA/medical disclaimers and claims checks when applicable).
  - Standards from `contextBundle.relatedStandards` (SEO standards in `code-index.db`).
- Add TODO markers into the brief/draft where issues are found, rather than
  silently rewriting content.
- Generate a comprehensive QA report summarizing:
  - Overall status and key issues.
  - Critical / high / medium priority action items.
  - Files modified and artifacts created.

Gates (see `seo-phase-config.yaml` for thresholds):
- Clarity gate (score threshold).
- Keyword density gate (min/max).
- Word count gate (minimum).
- Citation gate (minimum external citations).
- Compliance gate (hard block).
- Standards gate (records violations for future enforcement).

Outputs:
- QA summary (e.g. `outputs/seo/${SLUG}-qa.md`).
- Clarity report JSON.
- Updated brief/draft files with TODOs.

---

### Phase 6: Completion & Handoff

**Invoker:** `/seo-orca`

Tasks:
- Ensure all phases are complete and QA artifacts exist.
- Save task history and standards into `code-index.db`:
  - Domain: `seo`.
  - Task description.
  - Outcome and key learnings.
  - Files modified/artifacts produced.
- Mark the content as ready for **human review**, not auto-publish.

Outputs:
- A fully-populated `outputs/seo/` folder with:
  - SERP, brief, draft, QA, and clarity artifacts.
- Updated `phase_state.json` entry for the SEO pipeline.
