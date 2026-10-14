// swift-tools-version: 6.0
import PackageDescription

// Renders README images from the real JKDDesign package: `swift run render`.
let package = Package(
    name: "JKDRender",
    platforms: [.macOS(.v14)],
    dependencies: [.package(path: "../../swift")],
    targets: [.executableTarget(name: "render", dependencies: [.product(name: "JKDDesign", package: "swift")])]
)
