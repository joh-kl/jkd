# Theme: Auto-Sort 2

macOS, `~/Developer/auto-sort/mac`. The first product in the büro language;
JKD grew out of it. Its own code is `Sources/AutoSort/Theme.swift`.

## What it adds

- **The path ribbon**: the destination as a breadcrumb, every segment a menu.
- **Swipe cards** (Card Sort): slabs that fly off with a stamp; the one
  orchestrated motion in the app.
- Confidence in words (Very likely, Likely, Possible, Unsure).

## Where it differs from JKD today (to migrate)

- **Follows 0.6** (17 Oct 2026): monument titles in Black, square slabs
  and plates with the solid 8 pt shadow, the bar hugging its word, heavy rules
  and numbered sections on Tidy and Review a Vault. Before that, **0.5** (15 Oct 2026): colours and Switzer from this package, sand
  only as 3 pt lines, ink bar and plates, poster titles, the headline-size
  destination name. Effects: blob tracking on first run, chrome on Help and
  "all sorted", dither while Train deals.
- **Signal orange (#FBAE17)** for "new folder" and warnings. JKD would use
  status warning (system orange) with a word.
- **Warm paper (#F2F0EB) and ink (#252317)**: JKD's are neutral white and black.
- Its own copies of `Bar`, `Caption`, `PageTitle`, `Slab`, `PlateButtonStyle`,
  `QuietButtonStyle`: to be replaced by the `JKDDesign` package.
