# Rant: Colors — the Tailwind palette as the enemy

## Verbatim

> Hard for me to say [about specific enemy hues] with the colorblindness; the general orientation is to avoid any of those clinical colors; brass/gold instead of orange for buttons, a deep cobalt or obsidian blue instead of tech blue; sand, eggshell are good neutrals; what I don't want are tailwind colors.

## What the rant is actually about

The Tailwind default palette IS the SaaS monoculture palette. `bg-blue-500`, `bg-green-500`, `bg-orange-500` are the exact same colors every AI product, every Vercel-adjacent SaaS, every shadcn-template is using. When a UI ships with the Tailwind default palette, it ships "I reached for whatever was closest to hand." The refusal is of the palette-as-shortcut, not of any specific hue.

The principle: **colors should come from materials, not from a utility palette**. Brass is a material. Cobalt is a material (the ore, the pigment). Sand is a material. Tailwind blue-500 is a hex value that a designer picked for Adobe's convenience. Material-derived colors carry weight because they reference something real in the world. Palette-derived colors carry nothing.

## Regex-detectable signals — Tailwind palette refusal

| Pattern | Detection | Severity |
|---|---|---|
| Tailwind utility classes with default colors | `\bbg-(red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\|slate\|gray\|zinc\|neutral\|stone)-\d+` | P0 |
| Same for text, border, ring, shadow color utilities | `\b(text\|border\|ring\|divide\|outline\|fill\|stroke)-(\|red\|...)-\d+` | P0 |
| Direct hex matches on Tailwind 500-shade values | `#ef4444`, `#f97316`, `#eab308`, `#22c55e`, `#3b82f6`, `#a855f7`, `#ec4899`, `#6b7280` (and neighbors 400/600) | P0 |
| CSS custom properties named from Tailwind palette | `--color-(red\|blue\|green\|...)-\d+` as direct property name | P0 |
| `@apply` with color utilities | `@apply\s+.*(bg\|text\|border)-\w+-\d+` | P0 |

## Heuristic signal — "clinical" color feel

The rant names "clinical" as the enemy word. Clinical = sterile, flat, information-palette, Bootstrap-era, "this is a bug-tracker" feel. Detection is heuristic (no pure regex) but these are the tells:

- Flat saturated primaries adjacent to each other (red + green + yellow = status-indicator vibe)
- Full-saturation accents on neutral white backgrounds
- Palette with no temperature coordination (hues pulled from different emotional registers)
- No off-whites or tinted neutrals — everything is pure `#ffffff` / `#000000` / `#6b7280`-gray

## Named substitutes (voice-anchored: these came directly from the rant)

| Instead of | Reach for | Why |
|---|---|---|
| Tailwind `orange-500` / tech-orange | Brass / gold — warm desaturated yellow-orange (e.g., OKLCH L 0.75 C 0.12 H 80) | Material-derived. Brass is a metal; orange-500 is a utility class. |
| Tailwind `gray-*` / pure white | Sand, eggshell — warm off-whites (e.g., OKLCH L 0.92 C 0.02 H 70 / L 0.95 C 0.02 H 80) | Warmth without saturation. Tinted neutrals that don't read as sterile. |

These are **starting points**, not prescriptions. The spine skill points at them as examples of the *kind of move*; projects earn their specific palette from their own context.

## Blue — direction only, not prescription

The enemy is named: **Tailwind's tech-blue** (`#3b82f6` and its neighbors, `blue-400` through `blue-600`). That refusal holds. The SaaS blue, the Vercel blue, the Linear blue, the "trust blue" that every fintech reaches for.

But the spine deliberately does NOT prescribe a substitute palette for blue. Reason: Adil is protan + deutran colorblind, and **blue is the one hue channel he can judge reliably**. Red/green distinctions compress for him; blue does not. That means blue is the color where his per-project judgment is most trustworthy and most earned. The spine should flag tech-blue as refused and then get out of the way — let project context choose the specific blue.

Direction for the LLM when a blue is needed and the project doesn't specify: propose 2-3 candidates and ask. Never auto-pick.

Voice anchor (spoken by Adil): *"I don't want to be too prescriptive about the one color I can actually see."*

## The colorblind-specific note

Adil is protan + deutran colorblind (strong). This means:
1. Discussions of subtle hue differences are hard for him to engage with directly
2. Certain hue ranges (particularly reds/greens and the AI-purple band) compress perceptually
3. The refusal tends to come from "this hurts to look at" rather than "this hue is wrong"
4. The fence should account for this: flagging color choices that fail for colorblind users is not just politeness, it's core to the spine's accessibility posture

Cross-reference: `gradients.md` already catches the magenta/purple/pink gradient family with the colorblindness argument.

## When the refusal is overridden

If the project's `aesthetic.md` specifies a brand palette, it wins. If the project is explicitly Tailwind-native and the palette is an intentional choice (rare for this user's projects), the refusal softens to a warning. Default behavior: hard flag on Tailwind palette use.
