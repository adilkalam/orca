# OS 7.0 Commands Quick Reference

**Last Updated:** 2026-06-04 (design-command family doc-sync)
**Version:** OS 7.1
**Total Commands:** 44 (+ orca-record CLI with 7 subcommands (5 hook + 2 user))

> **Count reconciled (2026-06-04):** `find commands -maxdepth 1 -name '*.md' | wc -l` returns **54**, and all 54 are git-tracked, deployable command files (none are archive/deprecated/local-only). The prior recorded count of 52 was stale: `think-model.md` (split out of `/think` on 2026-04-23 during the design-system fork) was the most-recent uncounted file, and the count was never bumped past 52 after the SEO/GEO additions. `total_commands: 54` here now agrees with `os-dependency-graph.yaml`. Note: a few command files share a single doc entry below — `/session-resume` is documented under the `/session-save` / `/session-resume` combined header, and `/think-model`, `/challenge`, `/solve`, `/shimmer-direct` are cognition siblings of `/think`/`/shimmer` reachable directly. The Design Commands (9) section count IS verified against on-disk files.

---

## Routing Modes

All `/orca-*` lane commands support four execution modes:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work |
| **Tweak** | `-tweak` | Builder direct | NO | Speed iteration |
| **Complex** | `--complex` | Full pipeline | YES | Architecture work |

---

## Lane Orchestrator Commands (15)

<!-- /seo-optimize and /aio are advisory/diagnostic lanes -- a command plus a
focused working agent set, not full orchestrator-ceremony lanes. /geo-diagnose,
/geo-rewrite, and /geo-measure are composable sub-commands of the /aio lane (each
wraps one of the three aio agents); they are not counted as separate lanes. -->



### `/ios` - iOS Lane
```bash
/ios "fix button padding"           # Default: light + gates
/ios -tweak "try animation"         # Tweak: no gates
/ios --complex "auth flow"          # Complex: full pipeline
```
**Agents:** ios-grand-architect, ios-builder, ios-standards-enforcer, ios-ui-reviewer, ios-verification
**MCP:** XcodeBuildMCP

### `/nextjs` - Next.js Lane
```bash
/nextjs "fix spacing"               # Default: light + gates
/nextjs -tweak "try padding"        # Tweak: no gates
/nextjs --complex "dark mode"       # Complex: full pipeline
```
**Agents:** nextjs-grand-architect, nextjs-builder, nextjs-standards-enforcer

> **Note (2026-04-22):** `/nextjs` pipeline is non-functional pending follow-up reshape. Design/CSS/animation/3D/layout specialists and `nextjs-design-reviewer` were archived with the design-system fork. Design work routes through `/impeccable` skills.

### `/django-react` - Django + React TypeScript Lane
```bash
/django-react "add user profile API"       # Default: light + gates
/django-react -tweak "try new endpoint"    # Tweak: no gates
/django-react --complex "auth system"      # Complex: full pipeline
```
**Agents:** django-react-grand-architect, django-react-builder, django-react-standards-enforcer, django-react-verification

### `/expo` - Expo/React Native Lane
```bash
/expo "fix button styling"
/expo -tweak "try different colors"
/expo --complex "offline sync"
```
**Agents:** expo-grand-orchestrator, expo-builder-agent, expo-verification-agent

### `/seo` - SEO Content Lane
```bash
/seo "keyword research for peptides"

# Cognition-powered content strategy phase
/seo --think "target keyword"
```
**Agents:** seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-quality-guardian
**MCP:** ahrefs, crawl4ai, cognition-mcp (--think)

> **Optimization removed (2026-05-17).** `/seo` is a content-pipeline command only.
> The `--optimize`, `--with-optimize`, `--audit`, and `--audit-full` flags and the
> `seo-optimizer` agent are deprecated. Technical-SEO and GEO/AIO optimization live
> in the **`/seo-optimize`** (technical SEO) and **`/aio`** (GEO) lanes -- see the
> SEO/GEO optimization capability spec at
> `.orca/requirements/2026-05-17-1903-seo-geo-optimization-capability/`.

### `/seo-optimize` - Technical-SEO Optimization Lane
```bash
/seo-optimize https://example.com/page
/seo-optimize https://example.com/sitemap.xml
```
**Agents:** seo-technical-advisor
**MCP:** analytics-mcp, mcp-gsc

> Advisory lane. Runs the deterministic detector CLI (`mcp/seo-geo-detector/`),
> filters to `technical-seo` findings, and produces a prioritized, evidence-backed
> report -- every recommendation traces to a detector `check_id`. Replaces the
> deprecated `seo-optimizer`.

### `/aio` - Generative-Engine Optimization Lane
```bash
/aio https://example.com/page
/aio https://example.com/page --rewrite
```
**Agents:** geo-diagnose-recommend, geo-rewrite, measurement-analyst
**MCP:** none (detector + measurement tool are local CLIs)

> Advisory lane, the deeper of the two. Runs the detector's GEO checks, scores the
> target against the optimization doctrine, contextualizes with citation-rate data
> from the measurement store, and produces prioritized GEO recommendations. With
> `--rewrite`, delegates a doctrine-aligned content rewrite.

