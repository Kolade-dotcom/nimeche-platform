import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRANCH_CONTENT } from "@/lib/content/about";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — NiMechE-SF, Tech-U",
  description: BRANCH_CONTENT.description,
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-7">
      {/* Hero */}
      <section className="mb-14 max-w-[720px]" aria-labelledby="about-heading">
        <span className="text-muted-foreground mb-3 block text-[11px] font-semibold uppercase tracking-[0.09em]">
          {BRANCH_CONTENT.fullName}
        </span>
        <h1
          id="about-heading"
          className="font-heading mb-5 text-[28px] font-bold sm:text-[38px]"
        >
          Who we are
        </h1>
        <p className="text-muted-foreground text-[17px]/relaxed">{BRANCH_CONTENT.description}</p>
      </section>

      {/* Mission */}
      <section
        className="bg-surface-sunken mb-14 rounded-2xl px-6 py-8 sm:px-10"
        aria-labelledby="mission-heading"
      >
        <h2
          id="mission-heading"
          className="font-heading mb-3 text-[18px] font-bold uppercase tracking-[0.04em]"
        >
          Our mission
        </h2>
        <p className="text-[17px]/relaxed">{BRANCH_CONTENT.mission}</p>
      </section>

      {/* Departments */}
      <section className="mb-14" aria-labelledby="departments-heading">
        <h2
          id="departments-heading"
          className="font-heading mb-6 text-[22px] font-bold sm:text-[28px]"
        >
          Departments
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {BRANCH_CONTENT.departments.map((dept) => (
            <div
              key={dept.slug}
              className="border-border bg-surface rounded-xl border p-6"
            >
              <h3 className="font-heading mb-2 text-[18px] font-bold">{dept.name}</h3>
              <p className="text-muted-foreground text-sm/relaxed">{dept.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="mb-14" aria-labelledby="activities-heading">
        <h2
          id="activities-heading"
          className="font-heading mb-6 text-[22px] font-bold sm:text-[28px]"
        >
          What we do
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BRANCH_CONTENT.activities.map((activity) => (
            <div key={activity.title} className="flex flex-col gap-2">
              <h3 className="font-heading text-base font-bold">{activity.title}</h3>
              <p className="text-muted-foreground text-sm/relaxed">{activity.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive team */}
      {BRANCH_CONTENT.execTeam.length > 0 && (
        <section className="mb-14" aria-labelledby="exec-heading">
          <h2
            id="exec-heading"
            className="font-heading mb-6 text-[22px] font-bold sm:text-[28px]"
          >
            Executive team
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCH_CONTENT.execTeam.map((person) => (
              <li
                key={person.name}
                className="border-border bg-surface rounded-xl border px-5 py-4"
              >
                <p className="font-semibold">{person.name}</p>
                <p className="text-muted-foreground text-sm">{person.title}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Join CTA */}
      <section
        className="bg-band flex flex-wrap items-center justify-between gap-5 rounded-2xl px-6 py-8 text-white sm:px-9"
        aria-labelledby="join-cta-heading"
      >
        <div className="flex flex-col gap-2">
          <h2
            id="join-cta-heading"
            className="font-heading text-xl font-bold text-white"
          >
            Ready to join?
          </h2>
          <p className="max-w-[52ch] text-white/90">
            Open to every Mechanical and Mechatronics student at Tech-U. Sign up takes
            about a minute.
          </p>
        </div>
        <Button asChild className="bg-white text-[var(--primary)] hover:bg-white/90">
          <Link href="/join">
            Join NiMechE-SF <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  );
}
