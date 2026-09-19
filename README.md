<p align="center">
  <img src="docs/design/assets/nimeche-logo.svg" width="130" alt="NiMechE-SF, Tech-U">
</p>

<h1 align="center">NiMechE-SF Member Platform</h1>

<p align="center">
  The member platform for the <strong>Nigerian Institution of Mechanical Engineers</strong><br>
  student branch at <strong>Abiola Ajimobi Technical University</strong>, Ibadan.
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white">
  <img alt="Status" src="https://img.shields.io/badge/status-in%20development-EE7623">
</p>

---

## What this is, in plain words

NiMechE-SF runs plant visits, workshops, CAD clinics and design competitions for Mechanical and
Mechatronics students at Tech-U. Today that all lives in a WhatsApp group: the attendance list is a
photograph of a sign-in sheet, certificates are a designer's afternoon, and when a member graduates
their record leaves with them.

This platform replaces that with something durable. **A member takes part; the platform keeps the
record.** Attendance is captured at the door, certificates are issued automatically and carry a code
an employer can check years later, and the skills a member has actually practised are worked out
from what they did rather than typed into a form.

It covers four areas:

| Area                    | Who uses it          | What it does                                                                                                                                             |
| ----------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public site**         | Anyone, signed out   | What the branch is, what is on, photographs and video from past events, and a page where an employer checks a certificate code without making an account |
| **Joining**             | Prospective members  | Five fields: name, Tech-U email, password, department, level. An executive approves against the department roll                                          |
| **Member dashboard**    | Members              | What is next, certificates earned, the skills they have built, their full participation record                                                           |
| **Executive dashboard** | The branch executive | Approving members, running events, capturing attendance at the door with no network, issuing a cohort's certificates in one action                       |

> **Scope note.** This is one branch at one university, a few hundred members — not the national
> institution. That shapes the build: registration never asks which school you attend (the email
> domain answers it), screens are designed for hundreds of rows rather than thousands, and because
> the whole membership turns over in about four years, **graduating without losing your record is a
> core feature, not an edge case.**

## The one rule that outranks the others

**It has to be effortless for people who do not consider themselves technical.** Nobody involved is
obliged to use this — they all have a working alternative in the WhatsApp group — so the platform
has to be _easier_ than the thing it replaces, not merely more capable.

That is **G0**, and it is written as measurable budgets rather than a slogan:

- **≤5 fields** to sign up
- **≤2 taps** to register for an event from a shared link
- **0 actions** to receive a certificate, or to have a skill recorded
- **0 accounts** to verify a certificate or submit an opportunity
- **≤5 minutes** to check in 100 people at the door, with no mobile data

A flow that exceeds its budget is not finished. [Design plan §1.1](docs/design/DESIGN_PLAN.md) sets
the budgets, [dev plan §1.1](docs/dev/DEV_PLAN.md) commits to the engineering that makes them
possible, and dev plan §9.5 gates them in CI.

## Tech stack

| Layer       | Choice                                                      | Why this one                                                                                                              |
| ----------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Framework   | **Next.js 16** (App Router) + **React 19** + **TypeScript** | Server-rendered public pages for visibility, a client-rendered portal behind auth, one language across the whole codebase |
| Styling     | **Tailwind CSS 4** driven by `docs/design/tokens.css`       | Utilities resolve to design tokens, so the token file stays authoritative                                                 |
| Components  | **shadcn/ui** (Radix primitives)                            | Source you own and can edit, not a dependency you fight                                                                   |
| Database    | **PostgreSQL** via **Supabase**                             | Member records are the asset; they belong somewhere with real foreign keys                                                |
| Data access | **Prisma 6**                                                | Typed schema, generated client, migrations readable in review                                                             |
| Auth        | **Supabase Auth** — Tech-U email + password                 | See below                                                                                                                 |
| Validation  | **Zod 4**                                                   | One schema shared by the form and the server action                                                                       |
| Charts      | **Recharts** with the validated token palettes              | Chart colour comes from `--chart-*`, never a library default                                                              |
| Testing     | **Vitest** (unit), **Playwright** (E2E, desktop + mobile)   |                                                                                                                           |
| Hosting     | **Vercel** (app) + **Supabase** (data)                      | Zero-ops deploys, preview per pull request, free tier                                                                     |

**Authentication is email and password, and the email is the Tech-U address.** Every member already
has `firstname.lastname@tech-u.edu.ng`, already knows it, and it is the one identifier that ties an
account to a real student without anyone typing a matric number. The domain is the gate, which is
what lets sign-up skip "which institution?" entirely. An emailed link survives in exactly one place:
forgetting the password.

## Getting started

