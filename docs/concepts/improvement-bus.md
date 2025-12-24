# Unified Improvement Bus (OS 3.1)

The Improvement Bus unifies all self-improvement mechanisms into a single event stream with explicit routing to appropriate sinks.

---

## The Problem

OS 4.1 introduced multiple improvement loops, but they operate in silos:

| Loop | Output | Storage | Consumption |
|------|--------|---------|-------------|
| Agent patterns | `patterns.json` | `.claude/agent-knowledge/*/` | Agent reads at start |
| /audit pipeline | improvement-proposals.json | `.claude/orchestration/temp/` | Manual via script |
| /reflect rules | CLAUDE.md rules | Project CLAUDE.md | Always loaded |
| Reflexion gotchas | Workshop entries | Workshop `-t reflexion` | Gate loads 5 recent |
| CoVe tables | Inline in gate output | Not persisted | Not reused |

**Consequences:**
- A `/reflect` rule never becomes an agent pattern
- A reflexion gotcha never becomes a `save_standard`
- CoVe verification questions that repeatedly fail are not systematically reused
- Improvements discovered in one loop don't propagate to others

---

## The Solution

A single event stream (`improvement_event.jsonl`) that all loops write to, with a routing script that dispatches events to appropriate sinks.

```

  Sources (write events)         Improvement Bus          Sinks (receive routed events)

  Reflexion (gates)    ──┐                           ┌── Agent patterns.json
  CoVe failures        ──┼──▶ improvement_event.jsonl ──┼── CLAUDE.md rules
  /reflect rules       ──┤         │                 ├── Workshop standards
  /audit proposals     ──┤         ▼                 ├── Gate checklists
  Agent discoveries    ──┘   improvement-bus-sync.py ──┘── phase_state constraints

```

---

## Event Schema

Each event is a single JSON line in `.claude/improvement-events/improvement_event.jsonl`:

```json
{
  "id": "evt-20251205-001",
  "timestamp": "2025-12-05T10:30:00Z",
  "source": "reflexion",
  "source_agent": "ios-standards-enforcer",
  "domain": "ios",
  "event_type": "failure",
  "content": {
    "description": "NavigationStack used without iOS 16+ deployment check",
    "severity": "high",
    "evidence": "File: AuthView.swift:42, NavigationStack requires iOS 16+",
    "suggested_action": "Before using SwiftUI APIs, verify deployment target"
  },
  "routing": {
    "targets": ["agent_patterns"],
    "status": "pending"
  }
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique event ID: `evt-YYYYMMDD-NNN` |
| `timestamp` | ISO8601 | When the event was generated |
| `source` | enum | `reflexion`, `cove`, `reflect`, `audit`, `agent` |
| `source_agent` | string | Agent that generated this event (for scoped injection) |
| `domain` | string | `ios`, `nextjs`, `expo`, `seo`, `os-dev` |
| `event_type` | enum | `failure`, `pattern`, `rule`, `constraint`, `verification_question` |
| `content.description` | string | Human-readable description |
| `content.severity` | enum | `critical`, `high`, `medium`, `low` |
| `content.evidence` | string | Supporting evidence (file:line, command output, etc.) |
| `content.suggested_action` | string | What to do differently |
| `routing.targets` | array | Where to route: `agent_patterns`, `claudemd_rule`, `workshop_standard`, `gate_checklist`, `phase_constraints` |
| `routing.status` | enum | `pending`, `routed`, `rejected`, `duplicate` |

---

## Event Sources

### 1. Reflexion (Gates)

When gates emit CAUTION/FAIL, they now also append to improvement bus:

```bash
# In gate agent, after storing Workshop gotcha:
echo '{"id":"evt-...", "source":"reflexion", "source_agent":"nextjs-standards-enforcer", ...}' >> .claude/improvement-events/improvement_event.jsonl
```

**Routing targets:** `agent_patterns` (for the source agent only)

### 2. CoVe Failures (Verification Agents)

When CoVe table contains NO answers:

```json
{
  "source": "cove",
  "source_agent": "nextjs-verification-agent",
  "event_type": "verification_question",
  "content": {
    "description": "Question: 'Are use client directives correct?' repeatedly fails",
    "question": "Are 'use client' / 'use server' directives correct?",
    "fail_count": 3,
    "evidence": "Failed in tasks: task-001, task-003, task-007"
  },
  "routing": {
    "targets": ["gate_checklist"]
  }
}
```

**Routing targets:** `gate_checklist` (for the source verification agent)

### 3. /reflect Rules

When `/reflect` promotes a rule to CLAUDE.md, also emit:

```json
{
  "source": "reflect",
  "source_agent": null,
  "event_type": "rule",
  "content": {
    "description": "Always use TypeScript strict mode",
    "rule_id": "rule-001"
  },
  "routing": {
    "targets": ["agent_patterns"]
  }
}
```

**Routing targets:** `agent_patterns` (all builder agents in domain)

### 4. /audit Proposals

When `/audit` generates improvement proposals:

```json
{
  "source": "audit",
  "source_agent": "ios-builder",
  "event_type": "pattern",
  "content": {
    "description": "Agent uses NavigationStack without checking iOS version",
    "occurrences": 5,
    "proposal_id": "improve-ios-builder-2025-12-05"
  },
  "routing": {
    "targets": ["agent_patterns", "workshop_standard"]
  }
}
```

**Routing targets:** `agent_patterns` + `workshop_standard`

### 5. Agent Discoveries

When builder agents discover effective patterns:

```json
{
  "source": "agent",
  "source_agent": "nextjs-builder",
  "event_type": "pattern",
  "content": {
    "description": "Using Suspense boundaries around async components prevents hydration mismatch",
    "category": "architecture",
    "success_count": 1
  },
  "routing": {
    "targets": ["agent_patterns"]
  }
}
```

**Routing targets:** `agent_patterns` (self only)

---

## Routing Logic

`scripts/improvement-bus-sync.py` processes pending events:

### Routing Rules

| Source | Event Type | Severity | Occurrences | Target(s) |
|--------|------------|----------|-------------|-----------|
| reflexion | failure | high | 1 | agent_patterns (source agent) |
| reflexion | failure | high | 2+ | agent_patterns + workshop_standard |
| reflexion | failure | medium | 3+ | agent_patterns |
| cove | verification_question | any | 2+ | gate_checklist |
| reflect | rule | any | 1 | agent_patterns (all builders in domain) |
| audit | pattern | any | 3+ | agent_patterns + workshop_standard |
| agent | pattern | any | 1 | agent_patterns (self) |

### Deduplication

Before routing, check for duplicates:
- Same `source_agent` + similar `description` (fuzzy match) within 7 days
- If duplicate found, increment occurrence count instead of creating new event

### Execution

```python
def route_event(event):
    for target in event['routing']['targets']:
        if target == 'agent_patterns':
            add_to_agent_patterns(event['source_agent'], event['content'])
        elif target == 'workshop_standard':
            save_workshop_standard(event)
        elif target == 'gate_checklist':
            add_to_gate_checklist(event['source_agent'], event['content'])
        elif target == 'phase_constraints':
            # Used by Reflexion-as-Constraint, handled at runtime
            pass

    event['routing']['status'] = 'routed'
