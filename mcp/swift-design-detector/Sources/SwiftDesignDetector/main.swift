import Foundation

// SwiftDesignDetector CLI entry.
//
// Contract (mirrors mcp/design-detector/bin/designcheck.js + detect-antipatterns.mjs):
//   SwiftDesignDetector detect --json <path>
//     - clean  -> writes "[]" to STDOUT, EXIT 0
//     - findings -> writes findings JSON to STDERR, EXIT 2
//     - usage/internal error -> message to STDERR, EXIT 1
//
// Findings go to STDERR (not STDOUT) so a caller capturing `2>&1` sees them and
// the gate can branch on the exit code exactly like the web detector's
// `runExternalRules` path. `--json` is accepted (and is the only supported
// output mode in v1) for parity with the web CLI's `--json` flag.

enum ExitCode: Int32 {
    case clean = 0
    case usageOrInternal = 1
    case findings = 2
}

func printUsage(to stream: FileHandle) {
    let usage = """
    Usage: SwiftDesignDetector detect --json <path>

      detect            Scan a Swift/SwiftUI file for named design slop.
      --json            Emit findings as JSON (the only supported mode in v1).
      <path>            Absolute or relative path to a .swift file.

      --config <path>      Override the per-project .design-detector.swift.json.
      --rules <path>       Override the rule file path.
      --overrides <path>   Override the per-project .design-overrides.json (owner registry).

    Options (env):
      SWIFT_DESIGN_RULES      Override the rule file path.
      SWIFT_DESIGN_CONFIG     Override the per-project .design-detector.swift.json.
      SWIFT_DESIGN_OVERRIDES  Override the per-project .design-overrides.json (owner override registry).

    Exit codes: 0 = clean ([] on stdout), 2 = findings (JSON on stderr), 1 = usage/internal.
    """
    stream.write(Data((usage + "\n").utf8))
}

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data(("swiftdesigncheck: " + message + "\n").utf8))
    exit(ExitCode.usageOrInternal.rawValue)
}

// ─── Argument parsing ────────────────────────────────────────────────────────

var arguments = Array(CommandLine.arguments.dropFirst())

if arguments.isEmpty || arguments.contains("-h") || arguments.contains("--help") {
    printUsage(to: FileHandle.standardOutput)
    exit(arguments.isEmpty ? ExitCode.usageOrInternal.rawValue : ExitCode.clean.rawValue)
}

guard let command = arguments.first, command == "detect" else {
    fail("unknown command '\(arguments.first ?? "")'. Expected: detect --json <path>")
}
arguments.removeFirst()

// `--json` is the contract's output mode; accept and require it for parity.
var jsonMode = false
var explicitConfigPath: String?
var explicitRulesPath: String?
var explicitOverridesPath: String?
var positional: [String] = []

var index = 0
while index < arguments.count {
    let arg = arguments[index]
    switch arg {
    case "--json":
        jsonMode = true
    case "--config":
        index += 1
        guard index < arguments.count else { fail("--config requires a path") }
        explicitConfigPath = arguments[index]
    case "--rules":
        index += 1
        guard index < arguments.count else { fail("--rules requires a path") }
        explicitRulesPath = arguments[index]
    case "--overrides":
        index += 1
        guard index < arguments.count else { fail("--overrides requires a path") }
        explicitOverridesPath = arguments[index]
    default:
        if arg.hasPrefix("--") {
            fail("unknown option '\(arg)'")
        }
        positional.append(arg)
    }
    index += 1
}

guard let targetPath = positional.first else {
    fail("no target path supplied. Usage: detect --json <path>")
}
if positional.count > 1 {
    fail("v1 scans a single file; got \(positional.count) paths")
}

// `--json` is not strictly required to RUN, but the contract is JSON-first; if
// it is absent we still emit JSON (the only mode), matching the web CLI which
// defaults to a JSON body once findings exist. Keep the flag meaningful.
_ = jsonMode

let environment = ProcessInfo.processInfo.environment

// ─── Load rules + config, then scan ──────────────────────────────────────────

let ruleFile: RuleFile
do {
    ruleFile = try RuleEngine.loadRuleFile(explicitPath: explicitRulesPath, env: environment)
} catch {
    fail("\(error)")
}

let config = DetectorConfig.resolve(
    explicitPath: explicitConfigPath,
    scannedPath: targetPath,
    env: environment
)

let overrides = DesignOverrides.resolve(
    explicitPath: explicitOverridesPath,
    scannedPath: targetPath,
    env: environment
)

let engine = RuleEngine(ruleFile: ruleFile, config: config, overrides: overrides)

let findings: [Finding]
do {
    findings = try engine.scan(path: targetPath)
} catch {
    fail("\(error)")
}

// ─── Emit per contract ───────────────────────────────────────────────────────

if findings.isEmpty {
    FileHandle.standardOutput.write(Data("[]\n".utf8))
    exit(ExitCode.clean.rawValue)
}

let json = encodeFindingsJSON(findings)
FileHandle.standardError.write(Data((json + "\n").utf8))
exit(ExitCode.findings.rawValue)
