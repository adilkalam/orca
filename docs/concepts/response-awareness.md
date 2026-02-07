# Response Awareness (RA)

**Version:** OS 5.1 | **Last Updated:** 2026-01-24

Response Awareness is OS 5.1's system for **making assumptions and decisions explicit** during agent work. RA is **instrumentation**, not a primary scoring mechanism: tags surface where the model is guessing, following bad framing, or making architectural choices so that gates, audits, and humans can react.

## Why RA?

AI agents make assumptions. Without tracking:
- Assumptions become invisible
- Same mistakes repeat
- No audit trail for decisions
- Hard to diagnose failures

RA makes the implicit explicit but **does not by itself prove correctness**. Tags must be paired with real checks (tests, pixel measurements, code metrics).

## Core RA Tags (OS 5.1)

These tags are the **cross-lane core** used in all dev pipelines.

### `#COMPLETION_DRIVE`
Assumed behavior without explicit confirmation.

```
#COMPLETION_DRIVE: Assuming mobile breakpoint is 768px
#COMPLETION_DRIVE: Assuming user wants haptic on all buttons
```

### `#PATH_DECISION`
Architectural or design choice made during planning or implementation.

```
#PATH_DECISION: Using Web Component over vanilla JS
#PATH_DECISION: Chose SwiftUI over UIKit for this view
```

### `#PATH_RATIONALE`
Explanation for a path decision (kept as permanent documentation).

```
#PATH_RATIONALE: Web Component provides encapsulation and reusability
```

### `#POISON_PATH`
User framing or prior code is leading toward unsafe or clearly suboptimal patterns; the agent should surface a reframe instead of blindly following.

```
#POISON_PATH: Existing code uses force unwraps in async context
#POISON_PATH: Request implies skipping validation
```

## Additional Tags

Some lanes and agents use additional RA tags for more nuanced analysis. These are **optional** and lane-specific; they must never be used as standalone "accuracy" metrics.

### `#Potential_Issue`
Problem noticed outside the current task scope that deserves follow-up.

```
#Potential_Issue: Duplicated layout logic in PricingCard and PlanCard
```

### `#CARGO_CULT`
Copied pattern from elsewhere in codebase without understanding.

```
#CARGO_CULT: Mirroring header section's token usage
#CARGO_CULT: Following existing error handling pattern
```

### `#TOKEN_VIOLATION`
Design token rule not followed.

```
#TOKEN_VIOLATION: Using hardcoded #333 - token not available
#TOKEN_VIOLATION: 17px not on 4px grid
```

### `#CONTEXT_DEGRADED`
Operating with reduced context quality.

```
#CONTEXT_DEGRADED: ProjectContext timeout, using manual file search
```

### `#SCOPE_EXCEEDED`
Task is beyond the agent's intended scope. (Not yet implemented in agents.)

```
#SCOPE_EXCEEDED: This requires multi-file changes, recommend full pipeline
```

### Research-Specific Tags (Research Lane)

Used heavily by `/research` and research agents:

#### `#LOW_EVIDENCE`
Important claim or subquestion has thin or low-quality evidence.

```
#LOW_EVIDENCE: Only one weak blog post supports this claim
```

#### `#SOURCE_DISAGREEMENT`
Credible sources conflict on an important point.

```
#SOURCE_DISAGREEMENT: Academic papers disagree on optimal architecture
```

#### `#SUSPECT_SOURCE`
Source is low-credibility, heavily biased, or SEO spam.

```
#SUSPECT_SOURCE: Source is an unvetted marketing blog with unclear authorship
```

#### `#OUT_OF_DATE`
Evidence is older than the requested time window or clearly stale.

```
#OUT_OF_DATE: Most sources predate 2022 for a fast-moving topic
```

#### `#TOOL_ERROR`
Tools (especially Crawl4AI MCP) encountered errors or were unavailable and
could not explore as widely as desired.

```
#TOOL_ERROR: Crawl4AI server unavailable while exploring vendor docs
```

#### `#RATE_LIMITED`
Search tools hit rate limits, resulting in incomplete coverage for some domains.

```
#RATE_LIMITED: Google search rate-limited after 15 queries, skipping secondary sources
```

#### `#RETRY_EXHAUSTED`
Subquestion abandoned after max retries (3 attempts). All retry strategies
failed for this aspect of the research.

```
#RETRY_EXHAUSTED: Could not find evidence for competitor pricing after 3 attempts
```

**Action:** Must be surfaced in the Methodology section of the final report so
readers know which aspects could not be researched.

These tags help research gates decide whether a report should be treated as
PASS, CAUTION, or FAIL and ensure limitations are surfaced to the user.

## RA in Phase State

RA events are tracked in `phase_state.json`:

```json
{
  "implementation_pass1": {
    "files_modified": ["SaveButton.swift"],
    "ra_events": [
      {
        "tag": "#COMPLETION_DRIVE",
        "message": "Assuming haptic should be .medium intensity",
        "file": "SaveButton.swift",
        "resolved": false
      },
      {
        "tag": "#PATH_DECISION",
        "message": "Using UIImpactFeedbackGenerator over UISelectionFeedbackGenerator",
        "rationale": "Impact provides more noticeable feedback for button taps",
        "resolved": true
      }
    ]
  }
}
```

## RA in Gates

Gate agents check RA status and report in their output:

```markdown
## RA Status
- Tags found: 3
- Unresolved: 1
  - SaveButton.swift:45 - #COMPLETION_DRIVE: Assuming .medium intensity

Gate Decision: CAUTION (unresolved RA assumption)
```

RA status affects gate decisions:
- `ra_status: "none"` - No RA tags (clean)
- `ra_status: "present_resolved"` - Tags exist but documented/resolved
- `ra_status: "present_unresolved"` - Unresolved assumptions (flag for review)

**Important (OS 5.1):**
- RA tags are **signals**, not scores. Gates MAY downgrade to CAUTION/FAIL when high‑risk RA tags remain unresolved (e.g., `#COMPLETION_DRIVE` in auth/checkout flows, `#POISON_PATH` ignored).
- Gates MUST NOT derive standalone “RA accuracy percentages” from tag counts. Final quality judgments come from tests, builds, pixel checks, and domain-specific metrics.

## Future: Automatic Escalation

**Not yet implemented** - future evolution:

- If a certain RA tag appears frequently (e.g., same assumption 3+ times):
  - Automatically prompt to promote to standard
  - Adjust complexity thresholds if assumptions indicate underestimated complexity
- Requires: RA event aggregation across sessions, frequency analysis, threshold triggers

## Best Practices

### For Specialists
- Tag assumptions as you make them
- Use `#PATH_DECISION` + `#PATH_RATIONALE` for architectural choices
- Flag `#POISON_PATH` if user request or existing code seems unsafe

### For Gates
- Check `ra_events` from implementation phases
- Report unresolved assumptions
- Factor RA status into gate decision

### For Orchestrators
- Pass RA events from specialists to gates
- Include RA summary in completion report
- Flag unresolved assumptions to user

## See Also

- [Pipeline Model](pipeline-model.md) - Where RA fits in the pipeline
- [Memory Systems](memory-systems.md) - How RA events persist
