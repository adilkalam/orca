---
description: "Self-improvement for Claude Code - learn from interactions. Subcommands: (analyze), status, learn, unlearn, history"
argument-hint: "[learn <rule>] [unlearn <rule>] [status] [history] [--soft]"
---

# /reflect - Claude Code Self-Improvement

Learn from your interactions with Claude Code. Extract patterns from conversation transcripts and promote them to persistent rules in CLAUDE.md or Workshop preferences.

**Command:** `/reflect $ARGUMENTS`

## Subcommand Routing

Based on the arguments, execute ONE of the following:

---

### 1. Analyze (default, no args)
**Trigger:** `/reflect`

Analyze JSONL transcripts for learning signals:

```bash
# Run analysis script
python3 ~/.claude/scripts/reflect-analyze.py --project "$(pwd)" --output json
```

Parse the JSON output to get patterns ready for promotion.

**For each pattern meeting threshold:**

1. Present the pattern:
   ```
    Pattern Found: [TYPE]

   Content: "<signal content>"
   Occurrences: N times
   Severity: HIGH/MEDIUM/LOW
   First seen: YYYY-MM-DD
   ```

2. Use AskUserQuestion to get user decision:
   - **"Add to CLAUDE.md"** - Hard rule, always enforced
   - **"Add to Workshop"** - Soft preference, context-dependent
   - **"Dismiss"** - Don't suggest again
   - **"Skip for now"** - Keep tracking

3. Apply the decision:
   - If "Add to CLAUDE.md":
     ```bash
     python3 ~/.claude/scripts/reflect-apply.py add --rule "<extracted rule>" --target claude_md
     ```
   - If "Add to Workshop":
     ```bash
     python3 ~/.claude/scripts/reflect-apply.py add --rule "<extracted rule>" --target workshop
     ```
   - If "Dismiss": Update journal to mark signal as dismissed
   - If "Skip": Continue to next pattern

4. Show summary when done:
   ```
   
   /reflect Summary
   

   Files analyzed: N
   Signals found: N new, N total
   Patterns reviewed: N

   Actions taken:
   - Added N rules to CLAUDE.md
   - Added N preferences to Workshop
   - Dismissed N patterns
   - Skipped N patterns
   ```

---

### 2. Status (`status`)
**Trigger:** `/reflect status`

Show learning journal summary:

```bash
# Check if journal exists
JOURNAL=".claude/orchestration/temp/reflect-journal.json"

if [ -f "$JOURNAL" ]; then
    echo ""
    echo "  /reflect Status"
    echo ""
    echo ""

    # Use jq or python to parse and display summary
    python3 -c "
import json
from pathlib import Path

journal_path = Path('$JOURNAL')
if journal_path.exists():
    journal = json.loads(journal_path.read_text())

    signals = journal.get('signals', [])
    rules = journal.get('learned_rules', [])

    pending = len([s for s in signals if s.get('status') == 'pending'])
    promoted = len([s for s in signals if s.get('status') == 'promoted'])
    dismissed = len([s for s in signals if s.get('status') == 'dismissed'])

    print(f'Total signals tracked: {len(signals)}')
    print(f'  - Pending: {pending}')
    print(f'  - Promoted: {promoted}')
    print(f'  - Dismissed: {dismissed}')
    print()
    print(f'Learned rules: {len(rules)}')
"
else
    echo "No learning journal found."
    echo "Run /reflect to analyze transcripts and start learning."
fi
```

Also show CLAUDE.md rule counts:

```bash
python3 ~/.claude/scripts/reflect-apply.py list
```

---

### 3. Learn (`learn <rule>` or `learn <rule> --soft`)
**Trigger:** `/reflect learn <rule text>` or `/reflect learn <rule text> --soft`

Explicitly add a learned rule without transcript analysis:

**If `--soft` flag present:**
```bash
python3 ~/.claude/scripts/reflect-apply.py add \
  --rule "<rule text>" \
  --target workshop
```

**Otherwise (default to CLAUDE.md):**
```bash
python3 ~/.claude/scripts/reflect-apply.py add \
  --rule "<rule text>" \
  --target claude_md
```

Confirm to user:
```
 Added rule: "<rule text>"
   Target: CLAUDE.md / Workshop preferences
```

