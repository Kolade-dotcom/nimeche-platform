import { config as loadEnv } from "dotenv";
import {
  PrismaClient,
  type ActivityKind,
  type Department,
  type DeliverableKind,
  type EventKind,
  type EventMode,
  type MemberStatus,
  type SkillLevel,
} from "@prisma/client";

import { hashPassword } from "../src/lib/auth/password";

// Run directly by `npm run db:seed`, so nothing has loaded the environment for
// us. Same order Next.js uses, and the same order prisma.config.ts uses.
loadEnv({ path: [".env.local", ".env"], quiet: true });

const prisma = new PrismaClient();

/**
 * Development seed. Everyone here is a deliberately generic placeholder, so a
 * development database can never be mistaken for real member records, and the
 * password is printed rather than guessed at.
 *
 * Dates are all relative to the day the seed runs. A dashboard whose "coming
 * up" section is empty because the fixtures were written last term tells you
 * nothing about whether the page works.
 */
const DEV_PASSWORD = "nimeche-dev";

const DAY = 24 * 60 * 60 * 1000;
const today = new Date();
today.setHours(0, 0, 0, 0);

/** `days` from today, at `hour` local time. Negative days are in the past. */
function at(days: number, hour = 9, minute = 0): Date {
  const d = new Date(today.getTime() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const SKILLS = [
  { slug: "cad-modelling", name: "CAD modelling" },
  { slug: "workshop-safety", name: "Workshop safety" },
  { slug: "technical-drawing", name: "Technical drawing" },
  { slug: "design-for-manufacture", name: "Design for manufacture" },
  { slug: "risk-assessment", name: "Risk assessment" },
  { slug: "plant-operations", name: "Plant operations" },
  { slug: "materials-selection", name: "Materials selection" },
  { slug: "maintenance-practice", name: "Maintenance practice" },
];

const EVENTS = [
  {
    slug: "plant-visit-ibadan-steel-mill",
    title: "Plant visit: Ibadan Steel Mill",
    kind: "PLANT_VISIT" as EventKind,
    summary: "The rolling mill, then the maintenance workshop.",
    startsAt: at(5, 7, 30),
    endsAt: at(5, 15, 0),
    mode: "IN_PERSON" as EventMode,
    location: "Main gate, 7:30am",
    host: "Ibadan Steel Mill",
    notes: "Closed shoes and long trousers required",
    contactHours: 6,
    capacity: 40,
  },
  {
    slug: "design-of-pressure-vessels",
    title: "Design of pressure vessels",
    kind: "LECTURE" as EventKind,
    summary: "Wall thickness, end caps and the codes that govern both.",
    startsAt: at(13, 18, 0),
    endsAt: at(13, 20, 0),
    mode: "ONLINE" as EventMode,
    location: "Online, 6:00pm",
    host: "Engr. John Doe",
    contactHours: 2,
    capacity: null,
  },
  {
    slug: "plant-visit-march",
    title: "Plant visit: Ibadan Steel Mill",
    kind: "PLANT_VISIT" as EventKind,
    summary: "The first of the session's three visits.",
    startsAt: at(-194, 7, 30),
    endsAt: at(-194, 15, 0),
    mode: "IN_PERSON" as EventMode,
    location: "Main gate",
    host: "Ibadan Steel Mill",
    contactHours: 6,
  },
  {
    slug: "introduction-to-cad-session-4",
    title: "Introduction to CAD, session 4",
    kind: "TRAINING" as EventKind,
    startsAt: at(-22, 16, 0),
    endsAt: at(-22, 19, 0),
    mode: "IN_PERSON" as EventMode,
    location: "CAD lab",
    contactHours: 3,
  },
  {
    slug: "introduction-to-cad-session-3",
    title: "Introduction to CAD, session 3",
    kind: "TRAINING" as EventKind,
    startsAt: at(-29, 16, 0),
    endsAt: at(-29, 19, 0),
    mode: "IN_PERSON" as EventMode,
    location: "CAD lab",
    contactHours: 3,
  },
  {
    slug: "workshop-safety-briefing",
    title: "Workshop safety briefing",
    kind: "TRAINING" as EventKind,
    startsAt: at(-34, 10, 0),
    endsAt: at(-34, 14, 0),
    mode: "IN_PERSON" as EventMode,
    location: "Fabrication shop",
    contactHours: 4,
  },
  {
    slug: "careers-evening-nse-oyo",
    title: "Careers evening with NSE Oyo",
    kind: "CAREERS" as EventKind,
    startsAt: at(-47, 17, 0),
    endsAt: at(-47, 20, 0),
    mode: "IN_PERSON" as EventMode,
    location: "Senate auditorium",
    contactHours: 3,
  },
  {
    slug: "materials-selection-clinic",
    title: "Materials selection clinic",
    kind: "TRAINING" as EventKind,
    startsAt: at(-62, 14, 0),
    endsAt: at(-62, 17, 0),
    mode: "IN_PERSON" as EventMode,
    location: "CAD lab",
    contactHours: 3,
  },
];

const MEMBERS = [
  {
    email: "jane.doe@tech-u.edu.ng",
    fullName: "Jane Doe",
    department: "MECHANICAL" as Department,
    level: 200,
    matricNo: "125/25/2/0174",
    status: "PENDING" as MemberStatus,
  },
  {
    email: "akolade.salako@tech-u.edu.ng",
    fullName: "Akolade Salako",
    department: "MECHANICAL" as Department,
    level: 400,
    matricNo: "125/23/1/0142",
    status: "ACTIVE" as MemberStatus,
    memberNo: "SF-TECHU-0142",
    joinedAt: at(-700),
    expectedGraduation: today.getFullYear() + 1,
    execTitle: "President",
    publicSlug: "akolade",
  },
];

/** The record the design screens show, attached to the active member. */
const REGISTERED = ["plant-visit-ibadan-steel-mill"];

const ATTENDED = [
  "plant-visit-march",
  "introduction-to-cad-session-4",
  "introduction-to-cad-session-3",
  "workshop-safety-briefing",
  "materials-selection-clinic",
];

const MISSED = ["careers-evening-nse-oyo"];

const CREDENTIALS = [
  {
    code: "NM-7K4Q-2X9",
    title: "Introduction to CAD",
    sessions: 4,
    contactHours: 12,
    issuedAt: at(-19, 12),
    skills: ["cad-modelling", "technical-drawing", "design-for-manufacture"],
    events: ["introduction-to-cad-session-3", "introduction-to-cad-session-4"],
    checks: [at(-13, 9), at(-26, 15)],
  },
  {
    code: "NM-3P8T-6R1",
    title: "Workshop safety",
    sessions: 1,
    contactHours: 4,
    issuedAt: at(-31, 12),
    skills: ["workshop-safety", "risk-assessment"],
    events: ["workshop-safety-briefing"],
    checks: [at(-21, 11)],
  },
  {
    code: "NM-9L2V-4W7",
    title: "Materials selection clinic",
    sessions: 2,
    contactHours: 6,
    issuedAt: at(-56, 12),
    skills: ["materials-selection"],
    events: ["materials-selection-clinic"],
    checks: [],
  },
  {
    code: "NM-5H6D-1B3",
    title: "Plant visit programme, 2025/26",
    sessions: 3,
    contactHours: 14,
    issuedAt: at(-74, 12),
    skills: ["plant-operations", "maintenance-practice"],
    events: ["plant-visit-march"],
    checks: [],
  },
];

const MEMBER_SKILLS = [
  {
    slug: "cad-modelling",
    level: "COMPETENT" as SkillLevel,
    evidence: [
      "Completed Introduction to CAD, four sessions",
      "Passed the end assessment at 78 per cent",
      "Submitted a multi-part assembly with drawings",
    ],
  },
  {
    slug: "workshop-safety",
    level: "VERIFIED" as SkillLevel,
    evidence: [
      "Attended the workshop safety briefing",
      "Worked three sessions in the fabrication shop with no incident",
    ],
    verifiedBy: "Engr. Richard Roe, workshop supervisor",
    verifiedAt: at(-30, 12),
  },
  {
    slug: "technical-drawing",
    level: "COMPETENT" as SkillLevel,
    evidence: [
      "Produced manufacturing drawings with tolerances",
      "Bill of materials accepted at the CAD clinic review",
    ],
  },
  {
    slug: "plant-operations",
    level: "PRACTISING" as SkillLevel,
    evidence: [
      "Attended two of the three plant visits this session",
      "Third visit note still outstanding",
    ],
  },
  {
    slug: "materials-selection",
    level: "PRACTISING" as SkillLevel,
    evidence: [
      "Completed the materials selection clinic",
      "Contributed to the solar dryer material study",
    ],
  },
  {
    slug: "maintenance-practice",
    level: "INTRODUCED" as SkillLevel,
    evidence: ["Observed a planned shutdown at Ibadan Steel Mill"],
  },
  {
    slug: "design-for-manufacture",
    level: "INTRODUCED" as SkillLevel,
    evidence: ["Drawings reviewed against the shop's manufacturing limits"],
  },
];

const ACTIVITY = [
  {
    kind: "CHECKED_IN" as ActivityKind,
    summary: "Checked in at Introduction to CAD, session 4",
    occurredAt: at(-22, 16),
  },
  {
    kind: "CERTIFICATE_ISSUED" as ActivityKind,
    summary: "Certificate issued: Introduction to CAD",
    occurredAt: at(-19, 12),
  },
  {
    kind: "SKILL_LEVEL_UP" as ActivityKind,
    summary: "CAD modelling moved from practising to competent",
    occurredAt: at(-19, 12),
  },
  {
    kind: "CERTIFICATE_ISSUED" as ActivityKind,
    summary: "Certificate issued: Workshop safety",
    occurredAt: at(-31, 12),
  },
  {
    kind: "CHECKED_IN" as ActivityKind,
    summary: "Checked in at the workshop safety briefing",
    occurredAt: at(-34, 10),
  },
];

const OPPORTUNITIES = [
  {
    title: "SIWES placement, maintenance",
    organisation: "Ibadan Steel Mill",
    closesAt: at(16, 23, 59),
    department: "MECHANICAL" as Department,
    minLevel: 300,
  },
  {
    title: "Design intern, 6 months",
    organisation: "Oyo Fabrication Works",
    closesAt: at(28, 23, 59),
    department: "MECHANICAL" as Department,
    minLevel: 400,
  },
  {
    title: "Graduate trainee, instrumentation",
    organisation: "Lafarge Africa",
    closesAt: at(45, 23, 59),
    department: null,
    minLevel: 400,
  },
];

async function main() {
  const passwordHash = await hashPassword(DEV_PASSWORD);

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name },
      create: skill,
    });
  }

  for (const event of EVENTS) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }

  for (const opportunity of OPPORTUNITIES) {
    // Opportunities have no natural key, so re-running the seed would stack
    // duplicates. Clearing them first keeps the list the length it looks.
    await prisma.opportunity.deleteMany({ where: { title: opportunity.title } });
    await prisma.opportunity.create({ data: opportunity });
  }

  for (const member of MEMBERS) {
    // The fixture fields are refreshed on every run; the password and the
    // verification stamp are not, so re-seeding does not sign anyone out or
    // undo a password changed while testing.
    await prisma.member.upsert({
      where: { email: member.email },
      update: member,
      create: { ...member, passwordHash, emailVerifiedAt: new Date() },
    });
  }

  await seedMemberRecord("akolade.salako@tech-u.edu.ng");

  console.log(
    `Seeded ${MEMBERS.length} members, ${EVENTS.length} events and ` +
      `${CREDENTIALS.length} certificates. Sign in as any member with the ` +
      `password: ${DEV_PASSWORD}`
  );
}

