# Sixteen screens

Self-contained, responsive HTML. One file per screen. Open `index.html` for a contact sheet of all
sixteen, or open any file on its own.

These supersede the 81-artboard export that used to live in `../figma/screens/`. That export was
mechanical, desktop-only, split desktop and mobile into separate files, and was too many screens to
rebuild by hand. These sixteen cover the same four areas of the product and are the ones to turn
into Figma components.

| # | File | Area | What it carries |
|---|---|---|---|
| 1 | `01-home.html` | Public | Nav, hero, stat row, feature cards, step row, event cards, gallery mosaic, CTA band, footer |
| 2 | `02-events.html` | Public | Event card in a grid, filter chips, past-events table |
| 3 | `03-event-detail.html` | Public | The page a WhatsApp link lands on. Contained hero, registration panel, certificate panel, media strip |
| 4 | `04-gallery.html` | Public | Mosaic, album grid, video tiles, takedown notice |
| 5 | `05-verify-certificate.html` | Public | What an employer sees holding a code and no account |
| 6 | `06-sign-in.html` | Auth | Tech-U email and password, forgot-password route |
| 7 | `07-create-account.html` | Auth | Five fields. Every form control in the system |
| 8 | `08-member-dashboard.html` | Member | App shell, development ring, what is next, action banner, summary cards, activity feed |
| 9 | `09-member-events.html` | Member | Registered, waiting on you, attended and missed |
| 10 | `10-member-certificates.html` | Member | The credential card, verification code, who has checked it |
| 11 | `11-member-skills.html` | Member | Derived skill levels with the evidence behind each |
| 16 | `16-member-profile.html` | Member | The membership record, the digital card, and the data-rights controls |
| 12 | `12-exec-overview.html` | Executive | Waiting-on-you queue, KPI tiles, attendance chart, next event, membership split |
| 13 | `13-exec-members.html` | Executive | Review queue and the directory table with bulk actions |
| 14 | `14-exec-attendance.html` | Executive | Offline capture at the gate |
| 15 | `15-exec-certificates.html` | Executive | Bulk issuance for a cohort, verification log, withdrawal |

## Responsive, not two sets of files

Each file is one screen at every width. Resize the browser and watch the breakpoints:

- **940px** - the sidebar becomes a bottom bar, the public nav becomes a menu button.
- **820px** - data tables stop being tables. Each row becomes a labelled card, driven by the
  `data-l` attribute on every cell, so nothing is hidden or cut off.
- **700px** - type scale drops, padding tightens, the full-bleed hero changes ratio.

Import each file at a desktop width and again at a phone width if you want both frames in Figma.
The markup is identical; only the CSS responds.

## Importing into Figma

Use the **html.to.design** plugin. It takes pasted HTML, so open a file, select all, paste, import.
Everything is inline - no build step, no local server, no asset folder.

Two things before you start:

1. **Install Sora and Inter**, or enable them in Figma. Both are on Google Fonts. Without them the
   text reflows into a fallback and the spacing you see will not be the spacing you designed.
2. **Import light mode first.** Every screen defines a complete dark palette too, under
   `prefers-color-scheme` and `[data-theme="dark"]`. Wire those as a second variable mode rather
   than importing sixteen screens twice. To preview dark, add `data-theme="dark"` to the `<html>`
   tag.

## The logo

Every screen loads the real NiMechE crest from an **absolute URL on raw.githubusercontent.com,
pinned to the commit that added it**:

```
https://raw.githubusercontent.com/Kolade-dotcom/nimeche-platform/2003378.../docs/design/screens/nimeche-logo.svg
```

That is deliberate. These files get downloaded and opened one at a time, and a relative `src` only
resolves when the rest of the folder came with it - which it usually did not. Pinning to a commit
SHA rather than a branch means the URL keeps working even if the file later moves or changes.

Each `<img>` also carries an `onerror` that falls back to `nimeche-logo.svg` beside it, so the
folder still renders with no network at all. Remote first, local second, and the crest shows up
either way.

**To change the crest**, replace `nimeche-logo.svg` here and in `../assets/`, commit, then update
`LOGO_URL` to the new commit SHA and rebuild. Until the SHA is updated the screens keep serving the
old artwork, which is the point of pinning - but it is also the thing to remember.

Two treatments, because the crest has a white inner field and cannot sit bare on a coloured ground:

- **Full colour** in the public nav, the footer and the app sidebar, at 40-44px. Below about 40px
  the ring lettering turns to mush, which is why nothing uses it smaller. A square icon mark for
  favicons and avatars still has to come from the secretariat (design plan section 2.2).
- **White knockout** on the green auth panels, via `filter: brightness(0) invert(1)` on the same
  file. No second asset to keep in sync.

**Pasting into html.to.design** now carries the logo with it, since the image is fetched from a URL
rather than a file beside the page. Build it as a Figma component anyway - sixteen copies of a logo
is not a design system.

## Matric numbers

The format is **`125/23/1/0142`**:

| Part | Means |
|---|---|
| `125` | Programme code |
| `23` | Year of entry |
| `1` | `1` male, `2` female |
| `0142` | The student's number on the school list for that year |

Every entry year in these screens agrees with the person's level, and the fourth part agrees with
the placeholder name, so the numbers read as real records rather than filler.

**One thing to confirm:** the code `125` came from a Mechanical Engineering example. If Mechatronics
has its own programme code, the Mechatronics rows in `13-exec-members.html` need it.

A member never types this. It comes off the department roll when an executive approves them, which
is what dev plan section 6.1 depends on, and it is why the review queue can say "matched on the
department roll" rather than asking anyone to check by hand.

## The content

Real English, no lorem. Numbers, dates and event names are plausible placeholders, not records of
anything that happened.

- **The signed-in person is Akolade Salako**, on both the member and the executive screens.
- Everyone else is a deliberately generic name - John Doe, Jane Doe, Mary Major, Richard Roe, Peter
  Poe, Grace Noakes, Sarah Loe, Richard Miles - so no mockup can be mistaken for a real member.
- Companies are the same: Ibadan Steel Mill, Oyo Fabrication Works.
- **Sign-in is the student email and a password.** No magic links; an emailed link survives only
  for forgetting the password.

## Photographs

Media slots layer a real photograph from `picsum.photos` over a styled placeholder. Online you see
photographs; offline the placeholder shows through and nothing breaks. Swap the `<img src>` for the
branch's own event photographs when there are some.

## Tokens

Colour, type, spacing and radii match `../tokens.css`, which stays the source of truth. The contrast
figures in design plan section 3.4 were measured against those values - if you change a colour in
Figma, it stops being verified.
