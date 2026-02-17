---
name: ui-implementation-rules
description: >
  Concrete, measurable implementation rules for images, typography, and spacing.
  Provides specific values and patterns. Distinct from frontend-aesthetics
  (which provides design methodology). All concrete defaults yield to project
  design-dna when present.
license: internal
allowed-tools:
  - Read
metadata:
  category: "frontend-implementation"
  source: "nextjs-visual-quality-fix requirement"
---

# UI Implementation Rules

You are loading the **UI Implementation Rules** skill. This skill provides
**concrete, measurable implementation rules** for images, typography, and spacing.

**Boundary with frontend-aesthetics:**
- `frontend-aesthetics` = HOW to think about design (methodology, aesthetic direction)
- `ui-implementation-rules` = WHAT specific values and patterns to use (this skill)

**Design-DNA override:** When a project has `design-dna.json` or equivalent design
tokens, those values override ALL defaults in Sections 2 and 3 below. Section 1
(Image Rendering) always applies regardless of design-dna.

---

## 1. Image Rendering Rules (MANDATORY -- Always Applies)

These rules apply to every image element regardless of project design-dna.

### 1.1 Dimensions

- Every `<Image>` or `<img>` MUST have explicit `width` and `height` props, OR use the `fill` prop
- Never render an image without dimension constraints -- this causes layout shift
- Use Next.js `<Image>` component with `fill` for responsive containers, or explicit dimensions
- Use the `sizes` prop to specify different image widths for different viewport widths

### 1.2 Object-Fit Rules

| Image Type | object-fit | When to Use |
|------------|-----------|-------------|
| Hero banners, card thumbnails, backgrounds | `cover` | Image should fill container, cropping is acceptable |
| Logos, icons, product images on white | `contain` | Full image must be visible, letterboxing acceptable |
| Avatars, profile photos | `cover` | Face-centered crop fills circular/square container |

- Never stretch images -- always use `object-fit` with `object-position` for aspect ratio mismatches
- For `cover` images, set `object-position` to control which part of the image is visible (e.g., `object-position: center top` for portraits)

### 1.3 Optimization

- Prefer WebP/AVIF via Next.js Image automatic optimization
- Set `priority` on above-the-fold hero images (LCP optimization)
- Use `loading="lazy"` (default in Next.js Image) for below-the-fold images

### 1.4 Alt Text

- Every image MUST have descriptive `alt` text
- Never use generic alt text like "image", "photo", "picture", or ""
- Decorative-only images use `alt=""` with `role="presentation"` -- but this should be rare
- Alt text should describe what the image shows, not what it is (e.g., "Team collaborating around a whiteboard" not "team photo")

---

## 2. Typography Hierarchy (Fallback -- design-dna overrides)

**When project design-dna exists, it overrides ALL defaults in this section.**

### 2.1 Size and Weight Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (page title) | 2.25-3rem | 700-800 | 1.1-1.2 | -0.02em |
| H2 (section) | 1.5-2rem | 600-700 | 1.2-1.3 | -0.01em |
| H3 (subsection) | 1.25-1.5rem | 600 | 1.3 | 0 |
| Body | 1rem (16px min) | 400 | 1.5-1.6 | 0 |
| Small/caption | 0.875rem | 400-500 | 1.4 | 0.01em |
| Label | 0.75-0.875rem | 500-600 | 1.3 | 0.05em |

### 2.2 Typography Rules

- **Max line length:** 65-75 characters for body text readability (`max-width: 65ch` to `75ch`)
- **Heading-to-body size ratio:** At least 1.5x between H1 and body text
- **Font weight limit:** Never use more than 3 font weights on a single page
- **Contrast between levels:** Ensure sufficient visual distinction between heading levels (size, weight, or both must differ noticeably)
- **Body text minimum:** Never smaller than 1rem (16px) for primary body content

---

## 3. Visual Rhythm / Spacing (Fallback -- design-dna overrides)

**When project design-dna exists, it overrides ALL defaults in this section.**

### 3.1 Spacing Scale

| Level | Desktop | Mobile | CSS Example |
|-------|---------|--------|-------------|
| Section-to-section | 64-96px | 48-64px | `py-16` to `py-24` / `gap-16` to `gap-24` |
| Component-to-component | 24-32px | 16-24px | `gap-6` to `gap-8` |
| Element-to-element | 8-16px | 8-16px | `gap-2` to `gap-4` |

### 3.2 The 2x Rule

Section gaps should be approximately 2x component gaps.
Component gaps should be approximately 2x element gaps.

This creates natural visual grouping: elements within a component feel connected,
components within a section feel related, sections feel distinct.

**Example:** If element gaps are 12px, component gaps should be ~24px, section gaps ~48-64px.

### 3.3 Consistency Rule

The same gap value MUST be used for the same element type across ALL sections of a page.
If card-to-card spacing is 24px in one section, it must be 24px in every section.

---

## 4. Page Metadata (MANDATORY for New Pages)

