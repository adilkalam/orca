import Foundation
import SwiftSyntax

/// P0 gradient-fill: a LinearGradient/RadialGradient/etc. construct, a
/// `.linearGradient(...)`-style member call, OR a token declaration whose name
/// contains "gradient". STILL FIRES in token dirs because gradient stop tokens
/// (gradientStart/gradientEnd) are declared there.
struct GradientFillRule: DesignRule {
    let id = "gradient-fill"

    private let typeNames: Set<String>
    private let memberCalls: Set<String>
    private let tokenNameSubstrings: [String]

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "gradient-construct" else { return nil }
        self.typeNames = Set(spec.detector["type_names"]?.stringArray ?? [])
        self.memberCalls = Set(spec.detector["member_calls"]?.stringArray ?? [])
        self.tokenNameSubstrings = (spec.detector["gradient_token_name_substrings"]?.stringArray ?? ["gradient"])
            .map { $0.lowercased() }
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        // Gradient initializer or member-call expression.
        if let call = node.as(FunctionCallExprSyntax.self) {
            if let name = ASTHelpers.calleeName(call),
               typeNames.contains(name) || memberCalls.contains(name) {
                collector.append(context.finding(node: call))
                return
            }
        }

        // Token declaration whose binding name contains "gradient".
        if let varDecl = node.as(VariableDeclSyntax.self) {
            for binding in varDecl.bindings {
                guard let pattern = binding.pattern.as(IdentifierPatternSyntax.self) else { continue }
                let lower = pattern.identifier.text.lowercased()
                if tokenNameSubstrings.contains(where: { lower.contains($0) }) {
                    collector.append(context.finding(node: varDecl))
                    return
                }
            }
        }
    }
}
