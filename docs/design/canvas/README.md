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

### Executive area — done

Twelve screens on desktop, ten at 390px below.

| Desktop | Mobile | Screen |
|---|---|---|
| `AdminOverview` | `MAdminOverview` | What is waiting on you, next event, attendance trend |
| `AdminMembers` | `MAdminMembers` | The directory, with bulk actions |
| `ReviewQueue` | `MReviewQueue` | New members, matched against the department roll |
| `ReviewMember` | `MReviewMember` | Approve or decline one applicant |
| `AdminEvents` | `MAdminEvents` | Upcoming, draft, needs attendance, past |
| `AdminEventEdit` | — | Create an event on one screen, no wizard |
| `AdminEventDetail` | `MAdminEventDetail` | Registrations, attendance, completion, certificates |
| `AdminAttendance` | `MAdminAttendance` | Capture at the door, offline |
| `AdminCertificates` | `MAdminCertificates` | Bulk issuance, verification log, revocation |
| `AdminOpportunities` | `MAdminOpportunities` | Partner submissions and the live hub |
| `AdminAnalytics` | `MAdminAnalytics` | Attendance trend, drop-off funnel, programmes, who the members are |
| `AdminSettings` | — | Roles and the audit log |

**Designed for someone doing association work at 11pm between deadlines**, whose alternative is a
WhatsApp group. So every screen leads with what is waiting on them, and the expensive jobs —
approving members, issuing certificates — are one action for the whole batch, not one per person.

**Charts** use the validated palettes in `tokens.css`, re-checked with the dataviz validator: brand
green and violet for the two-category split (ΔE 22.8 under deutan), and a single-hue green ordinal
ramp for the funnel. Magnitude comparisons are one hue, not a rainbow; the two-department split is a
labelled bar rather than a pie; no chart has two y-axes. Each carries a Table toggle, and the line
chart shows one tooltip so the hover layer is visible in a static mock.

### Not yet reworked

`EventDetail` — the public event page, still at mobile v1. It belongs to the public site section and
gets done properly, both viewports, when that section is revisited.

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
