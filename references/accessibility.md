# Accessibility

Blocking, not polish. A finding here outranks every style finding.

## Contrast (computed, WCAG 2.x)

- Text under 18 pt (14 pt bold): 4.5:1 or more against its actual background.
- Large text, icons that carry meaning, and edges a person needs to see (a
  field outline, a toggle track, a focus ring): 3:1 or more.
- `rule` (2.9:1 light, 2.4:1 dark) is decorative only. If removing a hairline
  would make a control's boundary unclear, use `boundary` or a fill instead.
- The token pairs are checked by `swift test` in `swift/`. A new colour or a new
  pair gets a test before it is used.
- Text over images, halftone or grain: measure at the darkest (or lightest)
  point under the text.

## Colour never alone

Every status, selection or difference made with colour also has a word, a
symbol or a shape: a checkmark on a chosen chip, "Very likely" beside a
confidence, a symbol on a danger button.

## Type

- iOS: every font is tied to a text style (`relativeTo`) so Dynamic Type works
  up to the accessibility sizes; layouts reflow to one column rather than
  truncating.
- Light weights only at 16 pt and up.
- No text in images unless the same text is available to VoiceOver.

## Motion and materials

- Reduce Motion: springs and flights become cross-fades or nothing; nothing
  loops.
- Reduce Transparency and Increase Contrast: the expressive layer turns off or
  swaps to plain ink; materials become solid.
- Nothing flashes more than three times a second.

## Input

- Mac: every command is in the menu bar with a shortcut where it is frequent;
  everything works from the keyboard; focus is visible.
- iOS: targets at least 44 × 44 pt; a whole row is tappable when it looks
  tappable (`.contentShape`); no gesture is the only way to do something.
- VoiceOver: headers marked, decorative things hidden, custom controls given
  labels, values and traits; counts read as numbers ("12 cards").

## Checking

Test with Increase Contrast, Reduce Motion, the largest Dynamic Type size, dark
mode, and VoiceOver on the main path, before calling a screen done.
