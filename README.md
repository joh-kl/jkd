# JKD design

The JKD house style as a Claude Code skill: Swiss typography on a brutalist
base (from the büro brand guide), black and white, with an occasional
halftone, texture or chrome moment. For his apps (macOS, iOS), web pages and
print.

| File | What |
| --- | --- |
| `SKILL.md` | The skill: when to use it, what to read, the non-negotiables |
| `DESIGN.md` | The spec: tokens up front, rules below. The single source of truth |
| `references/` | Swiss typography, components, expressive layer, voice, accessibility, platforms, review |
| `themes/` | Each product's additions and what still differs (Auto-Sort, Augury) |
| `swift/` | `JKDDesign`, a Swift package of tokens and components for macOS 14+ and iOS 17+ |
| `web/jkd.css` | The same tokens and components for HTML |

## Install as a skill

```
ln -s ~/Developer/jkd-design ~/.claude/skills/jkd-design
```

Then any Claude Code session can use it; a project's CLAUDE.md can say
"Follow the jkd-design skill" to make it the default.

## Use in an app

Xcode: File, Add Package Dependencies, Add Local, pick `swift/`. Then
`import JKDDesign`.

## Change the style

Edit `DESIGN.md`, `swift/Sources/JKDDesign/Tokens.swift` and `web/jkd.css`
together, run `swift test` in `swift/` (contrast of every text pair), and add a
line to `CHANGELOG.md`.

## Sources

The büro Brand Development Guide (his own), the Swiss International
Typographic Style, Augury's interface rules, and the apple-design skill's
review lenses. Two confidential corporate design systems he has access to were
read for structure only (how a token spec and a brand toolkit are organised);
nothing from them is in this repository, and nothing may be added.
