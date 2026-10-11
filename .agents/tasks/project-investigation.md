# NiMechE Platform — Project Investigation Report

**Produced by:** Kiro investigation agent  
**Date:** 2025 (read-only, no code changed)  
**Sources read:** README.md, docs/design/DESIGN_PLAN.md (full), docs/dev/DEV_PLAN.md (full),
prisma/schema.prisma, package.json, .env.example, components.json, src/ tree (all files),
e2e/ specs.

---

## 1. Summary Answer

The NiMechE-SF Member Platform is a **full-stack web application for the student branch of the
Nigerian Institution of Mechanical Engineers at Abiola Ajimobi Technical University (Tech-U),
Ibadan**. It digitises what currently lives in WhatsApp groups: event attendance, certificates,
skills records, and opportunities for a membership of a few hundred students.

The project is **well-planned and meaningfully started**. The public homepage, the complete
authentication flow (sign-up, sign-in, email verification, forgot-password, reset-password), and
the full member portal (dashboard, events, certificates, skills, profile) are built and wired to a
real Postgres database. The design and development plans are detailed and coherent. The executive
dashboard, public events/gallery pages, the offline attendance-capture PWA, the certificate PDF
renderer, and the opportunities/admin subsystems remain to be built.

The overriding goal — named **G0** — is that the platform must be *easier* than the WhatsApp group
it replaces. This is enforced as measurable friction budgets (e.g. ≤5 fields to sign up, ≤2 taps
to register for an event from a WhatsApp link, 0 actions to receive a certificate). Every
architectural decision in both planning documents is traced back to those budgets.

---

## 2. Project Purpose and Goals

### 2.1 The problem being solved

The branch runs plant visits, workshops, CAD clinics and design competitions. Today:
- Attendance is a photograph of a sign-in sheet.
- Certificates are a designer's afternoon project.
- When a member graduates, their record leaves with them.

The platform creates a **durable record**: attendance is captured at the door, certificates are
issued automatically with a verifiable code, and skills are derived from what members actually did
rather than self-declared on a form.

### 2.2 The four areas

| Area | Users | Core function |
|---|---|---|
| Public site | Anyone, signed out | What the branch is, upcoming events, gallery, employer certificate verification |
| Joining | Prospective members | Five-field sign-up → executive approval |
| Member portal | Active members | Dashboard, certificates, skills, events, opportunities, profile |
| Executive console | Branch executive | Approve members, run events, capture attendance offline, issue certificates in bulk |

### 2.3 Design goals (from DESIGN_PLAN.md §1)

| Code | Goal | Interface expression |
|---|---|---|
| **G0** | Effortless for non-technical users — **outranks all others** | The friction budgets in §1.1 are acceptance criteria, not targets |
| G1 | Progress must be visible | Member sees what they've done and what's next within 3 seconds of login |
| G2 | Credentials must look credible | Institutional treatment, not a gamification badge |
| G3 | Opportunities must be scannable | Filter, deadline, clarity — beats a WhatsApp broadcast |
| G4 | Honest skill signalling | Four-level model (exposure → developing → demonstrated → verified) legible at a glance |
| G5 | Works on a cheap Android phone | Mobile-first, 360px baseline, low payload |

### 2.4 The friction budgets (hard acceptance criteria)

| Journey | Budget |
|---|---|
| Sign up | ≤5 fields, ≤2 minutes, no document upload |
| Register for an event from a WhatsApp link | ≤2 taps when signed in |
| Receive a certificate | 0 actions — it arrives automatically |
| Have a skill recorded | 0 actions — derived from activity |
| Verify a certificate (employer) | 0 accounts, 1 tap |
| Publish an event | ≤3 minutes, one screen |
| Check in 100 people at the door | ≤5 minutes, works offline |
| Issue certificates for an event | 1 action for the whole cohort |
| Submit an opportunity (partner) | ≤6 fields, no account required |

A flow that exceeds its budget **does not ship** until it is redesigned or the budget is
renegotiated in writing. (Source: DESIGN_PLAN.md §1.1, DEV_PLAN.md §1.1)

---

## 3. Tech Stack

### 3.1 Confirmed from package.json, components.json, .env.example

