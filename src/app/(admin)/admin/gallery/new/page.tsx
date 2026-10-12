import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { createAlbumAction } from "@/app/(admin)/admin/gallery/actions";

export default async function NewAlbumPage() {
  const publishedEvents = await db.event.findMany({
    where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    orderBy: { startsAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">New album</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create an album to organise photos. You can upload photos after creating it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Album details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAlbumAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                minLength={2}
                maxLength={120}
                placeholder="e.g. Plant Visit — Dangote Refinery"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description
                <span className="text-muted-foreground font-normal"> (optional)</span>
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={500}
                placeholder="A brief description of this album."
                className="border-input bg-surface w-full rounded-sm border px-4 py-3 text-sm"
              />
            </div>

            {publishedEvents.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="eventId">
                  Linked event
                  <span className="text-muted-foreground font-normal"> (optional)</span>
                </Label>
                <select
                  id="eventId"
                  name="eventId"
                  className="border-input bg-surface h-11 w-full rounded-sm border px-4 text-sm"
                >
                  <option value="">— No event —</option>
                  {publishedEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" className="w-full">
              Create album
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
