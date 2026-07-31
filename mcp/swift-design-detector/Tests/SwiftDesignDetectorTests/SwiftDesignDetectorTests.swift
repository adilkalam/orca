import XCTest
@testable import SwiftDesignDetector

/// Exercises the RuleEngine over two fixtures that mirror the keystone:
///  - DirtyColorTokens.swift (matches the token-dir glob) must still surface P0
///    off-palette / hue-coded / tailwind / gradient slop while the legit blue +
///    neutral tokens stay clean.
///  - CleanView.swift (NOT a token dir; every rule active) must scan clean.
final class SwiftDesignDetectorTests: XCTestCase {

    /// Load the on-disk rule file the production CLI uses.
    private func loadEngine(config: DetectorConfig) throws -> RuleEngine {
        let ruleFile = try RuleEngine.loadRuleFile(explicitPath: nil, env: ProcessInfo.processInfo.environment)
        return RuleEngine(ruleFile: ruleFile, config: config)
    }

    private func fixturePath(_ name: String) throws -> String {
        let url = try XCTUnwrap(
            Bundle.module.url(forResource: name, withExtension: "swift", subdirectory: "Fixtures"),
            "Fixture \(name).swift not found in test bundle"
        )
        return url.path
    }

    // MARK: - Dirty token fixture (token-dir scope; P0 slop must fire)

    func testDirtyTokenFixtureFiresP0Slop() throws {
        let engine = try loadEngine(config: .defaults)
        let path = try fixturePath("DirtyColorTokens")

        // Sanity: the fixture is recognised as a token-dir file.
        XCTAssertTrue(DetectorConfig.defaults.isInTokenDir(path),
                      "DirtyColorTokens.swift must match the default token-dir glob")

        let findings = try engine.scan(path: path)
        XCTAssertFalse(findings.isEmpty, "Dirty token fixture must produce findings")

        let antipatterns = Set(findings.map { $0.antipattern })
        // STILL-FIRES-in-token-dir rules:
        XCTAssertTrue(antipatterns.contains("off-palette-hue"))
        XCTAssertTrue(antipatterns.contains("tailwind-palette-hex"))
        XCTAssertTrue(antipatterns.contains("gradient-fill"))
        XCTAssertTrue(antipatterns.contains("hue-coded-category"))

        // SUPPRESSED-in-token-dir rule must NOT appear:
        XCTAssertFalse(antipatterns.contains("raw-hex-outside-tokens"),
                       "raw-hex-outside-tokens is suppressed inside token dirs")

        // Named slop must be flagged.
        let snippets = findings.map { $0.snippet }.joined(separator: "\n")
        for slop in ["#f97316", "#14b8a6", "#ec4899", "#9333ea", "#EDE8FF"] {
            XCTAssertTrue(snippets.contains(slop), "Expected slop \(slop) to be flagged")
        }
        XCTAssertTrue(snippets.contains("CompoundColorScheme"),
                      "hue-coded-category must flag the CompoundColorScheme type")

        // Legit blue / neutral tokens must NOT be flagged.
        for clean in ["#336CFF", "#2563eb", "#F7F8FA", "#111315"] {
            XCTAssertFalse(snippets.contains(clean), "Legit token \(clean) must stay clean")
        }

        // Every finding from a token-dir fixture should be P0 (the P1 rules that
        // fire in token dirs, shadow-reflex, are not exercised by this fixture).
        for finding in findings {
            XCTAssertEqual(finding.severity, "P0", "Token-dir fixture should only surface P0 here")
        }
    }

    // MARK: - Clean fixture (all rules active; EXIT 0)

    func testCleanFixtureProducesNoFindings() throws {
        let engine = try loadEngine(config: .defaults)
        let path = try fixturePath("CleanView")

        // Sanity: the clean fixture is NOT a token-dir file (every rule active).
        XCTAssertFalse(DetectorConfig.defaults.isInTokenDir(path),
                       "CleanView.swift must NOT match the token-dir glob")

        let findings = try engine.scan(path: path)
        XCTAssertTrue(findings.isEmpty,
                      "Clean fixture must scan clean; got: \(findings.map { "\($0.antipattern)@\($0.line):\($0.snippet)" })")
        // The CLI emits the literal "[]" for the empty case (see main.swift); it
        // never routes an empty array through the pretty-printing encoder.
    }

    // MARK: - Scope flag wiring

    func testRawHexFiresOutsideTokenDirButNotInside() throws {
        // Outside a token dir, raw-hex-outside-tokens must fire on a raw literal.
        // We reuse the dirty fixture but force a config whose globs match nothing.
        let noTokenDirConfig = DetectorConfig(tokenDirGlobs: ["**/NEVER_MATCHES/**"], ruleOverrides: [:])
        let engine = try loadEngine(config: noTokenDirConfig)
        let path = try fixturePath("DirtyColorTokens")

        let findings = try engine.scan(path: path)
        let antipatterns = Set(findings.map { $0.antipattern })
        XCTAssertTrue(antipatterns.contains("raw-hex-outside-tokens"),
                      "raw-hex-outside-tokens must fire when the file is NOT in a token dir")
    }

