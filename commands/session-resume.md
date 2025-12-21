---
description: Manually reload session context (normally auto-loads via SessionStart hook)
allowed-tools: [Read, Bash]
---

# /session-resume - Reload Session Context

**PURPOSE**: Manually load session context if SessionStart hook didn't fire or you need to refresh context mid-session.

**WHEN TO USE:**
- SessionStart hook failed to load context
- Want to reload context after significant changes
- Debugging session continuity issues
- Mid-session context refresh needed

---

## Step 1: Check for Context File

```bash
if [ -f .claude/orchestration/temp/session-context.md ]; then
  echo " Session context file found"
  cat .claude/orchestration/temp/session-context.md
else
  echo " No session context file found"
  echo ""
  echo "To create one, run: /session-save"
  exit 1
fi
```

---

## Step 2: Read and Display Context

**Read the file:**

```
Read(.claude/orchestration/temp/session-context.md)
```

**Parse and present:**

Extract from the file:
- Session focus area
- Current tasks
- Recent work/commits
- Important decisions
- Next steps

---

## Step 3: Verify Context is Current

**Check file age:**

```bash
fileAge=$(( $(date +%s) - $(stat -f %m .claude/orchestration/temp/session-context.md) ))
ageMinutes=$(( fileAge / 60 ))
ageHours=$(( fileAge / 3600 ))

if [ $ageHours -lt 1 ]; then
  echo "Context is fresh: ${ageMinutes} minutes old"
elif [ $ageHours -lt 24 ]; then
  echo "Context is recent: ${ageHours} hours old"
else
  ageDays=$(( ageHours / 24 ))
  echo " Context is ${ageDays} days old - may be stale"
  echo "Consider running /session-save to update"
fi
```

---

## Step 4: Present Summary

```
 SESSION CONTEXT LOADED

Last Updated: [timestamp from file]
Age: [X minutes/hours/days ago]

FOCUS AREA:
[Session focus from file]

CURRENT TASKS:
[Tasks from file]

RECENT WORK:
[Recent commits/changes from file]

NEXT STEPS:
[Planned work from file]

DECISIONS & BLOCKERS:
[Important context from file]

---

Context loaded successfully! I'm now up to speed on your previous work.
```

---

## Step 5: Ask for Updates

**If context is stale (>24 hours):**

```
 This context is [X days] old.

Has anything changed since then? For example:
- Completed any of the listed tasks?
- New priorities or blockers?
- Different direction?

If yes, consider running /session-save to update context.
```

**If context is fresh (<1 hour):**

```
Ready to continue where you left off!

Want to pick up with: [Next steps from context]
```

---

## Edge Cases

**No context file exists:**
```
 NO SESSION CONTEXT FOUND

No .claude/orchestration/temp/session-context.md file exists yet.

To create one:
1. Run /session-save to capture current session
2. Or start fresh and I'll learn as we work

The SessionStart hook will auto-load context on future sessions
once you've saved at least one session.
```

**Context file is corrupted:**
```
 Context file exists but couldn't be parsed

The .claude/orchestration/temp/session-context.md file may be corrupted.

Options:
1. Manually inspect: cat .claude/orchestration/temp/session-context.md
2. Create fresh context: /session-save
3. Delete and start over: rm .claude/orchestration/temp/session-context.md
```

**Multiple sessions in file:**
```
 MULTIPLE SESSIONS FOUND

Found context from [X] previous sessions:
- [Session 1: Date, Focus]
- [Session 2: Date, Focus]
- [Session 3: Date, Focus]

Loading most recent session: [Session 1]
```

---

## Debugging

**If SessionStart hook isn't working:**

1. Check hook is configured:
   ```bash
   cat .claude/settings.local.json | grep -A 10 "SessionStart"
   ```

2. Expected output:
   ```json
   "SessionStart": [
     {
       "matcher": "",
       "hooks": [
         {
           "type": "command",
           "command": "cat .claude/orchestration/temp/session-context.md 2>/dev/null || echo '# New Session'"
         }
       ]
     }
   ]
   ```

3. Test hook manually:
   ```bash
   cat .claude/orchestration/temp/session-context.md 2>/dev/null || echo '# New Session'
   ```

**If hook exists but doesn't fire:**
- Restart Claude Code completely
- Check for JSON syntax errors in settings.local.json
- Verify file path is relative to project root

---

## Summary

**/session-resume loads saved context manually.**

**Normal flow:** SessionStart hook auto-loads on startup
**Manual flow:** Run /session-resume to reload mid-session
**Update flow:** Run /session-save to capture new context

---

**Response Awareness**: For implementation workflows, see `docs/RESPONSE_AWARENESS_TAGS.md` for meta-cognitive tag system used by verification-agent and quality-validator.
