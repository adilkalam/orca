import SwiftUI

// CLEAN fixture (NOT a token dir — every rule is active). It consumes named
// tokens only: no raw hex, no system font, no magic spacing, no gradient, no
// shadow, no over-bouncy spring, no mono reach. Must scan to EXIT=0 / [].
struct CleanView: View {
    var body: some View {
        VStack(spacing: Spacing.medium) {
            Text("Hello")
                .font(TypographyToken.Headline.large)
                .foregroundColor(.primaryText)
            Text("World")
                .font(TypographyToken.Body.large)
                .foregroundColor(.secondaryText)
        }
        .padding(Spacing.large)
        .background(Color.pageBackground)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: true)
    }
}

enum Spacing {
    static let medium: CGFloat = 12
    static let large: CGFloat = 24
}
