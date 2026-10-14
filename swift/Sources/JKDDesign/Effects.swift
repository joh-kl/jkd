import SwiftUI
import CoreGraphics
import CoreText

// The expressive layer, part two (0.5): dither and blob tracking, from his own
// TouchDesigner and print work. Rules in references/expressive.md: at most one
// per screen, never on the frequent path, never under text that must be read,
// off with Reduce Transparency or Increase Contrast, hidden from VoiceOver.

// MARK: - Dither

/// Ordered dither: an image or a tone, turned into black dots on the 8 by 8
/// Bayer pattern, the look of early screens and cheap print. `cell` is the
/// size of one dot in points.
public struct Dither: View {
    public enum Source { case image(CGImage), tone((CGFloat, CGFloat) -> CGFloat) }
    let source: Source
    let cell: CGFloat
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast

    public init(image: CGImage, cell: CGFloat = 3) { source = .image(image); self.cell = cell }
    /// A tone function over the unit square, 0 white to 1 black.
    public init(cell: CGFloat = 3, tone: @escaping (CGFloat, CGFloat) -> CGFloat = { x, _ in x }) {
        source = .tone(tone); self.cell = cell
    }

    static let bayer: [CGFloat] = {
        let m: [Int] = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
                        12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
                        3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
                        15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21]
        return m.map { (CGFloat($0) + 0.5) / 64 }
    }()

    public var body: some View {
        if reduceTransparency || contrast == .increased {
            Rectangle().fill(JKD.Palette.sunken.color).accessibilityHidden(true)
        } else {
            Canvas { ctx, size in
                let cols = Int(size.width / cell), rows = Int(size.height / cell)
                guard cols > 0, rows > 0 else { return }
                let tone = toneGrid(cols, rows)
                var path = Path()
                for r in 0..<rows {
                    for c in 0..<cols where tone[r * cols + c] > Dither.bayer[(r % 8) * 8 + c % 8] {
                        path.addRect(CGRect(x: CGFloat(c) * cell, y: CGFloat(r) * cell, width: cell, height: cell))
                    }
                }
                ctx.fill(path, with: .color(JKD.Palette.ink.color))
            }
            .accessibilityHidden(true)
        }
    }

    /// Darkness 0...1 per cell.
    func toneGrid(_ cols: Int, _ rows: Int) -> [CGFloat] {
        switch source {
        case .tone(let f):
            return (0..<rows).flatMap { r in (0..<cols).map { c in
                f(CGFloat(c) / CGFloat(max(cols - 1, 1)), CGFloat(r) / CGFloat(max(rows - 1, 1))) } }
        case .image(let img):
            var px = [UInt8](repeating: 255, count: cols * rows)
            if let ctx = CGContext(data: &px, width: cols, height: rows, bitsPerComponent: 8, bytesPerRow: cols,
                                   space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue) {
                ctx.interpolationQuality = .medium
                ctx.draw(img, in: CGRect(x: 0, y: 0, width: cols, height: rows))
            }
            // CGContext rows run bottom up
            return (0..<rows).flatMap { r in (0..<cols).map { c in 1 - CGFloat(px[(rows - 1 - r) * cols + c]) / 255 } }
        }
    }
}

// MARK: - Blob tracking

