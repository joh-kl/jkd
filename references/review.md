# Reviewing against JKD

Read `DESIGN.md` and the relevant references first. Look at the real thing
(the running app, the page, the PDF), not only the code.

## Order

1. **Accessibility** (`accessibility.md`): contrast, colour alone, Dynamic
   Type, motion, keyboard, VoiceOver, target sizes.
2. **Platform**: does it behave like a Mac or iPhone app (menus, toolbars,
   sheets, navigation)? Use the apple-design skill's lenses where installed
   (github.com/dickwu/apple-design-skill): purpose, agency, familiarity,
   flexibility, simplicity, craft.
3. **The grid**: every gap on the unit, alignments true, columns respected.
4. **Type**: only scale sizes, hierarchy by size and weight, flush left,
   lowercase captions, tabular numbers, no dashes.
5. **Colour**: black and white until colour earns a job (`DESIGN.md` 2.3: does it pass all four questions?), tokens only, data colours only for data,
   status colours with words.
6. **Components**: one bar, one plate, slabs only where you act, piles for many.
7. **Expressive**: at most one moment, not on the frequent path, switches off
   correctly.
8. **Craft and point of view**: would this screen be recognisably JKD with the
   logo covered? Does it look like a default template?

## Format

For each finding:

- **What**: the element and the problem, concretely.
- **Why**: the rule, citing `DESIGN.md › Section` or `references/file.md ›
  Heading`.
- **Fix**: in the project's own code or file, with the token or component to use.

Then two or three lines on what already works. No dashes.
