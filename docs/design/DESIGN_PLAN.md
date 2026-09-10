# NiMechE Digital Member Development Platform — Design Plan

**Status:** Draft v1 for executive review
**Scope:** Visual and interaction design for the platform described in *NiMechE Digital Member Development Platform — Presidential Proposal*.
**Whose platform this is:** **NiMechE-SF, AATU** — the student branch at **Abiola Ajimobi Technical University**, known as **Tech-U** — not the national institution. Everything below is sized and worded for one campus of a few hundred members. See section 2.4.
**Still to confirm:** what **SF** expands to in formal use. It appears on certificates, so it is not guessed anywhere in this plan.
**Companion document:** [`docs/dev/DEV_PLAN.md`](../dev/DEV_PLAN.md) — the engineering plan (stack, data model, subsystems, delivery, operations).
**Companion file:** `docs/design/tokens.css` — the implementable token layer for everything in sections 3–6.

This document defines *what the platform looks like and how it behaves*. It does not choose a
framework, a database or a hosting provider, and it does not schedule or cost the build — those
belong to the dev plan. Everything here is expressed as design tokens and component specs, so the
dev plan can implement it directly without re-deciding visual questions. Section 18 sets out exactly which
document answers which question.

---

## 1. Design goals

The proposal's central claim is that **membership should produce a durable, visible record of a
member's development**. That record only exists if people actually use the platform — so one goal
governs all the others.

> ### G0 — Effortless for people who do not consider themselves technical
>
> **Every party — member, executive, content manager, project lead, industry partner — must be able
> to do their job without being taught how.** No manual, no training session, no WhatsApp message
> explaining where to click.
>
> This outranks every other goal in this document. Where G0 conflicts with elegance, density,
> feature completeness or engineering convenience, **G0 wins**, and the conflict gets recorded in
> Section 1.1 rather than quietly resolved in favour of the more interesting option.
>
> The failure mode this guards against is specific and common: an association builds a capable
> platform, the executives keep using the WhatsApp group because it is faster, members never log in
> twice, and within a year the platform is a website with a login button. **A feature nobody can
> find has a value of zero**, regardless of how well it is built.

Five supporting goals follow from the proposal, each subordinate to G0:

| # | Goal | What it means in the interface |
|---|------|--------------------------------|
| G1 | **Progress must be visible** | A member should see, within 3 seconds of login, what they have done and what is next. Progress is the hero of the dashboard, not a buried statistic. |
| G2 | **Credentials must look credible** | Certificates, verified skills and achievements need a serious, institutional treatment. If it looks like a badge from a game, employers discount it. |
| G3 | **Opportunities must be scannable** | The Opportunities Hub competes with WhatsApp broadcasts. It wins on filtering, deadlines and clarity — not decoration. |
| G4 | **Honest signalling** | The proposal's four-level skill model (exposure → developing → demonstrated → verified) must be legible at a glance, and must never let "attended one webinar" render like "verified competence". |
| G5 | **Works on a cheap Android phone, on campus data** | Mobile-first, low payload, usable at 360px, degrades gracefully on slow connections. |

### Design principles

1. **Institutional, not startup-generic.** This is a student branch, but it sits under a professional body, and its certificates are meant to persuade employers. The design should feel closer to a chartered institution than to a campus club or a SaaS landing page — the student-branch scope is a reason for *restraint*, never for looking amateur.
2. **Evidence over decoration.** Every element either carries information or gets cut.
3. **Green carries the structure, orange carries the moment.** The orange is the loudest colour in the brand; it is reserved for achievement, urgency and a single call to action per view. Large orange fields are forbidden.
4. **Density where it earns it.** Public pages breathe; the admin console and analytics are dense and tabular. Different jobs, different rhythm.
5. **Dark mode is a designed theme, not an inversion.** Every dark value is chosen and contrast-checked independently (section 5).
6. **The system does the work, not the member.** Anything the platform can derive, it derives. A member should never be asked to type something the system already knows, or to claim something they have already earned (section 1.1).
7. **No dead ends.** Every empty state, error and zero-result view names the next action. "Nothing here" without a way forward is a bug.

### 1.1 The friction budget

G0 is only real if it is measurable. These are **acceptance criteria**, not aspirations — a flow that
exceeds its budget does not ship until it is redesigned or the budget is renegotiated in the open.

| Journey | Who | Budget |
|---|---|---|
| Sign up → submitted for membership | Member | **≤4 fields, ≤2 minutes, no document upload** — name, Tech-U email, department, level. Institution is not asked; the email domain answers it. |
| Register for an event, arriving from a WhatsApp link | Member | **≤2 taps** when signed in; ≤2 taps after a passwordless sign-in that returns to the event |
| Receive a certificate after completing a programme | Member | **0 actions** — it arrives; there is no "claim" step |
| Record a developed skill | Member | **0 actions** — derived from activity, never a form |
| Find a relevant opportunity | Member | **≤3 taps** from landing to a full listing |
| Verify a certificate | Employer | **0 accounts, 1 tap** from the code or QR |
| Create and publish an event | Executive | **≤3 minutes, one screen**, no jargon |
| Capture attendance for 100 people | Executive | **≤5 minutes**, one hand, works with no network |
| Issue certificates for a completed event | Executive | **1 action** for the whole cohort |
| Submit an opportunity | Partner | **≤6 fields, no account required** |

**Three rules that make the budgets hold:**

- **Progressive profiling.** Registration collects only what is needed to identify a member. Everything else — interests, skills, bio, photo — is requested later, in context, at the moment it becomes useful, and is always skippable.
- **Derive, never ask.** Skills, activity history, certificates, participation counts and the development ring are all computed from what the member has done. The profile fills itself as they participate; that is the product working, and it is also the reason the sign-up form can be short.
- **Plain words, always.** No interface text uses a term a first-year student would have to look up. Not "credential issuance", but "certificates". Not "authenticate", but "sign in". Not "submit for validation", but "send for review". This applies to buttons, headings, empty states, emails and error messages alike (section 15).

**How G0 gets tested, since nobody can self-assess this:** before each release, three people who have
never seen the screen attempt its main task, unaided and unprompted — two members and one executive.
The measure is **task completion without asking a question**. Anything under 100% is a design defect
with a name and an owner, not feedback to file. For the admin console the bar is explicit: **an
executive who has never seen it must publish an event without a manual and without asking anyone.**

---

## 2. Brand foundation

### 2.1 The logo

The NiMechE emblem is a circular crest:

- an **orange gear ring** forming the outer edge — the loudest and most recognisable element;
- a **green annulus** carrying "The Nigerian Institution of Mechanical Engineers" and "The Nigerian Society of Engineers" in white;
- a **white/cream inner field** holding the black anvil-and-gear device, the crimson derrick towers and the open book, and the NSE roundel.

