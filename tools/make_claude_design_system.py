"""Build the files of JKD's Claude design system from this repository.

    python3 tools/make_claude_design_system.py OUT/project MARK_BLOB_ID

Writes tokens.json, README.md, the sections, components (previews over
components/bundle.css, which is web/jkd.css minus what tokens.json declares)
and the cover into OUT/project. Fonts are copied by hand from
~/Library/Fonts (Switzer Regular, Medium, Bold, Black). The asset ids (the
brush mark, the two colour-case pictures) are the uploads in the artifact
https://claude.ai/artifact/3VxE639o6QPZcNQuUMM6Gu; publish the folder there
with the Artifact tool, keeping the index's createdOnFiles date.
"""
import json, os, re, sys, datetime

REPO = os.path.expanduser("~/Developer/jkd-design")
OUT = sys.argv[1]  # .../ds/project
MARK_ID = sys.argv[2]
P = lambda *a: os.path.join(OUT, *a)


def write(path, text):
    os.makedirs(os.path.dirname(P(path)), exist_ok=True)
    with open(P(path), "w") as f:
        f.write(text)


def read(path):
    return open(os.path.join(REPO, path)).read()


# ---------------------------------------------------------------- tokens
def c(name, light, dark, usage):
    return {"name": name, "value": {"light": light, "dark": dark}, "usage": usage}


colors = [
    c("base-ink", "#1b1b1a", "#ecece8", "All text, the bar, plates, heavy rules and section indexes. Soft ink, never pure black: 15.8:1 on base-page in White, 15.3:1 in Black."),
    c("base-page", "#f5f5f2", "#161615", "Layer 0, the page background. Soft paper, never pure white."),
    c("base-raised", "#fbfbf9", "#1f1f1e", "Layer 1: slabs and cards. base-ink 16.6:1 in White, 13.9:1 in Black."),
    c("base-sunken", "#eaeae6", "#111110", "Layer 1 alternative: wells, fields, chips when off. base-ink 14.3:1 / 16.0:1."),
    c("text-secondary", "#5a5a56", "#a0a09b", "Quieter text and captions on base-page, base-raised and base-sunken: 6.3:1 / 6.9:1 on page, at least 5.7:1 everywhere."),
    c("text-on-ink", "#f5f5f2", "#161615", "Text on base-ink: plates, bands, chips when on, section indexes. 15.8:1."),
    c("line-rule", "#979892", "#555552", "Decorative hairlines only (2.7:1 / 2.0:1). Never the only edge of a control."),
    c("line-boundary", "{base-ink}", "{base-ink}", "An edge a person must see: slab edges, field outlines, focus rings."),
    c("line-shadow", "{base-ink}", "{base-ink}", "The solid shadow under slabs and plates, offset jkd-offset, no blur."),
    c("accent-sand", "#c9b69b", "#c9b69b", "Sand. Only ever a line of 3 px or less: the highlight under one word, a hover line on a plate, a selection edge. Never a fill, a button or text (1.8:1 on base-page)."),
    c("accent-on-sand", "#1b1b1a", "#1b1b1a", "If anything ever sits on sand, it is ink (8.7:1)."),
    c("state-hover", "rgba(27, 27, 26, 0.06)", "rgba(236, 236, 232, 0.08)", "Hover wash on rows and quiet surfaces."),
    c("state-active", "rgba(27, 27, 26, 0.12)", "rgba(236, 236, 232, 0.16)", "Pressed wash on rows and quiet surfaces."),
    c("action-primary", "{base-ink}", "{base-ink}", "The primary action is an ink plate, never a colour."),
    c("action-on-primary", "{text-on-ink}", "{text-on-ink}", "Words on the primary plate."),
    c("status-danger", "#d70015", "#ff6961", "System red: destructive actions and errors, always with a word or a symbol."),
    c("status-warning", "#c93400", "#ffb340", "System orange: warnings, always with a word or a symbol."),
    c("status-success", "#248a3d", "#30d158", "System green: success, always with a word or a symbol."),
    c("change-goes", "#d7001547", "#ff696147", "Change mark: a 28% tint of status-danger behind text a change removes, base-ink text struck through. base-ink keeps 11.0:1 / 10.6:1."),
    c("change-comes", "#248a3d47", "#30d15847", "Change mark: a 28% tint of status-success behind text a change adds, base-ink text underlined. base-ink keeps 12.8:1 / 8.6:1."),
]
# The repository's CSS names, mapped to the names here (grouped by role).
RENAME = {"jkd-on-primary": "action-on-primary", "jkd-primary": "action-primary", "jkd-on-accent": "accent-on-sand",
          "jkd-on-ink": "text-on-ink", "jkd-ink": "base-ink", "jkd-page": "base-page", "jkd-raised": "base-raised",
          "jkd-sunken": "base-sunken", "jkd-secondary": "text-secondary", "jkd-rule-heavy": "jkd-rule-heavy",
          "jkd-rule": "line-rule", "jkd-boundary": "line-boundary", "jkd-shadow": "line-shadow",
          "jkd-accent-line": "jkd-accent-line", "jkd-accent": "accent-sand", "jkd-hover": "state-hover",
          "jkd-active": "state-active", "jkd-danger": "status-danger", "jkd-warning": "status-warning",
          "jkd-success": "status-success", "jkd-goes": "change-goes", "jkd-comes": "change-comes"}


