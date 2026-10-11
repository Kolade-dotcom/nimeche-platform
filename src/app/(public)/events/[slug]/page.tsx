import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeftIcon, MapPinIcon, VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/events/queries";
import { EventKind } from "@prisma/client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<EventKind, string> = {
  PLANT_VISIT: "Plant visit",
  TRAINING: "Training",
  LECTURE: "Lecture",
  CAREERS: "Careers",
  COMPETITION: "Competition",
  MEETING: "Meeting",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} — NiMechE-SF, Tech-U`,
    description: event.summary ?? undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isUpcoming = event.startsAt >= new Date();
  const kindLabel = KIND_LABELS[event.kind];

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.startsAt.toISOString(),
    endDate: event.endsAt?.toISOString(),
    description: event.description ?? undefined,
    location:
      event.mode === "ONLINE"
        ? {
            "@type": "VirtualLocation",
            url: event.location ?? undefined,
          }
        : {
            "@type": "Place",
            name: event.location ?? "TBC",
          },
    organizer: {
      "@type": "Organization",
      name: "NiMechE-SF, Tech-U",
      url: "https://nimeche-aatu.vercel.app",
    },
    url: `https://nimeche-aatu.vercel.app/events/${event.slug}`,
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back link */}
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        All events
      </Link>

      {/* Cover / hero */}
      <div
        role="img"
        aria-label={`${event.title} cover`}
        className="bg-primary mb-6 flex min-h-[180px] items-center justify-center rounded-2xl px-6 py-10"
        style={{ borderBottom: "4px solid var(--accent)" }}
      >
        <h1 className="text-primary-foreground font-heading text-center text-[24px] font-bold sm:text-[32px]">
          {event.title}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main content */}
        <div className="flex flex-col gap-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge>{kindLabel}</Badge>
            <Badge variant="outline">
              {event.mode === "ONLINE"
                ? "Online"
                : event.mode === "HYBRID"
                  ? "Hybrid"
                  : "In person"}
            </Badge>
          </div>

          {/* Date & time */}
          <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-muted-foreground font-semibold">Date</dt>
            <dd>{format(event.startsAt, "EEEE d MMMM yyyy")}</dd>

            <dt className="text-muted-foreground font-semibold">Time</dt>
            <dd>
              {format(event.startsAt, "h:mm a")}
              {event.endsAt ? ` – ${format(event.endsAt, "h:mm a")}` : ""}
            </dd>

            {event.location && (
              <>
                <dt className="text-muted-foreground font-semibold">
                  {event.mode === "ONLINE" ? "Meeting link" : "Location"}
                </dt>
                <dd className="flex items-center gap-1.5">
                  {event.mode === "ONLINE" ? (
                    <VideoIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  ) : (
                    <MapPinIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
                  )}
                  {event.mode === "ONLINE" ? (
                    <a
                      href={event.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-text underline"
                    >
                      Join link
                    </a>
                  ) : (
                    event.location
                  )}
                </dd>
              </>
            )}

            {event.host && (
              <>
                <dt className="text-muted-foreground font-semibold">Host</dt>
                <dd>{event.host}</dd>
              </>
            )}

            {event.contactHours > 0 && (
              <>
                <dt className="text-muted-foreground font-semibold">Contact hours</dt>
                <dd>{event.contactHours}</dd>
              </>
            )}
          </dl>

          {/* Description */}
          {event.description && (
            <div className="prose prose-sm text-foreground max-w-none">
              <p>{event.description}</p>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="bg-surface-sunken rounded-lg px-4 py-3 text-sm">
              <p className="font-semibold">What to bring</p>
              <p className="text-muted-foreground mt-1">{event.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar: registration CTA */}
        <aside className="flex flex-col gap-4">
          <div className="border-border rounded-xl border p-5">
            <p className="font-heading mb-1 text-base font-bold">
              {isUpcoming ? "Join this event" : "This event has passed"}
            </p>

            {event.capacity !== null && (
              <p className="text-muted-foreground mb-4 text-sm">
                {event.registrationCount} / {event.capacity} places taken
              </p>
            )}

            {isUpcoming ? (
              <Button asChild className="w-full">
                <Link href={`/events/${event.slug}/register`}>Register</Link>
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                {event.attendanceCount} members attended.
              </p>
            )}

            <p className="text-muted-foreground mt-3 text-xs">
              You need an account to register.{" "}
              <Link href="/join" className="text-primary-text underline">
                Join NiMechE-SF
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
