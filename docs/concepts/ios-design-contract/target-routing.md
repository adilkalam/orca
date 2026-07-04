# Design Target Routing — `.swift` vs web (the ONE detection rule)

**Status:** Canonical. The single shared definition of how a design verb picks its doctrine + detector
based on the TARGET file extension. Defined ONCE here; **never copy-pasted** into command files
(`#POISON_PATH` — the same duplication that bloated the design lane). The 5 design-fork commands
(`/refine`, `/fortify`, `/simplify`, `/design-audit`, `/design-critique`) reference this file with a
single inline rule line instead of pasting the branch five times.

## The rule

Inspect the TARGET's file extension and route accordingly:

| TARGET ends in | Hub / doctrine to load | Detector to run |
|---|---|---|
| `.swift` | `Skill("ios-impeccable-hub")` — SwiftUI rants + preferences + the iOS detector contract | `/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json <target>` |
| anything else (web: `.css`, `.tsx`, `.jsx`, `.html`, `.vue`, …) | `Skill("impeccable-hub")` + read `~/.claude/docs/concepts/llm-css-manifesto.md` before writing CSS | `node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <target>` |

**Exit-code contract (both detectors):** `EXIT=0` + `[]` = clean; `EXIT=2` = findings present (dirty);
findings are `{antipattern, name, description, file, line, snippet}`. Key the read off the exit code.

**Doctrine cross-reference:** on the `.swift` branch, the iOS rants live at
`~/.claude/docs/concepts/ios-design-contract/rants/` (`colors`, `fonts`, `gradients`,
`hue-coded-categorical`, `ios-default-reflex`, `shadow-reflex`, `spring-overshoot`,
`magic-number-spacing`, `mono-fatigue`) and the preferences at
`~/.claude/docs/concepts/ios-design-contract/preferences/` (`blue-only-palette-law`,
`token-layer-is-the-design-document`, `dynamic-type-discipline`, `motion-discipline`,
`bundled-font-discipline`). On the web branch, the CSS catalog stays under `design-contract/`.

## How a command cites this

One line, no paste:

> **Target routing:** apply `~/.claude/docs/concepts/ios-design-contract/target-routing.md` — if the
> TARGET ends in `.swift`, load `Skill("ios-impeccable-hub")` and run `swiftdesigncheck`; otherwise keep
> the CSS path (`impeccable-hub` + `llm-css-manifesto` + `designcheck.js`).
