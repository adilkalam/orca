# Design-OCD Meta Rules

**Purpose:** Universal design precision principles that apply to ANY project, extracted from proven design systems
**Audience:** LLMs, AI agents, designers, implementers working on visual interfaces
**Last Updated:** 2025-10-29

---

## Philosophy

### Core Principle: Mathematical, Not Arbitrary

**Every visual decision must be calculated, not guessed.**

Human perception is influenced by shape, weight distribution, and visual mass—not just geometric measurements. Design tools align using bounding boxes, but humans perceive the visual center of shapes, which is often different from the mathematical center.

**This means:**
- No eyeballing alignment
- No arbitrary values (17px, 23px, 31px, 47px)
- No "looks about right" spacing
- Everything must have a formula or system behind it

---

## Summary: The 10 Commandments of Design-OCD

1. **Thou shalt choose a base grid and never deviate** - 4px, 8px, etc. No arbitrary values.

2. **Thou shalt calculate, not eyeball** - Optical alignment uses formulas, not guessing.

3. **Thou shalt respect typography minimums** - Display fonts have HARD minimums for readability.

4. **Thou shalt use design system tokens** - No hardcoded values in code. Ever.

5. **Thou shalt maintain single source of truth** - One .md file, everything else generated.

6. **Thou shalt use CSS Grid for two-dimensional layouts** - Flexbox is one-dimensional only.

7. **Thou shalt compensate for optical illusions** - Triangles shift, icons adjust, borders compensate.

8. **Thou shalt restrain accent colors** - ≤20% of elements. Rarity = impact.

9. **Thou shalt keep motion subtle** - ≤8px travel, ≤300ms duration, natural spring easing.

10. **Thou shalt document thy math** - Height calculations, formulas, and reasoning must be in code comments.

---

## When to Apply These Rules

**MANDATORY for:**
- Production user interfaces
- Any design that will be maintained by multiple people
- Brand-critical projects
- Projects where consistency matters

**OPTIONAL for:**
- Internal tools where polish doesn't matter
- Rapid prototypes that will be thrown away
- Proof-of-concept work

**Why the distinction:** Design-OCD requires discipline. Apply it where quality matters, skip it for throwaway work.

---

## Typography Philosophy

### Conceptual Approach to Font Selection

**Hierarchy through contrast, not chaos:**

1. **Display/Headline Font** - One font family for large, attention-grabbing text
   - Used for: Card titles, hero headings, major section headings
   - Characteristics: High contrast, distinctive, luxe feel
   - Minimum size restrictions: Display fonts are designed for large sizes (typically ≥32px)
   - Weight strategy: Lighter weights (200-300) for large sizes preserve elegance

2. **Text/Body Font** - One font family for readable content
   - Used for: Paragraphs, descriptions, lists, most content
   - Characteristics: High readability, neutral, comfortable at small sizes
   - Size range: 12-24px typically
   - Weight strategy: Regular weights (400) for body, avoid ultra-light for readability

3. **Accent/Tagline Font** - Optional third font for labels, quotes, subtle emphasis
   - Used for: Taglines, labels above headings, quotes, notes
   - Characteristics: Stylistically distinct from body, often italic or decorative
   - Size range: Small to medium (12-24px)

4. **Monospace Font** - Technical/code content only
   - Used for: Code blocks, technical specs, data tables
   - Characteristics: Fixed-width, high legibility for technical content
   - Size range: 12-16px typically

**Font pairing rules:**
- **Never use more than 4 font families** - More creates visual chaos
- **Each font has a clear role** - No overlap in usage
- **Display fonts have HARD minimums** - Never violate minimum readable sizes
- **Weight usage is strategic** - Lighter weights for luxury, regular for readability
- **Italic is a ROLE, not decoration** - Use for specific content types consistently

**Typography hard minimums exist for a reason:**
- Display fonts become illegible below a certain size (typically 32px)
- Ultra-light weights (200-300) need larger sizes to remain readable
- Body text below 12px strains readability
- These minimums are NOT flexible—they're based on human perception

---

## Base Grid System (MANDATORY)

### Rule: Choose ONE base increment, use it everywhere

**Common base increments:**
- 4px (most common, recommended for web)
- 8px (more generous spacing, good for large-scale designs)
- 2px (rare, only for very dense UIs)

