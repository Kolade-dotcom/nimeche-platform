# NiMechE Digital Member Development Platform — Development Plan

**Status:** Draft v1 for technical review
**Scope:** Engineering plan for the platform described in *NiMechE Digital Member Development Platform — Presidential Proposal*.
**Companion document:** [`docs/design/DESIGN_PLAN.md`](../design/DESIGN_PLAN.md) — brand, colour, components, screens, accessibility.

This document covers **how the platform gets built**: architecture, stack, data model, subsystems,
delivery phases, operations and risk. It does not re-decide visual questions — those are settled in
the design plan, and §2.2 below lists the contracts this plan is bound by.

---

## 1. Engineering constraints

The constraints that actually shape this build are organisational, not technical. Getting these
wrong is what kills association software.

| Constraint | Consequence for the plan |
|---|---|
| **The executive turns over every year** | The system must be operable by whoever inherits it. Boring, well-documented, mainstream technology beats clever technology. Every runbook is written as if the author has graduated. |
| **The dev team is small, part-time and volunteer** | One language across front and back end. Managed services over self-hosted infrastructure. No microservices. |
| **Budget is association-scale, not company-scale** | Target under $30/month at MVP scale (§10.4). Free tiers are a legitimate architecture input, but never a single point of failure for member records. |
| **Members are on cheap Android phones and unreliable data** | Mobile-first, small payloads, and genuine offline handling on the one flow that needs it (§6.4). |
| **Records must outlive the platform** | Certificates and member history are the product. Export must work from day one, and data must never be locked into a vendor's proprietary format. |
| **Nigeria Data Protection Act 2023 applies** | Members are data subjects; the association is a data controller. Lawful basis, minimisation, retention and export are build requirements, not paperwork (§9.2). |

**The maintainability rule:** if a feature cannot be explained to next year's technical officer in
one page, it is too clever for this project.

---

## 2. Architecture

### 2.1 Shape

A single deployable application with a managed Postgres database behind it — a modular monolith,
not a set of services.

```
                     ┌──────────────────────────────────────────┐
   Public visitor ──▶│  Next.js app (App Router, TypeScript)    │
   Member         ──▶│                                          │
   Executive      ──▶│  • Public pages   — server-rendered      │
                     │  • Member portal  — auth-gated           │
                     │  • Admin console  — role-gated           │
                     │  • API routes     — /api/*               │
                     └───────┬──────────────────────┬───────────┘
                             │                      │
              ┌──────────────▼──────┐    ┌──────────▼────────────┐
              │  Postgres           │    │  Object storage       │
              │  (members, events,  │    │  (covers, evidence,   │
              │   credentials,      │    │   generated PDFs)     │
              │   skills, opps)     │    └───────────────────────┘
              └──────────────┬──────┘
                             │
              ┌──────────────▼──────────────────────────────────┐
              │  Background workers                              │
              │  • certificate PDF render                        │
              │  • OG image generation                           │
              │  • email / notification dispatch                 │
              │  • nightly analytics rollup                      │
              └──────────────────────────────────────────────────┘
```

Internally the code is organised by domain module — `membership`, `events`, `attendance`,
`credentials`, `skills`, `opportunities`, `projects`, `content`, `analytics` — each owning its
tables, its business rules and its API surface. Modules talk through explicit service functions,
never by reaching into each other's tables. That boundary is what allows any one of them to be
extracted later if it ever needs to be, without paying distributed-systems costs now.

### 2.2 Contracts inherited from the design plan

Three commitments this plan must honour, carried over from the design plan's §18:

1. **`docs/design/tokens.css` is the single source of visual truth.** No component hard-codes a colour; no component references a ramp step directly, only semantic tokens. This is enforceable in CI with a lint rule that fails on hex literals outside the token file.
2. **Attendance capture is P0 and must work offline.** Certificates, skills, the development record and every analytics number depend on data being captured in a noisy hall on a bad connection. It is built first, in Phase 1, not deferred.
3. **Two contrast rules are non-negotiable:** never `#EE7623` as text on a light surface, never `#008A45` as body text on white. Both are easy mistakes precisely because they are the logo colours; the CI contrast check (§9.5) exists to catch them.

---

## 3. Stack