---

### 4. Unlearn (`unlearn <rule or id>`)
**Trigger:** `/reflect unlearn <rule text or rule-id>`

Remove or archive a learned rule:

1. First, list existing rules:
   ```bash
   python3 ~/.claude/scripts/reflect-apply.py list
   ```

2. Find the matching rule (by ID or text search)

3. Use AskUserQuestion to confirm:
   - **"Archive"** - Keep in history, mark inactive
   - **"Delete"** - Remove entirely
   - **"Cancel"** - Don't change anything

4. Apply the decision:
   - If "Archive":
     ```bash
     python3 ~/.claude/scripts/reflect-apply.py archive \
       --rule-id "<rule-id>" \
       --reason "User requested via /reflect unlearn"
     ```
   - If "Delete":
     ```bash
     python3 ~/.claude/scripts/reflect-apply.py remove \
       --rule-id "<rule-id>"
     ```

Confirm to user:
```
 Rule [rule-id] has been archived/removed.
```

---

### 5. History (`history`)
**Trigger:** `/reflect history`

Show all learned rules (active and archived):

```bash
python3 ~/.claude/scripts/reflect-apply.py list
```

Present in a readable format:

```

  /reflect History


=== Active Rules (CLAUDE.md) ===

| ID            | Rule                              | Learned    |
|---------------|-----------------------------------|------------|
| rule-001      | Always use TypeScript strict mode | 2025-11-27 |
| rule-002      | Run lint before committing        | 2025-11-25 |

=== Archived Rules ===

| ID            | Rule                              | Archived   | Reason            |
|---------------|-----------------------------------|------------|-------------------|
| rule-003      | Use npm not yarn                  | 2025-11-26 | Switched to bun   |

=== Workshop Preferences ===

(Search Workshop for [/reflect] tagged preferences)
```

---

### 6. Help (`help` or `--help`)
**Trigger:** `/reflect help` or `/reflect --help`

Show command usage:

```
/reflect - Claude Code Self-Improvement


Learn from your interactions. Extract patterns from transcripts
and promote them to persistent rules.

Commands:
  /reflect                    Analyze transcripts, review patterns
  /reflect status             Show learning journal summary
  /reflect learn <rule>       Explicitly add a rule to CLAUDE.md
  /reflect learn <rule> --soft  Add as Workshop preference
  /reflect unlearn <rule>     Archive or remove a rule
  /reflect history            Show all rules (active + archived)

How it works:
1. /reflect parses your JSONL conversation transcripts
2. Identifies corrections, instructions, and feedback
3. Tracks signal occurrences in a learning journal
4. Suggests promotion when patterns meet threshold:
   - High severity: 1 occurrence
   - Medium severity: 2 occurrences
   - Low severity: 3+ occurrences
5. You choose: add to CLAUDE.md (hard rule) or Workshop (soft preference)

Examples:
  /reflect                          # Analyze and review patterns
  /reflect learn "Always run tests" # Explicitly add rule
  /reflect unlearn "npm rule"       # Remove obsolete rule
  /reflect status                   # Check learning progress
```

---

## Conflict Detection

When adding a rule, the script checks for conflicts. If a conflict is detected:

```
 CONFLICT DETECTED

New rule: "Use bun for package management"
Conflicts with: "Use npm for package management" [rule-003]
```

Use AskUserQuestion:
- **"Replace existing"** - Archive old, add new
- **"Keep existing"** - Dismiss new suggestion
- **"Keep both"** - Add new alongside existing (different contexts)

---

## Error Handling

- If scripts not found: Suggest `ls ~/.claude/scripts/reflect-*.py`
- If no transcripts found: Show transcript directory path and suggest running more sessions
- If journal doesn't exist: Initialize new journal automatically
- If CLAUDE.md doesn't exist: Error - project not initialized

---

## File Locations

- **Learning Journal:** `.claude/orchestration/temp/reflect-journal.json`
- **Scripts:** `~/.claude/scripts/reflect-analyze.py`, `~/.claude/scripts/reflect-apply.py`
- **JSONL Transcripts:** `~/.claude/projects/<project-hash>/`
- **Target CLAUDE.md:** Project root or `.claude/CLAUDE.md`
