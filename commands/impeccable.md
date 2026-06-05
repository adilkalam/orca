---
name: impeccable
description: "Create distinctive, production-grade frontend interfaces and keep ANY front-end work out of AI-slop territory. DEFAULT MODE IS FLAG-FREE — `/impeccable clean up the UI on the pricing page` classifies the request and runs it through the design lane, no flag needed. Flags for specific flows: --craft (shape-then-build a NEW feature), --teach (set up project strategic context), --document (generate visual contract), --extract (pull tokens/components; add 'rants' subarg to sweep captured rants). Loads the impeccable hub skill (the register) and runs the shared design lane."
argument-hint: "<freeform request, e.g. 'clean up the UI on the pricing page'> | --craft <feature> | --teach | --document | --extract [rants|<target>]"
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# /impeccable

This command is THIN. The durable design knowledge lives in ONE place — the `impeccable-hub` skill — and
the bind→build→validate→branch sequence lives in ONE place — the shared design lane. This file does two
things only: **load the hub** and **route flags** (invoking the lane for build work). It carries **zero
copies** of rants / voice-anchors / preferences / aesthetics rules (`#POISON_PATH` re-inlining — those
were deleted from here on 2026-06-03 and now live in the hub + `docs/concepts/design-contract/`).

## Load the hub (every invocation)

`Skill("impeccable-hub")` — the single home for the register: the `interfaces-that-feel` felt-state spine,
the 17 voice anchors, the rants (refusals), the preferences (positive moves), and the detector contract.
The hub **points to** the canonical refs under `~/.claude/docs/concepts/design-contract/` and
`~/.claude/docs/concepts/impeccable-reference/`; read those when you reach for the corresponding move.
Loading the hub is what ends the repetition tax — the rules are present by construction, not re-stated.

## Parse flag

Accepted flags:
- `--craft "<feature>"` — shape-then-build a feature, with /shape interview + reference-comp pick, then
  the shared design lane. See §--craft Flow.
- `--teach` — populate per-project `.claude/PRODUCT.md` (strategic context). Hands off to `--document`
  for DESIGN.md. See §--teach Flow.
- `--document` — handled by the dedicated `/document` command. Generates `.claude/DESIGN.md` (Stitch-spec
  visual contract). Reachable as `/impeccable --document` (alias) or `/document` directly.
- `--extract` — pull reusable tokens/components into the design system. See §--extract Flow.
- `--extract rants` — sweep `{project}/.orca/design-rants-pending.md` into the global rants collection.

If no flag: enter **Default mode (freeform)** — classify the request and route it through the lane (see §Default mode below). Do NOT just dump the flag list and stop; the everyday entry is flag-free. Only print the flag list if the request is empty or you genuinely cannot classify it.

---

## Default mode (no flag) — freeform, run-on-anything

The everyday entry. `/impeccable <whatever you want done>` — e.g. `/impeccable clean up the UI on the pricing page`, `/impeccable the dashboard header feels sloppy — fix it`, `/impeccable build a settings panel`. No flag required; the hub is already loaded, so the register binds regardless.

**1 — Classify the request** into one route. State the classification in one line so the user can redirect, then proceed — do NOT stop to ask unless it is genuinely ambiguous:

| Request is… | Route |
|---|---|
| improve / fix / clean up / polish / restyle / tighten an **existing** page or component | **improve-existing** → run the lane on that target (step 2) |
| build / create / add a **new** feature, page, or component | **build-new** → the `--craft` flow (shape → comp → lane) |
| set up / "teach the brand" / there is no `PRODUCT.md` or `DESIGN.md` | **setup** → `--teach` then `--document` |

If you genuinely cannot tell whether the target already exists, ask ONE question, then proceed.

**2 — improve-existing (the common case): run the shared lane on the existing target.**