def renamed(text):
    import re as _re
    return _re.sub(r"--(jkd-[a-z0-9-]+)", lambda m: "--" + RENAME.get(m.group(1), m.group(1)), text)



def style(name, size, weight, lh, ls=None, usage="", sample=None, transform=None):
    s = {"name": name, "fontSize": f"{size}px", "lineHeight": lh, "fontWeight": weight, "usage": usage}
    if ls is not None:
        s["letterSpacing"] = f"{ls}px"
    if sample:
        s["sample"] = sample
    return s


tokens = {
    "name": "JKD",
    "version": 1,
    "color": {"themes": [{"id": "light", "name": "White"}, {"id": "dark", "name": "Black"}], "tokens": colors},
    "type": {
        "fonts": [
            {"family": "Switzer", "file": "fonts/Switzer-Regular.otf", "weight": "400"},
            {"family": "Switzer", "file": "fonts/Switzer-Medium.otf", "weight": "500"},
            {"family": "Switzer", "file": "fonts/Switzer-Bold.otf", "weight": "700"},
            {"family": "Switzer", "file": "fonts/Switzer-Black.otf", "weight": "900"},
        ],
        "families": {
            "sans": "Switzer, \"Helvetica Neue\", Helvetica, Arial, sans-serif",
            "mono": "\"Space Mono\", ui-monospace, Menlo, monospace",
        },
        "groups": [
            {"name": "Display", "family": "sans", "styles": [
                style("giant", 160, 900, 0.88, -6.4, "Posters and empty states.", "jkd"),
                style("monument", 108, 900, 0.9, -4.3, "Page titles in apps, lowercase, under the bar.", "review"),
                style("poster", 72, 900, 0.9, -2.9, "Page titles in narrow windows, posters.", "sort"),
                style("headline", 64, 900, 0.92, -2.4, "The one number or name that matters on a screen.", "12 of 20"),
                style("display", 36, 700, 1.0, -0.8, "Large titles.", "Group Dynamics"),
                style("title", 28, 700, 1.07, -0.4, "Section titles.", "reported, not changed"),
            ]},
            {"name": "Text", "family": "sans", "styles": [
                style("lead", 20, 400, 1.4, None, "An opening paragraph.", "Flush left, ragged right."),
                style("body", 17, 400, 1.41, None, "iOS and web body text.", "Hierarchy by size and weight, colour last."),
                style("small", 13, 400, 1.38, None, "macOS body text, buttons.", "Every gap is a multiple of four."),
                style("caption", 11, 500, 1.45, 0.4, "Lowercase labels and counts, joined by a middle dot.", "filed 4 · trash 1 · left 2"),
            ]},
            {"name": "Readout", "family": "mono", "styles": [
                style("readout", 11, 400, 1.45, None, "Technical readouts only, such as a tracker's coordinates.", "x 412 y 96"),
            ]},
        ],
    },
    "spacing": {"note": "Unit 4, cube 8. Every gap is one of these steps.", "tokens": [
        {"name": f"jkd-s{i + 1}", "value": f"{v}px", "usage": u} for i, (v, u) in enumerate([
            (4, "The unit. Tight pairs: an icon and its label, a bar and its word."),
            (8, "The cube. Between chips, inside small controls."),
            (12, "Plate padding, vertical; chip padding, horizontal."),
            (16, "Phone margins and gutters; paragraph spacing."),
            (24, "Slab padding; plate padding, horizontal; desktop gutters."),
            (32, "Mac content margins; space around a heavy rule."),
            (48, "Above a section title."),
            (64, "Band padding."),
            (96, "Between major parts of a long page."),
        ])]},
    "radius": {"note": "Square everywhere the brand draws; round only where the shape means something.", "tokens": [
        {"name": "jkd-radius", "value": "0px", "usage": "Slabs, plates, fields, chips, images, the bar, rules."},
        {"name": "jkd-round", "value": "9999px", "usage": "Only a count badge or an avatar."},
    ]},
    "shadow": {"note": "Solid, offset, never blurred.", "tokens": [
        {"name": "jkd-slab-shadow", "value": {"light": "8px 8px 0 0 #1b1b1a", "dark": "8px 8px 0 0 #ecece8"},
         "usage": "Under slabs and plates. Pressed plates sink into it (2px left)."},
    ]},
    "line": {"note": "Line weights.", "tokens": [
        {"name": "jkd-bar", "value": "6px", "usage": "The thinnest the bar may be; it follows the type size: about a sixth of it thick, a twelfth away."},
        {"name": "jkd-slab-border", "value": "2px", "usage": "The ink edge of a slab."},
        {"name": "jkd-offset", "value": "8px", "usage": "The offset of the solid shadow."},
        {"name": "jkd-rule-heavy", "value": "6px", "usage": "The heavy rule between sections."},
        {"name": "jkd-accent-line", "value": "3px", "usage": "The thickest a sand line may be."},
    ]},
    "meta": {"source": "github", "repo": "joh-kl/jkd", "ref": "main", "paths": {
        "tokens": ["DESIGN.md", "web/jkd.css", "swift/Sources/JKDDesign/Tokens.swift"],
        "docs": ["DESIGN.md", "references/"], "assets": ["examples/site/assets/jkd-mark.png"]},
        "synced": datetime.date.today().isoformat()},
}
write("tokens.json", json.dumps(tokens, indent=2, ensure_ascii=False) + "\n")

