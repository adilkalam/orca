# Deep Research Workflow

**Command:** `/research` and `/research --deep`
**Domain:** Research
**Output:** Cited research reports

---

## When to Use Research Mode

### Use `/research` when:

- You need information from multiple web sources
- You want a cited, structured answer (not just a quick response)
- The question requires synthesis across sources
- You need to trust the answer has been verified

**Examples:**
```
/research "What are the best practices for implementing RAG in production?"
/research "Compare pricing models of Anthropic, OpenAI, and Google AI APIs"
/research "What caused the 2024 CrowdStrike outage?"
```

### Use `/research --deep` when:

- You need comprehensive, long-form analysis
- The topic requires exploring multiple angles
- You want academic-style depth with methodology sections
- You're willing to wait longer for thorough coverage

**Examples:**
```
/research --deep "How do leading AI companies approach AI safety?"
/research --deep "What is the current state of quantum computing for cryptography?"
/research --deep "Analyze the competitive landscape of headless CMS platforms"
```

### Don't use research mode when:

- You need code written or files edited → use `/orca-{domain}`
- The answer is in your codebase → just ask directly
- It's a simple factual question → just ask directly

---

## What Happens When You Run `/research`

**Note:** The internal pipeline has additional preparatory phases (Phase 0: folder creation, Phase 1: argument parsing, Phase 2: prompt size check) before the user-facing workflow below begins.

### Phase 1: Scoping (Optional)

During subquestion planning, the system may optionally clarify your question:

```
You: /research "Best vector databases for RAG"

Claude: Before I research, let me clarify scope:
- Are you focused on open-source options, or including commercial?
- What scale? (hobby project, startup, enterprise)
- Any specific requirements? (self-hosted, managed, specific cloud)
```

You can answer or say "proceed with defaults" for a general survey.

### Phase 2: Research Plan

The orchestrator breaks your question into subquestions:

```
Research Plan:
1. What are the major vector database options in 2024?
2. How do they compare on performance benchmarks?
3. What are the pricing models?
4. What do practitioners recommend for RAG specifically?
```

### Phase 3: Evidence Gathering

Subagents search the web sequentially using WebSearch + WebFetch:

```
[Sequential research in progress...]
- Searching: "vector database comparison 2024"
- Searching: "pinecone vs weaviate vs qdrant benchmarks"
- Scraping: official documentation sites
- Scraping: recent blog posts and case studies
```

Each subagent produces **Evidence Notes** with sources and key findings.

### Phase 4: Synthesis & Draft

The writer agent synthesizes findings into a structured report:

```
# Vector Databases for RAG: 2024 Comparison

## Executive Summary
[Key findings in 2-3 paragraphs]

## Detailed Analysis
[Section for each major option]

## Recommendations
[Based on use case]

## Sources
[Numbered citation list]
```

### Phase 5: Quality Gates

Two gates validate the report:

1. **Citation Gate** - Ensures all claims have sources
2. **Consistency Gate** - Checks for contradictions and gaps

If issues are found, the report is revised before you see it.

### Phase 6: Final Report

