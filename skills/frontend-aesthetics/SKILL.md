---
name: frontend-aesthetics
description: >
  Global frontend aesthetics skill that helps Claude avoid generic "AI slop"
  UI and make bold, intentional visual decisions while still honoring each
  project's design-dna, tokens, and architecture.
license: internal
allowed-tools:
  - Read
  - WebFetch
metadata:
  category: "frontend-design"
  source: "anthropic-frontend-design-plugin + OS 6.3 design-dna"
---

# Frontend Aesthetics – Global Design Skill

You are loading the **Frontend Aesthetics** skill. This skill is meant to:

- Push you away from generic, template-like AI UI.
- Encourage distinctive, cohesive aesthetics per project.
- Keep you inside each project's **design-dna and tokens**.

This skill does **not** define a visual language by itself. It layers on top of:
- Project design docs (`design-system-vX.X.md`, `DESIGN_RULES_vX.X.md`,
  `CSS-ARCHITECTURE.md` or equivalents).
- Any project-specific design-dna JSON (e.g. `design-dna.json` or `.claude/design-dna/`).

---

## 1. When to Use This Skill

This skill is **ALWAYS loaded by builders for ANY UI work**. It is not optional
and does not require the user to ask for "distinctive" or "premium" UI. Every
piece of frontend output should reflect intentional design thinking.

You can use this skill in **any** frontend context (web/expo/ios):
- Every UI implementation task, regardless of scope or complexity.
- The project has at least some design/dna docs or tokens you can honor.
- Even for "simple" tasks -- good design thinking costs nothing extra.

You must still:
- Respect project design systems and constraints.
- Treat local design-dna as **law**; this skill is advisory, not overriding.

---

## 2. Core Aesthetic Principles

These principles help create intentional, distinctive UI while respecting project constraints.

### 2.1 Typography

- Choose **intentional type roles**, not arbitrary sizes:
  - Headings, section titles, labels, body, meta.
  - Use project tokens or semantic CSS classes where available.
- **4-tier font system** (when choosing fonts without design-dna guidance):
  - **Display**: One distinctive font for large headings and hero text.
  - **Body**: One refined, highly readable font for paragraphs and content.
  - **Accent**: Optional third font for taglines, labels, quotes.
  - **Monospace**: For code blocks and technical content only.
  - Pair a distinctive display font with a refined body font.
- **Anti-convergence principle**: NEVER converge on the same common font choices
  across projects or generations. Each project deserves its own typographic identity.
- Advisory guidance on font selection:
  - Generic, overused fonts (Inter, Roboto, Arial, system-ui defaults) are a sign
    of lazy defaults, not intentional design. Recommend distinctive alternatives
    that match the project's character and audience.
  - This is advisory -- not a hard ban. If a project's design-dna specifies Inter,
    use Inter. But when you are choosing, choose with intention.
- Avoid:
  - Overused generic fonts in projects that ship their own type.
  - Random size ladders that don't map to design tokens.
- Use typography to create a clear hierarchy:
  - H1/H2 vs section subheads.
  - Body vs meta/labels.

### 2.2 Color & Theme

- Commit to a **cohesive aesthetic**:
  - One primary accent.
  - A small supporting palette.
  - Reasonable neutrals for surfaces/backgrounds.
- Avoid:
  - The classic "AI slop" purple gradient on white, unless explicitly part of
    design-dna.
  - Competing accents everywhere; let color mean something.
- Prefer:
  - Token-based colors (CSS variables, theme tokens).
  - Semantic roles (surface, accent, border, text) rather than one-off hex.

### 2.3 Spacing, Layout & Rhythm

- **Mathematical spacing principle**: Every spacing value should come from a
  system, not be eyeballed. Use a consistent scale (4px/8px base grid) and
  derive all values from it. See `skills/ui-image-rules/SKILL.md`, `skills/ui-typography-spacing/SKILL.md`, `skills/ui-page-standards/SKILL.md`
  for the concrete spacing scale and the 2x rule.
- Snap spacing to the project's **grid and spacing tokens**.
- Use consistent vertical rhythm:
  - Section breaks.
  - Component padding.
  - Distance between related elements.
