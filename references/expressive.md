# The expressive layer: halftone, grain, chrome

From his own print work (the JKD assets: halftone generator studies, paper
textures, filters). Büro is the base; these are seasoning.

## When

- **At most one per screen or page.** Two expressive effects compete and both
  lose.
- **Where**: an empty state, onboarding, a celebration (a finished session, a
  milestone), an app icon, a poster, a cover slide, a section opener, an
  Easter egg.
- **Never**: on the frequent path (a list he scrolls daily, a form), behind
  body text, on a control, or as the only carrier of meaning.

## Halftone

Dots on a grid whose size follows a tone: a gradient, a shape, or a photo's
lightness.

- Ink dots on page, or page dots on an ink plate. One colour only.
- Cell size from the unit: 4, 6 or 8 pt on screen; 45 to 85 lpi in print.
- Angle 45° for a classic screen; 0° reads more digital.
- Put type on a halftoned photo only where the dots are smallest under the
  text, and check contrast at the darkest point under each letter.
- SwiftUI: `Halftone(cell:angle:tone:)`. CSS: `.jkd-halftone`.

## Grain

Paper texture: fine random specks at low opacity over a surface.

- 3 to 6% opacity on light, 4 to 8% on dark. If you can see it at arm's length
  it is too strong.
- Over a slab, a plate or a full page; never only behind a single line.
- SwiftUI: `.grain(opacity:)`. CSS: `.jkd-grain` (an SVG noise layer).

## Chrome

Polished metal: a vertical gradient of greys with a hard horizon line, on large
bold type or a mark.

- Display sizes only (36 pt and up) and the icon. Never on text that must be
  read quickly: chrome lowers contrast on purpose.
- Pair with a plain ink version for the same element: Increase Contrast and
  Reduce Transparency switch to it automatically.
- SwiftUI: `.chrome()`. CSS: `.jkd-chrome`.

## Accessibility

All three are decorative: hidden from VoiceOver, and switched off (or swapped
for the plain ink version) with Reduce Transparency or Increase Contrast.
Anything animated (a halftone that breathes, chrome that glints) stops with
Reduce Motion.

## Reacting type

Type that answers scrolling or the pointer, without resizing letters (variable
fonts that grow and shrink are the cliché to avoid). Each idea comes from a
real process, which is what keeps it from being a gimmick. One per screen, with
a caption naming the process. All of them settle into plain, readable type when
nothing moves, and with Reduce Motion they show that settled state only.

- **Blob tracking** (TouchDesigner): every shape on screen is found, boxed in a
  1 pt rule, numbered, and joined to its neighbours, with readouts in Space Mono.
  The detection is real, not drawn on: the boxes follow what the pixels do.
- **Moiré** (Wolfgang Weingart, Basel): the word exists only as a phase shift
  between two dot screens. Aligned, it reads; turned, it dissolves into fringes.
- **Slit-scan** (2001's star gate): the word is cut into thin bands, each a
  moment behind the one above. At rest it is crisp; moved, it smears.
- **Misregistration** (offset printing): a solid plate and a halftone plate of
  the same word, with registration marks. Speed pulls the second plate out of
  register; stopping snaps it back.
- **The composing stick** (hand setting): sorts arrive one at a time, mirrored,
  with the spacing quads visible; then the line is proofed and reads the right
  way round. Scrolling back distributes the type again.
