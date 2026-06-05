---
name: shape
description: "Plan the UX and UI for a feature before writing code. Runs a structured discovery interview, then produces a design brief that guides implementation. Use during the planning phase to establish design direction, constraints, and strategy before any code is written."
argument-hint: "[feature to shape]"
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}impeccable, which contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding. If no design context exists yet, you MUST run {{command_prefix}}impeccable teach first.

---

## Register calibration (NEW — runs BEFORE Bakaus's discovery interview)

Invoke `interfaces-that-feel` peer skill first to determine the product's emotional register: joy/belonging, efficiency/competence, trust/safety, or urgency/clarity. The register conditions which parts of the main spine apply fully vs. which dial back.

See `skills/interfaces-that-feel/SKILL.md` for the calibration table.

---

Shape the UX and UI for a feature before any code is written. This skill produces a **design brief**: a structured artifact that guides implementation through discovery, not guesswork.

**Scope**: Design planning only. This skill does NOT write code. It produces the thinking that makes code good.

**Output**: A design brief that can be handed off to {{command_prefix}}impeccable craft, {{command_prefix}}impeccable, or any other implementation skill.

## Philosophy

Most AI-generated UIs fail not because of bad code, but because of skipped thinking. They jump to "here's a card grid" without asking "what is the user trying to accomplish?" This skill inverts that: understand deeply first, so implementation is precise.

## Phase 1: Discovery Interview

**Do NOT write any code or make any design decisions during this phase.** Your only job is to understand the feature deeply enough to make excellent design decisions later.

Ask these questions in conversation, adapting based on answers. Don't dump them all at once; have a natural dialogue. {{ask_instruction}}

### Purpose & Context
- What is this feature for? What problem does it solve?
- Who specifically will use it? (Not "users"; be specific: role, context, frequency)
- What does success look like? How will you know this feature is working?
- What's the user's state of mind when they reach this feature? (Rushed? Exploring? Anxious? Focused?)

### Content & Data
- What content or data does this feature display or collect?
- What are the realistic ranges? (Minimum, typical, maximum, e.g., 0 items, 5 items, 500 items)
- What are the edge cases? (Empty state, error state, first-time use, power user)
- Is any content dynamic? What changes and how often?

### Design Goals
- What's the single most important thing a user should do or understand here?
- What should this feel like? (Fast/efficient? Calm/trustworthy? Fun/playful? Premium/refined?)
- Are there existing patterns in the product this should be consistent with?
- Are there specific examples (inside or outside the product) that capture what you're going for?

### Constraints
- Are there technical constraints? (Framework, performance budget, browser support)
- Are there content constraints? (Localization, dynamic text length, user-generated content)
- Mobile/responsive requirements?
- Accessibility requirements beyond WCAG AA?

### Anti-Goals
- What should this NOT be? What would be a wrong direction?
- What's the biggest risk of getting this wrong?

## Phase 2: Design Brief

After the interview, synthesize everything into a structured design brief. Present it to the user for confirmation before considering this skill complete.

### Brief Structure

**1. Feature Summary** (2-3 sentences)
What this is, who it's for, what it needs to accomplish.

**2. Primary User Action**
The single most important thing a user should do or understand here.

**3. Design Direction**
How this should feel. What aesthetic approach fits. Reference the project's design context from `.impeccable.md` and explain how this feature should express it.

**4. Layout Strategy**
High-level spatial approach: what gets emphasis, what's secondary, how information flows. Describe the visual hierarchy and rhythm, not specific CSS.

**5. Key States**
List every state the feature needs: default, empty, loading, error, success, edge cases. For each, note what the user needs to see and feel.

**6. Interaction Model**
How users interact with this feature. What happens on click, hover, scroll? What feedback do they get? What's the flow from entry to completion?

**7. Content Requirements**
What copy, labels, empty state messages, error messages, and microcopy are needed. Note any dynamic content and its realistic ranges.

**8. Recommended References**
Based on the brief, list which impeccable reference files would be most valuable during implementation (e.g., spatial-design.md for complex layouts, motion-design.md for animated features, interaction-design.md for form-heavy features).

**9. Open Questions**
Anything unresolved that the implementer should resolve during build.

---

{{ask_instruction}} Get explicit confirmation of the brief before finishing. If the user disagrees with any part, revisit the relevant discovery questions.

Once confirmed, the brief is complete. The user can now hand it to {{command_prefix}}impeccable, or use it to guide any other implementation approach. (If the user wants the full discovery-then-build flow in one step, they should use {{command_prefix}}impeccable craft instead, which runs this skill internally.)

---

## Rant-capture at handback

After completing the work, before returning to the user, ask:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append the entry to the current project's `.orca/design-rants-pending.md` in this format:

```
## YYYY-MM-DD HH:MM — [verb-name]
[user's response verbatim]
```

Create `.orca/` in the current project if absent. Do NOT write to `~/.claude/` or to the ORCA-OS source tree directly. Pending entries are swept and categorized later via `/impeccable extract rants`.
