import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  AwardIcon,
  BadgeCheckIcon,
  CalendarCheckIcon,
  PenLineIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { EventRow } from "@/components/member/event-row";
import { Well } from "@/components/member/pieces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SESSION_TARGET,
  getActivity,
  getCredentials,
  getEventTotals,
  getOpportunities,
  getOutstanding,
  getSkills,
  getUpcoming,
} from "@/lib/member/queries";
import { requireMember } from "@/lib/member/session";
import { clockTime, dueWording, firstName, greeting, longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const member = await requireMember();

  const [upcoming, outstanding, totals, credentials, skills, opportunities, activity] =
    await Promise.all([
      getUpcoming(member.id, 2),
      getOutstanding(member.id),
      getEventTotals(member.id),
      getCredentials(member.id),
      getSkills(member.id),
      getOpportunities(member, 2),
      getActivity(member.id, 3),
    ]);

  const due = outstanding[0];
  const done = Math.min(totals.attended, SESSION_TARGET);

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          {greeting()}, {firstName(member.fullName)}
        </h1>
        <p className="text-muted-foreground">
          {summarise(totals.upcoming, outstanding.length)}
        </p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 p-5">
          <div className="flex items-start gap-3">
            <CalendarCheckIcon className="text-primary-text mt-0.5 size-6 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-lg font-bold">Your development record</h2>
              <p className="text-muted-foreground text-[13px]">
                {done} of the {SESSION_TARGET} activities the branch counts toward a full
                session.
              </p>
            </div>
          </div>
          <div
            className="bg-surface-sunken h-2 overflow-hidden rounded-full"
            role="img"
            aria-label={`${done} of ${SESSION_TARGET} activities complete`}
          >
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.round((done / SESSION_TARGET) * 100)}%` }}
            />
          </div>
          <dl className="mt-auto grid grid-cols-3 gap-3 pt-1">
            {[
              ["Attended", totals.attended],
              ["Certificates", credentials.length],
              ["Skills building", skills.length],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-[13px]">{label}</dt>
                <dd className="font-heading text-xl font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">What is next</h2>
            <Link
              href="/me/events"
              className="text-primary-text text-[13px] font-semibold"
            >
              All my events
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <Well>
              Nothing on the calendar yet. New events appear here as soon as they are
              published.
            </Well>
          ) : (
            <div className="flex flex-col gap-4">
              {upcoming.map((event) => (
                <EventRow
                  key={event.id}
                  startsAt={event.startsAt}
                  title={event.title}
                  muted={!event.registered}
                  meta={
                    <>
                      {event.location ?? clockTime(event.startsAt)}
                      {event.registered ? " · You are registered" : null}
                    </>
                  }
                  trailing={
                    event.registered ? (
                      <Badge variant="primary">Going</Badge>
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/me/events">Register</Link>
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {due ? (
        <Card className="bg-accent-subtle mb-5 flex-row flex-wrap items-center gap-4 border-transparent p-5">
          <TriangleAlertIcon className="text-accent-text size-5 shrink-0" />
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
            <h2 className="font-heading font-bold">
              Your visit note is {dueWording(due.dueAt)}
            </h2>
            <p className="text-muted-foreground text-[13px]">
              One page on {due.eventTitle}. It is the last thing standing between you and
              that certificate.
            </p>
          </div>
          <Button size="sm" disabled>
            <PenLineIcon /> Write it now
          </Button>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">Certificates</h2>
            <Link
              href="/me/certificates"
              className="text-primary-text text-[13px] font-semibold"
            >
              See all {credentials.length}
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {credentials.slice(0, 2).map((credential) => (
              <li key={credential.id} className="flex items-start gap-3">
                <AwardIcon className="text-primary-text mt-0.5 size-[18px] shrink-0" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <strong className="text-sm font-semibold">{credential.title}</strong>
                  <span className="text-muted-foreground text-[13px]">
                    Issued {longDate(credential.issuedAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {due ? <Well>One more on the way, once your visit note is in.</Well> : null}
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">Skills you have built</h2>
            <Link
              href="/me/skills"
              className="text-primary-text text-[13px] font-semibold"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <Badge
                key={skill.id}
                variant={
                  skill.level === "VERIFIED" || skill.level === "COMPETENT"
                    ? "primary"
                    : "default"
                }
              >
                {skill.name}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground text-[13px]">
            Worked out from what you have attended and completed. There is no form to fill
            in.
          </p>
        </Card>

        <Card className="gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold">Matched to you</h2>
            <span className="text-muted-foreground text-[13px]">Soon</span>
          </div>
          <ul className="flex flex-col gap-3">
            {opportunities.map((opportunity) => (
              <li key={opportunity.id} className="flex flex-col gap-0.5">
                <strong className="text-sm font-semibold">{opportunity.title}</strong>
                <span className="text-muted-foreground text-[13px]">
                  {opportunity.organisation} · closes {longDate(opportunity.closesAt)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-[13px]">
            Filtered to your department and level. Nothing here scores you against a role.
          </p>
        </Card>
      </div>

      <Card className="mt-5 gap-4 p-5">
        <h2 className="font-heading text-lg font-bold">Recent activity</h2>
        <ul className="flex flex-col">
          {activity.map((entry, index) => (
            <li
              key={entry.id}
              className={
                index > 0
                  ? "border-border flex items-start gap-3 border-t pt-3.5"
                  : "flex items-start gap-3"
              }
            >
              <span className="bg-primary-subtle text-primary-text mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                {activityIcon(entry.kind)}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 pb-3.5">
                <strong className="text-sm font-semibold">{entry.summary}</strong>
                <span className="text-muted-foreground text-[13px]">
                  {longDate(entry.occurredAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/me/events"
          className="text-primary-text inline-flex items-center gap-1.5 text-[13px] font-semibold"
        >
          See your events <ArrowRightIcon className="size-4" />
        </Link>
      </Card>
    </>
  );
}

/** Small numbers read better as words than as digits in a sentence. */
const WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

function count(n: number, singular: string, plural: string): string {
  return `${WORDS[n] ?? n} ${n === 1 ? singular : plural}`;
}

/** The one line under the greeting, built from what is actually waiting. */
function summarise(upcoming: number, outstanding: number): string {
  const parts: string[] = [];
  if (upcoming > 0) parts.push(count(upcoming, "event", "events") + " coming up");
  if (outstanding > 0) {
    parts.push(count(outstanding, "thing", "things") + " to submit");
  }
  if (parts.length === 0) return "Nothing is waiting on you. Have a look at what is on.";
  return `You have ${parts.join(" and ")}.`;
}

function activityIcon(kind: string) {
  if (kind === "CERTIFICATE_ISSUED") return <AwardIcon className="size-4" />;
  if (kind === "SKILL_LEVEL_UP") return <SparklesIcon className="size-4" />;
  return <BadgeCheckIcon className="size-4" />;
}
