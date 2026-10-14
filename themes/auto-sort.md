# Theme: Auto-Sort 2

macOS, `~/Developer/auto-sort/mac`. The first product in the büro language;
JKD grew out of it. Its own code is `Sources/AutoSort/Theme.swift`.

## What it adds

- **The path ribbon**: the destination as a breadcrumb, every segment a menu.
- **Swipe cards** (Card Sort): slabs that fly off with a stamp; the one
  orchestrated motion in the app.
- Confidence in words (Very likely, Likely, Possible, Unsure).

## Where it differs from JKD today (to migrate)

- **Sand (#C9B69B)** is used as a fill in Auto-Sort (the bar, selections, the
  night plate). JKD 0.5 decided: sand is a thin line only. Auto-Sort must
  follow: bar and plates in ink, sand only for hairlines.
- **Signal orange (#FBAE17)** for "new folder" and warnings. JKD would use
  status warning (system orange) with a word.
- **Warm paper (#F2F0EB) and ink (#252317)**: JKD's are neutral white and black.
- Its own copies of `Bar`, `Caption`, `PageTitle`, `Slab`, `PlateButtonStyle`,
  `QuietButtonStyle`: to be replaced by the `JKDDesign` package.