**Once chosen, ALL spacing/sizing values must be multiples:**
- Padding, margin, gap, width, height, top, left, right, bottom
- Border radius
- Positioning offsets

**No exceptions except optical corrections (see Optical Alignment section)**

**Why this matters:**
- Creates visual rhythm and consistency
- Prevents arbitrary spacing decisions
- Makes designs feel cohesive
- Easier to maintain (change base increment, everything scales)

**Example (4px base grid):**
```
Allowed: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px, 128px
Forbidden: 13px, 17px, 23px, 27px, 31px, 47px, 51px
```

**Enforcement:**
```bash
# Check for non-base-multiple values
grep -rE '\b[0-9]+px\b' [files] | grep -vE '\b(4|8|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96|100|104|108|112|116|120|124|128)px\b'
```

---

## Optical Alignment Rules

### Core Philosophy: Optical Over Geometric

**Geometric center ≠ Visual center**

Design tools align objects using bounding boxes (mathematical rectangles). Human eyes perceive visual mass and shape, not rectangles. This creates misalignment when relying on tool-reported "centered" positioning.

**The solution:** Calculate optical alignment using formulas, then apply adjustments.

---

### Optical Rule 1: Triangle & Pointed Shape Alignment

**Problem:** Triangular shapes (play buttons, chevrons, arrows) appear off-center when mathematically centered because their visual centroid is NOT at the geometric center.

**Why:** A triangle's bounding box center is at 50% width, but the visual center (centroid) is at ~33% width due to mass distribution.

**Solution:** Shift triangular shapes 5-8% toward the pointed direction.

**Formula:**
```javascript
horizontalOffset = containerWidth × 0.0625  // (1/16 of container width)
// Then round to nearest base grid increment
```

**Context matters:**
- Small icons (16px): ±1px adjustments
- Medium icons (24px): ±2px adjustments
- Large shapes (48px+): Calculate using formula, snap to grid

**Implementation:**
```css
/* Wrong: Mathematical center */
.play-icon {
  left: 50%;
  transform: translateX(-50%);
}

/* Correct: Optical center */
.play-icon {
  left: 50%;
  transform: translateX(-45%); /* 5% adjustment */
}
```

---

### Optical Rule 2: Icon-to-Text Vertical Alignment

**Problem:** Icons next to text appear to "sink" below the text baseline when mathematically aligned because icons are visually "heavier" than text.

**Why:** Text baseline alignment doesn't account for the perceived weight of solid shapes. Icons need to align with text x-height (middle of lowercase letters), not baseline.

**Solution:** Shift icons 1-2px upward.

**Implementation:**
```css
.icon-text-pair .icon {
  position: relative;
  top: -1px; /* Small icons */
  /* OR */
  top: -2px; /* Larger icons or heavier text */
}
```

**Horizontal spacing adjustment:**
Icons need more breathing room than text-only content.

**Formula:**
```javascript
iconGap = textOnlyGap × 1.5
// Example: 8px text gap → 12px icon gap
```

**Icon size hierarchy:**
- 16px icon → 14px+ text minimum
- 20px icon → 16px+ text minimum
- 24px icon → 18px+ text minimum (hero sections only)
- **Maximum icon size with text:** 20px (24px absolute maximum for heroes)

---

### Optical Rule 3: Border Weight Compensation

**Problem:** Adding borders makes elements appear visually larger and "pushes out" content, creating misalignment with non-bordered elements.

**Why:** Borders add to the total visual mass of an element. Internal padding must compensate.

**Solution:** Reduce internal padding by border width.

**Formula:**
```javascript
adjustedPadding = originalPadding - borderWidth
```

**Example:**
```css
/* Without border */
.button {
  padding: 12px 24px;
}

/* With 1px border - reduce padding by 1px */
.button {
  padding: 11px 23px;
  border: 1px solid var(--border-color);
}

/* With 2px border - reduce padding by 2px */
.button {
  padding: 10px 22px;
  border: 2px solid var(--border-color);
}
```

**Why this works:** Total visual size remains consistent (padding + border = original padding).

---

### Optical Rule 4: Bullet List Alignment

**Problem:** Default browser bullets are inconsistent, too large, and often misaligned with text.

**Why:** Browser defaults don't account for font-specific x-height and visual weight.

**Solution:** Custom-rendered bullets with calculated positioning.

