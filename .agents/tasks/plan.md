# NiMechE-SF Platform — Phase 1 MVP Implementation Plan

**Produced by:** Kiro planner agent  
**Date:** 2025  
**Source documents:** project-investigation.md, docs/dev/DEV_PLAN.md, docs/design/DESIGN_PLAN.md,
prisma/schema.prisma, package.json, src/ tree.

---

## Ambiguities resolved

Before the numbered plan, decisions that were open in the design docs:

1. **Object storage:** Using `@vercel/blob`. Neon Object Storage is still in preview; Vercel Blob
   is stable, free-tier available, and integrates with the Vercel deployment without a second
   service dashboard. Decision can be swapped by replacing the one blob helper — no schema change.

2. **`@sparticuz/chromium` vs alternatives for PDF:** Use `@sparticuz/chromium` + `puppeteer-core`
   as the dev plan specifies. This is the only option confirmed to work on Vercel serverless functions
   (Lambda-compatible). Size concern is real (~50MB layer) but workable at this scale.

3. **`Role.key` values:** Using `MEMBER | EXECUTIVE | ADMIN`. The dev plan names five roles; for
   Phase 1 the UI-enforced distinction is "can reach /admin or not". EXECUTIVE = read+write admin;
   ADMIN = all of EXECUTIVE plus role management and settings. MEMBER is the default. Content
   Manager, Project Lead, Partner roles are added to the schema but not wired to UI gates in Phase 1.

4. **`CompletionRule` triggering:** Evaluation runs at check-out time (event ended) via a server
   action / API route called by the admin screen when marking an event complete. No background job
   infrastructure needed in Phase 1 — a button-triggered action covers the use case.

5. **Skills derivation write-protection:** The schema already enforces this via "no write path for
   member." A server action is gated with `requireRole(EXECUTIVE | ADMIN)` for the `VERIFIED` level;
   the derivation engine itself runs as a server-side function, never exposed as a public endpoint.

6. **`MediaItem` vs `MediaAsset`:** The Phase 1 prompt names it `MediaItem`; the existing schema
   comment says `MediaAsset`. Using `MediaItem` (matches P6 spec and the gallery subsystem).

7. **Transactional email format:** Staying with plain-text `deliver()` in `src/lib/email.ts`
   (already built). New email functions are added to that file. HTML emails are Phase 2.

8. **`slug` field on Event:** Already in the schema. Public event routes use `slug`. Where a slug is
   not yet set on existing events, fall back to `id`.

---

## Implementation Plan

- [ ] 1. **Schema completion: new tables and enums (P0 — blocks all other features)**

  Add to `prisma/schema.prisma`:
  - `RoleKey` enum: `MEMBER | EXECUTIVE | ADMIN | CONTENT_MANAGER | PROJECT_LEAD`
  - `Role` model: `id, key(RoleKey, unique), label`
  - `MemberRole` model: `id, memberId, roleId, grantedBy, grantedAt` with unique `(memberId, roleId)`
  - `AuditAction` enum covering: `MEMBER_APPROVED | MEMBER_REJECTED | ROLE_GRANTED | ROLE_REVOKED |
    EVENT_PUBLISHED | EVENT_CANCELLED | ATTENDANCE_EDITED | CREDENTIAL_ISSUED | CREDENTIAL_REVOKED |
    OPPORTUNITY_PUBLISHED | OPPORTUNITY_REJECTED | SETTINGS_UPDATED`
  - `AuditLog` model: `id, actorId(→Member, SetNull), action(AuditAction), entityType, entityId,
    diff(Json?), createdAt`
  - `CompletionRuleKind` enum: `ATTENDANCE_ONLY | ATTENDANCE_PLUS_DELIVERABLE | MANUAL_APPROVAL`
  - `CompletionRule` model: `id, name, kind, minContactHours, requiresDeliverable, requiresAssessment,
    minScore, createdAt`
  - Add `completionRuleId` (optional FK) to `Event`
  - `ActivityCompletion` model: `id, memberId, sourceType(EventCompletion|ProjectRole),
    sourceId, completedAt, approvedBy(→Member?), completionRuleId(→CompletionRule?)` with
    unique `(memberId, sourceType, sourceId)`
  - `Album` model: `id, slug(unique), title, description, coverUrl, eventId(→Event, optional),
    publishedAt, createdBy(→Member), createdAt`
  - `MediaItem` model: `id, albumId(→Album), url, thumbnailUrl, altText, kind(PHOTO|VIDEO_LINK),
    width, height, uploadedBy(→Member), createdAt`
  - `Project` model: `id, slug(unique), title, description, status(PROPOSED|ACTIVE|COMPLETED),
    startedOn, completedOn, leadMemberId(→Member?), isPublic(bool, default false), createdAt`
  - `ProjectMember` model: `projectId(→Project), memberId(→Member), role, joinedAt,
    contributionNote` with PK `(projectId, memberId)`
  - `ProjectMilestone` model: `id, projectId(→Project), title, dueOn, completedOn,
    status(PENDING|DONE)`

  Run `npx prisma migrate dev --name phase1-schema`.

  Files: `prisma/schema.prisma`  
  Verify: `npx prisma migrate dev --name phase1-schema` completes without error; `npx prisma generate`
  succeeds; `npm run typecheck` passes.

