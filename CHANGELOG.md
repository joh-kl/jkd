# Changelog

## 0.7.0 (22 Oct 2026): soft ink and paper

- **No pure black or white.** Ink #1B1B1A on paper #F5F5F2, and #ECECE8 on
  #161615 in Black: still black and white, contrast near 16:1, without the
  glare of #000 on #FFF at poster sizes. Raised, sunken, secondary, boundary,
  shadow, onInk, hover and active follow; the black hairline is a touch
  lighter. Every figure re-measured and pinned by `swift test`.
- **Colour earns a job** now shows its case in pictures: the four ways tried
  (`assets/colour-job-options.png`) and the fix card
  (`assets/colour-job-card.png`). The case is told without naming a product.
- **Expressive layer**: a table of what each effect is for, with an example
  and a never.
- **Print**: 20 mm at the top and sides, a 25 mm chin at the bottom.
- The palette table is grouped by role. No other projects named in the rules.

## 0.6.2 (22 Oct 2026): the guidelines, rewritten to be read

No value changed. `DESIGN.md` is now a numbered spec that a designer or an AI
agent can read on its own: how to read it (tokens are the source of truth;
MUST, SHOULD, NEVER, MAY), the rules on one page, tables for the palette, the
type scale and the components (what, when, never), the colour test and its
recorded case, a glossary and a yes/no review checklist. Version asides and
first-person history moved here. JKD is described as its own design; the
büro brand guide appears only as a case study among the work. Every README
image was retaken at 0.6.1.

## 0.6.1 (22 Oct 2026)

Black and white **until colour earns a job**, his motto, now written down
with its first case.

- **The test** (`DESIGN.md › Colors › When colour earns a job`): colour gets
  in only when it carries information, black and white cannot do the job as
  well, a second cue says the same, and it comes from the platform or the
  content, not the brand. Each admitted colour is recorded with its story.
- **Change marks**, the first case: in a before and after, a 28% tint of the
  system red behind what goes (struck through) and of the system green behind
  what comes (underlined), ink text, a key. From Auto-Sort's Review a Vault,
  where comparing two grey columns by eye failed two of Nielsen's heuristics.
  `ChangeMark`, `ChangeKey`, `JKD.Palette.goes` and `.comes`;
  `.jkd-goes`, `.jkd-comes`, `.jkd-change-key`. Contrast tested: ink keeps
  12.7:1 or more on both tints, light and dark.
- Principle 3, the README, SKILL.md and the review checklist name the motto.

## 0.6.0 (17 Oct 2026)

Brutal, his request ("more extreme: big fonts, big accent blocks, the chunky
line, more Swiss, the grid, all in"). His choices:

- **Monument type in Black.** Page titles at 108 pt, the key number or name at
  64 pt (was 48), a new 160 pt giant for posters and empty states; headline,
  poster, monument and giant in Switzer Black; display leading 0.9, tracking
  about -4%.
- **Square and hard.** Every corner 0 (was 3 pt on slabs, plates, chips).
  Slabs: a 2 pt ink edge (was a grey hairline) and a solid shadow offset 8 pt
  (was 22% grey at 6). Plates: the same solid shadow; pressed, they sink into it.
- **The bar hugs its word.** Thickness about a sixth of the type size, gap
  about a twelfth (`JKD.bar(forSize:)`, `barGap(forSize:)`, CSS in `em`), so
  bar and word are one block at every size.
- **Structure made visible.** `HeavyRule` / `.jkd-rule-heavy` (6 pt ink across
  the column between sections) and `SectionIndex` / `.jkd-index` (the
  section's number in an ink square). Up to two ink bands per screen.
- Sand stays a thin line only (3 pt or less), as before.

## 0.5.0 (15 Oct 2026): louder, sand as a hairline, three effects

- **Poster scale in apps**: page titles at 72 pt, a new 48 pt headline step,
  the bar 12 pt over them, one inverted **band** per screen, a **highlight**.
- **Sand returns, as a hairline only** (his decision, then his veto on sand
  buttons): `accent` #C9B69B, 3 pt or less, never a fill, a button or text.
  Black on sand 10.6:1, sand on white 2.0:1. The primary plate stays ink,
  with a thin sand line on hover.
- **Chrome** is a real liquid chrome texture after his reference, drifting and
  leaning to the pointer. New **Dither** and **BlobTracking** views (real
  detection). CSS: `.jkd-chrome`, `.jkd-band`, `.jkd-highlight`, `--jkd-headline`.
- Tests: sand pairs, the line limit, the new size in the scale.

## 0.4.0 (14 Oct 2026)

His second round. büro shows the table poster and a logotype exploration
page; ALPS is its logo beside the flyer (the colour palette was not his);
the yellow Technobar Vol. 13 poster joins; four type studies; experiments are
the TouchDesigner fluid contours only, and their index preview plays the loop
halftoned frame by frame; the city map is out. Logos keep light tiles on the
black page. The footer mark is plain chrome, no plate, no outline.

## 0.3.0 (14 Oct 2026)

His feedback on the showcase. Heavier bar at display sizes, a white or black
switch (white by default) and inverted sections, a work section with his real
projects under a halftone screen that lifts on hover, the index showing each
project through the screen, a shorter slit-scan, a system section that says
what each colour and button is for, and chrome redone as reflective tubes on a
black plate.

## 0.2.0 (14 Oct 2026)

Switzer replaces Helvetica Neue as the one family (Helvetica Neue is the
fallback). Space Mono allowed for technical readouts only. The brush mark is
the JKD logo. Reacting type added to the expressive layer: blob tracking,
moiré, slit-scan, misregistration and the composing stick.

## 0.1.0 (14 Oct 2026)

First version. Black and white (sand dropped), Helvetica Neue in eight sizes,
unit 4 and cube 8, corners 0 or 3, the bar, slabs, plates, quiet buttons,
chips, piles, and the expressive layer (halftone, grain, chrome). Swift
package and CSS. Primary and accent colours not chosen yet: they resolve to ink.
