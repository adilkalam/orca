---
name: critique
description: Evaluate design from a UX perspective, assessing visual hierarchy, information architecture, emotional resonance, cognitive load, and overall quality with quantitative scoring, persona-based testing, and actionable feedback. Use when the user asks to review, critique, evaluate, or give feedback on a design or component.
---

## Preparation

Read the `impeccable-hub` skill first if available this conversation. Additionally gather: what the interface is trying to accomplish.

Note on scope: the original version of this skill ran two independent sub-agent reviews (an LLM design review and an automated detector scan) so neither would bias the other. This app has no subagent mechanism, so run both passes yourself, sequentially, and genuinely try not to let your first pass's conclusions color the second — write brief notes after each pass before moving to the next.

## Pass 1: Design Review

Read the relevant source (HTML/CSS/JS/TSX the user shares) and, if a browser-automation MCP tool is connected in this conversation, visually inspect the live page. Think like a design director. Evaluate:

**AI Slop Detection (CRITICAL)**: Does this look like every other AI-generated interface? Check for AI-typical color palettes, gradient text, dark glows, glassmorphism, hero-metric layouts, identical repeated card grids, generic fonts used by default rather than by choice. **The test**: if someone said "AI made this," would you believe them immediately?

**Holistic Design Review**: visual hierarchy (eye flow, primary action clarity), information architecture (structure, grouping, cognitive load), emotional resonance (does it match brand and audience? — consult the `interfaces-that-feel` skill), discoverability, composition (balance, whitespace, rhythm), typography, color (purposeful use, cohesion, accessibility), states & edge cases (empty, loading, error, success), microcopy.

**Cognitive Load**: run an 8-item cognitive-load check (visible options at each decision point, progressive disclosure, jargon, redundant confirmations, unclear next-actions, competing CTAs, overloaded forms, unstated system status). Report failure count: 0-1 = low (good), 2-3 = moderate, 4+ = critical. If more than 4 options appear at a single decision point, flag it.

**Emotional Journey**: what emotion does this interface evoke, and is that intentional? Peak-end rule — is the most intense moment positive, does the experience end well? Check for anxiety spikes at high-stakes moments (payment, delete, commit) and whether there are design interventions (progress indicators, reassurance copy, undo options).

**Persona red-flags**: using the `interfaces-that-feel` skill's register table (joy/efficiency/trust/urgency), pick 2-3 personas relevant to this product. For each, walk through the primary user action and list specific red flags — name the exact elements/interactions that fail each persona, don't write generic persona descriptions.

**Nielsen's 10 Heuristics**: score each 0-4 (see table below).

## Pass 2: Systematic Self-Check

Re-scan specifically against a named-pattern checklist, independent of the impressionistic Pass 1 read:

- Tailwind-default palette / raw hex matching Tailwind 500-shades
- Geist / Inter / other reflex fonts used without a deliberate reason
- Purple-pink AI gradients, gradient text (`background-clip: text` + gradient)
- Default-ease or bounce/elastic transitions
- Side-stripe borders (`border-left/right` on cards/callouts) — near-universal AI dashboard tell
- Nested cards, identical repeated tile grids
- Gray text on colored backgrounds, pure black/white large areas
- Everything centered with no asymmetry

If the `impeccable-hub` skill's bundled `detector-rules.json` resource is available, cross-check specifically against its rule list and cite rule ids in findings — that's the same rule corpus a live detector CLI would enforce mechanically in a coding environment; here it's a manual self-check, not a mechanical one, so say so plainly rather than implying automated verification happened.

## Step 3: Generate Combined Critique Report

Synthesize both passes into a single report — don't just concatenate them. Note where they agree and where the systematic check caught something the impressionistic read missed.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | ? | |
| 2 | Match System / Real World | ? | |
| 3 | User Control and Freedom | ? | |
| 4 | Consistency and Standards | ? | |
| 5 | Error Prevention | ? | |
| 6 | Recognition Rather Than Recall | ? | |
| 7 | Flexibility and Efficiency | ? | |
| 8 | Aesthetic and Minimalist Design | ? | |
| 9 | Error Recovery | ? | |
| 10 | Help and Documentation | ? | |
| **Total** | | **??/40** | **[Rating band]** |

Be honest with scores. A 4 means genuinely excellent. Most real interfaces score 20-32.

### Anti-Patterns Verdict

**Start here.** Does this look AI-generated? Cover overall aesthetic feel, layout sameness, generic composition, missed opportunities for personality. List what the systematic self-check (Pass 2) found, with counts and locations, and flag anything you're not fully confident about as a possible false positive.

### Overall Impression
A brief gut reaction: what works, what doesn't, and the single biggest opportunity.

### What's Working
2-3 things done well, specifically why.

### Priority Issues
3-5 most impactful problems, ordered by importance, each tagged P0-P3:
- **[P?] What**: name the problem clearly
- **Why it matters**: how this hurts users or undermines goals
- **Fix**: concrete
- **Suggested skill**: which other skill in this pack could help (e.g. `layout`, `typeset`, `clarify`, `harden`)

### Persona Red Flags
The findings from Pass 1 — be specific, name the exact elements and interactions that fail each persona.

### Minor Observations
Smaller issues worth addressing.

### Questions to Consider
Provocative questions that might unlock better solutions ("What if the primary action were more prominent?" "Does this need to feel this complex?").

**Remember**:
- Be direct. Vague feedback wastes everyone's time.
- Be specific — "the submit button," not "some elements."
- Say what's wrong AND why it matters to users.
- Give concrete suggestions, not just "consider exploring..."
- Prioritize ruthlessly. If everything is important, nothing is.
- Don't soften criticism. Honest feedback ships better design.

## Step 4: Ask the User

After presenting findings, ask 2-4 targeted questions based on what was actually found (never generic "who is your audience?" questions):

1. **Priority direction**: which issue category matters most right now? Offer the top 2-3 categories found.
2. **Design intent**: if a tonal mismatch was found, was it intentional? Offer 2-3 tonal directions that would address it.
3. **Scope**: address everything, or focus on the top 3?
4. **Constraints** (optional): anything off-limits?

If findings are straightforward (1-2 clear issues), skip questions and go straight to recommendations.

## Step 5: Recommended Actions

After the user answers, present a prioritized list of which skills in this pack to run next, in the order that matches their stated priorities, each with enough context that the skill knows what to focus on. End with `polish` as the final step if any fixes were recommended.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
