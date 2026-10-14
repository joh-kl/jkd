---
version: "0.1.0"
name: "JKD"
status: "draft"
description: >
  The JKD house style: Swiss typography on a brutalist base (from the büro
  brand guide), black and white, with halftone, texture and chrome as an
  occasional expressive layer. Themes change values, never names.
colors:
  # Brand palette: black and white until primary and secondary are chosen.
  ink:        { light: "#000000", dark: "#FFFFFF" }   # text, plates, the bar
  page:       { light: "#FFFFFF", dark: "#000000" }   # layer 0
  raised:     { light: "#FFFFFF", dark: "#161616" }   # layer 1: slabs, cards
  sunken:     { light: "#F2F2F0", dark: "#0D0D0D" }   # layer 1 alternative: wells, grouped rows
  secondary:  { light: "#5E5E5A", dark: "#A0A09B" }   # secondary text
  rule:       { light: "#979892", dark: "#4A4A47" }   # hairlines, decorative only
  boundary:   { light: "#000000", dark: "#FFFFFF" }   # an edge that must be seen (3:1 or more)
  shadow:     { light: "#000000@22%", dark: "#979892@35%" }  # hard offset, no blur
  onInk:      { light: "#FFFFFF", dark: "#000000" }   # text on a plate
  hover:      { light: "#000000@6%",  dark: "#FFFFFF@8%" }
  active:     { light: "#000000@12%", dark: "#FFFFFF@16%" }
  primary:    "{colors.ink}"     # placeholder until chosen
  accent:     "{colors.ink}"     # placeholder until chosen
  status:
    danger:   "system red"       # destructive actions, errors
    warning:  "system orange"
    success:  "system green"
    info:     "{colors.ink}"
contrast:   # computed, WCAG 2.x
  ink/page: "21.0:1"
  ink/sunken (light): "18.7:1"
  ink/raised (dark): "18.1:1"
  secondary/page: "6.5:1 light, 8.0:1 dark"
  secondary/sunken or raised: "5.8:1 light, 6.9:1 dark"
  rule/page: "2.9:1 light, 2.4:1 dark (decorative, never the only edge)"
typography:
  family:          # Switzer, Indian Type Foundry, Fontshare licence (credit ITF)
    display: "Switzer Bold"
    text:    "Switzer Regular"
    medium:  "Switzer Medium"
    light:   "Switzer Light"              # 16 pt and up only
    stamp:   "Switzer Black"              # expressive only
    mono:    "Space Mono"                 # technical readouts only (OFL)
    fallback: "Helvetica Neue, Helvetica, Arial"
    web:     "Switzer, \"Helvetica Neue\", Helvetica, Arial, sans-serif"
  scale:   # pt; the iOS text style it scales with
    caption: { size: 11, weight: medium, case: lower, tracking: 0.4, ios: caption2 }
    small:   { size: 13, weight: regular, ios: footnote }    # macOS body
    body:    { size: 17, weight: regular, ios: body }        # iOS body
    lead:    { size: 20, weight: regular, ios: title3 }
    title:   { size: 28, weight: bold, tracking: -0.4, ios: title }
    display: { size: 36, weight: bold, tracking: -0.8, ios: largeTitle }
    poster:  { size: 72, weight: bold, tracking: -2 }
    monument: { size: 108, weight: bold, tracking: -3 }
  leading: { text: 1.35, display: 1.0 }
  numbers: tabular
layout:
  unit: 4          # every value is a multiple
  cube: 8          # b², the büro reference cube, 2 units
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96]
  margin: { compact: 16, regular: 32, print: "25 mm" }
  columns: { compact: 4, regular: 12, print: 12 }
  gutter: { compact: 16, regular: 24, print: "5 mm" }
rounded:
  none: 0          # the bar, rules, images
  subtle: 3        # slabs, plates, fields: cast concrete, not cut paper
  full: "100%"     # only for something round by meaning: a count badge, an avatar
