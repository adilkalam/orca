# Banned: Monospace fatigue (iOS/SwiftUI) — mono is a micro-label whitelist, not a "technical" wash

> **Provenance.** Cross-platform refusal. Same enemy as the web
> `design-contract/banned/typography-mono.md` (monospace-as-"technical"-shorthand), authored here
> for SwiftUI's `Font.accentMono(...)` / `.monospaced()` / `.monospacedDigit()`. Source of truth
> for the iOS scope: `peptidefox-ios/.claude/CLAUDE.md §6.2` ("Mono is a narrow whitelist … never
> the labeling workhorse, never for calculator/numeric output") and the `BrownMonoLL` /
> `TypographyToken.Label.micro` scoping in `TypographyTokens.swift`.

## Detector rule this ban backs

| Rule id | Severity | What fires |
|---|---|---|
| `mono-fatigue` | **P1 (advisory)** | `Font.accentMono(...)` / `.monospaced()` / `.monospacedDigit()` / a `BrownMonoLL`-based font in a non-token file, beyond its sanctioned micro-label use. Suppressed inside token dirs — the mono factory + sanctioned mono tokens are declared there. |

## The refusal

Reaching for the mono/accent family (Brown Mono LL) to signal "this is technical" is the slop.
Mono-on-everything reads as a developer-console affectation, not as craft. It is the typographic
equivalent of annotating the art: the surface announcing "this part is technical" instead of
just being legible.

Mono's **sanctioned uses are narrow**: micro nav badges, uppercase micro labels, units, tags,
and code-technical identifiers — the `TypographyToken.Label.micro` (11pt) / `accentMono` scope.

It is **never** the labeling workhorse and — critically on this app — **never for
calculator/numeric output.** That is a common trap: "numbers are data, data is technical, so set
them in mono." Wrong. Dosing and calculator figures use the **lining tabular numerals of the
brand body face** so figures align in columns (see `preferences/dynamic-type-discipline.md` and
the `Data` tokens). The Calculator and ProtocolTracker are core surfaces; mono there is fatigue,
not precision.

## SwiftUI shape of the slop — wrong / right

**Wrong** — mono on body and on numeric output:

```swift
Text(explanation)
    .font(.accentMono(14, relativeTo: .body))    // mono-fatigue: mono as body workhorse
Text(result.milligrams)
    .font(.system(.title, design: .monospaced))  // mono-fatigue: mono on calculator output
```

**Right** — body in the brand face; numbers in tabular lining figures; mono reserved for micro:

```swift
Text(explanation)
    .font(TypographyToken.Body.large)            // Brown LL Regular body
Text(result.milligrams)
    .font(TypographyToken.Data.resultLarge)      // brand face + tabular numerals for column alignment
    .monospacedDigit()                           // tabular spacing on the BRAND face — not the mono family
Text("MG / WEEK")
    .font(TypographyToken.Label.micro)           // THIS is mono's sanctioned home: a micro nav/unit label
```

> Note: `.monospacedDigit()` applied to the *brand* face to get tabular column alignment is the
> right move for figures and is distinct from setting type in the mono *family*. The ban
> refuses the mono family as a body/data face; tabular digits on the brand face are encouraged.

## When the refusal is overridden

Advisory only — it never blocks. A genuine code-technical identifier (an API token, a
sequence string) is a sanctioned mono use. Body copy and calculator results are not.