So the brand is **orange + green + white**, with **crimson** and **black** as detail colours. It
sits inside the Nigerian Society of Engineers' green-and-white family, with orange as NiMechE's
own signature.

### 2.2 Sampled values — and a verification note

| Element | Value | Role in the system |
|---|---|---|
| Gear ring orange | `#EE7623` | Accent anchor |
| Annulus green | `#008A45` | Primary anchor |
| Detail crimson | `#C1272D` | Danger anchor |
| Emblem black | `#111111` | Ink reference |
| Inner field | `#FFFFFF` | Surface |

These are read from the raster artwork supplied, not from vector source. **Before build, get the
official logo file from the secretariat** (ideally SVG or the original vector), confirm the two
anchor values, and update only the anchors in section 3.1 — every other colour derives from them, so a
correction is a contained edit, not a redesign.

Request at the same time:

- **A knockout / single-colour lockup for dark mode.** The emblem has a white inner field, so it cannot sit directly on a dark ground without looking like a sticker. Either a white-on-transparent version, or the rule in section 2.3.
- A **square icon mark** (the gear ring alone, or a simplified device) for favicons, app icons and avatars — the full crest is illegible at 32px because the annulus text disappears.
- Minimum clear space and minimum size rules, if a brand sheet exists.
- **A branch lockup.** The crest belongs to the national institution; this platform belongs to the AATU branch. The branch needs its own approved lockup — the unmodified crest beside a text block reading **NiMechE-SF · AATU** — rather than a redrawn crest. Get this signed off by whoever owns branding at the national body (section 2.4).
- **Confirmation of the written form.** The proposal uses **NiMechE**; the national body's own materials use **NIMechE**. The branch string is **NiMechE-SF, AATU**. Settle the exact rendering once — including how it appears on a certificate — and use it in every page `<title>`.

### 2.3 Logo usage in the product

| Context | Treatment |
|---|---|
| Public header (light) | Full-colour crest, 36px mobile / 44px desktop, beside a "NiMechE-SF" wordmark set in Sora 700 |
| Public header (dark) | Crest on a **white circular plinth** with 6px padding, or the knockout lockup once supplied — never the full-colour crest bare on a dark field |
| Portal sidebar | Icon mark when collapsed, crest + wordmark when expanded |
| Certificates | Full-colour crest at print resolution, plus a small monochrome mark beside the verification code |
| Favicon / app icon | Square icon mark on `#00713A`, never the full crest |
| Social / OG images | Crest on white, bottom-left, with the orange rule (section 14) |

**Never:** recolour the crest, place it on a busy photograph without a white scrim, stretch it, add
effects, or use the orange gear ring alone as a decorative motif at large scale — at large sizes it
reads as a warning graphic.

**The branch lockup is the primary lockup here**, not an exception: the unmodified crest beside
`NiMechE-SF · Tech-U`, set in Sora. Never a modified crest, never AATU's own logo merged into the
crest, and never the crest alone where a reader could take the page for the national body's.

### 2.4 This is a branch platform, and that changes things

The proposal is written in the voice of a national institution. This platform serves **one student
branch at one university**, and several decisions follow from that rather than from the proposal:

| Because it is one campus | The design does this |
|---|---|
| Every member is a Tech-U student in one of two departments | **Registration never asks for institution.** A `@tech-u.edu.ng` address already answers it. Department is a two-option choice (Mechanical or Mechatronics) and level a five-option one (100–500) — shown as buttons rather than dropdowns, because showing three fewer taps beats hiding five options. |
| A few hundred members, not thousands | Directory and analytics screens are designed for **hundreds of rows**: search and a flat list beat pagination and heavy filtering. Impact numbers on the public site are honest branch numbers, not inflated ones. |
| Events are on campus or on Zoom, weekly-ish | The event card leads with **day and time**, not city. The attendance screen matters more than the calendar. |
| Employers do not know this branch | The certificate must carry the **national institution's identity as well as the branch's**, or it does not travel. This is the strongest argument for getting the branding sign-off in section 2.2. |
| No chapters, no branch hierarchy | **No chapter dimension anywhere in the navigation.** One branch, one member list, one calendar. |
| The people running it are students with exams | Admin screens are designed for someone doing this at 11pm between deadlines — which is what section 1.1 already demands, and here it is the literal case. |

The one thing worth keeping in view: if this works, **other NiMechE-SF branches will ask for it.**
That is a reason to keep the branch name in content rather than hard-coded into layouts, not a
reason to build multi-tenancy now.

---

## 3. Colour system

### 3.1 Brand anchors

The only hand-picked values in the system. Replace these when the vector artwork is confirmed (section 2.2).

```
--anchor-green    #008A45   /* logo annulus — primary */
--anchor-orange   #EE7623   /* logo gear ring — accent */
--anchor-crimson  #C1272D   /* logo detail — danger */
--anchor-ink      #12261A   /* deep green-black — text and dark ground */
```

### 3.2 Ramps

Full scales, so components never invent an intermediate colour.

**Green (primary)**

| Step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Hex | `#E8F7EE` | `#C6EBD5` | `#8BD3AC` | `#3FBF7A` | `#16A75F` | `#008A45` | `#00793D` | `#00713A` | `#005C30` | `#004226` | `#0C2318` |

*`#008A45` (500) is the logo green. It is 4.45:1 on white — **fine for large text, marks and fills,
but below AA for body text**, which is why `--primary-text` uses 700.*

**Orange (accent)**

| Step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 |
|---|---|---|---|---|---|---|---|---|---|
| Hex | `#FFF3EA` | `#FFE1CC` | `#FDC29A` | `#F79B5E` | `#EE7623` | `#D2600F` | `#B85309` | `#A24A08` | `#5C2906` |

*`#EE7623` (400) is the logo orange. It is 2.9:1 on white — **never use it as text on a light
surface.** It is a fill, a rule and a mark colour. Orange text uses 700.*

**Crimson (danger)**

| Step | 50 | 100 | 300 | 500 | 600 | 700 |
|---|---|---|---|---|---|---|
| Hex | `#FDECEC` | `#F9D2D2` | `#E8635F` | `#C1272D` | `#B3231F` | `#8E1B18` |

**Neutral (green-tinted grey — keeps the UI from reading cold next to the brand green)**

| Step | 0 | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Hex | `#FFFFFF` | `#F7F9F7` | `#EFF3F0` | `#E3E9E5` | `#CFD8D2` | `#B0BDB5` | `#75857B` | `#56655C` | `#3F4C45` | `#2C3831` | `#18231C` | `#0F1712` | `#080D0A` |

**Teal (informational — the one hue not in the logo)**

