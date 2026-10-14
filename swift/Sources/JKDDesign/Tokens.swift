import SwiftUI
#if canImport(UIKit)
import UIKit
#else
import AppKit
#endif

/// The JKD tokens. Values come from `DESIGN.md`; change them there and here
/// together, then run `swift test` (it checks every text pair for contrast).
public enum JKD {

    // MARK: colour

    /// A colour as sRGB hex plus opacity, so tests can compute contrast.
    public struct Swatch: Sendable, Hashable {
        public let hex: UInt32
        public let alpha: Double
        public init(_ hex: UInt32, _ alpha: Double = 1) { self.hex = hex; self.alpha = alpha }

        var r: Double { Double((hex >> 16) & 0xFF) / 255 }
        var g: Double { Double((hex >> 8) & 0xFF) / 255 }
        var b: Double { Double(hex & 0xFF) / 255 }
        #if canImport(UIKit)
        var platform: UIColor { UIColor(red: r, green: g, blue: b, alpha: alpha) }
        #else
        var platform: NSColor { NSColor(srgbRed: r, green: g, blue: b, alpha: alpha) }
        #endif
    }

    /// One token: its light and dark values.
    public struct Token: Sendable, Hashable {
        public let light: Swatch
        public let dark: Swatch
        public init(_ light: Swatch, _ dark: Swatch) { self.light = light; self.dark = dark }

        /// The colour, following light and dark mode (and their high
        /// contrast variants) by itself.
        public var color: Color {
            let l = light, d = dark
            #if canImport(UIKit)
            return Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? d.platform : l.platform })
            #else
            return Color(nsColor: NSColor(name: nil) { a in
                a.bestMatch(from: [.darkAqua, .vibrantDark, .accessibilityHighContrastDarkAqua,
                                   .accessibilityHighContrastVibrantDark]) != nil ? d.platform : l.platform
            })
            #endif
        }
    }

    /// Black and white, with the büro concrete greys, and sand (from the büro
    /// guide's palette) as the accent since 0.5. **Sand is only ever a thin
    /// line, 3 pt or less** (his rule): a hover line, a selection edge, an
    /// underline. Never a button, never a fill, never text (2.0:1 on white);
    /// decorative, so never the only way something is shown.
    public enum Palette {
        public static let ink       = Token(Swatch(0x000000), Swatch(0xFFFFFF))
        public static let page      = Token(Swatch(0xFFFFFF), Swatch(0x000000))
        public static let raised    = Token(Swatch(0xFFFFFF), Swatch(0x161616))
        public static let sunken    = Token(Swatch(0xF2F2F0), Swatch(0x0D0D0D))
        public static let secondary = Token(Swatch(0x5E5E5A), Swatch(0xA0A09B))
        /// Decorative hairlines only (2.9:1 light, 2.4:1 dark).
        public static let rule      = Token(Swatch(0x979892), Swatch(0x4A4A47))
        /// An edge a person must see to use the thing.
        public static let boundary  = Token(Swatch(0x000000), Swatch(0xFFFFFF))
        public static let shadow    = Token(Swatch(0x000000, 0.22), Swatch(0x979892, 0.35))
        public static let onInk     = Token(Swatch(0xFFFFFF), Swatch(0x000000))
        public static let hover     = Token(Swatch(0x000000, 0.06), Swatch(0xFFFFFF, 0.08))
        public static let active    = Token(Swatch(0x000000, 0.12), Swatch(0xFFFFFF, 0.16))
        /// The büro sand, the same in light and dark: thin lines only (3 pt or less).
        public static let accent    = Token(Swatch(0xC9B69B), Swatch(0xC9B69B))
        /// If anything ever sits on sand, it is black (10.6:1).
        public static let onAccent  = Token(Swatch(0x000000), Swatch(0x000000))
        /// The primary action stays an ink plate (no sand buttons, his veto).
        public static let primary   = ink
        public static let onPrimary = onInk
        /// The thickest a sand line may be.
        public static let accentLineMax: CGFloat = 3

        /// Status colours come from the platform, so they follow Increase
        /// Contrast. Always with a word or a symbol.
        #if canImport(UIKit)
        public static let danger  = Color(uiColor: .systemRed)
        public static let warning = Color(uiColor: .systemOrange)
        public static let success = Color(uiColor: .systemGreen)
        #else
        public static let danger  = Color(nsColor: .systemRed)
        public static let warning = Color(nsColor: .systemOrange)
        public static let success = Color(nsColor: .systemGreen)
        #endif
    }

    /// WCAG 2.x contrast ratio of two opaque colours.
    public static func contrast(_ a: Swatch, _ b: Swatch) -> Double {
        func lum(_ s: Swatch) -> Double {
            func c(_ v: Double) -> Double { v <= 0.04045 ? v / 12.92 : pow((v + 0.055) / 1.055, 2.4) }
            return 0.2126 * c(s.r) + 0.7152 * c(s.g) + 0.0722 * c(s.b)
        }
        let x = lum(a), y = lum(b)
        return (max(x, y) + 0.05) / (min(x, y) + 0.05)
    }

    // MARK: grid

    public enum Grid {
        /// Every value is a multiple of this.
        public static let unit: CGFloat = 4
        /// b², the büro reference cube at screen scale.
        public static let cube: CGFloat = 8
        public static let spacing: [CGFloat] = [4, 8, 12, 16, 24, 32, 48, 64, 96]
        /// Matches the iPhone list inset, so custom views line up with rows.
        public static let marginCompact: CGFloat = 16
        /// Content panes in a Mac window.
        public static let marginRegular: CGFloat = 32
        public static let gutterCompact: CGFloat = 16
        public static let gutterRegular: CGFloat = 24
        public static func cubes(_ n: CGFloat) -> CGFloat { n * cube }
        public static func units(_ n: CGFloat) -> CGFloat { n * unit }
    }

    // MARK: shape

    public enum Radius {
        public static let none: CGFloat = 0
        /// Slabs, plates, fields, chips: cast concrete, not cut paper.
        public static let subtle: CGFloat = 3
        public static var box: RoundedRectangle { RoundedRectangle(cornerRadius: subtle, style: .continuous) }
    }

    /// The bar's thickness over small display text (title, display).
    public static let barHeight: CGFloat = 6
    /// The bar over poster and headline type: twice as heavy (0.5).
    public static let barHeavy: CGFloat = 12
    /// The bar for a given size: about a sixth of the cap height, on the grid.
    public static func bar(for style: Style) -> CGFloat {
        switch style {
        case .headline, .poster, .monument: barHeavy
        default: barHeight
        }
    }

    // MARK: motion

    public enum Motion {
        public static let quick: Double = 0.12
        public static let standard: Double = 0.3
        public static let spring = Animation.spring(response: 0.3, dampingFraction: 0.85)
    }

    // MARK: type

    /// The Switzer face if it is installed or bundled, else the stand in.
    public static func face(_ switzer: String, _ fallback: String) -> String {
        #if canImport(UIKit)
        UIFont(name: switzer, size: 12) != nil ? switzer : fallback
        #else
        NSFont(name: switzer, size: 12) != nil ? switzer : fallback
        #endif
    }

    /// The scale. Each size has one role; there is no other size.
    public enum Style: CaseIterable, Sendable {
        case caption, small, body, lead, title, display, headline, poster, monument

        public var size: CGFloat {
            switch self {
            case .caption: 11
            case .small: 13
            case .body: 17
            case .lead: 20
            case .title: 28
            case .display: 36
            case .headline: 48
            case .poster: 72
            case .monument: 108
            }
        }

        /// Switzer when the app has it, Helvetica Neue otherwise.
        public var face: String {
            switch self {
            case .caption: JKD.face("Switzer-Medium", "HelveticaNeue-Medium")
            case .small, .body, .lead: JKD.face("Switzer-Regular", "HelveticaNeue")
            case .title, .display, .headline, .poster, .monument: JKD.face("Switzer-Bold", "HelveticaNeue-Bold")
            }
        }

        /// Points of tracking: tight at display sizes, open on small captions.
        public var tracking: CGFloat {
            switch self {
            case .caption: 0.4
            case .small, .body, .lead: 0
            case .title: -0.4
            case .display: -0.8
            case .headline: -1.2
            case .poster: -2
            case .monument: -3
            }
        }

        /// The text style it scales with under Dynamic Type.
        public var textStyle: Font.TextStyle {
            switch self {
            case .caption: .caption2
            case .small: .footnote
            case .body: .body
            case .lead: .title3
            case .title: .title
            case .display, .headline, .poster, .monument: .largeTitle
            }
        }

        public var lowercased: Bool { self == .caption }
    }
}

