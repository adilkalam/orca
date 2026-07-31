# ORCA-OS -> Claude.ai Desktop App: Port Plan

Target: the **consumer Claude.ai desktop app** (Mac/Windows), NOT the Claude Code CLI/desktop
app. This app shares no config with `~/.claude`. Its only extension surfaces are:

1. **Skills** — folders with a `SKILL.md` (YAML frontmatter: `name`, `description`) plus optional
   supporting files/scripts. Uploaded as a zip via Settings > Customize > Skills > Upload (Pro/Max/
   Team/Enterprise, requires code execution enabled). Skills are auto-discovered by description
   match — there is no manual invocation syntax, so ORCA's `/slash-command` model does not exist
   here. Every command below is reframed as a Skill that fires on natural-language intent, with the
   trigger phrasing folded into its `description`.
2. **MCP servers** — via Settings > Extensions (one-click, curated directory) or manual edit of
   `claude_desktop_config.json` (classic method, works on any plan) for local stdio servers.
3. **Project custom instructions / knowledge files** — plain reference docs, not executable.

### Hard limitations vs. Claude Code

- **No subagents.** The `Agent`/`Task` tool doesn't exist here. Every ORCA architect->builder->
  validator / gate pipeline collapses into ONE skill's internal instructions, run single-pass by
  one Claude turn. Gates become self-checklists, not independent adversarial judges. This is a real
  capability loss for the design and research pipelines specifically — noted per-skill below.
- **No hooks, no filesystem persistence.** Nothing like `.orca/`, workshop.db, or recording.db
  exists. Skills that depended on reading/writing ORCA-OS's local project state (session-resume,
  session-save, continue, orca-status, reflect, self-improve, memory-search) are **not ported** —
  they are meaningless outside this repo's harness.
  Convert to relative to consumer app.
- **Skill code execution is a sandboxed cloud container**, not the user's Mac. It can run bundled
  scripts (Python/Node) against files uploaded into the conversation, but it cannot reach a local
  project directory the way Claude Code can. Anything that lints/detects against "the current
  project's live files" (design-detector, seo-geo-detector) is ported as **reference knowledge**
  (the rule corpus, inlined) rather than as a live CLI invocation.

## Lane 1 — General (research, extraction, scraping, behavior basics)

**Skills ported (as-is or lightly edited):**
article-extractor, youtube-transcript, ascii-tables, using-loaded-knowledge, orca-confirm,
precision-discipline

**Commands -> new skills:**
- `research.md` -> skill `research` — condenses the 7-agent research pipeline (research-specialist,
  data-researcher, competitive-analyst, research-web-search-subagent, research-site-crawler-
  subagent, research-answer-writer, research-citation-gate, research-consistency-gate, research-
  deep-writer, research-fact-checker) into one skill covering: search strategy -> extraction ->
  citation discipline -> consistency self-check -> fact-check pass -> answer writing. Single-pass,
  self-graded (no independent gate agent).
- `clone-website.md` -> skill `clone-website`

**MCP servers to wire up:** chrome-devtools (npx, browser automation/scraping), context7 (npx, live
library docs), crawl4ai (only if the user runs the same Docker container locally — noted as
optional).

**Excluded (ORCA-OS-repo-specific infra, not portable):** memory-search, session-resume,
session-save, continue, orca-status, reflect, self-improve, project-setup, project-code,
project-memory, debugging-first, security-basics, linter-loop-limits, search-before-edit (dev-
editing skills), python-analytics-expert, standards-persistence-agent, path-guardian.

## Lane 2 — Cognition / RVRY / thinking

**Commands -> new skills:** think, deepthink, problem-solve, challenge, meta, root-cause,
adversarial, think-model, contemplate, solve, autonomous, shimmer (merge shimmer-direct into it).
Each skill's instructions are unchanged in substance (they were already single-agent prompting
patterns backed by MCP tool calls, not subagent orchestration) but the frontmatter/trigger
description is rewritten for auto-discovery.

**Skills ported as-is:** adversarial-analysis, alignment-verification