**You need:** [Node.js 22+](https://nodejs.org), npm 10+, and a free
[Supabase](https://supabase.com) project. No local Postgres install required — Supabase hosts it.

```bash
git clone https://github.com/Kolade-dotcom/nimeche-platform.git
cd nimeche-platform
npm install
```

Copy the environment template and fill it in from your Supabase dashboard
(_Project settings → Database_ for the connection strings, _Project settings → API_ for the keys):

```bash
cp .env.example .env.local   # read by the app
cp .env.example .env         # read by the Prisma CLI
```

Push the schema to your database, then start the dev server:

```bash
npm run db:push
npm run dev
```

Open <http://localhost:3000>.

> **Never commit `.env` or `.env.local`.** Both are gitignored. The `SUPABASE_SERVICE_ROLE_KEY`
> bypasses row-level security entirely — it is server-only and must never appear in a
> `NEXT_PUBLIC_` variable or anywhere in client code.

## Scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start the development server on :3000           |
| `npm run build`      | Production build                                |
| `npm run start`      | Serve the production build                      |
| `npm run lint`       | ESLint                                          |
| `npm run typecheck`  | TypeScript, no emit                             |
| `npm run format`     | Prettier, with Tailwind class sorting           |
| `npm run test`       | Unit tests (Vitest)                             |
| `npm run e2e`        | End-to-end tests (Playwright, desktop + mobile) |
| `npm run db:push`    | Push the Prisma schema to the database          |
| `npm run db:migrate` | Create and apply a migration                    |
| `npm run db:studio`  | Browse the database in Prisma Studio            |
| `npm run db:seed`    | Seed development data                           |

## How the project is laid out

```
src/
  app/                  Next.js App Router — routes, layouts, server actions
    globals.css         Imports the design tokens, maps them onto shadcn and Tailwind
  components/
    ui/                 shadcn components (yours to edit — not a dependency)
    brand-mark.tsx      The crest, with its full-colour and knockout treatments
    theme-toggle.tsx    Light / dark / follow the system
  lib/
    db.ts               Prisma client singleton
    env.ts              Environment variables, validated at boot
    supabase/           Browser and server Supabase clients
prisma/
  schema.prisma         Data model (built out table by table)
docs/
  design/               Design plan, tokens, 15 built screens, the 81-artboard canvas
  dev/                  Development plan
e2e/                    Playwright specs
```

## How styling works, and why it is set up this way

This is the part worth understanding before writing a component.

**`docs/design/tokens.css` is the single source of truth for every colour, type size, space and
radius.** It is not copied into the app — `src/app/globals.css` imports it directly, so there is
exactly one definition of every value:

```
docs/design/tokens.css  ──imported by──▶  src/app/globals.css
                                              │
                                              ├─ maps tokens onto shadcn's vocabulary
                                              │    (--card, --muted, --ring …)
                                              │
                                              └─ @theme inline exposes them as utilities
                                                   (bg-surface, text-muted-foreground …)
```

The practical consequences:

- **A shadcn `<Button>` is branded by construction.** Nobody has to remember the brand green; it is
  what `bg-primary` already resolves to.
- **Changing a colour is a one-line edit in `tokens.css`**, and it moves everywhere at once.
- **Both themes come free.** `tokens.css` defines light and dark independently — dark is a designed
  theme, not an inversion — and handles `prefers-color-scheme` as well as an explicit choice. Write
  `bg-surface`, get the right answer in both.
- **Contrast is already verified** against WCAG 2.1 AA (design plan §3.4). If you introduce a colour
  outside the tokens, it is not verified any more.

Two hard rules the tokens encode, worth knowing so you do not trip over them:

> Never `#EE7623` (brand orange) as text on a light background — it measures 2.9:1. Use
> `text-accent-text`.
> Never brand green as body text on white — 4.45:1. Use it for surfaces and large type.

### Adding a shadcn component

```bash
npx shadcn@latest add <component>
```

`components.json` is configured, so new components land in `src/components/ui/` already wired to the
tokens. They are ordinary source files — edit them freely.

## Design

The interface is designed before it is built. Three places to look:

- **[`docs/design/screens/`](docs/design/screens/)** — 15 responsive screens, one self-contained
  HTML file each, covering all four areas. Open `index.html` for a contact sheet of the lot. These
  are what gets built against, and what gets imported into Figma.
- **[`docs/design/DESIGN_PLAN.md`](docs/design/DESIGN_PLAN.md)** — goals and friction budgets,
  brand, colour in both themes, typography, components, information architecture, accessibility
  commitments, certificate design, plain-language rules.
- **[`docs/design/canvas/`](docs/design/canvas/)** — 81 reference artboards covering the empty
  states, errors and after-review screens the 15 do not show.

## Planning documents

Planning is split in two, with a clean boundary: the design plan says _what the platform is_, the
dev plan says _how it gets built_. Where they overlap, the design plan states the requirement and
the dev plan states the enforcement.

| Document                                                       | Answers                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`docs/design/DESIGN_PLAN.md`](docs/design/DESIGN_PLAN.md)** | Goals and the friction budget, brand and colour (light + dark), typography, theming, component library, information architecture, key screens, accessibility, data visualisation, certificate design, plain-language rules |
| **[`docs/design/tokens.css`](docs/design/tokens.css)**         | The implementable token layer — every colour, type, space, shape and motion value for both themes                                                                                                                          |
| **[`docs/dev/DEV_PLAN.md`](docs/dev/DEV_PLAN.md)**             | Architecture, stack and the alternatives rejected, data model, subsystems, auth, API conventions, security and NDPA compliance, CI and testing, delivery phases, running cost, continuity, risk                            |

## Status

**Planning and design are done. The application scaffold is in place** — Next.js, the token
pipeline, shadcn, Prisma, Supabase clients, tests — and the subsystems get built against the 15
designed screens.

Outstanding:

- **A square icon mark** for favicons, app icons and avatars. The full crest stops being legible
  below about 40px, so it cannot serve as a favicon (design plan §2.2).
- **Branding sign-off from the national body** — it decides whether a certificate carries weight
  outside Tech-U.
- **What happens to a member at graduation**, which at branch scale is the main event, not an edge
  case.
- **Whether the departments will share their student rolls.** With them, approving a member is a
  glance instead of a judgement call, and nobody ever types a matric number.

Open questions are tracked in design plan §17 (they change the interface) and dev plan §13 (they
change the build).

## Contributing

Before opening a pull request:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

Two conventions that matter more than style:

1. **Plain words in the interface.** Not "authenticate" but "sign in"; not "credential issuance" but
   "certificates". This applies to buttons, headings, empty states, emails and error messages alike.
2. **Every error says what to do next.** An error naming an internal state — `sync failed`,
   `constraint violation` — is a defect, and the person who writes the endpoint writes its error
   copy.
