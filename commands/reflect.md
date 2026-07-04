---
description: Mine session history for learning signals and curate the CLAUDE.md Learned Rules ledger (OS 7.1)
argument-hint: "[status | learn | --source recording|jsonl] [--days N]"
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# /reflect -- Institutional Learning (Learned Rules curation)

`/reflect` is the manager for the **Learned Rules** ledger in `CLAUDE.md` (the
`## Learned Rules (via /reflect)` section). It is a thin wrapper over two scripts that
already do the work:

- `~/.claude/scripts/reflect-analyze.py` -- mines learning signals (corrections,
  standing instructions, negative feedback) from session history.
- `~/.claude/scripts/reflect-apply.py` -- reads/writes the Learned Rules section
  (`add` / `archive` / `remove` / `list`).

**Rules are NEVER applied automatically.** `/reflect` proposes; the owner confirms each
addition. This is the one command allowed to edit the Learned Rules section.

## Subcommands

### `/reflect status` (default)
Show the current Learned Rules ledger.
```bash
python3 ~/.claude/scripts/reflect-apply.py list
```

### `/reflect --source recording|jsonl [--days N]`
Mine learning signals from session history. Data source `auto` tries `.orca/recording.db`
first, then falls back to JSONL transcripts; `recording` / `jsonl` force one.
```bash
python3 ~/.claude/scripts/reflect-analyze.py --days ${N:-30} --source ${SOURCE:-auto} --format summary
```
Present the ranked signals to the owner. Do NOT write anything in this mode.

### `/reflect learn [--days N]`
The full loop, with a mandatory human gate:
1. Run `reflect-analyze.py` (as above) to surface candidate rules.
2. For each candidate the owner approves (`AskUserQuestion`), apply it:
   ```bash
   python3 ~/.claude/scripts/reflect-apply.py add --rule "<approved rule text>" --target claude_md
   ```
   Soft/preference-level learnings go to `--target workshop` instead.
3. Show the resulting diff of the Learned Rules section and stop. Never batch-apply
   without per-rule confirmation.

## Curation discipline
- The ledger is bounded: prefer editing/merging an existing rule over adding a near-duplicate.
- Archive (don't delete) rules that are superseded: `reflect-apply.py archive --rule-id <id> --reason "<why>"`.
- Rule text must be a single imperative sentence a future session can act on.

## Notes
- Deployed to `~/.claude/scripts/`; both scripts are stdlib-only Python 3.
- The Learned Rules section format is owned by `reflect-apply.py` (`## Learned Rules
  (via /reflect)` + `### Active Rules` / `### Archived Rules`). Do not hand-edit it;
  route changes through this command.