`#E6F5F7` · `#4FC3D4` · `#0E6E7A` · `#0B6470`. Needed because the brand has no neutral
informational colour: green means primary/success and orange means accent/warning.

### 3.3 Semantic tokens

Components reference **only** these. No component names a ramp step directly — that rule is what
makes the theme swap work.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#F7F9F7` | `#080D0A` | Page ground |
| `--surface` | `#FFFFFF` | `#0F1712` | Cards, panels, table rows |
| `--surface-raised` | `#FFFFFF` | `#18231C` | Menus, popovers, modals, sticky headers |
| `--surface-sunken` | `#EFF3F0` | `#050A07` | Wells, code blocks, inset lists |
| `--text` | `#12261A` | `#E9F0EB` | Primary text |
| `--text-muted` | `#56655C` | `#A0B0A6` | Secondary text, labels, captions |
| `--border` | `#E3E9E5` | `#22302A` | Decorative separators, card edges |
| `--border-strong` | `#75857B` | `#5A6C60` | Input borders, control outlines (3:1 required) |
| `--primary` | `#00713A` | `#3FBF7A` | Primary action fill, active nav |
| `--primary-hover` | `#005C30` | `#63CE93` | Hover / pressed |
| `--primary-text` | `#00713A` | `#3FBF7A` | Links and brand-coloured text |
| `--on-primary` | `#FFFFFF` | `#06110A` | Text on a primary fill |
| `--primary-subtle` | `#E8F7EE` | `#0C2318` | Tinted backgrounds, selected rows |
| `--accent` | `#EE7623` | `#F79B5E` | Achievement fills, gear rules, urgency marks |
| `--accent-text` | `#A24A08` | `#F79B5E` | Orange-coloured text |
| `--on-accent` | `#1D2721` | `#1A0E04` | Text on an accent fill |
| `--accent-subtle` | `#FFF3EA` | `#2A1608` | Certificate / achievement tint |
| `--success` | `#00713A` | `#3FBF7A` | Positive status |
| `--warning` | `#A24A08` | `#F79B5E` | Caution status |
| `--danger` | `#B3231F` | `#FF8A80` | Errors, destructive actions |
| `--info` | `#0B6470` | `#4FC3D4` | Neutral information |
| `--focus-ring` | `#00713A` | `#3FBF7A` | 2px outline + 2px offset |
| `--overlay` | `rgba(18,38,26,.55)` | `rgba(2,6,4,.74)` | Modal scrim |

**Two deliberate collisions, and how they are managed.** The brand has only two hues, and both do
double duty:

- **`--success` is the same green as `--primary`.** A green "Register" button and a green
  "Registered ✓" badge are different components in different places; the risk is negligible, and
  inventing a second green would make the product look accidental.
- **`--warning` is the orange family.** A deadline closing in two days and an achievement highlight
  are both orange. This is acceptable *only* because of the rule below.

**The rule that makes both safe: status is never carried by colour alone.** Every status badge,
alert and inline state ships with a glyph and a word. A green tick and the word "Attended"; an
orange clock and "Closes in 2 days". Colour is reinforcement, never the message. This is an
accessibility requirement anyway (section 11) — here it also does structural work.

**On dark-mode primary buttons:** `--primary` in dark is `#3FBF7A` with **`#06110A` text**
(8.19:1), not white — white on that green is only 2.1:1. This is exactly what a naive light/dark
inversion gets wrong.

### 3.4 Measured contrast

Computed WCAG 2.1 ratios, not estimated. AA body text needs 4.5:1; UI component boundaries need 3:1.

| Pair | Light | Dark |
|---|---|---|
| Body text on page ground | 15.06:1 ✅ | 16.91:1 ✅ |
| Body text on surface | 15.93:1 ✅ | 15.74:1 ✅ |
| Body text on raised surface | 15.93:1 ✅ | 13.99:1 ✅ |
| Muted text on surface | 6.16:1 ✅ | 8.04:1 ✅ |
| Muted text on raised surface | 6.16:1 ✅ | 7.14:1 ✅ |
| Muted text on sunken surface | 5.50:1 ✅ | 8.79:1 ✅ |
| Link / brand text on surface | 6.13:1 ✅ | 7.77:1 ✅ |
| Text on primary button | 6.13:1 ✅ | 8.19:1 ✅ |
| Text on accent (orange) button | 5.31:1 ✅ | 8.85:1 ✅ |
| Accent text on surface | 5.97:1 ✅ | 8.51:1 ✅ |
| Accent text on accent tint | 5.47:1 ✅ | 8.06:1 ✅ |
| Brand text on brand tint | 5.54:1 ✅ | 7.05:1 ✅ |
| Success text on surface | 6.13:1 ✅ | 7.77:1 ✅ |
| Warning text on surface | 5.97:1 ✅ | 8.51:1 ✅ |
| Danger text on surface | 6.61:1 ✅ | 7.99:1 ✅ |
| Info text on surface | 6.84:1 ✅ | 8.76:1 ✅ |
| Input border on surface *(3:1 target)* | 3.89:1 ✅ | 3.26:1 ✅ |
| Focus ring on page ground *(3:1 target)* | 5.80:1 ✅ | 8.34:1 ✅ |

**Two hard rules that fall out of the maths:**

1. **Never set text in `#EE7623` on a light surface** (2.9:1). Orange text uses `#A24A08`.
2. **Never set text in `#008A45` on white** (4.45:1 — fails AA for body). Green text uses `#00713A`.

Both raw logo colours stay available as fills, rules and marks, where the 3:1 non-text threshold
applies and both pass comfortably.

---

## 4. Typography

A two-family system. Both are on Google Fonts, both have good Latin coverage, both are free.

| Role | Family | Fallback stack |
|---|---|---|
| Headings, display, wordmark | **Sora** | `Sora, "Segoe UI", system-ui, sans-serif` |
| Body, UI, forms, tables | **Inter** | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Numerals in stats and tables | Inter with `font-variant-numeric: tabular-nums` | — |
| Verification codes, matric and member numbers | `ui-monospace` system stack | `ui-monospace, "SFMono-Regular", Menlo, monospace` |

Sora's geometric, slightly technical character suits an engineering institution and separates
cleanly from Inter at body sizes.

*A serif pairing (IBM Plex Serif/Sans/Mono) and two other directions were trialled and rejected —
the branch prefers this one. Codes use the system monospace rather than a loaded webfont, which
keeps the family count at two and costs nothing.*