1. **Resolve the target** file(s) from the request (the page/component path). If unclear, ask once.
2. **Read the project contract if present** — `{project}/.claude/PRODUCT.md` + `DESIGN.md`. **If absent, do NOT block** — run on the hub's global register (the rants + preferences + voice-anchors still prevent slop) and note once: *"No project contract found — running on the global register; run `/impeccable --teach` to make this project-specific."* Frictionless on any project is the point.
3. **Run the lane** (`~/.claude/docs/reference/design-lane.md`): **BIND** the FORBIDDEN/FORWARD constraints this target can trip (hub §3 rant→detector map + the page's actual content) → **BUILD** via `Agent(design-builder)`, tasked to *improve the existing file in place* under the bound ids (carry the user's critique verbatim) → **VALIDATE** via `Agent(design-validator)` (fresh context) → **BRANCH** (PASS hands back; BLOCK loops the builder with the findings, MAX N=2, then escalates).
4. **Close** with the rant-capture handback.

No `/shape` interview for improve-existing — the page already exists; the task is improvement, not net-new discovery. That is why this path is lighter than `--craft`. (If the user then iterates element-by-element on the result, that is in-thread refinement — FR-6 — carry their critique verbatim into the builder.)

**3 — build-new** → run the `--craft` flow (§--craft Flow). **setup** → `--teach` / `--document`.

---

## The shared design lane (how build work runs)

All artifact-producing work (`--craft`, and any future build verb) runs through the **one shared lane**,
defined once at **`~/.claude/docs/reference/design-lane.md`** — never re-described here (`#POISON_PATH`
duplication). The lane is: the orchestrator (this main thread) **binds** typed FORBIDDEN/FORWARD
constraints via a cognition `checkpoint` and records the returned ids to
`{project}/.orca/orchestration/phase_state.json → planning.bound_constraint_ids`; spawns
`Agent(design-builder)` to produce the artifact under those ids; spawns `Agent(design-validator)` (fresh
context) which returns `GATE_VERDICT: PASS|BLOCK`; **branches** — PASS hands back, BLOCK loops the
builder with the findings, **MAX N=2**, then escalates to the user.

The orchestrator NEVER grades its own output (the validator is a separate fresh agent). Skipping the bind
⇒ no bound ids ⇒ the validator returns `BLOCK: no bound constraints`. `/live` element-by-element
iteration and mid-build critique stay **in-thread** (FR-6) — carry the user's critique verbatim into the
builder prompt. Read the lane file for the full step-by-step.

> **Status (2026-06-03):** the lane's agents (`design-builder`, `design-validator`) are authored but a
> new agent is not spawnable until a Claude Code session reload — the lane is **built, pending
> post-reload live proof.** Until then, build work may run in-thread under the bound constraints, with
> the detector run as the named-slop floor at handback.

**The honest ceiling:** the lane raises the floor (rules present, adjudication external, no named slop)
but does **not** manufacture taste — the validator's judgment + **the user's eye** is the taste ceiling.

---

## Flag Handlers

### --craft Flow

Invoked as `/impeccable --craft "<feature description>"`.

Follow the craft flow at `~/.claude/docs/concepts/impeccable-reference/craft.md`. Pass the feature
description as input.

**Required preconditions (the hub §7 lists these too):**
1. `PRODUCT.md` is loaded (strategic context — register, users, anti-references, principles). If missing,
   route to `/impeccable --teach` first.
2. `DESIGN.md` is loaded (visual contract — colors, typography, components, Do's-and-Don'ts). If missing,
   route to `/impeccable --document` first.

**Mandatory step before code: /shape.** Every `--craft` runs the `/shape` discovery interview first — 3
rounds, 2-3 questions per round, even when PRODUCT.md and DESIGN.md are present. It captures per-feature
commitments (job-to-be-done at this moment, felt-state at this point, decisive ingredient list) that
PRODUCT.md alone cannot provide. Skipping /shape is the most common failure mode of /craft. Do not skip.

