import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

type AttendanceRecord = {
  memberId: string;
  clientEventId: string;
  checkedInAt: string;
};

type BulkBody = {
  records: AttendanceRecord[];
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: eventId } = await params;

  let body: BulkBody;
  try {
    body = (await request.json()) as BulkBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.records)) {
    return NextResponse.json({ error: "records must be an array" }, { status: 400 });
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let processed = 0;
  let skipped = 0;

  for (const record of body.records) {
    if (!record.memberId || !record.clientEventId || !record.checkedInAt) {
      skipped++;
      continue;
    }

    // For walk-ins: create a Registration row if the member isn't registered
    await db.registration.upsert({
      where: { memberId_eventId: { memberId: record.memberId, eventId } },
      create: { memberId: record.memberId, eventId },
      update: {},
    });

    // Upsert attendance — clientEventId is the idempotency key
    try {
      await db.attendanceRecord.upsert({
        where: { clientEventId: record.clientEventId },
        create: {
          memberId: record.memberId,
          eventId,
          clientEventId: record.clientEventId,
          checkedInAt: new Date(record.checkedInAt),
        },
        update: {}, // already exists — idempotent
      });
      processed++;
    } catch {
      // memberId+eventId unique constraint — member already checked in with a different clientEventId
      skipped++;
    }
  }

  return NextResponse.json({ processed, skipped });
}