#### Composable `/aio` sub-commands

`/aio` runs the full chain (diagnose -> recommend -> optional rewrite -> measure).
The three agents it orchestrates are also exposed as standalone commands, so a
user can diagnose before committing to a rewrite. These are additive -- `/aio`
remains the umbrella command.

##### `/geo-diagnose` - GEO Diagnosis (composable)
```bash
/geo-diagnose https://example.com/page
/geo-diagnose https://example.com/sitemap.xml
```
**Agents:** geo-diagnose-recommend

> Runs the detector's GEO checks, scores the target against the optimization
> doctrine, contextualizes with citation-rate data, and emits a prioritized
> diagnosis + recommendations report -- then stops. No rewrite. Review the
> diagnosis before committing to `/geo-rewrite`.

##### `/geo-rewrite` - Doctrine-Aligned GEO Rewrite (composable)
```bash
/geo-rewrite https://example.com/page
/geo-rewrite https://example.com/page --from .orca/research/geo-diagnose/<report>.md
```
**Agents:** geo-rewrite (geo-diagnose-recommend when run without `--from`)

> Rewrites a page's content so generative engines read and cite it better.
> Consumes a prior `/geo-diagnose` report via `--from`, or runs a diagnosis
> first. The single deliberate feedback edge to content generation -- it does
> not absorb the `/seo` content pipeline.

##### `/geo-measure` - GEO Measurement Context (composable)
```bash
/geo-measure
```
**Agents:** measurement-analyst

> Reads the AI-answer capture store and reports citation rate, the cited-domain
> landscape, and competitive contrast pairs. Degrades gracefully to "no capture
> data yet" when the store is empty.

### `/research` - Deep Research Lane
```bash
/research "How do mTOR inhibitors work?"
/research --deep "Complete mechanism analysis"
```
**Agents:** research-web-search-subagent, research-site-crawler-subagent, research-answer-writer, research-fact-checker
**MCP:** crawl4ai

### `/typography` - Typography/Font Management Lane
```bash
/typography "Reduce terminal curl on DomaineSansCustom"      # Default: with checkpoints
/typography --tweak "Make the period rounder in Calibre"     # Tweak: direct to specialist
/typography --complex "Create Light and Bold via stroke offsetting"
/typography "Export DomaineSansCustom to TTF for Epson"
/typography "Recommend fonts for technical documentation"

# Typography Explorer (interactive testing tool)
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Generate as Next.js React components
/typography --explorer --html                # Generate as standalone HTML
/typography --explorer --context store       # E-commerce product UI context
/typography --explorer --context markdown    # Article/documentation context
```
**Agents:** typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian
**Workflows:** glyph editing (fontTools), TTF export (Epson LabelWorks), font selection/pairing, explorer generation

| `/illustrate` | (MCP+skill driven -- adobe-photoshop, adobe-illustrator) |

### `/rvry-dev` - RVRY Product Pipeline
```bash
/rvry-dev "implement hedge-word frequency heuristic"    # Default: light + gates
/rvry-dev -tweak "adjust escape threshold"              # Tweak: no gates
/rvry-dev --complex "state machine redesign"            # Complex: full pipeline
```
**Agents:** rvry-grand-architect, rvry-engine-architect, rvry-engine-builder, rvry-web-builder, rvry-protocol-gate, rvry-verification
**Domain Gates:** delta (divergence scoring), escape-detection (FP <30%), streaming, trace


### `/orca-os-dev` - OS Development Lane
```bash
/orca-os-dev "add new specialist agent"
/orca-os-dev "update ios pipeline"
```
**Agents:** os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification

### `/orca` - Universal Router
```bash
/orca "task description"
/orca --audit                     # Audit last 5 tasks
/orca --audit "last 10 tasks"     # Audit with scope
/orca --audit "iOS work"          # Audit specific domain
```
Detects domain and routes to appropriate lane command.
**Special Mode:** `--audit` runs Response-Aware behavior analysis instead of pipeline execution.

### `/orca-pipeline` - Pipeline Creation Wizard
```bash
/orca-pipeline analytics "Data analytics pipeline"    # Full 5-phase wizard
/orca-pipeline --quick data-analysis                   # Template Gallery mode
```
Meta-pipeline for creating new domain pipelines. 5 phases: Interview → Research → Blueprint → Generate → Validate.
**Agents:** orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-architect, orca-pipeline-generator, orca-pipeline-validator
**Quick Mode Templates:** hybrid (8 agents), research-heavy (7), build-heavy (5), minimal (4)

---

## Planning Commands (1)

### `/requirements` - Unified Requirements + RA Blueprint
```bash
/requirements "Add dark mode support"
/requirements --visual "UI redesign"
/requirements --systems "Database migration"
/requirements --debug "Fix checkout bug"
/requirements --problem-solve "Complex architectural decision"   # Full 8-step pipeline
/requirements -complex --problem-solve "Migrate to GraphQL"      # Max rigor
```
**Cognition Flags:** `--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--problem-solve`
**Tier Flags:** `-tweak` (quick), (none) (standard), `-complex` (deep)
Creates: `.orca/requirements/<id>/06-requirements-spec.md`

