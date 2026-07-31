# Banned: Fonts

## Verbatim

> The use of Geist = vercel → no thought in typography. Boring, plain, looks like every other SaaS.

## What this ban is actually about

Geist is not hated for being Geist. Geist is hated for being the **signal of defaulting** — "I used Vercel's font because I didn't think about typography." It's the SaaS monoculture of the 2024-2026 era. Using it means the design decision was skipped.

The broader pattern: reaching for the "designer-approved default" as a shortcut to looking designed, across a narrow band of fonts that every AI tool, every new SaaS, every dev-adjacent product has been using for ~3 years.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| Literal `Geist` in font stack | `font-family:\s*["']?Geist["']?` | P0 (immediate flag) |
| Geist imports | `@import.*(vercel\.com\|fonts\.vercel)` or `geist` in any `@import` URL | P0 |
| Geist via next/font | `next/font.*Geist` or `import.*Geist.*from.*'geist` | P0 |

## Adjacent reflex fonts to flag (inherited from Impeccable; confirmed Adil shares the enemy list)

Inter, Roboto, Arial, Open Sans, DM Sans, Plus Jakarta Sans, Outfit, Satoshi, Manrope, Space Grotesk, Space Mono, IBM Plex (Sans/Serif/Mono), Instrument Sans, Instrument Serif, Fraunces, Newsreader, Lora, Crimson, Crimson Pro, Playfair Display, Cormorant, Cormorant Garamond, Syne, DM Serif Display, DM Serif Text.

## When it's NOT a refusal

If the project's `aesthetic.md` explicitly specifies one of these fonts (e.g., a Vercel-owned product that legitimately uses Geist for brand reasons), the refusal is overridden by project context. The fence only applies when the font appears as a **default**, not a deliberate choice.
