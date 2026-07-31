# Preference: CSS architecture — centralize design authority, taxonomy-first

## Voice anchor (sourced from the LLM CSS Manifesto)

> The stylesheet becomes the design constitution — it constrains every agent's output to visual coherence without any agent needing to understand the full design system.

(From `docs/concepts/llm-css-manifesto.md`. This is a preference — the positive move — not a refusal. The refusal sibling is `banned/css-architecture.md`.)

## The principle

**Design authority lives in a named role/token vocabulary. Agents COMPOSE from it; they do not invent design decisions inline.**

The real axis is not "semantic class names vs utilities." It is: *is design authority centralized, or scattered?* A centralized layer — `@layer`, semantic role classes, token-mapped classes — is the design constitution. An agent builds a new component by composing existing role classes (`ds-card`, `ds-metric-label`, `ds-stat-row`) without ever deciding what font size a label should be. The decision was made once, in the stylesheet. "Change all metric labels to 14px" becomes one edit, not a codebase-wide grep-and-replace that an agent will get wrong.

This is a directional default, NOT a Tailwind ban. Token-mapped semantic Tailwind satisfies the principle. Raw palette/utility sprawl does not. See `banned/css-architecture.md` for doctrine B in full.

## The role-taxonomy procedure (DO THIS BEFORE WRITING A CLASS)

The model's natural failure mode is mechanical semantic CSS: naming each element (`.blue-box`, `.card-wrapper-2`) instead of designing roles. That is autocompleting with different syntax. Avoid via procedure:

<role_taxonomy_procedure>
**Step 1 — Name the role, not the element.** Before writing a class, ask "what role does this play in the system?" A metric label is a *role*. A blue box is not. Roles are reusable, semantic, and finite; elements are infinite. If the name describes appearance (`.rounded-gray-box`) or position (`.top-left-thing`), it is not a role — go back.

**Step 2 — Bind the role to tokens.** Every role consumes design tokens (color, type, spacing, radius from DESIGN.md), never inline literals. `.ds-metric-label { font: var(--type-label); color: var(--ink-subdued); }`. The role is the boundary between "what it is" (the class) and "what it's made of" (the tokens). If a role needs a value with no token, add the token first.

**Step 3 — Place it in the cascade.** `@layer base` for element defaults, `@layer components` for role classes, `@layer utilities` for the rare one-off. The cascade is the enforcement mechanism: base inherits, context refines, specificity stays intentional. Do not flatten the cascade into per-element utility strings.

**Step 4 — Only then implement.** Write the markup composing named roles. An agent reading the result sees `.ds-metric-label`, not `text-sm font-medium text-gray-700`. The design is a readable artifact a designer could edit without touching components.
</role_taxonomy_procedure>

(This procedure is modeled on the `font_selection_procedure` in `commands/impeccable.md` — name the intent before reaching for the reflex.)

## Greenfield default

Semantic CSS + the cascade + `@layer`, with the role taxonomy designed FIRST — in the project's DESIGN.md **Role Taxonomy** section — before any component is written. The taxonomy is the design constitution; the components compose from it. `/document --seed` prompts the taxonomy design when greenfield; `/document` (scan) extracts the existing role/semantic-class vocabulary.

## Brownfield guidance

Respect the project's detected CSS approach. The lane builders auto-detect (semantic CSS / Tailwind / CSS Modules / styled-components) and follow it — that pluralism is correct and survives. Enforce centralization WITHIN whatever is detected:

- No raw palette utilities (`bg-blue-500` etc. — refused regardless of approach, per `banned/colors.md`).
- Repeated utility clusters → extract to a named role class (`@apply` into a component, a CSS Module class, a styled-component, or a semantic class).
- Token-mapped only — utilities and classes bind to design tokens, not inline literals.
- Taxonomy-first applies even mid-stream: when adding a role, name it and bind it before implementing.

Do not migrate a Tailwind project to semantic CSS as a side effect. Centralize within Tailwind (theme tokens + `@apply` components + role classes) instead.

## How the spine uses this

This is a **preference** — the positive move catalog entry. Different shape from `banned/css-architecture.md` (the refusal).

1. **Greenfield:** design the role taxonomy in DESIGN.md first (`/document --seed`), then build composing from it.
2. **Brownfield:** detect the CSS approach, enforce centralization within it, extract repeated clusters to named roles.
3. **Always:** tokens are the boundary; the cascade/role layer is the constitution; taxonomy precedes implementation.

## Seam discipline

The principle lives here and in the spine. The enforcement mechanics live in the detector (`utility-sprawl`, advisory) and the lane builders/standards-enforcers. `/impeccable` points here for depth — it does not become a CSS-architecture linter.

## Cross-reference

- **Refusal sibling:** `banned/css-architecture.md` (utility sprawl / scattered authority; doctrine B in full).
- **Palette sibling:** `banned/colors.md` (raw Tailwind palette utilities, P0).
- **Per-project home:** DESIGN.md **Role Taxonomy** section (`design-template.md`), populated by `/document`.
- **Source:** `docs/concepts/llm-css-manifesto.md`.
