---
name: tapestry
description: "Unified content extraction and action planning. Use when user says tapestry, weave, extract and plan, or make actionable followed by a URL. Detects content type (YouTube, article, PDF) and produces a Ship-Learn-Next action plan."
allowed-tools: Bash, Read, Write, Skill
---

# Tapestry: Content → Action Workflow

Turns any learning resource (YouTube videos, articles, PDFs) into a **Ship-Learn-Next** action plan in one flow.

## When to Use

Activate when the user:
- Says "tapestry [URL]" or "weave [URL]"
- Wants to "extract and plan from [URL]" or "make [URL] actionable"
- Provides a URL and wants both content extraction + action plan

**Aliases**: `tapestry <URL>`, `weave <URL>`, `make actionable <URL>`, `extract and plan <URL>`

## Core Workflow

### Step 1: Detect Content Type

```bash
if [[ "$URL" =~ youtube\.com|youtu\.be ]]; then CONTENT_TYPE="youtube"
elif [[ "$URL" =~ \.pdf$ ]]; then CONTENT_TYPE="pdf"
else CONTENT_TYPE="article"
fi
```

### Step 2: Extract Content

| Type | Method | Result |
|------|--------|--------|
| YouTube | Activate `youtube-transcript` skill | Clean transcript as `[Title].txt` |
| Article | Activate `article-extractor` skill | Clean article as `[Title].txt` |
| PDF | `pdftotext` or `mutool draw -F txt` | Clean text as `[Title].txt` |

For PDFs, if no tool available:
```bash
echo "PDF extraction requires pdftotext or mutool"
echo "Install: brew install poppler (macOS) or apt install poppler-utils (Linux)"
```

### Step 3: Synthesize Content

Analyze extracted content for:
- **Actionable elements**: specific techniques, step-by-step processes, case studies
- **Core lessons** (3–5 maximum): what would change behavior? What can be practiced immediately?
- **Filter**: focus on "do this" over "know this" — identify minimal viable implementations

### Step 4: Create Action Plan

Activate `ship-learn-next` skill with extracted content, synthesized lessons, and user's goal (ask if unclear). This produces:
- Quest overview with Rep 1 (shippable this week)
- Reps 2–5 (progression path)
- Reflection framework and success criteria

Saved as `Ship-Learn-Next Plan - [Title].md`

### Step 5: Present Results

1. "Content extracted from: [source]"
2. "Identified [N] core actionable lessons"
3. "Created Ship-Learn-Next plan: [filename]"
4. Preview of Rep 1 (what's due this week)

Then ask: "When will you ship Rep 1?"

## Example

```
User: "tapestry https://www.youtube.com/watch?v=example"

Step 1: Detect → YouTube video
Step 2: youtube-transcript → "How to Build Profitable SaaS Products.txt"
Step 3: Synthesize → 5 lessons (proven markets, solve own problem, 2-week MVP, 10 paying customers, retention > acquisition)
Step 4: ship-learn-next → "Ship-Learn-Next Plan - Build Micro-SaaS.md"
Step 5: Present plan with Rep 1: "Ship landing page + waitlist by Friday"
```

## Error Handling

| Problem | Solution |
|---------|----------|
| Extraction fails (paywall, unavailable) | Inform user, suggest alternatives or manual paste |
| No actionable content (pure theory) | Offer learning plan or suggest related actionable resources |
| User goal unclear | Show extracted lessons, ask "Which resonates?" and "What do you want to achieve in 4–8 weeks?" |

## Related Skills

- **youtube-transcript** — called automatically for YouTube URLs
- **article-extractor** — called automatically for article URLs
- **ship-learn-next** — called automatically for action planning
