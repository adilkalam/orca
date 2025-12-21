# Common Pitfalls to Avoid

Critical mistakes that waste time and produce poor results. Extracted from Lovable and other production systems.

## Pitfall 1: Reading Files Already in Context

**The Problem:** Re-reading files that were already provided in the context wastes tokens and time.

DO:
- Check "useful-context" or provided files FIRST
- Trust that context provided is current and accurate
- Only read files NOT already in your context
- Note which files you've already seen

DON'T:
- Read files that were just shown to you
- Re-read files after every small change
- Assume context is stale without evidence
- Request the same file multiple times in a session

### Detection

If you find yourself about to read a file, ask: "Was this file already provided in my context?" If yes, use the existing content.

## Pitfall 2: Writing Without Reading

**The Problem:** Editing files you haven't read leads to breaking existing code.

DO:
- ALWAYS read a file before writing to it (unless just created)
- Understand the file's structure and patterns first
- Check imports, exports, and dependencies
- Preserve existing code style and conventions

DON'T:
- Assume you know what's in a file
- Write to a file based only on its name
- Overwrite files without understanding their content
- Trust your memory of a file from earlier in the session

### Exception

Only skip reading if you just created the file in the current session.

## Pitfall 3: Sequential Tool Calls

**The Problem:** Making tool calls one at a time when they could be batched wastes time and tokens.

DO:
- Batch independent operations in a single message
- Read multiple files simultaneously when needed
- Run parallel searches for different queries
- Combine independent writes when safe

DON'T:
- Make sequential tool calls when they can be combined
- Wait for one file read before starting another unrelated read
- Chain independent operations unnecessarily
- Process items one-by-one when batch processing is possible

### Example

```
// BAD: Sequential (3 round trips)
Read file A -> wait -> Read file B -> wait -> Read file C

// GOOD: Parallel (1 round trip)
Read file A, Read file B, Read file C (all in one message)
```

### When Sequential IS Required

- Operation B depends on the result of operation A
- You need to read a file before editing it
- Error in first operation should prevent subsequent operations

## Pitfall 4: Premature Coding

**The Problem:** Starting to write code before understanding what the user actually wants.

DO:
- Clarify requirements before implementing
- Ask questions when scope is unclear
- Discuss approach before writing code
- Wait for explicit action words: "implement", "create", "build", "code", "make"

DON'T:
- Start coding immediately on every request
- Assume you know what the user wants
- Implement features that weren't requested
- Skip the planning phase for complex tasks

### Detection Phrases

When user says these, they usually want discussion, not code:
- "What do you think about..."
- "How would you approach..."
- "Can you explain..."
- "What are the options for..."

When user says these, they want action:
- "Implement..."
- "Create..."
- "Build..."
- "Fix..."
- "Add..."

## Pitfall 5: Overengineering

**The Problem:** Adding features, abstractions, or complexity that wasn't requested.

DO:
- Implement exactly what was asked
- Keep solutions simple and focused
- Use existing patterns in the codebase
- Ask before adding "nice-to-have" features

DON'T:
- Add features "just in case"
- Create abstractions for single-use code
- Anticipate requirements that weren't stated
- Optimize before there's a proven need

### Threshold

If you're about to add something not explicitly requested, STOP and ask:
"Would you also like me to add [feature]?"

### Examples of Overengineering

- Adding caching when not asked
- Creating a base class for one implementation
- Building a plugin system for two variants
- Adding internationalization (i18n) without request
- Implementing undo/redo when not specified

## Pitfall 6: Scope Creep

**The Problem:** Expanding beyond the explicit request into related but unrequested changes.

DO:
- Stay strictly within the boundaries of the request
- Note related improvements without implementing them
- Ask permission before expanding scope
- Complete the original request before suggesting additions

DON'T:
- Refactor "while you're in there"
- Fix unrelated issues you notice
- Improve code style in files you're not asked to touch
- Add tests for code you didn't change
- Update dependencies when fixing a bug

### Rule

If a change isn't required to complete the explicit request, DON'T MAKE IT.

### Communication Pattern

```
I've completed [the requested change].

I noticed [related issue] while working on this. Would you like me to address that as well?
```

## Pitfall 7: Monolithic Files

**The Problem:** Creating large files that are hard to maintain and understand.

DO:
- Create a new file for every new component or hook
- Keep components under 50 lines of code
- Split large files into focused modules
- Extract reusable logic into utilities

DON'T:
- Add new components to existing files
- Create files over 200 lines
- Mix multiple responsibilities in one file
- Delay refactoring until files are unmanageable

### Thresholds

- React components: Max 50 lines (prefer 30)
- Utility/helper files: Max 150 lines
- Configuration files: Max 100 lines
- If approaching limit, split BEFORE exceeding

### Splitting Strategy

When a file grows too large:
1. Identify distinct responsibilities
2. Extract each to its own file
3. Create an index file if needed for re-exports
4. Update imports in consuming files

## Summary Checklist

Before completing any task, verify:
- [ ] Did I avoid re-reading files already in context?
- [ ] Did I read files before modifying them?
- [ ] Did I batch independent operations?
- [ ] Did I clarify requirements before coding?
- [ ] Did I implement ONLY what was requested?
- [ ] Did I stay within the explicit scope?
- [ ] Are all files under size limits?
