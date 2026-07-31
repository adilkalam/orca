---
name: research
description: Produce a deep, cited research report on a question using web search and source extraction, with explicit citation discipline and a self-run fact-check pass. Use when the user asks for research, a research report, "find out about X", "what does the evidence say about X", or a cited/sourced write-up of a topic — especially anything they call "deep research" or want fact-checked.
---

# Research

Full search → extract → cite → verify → write pipeline, run single-pass in one turn using WebSearch/WebFetch. This condenses what was originally a multi-agent pipeline (separate search, extraction, citation-gate, fact-check-gate, and consistency-gate agents) into one skill's internal checklist — there's no subagent isolation here, so treat each phase below as a distinct, deliberate pass rather than blending them together, and don't skip the self-check phases just because "the writing already looks done."

## Phase 1 — Scope the question

If the question is broad or ambiguous, ask 1-3 clarifying questions before starting (budget/timeframe/depth/specific angle) rather than guessing scope. Break the question into 3-6 specific, searchable subquestions. Keep them concrete — "what does recent research say about X's failure modes" beats "tell me about X."

For a genuinely large request (multiple unrelated phases, 1500+ words of ask), tell the user it should be split into separate research passes rather than trying to do it all in one shot.

## Phase 2 — Evidence gathering

For each subquestion:
1. Run WebSearch to find candidate sources. Prefer primary sources (the actual paper/announcement/data) over secondary summaries when both are available.
2. WebFetch the most promising 2-4 sources per subquestion. As you fetch, record for each source: URL, publish date, and the specific claim(s) it supports.
3. Note source quality signals as you go: is this a primary source or a summary of one? How recent? Any obvious bias or conflict of interest? Do independent sources agree or disagree?

Keep a running list of source → claim mappings — you'll need it for citation and fact-checking below. Don't discard it once you start writing.

## Phase 3 — Write the report

Structure: clear headers per subquestion or theme, evidence presented before conclusions drawn from it, specific numbers/dates/names rather than vague hedges ("some researchers" → name them or say "no consensus — X says A, Y says B").

Cite inline with `[1]`, `[2]` style, mapped to a Sources list at the end (URL + brief description per source). Every non-obvious factual claim needs a citation. If you can't find support for something you believe to be true, either cut it or mark it explicitly as unsupported (`[no source found]`) rather than stating it bare.

## Phase 4 — Self-run citation check (don't skip this)

Re-read your own draft section by section. For every specific factual claim, statistic, or attribution: confirm you actually have a source for it in your Phase 2 notes, not just a plausible-sounding memory. Anything you can't trace back to a specific fetched source, either cut or flag inline as `[evidence?]`. This is the step most likely to get skipped because the draft "looks done" — do it anyway.

## Phase 5 — Self-run fact-check pass (always for anything consequential)

Pick the 5-10 claims most central to your conclusions (numbers, dates, causal statements, attributions) and re-verify each one specifically against the source you cited for it — don't just trust that citing it earlier means it's right. Check for:
- **Overstatement**: does the source say "may" while your draft says "definitely"?
- **Internal contradiction**: does one section imply something a different section contradicts?
- **High-risk domains**: medical, financial, legal, or safety claims need extra scrutiny — multiple sources, recent evidence, and hedged language ("evidence suggests" not "proves").

If you find real issues, fix them before presenting the report — don't present a draft you know has unresolved fact-check findings.

## Phase 6 — Deliver

Present the report with:
- The findings, organized by theme/subquestion
- Full source list
- An explicit "Limitations" note — what you couldn't verify, what's thin evidence, what's a single-source claim, any search/fetch failures you hit along the way

Don't omit the limitations section — a research report that doesn't say what it's uncertain about is less trustworthy than one that does.
