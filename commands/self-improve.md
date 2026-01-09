---
description: "Run the Improvement Bus: route pending events to agents, gates, and standards"
argument-hint: "[--dry-run] [--domain <domain>] [--since <days>]"
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
  - mcp__project-context__save_standard
---

# /self-improve - Improvement Bus Processor (OS 4.2)

Process pending improvement events and route them to appropriate sinks (agent patterns, gate checklists, standards).

---

## Usage

```bash
/self-improve                    # Process all pending events
/self-improve --dry-run          # Show what would be routed, don't apply
/self-improve --domain ios       # Only process iOS domain events
/self-improve --since 7          # Only events from last 7 days
```

---

## 1. Load Pending Events

Read the event stream:

```bash
EVENT_FILE=".claude/improvement-events/improvement_event.jsonl"

if [ ! -f "$EVENT_FILE" ]; then
  echo "No improvement events found. Nothing to process."
  exit 0
fi

# Count pending events
PENDING=$(grep '"status":"pending"' "$EVENT_FILE" | wc -l)
echo "Found $PENDING pending events"
```

If `--domain` flag is set, filter:
```bash
grep '"domain":"ios"' "$EVENT_FILE" | grep '"status":"pending"'
```

If `--since` flag is set, filter by timestamp.

---

## 2. Group Events by Routing Target

Organize pending events:

```markdown
## Pending Events Summary

### To Agent Patterns (42 events)
- ios-builder: 12 events (8 reflexion, 4 audit)
- nextjs-builder: 18 events (10 reflexion, 5 cove, 3 agent)
- expo-builder-agent: 12 events (7 reflexion, 5 audit)

### To Gate Checklists (16 events)
- nextjs-verification-agent: 8 events (CoVe questions)
- ios-verification: 5 events (CoVe questions)
- expo-verification-agent: 3 events (CoVe questions)

### To Workshop Standards (23 events)
- ios: 9 events (high-severity reflexions with 2+ occurrences)
- nextjs: 14 events (audit patterns with 3+ occurrences)
```

---

## 3. Dry Run Mode

If `--dry-run` is set:

1. Show the summary above
2. For each event, show what would happen:

```markdown
## Dry Run: Would Route These Events

### evt-20251205-001 (reflexion -> agent_patterns)
- Source: ios-standards-enforcer
- Description: "NavigationStack used without iOS 16+ check"
- Action: Add pattern to ios-builder/patterns.json
- Pattern text: "Before using NavigationStack, verify deployment target >= iOS 16"

### evt-20251205-002 (cove -> gate_checklist)
- Source: nextjs-verification-agent
- Question: "Are 'use client' directives correct?"
- Fail count: 3
- Action: Add to nextjs-verification-agent/mandatory_checks.json
```

3. Exit without making changes

---

## 4. Process Agent Pattern Events

For each event targeting `agent_patterns`:

### 4.1 Load or Create patterns.json

```bash
AGENT="ios-builder"
PATTERN_FILE=".claude/agent-knowledge/$AGENT/patterns.json"

if [ ! -f "$PATTERN_FILE" ]; then
  mkdir -p ".claude/agent-knowledge/$AGENT"
  echo '{"patterns":[],"metadata":{"agentName":"'$AGENT'"}}' > "$PATTERN_FILE"
fi
```

### 4.2 Add Pattern

Read the event content and add as a new pattern:

```json
{
  "id": "pattern-evt-20251205-001",
  "description": "Before using NavigationStack, verify deployment target >= iOS 16",
  "category": "compatibility",
  "source": "reflexion",
  "source_event": "evt-20251205-001",
  "successCount": 0,
  "failureCount": 1,
  "status": "candidate",
  "addedDate": "2025-12-05"
}
```

### 4.3 Deduplication

Before adding, check if a similar pattern exists:
- Same `description` (fuzzy match, >80% similarity)
- Same `category`

If duplicate found:
- Increment `failureCount` on existing pattern
- Mark event as `duplicate`
- Skip adding new pattern

---

## 5. Process Gate Checklist Events

For each event targeting `gate_checklist`:

### 5.1 Load or Create mandatory_checks.json

```bash
AGENT="nextjs-verification-agent"
CHECK_FILE=".claude/agent-knowledge/$AGENT/mandatory_checks.json"

if [ ! -f "$CHECK_FILE" ]; then
  mkdir -p ".claude/agent-knowledge/$AGENT"
  echo '{"checks":[],"metadata":{"agentName":"'$AGENT'"}}' > "$CHECK_FILE"
fi
```

