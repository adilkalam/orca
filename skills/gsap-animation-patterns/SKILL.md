---
name: gsap-animation-patterns
description: >
  Role-oriented GSAP ScrollTrigger animation patterns for Next.js. Each pattern
  includes working code, design-dna motion token consumption, Lenis integration,
  cleanup handling, and semantic CSS. Pattern names are ROLE-based not TECHNIQUE-based.
trigger_terms: gsap, scrolltrigger, scroll animation, pin, parallax, reveal, stagger, split text, horizontal scroll
---

# GSAP Animation Patterns

All patterns consume design-dna motion tokens. Never hardcode values.

## Token Reference

```typescript
// Read from design-dna.json
interface MotionTokens {
  easing: {
    entrance: string;   // e.g., "power2.out"
    exit: string;       // e.g., "power2.in"
    emphasis: string;   // e.g., "elastic.out(1, 0.3)"
    smooth: string;     // e.g., "none"
  };
  duration: {
    fast: number;       // e.g., 0.3
    normal: number;     // e.g., 0.6
    slow: number;       // e.g., 1.0
    stagger: number;    // e.g., 0.12
  };
  scroll: {
    smoothing: boolean;
    lenisLerp: number;
    revealDistance: number;  // e.g., 40 (px)
    parallaxIntensity: number; // e.g., 0.3
    scrubSmoothing: number;    // e.g., 0.5
  };
}
```

## Pattern: section-entrance
**Role:** Reveal a content section as it enters the viewport.
**Tier:** 1 (CSS) or 2 (GSAP) depending on complexity.

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SectionEntrance({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: designDna.motion.scroll.revealDistance,
        opacity: 0,
        duration: designDna.motion.duration.normal,
        ease: designDna.motion.easing.entrance,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return <section ref={ref} className={`section-entrance ${className ?? ''}`}>{children}</section>;
}
```

```css
.section-entrance {
  will-change: transform, opacity;
}
```

## Pattern: content-reveal
**Role:** Stagger-reveal children elements within a container.
**Tier:** 2 (GSAP -- stagger requires timeline control).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.content-reveal-item', {
      y: designDna.motion.scroll.revealDistance,
      opacity: 0,
      duration: designDna.motion.duration.normal,
      ease: designDna.motion.easing.entrance,
      stagger: designDna.motion.duration.stagger,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

```css
.content-reveal-item {
  will-change: transform, opacity;
}
```

## Pattern: hero-pin-transform
**Role:** Pin a hero section and animate content through a sequence while scrolling.
**Tier:** 2 (GSAP -- pinning requires ScrollTrigger).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: designDna.motion.scroll.scrubSmoothing,
      },
    });

    tl.from('.hero-title', {
      y: 60, opacity: 0,
      duration: designDna.motion.duration.slow,
      ease: designDna.motion.easing.entrance,
    })
    .from('.hero-subtitle', {
      y: 40, opacity: 0,
      duration: designDna.motion.duration.normal,
      ease: designDna.motion.easing.entrance,
    }, '-=0.3')
    .from('.hero-cta', {
      scale: 0.9, opacity: 0,
      duration: designDna.motion.duration.fast,
      ease: designDna.motion.easing.emphasis,
    });
  }, heroRef);
  return () => ctx.revert();
}, []);
```

## Pattern: horizontal-scroll-section
**Role:** A section that scrolls horizontally while the user scrolls vertically.
**Tier:** 2 (GSAP -- containerAnimation).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const panels = gsap.utils.toArray<HTMLElement>('.horizontal-panel');
    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: designDna.motion.easing.smooth,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${sectionRef.current!.scrollWidth}`,
        pin: true,
        scrub: designDna.motion.scroll.scrubSmoothing,
        snap: 1 / (panels.length - 1),
        invalidateOnRefresh: true,
      },
    });
  }, sectionRef);
  return () => ctx.revert();
}, []);
```

```css
.horizontal-scroll-container {
  display: flex;
  flex-wrap: nowrap;
  width: fit-content;
}
.horizontal-panel {
  width: 100vw;
  flex-shrink: 0;
}
```

## Pattern: parallax-depth
**Role:** Multi-speed parallax layers creating depth perception.
**Tier:** 2 (GSAP -- multiple synchronized scroll-linked transforms).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const intensity = designDna.motion.scroll.parallaxIntensity;
    gsap.to('.parallax-bg', {
      y: () => window.innerHeight * intensity,
      ease: designDna.motion.easing.smooth,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
    gsap.to('.parallax-mid', {
      y: () => window.innerHeight * intensity * 0.5,
      ease: designDna.motion.easing.smooth,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, sectionRef);
  return () => ctx.revert();
}, []);
```

## Pattern: split-text-reveal
**Role:** Reveal text character-by-character or word-by-word.
**Tier:** 2 (GSAP + SplitText plugin).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const split = new SplitText('.split-text-target', { type: 'chars,words' });
    gsap.from(split.chars, {
      opacity: 0,
      y: 20,
      duration: designDna.motion.duration.fast,
      ease: designDna.motion.easing.entrance,
      stagger: 0.02,
      scrollTrigger: {
        trigger: '.split-text-target',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

**Note:** SplitText is a GSAP Club plugin. If not available, implement manual word splitting via `<span>` wrappers.

## Pattern: scramble-text
**Role:** Text scramble effect for dynamic headings.
**Tier:** 2 (GSAP TextPlugin).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.scramble-target', {
      duration: designDna.motion.duration.slow,
      scrambleText: {
        text: 'Final Text Here',
        chars: 'upperCase',
        revealDelay: 0.5,
        speed: 0.3,
      },
      scrollTrigger: {
        trigger: '.scramble-target',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

## Pattern: page-crossfade
**Role:** Smooth page transition between routes.
**Tier:** 2 (GSAP + Next.js route handling).

```tsx
// Wrap in a transition component
'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: designDna.motion.duration.fast,
          ease: designDna.motion.easing.entrance,
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [pathname]);

  return <div ref={ref} className="page-transition-wrapper">{children}</div>;
}
```

## Pattern: sticky-header-morph
**Role:** Header that transforms (shrinks, changes bg) on scroll.
**Tier:** 2 (GSAP ScrollTrigger).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 80) {
          gsap.to(headerRef.current, {
            height: 56,
            backgroundColor: 'var(--color-surface-elevated)',
            duration: designDna.motion.duration.fast,
            ease: designDna.motion.easing.entrance,
          });
        } else if (self.scroll() <= 80) {
          gsap.to(headerRef.current, {
            height: 80,
            backgroundColor: 'transparent',
            duration: designDna.motion.duration.fast,
            ease: designDna.motion.easing.entrance,
          });
        }
      },
    });
  }, headerRef);
  return () => ctx.revert();
}, []);
```

