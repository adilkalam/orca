import Foundation
import SwiftSyntax

/// P0 display-font-below-floor: a display/hero typeface instantiated below its
/// size floor. Fires when `heroInline(...)` (or a Font.custom built on a
/// BrownLLInline raw value) is created with `size:` < floor_pt. STILL FIRES in
/// token dirs (display tokens are declared there).
struct DisplayFontBelowFloorRule: DesignRule {
    let id = "display-font-below-floor"

    private let displayFactories: Set<String>
    private let displayTypeEnums: [String]
    private let floorPt: Double

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "display-font-floor" else { return nil }
        self.displayFactories = Set(spec.detector["display_factories"]?.stringArray ?? ["heroInline"])
        self.displayTypeEnums = spec.detector["display_type_enums"]?.stringArray ?? ["BrownLLInline"]
        self.floorPt = spec.detector["floor_pt"]?.doubleValue ?? 24
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call) else { return }

        let isFactoryCall = displayFactories.contains(name)
        // A `.custom(...)` whose first argument resolves to a BrownLLInline raw
        // value is also a display instantiation.
        let isCustomDisplay = (name == "custom") && referencesDisplayEnum(call)
        guard isFactoryCall || isCustomDisplay else { return }

        guard let size = sizeArgument(of: call) else { return }
        if size < floorPt {
            let description = context.spec.description +
                " (display font instantiated at \(formatted(size))pt < \(formatted(floorPt))pt floor)"
            collector.append(context.finding(node: call, descriptionOverride: description))
        }
    }

    /// The `size:` argument value, or the first numeric literal for `.custom`.
    private func sizeArgument(of call: FunctionCallExprSyntax) -> Double? {
        for argument in call.arguments where ASTHelpers.argumentLabel(argument) == "size" {
            if let value = ASTHelpers.numericLiteral(argument.expression) { return value }
        }
        // heroInline(_ weight:, size:, relativeTo:) — size is labeled; .custom
        // uses size: too. Fall back to any numeric literal arg if unlabeled.
        for argument in call.arguments where ASTHelpers.argumentLabel(argument) == nil {
            if let value = ASTHelpers.numericLiteral(argument.expression) { return value }
        }
        return nil
    }

    /// True if any subtree of the call references a display type enum name
    /// (e.g. BrownLLInline.regular.rawValue passed to Font.custom).
    private func referencesDisplayEnum(_ call: FunctionCallExprSyntax) -> Bool {
        let text = call.trimmedDescription
        return displayTypeEnums.contains { text.contains($0) }
    }

    private func formatted(_ value: Double) -> String {
        value == value.rounded() ? String(Int(value)) : String(value)
    }
}
