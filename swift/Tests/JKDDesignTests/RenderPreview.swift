import Testing
import SwiftUI
@testable import JKDDesign

/// Renders the expressive views to PNGs when JKD_PREVIEW_DIR is set, so they
/// can be looked at without opening an app. Does nothing otherwise.
@Suite("Previews")
struct RenderPreview {
    @MainActor @Test func renderEffects() throws {
        guard let dir = ProcessInfo.processInfo.environment["JKD_PREVIEW_DIR"] else { return }
        func save(_ v: some View, _ name: String) {
            let r = ImageRenderer(content: v.background(Color.white).environment(\.colorScheme, .light))
            r.scale = 2
            if let img = r.cgImage {
                let rep = NSBitmapImageRep(cgImage: img)
                try? rep.representation(using: .png, properties: [:])?.write(to: URL(fileURLWithPath: dir + "/" + name + ".png"))
            }
        }
        save(Text("a/s").font(.custom(JKD.Style.poster.face, size: 160).weight(.black)).chrome().padding(24), "chrome")
        save(Dither(cell: 4) { x, y in x * 0.9 + 0.1 * y }.frame(width: 480, height: 160), "dither")
        save(BlobTracking(["see", "what", "moves"], size: 64).frame(width: 520, height: 300), "blobs")
        save(VStack(alignment: .leading, spacing: 16) {
            PageTitle("inbox")
            Text("File in VL 2").padding(.horizontal, 2).jkdHighlight()
            Button("File in VL 2") {}.buttonStyle(PlateButtonStyle())
        }.padding(32), "louder")
    }
}
