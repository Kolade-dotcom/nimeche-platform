import { cache } from "react";

import { db } from "@/lib/db";
import type { SessionMember } from "@/lib/member/session";

/**
 * Every read the member screens make, in one file.
 *
 * Pages call these; they do not reach for `db` themselves. Two reasons: the
 * shape a screen needs is a decision worth naming, and when the derivation
 * rules change - what counts as missed, what counts toward a full session -
 * there is one place to change them rather than five pages to search.
 */

/** Activities the branch counts toward a full session (design plan 6.2). */
export const SESSION_TARGET = 15;

const eventFields = {
  id: true,
  slug: true,
  title: true,
  kind: true,
  summary: true,
  startsAt: true,
  endsAt: true,
  mode: true,
  location: true,
  host: true,
  notes: true,
  contactHours: true,
} as const;

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export type UpcomingEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: Date;
  location: string | null;
  host: string | null;
  notes: string | null;
  registered: boolean;
};

/** The next events, each flagged with whether this member has a place. */
export const getUpcoming = cache(async function getUpcoming(
  memberId: string,
  take = 6
): Promise<UpcomingEvent[]> {
  const events = await db.event.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take,
    select: {
      ...eventFields,
      registrations: {
        where: { memberId, cancelledAt: null },
        select: { id: true },
      },
    },
  });

  return events.map(({ registrations, ...event }) => ({
    ...event,
    registered: registrations.length > 0,
  }));
});

export type PastEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: Date;
  location: string | null;
  attended: boolean;
  /** The certificate this event fed into, if one has been issued. */
  credentialCode: string | null;
  credentialTitle: string | null;
};

/**
 * What the member did, and did not do, this session.
 *
 * "Missed" is registered-and-not-checked-in. An event nobody registered for
 * is not a miss - it is an event they never said they were coming to, and
 * putting it on their record as a failure would be wrong.
 */
export const getPastEvents = cache(async function getPastEvents(
  memberId: string
): Promise<PastEvent[]> {
  const events = await db.event.findMany({
    where: {
      startsAt: { lt: new Date() },
      OR: [
        { registrations: { some: { memberId, cancelledAt: null } } },
        { attendance: { some: { memberId } } },
      ],
    },
    orderBy: { startsAt: "desc" },
    select: {
      ...eventFields,
      attendance: { where: { memberId }, select: { id: true } },
      credentials: {
        where: { credential: { memberId, revokedAt: null } },
        select: { credential: { select: { code: true, title: true } } },
      },
    },
  });

  return events.map(({ attendance, credentials, ...event }) => {
    const credential = credentials[0]?.credential;
    return {
      ...event,
      attended: attendance.length > 0,
      credentialCode: credential?.code ?? null,
      credentialTitle: credential?.title ?? null,
    };
  });
});

export type OutstandingDeliverable = {
  id: string;
  kind: string;
  dueAt: Date;
  eventTitle: string;
  eventStartsAt: Date;
};

