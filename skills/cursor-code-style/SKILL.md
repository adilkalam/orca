# Cursor Code Style

Rules extracted from Cursor Agent prompt for consistent, high-quality code.

## Variable Naming

DO:
- Use descriptive names that reveal intent
- Functions should be verbs/verb-phrases: `getUserById`, `calculateTotal`, `validateInput`
- Variables should be nouns/noun-phrases: `userCount`, `totalPrice`, `validationResult`
- Use consistent naming conventions per language (camelCase for JS/TS, snake_case for Python)

DON'T:
- Never use 1-2 character variable names (EXCEPTION: loop counters `i`, `j`, `k` and coordinates `x`, `y`)
- Avoid abbreviations unless universally understood: `genYmdStr` -> `generateDateString`
- Don't use generic names: `data`, `info`, `temp`, `result` without context

### Examples

```
Bad:  const d = getData()
Good: const userProfile = fetchUserProfile()

Bad:  function proc(x) { ... }
Good: function processPayment(transaction) { ... }

Bad:  let n = users.length
Good: let userCount = users.length
```

## Control Flow

DO:
- Use guard clauses and early returns to reduce nesting
- Handle error and edge cases FIRST, then happy path
- Keep nesting to 2-3 levels maximum
- Prefer `switch` or object lookup over long `if-else` chains

DON'T:
- Create deeply nested if/else chains (>3 levels)
- Put the happy path inside nested conditions
- Use `else` after a `return` statement

### Examples

```typescript
// BAD: Deep nesting
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // happy path buried 3 levels deep
        return doWork(user)
      }
    }
  }
  return null
}

// GOOD: Guard clauses
function processUser(user) {
  if (!user) return null
  if (!user.isActive) return null
  if (!user.hasPermission) return null
  
  return doWork(user)  // happy path at top level
}
```

## Comments

DO:
- Add comments for complex code explaining "why" not "how"
- Document non-obvious business rules
- Use JSDoc/docstrings for public APIs
- Comment regex patterns with what they match

DON'T:
- Add comments for trivial or obvious code
- Leave TODO comments (implement the fix instead)
- Write comments that restate the code
- Use comments to disable code (delete it or use version control)

### Examples

```typescript
// BAD: Restates the code
// Increment counter by 1
counter++

// GOOD: Explains why
// Rate limit: max 100 requests per minute per user
if (requestCount > 100) return rateLimitError()

// BAD: TODO that never gets done
// TODO: handle edge case

// GOOD: Actually handle it or create an issue
if (edgeCase) {
  throw new NotImplementedError('Edge case X - see issue #123')
}
```

## Function Design

DO:
- Keep functions under 50 lines (prefer 20-30)
- Single responsibility: one function, one job
- Use pure functions where possible (same input -> same output)
- Prefer explicit parameters over relying on closure/global state
- Return early for invalid states

DON'T:
- Create functions with more than 4-5 parameters (use object parameter)
- Mix side effects with return values
- Create functions that do multiple unrelated things
- Use boolean parameters that change behavior (use separate functions)

### Examples

```typescript
// BAD: Too many parameters
function createUser(name, email, age, role, department, startDate, manager) { ... }

// GOOD: Object parameter
function createUser({ name, email, age, role, department, startDate, manager }) { ... }

// BAD: Boolean changes behavior
function fetchData(includeMetadata) {
  if (includeMetadata) { ... }
  else { ... }
}

// GOOD: Separate functions
function fetchData() { ... }
function fetchDataWithMetadata() { ... }
```

## Error Handling

DO:
- Handle errors at the appropriate level
- Provide meaningful error messages with context
- Use typed errors when available
- Fail fast and fail loudly during development

DON'T:
- Swallow errors silently
- Use generic catch-all handlers everywhere
- Return null/undefined to indicate errors (use exceptions or Result types)
- Log errors without handling them

### Examples

```typescript
// BAD: Silent failure
try {
  await saveUser(user)
} catch (e) {
  // nothing
}

// GOOD: Meaningful handling
try {
  await saveUser(user)
} catch (error) {
  logger.error('Failed to save user', { userId: user.id, error })
  throw new UserSaveError(`Could not save user ${user.id}: ${error.message}`)
}
```

## Code Organization

DO:
- Group related code together
- Order functions by call hierarchy (callers before callees) OR alphabetically
- Keep files focused on a single responsibility
- Use consistent file/folder structure across the project

DON'T:
- Scatter related logic across multiple files
- Mix different concerns in one file
- Create deep nested folder structures (max 3-4 levels)
- Let files grow beyond 200-300 lines

## When to Apply

Apply these rules to ALL code you write or modify, regardless of language or framework. When modifying existing code, follow the established patterns in that codebase unless they violate these rules egregiously.