---

- [ ] 2. **Role/auth service: `requireRole`, admin session helper**

  Create `src/lib/auth/roles.ts`:
  - `requireRole(allowedKeys: RoleKey[])` — calls `requireMember()`, then queries `MemberRole` for
    the member; throws redirect to `/sign-in` if no matching role. Returns `{ member, roles }`.
  - `getMemberRoles(memberId)` — cached query returning `RoleKey[]` for the member.
  - `grantRole(actorId, targetMemberId, roleKey)` — writes `MemberRole` + `AuditLog` row.
  - `revokeRole(actorId, targetMemberId, roleKey)` — deletes `MemberRole` + `AuditLog` row.

  Create `src/lib/auth/audit.ts`:
  - `logAudit({ actorId, action, entityType, entityId, diff? })` — writes an `AuditLog` row.
    Returns void. Never throws — if the write fails, log to console and continue.

  Update `src/proxy.ts`: extend the `authorized` callback (already in `authConfig`) by checking
  `/admin` prefix against session token's role. Since the JWT only carries `memberId`/`status`,
  the proxy cannot query Postgres; instead, mark the JWT with `isAdmin: boolean` in the `jwt`
  callback in `src/auth.ts` by querying `MemberRole` at login time. Update `src/auth.ts`'s jwt
  callback to set `token.isAdmin = true` if the member has EXECUTIVE or ADMIN role. Update
  `src/auth.config.ts`'s `authorized` callback to check `auth?.user?.isAdmin` for `/admin` routes.

  Files: `src/lib/auth/roles.ts`, `src/lib/auth/audit.ts`, `src/auth.ts`, `src/auth.config.ts`  
  Verify: `npm run typecheck` passes.

---

- [ ] 3. **Admin shell: layout, sidebar, nav**

  Create `src/app/(admin)/layout.tsx`:
  - Calls `requireRole([EXECUTIVE, ADMIN])` (redirect to `/sign-in` if not authorised).
  - Renders `<AdminShell>` wrapping children.

  Create `src/components/admin/admin-shell.tsx`:
  - Left sidebar (collapsible on mobile) with nav items: Overview, Members, Events, Certificates,
    Opportunities, Settings.
  - Top bar with user avatar + name + sign-out.
  - Same token-only colour approach as `member-shell.tsx`; touch targets ≥44px; visible focus rings.
  - Nav items in `src/components/admin/admin-nav-items.ts`.

  Create `src/app/(admin)/page.tsx` (redirect to `/admin/overview`) and
  `src/app/(admin)/overview/page.tsx` (stub with "Admin overview coming soon" until step 9).

  Files: `src/app/(admin)/layout.tsx`, `src/app/(admin)/page.tsx`,
  `src/app/(admin)/overview/page.tsx`, `src/components/admin/admin-shell.tsx`,
  `src/components/admin/admin-nav-items.ts`  
  Verify: `npm run typecheck` passes; navigating to `/admin` as a non-executive member redirects
  to `/sign-in`.

---