### 3.1 Recommendation

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Next.js (App Router) + TypeScript** | Server-rendered public pages for the SEO and visibility goals in proposal §11, a client-rendered portal behind auth, and API routes — all in one codebase and one language. Largest hiring/volunteer pool of any option. |
| **Database** | **PostgreSQL** | Relational data with real integrity constraints. Member records are the asset; they belong in a database with foreign keys, not a document store. |
| **Data access** | **Prisma** | Typed schema, generated client, migration history that is readable in review. |
| **Auth, DB hosting, storage** | **Supabase** | Bundles managed Postgres, auth (email/password, magic link, Google), row-level security and object storage. One vendor to administer instead of four — decisive for a volunteer team. Plain Postgres underneath, so it is not a lock-in trap. |
| **Hosting** | **Vercel** (app) + Supabase (data) | Zero-ops deploys from Git, preview deploys per pull request, generous free tier. |
| **Styling** | **Tailwind CSS wired to `tokens.css`** | Tailwind's theme reads the CSS custom properties, so utilities resolve to design tokens and the token file stays authoritative. |
| **Email** | **Resend** or **Postmark** | Transactional deliverability matters — a certificate email in spam is a support ticket. |
| **PDF rendering** | **Headless Chromium** (`@sparticuz/chromium` on serverless, or a small container) | The certificate is rendered from the same HTML template shown on screen, so print and screen can never diverge (design plan §14). |
| **Charts** | **Recharts** or **visx**, palettes from `tokens.css` | Chart colours come from the validated `--chart-*` tokens, never from a library default. |
| **Testing** | Vitest (unit), Playwright (E2E) | |
| **Error tracking** | Sentry (free tier) | |

### 3.2 Alternatives considered

- **Django or Laravel.** Excellent admin scaffolding, and either would ship the CRUD faster. Rejected because it splits the codebase across two languages, and the public site's performance and SEO requirements push toward a modern rendering framework anyway. Reconsider if the volunteer team's actual skills are Python or PHP — **team skill beats framework merit**, and this is the one place to overrule the recommendation.
- **WordPress + membership plugins.** Fastest to a public website; a dead end for the credential, skill and analytics model, which is the entire point of the proposal. Rejected.
- **Firebase / Firestore.** Good offline support out of the box, but the data is deeply relational (members ↔ events ↔ credentials ↔ skills) and reporting on it in a document store would become the project's main source of pain. Rejected.
- **Self-hosted VPS.** Cheaper at scale and fully controlled, but the operational burden lands on a volunteer with a degree to finish. Reconsider only if the association gets sustained technical staffing.

---

## 4. Data model

Core entities. Names are indicative; the point is the shape and where the integrity rules sit.