# ---------------------------------------------------------------- bundle.css: jkd.css minus what tokens.json declares
css = read("web/jkd.css")
declared = {k for k, v in RENAME.items() if v != k} | {f"jkd-s{i}" for i in range(1, 10)} | {
    "jkd-radius", "jkd-bar", "jkd-slab-border", "jkd-offset", "jkd-rule-heavy", "jkd-accent-line"}
root_end = css.index("\n}\n", css.index(":root {"))
root = css[:root_end]
for n in declared:
    root = re.sub(r"\s*--" + re.escape(n) + r":[^;]*;(\s*/\*[^*]*\*/)?", "", root)
css = root + css[root_end:]
css = re.sub(r"@media \(prefers-color-scheme: dark\) \{\n  :root:not\(\[data-theme=\"light\"\]\) \{.*?\n  \}\n\}\n", "", css, flags=re.S)
css = re.sub(r":root\[data-theme=\"dark\"\] \{.*?\n\}\n", "", css, flags=re.S)
css = re.sub(r"/\* 0\.5: chrome as a material.*?@media \(prefers-contrast: more\) \{ \.jkd-chrome \{[^}]*\} \}\n", "", css, flags=re.S)
css = css.replace("color-mix(in srgb, var(--jkd-danger) 28%, transparent)", "var(--jkd-goes)")
css = css.replace("color-mix(in srgb, var(--jkd-success) 28%, transparent)", "var(--jkd-comes)")
css = css.replace("/* JKD house style for the web. Values from DESIGN.md; change both together.\n   Light and dark follow the system; data-theme=\"light|dark\" on <html> forces one. */",
                  "/* JKD components for the web. Colours, spacing and line weights come from tokens.css\n   (tokens.json); this sheet holds the type sizes and the component rules. */")
