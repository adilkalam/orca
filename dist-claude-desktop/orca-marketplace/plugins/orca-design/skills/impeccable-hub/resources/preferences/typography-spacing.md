# Preference: Typography Spacing — the combination discipline

## Verbatim

> "Proper spacing for body content. There's h1, h2, h3, h4; body font; lists and bullets. Rules to not 'double stack' spacing out of laziness. E.g. if a bullet list item has top and bottom margin, and each paragraph has bottom margin, then the first item in a bullet list ends up inheriting 2x the margin, making it sit awkwardly far from its reference point. So each combination needs its own type setting — list after paragraph, list after h4, paragraph after list, body after h2, or h3, etc. What that spacing is is open depending on project."

## What this is about

The discipline is **combination-specific typesetting**, not uniform margins. The failure is margin-double-stacking: both the previous element and the next element declare their own space, and where they meet, the space compounds into an awkwardly large gap. Considered typography treats each *junction* (paragraph-to-list, heading-to-body, list-to-paragraph, blockquote-to-heading, first-child-in-container, last-child) as its own case with its own rule.

**Values are project-specific. The discipline is universal.** The spine doesn't prescribe "use 16px between paragraphs" — it prescribes "every junction has an explicit rule, and the first-child and last-child and adjacent-sibling cases are all handled."

---

## The 14 named junctions that always need explicit rules

Every considered prose typesetting system handles these cases. Selectors may be adjacent-sibling (`p + ul`), `:has()` pseudo-class, `:first-child`, `:last-child`, or scoped class. The point is that each junction has an *intentional* spacing value, not an inherited default.

