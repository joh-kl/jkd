---
version: "0.6.1"
name: "JKD"
status: "draft"
description: >
  The JKD house style: Swiss typography on a brutalist base, black and
  white, with halftone, texture and chrome as an
  occasional expressive layer. Themes change values, never names.
colors:
  # Brand palette: black and white until colour earns a job (0.6.1, see Colors).
  ink:        { light: "#000000", dark: "#FFFFFF" }   # text, plates, the bar
  page:       { light: "#FFFFFF", dark: "#000000" }   # layer 0
  raised:     { light: "#FFFFFF", dark: "#161616" }   # layer 1: slabs, cards
  sunken:     { light: "#F2F2F0", dark: "#0D0D0D" }   # layer 1 alternative: wells, grouped rows
  secondary:  { light: "#5E5E5A", dark: "#A0A09B" }   # secondary text
  rule:       { light: "#979892", dark: "#4A4A47" }   # hairlines, decorative only
  boundary:   { light: "#000000", dark: "#FFFFFF" }   # an edge that must be seen (3:1 or more)
  shadow:     { light: "#000000", dark: "#FFFFFF" }   # solid, offset 8, no blur (0.6)
  onInk:      { light: "#FFFFFF", dark: "#000000" }   # text on a plate
  hover:      { light: "#000000@6%",  dark: "#FFFFFF@8%" }
  active:     { light: "#000000@12%", dark: "#FFFFFF@16%" }
  accent:     "#C9B69B"          # sand (0.5): thin lines only, 3 pt or less, never a fill or a button
  primary:    "{colors.ink}"     # the primary plate stays ink
  status:
    danger:   "system red"       # destructive actions, errors
    warning:  "system orange"
    success:  "system green"
    info:     "{colors.ink}"
  change:     # change marks (0.6.1): a colour with a job, see Colors › When colour earns a job
    goes:     "status.danger at 28% behind ink text, struck through"
    comes:    "status.success at 28% behind ink text, underlined"
contrast:   # computed, WCAG 2.x
  ink/page: "21.0:1"
  ink/sunken (light): "18.7:1"
  ink/raised (dark): "18.1:1"
  secondary/page: "6.5:1 light, 8.0:1 dark"
  secondary/sunken or raised: "5.8:1 light, 6.9:1 dark"
  rule/page: "2.9:1 light, 2.4:1 dark (decorative, never the only edge)"
  ink/goes tint: "14.3:1 light, 15.3:1 dark (on page)"
  ink/comes tint: "16.7:1 light, 12.7:1 dark (on page)"
typography:
  family:          # Switzer, Indian Type Foundry, Fontshare licence (credit ITF)
    display: "Switzer Bold"               # title and display
    black:   "Switzer Black"              # headline, poster, monument, giant (0.6)
    text:    "Switzer Regular"
    medium:  "Switzer Medium"
    light:   "Switzer Light"              # 16 pt and up only
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
    headline: { size: 64, weight: black, tracking: -2.4, ios: largeTitle }   # key numbers, the name that matters (0.6)
    poster:  { size: 72, weight: black, tracking: -2.9 }
    monument: { size: 108, weight: black, tracking: -4.3 }   # page titles in apps (0.6)
    giant:   { size: 160, weight: black, tracking: -6.4 }    # posters, empty states (0.6)
  leading: { text: 1.35, display: 0.9 }
  numbers: tabular
layout:
  unit: 4          # every value is a multiple
  cube: 8          # b², the reference cube, 2 units
  spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96]
  margin: { compact: 16, regular: 32, print: "25 mm" }
  columns: { compact: 4, regular: 12, print: 12 }
  gutter: { compact: 16, regular: 24, print: "5 mm" }
rounded:
  none: 0          # the bar, rules, images
  subtle: 0        # slabs, plates, fields, chips: square since 0.6 (the name stays for themes)
  full: "100%"     # only for something round by meaning: a count badge, an avatar
elevation:
  flat: "page"
  slab: "raised + 2 pt boundary edge + solid shadow offset 8 pt"
  plate: "ink fill + solid shadow offset 8 pt"
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
made by size and weight, white space as a material. Its own on top: the
reference cube, heavy bold headings, lowercase captions, raw black and white,
grayscale photography, slabs with hard shadows, and **the bar**, a full-length
umlaut laid over the word that matters. The mark is his round brush logo with the two
horns. Now and then, on purpose, an **expressive layer**:
halftone, paper texture, chrome.