- Avoid:
  - Uneven, ad-hoc spacing just to make something "fit".
  - Over-nesting containers when simple layout primitives would suffice.
  - Arbitrary pixel values that don't belong to any spacing scale.

### 2.4 Motion & Micro-interactions

- **Focus on high-impact moments**: One well-orchestrated page load with
  staggered reveals (animation-delay) creates more delight than scattered
  micro-interactions. Invest motion budget where it matters most.
- Use scroll-triggering and hover states that surprise.
- Use motion to:
  - Clarify state changes.
  - Add subtle delight to key interactions.
- Favor:
  - Simple, performant patterns (opacity/translate) with short durations.
- Avoid:
  - Bouncy, chaotic motion unless it is explicitly part of the brand.
  - Spreading micro-animations everywhere without a clear purpose.

### 2.5 Backgrounds & Depth

- Use surfaces, elevation, and subtle contrast to create **depth and focus**:
  - Cards/panels for grouped content.
  - Differentiated backgrounds for page sections.
- Avoid:
  - Flat, lifeless layouts where everything is the same value.
  - Heavy borders; prefer hairlines and surface contrast.

### 2.6 Spatial Composition

- **Unexpected layouts**: Asymmetry. Overlap. Grid-breaking elements. Generous
  negative space OR controlled density. Not every layout needs to be a symmetric
  grid of equal-width cards.
- **Match implementation complexity to the aesthetic vision**:
  - Maximalist designs need elaborate code with extensive animations and effects.
  - Minimalist designs need precision and restraint -- careful attention to
    spacing, typography, and subtle details.
  - Elegance comes from executing the vision well, not from complexity.
- Consider diagonal flow, layered elements, and unexpected spatial relationships
  that make the design feel intentionally crafted rather than auto-generated.

---

## 3. Anti-Pattern Library -- "AI Slop" to Avoid

When designing or implementing UI, watch out for:

1. **Generic dashboards**
   - Centered hero + 2–3 gradient cards + basic charts with no identity.
   - Uniform-grey cards with indistinguishable content blocks.

2. **Copy-paste template feel**
   - Obvious clone of a popular UI library's default look without customization.

3. **Color soup**
   - Too many accents, uncoordinated hues, no clear semantic meaning.

4. **Flattened hierarchy**
   - Everything the same weight and size.
   - Sections only separated by random white space.

5. **Over-animated UI**
   - Every hover zooms/bounces.
   - Long transitions that slow the interface down.

6. **Generic AI-generated aesthetics**
   - Overused font families (Inter, Roboto, Arial, system fonts) as lazy defaults.
   - Cliched purple gradients on white backgrounds.
   - Predictable layouts and component patterns.
   - Cookie-cutter design that lacks context-specific character.

7. **Same design across projects**
   - No design should look the same across projects. Vary between light and
     dark themes, different fonts, different aesthetics.
   - If your output could belong to any project, it belongs to none.

If you see these emerging, pause and re-center on project design-dna and the
principles above.

---

## 4. Interaction with Project Design-DNA

When a project has a machine-readable design-dna (e.g. `design-dna.json` or
`.claude/design-dna/`):

- **Always load design-dna first.**
  - Get tokens, components, and cardinal laws.
- Then apply this skill:
  - Use it to make **better choices within those constraints**, not to invent
    a new visual language.

If no design-dna exists:
- Use this skill to:
  - Push toward an aesthetic that feels cohesive and intentional.
  - Still keep implementation maintainable and token-friendly so design-dna
    can be added later.

---

## 5. Output Expectations for Agents Using This Skill

When a frontend/expo/ios agent has loaded this skill and is asked to build or
refine UI:

- Make aesthetic decisions **explicit**:
  - "I'm using [X] as the primary accent and [Y/Z] as supporting tones."
  - "Title/body/meta are mapped to [these] typography roles."
- Call out where you've **avoided generic patterns**:
  - "Instead of a generic 3-card feature row, I used [project-specific pattern]."
- Remain grounded in **project design-dna** when present:
  - Reference specific tokens, components, or rules from design-dna when
    explaining choices.

The goal is for UI to feel:
- Designed, not templated.
- Distinctive, but still aligned with the project's system.
- Maintainable and understandable to other humans and agents.