```

---

## Reflexion-as-Constraint Pattern

**Problem:** Reflexion gotchas are stored but not actively injected into future plans.

**Solution:** When orchestrators load reflexions, synthesize constraint bullets and inject into `phase_state.plan.constraints`.

### Loading (in orchestrator commands like /nextjs, /ios)

```bash
# Load recent reflexions for this domain
REFLEXIONS=$(workshop --workspace .claude/memory search "reflexion" -t nextjs --limit 5 --json)

# Synthesize constraints (3-5 bullets max)
# Example output:
# - "iOS 16+ API check required before using NavigationStack"
# - "No force unwraps in async closures"
# - "Verify Tailwind classes exist before using"
```

### Injection

Add to `phase_state.json`:

```json
{
  "plan": {
    "constraints": [
      "reflexion: iOS 16+ API check required (from evt-20251201-003)",
      "reflexion: No force unwraps in async (from evt-20251128-007)"
    ],
    "constraint_source": "improvement-bus"
  }
}
```

### Consumption

**Only the source agent receives constraints.** When delegating to `ios-builder`:

```markdown
## Active Constraints (from past failures)

These constraints are derived from past failures by this agent. Apply them:

- iOS 16+ API check required before using NavigationStack
- No force unwraps in async closures

Failure to apply these constraints will result in gate failure.
```

This prevents context bloat: `nextjs-builder` doesn't see iOS constraints.

---

## CoVe Question Mining

**Problem:** CoVe verification tables contain valuable questions, but failed questions aren't reused.

**Solution:** Persist failed questions and inject as mandatory checks in similar future tasks.

### Storage

In `phase_state.gates.verification`:

```json
{
  "gates": {
    "verification": {
      "cove_table": [
        {"question": "Build succeeds?", "answer": "YES", "evidence": "exit 0"},
        {"question": "Use client correct?", "answer": "NO", "evidence": "Missing directive"}
      ]
    }
  }
}
```

### Mining

When `improvement-bus-sync.py` runs:

1. Scan `phase_state` for CoVe tables with NO answers
2. Count question failures across tasks (keyed by question text + domain)
3. When a question fails 2+ times, emit `verification_question` event
4. Route to `gate_checklist`

### Injection

Verification agents receive `historical_fail_questions`:

```markdown
## Mandatory Verification Questions

These questions have failed in past similar tasks. You MUST include them:

1. "Are 'use client' / 'use server' directives correct?" (failed 3 times)
2. "Do all dynamic imports have loading states?" (failed 2 times)

Include these in your CoVe table with explicit YES/NO answers.
```

---

## Triggers

### Manual: /self-improve

```bash
/self-improve              # Run improvement-bus-sync.py, show report
/self-improve --dry-run    # Show what would be routed without applying
/self-improve --domain ios # Only process events for iOS domain
```

### Hook: session-end (optional)

Add to `hooks/session-end.sh`:

```bash
# Run improvement bus sync at session end
python3 scripts/improvement-bus-sync.py --batch >> .claude/telemetry/improvement-bus.log 2>&1
```

---

## Storage Locations

| Artifact | Path |
|----------|------|
| Event stream | `.claude/improvement-events/improvement_event.jsonl` |
| Routing script | `scripts/improvement-bus-sync.py` |
| Agent patterns | `.claude/agent-knowledge/{agent}/patterns.json` |
| Gate checklists | `.claude/agent-knowledge/{agent}/mandatory_checks.json` |
| Workshop standards | Workshop entries via `mcp__project-context__save_standard` |
| Routed event archive | `.claude/improvement-events/routed/YYYY-MM.jsonl` |

---

## Metrics

Track improvement bus health:

```json
{
  "events_total": 142,
  "events_pending": 7,
  "events_routed": 128,
  "events_rejected": 5,
  "events_duplicate": 2,
  "routing_by_target": {
    "agent_patterns": 89,
    "workshop_standard": 23,
    "gate_checklist": 16
  },
  "top_sources": {
    "reflexion": 67,
    "cove": 34,
    "audit": 28,
    "reflect": 8,
    "agent": 5
  }
}
```

---

## See Also

- [Self-Improvement System](self-improvement.md) - Original improvement loops
- [Response Awareness](response-awareness.md) - RA event mining
- [Memory Systems](memory-systems.md) - Workshop integration
