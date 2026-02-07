---
name: web-interface-guidelines
description: >
  Web UI quality rules: interactions, forms, loading, animations, layout,
  content, performance, accessibility, design. Apply to all web UI work.
  Adapted from Vercel Design Guidelines.
---

# Web Interface Guidelines

## 1. Interactions
- All flows keyboard-operable (WAI-ARIA); visible focus via `:focus-visible`
- Tap targets >= 24px (44px mobile); `touch-action: manipulation`
- Links = `<a>`, actions = `<button>`. Never `<div>` for either
- `aria-live` for async updates

## 2. Forms
- Enter submits single-input forms; Cmd+Enter for textareas
- Every control has `<label>`; clicking label focuses control
- Allow all input then validate -- never block keystrokes
- Don't pre-disable submit; show errors on attempt
- Errors adjacent to field; focus first error on submit
- Set `autocomplete`, correct `type`/`inputmode`, meaningful `name`
- `spellcheck="false"` for emails/codes/usernames
- Placeholders show format examples, not labels
- Support password managers and 2FA autofill
- Warn before navigation if unsaved data

## 3. Loading and Feedback
- Loading indicator preserves original label text
- Show-delay 150-300ms + min-visible 300-500ms to prevent flicker
- Undo or error messaging on failed optimistic updates
- Menu items opening follow-up end with ellipsis

## 4. Animations
- Respect `prefers-reduced-motion`
- CSS transitions over JS; animate only for cause/effect or delight
- Never `transition: all` -- list specific properties
- Interruptible by user input
- GPU properties (`transform`, `opacity`); avoid reflow (`width`, `height`, `top`, `left`)
- SVG: transforms on `<g>` wrappers with `transform-box: fill-box`

## 5. Layout
- Optical alignment +-1px when perception beats geometry
- Every element aligned to grid/baseline/edge/center
- Verify on 375px, 1440px, 1920px+
- Safe areas via `env(safe-area-inset-*)`
- Avoid excess scrollbars; use flexbox/grid

## 6. Content
- Inline explanations over tooltips
- Skeletons mirror final layout exactly
- `<title>` reflects current context
- Design all states: empty, sparse, dense, error, loading
- Recovery paths on every error screen
- Curly quotes, ellipsis character (not three periods)
- `font-variant-numeric: tabular-nums` for number columns
- `scroll-margin-top` for anchored headings
- Non-breaking spaces for units ("10&nbsp;MB")

## 7. Performance
- Virtualize large lists (`content-visibility: auto`)
- Preload above-fold images; lazy-load rest
- Explicit `width`/`height` on images (CLS)
- `<link rel="preconnect">` to CDN origins
- Preload critical fonts with `unicode-range` subsetting
- Web Workers for expensive computation
- POST/PATCH/DELETE under 500ms

## 8. Accessibility
- Accurate `aria-label` matching visible text
- `aria-hidden="true"` on decorative elements
- Icon-only buttons need descriptive labels
- Native HTML semantics over ARIA roles
- Hierarchical h1-h6; skip-to-content links
- Never rely on color alone; add text/icons
- Format dates/times/numbers per locale
- Language from `Accept-Language`, not IP/GPS

## 9. Design
- Layered shadows (ambient + direct, 2+ layers)
- Solid + semi-transparent borders for edge clarity
- Child border-radius <= parent minus padding
- Tint borders/shadows/text toward consistent hue on colored backgrounds
- APCA over WCAG 2 for contrast; increase contrast on interactive states
- `<meta name="theme-color">` matching page background
- `color-scheme: dark` on `<html>` in dark themes