```
Member
  id, email(unique), phone, full_name, handle(unique, nullable)
  institution_id, department, level, graduation_year
  membership_number(unique), status(pending|active|lapsed|alumni)
  interests[], bio, avatar_url
  public_profile_enabled(bool, default false)   ← opt-in, design plan §17.4
  theme_preference(light|dark|system)
  created_at, verified_at

Role            id, key(member|admin|content|project_lead|partner), label
MemberRole      member_id, role_id, scope(nullable: chapter/project)   ← many-to-many

Event
  id, slug(unique), title, description, cover_url
  mode(online|physical|hybrid), venue, meeting_url
  starts_at, ends_at, timezone, capacity
  status(draft|published|cancelled|completed)
  completion_rule_id                              ← see §6.5
  published_at, created_by

EventRegistration
  id, event_id, member_id, registered_at, source
  status(registered|waitlisted|cancelled)
  UNIQUE(event_id, member_id)

AttendanceRecord
  id, event_id, member_id
  checked_in_at, checked_out_at, duration_minutes
  method(manual|qr|self|import), recorded_by
  client_event_id(unique)                         ← idempotency key, see §6.4
  UNIQUE(event_id, member_id)

CompletionRule
  id, name
  requires_attendance(bool), min_duration_minutes
  requires_feedback(bool), requires_assessment(bool), min_score
  requires_manual_approval(bool)

ActivityCompletion
  id, member_id, source_type(event|project|opportunity|mentorship), source_id
  completed_at, approved_by, evidence_url
  UNIQUE(member_id, source_type, source_id)

Credential                                        ← a certificate
  id, member_id, activity_completion_id
  programme_title, issued_on, template_id
  verification_code(unique, indexed)              ← e.g. NM-7K4Q-2X9
  pdf_url, share_image_url
  status(valid|revoked), revoked_at, revoked_reason, revoked_by

Skill           id, name(unique), category
MemberSkill
  id, member_id, skill_id
  level(exposure|developing|demonstrated|verified)
  evidence_count, verified_by, verified_at, last_advanced_at
  UNIQUE(member_id, skill_id)
ActivitySkill   source_type, source_id, skill_id, contributes_level

Opportunity
  id, slug(unique), title, organisation, type(internship|job|scholarship|
     competition|grant|conference|training|volunteering)
  description, location, is_remote, deadline
  external_url(nullable), registration_mode(internal|external|both)
  status(submitted|under_review|published|closed|rejected)
  submitted_by, reviewed_by, published_at

OpportunityInterest
  id, opportunity_id, member_id, registered_at
  status(interested|applied|shortlisted|finalist|awarded|completed|unsuccessful)
  outcome_note, recorded_by
  UNIQUE(opportunity_id, member_id)

Project
  id, slug(unique), title, description, status(proposed|active|completed)
  started_on, completed_on, lead_member_id, is_public
ProjectMember   project_id, member_id, role, joined_at, contribution_note
ProjectMilestone project_id, title, due_on, completed_on, status

ContentItem     id, slug, type(news|spotlight|resource|page), title, body,
                cover_url, status, published_at, author_id

AuditLog        id, actor_id, action, entity_type, entity_id, diff(jsonb), created_at
```

**Rules worth stating explicitly, because they are where this model earns its keep:**

- **`AttendanceRecord.client_event_id` is unique.** It is the idempotency key that makes offline check-in replay safe (§6.4). Without it, a flaky sync double-counts attendance and corrupts every downstream number.
- **`Credential` is immutable once issued.** Corrections happen by revoking and re-issuing, never by editing. A certificate whose content can silently change is not a credential, and the verification page would be lying.
- **`Credential` survives membership lapse.** A graduate whose membership ends keeps their record; `/verify/:code` must still resolve years later. This constrains the retention policy (§9.2) and rules out cascading deletes on `Member`.
- **`MemberSkill.level` is derived, never hand-set** (except `verified`, which requires a named human). See §6.6.
- **`AuditLog` covers every admin mutation.** Attendance edits, certificate revocation and role grants are exactly the actions a future executive will need to reconstruct.

---

## 5. Authentication and authorisation

**Authentication.** Email + password with verification, plus magic link (students lose passwords),
plus Google sign-in. Sessions are HTTP-only cookies. Phone number is collected but not used as an
auth factor in v1.

**Membership is not the same as an account.** Anyone can create an account; membership `status`
moves `pending → active` only after an executive verifies the person against the association's own
records. Portal features that imply membership are gated on `status = active`, not on being signed in.

**Authorisation** is role-based, checked in three places, deliberately redundant:

1. **Route level** — middleware rejects an unauthorised request before any handler runs.
2. **Service level** — every service function takes the acting member and asserts its own permission. This is the layer that actually protects the data, because it cannot be bypassed by a new caller.
3. **Database level** — Postgres row-level security as defence in depth, so a bug in application code cannot leak another member's records.

**UI filtering is not authorisation.** Hiding a nav item is a courtesy; the checks above are the control.

Roles map to proposal §14 — Member, Executive/Admin, Content Manager, Project Lead, Partner
Contributor. `MemberRole.scope` allows a Project Lead to hold authority over one project rather than
all of them.

---

## 6. Subsystems

### 6.1 Membership lifecycle

Register → verify email → complete profile → executive review → active. Bulk import from the
association's existing spreadsheet on day one (CSV with a dry-run preview and a per-row error
report — a bulk importer that fails on row 400 without telling you why will be abandoned).
Lapsed and alumni states preserve history and public profile visibility, and revoke portal write
access.

### 6.2 Events and registration

CRUD with draft/published states, capacity and waitlist, registration open/close windows, and
`.ics` calendar export. A public `Event` structured-data block on every detail page — the SEO
requirement from proposal §11 is a concrete build task, not a nice-to-have.

