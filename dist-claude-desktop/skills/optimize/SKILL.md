---
name: optimize
description: Diagnoses and fixes UI performance across loading speed, rendering, animations, images, and bundle size. Use when the user mentions slow, laggy, janky, performance, bundle size, load time, or wants a faster, smoother experience.
---

Identify and fix performance issues to create faster, smoother user experiences.

## Assess Performance Issues

1. **Measure current state**: Core Web Vitals (LCP, FID/INP, CLS), load time, bundle size, runtime performance (frame rate, memory, CPU), network (request count, payload sizes).
2. **Identify bottlenecks**: What's slow (initial load? interactions? animations?), what's causing it, how bad is it, who's affected.

**CRITICAL**: Measure before and after. Premature optimization wastes time. Optimize what actually matters.

## Optimization Strategy

### Loading Performance
- Images: modern formats (WebP/AVIF), proper sizing, lazy loading, `srcset`/`picture`, 80-85% compression, CDN.
- JavaScript: code splitting, tree shaking, remove unused deps, dynamic imports for large components.
- CSS: remove unused CSS, inline critical CSS, minimize files, use `contain`.
- Fonts: `font-display: swap`/`optional`, subset fonts, preload critical fonts, limit weights loaded.
- Loading strategy: async/defer non-critical, preload critical assets, prefetch likely next pages, service worker caching, HTTP/2+.

### Rendering Performance
- Avoid layout thrashing: batch all DOM reads, then all writes (never alternate).
- Use `contain`, minimize DOM depth/size, `content-visibility: auto` for long lists, virtual scrolling for very long lists.
- Animate only `transform`/`opacity` (GPU-accelerated); avoid animating layout properties; use `will-change` sparingly.

### Animation Performance
- Target 60fps (16ms/frame); use `requestAnimationFrame`; debounce/throttle scroll handlers; use CSS animations when possible.
- Use `IntersectionObserver` to lazily trigger animations/loads on viewport entry.

### React/Framework Optimization
- `memo()`, `useMemo()`, `useCallback()` for expensive work; virtualize long lists; code-split routes; avoid inline function creation in render; profile with DevTools.

### Network Optimization
- Combine small files, SVG sprites, inline small critical assets, remove unused third-party scripts.
- Pagination, GraphQL field selection, response compression, HTTP caching headers, CDN.
- Adaptive loading based on connection (`navigator.connection`), optimistic UI, request prioritization.

## Core Web Vitals Optimization

- **LCP < 2.5s**: optimize hero images, inline critical CSS, preload key resources, CDN, SSR.
- **FID < 100ms / INP < 200ms**: break up long tasks, defer non-critical JS, web workers for heavy computation.
- **CLS < 0.1**: set dimensions on images/video, don't inject content above existing content, `aspect-ratio`, reserve space for ads/embeds.

## Performance Monitoring

Tools: Chrome DevTools (Lighthouse, Performance panel), WebPageTest, Core Web Vitals report, bundle analyzers, RUM (Sentry, DataDog, New Relic).
Key metrics: LCP, FID/INP, CLS, TTI, FCP, TBT, bundle size, request count.

**IMPORTANT**: Measure on real devices with real network conditions. Desktop Chrome with fast connection isn't representative.

**NEVER**:
- Optimize without measuring
- Sacrifice accessibility for performance
- Break functionality while optimizing
- Use `will-change` everywhere (creates new layers, uses memory)
- Lazy load above-fold content
- Optimize micro-optimizations while ignoring the biggest bottleneck
- Forget about mobile performance (slower devices, slower connections)

## Verify Improvements

Compare before/after Lighthouse scores, track real-user metrics, test on low-end Android (not just flagship), throttle to 3G, confirm no functional regressions, and ask: does it *feel* faster?

Remember: Performance is a feature. Fast experiences feel more responsive, more polished, more professional. Optimize systematically, measure ruthlessly, and prioritize user-perceived performance.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
