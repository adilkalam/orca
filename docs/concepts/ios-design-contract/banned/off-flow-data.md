# Banned: Off-flow data — surfacing information the flow doesn't own

> **Provenance.** iOS-authored, **owner-instructed** — distilled 2026-07-06 from the verbatim
> legacy ledger `peptidefox-ios/.orca/design-rants-pending.md` (round 4, two-vial result ruling).
> **No detector rule** — flow-ownership is not AST-detectable; the lane binds this as a FORBIDDEN
> constraint and the **validator judges it**.

## The verbatim register

> "Don't randomly introduce frequency into the flow, it has nothing to do with it."

The context: a two-vial *mixing* result rendered its column headers as
`"BPC-157 / 250 µg · daily"` — importing dosing *schedule* (a ProtocolTracker concept) onto a
reconstitution surface that computes BAC water and syringe draw. The frequency was true, adjacent,
and completely off-task.

## The refusal

**A surface shows only what its flow computed or consumed.** Every datum on screen must trace to
the flow's own inputs or outputs. Data imported from a neighboring domain "for context" — a
schedule on a mixing result, inventory counts on a dose editor, protocol metadata on a calculator
ledger — makes the surface harder to read ("Its legit hard to see whats what") and dilutes the
one answer the user came for.

The tell is always the same: the datum is *true* and *related*, which is exactly why it sneaks
past review. The test is not "is this relevant to the user?" — it is "did THIS flow produce or
require it?" If not, it belongs to the surface that owns it, one navigation away.

## The positive move

When a cross-domain datum genuinely helps, the fix is a *link to* (or an entry point into) the
owning surface — never an inline copy of its data. Recaps of the flow's OWN earlier inputs are
the opposite of this ban and are sanctioned (see `preferences/dosing-surface-conventions.md` —
the vial-mix recap exists so the user never re-navigates to verify their entry).

## When the refusal is overridden

Only by the owner's explicit instruction for a named surface. Never invent the exception.