## Pattern: background-parallax
**Role:** Background image moves at slower rate than content.
**Tier:** 2 (GSAP -- scroll-linked transform on background element).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.bg-parallax-image', {
      yPercent: -20 * designDna.motion.scroll.parallaxIntensity,
      ease: designDna.motion.easing.smooth,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, sectionRef);
  return () => ctx.revert();
}, []);
```

```css
.bg-parallax-wrapper {
  overflow: hidden;
  position: relative;
}
.bg-parallax-image {
  position: absolute;
  inset: -20% 0;
  width: 100%;
  height: 140%;
  object-fit: cover;
}
```

## Pattern: scale-reveal
**Role:** Element scales up from slightly smaller size as it enters viewport.
**Tier:** 1 (CSS) or 2 (GSAP).

```tsx
// CSS-first (Tier 1) approach:
// Use CSS scroll-driven animation if no choreography needed
// GSAP approach (Tier 2) for coordinated reveals:
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.scale-reveal', {
      scale: 0.9,
      opacity: 0,
      duration: designDna.motion.duration.normal,
      ease: designDna.motion.easing.entrance,
      scrollTrigger: {
        trigger: '.scale-reveal',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

## Pattern: slide-reveal
**Role:** Content slides in from left or right edge.
**Tier:** 2 (GSAP).

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from('.slide-from-left', {
      x: -100,
      opacity: 0,
      duration: designDna.motion.duration.normal,
      ease: designDna.motion.easing.entrance,
      scrollTrigger: {
        trigger: '.slide-from-left',
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

## Cleanup Rules (ALL Patterns)

Every pattern MUST:
1. Use `gsap.context()` scoped to a ref
2. Return `ctx.revert()` in useEffect cleanup
3. Never create ScrollTrigger instances outside of gsap.context

```tsx
// MANDATORY cleanup pattern
useEffect(() => {
  const ctx = gsap.context(() => {
    // All GSAP code here
  }, containerRef); // Scope to ref
  return () => ctx.revert(); // Cleanup
}, []);
```

## Responsive Handling (ALL Patterns)

Wrap viewport-dependent animations in matchMedia:

```tsx
useEffect(() => {
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      // Desktop animations
    });
    mm.add('(max-width: 767px)', () => {
      // Simplified mobile animations or no-ops
    });
  }, containerRef);
  return () => ctx.revert();
}, []);
```
