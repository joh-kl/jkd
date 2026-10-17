# Components

Shared pieces, in `swift/Sources/JKDDesign/Components.swift` and `web/jkd.css`.
Platform controls (lists, menus, toolbars, text fields, pickers on a Mac) stay
platform controls; these are the brand pieces around them.

## The bar

The büro wordmark's full-length umlaut: a heavy square rule laid over a word,
exactly as wide as the word.

- Over the single most important name on a screen (a destination, a page
  title). One per screen.
- It **hugs** the word (0.6): about a sixth of the type size thick (never
  under 6 pt) and about a twelfth of it away (never under 4), so bar and word
  read as one block: 18 pt bar and 9 pt gap over a 108 pt title, 11 and 5 over
  a 64 pt headline. A thin bar over a huge word reads as an underline, and a
  wide gap makes it a separate line; both lose the mark.
  `JKD.bar(forSize:)`, `JKD.barGap(forSize:)`; in CSS it is in `em`.
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
readout. Up to two bands per screen since 0.6, never for text the reader must study.

## Heavy rule (0.6)

A 6 pt ink rule across the whole column, between sections: the grid made
visible, the way Swiss posters divide a sheet. Not between rows (rows keep the
hairline or nothing), not more than one between two sections. Decorative to
VoiceOver. SwiftUI `HeavyRule()`, CSS `.jkd-rule-heavy`.

## Section index (0.6)

A section's number, two digits, in a solid ink square that opens the section
("01 what it found", "02 the plan"). Black weight, tabular, the square 1.6 times
the type size on the grid. Use it when a page is a sequence a person goes
through; not for one section alone. SwiftUI `SectionIndex(1)`, CSS `.jkd-index`.

## Caption

Lowercase, 11 pt medium, tracked +0.4, secondary colour. Labels above
groups, counts under titles ("filed 4 · trash 1"). Use a middle dot · to join
short facts, never a dash.

## Page title

Monument size in apps since 0.6 (108 pt Switzer Black on a Mac window, 72
where the window is narrower, `largeTitle` scaled on iOS), lowercase, tracking
-4.3, under the bar that hugs it. Marked as a header for VoiceOver. Where the
platform's own navigation title is the native answer (iOS), use that and put
the bar in the content above the first section instead of building a custom bar.

## Slab

What you act on: a card being sorted, the proposal. Raised fill, a 2 pt ink
edge, square, a solid shadow offset 8 pt with no blur (white in dark mode).
One or two per screen; do not nest them; do not make every row a slab.

## Plate button

The one primary action: ink fill, onInk text in display weight, square, a
solid shadow offset 8 pt; pressed, the plate sinks into it (2 pt left). On a Mac a hover draws
a 3 pt rule on the top edge. Disabled: 35% fill, no shadow. One per view.

## Quiet button

Secondary actions beside a plate: medium weight words only, underlined on
hover, dimmed when pressed. No box.

## Chip

A choice as a plain button: square (not a capsule), ink fill with onInk
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
