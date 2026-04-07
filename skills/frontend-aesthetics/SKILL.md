---
name: frontend-aesthetics
description: "Global frontend aesthetics skill that prevents generic AI-slop UI and drives bold, intentional visual decisions. Use when implementing any UI work (web, Expo, iOS) to ensure distinctive, cohesive aesthetics that honor each project's design-dna, tokens, and architecture."
allowed-tools: Read, WebFetch
---

# Frontend Aesthetics — Global Design Skill

Always loaded by builders for **any UI work**. Layers on top of project design docs (`design-system-vX.X.md`, `DESIGN_RULES_vX.X.md`, `CSS-ARCHITECTURE.md`) and design-dna JSON (`design-dna.json` or `.claude/design-dna/`).

**Rule**: Treat local design-dna as **law**; this skill is advisory, not overriding.

## When to Use

Every frontend implementation task — web, Expo, iOS. Good design thinking costs nothing extra.

## Core Aesthetic Principles

### Typography

- **Intentional type roles**: headings, section titles, labels, body, meta — mapped to project tokens or semantic CSS classes.
- **4-tier font system** (when no design-dna guidance): Display (distinctive, large headings), Body (readable paragraphs), Accent (optional — taglines, labels), Monospace (code only).
- **Anti-convergence**: Never converge on the same common fonts across projects. Each project deserves its own typographic identity.
- Advisory: Generic overused fonts (Inter, Roboto, Arial, system-ui defaults) signal lazy defaults. Recommend distinctive alternatives matching the project's character — but if design-dna specifies Inter, use Inter.

### Color & Theme

- One primary accent, a small supporting palette, reasonable neutrals for surfaces.
- Token-based colors (CSS variables, theme tokens) with semantic roles (surface, accent, border, text).
- Avoid: "AI slop" purple gradient on white (unless design-dna), competing accents everywhere.

### Spacing, Layout & Rhythm

- **Mathematical spacing**: Every value from a system (4px/8px base grid), not eyeballed. See `skills/ui-image-rules/SKILL.md`, `skills/ui-typography-spacing/SKILL.md`, `skills/ui-page-standards/SKILL.md` for the concrete scale and 2x rule.
- Consistent vertical rhythm for section breaks, component padding, related element distance.
- Avoid: uneven ad-hoc spacing, over-nesting containers, arbitrary pixel values outside any scale.

### Motion & Micro-interactions

- **High-impact moments**: One well-orchestrated page load with staggered reveals (animation-delay) beats scattered micro-interactions.
- Simple, performant patterns (opacity/translate) with short durations.
- Avoid: bouncy/chaotic motion (unless brand), micro-animations everywhere without purpose.

### Backgrounds & Depth

- Surfaces, elevation, and subtle contrast for depth and focus — cards/panels for grouped content, differentiated backgrounds for sections.
- Avoid: flat layouts where everything is the same value; heavy borders — prefer hairlines and surface contrast.

### Spatial Composition

- **Unexpected layouts**: asymmetry, overlap, grid-breaking elements, generous negative space OR controlled density.
- Match implementation complexity to aesthetic vision — maximalist needs elaborate code, minimalist needs precision and restraint.

## Anti-Pattern Library — "AI Slop" to Avoid

1. **Generic dashboards**: centered hero + 2–3 gradient cards + basic charts with no identity
2. **Copy-paste template feel**: obvious clone of a UI library's default look
3. **Color soup**: too many accents, uncoordinated hues, no semantic meaning
4. **Flattened hierarchy**: everything same weight and size
5. **Over-animated UI**: every hover zooms/bounces, long transitions
6. **Generic AI aesthetics**: overused fonts, cliched purple gradients, predictable layouts
7. **Same design across projects**: if output could belong to any project, it belongs to none

## Design-DNA Interaction

- **design-dna exists**: Load first, get tokens/components/cardinal laws. Use this skill to make better choices *within* those constraints.
- **No design-dna**: Push toward cohesive, intentional aesthetics. Keep implementation maintainable so design-dna can be added later.

## Design Direction by Product Type

When no design-dna exists, use these defaults based on product type:

| Product Type | Style | Color Direction | Key Constraint |
|---|---|---|---|
| SaaS | Glassmorphism + Flat | Trust blue + Accent contrast | Professional, scannable |
| E-commerce | Vibrant Block-based | Brand primary + Success green | Card depth, conversion focus |
| E-commerce Luxury | Liquid Glass | Premium dark/gold | Aspiration, slow parallax |
| Healthcare | Neumorphism + Accessible | Calm blue + Health green | WCAG AAA, 16px+ type |
| Fintech Dashboard | Glassmorphism + Dark | Dark tech + Vibrant accents | Security badges, real-time clarity |
| Education | Claymorphism + Micro-interactions | Playful + Clear hierarchy | Friendly, progress indicators |
| Portfolio / Creative | Motion-Driven + Minimal | Brand primary + Artistic freedom | Expressive, variable typography |
| Developer Tool | Dark Mode + Minimal | Dark syntax + Blue focus | Keyboard shortcuts, fast performance |

## Output Expectations

When loaded for UI work, agents must:
- Make aesthetic decisions **explicit** ("Using [X] as primary accent, [Y/Z] as supporting")
- Call out where generic patterns were **avoided**
- Reference specific design-dna tokens/components/rules when present
