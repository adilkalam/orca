import Foundation

/// Decoded view of one rule entry from detector-rules.swift.json. The detector
/// only needs id / name / severity / description / scope_in_token_dirs +
/// the `detector` payload (whose fields vary per rule kind). The variable
/// `detector` block is decoded lazily into a flexible value tree.
struct RuleSpec: Decodable {
    let id: String
    let name: String
    let severity: String
    let description: String
    /// Provenance reference into the collection (e.g. "banned/colors.md").
    /// Canonical corpus field: `source` (renamed from the legacy `source_rant`).
    let source: String
    let scopeInTokenDirs: Bool
    let detector: JSONValue

    enum CodingKeys: String, CodingKey {
        case id, name, severity, description, source
        case scopeInTokenDirs = "scope_in_token_dirs"
        case detector
    }
}

struct RuleFile: Decodable {
    let version: Int
    let rules: [RuleSpec]
}

/// Minimal JSON value tree so each rule kind can read its own `detector` config
/// without a bespoke Decodable per rule.
enum JSONValue: Decodable {
    case string(String)
    case int(Int)
    case double(Double)
    case bool(Bool)
    case array([JSONValue])
    case object([String: JSONValue])
    case null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Int.self) {
            self = .int(value)
        } else if let value = try? container.decode(Double.self) {
            self = .double(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([JSONValue].self) {
            self = .array(value)
        } else if let value = try? container.decode([String: JSONValue].self) {
            self = .object(value)
        } else {
            self = .null
        }
    }

    subscript(key: String) -> JSONValue? {
        if case let .object(dict) = self { return dict[key] }
        return nil
    }

    var stringValue: String? {
        if case let .string(value) = self { return value }
        return nil
    }

    var intValue: Int? {
        switch self {
        case let .int(value): return value
        case let .double(value): return Int(value)
        default: return nil
        }
    }

    var doubleValue: Double? {
        switch self {
        case let .double(value): return value
        case let .int(value): return Double(value)
        default: return nil
        }
    }

    var stringArray: [String] {
        if case let .array(items) = self {
            return items.compactMap { $0.stringValue }
        }
        return []
    }
}
