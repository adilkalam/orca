# OS 5.2 SEO Lane Quick Reference

**Lane:** SEO Content
**Domain:** `seo`
**Entrypoint:** `/seo` or `/orca` (auto-routes)

---

## 1. When to Use SEO Lane

Use for:
- SEO content briefs
- Long-form SEO articles
- SERP analysis and keyword research
- Content optimization
- Quality review of existing content

**Not for:** Technical SEO (site speed, schema markup) - use Next.js or Shopify lanes.

---

## 2. Agents (5 total)

**Note:** SEO uses its own sequential pipeline routing rather than the three-tier (grand-architect / light-orchestrator / builder) model used by other lanes.

| Agent | Role |
|-------|------|
| `seo-research-specialist` | SERP intelligence, keyword research, KG analysis |
| `seo-brief-strategist` | Transform research into production-ready briefs |
| `seo-draft-writer` | Long-form SEO content with natural clarity |
| `seo-quality-guardian` | Quality gates, standards enforcement, compliance |
| `seo-optimizer` | Content optimization against SERP competitors |

---

## 3. Pipeline Flow

```
/seo "Write article about peptide therapy benefits"
    
    

  seo-research-specialist   ← SERP + keyword research

    
    

  seo-brief-strategist      ← Content brief

    
    

  seo-draft-writer          ← Write the article

    
    

  seo-quality-guardian      ← Quality gates

    
    
   Final Content
```

---

## 4. Example Commands

```bash
# Full content pipeline
/seo Write a comprehensive guide to BPC-157 benefits

# Research only
/orca Research top-ranking content for "peptide therapy"

# Brief only
/orca Create SEO brief for homepage optimization

# Optimize existing draft (pre-publish)
/seo --optimize draft /docs/glp1-guide.md --keyword "glp1 comparison"

# Optimize live URL (post-publish)
/seo --optimize url https://example.com/article --keyword "target keyword"

# Create content then optimize
/seo --with-optimize "BPC-157 benefits guide"
```

---

## 5. MCP Dependencies

- **Ahrefs MCP** - `mcp__ahrefs__*` for keyword research and SERP data
- **ProjectContext MCP** - For saving SEO decisions and standards

---

## 6. Output Location

```
.claude/orchestration/
 temp/           ← Working briefs, drafts
 evidence/       ← Final content, approved briefs
```

---

## 7. Tips

1. **Provide target keyword** - Be specific: "BPC-157 benefits" not "peptides"
2. **Mention competitors** - "Outrank [competitor URL]" helps research
3. **Specify word count** - "2,500 word comprehensive guide"
4. **Include intent** - "Informational" vs "Commercial" vs "Transactional"

---

_Version: OS 5.2_
