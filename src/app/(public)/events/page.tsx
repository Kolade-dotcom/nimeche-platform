import Link from "next/link";
import { format } from "date-fns";

import { DateBox } from "@/components/date-box";
import { Badge } from "@/components/ui/badge";
import { getPublicEventList } from "@/lib/events/queries";
import { EventKind } from "@prisma/client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events — NiMechE-SF, Tech-U",
  description:
    "Plant visits, workshops, lectures and competitions run by the NiMechE Student Faculty at Tech-U.",
};

const KIND_LABELS: Record<EventKind, string> = {
  PLANT_VISIT: "Plant visit",
  TRAINING: "Training",
  LECTURE: "Lecture",
  CAREERS: "Careers",
  COMPETITION: "Competition",
  MEETING: "Meeting",
};

const KIND_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Plant visit", value: "PLANT_VISIT" },
  { label: "Training", value: "TRAINING" },
  { label: "Lecture", value: "LECTURE" },
  { label: "Careers", value: "CAREERS" },
  { label: "Competition", value: "COMPETITION" },
];

type Props = {
  searchParams: Promise<{ kind?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const { kind } = await searchParams;
  const { upcoming, past } = await getPublicEventList();

  const filterKind = kind?.toUpperCase() as EventKind | undefined;

  const filteredUpcoming = filterKind
    ? upcoming.filter((e) => e.kind === filterKind)
    : upcoming;
  const filteredPast = filterKind ? past.filter((e) => e.kind === filterKind) : past;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-7">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-[28px] font-bold sm:text-[38px]">Events</h1>
        <p className="text-muted-foreground text-[17px]">
          Plant visits, workshops, lectures and competitions. Register from your
          phone — we check you in at the door.
        </p>
      </div>

      {/* Kind filter tabs */}
      <nav
        aria-label="Filter by event type"
        className="mb-10 flex flex-wrap gap-2"
      >
        {KIND_FILTERS.map((f) => {
          const isActive =
            f.value === "" ? !filterKind : filterKind === f.value;
          const href = f.value ? `/events?kind=${f.value}` : "/events";
          return (
            <Link
              key={f.value}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-[14px] font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-sunken text-muted-foreground hover:bg-muted",
              ].join(" ")}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {/* Upcoming events */}
      <section aria-labelledby="upcoming-heading" className="mb-12">
        <h2
          id="upcoming-heading"
          className="font-heading mb-5 text-[22px] font-bold sm:text-[28px]"
        >
          Upcoming
        </h2>
        {filteredUpcoming.length === 0 ? (
          <p className="text-muted-foreground">
            No events published yet — check back soon.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUpcoming.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="border-border bg-surface shadow-e1 hover:bg-muted hover:shadow-e2 hover:-translate-y-0.5 flex h-full items-start gap-4 rounded-xl border p-5 transition-[background-color,box-shadow,transform] duration-200 ease-[var(--ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <DateBox
                    day={format(event.startsAt, "dd")}
                    month={format(event.startsAt, "MMM").toUpperCase()}
                  />
                  <span className="flex min-w-0 flex-col gap-2">
                    <Badge>{KIND_LABELS[event.kind]}</Badge>
                    <span className="font-heading text-base font-bold leading-snug">
                      {event.title}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {event.mode === "ONLINE" ? "Online" : event.location ?? "TBC"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Past events */}
      {filteredPast.length > 0 && (
        <section aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="font-heading mb-5 text-[22px] font-bold sm:text-[28px]"
          >
            Past events
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPast.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="border-border bg-surface flex h-full items-start gap-4 rounded-xl border p-5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <DateBox
                    day={format(event.startsAt, "dd")}
                    month={format(event.startsAt, "MMM").toUpperCase()}
                    muted
                  />
                  <span className="flex min-w-0 flex-col gap-2">
                    <Badge variant="default">{KIND_LABELS[event.kind]}</Badge>
                    <span className="font-heading text-base font-bold leading-snug">
                      {event.title}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {event.mode === "ONLINE" ? "Online" : event.location ?? "TBC"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