write("components/bundle.css", renamed(css))

# ---------------------------------------------------------------- README (usage rules)
readme = """JKD is the design system of Johannes Klaus Design: Swiss typography on a brutalist base, in black and white. Type is the image, the grid is visible, edges are hard, and colour appears only when it has a job. Use it for apps (macOS, iOS), web pages, slides and print.

**Rule words.** MUST and NEVER are hard rules; SHOULD is the default, departed from only with a stated reason; MAY is allowed. Sizes are in points; on the web 1 pt = 1 px. Load `tokens.css` and `components/bundle.css`; never type a value by hand.

## The rules on one page

1. **The grid decides.** Every gap and position is one of the spacing steps `jkd-s1` (4) to `jkd-s9` (96).
2. **Type is the image.** One family, Switzer, in the styles of this system only. The top of the hierarchy is huge (`monument`, `headline`), everything else quiet.
3. **Black and white until colour earns a job.** See the section *Colour earns a job*.
4. **Sand is a hairline.** `accent-sand` is only ever a line of `jkd-accent-line` (3 px) or less. NEVER a fill, a button or text.
5. **Brutal, not rough.** Corners `jkd-radius` (square), `jkd-slab-border` ink edges, `jkd-slab-shadow` solid shadows, `jkd-rule-heavy` rules between sections.
6. **One bar per screen**, over the most important word (`Barred`).
7. **One primary action per view**, as an ink plate (`PlateButton`).
8. **At most one expressive moment per screen**, never on the path people use every day.
9. **Show, don't tell.** Numbers, symbols and piles before sentences.
10. **Accessible by construction.** Contrast computed, colour never alone, keyboard reachable, every size scales.

## Content fundamentals

- Concise and plain. If a word can go, it goes. Captions are lowercase fragments joined by a middle dot: "filed 4 · trash 1 · left 2".
- NEVER a dash as punctuation: use a colon, a comma, a full stop or a middle dot.
- Numbers over sentences: "3 of 4", not "You own three of the four".
- One name per action: the button says "File", the result says "Filed", History says "filed".
- Errors say what happened and what to do next: "That file is no longer where it was." Confirmations name exactly what will happen, with the count: "Remove 12 cards?"
- Plain words for machinery: "memory", not "embeddings"; "guess", not "inference".
- Page titles and captions lowercase; text in sentence case; buttons and menus follow the platform (title case on a Mac).
- No emoji in interface text.

## Colour

- Soft ink on soft paper: `base-ink` #1B1B1A on `base-page` #F5F5F2 (Black theme: #ECECE8 on #161615). NEVER pure #000 or #FFF: at poster sizes they glare; these still read as black and white at about 16:1.
- Text MUST be `base-ink` or `text-secondary`, on `base-page`, `base-raised` or `base-sunken`. Both keep at least 5.7:1 in both themes.
- `base-page` is layer 0; `base-raised` (slabs) and `base-sunken` (wells, fields, chips) are layer 1. NEVER a slab in a slab.
- `line-rule` is decoration. An edge a person needs (a field, a toggle track, a focus ring) uses `line-boundary` or a fill.
- The primary action is `action-primary` (ink) with `action-on-primary` words, never a colour.
- `status-danger`, `status-warning`, `status-success` are the system's status colours and MUST carry a word or a symbol.
- `change-goes` and `change-comes` are the change marks: tints behind ink text, struck through or underlined, with a key (`ChangeMarks`).
- In code the same colours are `JKD.Palette.<name>` (SwiftUI) and `--jkd-<name>` (the repository's CSS): `base-ink` is `ink`, `text-secondary` is `secondary`, `line-rule` is `rule`, `accent-sand` is `accent`, `change-goes` is `goes`.
- Data colours (a user's labels, a chart's series) belong to the content and NEVER appear on brand elements or controls.
- The system has two themes, White (default) and Black. A page offers both as a two-word switch.

## Typography

- Switzer from Thin to Black; this system carries Regular (400), Medium (500), Bold (700) and Black (900). Fallback: Helvetica Neue, Helvetica, Arial. Space Mono (`readout`) only for technical readouts.
- `giant`, `monument`, `poster` and `headline` in Black at leading 0.9 with tight tracking; `display` and `title` in Bold; `lead`, `body`, `small` in Regular; `caption` in Medium, lowercase, tracked +0.4.
- Flush left, ragged right. NEVER justified; centre only a single line on a poster or an empty state.
- Use only these styles; one screen SHOULD use two or three sizes with big jumps. NEVER bold or italic inside a sentence. Light only at 16 pt and up.
- Numbers that change or line up MUST be tabular. Reading lines 45 to 75 characters.

## Layout

- Unit 4 (`jkd-s1`), cube 8 (`jkd-s2`). Columns: 4 on a phone, 12 on a Mac window, a web page and print.
- Margins: 16 on a phone (`jkd-s4`), 32 in a Mac content pane (`jkd-s6`), 25 mm in print.
- Asymmetric: weight to the left and the top; leave whole columns empty rather than filling to the edge.
- Nothing important below a long list: actions go above it or in the toolbar.
- Three or more identical things are a pile: drawn once, with a count.
- Pages MUST work at 320 pt wide; side-by-side layouts stack when they no longer fit.

## Shape, depth and states

- Square (`jkd-radius`) on everything the brand draws; `jkd-round` only for a count badge or an avatar. Platform controls keep their own shapes.
- Mostly flat. A slab (`base-raised`, `jkd-slab-border` in `line-boundary`, `jkd-slab-shadow`) is for the one or two things a person acts on. A plate (`action-primary` with `jkd-slab-shadow`) is the primary action; pressed, it sinks into its shadow; hover adds a 2 px `accent-sand` line on top.
- Hover and pressed rows wash with `state-hover` and `state-active`. Focus is a 2 px `line-boundary` outline, offset 2.
- In Black the shadow is white.
- Motion: 120 ms for hover and press, 300 ms for a card leaving or a value changing; with Reduce Motion, a cross-fade or nothing.

## Imagery and iconography

- Photography in greyscale. Halftone (dots on a grid, one ink only) is the house treatment for pictures and moments.
- The mark is the round brush logo with two horns (`assets/Logos/jkd-mark.png`), always on a light tile, even on a black page.
- Icons: the platform's own symbol set (SF Symbols on Apple platforms), in `jkd-ink`, medium weight, beside a word wherever space allows. No emoji as icons.

## Expressive layer

Halftone, paper grain, liquid chrome, ordered dither and blob tracking. At most one per screen; MAY appear on an empty state, onboarding, a celebration, an app icon, a poster or a cover; NEVER on the frequent path, behind body text or on a control. Each switches off with Reduce Transparency or Increase Contrast, stops with Reduce Motion, and is hidden from VoiceOver. Which effect for which job (halftone for pictures, grain for print surfaces, chrome for one celebratory word, dither for work in progress, blob tracking for detection, reacting type for section openers): the section *The expressive layer*.

## Glossary

- **The bar**: the system's mark, a heavy square rule laid over a word.
- **Band**: a full-width section in inverted colours.
- **Cube**: the 8 pt reference square.
- **Heavy rule**: a 6 pt ink line between sections.
- **Pile**: many identical things shown as one with a count.
- **Plate**: an ink button with a solid shadow; the primary action.
- **Sand**: the accent `accent-sand`, a thin line only.
- **Slab**: a raised card with an ink edge and a solid shadow; what you act on.
"""
write("README.md", readme)