/** Attaches the record the member screens read to one seeded member. */
async function seedMemberRecord(email: string) {
  const member = await prisma.member.findUniqueOrThrow({ where: { email } });
  const events = await prisma.event.findMany();
  const eventId = (slug: string) => {
    const found = events.find((e) => e.slug === slug);
    if (!found) throw new Error(`seed: no event ${slug}`);
    return found.id;
  };

  for (const slug of [...REGISTERED, ...ATTENDED, ...MISSED]) {
    await prisma.registration.upsert({
      where: { memberId_eventId: { memberId: member.id, eventId: eventId(slug) } },
      update: {},
      create: { memberId: member.id, eventId: eventId(slug) },
    });
  }

  for (const slug of ATTENDED) {
    const event = events.find((e) => e.slug === slug)!;
    await prisma.attendanceRecord.upsert({
      where: { memberId_eventId: { memberId: member.id, eventId: event.id } },
      update: {},
      create: {
        memberId: member.id,
        eventId: event.id,
        checkedInAt: event.startsAt,
        // Deterministic, so re-seeding exercises the same replay-safety path
        // a phone coming back online would.
        clientEventId: `seed:${member.id}:${event.id}`,
      },
    });
  }

  // Attended the March visit, still owes the note. This one row is what the
  // dashboard's "waiting on you" card is made of.
  await prisma.deliverable.upsert({
    where: {
      memberId_eventId_kind: {
        memberId: member.id,
        eventId: eventId("plant-visit-march"),
        kind: "VISIT_NOTE" as DeliverableKind,
      },
    },
    update: { dueAt: at(4, 17) },
    create: {
      memberId: member.id,
      eventId: eventId("plant-visit-march"),
      kind: "VISIT_NOTE" as DeliverableKind,
      dueAt: at(4, 17),
    },
  });

  const skills = await prisma.skill.findMany();
  const skillId = (slug: string) => {
    const found = skills.find((s) => s.slug === slug);
    if (!found) throw new Error(`seed: no skill ${slug}`);
    return found.id;
  };

  for (const credential of CREDENTIALS) {
    const { skills: skillSlugs, events: eventSlugs, checks, ...fields } = credential;
    const row = await prisma.credential.upsert({
      where: { code: credential.code },
      update: fields,
      create: { ...fields, memberId: member.id },
    });

    for (const slug of skillSlugs) {
      await prisma.credentialSkill.upsert({
        where: {
          credentialId_skillId: { credentialId: row.id, skillId: skillId(slug) },
        },
        update: {},
        create: { credentialId: row.id, skillId: skillId(slug) },
      });
    }

    for (const slug of eventSlugs) {
      await prisma.credentialEvent.upsert({
        where: {
          credentialId_eventId: { credentialId: row.id, eventId: eventId(slug) },
        },
        update: {},
        create: { credentialId: row.id, eventId: eventId(slug) },
      });
    }

    await prisma.verificationCheck.deleteMany({ where: { credentialId: row.id } });
    for (const checkedAt of checks) {
      await prisma.verificationCheck.create({
        data: { credentialId: row.id, checkedAt },
      });
    }
  }

  for (const skill of MEMBER_SKILLS) {
    const { slug, ...fields } = skill;
    await prisma.memberSkill.upsert({
      where: { memberId_skillId: { memberId: member.id, skillId: skillId(slug) } },
      update: fields,
      create: { ...fields, memberId: member.id, skillId: skillId(slug) },
    });
  }

  await prisma.activityEntry.deleteMany({ where: { memberId: member.id } });
  await prisma.activityEntry.createMany({
    data: ACTIVITY.map((entry) => ({ ...entry, memberId: member.id })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
