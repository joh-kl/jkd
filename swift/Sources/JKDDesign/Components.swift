import SwiftUI

// MARK: - The bar

/// The büro wordmark's full-length umlaut: a heavy square rule. With a
/// `progress` it is a progress bar, filling from the left.
public struct Bar: View {
    var progress: Double?
    var color: Color
    public init(progress: Double? = nil, color: Color = JKD.Palette.ink.color) {
        self.progress = progress; self.color = color
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
        .frame(height: JKD.barHeight)
        .accessibilityHidden(progress == nil)
        .accessibilityLabel(progress.map { "\(Int(($0 * 100).rounded())) percent" } ?? "")
    }
}

/// A word under the bar, the bar exactly as wide as the word.
public struct Barred<Content: View>: View {
    var progress: Double?
    var content: Content
    public init(progress: Double? = nil, @ViewBuilder content: () -> Content) {
        self.progress = progress; self.content = content()
    }
    public var body: some View {
        content
            .padding(.top, JKD.barHeight + JKD.Grid.units(1.5))
            .overlay(alignment: .top) { Bar(progress: progress) }
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

/// A page title: display size, lowercase, under the bar, a header for VoiceOver.
public struct PageTitle: View {
    let title: String
    var progress: Double?
    public init(_ title: String, progress: Double? = nil) { self.title = title; self.progress = progress }
    public var body: some View {
        Barred(progress: progress) {
            Text(title.lowercased()).jkdStyle(.display).foregroundStyle(JKD.Palette.ink.color)
        }
        .fixedSize(horizontal: true, vertical: false)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Slab

/// What you act on: raised fill, a hairline, a hard shadow with no blur.
public struct Slab: ViewModifier {
    var lifted: Bool
    public init(lifted: Bool = true) { self.lifted = lifted }
    public func body(content: Content) -> some View {
        content
            .background(JKD.Radius.box.fill(JKD.Palette.raised.color))
            .overlay(JKD.Radius.box.strokeBorder(JKD.Palette.rule.color, lineWidth: 1))
            .background(JKD.Radius.box.fill(lifted ? JKD.Palette.shadow.color : .clear)
                .offset(x: JKD.Grid.units(1.5), y: JKD.Grid.units(1.5)))
    }
}

public extension View {
    func slab(lifted: Bool = true) -> some View { modifier(Slab(lifted: lifted)) }
}

// MARK: - Buttons

/// The one primary action: an ink plate with a hard shadow.
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
                .foregroundStyle(JKD.Palette.onInk.color)
                .padding(.horizontal, JKD.Grid.units(5))
                .padding(.vertical, JKD.Grid.units(2.5))
                .background(JKD.Radius.box.fill(JKD.Palette.ink.color.opacity(enabled ? 1 : 0.35)))
                .overlay(alignment: .top) {
                    Rectangle().fill(JKD.Palette.onInk.color).frame(height: hover && enabled ? 3 : 0)
                }
                .offset(y: configuration.isPressed ? 1 : 0)
                .background(JKD.Radius.box.fill(enabled ? JKD.Palette.shadow.color : .clear)
                    .offset(x: configuration.isPressed ? 1 : 4, y: configuration.isPressed ? 1 : 4))
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
