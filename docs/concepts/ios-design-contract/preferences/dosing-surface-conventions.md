# Preference: Dosing-surface conventions (PeptideFox brand law)

> **Provenance.** **Owner-instructed, app-specific** — distilled 2026-07-06 from the verbatim
> legacy ledger `peptidefox-ios/.orca/design-rants-pending.md` (the /ios-impeccable rounds 2–4 dose-flow
> rulings); items 11–15 added 2026-07-07 from the phone-testing-prep rulings (same ledger). This
> file is PeptideFox brand law for calculator / wizard / manual-mode dose surfaces AND the
> Tracker — NOT generic iOS guidance (same scope stance as the detector defaults: this brand's law).
> Where a convention names a shipped pattern, the shipped code on `peptidefox-ios` `dev`
> (post-`77a8d33`) is the visual reference.

## The conventions

1. **µ symbol always.** Micrograms render as **µg** — never "mcg", never "ug" — everywhere a
   microgram unit appears (inputs, dropdowns, ledgers, recaps). Owner: "all mcg should be
   represented w the symbol (like ug, but the actual symbol)."
2. **Unit dropdown at every dose entry.** Every dose input carries the mg ⇄ µg dropdown — even
   when the default unit would suffice: "even if no change, thats a better UI for the units."
3. **Ratio-locked pairs: recap + lock glyph, one-sentence prompt.** For ratio-locked dose flows
   (Wolverine, custom cocktails, 1:1 blends): the prompt is one sentence; the **🔒 glyph sits
   beside the vial-mix recap** (never the words "ratio locked" — `banned/prompt-verbosity.md`);
   the recap renders as a **label above the compound inputs** (font unchanged from label tier).
   The recap is mandatory — the dose step always shows the entered vial sizes so the user never
   navigates back to verify ("We shouldn't add that cognitive burden").
4. **Section labels left-aligned above the input column.** PER INJECTION and its siblings sit
   above the inputs, left-aligned — never right-aligned, never beside the rows. Compound names
   render slightly larger than the label tier.
5. **Dose entry is side-by-side where the vial mix is stacked.** The two entry surfaces must be
   visually distinct at a glance: stacked rows = vial mix; side-by-side pair = per-injection dose.
6. **Converged dual-option ledgers fill "Smaller injection."** When Easier-draw and
   Smaller-injection compute equal, the filled column is **Smaller injection** (the other
   em-dashed): "Its not an easier draw in that case, its limited to being a smaller one because
   of the selected dose vs. the vial size." Applies across every flow.
7. **Doses-per-vial is part of every output.** All manual-mode / calculator result ledgers
   include the doses-per-vial line.
8. **Secondary derived values are the compact bordered caption.** A derived companion value
   (volume to inject alongside syringe units) renders as the compact caption —
   `"0.5 mL draw · 2.00 mg/mL"` — never promoted to a second hero row. Applies to all outputs
   where a secondary value exists.
9. **Equal-rank data rows share one type tier, and carry labels.** DOSE and CONCENTRATION on a
   result ledger render in the SAME font/weight, each with its label; compound column headers in
   ink (`textStrong`), not muted grey — the headers are the identity of the column and must be
   the most visible text in it.
10. **Thymosin naming is per-stack.** GLOW/KLOW display "TB-4"; Wolverine displays "TB-500"
    (same compound id `tb500`). Never blanket-rename.

## The 2026-07-07 additions (owner rulings during phone-testing prep)

11. **The unit zone lives INSIDE the input box.** The register is
    `DesignSystem/Components/UnitDropdownControl` consumed flush to the box's right inner
    edge behind a 1pt left hairline divider (see `WizardCustomEntryRow` for the reference
    anatomy): **more than one legal unit → the compact popover dropdown; exactly one legal
    unit → the static locked label in the same zone.** Never a separate segmented control
    beside the box, never a floating suffix outside it ("mL" hanging in space). The unit is
    display/entry level: the stored scalar keeps one canonical unit, converting at the
    binding boundary — presets, validation, and solver math never see the display unit.
12. **Figure + unit read as ONE readout.** In readout boxes (the dose-edit DRAW), the unit
    caption hugs the numeral (`xxxs` gap in a nested stack), while the box's field-label key
    keeps its own register above ("bring 'units' closer to the number"). The readout hero is
    `resultHero` = **36pt** (tuned down from 40, still a clear step above `resultLarge` 32).
13. **Result-ledger opening hairline: faint tier, tight group.** The hairline above a result
    ledger renders on `hairlineSoft` (not `border` — "not so in your face") and sits `sm`
    from the ledger, tighter than the `lg` block rhythm around it.
14. **Tracker surface grammar.** The Tracker page renders one Dynamic Type step DENSER than
    the user's setting via a relative environment bias (never a hard clamp — the page must
    keep scaling; see `ProtocolTrackerView.oneStepDenser`). Column geometry is named
    constants (`TrackerCol`) shared by header and rows — the DOSE column carries +8pt
    leading-aligned surplus as the DOSE↔DRAW gap. Header affordances: auxiliary controls
    (the ⇅ reorder button) sit BETWEEN the title and the trailing chevron — **the chevron
    owns the trailing edge.**
15. **Sheet-hero titles sit one display tier below the page hero.** A peptide name heading a
    sheet (dose edit) uses `displayMedium` (36) — the display face is sanctioned there, but
    the 48pt `displayLarge` belongs to page heroes only. (The modal chrome itself follows
    `preferences/modal-grammar.md`.)

## Why it holds

The Calculator and ProtocolTracker are the core surfaces (CLAUDE.md §6.2) and the dosing numerals
are the product's hero moments. These conventions exist so every dose surface answers the same
question the same way — the user learns the grammar once. They were extracted from four rounds of
owner corrections that repeatedly converged on the same shapes; deviating from them re-litigates
settled law.
