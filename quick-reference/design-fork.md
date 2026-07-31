# Design Fork — How to use it

## What actually happens when you run a command

Every design command loads three things before doing any work:

1. **`interfaces-that-feel`** — the felt-state skill. Every command loads this at entry so the work is emotionally aware. This is non-negotiable; it happens automatically.
2. **Your project's `.claude/PRODUCT.md`** — the strategic contract. Register, users, anti-references AS NAMED BRANDS, design principles, accessibility intent. Populated by `/impeccable --teach` on first entry.
3. **Your project's `.claude/DESIGN.md`** — the visual contract. Stitch-spec frontmatter (colors hex sRGB, typography hierarchy, components 8-prop max) + 6 fixed markdown sections (Overview, Colors, Typography, Elevation, Components, Do's-and-Don'ts). Populated by `/impeccable --document` (scan mode extracts from code; --seed mode runs a 5-question interview).
4. **The global catalog at `~/.claude/docs/concepts/design-contract/`** — the banned rules, preferences, and 17 voice anchors. Every command reads these as reference.

**Where your banned rules come in:** the banned rules are automatic refusals. When `/impeccable --craft` generates code, it refuses Tailwind palette utilities (`banned/colors.md`), Geist and the 22-font reject list (`banned/fonts.md`), AI purple-pink gradients (`banned/gradients.md`), chamfered buttons (`banned/chamfered-buttons.md`), motion suddenness (`banned/motion-suddenness.md`), and the other pattern-families. You don't have to invoke them: at T0 the banned-core travels inlined in the lane command's own body; on the gated tiers they arrive via the `impeccable-hub` skill and are bound as typed constraints the fresh-context judge enforces.

**Where your preferences come in:** when the command needs to *choose* something (a font, a palette, a spacing scale, a motion curve), it reaches into the preferences first. The 22-font catalog at `preferences/typography-fonts.md` is consulted before suggesting any font. The non-uniform type scale at `preferences/typography-scale.md` is applied. The 7 optical alignment rules at `preferences/alignment-precision.md` apply throughout. Your commitments in `.claude/DESIGN.md` override when a project has picked a specific subset.

**Where the voice anchors come in:** the 17 verbatim quotes live in `design-contract/voice-anchors.md` and travel via the `impeccable-hub` skill (the hub points at them; nothing re-inlines them). They're load-bearing context for every `--craft` call and seed the FORWARD constraints the lane binds.

**What gets produced:** working code (for `--craft` or any `/refine`/`/simplify`/`/fortify` call). Aesthetic capture is owner-gated — entries land in `{project}/.orca/aesthetic-pending.md` only on your explicit ask or approval, for later sweeping into the global catalog.

---

## The lane — three tiers, biased toward fast

Every design request routes to one of three tiers (canon: `~/.claude/docs/reference/design-lane.md`). The cost of the machinery must never exceed the cost of the mistake it prevents.

| Tier | Trigger | What happens |
|---|---|---|
| **T0** | `--tweak`, or any true one-liner | In-thread edit, zero agent spawns. The detector runs inline as a REPORT — it informs, never blocks. No gate, no phase_state, no capture question. You, looking at the live surface, are the verifier. |
| **T1** (THE DEFAULT) | a single `--<verb>`, or a well-defined single-verb freeform ask | The main agent builds in-thread (your brief stays verbatim by construction), then exactly ONE fresh-context judge is spawned (`design-validator`, or `ios-design-validator` for `.swift`). PASS writes the canonical gate (`gates.design_lane` / `gates.ios_design_lane`) and the hook floor re-runs the detector. BLOCK loops max N=2, then escalates to you with the diff. |
| **T2** | `--full`, freeform multi-verb, thin brief | `design-architect` decomposes into ordered verb-tasks; per task: bind typed constraints → `design-builder` (receives your request RAW VERBATIM) → `design-validator` → branch. Escalations arrive with the diff + a `git stash` revert handle, and the remaining tasks halt pending you. |

Routing is **bias-to-fast**: explicit flags are deterministic; when in doubt the lane routes DOWN a tier. Wrong-fast is caught instantly by your eye on localhost/simulator; wrong-slow burns twenty minutes of machinery on a one-line change.

Precedence is fixed: **your live instruction > the standing aesthetic (`banned/` + `preferences/` + voice anchors) > the deterministic detector.** When you explicitly overrule a standing rule, the lane binds a typed `OWNER-OVERRIDE` and writes it back to `{project}/.design-overrides.json` immediately at bind — the suppressed rule stops firing for that scope on every future run. Both detectors are severity-aware: exit 2 only on a blocking P0/P1 effective-severity finding; advisory-only runs report and exit 0.

