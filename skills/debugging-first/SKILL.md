---
name: debugging-first
description: >
  Enforces an evidence-first approach to bug investigation. Requires agents
  to gather debugging evidence (console logs, network requests, application
  state) before examining or modifying source code.
---

# Debugging First

RULE: Use debugging tools BEFORE examining or modifying code when investigating issues.

## The Principle

When something isn't working, gather evidence FIRST before making changes. Debugging tools give you facts; guessing wastes time.

## Debugging Tool Priority

### 1. Console/Logs (First Priority)

DO:
- Check console output for errors
- Look at warning messages
- Review log files
- Check for stack traces
- Note the exact error message and location

```bash
# Browser console (via Puppeteer evaluate)
mcp__puppeteer__puppeteer_evaluate({ script: "console.log('checking...')" })

# Server logs
tail -f logs/app.log

# Build output
npm run build 2>&1 | head -50
```

### 2. Network Requests (Second Priority)

DO:
- Check API call responses
- Verify request payloads
- Look for failed requests (4xx, 5xx)
- Check response status codes
- Examine request/response headers

```bash
# Browser network (via Puppeteer evaluate)
mcp__puppeteer__puppeteer_evaluate({ script: "performance.getEntriesByType('resource')" })

# CLI testing
curl -v [endpoint]

# Check for CORS issues
# Look for preflight failures
```

### 3. Application State (Third Priority)

DO:
- Inspect current state values
- Check what data is loaded
- Verify props/arguments received
- Look at environment variables
- Check localStorage/sessionStorage

### 4. Code Examination (Last Priority)

Only AFTER gathering evidence from above:
- Read the relevant code
- Trace the execution path
- Check the logic
- Verify assumptions

## The Debugging Process

### Step 1: Gather Evidence

```
User: "The login isn't working"

Agent (CORRECT approach):
1. Check console logs for errors
2. Check network tab for API calls
3. Check what error message (if any) is shown
4. Check if user is redirected or stays on page
5. NOW look at the code with context
```

### Step 2: Analyze Before Acting

With debugging evidence in hand:
- Identify the actual failure point
- Understand the error cause
- Form a hypothesis
- Verify hypothesis before fixing

### Step 3: Targeted Fix

- Make specific changes based on evidence
- Don't guess or make broad changes
- Fix the identified issue
- Verify the fix works

## Anti-Patterns

DON'T:
- Jump straight to reading code
- Guess at what might be wrong
- Make changes without understanding the error
- Ignore error messages and "try things"
- Assume you know where the bug is
- Make multiple changes at once

### Bad Pattern Example

```
User: "Login is broken"

Agent: *immediately reads auth code*
Agent: "I see the code, let me refactor the login flow..."
Result: 2 hours wasted, wrong diagnosis, possibly new bugs introduced
```

### Good Pattern Example

```
User: "Login is broken"

Agent: "Let me check the console and network requests first."
*checks console* -> "401 Unauthorized"
*checks network* -> "Token expired, refresh token request failing"
Agent: "The issue is token refresh failure. The fix is [specific fix]"
Result: 5 minutes, correct diagnosis, targeted fix
```

## Debugging Checklist

Before modifying code to fix a bug:

- [ ] Checked console/logs for errors?
- [ ] Checked network requests (if applicable)?
- [ ] Identified the specific failure point?
- [ ] Formed a hypothesis?
- [ ] Verified hypothesis with evidence?

If any are unchecked, GO BACK and debug first.

## Evidence-Based Communication

When reporting findings, use this format:

```
**Debugging Evidence:**
- Console: [what you found - exact errors, warnings]
- Network: [what you found - status codes, payloads]
- State: [what you found - values, null checks]

**Root Cause:** [specific cause based on evidence]

**Proposed Fix:** [targeted fix addressing root cause]

**Verification Plan:** [how to confirm the fix works]
```

## Common Debugging Scenarios

### "It's not working"

1. Define "not working" - what should happen vs what happens?
2. Check console for errors
3. Check network for failed requests
4. Check if component renders
5. Identify specific failure point

### "The page is blank"

1. Check console for render errors
2. Check if JavaScript loaded
3. Check for React/framework errors
4. Check network for failed resources
5. Look for runtime exceptions

### "Data isn't showing"

1. Check network for API call
2. Verify API returned data
3. Check if data is in state
4. Check if component receives props
5. Verify render logic

### "Button doesn't do anything"

1. Check console for click handler errors
2. Verify event listener is attached
3. Check if handler function exists
4. Look for prevented default behavior
5. Check for conditional rendering issues

## When to Skip Debugging-First

Debugging-first does NOT apply when:
- User explicitly knows the issue ("fix the typo on line 42")
- Adding new features (no bug to debug)
- Refactoring working code
- Code review or explanation requests
- Documentation tasks

Debugging-first DOES apply when:
- Something "isn't working"
- User reports unexpected behavior
- Tests are failing
- Errors are occurring
- Performance issues
- Intermittent problems

## Tool-Specific Debugging

### Browser Issues

```bash
# Get console messages (via Puppeteer evaluate)
mcp__puppeteer__puppeteer_evaluate({ script: "window.errors || []" })

# Get network requests (via Performance API)
mcp__puppeteer__puppeteer_evaluate({ script: "performance.getEntriesByType('resource')" })

# Take screenshot to see current state
mcp__puppeteer__puppeteer_screenshot({ name: "debug-state" })
```

### Server Issues

```bash
# Check server logs
tail -f logs/*.log

# Check process status
ps aux | grep [process]

# Check port bindings
lsof -i :[port]
```

### Build Issues

```bash
# Run build with verbose output
npm run build --verbose

# Check TypeScript errors
npx tsc --noEmit

# Check for circular dependencies
npx madge --circular src/
```

## Integration with Other Skills

- **search-before-edit:** After debugging, search for similar issues/fixes
- **linter-loop-limits:** Debug why lint fix isn't working after 2 attempts
- **lovable-pitfalls:** Debugging prevents premature coding
