# Banned: Prompt verbosity — multi-sentence hand-holding where the UI already speaks

> **Provenance.** iOS-authored, **owner-instructed** — distilled 2026-07-06 from the verbatim
> legacy ledger `peptidefox-ios/.orca/design-rants-pending.md` (the /ios-impeccable rounds 1–4 rulings).
> **No detector rule** — prose judgment is not AST-detectable; the lane binds this as a FORBIDDEN
> constraint and the **validator judges it**. Severity tracks what the owner cares about
> (Precedence §1, `docs/reference/design-lane.md`): he corrected this repeatedly in one session,
> so treat a violation as a BLOCK at the validator, not a taste note.

## The verbatim register (the owner's words — do not dilute)

> "this fucking verbosity....do a sweep. 'Confirm what's in your GLOW vial.' is sufficient. The
> UI/UX should speak for itself, we don't need fucking multiple sentences for every single step.
> Come the fuck on, its like I have to go through every single possible flow and explain the same
> shit repeatedly."

> "use your brain. Remove the words 'ratio locked' and move the actual lock icon to sit next to
> the vial mix."

> "Remove the (optional) from note, its implied."

> "stupid. Does not need 'your two vials' at all — instead, the compound names should be in black
> so they're fucking more visible and clear."

> "We don't need extra label for anchor dose — just close the gap between the heading and the
> input a little bit."

## The refusal — four tells

1. **Multi-sentence step prompts.** One sentence per step. The second sentence is always the UI's
   job — if the step needs it, the surface has a design gap (missing label, glyph, or hierarchy).
   Fix the surface; don't caption over it.
   - Wrong: `"Confirm what's in your GLOW vial. Edit any amount that differs."`
   - Right: `"Confirm what's in your GLOW vial."`
2. **Words where a glyph carries the meaning.** A state that a symbol communicates gets the
   symbol, placed on the thing it describes — never a spelled-out phrase in the prompt.
   - Wrong: prompt ends `"… Ratio locked 🔒"` (and wraps to a second line).
   - Right: the 🔒 glyph sits beside the vial-mix recap it locks. **Lock = glyph, not words.**
3. **Redundant qualifiers.** "(optional)" on a note field, "ANCHOR DOSE" over an input whose
   heading already says what it is. If the design implies it, the label repeating it is noise.
4. **Headlines that restate what the content shows.** "Your two vials." over a two-column vial
   ledger says nothing the columns don't. Delete the headline and *strengthen the content*
   (column headers in ink, not muted) — and re-audit the chrome the deletion orphans (see
   `banned/redundant-chrome.md`).

## The discipline

Every user-facing sentence on a flow surface must pay rent: it either instructs an action the UI
cannot show, or it goes. When you feel the urge to add a clarifying sentence, that urge is a
signal the layout/labeling failed — redesign the element instead. This is the iOS in-flow form of
the brand-voice law (copy on iOS is *tighter* than web — CLAUDE.md §5).

## When the refusal is overridden

Only the owner's explicit instruction licenses longer copy for a named step (e.g. a genuinely
safety-critical confirmation). Never invent the exception.
