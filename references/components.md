# Components

Shared pieces, in `swift/Sources/JKDDesign/Components.swift` and `web/jkd.css`.
Platform controls (lists, menus, toolbars, text fields, pickers on a Mac) stay
platform controls; these are the brand pieces around them.

## The bar

The büro wordmark's full-length umlaut: a heavy square rule laid over a word,
exactly as wide as the word.

- Over the single most important name on a screen (a destination, a page
  title). One per screen.
- Thickness 6 pt over interface text. Over display type it grows with the
  word: about a sixth of the cap height (a 190 px headline carries a 30 px
  bar). A thin bar over a huge word reads as an underline, not as the mark.
- Square ends, always. It is the mark.
- As a **progress bar** it fills from the left in ink over a rule track.
- SwiftUI: `Bar(progress:)`, `Barred { Text(...) }`. CSS: `.jkd-barred`.

## The switch

White or black, as a two part control that always shows both words and fills
the chosen one. Never a hidden chip or an icon alone. A page remembers the
choice; the default is white.

## Inverted section

One section may flip the theme for effect (black on a white page, white on a
black one), when its content is light on dark by nature, such as a tracker's
readout. Use it once or twice per page, never for text the reader must study.

## Caption

Lowercase, 11 pt medium, tracked +0.4, secondary colour. Labels above
groups, counts under titles ("filed 4 · trash 1"). Use a middle dot · to join
short facts, never a dash.

## Page title

Display size (36 pt on Mac, `largeTitle` scaled on iOS), bold, lowercase,
tracking -0.8, under the bar. Marked as a header for VoiceOver. Where the
platform's own navigation title is the native answer (iOS), use that and put
the bar in the content above the first section instead of building a custom bar.

## Slab

What you act on: a card being sorted, the proposal. Raised fill, 1 pt rule,
3 pt corner, hard shadow offset 6 pt with no blur (concrete grey in dark mode).
One or two per screen; do not nest them; do not make every row a slab.

## Plate button

The one primary action: ink fill, onInk text in display weight, 3 pt corner,
hard shadow 4 pt that collapses to 1 pt when pressed. On a Mac a hover draws
a 3 pt rule on the top edge. Disabled: 35% fill, no shadow. One per view.

## Quiet button

Secondary actions beside a plate: medium weight words only, underlined on
hover, dimmed when pressed. No box.

## Chip

A choice as a plain button: 3 pt corner (not a capsule), ink fill with onInk
text when on, sunken fill with ink text when off, a checkmark symbol so on
and off never depend on colour. Used instead of `Toggle` and `Picker` in iOS
sheets, where those proved unreliable in Augury.

## Pile

Augury's rule, now a house rule: three or more identical things are drawn as
one, with two offset copies behind it at 55% opacity, a count on the corner in
an ink circle, and one caption saying how the pile is split. Two is not a pile.
Anything different stands alone. Acting on a pile asks how many first, with
minus, number and plus, starting at nothing.

## Numbers

Counts and money are tabular figures, and change with a numeric content
transition. An unknown value shows "—" (a symbol here, not punctuation), never
a substituted number.
