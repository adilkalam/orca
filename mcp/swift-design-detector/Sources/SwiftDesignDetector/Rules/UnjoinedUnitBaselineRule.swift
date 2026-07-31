import Foundation
import SwiftSyntax

/// P0 unjoined-unit-baseline: a value entry and its unit/suffix label riding a
/// default-aligned (center-anchored) HStack — the P6-T1 refusal, promoted to
/// the detector after the owner caught it recurring (2026-07-14: "not having
/// units aligned to the baseline of numbers in inputs"; first instructed at
/// P6-T1). The canonical anatomy joins the pair on `.firstTextBaseline`
/// (recorded at PeptideFox/FoxAI VialMixInputModule): center anchoring seats
/// the smaller unit label ABOVE the figure's baseline the moment the entry
/// voice outgrows it.
///
/// Shape, data-driven from the rule JSON `detector` block (the
/// IOSDefaultReflexRule pattern):
///   a `container_types` call (HStack) whose `alignment:` argument is absent
///   or lacks `required_alignment` (firstTextBaseline), and whose trailing
///   closure contains BOTH an `entry_field_types` call (TextField/SecureField)
///   AND a `label_types` call (Text) at its own level — nested
///   `boundary_containers` subtrees are skipped, because each container is
///   judged on its own alignment (a properly seated inner join must not
///   incriminate its outer row, e.g. an entry pair beside a Toggle).
struct UnjoinedUnitBaselineRule: DesignRule {
    let id = "unjoined-unit-baseline"
    private let containerTypes: Set<String>
    private let entryFieldTypes: Set<String>
    private let labelTypes: Set<String>
    private let requiredAlignment: String
    private let boundaryContainers: Set<String>

    init?(spec: RuleSpec) {
        guard spec.detector["kind"]?.stringValue == "unjoined-unit-baseline" else { return nil }
        self.containerTypes = Set(spec.detector["container_types"]?.stringArray ?? ["HStack"])
        self.entryFieldTypes = Set(spec.detector["entry_field_types"]?.stringArray ?? ["TextField", "SecureField"])
        self.labelTypes = Set(spec.detector["label_types"]?.stringArray ?? ["Text"])
        self.requiredAlignment = spec.detector["required_alignment"]?.stringValue ?? "firstTextBaseline"
        self.boundaryContainers = Set(spec.detector["boundary_containers"]?.stringArray ?? [
            "HStack", "VStack", "ZStack", "LazyHStack", "LazyVStack",
            "List", "ForEach", "ScrollView", "Button", "Toggle", "Stepper",
            "NavigationLink", "Menu", "Picker",
        ])
    }

    func evaluate(node: Syntax, context: RuleContext, collector: inout [Finding]) {
        guard let call = node.as(FunctionCallExprSyntax.self),
              let name = ASTHelpers.calleeName(call),
              containerTypes.contains(name),
              let closure = call.trailingClosure else { return }

        // An explicit joining alignment seats the pair — nothing to flag.
        for argument in call.arguments where argument.label?.text == "alignment" {
            if argument.expression.trimmedDescription.contains(requiredAlignment) { return }
        }

        var hasEntryField = false
        var hasLabel = false
        scan(Syntax(closure), hasEntryField: &hasEntryField, hasLabel: &hasLabel)
        if hasEntryField && hasLabel {
            collector.append(context.finding(node: call))
        }
    }

    /// Walks the container's own level: stops at nested boundary containers,
    /// whose joins are their own alignment's responsibility.
    private func scan(_ node: Syntax, hasEntryField: inout Bool, hasLabel: inout Bool) {
        if hasEntryField && hasLabel { return }
        if let call = node.as(FunctionCallExprSyntax.self),
           let name = ASTHelpers.calleeName(call) {
            if entryFieldTypes.contains(name) { hasEntryField = true }
            if labelTypes.contains(name) { hasLabel = true }
            if boundaryContainers.contains(name) { return }
        }
        for child in node.children(viewMode: .sourceAccurate) {
            scan(child, hasEntryField: &hasEntryField, hasLabel: &hasLabel)
        }
    }
}
