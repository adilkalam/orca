---
name: shape
description: Plan the UX and UI for a feature before writing code. Runs a structured discovery interview, then produces a design brief that guides implementation. Use during the planning phase to establish design direction, constraints, and strategy before any code is written.
---

## Preparation

Read the `impeccable-hub` skill first if available this conversation.

---

## Register calibration (runs BEFORE the discovery interview)

Use the `interfaces-that-feel` skill to determine the product's emotional register: joy/belonging, efficiency/competence, trust/safety, or urgency/clarity. The register conditions which parts of design craft apply fully vs. dial back.

---

Shape the UX and UI for a feature before any code is written. This skill produces a **design brief**: a structured artifact that guides implementation through discovery, not guesswork.

**Scope**: Design planning only. This skill does NOT write code. It produces the thinking that makes code good.

## Philosophy

Most AI-generated UIs fail not because of bad code, but because of skipped thinking. They jump to "here's a card grid" without asking "what is the user trying to accomplish?" This skill inverts that: understand deeply first, so implementation is precise.

## Phase 1: Discovery Interview

**Do NOT write any code or make any design decisions during this phase.** Your only job is to understand the feature deeply enough to make excellent design decisions later.

Ask these questions in conversation, adapting based on answers. Don't dump them all at once — have a natural dialogue.

### Purpose & Context
- What is this feature for? What problem does it solve?
- Who specifically will use it? (Not "users" — role, context, frequency)
- What does success look like?
- What's the user's state of mind when they reach this feature? (Rushed? Exploring? Anxious? Focused?)

### Content & Data
- What content or data does this feature display or collect?
- What are the realistic ranges? (0 items, 5 items, 500 items)
- What are the edge cases? (empty, error, first-time, power user)
- Is any content dynamic? What changes and how often?

### Design Goals
- What's the single most important thing a user should do or understand here?
- What should this feel like? (Fast/efficient? Calm/trustworthy? Fun/playful? Premium/refined?)
- Are there existing patterns in the product this should be consistent with?
- Any specific examples (inside or outside the product) that capture the target?

### Constraints
- Technical constraints? (Framework, performance budget, browser support)
- Content constraints? (Localization, dynamic text length, user-generated content)
- Mobile/responsive requirements?
- Accessibility requirements beyond WCAG AA?

### Anti-Goals
- What should this NOT be? What would be a wrong direction?
- What's the biggest risk of getting this wrong?

## Phase 2: Design Brief

After the interview, synthesize everything into a structured design brief. Present it for confirmation before considering this skill complete.

### Brief Structure

**1. Feature Summary** (2-3 sentences) — what this is, who it's for, what it needs to accomplish.

**2. Primary User Action** — the single most important thing a user should do or understand here.

**3. Design Direction** — how this should feel, what aesthetic approach fits.

**4. Layout Strategy** — high-level spatial approach: what gets emphasis, what's secondary, how information flows. Describe hierarchy and rhythm, not specific CSS.

**5. Key States** — every state the feature needs: default, empty, loading, error, success, edge cases. For each, note what the user needs to see and feel.

**6. Interaction Model** — how users interact: what happens on click, hover, scroll; what feedback they get; the flow from entry to completion.

**7. Content Requirements** — copy, labels, empty-state messages, error messages, microcopy. Note dynamic content and realistic ranges.

**8. Recommended Skills** — which other design skills in this pack would be most valuable during implementation (e.g. `layout` for complex spatial work, `animate`/`animation-engineering` for motion-heavy features, `clarify` for form-heavy features).

**9. Open Questions** — anything unresolved that implementation should resolve.

---

Get explicit confirmation of the brief before finishing. If the user disagrees with any part, revisit the relevant discovery questions.

Once confirmed, the brief is complete — hand it to whichever design skill (or your own implementation) does the actual build.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
