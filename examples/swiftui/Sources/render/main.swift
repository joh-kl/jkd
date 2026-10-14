import SwiftUI
import AppKit
import JKDDesign

// Card Sort from Auto-Sort 2, rebuilt with JKDDesign and nothing else, then
// rendered to PNG in light and dark. Run from this folder: `swift run render`.

struct KeyRow: View {
    let key: String, label: String, filled: Bool
    var body: some View {
        HStack(spacing: JKD.Grid.units(3)) {
            Text(key).font(.jkd(.lead).bold())
                .foregroundStyle(filled ? JKD.Palette.onInk.color : JKD.Palette.ink.color)
                .frame(width: 40, height: 40)
                .background(JKD.Radius.box.fill(filled ? JKD.Palette.ink.color : .clear))
                .overlay(JKD.Radius.box.strokeBorder(JKD.Palette.rule.color, lineWidth: filled ? 0 : 1))
                .background(JKD.Radius.box.fill(filled ? JKD.Palette.shadow.color : .clear).offset(x: 3, y: 3))
            Text(label).font(.jkdMedium(.small)).foregroundStyle(JKD.Palette.ink.color)
        }
    }
}

struct CardSort: View {
    var body: some View {
        VStack(alignment: .leading, spacing: JKD.Grid.cubes(3)) {
            HStack(alignment: .bottom, spacing: JKD.Grid.cubes(4)) {
                PageTitle("sort", progress: 0.4)
                VStack(alignment: .leading, spacing: 2) {
                    Text("12 of 20 left").font(.jkd(.lead).bold()).monospacedDigit().foregroundStyle(JKD.Palette.ink.color)
                    Caption("from downloads · filed 6 · trash 1 · left 1")
                }
                Spacer()
                Button("Undo") {}.buttonStyle(.jkdQuiet)
                Button("End") {}.buttonStyle(.jkdQuiet)
            }

            HStack(alignment: .top, spacing: JKD.Grid.cubes(5)) {
                card
                VStack(alignment: .leading, spacing: JKD.Grid.cubes(1.5)) {
                    KeyRow(key: "→", label: "File it", filled: true)
                    KeyRow(key: "←", label: "Next guess", filled: false)
                    KeyRow(key: "↓", label: "To the Trash", filled: false)
                    KeyRow(key: "↑", label: "Leave it here", filled: false)
                    KeyRow(key: "M", label: "Merge instead", filled: false)
                    Caption("1 to 3 pick a guess · space previews · ⌫ takes back")
                        .padding(.top, JKD.Grid.cubes(1))
                }
                .padding(.top, JKD.Grid.cubes(2))
            }
        }
        .padding(JKD.Grid.cubes(5))
        .frame(width: 1000, height: 580, alignment: .topLeading)
        .background(JKD.Palette.page.color)
    }

    var card: some View {
        VStack(alignment: .leading, spacing: JKD.Grid.cubes(1.5)) {
            // A document in halftone stands in for the file's thumbnail.
            ZStack(alignment: .topLeading) {
                Rectangle().fill(JKD.Palette.raised.color)
                Halftone(cell: 5, angle: .degrees(45)) { p in p.y > 0.12 && p.y < 0.2 ? 0.9 : (p.y > 0.3 && Int(p.y * 20) % 2 == 0 ? 0.45 : 0.04) }
                    .padding(10)
            }
            .frame(width: 104, height: 136)
            .overlay(Rectangle().strokeBorder(JKD.Palette.rule.color, lineWidth: 1))
            .frame(maxWidth: .infinity)
            Text("Termin 2, Factors of group performance.pdf").font(.jkdMedium(.small)).foregroundStyle(JKD.Palette.ink.color)
            Caption("guess 1 of 3")
            Text("Work / Univ Studies / 02 Master / MA Semester 5 /")
                .font(.jkd(.small)).foregroundStyle(JKD.Palette.secondary.color)
            Barred {
                Text("Group Dynamics, VL 2").font(.jkd(.title)).tracking(JKD.Style.title.tracking)
                    .foregroundStyle(JKD.Palette.ink.color)
            }
            Text("Likely · same download page as 4 files there")
                .font(.jkd(.small)).foregroundStyle(JKD.Palette.secondary.color)
            Spacer(minLength: 0)
        }
        .padding(JKD.Grid.cubes(3))
        .frame(width: 520, height: 420, alignment: .topLeading)
        .slab()
        .padding(.trailing, 8).padding(.bottom, 8)
    }
}

struct Specimen: View {
    let styles: [(JKD.Style, String)] = [(.display, "Swiss type, raw base."), (.title, "Hierarchy by size and weight"),
        (.lead, "Flush left, ragged right."), (.body, "Every gap is a multiple of four."), (.small, "Black and white until colour earns a job."),
        (.caption, "caption · lowercase · tracked")]
    var body: some View {
        HStack(alignment: .top, spacing: JKD.Grid.cubes(6)) {
            VStack(alignment: .leading, spacing: JKD.Grid.cubes(2)) {
                PageTitle("jkd")
                ForEach(styles, id: \.1) { s, text in
                    HStack(alignment: .firstTextBaseline, spacing: JKD.Grid.cubes(2)) {
                        Text("\(Int(s.size))").font(.jkdMono(.caption)).foregroundStyle(JKD.Palette.secondary.color).frame(width: 28, alignment: .leading)
                        Text(text).jkdStyle(s).foregroundStyle(s == .caption ? JKD.Palette.secondary.color : JKD.Palette.ink.color)
                    }
                }
            }
            VStack(alignment: .leading, spacing: JKD.Grid.cubes(2)) {
                HStack(spacing: JKD.Grid.cubes(1)) {
                    Chip("Foil", isOn: true) {}
                    Chip("Proxy", isOn: false) {}
                }
                HStack(spacing: JKD.Grid.cubes(3)) {
                    Button("File in VL 2") {}.buttonStyle(.jkdPlate)
                    Button("Next guess") {}.buttonStyle(.jkdQuiet)
                }
                Halftone(cell: 7) { p in max(0, 1 - hypot(p.x - 0.6, p.y - 0.45) * 2) }
                    .frame(width: 300, height: 150)
                    .slab()
                Text("chrome").font(.jkd(.poster)).tracking(JKD.Style.poster.tracking).chrome()
            }
        }
        .padding(JKD.Grid.cubes(5))
        .frame(width: 980, height: 520, alignment: .topLeading)
        .background(JKD.Palette.page.color)
    }
}

@MainActor
func render<V: View>(_ view: V, _ name: String, dark: Bool) {
    let out = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "../../assets")
        .appendingPathComponent("\(name)-\(dark ? "dark" : "light").png")
    NSAppearance(named: dark ? .darkAqua : .aqua)!.performAsCurrentDrawingAppearance {
        let r = ImageRenderer(content: view.environment(\.colorScheme, dark ? .dark : .light))
        r.scale = 2
        guard let cg = r.cgImage else { print("could not render \(name)"); return }
        let rep = NSBitmapImageRep(cgImage: cg)
        try? rep.representation(using: .png, properties: [:])?.write(to: out)
        print("wrote \(out.path)")
    }
}

MainActor.assumeIsolated {
    _ = NSApplication.shared
    for dark in [false, true] {
        render(CardSort(), "ui-cardsort", dark: dark)
        render(Specimen(), "ui-specimen", dark: dark)
    }
}
