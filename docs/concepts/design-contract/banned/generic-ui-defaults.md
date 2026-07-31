# Banned: Generic UI defaults (reaching for the archetype)

## Verbatim

> The best looking thing there is the apple default UI. None of these examples have any design inspiration going into them.

And the related observation:

> They [Superdesign] promised three different calculator variations. They produced the same calculator with different accent colors. The LLM reached for the iOS calculator as the default calculator, and then "varied" only the paint.

## What this ban is actually about

When an LLM is asked for a specific app category, its reflex is to reach for the most iconic/visible product in that category and produce a near-copy, then vary surface details (color, font, corner radius) as if that constituted "variation." This is the deepest form of lazy — it doesn't even require a bad aesthetic; it just requires copying the obvious one.

Category → reflex-default mapping (the specific enemies):

| Category | The LLM's reflex | Why it's bad |
|---|---|---|
| Calculator | iOS calculator (black bg, rounded buttons, orange equals) | Not original; not thought-through; not even the best calculator design |
| Todo / task list | Apple Reminders (cream bg, blue circles) or Todoist (red accent, nested lists) | Same as above |
| Music player | Spotify (black bg, green accent, album art blur) | Generic to the point of invisibility |
| Dashboard | Notion-adjacent (sidebar nav, cards in columns, subtle gradients) | Shipping Notion's aesthetic means shipping Notion's taste, not yours |
| Settings | iOS Settings (grouped lists on gray bg) | Reflexive, unconsidered |
| Marketing landing | Linear/Vercel-style (dark bg, huge type, subtle motion, "Built by engineers" tagline) | Every AI-adjacent SaaS looks the same now |
| Email client | Superhuman (clean, keyboard-driven, mono accents) | Template |
| Chat UI | ChatGPT (messages alternating, send button bottom-right, model selector top) | The shape has calcified into one shape |

## Companion refusal: "Variation" that is actually monoculture-with-paint

When Superdesign says "I'll create 3 different variations, each with a distinct design approach" and then delivers three calculators that share 95% of their structure and differ only in accent color and font — that's not variation. That's one design with three paint jobs. The LLM calling that variation is either lying or cannot tell the difference; both are disqualifying.

## Detection (heuristic, NOT regex — this is AST/shape-level)

| Signal | Detection approach |
|---|---|
| Layout fingerprint matching iOS calculator default | AST: 4-row × 3-4 column grid of circular/rounded buttons, dark near-black bg, single accented button (equals), digit-readout above grid |
| Layout fingerprint matching Notion dashboard default | AST: left sidebar + top header + central card grid of 2-3 columns |
| Layout fingerprint matching ChatGPT chat UI | AST: alternating message bubbles, bottom-fixed input row with send + model selector |
| "Pretend variation" in multi-output generation | When multiple candidates are generated, compute structural similarity (DOM tree diff, CSS token overlap). If > 80% similar across candidates, flag as monoculture-with-paint |
| Spotify-reflex on any music-adjacent page | Black/near-black bg + green accent (`#1db954` or similar) + large blurred album-art hero |

## The principle underneath

**If the LLM's answer to "build X" looks like the most famous X, the LLM didn't design — it recognized.** The fence should catch recognition-as-design and force a reframe. When the reflex starts firing, the spine skill should interrupt: "You're reaching for the iOS calculator. Propose three directions that are NOT the iOS calculator before building."

This intersects with `/overdrive`'s propose-before-build discipline but applies more broadly — any category where a reflex-default exists gets the forced-reframe before generation.
