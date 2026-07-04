import Foundation

/// Per-project `.design-overrides.json` — the owner-override registry shared with
/// the web detector. See docs/concepts/design-overrides-schema.md (the single
/// authoritative contract) and docs/reference/design-lane.md §Precedence.
///
/// A flat JSON array of override entries. A detector finding is SUPPRESSED iff an
/// entry exists whose `suppresses` equals the finding's rule id AND whose
/// (NON-EMPTY) `scope` glob matches the finding's file path. The both-and
/// non-empty-scope requirement is the accessibility floor: a malformed/over-broad
/// override fails closed-to-firing (suppresses nothing), never closed-to-silence
/// (suppresses everything).
struct OverrideEntry: Decodable {
    let suppresses: String
    let scope: String?
    let value: String?
    let provenance: String?
    let created: String?
}

struct DesignOverrides {
    let entries: [OverrideEntry]

    static let empty = DesignOverrides(entries: [])

    /// Resolution order mirrors DetectorConfig.resolve:
    ///   --overrides flag -> SWIFT_DESIGN_OVERRIDES env -> walk up from the
    ///   scanned file for `.design-overrides.json` -> empty.
    /// A missing/unparseable file is NEVER an error: silent fallback to empty.
    static func resolve(explicitPath: String?, scannedPath: String, env: [String: String]) -> DesignOverrides {
        let candidates: [String?] = [
            explicitPath,
            env["SWIFT_DESIGN_OVERRIDES"],
            findUpwards(from: scannedPath)
        ]
        for case let path? in candidates {
            if let overrides = load(path: path) { return overrides }
        }
        return .empty
    }

    private static func load(path: String) -> DesignOverrides? {
        guard let data = FileManager.default.contents(atPath: path) else { return nil }
        guard let entries = try? JSONDecoder().decode([OverrideEntry].self, from: data) else { return nil }
        return DesignOverrides(entries: entries)
    }

    private static func findUpwards(from scannedPath: String) -> String? {
        let fileManager = FileManager.default
        var directory = (scannedPath as NSString).deletingLastPathComponent
        if directory.isEmpty { directory = fileManager.currentDirectoryPath }
        var previous = ""
        while directory != previous && !directory.isEmpty {
            let candidate = (directory as NSString)
                .appendingPathComponent(".design-overrides.json")
            if fileManager.fileExists(atPath: candidate) { return candidate }
            previous = directory
            directory = (directory as NSString).deletingLastPathComponent
        }
        return nil
    }

    /// True when an override sanctions `ruleId` for `path`. SAFETY: requires BOTH
    /// a rule-id match AND a NON-EMPTY scope that matches. An entry with a
    /// missing/empty scope suppresses nothing.
    func isSuppressed(ruleId: String, path: String) -> Bool {
        for entry in entries where entry.suppresses == ruleId {
            guard let scope = entry.scope, !scope.isEmpty else { continue }
            if GlobMatcher.matches(glob: scope, path: path) { return true }
        }
        return false
    }
}