**Aesthetic capture is owner-gated.** Nothing is written to `banned/`, `preferences/`, or the pending ledger unless you explicitly ask, or you voice a strong correction and approve the exact proposed entry text. There is NO per-turn capture question. Sessions that wrote entries disclose them in one line at the end.

---

## First time in a project

Run:

    /impeccable --teach

Walks you through a 3-round structured discovery interview (Round 1: identity & users; Round 2: brand personality & principles; Round 3: anti-references & accessibility) to populate `.claude/PRODUCT.md`. **No colors, no fonts, no pixel values** — those live in DESIGN.md.

Then:

    /impeccable --document

Generates `.claude/DESIGN.md` (Stitch-spec visual contract). Default mode scans your codebase to extract tokens (colors, typography, components) and asks 5 qualitative questions to fill prose sections. Use `--seed` for greenfield projects (no code yet) — runs a 5-question interview producing a scaffold DESIGN.md with `<!-- SEED -->` placeholders.

Until BOTH PRODUCT.md AND DESIGN.md exist, every other command will route back here. Skipping = generic output. Don't skip.

## Building something new

Run:

    /impeccable --craft "<what to build>"

Full shape-then-build pipeline. Loads interfaces-that-feel + your PRODUCT.md + your DESIGN.md + the banned rules + preferences + 17 voice anchors. Runs `/shape` (3-round per-feature discovery interview) FIRST, then generates 1-3 high-fidelity reference comps for you to pick from, THEN builds code matching the chosen comp. Code is step 4 of 6, never step 1.

## Targeted passes on existing code

Pick the one that matches your intent:

| I want to                            | Run                              |
|--------------------------------------|----------------------------------|
| Generate or refresh DESIGN.md         | `/impeccable --document`         |
| Add motion (full pipe, Emil + Lenis) | `/motion-design "<target>"`      |
| Light animation pass                 | `/refine --animate "<target>"`   |
| Typography fix                       | `/refine --typeset "<target>"`   |
| Make it bolder                       | `/refine --bolder "<target>"`    |
| Calm it down                         | `/refine --quieter "<target>"`   |
| Better color                         | `/refine --colorize "<target>"`  |
| Better spacing / rhythm              | `/refine --layout "<target>"`    |
| Moments of joy                       | `/refine --delight "<target>"`   |
| 3D / shaders / scroll-driven         | `/refine --overdrive "<target>"` |
| Mobile / responsive                  | `/simplify --adapt "<target>"`   |
| Clearer UX copy                      | `/simplify --clarify "<target>"` |
| Strip to essence                     | `/simplify --distill "<target>"` |
| Error / empty / loading states       | `/fortify --harden "<target>"`   |
| UI performance                       | `/fortify --optimize "<target>"` |
| Final ship-readiness pass            | `/fortify --polish "<target>"`   |
| Full UX review with scoring          | `/design-critique "<target>"`    |
| a11y + perf + responsive check       | `/design-audit "<target>"`       |
| Redo a feature against the existing contract (thin coordinator → /live, re-shape+re-craft, or re-teach+re-document) | `/recraft "<critique>"`          |

You never call peer skills directly. `interfaces-that-feel`, `animation-engineering`, `motion-design-principles`, `lenis-integration`, `threejs-patterns`, `three-js-animation` — all loaded automatically by the commands that need them.

---

## How taste binds

Documentation alone does not bind taste — but iterative human selection at every step does.

**The actual loop:**

```
PRODUCT.md (strategic — read by every command)
   +
DESIGN.md (visual contract — read by every command)
   ↓
/shape (per-feature 3-round discovery interview)
   ↓
/craft (1-3 reference comps; user picks one; code built to match)
   ↓
browser inspection
   ↓
/live (element-by-element three-variants-pick-one for iteration)
```

Binding happens at three structured selection points:

1. **Shape interview commitments.** The user answers job-to-be-done at this moment in the flow, felt-state, decisive ingredients — NOT generic taste preferences. The answers are project-specific, feature-specific, moment-specific.
2. **Visual-direction reference-comp pick.** /craft generates 1-3 comps. The user picks one. The chosen comp's visible ingredients (composition, hero, motifs, density, color treatment) become the visual contract for the build. **Skipping this step is the most common /craft failure mode.**
3. **/live element variant accept.** After the build, iterate per-element: pick element in browser → annotate intent → get three on-brand variants in HMR → user picks one → write back to source.

The deterministic detector (`scripts/audit-design.sh`) runs as **parallel hygiene** — it informs, it does not gate. The user's eye is the gate.

## What's in your project

When you run `/impeccable --teach` followed by `/impeccable --document`:

