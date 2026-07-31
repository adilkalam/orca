---
name: lenis-integration
description: >
  Lenis smooth scroll setup with Next.js App Router, ScrollTrigger integration,
  React lifecycle management, and known issues.
trigger_terms: lenis, smooth scroll, smooth scrolling, scroll behavior
---

# Lenis Integration

## Setup with Next.js App Router

### Installation
```bash
npm install lenis
```

### Provider Component
Create a reusable Lenis provider for the App Router:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,       // from design-dna motion.scroll.lenisLerp
      smoothWheel: true,
      orientation: 'vertical',
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

### Layout Integration
Wrap the App Router layout:

```tsx
// app/layout.tsx
import { LenisProvider } from '@/components/lenis-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
```

## ScrollTrigger Integration

### GSAP Ticker Connection (Required)
Lenis replaces the browser's native scroll. ScrollTrigger must be told about Lenis scroll position:

```tsx
// This is the critical wiring -- without it, ScrollTrigger won't work with Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

### ScrollTrigger.scrollerProxy (Advanced)
For custom scroll containers (not document-level), use scrollerProxy:

```tsx
ScrollTrigger.scrollerProxy(container, {
  scrollTop(value) {
    if (arguments.length) {
      lenis.scrollTo(value, { immediate: true });
    }
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return {
      top: 0, left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
});
```

## React Lifecycle

### Cleanup Pattern
Always destroy Lenis on unmount:

```tsx
useEffect(() => {
  const lenis = new Lenis({ lerp: 0.1 });
  // ... setup ...
  return () => {
    lenis.destroy();
  };
}, []);
```

### Route Change Handling
Lenis persists across route changes in App Router (if in layout). Scroll position resets automatically on navigation. If you need to preserve scroll:

```tsx
// Scroll to top on route change (default behavior)
lenis.scrollTo(0, { immediate: true });
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `lerp` | 0.1 | Smoothness (0 = instant, 1 = no smoothing). Use `motion.scroll.lenisLerp` |
| `smoothWheel` | true | Enable smooth wheel scrolling |
| `orientation` | 'vertical' | Scroll direction |
| `gestureOrientation` | 'vertical' | Touch gesture direction |
| `wheelMultiplier` | 1 | Wheel scroll speed multiplier |
| `touchMultiplier` | 2 | Touch scroll speed multiplier |
| `infinite` | false | Infinite scrolling mode |

### Design-DNA Token Mapping
```json
{
  "motion": {
    "scroll": {
      "smoothing": true,
      "lenisLerp": 0.1
    }
  }
}
```

Map `smoothing: false` to skip Lenis initialization entirely.

## Known Issues and Workarounds

### 1. Anchor Links
Lenis intercepts scroll. Use `lenis.scrollTo('#target')` instead of native anchor behavior:

```tsx
const handleAnchorClick = (e: React.MouseEvent, target: string) => {
  e.preventDefault();
  lenis?.scrollTo(target);
};
```

### 2. Modal/Dialog Scrolling
Stop Lenis when modals are open to prevent background scrolling:

```tsx
// When opening modal
lenis.stop();

// When closing modal
lenis.start();
```

### 3. Fixed/Sticky Elements
Fixed elements work normally with Lenis. Sticky elements work but verify with ScrollTrigger pinning -- Lenis can sometimes interfere with pin calculations. Test thoroughly.

### 4. Performance on Low-End Devices
If frame rate drops below 30fps, consider:
- Increasing `lerp` to 0.15-0.2 (less interpolation work)
- Setting `smoothWheel: false` on mobile via matchMedia

### 5. Next.js Hydration
Lenis must be initialized client-side only. The `'use client'` directive on the provider handles this. Never import Lenis in server components.

---

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.