| Layer | Technology | Version / Notes |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.3.5 — uses the new `proxy.ts` convention (renamed from middleware) |
| **UI library** | React | 19.2.8 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS 4 | Wired to `docs/design/tokens.css` as the single source of visual truth |
| **Component primitives** | shadcn/ui (Radix UI) | New-York style; installed: Avatar, Checkbox, Dialog, DropdownMenu, Label, RadioGroup, Select, Separator, Slot, Tabs; owned source files in `src/components/ui/` |
| **Icons** | Lucide React | ^1.47.0 |
| **Database** | PostgreSQL on Neon | Serverless, scales to zero |
| **ORM / migrations** | Prisma 6 | ^6.19.3 |
| **Auth** | Auth.js v5 (NextAuth) | beta.32 — credentials provider, email+password |
| **Password hashing** | bcryptjs | ^3.0.3, cost 12 |
| **Form handling** | react-hook-form + @hookform/resolvers | ^7.88 / ^5.9.1 |
| **Validation** | Zod 4 | ^4.6.5 — same schema shared by form and server action |
| **Charts** | Recharts | ^3.10.1 — palettes from validated `--chart-*` tokens |
| **Dates** | date-fns | ^4.4.0 |
| **Toasts** | Sonner | ^2.0.8 |
| **Animations** | tw-animate-css | ^1.4.0 |
| **Email** | Resend (optional) | Without `RESEND_API_KEY`, emails print to console |
| **Unit testing** | Vitest | ^5.0.1 |
| **E2E testing** | Playwright | ^1.63.0 (desktop + mobile viewports) |
| **Hosting** | Vercel (app) + Neon (data) | Zero-ops deploys, preview per PR |
| **Linting** | ESLint 9 + eslint-config-next | 16.3.5 |
| **Formatting** | Prettier 3 + prettier-plugin-tailwindcss | Tailwind class sort included |

**Outstanding / undecided** (per DEV_PLAN.md §3.1):
- **Object storage** for photos and certificate PDFs: three candidates — Neon Object Storage, Vercel Blob, Cloudflare R2. Nothing depends on it until the media subsystem starts.
- **PDF rendering**: planned as headless Chromium (`@sparticuz/chromium`), not yet installed.
- **Error tracking**: Sentry (free tier) planned, not yet installed.
- **Email**: Resend is the likely choice (commented out in `.env.example`); Postmark is an alternative.

### 3.2 Why these choices (from DEV_PLAN.md §3.2)

Alternatives explicitly considered and rejected:
- **Django / Laravel** — split codebase, two languages; rejected.
- **WordPress + plugins** — dead end for the credential/skill/analytics model; rejected.
- **Firebase / Firestore** — document store poor fit for relational member ↔ events ↔ credentials data; rejected.
- **Self-hosted VPS** — operational burden on a volunteer; rejected.

---

## 4. Design System and UI/UX Decisions

### 4.1 Token architecture (from DESIGN_PLAN.md §3–6, tokens.css)

`docs/design/tokens.css` is the single source of truth. `src/app/globals.css` imports it directly
and maps tokens onto shadcn's vocabulary. No component hard-codes a colour or references a ramp
step directly — only semantic tokens.

**Brand anchors:**
```
--anchor-green   #008A45   (logo annulus — primary)
--anchor-orange  #EE7623   (logo gear ring — accent)
--anchor-crimson #C1272D   (logo detail — danger)
--anchor-ink     #12261A   (deep green-black — text/dark ground)
```

**Two hard rules that fall out of the maths:**
1. Never `#EE7623` as text on a light surface (2.9:1 — fails WCAG). Orange text uses `#A24A08`.
2. Never `#008A45` as body text on white (4.45:1 — fails AA for body). Green text uses `#00713A`.

Both raw logo colours are available as fills and marks; both are verified CI constraints.

**Theming:** Three states — light / dark / follow system. Dark is a designed theme, not an
inversion (all dark values independently chosen and contrast-checked). A no-flash init script in
`<head>` reads `localStorage["nimeche-theme"]` before first paint. A signed-in member's choice is
persisted on their profile so it follows them across devices.

**All contrast pairs are WCAG 2.1 AA verified** (DESIGN_PLAN.md §3.4): 16 pairs checked in both
themes, all pass. The worst case is the input border at 3.89:1 light / 3.26:1 dark (3:1 target).

### 4.2 Typography

Two families: **Sora** (headings/display/wordmark) and **Inter** (body/UI/forms). Both on Google
Fonts. Type scale is 1.250 major third, 16px base, fluid where it matters. Tabular numerals via
`font-variant-numeric: tabular-nums`. Verification codes and member numbers in the system monospace
stack (no third loaded font).

### 4.3 Components