### 6.3 Certificate generation and verification

- Rendered server-side from **one HTML template** — the same one the certificate viewer shows on screen (design plan §14).
- Rendering happens in a **background job**, not in the request. Bulk issuance for a 200-person webinar must not time out a web request.
- PDFs are stored in object storage; the database keeps the URL. Regeneration is possible from stored data if a template changes, but **the verification code and issued content never change**.
- `verification_code` is a short, human-readable, non-sequential code (`NM-7K4Q-2X9`) — non-sequential so codes cannot be enumerated to discover who holds what.
- `/verify/:code` is public, unauthenticated, cached, and returns a deliberately plain document-like page. Revoked credentials return an explicit "this certificate was revoked" state — never a 404, which reads as "the site is broken" rather than "this is not valid".
- Revocation requires typing the certificate code and writes an `AuditLog` entry.

### 6.4 Attendance capture and offline sync — **P0**

The highest-risk component in the system (design plan §9.3). Used by an executive standing at a
hall door, on a phone, on bad network.

**Client.** Installable PWA. On opening an event's attendance screen, the full registered-member
list for that event is cached locally (IndexedDB). Check-in writes to a local queue **first** and
renders immediately — the UI never waits on the network. A visible banner shows queued count and
sync state.

**Sync.** A background sync flushes the queue to `POST /api/events/:id/attendance/bulk`. Each
queued item carries a client-generated `client_event_id` (UUID). The server upserts on
`UNIQUE(event_id, member_id)` and ignores a `client_event_id` it has already seen.

**Why this is safe.** Check-in is idempotent by nature — a member is either present or not, and
replaying the same check-in produces the same row. There is no merge conflict to resolve, which is
what makes offline-first tractable here and why this is the only flow that gets it.

**Also supported:** QR check-in (the member's digital card carries a signed, rotating token, scanned
via the browser camera API), manual search-as-you-type, on-the-spot registration for walk-ins, and
CSV import as the fallback when everything else fails.

**Test it for real.** Chrome DevTools offline mode, then an actual event with airplane mode toggled
mid-capture. This flow cannot be signed off from a desk.

### 6.5 Completion rules

A `CompletionRule` attached to an event decides whether attendance becomes an
`ActivityCompletion` — and therefore whether a certificate is issued. It composes: minimum
attendance duration, feedback submitted, assessment passed with a minimum score, manual approval.

Evaluation runs when its inputs change (check-out recorded, feedback submitted, assessment scored)
and again on an event-close job that catches anything missed. This directly implements proposal §5:
"completion should not necessarily be based only on joining a meeting."

Rules are **versioned and snapshotted onto the completion record**. If an executive later edits a
rule, previously issued certificates must not become retroactively unjustified.

### 6.6 Skills engine

`MemberSkill.level` is **derived**, on a documented ladder:

| Level | Derivation |
|---|---|
| Exposure | ≥1 activity tagged with the skill |
| Developing | ≥3 activities, or 1 completed with assessment |
| Demonstrated | Applied in a completed project with a recorded role |
| Verified | Explicit sign-off by a named authority — never automatic |

The thresholds are configuration, not code, so the executive can tune them without a deploy. Every
level shows the activities that produced it — that traceability is what makes the claim credible,
and it is the whole point of goal G4 in the design plan.

**Blocked on a decision:** who is authorised to grant `verified` (design plan §17.5). Until that is
answered, the level exists in the model and is not issuable.

### 6.7 Opportunities Hub

Submission (member, executive, or partner) → review queue → published. Deadline-driven: a nightly
job closes expired opportunities so the hub never shows stale listings — the fastest way to lose
member trust.

**Internal vs external registration** is a first-class distinction (proposal §9.1). An internal
registration records `OpportunityInterest`; an external one records the interest *and* sends the
member to the external URL. Aggregate counts are visible to executives; **individual application
detail is not** — the proposal is explicit about not exposing private application information, and
the API must enforce that, not just the UI.

### 6.8 Analytics

Nightly rollup jobs write to summary tables; dashboards read the summaries, never raw event tables.
This keeps the admin dashboard fast and keeps a heavy query from an executive's laptop off the
transactional path.

