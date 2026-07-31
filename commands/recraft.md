---
name: recraft
description: "Thin coordinator for redo/recraft case. Classifies scope (single element / whole feature / contract failure) and routes to /live, re-shape+re-craft, or re-teach+re-document. Does NOT regenerate from rules. Captures critique to the project's pending aesthetic ledger."
argument-hint: "<critique or target> [+ optional screenshots]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Skill
  - AskUserQuestion
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# /recraft — Try-Again Coordinator

The redo command. **Thin coordinator, not generator.** When work fails the eye or the user critiques it, /recraft classifies the scope of the problem and routes to the appropriate downstream flow. It does NOT generate replacement code itself.

The prior version of this command framed redo as a CI/TDD-style script loop: grep against audit rules, fail-fast, regenerate. That framing is wrong. Design has unbounded combinatorics — no rule list can enumerate every failure mode, so no script can serve as a binding gate. Taste binds through human selection at structured points (shape interview, visual-direction comp pick, /live variant accept), not through ever-larger rule lists. /recraft now reflects that.

Use `/recraft` when:
- A `/impeccable --craft` output failed visually and the user is dictating what's wrong
- An existing UI is being torn out and rebuilt rather than refined
- A `/refine` pass produced more work than refinement and you're starting over
- The user said any variant of "redesign / try again / this sucks / start over"

Use `/refine` when:
- The current implementation is roughly right and you want a single-flag pass over it
- The work is additive, not subtractive

## Load the hub + read the contract (every invocation)

`Skill("impeccable-hub")` — the single home for the aesthetic (the `interfaces-that-feel` felt-state spine, the voice anchors, the banned rules as refusals, the preferences as positive moves, the detector contract). Loading the hub is what binds the aesthetic by construction; this file carries **zero copies** of those rules (`#POISON_PATH` re-inlining).

Then read `{current-project}/.claude/PRODUCT.md` (strategic) and `{current-project}/.claude/DESIGN.md` (visual) — both are cited in scope classification. Both files are required; if either is missing, route to `/impeccable --teach` or `/impeccable --document` before continuing.

## The shared design lane (how UI-producing rebuilds run)