- [ ] 4. **Service layer: events, members, opportunities (public queries)**

  Create `src/lib/events/queries.ts`:
  - `getPublishedEvents(filter?: { kind?, upcoming?: bool })` — returns events with `status =
    'published'` (add `status` field to `Event` schema if not present — the existing schema lacks it;
    add `EventStatus` enum: `DRAFT | PUBLISHED | CANCELLED | COMPLETED` and `status EventStatus
    @default(DRAFT)` field to `Event` in a follow-up migration). For now, return all events ordered
    by `startsAt`.
  - `getEventBySlug(slug)` — returns single event with registration count.
  - `getPublicEventList()` — upcoming + recently past, for the public events page.

  *Pragmatic resolution:* the `Event` model lacks a `status` field (the dev plan specifies it but
  it was not added to the existing schema). Add `EventStatus` enum and `status` field to
  `prisma/schema.prisma` in this step and run a second migration: `npx prisma migrate dev --name
  event-status`.

  Create `src/lib/opportunities/queries.ts`:
  - `getPublishedOpportunities(filter?)` — public-facing list, `status = PUBLISHED`, ordered by
    `closesAt asc`.
  - `getOpportunityBySlug(slug)` — single opportunity detail.
  - `submitOpportunity(data)` — writes new `Opportunity` row with `status = SUBMITTED`; no auth
    required at the call site.
  - `getOpportunitiesForReview()` — returns `SUBMITTED | UNDER_REVIEW` rows, for admin queue.
  - `publishOpportunity(actorId, id)` — sets `status = PUBLISHED` + `AuditLog`.
  - `rejectOpportunity(actorId, id, reason)` — sets `status = REJECTED` + `AuditLog`.

  The existing `Opportunity` model lacks `status`, `slug`, `type`, `description`,
  `externalUrl`, `submittedBy` columns (current schema is minimal). Add these in the
  `event-status` migration above (combining both schema additions into one migration is fine).

  Create `src/lib/gallery/queries.ts`:
  - `getPublishedAlbums()` — returns albums with `publishedAt IS NOT NULL`, ordered newest first.
  - `getAlbumBySlug(slug)` — album with media items.

  Files: `prisma/schema.prisma` (Event.status, Opportunity fields),
  `src/lib/events/queries.ts`, `src/lib/opportunities/queries.ts`, `src/lib/gallery/queries.ts`  
  Verify: `npx prisma migrate dev --name event-status-and-opportunity-fields` succeeds;
  `npm run typecheck` passes.

---