public extension Font {
    /// A JKD size, scaling with Dynamic Type.
    static func jkd(_ style: JKD.Style) -> Font {
        .custom(style.face, size: style.size, relativeTo: style.textStyle)
    }
    /// Medium weight at a scale size: labels, rows, quiet buttons.
    static func jkdMedium(_ style: JKD.Style) -> Font {
        .custom(JKD.face("Switzer-Medium", "HelveticaNeue-Medium"), size: style.size, relativeTo: style.textStyle)
    }
    /// Light weight, only at 16 pt and up (thin strokes fail at small sizes).
    static func jkdLight(_ style: JKD.Style) -> Font {
        .custom(JKD.face("Switzer-Light", "HelveticaNeue-Light"), size: max(style.size, 16), relativeTo: style.textStyle)
    }
}

public extension Font {
    /// Space Mono, for technical readouts only (coordinates, ids).
    static func jkdMono(_ style: JKD.Style) -> Font {
        .custom(JKD.face("SpaceMono-Regular", "Menlo-Regular"), size: style.size, relativeTo: style.textStyle)
    }
}

public extension View {
    /// Text in a JKD style: face, size, tracking, and lowercase where the
    /// style says so.
    func jkdStyle(_ style: JKD.Style) -> some View {
        font(.jkd(style)).tracking(style.tracking).textCase(style.lowercased ? .lowercase : nil)
    }
}