---

## 6. Design Direction by Product Type

These constraints give agents concrete starting points when making visual design
decisions. When a project's design-dna exists, it overrides these defaults. When
no design-dna exists, use these as a first approximation based on the product type.

| Product Type | Recommended Style | Color Direction | Key Constraint |
|---|---|---|---|
| SaaS (General) | Glassmorphism + Flat Design | Trust blue + Accent contrast | Professional, scannable, prioritize minimalism |
| Micro SaaS | Flat Design + Vibrant Blocks | Vibrant primary + White space | Bold CTAs, minimal onboarding steps |
| E-commerce (General) | Vibrant Block-based | Brand primary + Success green | Card depth, clear hierarchy, conversion focus |
| E-commerce Luxury | Liquid Glass + Glassmorphism | Premium dark/gold + Minimal accent | Aspiration, exclusivity, slow parallax (400-600ms) |
| Healthcare App | Neumorphism + Accessible | Calm blue + Health green | WCAG AAA mandatory, 16px+ type, soft shadows |
| Fintech Dashboard | Glassmorphism + Dark Mode | Dark tech + Vibrant accents | Security badges required, real-time data clarity |
| Banking / Traditional Finance | Minimalism + Accessible | Navy + Trust blue + Gold | Security-first, smooth number animations |
| Education Platform | Claymorphism + Micro-interactions | Playful colors + Clear hierarchy | Friendly, engaging, progress indicators |
| Portfolio / Creative | Motion-Driven + Minimalism | Brand primary + Artistic freedom | Expressive, parallax OK, variable typography |
| Government / Public | Accessible + Minimalism | Professional blue + High contrast | WCAG AAA, keyboard navigation, skip links |
| Startup Landing | Motion-Driven + Vibrant Blocks | Bold primaries + Accent contrast | Scroll-triggered animations, video hero |
| SaaS Dashboard | Data-Dense + Heat Map | Cool-to-hot gradients + Neutral grey | Real-time updates, hover tooltips, chart zoom |
| B2B Enterprise | Trust & Authority + Minimal | Professional blue + Neutral grey | Case studies, ROI messaging, formal tone |
| Restaurant / Food | Vibrant Blocks + Motion | Warm colors (orange, red, brown) | High-quality imagery mandatory, appetizing palette |
| Real Estate | Glassmorphism + Minimalism | Trust blue + Gold + White | Map integration, virtual tours, professional |
| Wellness / Mental Health | Neumorphism + Accessible | Calm pastels + Trust colors | Privacy-first, breathing animations, soft press |
| News / Media | Minimalism + Flat Design | Brand + High contrast | Mobile-first reading, clear category navigation |
| Legal Services | Trust & Authority + Minimal | Navy + Gold + White | Credential display, authoritative typography |
| Developer Tool / IDE | Dark Mode + Minimalism | Dark syntax theme + Blue focus | Keyboard shortcuts, monospace, fast performance |
| Non-profit / Charity | Accessible + Organic | Cause-related colors + Warm | Impact stories, donation transparency |

### What to Avoid by Type

| Product Type | Anti-Patterns |
|---|---|
| Healthcare | Bright neon, motion-heavy animations, AI purple/pink gradients |
| Fintech / Banking | Light backgrounds without security indicators, playful design, unclear fees |
| Government / Public | Ornate design, low contrast, motion effects, AI purple/pink gradients |
| B2B Enterprise | Playful design, hidden features, AI purple/pink gradients |
| Education (Children) | Dark modes, complex jargon, dense layouts |
| Legal Services | Outdated design, hidden credentials, AI purple/pink gradients |
| Luxury / Premium | Cheap visuals, fast animations, vibrant block-based layouts |
| Senior Care / Elderly | Small text, complex navigation, AI purple/pink gradients |
| Restaurant / Food | Low-quality imagery, outdated hours, text-heavy pages |
| News / Media | Cluttered layout, slow loading, poor typography |
| Portfolio / Creative | Corporate templates, generic layouts |
| SaaS Dashboard | Ornate design, slow rendering, no filtering |
| Non-profit | Greenwashing visuals, no impact data, hidden financials |
| Developer Tool | Light mode default, slow performance, heavy chrome |
