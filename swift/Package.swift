// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "JKDDesign",
    platforms: [.macOS(.v14), .iOS(.v17)],
    products: [.library(name: "JKDDesign", targets: ["JKDDesign"])],
    targets: [
        .target(name: "JKDDesign"),
        .testTarget(name: "JKDDesignTests", dependencies: ["JKDDesign"]),
    ]
)
