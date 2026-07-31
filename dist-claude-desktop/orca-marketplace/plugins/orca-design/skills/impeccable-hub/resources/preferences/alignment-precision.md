# Preference: Alignment Precision

## Verbatim voice anchors

> "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but notice. Special typesetting for bullets to be perfectly at a font's x-height. Pixel level compensation for rounded corners. Optical alignment > programmatic confirmation."

> "Lack of space between header buttons and the ugly purple box, which has these obviously AI generated rounded corners, and gives zero thought to the horizontal placement and alignment of the logo and menu items leaving them to just float awkwardly in a random spot."

## Philosophy

**Mathematical, not arbitrary. Every visual decision is calculated, not guessed.**

Human perception is influenced by shape, weight distribution, and visual mass — not just geometric measurements. Design tools align using bounding boxes, but humans perceive the visual center of shapes, which is often different from the mathematical center.

This means:
- No eyeballing alignment
- No arbitrary values (17px, 23px, 31px, 47px)
- No "looks about right" spacing
- Everything has a formula or system

**2px is visible and wrong.** Zero tolerance. If the detector says two elements align, they align at 0px deviation, not "close enough."

---

## Base Grid System (MANDATORY)

Choose ONE base increment. Use it everywhere.

**Base increments:**
- **4px** — most common, recommended for web
- **8px** — more generous spacing, good for large-scale designs
- **2px** — rare, only for very dense UIs

Once chosen, ALL spacing/sizing values must be multiples:
- Padding, margin, gap, width, height, top/left/right/bottom
- Border radius
- Positioning offsets

**No exceptions** except documented optical corrections.

### 4px base — allowed values

```
Allowed:    4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60,
            64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112,
            116, 120, 124, 128

Forbidden:  13, 17, 23, 27, 31, 47, 51, 63, etc.
```

### Enforcement (regex)

```bash
# Check for non-base-multiple values
grep -rE '\b[0-9]+px\b' [files] \
  | grep -vE '\b(4|8|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96|100|104|108|112|116|120|124|128)px\b'
```

---

## The 7 Optical Alignment Rules

### Rule 1: Triangle & Pointed Shape Alignment

**Problem:** Triangular shapes (play buttons, chevrons, arrows) appear off-center when mathematically centered because their visual centroid is NOT at the geometric center.

**Why:** A triangle's bounding-box center is at 50% width, but the visual center is at ~33% width due to mass distribution.

**Solution:** Shift triangular shapes 5-8% toward the pointed direction.

**Formula:**
```javascript
horizontalOffset = containerWidth × 0.0625   // 1/16 of container
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
  transform: translateX(-45%);  /* 5% adjustment toward point */
}
```

### Rule 2: Icon-to-Text Vertical Alignment

**Problem:** Icons next to text appear to "sink" below the text baseline when mathematically aligned because icons are visually heavier than text.

**Why:** Text baseline alignment doesn't account for the perceived weight of solid shapes. Icons need to align with x-height, not baseline.

**Solution:** Shift icons 1-2px upward.

```css
.icon-text-pair .icon {
  position: relative;
  top: -1px;     /* small icons */
  /* OR */
  top: -2px;     /* larger icons or heavier text */
}
```

**Horizontal spacing adjustment** — icons need 50% more breathing room:
```javascript
iconGap = textOnlyGap × 1.5
// 8px text gap → 12px icon gap
```

**Icon size hierarchy:**
- 16px icon → 14px+ text minimum
- 20px icon → 16px+ text minimum
- 24px icon → 18px+ text minimum (hero only)
- **Maximum icon size with text: 20px** (24px absolute max for heroes)

### Rule 3: Border Weight Compensation

**Problem:** Adding borders makes elements visually larger and pushes content out, creating misalignment with non-bordered siblings.

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

/* With 1px border */
.button {
  padding: 11px 23px;
  border: 1px solid var(--border-color);
}

/* With 2px border */
.button {
  padding: 10px 22px;
  border: 2px solid var(--border-color);
}
```

Total visual size stays constant.

### Rule 4: Bullet List Alignment

**Problem:** Default browser bullets are inconsistent, too large, and often misaligned with text x-height.

**Solution:** Custom-rendered bullets with calculated positioning.

```css
.bullet-list li {
  position: relative;
  padding-left: 18px;
  list-style: none;
}

