# NiMechE Digital Member Development Platform

A digital ecosystem for the Nigerian Institution of Mechanical Engineers — membership, professional
development, events, credentials, opportunities, projects and association analytics in one place.

The premise, from the presidential proposal: **membership should produce a durable, visible record
of a member's development.** Every webinar, workshop, competition, project and leadership role a
member takes part in feeds a structured professional profile they can build on for years.

## The governing principle

**It has to be effortless for people who do not consider themselves technical** — members first, but
executives, content managers and industry partners too. Nobody involved is obliged to use this: they
all have a working alternative in the WhatsApp group, so the platform has to be *easier* than the
thing it replaces, not merely more capable.

That is **G0** in the design plan, and it outranks every other goal in both documents. It is written
as measurable budgets rather than a slogan — five fields to sign up, two taps to register for an
event from a shared link, **zero actions** to receive a certificate or record a skill, no account at
all to verify a credential or submit an opportunity. Design plan section 1.1 sets the budgets, dev plan section 1.1
commits to the engineering that makes them possible, and dev plan section 9.5 gates them in CI.

## The two plans

Planning is split into two documents with a clean boundary between them. The design plan says what
the platform is; the dev plan says how it gets built.

| Document | Answers |
|---|---|
| **[`docs/design/DESIGN_PLAN.md`](docs/design/DESIGN_PLAN.md)** | Goals and the friction budget, brand and colour (light + dark), typography, theming, component library, information architecture, key screens, accessibility, data visualisation, certificate design, plain-language rules, design deliverables |
| **[`docs/design/tokens.css`](docs/design/tokens.css)** | The implementable token layer — every colour, type, space, shape and motion value for both themes |
| **[`docs/dev/DEV_PLAN.md`](docs/dev/DEV_PLAN.md)** | The frictionless mandate, architecture, stack and the alternatives rejected, data model, subsystems, passwordless auth, API conventions, security and NDPA compliance, CI/testing, delivery phases and pilot, running cost, continuity, risk |

Where the two overlap — performance budgets, phasing, the token layer — the design plan states the
requirement and the dev plan states the enforcement. Full mapping in design plan section 18 and dev plan section 14.

## Status

Both plans drafted, pending review.

**Blocking item:** obtain the official NiMechE logo as vector artwork, plus a dark-mode knockout
lockup and a square icon mark, so the two brand colour anchors can be confirmed (design plan section 2.2).
Everything visual derives from those anchors.

Open questions for the executive team are in design plan section 17 (they change the interface) and dev
plan section 13 (they change the build). Four appear in both — membership tiers, chapters/branches, public
profile default, and who may grant a "verified" skill — because they change the data model as well
as the UI, and are cheap to answer now and expensive to retrofit.
