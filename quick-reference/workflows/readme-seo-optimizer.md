# OS 6.0 SEO Optimizer Quick Reference

**Feature:** SEO Content Optimization
**Entrypoint:** `/seo --optimize`
**Agent:** `seo-optimizer`

---

## 1. When to Use SEO Optimizer

Use when you want to **analyze and improve existing content**:
- Pre-publish draft optimization (before going live)
- Post-publish content improvement (live URLs)
- TF-IDF semantic coverage analysis
- Entity extraction and gap identification
- Schema markup generation (Article, FAQPage)

**Not for:** Creating new content from scratch - use `/seo` content pipeline.

---

## 2. Commands

```bash
# Pre-publish: analyze a draft file
/seo --optimize draft /path/to/article.md --keyword "target keyword"

# Post-publish: analyze a live URL
/seo --optimize url https://example.com/article --keyword "target keyword"

# Combined: create content then optimize
/seo --with-optimize "keyword for new article"
```

---

## 3. What It Does

The optimizer runs a multi-stage analysis:

```
Input (draft or URL)
    |
    v
1. Fetch SERP data (Ahrefs MCP)
    |
    v
2. Fetch competitor content (Crawl4AI)
    |
    v
3. TF-IDF semantic analysis (scikit-learn)
    |
    v
4. Entity extraction (spaCy)
    |
    v
5. Structure analysis (headings, links, word count)
    |
    v
6. Readability scoring (textstat)
    |
    v
7. Generate optimization report + schema
```

---

## 4. Composite Score

Content is scored on a 0-100 scale:

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| TF-IDF Coverage | 35% | Semantic term coverage vs competitors |
| Entity Coverage | 25% | Key entities (drugs, conditions, orgs) |
| Structure Quality | 20% | Heading hierarchy, links, word count |
| Readability | 20% | Grade level, sentence length |

---

## 5. Output Location

Reports are saved next to your input file:

```
{input_dir}/seo-optimization/
    {slug}-report.md      # Human-readable recommendations
    {slug}-schema.json    # Ready-to-paste schema markup
    {slug}-analysis.json  # Raw analysis data
```

---

## 6. Schema Generation

Generates consumer-focused schema (not medical):
- **Article** - For standard content
- **FAQPage** - If FAQ section detected
- Includes author and citation properties

---

## 7. MCP Dependencies

- **Ahrefs MCP** - SERP data and keyword intelligence
- **Crawl4AI MCP** - Competitor page content extraction

---

## 8. Python Dependencies

Located in `~/.claude/venv/`:
- scikit-learn (TF-IDF)
- spaCy + en_core_web_sm (entity extraction)
- textstat (readability)

---

## 9. Tips

1. **Be specific with keywords** - "tirzepatide vs semaglutide" not "weight loss drugs"
2. **Check competitor count** - Default is 5, minimum 3 for meaningful analysis
3. **Review missing terms** - High TF-IDF gap terms are opportunities
4. **Use schema output** - Copy directly into your page's structured data

---

_Version: OS 6.0_
