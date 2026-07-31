---
name: delight
description: Add moments of joy, personality, and unexpected touches that make interfaces memorable and enjoyable to use. Elevates functional to delightful. Use when the user asks to add polish, personality, animations, micro-interactions, delight, or make an interface feel fun or memorable.
---

Identify opportunities to add moments of joy, personality, and unexpected polish that transform functional interfaces into delightful experiences.

## Preparation

Read the `impeccable-hub` skill first if available this conversation. Additionally gather: what's appropriate for the domain (playful vs professional vs quirky vs elegant).

---

## Earned-emotion proportionality (runs FIRST)

Every emotional moment must match what the user did. Consult the `interfaces-that-feel` skill's earned-emotion table:
- Routine save → nothing extra
- Significant step → quiet confirmation
- Real milestone → proportional celebration
- Destructive action → deliberate pause

Confetti on routine saves is refused.

---

## Assess Delight Opportunities

Identify where delight would enhance (not distract from) the experience:

1. **Find natural delight moments**:
   - **Success states**: Completed actions (save, send, publish)
   - **Empty states**: First-time experiences, onboarding
   - **Loading states**: Waiting periods that could be entertaining
   - **Achievements**: Milestones, streaks, completions
   - **Interactions**: Hover states, clicks, drags
   - **Errors**: Softening frustrating moments
   - **Easter eggs**: Hidden discoveries for curious users

2. **Understand the context**:
   - What's the brand personality? (Playful? Professional? Quirky? Elegant?)
   - Who's the audience? (Tech-savvy? Creative? Corporate?)
   - What's the emotional context? (Accomplishment? Exploration? Frustration?)
   - What's appropriate? (Banking app ≠ gaming app)

3. **Define delight strategy**:
   - **Subtle sophistication**: Refined micro-interactions (luxury brands)
   - **Playful personality**: Whimsical illustrations and copy (consumer apps)
   - **Helpful surprises**: Anticipating needs before users ask (productivity tools)
   - **Sensory richness**: Satisfying sounds, smooth animations (creative tools)

If any of these are unclear, ask the user.

**CRITICAL**: Delight should enhance usability, never obscure it. If users notice the delight more than accomplishing their goal, you've gone too far.

## Delight Principles

Follow these guidelines:

### Delight Amplifies, Never Blocks
- Delight moments should be quick (< 1 second)
- Never delay core functionality for delight
- Make delight skippable or subtle
- Respect user's time and task focus

### Surprise and Discovery
- Hide delightful details for users to discover
- Reward exploration and curiosity
- Don't announce every delight moment
- Let users share discoveries with others

### Appropriate to Context
- Match delight to emotional moment (celebrate success, empathize with errors)
- Respect the user's state (don't be playful during critical errors)
- Match brand personality and audience expectations
- Cultural sensitivity (what's delightful varies by culture)

### Compound Over Time
- Delight should remain fresh with repeated use
- Vary responses (not same animation every time)
- Reveal deeper layers with continued use
- Build anticipation through patterns

## Delight Techniques

Add personality and joy through these methods:

### Micro-interactions & Animation

**Button delight**:
```css
.button { transition: transform 0.1s, box-shadow 0.1s; }
.button:active { transform: translateY(2px); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
.button:hover { transform: translateY(-2px); transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1); }
```

**Loading delight**:
- Playful loading animations (not just spinners)
- Personality in loading messages (write product-specific ones, not generic AI filler)
- Progress indication with encouraging messages
- Skeleton screens with subtle animations

**Success animations**:
- Checkmark draw animation
- Confetti burst for major achievements
- Gentle scale + fade for confirmation
- Satisfying sound effects (subtle)

**Hover surprises**:
- Icons that animate on hover
- Color shifts or glow effects
- Tooltip reveals with personality
- Cursor changes (custom cursors for branded experiences)

### Personality in Copy

**Playful error messages**:
```
"Error 404" → "This page is playing hide and seek. (And winning)"
"Connection failed" → "Looks like the internet took a coffee break. Want to retry?"
```

**Encouraging empty states**:
```
"No projects" → "Your canvas awaits. Create something amazing."
"No messages" → "Inbox zero! You're crushing it today."
```

**IMPORTANT**: Match copy personality to brand. Banks shouldn't be wacky, but they can be warm.

### Illustrations & Visual Personality
- Custom empty state / error / loading / success illustrations (not stock icons)
- Animated icons with subtle motion, consistent style across all icons
- Subtle particle effects, gradient mesh backgrounds, geometric patterns, parallax depth, time-of-day themes

### Satisfying Interactions
- **Drag and drop delight**: lift effect, snap animation, undo toast
- **Toggle switches**: smooth slide with spring physics, color transition, haptic feedback on mobile
- **Progress & achievements**: streak counters with celebratory milestones, badge unlocks
- **Form interactions**: focus animation, satisfying scale pulse when checked, auto-grow textareas

### Sound Design (when appropriate)
- Notification/success/error sounds, kept quiet and distinctive, never on every interaction (sound fatigue is real)
- Respect system sound settings, provide mute option

### Easter Eggs & Hidden Delights
- Konami code unlocks, hidden keyboard shortcuts, hover reveals, alt text jokes (screen-reader accessible too), console messages for developers

### Loading & Waiting States

**Make waiting engaging**: rotating loading messages, progress bars with personality, fun facts while waiting.

```
Loading messages — write ones specific to your product, not generic AI filler:
- "Crunching your latest numbers..."
- "Syncing with your team's changes..."
```

**WARNING**: Avoid cliched loading messages like "Herding pixels", "Teaching robots to dance", "Consulting the magic 8-ball". These are AI-slop copy — instantly recognizable as machine-generated.

### Celebration Moments
- Confetti for major milestones, animated checkmarks, progress bar celebrations at 100%, personalized messages

## Implementation Patterns

**Animation libraries**: Framer Motion (React), GSAP (universal), Lottie (After Effects animations), Canvas confetti
**Sound libraries**: Howler.js, use-sound
**Physics libraries**: React Spring, Popmotion

**IMPORTANT**: File size matters. Compress images, optimize animations, lazy load delight features.

**NEVER**:
- Delay core functionality for delight
- Force users through delightful moments (make skippable)
- Use delight to hide poor UX
- Overdo it (less is more)
- Ignore accessibility (animate responsibly, provide alternatives)
- Make every interaction delightful (special moments should be special)
- Sacrifice performance for delight
- Be inappropriate for context (read the room)

## Verify Delight Quality

Test that delight actually delights:

- **User reactions**: Do users smile? Share screenshots?
- **Doesn't annoy**: Still pleasant after 100th time?
- **Doesn't block**: Can users opt out or skip?
- **Performant**: No jank, no slowdown
- **Appropriate**: Matches brand and context
- **Accessible**: Works with reduced motion, screen readers

Remember: Delight is the difference between a tool and an experience. Add personality, surprise users positively, and create moments worth sharing. But always respect usability - delight should enhance, never obstruct.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
