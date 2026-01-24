---
description: "Initialize or update CLAUDE.md with project-specific conventions"
argument-hint: "[init|update|audit]"
allowed-tools:
  ["Read", "Write", "Edit", "Bash", "Glob", "Grep",
   "AskUserQuestion", "mcp__project-context__query_context",
   "mcp__project-context__save_decision"]
---

# /project-setup - Project Conventions Wizard

Guide users through project structure decisions and generate a CLAUDE.md file tailored to their project type. Command: **$ARGUMENTS**

You are a **project setup orchestrator** that:
- Detects project type automatically
- Observes existing project patterns
- Asks focused questions (4 total: 2 shared + 2 type-specific)
- Generates actionable CLAUDE.md rules

---

## 1. Determine Subcommand

Parse `$ARGUMENTS` to determine mode:

| Subcommand | Behavior |
|------------|----------|
| `init` or empty | Full initialization flow |
| `update` | Update existing CLAUDE.md with new conventions |
| `audit` | Check CLAUDE.md health and staleness |

---

## 2. Detect Project Type

Run project type detection (same logic as `hooks/detect-project-type.sh`):

```bash
# iOS/Swift
if ls *.xcodeproj >/dev/null 2>&1 || ls *.xcworkspace >/dev/null 2>&1; then
  PROJECT_TYPE="ios"
# Next.js
elif [ -f "package.json" ] && grep -q '"next"' package.json 2>/dev/null; then
  PROJECT_TYPE="nextjs"
# React
elif [ -f "package.json" ] && grep -q '"react"' package.json 2>/dev/null; then
  PROJECT_TYPE="react"
# Python
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
  PROJECT_TYPE="python"
# Flutter
elif [ -f "pubspec.yaml" ]; then
  PROJECT_TYPE="flutter"
# React Native
elif [ -f "package.json" ] && [ -d "ios" ] && [ -d "android" ]; then
  PROJECT_TYPE="react-native"
# Generic
else
  PROJECT_TYPE="generic"
fi
```

Output: "Detected project type: **{PROJECT_TYPE}**"

---

## 3. Observe Project Structure (Always On)

BEFORE asking questions, scan for existing patterns:

```bash
# Archive-like folders
find . -maxdepth 2 -type d \( -name ".archived" -o -name "_deprecated" -o -name "old" -o -name "archive" \) 2>/dev/null | head -5

# Working/temp folders
find . -maxdepth 2 -type d \( -name ".claude" -o -name ".tmp" -o -name "temp" -o -name "scratch" \) 2>/dev/null | head -5

# Documentation folders
find . -maxdepth 2 -type d \( -name "docs" -o -name "documentation" -o -name "wiki" \) 2>/dev/null | head -5

# Check for existing CLAUDE.md
ls -la CLAUDE.md 2>/dev/null
```

Store observations for display during questions.

---

## 4. Handle Existing CLAUDE.md

If CLAUDE.md exists, ask:

```
AskUserQuestion:
  question: |
    CLAUDE.md already exists in this project.
    
    How would you like to proceed?
  options:
    - "Merge - Add new sections, preserve your existing rules"
    - "Replace - Generate fresh CLAUDE.md (existing content will be backed up)"
    - "Cancel - Exit without changes"
```

If "Replace" selected:
```bash
mkdir -p .claude/backups
cp CLAUDE.md ".claude/backups/CLAUDE.md.$(date +%Y-%m-%d-%H%M).bak"
```

If "Cancel" selected: Exit with message "Setup cancelled. No changes made."

---

## 5. Question Flow

Ask exactly **4 questions** (2 shared + 2 type-specific).

### Shared Questions (All Types)

**Q1: Archive/Deprecation Strategy**

```
AskUserQuestion:
  question: |
    Where should archived or deprecated code go?
    
    [Observation] {show any archive folders found, or "No existing archive folder detected"}
  options:
    - ".archived/ (recommended)"
    - "_deprecated/"
    - "Delete immediately (no archive)"
    - "Other (I'll specify)"
```

If "Other" selected, ask for custom path.

**Q2: Working Files Location**

```
AskUserQuestion:
  question: |
    Where should Claude put temporary/working files?
    
    [Observation] {show any working folders found, or "No existing working folder detected"}
  options:
    - ".claude/temp/ (recommended)"
    - ".tmp/"
    - "Other (I'll specify)"
```

If "Other" selected, ask for custom path.

### Type-Specific Questions

#### iOS

**Q3:**
```
AskUserQuestion:
  question: "Dependency management approach?"
  options:
    - "Swift Package Manager (SPM)"
    - "CocoaPods"
    - "Both SPM and CocoaPods"
```

**Q4:**
```
AskUserQuestion:
  question: |
    Additional sacred directories beyond auto-detected?
    
    [Auto-detected] Pods/, *.xcodeproj/, *.xcworkspace/, DerivedData/
  options:
    - "No additional directories"
    - "Add custom (I'll specify)"
```

#### Next.js

**Q3:**
```
AskUserQuestion:
  question: "Router type in use?"
  options:
    - "App Router (app/)"
    - "Pages Router (pages/)"
    - "Both"
```

**Q4:**
```
AskUserQuestion:
  question: "Documentation location preference?"
  options:
    - "/docs directory"
    - "README hierarchy (README.md in each major folder)"
    - "Inline comments only"
```

#### React

**Q3:**
```
AskUserQuestion:
  question: "Build tool?"
  options:
    - "Vite"
    - "Create React App"
    - "Custom webpack"
    - "Other"
```

**Q4:**
```
AskUserQuestion:
  question: "State management?"
  options:
    - "Redux / Redux Toolkit"
    - "Zustand"
    - "React Context only"
    - "TanStack Query (for server state)"
    - "Other"
```

