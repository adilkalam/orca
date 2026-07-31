# Extract Aesthetic Flow

Invoked via `/impeccable --extract aesthetic`. Sweeps project-local pending
aesthetic-capture entries into the global design-contract collection, under the
owner-gated capture protocol (`~/.claude/docs/reference/design-lane.md`
§Aesthetic capture).

## Preconditions

- A pending ledger exists at the current project's `.orca/aesthetic-pending.md`.
- ALSO read the legacy ledger `.orca/design-rants-pending.md` if present —
  older sessions wrote there; both feed the same sweep.
- If neither file exists, report "no pending aesthetic entries" and exit.

## Flow

### Step 1 — Read pending entries

Read `{current-project}/.orca/aesthetic-pending.md` (and the legacy
`.orca/design-rants-pending.md` if present). Entries are blocks of the form:

```
## YYYY-MM-DD HH:MM — [verb-name]
[owner's words verbatim]
```

Parse into a list. If both files are empty or malformed, report and exit.

### Step 2 — Categorize each entry (owner approves)

For each entry, present it to the owner verbatim and ask which banned category
it belongs to. Existing categories under
`/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/banned/`:

- `fonts.md`
- `colors.md`
- `gradients.md`
- `motion-suddenness.md`
- `chamfered-buttons.md`
- `generic-ui-defaults.md`
- `alignment-spacing.md`
- `rounded-corners.md`
- `skeuomorphism.md`
- `typography-mono.md`
- `uniform-tile-layout.md`
- `css-architecture.md`

The owner may also choose "new" and name a new category file
(`banned/{new-name}.md`), or "preference" (the positive catalog), or "drop"
(the entry does not become a rule).

### Step 3 — Propose the exact entry, wait for approval, then append

For each categorized entry, compose the EXACT text to be appended and show it
to the owner for approval BEFORE writing (the owner-gated protocol — nothing
lands without his sign-off). The entry carries the schema from
`~/.claude/docs/reference/design-lane.md` §Aesthetic capture:

```
---

## YYYY-MM-DD — [verb-name]

[owner's words verbatim]

Scope: <the context it was said in — project / feature / component; global ONLY on explicit owner say-so>
Severity: P0 | P1 | advisory
```

Keep the owner's words verbatim — never paraphrase. No dramatization: no
"sins", no emotional-state annotations, no all-caps editorial headings —
severity lives in the enum, not in prose. On approval, append to
`/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/banned/{category}.md`.
If the category file does not yet exist, create it with a minimal header
derived from the name.

### Step 4 — Clear or archive the pending file(s)

After all approved entries are appended, either:

- Delete the swept ledger(s), OR
- Rename to `{current-project}/.orca/aesthetic-archived-{YYYY-MM-DD}.md`
  (safer — keeps a local audit trail).

Prefer rename unless the owner asks for deletion. A swept legacy
`design-rants-pending.md` is archived the same way (do not leave it behind to
be re-swept).

### Step 5 — Remind to deploy, and disclose

Remind the owner to run the rsync deploy so the updated banned catalog reaches
`~/.claude`:

```
rsync -av --exclude='*archive*' --exclude='*deprecated*' \
  /Users/adilkalam/ORCA-OS/docs/ ~/.claude/docs/
```

Without this, the global catalog is updated in the source tree but skills that
load from `~/.claude/docs/concepts/design-contract/` will not see the new
entries.

End the handback with the session-end disclosure: a one-line list of every
aesthetic entry written and where (design-lane.md §Aesthetic capture).

## Write-path constraints

- Never write directly to `~/.claude/docs/...`. Always write to the
  ORCA-OS source tree (`/Users/adilkalam/ORCA-OS/docs/...`). The rsync step
  propagates to `~/.claude`.
- Never write global aesthetic content to `{current-project}/.claude/`. Project
  aesthetic.md holds project-scoped commitments, not the global banned catalog.
- Never append without the owner's approval of the exact entry text.
