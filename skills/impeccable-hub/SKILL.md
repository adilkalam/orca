---
name: impeccable-hub
description: The single home for durable design knowledge. Load this when doing ANY front-end / visual / interface / motion work — crafting a feature, refining an interface, hardening a form, setting type, choosing color, building layout, designing motion. It is the felt-state baseline (interfaces-that-feel) PLUS the user's register: voice anchors, refusals (rants), positive moves (preferences), and the named-slop detector contract. It does NOT inline those files — it indexes and points to their single canonical home in docs/concepts/design-contract/ and docs/concepts/impeccable-reference/. Loading this skill is what ends the repetition tax: the rules are present by construction, not re-stated per task.
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# Impeccable — the design hub

This is the ONE home for durable design knowledge. Every design verb (`/impeccable --craft`,
`--typeset`, `--colorize`, `--layout`, `--bolder`, `--harden`, …) loads this hub, so the register is
present *structurally* — you never need it re-stated.

**This hub POINTS; it does not inline.** The rants, voice anchors, preferences, and detector rules each
have a single canonical home under `docs/concepts/design-contract/`. Re-inlining them here would
recreate the lossy monolith this system was built to delete (`#POISON_PATH`). Read the source files when
you reach for the corresponding move — they carry the full voice, regex signals, and substitutes.

> Path note: in this repo the collection lives at `docs/concepts/...`; deployed it lives at
> `~/.claude/docs/concepts/...`. Both resolve to the same content. Read whichever exists.

---

## 1. The felt-state baseline (the spine)

Start every interface from the **felt state of the person**, not the task. This is the
`interfaces-that-feel` practice — it is the first thing you load.

→ **`skills/interfaces-that-feel/SKILL.md`** (the full practice: felt-state framing, motion craft,
copy voice, empty states, error messages, loading, onboarding, micro-interactions).

Technical correctness is the floor. The ceiling is: does this product know the user is a person?

---

## 2. The register — voice anchors (the user's own words)

The voice anchors are load-bearing direct quotes from Adil. They are the *why* behind every refusal and
move below. Do not paraphrase or dilute them; edits that weaken them must be refused (`#POISON_PATH`).

→ **`docs/concepts/design-contract/voice-anchors.md`** — the full register (17 anchors).

A few that orient the whole system (read the file for all of them):
- "The use of Geist = vercel → no thought in typography. Boring, plain, looks like every other SaaS."
- "Whatever color that background is hurts my eyes; the gradients only make it worse." (AI-purple)
- "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but notice."
- "A great one carries what the product is in a way that's immersive, without announcing. There is
  nothing uglier than annotated art."
- "Smooth, elegant motion — not perspective, just directional."

### Core principles (Adil's, beside Bakaus's direction)

- **Composure** — self-possession + carrying-without-announcing
- **Exact structure, honest surface** — pixel-precise geometry with real texture
- **Balance as organizing principle** — negative/positive space discipline; the entry point carries the
  viewer to the destination without announcing
- **Shown, not announced** — the Nike/Porsche mode. Annotated art is ugly.
- **Scale as registration** — don't miniaturize what matters; don't inflate what doesn't
- **Life beside weight** — multiple registers cohabit the same frame
- **Dignity preservation** — subjects respected, not displayed

Commit to a BOLD aesthetic direction. Bold maximalism and refined minimalism both work — the key is
intentionality, not intensity. Make unexpected choices true to the context. **No design should be the
same across projects. NEVER converge on common choices across generations.**

---

## 3. The refusals (rants) — what is NEVER acceptable

Each rant is a named refusal with full voice + regex signals + substitutes. Consult the rant when you
reach for the move it forbids. Most map to a detector rule id (§5) that BLOCKS at the gate.

