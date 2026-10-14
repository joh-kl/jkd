import Testing
@testable import JKDDesign

/// Every text colour on every surface it can sit on, in light and dark. A new
/// token or pair gets a line here before it is used.
@Suite("Contrast")
struct ContrastTests {
    typealias P = JKD.Palette
    static let surfaces = [("page", P.page), ("raised", P.raised), ("sunken", P.sunken)]

    @Test func textIsReadableOnEveryLayer() {
        for (text, t) in [("ink", P.ink), ("secondary", P.secondary)] {
            for (name, s) in Self.surfaces {
                let light = JKD.contrast(t.light, s.light), dark = JKD.contrast(t.dark, s.dark)
                #expect(light >= 4.5, "\(text) on \(name), light: \(light)")
                #expect(dark >= 4.5, "\(text) on \(name), dark: \(dark)")
            }
        }
    }

    @Test func plateTextIsReadable() {
        #expect(JKD.contrast(P.onInk.light, P.ink.light) >= 4.5)
        #expect(JKD.contrast(P.onInk.dark, P.ink.dark) >= 4.5)
    }

    /// Sand is a thin line only; if anything sits on it, black. Never text on white.
    @Test func sandCarriesBlack() {
        #expect(JKD.Palette.accentLineMax <= 3)
        #expect(JKD.contrast(P.onAccent.light, P.accent.light) >= 4.5)
        #expect(JKD.contrast(P.onAccent.dark, P.accent.dark) >= 4.5)
        func r(_ x: Double) -> Double { (x * 10).rounded() / 10 }
        #expect(r(JKD.contrast(P.onAccent.light, P.accent.light)) == 10.6)
        #expect(r(JKD.contrast(P.accent.light, P.page.light)) == 2.0)      // why it is never text on white
        #expect(JKD.contrast(P.onPrimary.light, P.primary.light) >= 4.5)
        #expect(JKD.contrast(P.onPrimary.dark, P.primary.dark) >= 4.5)
    }

    @Test func neededEdgesReachThreeToOne() {
        for (_, s) in Self.surfaces {
            #expect(JKD.contrast(P.boundary.light, s.light) >= 3)
            #expect(JKD.contrast(P.boundary.dark, s.dark) >= 3)
        }
    }

    /// The figures quoted in DESIGN.md, so the document cannot drift.
    @Test func documentedFiguresHold() {
        func r(_ x: Double) -> Double { (x * 10).rounded() / 10 }
        #expect(r(JKD.contrast(P.secondary.light, P.page.light)) == 6.5)
        #expect(r(JKD.contrast(P.secondary.dark, P.page.dark)) == 8.0)
        #expect(r(JKD.contrast(P.rule.light, P.page.light)) == 2.9)
        #expect(r(JKD.contrast(P.ink.dark, P.raised.dark)) == 18.1)
    }

    @Test func theScaleIsOnTheGrid() {
        // Sizes are free, but every spacing step is a whole number of units.
        for s in JKD.Grid.spacing { #expect(s.truncatingRemainder(dividingBy: JKD.Grid.unit) == 0) }
        #expect(JKD.Style.allCases.map(\.size) == [11, 13, 17, 20, 28, 36, 48, 72, 108])
    }
}
