---
name: ui-page-standards
description: >
  New page checklist: metadata, loading/error states, component states, form
  completeness, mobile-first, SEO, API routes. Use when creating or auditing
  Next.js pages.
---

# UI Page Standards

Use when creating a new `page.tsx`, route segment, or auditing existing pages.

## Page Metadata (MANDATORY for New Pages)

### Required Exports

- Every new `page.tsx` MUST export `metadata` (static) or `generateMetadata` (dynamic)
- NEVER ship a page with default/empty Next.js metadata

### Required Fields

| Field | Requirement |
|-------|------------|
| `title` | Unique, descriptive. Format: "Page Title \| Site Name" or per project template |
| `description` | 150-160 characters, compelling, includes primary keyword |
| `openGraph.title` | Match or extend the page title |
| `openGraph.description` | Match or extend the page description |
| `openGraph.images` | At least one image, 1200x630px (standard) or 1200x1200px (square) |
| `openGraph.type` | `'website'`, `'article'`, or appropriate type |
| `twitter.card` | `'summary_large_image'` |
| `twitter.title` | Match the page title |
| `twitter.description` | Match the page description |
| `twitter.images` | Match the link preview image |

### Link Preview Image

Every page needs a preview image for social sharing (Slack, Twitter, iMessage, LinkedIn).

- Check if the project already has a default preview image (`/app/opengraph-image.png` or similar)
- If a project default exists, reference it
- If a route-specific image makes sense, add `opengraph-image.png` (static) or `opengraph-image.tsx` (dynamic) in the route segment
- **If no image exists and you don't know what to use: ASK THE USER.** Do not skip it, do not use a placeholder.
- Standard dimensions: 1200x630px

### Static vs Dynamic

- Static page with known content: use `metadata` export object
- Dynamic route with params (e.g., `[slug]`): use `generateMetadata({ params })` function

## New Page Checklist

When creating a new page, the builder MUST also create or verify:

| File | Purpose | When to skip |
|------|---------|-------------|
| `loading.tsx` | Loading skeleton matching the page layout | Static pages with no data fetching |
| `error.tsx` | User-friendly error boundary with retry action | Never -- every page needs error handling |
| Navigation link | Page must be reachable from existing UI | Only if page is accessed via direct URL (e.g., callback pages) |
| Metadata | Title, description, openGraph, twitter, preview image | Never |

Rules:
- `loading.tsx` skeleton MUST mirror the page's layout structure (not a generic spinner)
- `error.tsx` MUST show a user-friendly message with a "Try Again" button that calls `reset()`
- Navigation: check if the page should appear in the site's primary nav, sidebar, or footer. **If unsure, ASK THE USER.**
- For nested routes: check if breadcrumbs are appropriate

## Component States

Every data-driven component MUST handle three states:

| State | What to show | Anti-pattern |
|-------|-------------|-------------|
| **Loading** | Skeleton matching final layout, OR spinner with context | Blank screen, no indicator |
| **Empty** | Friendly message explaining no data + action (e.g., "No posts yet. Create your first post.") | Blank screen, empty table with just headers |
| **Error** | User-friendly message + retry action. NEVER show raw error messages or stack traces to users. | White screen, console.error only, generic "Something went wrong" with no action |

Rules:
- Loading skeletons must match the final layout shape (same heights, widths, spacing)
- Empty states must have an action when possible (create, import, change filters)
- Error states must offer retry. For persistent errors, offer an alternative path.
- Use Suspense boundaries at appropriate levels (page-level for main content, component-level for independent sections)
- **If using React Server Components**: errors in server components bubble to nearest `error.tsx`. The builder must ensure one exists.

## Form Completeness

Every form MUST have:

| Requirement | Implementation | Anti-pattern |
|------------|----------------|-------------|
| **Client-side validation** | Required fields marked, format validation (email, phone, URL), min/max length. Use Zod, react-hook-form, or HTML5 validation per project conventions. | No validation, console.log errors |
| **Visible error messages** | Error text shown next to the field that has the error. Use `aria-describedby` for accessibility. | Errors only in console, alert() boxes, errors at top with no field association |
| **Submit loading state** | Button shows loading indicator during submission. Button text preserved (not replaced with spinner only). | No feedback during submission |
| **Double-submit prevention** | Disable submit button while request is in-flight. | User clicks 3 times, 3 records created |
| **Success feedback** | Toast notification, inline success message, or redirect. User must KNOW it worked. | Form submits, nothing visible changes |
| **Unsaved changes warning** | For important forms (multi-step, long forms): warn before navigation. Not needed for simple search/filter forms. | User fills 10 fields, accidentally navigates away |

