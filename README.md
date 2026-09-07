# NiMechE Digital Member Development Platform

A digital ecosystem for the Nigerian Institution of Mechanical Engineers — membership, professional
development, events, credentials, opportunities, projects and association analytics in one place.

The premise, from the presidential proposal: **membership should produce a durable, visible record
of a member's development.** Every webinar, workshop, competition, project and leadership role a
member takes part in feeds a structured professional profile they can build on for years.

## The two plans

Planning is split into two documents with a clean boundary between them. The design plan says what
the platform is; the dev plan says how it gets built.

| Document | Answers |
|---|---|
| **[`docs/design/DESIGN_PLAN.md`](docs/design/DESIGN_PLAN.md)** | Brand and colour (light + dark), typography, theming, component library, information architecture, key screens, accessibility, data visualisation, certificate design, voice, design deliverables |
| **[`docs/design/tokens.css`](docs/design/tokens.css)** | The implementable token layer — every colour, type, space, shape and motion value for both themes |
| **[`docs/dev/DEV_PLAN.md`](docs/dev/DEV_PLAN.md)** | Architecture, stack and the alternatives rejected, data model, subsystems, API conventions, security and NDPA compliance, CI/testing, delivery phases, running cost, continuity, risk |

Where the two overlap — performance budgets, phasing, the token layer — the design plan states the
requirement and the dev plan states the enforcement. Full mapping in design plan §18 and dev plan §14.

## Status

Both plans drafted, pending review.

**Blocking item:** obtain the official NiMechE logo as vector artwork, plus a dark-mode knockout
lockup and a square icon mark, so the two brand colour anchors can be confirmed (design plan §2.2).
Everything visual derives from those anchors.

Open questions for the executive team are in design plan §17 (they change the interface) and dev
plan §13 (they change the build). Four appear in both — membership tiers, chapters/branches, public
profile default, and who may grant a "verified" skill — because they change the data model as well
as the UI, and are cheap to answer now and expensive to retrofit.