.bullet-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  font-size: 0.85em;
  top: 0.3em;   /* optical center aligned with x-height */
}
```

**Adjustment by text size:**
- 12-14px text: `top: 0.15rem`
- 16px text: `top: 0.25rem`
- 18px+ text: `top: 0.3rem`

### Rule 5: Heavy Elements Need More Space

**Problem:** Bold text, solid shapes, and high-contrast elements appear heavier and need more breathing room than regular elements.

**Why:** Visual weight creates psychological pressure on adjacent content.

**Solution:** Increase spacing adjacent to heavy elements by one grid increment.

```javascript
heavyElementSpacing = normalSpacing + oneGridIncrement
// 4px grid: 16px → 20px
// 8px grid: 16px → 24px
```

**Examples:**
- Bold headings: +4px below (compared to regular text)
- Solid/high-contrast blocks: +one token (24px → 32px)
- Large numbers / data displays: more padding inside containers

### Rule 6: Rounded Corner Text Alignment

**Problem:** Text sitting above a container with rounded corners appears misaligned because the visual edge of the rounded container is inset from the geometric edge.

**Solution:** Add optical inset padding to text above rounded containers.

**Formula:**
```javascript
paddingLeftExtra = borderRadius × 0.5
// Snap to nearest 2px. Max +8px.
```

**Quick reference:**

| Border Radius | Formula | Snapped | Extra Padding |
|---------------|---------|---------|---------------|
| 4px           | 2px     | 2px     | +2px          |
| 6px           | 3px     | 4px     | +4px          |
| 8px           | 4px     | 4px     | +4px          |
| 12px          | 6px     | 6px     | +6px          |

```css
.rounded-container {
  border-radius: 8px;
  padding: 24px;
}

.heading-above-rounded {
  padding-left: 28px;  /* 24px + 4px optical inset */
}
```

### Rule 7: Comparison Card Height Matching

**Problem:** A/B comparison cards or before/after layouts look sloppy with different heights.

**Solution:** Calculate exact heights and force cards to match. Document the math.

**Process:**
1. Calculate total height for each card (sum of internal row heights + padding)
2. Use the LARGER value for BOTH cards
3. Document the math in code comments

```tsx
// Card A: 20px header + 60px content + 40px spacer + 120px footer + 20px padding = 260px
// Card B: 20px header + 80px content + 40px spacer + 100px footer + 20px padding = 260px
// Both cards MUST be min-h-[260px]

<div className="comparison-card min-h-[260px]">{/* Card A */}</div>
<div className="comparison-card min-h-[260px]">{/* Card B */}</div>
```

**Why document the math:** Future changes must recalculate. Without documentation, heights become arbitrary magic numbers.

---

## Layout System

### CSS Grid vs Flexbox

**Use CSS Grid for:**
- Multi-row layouts where rows must align
- Card layouts where internal structure matters
- Bento grids (Pinterest-style)
- Comparison layouts (side-by-side with matched heights)
- Any layout where vertical AND horizontal alignment both matter

**Use Flexbox for:**
- Single-row layouts (navigation bars, button groups)
- Simple centering
- Dynamic content wrapping
- Icon-text pairs
- Any layout where only ONE dimension matters

**Critical:** CSS Grid = 2D. Flexbox = 1D. Do not use Flexbox for 2D layouts.

### Bento Grid Hard Rules

1. **Cards MUST be direct children of grid container**
   ```html
   <!-- CORRECT -->
   <div class="bento-grid">
     <div class="bento-card"></div>
     <div class="bento-card"></div>
   </div>
   
   <!-- WRONG -->
   <div class="bento-grid">
     <div class="wrapper">
       <div class="bento-card"></div>
     </div>
   </div>
   ```

2. **Use CSS Grid, NOT Flexbox** — grid allows precise column/row spanning; flexbox cannot maintain alignment across rows.

3. **Class-based sizing, NEVER inline styles**
   ```html
   <!-- CORRECT -->
   <div class="bento-card bento-large"></div>
   
   <!-- WRONG -->
   <div class="bento-card" style="grid-column: span 2;"></div>
   ```

4. **Explicit spacer divs for flexible spacing**
   ```tsx
   <div className="bento-card">
     <div>{/* Header */}</div>
     <div>{/* Content */}</div>
     <div></div>  {/* Spacer — pushes footer to bottom */}
     <div>{/* Footer */}</div>
   </div>
   ```

### Uniform Grid Height Matching

```css
/* Parent grid — equalizes all card heights */
.grid-uniform {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
  grid-auto-rows: minmax(320px, auto);  /* all rows same height */
}