**Mandatory step before code: visual direction comp pick.** After /shape, generate **1-3 high-fidelity
reference comps** from the shape brief (composition, hero, motifs, density, color treatment). The user
picks one. The chosen comp's visible ingredients become the visual contract for the build. **Code is
step 4 of 6, never step 1.** Skipping the comp pick regresses /craft into "generate code from rules" —
the exact failure this system fails-fast on.

**Then run the shared design lane** (above / `design-lane.md`): bind the task-specific FORBIDDEN/FORWARD
constraints, build under them, validate with the fresh-context validator, branch (N=2 → escalate). The
chosen comp's ingredients + the /shape commitments feed the builder prompt; the user's mid-build critique
stays in-thread.

**Optional parallel hygiene check.** If the project has `scripts/audit-design.sh`, optionally run it
after the build:
```bash
bash {current-project}/scripts/audit-design.sh
```
It informs but does not gate — parallel mechanical hygiene (mono count cap, OT ligature disable, padding
math). The lane's validator is the hard FLOOR; the user's eye is the taste CEILING. If the user critiques
the output, escalate to `/recraft "<critique>"`.

### --teach Flow

Invoked as `/impeccable --teach`. **Writes PRODUCT.md only** (strategic context). Hands off to
`/impeccable --document` for DESIGN.md (visual contract).

The user already has an established design register — this flow is NOT discovery-from-zero. It is
project-narrowing from the established register, framed as Impeccable's structured discovery interview (3
rounds, 2-3 questions per round). Reference: https://impeccable.style/docs/teach

**Step 0 — Announce what's already loaded.** Before asking anything, print a short summary so the frame is
visible. The register is already present via the hub (the user does not re-state it): the 17 voice
anchors, the rants as automatic refusals (colors / fonts / gradients / motion-suddenness /
chamfered-buttons / generic-ui-defaults / alignment-spacing / rounded-corners / skeuomorphism), the
preferences as positive catalogs (22-font catalog, non-uniform type scale, typography spacing junctions,
optical alignment rules, motion references), and the 7 core principles. Then state: "I'll write
PRODUCT.md (strategic — register, users, anti-references, principles, accessibility — NO colors/fonts/
pixels). For DESIGN.md (the visual contract), run `/impeccable --document` next."

**Step 1 — Scan the codebase.** Read README/docs (purpose, audience, goals), package.json/config (stack,
existing design libs), existing components (patterns, spacing, type in use), brand assets, design tokens/
CSS variables, any style guides. Note what you learned, what's unclear, and any existing choice that
conflicts with the register (flag those for the user).

**Step 2 — Run the structured discovery interview (3 rounds).** Only ask what the register + codebase
scan cannot answer. Reference: https://impeccable.style/docs/teach

- **Round 1 — Identity & users:** (1) project identity in one sentence; (2) register — "brand" or
  "product" (Stitch-spec convention); (3) sub-register descriptor (editorial / technical-research /
  clinical-commerce / brutalist / luxury-refined / playful-toy / industrial-utilitarian / other).
- **Round 2 — Brand personality & principles:** (1) three adjectives + one sentence on emotional goals;
  (2) 3-5 strategic design principles (NOT visual — "expert confidence" yes, "use OKLCH" no); (3) voice
  & tone in one paragraph.
- **Round 3 — Anti-references & accessibility:** (1) anti-references AS NAMED BRANDS/PRODUCTS (e.g.
  "Linear's task UI", "Klim Type Foundry specimen pages") — NOT adjectives like "boring"/"AI slop"
  (those are global rants); (2) project-scoped refusals AND reversals (e.g. peptidefox refuses
  medical-orange; a technical-research project may reverse the Geist refusal); (3) accessibility &
  inclusion stance (one paragraph of intent, not implementation rules).

Do NOT ask in /teach (these belong in /document): specific font picks, palette OKLCH values, spacing
scales, radius tokens, component prop specifics.

