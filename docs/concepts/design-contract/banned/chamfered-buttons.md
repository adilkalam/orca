# Banned: Chamfering, bad shadows, pre-Squarespace Microsoft-generated web

## Verbatim

> They use shadows and chamfering and other effects with incredibly poor execution, when they try too hard on a template, it looks like pre-squarespace Microsoft product generated web.

## What this ban is actually about

The "bevel + drop shadow + subtle gradient = 3D button" stack. The attempt to make a flat element look physical that ends up looking like a Windows XP taskbar button, a 2006 WordPress theme, an early Squarespace template, or a pre-2012 Microsoft property. The visual signifier of "someone who wanted to add polish but reached for the wrong decade's toolkit."

Three specific component-level failures compose into the "pre-Squarespace" feel:

1. **Inset highlight shadows** — `box-shadow: inset 0 1px 0 rgba(255,255,255,0.2)` or similar — the fake bevel pretending the element catches light from above.
2. **Outer soft drop shadow on every button** — uniform, blurred, offset down-right — the generic "this element is elevated" signal applied without thought about why.
3. **Subtle gradient within buttons** — `linear-gradient(to bottom, #lighter, #darker)` or similar — the fake 3D surface.

Any one of these alone might be OK in context. The three together is always wrong. And the three together IS what every AI design tool produces when asked for "modern polished buttons." It's the default stack.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| Inset highlight shadow | `box-shadow:.*inset.*rgba\(255,\s*255,\s*255` or `box-shadow:.*inset.*#fff` | P0 |
| Multiple box-shadows stacked on buttons (the 3D-button signature) | `button.*box-shadow:\s*[^;]*,\s*[^;]*,` (multiple shadows on button/link) | P0 |
| Linear gradient on small interactive elements | `button\|.btn\|a\.` with `background:.*linear-gradient` where gradient stops are within 20% lightness of each other (subtle top-to-bottom bevel gradient) | P0 |
| The full chamfer stack (composite) | All three above present on the same element | P0 (automatic reject) |

## Adjacent refusals in this territory

- **Glassmorphism as default**: `backdrop-filter: blur(…)` + translucent white/dark background + border + subtle inner glow. When used decoratively rather than for a genuine stacked-surface reason, refuse. Signal: `backdrop-filter:\s*blur` on elements that aren't over actual background content.
- **Neumorphism** (soft UI): dual box-shadows, one light one dark, on matched-background elements to create "pressed into surface" look. Signal: two box-shadows on same element where one offsets positive/one negative with matching blur. Refuse categorically.
- **Hover-lift on cards**: `transform: translateY(-2px)` + increased shadow on card hover. Generic. Refuse unless the card genuinely needs to register as interactive via elevation (rare).
- **Glow accents**: `box-shadow: 0 0 Xpx <accent-color>` — the "neon on dark" glow, commonly on buttons in dark-mode AI products. Refuse.

## What to reach for instead

Real surface treatments that come from the metaphor or the content. A card that needs to read as physical paper uses subtle texture and a hairline edge, not a soft drop shadow. A button that needs to read as pressable uses a clean contrast shift on active, not a 3D chamfer. The old shortcut (fake light, fake bevel, fake elevation) is refused because there's a better shortcut (honest contrast, real hierarchy, earned texture) available.