shadcn/ui primitives (Radix) are the foundation. Domain-specific components specified in
DESIGN_PLAN.md §8.2:
- **Credential card** — the platform's signature object, 4px orange gear-rule on the left edge.
- **Skill level chip** — four-segment meter (○ ◔ ◑ ✔), colour + shape + glyph (never colour alone).
- **Development ring** — dashboard hero, single ring showing activities this session.
- **Activity timeline** — chronological record, the raw material for Phase 2 CV export.
- **Opportunity card** — dual-path distinction (Register through NiMechE vs Apply externally) is a UI requirement, never to be blurred.
- **Verification page component** — deliberately plain and document-like, no marketing chrome.

### 4.4 Information architecture (DESIGN_PLAN.md §9)

Three zones:
1. **Public site** (`/` through `/verify/:code`) — 12 routes, server-rendered, SEO-bearing.
2. **Member portal** (`/me/**`) — 10 routes, auth-gated.
3. **Admin console** (`/admin/**`) — 9 routes, role-gated.

Member navigation: collapsible left sidebar on desktop, **five-item bottom bar on mobile** (Home /
Events / Opportunities / Credentials / Profile). Deliberate choice — hamburger menus bury the
things the platform exists to surface.

### 4.5 Screen designs

16 fully designed screens in `docs/design/screens/` (one self-contained HTML file each), plus 81
reference artboards in `docs/design/canvas/` covering empty states, error states and after-review
flows. An `index.html` contact sheet covers all 16. These are what gets built against and what gets
imported into Figma.

### 4.6 Accessibility commitments (DESIGN_PLAN.md §11)

Target: **WCAG 2.1 AA**, treated as acceptance criteria.
- Contrast verified (§3.4).
- Visible focus ring on every interactive element (2px, 2px offset, never suppressed without replacement).
- Touch targets ≥44×44px.
- Status never by colour alone — badges carry glyphs, chart series have direct labels, skill meter uses segments.
- `prefers-reduced-motion` honoured everywhere.
- Screen-reader testing on five critical flows.
- Alt text required on image upload (with explicit "decorative" checkbox as opt-out).

---

## 5. Development Plan

### 5.1 Architecture (DEV_PLAN.md §2)

**Modular monolith** — single Next.js deployment, single Postgres database. Code organised by
domain module (membership, events, attendance, credentials, skills, opportunities, projects,
content, analytics). Modules communicate through explicit service functions, never by reaching into
each other's tables.

Middleware (now `proxy.ts`) runs before every request: redirects unauthenticated visitors trying to
reach `/me` or `/admin` to sign-in carrying the destination; keeps signed-in members off auth
screens.

### 5.2 Data model (DEV_PLAN.md §4, prisma/schema.prisma)

**Built tables** (confirmed in schema.prisma):
`Member`, `AuthToken`, `Event`, `Registration`, `AttendanceRecord`, `Deliverable`, `Credential`,
`CredentialSkill`, `CredentialEvent`, `VerificationCheck`, `Skill`, `MemberSkill`,
`ActivityEntry`, `Opportunity`

**Specified but not yet built** (noted in schema.prisma comment):
`Role`, `MemberRole`, `Project`, `MediaAsset`, `AuditLog`

Key data integrity rules built into the schema:
- `AttendanceRecord.clientEventId` is globally unique — the idempotency key for offline sync replay.
- `Credential` uses `onDelete: Restrict` on Member — a certificate outlives membership; a member with credentials cannot be deleted.
- `MemberSkill` has no write path for members — derived only, which is the honesty guarantee.
- `Credential` revocation uses `revokedAt` timestamp (never a delete); verification returns explicit "revoked" state.

### 5.3 Authentication (DEV_PLAN.md §5, src/auth.ts)

- Email + password, Tech-U domain (`@tech-u.edu.ng`) only — the domain is the institution gate.
- One password field, no confirm box, no strength meter, show-password toggle only.
- bcrypt cost 12 in `src/lib/auth/password.ts`.
- Single-use tokens (SHA-256 hash stored, raw never persisted) in `AuthToken` for email verification and password reset.
- Forgot-password returns identical response for real and unknown addresses (timing-safe).
- Long-lived sessions as HTTP-only signed cookies.
- Sign-in always returns to the intended destination (`?next=` / `?callbackUrl=`), normalised to
  refuse off-site destinations — this is what makes the ≤2-tap event-link budget achievable.
- Membership status (`PENDING` vs `ACTIVE`) is separate from having an account.

### 5.4 Delivery phases (DEV_PLAN.md §10)