**Type scale** (1.250 major third, 16px base, fluid where it matters):

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `--fs-display` | `clamp(2.25rem, 5vw, 3.25rem)` | 1.08 | 700 | Home hero only |
| `--fs-h1` | `clamp(1.75rem, 3.5vw, 2.5rem)` | 1.15 | 700 | Page title |
| `--fs-h2` | `1.75rem` | 1.20 | 650 | Section |
| `--fs-h3` | `1.375rem` | 1.30 | 600 | Card group / subsection |
| `--fs-h4` | `1.125rem` | 1.35 | 600 | Card title |
| `--fs-body` | `1rem` | 1.60 | 400 | Default |
| `--fs-sm` | `0.875rem` | 1.50 | 400 | Secondary, table cells |
| `--fs-xs` | `0.75rem` | 1.40 | 500 | Badges, metadata, captions |
| `--fs-overline` | `0.6875rem` | 1.30 | 600, `.08em` tracking, uppercase | Eyebrow labels |
| `--fs-code` | `0.875rem` | 1.40 | 500 | Verification codes, matric, member numbers |

**Rules.** Body copy maxes at **68 characters** per line. Headings never below 600 weight. Uppercase
is reserved for overlines and badges — never headings or buttons. Never centre a paragraph longer
than two lines.

---

## 5. Theming architecture (light + dark)

Three states, not two: **light**, **dark**, and **follow the system** — the default for a new visitor.

```
:root                                   → light tokens (the complete palette)
@media (prefers-color-scheme: dark)
  :root:not([data-theme="light"])       → dark tokens
:root[data-theme="dark"]                → dark tokens (an explicit choice wins)
```

Rules that make this work:

1. **Every colour is defined once on bare `:root`.** A colour whose only definition lives inside a media query breaks in the third state. This is the most common theming bug.
2. **`<html>` carries `data-theme`,** set by a small inline script in `<head>` *before first paint*, reading `localStorage["nimeche-theme"]`. Without it the page flashes light before switching.
3. **`color-scheme: light dark`** on `:root`, so native controls, scrollbars and form widgets follow.
4. **A signed-in member's choice is stored on their profile**, so the theme follows them between phone and laptop; `localStorage` is the pre-login and offline fallback.
5. **The toggle is a three-way control** (Light / Dark / System) in the header and in Settings — a binary switch cannot express "follow my phone".

**The no-flash init script** — inline in `<head>`, before any stylesheet:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem("nimeche-theme");
      if (t === "dark" || t === "light") document.documentElement.dataset.theme = t;
    } catch (e) {}       /* private mode / blocked storage — fall through to system */
  })();
</script>
```

Storing nothing (or `"system"`) is the third state: no `data-theme` attribute, so
`prefers-color-scheme` decides. The `try/catch` matters — `localStorage` throws outright in some
privacy modes, and an uncaught error here blocks first paint.

**What changes in dark mode beyond colour:**

- **The logo swaps** to the knockout lockup, or gets a white circular plinth (section 2.3). This is the single most visible dark-mode task and it needs artwork, not CSS.
- **Elevation flips from shadow to surface lightness.** Shadows are nearly invisible on dark grounds; a raised panel gets `--surface-raised` plus a `--border` hairline instead.
- **The orange is stepped back** from `#EE7623` to `#F79B5E`. The raw logo orange vibrates unpleasantly on a near-black ground; the lighter step keeps the brand read without the glare.
- **Photography** gets `filter: brightness(.92)` inside `[data-theme="dark"]` so bright event photos don't glare.
- **Certificates always render in their light theme**, in both modes. A certificate is a document, not a UI surface, and must look identical to its printed and downloaded form (section 14).
- **Charts re-step from the same ramps** — they are never an inverted light chart (section 13).

---

## 6. Space, shape, elevation, motion

**Spacing** — 4px base: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96` as `--space-1 … --space-12`.
Component padding uses 12/16/20/24. Section rhythm uses 48 (mobile) / 80 (desktop).

**Layout.** Max content width `1200px`; prose column `680px`; admin tables may run to `1440px`.
12 columns at ≥1024px, 8 at 768–1023px, 4 below. Gutters 24px desktop / 16px mobile.

**Breakpoints.** `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. Design at **360px first**.

**Radii.** `--r-sm 6px` (badges, inputs) · `--r-md 10px` (buttons, small cards) · `--r-lg 14px`
(cards, panels) · `--r-xl 20px` (hero panels, modals) · `--r-full 999px` (avatars, pills).

**Elevation (light).**
`e1 = 0 1px 2px rgba(18,38,26,.06), 0 1px 3px rgba(18,38,26,.08)` ·
`e2 = 0 4px 12px rgba(18,38,26,.09)` ·
`e3 = 0 12px 32px rgba(18,38,26,.16)`.
**(dark)** shadows drop to near-invisible; use `--surface-raised` plus a 1px `--border` hairline.

**Motion.** `--dur-fast 120ms` (hover, focus) · `--dur-base 200ms` (dropdowns, tabs) ·
`--dur-slow 320ms` (modals, drawers). Easing `cubic-bezier(.2,.8,.2,1)`. Only `transform` and
`opacity` animate. Everything collapses to `1ms` under `prefers-reduced-motion: reduce`.
**No parallax, no scroll-jacking, no auto-playing carousels.**

**The gear motif.** The logo's gear ring is the one brand shape worth reusing — as a 4px orange rule
on credential components, as a subtle large-scale watermark at ≤4% opacity behind the home hero,
and as the loading spinner (a rotating gear outline, disabled under reduced-motion). Used anywhere
else it becomes noise.

---

## 7. Iconography and imagery

- **Icons: Lucide**, 1.75px stroke, 20px default / 16px in dense tables / 24px in nav. Icons never carry meaning alone — always a label or an `aria-label`.
- **Commission a small domain set:** certificate, gear/project, opportunity, mentorship, skill level. These five recur across the whole product and generic icons blur them together.
- **Photography:** real members and real events, always. Stock engineering photography undermines a platform whose entire value proposition is authentic record. 16:9 event covers, 4:3 project galleries, 1:1 avatars. Every image needs alt text. Every event needs a **generated fallback cover** — the event title on a green field with the orange rule — so an admin in a hurry never produces a broken-looking card.

### 7.1 The media library

Photographs and video are not decoration on this site; they are the evidence that the branch does
what it says. The gallery is designed around one rule:

> **Every album is attached to the thing it came from.** There is no free-floating media. An album
> belongs to an event, a project or a competition, and always links back to it — so a photograph
> leads to the programme, the date and who took part.

That is what separates this from a folder of pictures, and it means the archive gets built as a side
effect of running events properly rather than as a separate job somebody has to remember.

| Surface | What media does there |
|---|---|
| Landing | A five-tile mosaic from the newest albums, above the verification strip |
| Event page, before it runs | Cover image, and a "from the last one" strip if the event has run before |
| Event page, after | The album, and the recording if it was a webinar |
| Project page | A build strip, because the interesting part of a project is the making |
| News | A lead image or video per post |
| Gallery | Filters by kind and session, a featured mosaic, then albums newest first |
| Album | Lightbox with caption, date, photographer credit, and the parent event |