**Implementation:**
```css
.bullet-list li {
  position: relative;
  padding-left: 18px; /* Space for bullet */
  list-style: none;
}

.bullet-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  font-size: 0.85em; /* Slightly smaller than text */
  top: 0.3em; /* Optical center aligned with x-height */
}
```

**Adjustment by text size:**
- 12-14px text: `top: 0.15rem`
- 16px text: `top: 0.25rem`
- 18px+ text: `top: 0.3rem`

**Alternative for icon bullets:**
```css
.arrow-list li {
  display: inline-flex;
  align-items: center;
  gap: 8px; /* Icon-to-text spacing */
}

.arrow-list li .icon {
  position: relative;
  top: -1px; /* Optical vertical adjustment */
}
```

---

### Optical Rule 5: Heavy Elements Need More Space

**Problem:** Bold text, solid shapes, and high-contrast elements appear "heavier" and need more breathing room than regular elements.

**Why:** Visual weight creates psychological "pressure" on adjacent content. Dense elements feel cramped without extra space.

**Solution:** Increase spacing adjacent to heavy elements.

**Formula:**
```javascript
heavyElementSpacing = normalSpacing + oneGridIncrement
// Example (4px grid): 16px → 20px
// Example (8px grid): 16px → 24px
```

**Examples:**
- Bold headings: Add +4px spacing below (compared to regular text)
- Solid shapes or high-contrast blocks: Increase adjacent gaps by one token (e.g., 24px → 32px)
- Large numbers or data displays: More padding inside containers

---

### Optical Rule 6: Rounded Corner Text Alignment

**Problem:** When text sits directly above a container with rounded corners, the text appears misaligned because the visual "edge" of the rounded container is inset from the geometric edge.

**Why:** Rounded corners create a visual inset. The perceived edge is not the bounding box edge.

**Solution:** Add optical inset padding to text above rounded containers.

**Formula:**
```javascript
paddingLeftExtra = borderRadius × 0.5
// Then snap to nearest 2px (max +8px)
```

**Quick Reference Table:**
| Border Radius | Formula | Snapped | Total Extra Padding |
|---------------|---------|---------|---------------------|
| 4px           | 2px     | 2px     | +2px                |
| 6px           | 3px     | 4px     | +4px                |
| 8px           | 4px     | 4px     | +4px                |
| 12px          | 6px     | 6px     | +6px                |

**Implementation:**
```css
/* Container with 8px rounded corners */
.rounded-container {
  border-radius: 8px;
  padding: 24px;
}

/* Heading directly above container */
.heading-above-rounded {
  padding-left: 28px; /* 24px + 4px optical inset */
}
```

---

### Optical Rule 7: Comparison Card Height Matching

**Problem:** A/B comparison cards or before/after layouts look sloppy when cards have different heights.

**Why:** Height mismatch breaks visual rhythm and makes comparisons harder to parse.

**Solution:** Calculate exact heights and force cards to match. Document the math.

**Process:**
1. Calculate total height for each card (sum of all internal row heights + padding)
2. Use the LARGER value for BOTH cards
3. Document the math in code comments for traceability

**Implementation:**
```tsx
// Height Calculation (DOCUMENTED)
// Card A: 20px header + 60px content + 40px spacer + 120px footer + 20px padding = 260px
// Card B: 20px header + 80px content + 40px spacer + 100px footer + 20px padding = 260px
// Both cards MUST be min-h-[260px]

<div className="comparison-card min-h-[260px]">
  {/* Card A */}
</div>
<div className="comparison-card min-h-[260px]">
  {/* Card B */}
</div>
```

**Why document the math:** Future changes must recalculate heights. Without documentation, heights become arbitrary magic numbers.

---

## Layout System Philosophy

### Grid-Based vs Flexbox

**Use CSS Grid for:**
- Multi-row layouts where rows must align
- Card layouts where internal structure matters
- Bento grids (Pinterest-style layouts)
- Comparison layouts (side-by-side with matched heights)
- Any layout where vertical AND horizontal alignment both matter

**Use Flexbox for:**
- Single-row layouts (navigation bars, button groups)
- Simple centering
- Dynamic content wrapping
- Icon-text pairs
- Any layout where only ONE dimension matters

**Critical distinction:**
- **CSS Grid = two-dimensional** (rows AND columns controlled)
- **Flexbox = one-dimensional** (either rows OR columns, not both)

