# Design canvas — artboard sources

The six mobile screens published as the NiMechE Member Platform design canvas.

**These files are the source.** To change a screen, edit its `.dc.html` here and re-seed the
canvas — never edit the generated `nimeche-member-platform.html` at the repo root, which is a
build output and is gitignored.

| File | Screen |
|---|---|
| `Main.dc.html` | Member dashboard — the entry artboard |
| `Home.dc.html` | Public home page |
| `SignUp.dc.html` | Registration, passwordless |
| `EventDetail.dc.html` | Event detail with completion requirements |
| `Certificate.dc.html` | Certificate viewer |
| `Attendance.dc.html` | Attendance capture, executive, offline |
| `canvas.json` | Frame positions, sticky notes, launch view |

## How they are built

Every colour is a CSS custom property lifted verbatim from
[`../tokens.css`](../tokens.css) — `--surface`, `--primary`, `--accent` and the rest — declared
on the `.screen` wrapper and overridden under `.screen[data-theme="dark"]`. Nothing hard-codes a
hex value except the certificate document, which deliberately keeps literal light-theme colours in
both modes (design plan section 5: a certificate is a document, not a UI surface).

Each artboard exposes one control, a Light/Dark switch, which sets `data-theme` on that wrapper.

Type is Sora for headings and Inter for body, per design plan section 4. Icons are inline
stroke SVG in the Lucide style at 1.75px.

## Known placeholders

- **The crest is drawn from the raster logo**, not the official vector artwork. Replace it once the secretariat supplies the vector (design plan section 2.2). It appears in `Main`, `Home`, `SignUp`, `EventDetail` and `Certificate`.
- **All content is sample data** — member names, programmes, dates, organisations. Plausible, not real.

## Re-seeding

Run the `/design` skill's helper against these files with `--canvas canvas.json`, then republish
to the same artifact URL so the link stays stable.
