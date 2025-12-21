---
name: tapestry
description: Unified content extraction and action planning. Use when user says "tapestry <URL>", "weave <URL>", "help me plan <URL>", "extract and plan <URL>", "make this actionable <URL>", or similar phrases indicating they want to extract content and create an action plan. Automatically detects content type (YouTube video, article, PDF) and processes accordingly.
allowed-tools:
  - Bash
  - Read
  - Write
  - Skill
---

# Tapestry: Unified Content → Action Workflow

This skill combines content extraction with actionable planning - turning any learning resource (YouTube videos, articles, PDFs) into **Ship-Learn-Next** action plans in one seamless flow.

## When to Use This Skill

Activate when the user:
- Says "tapestry [URL]" or "weave [URL]"
- Wants to "extract and plan from [URL]"
- Asks to "make [URL] actionable"
- Says "help me implement [URL]"
- Provides a URL and wants both content + action plan
- Wants to turn learning content into concrete steps

## Core Philosophy

**Tapestry weaves three threads together:**
1. **Extract** - Get clean content from any source
2. **Synthesize** - Identify actionable lessons
3. **Plan** - Create Ship-Learn-Next cycles

**Result**: From URL to shippable action plan in one flow.

## How Tapestry Works

### Step 1: Detect Content Type

When user provides a URL, automatically detect:

```bash
# YouTube detection
if [[ "$URL" =~ youtube\.com|youtu\.be ]]; then
    CONTENT_TYPE="youtube"
# Article/blog detection
elif [[ "$URL" =~ ^https?:// ]]; then
    CONTENT_TYPE="article"
# PDF detection (if URL ends in .pdf)
elif [[ "$URL" =~ \.pdf$ ]]; then
    CONTENT_TYPE="pdf"
fi
```

### Step 2: Extract Content (Automatic)

Based on content type, use the appropriate extraction method:

#### For YouTube Videos
Use the `youtube-transcript` skill:
```bash
# Activate youtube-transcript skill
# This handles:
# - Installation check (yt-dlp)
# - Subtitle detection (manual → auto-generated → Whisper)
# - VTT to plain text conversion
# - Deduplication
```

**Result**: Clean transcript saved as `[Video Title].txt`

#### For Articles/Blogs
Use the `article-extractor` skill:
```bash
# Activate article-extractor skill
# This handles:
# - Tool detection (reader/trafilatura/fallback)
# - Content extraction
# - Clutter removal
# - Clean text output
```

**Result**: Clean article saved as `[Article Title].txt`

#### For PDFs
Direct extraction:
```bash
# Check for PDF tools
if command -v pdftotext &> /dev/null; then
    pdftotext "$PDF_URL" output.txt
elif command -v mutool &> /dev/null; then
    mutool draw -F txt -o output.txt "$PDF_URL"
else
    echo "PDF extraction requires pdftotext or mutool"
    echo "Install: brew install poppler (macOS) or apt install poppler-utils (Linux)"
fi
```

**Result**: Clean PDF text saved as `[PDF Title].txt`

### Step 3: Synthesize Content

Once content is extracted, analyze for:

**Actionable Elements**:
- Specific techniques mentioned
- Case studies or examples
- Step-by-step processes
- Advice that can be practiced
- Skills that can be developed

**Theory vs Practice**:
- Filter out pure theory
- Focus on "do this" over "know this"
- Identify minimal viable implementations

**Core Lessons** (3-5 maximum):
- What are the key takeaways?
- What would change someone's behavior?
- What can be practiced immediately?

### Step 4: Create Action Plan (Ship-Learn-Next)

Use the `ship-learn-next` skill to transform lessons into action:

**Activate ship-learn-next with**:
- The extracted content file
- Synthesized lessons
- User's goal (ask if not clear)

This creates:
- Quest overview
- Rep 1 (shippable this week)
- Reps 2-5 (progression path)
- Reflection framework
- Success criteria

**Result**: Complete action plan saved as `Ship-Learn-Next Plan - [Title].md`

### Step 5: Present to User