**Step 3 — Populate PRODUCT.md.** Read the template `~/.claude/docs/concepts/design-contract/product-template.md`,
copy to `{project}/.claude/PRODUCT.md` (create `.claude/` if missing), fill from the Step 2 answers +
scan: Register (bare "brand"/"product"), Users, Product Purpose, Brand Personality, Anti-references
(SPECIFIC named brands), Design Principles (strategic), Accessibility & Inclusion (intent).

**Step 4 — Hand off DESIGN.md to /impeccable --document.** PRODUCT.md carries no visual tokens. Prompt:
"PRODUCT.md is written. Run `/impeccable --document` next to generate DESIGN.md (colors, typography,
components, Do's-and-Don'ts in Stitch spec)." The two-file split is load-bearing: PRODUCT.md changes when
register/audience changes (rare); DESIGN.md changes when visual tokens change (more often).

**Optional project utility — audit-design.sh.** Offer (do NOT mandate) to deploy `scripts/audit-design.sh`
from `/Users/adilkalam/ORCA-OS/templates/audit-design.sh` — a mechanical hygiene checker that informs but
does not gate. Also create `{project}/.orca/design-rants-pending.md` as an empty capture ledger (used by
every design command's rant-capture at handback; swept via `/impeccable --extract rants`):

```markdown
# Design Rants — Pending

Project-local capture ledger. Design commands append verbatim user critiques here at handback. Sweep
periodically via `/impeccable --extract rants` to fold into the global rant catalog.

Format per entry:

## YYYY-MM-DD HH:MM — /<command>
<user's rant, verbatim>

---
```

**Step 5 — Summarize and hand back.** Confirm completion, print a 5-line summary of what was written to
`.claude/PRODUCT.md`, remind the user to run `/impeccable --document` next, then ask the rant-capture
question at handback (see §Closing handback).

### --extract Flow

Invoked as `/impeccable --extract [<target>]`. If target is `rants` → see §--extract rants.

Otherwise follow the extract flow at `~/.claude/docs/concepts/impeccable-reference/extract.md` to pull
reusable components/tokens into the project design system.

**Optional parallel hygiene check.** If the project has `scripts/audit-design.sh`, optionally run it on
the extracted artifacts (informs, does not gate). If the user critiques the output, escalate to
`/recraft "<critique>"`.

### --extract rants Flow

Invoked as `/impeccable --extract rants`. Sweeps project-local pending rants into the global catalog.
Follow the full flow at `~/.claude/docs/concepts/impeccable-reference/extract-rants.md`. High-level:

1. Read `{current-project}/.orca/design-rants-pending.md`.
2. For each entry, prompt the user to pick a category: `fonts`, `colors`, `gradients`,
   `motion-suddenness`, `chamfered-buttons`, `generic-ui-defaults`, `alignment-spacing`,
   `rounded-corners`, `skeuomorphism`, or new.
3. Append the entry to `/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/rants/{category}.md` with
   a timestamp.
4. After all entries are processed, archive or delete the pending file.
5. Remind the user to rsync: `rsync -av /Users/adilkalam/ORCA-OS/docs/ ~/.claude/docs/`.

---

## Closing handback (rant-capture)

After completing any /impeccable flow AND clearing the lane's validator (for build flows), ask the user
verbatim:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append to `{current-project}/.orca/design-rants-pending.md`:

```
## YYYY-MM-DD HH:MM — impeccable
[user's response verbatim]
```

Create `.orca/` in the project if absent. Do NOT write to `~/.claude/` or ORCA-OS source directly.
Pending entries are swept later via `/impeccable --extract rants`.

**Escalation path.** If the user critiques the output, escalate to `/recraft "<critique>"` — a thin
coordinator that classifies scope (single element / whole feature / contract failure) and routes to
`/live` / re-shape+re-craft / re-teach+re-document. It does NOT regenerate code from rules.
