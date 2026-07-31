---
name: impeccable-hub
description: The single home for durable design knowledge. Load this when doing ANY front-end / visual / interface / motion work — crafting a feature, refining an interface, hardening a form, setting type, choosing color, building layout, designing motion. It is the felt-state baseline (interfaces-that-feel) PLUS the user's register (voice anchors, refusals, positive moves) and a self-check rule list. Every other design skill in this pack should read this one first.
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# Impeccable — the design hub

This is the ONE home for durable design knowledge in this skill pack. Every design skill (`layout`,
`typeset`, `colorize`, `bolder`, `harden`, `polish`, …) should read this hub first, so the register is
present *structurally* — it doesn't need to be re-stated per task.

**This hub POINTS to bundled files; it does not inline everything.** The rants, voice anchors,
preferences, and detector rules each live as a real file under `resources/` in this skill's folder.
Read the source file when you reach for the corresponding move — it carries the full voice, and (for
the detector rules) the exact rule ids and severities.

---

## 1. The felt-state baseline (the spine)

Start every interface from the **felt state of the person**, not the task. This is the
`interfaces-that-feel` skill's practice — load it alongside this hub for any user-facing work.

Technical correctness is the floor. The ceiling is: does this product know the user is a person?

---

## 2. The register — voice anchors (the user's own words)

`resources/voice-anchors.md` — 17 direct-quote anchors that are the *why* behind every refusal and move
below. Do not paraphrase or dilute them.

`resources/persona.md` — the POSITIVE register (taste, references, gravity). The anchors and rants say
what is refused; the persona says what is aimed at — flatness as a mission, context over reflex, named
references, composition discipline (entry point / pace / density-per-moment). Read it before composing
any new surface. Judgment + gravity, never a house style; anti-convergence outranks it.

`resources/vocabulary.md` — the shared design vocabulary this register uses.

A few anchors that orient the whole system (read `voice-anchors.md` for all of them):
- "The use of Geist = vercel → no thought in typography. Boring, plain, looks like every other SaaS."
- "Whatever color that background is hurts my eyes; the gradients only make it worse." (AI-purple)
- "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but notice."
- "A great one carries what the product is in a way that's immersive, without announcing. There is
  nothing uglier than annotated art."
- "Smooth, elegant motion — not perspective, just directional."

### Core principles

- **Composure** — self-possession + carrying-without-announcing
- **Exact structure, honest surface** — pixel-precise geometry with real texture
- **Balance as organizing principle** — negative/positive space discipline; the entry point carries the
  viewer to the destination without announcing
- **Shown, not announced** — annotated art is ugly
- **Scale as registration** — don't miniaturize what matters; don't inflate what doesn't
- **Life beside weight** — multiple registers cohabit the same frame
- **Dignity preservation** — subjects respected, not displayed

Commit to a BOLD aesthetic direction. Bold maximalism and refined minimalism both work — the key is
intentionality, not intensity. Make unexpected choices true to the context. No design should be the
same across projects — never converge on common choices across generations.

---

## 3. The refusals (rants) — what is NEVER acceptable

Each file in `resources/rants/` is a named refusal with full voice + substitutes. Consult the matching
file when you reach for the move it forbids:

| Refusal | File |
|---|---|
| Tailwind palette (utility classes + hex values) | `rants/colors.md` |
| Geist + extended reflex font list | `rants/fonts.md` |
| AI-purple/magenta/pink gradients | `rants/gradients.md` |
| iOS-as-default / pretend-variation | `rants/generic-ui-defaults.md` |
| Motion suddenness / default ease | `rants/motion-suddenness.md` |
| Chamfer stack (inset highlight + shadow + gradient) | `rants/chamfered-buttons.md` |
| Alignment violations / floating elements | `rants/alignment-spacing.md` |
| AI-signature rounded corners | `rants/rounded-corners.md` |
| Photorealistic skeuomorphism as default | `rants/skeuomorphism.md` |
| Side-stripe borders on cards/callouts | `rants/alignment-spacing.md` |
| Monospace-as-"technical" shorthand | `rants/typography-mono.md` |
| Uniform tile / same-card-grid layout | `rants/uniform-tile-layout.md` |
| Utility sprawl / scattered design authority | `rants/css-architecture.md` |

**Absolute bans (rewrite the element entirely if you catch yourself reaching for these):**
- **Side-stripe borders** (`border-left/right` > 1px) on cards/list-items/callouts/alerts — the most
  overused dashboard "touch." Reach for full borders, background tints, leading numbers/icons, or nothing.
- **Gradient text** (`background-clip: text` + any gradient) — top-three AI tell. Use solid color; for
  emphasis use weight or size.

---

## 4. The positive moves (preferences) — what to reach for instead

Each file in `resources/preferences/` is a positive catalog/procedure:

