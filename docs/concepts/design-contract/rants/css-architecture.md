# Rant: CSS architecture — utility sprawl is autocompleting, not designing

## Verbatim (sourced from the LLM CSS Manifesto)

> With Tailwind, every agent is an unsupervised designer.

> I'm not designing — I'm autocompleting.

(These are from `docs/concepts/llm-css-manifesto.md`, not Adil's spoken rant catalog. They are the load-bearing framing for this pattern-family. The manifesto is the causal model; this rant file is the catalog entry.)

## What the rant is actually about

The failure is **design authority scattered as ad-hoc inline decisions** instead of centralized in a named role/token vocabulary. When design lives in utility strings strewn across 200 components, every agent touching any component is making design decisions — mostly by copying patterns from adjacent code or from training data. There is no guardrail. The design drifts with every PR.

This is worse for LLM-authored code specifically. When a model generates `flex items-center justify-between gap-4 text-sm font-medium`, it is pattern-matching against training data — reproducing the utility cluster it has seen millions of times. That is **autocompleting, not designing**. The utility-class paradigm actively amplifies the LLM's worst failure mode: mechanical reproduction of common patterns without design intent. Every component generated this way looks like every other component generated this way, drawn from the same pool of utility combinations every tutorial used.

The cascade is the counter-mechanism. Base styles inherit, context refines, specificity creates intentional layers. **The cascade is the design-system enforcement mechanism** — it forces two developers (or two agents) who both need a small label through the same class, so the design system says "this is what a label is" rather than letting each independently pick from the utility palette. A centralized stylesheet becomes the design constitution: it constrains every agent's output to visual coherence without any agent needing to understand the full system.

## Doctrine B — NOT a blanket Tailwind ban (read this before flagging)

The refusal is of **scattered design authority**, not of Tailwind as a tool. The real axis is:

> Is design authority centralized in a named role/token vocabulary, or scattered as ad-hoc decisions?

- **Refused (P0, already caught by `rants/colors.md`):** raw Tailwind *palette* utilities — `bg-blue-500`, `text-gray-700`, etc. These are design decisions invented inline.
- **Advisory (this rant):** large/repeated *utility clusters* — a `className` with 6+ layout/spacing/type tokens repeated across components. The signal that design authority has scattered.
- **Fine:** token-mapped semantic classes (`@layer`, role classes like `.ds-metric-label`, Tailwind `@apply` into a named component, or utilities bound to design tokens via theme config). Tailwind that COMPOSES from a centralized vocabulary satisfies the doctrine.

There is **no absolute Tailwind ban**. Token-mapped semantic Tailwind CAN satisfy centralization; raw palette/utility sprawl cannot. Brownfield projects keep their detected CSS approach — enforcement is *centralization within that approach*, not migration.

## The caveat the manifesto insists on (do not lose this)

Mechanical semantic CSS is ALSO a failure. An LLM asked to "write semantic CSS" can do it mechanically — **naming each element instead of designing roles** (`.div-1`, `.blue-box`, `.the-card-wrapper-thing`). The tool enables quality; it does not guarantee it. So the move is **taxonomy-first**, never "prefer semantic class names":

> Design the role taxonomy first, then let the agents implement within those constraints.

Before writing a class, name the *role* it plays in the system, bind it to tokens, and only then implement. See `preferences/css-architecture.md` for the positive procedure.

## Regex-detectable signals — utility sprawl (ADVISORY)

| Pattern | Detection | Severity |
|---|---|---|
| `className`/`class` string with many space-separated utility-like tokens (6+ from flex/grid/gap-/p-/m-/text-size/font-weight/rounded/shadow/border/items-/justify-/w-/h-) | detector rule `utility-sprawl`, `target: source` | P1 (advisory — logs only, never blocks) |
| Same utility cluster repeated verbatim across ≥3 components (would be extracted to a named role) | heuristic; precise count-based JSX handler is a future refinement, not built | P1 (advisory) |

False positives are acceptable here because the rule only logs. It is a *smell* detector for scattered authority, not a blocking gate. Raw palette utilities are the blocking concern and are owned by `rants/colors.md` / `tailwind-palette-utilities` (P0).

## Named substitute

| Instead of | Reach for | Why |
|---|---|---|
| Utility cluster repeated inline across components | A centralized role/token layer — `@layer base/components/utilities`, semantic role classes, or token-mapped classes (`@apply` into a named component, theme-bound utilities) | The stylesheet becomes the design constitution. Agents compose from named roles instead of inventing decisions. One edit changes the whole site; grep-and-replace across 200 components does not. |

## Cross-reference

- **Sibling rant:** `rants/colors.md` — the palette-only stance (raw Tailwind palette utilities refused at P0). Colors is the *palette* axis; this file is the *architecture* axis. Together they cover "where does design authority live."
- **Positive move:** `preferences/css-architecture.md` — centralize authority, taxonomy-first procedure, `@layer`, tokens as the boundary.
- **Source:** `docs/concepts/llm-css-manifesto.md`.

## Seam discipline (load-bearing)

This rant states the PRINCIPLE. It does NOT turn `/impeccable` into an opinionated CSS-architecture linter. Enforcement MECHANICS live in the detector floor (`utility-sprawl`, advisory) and the lane builders (enforce centralization within the detected CSS approach). The spine points here for depth; it does not inline the linter.
