# Theme: Augury

iOS, `~/Documents/DnD & Games/Augury MTG/Augury`. A Magic: The Gathering
collection scanner. Today it uses the system look; he asked for it to be
migrated to JKD in a later session.

## Keep (data colours and its own rules)

- The five **mana colours** and the **label colours** the user picks are data
  colours: they stay, everywhere they mean something.
- Card artwork is content: never halftoned or tinted on the frequent path.
- Its rules already in JKD: piles, nothing below a long list, chips in sheets,
  controls in real toolbars, `Plural.cards`, no dashes.
- `Metrics` (unit 4, margin 16) matches JKD's grid already.

## Migration plan (later session)

1. Add `JKDDesign` as a local package; replace `Metrics` with `JKD.Grid`.
2. Type: Switzer (bundled) through `Font.jkd`, tied to text styles for Dynamic
   Type. Check every screen at the largest accessibility size.
3. Colour: accent from blue to ink; chips from capsules to 3 pt corners with
   the checkmark kept.
4. One bar per screen over the main heading in content (navigation titles stay
   native).
5. Expressive moments: the Easter egg, the scan session summary, the empty
   collection. Nowhere in the scanner itself.
6. Read Augury's CLAUDE.md gotchas before touching any view; test on his phone.
