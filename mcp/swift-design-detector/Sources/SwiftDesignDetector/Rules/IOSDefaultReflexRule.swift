import Foundation
import SwiftSyntax

/// P0 ios-default-reflex: shipping the platform default where the brand demands a
/// considered, custom treatment — the iOS analogue of the web "generic-default
/// attractor". Three shapes, all data-driven from the rule JSON `detector` block
/// so the owner can tune the match lists without recompiling:
///
///   1. A native control init reflexively standing in for a custom control:
///      `Menu { … }` / `Picker(…)` (native_control_types).
///   2. A default-chrome modifier: `.contextMenu { … }` (default_chrome_modifiers).
///   3. An accent reflex: `.tint(.blue)` — `tint` (accent_reflex_calls) whose
///      first argument is a member-access to a default system color
///      (accent_reflex_values, e.g. `.blue`).
///
/// Mirrors SystemFontReflexRule / MonoFatigueRule: a stateless visitor matching
/// FunctionCallExprSyntax by callee name, reading its config out of RuleSpec.detector.
struct IOSDefaultReflexRule: DesignRule {
    let id = "ios-default-reflex"
    private let nativeControlTypes: Set<String>
    private let defaultChromeModifiers: Set<String>
    private let accentReflexCalls: Set<String>
    private let accentReflexValues: Set<String>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "ios-default-reflex" else { return nil }
        self.nativeControlTypes = Set(spec.detector["native_control_types"]?.stringArray ?? ["Menu", "Picker"])
        self.defaultChromeModifiers = Set(spec.detector["default_chrome_modifiers"]?.stringArray ?? ["contextMenu"])
        self.accentReflexCalls = Set(spec.detector["accent_reflex_calls"]?.stringArray ?? ["tint"])
        self.accentReflexValues = Set(spec.detector["accent_reflex_values"]?.stringArray ?? [".blue"])
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call) else { return }

        // 1. Native control init (Menu/Picker) or 2. default-chrome modifier (contextMenu).
        if nativeControlTypes.contains(name) || defaultChromeModifiers.contains(name) {
            collector.append(context.finding(node: call))
            return
        }

        // 3. Accent reflex: tint(...) whose first argument is a member-access to a
        // default system color (.blue). The argument `.blue` is a member-access
        // with no base (a leading-dot member ref), so its source text is ".blue".
        if accentReflexCalls.contains(name) {
            guard let firstArg = call.arguments.first else { return }
            if isDefaultAccentMemberAccess(firstArg.expression) {
                collector.append(context.finding(node: call))
            }
        }
    }

    /// True when `expr` is a base-less member access whose member name (prefixed
    /// with `.`) is in the sanctioned-default list, e.g. `.blue` -> ".blue".
    private func isDefaultAccentMemberAccess(_ expr: ExprSyntax) -> Bool {
        guard let member = expr.as(MemberAccessExprSyntax.self), member.base == nil else { return false }
        let memberName = "." + member.declName.baseName.text
        return accentReflexValues.contains(memberName)
    }
}
