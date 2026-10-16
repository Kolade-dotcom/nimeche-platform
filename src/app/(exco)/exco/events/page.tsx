import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminEventList } from "@/lib/events/admin";
import { longDate, clockTime } from "@/lib/format";

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

export default async function EventsPage() {
  const events = await getAdminEventList();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/exco/events/new">New event</Link>
        </Button>
      </div>

      <Table stacked>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead>Attended</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                No events yet.{" "}
                <Link href="/exco/events/new" className="text-primary-text underline">
                  Create the first one
                </Link>
                .
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell data-label="Title" className="font-medium">
                  {event.title}
                </TableCell>
                <TableCell data-label="Kind">
                  {KIND_LABELS[event.kind] ?? event.kind}
                </TableCell>
                <TableCell data-label="Date" className="tabular-nums">
                  {longDate(event.startsAt)} {clockTime(event.startsAt)}
                </TableCell>
                <TableCell data-label="Status">
                  <Badge variant={STATUS_VARIANTS[event.status] ?? "default"}>
                    {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell data-label="Registered" className="tabular-nums">
                  {event.registrationCount}
                </TableCell>
                <TableCell data-label="Attended" className="tabular-nums">
                  {event.attendanceCount}
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    <Link
                      href={`/exco/events/${event.id}`}
                      className="text-primary-text text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/exco/events/${event.id}/attendance`}
                      className="text-primary-text text-sm font-medium hover:underline"
                    >
                      Attendance
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