The UI-producing routes below (Route A → /live, Route B → re-shape + re-craft) run through the **one shared lane**, defined once at **`~/.claude/docs/reference/design-lane.md`** — never re-described here (`#POISON_PATH` duplication; copy-pasting the lane's steps is exactly what bloated this file). The lane is: the orchestrator (this main thread) **binds** typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint` and records the returned ids to `{current-project}/.orca/orchestration/phase_state.json → planning.bound_constraint_ids` → spawns `Agent(design-builder)` to produce the artifact under those ids → spawns `Agent(design-validator)` (fresh context) which returns `GATE_VERDICT: PASS|BLOCK` → **branches** (PASS hands back; BLOCK loops the builder with the findings, **MAX N=2**, then escalates to the user).

**recraft-specific bind input:** when binding for Route A or B, **fold the just-captured verbatim critique** (Step 1, below) into the bind as task-specific FORBIDDEN constraints — the named failures the rebuild must not repeat — plus FORWARD obligations derived from the critique + the aesthetic. Skipping the bind ⇒ no bound ids ⇒ the validator returns `BLOCK: no bound constraints`. The orchestrator NEVER grades its own output. **Route C produces NO UI artifact** (it edits PRODUCT.md/DESIGN.md) and therefore runs **no build lane** — see Route C.

## Step 1 — Capture the critique BEFORE doing anything else

Append the verbatim user critique to `{current-project}/.orca/aesthetic-pending.md` with a timestamp:

```markdown
## {ISO-8601 timestamp} — /recraft (intake)

{user's critique, verbatim}
```

Create `.orca/aesthetic-pending.md` if missing (sweep tools also read the legacy `.orca/design-rants-pending.md` if present). **Never paraphrase.** Verbatim language is load-bearing for downstream `/impeccable --extract aesthetic`. Note attached screenshot paths inside the same entry — do not analyze them yet (that's part of the rebuild, not the intake).

## Step 2 — Classify the scope (load-bearing — this is the routing decision)

Ask the user **one** AskUserQuestion to classify scope. Three options:

- **A — Single-element issue.** "One panel, one component, one typography moment — you want to iterate on a specific piece in the browser."
- **B — Whole-feature redo.** "The entire feature missed; the existing PRODUCT.md / DESIGN.md contract is correct but the build didn't honor it."
- **C — Contract failure.** "PRODUCT.md or DESIGN.md themselves are the problem — the contract failed me."

Wait for the user's answer. Do not guess. The route depends on this answer.

## Step 3 — Route to the appropriate flow

### Route A — Single-element /live flow (UI-producing → runs the lane)

The right flow for one panel / one component / one typography moment. /recraft is a coordinator here:

1. Identify the target element (file:line range, component name, or browser-pickable selector).
2. Hand off to the **element-by-element variant flow**: pick element in browser → annotate intent (the user's critique becomes the intent) → generate three on-brand variants in HMR → user picks one → write back to source.
3. Variants stay on-brand by default (read DESIGN.md tokens, PRODUCT.md principles). Departure is rare and explicitly triggered by the user.
4. Cycle: if none of the three variants land, capture why, generate three more.
5. On accept, write back to source and return.

This flow does NOT regenerate the whole component or page. It iterates on the **specific** element the user named. Per FR-6, `/live` element-by-element iteration stays **in-thread** — carry the user's critique verbatim into the builder; the bind → build → validate → branch lane (above / `design-lane.md`) governs the produced artifact at accept.

### Route B — Whole-feature re-shape + re-craft

The right flow when the existing contract is correct but the build missed. /recraft coordinates:

1. **Re-run `/shape` interview** anchored on the failed feature. Three rounds of structured discovery (job-to-be-done at this moment in the flow, felt-state of user, decisive ingredient list). Do NOT skip — even if the prior /craft already ran a shape pass, the critique reveals the prior shape missed something.
2. **Re-run `/craft`** with the new shape brief. Generate **1-3 high-fidelity reference comps** (composition, hero, motifs, density, color treatment). User picks one.
3. The chosen comp becomes the visual contract. Code is built to match via the shared lane (above / `design-lane.md`): bind the task-specific FORBIDDEN/FORWARD (folding the captured critique) → build under the bound ids → validate with the fresh-context validator → branch (N=2 → escalate). Code is step 4 of 6 — never step 1.
4. On completion, browser inspection. If the user has further critiques, they're scope-A (route to /live) or scope-C (contract failure → /teach + /document re-entry).

This flow honors the actual Impeccable model: visual direction precedes code; reference comp pick is the binding step; the comp's visible ingredients are the contract.

### Route C — Contract failure (re-teach + re-document — NO UI artifact, NO build lane)

The right flow when PRODUCT.md or DESIGN.md themselves are wrong. **Route C produces NO UI artifact — it edits the contract files only — so it runs NO build lane** (nothing to build, nothing to validate). /recraft coordinates:

1. **Identify which file is wrong.** Ask the user: PRODUCT.md (strategic — register, users, anti-references, principles)? DESIGN.md (visual — colors, typography, components, Do's-and-Don'ts)? Or both?
2. **Route to `/impeccable --teach`** for PRODUCT.md re-entry on the affected sections. The teach flow runs the structured discovery interview again (3 rounds, 2-3 questions per round) for the affected sections only.
3. **Route to `/impeccable --document`** for DESIGN.md re-entry. Same — only the affected sections, not a full rewrite.
4. On completion, the contract is updated. The user can then re-run /craft against the new contract (which runs the lane).

This is the most expensive route. It exists because contracts get things wrong sometimes, and the fix is updating the contract — not re-running /craft against an already-wrong contract.

## Step 4 — Verification (the shared lane's validator does the gating)

The rebuilt artifact is gated by **the shared design lane** (above / `~/.claude/docs/reference/design-lane.md`), not by a verifying gate re-described here. For the UI-producing routes (A, B) the lane already ran bind → build → validate → branch; the `design-validator` (fresh context) is the hard FLOOR — it runs the local detector (`node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js`), maps findings to the bound FORBIDDEN ids, judges the FORWARD obligations, and returns `GATE_VERDICT: PASS|BLOCK`. BLOCK loops the builder (MAX N=2, then escalate). The orchestrator never grades its own output; an empty `planning.bound_constraint_ids` means the bind was skipped and the validator returns `BLOCK: no bound constraints`. **Route C runs no lane and no validator** (no UI artifact — contract edit only).

**Optional parallel hygiene check (UI-producing routes only).** If the project has `scripts/audit-design.sh`, optionally run it after the lane:

```bash
bash {current-project}/scripts/audit-design.sh
```

Post the summary inline. **The `audit-design.sh` script informs but does not gate.** It catches mechanical hygiene (mono count cap, OT ligature disable, border-padding compensation, etc.); it does NOT catch taste. The lane's validator is the hard FLOOR; the user's eye is the taste CEILING. If the audit fires AND the user agrees, feed it back into the routed flow as additional input. If the user disagrees, the audit is wrong for this case (rare; document the exception in a code comment). If the project has no `scripts/audit-design.sh`, skip this step.

## Step 5 — Closing handback

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.

## Refusals (explicit)

This command refuses to:

- **Grep against audit rules and rebuild the whole page from rules.** That's the prior version's wrong shape. Design's combinatorics are unbounded; rules cannot enumerate every failure mode.
- **Skip the scope classification step.** All three routes look superficially similar. Without the user's classification, /recraft regresses into "regenerate code from rules," which is the wrong shape.
- **Bypass the visual-direction-comp generation step on Route B.** /craft without reference comps is "generate code from rules" with extra ceremony. The comp is the actual binding step; skipping it produces output that violates the contract while passing every script check.
- **Use the audit-design.sh script as the closing gate.** The audit runs as parallel hygiene if invoked — it is not the gate. The gate is the shared lane's `design-validator` (fresh context): the detector + the validator's judgment against the bound ids is the hard FLOOR (it refuses named slop and P0s), and the user's eye is the taste CEILING above that floor. A passing audit on a tasteless interface is a passing audit on a tasteless interface — the script catches mechanical hygiene, never taste.
- **Run without PRODUCT.md AND DESIGN.md both present.** Taste lives in both. /recraft routing depends on knowing which layer the failure is in.

## Failure mode notes

### Why CI/TDD-style script loops cannot bind design taste

The prior /recraft was structured as a CI/TDD loop: capture critique → grep against rules → regenerate code → run audit script as gate → fail-fast on violations. This is the wrong shape. Three reasons:

1. **Design has unbounded combinatorics.** Every new component, register, project, context, audience introduces failure modes that no rule list could have enumerated. Scripts work for problems with bounded specifications (typecheck a function signature, lint a syntax rule, regex an anti-pattern). Design is not such a problem.
2. **Rule lists become their own failure mode.** A 25-rule list catches 25 patterns. The 26th pattern — the one that actually broke the user's eye — is invisible to the script and gets shipped. The user's response is "your audit said it was fine, but it's wrong," which is exactly the case the script was supposed to prevent.
3. **Generation under script-pressure converges on script-passing-but-tasteless output.** The model learns to satisfy the rules and ship. The rules become the new taste — which is the worst possible outcome, because the rules are a lossy compression of taste.

The fix is not a smarter script. The fix is **human selection at structured points**:

- `/shape` 3-round discovery interview for new features → captures intent before generation.
- `/craft` 1-3 reference comp pick → user binds visual direction before code.
- `/live` element-by-element three-variants-pick-one → user binds iteration outcomes.

Scripts run **in parallel** to inform — they catch mechanical hygiene the eye might miss (alphabetic counts, OT ligature feature flags, padding compensation math). They do not gate, because they cannot gate taste.

### When /recraft escalates

If the user critiques the routed flow's output AND the critique names the same issue twice across two routes, the contract itself is wrong. Route to Route C (re-teach + re-document) explicitly. Do not loop on Route A or Route B against an already-wrong contract.

## References

- https://impeccable.style/docs/recraft (upstream)
- `~/.claude/docs/reference/design-lane.md` — the ONE shared bind → build → validate → branch lane the UI-producing routes run
- `~/.claude/quick-reference/design-fork.md` — flow map, "When craft fails", "Why scripts cannot bind design taste"
- `~/.claude/commands/impeccable.md` — /craft and /shape flows that /recraft routes into
- `~/.claude/commands/document.md` — /document flow that /recraft routes into for Route C
