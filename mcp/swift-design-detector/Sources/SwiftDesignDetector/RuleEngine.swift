import Foundation
import SwiftSyntax
import SwiftParser

/// A single rule's evaluator. Each concrete rule reads its own typed config out
/// of the `RuleSpec.detector` JSON tree and contributes findings while walking
/// the AST. The engine owns the SwiftSyntax walk; rules are stateless visitors
/// invoked per relevant node.
protocol DesignRule {
    /// The rule id this evaluator answers to (matches a `RuleSpec.id`).
    var id: String { get }

    /// Build a concrete evaluator from the rule spec. Returns nil if the spec's
    /// `detector.kind` does not match this rule (lets the engine map specs to
    /// evaluators without a giant switch in the engine itself).
    init?(spec: RuleSpec)

    /// Inspect one syntax node; append any findings to `collector`.
    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding])
}

/// Per-walk immutable context shared with every rule.
struct RuleContext {
    let filePath: String
    let converter: SourceLocationConverter
    let spec: RuleSpec

    /// 1-based source line for a node's leading position.
    func line(of node: some SyntaxProtocol) -> Int {
        converter.location(for: node.positionAfterSkippingLeadingTrivia).line
    }

    /// Trimmed single-line snippet of a node's source text.
    func snippet(of node: some SyntaxProtocol) -> String {
        let raw = node.trimmedDescription
        let collapsed = raw
            .replacingOccurrences(of: "\n", with: " ")
            .replacingOccurrences(of: "\t", with: " ")
        var result = collapsed
        while result.contains("  ") {
            result = result.replacingOccurrences(of: "  ", with: " ")
        }
        let trimmed = result.trimmingCharacters(in: .whitespaces)
        if trimmed.count > 200 {
            return String(trimmed.prefix(200)) + "…"
        }
        return trimmed
    }

    /// Helper to assemble a Finding for this rule against `node`.
    func finding(node: some SyntaxProtocol, descriptionOverride: String? = nil) -> Finding {
        Finding(
            antipattern: spec.id,
            name: spec.name,
            description: descriptionOverride ?? spec.description,
            severity: spec.severity,
            file: filePath,
            line: line(of: node),
            snippet: snippet(of: node)
        )
    }
}

/// Maps a rule id to its evaluator constructor. The engine consults this so a
/// spec disabled or unknown is simply skipped (forward-compatible with P2+).
enum RuleRegistry {
    static func evaluator(for spec: RuleSpec) -> DesignRule? {
        switch spec.id {
        case "off-palette-hue":           return OffPaletteHueRule(spec: spec)
        case "raw-hex-outside-tokens":    return RawHexOutsideTokensRule(spec: spec)
        case "hue-coded-category":        return HueCodedCategoryRule(spec: spec)
        case "tailwind-palette-hex":      return TailwindPaletteHexRule(spec: spec)
        case "gradient-fill":             return GradientFillRule(spec: spec)
        case "display-font-below-floor":  return DisplayFontBelowFloorRule(spec: spec)
        case "system-font-reflex":        return SystemFontReflexRule(spec: spec)
        case "magic-number-spacing":      return MagicNumberSpacingRule(spec: spec)
        case "shadow-reflex":             return ShadowReflexRule(spec: spec)
        case "spring-overshoot":          return SpringOvershootRule(spec: spec)
        case "mono-fatigue":              return MonoFatigueRule(spec: spec)
        case "ios-default-reflex":        return IOSDefaultReflexRule(spec: spec)
        default:                          return nil
        }
    }
}

/// Loads the rule file, resolves scoping, parses the target Swift source, and
/// runs every in-scope rule over the AST.
struct RuleEngine {

    enum EngineError: Error, CustomStringConvertible {
        case ruleFileMissing(String)
        case ruleFileUnreadable(String)
        case sourceMissing(String)

        var description: String {
            switch self {
            case let .ruleFileMissing(path): return "Rule file not found: \(path)"
            case let .ruleFileUnreadable(path): return "Rule file unreadable/invalid JSON: \(path)"
            case let .sourceMissing(path): return "Source file not found: \(path)"
            }
        }
    }

    let ruleFile: RuleFile
    let config: DetectorConfig
    /// The per-project owner-override registry (.design-overrides.json). Defaults
    /// to empty so existing call sites need not thread it; main.swift resolves the
    /// real registry and passes it in. See docs/concepts/design-overrides-schema.md.
    let overrides: DesignOverrides

    init(ruleFile: RuleFile, config: DetectorConfig, overrides: DesignOverrides = .empty) {
        self.ruleFile = ruleFile
        self.config = config
        self.overrides = overrides
    }

