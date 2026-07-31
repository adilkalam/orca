---
name: fortify
description: Light single-verb design tweak — harden, optimize, or polish — applied as one quick pass under a stated self-check. Use for small hardening/performance/finishing passes the user names directly ("harden this form", "polish this before I ship it", "make this faster").
---

# Fortify — light single-verb tweak

A lighter entry point for one named hardening verb, applied directly:

| Verb | Skill |
|------|-------|
| harden | `harden` |
| optimize | `optimize` |
| polish | `polish` |

If the user hasn't named one of these clearly, ask which one, rather than guessing.

## Run

1. Read `impeccable-hub` (register) and the matching verb skill (craft). Felt-state framing is especially load-bearing for `harden` — design for someone having a bad day, not the happy-path ideal user.
2. **Bind** — before editing, name the specific risk this verb-on-this-target has and the specific obligation the result must meet.
3. **Work** — edit under those constraints, applying the user's own critique language verbatim wherever they've given it.
4. **Self-check** — walk the result against `impeccable-hub/resources/detector-rules.json`'s BLOCKING list. Fix anything you find before calling it done.
5. If a fix genuinely doesn't resolve after two honest attempts, stop and tell the user what's still wrong.

## Closing

Ask: "Anything here you'd push back on, or want done differently next time?"