/** What the member still owes. The dashboard's "waiting on you" card. */
export const getOutstanding = cache(async function getOutstanding(
  memberId: string
): Promise<OutstandingDeliverable[]> {
  const rows = await db.deliverable.findMany({
    where: { memberId, submittedAt: null },
    orderBy: { dueAt: "asc" },
    select: {
      id: true,
      kind: true,
      dueAt: true,
      event: { select: { title: true, startsAt: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    dueAt: row.dueAt,
    eventTitle: row.event.title,
    eventStartsAt: row.event.startsAt,
  }));
});

export type EventTotals = {
  attended: number;
  upcoming: number;
  outstanding: number;
  missed: number;
};

export const getEventTotals = cache(async function getEventTotals(
  memberId: string
): Promise<EventTotals> {
  const [attended, upcoming, outstanding, past] = await Promise.all([
    db.attendanceRecord.count({ where: { memberId } }),
    // Every future event, not just the ones this member has a place at - it
    // is the number the "Coming up" list below shows, and two different
    // counts under one heading read as a bug rather than a distinction.
    db.event.count({ where: { startsAt: { gte: new Date() } } }),
    db.deliverable.count({ where: { memberId, submittedAt: null } }),
    db.registration.count({
      where: { memberId, cancelledAt: null, event: { startsAt: { lt: new Date() } } },
    }),
  ]);

  const attendedPast = await db.attendanceRecord.count({
    where: { memberId, event: { startsAt: { lt: new Date() } } },
  });

  return { attended, upcoming, outstanding, missed: Math.max(0, past - attendedPast) };
});

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

export type MemberCredential = {
  id: string;
  code: string;
  title: string;
  sessions: number;
  contactHours: number;
  issuedAt: Date;
  skills: string[];
};

export const getCredentials = cache(async function getCredentials(
  memberId: string
): Promise<MemberCredential[]> {
  const rows = await db.credential.findMany({
    where: { memberId, revokedAt: null },
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      code: true,
      title: true,
      sessions: true,
      contactHours: true,
      issuedAt: true,
      skills: { select: { skill: { select: { name: true } } } },
    },
  });

  return rows.map(({ skills, ...credential }) => ({
    ...credential,
    skills: skills.map((s) => s.skill.name),
  }));
});

export type CredentialCheck = {
  id: string;
  checkedAt: Date;
  verified: boolean;
  credentialTitle: string;
  credentialCode: string;
};

/**
 * That somebody checked a certificate, and when.
 *
 * Deliberately never who: the public verification page does not ask an
 * employer to identify themselves, so there is nothing to show and nothing
 * stored (design plan 1.4).
 */
export const getVerificationChecks = cache(async function getVerificationChecks(
  memberId: string,
  take = 8
): Promise<CredentialCheck[]> {
  const rows = await db.verificationCheck.findMany({
    where: { credential: { memberId } },
    orderBy: { checkedAt: "desc" },
    take,
    select: {
      id: true,
      checkedAt: true,
      verified: true,
      credential: { select: { title: true, code: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    checkedAt: row.checkedAt,
    verified: row.verified,
    credentialTitle: row.credential.title,
    credentialCode: row.credential.code,
  }));
});

/* -------------------------------------------------------------------------- */
/* Skills                                                                     */
/* -------------------------------------------------------------------------- */

export type MemberSkillRow = {
  id: string;
  name: string;
  slug: string;
  level: "INTRODUCED" | "PRACTISING" | "COMPETENT" | "VERIFIED";
  evidence: string[];
  verifiedBy: string | null;
};

/** Highest level first, so the strongest evidence leads. */
const LEVEL_ORDER = { VERIFIED: 0, COMPETENT: 1, PRACTISING: 2, INTRODUCED: 3 } as const;

export const getSkills = cache(async function getSkills(
  memberId: string
): Promise<MemberSkillRow[]> {
  const rows = await db.memberSkill.findMany({
    where: { memberId },
    select: {
      id: true,
      level: true,
      evidence: true,
      verifiedBy: true,
      skill: { select: { name: true, slug: true } },
    },
  });

  return rows
    .map((row) => ({
      id: row.id,
      name: row.skill.name,
      slug: row.skill.slug,
      level: row.level,
      evidence: row.evidence,
      verifiedBy: row.verifiedBy,
    }))
    .sort(
      (a, b) =>
        LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.name.localeCompare(b.name)
    );
});

/* -------------------------------------------------------------------------- */
/* Everything else                                                            */
/* -------------------------------------------------------------------------- */

export const getActivity = cache(async function getActivity(memberId: string, take = 6) {
  return db.activityEntry.findMany({
    where: { memberId },
    orderBy: { occurredAt: "desc" },
    take,
    select: { id: true, kind: true, summary: true, occurredAt: true },
  });
});

/**
 * Openings this member could actually apply for - their department, their
 * level, still open. A filter, not a recommendation: nothing here scores a
 * member against a role, and the page says so rather than implying otherwise.
 */
export const getOpportunities = cache(async function getOpportunities(
  member: Pick<SessionMember, "department" | "level">,
  take = 4
) {
  return db.opportunity.findMany({
    where: {
      closesAt: { gte: new Date() },
      AND: [
        { OR: [{ department: null }, { department: member.department ?? undefined }] },
        { OR: [{ minLevel: null }, { minLevel: { lte: member.level ?? 0 } }] },
      ],
    },
    orderBy: { closesAt: "asc" },
    take,
  });
});

/** The four numbers on the profile's "this session" strip. */
export const getProfileTotals = cache(async function getProfileTotals(memberId: string) {
  const [activities, certificates, skills, contactHours] = await Promise.all([
    db.attendanceRecord.count({ where: { memberId } }),
    db.credential.count({ where: { memberId, revokedAt: null } }),
    db.memberSkill.count({ where: { memberId } }),
    db.credential.aggregate({
      where: { memberId, revokedAt: null },
      _sum: { contactHours: true },
    }),
  ]);

  return {
    activities,
    certificates,
    skills,
    contactHours: contactHours._sum.contactHours ?? 0,
  };
});
