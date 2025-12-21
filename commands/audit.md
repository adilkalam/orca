---
description: "Audit recent tasks and agent behavior using Response Awareness (no implementation)"
argument-hint: "<scope description, e.g. 'last 10 tasks'>"
allowed-tools:
  ["Task", "Read", "Grep", "Glob", "Bash",
   "AskUserQuestion", "mcp__project-context__query_context", "mcp__project-context__save_standard", "mcp__project-context__save_task_history"]
---

# /audit – Response-Aware Behavior Audit

Use this command to run a **meta audit** over recent work in this project using
Response Awareness principles. It does not change code; it evaluates how the
pipeline behaved (skipped steps, scope creep, misused context, etc.) and
records learnings.

---
## 1. Choose Scope

Interpret `$ARGUMENTS` as an audit scope hint, for example:
- `"last 10 tasks"`
- `"recent Nextjs onboarding work"`
- `"all iOS tasks this week"`

If the scope is unclear:
- Ask the user via `AskUserQuestion` whether to:
  - Audit the **last N tasks** (e.g. last 5–10),
  - Focus on a particular domain (`nextjs`, `ios`, `expo`, `seo`, etc.),
  - Focus on a particular requirement ID.

---
## 2. Load History & Evidence

Using a combination of:
- `.claude/orchestration/phase_state.json` (phase and gate history),
- Project-specific logs under `.claude/orchestration/evidence/`,
- ProjectContextServer (`mcp__project-context__query_context`) with a meta task such as:
  - `"Summarize recent task_history and standards for audit"`,

Gather:
- A list of recent tasks in the chosen scope,
- Their domains, outcomes, and gate results,
- Any notable standards or decisions already saved to `vibe.db`.

If helpful, you MAY use `Bash` to:
- List evidence files under `.claude/orchestration/evidence/`,
- Inspect recent logs for gate failures or warnings.

---
## 3. Apply Response Awareness Lens

For the selected tasks, analyze behavior using RA concepts from
`docs/reference/response-awareness.md`:

- Where did we rely on **COMPLETION** rather than solid context?
  - Tag as `#COMPLETION_DRIVE` in the audit report.
- Where were important architectural choices made without being surfaced?
  - Tag as `#PATH_DECISION` and note whether they were explicit or implicit.
- Where did the model follow or ignore:
  - ProjectContextServer (context),
  - Requirements specs (`06-requirements-spec.md`),
  - Lane standards and gates?
- Any signs of **scope creep**, skipped phases, or over-diffing?
- Any repeated violations that should become standards?

Summarize per-task and then across tasks.

---
## 4. Write Audit Report

Create an audit report under:
- `.claude/orchestration/evidence/audit-<timestamp>.md`

Include:
- Scope description and time window,
- List of tasks examined (with domains and outcomes),
- RA-tagged findings (`#PATH_DECISION`, `#COMPLETION_DRIVE`, `#POISON_PATH`, etc.),
- Patterns:
  - Good behavior (what to reinforce),
  - Problematic behavior (what to fix),
- Recommended standards or guardrails.

---
## 5. Persist Learnings

Where appropriate:

1. Use `mcp__project-context__save_standard` to codify recurring issues:
   - `what_happened`: What went wrong or was repeated
   - `cost`: Impact (wasted time, bugs, rework, user impact)
   - `rule`: The enforceable rule to prevent recurrence
   - `domain`: **Use the specific domain** (`ios`, `nextjs`, `expo`, etc.)

   **Example for iOS:**
   ```json
   {
     "what_happened": "Force unwraps in async closures causing crashes",
     "cost": "3 production crashes before caught",
     "rule": "Never force unwrap in async contexts; use guard let or if let",
     "domain": "ios"
   }
   ```

2. Use `mcp__project-context__save_task_history` to record the audit itself:
   - `domain`: **Use the audited domain** (`ios`, `nextjs`, etc.) NOT `"audit"`
   - `task`: description of the audit scope
   - `outcome`: `"success"` (audit completed) or `"partial"`
   - `learnings`: summary of key RA findings
   - `files_modified`: include the audit report path