1. **`{project}/.claude/PRODUCT.md`** — strategic context. Register, users, anti-references AS NAMED BRANDS, design principles, accessibility. NO colors/fonts/pixels.
2. **`{project}/.claude/DESIGN.md`** — visual contract. Stitch-spec frontmatter + 6 fixed markdown sections. NO strategic content (that lives in PRODUCT.md).
3. **`{project}/.claude/DESIGN.json`** — JSON sidecar mirroring DESIGN.md frontmatter for tools that prefer JSON parsing.
4. **`{project}/.orca/aesthetic-pending.md`** — pending aesthetic ledger (the legacy `design-rants-pending.md` is also read). Entries land only on your explicit ask or approval (owner-gated). Sweep periodically via `/impeccable --extract aesthetic`.
5. **`{project}/scripts/audit-design.sh`** (optional) — parallel hygiene utility, analogous to `npx impeccable detect`. Mechanical hygiene checks (mono count cap, OT ligature disable, padding compensation). Informs, does not gate.

The two-file split (PRODUCT.md + DESIGN.md) is load-bearing. PRODUCT.md changes when register or audience changes (rare). DESIGN.md changes when visual tokens change (more often). Refining commands read both; strategic-only commands read PRODUCT.md only; visual-only checks read DESIGN.md only.

## When craft fails

If a `/craft` pass produces output the user critiques, route to `/recraft`.

`/recraft` is a **thin coordinator**. It does NOT regenerate code from rules. It classifies the scope of the problem and routes to the appropriate downstream flow:

| Route | Scope | Downstream flow |
|---|---|---|
| **A** | Single-element issue (one panel, one component, one typography moment) | `/live` element-by-element three-variants-pick-one |
| **B** | Whole-feature redo against the existing PRODUCT/DESIGN contract | re-shape (3-round interview anchored on the failed feature) + re-craft (1-3 new reference comps; user picks one) |
| **C** | PRODUCT.md or DESIGN.md themselves are the problem (the contract failed) | `/impeccable --teach` re-entry on PRODUCT.md sections + `/impeccable --document` re-entry on DESIGN.md sections |

`/recraft` asks one AskUserQuestion to classify scope, then routes. It does not guess. If the user critiques the routed flow's output AND the critique names the same issue twice across two routes, the contract itself is wrong (escalate to Route C).

## Why scripts cannot bind design taste

Design has unbounded combinatorics. Every new component, register, project, audience, context introduces failure modes that no rule list could have enumerated. Scripts work for problems with bounded specifications:

- Typecheck a function signature ✓ (the type system is bounded)
- Lint a syntax rule ✓ (the syntax is bounded)
- Regex an anti-pattern ✓ (the pattern is bounded)
- Detect a specific known-bad CSS combo ✓ (the combo is bounded)

Design is not such a problem. A 25-rule list catches 25 patterns. The 26th pattern — the one that actually broke the user's eye — is invisible to the script and ships. The user's response is "your audit said it was fine, but it's wrong," which is exactly the case the script was supposed to prevent.

The script (`audit-design.sh`) catches **mechanical hygiene** — that's its proper role. Mono count caps, OT ligature feature flags, border-padding compensation math. These have bounded specifications and the script handles them well. They are the linter / formatter / typecheck of the design layer.

**Taste binds through human selection at structured points** — shape interview, visual-direction comp pick, /live variant accept. NOT through ever-larger rule lists. Generation under script-pressure converges on script-passing-but-tasteless output, because the script becomes the new taste. That outcome is worse than no script.

The detector and audit script run **in parallel** with the LLM design review, never as a gate. Both informs the human; the human decides.

---

## Growing the aesthetic

Aesthetic capture is owner-gated — entries land in the current project's `.orca/aesthetic-pending.md` (verbatim, scoped, dated) only when you ask or approve. Over time you accumulate entries. When you want to fold them back into the global catalog:

    /impeccable --extract aesthetic

Walks each pending entry, asks you which banned category it belongs to (fonts, colors, gradients, motion-suddenness, chamfered-buttons, generic-ui-defaults, alignment-spacing, rounded-corners, skeuomorphism, uniform-tile-layout, or new), appends to the correct global banned file, clears the pending file.

After sweeping, redeploy so future commands see the updated banned rules:

    rsync -av /Users/adilkalam/ORCA-OS/docs/ ~/.claude/docs/

## Extracting a design system from a project

    /impeccable --extract

Pulls reusable tokens and components from the current project into its design system. Full flow at `~/.claude/docs/concepts/impeccable-reference/extract.md`.

---

## Deploying changes to the fork itself

