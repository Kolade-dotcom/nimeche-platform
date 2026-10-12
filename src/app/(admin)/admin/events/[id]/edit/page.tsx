import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";
import { getEventWithAttendance } from "@/lib/events/admin";
import { updateEventAction } from "@/app/(admin)/admin/events/actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventWithAttendance(id);

  if (!event) notFound();

  // Format dates for datetime-local inputs (YYYY-MM-DDTHH:mm)
  function toLocalDateTime(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  const defaultValues = {
    title: event.title,
    kind: event.kind,
    startsAt: toLocalDateTime(event.startsAt),
    endsAt: event.endsAt ? toLocalDateTime(event.endsAt) : undefined,
    mode: event.mode,
    location: event.location ?? undefined,
    host: event.host ?? undefined,
    capacity: event.capacity ?? undefined,
    contactHours: event.contactHours,
    notes: event.notes ?? undefined,
    completionRuleId: event.completionRuleId ?? undefined,
  };

  const action = async (formData: FormData) => {
    "use server";
    await updateEventAction(id, formData);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit event</h1>
        <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            defaultValues={defaultValues}
            action={action}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
