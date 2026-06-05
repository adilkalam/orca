---
name: design-audit
description: "Technical quality audit (a11y + performance + responsive + anti-patterns) for UI work. Loads the impeccable-hub register + project PRODUCT.md/DESIGN.md + the ui-quality-audit skill. Distinct from the ORCA /audit due-diligence workflow command (the design-fork audit skill was renamed from `audit` to `ui-quality-audit` to resolve the command/skill name collision)."
argument-hint: "<target file, component, or page>"
license: Apache 2.0.
---

# /design-audit

## Entry: mandatory skill loading

Before any work, invoke:

1. `Skill("impeccable-hub")` — the register (felt-state spine + rants + preferences + voice-anchors + detector floor). Baseline for every invocation.
2. `Skill("ui-quality-audit")` — the ui-quality-audit skill's technical quality checks (a11y, performance, responsive, anti-patterns).

## Context gathering

Read the current project's `.claude/PRODUCT.md` (strategic register) and `.claude/DESIGN.md` (visual contract). **If absent, do NOT block** — run the audit on the hub's global register (the rants + preferences + voice-anchors still drive the anti-pattern flags) and note once: *"No project contract found — auditing against the global register; run `/impeccable --teach` to make this project-specific."*

Read the global catalog references that matter for audit:
- `~/.claude/docs/concepts/design-contract/rants/` — the 9 anti-pattern files drive which anti-patterns to flag.
- `~/.claude/docs/concepts/design-contract/preferences/alignment-precision.md` — 7 optical rules + pixel audit are part of the technical-quality pass.

## Work

Apply the ui-quality-audit skill's procedures to the user's target. Extend with Adil's register:

- Flag every Tailwind palette utility or Tailwind hex value (P0 — `rants/colors.md`).
- Flag every reflex-font usage (P0 — `rants/fonts.md`).
- Flag every AI-purple / AI-magenta / AI-pink gradient (P0 — `rants/gradients.md`).
- Flag every chamfer stack (inset-highlight + outer shadow + gradient on same element; P0 — `rants/chamfered-buttons.md`).
- Flag every default-ease transition and bouncy easing (P1 — `rants/motion-suddenness.md`).
- Flag every side-stripe border (`border-left`/`border-right` > 1px; P0 — `rants/chamfered-buttons.md` / Bakaus absolute_bans).
- Flag every gradient text (`background-clip: text` + gradient; P0 — Bakaus absolute_bans).
- Run the deterministic detector as a DIAGNOSTIC input (a report signal, NOT a shipping gate): `node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <target> 2>&1`. Findings arrive on STDERR; **exit 2 = dirty** (findings present), **exit 0 + `[]` = clean** — key the read off the exit code. Each finding is `{antipattern, name, description, file, line, snippet}`. Report alongside manual findings. (`npx designcheck` is NOT a published package — use the local node entry above.)
- Apply pixel-alignment audit from `preferences/alignment-precision.md`.
- Apply typography-junction audit from `preferences/typography-spacing.md`.

Produce a scored report with P0-P3 severity ratings, specific file:line references, and an actionable plan. Cite the source rant/preference for each Adil-register finding.


## Optional parallel hygiene check

`/design-audit` is itself a diagnostic-LLM-review command. The deterministic detector and `scripts/audit-design.sh` run as **parallel hygiene utilities** alongside the LLM review. Neither biases the other; the human reads both reports and decides.

If the project has `scripts/audit-design.sh`, optionally invoke it for the mechanical-hygiene track:

```bash
bash {current-project}/scripts/audit-design.sh
```

Report findings alongside the LLM review. The audit informs but does not gate — `/design-audit` itself is a diagnostic surface, not a shipping gate. If the human reads both reports and disagrees, the audit is wrong for this case (rare; document the exception).

## Handback

Ask: "Returned to bench. Anything here you'd rant about?"

If the user responds, append to `{current-project}/.orca/design-rants-pending.md`:

```
## YYYY-MM-DD HH:MM — design-audit
[user's response verbatim]
```

Create `.orca/` in the project if absent. Pending entries are swept later via `/impeccable --extract rants`.