Every product is a **theme** of JKD. A theme may change values (a colour, a
density) and add a signature element of its own; it never renames a token or
breaks a rule below. Detail lives in `references/`.

## Principles

1. **The grid decides.** Every position and gap is a multiple of the unit.
   Nothing is nudged by eye.
2. **Type is the image, at monument scale.** Hierarchy comes from size and
   weight first, colour last. Since 0.6 apps set page titles at 108 pt in
   Switzer Black and the number or name that matters at the 64 pt headline,
   also Black: exaggerate the top of the hierarchy hard, keep the rest quiet.
   Scale contrast is the whole look.
3. **Black and white until colour earns a job.** Since 0.5 sand is
   the accent, but only as a thin line (3 pt or less): never a button, a fill
   or text. Any other colour has to earn its place by doing a job black and
   white cannot do as well (the test is under Colors). Status, data and change
   colours keep their jobs.
4. **Brutal, not rough** (0.6). Square corners, 2 pt ink edges, solid
   shadows offset 8 pt, heavy rules that make the grid visible. No softness.
5. **One expressive moment at most** per screen or page, never on the frequent
   path, never under text that must be read.
6. **Show, don't tell.** Numbers, symbols, piles and pictures before sentences.
7. **Accessible by construction.** Contrast computed, colour never alone,
   every size scales, every command reachable by keyboard.

## Colors

The palette is black and white with one grey family (concrete), and
since 0.5 one accent: **sand, #C9B69B, only ever a thin line** of 3 pt or
less (a hover line on a plate, a selection edge, an underline, the links in
blob tracking). He vetoed sand buttons and fills. Sand is 2.0:1 on white, so it
is decorative: never text, never the only way something is shown. The primary
plate stays ink.

- **Layers.** `page` is layer 0. `raised` (slabs, cards) and `sunken` (wells,
  grouped rows) are layer 1. Floating things (menus, popovers, sheets) use the
  platform's own material. Do not nest a slab in a slab.
- **Text** is `ink` or `secondary`, nothing else. Secondary keeps at least
  4.5:1 on every layer (see the contrast table above).
- **Edges.** `rule` is a decorative hairline (2.9:1). An edge a person must see
  to use the thing (a field, a toggle track) uses `boundary` or a fill.
- **Change marks** (0.6.1) show what a change removes and adds: a light tint of
  the platform's red behind what goes (struck through) and of its green behind
  what comes (underlined), ink text on both. The first colour admitted by the
  test below; the story is told there.
- **Status** colours come from the platform (system red, orange, green) so they
  adapt to Increase Contrast; each one always carries a word or a symbol.
- **Data colours** belong to the content, not the brand: a user's label
  colours, Magic's five mana colours, a chart's series. They are allowed
  anywhere and are never used for chrome or brand elements.

### When colour earns a job

JKD's default is black and white. Colour gets in only when it passes all four:

1. **It carries information**, not mood. Taking it away would lose something a
   person needs, or make them compare by eye what the screen could show.
2. **Black and white cannot do it as well.** Weight, size, an ink block, a
   rule, a symbol or position were tried first and are worse at this job.
3. **It is never alone.** A second cue (a line style, a symbol, a word) says
   the same, so it works without colour vision and in greyscale print.
4. **It comes from the platform or the content**, not the brand: system
   colours that follow Increase Contrast and dark mode, or the data's own
   colours. The brand stays black and white, with sand as a hairline.

Each admitted colour is written down here with its case, so the next one is
judged against a precedent and not against taste.

#### The worked example: change marks (Auto-Sort, 22 Oct 2026)

**The situation.** Auto-Sort's *Review a Vault* goes through a notes vault and
offers each fix as a card: join lines that a paragraph was broken into, Swiss
spelling (ss for ß), a callout title on its own line. Each card shows the note
*now* and *after* side by side, in black and grey type.

**The problem.** Looking at the real window, Johannes said it was not clear
what was happening. Checked against Nielsen's ten usability heuristics, two
failed: *visibility of system status* (the card did not show what the fix
changes) and *recognition rather than recall* (to see the change, you had to
read both columns and compare them in your head). On a line-join card, the
only difference is a few invisible line breaks; on a spelling card, one letter
in a long sentence.

**What black and white could do.** Bold for the changed words fails: the
after column is already set in medium, and bold inside a sentence breaks the
type rules. An ink block with white text (a reversed plate) marks change but
not its *direction*: what goes and what comes look the same, and an inverted
word in running text reads as a button. Underlines alone are too quiet at
12 pt and already mean a link or the sand highlight.