# ---------------------------------------------------------------- further sections
case = read("DESIGN.md")
start = case.index("### 2.3 When colour earns a job")
end = case.index("## 3. Typography")
section = (case[start:end].replace("### 2.3 When colour earns a job", "# Colour earns a job").replace("### 2.4 Case:", "## Case:")
           .replace("Component: section 6.", "Component: `ChangeMarks`.")
           .replace("(assets/colour-job-options.png)", "(/_blob/1a0bf9f84dc46b370b755d71949ed912)")
           .replace("(assets/colour-job-card.png)", "(/_blob/1c8aa8bbbf3ffcf6468d91df51aa886c)"))
write("colour-earns-a-job.md", section.strip() + "\n")
for name in ["swiss-typography", "expressive", "voice", "accessibility", "platforms", "review"]:
    text = read(f"references/{name}.md")
    if name == "expressive":
        k = case.index("## 7. Expressive layer"); e = case.index("## 8. Words")
        table = case[case.index("| Effect |", k):case.index("\n\n", case.index("| Effect |", k))]
        text = text.replace("Which effect for which job: the table in `DESIGN.md`, section 7.\n", "Which effect for which job:\n\n" + table + "\n")
    write(f"{name}.md", text)

# ---------------------------------------------------------------- components
comp_doc = read("references/components.md")


