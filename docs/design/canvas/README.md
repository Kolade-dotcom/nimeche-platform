# Design canvas — artboard sources

The screens published as the NiMechE-SF (AATU) member platform design canvas.

**These files are the source.** To change a screen, edit its `.dc.html` here and re-seed the
canvas — never edit the generated `nimeche-member-platform.html` at the repo root, which is a
build output and is gitignored.

The canvas is organised by **area of the app**, not by user journey. Each page holds every screen
in one area — desktop on the top row, the same screens at 390px on the row below.

### Public site & joining — done

`Landing` · `Join` · `JoinError` · `CheckEmail` · `Login` · `LinkExpired` · `QuickJoin` ·
`QuickJoinDone`, each with its `M…` mobile counterpart. The "wrong address" and "link expired"
screens are part of the set rather than edge cases: they are the two things that will actually happen.

### Member area — done

Nine screens, both viewports, plus two onboarding states and the component sheet.

| Desktop | Mobile | Screen |
|---|---|---|
| `Main` | `MDashboard` | Dashboard — development ring, what is next, matched opportunities, recent activity |
| `MyEvents` | `MMyEvents` | Upcoming, feedback due, attended, missed |
| `MyCertificates` | `MMyCertificates` | The credential wall, plus what is on the way |
| `CertificateView` | `MCertificateView` | One certificate, its skills and its verification record |
| `MySkills` | `MMySkills` | The four levels, and the activities that produced each |
| `MyOpportunities` | `MMyOpportunities` | Registered interest, applications, recorded outcomes |
| `MyActivity` | `MMyActivity` | The full record, grouped by month, exportable for a CV |
| `Profile` | `MProfile` | The membership record and digital card |
| `Settings` | `MSettings` | Account, notifications, theme, privacy, data |
| `Pending` / `Welcome` | `MPending` / `MWelcome` | Under review, and the evening they are approved |
| `MemberComponents` | — | Every piece the member screens are built from |

**The rule running through the area:** the member never maintains their own record. Skills are
derived, certificates arrive, activity accumulates. The only things they ever fill in are settings
and a profile they chose to make public.

### Executive area — started

`ReviewQueue` and `ReviewMember` with their mobile pair. The rest of the section — overview, members,
events, attendance, certificate issuing, opportunity review, content, analytics — is next.

### Not yet reworked

`EventDetail` and `Attendance`, two early phone screens belonging to sections not yet reached.

`canvas.json` holds page assignments, frame positions, artboard titles and the area notes.

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