You receive the finished report with:
- Clear structure and headings
- Inline citations `[1]`, `[2]`, etc.
- Source list at the end
- Limitations section (what couldn't be verified)

---

## Deep Mode Differences

`/research --deep` produces longer, more thorough output:

| Aspect | Standard | Deep |
|--------|----------|------|
| Length | 500-1500 words | 2000-5000+ words |
| Evidence loops | 1-2 | 3-5 |
| Subquestions | 3-5 | 8-15 |
| Output style | Blog post / brief | Academic / whitepaper |
| Time | 1-3 minutes | 5-15 minutes |

Deep mode adds:
- **Methodology section** - How research was conducted
- **Multiple perspectives** - Conflicting viewpoints explored
- **Nuanced conclusions** - Tradeoffs and caveats
- **Comprehensive sources** - 15-30+ citations typical

---

## Understanding the Output

### Citations

Claims are cited inline:

```
Pinecone offers a serverless tier starting at $0.00/hour for
small workloads [1], while Weaviate's cloud pricing begins at
$25/month for the starter tier [2].
```

### Limitations Section

Every report includes limitations:

```
## Limitations

- Pricing information current as of November 2024; may have changed
- Benchmark data primarily from vendor sources; independent benchmarks limited
- Enterprise pricing not publicly available for most options
- #LOW_EVIDENCE: Claims about Milvus cloud performance based on single source
```

### RA Tags

Special tags flag issues:
- `#LOW_EVIDENCE` - Thin evidence for this claim
- `#SOURCE_DISAGREEMENT` - Sources conflict
- `#OUT_OF_DATE` - Evidence may be stale
- `#RATE_LIMITED` - Search tools hit limits, coverage may be incomplete (used by writer agents)
- `#TOOL_ERROR` - A tool call failed during evidence gathering
- `#RETRY_EXHAUSTED` - Maximum retries reached for a search or scrape

---

## Tips for Better Results

### Be specific about scope

```
# Vague - will ask many clarifying questions
/research "Tell me about AI"

# Specific - can proceed quickly
/research "Compare Claude 3.5 Sonnet vs GPT-4o for code generation tasks"
```

### Specify timeframe when relevant

```
/research "What are the 2024 trends in serverless computing?"
/research "Recent developments in Apple's AI strategy (last 6 months)"
```

### Indicate depth preference upfront

```
/research "Quick overview of OAuth 2.0 vs OIDC differences"
/research --deep "Comprehensive analysis of authentication protocols for B2B SaaS"
```

### Ask for specific output format if needed

```
/research "Compare top 5 CDNs - I need a table with pricing, features, and best-for"
```

---

## Where Reports Are Saved

Research artifacts persist in per-session folders under `.claude/research/`:

```
.claude/research/
 YYYY-MM-DD-Topic-Slug/
   evidence/       ← Raw evidence notes from subagents
   synthesis.md    ← Synthesized findings
   report.md       ← Final research report
   temp/           ← Working files (cleaned up after completion)
```

You can reference past research:
```
/research "Update my previous vector database comparison with 2025 pricing"
```

---

## Troubleshooting

### Tool errors

If a tool encounters errors or is unavailable:
- The report will note which areas have reduced coverage
- Narrow scope or reduce the number of sources and rerun
- WebFetch/WebSearch fallbacks are used where possible

### Report seems incomplete

Ask for gap-filling:
```
"The report doesn't cover self-hosted options - can you research that specifically?"
```

### Need more depth on one section

```
"Expand the security comparison section with more detail"
```

### Want different format

```
"Reformat this as a comparison table instead of prose"
```

---

## Example Session

```
You: /research --deep "How do modern AI coding assistants compare?"

Claude: I'll research AI coding assistants comprehensively. A few
clarifying questions:
- Focus on IDE extensions, CLI tools, or both?
- Include pricing/business model analysis?
- Any specific assistants you want included?

You: Both IDE and CLI. Yes to pricing. Must include Cursor, GitHub
Copilot, Claude Code, and Cody.

Claude: [Initiates deep research...]

[5-10 minutes later]

Claude: # AI Coding Assistants: Comprehensive Analysis (2024)

## Executive Summary
[...]

## Methodology
This analysis draws from 47 sources including official documentation,
independent benchmarks, developer surveys, and practitioner blog posts.
Evidence was gathered November 2024.

[... 3000+ word report with sections on each tool, comparison tables,
pricing analysis, recommendations by use case, and 32 citations ...]

## Limitations
- Cursor and Claude Code rapidly evolving; some features may be newer
- Enterprise pricing based on published tiers; custom deals not reflected
- #SOURCE_DISAGREEMENT: Benchmark results vary significantly by task type
```