- [ ] 5. **Public: events listing and event detail pages**

  Create `src/app/(public)/events/page.tsx`:
  - Server component; calls `getPublicEventList()`.
  - Shows upcoming events (cards with DateBox, title, kind badge, location, register CTA link) and
    a "Past events" section.
  - Filter bar: All / Plant Visit / Training / Lecture / Careers / Competition (matches `EventKind`
    enum). Filter via URL search param `?kind=`.
  - Empty state: "No events published yet — check back soon."
  - Follows `02-events.html` mockup layout.

  Create `src/app/(public)/events/[slug]/page.tsx`:
  - Calls `getEventBySlug(params.slug)`; 404 if not found.
  - Renders event detail: cover (or generated fallback — green card with title + orange rule),
    title, date/time, mode, location, host, description, registration CTA.
  - CTA: if signed in and registered → "You are registered" badge; if signed in and not registered →
    "Register" button (calls server action); if signed out → "Sign in to register" → `/sign-in?next=
    /events/[slug]`.
  - Structured data: `<script type="application/ld+json">` with `Event` schema — required by
    DEV_PLAN §6.2 for SEO.
  - Follows `03-event-detail.html` mockup.

  Create `src/app/(public)/events/[slug]/actions.ts`:
  - `registerForEvent(eventId)` server action — requires auth; upserts `Registration`; returns
    `{ ok: true }` or `{ error: string }`.

  Files: `src/app/(public)/events/page.tsx`, `src/app/(public)/events/[slug]/page.tsx`,
  `src/app/(public)/events/[slug]/actions.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds (static render test).

---

- [ ] 6. **Public: about page, certificate verification page**

  Create `src/app/(public)/about/page.tsx`:
  - Static server component. Describes the branch: who we are, departments, what we do, exec team
    section (pull from a small static content file).
  - No DB query needed in Phase 1; content lives in `src/lib/content/about.ts`.

  Create `src/lib/content/about.ts` — static branch description content.

  Create `src/app/(public)/verify/[code]/page.tsx`:
  - `export const revalidate = 3600` (ISR, 1-hour cache as DEV_PLAN §6.3 specifies).
  - Calls `verifyCredential(code)` from `src/lib/credentials/verify.ts`.
  - If found + valid: renders certificate details (title, member name, issued date, sessions,
    contact hours, skills, event names). Deliberately plain, no nav chrome (design plan §1.1: "a
    document-like page").
  - If found + revoked: "This certificate was revoked on [date]." — never a 404.
  - If not found: "No certificate found with that code."
  - Writes a `VerificationCheck` row (already in schema).
  - Follows `05-verify-certificate.html` mockup.

  Create `src/lib/credentials/verify.ts`:
  - `verifyCredential(code)` — queries `Credential` by `code`, includes member name, skills,
    events; writes `VerificationCheck`; returns structured result.

  Files: `src/app/(public)/about/page.tsx`, `src/lib/content/about.ts`,
  `src/app/(public)/verify/[code]/page.tsx`, `src/lib/credentials/verify.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 7. **Public: opportunities listing, opportunity submission form**

  Create `src/app/(public)/opportunities/page.tsx`:
  - Calls `getPublishedOpportunities()`.
  - Shows opportunity cards: title, organisation, type badge, deadline, location, description
    excerpt, "Apply" or "Register interest" CTA.
  - Filter bar: All / Internship / Job / Scholarship / Competition / Grant (URL search param `?type=`).
  - "Submit an opportunity" CTA → `/opportunities/submit`.
  - Empty state per design system rules.

  Create `src/app/(public)/opportunities/submit/page.tsx`:
  - Unauthenticated public form (≤6 fields per design plan §1.1: title, organisation, type,
    deadline, description, external URL).
  - Uses react-hook-form + Zod schema `src/lib/validation/opportunity.ts`.
  - Calls `submitOpportunity()` server action; shows success state.

  Create `src/lib/validation/opportunity.ts` — Zod schema for opportunity submission.

  Files: `src/app/(public)/opportunities/page.tsx`,
  `src/app/(public)/opportunities/submit/page.tsx`,
  `src/lib/validation/opportunity.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 8. **Public: gallery landing and album pages**

  Create `src/app/(public)/gallery/page.tsx`:
  - Calls `getPublishedAlbums()`.
  - Shows album grid (cover image, title, event link, photo count).
  - Featured mosaic: the 5 most recent media items across all albums (reuse `<MediaTile>` component
    already in `src/components/media-tile.tsx`).
  - Empty state: "No albums yet — photos will appear here after events."

  Create `src/app/(public)/gallery/[slug]/page.tsx`:
  - Calls `getAlbumBySlug(params.slug)`; 404 if not found.
  - Media grid: responsive, lightbox on click (use a minimal CSS-only lightbox or the Dialog
    from `src/components/ui/dialog.tsx`).
  - Links back to the event it came from (as per design plan §7.1: "every album links back").
  - Follows `04-gallery.html` mockup.

  Files: `src/app/(public)/gallery/page.tsx`, `src/app/(public)/gallery/[slug]/page.tsx`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 9. **Admin: overview dashboard**

  Create `src/lib/admin/queries.ts`:
  - `getAdminOverview()` — returns: `{ totalMembers, pendingMembers, activeMembers, upcomingEvents,
    totalCredentials, openOpportunities, recentAuditLog }` via parallel queries.

  Update `src/app/(admin)/overview/page.tsx` with real data from `getAdminOverview()`:
  - Stat tiles: Members, Pending, Events, Certificates.
  - Pending members alert card linking to `/admin/members?status=pending`.
  - Recent activity list from `AuditLog`.
  - Follows `12-exec-overview.html` mockup layout.

  Files: `src/lib/admin/queries.ts`, `src/app/(admin)/overview/page.tsx`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 10. **Admin: member management (list + detail + approval)**

  Create `src/lib/members/admin.ts` (separate from `src/lib/member/queries.ts` which is for the
  member's own data):
  - `getMemberList(filter?: { status?, search?, department? })` — returns paginated-with-cursor or
    flat list (flat list is correct at this scale per DEV_PLAN §2.4).
  - `getMemberDetail(id)` — full member row + roles + activity + credentials.
  - `approveMember(actorId, memberId, matricNo?)` — sets `status = ACTIVE`, sets `joinedAt`,
    optionally sets `matricNo`; writes `AuditLog`; fires approval email.
  - `rejectMember(actorId, memberId, reason)` — sets `status = LAPSED` (rejected state); writes
    `AuditLog`.
  - `updateMemberRole(actorId, memberId, roleKey, grant: boolean)` — calls `grantRole` /
    `revokeRole` from `src/lib/auth/roles.ts`.

  Create `src/app/(admin)/members/page.tsx`:
  - Table of members with search input (URL param `?search=`), status filter tabs
    (All / Pending / Active / Lapsed).
  - Each row links to `/admin/members/[id]`.
  - Follows `13-exec-members.html` mockup.

  Create `src/app/(admin)/members/[id]/page.tsx`:
  - Member detail: profile info, status badge, approval/rejection buttons with confirmation dialog,
    role assignment.
  - Approval form calls `approveMember` server action; shows matric number field (optional).
  - Rejection button calls `rejectMember` with a reason field.

  Create `src/app/(admin)/members/actions.ts` — server actions wrapping member admin functions,
  all gated with `requireRole([EXECUTIVE, ADMIN])`.

  Add approval email: extend `src/lib/email.ts` with `sendMemberApprovalEmail(to, name)`.

  Files: `src/lib/members/admin.ts`, `src/app/(admin)/members/page.tsx`,
  `src/app/(admin)/members/[id]/page.tsx`, `src/app/(admin)/members/actions.ts`,
  `src/lib/email.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 11. **Admin: event management (list, create, edit, detail)**

  Create `src/lib/events/admin.ts`:
  - `getAdminEventList()` — all events, any status, ordered by `startsAt desc`.
  - `createEvent(actorId, data)` — validates with Zod, writes `Event` row with `status = DRAFT`,
    writes `AuditLog`.
  - `updateEvent(actorId, eventId, data)` — updates mutable fields; writes `AuditLog`.
  - `publishEvent(actorId, eventId)` — sets `status = PUBLISHED`; writes `AuditLog`.
  - `cancelEvent(actorId, eventId)` — sets `status = CANCELLED`; writes `AuditLog`.
  - `completeEvent(actorId, eventId)` — sets `status = COMPLETED`; triggers
    `runCompletionEvaluation(eventId)` from the skills/completions service.

  Create `src/lib/validation/event.ts` — Zod schema for event create/edit.

  Create `src/app/(admin)/events/page.tsx` — event list table with status badges and action links.

  Create `src/app/(admin)/events/new/page.tsx` — event creation form (title, kind, starts\_at,
  ends\_at, mode, location, capacity, host, contact hours, notes, completion\_rule\_id). One screen,
  ≤3 min budget per DEV_PLAN §1.1.

  Create `src/app/(admin)/events/[id]/page.tsx` — event detail: stats (registered count,
  attended count), edit link, attendance link, "Publish / Cancel / Complete" action buttons.

  Create `src/app/(admin)/events/[id]/edit/page.tsx` — pre-populated edit form.

  Create `src/app/(admin)/events/actions.ts` — server actions for all event mutations.

  Add event registration confirmation email: extend `src/lib/email.ts` with
  `sendEventRegistrationEmail(to, name, eventTitle, startsAt)`.

  Files: `src/lib/events/admin.ts`, `src/lib/validation/event.ts`,
  `src/app/(admin)/events/page.tsx`, `src/app/(admin)/events/new/page.tsx`,
  `src/app/(admin)/events/[id]/page.tsx`, `src/app/(admin)/events/[id]/edit/page.tsx`,
  `src/app/(admin)/events/actions.ts`, `src/lib/email.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 12. **Admin: offline attendance capture (P0 — highest risk item)**

  This is the most critical screen in Phase 1. Read `14-exec-attendance.html` carefully before
  implementing. It must work without network.

  Create `src/app/(admin)/events/[id]/attendance/page.tsx`:
  - Server-renders the event header (title, date) and the full registered-member list (pre-loaded).
  - Passes the member list as props to a client component.

  Create `src/components/admin/attendance-capture.tsx` (`"use client"`):
  - On mount, writes the member list to IndexedDB (`idb-keyval` or native IDB API — use native to
    avoid an extra dependency).
  - Search-as-you-type filter over the local list.
  - Check-in button: generates a `clientEventId` (UUID via `crypto.randomUUID()`), writes to local
    IndexedDB queue, updates UI immediately (green tick, "Checked in" badge) — does NOT wait for
    network.
  - Walk-in tab: search by name or add a name; creates a Registration + AttendanceRecord pair.
  - Sync banner: shows "X check-ins queued" when offline; syncs when online.
  - Sync logic: `navigator.onLine` listener + periodic `setInterval`; calls
    `POST /api/events/[id]/attendance/bulk` with the queued items.

  Create `src/app/api/events/[id]/attendance/bulk/route.ts`:
  - Auth-gated (EXECUTIVE or ADMIN role).
  - Accepts `{ records: Array<{ memberId, clientEventId, checkedInAt }> }`.
  - Upserts each record using `upsertMany` pattern: `createMany` with `skipDuplicates: true` on
    `clientEventId` unique constraint.
  - Returns `{ processed, skipped }`.

  Install `idb` package (lightweight IndexedDB wrapper, ~1.4KB). Decision: `idb` over raw IDB API
  for readability in a volunteer-maintained codebase; over `idb-keyval` because we need store-level
  cursor queries for the queue.

  Packages to install: `idb`  
  Files: `src/app/(admin)/events/[id]/attendance/page.tsx`,
  `src/components/admin/attendance-capture.tsx`,
  `src/app/api/events/[id]/attendance/bulk/route.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds. Manual test: open attendance
  screen, enable Chrome DevTools "Offline" mode, check in 3 members, go online, verify records
  appear in the DB (use `npm run db:studio`).

