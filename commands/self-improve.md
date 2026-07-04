---
description: "Show Workshop memory statistics and recent activity"
argument-hint: "[--recent] [--domain <domain>]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

# /self-improve - Workshop Memory Stats (OS 7.1)

Display statistics about the Workshop persistent memory system.

---

## Usage

```bash
/self-improve                    # Show memory stats
/self-improve --recent           # Show recent entries
/self-improve --domain ios       # Filter by domain
```

---

## Show Stats

Display counts of Workshop memory entries:

```bash
# Typed counts read directly from workshop.db (accurate).
# NOTE: save_standard persists as type 'gotcha'; there is no separate 'standard' type.
DB=.claude/memory/workshop.db
echo "Decisions:   $(sqlite3 "$DB" "SELECT COUNT(*) FROM entries WHERE type='decision';" 2>/dev/null)"
echo "Standards:   $(sqlite3 "$DB" "SELECT COUNT(*) FROM entries WHERE type='gotcha';" 2>/dev/null)"
echo "Notes:       $(sqlite3 "$DB" "SELECT COUNT(*) FROM entries WHERE type='note';" 2>/dev/null)"
echo "Preferences: $(sqlite3 "$DB" "SELECT COUNT(*) FROM entries WHERE type='preference';" 2>/dev/null)"
```

Output format:
```markdown
## Workshop Memory Stats

| Type | Count |
|------|-------|
| Decisions | 42 |
| Standards | 18 |
| Task History | 156 |
```

---

## Recent Activity

If `--recent` flag is set:

```bash
workshop --workspace .claude/memory recent
```

---

## Domain Filter

If `--domain` flag is set:

```bash
workshop --workspace .claude/memory search "$DOMAIN" --limit 20
```

---

## See Also

- [/project-memory](project-memory.md) - the command that wraps the Workshop CLI (status/why/decide/gotcha/search)
- [/audit](audit.md) - Creates standards from audit findings
