# Design canvas — artboard sources

The screens published as the NiMechE-SF (AATU) member platform design canvas.

**These files are the source.** To change a screen, edit its `.dc.html` here and re-seed the
canvas — never edit the generated `nimeche-member-platform.html` at the repo root, which is a
build output and is gitignored.

The canvas has four pages, switched from the toolbar. The first three are **flows** — read each
left to right.

**1 · Landing & sign in** (desktop, 1440px)

| File | Screen |
|---|---|
| `Landing.dc.html` | Public landing page — what NiMechE-SF is, what membership gives you, how it works |
| `Join.dc.html` | Sign up — four fields, no password |
| `CheckEmail.dc.html` | Magic link sent |
| `Login.dc.html` | Sign in, returning member |

**2 · Membership** (desktop) — the same journey from both sides

| File | Screen |
|---|---|
| `Pending.dc.html` | Member: application under review |
| `ReviewQueue.dc.html` | Executive: the review queue, with matric numbers checked against the department roll |
| `ReviewMember.dc.html` | Executive: one applicant, approve or decline |
| `Welcome.dc.html` | Member: approved, first run, with the digital membership card |
| `Profile.dc.html` | The membership record itself — details, derived skills, card |

**3 · Quick join** (desktop)

| File | Screen |
|---|---|
| `QuickJoin.dc.html` | A shareable link for WhatsApp or a QR on a flyer — same four fields, no landing page in the way, carries who shared it |
| `QuickJoinDone.dc.html` | Confirmation, what happens next, and a QR to pass on |

**Mobile (v1)** — `Main`, `Home`, `SignUp`, `EventDetail`, `Certificate`, `Attendance`. The earlier
phone screens, unchanged, parked until the desktop flows are settled.

`canvas.json` holds the page assignments, frame positions, artboard titles and the flow notes.

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

Type is Sora for headings and Inter for body, per design plan section 4. Icons are inline
stroke SVG in the Lucide style at 1.75px.

## Known placeholders

- **The crest is drawn from the raster logo**, not the official vector artwork. Replace it once the secretariat supplies the vector (design plan section 2.2). It appears in `Main`, `Home`, `SignUp`, `EventDetail` and `Certificate`.
- **All content is sample data** — member names, matric numbers, programmes, dates, organisations. Plausible, not real, and sized to a branch of a few hundred rather than a national body.
- **The student email pattern** is rendered as `firstname.lastname@tech-u.edu.ng`. Confirm the `@` placement before this reaches a real form.
- **The verification domain** is `nimeche-aatu.vercel.app/verify` — a working stand-in until the branch has its own.
- **`[branch domain]`** stands in on the certificate and verification copy until the branch has its own domain (design plan section 17.9).
- **The wordmark reads `NiMechE-SF / AATU`** as a text lockup beside the crest. It is not an approved lockup yet — design plan section 2.2 lists getting one signed off by the national body.

## Re-seeding

Run the `/design` skill's helper against these files with `--canvas canvas.json`, then republish
to the same artifact URL so the link stays stable.
