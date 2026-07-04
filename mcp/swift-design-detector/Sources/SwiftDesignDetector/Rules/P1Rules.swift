import Foundation
import SwiftSyntax

/// P1 system-font-reflex: `Font.system(...)` / `.system(size:...)` reflex
/// instead of the bundled brand family. SUPPRESSED in token dirs (the engine
/// handles scope; the brand factories' `relativeTo:` TextStyle argument is a
/// labeled argument, not a `.system(...)` call, so it is naturally excluded).
struct SystemFontReflexRule: DesignRule {
    let id = "system-font-reflex"
    private let memberCalls: Set<String>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "system-font" else { return nil }
        self.memberCalls = Set(spec.detector["member_calls"]?.stringArray ?? ["system"])
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call),
              memberCalls.contains(name) else { return }
        // Only treat `system` as a font reflex when it reads as Font.system /
        // .system(size:...). `.system` as a callee member-access qualifies.
        collector.append(context.finding(node: call))
    }
}

/// P1 magic-number-spacing: a raw numeric literal supplied to .padding(...) or
/// a `spacing:` argument. Ignores configured values (0). SUPPRESSED in token
/// dirs (the Spacing scale is defined with literals there).
struct MagicNumberSpacingRule: DesignRule {
    let id = "magic-number-spacing"
    private let spacingAPIs: Set<String>
    private let ignoreValues: Set<Double>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "magic-spacing" else { return nil }
        self.spacingAPIs = Set(spec.detector["spacing_apis"]?.stringArray ?? ["padding", "spacing"])
        let ignore = spec.detector["ignore_values"]
        var values: Set<Double> = [0]
        if case let .array(items)? = ignore {
            values = Set(items.compactMap { $0.doubleValue })
        }
        self.ignoreValues = values
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call) else { return }

        // `.padding(16)` form: any unlabeled numeric literal argument.
        if spacingAPIs.contains(name) {
            for argument in call.arguments where ASTHelpers.argumentLabel(argument) == nil {
                if let value = ASTHelpers.numericLiteral(argument.expression),
                   !ignoreValues.contains(value) {
                    collector.append(context.finding(node: call))
                    return
                }
            }
        }

        // `spacing:` labeled argument on any call (VStack(spacing: 12), etc.).
        for argument in call.arguments where ASTHelpers.argumentLabel(argument) == "spacing" {
            if let value = ASTHelpers.numericLiteral(argument.expression),
               !ignoreValues.contains(value) {
                collector.append(context.finding(node: call))
                return
            }
        }
    }
}

/// P1 shadow-reflex: any explicit `.shadow(...)` modifier. FIRES in token dirs
/// too (elevation/shadow tokens can encode the reflex).
struct ShadowReflexRule: DesignRule {
    let id = "shadow-reflex"
    private let memberCalls: Set<String>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "shadow-call" else { return nil }
        self.memberCalls = Set(spec.detector["member_calls"]?.stringArray ?? ["shadow"])
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call),
              memberCalls.contains(name) else { return }
        collector.append(context.finding(node: call))
    }
}

/// P1 spring-overshoot: `.spring`/`interpolatingSpring`/`interactiveSpring`
/// calls whose `bounce` > bounce_max or `dampingFraction` < damping_min.
/// SUPPRESSED in token dirs.
struct SpringOvershootRule: DesignRule {
    let id = "spring-overshoot"
    private let memberCalls: Set<String>
    private let bounceArg: String
    private let bounceMax: Double
    private let dampingArg: String
    private let dampingMin: Double

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "spring-animation" else { return nil }
        self.memberCalls = Set(spec.detector["member_calls"]?.stringArray
            ?? ["spring", "interpolatingSpring", "interactiveSpring"])
        self.bounceArg = spec.detector["bounce_arg"]?.stringValue ?? "bounce"
        self.bounceMax = spec.detector["bounce_max"]?.doubleValue ?? 0.3
        self.dampingArg = spec.detector["damping_arg"]?.stringValue ?? "dampingFraction"
        self.dampingMin = spec.detector["damping_min"]?.doubleValue ?? 0.7
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call),
              memberCalls.contains(name) else { return }

        for argument in call.arguments {
            guard let label = ASTHelpers.argumentLabel(argument),
                  let value = ASTHelpers.numericLiteral(argument.expression) else { continue }
            if label == bounceArg && value > bounceMax {
                collector.append(context.finding(node: call))
                return
            }
            if label == dampingArg && value < dampingMin {
                collector.append(context.finding(node: call))
                return
            }
        }
    }
}

/// P1 mono-fatigue: over-reaching for the mono/accent family
/// (`accentMono(...)`, `.monospaced()`, `.monospacedDigit()`, or a
/// BrownMonoLL-based custom font). SUPPRESSED in token dirs.
struct MonoFatigueRule: DesignRule {
    let id = "mono-fatigue"
    private let memberCalls: Set<String>
    private let monoTypeEnums: [String]

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "mono-font" else { return nil }
        self.memberCalls = Set(spec.detector["member_calls"]?.stringArray
            ?? ["accentMono", "monospaced", "monospacedDigit"])
        self.monoTypeEnums = spec.detector["mono_type_enums"]?.stringArray ?? ["BrownMonoLL"]
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call) else { return }
        if memberCalls.contains(name) {
            collector.append(context.finding(node: call))
            return
        }
        // Font.custom built directly on a BrownMonoLL raw value.
        if name == "custom" && monoTypeEnums.contains(where: { call.trimmedDescription.contains($0) }) {
            collector.append(context.finding(node: call))
        }
    }
}
