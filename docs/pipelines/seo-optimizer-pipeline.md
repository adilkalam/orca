# SEO Optimizer Pipeline (Existing Pages)

**Status:** OS 4.0 Adjacent Pipeline (SEOOptimizerPipeline)  
**Last Updated:** 2025-12-07

## Overview

The SEO Optimizer pipeline improves **existing pages** – not just long-form articles.
It is designed for:
- Application routes (e.g. calculators, dashboards, tools).
- Marketing/landing pages.
- Blog and protocol content.

It complements the content-focused **SEO Domain Pipeline** by focusing on:
- Technical and frontend SEO in the codebase.
- Structural SEO (headings, schema, internal links).
- Metadata and keyword strategy.
- E-E-A-T and authority/trust signals.

It combines:
- OS 4.0 primitives (ProjectContextServer, `phase_state.json`, Workshop/vibe.db).
- Marketing-and-SEO agents and skills from `_explore/_AGENTS/marketing-and-seo`:
  - `seo-structure-architect`
  - `seo-meta-optimizer`
  - `seo-keyword-strategist`
  - `seo-authority-builder`
  - `seo-specialist` (1/2)
  - `seo-content-optimizer` skill (content-focused analysis and quick wins)
  - `seo-keyword-cluster-builder` skill (clusters, hubs, internal linking)
  - `competitor-content-analyzer` skill (cluster-level competitor and gap analysis)
  - `landing-page-copywriter` skill (conversion-optimized landing copy patterns)
  - `code-seo-audit` prompt and frontend SEO guides

**Entry Points:**
- `/seo` with an optimization request (existing URL or file path).
- `/orca` with SEO-detected optimization tasks routed to the SEO optimizer lane.

The SEO Optimizer is **page-centric**: every run targets a specific URL/route
and writes a structured audit + fix plan for that target.

---
## When to Use This Pipeline

Use the SEO Optimizer when the request is clearly:
- “Optimize this existing page for SEO.”
- “Audit this route for SEO issues.”
- “Improve metadata and structure for this calculator/tool.”
- “Harden this page’s E-E-A-T and compliance signals.”

Examples:
- Optimize `/tools/bpc-157-calculator` for medical YMYL SEO.
- Audit `/protocols/glp1-muscle-preservation-guide` against current SEO standards.
- Improve metadata and internal linking for `/library` or `/tools`.

Do **not** use this pipeline for:
- Net-new content briefs/articles (use the SEO Domain Pipeline).
- Broad site-wide technical migrations (use Next.js or OS-Dev pipelines).

---
## Pipeline Architecture (High Level)

```text
Target (existing URL or route)
    ↓
[Phase 0: Target & Context Selection]
    ↓
[Phase 1: Technical/Code SEO Audit]
    ↓
[Phase 2: Structure & Schema]
    ↓
[Phase 3: Meta & Keywords]
    ↓
[Phase 4: Authority & E-E-A-T]
    ↓
[Phase 5: Synthesis & Fix Plan]
```

Each phase is page-specific and writes artifacts that can be tracked over time
and reused across sessions via ProjectContextServer and memory.

---
## Phases

### Phase 0: Target & Context Selection

**Invoker:** `/seo` (optimizer mode) or `/orca`

Tasks:
- Normalize the target:
  - URL path (e.g. `/tools/bpc-157-calculator`), and/or
  - Code/content path (e.g. `app/tools/bpc-157-calculator/page.tsx`).
- Discover relevant files using ProjectContextServer + file search:
  - Route/component files (Next.js app router, etc.).
  - Layouts and metadata helpers.
  - Content sources (MD/MDX, JSON, schema files).
- Load existing SEO strategy and standards for this project/domain.
- Determine whether the page is:
  - A **hub/strategic page** (e.g. calculator index, protocol library, major protocol),
  - A **supporting page** (spoke, detail view, or sub-tool),
  - Or a standalone page.

Artifacts:
- Phase state entry for domain `seo-optimizer` in `.claude/orchestration/phase_state.json`.
- Minimal context record keyed by slug/route:
  - target URL/route
  - primary file paths
  - last-audited timestamps (when available)

---

### Phase 1: Technical / Code SEO Audit

**Agent Role:** `technical-seo-auditor`  
**Sources:** `ai-seo-tools/prompts/code-seo-audit-prompt.txt`, `Frontend_SEO_Optimization.md`,
`seo-specialist-1.md`, `seo-specialist-2.md`

Tasks:
- Inspect the code that powers the page:
  - Head/meta implementation patterns.
  - Heading tags in components.
  - Rendering strategies (SSR/SSG vs CSR) for SEO-critical content.
  - URL patterns and routing configuration.
  - Image usage and alt text.
  - Framework-specific SEO features (e.g. Next.js metadata API).
