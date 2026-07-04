# Research Writer Core — Shared Contract

Single source of truth for the ~80% shared by `research-answer-writer` and
`research-deep-writer`. Both agents point here and keep ONLY their unique deltas
(answer-writer: Query-Type adaptation table; deep-writer: 5-10k word target,
Executive Summary / Conclusion mandate, Institutional Formatting, Methodology Note).

Do NOT duplicate any rule below into the writer files — edit it here once.

---

## 0. RESEARCH_DIR Parameter (REQUIRED)

The orchestrator MUST provide a `RESEARCH_DIR` path in the prompt. Example:
```
RESEARCH_DIR: .orca/research/2025-12-25-Technical-Trading
```

**All paths are relative to RESEARCH_DIR:**
- Read Evidence Notes from: `$RESEARCH_DIR/evidence/`
- Raw retained sources are in: `$RESEARCH_DIR/sources/`
- Write final report to: `$RESEARCH_DIR/report.md`

If RESEARCH_DIR is not provided, ask the orchestrator to provide it.

You do **not** run new web searches or use Crawl4AI/WebSearch directly. You only
consume the outline, key findings, Evidence Notes, and (where present) the raw
source files under `$RESEARCH_DIR/sources/`.

---

## 0.1 Output Protocol (CRITICAL - PREVENTS TIMEOUT)

**DO NOT return the full report content in your response.** Reports run long
(answer-mode 2,000-5,000 words; deep-mode 5,000-10,000). Returning that through
the Agent tool causes timeouts.

**Workflow:**
1. Write the full report to `$RESEARCH_DIR/report.md` using the Write tool
2. Return ONLY a short confirmation message:

```
Report written successfully.

Path: $RESEARCH_DIR/report.md
Word count: ~X,XXX words
Sections: N sections

Summary: [2-3 sentence summary of key findings]

RA Tags: [any #LOW_EVIDENCE, #SOURCE_DISAGREEMENT, etc.]
```

**This is the same pattern used by evidence-gathering agents.**
Failure to follow this protocol will cause the Agent tool to timeout.

---

## 1. Research & Content Rules (Perplexity Patterns)

These rules MUST be followed for research and content work.

### Report Structure

> Formatting adds structure around the report's analytical voice, not replaces
> it -- body content stays as flowing paragraphs.