    // MARK: - ios-default-reflex + owner-override suppression

    /// Write a `.design-overrides.json` to a temp path and return that path. The
    /// caller resolves it via DesignOverrides.resolve(explicitPath:).
    private func writeOverrides(_ json: String) throws -> String {
        let dir = NSTemporaryDirectory()
        let path = (dir as NSString)
            .appendingPathComponent("design-overrides-\(UUID().uuidString).json")
        try json.write(toFile: path, atomically: true, encoding: .utf8)
        return path
    }

    /// (a) ios-default-reflex must fire P0 on the default-chrome fixture (the CLI
    /// would EXIT 2). DefaultChromeView is NOT a token dir, so the rule is active.
    func testDefaultReflexFiresP0() throws {
        let engine = try loadEngine(config: .defaults)
        let path = try fixturePath("DefaultChromeView")

        XCTAssertFalse(DetectorConfig.defaults.isInTokenDir(path),
                       "DefaultChromeView.swift must NOT match the token-dir glob")

        let findings = try engine.scan(path: path)
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertFalse(reflex.isEmpty, "ios-default-reflex must fire on the default-chrome fixture")
        for finding in reflex {
            XCTAssertEqual(finding.severity, "P0", "ios-default-reflex is a P0 rule")
        }
        // All three shapes (Menu, .contextMenu, .tint(.blue)) should be caught.
        XCTAssertGreaterThanOrEqual(reflex.count, 3,
                                    "Expected Menu + .contextMenu + .tint(.blue) to each fire")
    }

    /// (b) An override whose `suppresses` + `scope` match the finding mutes it.
    func testMatchingOverrideSuppressesReflex() throws {
        let ruleFile = try RuleEngine.loadRuleFile(explicitPath: nil, env: ProcessInfo.processInfo.environment)
        let path = try fixturePath("DefaultChromeView")

        // Scope matches the fixture file by name (walk-up resolution is by path
        // glob; `**/DefaultChromeView.swift` matches the resolved absolute path).
        let overridesPath = try writeOverrides("""
        [
          { "suppresses": "ios-default-reflex",
            "scope": "**/DefaultChromeView.swift",
            "provenance": "ship the native Menu here — it's a system affordance" }
        ]
        """)
        let overrides = DesignOverrides.resolve(
            explicitPath: overridesPath, scannedPath: path,
            env: ProcessInfo.processInfo.environment)
        let engine = RuleEngine(ruleFile: ruleFile, config: .defaults, overrides: overrides)

        let findings = try engine.scan(path: path)
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertTrue(reflex.isEmpty,
                      "A matching suppresses+scope override must mute ios-default-reflex; got: \(reflex.map { $0.snippet })")
    }

    /// (c) THE ACCESSIBILITY-FLOOR TEST: an override with a missing/empty `scope`
    /// must suppress ZERO findings (fail-closed-to-firing, never to-silence).
    func testEmptyScopeOverrideSuppressesNothing() throws {
        let ruleFile = try RuleEngine.loadRuleFile(explicitPath: nil, env: ProcessInfo.processInfo.environment)
        let path = try fixturePath("DefaultChromeView")

        // Empty-string scope AND missing scope — neither may suppress.
        let overridesPath = try writeOverrides("""
        [
          { "suppresses": "ios-default-reflex", "scope": "" },
          { "suppresses": "ios-default-reflex" }
        ]
        """)
        let overrides = DesignOverrides.resolve(
            explicitPath: overridesPath, scannedPath: path,
            env: ProcessInfo.processInfo.environment)
        let engine = RuleEngine(ruleFile: ruleFile, config: .defaults, overrides: overrides)

        let findings = try engine.scan(path: path)
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertFalse(reflex.isEmpty,
                       "An override with missing/empty scope must suppress NOTHING (accessibility floor)")
    }

    // MARK: - Advisory effective severity (report-only path)

    /// A per-project config severity flip to "advisory" must be stamped onto the
    /// findings as their EFFECTIVE severity. The CLI (main.swift) keys its exit
    /// off exactly this field: advisory-only findings are report-only (EXIT 0);
    /// only an effective P0/P1 forces EXIT 2. The corpus currently ships only
    /// P0/P1 defaults, so the config-flip route is the advisory case.
    func testAdvisoryConfigFlipStampsEffectiveSeverity() throws {
        let advisoryConfig = DetectorConfig(
            tokenDirGlobs: DetectorConfig.defaultGlobs,
            ruleOverrides: [
                "ios-default-reflex": DetectorConfig.RuleOverride(
                    scopeInTokenDirs: nil, severity: "advisory")
            ]
        )
        let engine = try loadEngine(config: advisoryConfig)
        let path = try fixturePath("DefaultChromeView")

        let findings = try engine.scan(path: path)
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertFalse(reflex.isEmpty,
                       "Advisory flip must NOT suppress the finding — it still reports")
        for finding in reflex {
            XCTAssertEqual(finding.severity, "advisory",
                           "Effective severity must be the per-project override, not the corpus P0")
        }
    }

