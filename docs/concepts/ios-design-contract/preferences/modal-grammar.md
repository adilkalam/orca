# Preference: Modal grammar — swipe in/out, bottom SAVE, centered normal-size title

> **Provenance.** iOS-authored, **owner-instructed** — distilled 2026-07-06 from the verbatim
> legacy ledger `peptidefox-ios/.orca/design-rants-pending.md` (round 4: the edit-dose modal iterations
> 1–4 and the ProtocolFormSheet rulings). Ratified by iteration: the owner corrected these
> surfaces until they converged on this grammar, and the final forms passed his eye.

## The verbatim register

> "since its a modal, we don't need the cancel/save buttons at the top. It should be a swipe in
> and out, with a save button at the bottom."

> "[title in the large display size] uhh don't do that. Normal size for these, leave the large
> font for peptide names."

> "Okay, you can give it some breathing room by adding more top margin, and you can center it."

> "its confusing as to the fact that the baseline edit is for that day only — so we should add
> the date in small font up top, we should make it clear its for that day specifically."

> "the save vial toggle should be in line w the bac water below not just floating in space."

> "Move the 'this change applies' to sit above the save button actually."

## The grammar (every sheet/modal follows this)

1. **Dismissal is the swipe.** No top Cancel/Save toolbar, no top bar at all — the drag indicator
   and swipe-to-dismiss ARE the cancel affordance. Top-bar buttons on a swipeable sheet are
   duplicate chrome (`banned/redundant-chrome.md` tell #4).
2. **Commit is one bottom SAVE button.** Full-width, at the foot of the sheet.
3. **Title: normal text size, centered, with breathing room.** Top margin below the drag
   indicator. The display face is reserved for hero moments (peptide names) — never sheet titles.
   When a peptide name IS the sheet's hero (the dose editor), it renders `displayMedium` (36) —
   one display tier below the 48pt page hero (owner, 2026-07-07: "shrink the size of the
   compound title a little bit").
4. **Scope context in small font up top.** When the modal's effect is scoped (an edit that
   applies to one day), say so at the top in a small tag — e.g. the date — so the scope is never
   ambiguous.
5. **Toggles sit inline with their row, aligned to the field grid.** A toggle floats in space
   when it ignores the column rhythm of the fields below it; align it to that grid (shrink
   sibling controls if that is what clean alignment costs).
6. **Consequence copy sits directly above SAVE.** "This change applies to…" belongs immediately
   above the commit button — the last thing read before committing.
7. **Dividers only where sections genuinely separate.** Same hairline law as everywhere
   (`banned/redundant-chrome.md` tell #2).

## Why it holds

A modal is a focused interruption on a phone held one-handed (the mobile inversion, CLAUDE.md §4).
The grammar puts dismissal where the thumb already knows it (swipe), the commit where the thumb
ends (bottom), and the scope where the eye starts (top) — and spends zero chrome on anything else.