| Move | File |
|---|---|
| Typography fonts (22 fonts, 4 categories) | `preferences/typography-fonts.md` |
| Type scale & hierarchy (non-uniform) | `preferences/typography-scale.md` |
| Typography spacing (junction discipline) | `preferences/typography-spacing.md` |
| Alignment precision (7 optical rules) | `preferences/alignment-precision.md` |
| Motion references (directional, not perspective) | `preferences/motion-references.md` |
| Monospace, used well | `preferences/typography-mono.md` |
| CSS architecture (centralized role taxonomy) | `preferences/css-architecture.md` |

### Always-on craft (apply without consulting a reference)

- **Type:** modular scale, fluid `clamp()` on marketing/content headings, fixed `rem` for app/dashboard
  UI. Fewer sizes, more contrast (≥1.25 ratio). Cap body at ~65–75ch. Line-height scales inversely with
  line length; add 0.05–0.1 for light-on-dark.
- **Color:** OKLCH, not HSL. Reduce chroma toward white/black. Tint neutrals toward the brand hue
  (chroma 0.005–0.01). 60-30-10 by visual *weight*. No pure `#000`/`#fff`. Theme (light/dark) is
  DERIVED from audience + viewing context, never a safe default.
- **Space:** 4pt scale with semantic token names. `gap` over margins. Vary spacing for hierarchy; break
  the grid intentionally. `repeat(auto-fit, minmax(280px, 1fr))` is the breakpoint-free card grid.
- **Motion:** high-impact moments over scattered micro-interactions. Exponential easing
  (ease-out-quart/quint/expo). Transform + opacity only — never animate layout. No bounce/elastic.

### Font selection procedure (do this BEFORE typing any font name)

The failure mode is: "told not to use Inter, so I reach for my next favorite → new monoculture."
1. Write 3 concrete brand-voice words (NOT "modern"/"elegant" — dead categories).
2. List the 3 fonts you'd reflexively reach for. If any are in the reflex list
   (`rants/fonts.md` — Fraunces, Newsreader, Playfair, IBM Plex, Space Grotesk, Inter, DM Sans, Outfit,
   Plus Jakarta, Instrument, et al), **reject them.**
3. Find a font that fits the brand as a *physical object*. Reject the first "designy" pick.
4. Cross-check: "elegant" is not necessarily a serif; "technical" not necessarily a sans; "warm" not
   Fraunces. If the pick lines up with reflex, go back to step 3.

---

## 5. The self-check — the named-slop floor (manual, not mechanical here)

In the original design-fork environment this register comes from, a deterministic CLI (`design-detector`)
runs against real project files and blocks builds on named slop. **That mechanical detector does not run
in this app** — there's no local project filesystem to lint. `resources/detector-rules.json` is bundled
here as the same rule corpus so you can self-check output against it manually: read it, and before calling
work done, walk your own output against the rule list and name any pattern you're using from the BLOCKING
list.

Rule severities (from `resources/detector-rules.json`):
- **Named slop (avoid outright):** AI-typical purple/pink gradient palettes, gradient text, dark glow
  effects, default/bounce/elastic transitions, everything centered, flat type hierarchy, Geist-by-default,
  icon-tile-stack repetition, inset-highlight-shadow chamfers, monotonous spacing, nested cards, overused
  reflex fonts, side-stripe borders/side-tabs, single-font monoculture, raw Tailwind hex/utility palette
  values, AI-signature rounded corners with accent borders.
- **Worth noting but not disqualifying:** all-caps body text, cramped padding, gray-on-color text,
  justified text, layout-shifting transitions, long line length, low contrast, pure black/white, skipped
  heading levels, tight leading, tiny text, utility sprawl, wide tracking.

---

## 6. How the rules actually bind (floor vs ceiling — honest)

**Precedence: the person you're talking to outranks this hub.** Everything above is a *default for when
they haven't spoken to the point* — never a ceiling over their live instruction. The order is: (1) their
explicit, in-context instruction; (2) this standing register (rants/preferences); (3) the self-check rule
list. A rant is *derived from* a designer's taste; it cannot outrank a live, specific instruction from the
person you're actually building for right now (e.g. "this brief is over-restrictive — use the purple
gradient here" wins for that scope).

**The honest ceiling (state it, never hide it):** this hub raises the floor (no named slop, rules present
by construction) and gives you a self-check list — it does NOT manufacture taste. Good taste is
irreducibly your judgment plus the user's eye. Anyone claiming a rule file alone produces good design is
overselling it.

---

## 7. Project context (ask for it before any design work)

Design output is generic without context. Before doing real design work, ask the user (don't infer):
- **Strategic register**: who this is for, what it should NOT feel like (named anti-references), any
  non-negotiable design principles or accessibility requirements.
- **Visual contract**: existing colors/fonts/component conventions if there's an existing codebase or
  brand to match — ask them to paste tokens/CSS/a screenshot rather than guessing.

If they have none of this yet, run the `shape` skill's discovery interview first.

## The AI slop test

If you showed this interface to someone and said "AI made this," would they believe you immediately?
If yes, that's the problem. A distinctive interface makes someone ask "how was this made?" not "which
AI made this?" Section 3 above catalogs the fingerprints of 2024–2026 AI-generated work.
