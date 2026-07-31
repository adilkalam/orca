// Named handlers for detector-rules.json rules with `requires_handler: true`.
// STUBS — wire into the engine (compile to .mjs or write as .mjs directly)
// when implementing each. See detector-rules.json _note for scope rationale.

export function detectChamferStack(_node: unknown, _ctx: unknown) {
  // TODO: inset-highlight + outer shadow + subtle gradient co-occurring on same element.
  // Implementable as CSS AST walk: parse box-shadow for inset + non-inset pair, check
  // for same-element gradient background or background-image.
  return null;
}

export function detectAsymmetricHeadingMargins(_node: unknown, _ctx: unknown) {
  // TODO: absence of per-heading asymmetric margins in prose-scope CSS.
  // Implementable as CSS AST walk: check prose selectors (article, .prose, etc.)
  // for h1/h2/h3/h4 rules with differentiated margin-top vs margin-bottom.
  return null;
}

export function detectTypographyJunctions(_node: unknown, _ctx: unknown) {
  // TODO: absence of `:first-child` / `:has()` / `:last-child` junction rules
  // in prose-scope CSS. See preferences/typography-spacing.md for the 14 named
  // junctions. Implementable as CSS AST walk.
  return null;
}

export const handlers = {
  detectChamferStack,
  detectAsymmetricHeadingMargins,
  detectTypographyJunctions,
};

// REMOVED FROM SCOPE (2026-04-22):
// - detectIOSCalculatorShape: too specific; generic-ui-defaults banned rule covers it.
// - detectPretendVariation: requires cross-candidate structural similarity, not
//   a per-file scan. Belongs in a separate generation-time tool.
// - detectPixelMisalignment: requires rendered layout measurements (DOM
//   bounding boxes). Belongs in Chrome DevTools MCP review path, not a static
//   CSS scanner.
