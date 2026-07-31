---
name: overdrive
description: Pushes interfaces past conventional limits with technically ambitious implementations — shaders, spring physics, scroll-driven reveals, 60fps animations. Use when the user wants to wow, impress, go all-out, or make something that feels extraordinary.
---

Push an interface past conventional limits. This isn't just about visual effects — it's about using the full power of the browser to make any part of an interface feel extraordinary: a table that handles a million rows, a dialog that morphs from its trigger, a form that validates in real-time with streaming feedback, a page transition that feels cinematic.

**EXTRA IMPORTANT**: Context determines what "extraordinary" means. A particle system on a creative portfolio is impressive. The same particle system on a settings page is embarrassing. A settings page with instant optimistic saves and animated state transitions is extraordinary too. Understand the project's personality and goals before deciding what's appropriate.

## Directional-not-perspective

2D only. No 3D perspective effects (see the `animate` skill).

---

### Propose Before Building

This skill has the highest potential to misfire. Do NOT jump straight into implementation.

1. Think through 2-3 different directions — different techniques, levels of ambition, aesthetic approaches. For each, briefly describe what the result would look and feel like.
2. Present these directions and get the user's pick before writing any code. Explain trade-offs (browser support, performance cost, complexity).
3. Only proceed with the direction the user confirms.

Skipping this step risks building something embarrassing that needs to be thrown away.

### Iterate

Technically ambitious effects almost never work on the first try. If you have a way to preview the result (a browser tool, a code sandbox), use it to visually verify and iterate — don't assume it looks right. Expect multiple rounds of refinement.

---

## Assess What "Extraordinary" Means Here

Ask: what would make a user of THIS specific interface say "wow, that's nice"?

- **Visual/marketing surfaces** (heroes, landing pages, portfolios): sensory wow — scroll-driven reveal, shader background, cinematic transition.
- **Functional UI** (tables, forms, dialogs, nav): the wow is in how it FEELS — a dialog that morphs from its trigger via View Transitions, a table rendering 100k rows at 60fps, streaming form validation, spring-physics drag-and-drop.
- **Performance-critical UI**: invisible but felt — search that filters 50k items without a flicker, a form that never blocks the main thread.
- **Data-heavy interfaces**: fluidity — GPU-accelerated Canvas/WebGL rendering, animated transitions between data states, force-directed layouts that settle naturally.

The common thread: the implementation goes beyond what users expect from a web interface, in service of the experience.

## The Toolkit

### Make transitions feel cinematic
- **View Transitions API** — shared element morphing (a list item expanding into a detail page, a button morphing into a dialog).
- **`@starting-style`** — CSS-only entry animation from `display: none`.
- **Spring physics** — natural motion with mass/tension/damping instead of cubic-bezier (Motion/Framer Motion, GSAP, or a custom spring solver).

### Tie animation to scroll position
- **Scroll-driven animations** (`animation-timeline: scroll()`) — CSS-only parallax, progress bars, reveal sequences. Always provide a static fallback for browsers without support.

### Render beyond CSS
- **WebGL** (Three.js, OGL, regl) — shader effects, post-processing, particle systems.
- **WebGPU** — next-gen GPU compute; fall back to WebGL2.
- **Canvas 2D / OffscreenCanvas** — custom rendering or moving heavy rendering to a Web Worker.
- **SVG filter chains** — displacement maps, turbulence, morphology for organic distortion.

### Make data feel alive
- **Virtual scrolling** for tables/lists with tens of thousands of items.
- **GPU-accelerated charts** (deck.gl, regl-based) for datasets too large for SVG/DOM.
- **Animated data transitions** — morph between chart states, not replace.

### Animate complex properties
- **`@property`** — register custom CSS properties with types, enabling animation of gradients/colors CSS can't normally interpolate.
- **Web Animations API** — JS-driven animation with CSS-level performance; composable, cancellable, reversible.

### Push performance boundaries
- **Web Workers** / **OffscreenCanvas** — move heavy computation or rendering off the main thread.
- **WASM** — near-native performance for computation-heavy features.

### Interact with the device
- **Web Audio API** — spatial audio, audio-reactive visuals, sonic feedback (requires user gesture).
- **Device APIs** — orientation, ambient light, geolocation. Use sparingly, always with permission.

**NOTE**: This skill enhances how an interface FEELS, not what a product DOES. Adding real-time collaboration or new backend capabilities are product decisions, not UI enhancements.

## Implement with Discipline

### Progressive enhancement is non-negotiable

Every technique must degrade gracefully:

```css
@supports (animation-timeline: scroll()) {
  .hero { animation-timeline: scroll(); }
}
```
```javascript
if ('gpu' in navigator) { /* WebGPU */ }
else if (canvas.getContext('webgl2')) { /* WebGL2 fallback */ }
/* CSS-only fallback must still look good */
```

### Performance rules
- Target 60fps; simplify if dropping below 50.
- Respect `prefers-reduced-motion` always — provide a beautiful static alternative.
- Lazy-initialize heavy resources (WebGL contexts, WASM modules) only near viewport.
- Pause off-screen rendering.
- Test on real mid-range devices, not just a dev machine.

### Polish is the difference

The gap between "cool" and "extraordinary" is in the last 20%: the easing curve on a spring, the timing offset in a staggered reveal, the subtle secondary motion that makes a transition feel physical.

**NEVER**:
- Ignore `prefers-reduced-motion`
- Ship effects that cause jank on mid-range devices
- Use bleeding-edge APIs without a functional fallback
- Add sound without explicit user opt-in
- Use technical ambition to mask weak design fundamentals
- Layer multiple competing extraordinary moments — focus creates impact, excess creates noise

## Verify the Result

- **The wow test**: show it to someone who hasn't seen it — do they react?
- **The removal test**: take it away — does the experience feel diminished?
- **The device test**: phone, tablet, Chromebook — still smooth?
- **The accessibility test**: reduced motion enabled — still beautiful?
- **The context test**: does this make sense for THIS brand and audience?

Remember: "Technically extraordinary" isn't about using the newest API. It's about making an interface do something users didn't think a website could do.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