These rules apply whenever creating a new `page.tsx` or route segment.

### 4.1 Required Exports

- Every new `page.tsx` MUST export `metadata` (static) or `generateMetadata` (dynamic)
- NEVER ship a page with default/empty Next.js metadata

### 4.2 Required Fields

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

### 4.3 Link Preview Image

Every page needs a preview image -- this is what shows when someone shares the URL on Slack, Twitter, iMessage, LinkedIn, etc.

- Check if the project already has a default preview image (`/app/opengraph-image.png` or similar)
- If a project default exists, reference it
- If a route-specific image makes sense, add `opengraph-image.png` (static) or `opengraph-image.tsx` (dynamic) in the route segment
- **If no image exists and you don't know what to use: ASK THE USER.** Do not skip it, do not use a placeholder.
- Standard dimensions: 1200x630px

### 4.4 Static vs Dynamic

- Static page with known content: use `metadata` export object
- Dynamic route with params (e.g., `[slug]`): use `generateMetadata({ params })` function

---

## 5. Quick Reference Checklist

Before submitting any UI work, verify:

- [ ] Every image has explicit dimensions (width+height or fill)
- [ ] object-fit is set correctly per image type (cover vs contain)
- [ ] Every image has descriptive alt text
- [ ] Typography sizes follow the scale (or design-dna)
- [ ] Body text is at least 16px
- [ ] Line length is constrained to 65-75 characters
- [ ] No more than 3 font weights on a page
- [ ] Section spacing follows the 2x rule
- [ ] Same spacing for same element types across all sections
- [ ] New pages export metadata or generateMetadata
- [ ] Title is unique, description is 150-160 chars
- [ ] OpenGraph metadata present with image reference
- [ ] Twitter card metadata present
- [ ] New pages have loading.tsx and error.tsx
- [ ] New pages are linked from navigation (or intentionally direct-link only)
- [ ] Data components handle loading, empty, AND error states
- [ ] Forms have validation, submit loading state, and success feedback
- [ ] Mobile: no horizontal overflow at 320px width, 44px touch targets

---

## 6. New Page Checklist

**Trigger**: When creating any new `page.tsx` or route segment.

When creating a new page, the builder MUST also create or verify:

| File | Purpose | When to skip |
|------|---------|-------------|
| `loading.tsx` | Loading skeleton matching the page layout | Static pages with no data fetching |
| `error.tsx` | User-friendly error boundary with retry action | Never -- every page needs error handling |
| Navigation link | Page must be reachable from existing UI | Only if page is accessed via direct URL (e.g., callback pages) |
| Metadata | Title, description, openGraph, twitter, preview image | Never (already enforced in Section 4) |

Rules:
- `loading.tsx` skeleton MUST mirror the page's layout structure (not a generic spinner)
- `error.tsx` MUST show a user-friendly message with a "Try Again" button that calls `reset()`
- Navigation: check if the page should appear in the site's primary nav, sidebar, or footer. **If unsure, ASK THE USER.** Do not create orphan pages.
- For nested routes: check if breadcrumbs are appropriate

---

## 7. Component States

**Trigger**: When creating or modifying any component that fetches, receives, or displays dynamic data.

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

---

## 8. Form Completeness

**Trigger**: When creating or modifying any form (HTML `<form>`, or component that collects user input).

Every form MUST have:

| Requirement | Implementation | Anti-pattern |
|------------|----------------|-------------|
| **Client-side validation** | Required fields marked, format validation (email, phone, URL), min/max length. Use Zod, react-hook-form, or HTML5 validation per project conventions. | No validation, console.log errors |
| **Visible error messages** | Error text shown next to the field that has the error. Use `aria-describedby` for accessibility. | Errors only in console, alert() boxes, errors at top with no field association |
| **Submit loading state** | Button shows loading indicator during submission. Button text preserved (not replaced with spinner only). | No feedback during submission, user doesn't know if click registered |
| **Double-submit prevention** | Disable submit button while request is in-flight. OR use a request deduplication pattern. | User clicks 3 times, 3 records created |
| **Success feedback** | Toast notification, inline success message, or redirect. User must KNOW it worked. | Form submits, nothing visible changes. |
| **Unsaved changes warning** | For important forms (multi-step, long forms): warn before navigation. Not needed for simple search/filter forms. | User fills 10 fields, accidentally navigates away, loses everything |

Rules:
- Validation messages must be specific ("Email must include @") not generic ("Invalid input")
- Server-side validation is ALSO required for security -- client-side is for UX only
- For server actions: use `useFormStatus()` for pending state, `useFormState()` for error handling
- For API routes: validate input with Zod or similar, return structured errors
- **If you don't know what validation rules to apply: ASK THE USER.** Don't guess field requirements.

---

## 9. Mobile-First

**Trigger**: ALL UI work. This is not optional.

Every UI change must work on mobile:

