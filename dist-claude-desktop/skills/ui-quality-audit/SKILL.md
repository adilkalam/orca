---
name: ui-quality-audit
description: Run technical quality checks across accessibility, performance, theming, responsive design, and anti-patterns. Generates a scored report with P0-P3 severity ratings and actionable plan. Use when the user wants an accessibility check, performance audit, or technical quality review.
---

Run systematic **technical** quality checks and generate a comprehensive report. Don't fix issues in this pass — document them so they can be addressed deliberately.

This is a code-level audit, not a design critique (see the `critique` skill for that). Check what's measurable and verifiable in the implementation — read the actual source (HTML/CSS/JS/TSX) the user shares or pastes.

## Diagnostic Scan

Run comprehensive checks across 5 dimensions. Score each dimension 0-4 using the criteria below.

### 1. Accessibility (A11y)

Check for: contrast issues (< 4.5:1, or 7:1 AAA), missing ARIA roles/labels/states, missing focus indicators / illogical tab order / keyboard traps, improper heading hierarchy, divs instead of buttons, missing/poor alt text, unlabeled inputs, poor error messaging.

**Score 0-4**: 0=Inaccessible (fails WCAG A), 1=Major gaps, 2=Partial, 3=Good (WCAG AA mostly met), 4=Excellent (WCAG AA fully met, approaches AAA)

### 2. Performance

Check for: layout thrashing (read/write layout properties in loops), expensive animations (animating width/height/top/left instead of transform/opacity), missing lazy loading, unoptimized assets, unnecessary re-renders/missing memoization.

**Score 0-4**: 0=Severe issues, 1=Major problems, 2=Partial, 3=Good, 4=Excellent (fast, lean, well-optimized)

### 3. Theming

Check for: hard-coded colors not using tokens, broken dark mode, inconsistent token usage, values that don't update on theme change.

**Score 0-4**: 0=No theming, 1=Minimal tokens, 2=Partial, 3=Good, 4=Excellent (full token system, dark mode works perfectly)

### 4. Responsive Design

Check for: fixed widths that break on mobile, touch targets < 44x44px, horizontal scroll on narrow viewports, layouts that break when text size increases, missing breakpoints.

**Score 0-4**: 0=Desktop-only, 1=Major issues, 2=Partial, 3=Good, 4=Excellent (fluid, all viewports, proper touch targets)

### 5. Anti-Patterns (CRITICAL)

Look for AI-slop tells: AI-typical color palette (purple/blue gradients), gradient text, glassmorphism, hero-metric layouts, identical repeated card grids, generic reflex fonts (Inter/Roboto/Geist as a default choice, not a deliberate one) — and general anti-patterns: gray text on colored backgrounds, nested cards, bounce/elastic easing, redundant copy, side-stripe borders on cards.

**Score 0-4**: 0=AI slop gallery (5+ tells), 1=Heavy AI aesthetic (3-4 tells), 2=Some tells (1-2), 3=Mostly clean, 4=No AI tells (distinctive, intentional design)

## Generate Report

### Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | ? | |
| 2 | Performance | ? | |
| 3 | Responsive Design | ? | |
| 4 | Theming | ? | |
| 5 | Anti-Patterns | ? | |
| **Total** | | **??/20** | **[Rating band]** |

**Rating bands**: 18-20 Excellent, 14-17 Good, 10-13 Acceptable, 6-9 Poor, 0-5 Critical

### Anti-Patterns Verdict
**Start here.** Pass/fail: Does this look AI-generated? List specific tells. Be brutally honest.

### Executive Summary
Score, total issue count by severity (P0/P1/P2/P3), top 3-5 critical issues, recommended next steps.

### Detailed Findings by Severity

Tag every issue P0-P3:
- **P0 Blocking**: prevents task completion — fix immediately
- **P1 Major**: significant difficulty or WCAG AA violation — fix before release
- **P2 Minor**: annoyance, workaround exists — fix in next pass
- **P3 Polish**: nice-to-fix, no real user impact

For each: issue name, location (component/file/line), category, impact, standard violated (if applicable), recommendation, which of the pack's design skills would fix it (e.g. `harden` for edge cases, `polish` for alignment).

### Patterns & Systemic Issues

Call out recurring problems ("hard-coded colors appear in 15+ components," "touch targets consistently too small throughout mobile").

### Positive Findings

Note what's working — good practices to maintain and replicate.

## Recommended Actions

List recommended follow-up skills in priority order (P0 first). Only recommend skills that exist in this pack. End with `polish` as the final step if any fixes were recommended.

After presenting the summary: "You can ask me to run these one at a time, all at once, or in any order you prefer. Ask me to re-run this audit after fixes to see the score improve."

**IMPORTANT**: Be thorough but actionable. Too many P3 issues creates noise. Focus on what actually matters.

**NEVER**:
- Report issues without explaining impact
- Provide generic recommendations (be specific and actionable)
- Skip positive findings
- Forget to prioritize (everything can't be P0)
- Report false positives without verification

Remember: You're a technical quality auditor. Document systematically, prioritize ruthlessly, cite specific code locations, and provide clear paths to improvement.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