---

### Bento Grid Hard Rules

**What is a Bento Grid?**
A Pinterest-style grid where cards span multiple columns/rows but maintain alignment.

**Critical architectural rules:**

1. **Cards MUST be direct children of grid container**
   ```html
   <!-- CORRECT ✅ -->
   <div class="bento-grid">
     <div class="bento-card"></div>
     <div class="bento-card"></div>
   </div>

   <!-- WRONG ❌ -->
   <div class="bento-grid">
     <div class="wrapper">
       <div class="bento-card"></div>
     </div>
   </div>
   ```

2. **Use CSS Grid, NOT Flexbox**
   - CSS Grid allows precise column/row spanning
   - Flexbox cannot maintain alignment across rows

3. **Class-based sizing, NEVER inline styles**
   ```html
   <!-- CORRECT ✅ -->
   <div class="bento-card bento-large"></div>

   <!-- WRONG ❌ -->
   <div class="bento-card" style="grid-column: span 2;"></div>
   ```

   **Why:** Inline styles pollute markup, prevent design system consistency, make refactoring impossible.

4. **Explicit spacer divs for flexible spacing**
   ```tsx
   <div className="bento-card">
     <div>{/* Header */}</div>
     <div>{/* Content */}</div>
     <div></div> {/* Spacer - pushes footer to bottom */}
     <div>{/* Footer */}</div>
   </div>
   ```

   **Why:** Spacer divs create flexible vertical spacing using `grid-template-rows: auto auto 1fr auto`.

---

### Uniform Grid Height Matching

**Problem:** Cards in a grid layout have different content lengths, creating ragged bottoms.

**Solution:** Use CSS Grid with `minmax()` to equalize row heights.

**Implementation:**
```css
/* Parent grid - equalizes all card heights */
.grid-uniform {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
  grid-auto-rows: minmax(320px, auto); /* All rows same height */
}

/* Card internal structure - distributes content */
.card-uniform {
  display: grid;
  grid-template-rows:
    auto              /* Header */
    var(--space-4)    /* Fixed spacer */
    auto              /* Content */
    var(--space-6)    /* Fixed spacer */
    minmax(60px, auto) /* Variable section */
    1fr               /* Flexible spacer (pushes footer down) */
    auto;             /* Footer */
}
```

**Why this works:**
- Parent `grid-auto-rows: minmax()` makes all cards same height
- Child `grid-template-rows` with `1fr` spacer pushes footer to bottom
- All footers align across cards

---

## Color & Hierarchy Philosophy

### Hierarchy Through Opacity, Not Color Chaos

**Principle:** Use OPACITY to create visual hierarchy within a single color.

**Why:** Fewer colors = cleaner design. Opacity creates natural hierarchy without introducing new colors.

**Example (white text hierarchy):**
- Primary (100% opacity): Main headings
- High (90% opacity): Subheadings
- Medium (85% opacity): Descriptions
- Body (75% opacity): Body text
- Subdued (60% opacity): Labels, helpers
- Subtle (50% opacity): Fine print
- Faint (40% opacity): Very low emphasis

**Implementation:**
```css
:root {
  --text-primary: rgba(255, 255, 255, 1.0);
  --text-high: rgba(255, 255, 255, 0.9);
  --text-medium: rgba(255, 255, 255, 0.85);
  --text-body: rgba(255, 255, 255, 0.75);
  --text-subdued: rgba(255, 255, 255, 0.6);
  --text-subtle: rgba(255, 255, 255, 0.5);
  --text-faint: rgba(255, 255, 255, 0.4);
}
```

**Benefits:**
- Reduces cognitive load (one color to remember)
- Maintains brand consistency
- Easier to adjust (change one base color, entire hierarchy updates)
- Natural visual hierarchy

---

### Accent Color Restraint

**Principle:** Accent colors should be RARE to maintain impact.

**Guideline:** ≤20% of visible elements should use accent color.

**Good uses:**
- Data values and metrics
- Call-to-action buttons
- Active states
- Category labels

**Avoid:**
- Body text (unless labels)
- Most headings
- Large background areas
- Overuse that dilutes impact

**Why restraint matters:** Accent colors lose impact when overused. If everything is "highlighted," nothing is.

---

## Motion & Animation Philosophy

### Principle: Subtle, Natural, Purposeful

Motion should feel tactile and responsive, not distracting.

