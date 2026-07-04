---
description: "Manage project memory (Workshop, code-index.db). Subcommands: status, init, why, decide, gotcha, recent, search, review, delete, clean"
argument-hint: "[status|init|why|decide|gotcha|recent|search|sync|review|delete|clean] <args>"
---

# Project Memory Management

Parse the user's command to determine which action to take:

**Command:** `/project-memory $ARGUMENTS`

## Subcommand Routing

Based on the arguments, execute ONE of the following:

### 1. Status (default, no args, or `status`)
**Trigger:** `/project-memory` or `/project-memory status`

Show memory system status:

```bash
echo ""
echo "  Project Memory Status"
echo ""
echo ""

# Workshop status
if [ -f ".claude/memory/workshop.db" ]; then
    echo "Workshop:  .claude/memory/workshop.db"
    workshop --workspace .claude/memory info 2>/dev/null || echo "  (run 'workshop info' for details)"
else
    echo "Workshop:  Not initialized"
fi
echo ""

# code-index.db status
if [ -f ".claude/memory/code-index.db" ]; then
    echo "code-index.db:  .claude/memory/code-index.db"
    python3 ~/.claude/scripts/code-index.py status 2>/dev/null || echo "  (run 'code-index.py status' for details)"
else
    echo "code-index.db:  Not initialized"
fi
echo ""

# Recent activity
echo ""
echo "Recent Activity:"
workshop --workspace .claude/memory recent --limit 5 2>/dev/null || echo "  (no recent activity)"
```

---

### 2. Initialize (`init` or `--initialize`)
**Trigger:** `/project-memory init` or `/project-memory --initialize`

Initialize the memory workspace:

```bash
mkdir -p .claude/memory
workshop --workspace .claude/memory init
```

This will:
- Create `.claude/memory/` directory structure
- Initialize Workshop database (workshop.db)

---

### 3. Why Query (`why <topic>`)
**Trigger:** `/project-memory why <topic>`

Query past decisions about a topic:

```bash
workshop --workspace .claude/memory why "<topic>"
```

Display the results clearly. If no results, suggest recording a decision.

---

### 4. Record Decision (`decide <text>` or `decision <text>`)
**Trigger:** `/project-memory decide <text>` or `/project-memory decision <text>`

Record a decision. Ask the user for reasoning if not provided:

1. If text contains ` -r ` or ` --reason `, parse it:
   ```bash
   workshop --workspace .claude/memory decision "<decision_text>" -r "<reasoning>"
   ```

2. Otherwise, ask: "What's the reasoning for this decision?"
   Then record:
   ```bash
   workshop --workspace .claude/memory decision "<decision_text>" -r "<user_provided_reasoning>"
   ```

Confirm the decision was recorded.

---

### 5. Record Gotcha (`gotcha <text>`)
**Trigger:** `/project-memory gotcha <text>`

Record a gotcha/warning/pitfall:

```bash
workshop --workspace .claude/memory gotcha "<gotcha_text>"
```

If tags are useful, add them:
```bash
workshop --workspace .claude/memory gotcha "<gotcha_text>" -t warning
```

Confirm the gotcha was recorded.

---

### 6. Recent Activity (`recent`)
**Trigger:** `/project-memory recent` or `/project-memory recent <limit>`

Show recent workshop activity:

```bash
workshop --workspace .claude/memory recent --limit <limit_or_10>
```

---

### 7. Search (`search <query>`)
**Trigger:** `/project-memory search <query>`

Search across all memory:

```bash
workshop --workspace .claude/memory search "<query>"
```

---

### 8. Sync Code Context (`sync`)
**Trigger:** `/project-memory sync`

Sync code context to code-index.db:

```bash
python3 ~/.claude/scripts/code-index.py sync
```

Show the sync results.

---

### 9. Review Entries (`review <type>`)
**Trigger:** `/project-memory review <type>`

Review all entries of a specific type. Valid types: `decisions`, `gotchas`, `preferences`, `notes`, `antipatterns`

```bash
workshop --workspace .claude/memory read -t <type> --full --limit 50
```

**Present results in a table format:**

```
Review: Gotchas (12 entries)


| ID  | Date       | Content                                          | Tags          |
|-----|------------|--------------------------------------------------|---------------|
| 47  | 2024-11-24 | NEVER fabricate medical/dosage information...    | medical, crit |
| 45  | 2024-11-23 | Always review pages top-to-bottom before...      | quality, qa   |
| 42  | 2024-11-22 | Don't use localStorage for auth tokens           | security      |

To delete an entry: /project-memory delete <id>
To edit: delete and re-add with /project-memory gotcha "<new text>"
```

**Examples:**
- `/project-memory review gotchas` - Review all gotchas
- `/project-memory review decisions` - Review all decisions
- `/project-memory review preferences` - Review all preferences

---

### 10. Delete Entry (`delete <id>`)
**Trigger:** `/project-memory delete <id>` or `/project-memory delete last`

Delete an entry by ID (shown in review) or delete the most recent entry:

**Step 1: Show the entry to be deleted**
```bash
workshop --workspace .claude/memory read --full | grep -A5 "ID: <id>"
```

**Step 2: Confirm with user**
Use AskUserQuestion: "Delete this entry? (yes/no)"

**Step 3: If confirmed, delete**
```bash
workshop --workspace .claude/memory delete <id>
```

Confirm deletion was successful.

---

### 11. Interactive Clean (`clean`)
**Trigger:** `/project-memory clean`

Launch interactive cleanup mode to review and delete multiple entries:

```bash
workshop --workspace .claude/memory clean
```

This shows entries one-by-one and lets user decide to keep/delete each.

---

### 12. Help (`help` or `--help`)
**Trigger:** `/project-memory help` or `/project-memory --help`

Show available subcommands:

```
Project Memory Commands (/project-memory)


Status & Init:
  /project-memory                 Show memory status
  /project-memory init            Initialize memory architecture

Record:
  /project-memory decide <text>   Record a decision (will prompt for reasoning)
  /project-memory gotcha <text>   Record a gotcha/warning
  /project-memory note <text>     Add a note

Query:
  /project-memory why <topic>     Query past decisions
  /project-memory search <query>  Search all memory
  /project-memory recent [n]      Show recent activity (default: 10)

Review & Edit:
  /project-memory review <type>   Review entries (gotchas, decisions, preferences, notes)
  /project-memory delete <id>     Delete an entry by ID (or 'last')
  /project-memory clean           Interactive cleanup mode

Sync:
  /project-memory sync            Sync code context to code-index.db

Examples:
  /project-memory why authentication
  /project-memory decide "Use JWT for auth" -r "Stateless, scales well"
  /project-memory gotcha "Don't use localStorage for tokens"
  /project-memory review gotchas           # See all gotchas with IDs
  /project-memory delete 47                # Delete entry #47
  /project-memory clean                    # Interactive cleanup
```

---

## Error Handling

- If Workshop is not installed: Show `cargo install workshop`
- If workshop.db doesn't exist: Suggest `/project-memory init`
- If code-index.py is missing: Note it's optional for code context