def doc_for(heading):
    m = re.search(r"^## " + re.escape(heading) + r"\n(.*?)(?=^## |\Z)", comp_doc, flags=re.S | re.M)
    return m.group(1).strip() if m else ""


def preview(group, height, body, extra_css=""):
    return (f'<!-- @dsCard group="{group}" height={height} -->\n<!doctype html>\n<html><head><meta charset="utf-8">\n'
            f'<style>body{{padding:24px;background:var(--jkd-page);color:var(--jkd-ink);font-family:var(--jkd-font)}}{extra_css}</style>\n'
            f'</head><body>\n{body}\n</body></html>\n')


components = {
    "Barred": ("Type and mark", 200, "The bar", """<div style="font:900 var(--jkd-headline)/0.92 var(--jkd-font);letter-spacing:-0.0375em"><span class="jkd-barred">Group Dynamics, VL 2</span></div>
<p class="jkd-caption" style="margin-top:16px">likely · same download page as 4 files there</p>""",
               "Class `.jkd-barred` on an inline element. The consumer provides the one word or name that matters; the bar follows its type size."),
    "PageTitle": ("Type and mark", 210, "Page title", """<h1 class="jkd-page-title jkd-barred" style="margin:0">review</h1>
<p class="jkd-caption">card 1 of 168</p>""",
                  "Class `.jkd-page-title` with `.jkd-barred`. The consumer provides the page name in lowercase. One per page."),
    "Highlight": ("Type and mark", 100, "", """<p style="font:700 var(--jkd-title)/1.07 var(--jkd-font)">the one <span class="jkd-highlight">word</span> that matters</p>""",
                  "A thin sand underline under the most important word. One per screen. Class `.jkd-highlight`; sand stays a line of 3 px or less."),
    "Caption": ("Type and mark", 90, "Caption", """<p class="jkd-caption">filed 4 · trash 1 · left 2</p>
<p class="jkd-caption">in this check</p>""", "Class `.jkd-caption`. Fragments, lowercase, joined by a middle dot."),
    "Band": ("Structure", 200, "Inverted section", """<section class="jkd-band"><div class="jkd-headline">168</div><p class="jkd-caption" style="color:var(--jkd-on-ink)">cards in this check</p></section>""",
             "Class `.jkd-band` on a full-width section. Up to two per screen; never for a list or text to study."),
    "HeavyRule": ("Structure", 120, "Heavy rule", """<p class="jkd-small">the end of one section</p><hr class="jkd-rule-heavy"><p class="jkd-small">the start of the next</p>""",
                  "Element `<hr class=\"jkd-rule-heavy\">` between sections, never between rows."),
    "SectionIndex": ("Structure", 120, "Section index", """<div style="display:flex;align-items:center;gap:12px"><span class="jkd-index">02</span><span style="font:900 var(--jkd-title)/1 var(--jkd-font);letter-spacing:-0.04em">reported, not changed</span></div>""",
                     "Class `.jkd-index` on the section's two-digit number, followed by the section title. Only for pages that are a sequence."),
    "Slab": ("Structure", 260, "Slab", """<div class="jkd-slab" style="max-width:420px">
<p class="jkd-caption" style="margin:0 0 8px">guess 1 of 3</p>
<div style="font:700 var(--jkd-title)/1.07 var(--jkd-font)"><span class="jkd-barred">Group Dynamics, VL 2</span></div>
<p class="jkd-small jkd-secondary" style="margin:12px 0 0">Likely · same download page as 4 files there</p></div>""",
             "Class `.jkd-slab`. The consumer provides the content a person acts on. One or two per screen; never nested."),
    "PlateButton": ("Actions", 120, "Plate button", """<div style="display:flex;gap:24px;align-items:center"><button class="jkd-plate">File It</button><button class="jkd-quiet">Next Guess</button><button class="jkd-plate" disabled>Disabled</button></div>""",
                    "A `<button class=\"jkd-plate\">` for the one primary action per view, beside quiet buttons."),
    "QuietButton": ("Actions", 100, "Quiet button", """<div style="display:flex;gap:24px"><button class="jkd-quiet">Undo</button><button class="jkd-quiet">End</button><button class="jkd-quiet">Show All 12 Changes</button></div>""",
                    "A `<button class=\"jkd-quiet\">`: words only, underlined on hover."),
    "Chip": ("Actions", 100, "Chip", """<div style="display:flex;gap:8px"><button class="jkd-chip" aria-pressed="true">Foil</button><button class="jkd-chip" aria-pressed="false">Proxy</button></div>""",
             "A `<button class=\"jkd-chip\" aria-pressed=\"true|false\">`. On and off differ by fill and by the mark (✓ or +)."),
    "Progress": ("Status", 110, "", """<div class="jkd-progress" style="max-width:360px"><span style="width:40%"></span></div><p class="jkd-caption">card 4 of 10</p>""",
                 "The bar as a progress bar: `.jkd-progress` with a `<span>` whose width is the share done. It fills from the left in ink over a rule track."),
    "ChangeMarks": ("Status", 200, "Change marks", """<div class="jkd-change-key"><del class="jkd-goes">goes</del><ins class="jkd-comes">comes</ins><span>↵ a line break that goes, · where lines join</span></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;font-size:var(--jkd-small)">
<div><p class="jkd-caption">now</p><p class="jkd-secondary">Die <del class="jkd-goes">Straße</del> ist lang<del class="jkd-goes">↵</del><br>und breit.</p></div>
<div><p class="jkd-caption">after</p><p>Die <ins class="jkd-comes">Strasse</ins> ist lang<ins class="jkd-comes">·</ins>und breit.</p></div></div>""",
                    "`<del class=\"jkd-goes\">` and `<ins class=\"jkd-comes\">` inside running text, plus a `.jkd-change-key` on every surface that uses them."),
    "Halftone": ("Expressive", 180, "", """<div class="jkd-slab" style="max-width:300px;padding:0"><div class="jkd-halftone" style="height:150px"></div></div>""",
                 "Class `.jkd-halftone` on a box: ink dots on a grid whose size follows a tone. At most one expressive moment per screen; off with Increase Contrast or Reduce Transparency."),
}
for name, (group, height, heading, body, consumer) in components.items():
    write(f"components/{name}/preview.html", renamed(preview(group, height, body)))
    doc = doc_for(heading) if heading else ""
    first = {
        "Highlight": "A thin sand underline under the one word that matters on a screen.",
        "Progress": "The bar used as a progress bar, filling from the left in ink.",
        "Halftone": "Ink dots on a grid whose size follows a tone, the house treatment for a picture or a moment.",
    }.get(name, "")
    text = (first + "\n\n" if first else "") + (doc + "\n\n" if doc else "") + "**What the consumer provides.** " + consumer + "\n"
    write(f"components/{name}/README.md", text)

