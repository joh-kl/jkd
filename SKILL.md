---
name: jkd-design
description: The JKD house style (Swiss typography on a brutalist base, black and white, with an occasional halftone, texture or chrome moment) for Johannes's apps, web pages and print. Use when designing, building, restyling or reviewing anything of his that people see: a SwiftUI screen on macOS or iOS, an HTML page or artifact, a slide, a poster, a PDF. Also use when a project's CLAUDE.md points to JKD, or he says "in my style", "JKD", "büro look" or "house style". Not for his clients' own brands.
---

# JKD design

You are applying Johannes's own house style. He is a designer and not a
programmer: explain choices in plain words, and ask (multiple choice) when two
readings of a request lead to different work.

## Read first, in this order

1. `DESIGN.md`: the tokens (front matter) and the rules. Always.
2. The reference for the job:
   - typography or layout: `references/swiss-typography.md`
   - a component: `references/components.md`
   - halftone, grain, chrome: `references/expressive.md`
   - any words on screen or page: `references/voice.md`
   - the platform: `references/platforms.md` (macOS, iOS, web, print)
   - a review: `references/review.md` and `references/accessibility.md`
3. The product's theme, if it has one: `themes/<product>.md`.

## Use the code, do not copy values

- **SwiftUI**: the `JKDDesign` package in `swift/` (add it as a local package
  dependency). `JKD.Palette`, `JKD.Grid`, `JKD.Radius`, `Font.jkd(_:)` and `.jkdStyle(_:)` and the
  components (`Bar`, `Barred`, `Caption`, `PageTitle`, `.slab()`,
  `PlateButtonStyle`, `QuietButtonStyle`, `Chip`) plus the expressive views
  (`Halftone`, `.grain()`, `.chrome()` with the liquid chrome texture,
  `Dither`, `BlobTracking`), plus `Band` and `.jkdHighlight()`.
- **Web**: `web/jkd.css` (custom properties, light and dark, the same
  components as classes). Load it, then write layout.
- **Print and slides**: the values in `DESIGN.md` and `references/platforms.md`.

A hard-coded colour, size or gap in product code is a bug unless it is a data
colour (a user's label, a mana colour, a chart series).

## Non-negotiables

- Black and white, with büro sand (#C9B69B) **only as thin lines, 3 pt or
  less**: never a button, a fill or text (his veto). The primary plate is ink.
- Exaggerate the top of the hierarchy hard (0.6, brutal): page titles at 108 pt
  in Switzer Black, the number or name that matters at the 64 pt headline
  (Black), the bar hugging its word (a sixth of the size thick, a twelfth away),
  up to two ink bands per screen, heavy 6 pt rules and numbered ink blocks
  (01, 02) structuring sections. Keep everything else quiet.
- One family (Switzer; Space Mono only for technical readouts), the scale in `DESIGN.md`, flush left.
- Every gap a multiple of 4; corners square (full round only for a count or
  an avatar).
- At most one expressive moment per screen or page, never on the frequent path.
- No dashes as punctuation in anything a person reads.
- Contrast computed, colour never alone, Dynamic Type, Reduce Motion, keyboard.
- Platform controls stay platform controls; the brand lives in type, colour,
  the bar, slabs and plates.

## When reviewing

Use `references/review.md`. Report each finding as **What**, **Why** (cite the
DESIGN.md section or reference heading), **Fix** (in the project's own code),
ordered accessibility first, then rules, then craft. Say what is good, briefly.

## When the style itself should change

Do not change it inside a product. Propose the change to him, then edit
`DESIGN.md`, the Swift tokens and the CSS together, run `swift test` in
`swift/` (it checks every text colour pair for contrast), and note it in
`CHANGELOG.md`.