Show:
1. " Content extracted from: [source]"
2. " Identified [N] core actionable lessons"
3. " Created Ship-Learn-Next plan: [filename]"
4. Preview of Rep 1 (what's due this week)

Ask:
- "When will you ship Rep 1?"
- "What questions do you have about the plan?"

## Complete Workflow Example

```markdown
User: "tapestry https://www.youtube.com/watch?v=example"

[AUTOMATIC EXECUTION]

Step 1: Detect → YouTube video
Step 2: Activate youtube-transcript skill
  → Download transcript
  → Clean and deduplicate
  → Save: "How to Build Profitable SaaS Products.txt"

Step 3: Synthesize content
  → Read transcript
  → Extract 5 core lessons:
    1. Start with proven markets (not new ones)
    2. Solve your own problem first
    3. Ship MVP in 2 weeks max
    4. Get 10 paying customers before scaling
    5. Focus on retention over acquisition

Step 4: Activate ship-learn-next skill
  → Create quest: "Ship a Micro-SaaS in 8 Weeks"
  → Define Rep 1: "Ship landing page + waitlist by Friday"
  → Map Reps 2-5

Step 5: Present results
   Content extracted: "How to Build Profitable SaaS Products.txt"
   Identified 5 core actionable lessons
   Created: "Ship-Learn-Next Plan - Build Micro-SaaS.md"

  [Preview of Rep 1]
  **Rep 1: Ship Landing Page + Waitlist (By Friday)**
  - Build single-page site explaining your SaaS idea
  - Add email capture form
  - Deploy to Vercel/Netlify
  - Share with 10 people for feedback

  When will you ship Rep 1?
```

## Skill Orchestration

Tapestry coordinates three specialized skills:

### Content Extraction Layer
- `youtube-transcript` - For video content
- `article-extractor` - For articles/blogs
- Direct extraction - For PDFs

### Action Planning Layer
- `ship-learn-next` - Transforms content into action cycles

### Synthesis Layer (Built-in)
- Reads extracted content
- Identifies actionable elements
- Filters theory from practice
- Connects lessons to concrete reps

## Handling Different URL Types

### YouTube Videos
**Patterns**:
- `youtube.com/watch?v=*`
- `youtu.be/*`
- `youtube.com/shorts/*`

**Process**:
1. Activate youtube-transcript
2. Wait for transcript file
3. Read and synthesize
4. Create action plan

### Articles/Blogs
**Patterns**:
- Any HTTP/HTTPS URL (not YouTube/PDF)

**Process**:
1. Activate article-extractor
2. Wait for article file
3. Read and synthesize
4. Create action plan

### PDFs
**Patterns**:
- URLs ending in `.pdf`
- Direct PDF links

**Process**:
1. Check for PDF tools
2. Extract text directly
3. Read and synthesize
4. Create action plan

## User Commands

### Primary Command
```bash
tapestry <URL>
```

**Aliases** (all equivalent):
- `weave <URL>`
- `tapestry <URL>`
- `make actionable <URL>`
- `extract and plan <URL>`

### Optional Flags (Future Enhancement)
```bash
# Extract only (no action plan)
tapestry --extract-only <URL>

# Action plan only (content already extracted)
tapestry --plan-only <file>

# Quick mode (3 reps instead of 5)
tapestry --quick <URL>
```

## Error Handling

### Content Extraction Fails
```markdown
Problem: YouTube transcript unavailable, article behind paywall, PDF corrupted

Solution:
1. Inform user of the issue
2. Suggest alternatives:
   - Try different URL
   - Paste content directly
   - Use different source
3. Offer manual content input
```

### No Actionable Content
```markdown
Problem: Content is purely theoretical or entertainment

Solution:
1. Inform user: "This content doesn't contain actionable advice"
2. Offer to:
   - Try different content
   - Create learning plan around theory
   - Suggest related actionable resources
```

### User Goal Unclear
```markdown
Problem: Can't determine what user wants to achieve

Solution:
1. Show extracted lessons
2. Ask: "Which of these resonates with you?"
3. Ask: "What would you like to achieve in 4-8 weeks?"
4. Build plan around their specific goal
```

## Best Practices

### For Content Extraction
-  Always verify extraction succeeded before proceeding
-  Show preview of extracted content
-  Handle missing tools gracefully (install prompts)
-  Clean filenames for filesystem compatibility

### For Synthesis
-  Focus on specific, actionable advice (not theory)
-  Limit to 3-5 core lessons (avoid overwhelming)
-  Identify concrete examples to replicate
-  Connect lessons to practical implementations

### For Action Planning
-  Make Rep 1 shippable THIS WEEK
-  Ensure clear success criteria
-  Build progression that makes sense
-  Reference source material for each rep
-  Keep focus on DOING, not studying

## Output Files

Tapestry creates two files:

### 1. Extracted Content
**Filename**: `[Source Title].txt`
**Contents**: Clean text from source (no clutter)
**Purpose**: Reference material for implementation

### 2. Action Plan
**Filename**: `Ship-Learn-Next Plan - [Quest Title].md`
**Contents**: Complete Ship-Learn-Next cycle with reps 1-5
**Purpose**: Executable roadmap

## Success Criteria

A successful tapestry run produces:
-  Clean extracted content file
-  Action plan with shippable Rep 1
-  Clear connection between content and action
-  Concrete deliverables (not vague goals)
-  Timeline commitments
-  Reflection framework built in

## Tips for Users

**To get the best results**:
1. Provide clear URLs (not shortened links)
2. Mention your goal if known ("I want to...")
3. Be specific about timeline if needed
4. Ask questions about the plan before starting
5. Come back after Rep 1 to reflect and iterate

**Remember**:
- Tapestry is about DOING, not collecting
- The plan is meant to be shipped, not studied
- Start with Rep 1 immediately
- Learn by building, not by consuming

## Related Skills

- **youtube-transcript** - Called automatically for YouTube URLs
- **article-extractor** - Called automatically for article URLs
- **ship-learn-next** - Called automatically for action planning

## Integration Examples

### Example 1: YouTube Video
```
User: "tapestry https://youtube.com/watch?v=abc123"

Tapestry:
1. Detects YouTube → Calls youtube-transcript
2. Extracts transcript → "How to Build Winning Products.txt"
3. Synthesizes 4 core lessons
4. Calls ship-learn-next → Creates quest with 5 reps
5. Presents plan → "Ship-Learn-Next Plan - Build Winning Products.md"
```

### Example 2: Blog Article
```
User: "weave https://example.com/how-to-scale-your-startup"

Tapestry:
1. Detects article → Calls article-extractor
2. Extracts clean text → "How to Scale Your Startup.txt"
3. Synthesizes 5 actionable strategies
4. Calls ship-learn-next → Creates quest with 5 reps
5. Presents plan → "Ship-Learn-Next Plan - Scale Startup.md"
```

### Example 3: PDF Research Paper
```
User: "tapestry https://arxiv.org/pdf/example.pdf"

Tapestry:
1. Detects PDF → Extracts with pdftotext
2. Saves → "Machine Learning Best Practices.txt"
3. Synthesizes practical techniques
4. Calls ship-learn-next → Creates implementation quest
5. Presents plan → "Ship-Learn-Next Plan - ML Best Practices.md"
```

## Advanced Usage

### Chaining Multiple Sources
```
User: "I have 3 articles on X. Can tapestry handle multiple?"

Process:
1. Run tapestry on each URL separately
2. Synthesize combined lessons across all sources
3. Create single unified Ship-Learn-Next plan
4. Reference specific sources for each rep
```

### Updating Existing Plans
```
User: "I finished Rep 1. Can we update the plan?"

Process:
1. Read existing plan
2. Ask reflection questions
3. Adjust Rep 2 based on learnings
4. Save updated plan
```

## Philosophy

Tapestry embodies the principle:

**"From consumption to creation"**

Every piece of learning content should lead to something built, shipped, and reflected upon. Tapestry automates the bridge between passive learning and active doing.

**100 reps beats 100 hours of study.**

Let's weave learning into action.