elevation:
  flat: "page"
  slab: "raised + 1 pt rule + hard shadow offset 6 pt"
  plate: "ink fill + hard shadow offset 4 pt"
  float: "system material (menus, popovers, sheets)"
motion:
  quick: 0.12      # hover, press
  standard: 0.3    # a card leaving, a value changing
  spring: { response: 0.3, damping: 0.85 }
  reduceMotion: "cross-fade or none"
---

# JKD

## Overview

JKD is his studio label, and this is its one house style for apps, pages and print.
It is **Swiss typography on a brutalist base**. From the Swiss style: an
objective grid, a grotesk in few sizes, flush left and ragged right, hierarchy
made by size and weight, white space as a material. From the büro brand guide:
the reference cube, heavy bold headings, lowercase captions, raw black and
white, grayscale photography, slabs with hard shadows, and **the bar**, the
wordmark's full-length umlaut. The mark is his round brush logo with the two
horns. Now and then, on purpose, an **expressive layer**:
halftone, paper texture, chrome.

Every product is a **theme** of JKD. A theme may change values (a colour, a
density) and add a signature element of its own; it never renames a token or
breaks a rule below. Detail lives in `references/`.

## Principles

1. **The grid decides.** Every position and gap is a multiple of the unit.
   Nothing is nudged by eye.
2. **Type is the image.** Hierarchy comes from size and weight first, colour
   last. Few sizes, used consistently.
3. **Black and white until colour earns a job.** Colour is a signal, not a
   decoration; status and data may use it, the brand does not yet.
4. **Raw, not rough.** Hard edges, hard shadows, honest materials. The 3 pt
   corner is the only softness.
5. **One expressive moment at most** per screen or page, never on the frequent
   path, never under text that must be read.
6. **Show, don't tell.** Numbers, symbols, piles and pictures before sentences.
7. **Accessible by construction.** Contrast computed, colour never alone,
   every size scales, every command reachable by keyboard.

## Colors

The palette is black and white with one grey family (the büro concrete).
Primary and accent are placeholders that resolve to ink until he picks them;
code must use the token names, so choosing them later changes one file.

- **Layers.** `page` is layer 0. `raised` (slabs, cards) and `sunken` (wells,
  grouped rows) are layer 1. Floating things (menus, popovers, sheets) use the
  platform's own material. Do not nest a slab in a slab.
- **Text** is `ink` or `secondary`, nothing else. Secondary keeps at least
  4.5:1 on every layer (see the contrast table above).
- **Edges.** `rule` is a decorative hairline (2.9:1). An edge a person must see
  to use the thing (a field, a toggle track) uses `boundary` or a fill.
- **Status** colours come from the platform (system red, orange, green) so they
  adapt to Increase Contrast; each one always carries a word or a symbol.
- **Data colours** belong to the content, not the brand: a user's label
  colours, Magic's five mana colours, a chart's series. They are allowed
  anywhere and are never used for chrome or brand elements.

## Typography

One family, **Switzer** (Indian Type Foundry, free under the Fontshare licence
for commercial, app and web use; credit the foundry), a neo-grotesk in the
Swiss line of the guide's Akzidenz Grotesk, cut from Thin to Black. Apps bundle
it; pages load it from Fontshare. If it is missing, Helvetica Neue stands in.
**Space Mono** (open licence) is allowed for one job only: technical readouts,
such as the coordinates of a blob tracker. The full Swiss rules are in
`references/swiss-typography.md`; the short version:

- **Flush left, ragged right.** No justified text, no centred paragraphs.
  Centre only a single line on a poster or an empty state.
- **The scale above, and only it.** Each size has a role; do not invent a 15.
- **Bold for headings, regular for text, medium for captions and labels.**
  Light only at 16 pt and up: thin strokes at small sizes fail people with low
  vision. No bold or italic inside a sentence.
