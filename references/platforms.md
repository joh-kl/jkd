# Platforms

The same tokens everywhere; how they land on each medium.

## Apps (both)

Bundle the Switzer `.otf` files in the app target and list them under
`UIAppFonts` (iOS) or `ATSApplicationFontsPath` (macOS). `JKDDesign` uses
Switzer when it is available and Helvetica Neue when it is not, so an app
without the files still looks right, just less so.

## macOS (SwiftUI)

- `NavigationSplitView`, a sidebar of two levels at most, an inspector where a
  second tool belongs. Toolbars, sidebars and menus keep the system material.
- Margins 32 (4 cubes) in content panes; body text 13 pt (`small`).
- Every command in the menu bar; frequent ones get shortcuts; destructive ones
  never get a bare key.
- Page titles: `PageTitle` in content (the window title stays the system's).
- Hover states: plate gets the top rule, quiet button underlines.

## iOS (SwiftUI)

- Body 17 pt (`body`), every size scaled with Dynamic Type.
- Margin 16, matching the system list inset, so custom views line up with
  rows (Augury's `Metrics.margin`).
- **Controls go in real toolbars** (`topBarLeading`, `topBarTrailing`) and text
  in the navigation subtitle. On iOS 26 the bars float over content and
  anything you position yourself under them loses its taps (Augury, gotcha 5).
- Native navigation titles stay native; the bar goes over the first content
  heading instead.
- In sheets, choices are `Chip`s and buttons, never `Toggle` or `Picker`
  (Augury, gotcha 3).
- Actions above long lists or in the toolbar, never below them.

## Web (HTML, artifacts)

- Load `web/jkd.css`; it defines every token as a custom property, light and
  dark through `prefers-color-scheme`, plus `data-theme="light|dark"` to force.
- Load Switzer from Fontshare
  (`https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,700,800,900&display=swap`)
  and, where readouts appear, Space Mono from Google Fonts. Stack: Switzer,
  "Helvetica Neue", Helvetica, Arial, sans-serif. Sizes in rem from
  the scale (body 1rem = 17px on phones, 16px is fine on desktop text).
- 12 column CSS grid on wide screens, 4 on phones, 16px side margins on phones.
- No horizontal scroll at 320px wide.
- Respect `prefers-reduced-motion`, `prefers-contrast: more` and
  `prefers-reduced-transparency`.

## Print and slides

From the büro guide:

- A4 or A3, page margins **25 mm** on all four sides.
- The reference cube **b²** is 4.7 cm (the stem of the "b" at 108.6 pt); every
  placement is a whole number of cubes; the logo sits 3 b² from the left and
  the top.
- Headings Switzer Bold at 36 pt, ideally white on a dark plate; text
  Switzer Light at 16 or 13 pt (Light is fine in print at these sizes).
- Grayscale architecture or clean studio photography.
- Slides: 16:9, a 12 column grid, one idea per slide, the headline as a stacked
  bold block, a lowercase caption top left as the section label (as on the
  guide's pages), page numbers bottom corner in caption style.
- Export PDFs with fonts embedded; halftone at 45 to 85 lpi.
