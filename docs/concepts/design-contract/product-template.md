# Product — Project Strategic Context

**This file is the per-project strategic contract.** It captures register, users, anti-references AS NAMED BRANDS/PRODUCTS, design principles, and accessibility intent. **No colors, no fonts, no pixel values** — those live in DESIGN.md and are populated separately via `/impeccable --document`.

Populated by `/impeccable --teach` on first entry into a project. Lives at `{project_root}/.claude/PRODUCT.md`.

The template follows the Impeccable PRODUCT.md spec. Reference: https://impeccable.style/docs/teach

The two-file split (PRODUCT.md strategic + DESIGN.md visual) is load-bearing:
- **PRODUCT.md** changes when register or audience changes (rare).
- **DESIGN.md** changes when visual tokens change (more often).
- Refining commands read both; strategic-only commands (`/shape`) read PRODUCT.md only; visual-only checks (Stitch parsers, hygiene scripts) read DESIGN.md only.

If work fails the eye or the user critiques it, the redo path is `/recraft "<critique>"` — a thin coordinator that classifies scope and routes to the appropriate flow. PRODUCT.md may need re-entry via `/impeccable --teach` if the contract itself is the failure.

---

# Product

## Register

[bare value: `brand` or `product`]

Stitch-spec convention. "brand" = marketing/editorial surface (landing pages, marketing sites, brand campaigns). "product" = app UI / functional surface (dashboards, tools, workflows). The register conditions which global banned rules apply universally vs. register-conditionally.

## Users

[Who uses this, in what context, with what job-to-be-done. One paragraph, concrete.]

Examples:

> Practitioners (researchers, biohackers, practicing physicians outside conventional channels) reading peptide dosing protocols on desktop or tablet during clinical reasoning. Job-to-be-done: understand the mechanism enough to deviate from a published protocol with intent.

> Frontend engineers shipping motion to production at startups. Reading the documentation while integrating, on desktop, with the editor open in another window. Job-to-be-done: copy the right pattern into their codebase, fast.

NOT abstract personas like "professionals" or "everyone".

## Product Purpose

[What the product does, in one sentence.]

NOT a paragraph. NOT a value proposition. The simple "what it is" statement.

## Brand Personality

- **Voice & tone:** [How does the product talk? terse / generous / formal / casual / precise / playful. One paragraph.]
- **Three-word personality:** [e.g., "warm, mechanical, opinionated"]
- **Emotional goals:** [How should the user feel using this? One sentence. e.g., "respected as a practitioner, not patronized as a patient"]

## Anti-references

**SPECIFIC NAMED BRANDS/PRODUCTS/OBJECTS.** Three to five entries. Each cited by name, not by adjective.

Examples that count:
- "Linear's task UI density."
- "Klim Type Foundry's specimen pages — they're beautiful but read as foundry-marketing, which this product is not."
- "Notion's knowledge-base feel."
- "Figma's marketing site (the post-2023 iteration with the gradient-on-everything moment)."
- "The 2012 developer-portfolio gradient pattern (blue-to-purple-to-pink, hero callout)."

Examples that DO NOT count:
- "Boring." (unbound)
- "Generic." (unbound)
- "AI slop." (global banned rule — lives in `banned/`, not PRODUCT.md)
- "Tailwind defaults." (global banned rule — lives in `banned/colors.md`)

The anti-references in PRODUCT.md are **project-specific**. Global banned rules live in the global catalog. Cite by **name** — that's what makes Do's-and-Don'ts in DESIGN.md actionable ("Forbidden: Linear-style task UI density. The product is editorial, not engineering tooling.").

## Design Principles

[3-5 strategic principles. NOT visual rules.]

Examples that count:
- "Clarity is credibility — depth of understanding expressed as clear language."
- "The bridge is the product — explain the connection between specialist pharmacology and consumer explainers."
- "Show, don't announce — annotated art is ugly."

Examples that DO NOT count:
- "Use OKLCH for color." (visual — belongs in DESIGN.md)
- "Use Fraunces for headings." (visual — belongs in DESIGN.md)
- "Pixel-precise alignment." (this is a global preference, not a project principle)

Strategic principles answer "why does this product exist and what does it stand for?" Visual rules answer "how do specific elements look?" The split is load-bearing.

## Accessibility & Inclusion

[Statement of intent. One paragraph.]

NOT implementation rules — those are codebase concerns (semantic HTML, ARIA, keyboard navigation, color contrast). The intent: who is this designed to be usable by, in what contexts, with what assumptions about hardware, network, attention, prior knowledge.

Example:

> Readable on desktop and tablet (mobile is a degraded path; the product is not designed for phone-first reading). Assumes the user can read at adult fluency in English. Assumes prior pharmacology knowledge is welcomed but NOT required — the product teaches the bridge concepts. Color is not the only signal for status (functional roles use both color AND iconography). Motion respects `prefers-reduced-motion`. WCAG AA contrast minimum.

---

## Discovery Interview Structure (for /impeccable --teach)

The /teach flow runs a **3-round structured discovery interview** to populate PRODUCT.md. 2-3 questions per round. Reference: https://impeccable.style/docs/teach

**Round 1 — Identity & users**
- Project identity (one sentence).
- Register (bare value: `brand` or `product`).
- Sub-register descriptor (editorial / technical-research / clinical-commerce / brutalist / luxury-refined / playful-toy / industrial-utilitarian / other).

**Round 2 — Brand personality & principles**
- Brand personality (3 adjectives + emotional goals).
- Design principles (3-5 strategic, NOT visual).
- Voice & tone (one paragraph).

**Round 3 — Anti-references & accessibility**
- Anti-references AS NAMED BRANDS/PRODUCTS (3-5 specific entries).
- Project-scoped refusals AND reversals (beyond the global banned rules).
- Accessibility & inclusion stance (statement of intent).

The interview does NOT ask about colors, fonts, spacing, components, or visual tokens. Those belong to DESIGN.md and are populated by `/impeccable --document` separately (scan mode extracts from code; --seed mode runs a 5-question visual interview).

## Cross-references

- Global catalog: `~/.claude/docs/concepts/design-contract/`
  - `banned/` — the anti-pattern files (universal refusals)
  - `preferences/` — 6 positive-move files (font catalog, spacing, alignment, motion)
  - `voice-anchors.md` — 17 verbatim quotes
- Visual contract: `{project}/.claude/DESIGN.md` (Stitch-spec — generated by `/impeccable --document`)
- Reference: https://impeccable.style/docs/teach