| Refusal | Source rant | Detector rule(s) |
|---|---|---|
| Tailwind palette (utility classes + hex values) | `design-contract/rants/colors.md` | `tailwind-palette-utilities`, `tailwind-hex-values`, `ai-color-palette` |
| Geist + extended reflex font list | `design-contract/rants/fonts.md` | `reflex-fonts`, `geist-imports`, `overused-font`, `single-font` |
| AI-purple/magenta/pink gradients | `design-contract/rants/gradients.md` | `purple-pink-gradients`, `gradient-text` |
| iOS-as-default / pretend-variation | `design-contract/rants/generic-ui-defaults.md` | (taste — advisory) |
| Motion suddenness / default ease | `design-contract/rants/motion-suddenness.md` | `default-ease-transition`, `bouncy-easing`, `bounce-easing` |
| Chamfer stack (inset highlight + shadow + gradient) | `design-contract/rants/chamfered-buttons.md` | `inset-highlight-shadow` |
| Alignment violations / floating elements | `design-contract/rants/alignment-spacing.md` | (taste — advisory) |
| AI-signature rounded corners | `design-contract/rants/rounded-corners.md` | `border-accent-on-rounded` |
| Photorealistic skeuomorphism as default | `design-contract/rants/skeuomorphism.md` | (taste — advisory) |
| Side-stripe borders on cards/callouts | `design-contract/rants/alignment-spacing.md` | `side-stripe-borders`, `side-tab` |
| Monospace-as-"technical" shorthand | `design-contract/rants/typography-mono.md` | (taste — advisory) |
| Uniform tile / same-card-grid layout | `design-contract/rants/uniform-tile-layout.md` | `icon-tile-stack`, `nested-cards` |
| Utility sprawl / scattered design authority | `design-contract/rants/css-architecture.md` | `utility-sprawl` (**advisory only**, never blocks) |

**Absolute bans (rewrite the element entirely if you catch yourself reaching for these):**
- **Side-stripe borders** (`border-left/right` > 1px, including via CSS vars) on cards/list-items/
  callouts/alerts — the most overused dashboard "touch". Reach for full borders, background tints,
  leading numbers/icons, or nothing.
- **Gradient text** (`background-clip: text` + any gradient) — top-three AI tell. Use solid color; for
  emphasis use weight or size.

---

## 4. The positive moves (preferences) — what to reach for instead

Each preference is a positive catalog/procedure. Consult when making the corresponding decision.

| Move | Source preference |
|---|---|
| Typography fonts (22 fonts, 4 categories) | `design-contract/preferences/typography-fonts.md` |
| Type scale & hierarchy (non-uniform) | `design-contract/preferences/typography-scale.md` |
| Typography spacing (junction discipline — no double-stacked margins) | `design-contract/preferences/typography-spacing.md` |
| Alignment precision (7 optical rules) | `design-contract/preferences/alignment-precision.md` |
| Motion references (directional, not perspective) | `design-contract/preferences/motion-references.md` |
| Monospace, used well | `design-contract/preferences/typography-mono.md` |
| CSS architecture (centralized role taxonomy, taxonomy-first, `@layer`, tokens as boundary) | `design-contract/preferences/css-architecture.md` |

### Always-on craft (do these without consulting a reference)

- **Type:** modular scale, fluid `clamp()` on marketing/content headings, fixed `rem` for app/dashboard
  UI. Fewer sizes, more contrast (≥1.25 ratio). Cap body at ~65–75ch. Line-height scales inversely with
  line length; add 0.05–0.1 for light-on-dark.
- **Color:** OKLCH, not HSL. Reduce chroma toward white/black. Tint neutrals toward the brand hue
  (chroma 0.005–0.01). 60-30-10 by visual *weight*. No pure `#000`/`#fff`. Theme (light/dark) is
  DERIVED from audience + viewing context, never a safe default.
- **Space:** 4pt scale with semantic token names. `gap` over margins. Vary spacing for hierarchy; break
  the grid intentionally. `repeat(auto-fit, minmax(280px, 1fr))` is the breakpoint-free card grid.
  Container queries for components, viewport queries for page layout.
- **Motion:** high-impact moments over scattered micro-interactions. Exponential easing
  (ease-out-quart/quint/expo). Transform + opacity only — never animate layout. No bounce/elastic.

### Font selection procedure (do this BEFORE typing any font name)

