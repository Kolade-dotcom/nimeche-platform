import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventWithAttendance } from "@/lib/events/admin";
import { longDate, clockTime } from "@/lib/format";
import {
  publishEventAction,
  cancelEventAction,
  completeEventAction,
} from "@/app/(exco)/exco/events/actions";

export const dynamic = "force-dynamic";

const STATUS_VARIANTS = {
  DRAFT: "default",
  PUBLISHED: "primary",
  CANCELLED: "destructive",
  COMPLETED: "outline",
} as const;

const KIND_LABELS: Record<string, string> = {
  PLANT_VISIT: "Plant visit",
  TRAINING: "Training",
  LECTURE: "Lecture",
  CAREERS: "Careers",
  COMPETITION: "Competition",
  MEETING: "Meeting",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventWithAttendance(id);

  if (!event) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {KIND_LABELS[event.kind] ?? event.kind} ·{" "}
            {longDate(event.startsAt)} at {clockTime(event.startsAt)}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[event.status] ?? "default"}>
          {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Registered" value={event.registrationCount} />
        <StatTile label="Attended" value={event.attendanceCount} />
        <StatTile
          label="Capacity"
          value={event.capacity != null ? event.capacity : "—"}
        />
      </div>

      {/* Actions and links */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/exco/events/${id}/edit`}>Edit</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/exco/events/${id}/attendance`}>Attendance</Link>
        </Button>

        {event.status === "DRAFT" && (
          <form
            action={async () => {
              "use server";
              await publishEventAction(id);
            }}
          >
            <Button type="submit" size="sm">
              Publish
            </Button>
          </form>
        )}

        {event.status === "PUBLISHED" && (
          <>
            <form
              action={async () => {
                "use server";
                await completeEventAction(id);
              }}
            >
              <Button type="submit" size="sm">
                Mark complete
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                await cancelEventAction(id);
              }}
            >
              <Button type="submit" size="sm" variant="outline">
                Cancel event
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Mode">{event.mode}</Row>
          {event.location && <Row label="Location">{event.location}</Row>}
          {event.host && <Row label="Host">{event.host}</Row>}
          <Row label="Contact hours">{event.contactHours}h</Row>
          {event.notes && <Row label="Notes">{event.notes}</Row>}
        </CardContent>
      </Card>

      {/* Attendance summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registered members ({event.registrationCount} registered,{" "}
            {event.attendanceCount} attended)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {event.registeredMembers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No registrations yet.</p>
          ) : (
            <ul className="divide-border divide-y text-sm">
              {event.registeredMembers.map((m) => {
                const attended = event.attendedMemberIds.includes(m.id);
                return (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <span className={attended ? "font-medium" : "text-muted-foreground"}>
                      {m.fullName}
                    </span>
                    <span
                      aria-label={attended ? "Attended" : "Not attended"}
                      className={
                        attended
                          ? "text-primary-text text-xs font-semibold"
                          : "text-muted-foreground text-xs"
                      }
                    >
                      {attended ? "✓ Attended" : "Not attended"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="px-5">
        <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
