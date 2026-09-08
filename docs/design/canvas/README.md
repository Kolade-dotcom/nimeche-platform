# Design canvas — artboard sources

The screens published as the NiMechE-SF (AATU) member platform design canvas.

**These files are the source.** To change a screen, edit its `.dc.html` here and re-seed the
canvas — never edit the generated `nimeche-member-platform.html` at the repo root, which is a
build output and is gitignored.

The canvas has four pages, switched from the toolbar. **Each stage is worked through completely —
desktop and mobile — before moving to the next.**

### 1 · Landing & sign in — done

Desktop row (1440px), then the same flow again at 390px below it. Read each row left to right.

| Desktop | Mobile | Screen |
|---|---|---|
| `Landing` | `MLanding` | Public landing page — what NiMechE-SF is, what membership gives you, how it works |
| `Join` | `MJoin` | Sign up — four fields, no password |
| `JoinError` | `MJoinError` | Sign up with a non-Tech-U address |
| `CheckEmail` | `MCheckEmail` | Magic link sent |
| `Login` | `MLogin` | Sign in, returning member |
| `LinkExpired` | `MLinkExpired` | Expired sign-in link |

The two `…Error` / `…Expired` screens are part of the flow, not edge cases: a wrong address and a
stale link are the two things that will actually happen.

### 1b · Quick join — done

| Desktop | Mobile | Screen |
|---|---|---|
| `QuickJoin` | `MQuickJoin` | A shareable link for WhatsApp or a QR on a flyer — same four fields, no landing page in the way, carries who shared it |
| `QuickJoinDone` | `MQuickJoinDone` | Confirmation, what happens next, and a QR to pass on |

### 2 · Membership — desktop only so far

`Pending` (member waiting) · `ReviewQueue` (executive) · `ReviewMember` (approve one) ·
`Welcome` (approved, with the membership card) · `Profile` (the record itself).
**The mobile pass for this stage is next.**

### Type directions

`TypeA` (in use) · `TypeB` · `TypeC` — the same content set three ways, so the comparison is honest
rather than a specimen sheet of alphabets. Each carries its own case **and** what it costs. Swapping
the whole product to B or C is one scripted find-and-replace across the artboards plus `tokens.css`.

### Later stages — mobile v1

`Main`, `EventDetail`, `Certificate`, `Attendance`. Early phone screens for stages not yet worked
through. They will be redone properly, desktop and mobile, when we reach them.

`canvas.json` holds page assignments, frame positions, artboard titles and the stage notes.

## How they are built

Every colour is a CSS custom property lifted verbatim from
[`../tokens.css`](../tokens.css) — `--surface`, `--primary`, `--accent` and the rest — declared
on the `.screen` wrapper and overridden under `.screen[data-theme="dark"]`. Nothing hard-codes a
hex value except the certificate document, which deliberately keeps literal light-theme colours in
both modes (design plan section 5: a certificate is a document, not a UI surface).

Each artboard exposes one control, a Light/Dark switch, which sets `data-theme` on that wrapper.

Two places deliberately hold literal colours instead of tokens, and both are the same call: a
surface that must read identically in either theme. The certificate document is one; the event
cover band is the other — it is pinned to the deep brand green `#00713A` rather than `--primary`,
because in dark mode `--primary` lightens to `#3FBF7A` and the white text over it would drop to
2.35:1.

Type is **IBM Plex** — Serif for `h1`/`h2` and holder names, Sans for everything else, Mono for
verification codes and matric numbers (design plan section 4). Icons are inline stroke SVG in the
Lucide style at 1.75px.

## The hero illustration

`Landing` and `MLanding` share one inline SVG: a small stack of credentials with the front one
detailed — crest, an orange gear-rule down the left edge, abstract rules where the name and
programme go, a verified badge, and one real string, the verification code.

It replaced a mock member dashboard showing fake activity counts. That was a screenshot of the
product standing in for the idea, and it sold nothing to a visitor who is not a member yet.

Two rules it keeps: the holder's name and programme are **abstract rounded rules rather than
invented text**, so the picture never reads as a real person's certificate; and there is **no large
orange gear**, which design plan section 2.3 rules out at scale. Everything is painted through CSS
custom properties, so it themes with the rest of the page rather than needing a dark variant.

## Known placeholders

- **The crest is drawn from the raster logo**, not the official vector artwork. Replace it once the secretariat supplies the vector (design plan section 2.2). It appears in `Main`, `Home`, `SignUp`, `EventDetail` and `Certificate`.
- **All content is sample data** — member names, matric numbers, programmes, dates, organisations. Plausible, not real, and sized to a branch of a few hundred rather than a national body.
- **The student email pattern** is `firstname.lastname@tech-u.edu.ng` — confirmed.
- **The verification domain** is `nimeche-aatu.vercel.app/verify` — the working address, and fine for building and reviewing. It goes on certificates an employer will check years from now, so a branch-owned domain should replace it before the first real certificate is issued.
- **`[branch domain]`** stands in on the certificate and verification copy until the branch has its own domain (design plan section 17.9).
- **The wordmark reads `NiMechE-SF / AATU`** as a text lockup beside the crest. It is not an approved lockup yet — design plan section 2.2 lists getting one signed off by the national body.

## Re-seeding

Run the `/design` skill's helper against these files with `--canvas canvas.json`, then republish
to the same artifact URL so the link stays stable.