| Phase | Duration | Focus |
|---|---|---|
| **Phase 0 — Foundations** | ~2–3 weeks | Repo, CI, auth, roles, design tokens, component library skeleton. **Done.** |
| **Phase 1 — MVP** | ~8–12 weeks | All four areas; offline attendance capture P0; certificate generation; opportunities hub; admin console. **In progress.** |
| **Pilot** | ~3–4 weeks (overlapping) | 2–3 real events; measured by exec adoption, not bug count. |
| **Phase 2 — Expansion** | Post-pilot | Mentorship, public profiles, payments (Paystack/Flutterwave), mobile app, advanced analytics. |

**Phase 1 exit criterion:** a real NiMechE event runs end-to-end on the platform — announced,
registered, attended, completed, certified, verified.

### 5.5 CI/CD and testing gates (DEV_PLAN.md §9.5)

| Gate | When |
|---|---|
| Typecheck, lint, format | Every push |
| Design-token lint (fails on hex literals outside tokens.css) | Every push |
| Plain-language lint (fails on banned jargon in user-facing strings) | Every push |
| Unit tests (Vitest) | Every push |
| E2E (Playwright) — register, sign in, event link, offline attendance, certificate issuance+verify | Every PR |
| Accessibility scan (axe) on key pages, both themes | Every PR |
| Contrast check against DESIGN_PLAN.md §3.4 | Every PR |
| Lighthouse budget check on public pages | Every PR |
| Friction budget check (E2E asserts field counts and tap counts) | Every PR |
| Deep-link round trip (signed-out → event link → sign-in → back to event) | Every PR |
| Migration dry-run against production clone | Before deploy |

**Not automatable:** before each release, three people who have never seen the screen attempt its
main task unaided (2 members + 1 executive). Pass mark: task completion without asking a question.

### 5.6 Security and privacy (DEV_PLAN.md §9.1–9.2)

- Rate limiting on auth endpoints; generic failure messages (same wording for wrong password and unknown address).
- Authorisation checked at three layers: route middleware, service function, Postgres RLS.
- Nigeria Data Protection Act 2023 (NDPA) applies — lawful basis, minimisation, retention policy, export/deletion built in from the start.
- Public profiles opt-in, defaulting off.
- Individual opportunity application detail never visible to executives.
- Certificate deletion: must anonymise member record while retaining issued credentials and aggregate counts (open decision needing executive sign-off).

### 5.7 Operating cost (DEV_PLAN.md §10.5)

Realistic steady state: **$0–15/month** (domain + email). Free tiers on Vercel and Neon are the
right answer at one branch's scale, not a stopgap.

---

## 6. Current State of Implementation

### 6.1 Built and wired to the database (confirmed by reading source files)

| Feature | Files | Notes |
|---|---|---|
| Public homepage | `src/app/(public)/page.tsx` | Full layout: hero, stats, features, how-it-works, events strip, gallery mosaic, verify CTA. Content from `src/lib/content/home.ts` (placeholder until DB queries). |
| Sign up | `src/app/(auth)/join/` | Five-field form; email domain validation; duplicate rejection; email verification token issued; redirects to `/check-email`. |
| Sign in | `src/app/(auth)/sign-in/` | Email + password; returns to `?next=`; timing-safe wrong-credentials message. |
| Forgot password | `src/app/(auth)/forgot-password/` | Same response for real and unknown addresses. |
| Email verification | `src/app/(auth)/verify-email/page.tsx` | Consumes single-use token. |
| Password reset | `src/app/(auth)/reset-password/` | Consumes single-use token; signs in immediately on success. |
| Check your email | `src/app/(auth)/check-email/page.tsx` | Handles both `?reason=confirm` and `?reason=reset`. |
| Expired link | `src/app/(auth)/link-expired/page.tsx` | — |
| Sign out | `src/app/(auth)/sign-out/route.ts` | POST only. |
| Auth server actions | `src/app/(auth)/actions.ts` | All four flows in one file. |
| Proxy / middleware | `src/proxy.ts` | Session check, redirects, callbackUrl normalisation. |
| Member dashboard | `src/app/(member)/me/page.tsx` | Reads: upcoming events, outstanding deliverables, event totals, credentials, skills, opportunities, activity feed. All data from DB. |
| My events | `src/app/(member)/me/events/page.tsx` | — |
| My certificates | `src/app/(member)/me/certificates/page.tsx` | Credential cards, outstanding deliverables, verification check history. PDF download and share disabled (pending PDF subsystem). |
| My skills | `src/app/(member)/me/skills/page.tsx` | — |
| My profile | `src/app/(member)/me/profile/page.tsx` | — |
| Member shell | `src/components/member/member-shell.tsx` | Sidebar, topbar, mobile bottom bar. |
| Design token → shadcn wiring | `src/app/globals.css` | Imports `docs/design/tokens.css`; maps onto shadcn vocabulary; `@theme inline` exposes as Tailwind utilities. |
| Auth shell | `src/components/auth-shell.tsx` | Two-panel auth layout. |
| Brand mark | `src/components/brand-mark.tsx` | Full-colour and knockout treatments. |
| Password field | `src/components/password-field.tsx` | Show/hide toggle; no confirm box. |
| Segmented field | `src/components/segmented-field.tsx` | Department and level as button groups, not dropdowns. |
| Unit tests | `src/lib/__tests__/format.test.ts`, `src/lib/__tests__/utils.test.ts`, `src/lib/validation/__tests__/auth.test.ts` | Format utilities and Zod auth schemas. |
| E2E tests | `e2e/auth-flow.spec.ts`, `e2e/auth.spec.ts`, `e2e/member.spec.ts`, `e2e/smoke.spec.ts` | Sign-up, sign-in, duplicate rejection, wrong-password timing, forgot-password uniformity. |
| Prisma schema | `prisma/schema.prisma` | All core tables built; Role/MemberRole/Project/MediaAsset/AuditLog specified but not yet added. |
| Seed data | `prisma/seed.ts` | One complete member record with relative dates (prevents stale fixtures). |

