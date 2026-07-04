import Foundation

/// Color helpers mirroring the web detector's hue/chroma math (getHue,
/// hasChroma) so the iOS off-palette rule classifies hexes the same way.
enum ColorMath {
    struct RGB {
        let r: Int
        let g: Int
        let b: Int
    }

    /// Parse a 3- or 6-digit hex (with or without leading `#`). Returns nil for
    /// anything else (e.g. an 8-digit ARGB or a non-hex token).
    static func parseHex(_ raw: String) -> RGB? {
        var hex = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        if hex.hasPrefix("#") { hex.removeFirst() }
        let digits = hex.lowercased()
        guard digits.allSatisfy({ "0123456789abcdef".contains($0) }) else { return nil }
        if digits.count == 6 {
            guard let value = UInt32(digits, radix: 16) else { return nil }
            return RGB(
                r: Int((value >> 16) & 0xFF),
                g: Int((value >> 8) & 0xFF),
                b: Int(value & 0xFF)
            )
        }
        if digits.count == 3 {
            let chars = Array(digits)
            func channel(_ character: Character) -> Int {
                let single = String(character)
                return Int(single + single, radix: 16) ?? 0
            }
            return RGB(r: channel(chars[0]), g: channel(chars[1]), b: channel(chars[2]))
        }
        return nil
    }

    /// Channel spread, 0–255 (web detector's chroma proxy: max - min).
    static func chroma(_ color: RGB) -> Int {
        max(color.r, color.g, color.b) - min(color.r, color.g, color.b)
    }

    /// HSL hue in degrees [0, 360). Same formula as the web getHue().
    static func hueDegrees(_ color: RGB) -> Int {
        let r = Double(color.r) / 255.0
        let g = Double(color.g) / 255.0
        let b = Double(color.b) / 255.0
        let maxValue = max(r, g, b)
        let minValue = min(r, g, b)
        if maxValue == minValue { return 0 }
        let delta = maxValue - minValue
        var hue: Double
        if maxValue == r {
            hue = ((g - b) / delta).truncatingRemainder(dividingBy: 6)
        } else if maxValue == g {
            hue = (b - r) / delta + 2
        } else {
            hue = (r - g) / delta + 4
        }
        hue *= 60
        if hue < 0 { hue += 360 }
        return Int(hue.rounded())
    }
}