**Video** is an ordinary tile with a play affordance and a duration, never a separate section.
Webinar recordings are the highest-value media the branch holds and the most expensive to serve —
the dev plan covers how they are hosted.

**Consent is a designed feature, not a policy page.** These are photographs of students published
under the branch's name. The gallery carries a plain **"if you are in a photograph and would rather
not be"** panel with a one-tap report, worded so that asking costs nothing and implies nothing.
Members can also turn off being tagged, from settings. Under the NDPA this is an obligation;
making it visible and easy is what makes it real rather than nominal.
- **Illustration:** none in v1 beyond single-colour empty-state line drawings in `--border-strong`.

---

## 8. Component library

### 8.1 Core components

| Component | Variants | Notes |
|---|---|---|
| **Button** | primary (green fill) · accent (orange fill, dark text — *achievement and single hero CTA only*) · secondary (surface + `--border-strong`) · ghost · danger · link | Sizes sm 32 / md 40 / lg 48px. Full-width on mobile for primary form actions. Loading state swaps the label for a spinner and **holds the button's width** so layout doesn't jump. At most one accent button per view. |
| **Input / Select / Textarea** | default · error · disabled · with prefix/suffix | 40px (44px touch target on mobile), `--r-sm`, `--border-strong` at rest, `--primary` + 2px ring on focus. Label always visible above the field — **never placeholder-as-label**. Helper text below; error text replaces it, wired via `aria-describedby` and `role="alert"`. |
| **Checkbox / Radio / Switch** | — | 20px control, 44px hit area. Switch only for immediate-effect settings; a form that needs Save uses a checkbox. |
| **Card** | plain · interactive · stat | `--r-lg`, `--surface`, 1px `--border`, `e1`. Interactive cards lift to `e2` and shift the border to `--border-strong` on hover; the **title is the real `<a>`**, with a stretched pseudo-element making the whole card clickable — keyboard and screen-reader users get one sensible link, not a card-sized one. |
| **Badge / Chip** | neutral · brand · success · warning · danger · accent | `--fs-xs`, `--r-full`, subtle background + strong text, **always with a 12px glyph** (section 3.3). |
| **Tabs** | underline (page level) · segmented (in-card filters) | Active tab = 2px `--primary` underline + 600 weight. Horizontally scrollable on mobile with a fade mask; never wrapped to two rows. |
| **Table** | default · compact (admin) | Sticky header, zebra via `--surface-sunken`, right-aligned tabular numerics, per-column sort. **Below 768px tables become stacked cards** — a horizontally scrolling table on a phone is unusable for an exec capturing attendance. |
| **Pagination** | load-more · numbered | Load-more on member-facing lists; numbered in the admin console. |
| **Modal / Drawer** | modal (desktop) → bottom sheet (mobile) | Focus trapped, `Esc` closes, focus returns to the trigger, background scroll locked, scrim `--overlay`. |
| **Toast** | success · error · info | Bottom-right desktop / top mobile, auto-dismiss 5s (never for errors), `aria-live="polite"`. |
| **Empty state** | — | Line icon + one-sentence explanation + one action. Every list needs one written before launch: "you have no certificates yet" is the *first* thing most new members will see, so it must point at the next event. |
| **Skeleton** | text · card · table row | Shimmer respects reduced-motion (static tint instead). |
| **Nav** | public header · member sidebar · admin sidebar · mobile bottom bar | See section 9. |

### 8.2 Domain components — the ones that make this NiMechE and not a template

**Credential card** — a certificate as it appears in a list. **4px orange gear-rule down the left
edge**, `--accent-subtle` ground, programme title, issue date, verification code in monospace, and
a Verify affordance. This is the platform's signature object and should be the most carefully
crafted component in the library.

**Skill level chip** — the four levels from section 7 of the proposal, encoded so they are never confusable
and never colour-alone:

| Level | Fill | Glyph | Shape cue |
|---|---|---|---|
| Exposure | `--surface-sunken`, muted text | ○ | 1 of 4 segments filled |
| Developing | `--primary-subtle`, `--primary-text` | ◔ | 2 of 4 |
| Demonstrated | `--primary` fill, `--on-primary` text | ◑ | 3 of 4 |
| Verified | `--accent` fill, `--on-accent` text, + shield glyph | ✔ | 4 of 4 |

The four-segment meter is the primary encoding; colour reinforces it. This is the direct answer to
goal **G4** — "attended one webinar" renders as one filled segment and can never be mistaken for
verified competence.

**Development ring** — the dashboard hero. A single ring in the green ramp showing activities
completed this session, with a large tabular numeral inside and the delta ("+3 this month") below.

**Activity timeline** — the member's chronological record: events attended, certificates earned,
projects joined, skills advanced. Date rail left, icon, title, type badge. This is the raw material
for CV export in phase 2.

**Opportunity card** — type badge (internship / scholarship / competition / job / grant), title,
organisation, **deadline with urgency treatment** (`--danger` text and a clock glyph at ≤3 days,
`--warning` at ≤7), location/remote chip, and a clear distinction between *Register through NiMechE*
(internal, tracked) and *Apply on external site* (outbound, external-link glyph). The proposal's
Section 9.1 depends on this dual path; the UI must never blur it — a member should always know whether
NiMechE has recorded their interest.

**Event card** — cover image, stacked day/month date block in brand green, title, mode chip
(online / physical / hybrid), registration state (Open / Closing soon / Closed / Attended ✓).

**Project card** — status pill (Proposed / Active / Completed), title, the member's role, team
avatars (max 4 + count), skill chips.

**Stat tile** — overline label, large tabular number, trend delta with an arrow glyph **and a
direction word** (never an unlabelled colour), optional sparkline.

**Verification page component** — the public page an employer reaches from a certificate code.
Deliberately plain and document-like: crest, "This certificate is valid", holder, programme, date,
issuing body. No marketing chrome. Credibility comes from restraint.

---

## 9. Information architecture

### 9.1 Public site (unauthenticated)

```
/                     Home — mission, impact stats, upcoming events, latest opportunities, highlights
/about                About, structure, leadership, constitution
/events               Calendar + list, filterable; /events/:slug detail with registration CTA
/opportunities        Public preview of the Hub (full detail and registration gated on membership)
/gallery              Photographs and video from every event, project and competition
/gallery/:album       One album — grid, lightbox, and a link back to what it came from
/projects             Project showcase; /projects/:slug case studies
/news                 Announcements, member spotlights, competition results; /news/:slug
/resources            Webinar recordings, guides, past materials
/partners             For industry — what NiMechE offers, how to collaborate, submit an opportunity
/verify/:code         Public certificate verification (no login)
/contact
/join                 Membership explainer → registration
```

