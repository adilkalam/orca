---
name: decomposition
title: Decomposition
tags: [planning, architecture]
---

# Decomposition

Break complex problems into smaller, tractable pieces that can be solved independently.

## When to Use
- Problem feels overwhelming or unclear where to start
- Task is too big to estimate or plan
- Need to parallelize work across people
- Complexity hides in interactions between parts

## Process

### Step 1: State the Whole Problem
Clearly define what needs to be accomplished.
- "Build a user authentication system"

### Step 2: Identify Natural Seams
Look for boundaries where pieces have minimal interaction:
- Different data domains
- Different user interactions
- Different technical concerns
- Different lifecycles

### Step 3: Decompose Along Seams
Split into sub-problems, each addressing one aspect:
- User registration
- Login/logout
- Password reset
- Session management
- Permission checking

### Step 4: Check for Independence
For each piece, ask:
- Can this be built without the others?
- Can this be tested in isolation?
- Can this be understood without full context?

If no, decomposition may be wrong—try different seams.

### Step 5: Identify Interfaces
What does each piece need from others?
- Registration needs: email service, database
- Login needs: session manager, password hasher
- Define these interfaces before building

### Step 6: Solve Pieces
Work on pieces individually, then integrate.

## Key Principle
Good decomposition maximizes cohesion within pieces and minimizes coupling between them.

## Example Application

**Problem:** "Implement file upload feature"

**Decomposition:**

1. **Client-side**
   - File selection UI
   - Preview generation
   - Upload progress display
   - Error handling UI

2. **Upload handling**
   - Multipart parsing
   - File validation (type, size)
   - Virus scanning

3. **Storage**
   - Storage backend abstraction
   - Path/naming strategy
   - Metadata persistence

4. **Post-processing**
   - Thumbnail generation
   - Format conversion
   - CDN invalidation

5. **Retrieval**
   - Access control
   - URL signing
   - Download tracking

**Interfaces identified:**
- Upload handler → Storage: `store(file, metadata): url`
- Storage → Post-processing: `process(stored_file): void`
- Retrieval → Storage: `get_url(file_id, permissions): signed_url`

## Common Mistakes / Anti-patterns
- Decomposing by code file rather than by concern
- Pieces that share mutable state
- Too fine-grained (100 tiny pieces)
- Not defining interfaces before implementing
- Circular dependencies between pieces