- For calculators/tools and interactive app pages, additionally:
  - Verify that the **core value proposition and key inputs/outputs** are present
    in server-rendered HTML (not JS-only).
  - Ensure there is supporting explanatory content below the fold (not just a bare tool).
  - Flag technical issues that directly hurt conversion (broken forms, confusing flows,
    layout problems that hide CTAs).
- Flag issues such as:
  - Missing/duplicate H1s, broken heading hierarchy.
  - Client-only rendering of main content.
  - Missing or incomplete meta tags and open graph data.
  - Non-descriptive URLs or parameter-heavy routes.
  - Missing or invalid structured data.

Outputs:
- Detailed technical audit document with:
  - Code-level examples and file references.
  - Critical/High/Medium issues.
  - Framework-aware remediation guidance.
  - A short \"Conversion UX & Technical Blockers\" section to inform follow-up
    landing page and UX work.

Artifacts (project-dependent):
- Preferred: `content/SEO/{SLUG}-tech-audit.md`.
- Alternate: `outputs/seo/{SLUG}-tech-audit.md` in generic projects.

---

### Phase 2: Structure & Schema

**Agent:** `seo-structure-architect`  
**Skills:** `seo-keyword-cluster-builder`, `competitor-content-analyzer` (for hubs)

Tasks:
- Analyze current content structure and information architecture:
  - Header tag hierarchy (H1–H6).
  - Section ordering and logical flow.
  - Presence of tables, lists, and other snippet-friendly structures.
- Design an ideal structure for:
  - User comprehension.
  - Featured snippet / PAA opportunities.
  - Silo and cluster integrity.
- Recommend schema types and JSON-LD snippets:
  - Article/BlogPosting, FAQPage, HowTo.
  - WebApplication for calculators/tools.
  - BreadcrumbList and Organization/LocalBusiness as needed.
- Identify internal linking improvements:
  - Hubs and spokes for the topic.
  - Cross-links to existing clusters.

For **hub/strategic pages** (e.g. calculators index, protocol libraries, major
comparison pages), also:
- Use keyword cluster builder concepts to:
  - Place the page within a **topic cluster**.
  - Propose which pages should be spokes (existing + missing).
  - Recommend anchor text and linking patterns for hub ↔ spokes.
- Use competitor-content-analyzer concepts (where data is available) to:
  - Highlight cluster-level content gaps.
  - Suggest which new spokes would close those gaps.

Outputs:
- Structure blueprint:
  - Ideal H1/H2/H3 tree.
  - TOC proposal.
  - Recommended snippet patterns (lists, tables, steps).
- Schema recommendations with sample JSON-LD.
- Internal linking matrix for the target page.
- For hubs: a \"Cluster & Internal Linking\" section summarizing:
  - Cluster role (hub vs spoke),
  - Proposed spokes,
  - Cross-linking recommendations,
  - Key competitor-derived insights (when available).

Artifacts:
- `content/SEO/{SLUG}-structure-plan.md` (or equivalent).

---

### Phase 3: Meta & Keywords

**Agents:** `seo-meta-optimizer`, `seo-keyword-strategist`  
**Skill:** `seo-content-optimizer`

Tasks:
- Analyze current keyword targeting:
  - Primary and secondary keywords.
  - Keyword density vs best practices.
  - LSI and entity coverage.
- Assess search intent alignment:
  - Informational vs commercial vs transactional.
- Propose improvements:
  - Refined primary/secondary keyword set.
  - LSI/entity enrichment opportunities.
  - Question-based queries and snippet targets.
- Generate optimized metadata:
  - 3–5 candidate URL slugs.
  - 3–5 title tag variants (character/pixel aware).
  - 3–5 meta description variants.

Additionally, use patterns from the `seo-content-optimizer` skill to:
- Perform a lightweight on-page content review:
  - Keyword placement in title, H1, first 100 words, headings.
  - Basic readability and scanability checks (sentence/paragraph length, structure).
  - Quick-win opportunities (missing alt text, thin sections, obvious gaps).

Outputs:
- Keyword strategy package:
  - Primary, secondary, and LSI keyword list with densities.
  - Entity and concept map.
- Meta optimization package:
  - URL, title, and description candidates with lengths and notes.
- A \"Readability & On-Page UX\" subsection (or equivalent) summarizing the
  most important content-level quick wins from the analysis.

Artifacts:
- `content/SEO/{SLUG}-meta-plan.md`.

---

### Phase 4: Authority & E-E-A-T