### 5.2 Add Mandatory Check

```json
{
  "id": "check-evt-20251205-002",
  "question": "Are 'use client' / 'use server' directives correct?",
  "fail_count": 3,
  "source_events": ["evt-20251201-005", "evt-20251203-012", "evt-20251205-002"],
  "addedDate": "2025-12-05",
  "active": true
}
```

### 5.3 Sunset Old Checks

If a check hasn't been triggered in 30 days:
- Set `active: false`
- Move to `archived_checks` array

---

## 6. Process Workshop Standard Events

For each event targeting `workshop_standard`:

Use `mcp__project-context__save_standard`:

```json
{
  "what_happened": "NavigationStack used without checking iOS 16+ deployment target",
  "cost": "Compilation failures, 5 occurrences across 3 weeks",
  "rule": "Before using NavigationStack, AsyncImage, or other iOS 16+ APIs, verify the project's minimum deployment target",
  "domain": "ios"
}
```

---

## 7. Update Event Status

After routing, update each processed event:

```json
{
  "id": "evt-20251205-001",
  ...
  "routing": {
    "targets": ["agent_patterns"],
    "status": "routed",
    "routed_at": "2025-12-05T11:45:00Z",
    "routed_to": ["ios-builder/patterns.json"]
  }
}
```

---

## 8. Archive Routed Events

Move routed events to monthly archive:

```bash
ARCHIVE_DIR=".claude/improvement-events/routed"
mkdir -p "$ARCHIVE_DIR"

# Extract routed events and append to monthly archive
grep '"status":"routed"' "$EVENT_FILE" >> "$ARCHIVE_DIR/$(date +%Y-%m).jsonl"

# Remove routed events from main file
grep -v '"status":"routed"' "$EVENT_FILE" > "$EVENT_FILE.tmp"
mv "$EVENT_FILE.tmp" "$EVENT_FILE"
```

---

## 9. Generate Report

Output a summary:

```markdown
## Improvement Bus Sync Report

**Processed:** 2025-12-05T11:45:00Z

### Events Processed
- Total pending: 81
- Routed: 74
- Duplicates: 5
- Skipped (rejected): 2

### Routing Summary

| Target | Count | Agents/Domains Affected |
|--------|-------|-------------------------|
| agent_patterns | 42 | ios-builder, nextjs-builder, expo-builder-agent |
| gate_checklist | 16 | nextjs-verification-agent, ios-verification |
| workshop_standard | 23 | ios (9), nextjs (14) |

### New Patterns Added
1. ios-builder: "Before using NavigationStack, verify deployment target >= iOS 16"
2. ios-builder: "No force unwraps in async closures"
3. nextjs-builder: "Always include loading.tsx for async pages"
...

### New Mandatory Checks Added
1. nextjs-verification-agent: "Are 'use client' directives correct?"
2. ios-verification: "Does deployment target match API usage?"
...

### Standards Created
1. ios: "Before using iOS 16+ APIs, verify deployment target"
2. nextjs: "Include loading states for all async boundaries"
...
```

---

## 10. Notify About Constraint Injection

If Reflexion events were processed, remind about constraint injection:

```markdown
## Active Constraints Ready

The following constraints are now available for injection into orchestrators:

**iOS (3 new constraints)**
- iOS 16+ API check required
- No force unwraps in async
- Verify Sendable conformance for actors

**Next.js (2 new constraints)**
- Include loading.tsx for async pages
- Verify 'use client' on hook-using components

Orchestrators will automatically load these via:
`workshop search "reflexion" -t {domain} --limit 5`
```

---

## Error Handling

If any routing fails:
1. Log the error
2. Keep event as `pending`
3. Add `routing.error` field with error message
4. Continue processing other events

```json
{
  "routing": {
    "targets": ["agent_patterns"],
    "status": "pending",
    "error": "Failed to write patterns.json: permission denied",
    "last_attempt": "2025-12-05T11:45:00Z"
  }
}
```

---

## See Also

- [Improvement Bus](../concepts/improvement-bus.md) - Architecture and event schema
- [Self-Improvement System](../concepts/self-improvement.md) - Improvement loops
- [/audit](audit.md) - Triggers improvement proposals
- [/reflect](reflect.md) - Conversation-level learning
