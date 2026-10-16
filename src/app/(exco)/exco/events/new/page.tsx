import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";
import { createEventAction } from "@/app/(exco)/exco/events/actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">New event</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in the details. The event starts as a draft — publish it when it is ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm action={createEventAction} submitLabel="Create event" />
        </CardContent>
      </Card>
    </div>
  );
}
