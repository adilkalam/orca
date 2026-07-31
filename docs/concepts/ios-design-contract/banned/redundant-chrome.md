# Banned: Redundant chrome — double containers, orphaned hairlines, duplicate affordances

> **Provenance.** iOS-authored, **owner-instructed** — distilled 2026-07-06 from the verbatim
> legacy ledger `peptidefox-ios/.orca/design-rants-pending.md` (rulings from 2026-06-21 and the
> 2026-07-06 rounds). **No detector rule** — chrome judgment is contextual; the lane binds this
> as a FORBIDDEN constraint and the **validator judges it**. The double-container and
> orphaned-hairline tells recurred across sessions, so treat them as BLOCK at the validator.

## The verbatim register

> "the - / + toggle should not sit in the box. mirror [DOSE / SAVE VIAL INFO] instead."
> *(2026-06-21 — de-boxing the native Stepper)*

> "why is there a second back button at the bottom there?"

> "Why is there an adjust inputs button when theres a back button?"

> "for these sorts in the header — pick one or the other, either the standard sort icon that
> opens the dropdown, or the current sort that opens the dropdown. Both is weird."

> "Okay dude if we remove the 'your two vials' we obviously dont need the fucking hairline
> divider."

## The refusal — four tells

1. **Double containers.** A native interactive control (Stepper, Toggle) wrapped in a custom
   bordered box is chrome-on-chrome slop. **Native interactive controls sit BARE; only
   text-entry fields earn the `surfaceCard` box** (DOSE value, VIAL SIZE, BAC WATER). The
   control's own pill IS its container.
2. **Orphaned hairlines.** A divider that separated a header from content must die with the
   header. Hairlines are the brand's depth language (hairlines over shadows — CLAUDE.md §6.4),
   which makes it tempting to leave them everywhere; **every hairline must earn its place against
   the CURRENT layout.** After any element removal, re-audit the dividers that framed it.
3. **Duplicate affordances.** One action, one control. Two back buttons on one screen; a grey
   "Adjust inputs" button next to a Back button that does the same thing; a sort trigger showing
   the sort icon AND the current-sort label AND a chevron. Pick the single strongest affordance
   and delete the rest.
4. **Modal top bars.** Cancel/Save toolbar buttons on a sheet that already swipes to dismiss are
   duplicate chrome — the modal grammar is swipe in/out + one bottom SAVE
   (see `preferences/modal-grammar.md`).

## The discipline

Chrome earns its place the way copy does (`banned/prompt-verbosity.md` is the same law for words):
each container, divider, and control must do a job no sibling already does. The failure is
additive by nature — each redundant piece arrives with a local justification — so the check is
subtractive: for every bordered box, hairline, and button, ask what breaks if it goes. If the
answer is "nothing," it goes.

## When the refusal is overridden

A deliberate doubled affordance (e.g. an accessibility-motivated duplicate action) requires the
owner's explicit instruction for a named scope. Never invent the exception.
