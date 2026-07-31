# Banned: Gradients (the purple/pink/magenta family especially)

## Verbatim

> The colors — I am colorblind, with strong protan and deutran to boot — but whatever color that background is hurts my eyes; the gradients only make it worse.

## What this ban is actually about

Two separate refusals bundled into one:

1. **The specific hue family**: magenta-to-purple-to-pink-to-violet gradients. The "AI purple" that became the default during the 2024-2026 AI product wave. When someone defaults to this gradient, they are announcing "I'm an AI product" through the most tired visual cliché of the era.

2. **Colorblindness as accessibility argument, not just taste**: for protan and deutran colorblind users (a significant population), this hue band compresses. The gradient stops that look distinct to a non-colorblind viewer look like undifferentiated smear. The gradient that is "subtle" to one viewer is "hurts my eyes" to another. Using this range as decoration is an accessibility failure, not just a taste call.

The two together: the aesthetically tired AND physiologically painful. Double reason to refuse.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| Any gradient with stops in magenta/purple/pink hue range | `(linear|radial|conic)-gradient.*` + hue extraction → OKLCH hue 280–340 or HSL hue 270–330 | P0 |
| The classic "purple-to-pink" | gradient with two stops where both stops fall in OKLCH hue 300–340 | P0 |
| Very high chroma in that band | OKLCH chroma > 0.15 in hue 280–340 | P0 (garish) |
| Named enemy hex values | Direct match on `#a855f7` (violet-500), `#d946ef` (fuchsia-500), `#ec4899` (pink-500), `#8b5cf6` (violet-600), `#c084fc`, `#e879f9` — these are Tailwind's purples/pinks/fuchsias | P0 |
| The "cyan-on-dark" partner-pattern | `#06b6d4`, `#22d3ee`, `#67e8f9` (cyan/sky) adjacent to dark navy backgrounds | P0 |

## Adjacent patterns (heuristic, not pure regex)

- Gradient backgrounds on full-viewport surfaces (`body`, `html`, `.hero`) — the gradient as "the background" rather than as "a specific element's treatment"
- Gradient text (`background-clip: text` + any gradient) — this is already in Impeccable's absolute_bans
- Multiple gradient layers stacked on the same surface (the "glassmorphism over purple gradient" combo)

## What to reach for instead

Named substitutes: warm desaturated neutrals tinted toward a specific brand hue (from `frontend-aesthetics` skill). Temperature without saturation. Single accent color used sparingly, earned from the actual subject matter (the yellow of a Ukrainian flag, the brass of a real instrument), not picked from a "tech palette."
