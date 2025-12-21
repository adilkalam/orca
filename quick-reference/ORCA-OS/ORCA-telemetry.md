# Quick Reference: Telemetry (OS 3.0)

Telemetry tracks pipeline execution for debugging, performance tuning, and future smart routing.

---

## What Gets Tracked

| Event | When | Data Captured |
|-------|------|---------------|
| `pipeline_start` | Lane command starts | Domain, task, mode (tweak/default/complex) |
| `delegation` | Agent hands off to another | From, to, context size |
| `gate_result` | Gate completes | Score, decision, issue count |
| `pipeline_end` | Pipeline completes | Status, duration, files modified |

---

## Where It's Stored

```
.claude/telemetry/
  sessions/
    nextjs-20251205T143022-a7b3/
      trace.jsonl       # Event stream
      summary.json      # Session summary
  metrics/
    gate-scores.jsonl   # Aggregated scores
    delegation-times.jsonl
  index.json            # Session lookup
```

**Not committed to git** - ephemeral debugging data.

---

## What Triggers It

Telemetry is emitted by orchestrator commands (`/nextjs`, `/ios`, `/expo`, etc.):

```bash
# At start of /nextjs "add button"
{"type": "pipeline_start", "trace_id": "nextjs-20251205-a7b3", ...}

# When grand-architect delegates to builder
{"type": "delegation", "from": "nextjs-grand-architect", "to": "nextjs-builder", ...}

# When standards-enforcer runs
{"type": "gate_result", "gate": "nextjs-standards-enforcer", "score": 87, ...}

# When pipeline completes
{"type": "pipeline_end", "status": "success", "duration_sec": 45, ...}
```

---

## Trace ID Format

```
{domain}-{timestamp}-{random}
nextjs-20251205T143022-a7b3
```

The trace ID flows through the entire delegation chain.

---

## Viewing Telemetry

```bash
# List recent sessions
cat .claude/telemetry/index.json

# View a session's event stream
cat .claude/telemetry/sessions/nextjs-20251205-a7b3/trace.jsonl

# View session summary
cat .claude/telemetry/sessions/nextjs-20251205-a7b3/summary.json

# Gate score trends
cat .claude/telemetry/metrics/gate-scores.jsonl | tail -5
```

---

## Session Summary

Generated at pipeline end:

```json
{
  "trace_id": "nextjs-20251205-a7b3",
  "domain": "nextjs",
  "task_summary": "add dark mode toggle",
  "duration_sec": 45,
  "status": "success",

  "delegation_chain": [
    {"from": "nextjs-grand-architect", "to": "nextjs-builder", "context_kb": 42}
  ],

  "gate_scores": {
    "nextjs-standards-enforcer": {"score": 87, "decision": "WARN"},
    "nextjs-design-reviewer": {"score": 92, "decision": "PASS"}
  },

  "metrics": {
    "files_modified": 3,
    "user_prompts": 1
  }
}
```

---

## Retention

| Data | Kept For |
|------|----------|
| Session traces | 7 days |
| Aggregated metrics | 30 days |

Cleanup runs via `scripts/telemetry-cleanup.sh`.

---

## Initialization

The `session-start.sh` hook creates the telemetry structure:

```bash
# Creates on session start:
mkdir -p .claude/telemetry/sessions
mkdir -p .claude/telemetry/metrics

# Creates index if missing:
echo '{"version":"1.0","sessions":[]}' > .claude/telemetry/index.json
```

---

## Future Use

The `complexity_signals` in session summaries will train the Smart Router:

```json
"complexity_signals": {
  "files_touched": 3,
  "task_keywords": ["add", "toggle"],
  "estimated_complexity": "medium",
  "actual_outcome": "success"
}
```

This data helps `/plan` make smarter tier recommendations.

---

## Quick Debug

If a pipeline failed:

```bash
# Find the session
grep "status.*failed" .claude/telemetry/sessions/*/summary.json

# View the trace
cat .claude/telemetry/sessions/{session-id}/trace.jsonl

# Check which gate failed
grep "gate_result" .claude/telemetry/sessions/{session-id}/trace.jsonl
```

---

*Part of ORCA OS 4.0*
