# SEO Domain Pipeline

**Status:** OS 5.2 Pipeline (SEOPipeline)
**Last Updated:** 2026-01-04

## Overview

The SEO pipeline turns a target keyword + project context into:
- A research-backed SEO brief.
- A long-form draft optimized for clarity, search, and compliance.
- A structured QA report with explicit gates.

It combines:
- OS 5.2 primitives (ProjectContextServer, `phase_state.json`, code-index.db, Workshop)
- Memory-first context (Workshop + code-index.db before ProjectContext)
- SEO agents:
  - `seo-research-specialist` (lead)
  - `seo-brief-strategist`
  - `seo-draft-writer`
  - `seo-quality-guardian`
  - `seo-optimizer` (content optimization against SERP)

**Entry Points:**
- `/seo` command - preferred entry point
- `/orca` with SEO-detected task - routes to seo-research-specialist

The detailed configuration lives in `docs/reference/phase-configs/seo-phases.yaml`.

**Note:** The SEO pipeline is specialist-based (no grand-architect). The `/seo` command or `/orca` delegates to `seo-research-specialist` to lead the workflow.

---
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
1. **SERP Discovery** (WebSearch) - Top competitors, "People also ask", intent clues
2. **Direct File Research** (PRIMARY) - Before checking KG:
   - `/obsidian-peptides/docs/research/` - Curated research documents
   - `/obsidian-peptides/data/peptides/` - Peptide-specific data files
3. **Knowledge Graph** (SUPPLEMENTARY) - Can miss things, supplements direct files
4. **Web Research** (WebFetch):
   - Read and analyze top 3-5 SERP competitor pages
   - Gap research from authoritative external sources
5. **External Research Papers** - E-E-A-T citations from research index

Tasks:
- Use WebSearch to identify top SERP competitors, intent cues, and common questions
- Search direct research files in obsidian-peptides (PRIMARY source)
- Supplement with knowledge graph analysis (KG can miss things)
- Fetch and analyze top SERP competitors via WebFetch (3–5 pages)
- Fill research gaps with authoritative external sources
- Identify:
  - Primary/secondary keywords
  - Search intent and SERP features
  - Competitor content structure and gaps
  - Unique angles vs competition

Outputs (see `seo-phases.yaml` for exact files):
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

Gates (see `seo-phases.yaml` for thresholds):
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