/// Blob tracking, as in TouchDesigner: words drift; a real connected-component
/// pass on a quarter-resolution copy finds every shape, which is then boxed in
/// a 1 pt rule, numbered, joined to the next, with readouts in a mono face.
/// The boxes follow what the pixels do. With Reduce Motion the words stand
/// still and are tracked once.
public struct BlobTracking: View {
    let words: [String]
    let size: CGFloat
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.colorSchemeContrast) private var contrast
    @State private var pointer: CGPoint? = nil

    public init(_ words: [String], size: CGFloat = JKD.Style.poster.size) { self.words = words; self.size = size }

    struct Blob { var rect: CGRect }

    public var body: some View {
        TimelineView(.animation(paused: reduceMotion)) { tl in
            let t = reduceMotion ? 0 : tl.date.timeIntervalSinceReferenceDate
            return Canvas { ctx, sz in
                let placed = layout(in: sz, t: t)
                let ink = JKD.Palette.ink.color
                for (word, origin) in placed {
                    ctx.draw(Text(word).font(.custom(JKD.Style.poster.face, size: size)).foregroundStyle(ink),
                             at: origin, anchor: .bottomLeading)
                }
                guard !(reduceTransparency || contrast == .increased) else { return }
                let blobs = detect(placed, in: sz)
                var links = Path()
                for (i, b) in blobs.enumerated() {
                    ctx.stroke(Path(b.rect.insetBy(dx: -4, dy: -4)), with: .color(ink), lineWidth: 1)
                    let label = String(format: "%02d  x%04.0f y%04.0f", i + 1, b.rect.midX, b.rect.midY)
                    ctx.draw(Text(label).font(.system(size: 10, design: .monospaced)).foregroundStyle(ink),
                             at: CGPoint(x: b.rect.minX - 4, y: b.rect.minY - 8), anchor: .bottomLeading)
                    if i > 0 {
                        links.move(to: CGPoint(x: blobs[i - 1].rect.midX, y: blobs[i - 1].rect.midY))
                        links.addLine(to: CGPoint(x: b.rect.midX, y: b.rect.midY))
                    }
                }
                ctx.stroke(links, with: .color(JKD.Palette.accent.color), lineWidth: 1)
            }
        }
        .onContinuousHover { phase in
            if case .active(let p) = phase { pointer = p } else { pointer = nil }
        }
        .accessibilityHidden(true)
    }

    /// Where each word sits now: a slow drift, pushed away by the pointer.
    func layout(in sz: CGSize, t: Double) -> [(String, CGPoint)] {
        words.enumerated().map { i, w in
            var x = 24 + CGFloat(i) * sz.width * 0.12 + CGFloat(sin(t * 0.7 + Double(i) * 1.9)) * sz.width * 0.03
            var y = sz.height * 0.25 + CGFloat(i + 1) * size * 0.95 + CGFloat(cos(t * 0.55 + Double(i))) * sz.height * 0.012
            if let p = pointer {
                let d = hypot(p.x - x - size, p.y - y + size / 2)
                if d < sz.width * 0.3 { x += (x + size - p.x) / max(d, 1) * (sz.width * 0.3 - d) * 0.25
                                        y += (y - size / 2 - p.y) / max(d, 1) * (sz.width * 0.3 - d) * 0.1 }
            }
            return (w, CGPoint(x: x, y: y))
        }
    }

    /// The real detection: draw the words at a quarter of the size into a
    /// bitmap, flood fill four-neighbour components, return their boxes at
    /// full size. Tiny specks are ignored.
    func detect(_ placed: [(String, CGPoint)], in sz: CGSize) -> [Blob] {
        let s: CGFloat = 4
        let w = max(1, Int(sz.width / s)), h = max(1, Int(sz.height / s))
        var px = [UInt8](repeating: 0, count: w * h)
        guard let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w,
                                  space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue)
        else { return [] }
        ctx.setFillColor(gray: 1, alpha: 1)
        let font = CTFontCreateWithName(JKD.Style.poster.face as CFString, size / s, nil)
        // the canvas sets each word by the bottom of its line box, the bitmap by
        // its baseline: lift the baseline by the descent so the two agree
        let descent = CTFontGetDescent(font)
        for (word, o) in placed {
            let attr = NSAttributedString(string: word, attributes: [.init(kCTFontAttributeName as String): font,
                                                                    .init(kCTForegroundColorFromContextAttributeName as String): true])
            let line = CTLineCreateWithAttributedString(attr)
            ctx.textPosition = CGPoint(x: o.x / s, y: CGFloat(h) - o.y / s + descent)
            CTLineDraw(line, ctx)
        }
        var seen = [Bool](repeating: false, count: w * h)
        var out: [Blob] = []
        var stack: [Int] = []
        for i in 0..<(w * h) where !seen[i] && px[i] > 110 {
            var x0 = Int.max, y0 = Int.max, x1 = -1, y1 = -1, n = 0
            stack.append(i); seen[i] = true
            while let j = stack.popLast() {
                let x = j % w, y = j / w
                n += 1; x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
                for k in [j - 1, j + 1, j - w, j + w] where k >= 0 && k < w * h && !seen[k] && px[k] > 110 {
                    if (k == j - 1 && x == 0) || (k == j + 1 && x == w - 1) { continue }
                    seen[k] = true; stack.append(k)
                }
            }
            if n >= 6 {
                // memory rows run top down, the same way as the canvas
                out.append(Blob(rect: CGRect(x: CGFloat(x0) * s, y: CGFloat(y0) * s,
                                             width: CGFloat(x1 - x0 + 1) * s, height: CGFloat(y1 - y0 + 1) * s)))
            }
        }
        return merge(out, gap: size * 0.2).sorted { $0.rect.minX < $1.rect.minX }
    }

    /// Letters close together are one shape for the tracker: merge boxes that
    /// overlap vertically and sit within `gap` of each other.
    func merge(_ blobs: [Blob], gap: CGFloat) -> [Blob] {
        var out = blobs
        var changed = true
        while changed {
            changed = false
            outer: for i in out.indices {
                for j in out.indices where j > i {
                    let a = out[i].rect, b = out[j].rect
                    let vertical = min(a.maxY, b.maxY) - max(a.minY, b.minY) > min(a.height, b.height) * 0.4
                    if vertical && a.insetBy(dx: -gap, dy: 0).intersects(b) {
                        out[i].rect = a.union(b); out.remove(at: j); changed = true
                        break outer
                    }
                }
            }
        }
        return out
    }
}
