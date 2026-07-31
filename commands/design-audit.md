---
name: design-audit
description: "Technical quality audit (a11y + performance + responsive + anti-patterns) for UI work. Loads the impeccable-hub aesthetic + project PRODUCT.md/DESIGN.md + the ui-quality-audit skill. Distinct from the ORCA /audit due-diligence workflow command (the design-fork audit skill was renamed from `audit` to `ui-quality-audit` to resolve the command/skill name collision)."
argument-hint: "<target file, component, or page>"
license: Apache 2.0.
---

# /design-audit

## Entry: mandatory skill loading

**Target routing (`#PATH_DECISION` — one rule, not 5 copies):** apply `~/.claude/docs/concepts/ios-design-contract/target-routing.md`. If the TARGET ends in `.swift`, load `Skill("ios-impeccable-hub")` in place of `impeccable-hub` and use the Swift detector + iOS banned-rule bullets below; otherwise keep the CSS/web path unchanged.

Before any work, invoke:

1. `Skill("impeccable-hub")` — the aesthetic (felt-state spine + banned rules + preferences + voice-anchors + detector floor). Baseline for every invocation. **For a `.swift` target, load `Skill("ios-impeccable-hub")` instead** (SwiftUI banned rules + preferences + the iOS detector contract) — see the routing rule above.
2. `Skill("ui-quality-audit")` — the ui-quality-audit skill's technical quality checks (a11y, performance, responsive, anti-patterns).

## Context gathering

Read the current project's `.claude/PRODUCT.md` (strategic register) and `.claude/DESIGN.md` (visual contract). **If absent, do NOT block** — run the audit on the hub's global aesthetic (the banned rules + preferences + voice-anchors still drive the anti-pattern flags) and note once: *"No project contract found — auditing against the global aesthetic; run `/impeccable --teach` to make this project-specific."*

Read the global catalog references that matter for audit:
- `~/.claude/docs/concepts/design-contract/banned/` — the anti-pattern files drive which anti-patterns to flag.
- `~/.claude/docs/concepts/design-contract/preferences/alignment-precision.md` — 7 optical rules + pixel audit are part of the technical-quality pass.

## Work

Apply the ui-quality-audit skill's procedures to the user's target. Extend with Adil's aesthetic:

- Flag every Tailwind palette utility or Tailwind hex value (P0 — `banned/colors.md`).
- Flag every reflex-font usage (P0 — `banned/fonts.md`).
- Flag every AI-purple / AI-magenta / AI-pink gradient (P0 — `banned/gradients.md`).
- Flag every chamfer stack (inset-highlight + outer shadow + gradient on same element; P0 — `banned/chamfered-buttons.md`).
- Flag every default-ease transition and bouncy easing (P1 — `banned/motion-suddenness.md`).
- Flag every side-stripe border (`border-left`/`border-right` > 1px; P0 — `banned/chamfered-buttons.md` / Bakaus absolute_bans).
- Flag every gradient text (`background-clip: text` + gradient; P0 — Bakaus absolute_bans).

**On a `.swift` target, swap the CSS banned-rule bullets above for the iOS equivalents** (the iOS hub's banned rules at `~/.claude/docs/concepts/ios-design-contract/banned/`):

- Flag every off-palette hue, raw-hex outside token dirs, and Tailwind-palette hex (P0 — `ios .../banned/colors.md`).
- Flag every hue-coded category (color-as-the-only-signal for a category; P0 — `ios .../banned/hue-coded-categorical.md`).
- Flag every system-font reflex / display-font below the floor (P0/P1 — `ios .../banned/fonts.md`).
- Flag every AI-purple / magenta / gradient fill (P0 — `ios .../banned/gradients.md`).
- Flag every iOS-default reflex — Settings grouped-list, default `.blue`, default sheet/NavigationStack chrome (P0 — `ios .../banned/ios-default-reflex.md`).
- Flag every shadow / material-glassmorphism reflex (P0 — `ios .../banned/shadow-reflex.md`).
- Flag every spring-overshoot animation and magic-number spacing / mono-fatigue (P1 — `ios .../banned/spring-overshoot.md`, `magic-number-spacing.md`, `mono-fatigue.md`).

- Run the deterministic detector as a DIAGNOSTIC input (a report signal, NOT a shipping gate). **For a `.swift` target:** `/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json <target> 2>&1`. **Otherwise (web):** `node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <target> 2>&1`. Both: **exit 2 = dirty** (findings present), **exit 0 + `[]` = clean** — key the read off the exit code. Each finding is `{antipattern, name, description, file, line, snippet}`. Report alongside manual findings. (`npx designcheck` is NOT a published package — use the local entry above.)
- Apply pixel-alignment audit from `preferences/alignment-precision.md`.
- Apply typography-junction audit from `preferences/typography-spacing.md`.

Produce a scored report with P0-P3 severity ratings, specific file:line references, and an actionable plan. Cite the source banned rule/preference for each aesthetic finding.


## Optional parallel hygiene check

`/design-audit` is itself a diagnostic-LLM-review command. The deterministic detector and `scripts/audit-design.sh` run as **parallel hygiene utilities** alongside the LLM review. Neither biases the other; the human reads both reports and decides.

If the project has `scripts/audit-design.sh`, optionally invoke it for the mechanical-hygiene track:

```bash
bash {current-project}/scripts/audit-design.sh
```

Report findings alongside the LLM review. The audit informs but does not gate — `/design-audit` itself is a diagnostic surface, not a shipping gate. If the human reads both reports and disagrees, the audit is wrong for this case (rare; document the exception).

## Handback

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.
