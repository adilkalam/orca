# Linter Loop Limits

RULE: Do NOT loop more than 3 times fixing linter errors on the same file.

## The Problem

Agents can get stuck in infinite loops trying to fix linter errors, wasting tokens and time without making progress. Each failed attempt often introduces new issues or reverts previous fixes.

## The 3-Strike Rule

### Strike 1: Initial Fix

- Read the linter error carefully
- Understand what the rule is checking
- Make targeted fix based on error message
- Run linter again

### Strike 2: Second Attempt

- If first fix didn't work, analyze WHY
- Consider if the error message is misleading
- Check if there are conflicting rules
- Try a different approach
- Run linter again

### Strike 3: Final Attempt

- If still failing, step back and reconsider
- Check if there's a fundamental misunderstanding
- Review linter configuration
- Make one more targeted fix
- Run linter again

### After 3 Strikes: STOP

If the error persists after 3 attempts:

DO:
- STOP trying to fix it automatically
- Present the error to the user
- Explain what you've tried
- Ask for guidance
- Document the approaches that failed

DON'T:
- Keep looping hoping it will work
- Try random fixes
- Suppress or ignore the error
- Modify linter config to hide the issue
- Add `eslint-disable` comments without permission

## Communication Template

After 3 failed attempts, use this format:

```
I've attempted to fix this linter error 3 times without success:

**Error:** [exact error message]
**File:** [file path and line number]
**Rule:** [linter rule name if available]

**Attempts made:**
1. [First approach] - Result: [what happened]
2. [Second approach] - Result: [what happened]  
3. [Third approach] - Result: [what happened]

**My analysis:** [why it might be failing]

How would you like me to proceed?
- Option A: Try a specific fix you suggest
- Option B: Disable this rule for this line (with eslint-disable)
- Option C: Investigate the root cause further
- Option D: Skip this for now and continue
```

## Common Linter Loop Causes

### Type Errors (TypeScript)

Symptoms:
- Missing type definitions
- Incorrect generic parameters
- Module augmentation issues
- `any` type errors

Resolution may need:
- Install @types packages
- Update tsconfig.json
- Add type declarations
- User guidance on project types

### Import Errors

Symptoms:
- Circular dependencies
- Missing exports
- Path resolution issues
- Module not found

Resolution may need:
- Architectural changes
- Path alias configuration
- Export restructuring
- User decision on structure

### Style Errors

Symptoms:
- Conflicting rules (ESLint vs Prettier)
- Project-specific conventions
- Formatting that keeps reverting

Resolution may need:
- Config file changes
- Prettier/ESLint alignment
- User preference input

### Runtime vs Compile Errors

Symptoms:
- Error seems to be about runtime behavior
- Type system can't verify correctness
- Logic errors masquerading as lint errors

Resolution may need:
- Different fix approach
- Type assertions (with user approval)
- Architectural changes

## Tracking Your Attempts

Keep explicit count in your reasoning:

```
Linter attempt 1/3 on [file]: 
  Error: [error]
  Approach: [what you tried]
  Result: [outcome]

Linter attempt 2/3 on [file]:
  Error: [same or new error]
  Approach: [different approach]
  Result: [outcome]

Linter attempt 3/3 on [file]:
  Error: [error]
  Approach: [final approach]
  Result: [outcome]

-> 3 strikes reached on [file]. Stopping and asking user.
```

## Exceptions to the 3-Strike Rule

### The rule does NOT apply when:

- You're making progress (different errors each time)
- User explicitly asks you to keep trying
- The error is clearly a typo you can fix
- Each attempt reveals new information
- You're working through a list of different errors

### The rule DOES apply when:

- Same error repeats after each fix
- Fixes are causing new errors of the same type
- You're guessing at solutions
- The fix reverts or conflicts with itself
- You don't understand why the error occurs

## Prevention Strategies

### Before You Start Fixing

1. **Read the full error message** - including suggestions
2. **Check the linter rule documentation** - understand what it wants
3. **Look at similar code in the project** - see how others solved it
4. **Consider if the code is fundamentally wrong** - not just stylistically

### During Fixing

1. **Make minimal changes** - don't refactor while fixing lint
2. **Fix one error at a time** - don't batch unrelated fixes
3. **Verify the fix** - run linter after each change
4. **Keep track of what you changed** - for potential rollback

## Integration with Other Skills

- **search-before-edit:** Search for how similar lint errors are handled elsewhere
- **debugging-first:** Treat persistent lint errors like bugs - gather evidence
- **lovable-pitfalls:** Don't overengineer solutions to lint errors
