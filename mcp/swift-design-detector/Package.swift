// swift-tools-version:5.9
//
// swift-design-detector — a Bash-invoked local CLI (NOT an MCP server) that
// statically scans a Swift/SwiftUI file for named design slop via a SwiftSyntax
// AST walk. Mirrors the web design-detector CLI contract:
//   detect --json <path>  ->  EXIT 0 + "[]" (clean) | EXIT 2 + findings JSON on STDERR.
//
// Pinned to swift-syntax 603.x to match the host toolchain (Swift 6.3.2; tag
// family 603 == Swift 6.3). See README.md.
import PackageDescription

let package = Package(
    name: "SwiftDesignDetector",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "SwiftDesignDetector", targets: ["SwiftDesignDetector"])
    ],
    dependencies: [
        .package(
            url: "https://github.com/swiftlang/swift-syntax.git",
            "603.0.0"..<"604.0.0"
        )
    ],
    targets: [
        .executableTarget(
            name: "SwiftDesignDetector",
            dependencies: [
                .product(name: "SwiftSyntax", package: "swift-syntax"),
                .product(name: "SwiftParser", package: "swift-syntax")
            ]
        ),
        .testTarget(
            name: "SwiftDesignDetectorTests",
            dependencies: ["SwiftDesignDetector"],
            resources: [
                .copy("Fixtures")
            ]
        )
    ]
)