**The decision.** He was asked which text to highlight, chose "what changes",
and then said: "you are allowed to use a colour here". Red for what goes and
green for what comes is the convention every diff, track-changes view and code
review already uses, so it is read without a key (heuristic: *match between
system and the real world*). It passes the test: it carries the change (1),
black and white could not show direction as well (2), each mark also has a
line style, struck through or underlined, and a line break that goes shows
as ↵ (3), and the colours are the platform's own red and green at a 28% tint,
with ink text that keeps 12.7:1 or more on the page (4). He then made it the model case:
"Black and white until colour earns a job: this is a great example."

**The rules that came with it.** Only on text that shows a change; a key on
the card ("goes", "comes"); the tint behind the text, never the text itself
in colour; never for a button, a status or decoration.

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
- **Black for the top of the hierarchy** (headline, poster, monument, giant;
  0.6), **bold for titles, regular for text, medium for captions and labels.**
  Light only at 16 pt and up: thin strokes at small sizes fail people with low
  vision. No bold or italic inside a sentence.
- **Lowercase captions** (11 pt medium, tracked +0.4) for small labels, as the
  guide's page labels are. Buttons and menu items follow the platform's own
  capitalisation.
- **Tight display, open text.** Display sizes at leading 0.9 with about -4%
  tracking (0.6); body text at 1.35.
- **Numbers are tabular** wherever they change or line up.
- **It scales.** On iOS every size is tied to a text style (`relativeTo`), so
  Dynamic Type works; layouts reflow rather than truncate.

## Layout

- **Unit 4, cube 8.** All spacing comes from `layout.spacing`. The cube is b²
  at screen scale; print uses a b² of its own and 25 mm margins.
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

Mostly flat. A **slab** (raised fill, a 2 pt ink edge, a solid shadow offset
8 pt with no blur, square) is for the one or two things on a screen that you act
on: a card being sorted, a proposal. A **plate** (ink fill, white text, the same
solid 8 pt shadow) is the primary action; pressed, it sinks into its shadow.
Everything else sits on the page. In dark mode the shadow is white.

## Shapes

- **0**: everything since 0.6: the bar, rules, images, slabs, plates, fields,
  chips. (0.5 had a 3 pt corner on slabs and plates; he chose square.)
- **Full**: only where the shape means something (a count, an avatar).
- Platform controls keep their own shapes.

## Components

The shared set, implemented in `swift/` and `web/`. Each has a page in
`references/components.md`.

- **The bar**: a heavy square ink rule over a word, as wide as the word, that
  **hugs** it (0.6): about a sixth of the type size thick and a twelfth away
  (18 pt over a 108 pt title, gap 9; never thinner than 6, never further than
  needed), so bar and word read as one block. Also the progress bar. One per
  screen, over the most important name.
- **The band**: a full-width inverted section (ink, white words) for the
  loudest thing; **up to two per screen** since 0.6. Never for a list.
- **The heavy rule** (0.6): a 6 pt ink rule across the column between
  sections, the grid made visible, as on Swiss posters. Between sections, never
  between rows.
- **The section index** (0.6): a section's number (01, 02, 03) in a solid ink
  square, tabular, Black, opening the section; the page reads as a sequence.
- **The highlight** (0.5): a thin sand underline under the one word that matters.
- **The switch**: white or black, both words always visible. White is the
  default. A section may invert for effect, once or twice per page.
- **Caption**: lowercase small label.
- **Page title**: display size, lowercase, under the bar.
- **Slab**, **Plate button**, **Quiet button** (words only, underlined on
  hover), **Chip** (a choice as a button, never a fragile toggle in a sheet).
- **Pile**: many of one thing, as one with a count.
- **Change marks** (0.6.1): what goes and what comes in a before and after,
  red and green tints with a line style each, plus a key.

## Expressive layer

Halftone dots, paper grain, chrome, and since 0.5 **dither** and **blob
tracking**, from his own print and TouchDesigner work. Chrome is a real texture
(liquid chrome after his reference: diagonal currents, eddies, deep blacks, a
whisper of iridescence) that drifts inside type and leans towards the pointer. Rules in
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

- Corners are square everywhere; a platform control keeps its own shape.
- Without Switzer: Helvetica Neue, then Helvetica, then Arial, then the system
  grotesk. Never a geometric or humanist face as a
  stand in.
- A dense tool may halve the spacing steps it uses, but keeps the unit.
- A theme that needs colour before the brand has chosen it uses the status or
  data colours for meaning only, and asks.
