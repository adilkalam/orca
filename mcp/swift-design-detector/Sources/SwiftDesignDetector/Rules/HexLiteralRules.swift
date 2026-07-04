import Foundation
import SwiftSyntax

/// Identifies a hex color literal supplied to a color initializer such as
/// `Color(hex: "#f97316")`. Returns the hex string and the call node so the
/// rules can report at the call site.
enum HexLiteralProbe {
    /// Color/UIColor initializer names whose string arg is treated as a hex.
    static let colorInitNames: Set<String> = ["Color", "UIColor", "NSColor"]

    struct Hit {
        let hex: String
        let call: FunctionCallExprSyntax
    }

    /// If `node` is a `Color(hex: "...")`-style call, extract every hex string.
    static func hits(in node: Syntax) -> [Hit] {
        guard let call = node.as(FunctionCallExprSyntax.self) else { return [] }
        guard let name = ASTHelpers.calleeName(call), colorInitNames.contains(name) else {
            return []
        }
        // Only treat the `hex:` labeled argument (or a sole positional string)
        // as a hex literal. `Color(red:green:blue:)` channel forms are skipped.
        var found: [Hit] = []
        for argument in call.arguments {
            let label = ASTHelpers.argumentLabel(argument)
            if label == "hex" || label == nil {
                if let value = ASTHelpers.directStringLiteral(argument.expression),
                   ColorMath.parseHex(value) != nil {
                    found.append(Hit(hex: value, call: call))
                }
            }
        }
        return found
    }
}

/// P0 off-palette-hue: a chromatic hex whose hue is not in the allowed blue
/// band and is not near-neutral. STILL FIRES in token dirs.
struct OffPaletteHueRule: DesignRule {
    let id = "off-palette-hue"
    private let allowedRanges: [(Int, Int)]
    private let neutralChromaMax: Int

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "color-hex-hue" else { return nil }
        let ranges = spec.detector["allowed_hue_ranges_deg"]
        var parsed: [(Int, Int)] = []
        if case let .array(items)? = ranges {
            for item in items {
                if case let .array(pair) = item, pair.count == 2,
                   let low = pair[0].intValue, let high = pair[1].intValue {
                    parsed.append((low, high))
                }
            }
        }
        self.allowedRanges = parsed.isEmpty ? [(205, 265)] : parsed
        self.neutralChromaMax = spec.detector["neutral_chroma_max"]?.intValue ?? 30
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        for hit in HexLiteralProbe.hits(in: node) {
            guard let rgb = ColorMath.parseHex(hit.hex) else { continue }
            // Near-neutral hexes are always clean (greys, near-black, near-white).
            if ColorMath.chroma(rgb) < neutralChromaMax { continue }
            let hue = ColorMath.hueDegrees(rgb)
            let inAllowedBand = allowedRanges.contains { hue >= $0.0 && hue <= $0.1 }
            if inAllowedBand { continue }
            collector.append(context.finding(node: hit.call))
        }
    }
}

/// P0 raw-hex-outside-tokens: any raw hex literal in a color initializer.
/// SUPPRESSED in token dirs (the engine handles scope; this rule just fires
/// whenever it is invoked).
struct RawHexOutsideTokensRule: DesignRule {
    let id = "raw-hex-outside-tokens"

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "raw-hex-literal" else { return nil }
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        for hit in HexLiteralProbe.hits(in: node) {
            collector.append(context.finding(node: hit.call))
        }
    }
}

/// P0 tailwind-palette-hex: a hex copied verbatim from the Tailwind default
/// palette. Case-insensitive match on the 6 hex digits. STILL FIRES in token dirs.
struct TailwindPaletteHexRule: DesignRule {
    let id = "tailwind-palette-hex"
    private let tailwindHexes: Set<String>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "tailwind-hex" else { return nil }
        let hexes = spec.detector["hexes"]?.stringArray ?? []
        self.tailwindHexes = Set(hexes.map { Self.normalize($0) })
        if tailwindHexes.isEmpty { return nil }
    }

    private static func normalize(_ raw: String) -> String {
        var hex = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if hex.hasPrefix("#") { hex.removeFirst() }
        return hex.lowercased()
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        for hit in HexLiteralProbe.hits(in: node) {
            let normalized = Self.normalize(hit.hex)
            if tailwindHexes.contains(normalized) {
                collector.append(context.finding(node: hit.call))
            }
        }
    }
}
