import Foundation

/// A single design-slop finding. Field set mirrors the web detector's finding
/// schema exactly: { antipattern, name, description, file, line, snippet }.
/// `severity` is carried alongside (P0 = blocking, P1 = advisory) so callers can
/// branch the same way the web `runExternalRules` path does.
struct Finding: Codable, Equatable {
    let antipattern: String
    let name: String
    let description: String
    let severity: String
    let file: String
    let line: Int
    let snippet: String
}

/// Stable, deterministic ordering: by line, then by rule id, then snippet.
/// Determinism matters for the keystone test and for diff-stable gate output.
func sortedFindings(_ findings: [Finding]) -> [Finding] {
    findings.sorted { lhs, rhs in
        if lhs.line != rhs.line { return lhs.line < rhs.line }
        if lhs.antipattern != rhs.antipattern { return lhs.antipattern < rhs.antipattern }
        return lhs.snippet < rhs.snippet
    }
}

func encodeFindingsJSON(_ findings: [Finding]) -> String {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
    guard let data = try? encoder.encode(findings),
          let json = String(data: data, encoding: .utf8) else {
        return "[]"
    }
    return json
}
