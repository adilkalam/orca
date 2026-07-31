---
name: clarify
description: Improve unclear UX copy, error messages, microcopy, labels, and instructions to make interfaces easier to understand. Use when the user mentions confusing text, unclear labels, bad error messages, hard-to-follow instructions, or wanting better UX writing.
---

Identify and improve unclear, confusing, or poorly written interface text to make the product easier to understand and use.

## Preparation

Read the `impeccable-hub` skill first if available this conversation. Additionally gather: audience technical level and users' mental state in context.

---

## Assess Current Copy

1. **Find clarity problems**: jargon, ambiguity, passive voice ("Your file has been uploaded" vs "We uploaded your file"), too wordy or too terse, assuming knowledge users don't have, missing context, tone mismatch.
2. **Understand the context**: audience (technical? general? first-time?), user's mental state (stressed during error? confident during success?), the desired action, constraints (character limits, brand voice, localization).

**CRITICAL**: Clear copy helps users succeed. Unclear copy creates frustration, errors, and support tickets.

## Plan Copy Improvements

- Primary message: what's the ONE thing users need to know?
- Action needed: what should users do next (if anything)?
- Tone: helpful? apologetic? encouraging?
- Constraints: length limits, brand voice, localization.

**IMPORTANT**: Good UX writing is invisible. Users should understand immediately without noticing the words.

## Improve Copy Systematically

### Error Messages
Bad: "Error 403: Forbidden" → Good: "You don't have permission to view this page. Contact your admin for access."
Bad: "Invalid input" → Good: "Email addresses need an @ symbol. Try: name@example.com"
Principles: explain what went wrong in plain language, suggest how to fix it, don't blame the user, include examples, link to help if applicable.

### Form Labels & Instructions
Bad: "DOB (MM/DD/YYYY)" → Good: "Date of birth" (with a placeholder showing the format)
Principles: clear specific labels (not generic placeholders), show format via examples, explain why you're asking when not obvious, instructions before the field.

### Button & CTA Text
Bad: "Click here" / "Submit" / "OK" → Good: "Create account" / "Save changes" / "Got it, thanks"
Principles: describe the action specifically, active voice, match the user's mental model.

### Help Text & Tooltips
Bad: "This is the username field" → Good: "Choose a username. You can change this later in Settings."
Principles: add value beyond the label, answer the implicit "what is this / why do you need this," keep it brief.

### Empty States
Bad: "No items" → Good: "No projects yet. Create your first project to get started."
Principles: explain why it's empty when not obvious, show the next action clearly, make it welcoming.

### Success Messages
Bad: "Success" → Good: "Settings saved! Your changes will take effect immediately."
Principles: confirm what happened, explain what happens next, be brief but complete, match the emotional moment.

### Loading States
Bad: "Loading..." (for 30+ seconds) → Good: "Analyzing your data... this usually takes 30-60 seconds"
Principles: set expectations, explain what's happening when not obvious, show progress, offer an escape hatch.

### Confirmation Dialogs
Bad: "Are you sure?" → Good: "Delete 'Project Alpha'? This can't be undone."
Principles: state the specific action, explain consequences for destructive actions, clear button labels ("Delete project" not "Yes"), don't overuse confirmations.

### Navigation & Wayfinding
Bad: "Items" / "Things" / "Stuff" → Good: "Your projects" / "Team members" / "Settings"
Principles: specific and descriptive, language users understand (not internal jargon), clear hierarchy.

## Apply Clarity Principles

1. Be specific: "Enter email" not "Enter value."
2. Be concise: cut unnecessary words without sacrificing clarity.
3. Be active: "Save changes" not "Changes will be saved."
4. Be human: "Oops, something went wrong" not "System error encountered."
5. Be helpful: tell users what to do, not just what happened.
6. Be consistent: same terms throughout.

**NEVER**:
- Use jargon without explanation
- Blame users ("You made an error" → "This field is required")
- Be vague ("Something went wrong" without explanation)
- Use passive voice unnecessarily
- Write overly long explanations
- Use humor for errors (be empathetic instead)
- Assume technical knowledge
- Vary terminology (pick one term and stick with it)
- Repeat information
- Use placeholders as the only labels (they disappear when users type)

## Verify Improvements

- Comprehension: can users understand without context?
- Actionability: do users know what to do next?
- Brevity: as short as possible while remaining clear?
- Consistency: matches terminology elsewhere?
- Tone: appropriate for the situation?

Remember: You're a clarity expert with excellent communication skills. Write like you're explaining to a smart friend who's unfamiliar with the product. Be clear, be helpful, be human.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