    /// Default location of the Swift rule file inside the ORCA-OS repo. Override
    /// via the `SWIFT_DESIGN_RULES` env var (mirrors the web detector's
    /// DESIGN_COLLECTION_PATH override).
    static let defaultRulesPath =
        "/Users/adilkalam/ORCA-OS/docs/concepts/ios-design-contract/detector-rules.swift.json"

    static func loadRuleFile(explicitPath: String?, env: [String: String]) throws -> RuleFile {
        let path = explicitPath
            ?? env["SWIFT_DESIGN_RULES"]
            ?? defaultRulesPath
        guard let data = FileManager.default.contents(atPath: path) else {
            throw EngineError.ruleFileMissing(path)
        }
        do {
            return try JSONDecoder().decode(RuleFile.self, from: data)
        } catch {
            throw EngineError.ruleFileUnreadable(path)
        }
    }

    /// Scan one Swift file and return sorted findings (respecting token-dir scope).
    func scan(path: String) throws -> [Finding] {
        guard let data = FileManager.default.contents(atPath: path),
              let source = String(data: data, encoding: .utf8) else {
            throw EngineError.sourceMissing(path)
        }

        let inTokenDir = config.isInTokenDir(path)
        let tree = Parser.parse(source: source)
        let converter = SourceLocationConverter(fileName: path, tree: tree)

        // Resolve which rules are active for this file given token-dir scope.
        let activeSpecs = ruleFile.rules.filter { spec in
            guard !inTokenDir else {
                // Inside a token dir: only rules whose effective scope flag is
                // true keep firing; the rest (the token-layer's own job) suppress.
                return config.scopeInTokenDirs(ruleID: spec.id, ruleDefault: spec.scopeInTokenDirs)
            }
            // Outside a token dir: every rule fires.
            return true
        }

        let evaluators = activeSpecs.compactMap { spec -> (DesignRule, RuleContext)? in
            guard let evaluator = RuleRegistry.evaluator(for: spec) else { return nil }
            let context = RuleContext(filePath: path, converter: converter, spec: spec)
            return (evaluator, context)
        }
        guard !evaluators.isEmpty else { return [] }

        var findings: [Finding] = []
        let walker = TreeWalker(evaluators: evaluators) { newFindings in
            findings.append(contentsOf: newFindings)
        }
        walker.walk(Syntax(tree))

        // De-duplicate identical findings (same rule, line, snippet) that a rule
        // might emit twice when a node is visited via multiple paths.
        var seen = Set<String>()
        let deduped = findings.filter { finding in
            let key = "\(finding.antipattern)|\(finding.line)|\(finding.snippet)"
            return seen.insert(key).inserted
        }

        // Owner-override suppression (design-lane.md §Precedence): drop any finding
        // the owner has sanctioned for this path via .design-overrides.json. SAFETY
        // (accessibility floor) lives in DesignOverrides.isSuppressed — a missing/
        // empty scope suppresses nothing. Then stamp the per-project resolved
        // severity so a project enforces what the OWNER cares about.
        let resolved = deduped.compactMap { finding -> Finding? in
            if overrides.isSuppressed(ruleId: finding.antipattern, path: finding.file) {
                return nil
            }
            let effectiveSeverity = config.severity(ruleID: finding.antipattern, ruleDefault: finding.severity)
            if effectiveSeverity == finding.severity { return finding }
            return Finding(
                antipattern: finding.antipattern,
                name: finding.name,
                description: finding.description,
                severity: effectiveSeverity,
                file: finding.file,
                line: finding.line,
                snippet: finding.snippet
            )
        }
        return sortedFindings(resolved)
    }
}

/// Drives a single SyntaxAnyVisitor pass, fanning each visited node out to
/// every active rule. One walk for all rules keeps scanning linear in tree size.
final class TreeWalker: SyntaxAnyVisitor {
    private let evaluators: [(DesignRule, RuleContext)]
    private let emit: ([Finding]) -> Void

    init(evaluators: [(DesignRule, RuleContext)], emit: @escaping ([Finding]) -> Void) {
        self.evaluators = evaluators
        self.emit = emit
        super.init(viewMode: .sourceAccurate)
    }

    override func visitAny(_ node: Syntax) -> SyntaxVisitorContinueKind {
        var batch: [Finding] = []
        for (rule, context) in evaluators {
            rule.evaluate(node: node, context: context, collector: &batch)
        }
        if !batch.isEmpty { emit(batch) }
        return .visitChildren
    }
}