**Critical for Learning Loop (OS 3.0):**
- Standards saved with `domain: "ios"` will appear in `relatedStandards` for future iOS tasks
- Gate agents (`ios-standards-enforcer`) will enforce these standards
- This closes the loop: violation → audit → standard → future enforcement

---

## 6. RA Event Mining (OS 3.0)

With v3.0, `phase_state` now contains `ra_events` from each phase. When auditing:

1. **Check phase_state for RA events:**
   ```bash
   cat .claude/orchestration/phase_state.json | grep -A5 "ra_events"
   ```

2. **Aggregate RA tags across tasks:**
   - Count frequency of each tag type (`#COMPLETION_DRIVE`, `#CARGO_CULT`, etc.)
   - Identify patterns (same assumption repeated? same path decision across tasks?)

3. **Include in audit report:**
   ```markdown
   ## RA Event Summary
   - #COMPLETION_DRIVE: 7 occurrences (3 unresolved)
   - #CARGO_CULT: 2 occurrences
   - #PATH_DECISION: 5 occurrences (all documented)

   ### Frequent Assumptions
   - "Mobile breakpoint 768px" appeared 4 times → candidate for standard
   ```

---

## 7. Self-Improvement Analysis (Agent Learning Loop)

After completing the standard audit, run the self-improvement analysis:

### Step 1: Pattern Recognition

Run the pattern analysis script:

```bash
python3 scripts/analyze-patterns.py --days 30 --threshold 3
```

This will:
- Query Workshop for task_history entries from the last 30 days
- Identify recurring issues (3+ occurrences of same issue type from same agent)
- Generate improvement proposals at `.claude/orchestration/temp/improvement-proposals.json`

### Step 2: Review Proposals

If proposals were generated, present them to the user:

For each proposal, use `AskUserQuestion` with:
- **Question**: "Improvement proposal for {agent_name}: {issue_description}. Recommended change: {recommended_changes}. Approve this improvement?"
- **Options**:
  - "Approve" - Apply the improvement to the agent
  - "Reject" - Skip this improvement
  - "Modify" - Let me suggest different wording

Update proposal status based on user response:
- Approved → status: "approved"
- Rejected → status: "rejected"

### Step 3: Apply Approved Improvements

For approved proposals:

```bash
python3 scripts/apply-improvement.py --deploy
```

This will:
- Add "Learned Rules" section to agent markdown files
- Deploy updated agents to ~/.claude/agents/
- Update proposal status to "applied"

### Step 4: Record Learning

After applying improvements, record to Workshop:

```bash
workshop --workspace .claude/memory decision "Applied {N} agent improvements from self-improvement analysis" \
  -r "Patterns identified: {pattern_count}. Approved: {approved_count}. Agents updated: {agents_list}" \
  -t self-improvement -t audit
```

### Step 5: Generate Metrics Report

Create a brief report summarizing:
- Total task_history entries analyzed
- Patterns identified (count and list)
- Proposals generated vs approved vs rejected
- Agents updated
- Estimated improvement impact

Store the report at `.claude/orchestration/temp/self-improvement-report-{date}.md`

### When to Skip

Skip self-improvement analysis if:
- User explicitly requests `--skip-self-improvement`
- Less than 10 task_history entries exist
- No patterns meet the threshold

Always inform the user that self-improvement analysis was skipped and why.

---

## v3.0 Roadmap: Automatic Escalation

**Not yet implemented** - future evolution:

- If a certain RA tag appears frequently (e.g., same `#COMPLETION_DRIVE` assumption 3+ times):
  - Automatically prompt to promote to standard via `save_standard`
  - Adjust complexity thresholds if assumptions indicate underestimated complexity
- Requires: RA event aggregation across sessions, frequency analysis, threshold triggers
- This is where RA runtime research is headed