The failure mode is: "told not to use Inter, so I reach for my next favorite → new monoculture."
1. Write 3 concrete brand-voice words (NOT "modern"/"elegant" — dead categories).
2. List the 3 fonts you'd reflexively reach for. If any are in the reflex list
   (`design-contract/rants/fonts.md` — Fraunces, Newsreader, Playfair, IBM Plex, Space Grotesk, Inter,
   DM Sans, Outfit, Plus Jakarta, Instrument, et al), **reject them.**
3. Browse a catalog with the 3 words in mind (Google Fonts, Pangram Pangram, Future Fonts, Klim,
   Velvetyne …). Find a font that fits the brand as a *physical object*. Reject the first "designy" pick.
4. Cross-check: "elegant" is not necessarily a serif; "technical" not necessarily a sans; "warm" not
   Fraunces. If the pick lines up with reflex, go back to step 3.

### CSS architecture (doctrine B — centralize authority, NOT a Tailwind ban)

Design authority lives in a named role/token vocabulary; agents COMPOSE from it, they do not invent
design inline. Greenfield default: semantic CSS + cascade + `@layer`, taxonomy designed first.
Brownfield: respect the detected approach, enforce centralization *within* it. No raw palette utilities
(P0). Token-mapped semantic Tailwind is fine; utility SPRAWL is advisory only. Refusal:
`rants/css-architecture.md`. Procedure: `preferences/css-architecture.md`. This hub states the
PRINCIPLE; enforcement lives in the detector floor + the validator agent.

---

## 5. The detector — the named-slop floor

The detector is a deterministic CLI that names slop. It is the FLOOR of the gate, never the taste
ceiling. Run it in-repo as:

```bash
node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <path> 2>&1; echo "EXIT=$?"
```

> Use the LOCAL node entry above — `npx designcheck` is NOT a published package.

Contract (verified): **EXIT 0** + `[]` = clean. **EXIT 2** = findings, and the **findings JSON arrives
on STDERR** (stdout is empty), so capture `2>&1` and key the decision off the **exit code**. Each finding
is `{antipattern:<ruleId>, name, description, file, line, snippet}`.

Rule severities read from `docs/concepts/design-contract/detector-rules.json`:
- **BLOCKING (a finding forces BLOCK):** `ai-color-palette`, `border-accent-on-rounded`, `bounce-easing`,
  `bouncy-easing`, `dark-glow`, `default-ease-transition`, `everything-centered`, `flat-type-hierarchy`,
  `geist-imports`, `gradient-text`, `icon-tile-stack`, `inset-highlight-shadow`, `monotonous-spacing`,
  `nested-cards`, `overused-font`, `purple-pink-gradients`, `reflex-fonts`, `side-stripe-borders`,
  `side-tab`, `single-font`, `tailwind-hex-values`, `tailwind-palette-utilities`.
- **ADVISORY (logged, never blocks):** `all-caps-body`, `cramped-padding`, `gray-on-color`,
  `justified-text`, `layout-transition`, `line-length`, `low-contrast`, `pure-black-white`,
  `skipped-heading`, `tight-leading`, `tiny-text`, `utility-sprawl`, `wide-tracking`.

> **Owner-cares-about (per-project severity, override-config-driven).** `reflex-fonts` and `geist-imports`
> are the web analogs of what the owner instructs on repeatedly — the Geist/Inter reflex he calls out by
> name ("no thought in typography, looks like every other SaaS"). Their enforcement severity is **set per
> project, not by a frozen global map**: a project may pin them to BLOCK (owner-instructed) and the lane
> reads that from the project detector config / `BOUND_CONSTRAINTS[].severity`, exactly as the iOS lane
> treats `system-font-reflex`/`ios-default-reflex`. Severity tracks **what the owner cares about**, and a
> live owner instruction can suppress even these via an `OVERRIDE` (§6) for a named scope — owner outranks
> the floor.

---

## 6. How the rules actually bind (floor vs ceiling — honest)

