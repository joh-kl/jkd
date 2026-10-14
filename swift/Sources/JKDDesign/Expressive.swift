import SwiftUI

// The expressive layer: halftone, grain, chrome. At most one per screen, never
// on the frequent path. Each is hidden from VoiceOver and turns off (or falls
// back to plain ink) with Reduce Transparency or Increase Contrast.

/// Dots on a grid whose size follows a tone, 0 (no dot) to 1 (full cell).
/// The default tone is a gradient from the leading edge to the trailing one.
public struct Halftone: View {
    var cell: CGFloat
    var angle: Angle
    var color: Color
    var tone: @Sendable (CGPoint) -> Double
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast

    /// `tone` receives the position in the view as 0...1 on both axes.
    public init(cell: CGFloat = 6, angle: Angle = .degrees(45), color: Color = JKD.Palette.ink.color,
                tone: @escaping @Sendable (CGPoint) -> Double = { $0.x }) {
        self.cell = cell; self.angle = angle; self.color = color; self.tone = tone
    }

    public var body: some View {
        Canvas { ctx, size in
            guard !reduceTransparency, contrast != .increased, size.width > 0, size.height > 0 else { return }
            let c = CGPoint(x: size.width / 2, y: size.height / 2)
            let reach = (size.width + size.height) / 2 + cell
            let cosA = cos(angle.radians), sinA = sin(angle.radians)
            var path = Path()
            var v = -reach
            while v <= reach {
                var u = -reach
                while u <= reach {
                    let p = CGPoint(x: c.x + u * cosA - v * sinA, y: c.y + u * sinA + v * cosA)
                    if p.x >= -cell, p.y >= -cell, p.x <= size.width + cell, p.y <= size.height + cell {
                        let t = max(0, min(1, tone(CGPoint(x: p.x / size.width, y: p.y / size.height))))
                        // Area follows tone, so the radius follows its square root.
                        let r = cell * 0.5 * sqrt(t) * 1.15
                        if r > 0.2 { path.addEllipse(in: CGRect(x: p.x - r, y: p.y - r, width: 2 * r, height: 2 * r)) }
                    }
                    u += cell
                }
                v += cell
            }
            ctx.fill(path, with: .color(color))
        }
        .accessibilityHidden(true)
        .allowsHitTesting(false)
    }
}

/// Paper grain: fine specks at low opacity. Seeded, so it never shimmers.
public struct Grain: ViewModifier {
    var opacity: Double
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast

    public init(opacity: Double = 0.05) { self.opacity = opacity }

    public func body(content: Content) -> some View {
        content.overlay {
            if !reduceTransparency && contrast != .increased {
                Canvas { ctx, size in
                    var seed: UInt64 = 0x9E37_79B9_7F4A_7C15
                    func next() -> Double {
                        seed &+= 0x9E37_79B9_7F4A_7C15
                        var z = seed
                        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
                        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
                        return Double((z ^ (z >> 31)) >> 11) / Double(1 << 53)
                    }
                    let n = Int(size.width * size.height / 18)
                    var dark = Path(), light = Path()
                    for i in 0..<n {
                        let rect = CGRect(x: next() * size.width, y: next() * size.height, width: 1, height: 1)
                        if i % 2 == 0 { dark.addRect(rect) } else { light.addRect(rect) }
                    }
                    ctx.fill(dark, with: .color(.black.opacity(opacity)))
                    ctx.fill(light, with: .color(.white.opacity(opacity)))
                }
                .accessibilityHidden(true)
                .allowsHitTesting(false)
            }
        }
    }
}

/// Polished metal on large bold type or a mark: greys with a hard horizon.
/// Falls back to plain ink with Increase Contrast or Reduce Transparency.
public struct Chrome: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast
    public init() {}

    public static let gradient = LinearGradient(stops: [
        .init(color: Color(white: 0.97), location: 0),
        .init(color: Color(white: 0.78), location: 0.30),
        .init(color: Color(white: 0.55), location: 0.49),
        .init(color: Color(white: 0.16), location: 0.50),
        .init(color: Color(white: 0.38), location: 0.66),
        .init(color: Color(white: 0.86), location: 0.92),
        .init(color: Color(white: 0.60), location: 1),
    ], startPoint: .top, endPoint: .bottom)

    public func body(content: Content) -> some View {
        if reduceTransparency || contrast == .increased {
            content.foregroundStyle(JKD.Palette.ink.color)
        } else {
            content.foregroundStyle(Chrome.gradient)
        }
    }
}

public extension View {
    /// Paper grain over this view (3 to 6% on light, 4 to 8% on dark).
    func grain(opacity: Double = 0.05) -> some View { modifier(Grain(opacity: opacity)) }
    /// Chrome fill for display type (36 pt and up) or a mark.
    func chrome() -> some View { modifier(Chrome()) }
}