When you edit the skills, commands, or global catalog in the ORCA-OS repo, push to your live config:

    rsync -av --exclude='*archive*' --exclude='*deprecated*' /Users/adilkalam/ORCA-OS/skills/        ~/.claude/skills/
    rsync -av --exclude='*archive*' --exclude='*deprecated*' /Users/adilkalam/ORCA-OS/docs/          ~/.claude/docs/
    rsync -av --exclude='*archive*' --exclude='*deprecated*' /Users/adilkalam/ORCA-OS/commands/      ~/.claude/commands/
    rsync -av --exclude='*archive*' --exclude='*deprecated*' /Users/adilkalam/ORCA-OS/templates/     ~/.claude/templates/
    rsync -av --exclude='*archive*' --exclude='*deprecated*' /Users/adilkalam/ORCA-OS/quick-reference/ ~/.claude/quick-reference/

The `mcp/design-detector/` and `mcp/swift-design-detector/` directories are NOT rsynced; the detectors run from the ORCA-OS source path.

## Target routing — `.swift` vs web (the 5 design-fork commands)

The 5 design-fork commands (`/refine`, `/fortify`, `/simplify`, `/design-audit`, `/design-critique`) are **target-aware**. They route off the TARGET's file extension via the ONE shared rule at `~/.claude/docs/concepts/ios-design-contract/target-routing.md`:

- **`.swift` target** → load `Skill("ios-impeccable-hub")` (SwiftUI banned rules + preferences + the iOS detector contract) and run the **Swift detector** `mcp/swift-design-detector/bin/swiftdesigncheck detect --json <target>`.
- **anything else (web)** → keep the existing CSS path: `Skill("impeccable-hub")` + `~/.claude/docs/concepts/llm-css-manifesto.md` + the web detector `mcp/design-detector/bin/designcheck.js`.

The branch is authored once in `target-routing.md` and referenced by a single inline rule line per command (no 5× copy-paste, `#POISON_PATH`). Same exit-code contract on both detectors: `EXIT=0 + []` clean, `EXIT=2` dirty; findings are `{antipattern, name, description, file, line, snippet}`.

## Running the detectors manually

Web (CSS/TSX/HTML):

    cd /Users/adilkalam/ORCA-OS/mcp/design-detector
    node bin/designcheck.js detect <file-or-dir>

Swift (SwiftUI):

    /Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json <file-or-dir>

The web detector scans static CSS/source for active regex rules + Bakaus baseline; the Swift detector scans `.swift` via SwiftSyntax AST (token-dir scoped). For live-render checks (measured alignment, actual contrast), use the Chrome DevTools path (web) or a simulator screenshot review (`.swift`) via `/design-critique`.

---

## Things worth knowing

**Your banned rules and preferences live at** `~/.claude/docs/concepts/design-contract/` globally. Your per-project picks live at `{project}/.claude/PRODUCT.md` (strategic) + `{project}/.claude/DESIGN.md` (visual). The global catalog is the vocabulary; each project's PRODUCT.md + DESIGN.md is a specific commitment drawn from it. Two projects don't fork the catalog — they each have their own PRODUCT/DESIGN pair.

**Commands never shadow skill names.** `/motion-design` not `/animate`. `/fortify` not `/harden`. `/design-audit` not `/audit`. `/design-critique` not `/critique`. The skill names are already taken, so the command layer renames.

**Aesthetic capture always writes project-local.** Captures go to `{project}/.orca/aesthetic-pending.md`. Never `~/.claude/` or the ORCA-OS source tree directly — rsync would overwrite them.

**rsync has no `--delete` flag in these workflows.** Archiving something from the source tree does not remove it from `~/.claude/`. If you archive a skill or command and want the global config to match, manually delete the orphan from `~/.claude/`.

**Voice anchors are verbatim.** Don't paraphrase the 17 quotes in `voice-anchors.md`. They're the register's heart.

**aesthetic.md is deprecated.** Earlier projects used a single `.claude/aesthetic.md` that collapsed strategic and visual context. That template is deprecated. Existing projects with `aesthetic.md` should split via `/impeccable --teach` (regenerates PRODUCT.md) and `/impeccable --document` (regenerates DESIGN.md).

**`/nextjs` is restored (2026-07-03)** as a flat-pattern lane with the web design floor (`design-validator` + detector on UI-affecting tasks). Heavy/holistic aesthetics still route to `/impeccable`.

**Detector scope.** 11 active pattern rules: Tailwind utility/hex, reflex fonts, Geist, purple-pink gradients, gradient text, side-stripe borders, inset-highlight shadow (all P0), default-ease transition, bouncy easing (P1), utility-sprawl (advisory-marked P1 — reports, never blocks). Plus Bakaus baseline. Severity-aware exits: exit 2 only on a blocking P0/P1 effective-severity finding. Deferred handler stubs (chamfer-stack, asymmetric-heading-margins, missing-typography-junctions). Removed from scope (ios-calculator, pretend-variation, pixel-misalignment).

**Upstream.** [Impeccable](https://impeccable.style) by Paul Bakaus, Apache 2.0. `animation-engineering` by Emil Kowalski.
