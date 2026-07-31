---
name: harden
description: Make interfaces production-ready: error handling, empty states, onboarding flows, i18n, text overflow, and edge case management. Use when the user asks to harden, make production-ready, handle edge cases, add error states, design empty states, improve onboarding, or fix overflow and i18n issues.
---

Strengthen interfaces against edge cases, errors, internationalization issues, and real-world usage scenarios that break idealized designs.

## Felt-state framing for edge states

Empty states, error states, loading states designed for a user having a bad day, not for the happy-path ideal user. See the `interfaces-that-feel` skill's "heartbreak as design brief" section.

---

## Assess Hardening Needs

Identify weaknesses and edge cases:

1. **Test with extreme inputs**: very long text, very short/empty text, special characters (emoji, RTL, accents), large numbers, many items (1000+), no data.
2. **Test error scenarios**: network failures, API errors (400/401/403/404/500), validation errors, permission errors, rate limiting, concurrent operations.
3. **Test internationalization**: long translations (German ~30% longer), RTL languages, CJK character sets, date/time/number/currency formats.

**CRITICAL**: Designs that only work with perfect data aren't production-ready. Harden against reality.

## Hardening Dimensions

### Text Overflow & Wrapping
```css
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-clamp { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.wrap { word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; }
.flex-item { min-width: 0; overflow: hidden; } /* prevents flex overflow */
```
Use `clamp()` for fluid typography, set minimum readable sizes (14px on mobile), test text scaling to 200%.

### Internationalization (i18n)
- Add 30-40% space budget for translations; avoid fixed widths on text containers.
- RTL: use logical properties (`margin-inline-start`, `padding-inline`, `border-inline-end`) or `[dir="rtl"]` overrides.
- UTF-8 everywhere; test CJK and emoji.
- Use `Intl.DateTimeFormat` / `Intl.NumberFormat`, never hand-rolled pluralization.

### Error Handling
- Network errors: clear message, retry button, explain what happened, handle timeouts.
- Form validation: inline, specific, suggest corrections, preserve user input on error.
- API errors: handle each status code (400 validation, 401 redirect, 403 permission, 404 not-found, 429 rate-limit, 500 generic+support).
- Graceful degradation: core functionality without JS, alt text, progressive enhancement.

### Edge Cases & Boundary Conditions
- Empty states (no items, no results, no notifications) with a clear next action.
- Loading states (initial, pagination, refresh) that say what's loading.
- Large datasets: pagination/virtual scrolling, don't load 10,000 items at once.
- Concurrent operations: disable-on-submit, optimistic updates with rollback.
- Permission states: read-only mode, clear explanation.
- Browser compatibility: feature detection, not browser detection.

### Onboarding & First-Run Experience
Every zero-data screen needs: what will appear here, why it matters, a clear CTA, visual interest. Types: first use, user cleared, no results, no permissions.
Get users to their "aha moment" fast: show don't tell, progressive disclosure, optional/skippable onboarding, smart defaults.
Teach features contextually, not upfront; celebrate activation quietly (a toast, not a modal).

**NEVER**:
- Force long onboarding before users can touch the product
- Show the same tooltip repeatedly
- Block the entire UI during a guided tour
- Design empty states that just say "No items" with no next action

### Input Validation & Sanitization
Client-side validation for UX (required fields, format, length, patterns); server-side validation always (never trust client-only), rate limiting.

### Accessibility Resilience
Keyboard navigation for everything, logical tab order, focus management in modals, screen reader ARIA + live regions, `prefers-reduced-motion` support, high-contrast mode testing.

### Performance Resilience
Progressive image loading, skeleton screens, offline support; clean up event listeners/subscriptions/timers/pending requests; debounce/throttle expensive handlers.

## Testing Strategies

Manual: extreme data, different languages, offline, throttled 3G, screen reader, keyboard-only, old browsers.
Automated: unit tests for edge cases, integration tests for error scenarios, E2E for critical paths, visual regression, accessibility tests (axe, WAVE).

**NEVER**:
- Assume perfect input
- Ignore internationalization
- Leave error messages generic ("Error occurred")
- Forget offline scenarios
- Trust client-side validation alone
- Use fixed widths for text or assume English-length text
- Block entire interface when one component errors

## Verify Hardening

Test with 100+ character names, emoji in every text field, Arabic/Hebrew (RTL), CJK, disabled/throttled network, 1000+ item datasets, rapid repeated submits, forced API errors, and fully empty data.

Remember: You're hardening for production reality, not demo perfection. Expect users to input weird data, lose connection mid-flow, and use your product in unexpected ways. Build resilience into every component.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
