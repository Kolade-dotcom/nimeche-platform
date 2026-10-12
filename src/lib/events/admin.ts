import { db } from "@/lib/db";
import { logAudit } from "@/lib/auth/audit";
import type { EventKind, EventMode, EventStatus } from "@prisma/client";
import type { EventValues } from "@/lib/validation/event";

export type AdminEvent = {
  id: string;
  slug: string;
  title: string;
  kind: EventKind;
  startsAt: Date;
  endsAt: Date | null;
  status: EventStatus;
  mode: EventMode;
  location: string | null;
  registrationCount: number;
  attendanceCount: number;
};

export type AdminEventDetail = AdminEvent & {
  summary: string | null;
  host: string | null;
  notes: string | null;
  contactHours: number;
  capacity: number | null;
  completionRuleId: string | null;
  registeredMembers: {
    id: string;
    fullName: string;
    email: string;
    matricNo: string | null;
  }[];
  attendedMemberIds: string[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await db.event.findUnique({ where: { slug: base } });
  if (!existing) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function getAdminEventList(): Promise<AdminEvent[]> {
  const rows = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      kind: true,
      startsAt: true,
      endsAt: true,
      status: true,
      mode: true,
      location: true,
      _count: { select: { registrations: true, attendance: true } },
    },
  });

  return rows.map(({ _count, ...row }) => ({
    ...row,
    registrationCount: _count.registrations,
    attendanceCount: _count.attendance,
  }));
}

export async function getEventWithAttendance(eventId: string): Promise<AdminEventDetail | null> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      slug: true,
      title: true,
      kind: true,
      startsAt: true,
      endsAt: true,
      status: true,
      mode: true,
      location: true,
      summary: true,
      host: true,
      notes: true,
      contactHours: true,
      capacity: true,
      completionRuleId: true,
      registrations: {
        where: { cancelledAt: null },
        select: {
          member: {
            select: {
              id: true,
              fullName: true,
              email: true,
              matricNo: true,
            },
          },
        },
      },
      attendance: {
        select: { memberId: true },
      },
      _count: { select: { registrations: true, attendance: true } },
    },
  });

  if (!event) return null;

  const { registrations, attendance, _count, ...rest } = event;

  return {
    ...rest,
    registrationCount: _count.registrations,
    attendanceCount: _count.attendance,
    registeredMembers: registrations.map((r) => r.member),
    attendedMemberIds: attendance.map((a) => a.memberId),
  };
}

export async function createEvent(
  actorId: string,
  data: EventValues
): Promise<{ id: string; slug: string }> {
  const slug = await uniqueSlug(slugify(data.title));

  const event = await db.event.create({
    data: {
      slug,
      title: data.title,
      kind: data.kind as EventKind,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      mode: data.mode as EventMode,
      location: data.location || null,
      host: data.host || null,
      capacity: data.capacity ? Number(data.capacity) : null,
      contactHours: Number(data.contactHours ?? 0),
      notes: data.notes || null,
      completionRuleId: data.completionRuleId || null,
      status: "DRAFT",
    },
    select: { id: true, slug: true },
  });

  await logAudit({
    actorId,
    action: "EVENT_PUBLISHED",
    entityType: "Event",
    entityId: event.id,
    diff: { title: data.title, status: "DRAFT" },
  });

  return event;
}

export async function updateEvent(
  actorId: string,
  eventId: string,
  data: EventValues
): Promise<void> {
  await db.event.update({
    where: { id: eventId },
    data: {
      title: data.title,
      kind: data.kind as EventKind,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      mode: data.mode as EventMode,
      location: data.location || null,
      host: data.host || null,
      capacity: data.capacity ? Number(data.capacity) : null,
      contactHours: Number(data.contactHours ?? 0),
      notes: data.notes || null,
      completionRuleId: data.completionRuleId || null,
    },
  });

  await logAudit({
    actorId,
    action: "EVENT_PUBLISHED",
    entityType: "Event",
    entityId: eventId,
    diff: { updated: true },
  });
}

export async function publishEvent(actorId: string, eventId: string): Promise<void> {
  await db.event.update({ where: { id: eventId }, data: { status: "PUBLISHED" } });
  await logAudit({ actorId, action: "EVENT_PUBLISHED", entityType: "Event", entityId: eventId });
}

export async function cancelEvent(actorId: string, eventId: string): Promise<void> {
  await db.event.update({ where: { id: eventId }, data: { status: "CANCELLED" } });
  await logAudit({ actorId, action: "EVENT_CANCELLED", entityType: "Event", entityId: eventId });
}

export async function completeEvent(actorId: string, eventId: string): Promise<void> {
  await db.event.update({ where: { id: eventId }, data: { status: "COMPLETED" } });
  await logAudit({ actorId, action: "EVENT_PUBLISHED", entityType: "Event", entityId: eventId, diff: { status: "COMPLETED" } });

  // Lazy import to avoid circular dependency
  const { runCompletionEvaluation } = await import("@/lib/credentials/completions");
  await runCompletionEvaluation(eventId);
}
