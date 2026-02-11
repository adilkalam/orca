# OS 5.2 Research Lane Quick Reference

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
| `research-web-search-subagent` | Executes web searches via WebSearch + WebFetch |
| `research-site-crawler-subagent` | Maps and reads key pages via WebSearch/WebFetch |

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
| `research-fact-checker` | Cross-references facts against multiple sources (--deep only) |

**Note:** `research-fact-checker` is only invoked in `--deep` mode. In standard mode, 6 agents are active.

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

## 6. Dependencies

- **WebSearch** - Built-in tool for web discovery (used by subagents)
- **WebFetch** - Built-in tool for reading key URLs (use sparingly; prefer targeted pages)
- **(Optional)** **puppeteer** (MCP) - Screenshots / JS-heavy pages when WebFetch is insufficient

---

## 7. Memory Management

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

## 8. Tips

1. **Be specific** - "React Server Components best practices 2026" beats "RSC tips"
2. **Use --deep for decisions** - When the answer matters, pay for thoroughness
3. **Check reports/** - Reports are reusable across sessions
4. **Cite your sources** - All research outputs include source URLs
5. **Long research? Increase heap** - Set NODE_OPTIONS before deep 60+ min research

---

_Version: OS 5.2_