1. **First child of prose container** — prevent full top-margin inheritance
2. **Last child of prose container** — prevent trailing bottom-margin leak
3. **Paragraph followed by list** (`p + ul`, `p + ol`, or `p:has(+ ul)`)
4. **Paragraph followed by heading** (usually handled via the heading's top margin)
5. **List followed by paragraph** (`ul + p`, `ol + p`) — handled via `li:last-child` bottom or list container margin
6. **First list item** (`li:first-child`) — reset inherited top margin
7. **Last list item** (`li:last-child`) — bump bottom margin for breathing room
8. **Heading followed by paragraph** (per heading level)
9. **Heading followed by list** (per heading level)
10. **Heading followed by heading** (e.g., h2 directly followed by h3 — sub-section chain)
11. **Blockquote followed by paragraph / heading**
12. **Code block followed by paragraph / heading**
13. **Table followed by paragraph / heading**
14. **Image / figure followed by paragraph** (caption handling especially)

Each junction gets its own spacing value, chosen by the project, declared explicitly in CSS.

---

## Reference implementation — the CSS patterns

Below are the specific CSS patterns that implement the discipline. Spacing values here are *examples from a working implementation*; actual values come from project context. The *structure* of the rules is what the spine enforces.

### First child of prose container

The first element in a prose container shouldn't inherit the full top margin of whatever element it happens to be (which would push content down awkwardly from the container edge).

```css
.prose > *:first-child {
  margin-top: var(--space-4);   /* smaller than the type's default top */
}
```

### Paragraph followed by list — the double-stack fix

The paragraph *before* a list reduces its bottom margin because the list will add its own top margin. Without this, the two margins compound.

```css
.prose p:has(+ ul),
.prose p:has(+ ol) {
  margin-bottom: var(--space-2);   /* reduced from default because list adds top */
}
```

### First list item — reset inherited top

The first item in a list doesn't need its default top margin because the list's own top margin already created that space.

```css
.prose ul > li:first-child,
.prose ol > li:first-child {
  margin-top: 0;
  padding-top: 0;
}
```

### Last list item — bump bottom for breathing room

The last item adds extra bottom space so whatever comes after the list (paragraph, heading) gets a real gap, not the tight inter-item spacing.

```css
.prose ul > li:last-child,
.prose ol > li:last-child {
  margin-bottom: var(--space-6);
}
```

### Per-heading asymmetric margins (the anti-uniform move)

Each heading level has its OWN spacing signature. This is the opposite of "all headings share the same margin pattern." Each level carries its own role in the hierarchy, and the spacing reflects that role.

```css
/* H1 — big space above, tight to next element */
.prose h1 {
  font-family: var(--font-display);
  font-size: var(--font-size-display);
  font-weight: 500;
  line-height: 1.2;
  margin-top: var(--space-12);
  margin-bottom: var(--space-2);
}

/* H2 — uses padding-top not margin-top (no collapsing);
   tight to content below */
.prose h2 {
  font-size: var(--font-size-base);
  font-weight: 400;
  text-transform: uppercase;
  margin-bottom: var(--space-1);
  padding-top: var(--space-4);   /* padding > margin to avoid collapse */
}

/* H3 — just bottom margin; top inherited from context */
.prose h3 {
  font-size: var(--font-size-body-lg);
  font-weight: 300;
  font-style: italic;
  margin-bottom: var(--space-4);
}

/* H4 — massive top gap (section break), moderate bottom */
.prose h4 {
  font-family: var(--font-display-sans);
  font-size: var(--font-size-h2);
  font-weight: 400;
  margin-top: var(--space-24);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-accent);
}
```

Notice the pattern: **h1 big-top-tight-bottom. h2 padding-based top. h3 just bottom. h4 huge section-break top.** Each heading declares its role through space.

### Custom bullet positioning at x-height

Bullets should optically align to the body text's x-height, not to the line-box top. This is pixel-precision applied to inline decoration.

```css
.prose ul li {
  position: relative;
  padding-left: var(--space-5);
}

.prose ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;                              /* aligns to x-height of body */
  width: var(--bullet-size);
  height: var(--bullet-size);
  background-color: var(--color-text);
  border-radius: 50%;
}
```

**Adjustment by text size:**
- 12-14px text: `top: 0.55em`
- 16px text: `top: 0.7em`
- 18px+ text: `top: 0.75em`

### Custom numbered lists

```css
.prose ol {
  counter-reset: list-counter;
  list-style: none;
}

.prose ol li {
  position: relative;
  padding-left: var(--space-5);
  counter-increment: list-counter;
}

.prose ol li::before {
  content: counter(list-counter) ".";
  position: absolute;
  left: 0;
  color: var(--color-text);
  font-weight: 400;
}
```

### Context-specific overrides (references, blockquotes, code, tables)

Different content contexts override the default body paragraph rules rather than inheriting.

```css
/* References — left-align, tighter gap */
.prose .references p {
  text-align: left;                        /* overrides body justify */
  margin-bottom: var(--space-2);           /* tighter than body */
}

/* Blockquotes — own margin, own style */
.prose blockquote {
  border-left: 3px solid var(--color-accent);
  padding: 0 var(--space-8) 0 var(--space-10);
  margin: var(--space-12) 0;
  max-width: 98%;
}

.prose blockquote p {
  margin-bottom: 0;                        /* blockquote controls its own spacing */
  font-size: var(--font-size-body-xl);
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
  color: var(--color-accent);
}

/* Code — different margins than body */
.prose pre {
  font-family: var(--font-mono);
  padding: var(--space-6);
  border-left: 2px solid var(--color-accent-soft);
  margin: var(--space-6) 0;
  max-width: 98%;
}

/* Tables — tighter top margin, looser bottom */
.prose table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: var(--space-2) 0 var(--space-8) 0;
}
```

### Max-width on body elements

Keep content from hitting container edges:

```css
.prose p,
.prose ul,
.prose ol {
  max-width: 98%;
}
```

---

## Inline treatment (strong, em, links)

Bold text carries color hierarchy too, not just weight. Italic has its own letter-spacing distinct from body.

```css
.prose strong {
  font-weight: 500;
  color: var(--color-text-high);       /* different color, not just weight */
}

.prose em {
  font-family: var(--font-body);
  font-style: italic;
  font-size: 1em;
  letter-spacing: 0.05em;              /* distinct from body's 0.02em */
}

.prose a {
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent-soft);
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.prose a:hover {
  color: var(--color-text-high);
  border-bottom-color: var(--color-text-high);
}
```

---

## Mobile overrides

Typography scale compresses on mobile; spacing stays combination-aware.

```css
@media (max-width: 1023px) {
  .prose h1 {
    font-size: var(--font-size-body-xl);
  }
  
  .prose h2,
  .prose h3 {
    font-size: var(--font-size-body-lg);
  }
  
  .prose p,
  .prose ul,
  .prose ol {
    font-size: var(--font-size-body);
    line-height: 1.4;
    text-align: left;                    /* override desktop justify */
    max-width: 100%;
  }
  
  .prose blockquote {
    font-size: var(--font-size-body-lg);
    padding: var(--space-5) var(--space-5) var(--space-5) calc(var(--space-6) + var(--space-1));
    max-width: 100%;
  }
  
  .prose ul {
    padding-left: var(--space-4);
  }
}
```

---

## Detection — heuristic, not pure regex

The signal of considered typesetting is the presence of these selector patterns. The signal of failure is their absence.

| Detection | Flag condition | Severity |
|---|---|---|
| No `:first-child` rules in prose CSS | zero occurrences on headings / lists / container children | P0 |
| No `:last-child` rules | zero occurrences on list items | P0 |
| No adjacent-sibling or `:has()` handling | zero `+` combinators or `:has()` in prose CSS | P0 |
| Uniform heading margins | all h1–h6 share the same `margin-top` AND `margin-bottom` | P0 |
| Missing `p + heading` or `list + heading` handling | headings after lists/paragraphs use the same top margin regardless of what preceded | P1 |
| Heading uses `margin-top` without collapse awareness | heading with `margin-top` that would collapse with preceding `margin-bottom` without override | P1 |
| `margin-top` on `li:first-child` not reset | first list item inherits default `li` top margin | P0 |
| Default browser bullets | `list-style` not overridden OR custom bullet without x-height positioning | P1 |

---

## What the spine enforces (via /polish and /critique)

- Presence of `:first-child`, `:last-child`, adjacent-sibling or `:has()` rules in prose-scope CSS
- Per-heading-level asymmetric margins (different top/bottom per level)
- Explicit handling of the 14 named junctions above
- `padding-top` instead of `margin-top` on headings where margin-collapsing would lose the intended gap
- Custom bullet positioning with x-height alignment

The spine does NOT enforce specific spacing values. Those come from project context — `aesthetic.md` might declare a spacing scale, and the junctions get filled from that scale per-project.
