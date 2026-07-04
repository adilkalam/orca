import Foundation
import SwiftSyntax

/// P0 hue-coded-category: a categorical concept is encoded by assigning each
/// category its own hue. STILL FIRES in token dirs because the per-category
/// color map (e.g. `CompoundColorScheme.forCompound` switching primary color by
/// case, plus `*Accent` token families) lives in the token file.
///
/// Two firing shapes:
///   (a) A type whose name ends in a configured category suffix (e.g.
///       `CompoundColorScheme`) is reported once at its declaration — the
///       struct exists solely to map categories to differing colors.
///   (b) A family of >= min_distinct tokens named `<category>Accent` whose
///       declarations carry chromatic, differing hex hues — reported once at the
///       first such declaration (the family is the rainbow).
struct HueCodedCategoryRule: DesignRule {
    let id = "hue-coded-category"

    private let categoryTypeSuffixes: [String]
    private let perCategoryTokenSuffix: String
    private let minDistinctCategoryTokens: Int

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "hue-coded-category" else { return nil }
        self.categoryTypeSuffixes = spec.detector["category_type_suffixes"]?.stringArray ?? ["ColorScheme"]
        self.perCategoryTokenSuffix = spec.detector["per_category_token_suffix"]?.stringValue ?? "Accent"
        self.minDistinctCategoryTokens = spec.detector["min_distinct_category_tokens"]?.intValue ?? 3
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        // Shape (a): a struct/enum/class whose name ends in a category suffix.
        if let structDecl = node.as(StructDeclSyntax.self) {
            reportTypeIfCategorical(name: structDecl.name.text, at: structDecl, context: context, collector: &collector)
        }
        if let enumDecl = node.as(EnumDeclSyntax.self) {
            reportTypeIfCategorical(name: enumDecl.name.text, at: enumDecl, context: context, collector: &collector)
        }
        if let classDecl = node.as(ClassDeclSyntax.self) {
            reportTypeIfCategorical(name: classDecl.name.text, at: classDecl, context: context, collector: &collector)
        }

        // Shape (b): the *Accent token family. We evaluate this once per source
        // file at the SourceFileSyntax root so we can count the whole family and
        // report a single finding at the family's first declaration.
        if let sourceFile = node.as(SourceFileSyntax.self) {
            evaluateAccentFamily(in: sourceFile, context: context, collector: &collector)
        }
    }

    private func reportTypeIfCategorical(
        name: String,
        at node: some SyntaxProtocol,
        context: RuleContext,
        collector: inout [Finding]
    ) {
        guard categoryTypeSuffixes.contains(where: { name.hasSuffix($0) }) else { return }
        let description = context.spec.description +
            " (categorical color scheme type '\(name)' maps category cases to differing colors)"
        collector.append(context.finding(node: node, descriptionOverride: description))
    }

    /// Find static color-token declarations named `<category>Accent` whose
    /// values resolve to differing chromatic hexes. If the family is large
    /// enough, report once at the earliest member.
    private func evaluateAccentFamily(
        in sourceFile: SourceFileSyntax,
        context: RuleContext,
        collector: inout [Finding]
    ) {
        struct Member {
            let name: String
            let decl: VariableDeclSyntax
            let hex: String?
        }

        let raw = collectAccentTokens(in: Syntax(sourceFile))
        let members = raw.map { Member(name: $0.name, decl: $0.decl, hex: $0.hex) }

        // Distinct token names ending in the suffix (e.g. nadAccent, glowAccent).
        // Filter to those whose hex is chromatic (a hue family, not a neutral).
        let chromaticMembers = members.filter { member in
            guard let hex = member.hex, let rgb = ColorMath.parseHex(hex) else {
                // A token whose value references another color (e.g. .v7AccentBlue)
                // still counts toward the family count but does not add a hue.
                return false
            }
            return ColorMath.chroma(rgb) >= 30
        }

        // Count distinct hues among chromatic members; a rainbow family has >= 2
        // distinct hue buckets and the overall family meets the size floor.
        let distinctNames = Set(members.map { $0.name })
        guard distinctNames.count >= minDistinctCategoryTokens else { return }

        var hueBuckets = Set<Int>()
        for member in chromaticMembers {
            guard let hex = member.hex, let rgb = ColorMath.parseHex(hex) else { continue }
            hueBuckets.insert(ColorMath.hueDegrees(rgb) / 30) // 12 coarse buckets.
        }
        guard hueBuckets.count >= 2 else { return }

        // Report once at the earliest-line accent member that carries a hex.
        let reportable = chromaticMembers.min { lhs, rhs in
            context.line(of: lhs.decl) < context.line(of: rhs.decl)
        }
        guard let target = reportable else { return }
        let names = members.map { $0.name }.sorted().joined(separator: ", ")
        let description = context.spec.description +
            " (per-category accent token family with \(hueBuckets.count) distinct hues: \(names))"
        collector.append(context.finding(node: target.decl, descriptionOverride: description))
    }

    /// Walk for `static let <name>Accent = Color(hex: "...")` style declarations.
    private func collectAccentTokens(
        in node: Syntax
    ) -> [(name: String, decl: VariableDeclSyntax, hex: String?)] {
        var results: [(name: String, decl: VariableDeclSyntax, hex: String?)] = []
        for child in node.children(viewMode: .sourceAccurate) {
            if let varDecl = child.as(VariableDeclSyntax.self) {
                for binding in varDecl.bindings {
                    guard let pattern = binding.pattern.as(IdentifierPatternSyntax.self) else { continue }
                    let name = pattern.identifier.text
                    guard name.hasSuffix(perCategoryTokenSuffix) else { continue }
                    let hex: String? = binding.initializer.flatMap { initializer in
                        ASTHelpers.stringLiterals(in: initializer.value).first { ColorMath.parseHex($0) != nil }
                    }
                    results.append((name: name, decl: varDecl, hex: hex))
                }
            }
            results.append(contentsOf: collectAccentTokens(in: child))
        }
        return results
    }
}
