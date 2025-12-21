# OS 3.0 SEO Optimizer Lane Quick Reference

**Lane:** SEO Optimizer (Existing Pages)  
**Domain:** `seo-optimizer`  
**Entrypoint:** `/seo` (optimizer mode) or `/orca` (SEO optimization tasks)

---

## 1. When to Use SEO Optimizer

Use this lane when you want to **improve an existing page**:
- Technical SEO for app routes and tools.
- On-page SEO for calculators and dashboards.
- Metadata and keyword optimization for existing URLs.
- E-E-A-T and authority upgrades on YMYL pages.
- Cluster/hub architecture for strategic pages (libraries, indexes, comparison hubs).

Examples:
- “Audit `/tools/bpc-157-calculator` for SEO and E-E-A-T.”
- “Optimize the GLP-1 comparison page for search.”
- “Improve metadata and structure on the protocol dashboard route.”

For new articles and briefs, use the **SEO Content Lane** (see `readme-seo.md`).

---

## 2. Core Sub-Agents

This lane orchestrates several specialist roles and skills:

| Role / Skill | Source | Focus |
|-------------|--------|-------|
| Technical SEO Auditor | code-seo-audit prompt + Frontend_SEO_Optimization | Code-level and framework SEO issues |
| `seo-structure-architect` | `_AGENTS/marketing-and-seo/seo-structure-architect.md` | Headings, schema, internal linking, TOC |
| `seo-meta-optimizer` | `_AGENTS/marketing-and-seo/seo-meta-optimizer.md` | URLs, titles, meta descriptions |
| `seo-keyword-strategist` | `_AGENTS/marketing-and-seo/seo-keyword-strategist.md` | Keyword density, entities, LSI |
| `seo-authority-builder` | `_AGENTS/marketing-and-seo/seo-authority-builder.md` | E-E-A-T and authority signals |
| `seo-content-optimizer` (skill) | `_SKILLS/seo-optimizer/SKILL.md` | On-page content quality, readability, quick wins |
| `seo-keyword-cluster-builder` (skill) | `_SKILLS/seo-keyword-cluster-builder/SKILL.md` | Topic clusters, hubs/spokes, cluster linking |
| `competitor-content-analyzer` (skill) | `_SKILLS/competitor-content-analyzer/SKILL.md` | Competitor content and cluster-level gaps |
| `landing-page-copywriter` (skill) | `_SKILLS/landing-page-copywriter/SKILL.md` | Conversion-optimized landing/marketing copy patterns |
| `seo-specialist` | `seo-specialist-1/2.md` | Holistic SEO framing and context |

You don’t need to call these directly; the orchestrator uses them by phase.

---

## 3. Pipeline Flow (Conceptual)

```text
/seo "Optimize /tools/bpc-157-calculator for SEO"

  Phase 0: Target & context
    ↓
  Phase 1: Technical / code audit
    ↓
  Phase 2: Structure & schema
    ↓
  Phase 3: Meta & keyword strategy
    ↓
  Phase 4: Authority & E-E-A-T
    ↓
  Phase 5: Unified SEO fix plan
```

Each phase writes its own artifact; Phase 5 summarizes everything into a single
audit + action plan. For **hub/cluster pages**, Phase 2 and Phase 5 also
capture cluster + competitor insights and a hub/spoke roadmap.

---

## 4. Typical Artifacts (Per Page)

These are suggested filenames; adjust to your project’s conventions.

```text
{SLUG}-tech-audit.md      ← Technical/code SEO findings
{SLUG}-structure-plan.md  ← Headings, schema, internal links
{SLUG}-meta-plan.md       ← Keywords, titles, descriptions, URLs
{SLUG}-eeat-plan.md       ← E-E-A-T / authority upgrade plan
{SLUG}-seo-audit.md       ← Consolidated, prioritized fix plan
```

For hub/strategic pages, you may also see:
- `{SLUG}-cluster-plan.md` or a \"Cluster & Internal Linking\" section inside
  the structure plan.

In many projects, these live under an SEO or docs folder, e.g.:
- `content/SEO/`
- `outputs/seo/`
- `docs/seo/`

---

## 5. Example Commands

```bash
# Full optimizer run for a route
/seo Optimize /tools/bpc-157-calculator for SEO, YMYL-safe, and internal linking

# Technical audit only
/orca Audit the Next.js route for /library for technical SEO issues

# Meta & keywords only
/orca Generate meta + keyword plan for /protocols/glp1-muscle-preservation-guide

# E-E-A-T review
/orca Run an E-E-A-T authority audit on the GLP-1 comparison page
```

You can also use plain language (“run the SEO optimizer”) as long as you
provide a clear target URL or code path.

---

## 6. Integration With Content Lane

Recommended patterns:
- **Before content work:**  
  Run SEO Optimizer on high-value routes to catch structural and technical issues early.

- **After content work:**  
  Run SEO Optimizer on new long-form pages to:
  - Confirm headings, schema, and internal links.
  - Finalize metadata and keyword distributions.
  - Tighten E-E-A-T and safety language.

---

## 7. Tips for Good Optimizer Requests

1. **Be specific about the target**
   - Provide either a URL path or a code/content path (or both).
2. **State the primary goal**
   - e.g. “rank for [keyword]”, “improve click-through”, “strengthen E-E-A-T”.
3. **Mention page type**
   - Calculator, guide, comparison, protocol, dashboard, landing page, etc.
4. **Call out constraints**
   - No breaking layout, preserve tone, keep medical claims conservative, etc.

---

_Version: OS 4.0.0 (SEO Optimizer Lane)_ 