These pages carry the visibility burden from section 11 of the proposal: server-rendered, semantic
headings, per-page meta and OG images, `Event` / `Organization` / `JobPosting` structured data, and
a sitemap. Public project and news pages are what make NiMechE discoverable.

### 9.2 Member portal (authenticated)

```
/me                   Dashboard — development ring, next event, new opportunities, recent activity
/me/profile           Identity, matric number, level, interests, skills
/me/activity          Full timeline
/me/certificates      Credential list → viewer → share / download / verify
/me/skills            Skill matrix by level, with the activities that produced each
/me/events            Registered / attended / feedback due
/me/opportunities     Registered interest, application status, outcomes
/me/projects          Projects, roles, milestones
/me/mentorship        (Phase 2)
/me/settings          Account, notifications, theme, privacy and public-profile visibility
/u/:handle            Public member profile — opt-in, member-controlled
```

**Member navigation:** collapsible left sidebar on desktop; a **five-item bottom bar on mobile**
(Home · Events · Opportunities · Credentials · Profile). Students live on phones, and a hamburger
menu buries the two things the platform exists to surface.

### 9.3 Admin console

```
/admin                Overview — engagement KPIs, pending approvals, alerts
/admin/members        Directory, verification queue, roles, bulk actions, CSV export
/admin/events         CRUD, registrations, attendance capture, feedback, completion rules
/admin/certificates   Templates, issuance (single + bulk), revocation, verification log
/admin/opportunities  Submission review queue, publishing, registration tracking, outcomes
/admin/projects       Projects, teams, milestones
/admin/content        News, spotlights, resources, homepage highlights
/admin/analytics      Participation, completion, growth, programme popularity
/admin/settings       Roles and permissions, branding, integrations, audit log
```

**The attendance capture screen is the highest-risk screen in the product.** It is used by an exec
standing at a hall door, on a phone, probably on bad network. It needs: search-as-you-type over the
member list, one-tap check-in with a large target, an **offline queue that syncs when the connection
returns**, a visible running count, and a QR scan path. If this screen is bad, attendance data never
gets captured — and certificates, skills, the development record and every analytics number
downstream all depend on it. Design it first, prototype it with real execs at a real event, and
treat it as P0.

Roles map to the proposal's section 14 — Member, Executive/Admin, Content Manager, Project Lead, Partner
Contributor. Navigation is filtered by permission: a Project Lead sees `/admin/projects` only, not a
greyed-out full console.

---

## 10. Key screen designs

Block-level layouts; detailed comps follow in Figma (section 16).

### 10.1 Member dashboard (`/me`) — the platform's centre of gravity

```
┌────────────────────────────────────────────────────────────┐
│ Good evening, Adaeze          [theme ▾] [🔔] [avatar ▾]     │
├──────────────────────────┬─────────────────────────────────┤
│  YOUR DEVELOPMENT        │  NEXT UP                        │
│    ╭─────╮               │  ┌───────────────────────────┐  │
│    │ 14  │  activities   │  │ 12  Design of Pressure    │  │
│    ╰─────╯  +3 this mo.  │  │ SEP Vessels — Webinar     │  │
│                          │  │     Registered ✓  6:00pm  │  │
│  6 certificates          │  └───────────────────────────┘  │
│  9 skills developing     │  ┌───────────────────────────┐  │
│  2 projects              │  │ ⏱ Feedback due:           │  │
│  ▓▓▓▓▓▓▓▓░░ 8/10 toward  │  │   Thermofluids workshop   │  │
│  your session goal       │  │   → unlocks your cert.    │  │
├──────────────────────────┴─────────────────────────────────┤
│  OPPORTUNITIES FOR YOU                        View all →   │
│  [card] [card] [card]    ← matched to interests, deadline-sorted │
├────────────────────────────────────────────────────────────┤
│  RECENT ACTIVITY                                           │
│  ● 02 Sep  Certificate earned — Introduction to CAD        │
│  ● 28 Aug  Skill advanced — SolidWorks → Demonstrated      │
│  ● 21 Aug  Joined project — Campus Solar Dryer             │
└────────────────────────────────────────────────────────────┘
```

The "feedback due → unlocks your certificate" card is deliberate. Section 5 of the proposal makes
certificates conditional on a participation requirement; the interface should make the outstanding
requirement feel like a small step toward a reward, not an obstacle. It is the one place the orange
accent earns a full card treatment.

### 10.2 Opportunities Hub (`/opportunities`)

Sticky filter bar (type · deadline · location · eligibility) above a responsive card grid — 1 column
at 360px, 2 at 768, 3 at 1024. **Sort defaults to deadline ascending**, the single most useful
default. Saved searches and email alerts are stubbed in v1 and delivered with notifications in
phase 2. Empty filter results offer to clear one filter rather than dead-ending.

### 10.3 Event detail (`/events/:slug`)

