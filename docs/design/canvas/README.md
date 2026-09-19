# Design canvas — artboard sources

The screens published as the NiMechE-SF (AATU) member platform design canvas.

**These files are the source.** To change a screen, edit its `.dc.html` here and re-seed the
canvas — never edit the generated `nimeche-member-platform.html` at the repo root, which is a
build output and is gitignored.

The canvas is organised by **area of the app**, not by user journey. Each page holds every screen
in one area — desktop on the top row, the same screens at 390px on the row below.

### Public site — done

Eleven screens on desktop, eleven at 390px below.

| Desktop | Mobile | Screen |
|---|---|---|
| `Landing` | `MLanding` | What the branch is, how it works, and a gallery mosaic |
| `About` | `MAbout` | The branch, the executive, how to join, for employers |
| `PublicEvents` | `MPublicEvents` | Coming up, and past events with their media |
| `PublicEventDetail` | `MPublicEventDetail` | One event, with "from the last one" |
| `Gallery` | `MGallery` | The media hub — filters, mosaic, albums |
| `Album` | `MAlbum` | One album with the lightbox open |
| `Projects` | `MProjects` | Project and competition showcase |
| `ProjectDetail` | `MProjectDetail` | A case study, including what went wrong |
| `PublicOpportunities` | `MPublicOpportunities` | The hub, plus the no-account partner form |
| `News` | `MNews` | Lead story and posts |
| `Verify` | `MVerify` | Certificate verification, no account |

**Media runs through all of it.** Every album is attached to the event, project or competition it
came from and links back to it — the archive is the proof, not decoration. See design plan section 7.1.

The tiles are **deliberate placeholders**, not grey boxes: a grid of them should read as
"photographs go here". Swap in real files when there are some.

The event and project heroes sit **inside the page gutter with a 16px radius**, not bled to the
browser edge. Full-bleed looked like a mistake at 1440px: a 1440-wide slab with a chip inset 9px
into its corner, because that inset was designed for a 150px thumbnail. Insets do not scale with the
tile, so the large media carries its own.

`Verify` is the one screen a stranger judges the whole branch by — an employer holding a code and no
account. It is plain, document-like, and answers their only question in the first line.

### Joining — done

`Join` · `JoinError` · `CheckEmail` · `Login` · `LinkExpired` · `QuickJoin` · `QuickJoinDone`, each
with its `M…` counterpart.

**Sign-in is the student email and a password.** The email must be a `@tech-u.edu.ng` address, which
is what lets the form skip "which school?" entirely. Sign-up is five fields: name, email, password,
department, level. The password field is one field, not three — no confirm box, no strength meter, a
**Show** toggle instead, which is what actually helps on a phone.

An emailed link survives in exactly one place: **forgetting the password**. `CheckEmail` is the
"we sent you a link" state and `LinkExpired` is what happens 60 minutes later. Both used to be the
main way in; now they are the recovery path.

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

`canvas.json` holds page assignments, frame positions, artboard titles and the area notes.

## The sixteen that go to Figma

Eighty-one artboards is the right number for deciding what the platform is and the wrong number to
rebuild by hand. Sixteen screens carry every pattern the rest reuse, and they are built separately
as self-contained **responsive** HTML in [`../screens/`](../screens/) — one file per screen, each
working from 1440px down to 390px instead of splitting into two artboards.

Five public, two for signing in, five member, four executive. `../screens/README.md` lists them and
`../screens/index.html` is a contact sheet.

**The other sixty-five artboards stay here as reference** for the empty states, errors and
after-review screens a component library cannot answer. Design plan section 16.1 has the reasoning
per screen.

## The hero illustration

`Landing` and `MLanding` share one inline SVG: a small stack of credentials with the front one
detailed — the placeholder mark, an orange gear-rule down the left edge, abstract rules where the name and
programme go, a verified badge, and one real string, the verification code.

It replaced a mock member dashboard showing fake activity counts. That was a screenshot of the
product standing in for the idea, and it sold nothing to a visitor who is not a member yet.

Two rules it keeps: the holder's name and programme are **abstract rounded rules rather than
invented text**, so the picture never reads as a real person's certificate; and there is **no large
orange gear**, which design plan section 2.3 rules out at scale. Everything is painted through CSS
custom properties, so it themes with the rest of the page rather than needing a dark variant.

## Known placeholders

- **The canvas keeps a placeholder mark where the crest belongs.** The real crest arrived as `docs/design/assets/nimeche-logo.svg` and is wired into the sixteen screens in `../screens/`. It is not inlined here: the crest is 123KB and appears in 99 places across these 81 artboards, which would add ~12MB to a published canvas that is already 4MB. The canvas is reference material now, so the placeholder stays and the screens carry the real thing.
- **Media tiles are placeholders** — a sunken panel, a hairline inset border and a thin image glyph, plus the tag chip, the duration and the caption the real photograph will carry. Layouts are built for 16:9, 4:3, 1:1 and 32:9. Inside the fixed-row mosaics on `Landing` and `Gallery` the tiles fill their grid cell instead of declaring their own ratio, which is what stops the large tile overflowing its section.
- **Every name is an obvious placeholder** — Jane Doe, John Roe, Mary Major — and so is every company, so a mockup can never be mistaken for a real person or an arrangement that does not exist. Matric numbers and email addresses follow from them.
- **Public-page copy is lorem ipsum.** Headlines and prose on the landing, about, events, gallery, projects, opportunities and news pages are placeholder text; buttons, labels, navigation and card titles stay real so the design is still reviewable. Application screens keep their real copy, because lorem there would make them impossible to judge.
- **The student email pattern** is `firstname.lastname@tech-u.edu.ng` — confirmed.
- **The verification domain** is `nimeche-aatu.vercel.app/verify` — the working address, and fine for building and reviewing. It goes on certificates an employer will check years from now, so a branch-owned domain should replace it before the first real certificate is issued.
- **`[branch domain]`** stands in on the certificate and verification copy until the branch has its own domain (design plan section 17.9).
- **The wordmark reads `NiMechE-SF / AATU`** as a text lockup beside the crest. It is not an approved lockup yet — design plan section 2.2 lists getting one signed off by the national body.

## Re-seeding

Run the `/design` skill's helper against these files with `--canvas canvas.json`, then republish
to the same artifact URL so the link stays stable.
