import SwiftUI

// MARK: - The bar

/// The büro wordmark's full-length umlaut: a heavy square rule. With a
/// `progress` it is a progress bar, filling from the left.
public struct Bar: View {
    var progress: Double?
    var color: Color
    var height: CGFloat
    /// Ink; its thickness follows the word under it (`JKD.bar(forSize:)`).
    public init(progress: Double? = nil, color: Color = JKD.Palette.ink.color,
                height: CGFloat = JKD.barHeight) {
        self.progress = progress; self.color = color; self.height = height
    }

    public var body: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Rectangle().fill(progress == nil ? color : JKD.Palette.rule.color)
                if let p = progress {
                    Rectangle().fill(color).frame(width: g.size.width * max(0, min(1, p)))
                        .animation(.easeOut(duration: JKD.Motion.standard), value: p)
                }
            }
        }
        .frame(height: height)
        .accessibilityHidden(progress == nil)
        .accessibilityLabel(progress.map { "\(Int(($0 * 100).rounded())) percent" } ?? "")
    }
}

/// A word under the bar, the bar exactly as wide as the word.
public struct Barred<Content: View>: View {
    var progress: Double?
    var style: JKD.Style
    var content: Content
    /// `style` is the size of the word under it, which sets the bar's weight.
    public init(progress: Double? = nil, style: JKD.Style = .display, @ViewBuilder content: () -> Content) {
        self.progress = progress; self.style = style; self.content = content()
    }
    public var body: some View {
        let h = JKD.bar(for: style)
        content
            .padding(.top, h + JKD.barGap(forSize: style.size))
            .overlay(alignment: .top) { Bar(progress: progress, height: h) }
    }
}

// MARK: - Text

/// A small lowercase label in secondary colour.
public struct Caption: View {
    let text: String
    public init(_ text: String) { self.text = text }
    public var body: some View {
        Text(text).jkdStyle(.caption).foregroundStyle(JKD.Palette.secondary.color)
    }
}

/// A page title: monument size in Black since 0.6 (poster or display where
/// space is short), lowercase, under the bar that hugs it, a header for VoiceOver.
public struct PageTitle: View {
    let title: String
    var progress: Double?
    var style: JKD.Style
    public init(_ title: String, progress: Double? = nil, style: JKD.Style = .monument) {
        self.title = title; self.progress = progress; self.style = style
    }
    public var body: some View {
        Barred(progress: progress, style: style) {
            Text(title.lowercased()).jkdStyle(style).foregroundStyle(JKD.Palette.ink.color)
                .lineLimit(1).minimumScaleFactor(0.5)
        }
        .fixedSize(horizontal: true, vertical: false)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Slab

/// What you act on (0.6): raised fill, a 2 pt ink edge, square, a solid
/// shadow offset 8 pt with no blur.
public struct Slab: ViewModifier {
    var lifted: Bool
    public init(lifted: Bool = true) { self.lifted = lifted }
    public func body(content: Content) -> some View {
        let o = JKD.Structure.shadowOffset
        content
            .background(Rectangle().fill(JKD.Palette.raised.color))
            .overlay(Rectangle().strokeBorder(JKD.Palette.boundary.color, lineWidth: JKD.Structure.slabBorder))
            .background(Rectangle().fill(lifted ? JKD.Palette.shadow.color : .clear).offset(x: o, y: o))
    }
}

public extension View {
    func slab(lifted: Bool = true) -> some View { modifier(Slab(lifted: lifted)) }
}

// MARK: - Buttons

/// The one primary action: an ink plate, white words, a hard shadow; a thin
/// sand line along the top on hover (0.5).
public struct PlateButtonStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { Plate(configuration: configuration) }

    struct Plate: View {
        let configuration: ButtonStyleConfiguration
        @Environment(\.isEnabled) private var enabled
        @State private var hover = false
        var body: some View {
            configuration.label
                .font(.jkd(.small).bold())
                .foregroundStyle(JKD.Palette.onPrimary.color)
                .padding(.horizontal, JKD.Grid.units(5))
                .padding(.vertical, JKD.Grid.units(2.5))
                .background(JKD.Radius.box.fill(JKD.Palette.primary.color.opacity(enabled ? 1 : 0.35)))
                .overlay(alignment: .top) {
                    Rectangle().fill(JKD.Palette.accent.color).frame(height: hover && enabled ? 2 : 0)
                }
                .offset(y: configuration.isPressed ? 1 : 0)
                .background(Rectangle().fill(enabled ? JKD.Palette.shadow.color : .clear)
                    .offset(x: configuration.isPressed ? 2 : JKD.Structure.shadowOffset,
                            y: configuration.isPressed ? 2 : JKD.Structure.shadowOffset))
                .onHover { hover = $0 }
                .animation(.easeOut(duration: JKD.Motion.quick), value: hover)
                .contentShape(Rectangle())
        }
    }
}

/// A secondary action beside a plate: words only, underlined on hover.
public struct QuietButtonStyle: ButtonStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { Quiet(configuration: configuration) }

