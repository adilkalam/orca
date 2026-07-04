import SwiftUI

// ios-default-reflex fixture (NOT a token dir). Trips the P0 default-reflex rule
// three ways: a native Menu control init, a .contextMenu default-chrome modifier,
// and the .tint(.blue) accent reflex reaching for the stock system accent instead
// of a brand accent token. Used to prove (a) the rule fires P0, (b) an override
// with matching suppresses+scope mutes it, (c) an override with empty scope mutes
// NOTHING (the accessibility/safety floor).
struct DefaultChromeView: View {
    var body: some View {
        VStack {
            Menu("Options") {
                Button("First") {}
                Button("Second") {}
            }
            Text("Long-press me")
                .contextMenu {
                    Button("Copy") {}
                }
        }
        .tint(.blue)
    }
}