---

## Reasoning Commands (7)

### `/contemplate` - Structured Exploration
```bash
/contemplate "Why is this test flaky?"                           # Default: blind_orchestrate loop (asks BLOCKING questions)
/contemplate --auto "Why is caching slow?"                        # Autonomous: no questions, states assumptions
/contemplate --systems "How do these components interact?"       # Systems thinking (architecture, data flow)
/contemplate --creative "Ideas for onboarding"                   # Creative thinking (brainstorming, divergent)
/contemplate --causal "Why does this keep failing?"              # Causal analysis (cause-and-effect chains)
/contemplate --model "First principles of this design"           # Mental model (first-principles reasoning)
/contemplate --perspectives "Microservices vs monolith"          # Collaborative reasoning (multiple viewpoints)
/contemplate --decide "Which database to use?"                   # Decision analysis (trade-off analysis)
/contemplate --auto --systems "Architecture overview"            # Combine --auto with any flag
```
**Default Mode:** blind_orchestrate loop -- auto-routed exploration that runs until the orchestrator signals completion. Asks BLOCKING questions first, 3-question self-check, harvest with auto-persist and follow-up questions.
**--auto Mode:** Fully autonomous -- no BLOCKING questions, states assumptions clearly, proceeds with analysis.
**Mental Model Flags:** --systems, --creative, --causal, --model, --perspectives, --decide -- each runs a specific cognition-mcp operation directly instead of blind_orchestrate.
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-think-<slug>/` session folder (00-enter.md, 01-orient.md, 99-harvest.md) + Workshop entry
**Handoff Guidance:** Includes "Follow-ups" section with contextual command recommendations

### `/meta` - Sustained Metacognitive Substrate Observation
```bash
/meta                                      # Observe current conversation context
/meta "What is my training doing here?"    # Focused substrate observation
/meta --predict "hedge patterns"           # With verifiable prediction
/meta --on <sessionId> "revisit"           # Reflect on prior session
/meta --auto "training artifacts"          # No questions, states assumptions
```
3 constraint-chained rounds: Priority Displacement, Constrained Observation, Synthesis. Each round uses cognition-mcp `meta` operation with the same sessionId. Sustained observation outlasts trained responses via content thinning.
**Flags:** `--predict` (verifiable prediction in Round 3, persisted to Workshop), `--on <sessionId>` (composability -- loads prior session harvest), `--auto` (no questions)
**Topic:** Optional -- no args observes current conversation context
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-meta-<slug>.md` + Workshop entry
**See also:** `/contemplate --meta` (quick single-shot), `/contemplate --meta-visual` (with ASCII diagrams)