/* Card internal structure — distributes content */
.card-uniform {
  display: grid;
  grid-template-rows:
    auto              /* Header */
    var(--space-4)    /* Fixed spacer */
    auto              /* Content */
    var(--space-6)    /* Fixed spacer */
    minmax(60px, auto) /* Variable section */
    1fr               /* Flexible spacer — pushes footer down */
    auto;             /* Footer */
}
```

Parent `grid-auto-rows: minmax()` makes all cards same height. Child `grid-template-rows` with `1fr` spacer pushes footer to bottom. All footers align across cards.

---

## Color Hierarchy Through Opacity

**Principle:** Use OPACITY to create visual hierarchy within a single color. Fewer colors = cleaner design.

**White text hierarchy (example):**
```css
:root {
  --text-primary: rgba(255, 255, 255, 1.0);   /* Main headings */
  --text-high:    rgba(255, 255, 255, 0.9);   /* Subheadings */
  --text-medium:  rgba(255, 255, 255, 0.85);  /* Descriptions */
  --text-body:    rgba(255, 255, 255, 0.75);  /* Body text */
  --text-subdued: rgba(255, 255, 255, 0.6);   /* Labels, helpers */
  --text-subtle:  rgba(255, 255, 255, 0.5);   /* Fine print */
  --text-faint:   rgba(255, 255, 255, 0.4);   /* Very low emphasis */
}
```

**Benefits:** reduces cognitive load, maintains brand consistency, adjusts cleanly (change base color, entire hierarchy updates).

**Accent color restraint:** ≤20% of visible elements should use accent color. Accents lose impact when overused. If everything is highlighted, nothing is.

---

## Motion (UI micro-interactions ONLY)

**This section applies to UI feedback motion only** — hover lifts, button press, tooltip entry, state changes. Editorial/scroll/page-scale motion is a separate register (see `preferences/motion-references.md`).

**Travel limits:**
- Maximum: ≤8px
- Hover lift: 2px typical
- Micro-interactions: 1-4px
- **Never exceed 8px** — larger movements feel jarring

**Duration limits:**
- Default: 200ms
- Quick feedback (buttons): 150ms
- Smooth motion (cards): 250ms
- **Never exceed 300ms** for UI interactions

**Easing:**
```css
/* Spring easing — preferred for UI */
transition: all 250ms cubic-bezier(0.25, 1, 0.3, 1);

/* Quick feedback */
transition: transform 150ms cubic-bezier(0.25, 1, 0.3, 1);
```

**Why spring easing:** mimics natural physics. More satisfying than linear or default ease.

```css
/* Standard hover lift */
.card:hover {
  transform: translateY(-2px);
  transition: transform 200ms cubic-bezier(0.25, 1, 0.3, 1);
}

/* Button hover — more subtle */
.button:hover {
  transform: translateY(-1px);
  transition: transform 150ms cubic-bezier(0.25, 1, 0.3, 1);
}
```

---

## The 10 Commandments (summary)

1. **Choose a base grid and never deviate** — 4px, 8px, no arbitrary values
2. **Calculate, not eyeball** — optical alignment uses formulas
3. **Respect typography minimums** — display fonts have HARD minimums
4. **Use design system tokens** — no hardcoded values in code
5. **Maintain single source of truth** — one .md file, everything else generated
6. **CSS Grid for 2D layouts** — Flexbox is 1D only
7. **Compensate for optical illusions** — triangles shift, icons adjust, borders compensate
8. **Restrain accent colors** — ≤20% of elements, rarity = impact
9. **Keep motion subtle (UI scale)** — ≤8px travel, ≤300ms duration, spring easing
10. **Document thy math** — height calculations, formulas, reasoning in code comments

---

## Common Mistakes & Fixes

### "It looks centered to me"

Problem: relying on visual judgment instead of formulas.
Fix: use optical alignment formulas. Your eyes are correct that it looks off, but the fix must be calculated.

```css
/* Wrong */
.triangle { left: 52%; }  /* Why 52%? Eyeballed. */

/* Correct */
.triangle { left: calc(50% + 6.25%); }  /* Formula: containerWidth × 0.0625 */
```

### "I'll just use 15px, it's close enough"

Problem: breaking base grid for one-off adjustments.
Fix: find the nearest base-multiple OR add to spacing scale if truly needed.

### "This display font looks fine at 24px"

Problem: violating typography minimums makes text illegible.
Fix: respect hard minimums. If too large for space, use a different font designed for smaller sizes.

### "I'll add a wrapper div to make this easier"

Problem: breaking grid architecture for convenience.
Fix: work within grid constraints. Wrapper divs break layout structure.

### "Inline styles are faster for this one-off"

Problem: every "one-off" becomes a maintenance nightmare.
Fix: add a class to the design system. Never use inline styles.

---

## Detection integration (what the detector enforces)

The deterministic detector (forked from `impeccable detect`) runs these scanners automatically in `/critique` and `/ship`:

| Scanner | What it catches | Severity |
|---|---|---|
| Base-grid audit | non-base-multiple pixel values | P0 |
| Typography minimum audit | display fonts < declared minimum | P0 |
| Triangle/chevron center audit | `left: 50%; translateX(-50%)` on `.triangle/.chevron/.play-*` without optical offset | P1 |
| Icon-text vertical alignment audit | inline icons in text contexts without `top: -1px/-2px` | P1 |
| Border padding compensation audit | bordered elements where padding wasn't reduced by border-width | P1 |
| Accent color restraint audit | accent-color usage > 20% of visible elements | P1 |
| Pixel-perfect alignment audit | any misalignment > 0px on elements declared to align | P0 |

When the detector fires, `/critique` reports in this file's vocabulary. No paraphrasing — the rule names are the rule names.

---

## When rules apply

**MANDATORY for:**
- Production user interfaces
- Any design maintained by multiple people
- Brand-critical projects
- Projects where consistency matters

**OPTIONAL for:**
- Internal tools where polish doesn't matter
- Rapid prototypes that will be thrown away
- Proof-of-concept work

Apply where quality matters, skip for throwaway work.