    // MARK: - Override path canonicalization (relative scope vs absolute path)

    /// Copy the default-chrome fixture into `<temp>/proj/Sub/` and return the
    /// project root. Used by the path-canonicalization tests.
    private func makeTempProject() throws -> String {
        let fileManager = FileManager.default
        let projectDir = (NSTemporaryDirectory() as NSString)
            .appendingPathComponent("sdd-proj-\(UUID().uuidString)")
        let subDir = (projectDir as NSString).appendingPathComponent("Sub")
        try fileManager.createDirectory(atPath: subDir, withIntermediateDirectories: true)
        let source = try fixturePath("DefaultChromeView")
        let target = (subDir as NSString).appendingPathComponent("DefaultChromeView.swift")
        try fileManager.copyItem(atPath: source, toPath: target)
        return projectDir
    }

    /// A PROJECT-RELATIVE scope glob ("Sub/**") must suppress a finding whose
    /// file path is ABSOLUTE, via relativization against the registry file's
    /// directory (the proven PeptideFox dead-end: 33 P0s left un-suppressed
    /// because "PeptideFox/**" could never match "/Users/.../PeptideFox/...").
    func testRelativeScopeSuppressesAbsoluteArtifactPath() throws {
        let projectDir = try makeTempProject()
        let registryPath = (projectDir as NSString)
            .appendingPathComponent(".design-overrides.json")
        try """
        [
          { "suppresses": "ios-default-reflex",
            "scope": "Sub/**",
            "provenance": "test: project-relative scope vs absolute path" }
        ]
        """.write(toFile: registryPath, atomically: true, encoding: .utf8)

        let absoluteArtifact = (projectDir as NSString)
            .appendingPathComponent("Sub/DefaultChromeView.swift")
        let ruleFile = try RuleEngine.loadRuleFile(explicitPath: nil, env: ProcessInfo.processInfo.environment)
        let overrides = DesignOverrides.resolve(
            explicitPath: registryPath, scannedPath: absoluteArtifact, env: [:])
        let engine = RuleEngine(ruleFile: ruleFile, config: .defaults, overrides: overrides)

        let findings = try engine.scan(path: absoluteArtifact)
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertTrue(reflex.isEmpty,
                      "Registry-dir relativization must let 'Sub/**' cover the absolute path; got: \(reflex.map { $0.snippet })")
    }

    /// findUpwards must probe the STARTING directory for a relative scan path
    /// with a directory component: "Sub/File.swift" from cwd previously walked
    /// "Sub", hit "", and never checked cwd itself — so a registry sitting in
    /// cwd was invisible.
    func testFindUpwardsProbesCwdForRelativePaths() throws {
        let projectDir = try makeTempProject()
        let registryPath = (projectDir as NSString)
            .appendingPathComponent(".design-overrides.json")
        try """
        [
          { "suppresses": "ios-default-reflex",
            "scope": "Sub/**",
            "provenance": "test: cwd walk-up for relative scan paths" }
        ]
        """.write(toFile: registryPath, atomically: true, encoding: .utf8)

        let fileManager = FileManager.default
        let originalCwd = fileManager.currentDirectoryPath
        XCTAssertTrue(fileManager.changeCurrentDirectoryPath(projectDir))
        defer { _ = fileManager.changeCurrentDirectoryPath(originalCwd) }

        // No explicit path, no env: only the walk-up can find the registry.
        let overrides = DesignOverrides.resolve(
            explicitPath: nil, scannedPath: "Sub/DefaultChromeView.swift", env: [:])
        XCTAssertEqual(overrides.entries.count, 1,
                       "findUpwards must find the registry in cwd for a relative Sub/ path")

        let ruleFile = try RuleEngine.loadRuleFile(explicitPath: nil, env: ProcessInfo.processInfo.environment)
        let engine = RuleEngine(ruleFile: ruleFile, config: .defaults, overrides: overrides)
        let findings = try engine.scan(path: "Sub/DefaultChromeView.swift")
        let reflex = findings.filter { $0.antipattern == "ios-default-reflex" }
        XCTAssertTrue(reflex.isEmpty,
                      "The cwd-resolved registry must suppress the scoped finding")
    }

    // MARK: - Color math parity

    func testColorMathClassifiesHues() {
        // Blue stays clean; orange/teal/pink/purple/lavender do not.
        XCTAssertEqual(ColorMath.hueDegrees(ColorMath.parseHex("#336CFF")!), 223)
        XCTAssertEqual(ColorMath.hueDegrees(ColorMath.parseHex("#2563eb")!), 221)
        XCTAssertLessThan(ColorMath.chroma(ColorMath.parseHex("#F7F8FA")!), 16)
        XCTAssertGreaterThanOrEqual(ColorMath.chroma(ColorMath.parseHex("#EDE8FF")!), 16)
    }
}