### `/deepthink` - Pre-Mortem Exploration
```bash
/deepthink "Why does user retention drop after day 3?"    # Full exploration + adaptive pre-mortems (asks BLOCKING questions)
/deepthink --auto "Deep analysis of API design"            # Autonomous: no questions, states assumptions
/deepthink --quick "Quick analysis of caching strategy"    # Structured 4-round: SHIMMER->MAP->INVERT->HARVEST
/deepthink --intense "Deep analysis with full ceremony"    # Per-mode self-checks, META rotation, full pre-mortems
/deepthink --design "Redesign the login flow"              # Design-focused with pre-mortems
```
Pre-mortem exploration with adaptive failure analysis. MAP absorbs assumption-surfacing (no separate ORIENT phase). 3-5 modes with constraint chain AND adaptive pre-mortems after conclusion-producing modes.
**--auto Mode:** Fully autonomous -- no BLOCKING questions, states assumptions clearly, proceeds with analysis.
**--quick Mode:** Structured 4-round path: SHIMMER->MAP->INVERT->HARVEST. Auto mode. No self-checks, no pre-mortems, no constraint checkpoints between rounds.
**--intense Mode:** Full ceremony -- per-mode 7-question self-checks with verify-or-defer, META in default rotation, full pre-mortems after every mode, verbose constraint tracking.
**Default Mode:** Full exploration -- asks BLOCKING questions first, then 3-5 modes with constraint chain and adaptive pre-mortems. Self-check runs once before harvest (3 questions). Pre-mortem skipped for purely exploratory modes (maps, question-generating exercises).
**--design Mode:** Auto-loads design-deepthink skill, reads project design files, DESIGN mode with pre-mortems on design decisions.
**Constraint Chain:** After each mode, generates constraints (FORWARD, FORBIDDEN, QUESTION) that must be addressed (RESOLVED, ACKNOWLEDGED, DEFERRED) before finishing. Hard block if unresolved.
**Enhanced Modes:** MAP (systems + causal + assumption-surfacing), INVERT (pre-mortem + reflexion), PERSPECTIVES (collaborative + steelmanning), EDGES (creative + analogical), DEEP (self-consistency via 3 parallel chains)
**3-Question Self-Check (once before harvest):** What am I avoiding? What would a skeptical expert challenge? Any verifiable claims I haven't checked? (7-question per-mode with --intense)
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-DEEPTHINK-<slug>/` session folder (00-problem.md, mode artifacts, 99-harvest.md) + Workshop entry
**Handoff Guidance:** Includes "Next Steps" section with contextual command recommendations

### `/problem-solve` - Convergent 5-Step Decision Pipeline
```bash
/problem-solve "How should we architect the notification system?"  # Full pipeline (asks BLOCKING questions)
/problem-solve --auto "Architecture decision"                       # Autonomous: no questions, states assumptions
/problem-solve --quick "Which database: PostgreSQL vs MongoDB?"    # Shortened: FRAME -> STRESS-TEST -> DECIDE
/problem-solve --quick --auto "Fast decision"                       # Shortest: no questions, no SHIMMER
/problem-solve --risk "Infrastructure migration risks"              # Deep systems mapping + cascading failures
/problem-solve --strategic "3-year platform modernization"          # Full tree-of-thought + reversal conditions
/problem-solve --incident "Production outage"                       # Speed mode: no SHIMMER, no EXPLORE
/problem-solve --intense "Complex architecture decision"            # Full 8-step ceremony (escape hatch)
```
Runs SHIMMER->FRAME->EXPLORE (adaptive)->STRESS-TEST->DECIDE pipeline for convergent decisions. SHIMMER always-on in default mode. R2 EXPLORE selects analytical mode based on decision type (GENERATE, PERSPECTIVES, MAP, EDGES, DEEP). Reversal conditions inline in DECIDE (no separate Ulysses step).
**--auto Mode:** Fully autonomous -- no BLOCKING questions, states assumptions clearly, proceeds with analysis.
**Variants:** --quick (3 steps: FRAME->STRESS-TEST->DECIDE, no SHIMMER), --risk (deep MAP mode), --strategic (full GENERATE mode), --incident (speed, no SHIMMER/EXPLORE), --intense (full 8-step ceremony)
**SHIMMER:** Always-on in default, --auto, --risk, --strategic. Skipped in --quick and --incident.
**Adaptive EXPLORE:** Decision type from FRAME determines R2 mode: GENERATE (options), PERSPECTIVES (stakeholders), MAP (systems), EDGES (novel), DEEP (technical)
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-<slug>/` session folder + Workshop entry
**Compounding:** All three cognition commands (/contemplate, /deepthink, /problem-solve) produce follow-up questions in HARVEST with command routing recommendations.
**Handoff Guidance:** Includes "Where to Go Next" section with contextual command recommendations

