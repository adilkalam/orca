# Extract Rants Flow

Invoked via `/impeccable extract rants`. Sweeps project-local rant-harvest
entries into the global design-contract collection.

## Preconditions

- User has completed one or more verb invocations that captured rant responses.
- Pending file exists at the current project's `.orca/design-rants-pending.md`.
  If absent, report "no pending rants" and exit.

## Flow

### Step 1 — Read pending entries

Read `{current-project}/.orca/design-rants-pending.md`. Entries are blocks of
the form:

```
## YYYY-MM-DD HH:MM — [verb-name]
[user's response verbatim]
```

Parse into a list. If the file is empty or malformed, report and exit.

### Step 2 — Categorize each entry

For each entry, present it to the user and ask which rant category it belongs
to. Existing categories under
`/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/rants/`:

- `fonts.md`
- `colors.md`
- `gradients.md`
- `motion-suddenness.md`
- `chamfered-buttons.md`
- `generic-ui-defaults.md`
- `alignment-spacing.md`
- `rounded-corners.md`
- `skeuomorphism.md`

The user may also choose "new" and name a new category file
(`rants/{new-name}.md`).

### Step 3 — Append to global rant file

For each categorized entry, append to
`/Users/adilkalam/ORCA-OS/docs/concepts/design-contract/rants/{category}.md`
with the original timestamp and verb tag preserved. Keep the entry verbatim —
do not paraphrase. The appended block should be:

```
---

## YYYY-MM-DD HH:MM — [verb-name]

[user's response verbatim]
```

If the category file does not yet exist, create it with a minimal header
derived from the name.

### Step 4 — Clear or archive the pending file

After all entries are appended successfully, either:

- Delete `{current-project}/.orca/design-rants-pending.md`, OR
- Rename it to `{current-project}/.orca/design-rants-archived-{YYYY-MM-DD}.md`
  (safer — keeps a local audit trail).

Prefer rename unless the user asks for deletion.

### Step 5 — Remind to deploy

Remind the user to run the rsync deploy so the updated rants reach
`~/.claude`:

```
rsync -av --exclude='*archive*' --exclude='*deprecated*' \
  /Users/adilkalam/ORCA-OS/docs/ ~/.claude/docs/
```

Without this, the global catalog is updated in the source tree but skills that
load from `~/.claude/docs/concepts/design-contract/` will not see the new
entries.

## Write-path constraints

- Never write directly to `~/.claude/docs/...`. Always write to the
  ORCA-OS source tree (`/Users/adilkalam/ORCA-OS/docs/...`). The rsync step
  propagates to `~/.claude`.
- Never write to `{current-project}/.claude/` for rant content. Project
  aesthetic.md holds project-scoped commitments, not global rants.
