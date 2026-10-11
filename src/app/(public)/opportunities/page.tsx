import Link from "next/link";
import { format } from "date-fns";
import { differenceInCalendarDays } from "date-fns";
import { ExternalLinkIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedOpportunities } from "@/lib/opportunities/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Opportunities — NiMechE-SF, Tech-U",
  description:
    "Internships, scholarships, competitions and more for NiMechE-SF members at Tech-U.",
};

const TYPE_LABELS: Record<string, string> = {
  internship: "Internship",
  job: "Job",
  scholarship: "Scholarship",
  competition: "Competition",
  grant: "Grant",
  conference: "Conference",
  training: "Training",
  volunteering: "Volunteering",
};

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Internship", value: "internship" },
  { label: "Job", value: "job" },
  { label: "Scholarship", value: "scholarship" },
  { label: "Competition", value: "competition" },
  { label: "Grant", value: "grant" },
];

type Props = {
  searchParams: Promise<{ type?: string }>;
};

export default async function OpportunitiesPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const opportunities = await getPublishedOpportunities(
    type ? { type } : undefined
  );
  const now = new Date();

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-7">
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[28px] font-bold sm:text-[38px]">
            Opportunities
          </h1>
          <p className="text-muted-foreground text-[17px]">
            Internships, scholarships, competitions and openings from partner
            organisations.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/opportunities/submit">
            <PlusIcon className="size-4" aria-hidden /> Submit an opportunity
          </Link>
        </Button>
      </div>

      {/* Type filter */}
      <nav aria-label="Filter by opportunity type" className="mb-10 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => {
          const isActive = f.value === "" ? !type : type === f.value;
          const href = f.value ? `/opportunities?type=${f.value}` : "/opportunities";
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

      {/* Opportunity cards */}
      {opportunities.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">
            No opportunities posted yet — check back soon.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {opportunities.map((opp) => {
            const daysLeft = differenceInCalendarDays(opp.closesAt, now);
            const urgent = daysLeft <= 7;

            return (
              <li key={opp.id}>
                <article className="border-border bg-surface shadow-e1 flex h-full flex-col gap-4 rounded-xl border p-5">
                  {/* Header */}
                  <header className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-heading text-base font-bold leading-snug">
                        {opp.title}
                      </h2>
                      <p className="text-muted-foreground text-sm">{opp.organisation}</p>
                    </div>
                    <Badge
                      className="bg-primary-subtle text-primary-text shrink-0"
                    >
                      {TYPE_LABELS[opp.type] ?? opp.type}
                    </Badge>
                  </header>

                  {/* Description */}
                  {opp.description && (
                    <p className="text-muted-foreground line-clamp-3 text-sm/relaxed">
                      {opp.description.slice(0, 160)}
                      {opp.description.length > 160 ? "…" : ""}
                    </p>
                  )}

                  {/* Footer */}
                  <footer className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={[
                        "text-xs font-semibold",
                        urgent
                          ? "text-accent-text"
                          : "text-muted-foreground",
                      ].join(" ")}
                      aria-label={`Closes ${format(opp.closesAt, "d MMM yyyy")}`}
                    >
                      {urgent
                        ? `⚠ Closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                        : `Closes ${format(opp.closesAt, "d MMM yyyy")}`}
                    </span>

                    {opp.externalUrl && (
                      <a
                        href={opp.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] px-3 text-sm font-semibold"
                      >
                        Apply <ExternalLinkIcon className="size-3.5" aria-hidden />
                      </a>
                    )}
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