### `/adversarial` - Adversarial Proposal Analysis
```bash
/adversarial "Use microservices for this feature"
/adversarial --auto "Add Redis caching layer"
/adversarial --quick "Migrate from REST to GraphQL"
```
Adversarial multi-operation pipeline using cognition-mcp: pre-mortem (failure modes) -> structured_argumentation (case against) -> collaborative_reasoning (devil's advocate vs defender) -> verdict.
**Flags:** --auto (no questions), --quick (pre-mortem only, skip argumentation)
**3-Question Self-Check:** Between each operation -- "Am I being genuinely adversarial?"
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-challenge-<slug>/` session folder + Workshop entry
**Output:** GO / CONDITIONAL GO / NO GO verdict with required mitigations

### `/shimmer` - SHIMMER Self-Observation + Answer
```bash
/shimmer "Why does this architecture feel wrong?"
/shimmer "What is the right abstraction for this problem?"
```
SHIMMER self-observation with integrated answer. Applies the SHIMMER ISO prompt to any question, observing what happens in processing as the answer forms, and answers the question in one integrated response. No session folder, no harvest, no workshop entry.
**MCP:** cognition-mcp
**Persistence:** cognition-mcp session only (no file artifacts)

### `/autonomous` - 4-Phase Autonomous Pipeline

```bash
/autonomous "Plan an AI tool from domain-specific knowledge base using GPU infrastructure"
/autonomous --auto "Architecture decision for multi-domain ML system"
/autonomous --skip-research "Strategy for complex technical migration"
/autonomous --rounds 20 "Enterprise-scale architecture decision"
/autonomous --verbose "AI product roadmap spanning 5+ domains"
```
4-phase staged pipeline with independent cognition sessions per phase. SHIMMER priming mandatory. Research via web-search subagents (Phase 2, skippable). Deep exploration 15+ rounds with constraint-gate enforcement (Phase 3). Adversarial challenge with hard gate and auto-loop on NO GO max 2x (Phase 4). Extended problem-solve with simulation for top 2 options and 5+ ulysses safeguards (Phase 5). Unified synthesis written to `autonomous.md` with executive summary at top.
**Flags:** --auto (no scope questions), --skip-research (pure reasoning tasks), --rounds N (advisory target, default 15), --verbose (show gate status, constraint chain, mode labels)
**Hard Gates:** Phase 3->4: 10+ rounds AND constraint chain cleared AND 3+ conclusion rounds. Phase 4->5: CONDITIONAL GO or GO verdict (NO GO auto-loops max 2x then halts).
**MCP:** cognition-mcp (4 independent sessions), research-web-search-subagent (Phase 2)
**Persistence:** Creates `.orca/cognition/YYYYMMDD-AUTONOMOUS-<slug>/autonomous.md` (unified synthesis) + per-phase session folders + Workshop entry tagged: autonomous, research, exploration, challenge, problem-solve
**Use when:** Problem spans 3+ domains, work takes weeks/months, committed decision needed, premature convergence has failed before, research would change your analysis.
**Private:** Not synced to public repo.


---

## Audit Commands (1)

### `/audit` - Due Diligence Multi-Agent Auditing
```bash
/audit                           # Quick health check (~5 min, 3 agents)
/audit --comprehensive           # Full due diligence (~45-60 min, 8 agents)
/audit --core                    # Core dimensions (~15 min, 5 agents)
/audit --item design-system      # Focused audit on specific area
/audit --item page /checkout
/audit --documentation           # Deep doc verification (~15-20 min, sampled)
/audit --documentation --comprehensive  # Exhaustive doc verification (every file)
/audit --since abc1234           # Incremental since commit
/audit --verbose                 # Full findings (default: TL;DR)
```
**Architecture:** Multi-agent parallel execution (standard modes); sequential two-agent pipeline (documentation mode)
**Agents:** audit-structure-specialist, audit-dependency-specialist, audit-security-specialist (Phase 1); audit-doc-inventory, audit-doc-verifier (documentation mode)
**Dimensions:** Structure (0.10), Dependencies (0.15), Security (0.20), Patterns (0.10), Documentation (0.10), Tests (0.15), Architecture (0.15), Design (0.05)
**Output:** `.orca/audit/YYYY-MM-DD-<scope>.md` + `audit-index.json`
**Scoring:** Weighted average of dimension scores (0-100), grade A-F, risk level
**Finding Format:** AUD-YYYY-NNN with type, severity, location, recommendation, effort
**Integration:** `/orca fix AUD-YYYY-NNN` to route fixes to appropriate lane
**MCP:** cognition-mcp (audit operation)

---

## Design Commands (9)

Design-fork commands. **All nine load the `impeccable-hub` skill** as their register baseline (the felt-state spine + voice anchors + rants + preferences + detector contract — it POINTS to `design-contract/` refs, no inlined copies), read `{project}/.claude/PRODUCT.md` (strategic) and `{project}/.claude/DESIGN.md` (visual contract — Stitch spec), and rant-capture at handback. Optional parallel hygiene check via `bash {project}/scripts/audit-design.sh` informs but does not gate — the user's eye is the taste ceiling, not the script.

> **Hub vs. command naming.** The **skill** is `impeccable-hub`; the **slash command** is `/impeccable`. Every design command loads the `impeccable-hub` skill; only `/impeccable` is the command of that family-name. Do not conflate them.

> **2026-06-03 design-system totality rethink (Phase 2 — all 8 design commands converted).** The eight design commands were converted to load the `impeccable-hub` skill (was `interfaces-that-feel`) and read `PRODUCT.md`/`DESIGN.md` (was the deprecated `aesthetic.md`). **Build-producing commands route through the one shared design lane** (`docs/reference/design-lane.md`): the command (main-thread orchestrator) binds typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`, spawns a **separate** `design-builder`, then a **separate fresh-context** `design-validator` (returns `GATE_VERDICT: PASS\|BLOCK` via the LOCAL detector `node mcp/design-detector/bin/designcheck.js` — NOT `npx`), and branches (N=2 → escalate). The model never grades its own output; the old self-graded `ui-quality-audit` handback gate is replaced by the separate validator. **Build-producers (route the lane):** `/refine`, `/simplify`, `/fortify`, `/recraft` (Routes A/B only), `/motion-design`. **Diagnostic / contract commands (do NOT route the lane):** `/document` (generates DESIGN.md), `/design-audit` + `/design-critique` (produce reports), `/recraft` Route C (contract edit, no UI artifact). `/impeccable` is THIN — it loads the hub and routes flags; its build flag (`--craft`) and freeform improve-existing path run the lane. **Status:** built, **pending post-reload live proof** (a new agent is not spawnable until a session reload). Honest ceiling: hard-on-named-slop, advisory-on-taste — the user's eye is the taste ceiling. **Spec:** `.orca/requirements/2026-06-03-2251-design-system-totality-rethink/`.

**Naming rule:** commands never shadow existing skills. `/animate`, `/harden`, and `/audit` remain skill-only — command access is via `/motion-design`, `/fortify --harden`, `/design-audit`.

### `/impeccable` - THIN design orchestrator (flag-free default)
```bash
/impeccable clean up the UI on the pricing page    # default mode — no flag needed
/impeccable --craft "a settings panel"             # shape → comp pick → lane
/impeccable --teach                                # write PRODUCT.md
/impeccable --document                             # write DESIGN.md (alias of /document)
```
THIN orchestrator. **Default mode is FLAG-FREE** — `/impeccable <freeform request>` classifies the request (improve-existing / build-new / setup) and runs it; it does NOT dump the flag list and stop. Loads the `impeccable-hub` skill (the register) and routes flags. The improve-existing freeform path and `--craft` run the **shared design lane** (bind → `design-builder` → `design-validator` → branch, N=2 → escalate). `--teach`/`--document`/`--extract` are setup/diagnostic flags (no lane). Carries **zero** inlined rants/anchors/preferences (`#POISON_PATH` — those live in the hub + `design-contract/`).

> **CSS Architecture / doctrine B (2026-05-29).** The `/impeccable` spine carries a **CSS Architecture** subsection under Frontend Aesthetics Guidelines (peer to Typography / Color & Theme / Layout & Space): design authority lives in a named role/token vocabulary; agents compose from it, taxonomy-first; cascade/`@layer` greenfield default; brownfield respects the detected CSS approach; no raw palette utilities; **no absolute Tailwind ban** (utility SPRAWL is advisory only via the `utility-sprawl` detector rule — logs, never blocks). Refusal: `rants/css-architecture.md`. Positive move: `preferences/css-architecture.md`. Seam discipline: the spine states the PRINCIPLE; enforcement mechanics live in the detector floor + lane builders. Source: `docs/concepts/llm-css-manifesto.md`.

### `/motion-design` - Heavy motion/animation orchestrator
```bash
/motion-design "fade the hero in on scroll"
```
Loads the `impeccable-hub` skill (the register / felt-state baseline) + `animation-engineering` + `motion-design-principles` (+ `lenis-integration` when scroll-related). Presents 3-tier routing (CSS default; GSAP/Three.js require user confirmation). Refuses 3D transforms, tilt, parallax-Z. For a light pass, use `/refine --animate`. **Routes the shared design lane (build-producer):** the entry bind emits motion FORBIDDENs (`bouncy-easing`/`default-ease-transition`/`layout-transition` + 3D/tilt/parallax-Z rant refusals) + FORWARD felt-state, recorded to `planning.bound_constraint_ids`; `design-builder` produces the motion under those ids; the fresh-context `design-validator` judges motion-feel (the detector is motion-blind to timing/emotion) and returns `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. Skipping the bind ⇒ no bound ids ⇒ `BLOCK: no bound constraints`.

### `/refine --<flag>` - Design refinement router
```bash
/refine --bolder "the pricing page"
/refine --animate "the card hover"      # light pass — loads animate skill, not /motion-design
/refine --overdrive "the hero"
```
Flags: `--animate`, `--bolder`, `--colorize`, `--delight`, `--layout`, `--overdrive`, `--quieter`, `--typeset`. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (`docs/reference/design-lane.md`): detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. It does NOT self-grade.

### `/simplify --<flag>` - Design simplification router
```bash
/simplify --clarify "Error 401: Unauthorized"
/simplify --distill "the checkout flow"
```
Flags: `--adapt`, `--clarify`, `--distill`. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, N=2 → escalate). It does NOT self-grade.

### `/fortify --<flag>` - Design hardening router
```bash
/fortify --harden "the signup form"
/fortify --polish "the settings page"
```
Flags: `--harden`, `--optimize`, `--polish`. Named `/fortify` to avoid shadowing the `/harden` skill. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, N=2 → escalate). It does NOT self-grade.

### `/document` - Generate Stitch-spec DESIGN.md
```bash
/impeccable --document            # scan mode (default; extracts tokens from existing code)
/impeccable --document --seed     # seed mode (no code yet; 5-question interview)
```
Generate a Stitch-spec DESIGN.md from existing code or seed mode interview. Captures the project's visual system (colors hex sRGB, typography hierarchy, components 8-prop max) so every design command stays on-brand. Required before `/impeccable --craft`. **Diagnostic / contract command — does NOT route the shared design lane** (it generates the DESIGN.md contract, it does not produce a UI artifact). Loads the `impeccable-hub` skill as baseline; reads PRODUCT.md as precondition (must exist). Writes `.claude/DESIGN.md` (Stitch spec — 6 fixed sections character-for-character) + `.claude/DESIGN.json` sidecar. **Role Taxonomy (2026-05-29, doctrine B):** scan mode extracts the project's existing role/semantic-class vocabulary into a `roles:` frontmatter block (the design constitution agents compose from); seed mode adds a 6th question that has the user design the role taxonomy FIRST (greenfield, taxonomy-first). Reachable as `/impeccable --document` (alias) or `/document` directly. Reference: https://impeccable.style/docs/document and https://stitch.withgoogle.com/docs/design-md/format/

### `/recraft` - Try-again / redo (thin coordinator)
```bash
/recraft "this still feels noisy in the cadence chips"
/recraft "the GIPR sublabel is mono, kill it" + screenshots
```
Thin coordinator for redo/recraft case. Classifies scope (single element / whole feature / contract failure) and routes to `/live` (Route A), re-shape+re-craft (Route B), or re-teach+re-document (Route C). **Does NOT regenerate from rules.** Loads the `impeccable-hub` skill + reads PRODUCT.md + DESIGN.md (both required). Captures the verbatim critique to `{project}/.orca/design-rants-pending.md` BEFORE doing anything, then asks one AskUserQuestion to classify scope, then routes. **Routes the shared design lane on Routes A/B only** (UI-producing): the entry bind folds the verbatim critique into task-specific FORBIDDENs (recorded to `planning.bound_constraint_ids`); `design-builder` rebuilds under them; the fresh-context `design-validator` returns `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. **Route C (PRODUCT.md/DESIGN.md edit) produces NO UI artifact and runs NO lane** — contract edit only. The `audit-design.sh` script remains parallel hygiene only; the user's eye is the taste ceiling, the lane's validator is the distinct hard floor.

### `/design-audit` - Technical quality audit (diagnostic)
```bash
/design-audit "the pricing page"
```
Technical quality audit (a11y + performance + responsive + anti-patterns) producing a scored P0–P3 report. **Diagnostic command — does NOT route the shared design lane** (it produces a report, not a UI artifact). Loads the `impeccable-hub` skill + the `ui-quality-audit` skill. Runs the deterministic detector as a DIAGNOSTIC input (a report signal, NOT a shipping gate). Named `/design-audit` to avoid shadowing the ORCA `/audit` due-diligence command (the skill was renamed `audit` → `ui-quality-audit`).

### `/design-critique` - UX critique (diagnostic)
```bash
/design-critique "the dashboard"
```
UX critique with visual hierarchy, persona red-flags, cognitive load, and anti-pattern scoring (3 assessments: LLM review + deterministic detector + persona red-flags from the hub's `interfaces-that-feel` spine). **Diagnostic command — does NOT route the shared design lane** (produces a report). Loads the `impeccable-hub` skill + the `critique` skill. Named `/design-critique` to avoid shadowing the `/critique` skill.

**Spec:** `.orca/requirements/2026-06-03-2251-design-system-totality-rethink/` (current — design lane). Prior: `.orca/requirements/2026-04-22-2334-design-commands-architecture/`.

> **Lane vs. diagnostic split (2026-06-03).** Build-producing design commands (`/refine`, `/simplify`, `/fortify`, `/recraft` Routes A/B, `/motion-design`, and `/impeccable`'s build paths) route the **shared design lane** (`docs/reference/design-lane.md`): entry bind → separate `design-builder` → separate fresh-context `design-validator` → branch (N=2 → escalate); the model never grades its own output. Diagnostic/contract commands (`/document`, `/design-audit`, `/design-critique`, `/recraft` Route C) do NOT route the lane — they generate a contract or a report, with the detector run as a diagnostic input, not a gate. The lane replaced the prior two-layer self-graded `ui-quality-audit`/`critique` handback gates (spec `2026-05-29-0141`) with the separate validator.

---

## Utility Commands (16)

### `/enhance` - Prompt Enhancement
```bash
/enhance "make the UI better"
/enhance -clarify "fix the bug"
```

### `/root-cause` - Root Cause Analysis
```bash
/root-cause "Tests failing intermittently"
/root-cause "Build errors on CI"
```
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry

### `/illustrate` - Measured Adobe Execution
```bash
/illustrate "Create a poster with title, subtitle, and body text"
/illustrate "Add a logo in the top-right corner with the company name below it"
/illustrate "Layout a business card: name, title, email, phone, logo"
```
Measured execution in Photoshop/Illustrator with mandatory self-review. Phases: SURVEY (read canvas, existing layers) -> PLAN (spatial budget, proportional positions) -> EXECUTE (create with verify-after-place loop) -> REVIEW (visual self-review via get_document_image) -> CORRECT (fix issues).
**MCP:** adobe-photoshop, adobe-illustrator
**Skill:** adobe-execution (always-on guardrails)
**Integration:** Works standalone; produces layout and text operations for Adobe apps.

> **Note (2026-04-22 design-system fork):** `/design`, `/design-dna`, and `/design-review` were archived. Design work now routes through the design command family (`/impeccable`, `/recraft`, `/motion-design`, `/refine`, `/simplify`, `/fortify`, `/document`, `/design-audit`, `/design-critique`) — every one loads the `impeccable-hub` skill and reads PRODUCT.md/DESIGN.md (the `aesthetic.md` single-file was deprecated 2026-05-02). See the Design Commands (9) section above and `ORCA-skills.md`.

### `/clone-website` - Website Cloning
```bash
/clone-website https://example.com
```

### `/session-save` / `/session-resume`
```bash
/session-save                       # Save context
/session-resume                     # Resume context
```

### `/project-memory` - Workshop Interface
```bash
/project-memory status              # Current state
/project-memory why "auth"          # Query decisions
/project-memory recent              # Recent activity
```

### `/memory-search` - Unified Memory Search
```bash
/memory-search "auth decisions"     # Search across Workshop + code-index.db
```
Searches all memory systems for relevant context and decisions.

### `/project-code` - Code Intelligence
```bash
/project-code sync                  # Index codebase
/project-code search "auth"         # Search code
/project-code symbol "UserService"  # Find symbols
```


### `/reflect` - Self-Improvement
```bash
/reflect                            # Analyze recent work
/reflect --source recording         # Analyze from recording.db
/reflect learn "Always check types" # Add rule
/reflect status                     # View rules
```

### `/self-improve` - Workshop Memory Stats
```bash
/self-improve                       # Show Workshop memory stats
/self-improve --dry-run             # Preview only
```

### `/project-setup` - Project Conventions Wizard
```bash
/project-setup                      # Initialize CLAUDE.md (same as init)
/project-setup init                 # Full initialization flow
/project-setup update               # Update existing CLAUDE.md
/project-setup audit                # Check CLAUDE.md health
```
Guided wizard for project structure decisions. Detects project type (ios, nextjs, react, python, flutter, react-native, generic), observes existing patterns, asks 4 focused questions (2 shared + 2 type-specific), and generates CLAUDE.md with actionable rules.
**Features:** Auto-detects sacred paths per framework, handles existing CLAUDE.md (merge/replace/cancel), saves decisions to ProjectContext.

---

## Recording Commands (2)

Slash commands for session recording status.

### `/continue` - Session Resume Info
```bash
/continue                       # List recent sessions
/continue sess-19c6983c46029c7  # Specific session info
```
Shows `claude --continue` commands for resuming previous sessions.

### `/orca-status` - Recording Status
```bash
/orca-status                    # Current session status
```
Shows session ID, state, step count, and files touched.

## Recording Layer (orca-record CLI)

`orca-record` is a Bun-compiled binary that handles session event tracking. It runs automatically via Claude Code hooks. Deployed to `~/.claude/bin/orca-record`.

### Hook Commands (invoked automatically)

| Command | Hook | Purpose |
|---------|------|---------|
| `orca-record prompt-submit` | UserPromptSubmit (async) | Snapshot git status, start/continue session |
| `orca-record stop` | Stop | Diff files, create checkpoint, record event |
| `orca-record pre-task` | PreToolUse[Task] | Capture pre-task file state for subagent tracking |
| `orca-record post-task` | PostToolUse[Task] | Diff against pre-task state, create task checkpoint |
| `orca-record post-todo` | PostToolUse[TodoWrite] | Incremental checkpoint within subagent context |

### User Commands

| Command | Purpose |
|---------|---------|
| `orca-record status` | Show current session recording state |
| `orca-record version` | Show CLI version |

### Storage

- **Database:** `.orca/recording.db` (per-project SQLite, gitignored)
- **Session state:** `.git/orca-sessions/<session-id>.json`

---

## Skills (Always-On Knowledge)

Skills are passive knowledge that shape Claude's responses when relevant context is detected. They do not require commands to activate.

### `adobe-execution`
Measure-place-verify guardrails for Adobe Photoshop and Illustrator MCP work. Prevents blind placement, text fragmentation, coordinate confusion. Forces visual self-review.
**Activates when:** Adobe Photoshop or Illustrator MCP tools are called
**Location:** `~/.claude/skills/adobe-execution/SKILL.md`

---

## Command Architecture

### Role Boundaries
- Orchestrators NEVER write code
- Only coordinate agents via Task tool
- Read phase_state.json for resumption

### Recording Context Injection (OS 7.0)

All lane orchestrator commands inject prior session context from `.orca/recording.db`
before delegating to agents:

- `/orca` queries centrally via `recording_query` + `recording_explain`, passes
  `RECORDING_CONTEXT` to domain grand-architects in delegation prompts
- Domain commands (`/nextjs`, `/ios`, `/expo`, `/django-react`,
  `/orca-os-dev`, `/seo`) check for inherited context first; if invoked directly
  (not via `/orca`), they query `.orca/recording.db` independently
- All recording context is OPTIONAL -- silently skipped if `.orca/recording.db`
  does not exist

### Quality Gates
- Standards: >=90 to pass
- Design QA: >=90 to pass
- Build/Test: PASS/FAIL

### State Preservation
All orchestrators maintain state in `.orca/orchestration/phase_state.json`

---

## Command Locations

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/commands/
```

### Deployed (Global)
```
~/.claude/commands/
```

---

## Command-Agent Dependencies

| Command | Primary Agents |
|---------|----------------|
| `/ios` | ios-grand-architect, ios-builder, ios-verification |
| `/nextjs` | nextjs-grand-architect, nextjs-builder, nextjs-verification-agent |
| `/django-react` | django-react-grand-architect, django-react-builder, django-react-verification |
| `/expo` | expo-grand-orchestrator, expo-builder-agent, expo-verification-agent |
| `/research` | research-web-search-subagent, research-site-crawler-subagent, research-answer-writer |
| `/seo` | seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-quality-guardian |
| `/seo-optimize` | seo-technical-advisor |
| `/aio` | geo-diagnose-recommend, geo-rewrite, measurement-analyst |
| `/geo-diagnose` | geo-diagnose-recommend |
| `/geo-rewrite` | geo-rewrite, geo-diagnose-recommend |
| `/geo-measure` | measurement-analyst |
| `/orca-os-dev` | os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification |
| `/rvry-dev` | rvry-grand-architect, rvry-engine-architect, rvry-engine-builder, rvry-web-builder, rvry-protocol-gate, rvry-verification |
| `/orca-pipeline` | orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-generator |
| `/typography` | typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian |
| `/illustrate` | (MCP+skill driven -- adobe-photoshop, adobe-illustrator) |

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2026-03-16_