### 6.2 Designed but not yet built (from README.md §Status, DEV_PLAN.md §10)

| Subsystem | Notes |
|---|---|
| **Executive / admin dashboard** | All `/admin/**` routes. The attendance capture screen (`/admin/events/:id/attendance`) is P0 and must work offline with IndexedDB queue + background sync. |
| **Public events page** | `/events` and `/events/:slug` routes. |
| **Public gallery** | `/gallery` and `/gallery/:album`. |
| **Public opportunities page** | `/opportunities`. |
| **Public about / news / projects** | `/about`, `/news`, `/projects`, etc. |
| **Certificate PDF generation** | Background job, headless Chromium, same template as the viewer. |
| **Certificate verification page** | `/verify/:code` — public, unauthenticated, cached. |
| **Offline attendance PWA** | IndexedDB local queue, background sync, `client_event_id` idempotency, QR scan, walk-in registration. |
| **Certificate bulk issuance** | One-action background job over an event's completions. |
| **Skills engine** | Derivation logic: ≥1 activity → Exposure, ≥3 or 1 with assessment → Developing, project role → Demonstrated, explicit sign-off → Verified. |
| **Opportunities Hub** | Submission (including partner/no-account path), review queue, publishing, interest tracking, deadline auto-close job. |
| **Media / gallery subsystem** | Albums, photos (object storage), video (external URLs), upload flow, takedown flow. |
| **Notifications** | Transactional email (verification, approval, registration confirmation, reminders, certificate issued, feedback request). Phase 2: in-app centre + digests. |
| **Completion rules** | `CompletionRule` + `ActivityCompletion` tables (not yet in schema); rules versioned and snapshotted. |
| **Analytics dashboard** | Nightly rollup jobs → summary tables → dashboard reads summaries. |
| **Member public profiles** | `/u/:handle` — opt-in, Phase 2. |
| **AuditLog** | Schema not yet added. |
| **Role / MemberRole tables** | Schema not yet added. |
| **Project subsystem** | `Project`, `ProjectMember`, `ProjectMilestone` tables not yet added. |
| **Storybook component library** | Planned for Phase 1; not yet set up. |
| **Error tracking (Sentry)** | Planned; not yet installed. |

### 6.3 Deliverable buttons disabled pending subsystems

In `src/app/(member)/me/certificates/page.tsx`, the "PDF" and "Share" buttons are rendered but
`disabled`. The "Write it now" button for outstanding deliverables is also `disabled`. These are
explicit placeholders — the data model and UI are in place, the backend jobs are not yet built.

---

## 7. Open Questions (from DEV_PLAN.md §13, DESIGN_PLAN.md §17)

These are items the team needs to resolve before or during Phase 1. They are tracked in both
planning documents.