# ---------------------------------------------------------------- cover (bare folder, written last)
cover = """<!-- @dsCard height=288 -->
<!doctype html>
<html><head><meta charset="utf-8">
<style>
  html,body{margin:0;background:var(--jkd-page)}
  .cv{position:relative;width:960px;height:288px;background:var(--jkd-page);overflow:hidden}
  svg{position:absolute;left:0;top:0}
  .ink{fill:var(--jkd-ink)} .sunken{fill:var(--jkd-sunken)} .secondary{fill:var(--jkd-secondary)}
  .raised{fill:var(--jkd-raised);stroke:var(--jkd-boundary);stroke-width:var(--jkd-slab-border)}
  .shadow{fill:var(--jkd-shadow)} .sand{fill:var(--jkd-accent)}
  .text{position:absolute;left:32px;bottom:32px;width:440px}
  .bar{height:20px;width:236px;background:var(--jkd-ink);margin-bottom:10px}
  .name{font:900 120px/0.9 var(--jkd-font);letter-spacing:-4.8px;color:var(--jkd-ink);margin:0}
  .tag{font:400 14px/1.4 var(--jkd-font);color:var(--jkd-secondary);margin:12px 0 0}
</style></head><body>
<div class="cv">
<svg width="960" height="288" viewBox="0 0 960 288" aria-hidden="true">
  <!-- blocks: base-ink 192x288 (bleeds top and bottom), base-sunken 160x200, text-secondary 64x64, a base-raised slab 144x96 with jkd-slab-border and jkd-slab-shadow
       arrangement: one tall ink slab with satellites, flush on the 8 pt cube, bleeding off the right edge
       pattern: three heavy rules (jkd-rule-heavy, 6) crossing the blocks, plus one sand hairline (jkd-accent-line, 3): the system draws its grid as heavy rules and keeps sand a line
       steps and radii: jkd-s2 8, jkd-s6 32, jkd-s7 48, jkd-s8 64, jkd-s9 96; jkd-radius 0 everywhere -->
  <rect class="sunken" x="544" y="48" width="160" height="200"/>
  <rect class="ink" x="736" y="0" width="192" height="288"/>
  <rect class="secondary" x="896" y="224" width="64" height="64"/>
  <rect class="shadow" x="584" y="160" width="144" height="96"/>
  <rect class="raised" x="577" y="153" width="142" height="94"/>
  <rect class="ink" x="480" y="96" width="480" height="6"/>
  <rect class="ink" x="512" y="128" width="216" height="6"/>
  <rect class="ink" x="480" y="272" width="256" height="6"/>
  <rect class="sand" x="577" y="236" width="80" height="3"/>
</svg>
<div class="text">
  <div class="bar"></div>
  <p class="name">JKD</p>
  <p class="tag">Swiss typography on a brutalist base, black and white until colour earns a job.</p>
</div>
</div>
</body></html>
"""
write("components/Cover/preview.html", renamed(cover))

