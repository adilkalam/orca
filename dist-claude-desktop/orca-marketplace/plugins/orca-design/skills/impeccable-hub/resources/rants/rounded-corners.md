# Rant: "Obviously AI-generated rounded corners"

## Verbatim

> The ugly purple box, which has these obviously AI generated rounded corners.

## What the rant is actually about

A rounded corner can be "obviously AI-generated" in specific ways:

1. **Uniform radius everywhere**: hero, button, card, image, modal, input, nav — all with the same border-radius value. No hierarchy. Every element gets `rounded-lg` because the LLM doesn't know which elements deserve which radius.

2. **shadcn default radius as the only radius**: `--radius: 0.5rem` (or the `rounded-md` / `rounded-lg` pair) applied without modification. The literal shadcn template default, untouched.

3. **Over-rounding**: large radius values on elements where a small radius or sharp corner would be correct. `rounded-2xl` / `rounded-3xl` / `rounded-full` on a container that doesn't need that register.

4. **Rounded corners on things that shouldn't have them**: full-bleed hero images, photo thumbnails at large radius (`rounded-xl` on a photograph is almost always wrong — it's decorative rounding that cuts into the composition), document-style content cards.

5. **The "soft-UI" radius register**: every corner slightly rounded, suggesting the entire interface is made of rubber. The aesthetic signature of Apple-adjacent 2023-2025 design tooling applied without the rest of Apple's considered system.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| shadcn default `--radius: 0.5rem` untouched | `--radius:\s*0\.5rem` in globals.css or theme file | P1 (check for overrides) |
| Tailwind rounded utilities as dominant pattern | `rounded-(sm\|md\|lg\|xl\|2xl\|3xl\|full)` applied to > 70% of interactive/surface elements | P1 (heuristic threshold) |
| Same radius value everywhere | Count distinct `border-radius` values across CSS — if 1-2 unique values for 10+ element types, flag (no radius hierarchy) | P0 |
| Large radius on images | `<img>` or `background-image` element with `border-radius` > 8px or `rounded-lg`+ | P0 |
| `border-radius` on hero sections | Full-bleed / high-prominence sections with rounded corners — usually wrong | P1 |
| `rounded-full` on things that aren't genuinely circular | Non-icon, non-avatar elements with full rounding | P1 |

## Heuristic: the "radius hierarchy" audit

A considered design has radius hierarchy — different element types have different radii, and the hierarchy is intentional. The signal of thoughtful rounding:

- Hero / section containers: small radius (4-8px) or sharp
- Cards: medium radius (8-12px)
- Buttons: medium radius (6-10px) OR pill shape IF the button's role deserves it
- Inputs: matched to buttons
- Icons / avatars: circular where the content is genuinely round
- Images / photos: usually SHARP (0px) unless the photo's crop benefits from rounding
- Badges / tags: small radius OR full pill

Detection: enumerate distinct radius values in the project. If fewer than 3 distinct values serve 10+ element types, the hierarchy is absent. Flag as "no radius thought."

## What to reach for instead

- **Sharp corners** are a move, not an oversight. Editorial design, brutalist design, architectural design all use sharp corners intentionally. Reaching for a tiny radius as default is not neutral — it's a choice toward softness.
- **Radius tied to element size**: small elements want small radii; large elements want either small radii (relative) or deliberate large radii. A 2xl radius on a 40px button is different from the same radius on a 400px card.
- **Radius hierarchy as part of design-dna**: the spine should encourage projects to declare 3-4 radius tokens (sharp, subtle, medium, pill) and use them purposefully, not reach for `rounded-lg` on every surface.