**MCP servers to wire up:** `cognition-mcp` (this repo's structured-reasoning notepad, build from
`mcp/cognition-mcp/` — ports directly, it's just a local stdio server), `sequential-thinking`
(npx `@modelcontextprotocol/server-sequential-thinking`), and per this repo's existing public-
distribution precedent, the RVRY *cognition* MCP package (`npx @rvry/mcp setup`) that `/deepthink`
and `/problem-solve` already route through in the public `~/orca` distribution.

**Excluded (this is RVRY the *product*, a dev pipeline, not RVRY the cognition mode):**
rvry-dev.md, rvry-research.md commands; all `agents/rvry/*` and `agents/rvry-research/*` (engine
architect/builder, web-builder, protocol-gate, verification, pod/runpod tooling) — these build a
Bun+Hono SaaS engine and belong to the excluded dev-pipeline category.

## Lane 3 — Design (including Illustrator)

**Commands -> new skills:** impeccable, recraft, motion-design, refine, simplify, fortify,
design-audit, design-critique, illustrate, typography, design-md (from `document.md` — generates
DESIGN.md, design-lane not writing-lane despite the name).

**Skills ported (as-is or lightly edited):** adapt, animate, bolder, colorize, delight, distill,
enhance, harden, layout, optimize, overdrive, polish, quieter, shape, typeset, clarify,
impeccable-hub, interfaces-that-feel, animation-engineering, motion-design-principles,
lenis-integration, threejs-patterns, three-js-animation, ui-quality-audit, critique,
adobe-execution (the Illustrator/Photoshop scripting knowledge).

**Collection docs bundled as resources inside `impeccable-hub`:**
`docs/concepts/design-contract/{aesthetic.md,vocabulary.md,voice-anchors.md,detector-rules.json}`,
all of `rants/` and `preferences/`. This is the register (Voice Anchors + rants + preferences) that
every design skill is supposed to load — ported verbatim as reference files, since progressive
disclosure (Claude reading a bundled file) is exactly how Claude.ai Skills work.

**Agent knowledge folded into skill docs (no live subagent gate):** design-architect / design-
builder / design-validator's task-decomposition and constraint-binding logic becomes a single
skill's internal step list. typography-advisor and typography-explorer-generator's font-pairing
knowledge folds into the `typography` skill. glyph-editor/ttf-exporter (fontTools contour editing)
are **not ported** — they need real local font files and Python font libraries.

**design-detector:** not ported as a live CLI (see Hard Limitations). Its rule corpus
(`detector-rules.json`) ships as a reference file inside `impeccable-hub` so Claude can self-check
against the same rules by reading them, not by running `npx designcheck`.

**MCP servers to wire up:** `adb-mcp` (Adobe Illustrator/Photoshop bridge, `mcp/adb-mcp/` — works
as long as Illustrator/Photoshop and the desktop app run on the same Mac).

**Excluded (per explicit user exclusions — iOS, MM, and dev-framework lanes):** ios-impeccable.md,
ios.md, ios-impeccable-hub, ios-knowledge-skill, ios-testing-skill, all `agents/ios-design/*` and
`agents/iOS/*`; mm-comps, mm-copy, mm-visual-audit; nextjs-knowledge-skill, react-components,
react-patterns, react-performance, shopify-app-development, stripe-integration, cursor-code-style,
lovable-pitfalls; runpod, hf-cli, hf-jobs, hf-paper-publisher, hf-tool-builder, hf-trackio (ML infra
tooling, not design); print-prep (3D-printing physical prep, out of the 4 named lanes).

## Lane 4 — Writing

**Skills ported as-is:** elements-of-style, pg-style-editor, LaTex

No dedicated writing *commands* exist in this repo to convert — the writing lane is skill-only.

**Excluded (SEO/GEO content tooling is doctrine+detector+measurement-DB infra, not general
writing):** seo.md, seo-optimize.md, aio.md, geo-diagnose.md, geo-measure.md, geo-rewrite.md and
their agents (seo-draft-writer, seo-brief-strategist, seo-quality-guardian, seo-research-specialist,
seo-technical-advisor, geo-diagnose-recommend, geo-rewrite, measurement-analyst). **Excluded
(project-specific private data):** kg-answer-writer and the rest of `agents/kg/*` — tied to a
private OBDN Knowledge Graph that doesn't exist outside that project.

## Explicitly excluded per user instruction (dev pipelines)

MM, Shopify, Next.js, Django, React, iOS, Expo — every command/agent/skill under those lanes
(`django-react*`, `expo*`, `nextjs*`, `shopify*`, `ios*`/`iOS/*`, `mm-*`), plus `orca.md`,
`orca-pipeline.md`, `audit.md`, `requirements.md` (ORCA orchestration meta-commands with no meaning
outside this repo's multi-command harness). `orca-os-dev.md` and its agents (`agents/os-dev/*`) ARE
included per the user's explicit "Orca-OS-Dev should be included" — packaged as a skill for
maintaining/extending *this* kind of Claude configuration work in general (treated as a Lane 2
cognition/meta tool, since its job is disciplined config-change planning, not app development).

## Output layout

```
dist-claude-desktop/
  PORT-PLAN.md                          (this file)
  README.md                             setup instructions for the user
  mcp/claude_desktop_config.snippet.json
  skills/<name>/SKILL.md (+ resources)  unzipped, for review/editing
  skills-zipped/<name>.zip              upload-ready
```
