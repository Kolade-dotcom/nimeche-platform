# Figma variables

`tokens.json` is the design token set in W3C design-tokens format, with `semantic.light` and
`semantic.dark` as two modes of one collection. Import it with a variables plugin (Tokens Studio,
or any "import variables from JSON" plugin) **before** you import a screen, so every later decision
references a variable instead of a hex someone typed.

## The screens moved

They are in **[`../screens/`](../screens/)** now - fifteen self-contained, responsive HTML files,
plus an `index.html` contact sheet. Open one in a browser, or paste it into the **html.to.design**
plugin to import it as a Figma frame.

This folder used to hold 81 files generated mechanically from `../canvas/`. They were desktop-only,
split each screen into separate desktop and mobile files, and amounted to more screens than anyone
would rebuild by hand. The fifteen cover the same four areas - public site, authentication, member
dashboard, executive dashboard - and each one responds from 1440px down to 390px on its own.

`../canvas/` still holds the full 81-artboard canvas. Keep it as reference for the states the
fifteen do not show: empty lists, errors, the screen after a member is approved. A component
library cannot answer those and a developer will ask.

## Laying the Figma file out

Four pages, matching the four areas:

| Page | Screens |
|---|---|
| Public site | 1-5 |
| Authentication | 6-7 |
| Member dashboard | 8-11 |
| Executive dashboard | 12-15 |

**Build in this order.** Screen 7 first - it defines every form control. Then 1, then 8, then 13.
Those four produce the component set; the remaining eleven are mostly composition.

## Before you import

- **Install Sora and Inter** or enable them in Figma. Both are on Google Fonts.
- **Import light mode.** The dark palette is in `tokens.json`; wire it as the second variable mode
  rather than importing everything twice.
- **The logo is a placeholder** in every screen. `../screens/README.md` says exactly what to swap.

## Keeping two sources honest

Once Figma exists it becomes where people comment and iterate, and the HTML will drift behind it.
That is fine, but decide it deliberately:

- **`../tokens.css` stays the source of truth for colour and type.** Figma variables mirror it. If
  a token changes in Figma, change it there too, or the build will not match the design.
- **The written plans stay the source of truth for behaviour** - what a screen does, what the rules
  are. Figma holds appearance.
