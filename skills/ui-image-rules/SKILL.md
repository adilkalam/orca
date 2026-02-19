---
name: ui-image-rules
description: >
  Mandatory image rendering rules: dimensions, object-fit, optimization, alt text.
  Always applies regardless of design-dna.
---

# UI Image Rules

These rules apply to every image element regardless of project design-dna.

## Dimensions

- Every `<Image>` or `<img>` MUST have explicit `width` and `height` props, OR use the `fill` prop
- Never render an image without dimension constraints -- this causes layout shift
- Use Next.js `<Image>` component with `fill` for responsive containers, or explicit dimensions
- Use the `sizes` prop to specify different image widths for different viewport widths

## Object-Fit Rules

| Image Type | object-fit | When to Use |
|------------|-----------|-------------|
| Hero banners, card thumbnails, backgrounds | `cover` | Image should fill container, cropping is acceptable |
| Logos, icons, product images on white | `contain` | Full image must be visible, letterboxing acceptable |
| Avatars, profile photos | `cover` | Face-centered crop fills circular/square container |

- Never stretch images -- always use `object-fit` with `object-position` for aspect ratio mismatches
- For `cover` images, set `object-position` to control which part of the image is visible (e.g., `object-position: center top` for portraits)

## Optimization

- Prefer WebP/AVIF via Next.js Image automatic optimization
- Set `priority` on above-the-fold hero images (LCP optimization)
- Use `loading="lazy"` (default in Next.js Image) for below-the-fold images

## Alt Text

- Every image MUST have descriptive `alt` text
- Never use generic alt text like "image", "photo", "picture", or ""
- Decorative-only images use `alt=""` with `role="presentation"` -- but this should be rare
- Alt text should describe what the image shows, not what it is (e.g., "Team collaborating around a whiteboard" not "team photo")
