---
description: "Root cause analysis orchestrator – identify why something is failing and route to the right agents"
argument-hint: "<symptom description or failing test/error>"
allowed-tools:
  - Task
  - AskUserQuestion
  - mcp__project-context__query_context
  - mcp__project-context__save_task_history
  - Read
  - Bash
  - Grep
  - Glob
---

# /root-cause – Multi-Lane Root Cause Analysis (OS 3.0)

Use this command when **something is failing** and you want to understand
*why* before you change anything:

- Failing tests (XCTest, Jest, Playwright, etc.)
- Build failures (Xcode, Next.js/Expo builds)
- Runtime errors (crashes, exceptions, misbehavior)

This command:

- Clarifies the symptom and scope
- Uses memory and ProjectContext to gather context
- Identifies the most likely **domain/lane**
- Assembles a small **root-cause squad** of relevant agents
- Delegates investigation via `Task` (no implementation)
- Produces a root cause report (not a fix)

**Role boundary:** `/root-cause` is an **orchestrator only** command.
It never edits code or config.

---

## 0. Clarify the Symptom

First, use `AskUserQuestion` to clarify the problem:

- Ask for:
  - Error message or stack trace (copy/paste)
  - Whether the failure is:
    - Test failure
    - Build failure
    - Runtime error
  - Any known file/test names or commands used to reproduce

Example questions:

```typescript
AskUserQuestion({
  questions: [{
    header: "Root Cause Analysis – Symptom",
    question: "Paste the error message or failing test name, and specify how you triggered it.",
    multiSelect: false,
    options: [
      { label: "I will paste the error output", description: "Include test name, command, and relevant logs" },
      { label: "I can only describe the behavior", description: "Describe what you see and how to reproduce it" }
    ]
  }]
})
```

If the user provides a command used to reproduce (e.g. `npm test`, `xcodebuild`, `next test`),
record it in your reasoning and reuse it later when delegating to verification agents.

---

## 1. Memory-First Context & Domain Detection

### 1.1 Memory Search

Before anything else, search unified memory for similar incidents:

```bash
python3 ~/.claude/scripts/memory-search-unified.py "$SYMPTOM_KEYWORDS" --mode all --top-k 10 || true
```

Summarize:

- Any past incidents with similar error messages
- Decisions or gotchas around the suspected stack (iOS/Next.js/Expo/Shopify/data/seo/os-dev)

### 1.2 ProjectContext Query

Then call ProjectContextServer with a **diagnostic task**:

```bash
# Pseudocode (actual call via mcp__project-context__query_context)
{
  "domain": "dev",          // general dev context
  "task": "Investigate root cause: <short description>",
  "projectPath": "<repo root>",
  "maxFiles": 20,
  "includeHistory": true
}
```

Use the ContextBundle to identify:

- Which files/tests are involved (e.g. `.swift`, `.tsx`, `.liquid`, tests)
- Which domain is likely responsible:
  - iOS (Swift/SwiftUI/Xcode)
  - Next.js (React/Next)
  - Expo (React Native/Expo)
  - Shopify (Liquid/theme files)
  - Data / SEO (if mostly content/analysis)
  - OS-Dev (if failure is coming from OS 3.0 tooling itself)

### 1.3 Confirm Domain with User

Propose a domain based on heuristics, then confirm via `AskUserQuestion`:

```typescript
AskUserQuestion({
  questions: [{
    header: "Root Cause – Domain Detection",
    question: "Based on the error and context, this looks like an <ios/nextjs/expo/os-dev> issue. Does that match your understanding?",
    multiSelect: false,
    options: [
      { label: "Yes, it's <domain>", description: "Proceed with that lane's root-cause squad" },
      { label: "No, it's actually Next.js", description: "Treat as Next.js frontend" },
      { label: "No, it's actually iOS", description: "Treat as iOS" },
      { label: "Other / Not sure", description: "Keep it general" }
    ]
  }]
})
```

Select the confirmed domain and proceed.

---

## 2. Assemble a Root-Cause Squad (Per Domain)

You now assemble a **diagnostic team**, not an implementation team.
You do this via `Task`, using agents from the relevant lane.

### 2.1 iOS Root-Cause Squad

Likely agents (from `agents/iOS/`):

- `ios-testing-specialist`
  - Analyze failing tests and test code patterns.
- `ios-verification`
  - Run targeted builds/tests via Xcode/xcodebuild/XcodeBuildMCP.
- `ios-swiftui-specialist` or `ios-uikit-specialist`
  - If stack-specific UI issues are suspected.