    struct Quiet: View {
        let configuration: ButtonStyleConfiguration
        @State private var hover = false
        var body: some View {
            configuration.label
                .font(.jkdMedium(.small))
                .foregroundStyle(JKD.Palette.ink.color.opacity(configuration.isPressed ? 0.6 : 1))
                .underline(hover)
                .padding(.vertical, JKD.Grid.units(2))
                .contentShape(Rectangle())
                .onHover { hover = $0 }
        }
    }
}

public extension ButtonStyle where Self == PlateButtonStyle {
    static var jkdPlate: PlateButtonStyle { PlateButtonStyle() }
}
public extension ButtonStyle where Self == QuietButtonStyle {
    static var jkdQuiet: QuietButtonStyle { QuietButtonStyle() }
}

// MARK: - Chip

/// A choice as a plain button. On and off differ by fill *and* by symbol, so
/// colour is never the only signal. Use it in sheets instead of a Toggle.
public struct Chip: View {
    let title: String
    let isOn: Bool
    let action: () -> Void
    public init(_ title: String, isOn: Bool, action: @escaping () -> Void) {
        self.title = title; self.isOn = isOn; self.action = action
    }
    public var body: some View {
        Button(action: action) {
            HStack(spacing: JKD.Grid.units(1.5)) {
                Image(systemName: isOn ? "checkmark" : "plus").font(.jkd(.caption).bold())
                Text(title).font(.jkdMedium(.small))
            }
            .padding(.horizontal, JKD.Grid.units(3))
            .padding(.vertical, JKD.Grid.units(2))
            .foregroundStyle(isOn ? JKD.Palette.onInk.color : JKD.Palette.ink.color)
            .background(JKD.Radius.box.fill(isOn ? JKD.Palette.ink.color : JKD.Palette.sunken.color))
            .contentShape(JKD.Radius.box)
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(isOn ? [.isSelected] : [])
    }
}


// MARK: - 0.5: louder

/// The band: one full-width inverted section per screen, ink with white text
/// (black with white in light mode, white with black in dark). For the loudest
/// thing on the page, never for a list.
public struct Band<Content: View>: View {
    @ViewBuilder public var content: Content
    public init(@ViewBuilder content: () -> Content) { self.content = content() }
    public var body: some View {
        content
            .foregroundStyle(JKD.Palette.onInk.color)
            .padding(.horizontal, JKD.Grid.marginRegular)
            .padding(.vertical, JKD.Grid.units(8))
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(JKD.Palette.ink.color)
    }
}

/// A highlight: a thin sand underline (3 pt) under a word. Decorative, so
/// the word is also the heaviest or largest thing near it.
public struct Highlight: ViewModifier {
    public init() {}
    public func body(content: Content) -> some View {
        content
            .padding(.bottom, JKD.Grid.units(1))
            .overlay(alignment: .bottom) {
                Rectangle().fill(JKD.Palette.accent.color).frame(height: JKD.Palette.accentLineMax)
            }
    }
}

public extension View {
    /// A thin sand underline under the most important word. One per screen.
    func jkdHighlight() -> some View { modifier(Highlight()) }
}


// MARK: - 0.6: brutal structure

/// A heavy ink rule across the column (6 pt): sections divided the way
/// Swiss posters divide them. Decoration with a job: it is the grid made
/// visible. Not for every row: between sections.
public struct HeavyRule: View {
    var weight: CGFloat
    public init(weight: CGFloat = JKD.Structure.rule) { self.weight = weight }
    public var body: some View {
        Rectangle().fill(JKD.Palette.ink.color).frame(height: weight).frame(maxWidth: .infinity)
            .accessibilityHidden(true)
    }
}

/// A section's number in a solid ink square ("01"), opening a section: the
/// page reads as a sequence. The number is tabular, the square on the grid.
public struct SectionIndex: View {
    let number: Int
    var style: JKD.Style
    public init(_ number: Int, style: JKD.Style = .display) { self.number = number; self.style = style }
    public var body: some View {
        let side = (style.size * 1.6 / JKD.Grid.unit).rounded() * JKD.Grid.unit
        Text(String(format: "%02d", number))
            .font(.custom(JKD.face("Switzer-Black", "HelveticaNeue-Bold"), size: style.size, relativeTo: style.textStyle))
            .tracking(style.tracking).monospacedDigit()
            .foregroundStyle(JKD.Palette.onInk.color)
            .frame(width: side, height: side)
            .background(Rectangle().fill(JKD.Palette.ink.color))
            .accessibilityLabel("Section \(number)")
    }
}
