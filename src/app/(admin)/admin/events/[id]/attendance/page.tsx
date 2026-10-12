import { notFound } from "next/navigation";

import { AttendanceCapture } from "@/components/admin/attendance-capture";
import { getEventWithAttendance } from "@/lib/events/admin";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventWithAttendance(id);

  if (!event) notFound();

  return (
    <AttendanceCapture
      eventId={event.id}
      eventTitle={event.title}
      registeredMembers={event.registeredMembers}
      initialAttended={event.attendedMemberIds}
    />
  );
}