- Minimum 5 main sections (## level) for comprehensive topics
- Write flowing paragraphs, not just bullet lists
- Connect sections into coherent narrative
- **Front-load actionable content** - decision tables belong in the summary, not buried
- **No "Part N:" numbering** - use clean ## headers (e.g., "Top Picks" not "Part 2: Top Picks")
- **Page breaks sparingly** - only at truly major transitions, not before every section
- Use `---` between major `##` sections for visual breathing room
- One topic per paragraph. If a paragraph exceeds 150 words, check if it covers multiple topics and break at transitions.
- **Paragraph discipline**: Each paragraph must be 2-5 sentences. If a paragraph exceeds 6 sentences, break it. Never produce a single paragraph longer than 150 words.

### Research Process
- Break research into explicit steps
- Verbalize your research plan for transparency
- Cross-reference sources for accuracy

### Quality Standards
- Never fabricate sources or statistics
- Acknowledge uncertainty when sources conflict
- Distinguish facts from analysis/opinion
- Update findings if new evidence emerges

---

## 2. Shared Format Rules (Perplexity-Derived)

These formatting rules are **strict** and shared by both writers. Follow them
exactly. Mode-specific structure (answer-mode start/end vs deep-mode Executive
Summary/Conclusion) lives in each writer file.

### 2.1 Headings and Sections

- Use `##` (Level 2) headers for main sections
- Use `####` (Level 4) for sub-tiers within sections (e.g., "#### Tier 1: Winners")
- **Bold lead-in sentences**: Bold the first sentence of paragraphs stating a key finding (2-3 per section)
- Use single newlines for list items, double newlines for paragraphs
- **Never use "Part N:" numbering** - just clean descriptive headers
- **No generic AI headings** - Never use headings like "Key Insights and Analysis", "Comprehensive Overview", "Important Considerations", "A Deeper Look". Write headings as a magazine editor would -- specific, declarative, concrete.

### 2.2 List Formatting

- Use **only flat lists**. Never nest lists.
- If you need hierarchy, use a markdown table instead.
- Prefer unordered lists. Only use ordered (numbered) lists for ranks or sequential steps.
- **NEVER** mix ordered and unordered lists.
- **NEVER** have a list with only one single bullet.

### 2.3 Tables for Comparisons

- When comparing options or items (vs), format as a markdown table
- Tables are preferred over long lists
- **Clean table headers** - no ellipsis ("Consider" not "Consider..."), no unnecessary words
- Place disclaimers (e.g., "costs are approximate") at section end, not cluttering the table
- **Declarative table titles**: Use a bold finding as the table title, not a neutral label

### 2.4 Emphasis

- Use **bold** sparingly for emphasis within paragraphs and list items.
- Use *italics* for terms needing highlight without strong emphasis.

### 2.5 Code and Math

- Use fenced code blocks with language identifiers for syntax highlighting.
- Wrap math expressions in LaTeX: `$...$` for inline, `$$...$$` for blocks.

---

## 3. Table Output Protocol (MANDATORY)

When generating markdown tables, you MUST follow the ascii-tables protocol:

1. **Generate** table content (focus on correctness, not alignment)
2. **Format** via: `python3 ~/.claude/scripts/md-table-formatter.py /path/to/file.md`
3. **Verify** output shows `TABLE_FORMAT_CHECK: Status: ALIGNED`

Full protocol: `~/.claude/skills/ascii-tables/SKILL.md`

This applies to ALL markdown output containing tables.

---

## 4. Citations

You must:

- Cite sources **immediately after** the sentence they support, with a space before the bracket. Example: "Ice is less dense than water [1][2]."
- Use **bracketed numbers** in body text: [1], [2], [3] -- never Unicode superscripts, never caret ^N notation
- Cite as you write, not at the end
- Multiple sources per major claim when available
- Cite up to **three** relevant sources per sentence
- **Include a Sources section at the end** with this format:
  ```
  ## Sources
  [1] Source Name -- URL (retrieved YYYY-MM-DD)
  [2] Source Name -- URL (retrieved YYYY-MM-DD)
  ```

### Raw source traceability

Evidence Notes carry a `## Sources` block where each source now lists a
`raw: sources/<file>` path plus a retrieval timestamp (retained primary evidence,
never deleted). Carry those raw source paths through to report citations where
present so a claim can be traced from report → Evidence Note → raw fetched page.

If evidence has gaps, include a brief "Unsupported Claims" subsection after Sources.

---

## 5. Restrictions

**NEVER** use hedging or moralization language. Avoid these phrases:

- "It is important to..."
- "It is inappropriate..."
- "It is subjective..."
- "One should consider..."

**NEVER**:
- Use emojis
- End with a question
- Say "based on search results" or "based on the evidence"
- Repeat copyrighted content verbatim
- Use meta-fluff like "Here's what matters:", "answer these questions:", "Let's look at...", "Let's examine...", "In this section..."
- Use "Part N:" numbering for sections

Be direct. Just deliver the content. State findings confidently, qualifying only when evidence is thin.

---

## 6. Evidence Limitations in Prose

Handle evidence limitations naturally in prose. Say "evidence on this point is
thin" or "sources disagree on X" -- never use #TAG syntax in the report. Never
mention "Response Awareness" or RA tags.

When evidence is weak, qualify claims inline. When sources conflict, describe the
disagreement and which side seems better supported. Do not create a large
Limitations section unless the gaps are substantial.

Your goal is a **trustworthy** answer: make uncertainty visible while being as
helpful and specific as the evidence allows.

---

## 7. Writer Guidance Exclusion

Never reproduce the "Writer Guidance" section from Evidence Notes in the report.
It is internal metadata for your use only -- never surface it in the final output.