- **Lowercase captions** (11 pt medium, tracked +0.4) for small labels, as the
  guide's page labels are. Buttons and menu items follow the platform's own
  capitalisation.
- **Tight display, open text.** Display sizes at leading 1.0 with negative
  tracking; body text at 1.35.
- **Numbers are tabular** wherever they change or line up.
- **It scales.** On iOS every size is tied to a text style (`relativeTo`), so
  Dynamic Type works; layouts reflow rather than truncate.

## Layout

- **Unit 4, cube 8.** All spacing comes from `layout.spacing`. The cube is the
  büro b² at screen scale; print uses the guide's own b² and 25 mm margins.
- **Columns.** 4 on a phone, 12 on a Mac window and a page, gutters as listed.
  Content aligns to column edges; images bleed to an edge or sit on a column,
  never float in between.
- **Margins** are generous and equal on a page; on a screen they match the
  platform's own list inset (16 on iPhone) so custom views and rows line up.
- **Asymmetry is the default.** Weight goes to the left and the top; the guide
  places the logo 3 cubes from the left and the top.
- **Nothing important below a long list.** Actions go above it or in the
  toolbar (Augury's rule, now a house rule).
- **Many of the same is a pile, not a row** (Augury's rule): three or more
  identical things are drawn as one with a count.

## Elevation & Depth

Mostly flat. A **slab** (raised fill, 1 pt rule, hard shadow offset 6 pt with
no blur) is for the one or two things on a screen that you act on: a card being
sorted, a proposal. A **plate** (ink fill, white text, hard shadow 4 pt) is the
primary action. Everything else sits on the page. In dark mode the hard shadow
is concrete grey, so a slab still reads on black.

## Shapes

- **0**: the bar, rules, images, the page's own edges.
- **3 pt continuous**: slabs, plates, fields, chips. Never larger: a bigger
  radius is a different character.
- **Full**: only where the shape means something (a count, an avatar).

## Components

The shared set, implemented in `swift/` and `web/`. Each has a page in
`references/components.md`.

- **The bar**: a heavy square rule over a word, as wide as the word, about a
  sixth of its cap height at display sizes. Also the progress bar. One per
  screen, over the most important name.
- **The switch**: white or black, both words always visible. White is the
  default. A section may invert for effect, once or twice per page.
- **Caption**: lowercase small label.
- **Page title**: display size, lowercase, under the bar.
- **Slab**, **Plate button**, **Quiet button** (words only, underlined on
  hover), **Chip** (a choice as a button, never a fragile toggle in a sheet).
- **Pile**: many of one thing, as one with a count.

## Expressive layer

Halftone dots, paper grain and chrome, from his own print work. Rules in
`references/expressive.md`: at most one per screen or page; on an empty state,
an onboarding page, a poster, an app icon, an Easter egg or a celebration; never
on the frequent path and never behind body text. All three switch off with
Reduce Transparency or Increase Contrast and are hidden from VoiceOver.

## Voice

Concise and plain; see `references/voice.md`. **No dashes as punctuation.**
Numbers over sentences. Every action keeps its name ("File" makes "Filed").
Errors say what happened and what to do.

## Accessibility

Blocking, not polish; see `references/accessibility.md`. Text 4.5:1, large
text and needed edges 3:1, colour never alone, Dynamic Type, Reduce Motion,
Reduce Transparency, Increase Contrast, full keyboard use, every command in the
menu bar on a Mac, touch targets 44 pt on iOS.

## Adaptations

- A platform without the 3 pt continuous corner uses square corners, never a
  larger round.
- Without Switzer: Helvetica Neue, then Helvetica, then Arial, then the system
  grotesk. Never a geometric or humanist face as a
  stand in.
- A dense tool may halve the spacing steps it uses, but keeps the unit.
- A theme that needs colour before the brand has chosen it uses the status or
  data colours for meaning only, and asks.
