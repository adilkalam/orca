---
name: design-critique
description: "UX critique with visual hierarchy, persona red-flags, cognitive load, and anti-pattern scoring. Loads the impeccable-hub register + project PRODUCT.md/DESIGN.md + the critique skill + the deterministic detector. Named /design-critique to avoid shadowing the /critique skill."
argument-hint: "<target file, component, or page>"
license: Apache 2.0.
---

# /design-critique

## Entry: mandatory skill loading

**Target routing (`#PATH_DECISION` — one rule, not 5 copies):** apply `~/.claude/docs/concepts/ios-design-contract/target-routing.md`. If the TARGET ends in `.swift`, load `Skill("ios-impeccable-hub")` in place of `impeccable-hub` and run the Swift detector in Assessment B; otherwise keep the CSS/web path unchanged.

Before any work, invoke:

1. `Skill("impeccable-hub")` — the register (felt-state spine + rants + preferences + voice-anchors + detector floor). Baseline for every invocation; drives Assessment C (persona red-flags) via its `interfaces-that-feel` spine. **For a `.swift` target, load `Skill("ios-impeccable-hub")` instead** (SwiftUI rants + preferences + the iOS detector contract) — see the routing rule above.
2. `Skill("critique")` — the critique skill's review procedure, persona testing, scoring.

## Context gathering

Read the current project's `.claude/PRODUCT.md` (strategic register) and `.claude/DESIGN.md` (visual contract). **If absent, do NOT block** — run the critique on the hub's global register (rants + preferences + voice-anchors) and note once: *"No project contract found — critiquing against the global register; run `/impeccable --teach` to make this project-specific."*

Read the global catalog references:
- `~/.claude/docs/concepts/design-contract/rants/` — all 9 anti-pattern files drive the extended DON'T list.
- `~/.claude/docs/concepts/design-contract/voice-anchors.md` — the register's heart; inform hierarchy and tone judgments against it.
- `~/.claude/docs/concepts/design-contract/preferences/` — positive-move catalogs to assess against (what should have been reached for).

## Work

Three assessments in order:

**Assessment A — LLM review (from the critique skill).** Visual hierarchy, information architecture, emotional resonance, cognitive load. Apply Bakaus's extended DON'T list AND Adil's refusals catalog (all 9 rants). Cite specific rant files when flagging issues.

**Assessment B — Deterministic detector (DIAGNOSTIC input, NOT a shipping gate).** **For a `.swift` target:** `/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json <target> 2>&1` (per the routing rule). **Otherwise (web):** `node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <target> 2>&1`. Both: **exit 2 = dirty** (findings present), **exit 0 + `[]` = clean** — key the read off the exit code. Each finding is `{antipattern, name, description, file, line, snippet}`. Incorporate as a report signal. (`npx designcheck` is NOT a published package — use the local entry above.) For rendered-DOM / rendered-view checks (actual alignment pixels, measured contrast), note what's outside static-scan scope and recommend pairing with the Chrome DevTools path (web) or a simulator screenshot review (`.swift`) if depth is needed.

**Assessment C — Persona red-flags from the hub's `interfaces-that-feel` spine.** Use the persona table. Auto-select 2-3 personas relevant to the project's register (from `.claude/PRODUCT.md` if present, else the hub's global register). For each, walk through the primary user action and list specific red flags the design presents to them.

Produce a scored critique with:
- Quantitative score per assessment.
- Specific issues with file:line references.
- Source citation for each finding (rant/preference/voice-anchor/persona).
- Actionable prioritized fixes.


## Parallel hygiene track

The detector run in Assessment B already represents the deterministic hygiene track. If the project also has `scripts/audit-design.sh`, optionally include its findings as a third parallel hygiene signal alongside the detector:

```bash
bash {current-project}/scripts/audit-design.sh
```

These hygiene tracks run **in parallel** to the LLM design review (Assessments A + C). Neither biases the other. The human reads all three reports and decides. None gates shipping; `/design-critique` is a diagnostic surface, not a shipping gate.

## Handback

Ask: "Returned to bench. Anything here you'd rant about?"

If the user responds, append to `{current-project}/.orca/design-rants-pending.md`:

```
## YYYY-MM-DD HH:MM — design-critique
[user's response verbatim]
```

Create `.orca/` in the project if absent. Pending entries are swept later via `/impeccable --extract rants`.
