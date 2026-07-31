---
name: lenis-integration
description: Lenis smooth scroll setup with Next.js App Router, ScrollTrigger integration, React lifecycle management, and known issues. Use when the user wants smooth scrolling or mentions Lenis.
---

# Lenis Integration

## Setup with Next.js App Router

### Installation
```bash
npm install lenis
```

### Provider Component
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
      lerp: 0.1,
      smoothWheel: true,
      orientation: 'vertical',
    });

    lenisRef.current = lenis;

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
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

### ScrollTrigger.scrollerProxy (Advanced)
For custom scroll containers (not document-level):

```tsx
ScrollTrigger.scrollerProxy(container, {
  scrollTop(value) {
    if (arguments.length) {
      lenis.scrollTo(value, { immediate: true });
    }
    return lenis.scroll;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
});
```

## React Lifecycle

### Cleanup Pattern
```tsx
useEffect(() => {
  const lenis = new Lenis({ lerp: 0.1 });
  return () => { lenis.destroy(); };
}, []);
```

### Route Change Handling
Lenis persists across route changes in App Router (if in layout). Scroll position resets automatically on navigation.

```tsx
lenis.scrollTo(0, { immediate: true });
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `lerp` | 0.1 | Smoothness (0 = instant, 1 = no smoothing) |
| `smoothWheel` | true | Enable smooth wheel scrolling |
| `orientation` | 'vertical' | Scroll direction |
| `gestureOrientation` | 'vertical' | Touch gesture direction |
| `wheelMultiplier` | 1 | Wheel scroll speed multiplier |
| `touchMultiplier` | 2 | Touch scroll speed multiplier |
| `infinite` | false | Infinite scrolling mode |

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
lenis.stop();  // opening modal
lenis.start(); // closing modal
```

### 3. Fixed/Sticky Elements
Fixed elements work normally. Sticky elements work but verify with ScrollTrigger pinning — Lenis can sometimes interfere with pin calculations. Test thoroughly.

### 4. Performance on Low-End Devices
If frame rate drops below 30fps: increase `lerp` to 0.15-0.2, or set `smoothWheel: false` on mobile via matchMedia.

### 5. Next.js Hydration
Lenis must be initialized client-side only. The `'use client'` directive on the provider handles this. Never import Lenis in server components.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