---

- [ ] 13. **Admin: certificate management and bulk issuance**

  Create `src/lib/credentials/issuance.ts`:
  - `issueCredentialsForEvent(actorId, eventId)` — finds all `ActivityCompletion` rows for the
    event where no `Credential` exists yet; generates verification codes (format: `NM-XXXX-XXXX`
    using a character set without 0/O/1/I); creates `Credential` rows; creates `ActivityEntry`
    rows (`CERTIFICATE_ISSUED`); writes `AuditLog`; fires certificate-issued emails. Returns count.
  - `generateVerificationCode()` — generates a unique short code, checks DB for collision.
  - `revokeCredential(actorId, credentialId, reason)` — sets `revokedAt`, writes `AuditLog`.

  Create `src/lib/credentials/completions.ts`:
  - `runCompletionEvaluation(eventId)` — for each `AttendanceRecord` for this event, checks the
    event's `CompletionRule`; if rule is satisfied (or rule is null → attendance-only), upserts an
    `ActivityCompletion` row.

  Add certificate issued email: extend `src/lib/email.ts` with
  `sendCertificateIssuedEmail(to, name, credentialTitle, verificationCode, verifyUrl)`.

  Create `src/app/(admin)/certificates/page.tsx`:
  - Lists all credentials with member name, title, issued date, status (valid/revoked), verify code.
  - "Issue certificates" button per event (calls `issueCredentialsForEvent` server action).
  - Revoke button per credential (opens confirmation dialog).
  - Follows `15-exec-certificates.html` mockup.

  Create `src/app/(admin)/certificates/actions.ts` — server actions for issuance and revocation.

  Files: `src/lib/credentials/issuance.ts`, `src/lib/credentials/completions.ts`,
  `src/app/(admin)/certificates/page.tsx`, `src/app/(admin)/certificates/actions.ts`,
  `src/lib/email.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 14. **Admin: opportunities review queue**

  Create `src/app/(admin)/opportunities/page.tsx`:
  - Two-tab view: Review Queue (SUBMITTED + UNDER_REVIEW) | Published.
  - Each queued item: title, org, type, submitted date, Publish / Reject buttons.
  - Publish: calls `publishOpportunity` server action; shows toast.
  - Reject: dialog with reason field; calls `rejectOpportunity` server action.

  Create `src/app/(admin)/opportunities/actions.ts` — server actions wrapping
  `src/lib/opportunities/queries.ts` functions, gated with `requireRole`.

  Files: `src/app/(admin)/opportunities/page.tsx`, `src/app/(admin)/opportunities/actions.ts`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 15. **Admin: settings page**

  Create `src/app/(admin)/settings/page.tsx`:
  - Branch name, contact email, session target (activities per full session), department roll URL
    (the optional URL used for matric-number matching).
  - Values stored in a small `Settings` model (add to schema: `key String @id, value String`),
    or as environment variables for Phase 1 (simpler — use env vars, add settings page as
    read-only display with edit instructions).
  - Decision: use env vars displayed as read-only in Phase 1. A `BranchSettings` table is Phase 2.
  - ADMIN role required to view (not EXECUTIVE).

  Files: `src/app/(admin)/settings/page.tsx`  
  Verify: `npm run typecheck` passes.

---

- [ ] 16. **Skills derivation engine**

  Create `src/lib/skills/derivation.ts`:
  - `deriveMemberSkills(memberId)` — the core derivation function:
    1. Query all `ActivityCompletion` rows for the member with their `ActivitySkill` mappings.
    2. Count activities per skill.
    3. Apply rules:
       - ≥1 activity → `INTRODUCED` (Exposure in design plan)
       - ≥3 activities OR 1 activity with assessment → `PRACTISING` (Developing)
       - Has a `ProjectMember` row with a relevant skill → `COMPETENT` (Demonstrated)
       - Executive explicit sign-off (MemberSkill.verifiedBy IS NOT NULL) → `VERIFIED`
    4. Upsert `MemberSkill` rows. Never downgrade an existing `VERIFIED` level.
    5. Writes `ActivityEntry` rows for any level-ups (`SKILL_LEVEL_UP`).
    6. Returns `{ changed: number }`.

  Create `src/lib/skills/actions.ts`:
  - `runSkillsDerivation(memberId)` — server action (EXECUTIVE+ or called internally post-event).
  - `verifyMemberSkill(actorId, memberId, skillId)` — sets `VERIFIED` level, sets `verifiedBy`
    name; writes `AuditLog`. Requires EXECUTIVE or ADMIN role.

  Add `ActivitySkill` model to schema (needed for derivation queries):
  - `ActivitySkill`: `sourceType(ENUM), sourceId, skillId(→Skill)` with PK `(sourceType, sourceId,
    skillId)`.
  - Run migration: `npx prisma migrate dev --name activity-skill`.

  Wire derivation: call `deriveMemberSkills(memberId)` inside `runCompletionEvaluation` after
  upserting `ActivityCompletion` rows.

  Add admin skill-verify endpoint: `/admin/members/[id]/skills` (or a server action on the member
  detail page) for an executive to set VERIFIED on a specific skill.

  Files: `prisma/schema.prisma` (ActivitySkill), `src/lib/skills/derivation.ts`,
  `src/lib/skills/actions.ts`  
  Verify: `npx prisma migrate dev --name activity-skill` succeeds; `npm run typecheck` passes.

---

- [ ] 17. **Certificate PDF generation**

  Install packages: `@sparticuz/chromium` and `puppeteer-core`.

  Create `src/lib/certificates/template.tsx`:
  - React component returning a full HTML document (not a Next.js page).
  - Layout matches the credential card design from `docs/design/screens/10-member-certificates.html`
    and design plan §14: NiMechE crest top-left, orange gear rule on left edge, green header band,
    member name, programme title, issued date, sessions, contact hours, skills list,
    verification code + QR concept area, signatures block.
  - Uses only inline styles (puppeteer renders a standalone HTML string — no Tailwind).
  - Light theme always (design plan §5: "certificates always render in their light theme").

  Create `src/lib/certificates/pdf.ts`:
  - `generatePdf(credentialId)` — fetches credential data, renders `template.tsx` to HTML string
    via `ReactDOM.renderToStaticMarkup`, launches Chromium, prints to PDF, uploads to Vercel Blob,
    updates `Credential.pdfUrl` in DB, returns the blob URL.
  - Uses `@sparticuz/chromium` for the executable path (Lambda-compatible).

  Create `src/app/api/certificates/[id]/pdf/route.ts`:
  - Auth-gated (any active member who owns the credential, OR executive/admin).
  - Checks if `pdfUrl` already exists; if so, redirect to it (no regeneration).
  - Otherwise calls `generatePdf(credentialId)`, then redirects.
  - Cache header: `Cache-Control: private, max-age=86400`.

  Enable disabled buttons: update `src/app/(member)/me/certificates/page.tsx`:
  - Replace `disabled` on the PDF button with a link to `/api/certificates/[id]/pdf`.
  - Replace `disabled` on the Share button with a copy-to-clipboard action copying the
    `/verify/[code]` URL.

  Packages to install: `@sparticuz/chromium`, `puppeteer-core`, `@vercel/blob`  
  Files: `src/lib/certificates/template.tsx`, `src/lib/certificates/pdf.ts`,
  `src/app/api/certificates/[id]/pdf/route.ts`, `src/app/(member)/me/certificates/page.tsx`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds (note: `@sparticuz/chromium` adds
  build time — expected).

---

- [ ] 18. **Media/gallery upload flow for executives**

  Decision: Vercel Blob for storage (`@vercel/blob` already included in step 17's installs).

  Create `src/lib/gallery/upload.ts`:
  - `createAlbum(actorId, data)` — creates `Album` row; returns album.
  - `addMediaItem(actorId, albumId, file)` — uploads to Vercel Blob via `put()`, writes `MediaItem`
    row with `url`, `thumbnailUrl` (same URL for now — thumbnail generation is Phase 2),
    `uploadedBy`, `altText`.
  - `publishAlbum(actorId, albumId)` — sets `publishedAt = now()`; writes `AuditLog`.

  Create `src/app/api/gallery/upload/route.ts`:
  - `POST` — EXECUTIVE/ADMIN only. Accepts `multipart/form-data` with `file`, `albumId`, `altText`.
  - Calls `addMediaItem`; returns `{ url, itemId }`.
  - Max file size: 10MB. Accepted types: image/jpeg, image/png, image/webp.

  Create `src/app/(admin)/gallery/page.tsx` — album list with "New album" button.
  Create `src/app/(admin)/gallery/new/page.tsx` — create album form (title, description, linked
  event).
  Create `src/app/(admin)/gallery/[id]/page.tsx` — album detail with photo upload dropzone
  (client component) and photo grid.

  Add "Gallery" to admin sidebar nav items.

  Create `src/components/admin/photo-upload.tsx` (`"use client"`):
  - Drag-and-drop or file-picker; calls `/api/gallery/upload`; shows upload progress; requires
    alt text field per image (WCAG requirement).

  Files: `src/lib/gallery/upload.ts`, `src/app/api/gallery/upload/route.ts`,
  `src/app/(admin)/gallery/page.tsx`, `src/app/(admin)/gallery/new/page.tsx`,
  `src/app/(admin)/gallery/[id]/page.tsx`, `src/components/admin/photo-upload.tsx`  
  Verify: `npm run typecheck` passes; `npm run build` succeeds.

---

- [ ] 19. **Unit tests for service functions**

  Write Vitest unit tests covering the new service functions:
  - `src/lib/skills/__tests__/derivation.test.ts` — test each level threshold rule with mock data.
  - `src/lib/credentials/__tests__/issuance.test.ts` — test code generation uniqueness and format.
  - `src/lib/auth/__tests__/roles.test.ts` — test role query and permission checks with mocked DB.

  Use Vitest's `vi.mock('@/lib/db')` to mock Prisma (existing test pattern in the project).

  Files: `src/lib/skills/__tests__/derivation.test.ts`,
  `src/lib/credentials/__tests__/issuance.test.ts`,
  `src/lib/auth/__tests__/roles.test.ts`  
  Verify: `npm run test` — all tests pass.

---

- [ ] 20. **Final integration: build verification and proxy update**

  - Confirm `src/proxy.ts` (and `src/auth.config.ts`) correctly gate `/admin/**` based on
    `auth?.user?.isAdmin` token claim (set in step 2).
  - Run `npm run typecheck` — zero errors.
  - Run `npm run build` — zero errors.
  - Run `npm run test` — all tests pass.
  - Run `npm run lint` — zero violations.
  - Verify that the `disabled` PDF/Share buttons on certificates page have been re-enabled (step 17).
  - Verify that the `disabled` "Write it now" button on dashboard/certificates can be linked to a
    stub deliverable submission form (out of scope for Phase 1 — leave disabled with a TODO comment).

  Files: `src/auth.config.ts` (if changes needed), `src/proxy.ts` (if changes needed)  
  Verify: All four commands above pass clean.

---

## Packages to install (Phase 1 total)

```bash
npm install idb @vercel/blob @sparticuz/chromium puppeteer-core
```

`recharts` is already in `package.json`. `@vercel/blob` may already be present — check before
installing.

---

## Domain module layout (final)

```
src/lib/
  auth/
    password.ts       ← existing
    tokens.ts         ← existing
    roles.ts          ← NEW (step 2)
    audit.ts          ← NEW (step 2)
  member/
    queries.ts        ← existing (member self-service reads)
    session.ts        ← existing
  members/
    admin.ts          ← NEW (step 10) — admin writes to member records
  events/
    queries.ts        ← NEW (step 4) — public event reads
    admin.ts          ← NEW (step 11) — admin event mutations
  credentials/
    verify.ts         ← NEW (step 6)
    issuance.ts       ← NEW (step 13)
    completions.ts    ← NEW (step 13)
    pdf.ts            ← NEW (step 17)
    template.tsx      ← NEW (step 17)
  skills/
    derivation.ts     ← NEW (step 16)
    actions.ts        ← NEW (step 16)
  opportunities/
    queries.ts        ← NEW (step 4)
  gallery/
    queries.ts        ← NEW (step 4)
    upload.ts         ← NEW (step 18)
  admin/
    queries.ts        ← NEW (step 9)
  validation/
    auth.ts           ← existing
    event.ts          ← NEW (step 11)
    opportunity.ts    ← NEW (step 7)
  content/
    home.ts           ← existing
    about.ts          ← NEW (step 6)
```

---

## Dependency order for coder

Steps 1 → 2 → 3 (schema, then roles, then admin shell) must be sequential.
Steps 4 onward can proceed in order; they have no blocking cross-dependencies except:
- Step 5 depends on step 4 (needs event queries).
- Step 7 depends on step 4 (needs opportunity queries).
- Step 8 depends on step 4 (needs gallery queries).
- Step 9 depends on steps 2 + 3 (needs roles + admin layout).
- Steps 10–15 depend on step 9 (admin layout).
- Step 13 depends on steps 12 (needs attendance to exist for completion eval) and 11 (event status).
- Step 16 depends on step 13 (needs completions).
- Step 17 depends on step 13 (needs credentials to issue against).
- Step 18 depends on step 17 (`@vercel/blob` installed in that step).
- Step 19 depends on steps 16 and 13.
- Step 20 runs last.