**Precedence (read this first): the owner outranks this hub.** Everything below is a *default for when the
owner has not spoken to the point* — never a ceiling over his live word. The order is fixed: (1) the
owner's explicit, in-context instruction; (2) this standing register (rants / preferences); (3) the
deterministic detector. A rant is *derived from* the owner; it cannot outrank him. When his live
instruction contradicts a standing rant or detector rule (e.g. "this brief is over-restrictive — use the
purple gradient here", or "the Geist face is right for this surface"), that instruction **wins** — bound as
an `OVERRIDE` constraint (`docs/reference/design-lane.md` Step 1) that the validator subtracts before the
verdict and that is **written back** to `{project}/.design-overrides.json` so the suppressed rule stops
firing for that scope on future runs. The override is owner-authored, so it is ratified by construction
(unlike a rant the system distilled and froze without his sign-off). An override honored once but not
written back re-loses on the next task — that recurrence is the precise failure this precedence kills. See
`design-lane.md` §Precedence for the full mechanism.

The hub being present is necessary but not sufficient. Two mechanisms do the binding:

1. **The lane** (`docs/reference/design-lane.md`) — a thin orchestrator binds typed FORBIDDEN/FORWARD
   constraints via a cognition `checkpoint`, spawns a SEPARATE builder, then a SEPARATE fresh-context
   validator that judges against the bound ids + the detector. The model never grades its own output.
2. **Structured selection** — felt-state binds through `/shape` (3-round discovery for new work) and
   three-variants-pick-one (`/live`) for iteration. Inline reasoning narration is NOT the mechanism.

**The honest ceiling (state it, never hide it):**
- **Guaranteed:** rules present (structural); adjudication external (separate validator + detector
  floor); no named slop; no silent no-op.
- **NOT guaranteed:** good taste — irreducibly the validator's judgment + **the user's eye is the
  taste ceiling**. The lane raises the floor and externalizes judgment; it does not manufacture taste.
  The detector/validator are **hard-on-named-slop, advisory-on-taste**. Anyone claiming more is selling
  another constraint-bind (`#POISON_PATH`).

---

## 7. Project context (read before any design work)

Design output is generic without project context. Two per-project files carry it:

| Layer | Where | What |
|---|---|---|
| Strategic | `{project}/.claude/PRODUCT.md` | Register, users, anti-references AS NAMED BRANDS, design principles, accessibility. No colors/fonts/pixels. |
| Visual | `{project}/.claude/DESIGN.md` | Stitch-spec contract: colors (hex sRGB), typography hierarchy, components (8-prop max), Do's-and-Don'ts, Role Taxonomy. |

If `PRODUCT.md` is missing → route to `/impeccable --teach` (writes it). If `DESIGN.md` is missing →
route to `/impeccable --document`. You CANNOT infer strategic context from the codebase; only the
creator provides it. Visual context CAN be partially extracted from code (`--document` scan mode).

---

## 8. Reference index (deeper material — read on demand)

The `impeccable-reference/` files carry the deep, consult-on-demand material:

- `docs/concepts/impeccable-reference/typography.md` — OpenType features, web font loading, scales
- `docs/concepts/impeccable-reference/color-and-contrast.md` — contrast, accessibility, palette construction
- `docs/concepts/impeccable-reference/spatial-design.md` — grids, container queries, optical adjustments
- `docs/concepts/impeccable-reference/motion-design.md` — timing, easing, reduced motion
- `docs/concepts/impeccable-reference/interaction-design.md` — forms, focus, loading
- `docs/concepts/impeccable-reference/responsive-design.md` — mobile-first, fluid, container queries
- `docs/concepts/impeccable-reference/ux-writing.md` — labels, errors, empty states
- `docs/concepts/impeccable-reference/craft.md` — the `--craft` shape→comp→build flow
- `docs/concepts/impeccable-reference/extract.md` — the `--extract` token/component flow
- `docs/concepts/impeccable-reference/extract-rants.md` — the `--extract rants` sweep flow

## The AI slop test

If you showed this interface to someone and said "AI made this," would they believe you immediately?
If yes, that's the problem. A distinctive interface makes someone ask "how was this made?" not "which
AI made this?" The refusals in §3 are the fingerprints of 2024–2025 AI work.