Metrics from proposal §13: registered members, active members, event registrations and attendance,
webinar completion rates, certificates issued, popular programmes, opportunity registrations,
project and mentorship participation, growth trends. Every chart ships with a CSV export — an
executive will want the numbers in a report, and if export is missing they will screenshot.

### 6.9 Notifications

Transactional email in Phase 1: verification, membership approved, registration confirmed, event
reminder (24h and 1h), certificate issued, feedback request. An in-app notification centre and
digest emails ("3 new opportunities match your interests") come in Phase 2.

Every non-transactional email has an unsubscribe link and honours the preference. The sending domain
needs SPF, DKIM and DMARC configured before the first send, or certificate emails land in spam.

---

## 7. API and code conventions

- REST under `/api`, resource-shaped, plural nouns. Server Components read through service functions directly; the API exists for client mutations, the PWA sync and any future mobile app.
- **Validation at every boundary with Zod**, on the server. Client validation is UX; server validation is the actual rule.
- Consistent error envelope: `{ error: { code, message, details? } }`. `code` is machine-readable and stable; `message` is human-readable and safe to display.
- Money and dates: store UTC timestamps, render in `Africa/Lagos` (WAT). Never store a naive local datetime.
- Migrations are forward-only and reviewed like code. No hand-edits to production data without a migration or a logged admin action.
- Feature branches, PR review by at least one other person, squash merge. Conventional commit messages.

---

## 8. Frontend implementation notes

- **Public pages are server-rendered and cached**; the portal is client-rendered behind auth. This split is what lets the public site hit the performance budget while the portal stays interactive.
- **Tailwind's theme maps to `tokens.css` custom properties**, so a utility class resolves to a semantic token and the theme swap is automatic.
- **Theme init** is the inline pre-paint script from design plan §5, plus persistence of `theme_preference` on the member record so it follows them across devices.
- **Component library is built once, in Phase 1**, against the design plan's §8 spec, with Storybook. Screens compose it; screens do not invent components.
- **Performance budget: ≤150KB JS, ≤60KB CSS gzipped on public pages, LCP under 2.5s on a mid-range Android over 3G.** Enforced in CI (§9.5), because a budget nobody measures is a wish.
- **Fonts** subset to Latin, `font-display: swap`, preloaded. Sora is dropped first if the budget bites.
- **Images** through the framework's image pipeline: WebP/AVIF, responsive `srcset`, lazy below the fold, explicit dimensions so nothing shifts.
- **The logo ships as SVG** — a raster crest at retina sizes is a surprisingly large asset for something on every page.

---

## 9. Non-functional requirements

### 9.1 Security

- Argon2id password hashing (Supabase default), rate limiting on auth endpoints, generic failure messages that do not reveal whether an account exists.
- Every mutation authorised at the service layer (§5), with RLS underneath.
- File uploads: type and size validated server-side, stored outside the app origin, never executed.
- Secrets in environment variables only; **no secrets in the repository**, enforced by secret scanning in CI.
- Dependency audit on every build; a scheduled monthly patch window.
- Certificate verification is public by design but rate-limited, and codes are non-enumerable.

### 9.2 Privacy and data protection (NDPA 2023)

The association is a data controller under the Nigeria Data Protection Act 2023. Build requirements:

- **Lawful basis and a real privacy notice** at registration, in plain language, saying what is collected and why.
- **Data minimisation** — collect what a stated feature needs. If a field has no consumer, it does not go in the form.
- **Public profiles are opt-in**, defaulting off (design plan §17.4), with a preview of exactly what becomes public before the member enables it.
- **Individual opportunity application detail is not visible to executives** (§6.7).
- **Export and deletion**: a member can export their full record as JSON + their certificate PDFs, and can request deletion. Deletion anonymises the member record while **retaining issued credentials and aggregate counts** — a certificate must remain verifiable, and the association's historical statistics must not silently change. This tension is real and the resolution needs executive sign-off (§13.3).
- **Retention policy** written down before launch, not after the first request.

### 9.3 Availability and backups

