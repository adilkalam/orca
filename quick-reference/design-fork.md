# Design Fork — How to use it

## What actually happens when you run a command

Every design command loads three things before doing any work:

1. **`interfaces-that-feel`** — the felt-state skill. Every command loads this at entry so the work is emotionally aware. This is non-negotiable; it happens automatically.
2. **Your project's `.claude/PRODUCT.md`** — the strategic contract. Register, users, anti-references AS NAMED BRANDS, design principles, accessibility intent. Populated by `/impeccable --teach` on first entry.
3. **Your project's `.claude/DESIGN.md`** — the visual contract. Stitch-spec frontmatter (colors hex sRGB, typography hierarchy, components 8-prop max) + 6 fixed markdown sections (Overview, Colors, Typography, Elevation, Components, Do's-and-Don'ts). Populated by `/impeccable --document` (scan mode extracts from code; --seed mode runs a 5-question interview).
4. **The global catalog at `~/.claude/docs/concepts/design-contract/`** — the rants, preferences, and 17 voice anchors. Every command reads these as reference.

**Where your rants come in:** the rants are automatic refusals. When `/impeccable --craft` generates code, it refuses Tailwind palette utilities (`rants/colors.md`), Geist and the 22-font reject list (`rants/fonts.md`), AI purple-pink gradients (`rants/gradients.md`), chamfered buttons (`rants/chamfered-buttons.md`), motion suddenness (`rants/motion-suddenness.md`), and the other pattern-families. You don't have to invoke them; they're loaded as part of the command body and enforced.

**Where your preferences come in:** when the command needs to *choose* something (a font, a palette, a spacing scale, a motion curve), it reaches into the preferences first. The 22-font catalog at `preferences/typography-fonts.md` is consulted before suggesting any font. The non-uniform type scale at `preferences/typography-scale.md` is applied. The 7 optical alignment rules at `preferences/alignment-precision.md` apply throughout. Your commitments in `.claude/DESIGN.md` override when a project has picked a specific subset.

**Where the voice anchors come in:** the 17 verbatim quotes are inlined directly in `commands/impeccable.md`. They're load-bearing context for every `--craft` call. You don't need to load them; they travel with the command.

**What gets produced:** working code (for `--craft` or any `/refine`/`/simplify`/`/fortify` call). At handback, the command asks *"Anything here you'd rant about?"* and any response appends to `{project}/.orca/design-rants-pending.md` for later sweeping into the global catalog.

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

Full shape-then-build pipeline. Loads interfaces-that-feel + your PRODUCT.md + your DESIGN.md + the rants + preferences + 17 voice anchors. Runs `/shape` (3-round per-feature discovery interview) FIRST, then generates 1-3 high-fidelity reference comps for you to pick from, THEN builds code matching the chosen comp. Code is step 4 of 6, never step 1.

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
4. **`{project}/.orca/design-rants-pending.md`** — capture ledger. Every design command appends verbatim user critiques here at handback. Sweep periodically via `/impeccable --extract rants`.
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

## Growing the register

Every command ends by asking *"Anything here you'd rant about?"* Your response appends to the current project's `.orca/design-rants-pending.md` with a timestamp. Over time you accumulate entries. When you want to fold them back into the global catalog:

    /impeccable --extract rants

Walks each pending entry, asks you which rant category it belongs to (fonts, colors, gradients, motion-suddenness, chamfered-buttons, generic-ui-defaults, alignment-spacing, rounded-corners, skeuomorphism, uniform-tile-layout, or new), appends to the correct global rant file, clears the pending file.

After sweeping, redeploy so future commands see the updated rants:

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

The `mcp/design-detector/` directory is NOT rsynced; the detector runs from the ORCA-OS source path.

## Running the detector manually

    cd /Users/adilkalam/ORCA-OS/mcp/design-detector
    node bin/designcheck.js detect <file-or-dir>

Scans static CSS/source for active regex rules + Bakaus baseline. For live-DOM checks (measured alignment, actual contrast), use the Chrome DevTools path via `/design-critique`.

---

## Things worth knowing

**Your rants and preferences live at** `~/.claude/docs/concepts/design-contract/` globally. Your per-project picks live at `{project}/.claude/PRODUCT.md` (strategic) + `{project}/.claude/DESIGN.md` (visual). The global catalog is the vocabulary; each project's PRODUCT.md + DESIGN.md is a specific commitment drawn from it. Two projects don't fork the catalog — they each have their own PRODUCT/DESIGN pair.

**Commands never shadow skill names.** `/motion-design` not `/animate`. `/fortify` not `/harden`. `/design-audit` not `/audit`. `/design-critique` not `/critique`. The skill names are already taken, so the command layer renames.

**Rant-capture always writes project-local.** Captures go to `{project}/.orca/design-rants-pending.md`. Never `~/.claude/` or the ORCA-OS source tree directly — rsync would overwrite them.

**rsync has no `--delete` flag in these workflows.** Archiving something from the source tree does not remove it from `~/.claude/`. If you archive a skill or command and want the global config to match, manually delete the orphan from `~/.claude/`.

**Voice anchors are verbatim.** Don't paraphrase the 17 quotes in `voice-anchors.md`. They're the register's heart.

**aesthetic.md is deprecated.** Earlier projects used a single `.claude/aesthetic.md` that collapsed strategic and visual context. That template is deprecated. Existing projects with `aesthetic.md` should split via `/impeccable --teach` (regenerates PRODUCT.md) and `/impeccable --document` (regenerates DESIGN.md).

**`/nextjs` is currently non-functional** pending a reshape. Use `/orca` or direct agent spawning for Next.js work until then.

**Detector scope.** Active regex rules: Tailwind utility/hex, reflex fonts, Geist, purple-pink gradients, gradient text, side-stripe borders, inset-highlight shadow, default-ease transition, bouncy easing. Plus Bakaus baseline. Deferred handler stubs (chamfer-stack, asymmetric-heading-margins, missing-typography-junctions). Removed from scope (ios-calculator, pretend-variation, pixel-misalignment).

**Upstream.** [Impeccable](https://impeccable.style) by Paul Bakaus, Apache 2.0. `animation-engineering` by Emil Kowalski.