1. **Team's actual language skills** — the one factor that could legitimately override the stack recommendation.
2. **Does the branch charge dues?** Determines whether a payment gateway (Paystack / Flutterwave) is Phase 1 or Phase 2.
3. **Graduation and alumni access** — must be decided in Phase 1, not Phase 2. Sets `Member.status` transitions, what alumni can see, whether `/verify` outlives membership.
4. **Deletion vs credential retention** — a member's right to erasure vs an employer's ability to verify a certificate years later. Needs executive sign-off.
5. **Who may grant `verified` skill level** — the skills engine is blocked on this.
6. **Multi-branch future** — resolved as "no chapter dimension now"; cheap insurance is keeping the branch name in content rather than hard-coded.
7. **Domain and email sending identity** — the branch cannot use the national body's domain; needs its own.
8. **Department student rolls** — if shared, membership review becomes a matric-number lookup; if not, fallback is collecting matric after approval.
9. **Assessment engine** — built-in quiz vs integration with an existing tool.
10. **Mobile app** — PWA (built for attendance) vs native. PWA may already satisfy the need.
11. **Is Tech-U mail Google Workspace-backed?** If yes, "Continue with Google" is a simple addition; if no, it's a dead end.
12. **Object storage choice** — Neon Object Storage vs Vercel Blob vs Cloudflare R2.

**Outstanding artwork** (from DESIGN_PLAN.md §2.2):
- Square icon mark for favicons, app icons, avatars (full crest is illegible below ~40px).
- Official vector logo file from the secretariat (current SVG is sampled from raster artwork).
- Branding sign-off from the national body (needed before certificates can carry institutional weight).
- Confirmation of the written form: "NiMechE" vs "NIMechE"; "SF" expansion.

---

## 8. Conclusions and Recommendations

### 8.1 What is going well

- **The planning documents are exceptional in quality.** The design plan and dev plan together are thorough, internally consistent, and unusually honest about trade-offs and open questions. They are genuinely useful references, not post-hoc documentation.
- **The implemented code follows the plans faithfully.** The auth flow, member queries, schema constraints, and component patterns all match what the documents specify.
- **The token architecture is correctly implemented.** `tokens.css` → `globals.css` → Tailwind utilities works as described. The design system will scale cleanly.
- **Security fundamentals are solid.** bcrypt cost 12, timing-safe auth responses, single-use hashed tokens, `?next=` off-site rejection, `onDelete: Restrict` on credentials — all implemented correctly.
- **Testing discipline is real.** E2E tests cover the specific friction-budget scenarios (sign-up field count, duplicate rejection, timing-safe password responses). Unit tests cover format utilities and validation schemas.

### 8.2 What needs attention before Phase 1 is complete

1. **Offline attendance capture (P0 — highest risk).** This is the linchpin: everything downstream (certificates, skills, analytics) depends on attendance data being captured correctly. The design and data model are right (`clientEventId` idempotency key is in the schema). The implementation — IndexedDB local queue, background sync, browser camera API for QR — has not started. It must be built and tested at a real event before any other Phase 1 item is signed off.

2. **Certificate PDF generation.** The `disabled` buttons on the certificates page are placeholders for this. Until it is built, the platform cannot fulfil its core promise of zero-action certificate delivery.

3. **`Role`, `MemberRole`, `Project`, `AuditLog`, `CompletionRule`, `ActivityCompletion`, `Album`, `MediaItem` tables.** The schema comment lists them as "specified only". Several Phase 1 features are blocked on them.

4. **The object storage decision** (Recommendation: Neon Object Storage, since it branches with the project and keeps database + files in sync on preview deploys — a genuine operational advantage at this scale).

5. **Email deliverability setup** before the first send: SPF, DKIM, and DMARC on the sending domain. A certificate email in spam is a support ticket and undermines the platform's core value.

6. **Branding sign-off.** Certificates printed without confirmed branding approval from the national body carry limited institutional weight. This is the single item most likely to affect the perceived value of the whole platform and is not a technical problem.

7. **Storybook component library.** Planned for Phase 1 foundations. Worth setting up before the admin console is built — the screens are more complex and the library will prevent component drift.

### 8.3 Risks to watch

The risk the development plan identifies as the top one — "it works, but people find WhatsApp easier" — is real and the most dangerous failure mode. The friction budgets exist specifically to prevent it. The executive team must be involved in testing the attendance capture screen at a real event before any launch, and executive adoption is the only metric that matters at the pilot phase.

The one continuity risk not yet addressed in the codebase: the domain, Neon project, Vercel account, and email sender must be owned by the branch office (or an association email), not a student's personal account. A domain held by someone who graduates and stops answering is a common and difficult-to-recover failure mode. This is worth resolving before the domain is purchased.

---

*Report ends. No files were modified during this investigation.*
