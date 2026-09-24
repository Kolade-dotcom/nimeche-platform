import Link from "next/link";
import {
  ArrowRightIcon,
  AwardIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "lucide-react";

import { DateBox } from "@/components/date-box";
import { HeroCertificate } from "@/components/hero-certificate";
import { MediaTile } from "@/components/media-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GALLERY, STATS, UPCOMING } from "@/lib/content/home";

const FEATURES = [
  {
    icon: AwardIcon,
    title: "Certificates that verify",
    body: "Finish a programme and the certificate arrives. It carries a code, and anyone holding that code can confirm it in one tap without making an account.",
  },
  {
    icon: SparklesIcon,
    title: "A skill record you did not fill in",
    body: "Attend a CAD clinic, work on a build, present at a review. The platform works out what you have practised and keeps the record for you.",
  },
  {
    icon: BriefcaseIcon,
    title: "Internships and competitions",
    body: "Openings from partner firms and the NSE Oyo branch, posted here first, filtered to your department and level.",
  },
];

const STEPS = [
  {
    title: "Join",
    body: "Name, Tech-U email, password, department, level. Five fields.",
  },
  {
    title: "Attend",
    body: "Register for an event from your phone. We check you in at the door.",
  },
  {
    title: "Complete",
    body: "Finish the programme and your certificate is issued automatically.",
  },
  {
    title: "Keep it",
    body: "It stays in your record after you graduate, and the code keeps working.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-7 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
          <div className="flex flex-col gap-5">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.09em] uppercase">
              NiMechE-SF &middot; Tech-U student branch
            </span>
            <h1 className="max-w-[20ch] text-[28px] font-bold sm:text-[38px]">
              The work you do here should still count after you graduate.
            </h1>
            <p className="text-muted-foreground max-w-[60ch] text-base/relaxed sm:text-[17px]">
              We run plant visits, workshops and competitions for mechanical and
              mechatronics students at Tech-U. Every one you attend is recorded, and the
              certificate you earn carries a code an employer can check.
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/join">
                  Join NiMechE-SF <ArrowRightIcon />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/events">See what is on</Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-[13px]">
              Open to every Mechanical and Mechatronics student. Sign up takes about a
              minute.
            </p>
          </div>

          <HeroCertificate />
        </div>
      </section>

      {/* --------------------------------------------------------- stats */}
      <section className="mx-auto w-full max-w-[1180px] px-4 pb-10 sm:px-7">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-border bg-surface rounded-lg border px-5 py-4"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-heading block text-[30px] leading-tight font-bold tabular-nums">
                  {stat.value}
                </span>
                <span className="text-muted-foreground mt-1 block text-[13px]">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------ features */}
      <section className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-7 lg:py-16">
        <div className="mb-7 flex max-w-[56ch] flex-col gap-3">
          <h2 className="text-[22px] font-bold sm:text-[28px]">
            What membership actually gets you
          </h2>
          <p className="text-muted-foreground text-[17px]">
            Three things, and none of them is a group chat.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <span className="bg-primary-subtle text-primary-text mb-2 flex size-10 items-center justify-center rounded-md">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="leading-relaxed">{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- how it works */}
      <section className="bg-surface-sunken">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-7 lg:py-16">
          <h2 className="mb-7 text-[22px] font-bold sm:text-[28px]">How it works</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="bg-primary font-heading text-primary-foreground flex size-7 items-center justify-center rounded-full text-[13px] font-bold">
                  {index + 1}
                </span>
                <h3 className="text-base font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-sm/relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- events */}
      <section className="mx-auto w-full max-w-[1180px] px-4 py-12 sm:px-7 lg:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold sm:text-[28px]">Coming up</h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-[15px] font-semibold"
          >
            All events <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING.map((event) => (
            <li key={event.slug}>
              <Link
                href={`/events/${event.slug}`}
                className="border-border bg-surface shadow-e1 hover:bg-muted flex h-full items-start gap-4 rounded-lg border p-5 transition-colors"
              >
                <DateBox day={event.day} month={event.month} />
                <span className="flex min-w-0 flex-col gap-2">
                  <Badge>{event.kind}</Badge>
                  <span className="font-heading text-base font-bold">{event.title}</span>
                  <span className="text-muted-foreground text-sm">{event.meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------- gallery */}
      <section className="mx-auto w-full max-w-[1180px] px-4 pb-12 sm:px-7 lg:pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[22px] font-bold sm:text-[28px]">From the gallery</h2>
            <p className="text-muted-foreground">
              Photographs and video from every event, project and competition we run.
            </p>
          </div>
          <Link
            href="/gallery"
            className="flex items-center gap-1 text-[15px] font-semibold"
          >
            All 64 albums <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        {/*
          Fixed rows, and the tiles fill their cell rather than declaring an
          aspect ratio of their own. A tile that does both overflows its
          section, which is exactly what went wrong in the design once.
        */}
        <div className="grid auto-rows-[130px] grid-cols-2 gap-3.5 sm:auto-rows-[150px] lg:auto-rows-[190px] lg:grid-cols-4">
          {GALLERY.map((tile) => (
            <div
              key={tile.id}
              className={
                tile.wide ? "col-span-2 row-span-1 h-full lg:row-span-2" : "h-full"
              }
            >
              <MediaTile tag={tile.tag} caption={tile.caption} duration={tile.duration} />
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- verify CTA */}
      <section className="mx-auto w-full max-w-[1180px] px-4 pb-14 sm:px-7">
        <div className="bg-band flex flex-wrap items-center justify-between gap-5 rounded-2xl px-6 py-8 text-white sm:px-9">
          <div className="flex max-w-[52ch] flex-col gap-2">
            <h2 className="font-heading text-xl font-bold text-white">
              Hiring one of our members?
            </h2>
            <p className="text-white/90">
              Every certificate we issue has a code on it. Enter the code and you will see
              what the holder completed, when, and who signed it off. No account needed.
            </p>
          </div>
          <Link
            href="/verify"
            className="rounded-md bg-white/15 px-3.5 py-2 font-mono text-[13px] tracking-[0.06em] text-white"
          >
            nimeche-aatu.vercel.app/verify
          </Link>
        </div>
      </section>
    </>
  );
}
