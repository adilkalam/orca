import Foundation
import SwiftSyntax

/// Shared AST inspection helpers used by multiple rules. Centralised so every
/// rule classifies the same node shapes the same way.
enum ASTHelpers {

    /// If `node` is a function-call expression, return it; else nil.
    static func asCall(_ node: Syntax) -> FunctionCallExprSyntax? {
        node.as(FunctionCallExprSyntax.self)
    }

    /// The callee's trailing member name for a call like `Color(hex:)` ->
    /// "Color", `.shadow(...)` / `Font.system(...)` -> "shadow"/"system",
    /// `.fill(.linearGradient(...))` member-call -> "fill"/"linearGradient".
    /// Returns the simple identifier or member base-name at the call head.
    static func calleeName(_ call: FunctionCallExprSyntax) -> String? {
        let callee = call.calledExpression
        if let ident = callee.as(DeclReferenceExprSyntax.self) {
            return ident.baseName.text
        }
        if let member = callee.as(MemberAccessExprSyntax.self) {
            return member.declName.baseName.text
        }
        return nil
    }

    /// For a member-access callee `A.b`, return the base type name "A" when it
    /// is a plain identifier (e.g. `Font.system` -> "Font"). nil for `.system`.
    static func calleeBaseTypeName(_ call: FunctionCallExprSyntax) -> String? {
        guard let member = call.calledExpression.as(MemberAccessExprSyntax.self),
              let base = member.base?.as(DeclReferenceExprSyntax.self) else {
            return nil
        }
        return base.baseName.text
    }

    /// Collect every string-literal segment value inside an expression subtree
    /// (used to pull "#336CFF" out of `Color(hex: "#336CFF")`).
    static func stringLiterals(in node: some SyntaxProtocol) -> [String] {
        var results: [String] = []
        for child in node.children(viewMode: .sourceAccurate) {
            if let literal = child.as(StringLiteralExprSyntax.self) {
                let text = literal.segments.compactMap { segment -> String? in
                    segment.as(StringSegmentSyntax.self)?.content.text
                }.joined()
                results.append(text)
            }
            results.append(contentsOf: stringLiterals(in: child))
        }
        return results
    }

    /// The string value if `expr` is directly a string literal; else nil.
    static func directStringLiteral(_ expr: ExprSyntax) -> String? {
        guard let literal = expr.as(StringLiteralExprSyntax.self) else { return nil }
        return literal.segments.compactMap {
            $0.as(StringSegmentSyntax.self)?.content.text
        }.joined()
    }

    /// Numeric literal value (Int or Double) if `expr` is one; else nil.
    static func numericLiteral(_ expr: ExprSyntax) -> Double? {
        if let intLit = expr.as(IntegerLiteralExprSyntax.self) {
            let cleaned = intLit.literal.text.replacingOccurrences(of: "_", with: "")
            return Double(cleaned)
        }
        if let floatLit = expr.as(FloatLiteralExprSyntax.self) {
            let cleaned = floatLit.literal.text.replacingOccurrences(of: "_", with: "")
            return Double(cleaned)
        }
        return nil
    }

    /// The label text of a call argument (e.g. "hex", "spacing", "size"); nil
    /// for a positional/unlabeled argument.
    static func argumentLabel(_ argument: LabeledExprSyntax) -> String? {
        argument.label?.text
    }
}