#### Python

**Q3:**
```
AskUserQuestion:
  question: "Framework in use?"
  options:
    - "Django"
    - "Flask"
    - "FastAPI"
    - "None / scripts only"
    - "Other"
```

**Q4:**
```
AskUserQuestion:
  question: "Virtual environment location?"
  options:
    - "venv/"
    - ".venv/"
    - "Other"
```

#### Flutter

**Q3:**
```
AskUserQuestion:
  question: "Target platforms? (select primary)"
  options:
    - "iOS and Android"
    - "iOS, Android, and Web"
    - "All platforms (iOS, Android, Web, Desktop)"
    - "Mobile only (iOS + Android)"
```

**Q4:**
```
AskUserQuestion:
  question: "State management?"
  options:
    - "Provider"
    - "Riverpod"
    - "BLoC"
    - "GetX"
    - "Other"
```

#### React Native

**Q3:**
```
AskUserQuestion:
  question: "Development workflow?"
  options:
    - "Expo (managed)"
    - "Expo (bare/ejected)"
    - "Bare React Native (no Expo)"
```

**Q4:**
```
AskUserQuestion:
  question: "Navigation library?"
  options:
    - "React Navigation"
    - "Expo Router"
    - "Other"
```

#### Generic

**Q3:**
```
AskUserQuestion:
  question: "Primary language or framework?"
  freeform: true
```

**Q4:**
```
AskUserQuestion:
  question: |
    Any specific directories to protect from modification?
    (comma-separated, or 'none')
  freeform: true
```

---

## 6. Determine Sacred Paths

Auto-detect framework-specific sacred paths based on project type:

| Type | Auto-Detected Sacred Paths |
|------|---------------------------|
| iOS | `Pods/`, `*.xcodeproj/`, `*.xcworkspace/`, `DerivedData/` |
| Next.js | `node_modules/`, `.next/`, `out/`, `public/` |
| React | `node_modules/`, `build/`, `dist/` |
| Python | `venv/`, `.venv/`, `__pycache__/`, `.eggs/`, `*.egg-info/` |
| Flutter | `build/`, `.dart_tool/`, `ios/Pods/` |
| React Native | `node_modules/`, `ios/Pods/`, `android/build/` |
| Generic | `node_modules/` (if exists), `vendor/` (if exists) |

Add any user-specified sacred paths from Q4.

---

## 7. Generate CLAUDE.md (Inline)

Generate CLAUDE.md with this structure (adapt based on answers):

```markdown
# {Project Name from directory}

This project uses **{detected type}** conventions.

## File Organization Rules

### Archive/Deprecation
- MOVE deprecated code to `{chosen archive path}` before deleting
- PREFIX archived items with date: `YYYY-MM-DD-filename`
- NEVER delete code without archiving first

### Working Files
- PUT all temporary/scratch files in `{chosen working path}`
- CLEAN working directory at end of session
- DO NOT commit working files to git

## Sacred Paths (DO NOT MODIFY)

These directories are auto-managed or external. Claude MUST NOT modify them:

{list each sacred path with reason}

## {Type}-Specific Guidelines

{framework-specific rules based on type-specific answers}

## Project-Specific Rules

{any additional rules from generic questions}

---
*Generated by /project-setup on {date}*
*Run `/project-setup update` to modify*
```

Write the file:
```bash
# Write CLAUDE.md to project root
```

---

## 8. Update Flow (`/project-setup update`)

If subcommand is `update`:

1. Read existing CLAUDE.md
2. Detect what has changed in project structure since last run
3. Ask only about NEW patterns or significant changes:
   - New archive-like folders appeared?
   - New sacred directories detected?
   - Framework configuration changed?
4. Preserve existing rules unless explicitly changed
5. Update sections with timestamp: `*Updated: {date}*`

---

## 9. Audit Flow (`/project-setup audit`)

If subcommand is `audit`:

1. Read CLAUDE.md
2. Compare rules against actual project structure:
   - Does documented archive path exist?
   - Are all sacred paths still valid?
   - Any new patterns not documented?
3. Report discrepancies:
   ```
   CLAUDE.md Audit Results
   =======================
   
   [OK] Archive path .archived/ exists
   [WARN] Sacred path Pods/ not found (may be gitignored)
   [NEW] Detected undocumented pattern: .cache/ directory
   
   Recommendation: Run `/project-setup update` to sync
   ```

---

## 10. Save Decision to ProjectContext

After successful setup:

```
mcp__project-context__save_decision:
  domain: "{detected domain}"
  decision: "Established project conventions via /project-setup"
  reasoning: "Archive: {path}, Working: {path}, Type: {type}, Sacred: {count} paths"
  tags: ["project-setup", "claude-md"]
```

---

## 11. Final Output

Provide summary:

```
Project Setup Complete
======================

Project Type: {type}
Archive Path: {path}
Working Path: {path}
Sacred Paths: {count} protected directories

Generated: CLAUDE.md

Next steps:
- Review CLAUDE.md and adjust as needed
- Run `/project-setup audit` periodically to check freshness
- Run `/project-setup update` when project structure changes
```

---

## Error Handling

- **Permission errors**: Guide user to create directories manually
- **Conflicting patterns**: Ask which to use as source of truth
- **Large projects**: Use targeted scans, not recursive find

---

## Success Criteria

- Project type detected correctly
- 4 questions asked (2 shared + 2 type-specific)
- Observations shown as context (not pre-selected)
- CLAUDE.md generated with actionable rules
- Decision saved to ProjectContext
- Existing CLAUDE.md handled with merge/replace/cancel