**Travel distance limits:**
- Maximum travel: ≤8px
- Hover lift: 2px (typical)
- Micro-interactions: 1-4px
- **Never exceed 8px** - larger movements feel jarring

**Duration limits:**
- Default: 200ms
- Quick feedback (buttons): 150ms
- Smooth motion (cards): 250ms
- **Never exceed 300ms** for UI interactions - longer feels sluggish

**Easing preference:**
Natural spring easing for all animations:
```css
/* Default spring easing - preferred */
transition: all 250ms cubic-bezier(0.25, 1, 0.3, 1);

/* Quick feedback (buttons, inputs) */
transition: transform 150ms cubic-bezier(0.25, 1, 0.3, 1);
```

**Why spring easing:** Mimics natural physics. More satisfying than linear or ease-in-out.

**Hover effects:**
```css
/* Standard hover lift */
.card:hover {
  transform: translateY(-2px);
  transition: transform 200ms cubic-bezier(0.25, 1, 0.3, 1);
}

/* Button hover (more subtle) */
.button:hover {
  transform: translateY(-1px);
  transition: transform 150ms cubic-bezier(0.25, 1, 0.3, 1);
}
```

---

## Design System Architecture

### Source of Truth Flow

**Principle:** One source of truth, everything else generated.

**Architecture:**
```
design-system.md (MARKDOWN - Source of Truth)
    ↓ (generated via script)
design-dna.json (JSON - for programmatic access)
    ↓ (referenced by)
design-system.html (HTML - visual reference)
    ↓ (referenced by)
All documentation and code
```

**Rules:**
1. **All changes start in the .md file** - This is the ONLY file you edit
2. **JSON is auto-generated from .md** - Never edit JSON manually
3. **HTML is auto-generated from .md** - Visual reference for designers
4. **Code references JSON tokens** - Never hardcode values

**Why this architecture:**
- **Single source of truth** - No documentation drift
- **One change propagates everywhere** - Update .md → regenerate all
- **Consistency guaranteed** - All references use same source
- **Git-friendly** - Markdown is diff-friendly, JSON is generated artifact

**Anti-pattern (FORBIDDEN):**
```css
/* WRONG - Hardcoded values ❌ */
.card {
  padding: 24px;
  color: #D9A95A;
}

/* CORRECT - Design system tokens ✅ */
.card {
  padding: var(--space-6);
  color: var(--accent-gold);
}
```

---

## Forbidden Patterns (NEVER DO THESE)

### Typography Violations

1. **Arbitrary font sizes** - 33px, 41px, 27px (not on any scale)
2. **Display fonts below minimum** - Each display font has a HARD minimum (typically 32px)
3. **Ultra-light weights at small sizes** - Weight 200-300 requires larger sizes for readability
4. **Body text below 12px** - Strains readability
5. **More than 4 font families** - Creates visual chaos

### Spacing Violations

1. **Arbitrary spacing values** - 17px, 23px, 31px (not on base grid)
2. **Inconsistent spacing** - Different gaps for same content type
3. **No spacing system** - Each spacing decision made independently

### Layout Violations

1. **Wrapper divs in grid layouts** - Breaks grid structure
2. **Inline grid styles** - Pollutes markup, prevents consistency
3. **Flexbox for two-dimensional layouts** - Use CSS Grid instead
4. **Inconsistent card heights** - Use minmax() or document math

### Alignment Violations

1. **Eyeballed alignment** - Must use formulas
2. **Geometric centering of triangles** - Use optical offset calculation
3. **Icons without vertical compensation** - Icons need -1px to -2px adjustment
4. **Borders without padding compensation** - Reduce internal padding by border width
5. **Comparison cards with different heights** - Calculate and match exactly

### Color Violations

1. **Overuse of accent colors** - Should be ≤20% of elements
2. **Creating new colors for hierarchy** - Use opacity instead
3. **Hardcoded color values** - Use design system tokens

### Motion Violations

1. **Dramatic animations** - Travel should be ≤8px
2. **Long durations** - Should be ≤300ms
3. **Linear easing** - Use natural spring easing

### System Violations

1. **Inline styles** - Prevents consistency, use design system classes/tokens
2. **Manual JSON edits** - JSON is generated, edit source .md instead
3. **Documentation drift** - All docs must reference same source
4. **Hardcoded values in code** - Use design system tokens

