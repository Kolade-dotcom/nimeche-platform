import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProjects, type ProjectStatusFilter } from "@/lib/projects/queries";
import { longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Engineering projects built by NiMechE-SF members at Tech-U.",
};

const FILTERS: { label: string; value: ProjectStatusFilter }[] = [
  { label: "Everything", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const STATUS_LABELS: Record<string, string> = {
  PROPOSED: "Proposed",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  PAUSED: "Paused",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status: ProjectStatusFilter =
    params.status === "active" || params.status === "completed" ? params.status : "all";
  const projects = await getPublicProjects(status);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-7 sm:py-14">
      <header className="mb-9 max-w-3xl space-y-3">
        <p className="text-primary-text text-xs font-semibold tracking-[0.14em] uppercase">
          NiMechE-SF · Tech-U
        </p>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Projects built by members</h1>
        <p className="text-muted-foreground text-base/7 sm:text-lg/8">
          See what our members are designing, testing and making together.
        </p>
      </header>

      <nav aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          const href = filter.value === "all" ? "/projects" : `/projects?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-sunken text-muted-foreground hover:bg-muted"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No public projects yet</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Projects will appear here when the branch shares them. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
            >
              <Card
                interactive
                className="h-full overflow-hidden gap-0 py-0 transition-transform group-hover:-translate-y-0.5"
              >
                <div
                  aria-hidden="true"
                  className="flex aspect-video items-center justify-center border-b bg-surface-sunken text-primary-text"
                >
                  <span className="font-heading text-4xl font-bold opacity-30">
                    {project.title.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={project.status === "ACTIVE" ? "accent" : "primary"}>
                      {STATUS_LABELS[project.status] ?? project.status}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {project._count.members} member{project._count.members === 1 ? "" : "s"}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary-text">
                    {project.title}
                  </CardTitle>
                  {project.description ? (
                    <p className="text-muted-foreground line-clamp-3 text-sm/6">
                      {project.description}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-auto pt-1 text-xs">
                    {project.completedOn
                      ? `Completed ${longDate(project.completedOn)}`
                      : project.startedOn
                        ? `Started ${longDate(project.startedOn)}`
                        : "Project showcase"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
