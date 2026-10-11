import { cache } from "react";

import { db } from "@/lib/db";
import { EventKind } from "@prisma/client";

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  kind: EventKind;
  startsAt: Date;
  endsAt: Date | null;
  location: string | null;
  mode: string;
  summary: string | null;
};

export type PublicEventDetail = PublicEvent & {
  host: string | null;
  notes: string | null;
  contactHours: number;
  capacity: number | null;
  description: string | null;
  registrationCount: number;
  attendanceCount: number;
};

export type PublicEventList = {
  upcoming: PublicEvent[];
  past: PublicEvent[];
};

const publicEventSelect = {
  id: true,
  slug: true,
  title: true,
  kind: true,
  startsAt: true,
  endsAt: true,
  location: true,
  mode: true,
  summary: true,
} as const;

/** All published events split into upcoming and past. */
export const getPublicEventList = cache(async function getPublicEventList(): Promise<PublicEventList> {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { gte: now } },
      orderBy: { startsAt: "asc" },
      select: publicEventSelect,
    }),
    db.event.findMany({
      where: { status: "PUBLISHED", startsAt: { lt: now } },
      orderBy: { startsAt: "desc" },
      select: publicEventSelect,
    }),
  ]);
  return { upcoming, past };
});

/** A single published event with registration/attendance counts. */
export const getEventBySlug = cache(async function getEventBySlug(
  slug: string
): Promise<PublicEventDetail | null> {
  const event = await db.event.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      ...publicEventSelect,
      host: true,
      notes: true,
      contactHours: true,
      capacity: true,
      // Event has no standalone description column — use summary as description
      _count: {
        select: {
          registrations: true,
          attendance: true,
        },
      },
    },
  });

  if (!event) return null;

  const { _count, ...rest } = event;
  return {
    ...rest,
    description: rest.summary,
    registrationCount: _count.registrations,
    attendanceCount: _count.attendance,
  };
});

/** Published events filtered by kind. */
export const getPublicEventsByKind = cache(async function getPublicEventsByKind(
  kind: EventKind
): Promise<PublicEvent[]> {
  return db.event.findMany({
    where: { status: "PUBLISHED", kind },
    orderBy: { startsAt: "asc" },
    select: publicEventSelect,
  });
});