| Rule | Specifics |
|------|-----------|
| **Touch targets** | Minimum 44x44px for interactive elements (buttons, links, inputs) |
| **No horizontal overflow** | Test at 320px width minimum. No content should require horizontal scrolling. |
| **Readable text** | Minimum 16px for body text on mobile. No text below 14px. |
| **Navigation** | Must be usable on mobile (hamburger menu, bottom nav, or collapsible sidebar) |
| **Forms on mobile** | Inputs must be full-width or near full-width. Use appropriate input types (`type="email"`, `type="tel"`) for mobile keyboards. |
| **Images** | Must scale properly. Use `sizes` prop for responsive images. |
| **Spacing** | Reduce section spacing on mobile (see Section 3 mobile column). |

Rules:
- The builder's Design Intent MUST include a "Mobile Approach" section stating how the layout adapts
- If a design looks good on desktop but would clearly break on mobile, the builder must address it proactively
- Responsive breakpoints should follow the project's existing pattern (or Tailwind/CSS defaults if no pattern exists)

---

## 10. Structured Data and SEO

**Trigger**: When creating pages that represent entities (articles, products, FAQs, events, organizations, people, recipes, etc.) or any page the user identifies as SEO-critical.

| Page Type | JSON-LD Schema | When to add |
|-----------|---------------|-------------|
| Article/Blog post | `Article` or `BlogPosting` | Always for content pages |
| Product | `Product` with offers | Always for e-commerce |
| FAQ | `FAQPage` with questions | When page has Q&A format |
| Organization/About | `Organization` | Homepage or about page |
| Event | `Event` | Event listing pages |
| Breadcrumb | `BreadcrumbList` | Nested pages with breadcrumb UI |

Rules:
- JSON-LD goes in a `<script type="application/ld+json">` tag, typically in the page's metadata or layout
- In Next.js App Router: use the `metadata` export or `generateMetadata` to include JSON-LD, or add a `<Script>` component
- Canonical URLs: every page should have a canonical URL. Use `metadata.alternates.canonical`
- **If you don't know the schema type for a page: ASK THE USER.** Don't add wrong structured data.
- This is NOT required for utility pages (settings, login, admin dashboards, etc.)

---

## 11. API Route Patterns

**Trigger**: When creating or modifying Next.js API routes (`route.ts` files in App Router).

| Requirement | Implementation |
|------------|----------------|
| **Input validation** | Validate request body/params with Zod or similar. Return 400 with specific error messages for invalid input. |
| **Consistent error format** | All errors return: `{ error: string, details?: object }`. Never return raw error objects or stack traces. |
| **Proper HTTP status codes** | 200 success, 201 created, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 500 internal error. Not everything is 200. |
| **Error handling** | Wrap handler in try/catch. Log server errors (don't swallow). Return user-safe error messages. |
| **Type safety** | Request and response types defined. Use Zod `.parse()` or `.safeParse()` for runtime validation. |

Rules:
- Never expose internal error messages to clients (security risk)
- For authenticated routes: check auth FIRST, before any other logic
- For mutations: consider idempotency (especially for payment-related routes)
- Rate limiting: note in comments if a route needs rate limiting (implementation depends on deployment platform)

---

## 12. Site Infrastructure

**Trigger**: When working on a new Next.js project for the first time, or when creating the initial pages.

Check that these exist. If any are missing, flag and offer to create:

| File | Purpose | Required? |
|------|---------|-----------|
| `app/sitemap.ts` or `app/sitemap.xml` | Search engine discovery | Yes for public sites |
| `app/robots.ts` or `public/robots.txt` | Crawler instructions | Yes for public sites |
| `app/favicon.ico` or `app/icon.tsx` | Browser tab icon | Yes always |
| `app/apple-icon.png` | iOS home screen icon | Recommended |
| `app/manifest.ts` or `public/manifest.json` | PWA manifest | Only if PWA |
| `app/opengraph-image.tsx` or default preview image | Default link preview for all pages | Yes |

Rules:
- Don't create these automatically -- ASK if the project needs them
- For existing projects: check what exists and only flag what's missing
- This is a ONE-TIME check, not a per-page check
- Flag as [Improvement] in standards gate, not [Critical]

### Dark Mode / Theme Considerations

**Trigger**: When implementing or touching theme/color-related code.

| Issue | Prevention |
|-------|-----------|
| Flash of wrong theme (FOUC) | Use `<script>` in `<head>` to set theme class BEFORE React hydrates. Or use `next-themes` which handles this. |
| Images that need dark variants | Use `<picture>` with `prefers-color-scheme` media query, or CSS `filter: invert()` for simple icons |
| Hardcoded colors | All colors must come from design tokens / CSS custom properties that change with theme |
| Third-party embeds | Some embeds (maps, videos, widgets) don't respect dark mode. Note as known limitation. |

Rules:
- This only applies when the project HAS dark mode or the task is adding dark mode
- If adding dark mode: use `next-themes` or a similar battle-tested solution, not a custom implementation
- Test both themes before declaring done