- Daily automated Postgres backups with **a documented, actually-rehearsed restore procedure**. An untested backup is not a backup.
- Weekly off-platform export of core tables (members, credentials, attendance) to storage the association controls independently of the hosting vendor. This is the answer to "what if the free tier disappears" and to "records must outlive the platform".
- Uptime target: 99% for the portal, higher for `/verify/:code` since it is read by third parties and is nearly free to cache.

### 9.4 Observability

Sentry for errors; structured request logging; an uptime check on the homepage, the portal and the
verification endpoint. One alerting channel that the current technical officer actually reads —
a dashboard nobody opens is not monitoring.

### 9.5 CI/CD and testing

| Gate | Runs on |
|---|---|
| Typecheck, lint, format | Every push |
| **Design-token lint** — fails on hex literals outside `tokens.css` (§2.2) | Every push |
| Unit tests (Vitest) — rules engines, permissions, skill derivation | Every push |
| E2E (Playwright) — register, sign in, register for event, capture attendance offline, issue and verify certificate | Every PR |
| **Accessibility scan** (axe) on key pages, both themes | Every PR |
| **Contrast check** against the design plan's §3.4 table | Every PR |
| Lighthouse budget check on public pages | Every PR |
| Migration dry-run against a production clone | Before deploy |

Environments: **local → preview (per PR) → staging → production**. Staging carries anonymised data.
Production deploys from `main` only.

---

## 10. Delivery plan

Phases follow the proposal's §17 implementation approach. Effort is expressed in **weeks of a small
part-time team (2–3 people)**, and these are planning bands, not commitments — they will move once
the team is real and the open decisions in §13 are answered.

### 10.1 Phase 0 — Foundations *(≈2–3 weeks)*

Repo, CI, environments, Supabase project, Prisma schema for the core entities, auth, roles and
permission layer, design-token integration, component library skeleton with Storybook.

**Exit:** a signed-in user can see an empty portal; CI gates run; a deploy pipeline works end to end.
*Depends on:* the vector logo (design plan §2.2) before any UI is finalised.

### 10.2 Phase 1 — MVP *(≈8–12 weeks)*

Covers the proposal's §15 MVP table.

1. Public site: home, about, events, opportunities, news, resources, contact, join.
2. Membership: registration, verification, profile, executive review queue, CSV import.
3. Events: CRUD, registration, reminders.
4. **Attendance capture with offline sync (§6.4)** — built early in the phase, not late.
5. Completion rules + feedback/assessment capture.
6. Certificates: generation, viewer, download, `/verify/:code`.
7. Opportunities Hub: submission, review, publishing, interest tracking.
8. Projects: basic records and participation.
9. Admin console + basic analytics.
10. Transactional email.

**Exit:** a real NiMechE event runs end to end on the platform — announced, registered, attended,
completed, certified, verified.

### 10.3 Pilot *(≈3–4 weeks, overlapping)*

Proposal §17 calls for a limited pilot, and it should be treated as a phase with its own budget.
Run 2–3 real events with a limited member group. Instrument everything. Expect the attendance flow
and the registration form to need rework — those are where real conditions differ most from a desk.
Fix, then open to the wider membership.

### 10.4 Phase 2 — Expansion *(post-launch, prioritised by pilot findings)*

Mentorship matching, public member profiles (`/u/:handle`), CV and portfolio export, notification
centre and digests, digital membership cards, membership renewal and payments (Paystack or
Flutterwave), advanced skill verification, partner/employer portal, advanced analytics, mobile app.

**Sequencing note:** payments should come only after the membership model and tiers are settled
(§13.2). Building billing on an undecided membership structure is rework with financial consequences.

### 10.5 Indicative running cost (MVP scale)

| Item | Monthly |
|---|---|
| Hosting (Vercel Hobby/Pro) | $0–20 |
| Database + auth + storage (Supabase) | $0–25 |
| Email (transactional, low volume) | $0–15 |
| Domain | ~$1 amortised |
| Error tracking (Sentry free) | $0 |
| **Total** | **$0–60**, realistically **under $30** at launch volumes |

The free tiers are genuinely adequate at association scale. The paid tiers become necessary at
roughly 1,000+ active members or when backup retention needs to exceed the free window — and
**backup retention is the line worth paying for first**, ahead of any performance tier.

---

## 11. Team and continuity

