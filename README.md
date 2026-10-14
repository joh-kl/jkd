<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/site-hero-dark.png">
  <img alt="The jkd showcase: the brush mark set in halftone, swelling around the pointer, beside a heavy lowercase jkd under the bar." src="assets/site-hero.png">
</picture>

# JKD design

The house style of Johannes Klaus Design: **Swiss typography on a brutalist
base** (from the büro brand guide), set in **Switzer**, black and white, with an
occasional halftone, texture or chrome moment. One system for his apps (macOS,
iOS), web pages and print, packaged as a Claude Code skill.

| File | What |
| --- | --- |
| `SKILL.md` | The skill: when to use it, what to read, the non-negotiables |
| `DESIGN.md` | The spec: tokens up front, rules below. The single source of truth |
| `references/` | Swiss typography, components, expressive layer and reacting type, voice, accessibility, platforms, review |
| `themes/` | Each product's additions and what still differs (Auto-Sort, Augury) |
| `swift/` | `JKDDesign`, a Swift package of tokens and components for macOS 14+ and iOS 17+ |
| `web/jkd.css` | The same tokens and components for HTML |
| `examples/site/` | The showcase site below, built only from `jkd.css` |
| `examples/swiftui/` | Renders the app images below from the real Swift package |

## The showcase site

A portfolio in the making, built from the system and nothing else. White by
default with a white or black switch; the bar at the top is the scroll
progress; **G** shows the 12 column grid; the brush mark is set in halftone
and swells around the pointer.

| | |
| --- | --- |
| ![The index: project titles in bold, each showing its project through a halftone screen at the pointer](assets/site-index.png) | ![The grid overlay on the hero, twelve columns](assets/site-grid.png) |

### The work

His projects in chapters on the grid. Every piece wears a halftone screen
until you hover, focus or tap it; then the screen lifts and the original
shows.

| | |
| --- | --- |
| ![Identity: the büro guide pages, one lifted to show the original](assets/site-work-identity.png) | ![Posters: four Technobar club night posters](assets/site-work-posters.png) |
| ![Interfaces: Vibe Catcher, the city map, Auto-Sort](assets/site-work-interfaces.png) | ![Logos on light tiles, under the screen](assets/site-work-logos.png) |

### Lab: type that reacts

Five real processes, and not one letter changes size. Each settles into plain,
readable type when nothing moves.

| | |
| --- | --- |
| ![Blob tracking: see what moves, every letter boxed, numbered and joined](assets/site-blob.png) **Blob tracking**, the TouchDesigner look. The detection is real: a connected component pass on the pixels, every frame. | ![Moiré: the word visible only as a phase shift between two dot screens](assets/site-moire.png) **Moiré**, after Wolfgang Weingart. The word exists only as a shift between two dot screens. |
| ![Slit-scan: slit scan, sheared as the bands lag behind](assets/site-slit.png) **Slit-scan**. Each band is a moment behind the one above; scroll fast and it smears. | ![Misregistration: two plates, the halftone plate off register, with registration marks](assets/site-misreg.png) **Misregistration**. Speed pulls the halftone plate off register; a spring brings it home. |
| ![The composing stick: sorts set mirrored, right to left, and the proof below](assets/site-stick.png) **The composing stick**. Sorts arrive mirrored, quads in grey; then the proof reads. | ![Blob tracking inverted: black text on white when the page is black](assets/site-blob-dark.png) Blob tracking is an inverted section: black on the white page, white on the black one. |

| | |
| --- | --- |
| ![The system: the white or black switch, the Switzer scale, and each colour and button with what it is for](assets/site-system.png) | ![Footer: the brush mark in liquid chrome on a black plate, beside Johannes Klaus Design](assets/site-footer.png) |

Run it: from the repository folder, `python3 -m http.server 8765`, then open
`http://127.0.0.1:8765/examples/site/`. Opening `examples/site/index.html` directly
works too. `?shot=blob` (or `hero`, `work`, `showcase`, `moire`, `slit`,
`misreg`, `stick`, `system`, `footer`) freezes the state used for these images;
add `&theme=dark` for black, `&chapter=posters` and `&open=1` for the work.

## In an app

Card Sort from Auto-Sort 2, rebuilt with `JKDDesign` alone and rendered by
`examples/swiftui` (`swift run render`):

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/ui-cardsort-dark.png">
  <img alt="Card Sort in JKD: a slab card with the destination under the bar, and the key column with an ink plate for File it." src="assets/ui-cardsort-light.png">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/ui-specimen-dark.png">
  <img alt="The specimen: the type scale in Switzer, chips, plate and quiet buttons, a halftone slab and chrome type." src="assets/ui-specimen-light.png">
</picture>

## Install as a skill

```
ln -s ~/Developer/jkd-design ~/.claude/skills/jkd-design
```

Then any Claude Code session can use it; a project's CLAUDE.md can say
"Follow the jkd-design skill" to make it the default.

## Use in an app

Xcode: File, Add Package Dependencies, Add Local, pick `swift/`. Then
`import JKDDesign`. Bundle the Switzer files in the app; without them the
package falls back to Helvetica Neue.

## Change the style

Edit `DESIGN.md`, `swift/Sources/JKDDesign/Tokens.swift` and `web/jkd.css`
together, run `swift test` in `swift/` (contrast of every text pair), retake
the images, and add a line to `CHANGELOG.md`.

## Credits and sources

Switzer by Indian Type Foundry (Fontshare licence). Space Mono by Colophon
Foundry (Open Font License), for readouts only. The büro Brand Development
Guide and the brush mark are his own. The Swiss International Typographic
Style, Wolfgang Weingart's work in Basel, Augury's interface rules, and the
apple-design skill's review lenses shaped the rest. Two confidential design
documents he has access to were read for structure only; nothing from them is
in this repository, and nothing may be added.