- `ios-spm-config-specialist`
  - If package resolution/SPM build problems are involved.

You can orchestrate a small investigation pipeline:

```typescript
Task({
  subagent_type: "ios-testing-specialist",
  description: "Analyze failing tests and error output",
  prompt: `
We are doing root-cause analysis for an iOS failure.

SYMPTOM:
<error message / failing test name / reproduction command>

CONTEXT:
<summary from ProjectContext + memory hits>

Your job:
- Identify which tests and files are directly involved.
- Hypothesize likely root causes based on test failures and patterns.
- DO NOT fix code; focus on diagnosis.
  `
})
```

Then:

```typescript
Task({
  subagent_type: "ios-verification",
  description: "Run targeted build/test to validate hypotheses",
  prompt: `
Run minimal build/test commands to confirm the suspected root cause, using the reproduction info.
Capture:
- Which targets/schemes fail
- Which tests fail
- Key error messages
Do not attempt to fix anything; report findings only.
  `
})
```

Add `ios-swiftui-specialist` / `ios-spm-config-specialist` similarly when UI/SPM issues are suspected.

### 2.2 Next.js Root-Cause Squad

Likely agents (from `agents/dev/`):

- `nextjs-verification-agent`
  - Run lint/test/build commands to localize failures.
- `nextjs-standards-enforcer`
  - Analyze recent diffs for standards violations that could cause regressions.
- `nextjs-builder`
  - For analysis only (tell it not to edit, just to inspect).

You can call:

```typescript
Task({
  subagent_type: "nextjs-verification-agent",
  description: "Investigate Next.js failure",
  prompt: `
We are diagnosing a Next.js failure.

SYMPTOM:
<error / failing test / reproduction command>

CONTEXT:
<ProjectContext summary + memory hits>

Your job:
- Run minimal commands (lint/test/build) to pinpoint where the failure arises.
- Identify the files and components involved.
- Summarize likely root cause(s) without changing any code.
  `
})
```

Optionally add `nextjs-standards-enforcer` to inspect diffs if this is a regression after recent changes.

### 2.3 Expo Root-Cause Squad

Agents (from `agents/expo/`):

- `expo-verification-agent`
- `api-guardian` / `bundle-assassin` / `impact-analyzer`
- `expo-architect-agent` (for architectural issues)

Use the same pattern as Next.js, but with Expo/React Native context and
commands.

### 2.4 Data / SEO / OS-Dev

For other domains:

- Data:
  - Data agents under `agents/data/` to inspect scripts and notebook flows.
- SEO:
  - `seo-brief-strategist`, `seo-quality-guardian` for content/SEO issues.
- OS-Dev:
  - OS-Dev agents (`os-dev-architect`, `os-dev-builder`, `os-dev-standards-enforcer`) **in diagnostic mode** to analyze whether OS 3.0 config or hooks are causing failures.

---

## 3. Produce a Root Cause Report

After the root-cause squad agents respond:

1. Synthesize:
   - The most likely root cause(s).
   - Evidence:
     - Tests failing, stack traces, files, and lines.
   - Competing hypotheses (if any) and how to disambiguate.

2. Store an audit trail (optional but recommended):

- Use `mcp__project-context__save_task_history` with:
  - `domain`: detected domain (`"ios"`, `"nextjs"`, `"expo"`, `"os-dev"`, etc.)
  - `task`: `"root-cause: <short symptom summary>"`
  - `outcome`: `"diagnosed"` or `"partial"`
  - `learnings`: list of bullet points from the investigation

3. Present a concise Root Cause Report to the user:

- Summary:
  - “Most likely root cause: …”
- Evidence:
  - “Confirmed by failing tests: …”
- Suggested next command(s):
  - e.g. `/ios "implement requirement <id>"` or `/nextjs "..."` for fixes.

---

## 4. Safety & Role Boundary

- `/root-cause` must **never**:
  - Use `Edit` / `Write` / `MultiEdit`.
  - Attempt to “quick fix” the issue.
- It may:
  - Read files/logs as needed to understand behavior.
  - Run safe commands via delegated verification agents.
  - Call Task to coordinate domain-specific specialists.

Fixing the issue should be done via the appropriate pipeline:

- iOS: `/plan` → `/orca` → `/ios`
- Next.js: `/plan` → `/orca` → `/nextjs`
- Expo: `/plan` → `/orca` → `/expo`
- OS-Dev: `/plan` → `/orca-os-dev`