Rules:
- Validation messages must be specific ("Email must include @") not generic ("Invalid input")
- Server-side validation is ALSO required for security -- client-side is for UX only
- For server actions: use `useFormStatus()` for pending state, `useFormState()` for error handling
- For API routes: validate input with Zod or similar, return structured errors
- **If you don't know what validation rules to apply: ASK THE USER.**

## Mobile-First

Every UI change must work on mobile:

| Rule | Specifics |
|------|-----------|
| **Touch targets** | Minimum 44x44px for interactive elements (buttons, links, inputs) |
| **No horizontal overflow** | Test at 320px width minimum. No content should require horizontal scrolling. |
| **Readable text** | Minimum 16px for body text on mobile. No text below 14px. |
| **Navigation** | Must be usable on mobile (hamburger menu, bottom nav, or collapsible sidebar) |
| **Forms on mobile** | Inputs must be full-width or near full-width. Use appropriate input types (`type="email"`, `type="tel"`) for mobile keyboards. |
| **Images** | Must scale properly. Use `sizes` prop for responsive images. |
| **Spacing** | Reduce section spacing on mobile (see typography-spacing skill mobile column). |

Rules:
- The builder's Design Intent MUST include a "Mobile Approach" section stating how the layout adapts
- If a design looks good on desktop but would clearly break on mobile, the builder must address it proactively

## Structured Data and SEO

When creating pages that represent entities (articles, products, FAQs, events, organizations):

| Page Type | JSON-LD Schema | When to add |
|-----------|---------------|-------------|
| Article/Blog post | `Article` or `BlogPosting` | Always for content pages |
| Product | `Product` with offers | Always for e-commerce |
| FAQ | `FAQPage` with questions | When page has Q&A format |
| Organization/About | `Organization` | Homepage or about page |
| Event | `Event` | Event listing pages |
| Breadcrumb | `BreadcrumbList` | Nested pages with breadcrumb UI |

Rules:
- JSON-LD goes in a `<script type="application/ld+json">` tag
- In Next.js App Router: use the `metadata` export or `generateMetadata` to include JSON-LD
- Canonical URLs: every page should have a canonical URL. Use `metadata.alternates.canonical`
- **If you don't know the schema type for a page: ASK THE USER.**
- This is NOT required for utility pages (settings, login, admin dashboards, etc.)

## API Route Patterns

When creating or modifying Next.js API routes (`route.ts` files):

| Requirement | Implementation |
|------------|----------------|
| **Input validation** | Validate request body/params with Zod or similar. Return 400 with specific error messages. |
| **Consistent error format** | All errors return: `{ error: string, details?: object }`. Never return raw error objects or stack traces. |
| **Proper HTTP status codes** | 200 success, 201 created, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 internal error. |
| **Error handling** | Wrap handler in try/catch. Log server errors (don't swallow). Return user-safe error messages. |
| **Type safety** | Request and response types defined. Use Zod `.parse()` or `.safeParse()` for runtime validation. |

Rules:
- Never expose internal error messages to clients (security risk)
- For authenticated routes: check auth FIRST, before any other logic
- For mutations: consider idempotency (especially for payment-related routes)

## Site Infrastructure

Check that these exist when working on a new Next.js project:

| File | Purpose | Required? |
|------|---------|-----------|
| `app/sitemap.ts` or `app/sitemap.xml` | Search engine discovery | Yes for public sites |
| `app/robots.ts` or `public/robots.txt` | Crawler instructions | Yes for public sites |
| `app/favicon.ico` or `app/icon.tsx` | Browser tab icon | Yes always |
| `app/apple-icon.png` | iOS home screen icon | Recommended |
| `app/manifest.ts` or `public/manifest.json` | PWA manifest | Only if PWA |
| `app/opengraph-image.tsx` or default preview image | Default link preview | Yes |

Rules:
- Don't create these automatically -- ASK if the project needs them
- For existing projects: check what exists and only flag what's missing
- This is a ONE-TIME check, not a per-page check

### Dark Mode / Theme Considerations

When implementing or touching theme/color-related code:

| Issue | Prevention |
|-------|-----------|
| Flash of wrong theme (FOUC) | Use `<script>` in `<head>` to set theme class BEFORE React hydrates. Or use `next-themes`. |
| Images that need dark variants | Use `<picture>` with `prefers-color-scheme` media query, or CSS `filter: invert()` for simple icons |
| Hardcoded colors | All colors must come from design tokens / CSS custom properties that change with theme |
| Third-party embeds | Some embeds don't respect dark mode. Note as known limitation. |

Rules:
- Only applies when the project HAS dark mode or the task is adding dark mode
- If adding dark mode: use `next-themes` or a similar battle-tested solution
- Test both themes before declaring done