| Role | Responsibility |
|---|---|
| Technical lead | Architecture, review, deploys, the handover document |
| Developer(s) | Feature delivery |
| Design owner | Owns `tokens.css` and the component library against the design plan |
| Executive product owner | Prioritisation, the open decisions in §13, pilot coordination |

**Continuity is a deliverable, not an afterthought** — this is the constraint that most often kills
association software. Required before the technical lead hands over:

- A `README` that gets a new developer running locally in under 30 minutes.
- `docs/dev/RUNBOOK.md`: deploy, rollback, restore from backup, rotate secrets, add an executive, issue a certificate manually.
- `docs/dev/ARCHITECTURE.md`: why the significant decisions were made, including the rejected options in §3.2.
- Association-owned accounts for **every** vendor — never a personal student account for the domain, the database or the email sender. Recovering a domain from a graduate who has stopped answering is a genuinely common failure mode.
- A named successor with production access **before** the outgoing lead leaves.

---

## 12. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Attendance capture fails in the field** | Everything downstream is empty; the platform's premise collapses | P0, offline-first, idempotent sync, rehearsed at a real event before launch (§6.4) |
| **Executive turnover strands the system** | Abandonment within a year | §11 continuity requirements; association-owned accounts; mainstream stack |
| **Content goes stale after launch** | Members stop returning; the hub loses credibility | Proposal §12's content cycle needs an owner and a schedule, not just a CMS; auto-close expired opportunities |
| **Volunteer capacity evaporates mid-build** | Phase 1 stalls half-finished | Ship MVP modules in independently useful slices; each phase exit is a working product, not a partial one |
| **Certificates issued on wrong or edited rules** | Credibility damage — the hardest thing to repair | Rules versioned and snapshotted (§6.5); credentials immutable; revocation audited |
| **Data loss** | Irrecoverable member history | Daily backups, rehearsed restores, independent weekly exports (§9.3) |
| **Free tier limits or vendor pricing changes** | Sudden outage or forced migration | Plain Postgres, no proprietary lock-in, independent exports, documented migration path |
| **Scope creep from the "future expansion" list** | MVP never ships | Phase 2 is explicitly gated behind a working pilot |
| **NDPA non-compliance** | Legal and reputational exposure | §9.2 built in from the start, not retrofitted |

---

## 13. Open technical decisions

Some depend on the executive answering the design plan's §17; those are marked.

1. **Team's actual language skills** — the one input that could legitimately overrule §3.1.
2. **Membership tiers and whether renewal/payment is in scope for year one** *(design plan §17.3)* — determines whether Phase 2 billing is planned now or deferred.
3. **Deletion vs credential retention** (§9.2) — needs an executive decision on how a deletion request interacts with issued certificates and historical statistics.
4. **Who may grant a `verified` skill** *(design plan §17.5)* — §6.6 is blocked on this.
5. **Chapters and branches** *(design plan §17.2)* — whether the data model needs a chapter dimension on members, events and roles. **Cheap to add now, expensive to retrofit**, so this one should be answered early even if chapters ship later.
6. **Domain, and the email sending identity** for certificate verification links *(design plan §17.9)*.
7. **Assessment engine scope** — a simple built-in quiz, or an integration with an existing tool.
8. **Whether the mobile app in proposal §16 is a PWA or native.** The PWA built for attendance (§6.4) may already satisfy the need, at a fraction of the cost.

---

## 14. Relationship to the design plan

The two documents divide as follows:

| Question | Answered in |
|---|---|
| What does it look like, and why those colours? | [Design plan](../design/DESIGN_PLAN.md) §2–§7 |
| What components exist and how do they behave? | Design plan §8 |
| What screens exist and what is on them? | Design plan §9–§10, §14–§15 |
| What are the accessibility rules? | Design plan §11 (this plan enforces them in CI, §9.5) |
| What is it built with, and how is it structured? | This plan §2–§3 |
| What is the data model and how do the subsystems work? | This plan §4–§8 |
| How is it secured, operated, tested and deployed? | This plan §9 |
| When does it ship, at what cost, and what could go wrong? | This plan §10–§13 |

Where they overlap — performance budgets, phasing, the token layer — **the design plan states the
requirement and this plan states the enforcement**.
