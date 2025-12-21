---
description: In-depth UI/UX audit using design reviewer agents with Puppeteer MCP
---

# /design-review — Visual Quality Gate

Triggers the appropriate design reviewer agent for comprehensive UI/UX auditing.

## Usage

```
/design-review [URL or description]
/design-review http://localhost:3000
/design-review "Check the checkout flow"
/design-review  # defaults to localhost:3000
```

## What This Does

1. **Detects stack** from current project (Next.js, iOS, Expo)
2. **Routes to appropriate reviewer**:
   - Next.js → `nextjs-design-reviewer`
   - iOS → `ios-ui-reviewer`
   - Expo → `expo-aesthetics-specialist`
3. **Runs comprehensive audit** using Puppeteer MCP (web) or simulator tools (mobile)

## Execution

### Step 1: Detect Stack

Check for indicators:
- `next.config.*` or `package.json` with "next" → Next.js
- `*.xcodeproj` or `Package.swift` → iOS
- `app.json` with "expo" or `expo` in package.json → Expo

### Step 2: Launch Reviewer Agent

```
# For Next.js:
Task tool → subagent_type: "nextjs-design-reviewer"

# For iOS:
Task tool → subagent_type: "ios-ui-reviewer"

# For Expo:
Task tool → subagent_type: "expo-aesthetics-specialist"
```

### Step 3: Agent Prompt

Pass to the reviewer agent:

```
Perform a comprehensive UI/UX audit.

Target: [URL or description from user, default: http://localhost:3000]

Requirements:
1. Take screenshots at all breakpoints (desktop 1440px, tablet 768px, mobile 375px)
2. Check console for errors/warnings
3. Evaluate against design-dna tokens if available (check .claude/design-dna/)
4. Measure actual pixel values for spacing/alignment
5. Report findings in priority order: Blockers → High → Medium → Nitpicks

If user provided a reference screenshot, follow the EXPLICIT COMPARISON protocol:
- Analyze user's screenshot first
- Take your own screenshot
- Compare issue-by-issue with YES/NO
- Only PASS if ALL issues are fixed

Output: Save screenshots to .claude/orchestration/evidence/screenshots/
```

## Expected Output

The reviewer agent will produce:

```
### Design Review Summary
- URL: [target]
- Viewports: Desktop (1440), Tablet (768), Mobile (375)
- Screenshots: [paths]

### Pixel Measurements
[Table of measured values vs expected]

### Findings

#### Blockers (FAIL - must fix before ship)
- [Issue with screenshot + pixel evidence]

#### High Priority
- [Issue with evidence]

#### Medium Priority
- [Issue]

#### Nitpicks
- [Minor issues]

### Verdict
- [ ] PASS - Ready to ship
- [ ] FAIL - Needs fixes (list blocking issues)
```

## Verification Enforcement (MANDATORY)

### Pixel Measurement Protocol

Reviewers MUST calculate exact pixel values - no vague language:

```
MEASUREMENTS:

 Element                          Actual    Expected 

 Section gap                      24px      24px     
 Card padding                     16px      16px     

```

**Zero tolerance** when expected value exists (1px off = FAIL).
**CAUTION** when no reference exists or in legacy surfaces.

### Explicit Comparison (When User Provides Screenshot)

1. Analyze user's screenshot FIRST
2. Take your own screenshot
3. Compare issue-by-issue with YES/NO
4. Only PASS if ALL user-identified issues are fixed

### Claim Language

- NEVER say "looks correct" without pixel measurements
- NEVER say "verified" without explicit comparison proof
- If verification blocked → "UNVERIFIED" prominently at top

## Notes

- This command does NOT modify code - it only audits
- For fixes, use `/orca-{domain}` with the audit findings
- Screenshots saved to `.claude/orchestration/evidence/screenshots/`
- Console logs saved to `.claude/orchestration/evidence/logs/`
