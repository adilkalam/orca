import Foundation

/// Per-project `.design-detector.swift.json` (see
/// docs/concepts/ios-design-contract/detector-config-schema.md). Tells the
/// detector which files are the token layer and lets a project override a
/// rule's scope_in_token_dirs flag. All fields are optional; defaults apply.
struct DetectorConfig: Decodable {
    let tokenDirGlobs: [String]
    let ruleOverrides: [String: RuleOverride]

    struct RuleOverride: Decodable {
        let scopeInTokenDirs: Bool?
        /// Per-project enforcement severity for this rule (e.g. "P0"/"P1"/
        /// "advisory"). Lets a project track what the OWNER cares about instead of
        /// a frozen global severity map (design-lane.md §Precedence inverse case).
        let severity: String?
        enum CodingKeys: String, CodingKey {
            case scopeInTokenDirs = "scope_in_token_dirs"
            case severity
        }
    }

    enum CodingKeys: String, CodingKey {
        case tokenDirGlobs = "token_dir_globs"
        case ruleOverrides = "rule_overrides"
    }

    init(tokenDirGlobs: [String], ruleOverrides: [String: RuleOverride]) {
        self.tokenDirGlobs = tokenDirGlobs
        self.ruleOverrides = ruleOverrides
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.tokenDirGlobs = try container.decodeIfPresent([String].self, forKey: .tokenDirGlobs)
            ?? DetectorConfig.defaultGlobs
        self.ruleOverrides = try container.decodeIfPresent([String: RuleOverride].self, forKey: .ruleOverrides)
            ?? [:]
    }

    static let defaultGlobs = ["**/DesignSystem/Tokens/**", "**/*Tokens.swift"]

    static var defaults: DetectorConfig {
        DetectorConfig(tokenDirGlobs: defaultGlobs, ruleOverrides: [:])
    }

    /// Resolution order: explicit path -> SWIFT_DESIGN_CONFIG env -> walk up
    /// from the scanned file for `.design-detector.swift.json` -> defaults.
    static func resolve(explicitPath: String?, scannedPath: String, env: [String: String]) -> DetectorConfig {
        let candidates: [String?] = [
            explicitPath,
            env["SWIFT_DESIGN_CONFIG"],
            findUpwards(from: scannedPath)
        ]
        for case let path? in candidates {
            if let config = load(path: path) { return config }
        }
        return .defaults
    }

    private static func load(path: String) -> DetectorConfig? {
        guard let data = FileManager.default.contents(atPath: path) else { return nil }
        return try? JSONDecoder().decode(DetectorConfig.self, from: data)
    }

    private static func findUpwards(from scannedPath: String) -> String? {
        let fileManager = FileManager.default
        var directory = (scannedPath as NSString).deletingLastPathComponent
        if directory.isEmpty { directory = fileManager.currentDirectoryPath }
        var previous = ""
        while directory != previous && !directory.isEmpty {
            let candidate = (directory as NSString)
                .appendingPathComponent(".design-detector.swift.json")
            if fileManager.fileExists(atPath: candidate) { return candidate }
            previous = directory
            directory = (directory as NSString).deletingLastPathComponent
        }
        return nil
    }

    /// True when the scanned path matches any token-dir glob.
    func isInTokenDir(_ path: String) -> Bool {
        tokenDirGlobs.contains { GlobMatcher.matches(glob: $0, path: path) }
    }

    /// Effective scope flag for a rule: project override wins, else the rule's
    /// own scope_in_token_dirs from the rule file.
    func scopeInTokenDirs(ruleID: String, ruleDefault: Bool) -> Bool {
        ruleOverrides[ruleID]?.scopeInTokenDirs ?? ruleDefault
    }

    /// Effective enforcement severity for a rule: project override wins, else the
    /// rule's own severity from the rule file. Mirrors scopeInTokenDirs so a
    /// project can raise/lower what it enforces per the owner's priorities.
    func severity(ruleID: String, ruleDefault: String) -> String {
        ruleOverrides[ruleID]?.severity ?? ruleDefault
    }
}

/// Minimal glob matcher supporting `**` (any path segments, incl. `/`), `*`
/// (any chars except `/`), and `?`. Matches against the full path string so
/// `**/*Tokens.swift` and `**/DesignSystem/Tokens/**` both work on absolute
/// paths.
enum GlobMatcher {
    static func matches(glob: String, path: String) -> Bool {
        let pattern = "^" + translate(glob) + "$"
        guard let regex = try? NSRegularExpression(pattern: pattern) else { return false }
        let range = NSRange(path.startIndex..<path.endIndex, in: path)
        return regex.firstMatch(in: path, range: range) != nil
    }

    private static func translate(_ glob: String) -> String {
        var result = ""
        let characters = Array(glob)
        var index = 0
        while index < characters.count {
            let character = characters[index]
            switch character {
            case "*":
                if index + 1 < characters.count && characters[index + 1] == "*" {
                    // `**` -> any run of characters including path separators.
                    result += ".*"
                    index += 2
                    // Swallow a trailing slash after `**` so `**/` matches zero dirs too.
                    if index < characters.count && characters[index] == "/" {
                        index += 1
                    }
                    continue
                } else {
                    // single `*` -> anything except a path separator.
                    result += "[^/]*"
                }
            case "?":
                result += "[^/]"
            default:
                result += NSRegularExpression.escapedPattern(for: String(character))
            }
            index += 1
        }
        return result
    }
}
