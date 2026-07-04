import SwiftUI

// DIRTY fixture (token layer). File name ends in `Tokens.swift` so it matches
// the default token-dir glob. raw-hex-outside-tokens / system-font-reflex /
// magic-number-spacing are SUPPRESSED here, but off-palette-hue /
// hue-coded-category / tailwind-palette-hex / gradient-fill STILL FIRE — the
// off-palette and per-category slop lives in the token file itself.
extension Color {
    init(hex: String) { self.init(.sRGB, red: 0, green: 0, blue: 0) }

    // Legitimate blue/neutral tokens — MUST stay clean.
    static let accentBlue = Color(hex: "#336CFF")   // blue, hue ~223
    static let infoBlue = Color(hex: "#2563eb")     // blue, hue ~221
    static let bgLight = Color(hex: "#F7F8FA")       // near-neutral
    static let inkStrong = Color(hex: "#111315")     // near-black

    // Off-palette slop — MUST fire off-palette-hue (and some tailwind-palette-hex).
    static let metabolic = Color(hex: "#f97316")     // orange (tailwind too)
    static let healing = Color(hex: "#14b8a6")       // teal (tailwind too)
    static let glowAccent = Color(hex: "#ec4899")    // pink (tailwind too)
    static let nadAccent = Color(hex: "#9333ea")     // purple (tailwind too)
    static let lavenderLight = Color(hex: "#EDE8FF") // lavender tint

    // Gradient stop tokens — MUST fire gradient-fill (name contains "gradient").
    static let gradientStart = Color(hex: "#f8fafc")
    static let gradientEnd = Color(hex: "#e2e8f0")

    // *Accent token family with differing hues — feeds hue-coded-category.
    static let bpcAccent = Color(hex: "#3b82f6")
    static let tbAccent = Color(hex: "#10b981")
}

enum CompoundType { case nad, glow, other }

// A categorical color scheme type — MUST fire hue-coded-category (type suffix).
struct CompoundColorScheme {
    let primary: Color
    static func forCompound(_ type: CompoundType) -> CompoundColorScheme {
        switch type {
        case .nad:   return CompoundColorScheme(primary: .nadAccent)
        case .glow:  return CompoundColorScheme(primary: .glowAccent)
        case .other: return CompoundColorScheme(primary: .accentBlue)
        }
    }
}
