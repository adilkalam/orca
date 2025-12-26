# OS 4.2 Research Lane Quick Reference

**Lane:** Research
**Domain:** `research`
**Entrypoint:** `/research [--deep] [--time N] <question>`

---

## 1. When to Use Research

Use `/research` when you need:
- Deep, cited answers to complex questions
- Multi-source verification
- Academic or technical research
- Competitive analysis requiring multiple sources

**Not for:** Simple factual lookups (just ask directly).

---

## 2. Command Usage

```bash
# Standard research (quick, 2-3 sources)
/research What are the best practices for React Server Components?

# Deep research (thorough, 5+ sources, fact-checked)
/research --deep How do leading companies implement feature flags at scale?

# Time-bounded research
/research --time 30 Compare Rust vs Go for CLI tools
```

**Flags:**
| Flag | Effect |
|------|--------|
| `--deep` | Enables deep-writer + fact-checker + citation-gate |
| `--time N` | Sets time budget in minutes |

---

## 3. Agents (7 total)

Orchestrated directly by `/research` command (flat hierarchy, no lead agent).

### Search & Crawl
| Agent | Role |
|-------|------|
| `research-web-search-subagent` | Executes web searches via WebSearch + Crawl4AI |
| `research-site-crawler-subagent` | Deep crawls specific sites via Crawl4AI |

### Writing
| Agent | Role |
|-------|------|
| `research-answer-writer` | Standard research answers (quick mode) |
| `research-deep-writer` | Long-form, comprehensive answers (--deep mode) |

### Quality Gates
| Agent | Role |
|-------|------|
| `research-consistency-gate` | Ensures answer consistency across sources |
| `research-citation-gate` | Validates all claims have proper citations |
| `research-fact-checker` | Cross-references facts against multiple sources |

---

## 4. Pipeline Flow

```
/research <question>
    |
    v
  [Plan subquestions]     ← /research plans directly
    |
    v (SEQUENTIAL - one at a time)
  research-web-search-subagent
  research-site-crawler-subagent (if specific sites needed)
    |
    v
  [Synthesize evidence]   ← /research reads Evidence Notes
    |
    v
  research-answer-writer  ← Quick mode
  OR
  research-deep-writer    ← --deep mode
    |
    v (--deep only)
  research-fact-checker
  research-consistency-gate
  research-citation-gate
    |
    v
  Final Report
```

**Note:** All agents spawned SEQUENTIALLY by `/research` (flat hierarchy).

---

## 5. Output Location

Research artifacts are saved to:

```
.claude/research/
 evidence/       ← Source notes from subagents
 reports/        ← Final and draft reports
 cache/          ← Cached search results
```

**Note:** Unlike `.claude/orchestration/temp/`, research artifacts persist across sessions for follow-up queries.

---

## 6. MCP Dependencies

- **Crawl4AI MCP** - `mcp__crawl4ai__scrape`, `mcp__crawl4ai__crawl`, `mcp__crawl4ai__crawl_site` for web content extraction
- **WebSearch** - Built-in tool for web discovery (used by subagents)

---

## 7. Crawl4AI Setup

**Crawl4AI runs via Docker (stdio transport) - no manual server start needed.**

The MCP is configured in your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "crawl4ai-mcp": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "--volume", "./crawls:/app/crawls",
        "uysalsadi/crawl4ai-mcp-server:latest"
      ],
      "env": {
        "CRAWL4AI_MCP_LOG": "INFO"
      }
    }
  }
}
```

### Available Tools

| Tool | Purpose |
|------|---------|
| `mcp__crawl4ai__scrape` | Single page extraction to markdown |
| `mcp__crawl4ai__crawl` | Multi-page crawling |
| `mcp__crawl4ai__crawl_site` | Full site crawl with manifest |
| `mcp__crawl4ai__crawl_sitemap` | Sitemap-based crawling |

### If /research Fails

1. Check Docker is running: `docker ps`
2. Test the MCP manually: `docker run --rm -i uysalsadi/crawl4ai-mcp-server:latest`
3. Ensure the Docker image is pulled: `docker pull uysalsadi/crawl4ai-mcp-server:latest`

---

## 8. Memory Management

Deep research can exhaust Claude Code's Node.js heap (~4GB default).

**Constraints enforced:**
- SEQUENTIAL subagent spawning only (one at a time, never parallel)
- Evidence Notes kept under 300 lines
- Max 3 pages extracted per web search
- Max 5 pages per site crawl

**If you see "JavaScript heap out of memory":**
```bash
export NODE_OPTIONS="--max-old-space-size=8192"
```

---

## 9. Tips

1. **Be specific** - "React Server Components best practices 2024" beats "RSC tips"
2. **Use --deep for decisions** - When the answer matters, pay for thoroughness
3. **Check reports/** - Reports are reusable across sessions
4. **Cite your sources** - All research outputs include source URLs
5. **Long research? Increase heap** - Set NODE_OPTIONS before deep 60+ min research

---

_Version: OS 4.2_
