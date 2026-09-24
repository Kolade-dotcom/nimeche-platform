import Link from "next/link";
import type { Metadata } from "next";
import { PenLineIcon } from "lucide-react";

import { EventRow } from "@/components/member/event-row";
import { PageIntro, StatRow, StatTile, Well } from "@/components/member/pieces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateBox } from "@/components/date-box";
import {
  getEventTotals,
  getOutstanding,
  getPastEvents,
  getUpcoming,
} from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { clockTime, dateParts, dueWording, longDate } from "@/lib/format";

export const metadata: Metadata = { title: "My events" };

export default async function MemberEventsPage() {
  const member = await requireMember();

  const [totals, upcoming, outstanding, past] = await Promise.all([
    getEventTotals(member.id),
    getUpcoming(member.id, 6),
    getOutstanding(member.id),
    getPastEvents(member.id),
  ]);

  return (
    <>
      <PageIntro
        title="My events"
        lede="Everything you have registered for, attended or missed this session."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/events">Browse all events</Link>
          </Button>
        }
      />

      <StatRow>
        <StatTile value={totals.attended} label="attended" />
        <StatTile value={totals.upcoming} label="coming up" />
        <StatTile value={totals.outstanding} label="note due" />
        <StatTile value={totals.missed} label="missed" />
      </StatRow>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">Coming up</h2>
        {upcoming.length === 0 ? (
          <Well>
            Nothing on the calendar yet. New events appear here as soon as they are
            published.
          </Well>
        ) : (
          upcoming.map((event) => (
            <Card key={event.id} className="p-4 sm:p-5">
              <EventRow
                startsAt={event.startsAt}
                title={event.title}
                muted={!event.registered}
                meta={
                  <>
                    {event.location ?? clockTime(event.startsAt)}
                    {event.host ? ` · ${event.host}` : null}
                    {event.notes ? ` · ${event.notes}` : null}
                  </>
                }
                trailing={
                  event.registered ? (
                    <>
                      <Badge variant="primary">Going</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.slug}`}>Details</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge>Not registered</Badge>
                      <Button variant="outline" size="sm" disabled>
                        Register
                      </Button>
                    </>
                  )
                }
              />
            </Card>
          ))
        )}
      </section>

      {outstanding.length > 0 ? (
        <section className="mb-8 flex flex-col gap-3">
          <h2 className="font-heading text-lg font-bold">Waiting on you</h2>
          {outstanding.map((item) => {
            const { day, month } = dateParts(item.eventStartsAt);
            return (
              <Card
                key={item.id}
                className="bg-accent-subtle flex-row flex-wrap items-center gap-4 border-transparent p-4 sm:p-5"
              >
                <DateBox
                  day={day}
                  month={month}
                  className="bg-brand-accent text-on-accent"
                />
                <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
                  <strong className="text-[15px] font-semibold">{item.eventTitle}</strong>
                  <span className="text-muted-foreground text-[13px]">
                    Attended. Your one-page visit note is {dueWording(item.dueAt)}.
                  </span>
                </div>
                <Button size="sm" disabled>
                  <PenLineIcon /> Write the note
                </Button>
              </Card>
            );
          })}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold">Earlier this session</h2>
        {past.length === 0 ? (
          <Well>Nothing yet. Your first event will show up here afterwards.</Well>
        ) : (
          past.map((event) => (
            <Card key={event.id} className="p-4 sm:p-5">
              <EventRow
                startsAt={event.startsAt}
                title={event.title}
                muted
                meta={
                  event.credentialCode
                    ? `Certificate issued · ${event.credentialCode}`
                    : (event.location ?? longDate(event.startsAt))
                }
                trailing={
                  <>
                    {event.attended ? (
                      <Badge variant="primary">Attended</Badge>
                    ) : (
                      <Badge variant="destructive">Missed</Badge>
                    )}
                    {event.credentialCode ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/me/certificates">Certificate</Link>
                      </Button>
                    ) : null}
                  </>
                }
              />
            </Card>
          ))
        )}
      </section>
    </>
  );
}
