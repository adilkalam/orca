---
name: clone-website
description: Analyze a website (from a URL, or from an uploaded screenshot) and produce a structured clone spec — information architecture, layout/component inventory, and inferred design tokens — that could guide rebuilding it. Use when the user wants to "clone this site", "recreate this UI", "copy this page's design", or gives a screenshot and asks for a component breakdown/implementation spec.
---

# Website Clone Spec

Produces a structured specification of a site's UI and structure — not code, and not a working clone. This is the analysis/spec step; actually rebuilding the site in a specific framework is a separate, project-specific task outside this skill's scope.

## 1. Inputs and clone mode

Ask (unless already clear from the request):
- **Target**: a URL, or a screenshot/image the user has uploaded.
- **Clone mode**:
  - `exact` — 1:1 UI/structure, within legal/ethical bounds.
  - `similar` — keep the structural patterns, swap in different brand tokens.
  - `inspired` — use it as a structural starting point, expect real changes.
  - `structure` — information-architecture/layout only, no visual mimicry.
- **Scope**: which pages/sections matter (home only? a specific funnel? just the pricing section?).

## 2. Mandatory safety check

Before analyzing anything:
- Never clone sites with ethical, legal, adult, or privacy-sensitive content.
- Never clone login/auth flows or anything that could be repurposed for phishing.
- If the target page is behind auth, ask the user for a screenshot of the logged-in view instead of trying to reach it directly.

## 3. Analysis

**From a URL:** WebFetch the target page(s). For each page/section in scope, extract: title/meta description, main content blocks, and structural hints (repeated card patterns, nav structure, footer structure, hero layout). If the site is heavily client-rendered and WebFetch returns a near-empty shell, say so — don't fabricate a spec from a page you couldn't actually see.

**From a screenshot:** Analyze the image directly — identify the component inventory (buttons, cards, nav, hero, forms, etc.), the layout grid, and the visual hierarchy. State assumptions explicitly where the image doesn't show enough to be sure (e.g. hover states, off-screen content).

## 4. Produce the clone spec

Write up a spec covering:

1. **Information architecture** — pages/sections and their roles; primary nav and footer structure.
2. **Layout & components** — the layout grid per page/section; core reusable components (hero, cards, CTA blocks, forms, nav, footer); which patterns repeat.
3. **Design system hints** — inferred color palette, typographic scale, and spacing rhythm (as observations, not literal hex/px unless you can actually read them off the page — say "approximately" where you're estimating from a screenshot). Interaction patterns you can infer (hover states, scroll behavior, modals).
4. **Clone-mode translation** — for the chosen mode, what to mirror exactly vs. what to treat as inspiration only. For `exact`, flag anything that raises the legal/ethical concerns from Step 2 instead of proceeding.

## 5. Hand back

Present the spec to the user as the deliverable. If they want it actually built, that's a separate implementation task in their own project/tooling — this skill's job ends at a clear, structured spec they (or another tool) can build from.
