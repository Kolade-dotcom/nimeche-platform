# Rebuilding the designs in Figma

Everything here exists to make that rebuild fast and accurate. Nothing in it replaces judgement —
an HTML import gets you correct geometry and colour, not a well-built Figma file.

| What | Where |
|---|---|
| 81 standalone screens, one HTML file each | `screens/` |
| Design tokens for Figma Variables | `tokens.json` |
| Screen list by section, with sizes | `screens.json` |
| The living source these were generated from | `../canvas/` |

## The fastest route

**1. Variables first.** Import `tokens.json` with a variables plugin (Tokens Studio, or any
"import variables from JSON" plugin). It is in the W3C design-tokens format, with `semantic.light`
and `semantic.dark` as two modes of the same collection — which is what makes a light/dark toggle
work in Figma the way it works in the design.

Do this before anything else. Every later decision then references a variable instead of a hex
someone typed.

**2. Screens by import.** Use the **html.to.design** plugin. It takes pasted HTML, so:

- open a file from `screens/`, copy all of it, paste into the plugin, import
- it lands as a frame with real text layers, fills and spacing

Each file is fully self-contained — fonts come from Google Fonts, styles are inline, and there is
nothing to serve. Start with one screen and check the result before doing eighty.

**3. Components, by hand.** This is the part worth doing properly rather than importing.
`MemberComponents.html` is the inventory: buttons, chips, form controls, the credential card, the
skill meter, event and timeline rows, empty state, skeleton, sidebar and bottom bar. Build those as
real Figma components with variants and auto-layout, then swap them into the imported screens.

An imported screen has correct pixels and no structure. A component library has structure. You want
both, in that order.

## How to lay the file out

Mirror the canvas — four pages, desktop row then mobile row:

| Figma page | Screens |
|---|---|
| Public site | 22 |
| Joining | 14 |
| Member area | 23 |
| Executive area | 22 |

`screens.json` lists every file with its frame size and whether it is desktop (1440) or mobile (390).

## Worth knowing before you start

- **The crest is a placeholder.** Replace it everywhere from one component, once the real vector arrives.
- **Photographs are real but random.** Every image tile in `screens/` points at `picsum.photos`, which serves real Unsplash photographs deterministically from a seed, with no API key. They import into Figma as actual images. They are **not curated** — they are stock scenery, not engineering. Swap them for the branch's own event photographs, or for hand-picked Unsplash URLs, once you have some.
- **The canvas keeps drawn placeholders instead**, because the artifact viewer's content policy blocks every external image host. That difference is deliberate, not a mistake.
- **Screens import in light mode.** The dark values are in `tokens.json`; wire them as the second variable mode rather than importing every screen twice.
- **Type is Sora (headings) and Inter (body).** Both on Google Fonts — install them locally or enable them in Figma before importing, or text reflows into a fallback.
- **All copy on the public pages is lorem ipsum** and every person, company and matric number is an obvious placeholder. Real words come later; nothing on these screens should be read as approved wording or a real partnership.
- **Contrast is already verified** (design plan section 3.4). If you change a colour in Figma, it stops being verified — check it again rather than assuming.

## Keeping two sources honest

Once Figma exists it becomes the place people comment and iterate, and `docs/design/canvas/` will
drift behind it. That is fine, but decide it deliberately:

- **`docs/design/tokens.css` stays the source of truth for colour and type.** Figma variables mirror it. If a token changes in Figma, change it there too, or the build will not match the design.
- **The written plans stay the source of truth for behaviour** — what a screen does, what the rules are. Figma holds appearance.

Regenerate this folder from the canvas at any time; the screens are produced mechanically from
`../canvas/*.dc.html`.