**Agent:** `seo-authority-builder`  
**Skill (supporting):** `landing-page-copywriter` (for conversion-focused pages)

Tasks:
- Evaluate the page’s E-E-A-T posture, especially for YMYL topics:
  - Experience and first-hand evidence.
  - Expertise and credentials.
  - Authority signals (citations, mentions, partnerships).
  - Trust signals (legal pages, disclaimers, security, contact).
- Identify gaps vs project standards:
  - Missing disclaimers and regulatory context.
  - Weak author bios or absent author information.
  - Thin or low-quality citations.
- Recommend concrete upgrades:
  - Author and team components.
  - Enhanced About/Policy/Disclaimer sections.
  - Citation and reference patterns.
  - Structured data for organization/author.

For landing and commercial pages, also:
- Suggest opportunities—using landing-page-copywriter patterns—to:
  - Strengthen the hero value proposition and supporting copy while staying
    within E-E-A-T and regulatory constraints.
  - Improve CTA clarity and placement.
  - Integrate trust elements (testimonials, metrics, badges) alongside
    disclaimers and safety language.

Outputs:
- E-E-A-T enhancement plan:
  - Current vs target score.
  - Priority actions and implementation hints.
  - A short \"Conversion & Messaging Alignment\" section indicating how
    messaging and trust elements could be tuned to better match the audience
    and search intent.

Artifacts:
- `content/SEO/{SLUG}-eeat-plan.md`.

---

### Phase 5: Synthesis & Fix Plan

**Agent Role:** `seo-optimizer-orchestrator` (conceptual orchestrator)

Tasks:
- Merge outputs from Phases 1–4 into a unified, prioritized plan:
  - Critical issues to fix immediately.
  - High and medium-priority tasks.
  - Opportunistic improvements and stretch goals.
- Map recommendations to specific:
  - Files and components.
  - Content files and metadata helpers.
  - Schema and configuration locations.
- Where safe and appropriate:
  - Propose concrete code patches as suggestions.
  - Keep humans in the loop as the final gate.
- Update state:
  - Write/merge `seo-optimizer` state into `phase_state.json`.
  - Add key learnings and decisions into Workshop/vibe.db.

Outputs:
- Consolidated SEO audit for the target page:
  - Summary and rationale.
  - Prioritized task list with effort/impact tags.
  - References to all phase artifacts.
  - For hub pages: a \"Cluster & Expansion Roadmap\" summarizing the
    suggested cluster structure, missing spokes, and priority order.
  - A \"Quick Wins\" section surfaced from the seo-content-optimizer style
    findings (fast, high-impact changes).
  - An optional \"Conversion Optimization Suggestions\" section pointing
    to landing-page-style improvements that can be implemented via the
    frontend/marketing lanes if desired.

Artifacts:
- Preferred: `content/SEO/{SLUG}-seo-audit.md` (or `outputs/seo/` equivalent).

---
## Integration With Other Pipelines

- **SEO Domain Pipeline:**  
  - Use the SEO Optimizer before or after content pipeline runs on high-value pages.  
  - Example: optimize a calculator route technically, then run content pipeline for its supporting long-form article.

- **Next.js / Frontend Pipelines:**  
  - Technical remediation often involves Next.js code changes.  
  - Hand off technical tasks to the Next.js lane when changes are non-trivial.

- **Data and Research Pipelines:**  
  - For complex YMYL topics, bring in Data/Research pipelines to strengthen evidence and citations.

---
## Optional Cluster & Competitor Subroutine

For pages that act as **strategic hubs** (e.g. calculators index, major protocol
hubs, key comparison pages), the SEO Optimizer can run a deeper cluster and
competitor analysis, using:
- `seo-keyword-cluster-builder` for building topic clusters and hub/spoke maps.
- `competitor-content-analyzer` for identifying cluster-level content gaps and
  prioritizing new spokes.

Artifacts for this subroutine can live either as:
- A dedicated section in `content/SEO/{SLUG}-structure-plan.md` under
  \"Cluster & Competitor Insights\", or
- A separate `content/SEO/{SLUG}-cluster-plan.md` file when the analysis is large.

This subroutine is optional and reserved for pages where cluster architecture
will materially impact organic growth.

---
## Notes

- The SEO Optimizer pipeline is intentionally conservative about automatic code changes.  
  It focuses on **diagnostics and high-quality plans**, with code patches treated as suggestions.

- All phases should respect:
  - ProjectContextServer as the primary context source.
  - Existing SEO standards stored in memory (vibe.db/workshop).
  - OS 4.0 agent role boundaries (orchestrators coordinate, specialists implement).
