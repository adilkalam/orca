# Voice Anchors

Direct rant quotes from Adil. These are load-bearing for the spine SKILL.md. Edits that would dilute them must be refused.

---

## Rant Session 1 — 2026-04-22

On Geist / SaaS typography monoculture:
> "The use of Geist = vercel → no thought in typography. Boring, plain, looks like every other SaaS."

On AI-purple gradients and colorblindness:
> "Whatever color that background is hurts my eyes; the gradients only make it worse."

On generic UI defaults as not-design:
> "The best looking thing there is the apple default UI. None of these examples have any design inspiration going into them."

On sudden motion:
> "When they use motion/animation, its sudden, no elegance, no transition."

On bad chamfering and shadow execution:
> "They use shadows and chamfering and other effects with incredibly poor execution, when they try too hard on a template, it looks like pre-squarespace Microsoft product generated web."

## From earlier in the foundational exercise

On the broader state of AI design tooling:
> "Athleisure software: tools for people who want to look like they're doing the work without actually doing the work. Tools don't transfer taste. They don't encode judgment. They don't whisper why something works."

On the fundamental discipline:
> "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but notice."

On what good design is:
> "A great one carries what the product is in a way that's immersive, without announcing. There is nothing uglier than annotated art."

On how to judge:
> "I know shit design when I see it. I know beautiful design, even if it's not my taste, when I see it too."

On AI design tools specifically:
> "[Superdesign] wrote about brutalism while shipping a 2012 developer-portfolio gradient."

## Rant Session 1 continued — 2026-04-22 (second pass)

On the Tailwind palette as enemy:
> "Sand, eggshell are good neutrals; what I don't want are Tailwind colors."

On material-derived color substitutes:
> "Brass/gold instead of orange for buttons, a deep cobalt or obsidian blue instead of tech blue."

On blue specifically (clarified as direction, not prescription):
> "I don't want to be too prescriptive about the one color I can actually see."
(Protan + deutran colorblindness means blue is the hue channel Adil judges most reliably. The spine refuses tech-blue but defers specific blue substitutes to per-project judgment.)

On header-spacing and floating-alignment failures:
> "Lack of space between header buttons and the ugly purple box, which has these obviously AI generated rounded corners, and gives zero thought to the horizontal placement and alignment of the logo and menu items leaving them to just float awkwardly in a random spot."

On skeuomorphism as category error:
> "The actual one is meant to be used in person. Next to a notebook. Where you're holding it up, typing, and getting results. It does not exist in a locked space, with a background. It's comically stupid to take that object and turn it into the basis for a digital calculator."

On copy being out of scope for this system:
> "Copy is something I write, not in this scope." — copy-voice rants are NOT captured in the design-context; the spine skill treats copy as out-of-scope.

On shadow/surface treatments beyond what's already captured:
> "Don't have the terms for it. And I don't want to be prescriptive about it; this is the kind of thing to just lift from impeccable." — the spine defers shadow/surface-treatment refusals beyond chamfering to Impeccable's absolute_bans and existing detector rules.

On typography spacing discipline:
> "Rules to not 'double stack' spacing out of laziness. If a bullet list item has top and bottom margin, and each paragraph has bottom margin, then the first item in a bullet list ends up inheriting 2x the margin, making it sit awkwardly far from its reference point. So, each combination needs its own type setting — list after paragraph, list after h4, paragraph after list, body after h2, or h3, etc."

On the typography exemplar (ground-truth):
> "Take a look at the content renderer in ~/obsidian-peptides."
(The canonical reference for junction-based prose spacing lives at `~/obsidian-peptides/css/research-content-typography.css` — that file's `:first-child`, `:last-child`, `:has()`, and adjacent-sibling rules are the pattern the spine encourages across all prose-handling CSS.)

On the font set as personal toolkit:
> "I almost always pick from this set; can always add others."
(The preferred font set is the known-quantity reach, not a closed list. Flagging departures requires justification; staying within the set is the default.)

On the type scale shape:
> "Large, but not heavy H1s → big drop to H2; H3 only a little larger than body; H4 the same size as body, just often a different form (e.g. all caps, heavier)."
(Non-uniform scale: compressed at the bottom, stretched at the top. H4 differentiates via form — caps, weight, tracking — not size.)

On weights and italic:
> "Generally oriented toward 300/400 weights; italics sparingly used in body but sometimes invoked heavily for displays."

On mono font discipline:
> "Mono fonts used sparingly unless the entire aesthetic is built around it (used for code, data, as accents or labels)."

On components (deferred to Impeccable/Emil):
> "Lets lean on impeccable/emil for components."
(The spine does not prescribe component patterns. Empty states, cards, modals, buttons, inputs — all deferred to Impeccable's and Emil's existing discipline. This is a peer-skill delegation, not a gap.)

On alignment precision (canonical source cited):
> "`DESIGN_OCD_META_RULES.md` and the `optical-alignment-spec.md`."
(These are Adil's own authored reference documents. They ARE the discipline. The spine points at them; does not paraphrase.)

On the motion register:
> "Smooth, elegant motion — not perspective, just directional. Not a 'I like this design' necessarily either."
(Editorial / page-scale motion is 2D translation, smooth easing, considered stagger. Perspective / 3D / tilt motion is refused as a register. The reference list is pointed at as inspiration; the aesthetic of each reference site is separate from the motion register being pointed at.)

## Sourced from the LLM CSS Manifesto — 2026-05-29

These quotes are NOT Adil's spoken rants. They are verbatim from `docs/concepts/llm-css-manifesto.md` — the causal model for the CSS-architecture pattern-family (`rants/css-architecture.md` + `preferences/css-architecture.md`). Recorded here because they are load-bearing framing for doctrine B (centralize design authority; taxonomy-first; no blanket Tailwind ban).

On scattered design authority at agent scale:
> "With Tailwind, every agent is an unsupervised designer."

On the LLM failure mode that utility sprawl amplifies:
> "I'm not designing — I'm autocompleting."

On the centralized stylesheet as enforcement mechanism:
> "The stylesheet becomes the design constitution — it constrains every agent's output to visual coherence without any agent needing to understand the full design system."