Hero (cover, date block, title, mode chip) → sticky registration bar on mobile → what you'll learn →
speakers → **completion requirements stated up front** ("attend 45 of 60 minutes and complete a
5-question check to earn your certificate") → related events. Stating the requirement *before*
registration is honest signalling applied: nobody should discover the condition afterwards.

### 10.4 Certificate viewer (`/me/certificates/:id`)

The certificate renders at true aspect ratio, always in its light theme, with actions beside it:
Download PDF · Share link · Add to profile · Copy verification code. Below it: the activity that
produced it, the skills it evidences, and the verification record.

### 10.5 Admin analytics (`/admin/analytics`)

A row of stat tiles (members · active members · events held · certificates issued · opportunity
registrations) → engagement trend over time → programme popularity → completion funnel
(registered → attended → completed → certified). Date-range control in a single row above the
charts. Every chart has a table-view toggle. Charts follow section 13 exactly.

---

## 11. Accessibility commitments

Target **WCAG 2.1 AA**, treated as acceptance criteria rather than aspirations:

- Every semantic pairing in section 3.3 is contrast-verified (section 3.4). Re-run the check whenever the brand anchors change — the orange in particular has almost no headroom.
- Visible focus on every interactive element: 2px `--focus-ring`, 2px offset. Never `outline: none` without a replacement.
- Full keyboard operability, including the attendance screen, modals and the mobile bottom bar. A skip-to-content link on every page.
- Touch targets ≥44×44px.
- Semantic HTML first, ARIA only where HTML cannot express the pattern. One `<h1>` per page, no skipped heading levels.
- Form errors are text, tied to their field, and announced — never a red border alone.
- **Status is never colour-alone** (section 3.3): badges carry glyphs, chart series carry direct labels, the skill meter carries segments.
- `prefers-reduced-motion` honoured everywhere, including the gear spinner.
- Alt text is a required field on image upload in the admin console, with a "decorative" checkbox as the deliberate opt-out.
- Screen-reader testing (NVDA or VoiceOver) on five critical flows: register, sign in, register for an event, download a certificate, register interest in an opportunity.

---

## 12. What performance costs the design

Performance is engineered in [`docs/dev/DEV_PLAN.md`](../dev/DEV_PLAN.md) sections 8–9. What belongs here
is the part that changes **what can be drawn** (goal **G5**):

- **Two font families is the ceiling.** If the payload budget bites, Sora goes first and Inter carries headings at heavier weights. The system is designed to survive that.
- **The crest must exist as SVG.** A raster crest at retina sizes is a surprisingly large asset for something on every page — and it is the design side's job to supply it (section 2.2).
- **Every event needs a generated fallback cover** (section 7), so a missing upload never produces a broken-looking card.
- **Skeletons, not spinners,** for content areas — which means every list and card needs a skeleton drawn, not just a loading state named.
- **Offline and error states are designed screens**, not afterthoughts: the attendance screen's queued-and-syncing state, and an honest "you're offline" state everywhere else.
- **Every destructive admin action needs a confirmation design**, and certificate revocation requires typing the certificate code.

The budget the design is drawn against — ≤150KB JS, ≤60KB CSS gzipped on public pages, LCP under
2.5s on a mid-range Android over 3G — is set and enforced by the dev plan. It is quoted here only so
that a comp which cannot fit inside it is caught at design time.

---

## 13. Data visualization

The analytics dashboard is a core deliverable (section 13 of the proposal), so the chart system is
specified here rather than left to implementation. **The palettes below were computationally
validated** — lightness band, chroma floor, colour-vision-deficiency separation, normal-vision
separation and contrast against their surface. They are not eyeballed.

**Categorical series** — assigned in this fixed order, never cycled. A 9th series folds into "Other"
or becomes a small multiple.

| Slot | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Light | `#00793D` | `#7A5CD6` | `#C4650F` | `#1E6BC4` | `#C43F86` | `#9A8410` | `#0F8A7A` | `#9C5B33` |
| Dark | `#2CA162` | `#9A82E4` | `#C87718` | `#3E88DC` | `#D45F9C` | `#9C8E18` | `#26A695` | `#BC7440` |

*Worst adjacent-pair separation: ΔE 9.4 under deutan (light) and 10.1 under protan (dark), against a
target of 8.0. All eight clear 3:1 against their surface in both modes.*

**Why brand green and brand orange are not slots 1 and 2.** They are the obvious choice and they
fail: side by side they separate by only **ΔE 4.1 under protanopia** — the classic red-green
confusion, and roughly 8% of men have some form of it. Putting the two brand hues adjacent in a
series order would make the association's own charts unreadable for a meaningful share of its
members. Green leads (it is the primary), a violet sits between, and orange takes slot 3. This is
the single most consequential deviation from "just use the brand colours" in this document.

**Sequential (magnitude — e.g. attendance heat by week):** one green hue, light → dark.
Light: `#81C29B · #5EAE80 · #3B9966 · #207E4C · #0C663A · #034C2B`
Dark: `#2D5340 · #33694C · #38805A · #42996C · #61B387 · #8BCCA6`

**Diverging (e.g. growth vs decline):** orange `#C4650F` ← neutral `#75857B` → blue `#1E6BC4`.
**Not orange ↔ green**, for exactly the reason above: a diverging scale whose two poles are
confusable is worse than useless, because it inverts meaning rather than merely blurring it.

**Rules:**

- **Never a dual-axis chart.** Two measures of different scale become two charts, small multiples, or an indexed common base. This is the most common charting error.
- Colour follows the entity, never its rank — filtering out a series must not repaint the survivors.
- Identity is never colour-alone: a legend for ≥2 series, plus direct labels when ≤4. Given the brand's status/accent collisions (section 3.3), **direct labelling is mandatory, not optional**, on any chart that also shows status.
- Text wears text tokens; only the mark carries the series colour.
- Thin marks, 2px lines, ≥8px markers, 4px rounded data-ends anchored to the baseline, a 2px surface gap between stacked segments and adjacent bars.
- Crosshair tooltips on line/area, per-mark tooltips on bar/dot/cell, filters in one row above the charts.
- **Dark-mode charts re-step from the ramps above** — never an inverted light chart.
- Where a single number is the answer ("certificates issued this term"), use a stat tile, not a chart.

---

## 14. Certificates and shareable assets

The credential is the product's most externally visible artifact — it will be seen by employers who
have never heard of the platform.

**Certificate layout (A4 landscape, 300dpi print-safe):**

```
┌──────────────────────────────────────────────────────────┐
│ ▌ [NiMechE crest]                                        │  ← 6px orange gear-rule, full bleed left
│ ▌                                                        │
│ ▌  CERTIFICATE OF COMPLETION          (overline, green)   │
│ ▌                                                        │
│ ▌  Adaeze Nwosu                       (Sora 700, 44pt)   │
│ ▌  ─────────────────────────                             │
│ ▌  has completed                                         │
│ ▌  Design of Pressure Vessels              (Sora 600)    │
│ ▌  a NiMechE professional development programme          │
│ ▌                                                        │
│ ▌  12 September 2026     [signature]    [signature]      │
│ ▌                        President      Programmes Sec.  │
│ ▌                                                        │
│ ▌ [QR]  nimeche-aatu.vercel.app/verify   NM-7K4Q-2X9    │
└──────────────────────────────────────────────────────────┘
```

- **Always the light theme, in both app themes**, and identical on screen, in PDF and in print.
- Verification code in monospace, grouped for readability, with a QR to `/verify/:code`.
- Generated **server-side as PDF from a single HTML template**, so screen and print can never diverge.
- Templates are configurable per programme type in `/admin/certificates`, but the layout skeleton, crest placement and verification block are **locked** — an admin must not be able to issue a certificate without a verification code.
- A matching **1200×630 share image** is generated per credential for LinkedIn/X: green field, orange gear-rule, crest, holder name, programme.

OG images are similarly templated for events, opportunities and project pages, so anything shared
into a WhatsApp group looks deliberate rather than like a bare link.

---

## 15. Voice and microcopy

Plain, warm, professional Nigerian English. Second person. No exclamation marks in system messages.

| Situation | Write | Not |
|---|---|---|
| Empty certificates | "No certificates yet. Attend a NiMechE programme to earn your first one." + *Browse events* | "Nothing here!" |
| Deadline | "Closes in 3 days · 10 Sep" | "Hurry!" |
| Verified skill | "Verified by NiMechE — Design of Pressure Vessels, Sep 2026" | "Expert 🏆" |
| Error | "We couldn't save your profile. Check your connection and try again." | "Error 500" |
| Pending approval | "Your membership is being reviewed. You'll get an email within 48 hours." | "Pending" |

Dates render as `12 Sep 2026`; times carry the zone (`6:00pm WAT`). Never a bare relative date on a
certificate or a deadline.

**The jargon ban (G0).** Interface text never uses a word a first-year student would have to look
up, and never uses the system's internal vocabulary. Our data model has `credentials`,
`activity completions` and `member roles`; the interface has certificates, things you finished, and
what you can do. The words in the left column are banned from user-facing text — buttons, headings,
empty states, emails, errors and admin screens alike.

| Never | Always |
|---|---|
| Credential issuance | Certificates |
| Authenticate / authentication | Sign in |
| Submit for validation | Send for review |
| Completion criteria not met | You still need to *(name the one thing)* |
| Entity / record / object | The actual noun — member, event, project |
| Invalid input | *(what is wrong, and what to type instead)* |
| Sync failed | Not saved yet — we'll retry when you're back online |
| Deactivate | Turn off |
| Portal / dashboard *(as a nav label)* | Home |

This applies with equal force to the admin console. An executive who has to learn our vocabulary
before publishing an event is exactly the failure G0 describes.

---

## 16. Design deliverables

**What the design track owes, and when.** Build sequencing, effort estimates and cost live in
[`docs/dev/DEV_PLAN.md`](../dev/DEV_PLAN.md) section 10; the phase names below match it so the two schedules
line up.

**Phase 0 — Foundations**

1. Obtain the vector logo, a knockout/dark lockup, and a square icon mark; confirm the two brand anchors (section 2.2). ← *blocking everything else*
2. `tokens.css` (drafted in this folder) plus matching Figma variables for both themes.
3. Core component set in Figma: buttons, inputs, cards, badges, nav, table, modal, empty states.
4. Interactive style guide (light/dark) for executive sign-off.

**Phase 1 — MVP screens**

5. Public: home, events list + detail, opportunities list + detail, about, news, verification page.
6. Auth: register, sign in, membership profile completion.
7. Portal: dashboard, profile, certificates, event history, skills.
8. Admin: members, events + **attendance capture** (designed first — see section 9.3), certificate issuance, opportunity review, basic analytics.
9. Certificate template + OG image templates.
10. Empty, error, loading and offline states for every list and form in the above.

**Phase 2 — Expansion**

11. Project detail, mentorship matching, public member profiles (`/u/:handle`), CV export, notification centre, digital membership card, payment and renewal flows.

**Design QA gates before each release:**

- Contrast re-verified against section 3.4.
- Keyboard pass on new flows.
- Both themes screenshotted at 360 / 768 / 1440.
- An empty state, an error state and a loading state present for every list and form — each naming a next action (principle 7).
- **Friction budget measured** for every journey the release touches: taps and fields counted against the section 1.1 table, recorded in the PR.
- **Unaided task test** — three people who have not seen the screen complete its main task without asking a question (section 1.1).

The dev plan wires the automatable ones — contrast, accessibility scans and the tap/field counts —
into CI (dev plan section 9.5). The unaided task test cannot be automated and is the one gate that must
stay human.

---

## 17. Open decisions

Each of these needs the executive team, and each **changes the design**. Purely technical open
questions live in [dev plan section 13](../dev/DEV_PLAN.md); items 2, 3, 4 and 5 below appear in both
because they change the interface *and* the data model, which is why they should be answered early.

1. **Vector logo and confirmed brand hexes** — the blocking item in section 2.2.
2. **Branding sign-off from the national body** — may the branch use the crest in a `NiMechE-SF · AATU` lockup, on the platform and on certificates? This is the item that decides whether a certificate carries weight outside AATU (section 2.4), so chase it alongside the vector artwork.
3. **What happens at graduation** — does a final-year member become an alumnus with a read-only profile, and does their certificate record stay reachable? For a student branch this is not an edge case: **the entire membership turns over in four years**, and a platform that loses graduates loses its own history.
4. **Public profile default** — opt-in or opt-out? This plan assumes **opt-in**; section 9.1 of the proposal supports keeping application detail private.
5. **Verification authority** — who signs off a "verified" skill? The chip in section 8.2 is worthless if the process behind it isn't defined.
6. **Certificate signatories** — which two offices sign, and how the signatures are stored.
7. **Will the Mechanical and Mechatronics departments share their student rolls?** This is the highest-leverage ask in the project. With the rolls, the executive reviewing a new member sees "matched on the roll" and approves with a glance, and nobody ever types a matric number. Without them, review is a judgement call and the matric number becomes a field someone has to fill in. Ask before build, not after.
8. **Language** — English only in v1? Assumed yes.
9. **A permanent domain.** `nimeche-aatu.vercel.app` is the working address and is fine for building and reviewing. But it is printed on every certificate an employer will check years from now, and it belongs to a hosting account rather than to the branch — so a branch-owned domain, held by the office and not by a student, should be settled before the first real certificate is issued (dev plan section 11).

---

## 18. Relationship to the development plan

[`docs/dev/DEV_PLAN.md`](../dev/DEV_PLAN.md) is the companion document. The split is:

| Question | Answered in |
|---|---|
| What does it look like, and why those colours? | This plan, sections 2–7 |
| What components exist and how do they behave? | This plan, section 8 |
| What screens exist and what is on them? | This plan, sections 9–10, 14–15 |
| What are the accessibility rules? | This plan, section 11 |
| What is it built with, and how is it structured? | Dev plan sections 2–3 |
| What is the data model and how do the subsystems work? | Dev plan sections 4–8 |
| How is it secured, operated, tested and deployed? | Dev plan section 9 |
| When does it ship, at what cost, and what could go wrong? | Dev plan sections 10–13 |

Where they overlap — performance budgets, phasing, the token layer — **this plan states the
requirement and the dev plan states the enforcement.**

Three requirements this plan places on the build, carried into dev plan section 2.2:

- **`tokens.css` is the single source of visual truth.** No component hard-codes a colour, and no component references a ramp step directly — only semantic tokens.
- **Attendance capture is P0 with offline support.** Certificates, skills, the development record and every analytics number depend on data actually being captured in a noisy hall on a bad connection.
- **The two contrast rules in section 3.4 are non-negotiable**: never `#EE7623` as text on light, never `#008A45` as body text on white. Both are easy mistakes to make precisely because they are the logo colours.
- **G0 and the friction budgets in section 1.1 are acceptance criteria, not preferences.** A flow that exceeds its budget is not done. The dev plan's section 1.1 carries the engineering consequences — passwordless sign-in, zero-action certificates, derived skills, no-account partner submission — and its section 9.5 gates them in CI.