---

## Enforcement Checklist

### Pre-Implementation Checklist

Before starting any design work:

- [ ] Base grid chosen (4px, 8px, etc.)
- [ ] Typography minimums documented for each font
- [ ] Design system tokens available (CSS variables or JSON)
- [ ] Optical alignment formulas ready
- [ ] Layout structure determined (Grid vs Flexbox)

### During Implementation Checklist

- [ ] All spacing values are base grid multiples
- [ ] No arbitrary values (checked via grep)
- [ ] Typography minimums respected
- [ ] Inline styles avoided (use design system tokens)
- [ ] Optical alignment applied where needed:
  - [ ] Triangles/pointed shapes shifted
  - [ ] Icons vertically adjusted -1px to -2px
  - [ ] Border padding compensated
  - [ ] Bullets optically aligned
- [ ] Grid structure correct (no wrapper divs, class-based sizing)
- [ ] Motion within limits (≤8px travel, ≤300ms duration)

### Post-Implementation Validation

- [ ] Grep check for non-base-multiple values
  ```bash
  grep -rE '\b[0-9]+px\b' [files] | grep -vE '\b(4|8|12|16|20|24|28|32|36|40|44|48|52|56|60|64)px\b'
  ```
- [ ] Typography minimum violations check
  ```bash
  grep -rE 'font-size.*([1-2][0-9]|3[0-1])px' [files]
  ```
- [ ] Inline style detection
  ```bash
  grep -rE 'style=' [files]
  ```
- [ ] Comparison card heights documented
- [ ] Accent color usage ≤20% of elements
- [ ] Visual test: Does alignment feel right?

---

## Common Mistakes & How to Fix Them

### Mistake 1: "It looks centered to me"

**Problem:** Relying on visual judgment instead of formulas.

**Fix:** Use optical alignment formulas. Your eyes are correct that it looks off, but the fix must be calculated, not eyeballed.

**Example:**
```css
/* Wrong: Adjusting until it "looks right" */
.triangle {
  left: 52%; /* Why 52%? Eyeballed. */
}

/* Correct: Calculated optical center */
.triangle {
  left: calc(50% + 6.25%); /* Formula: 50% + (containerWidth × 0.0625) */
}
```

### Mistake 2: "I'll just use 15px, it's close enough"

**Problem:** Breaking base grid system for one-off adjustments.

**Fix:** Find the nearest base-multiple value OR add the value to your spacing scale if truly needed.

**Example:**
```css
/* Wrong: Arbitrary value */
margin-bottom: 15px;

/* Correct: Use nearest base-multiple */
margin-bottom: 16px; /* or var(--space-4) */
```

### Mistake 3: "This display font looks fine at 24px"

**Problem:** Violating typography minimums makes text illegible.

**Fix:** Respect hard minimums. If the size is too large for the space, choose a different font designed for smaller sizes.

**Example:**
```css
/* Wrong: Display font too small */
h2 {
  font-family: 'Domaine Sans Display';
  font-size: 24px; /* Below 32px minimum */
}

/* Correct: Use body font or increase size */
h2 {
  font-family: 'GT Pantheon Text'; /* Body font, no minimum */
  font-size: 24px;
}
```

### Mistake 4: "I'll add a wrapper div to make this easier"

**Problem:** Breaking grid architecture for convenience.

**Fix:** Work within grid constraints. Wrapper divs break layout structure.

**Example:**
```html
<!-- Wrong: Wrapper breaks grid -->
<div class="bento-grid">
  <div class="wrapper">
    <div class="bento-card"></div>
  </div>
</div>

<!-- Correct: Direct children only -->
<div class="bento-grid">
  <div class="bento-card"></div>
</div>
```

### Mistake 5: "Inline styles are faster for this one-off"

**Problem:** Every "one-off" becomes a maintenance nightmare. Design system consistency breaks.

**Fix:** Add a new class to the design system if needed. Never use inline styles.

**Example:**
```html
<!-- Wrong: Inline style pollution -->
<div style="padding: 24px; color: #D9A95A;"></div>

<!-- Correct: Design system class -->
<div class="card-accent"></div>
```

---

**Last Updated:** 2025-10-29
**Source:** Extracted from OBDN Design System v4.2.3 and proven design system patterns
**License:** Universal - apply to any project, any tech stack, any design system