# ---------------------------------------------------------------- the index
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
index = {
    "v": 3, "layout": "files", "createdOnFiles": {"v": 1, "at": now},
    "title": "JKD", "namespace": "JKD", "libraries": [],
    "sections": {}, "groups": ["Logos", "Examples"],
    "assetGroups": {"Logos": {"name": "Logos", "tile": "l", "order": ["jkd-mark.png"], "files": {
        "jkd-mark.png": {"name": "jkd-mark.png", "blob": MARK_ID, "size": 28831, "type": "image/png"}}},
        "Examples": {"name": "Examples", "tile": "l", "order": ["colour-job-options.png", "colour-job-card.png"], "files": {
            "colour-job-options.png": {"name": "colour-job-options.png", "blob": "1a0bf9f84dc46b370b755d71949ed912", "size": 173464, "type": "image/png"},
            "colour-job-card.png": {"name": "colour-job-card.png", "blob": "1c8aa8bbbf3ffcf6468d91df51aa886c", "size": 61048, "type": "image/png"}}}},
    "blobs": {}, "docs": {"sections": []},
    "lastChange": {"by": "Johannes Klaus", "at": now, "via": "Claude Code · GitHub joh-kl/jkd", "note": "First version, from the jkd-design repository (0.6.2)."},
}
write("design-system.json", json.dumps(index, indent=2, ensure_ascii=False) + "\n")
write("assets/Examples/README.md", "The colour case in pictures: the four ways tried to show what a fix changes, and a fix card wearing the change marks. Used in the section *Colour earns a job*.\n")
write("assets/Logos/README.md", "The brush mark: a round brush logo with two horns, black on white. Always on a light tile, even on a black page. Single ink: black.\n")
print("done")
