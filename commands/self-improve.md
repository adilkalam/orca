---
description: "Show Workshop memory statistics and recent activity"
argument-hint: "[--recent] [--domain <domain>]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

# /self-improve - Workshop Memory Stats (OS 7.0)

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
# Count decisions
workshop --workspace .claude/memory search "decision" --limit 1000 2>/dev/null | wc -l

# Count standards (formerly "gotchas")  
workshop --workspace .claude/memory search "standard" --limit 1000 2>/dev/null | wc -l

# Count task history
workshop --workspace .claude/memory search "task" --limit 1000 2>/dev/null | wc -l
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

- [Workshop CLI](~/.claude/docs/workshop.md) - Full Workshop documentation
- [/audit](audit.md) - Creates standards from audit findings
