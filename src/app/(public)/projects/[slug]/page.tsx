import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicProject } from "@/lib/projects/queries";
import { longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  return {
    title: project?.title ?? "Project",
    description: project?.description ?? "A NiMechE-SF engineering project at Tech-U.",
  };
}

const STATUS_LABELS: Record<string, string> = {
  PROPOSED: "Proposed",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  PAUSED: "Paused",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-7 sm:py-12">
      <Button asChild variant="ghost" className="mb-6 -ml-3">
        <Link href="/projects">← All projects</Link>
      </Button>

      <header className="mb-10 overflow-hidden rounded-xl border bg-surface">
        <div className="flex min-h-48 items-center justify-center bg-surface-sunken sm:min-h-64">
          <span aria-hidden="true" className="font-heading text-7xl font-bold text-primary-text/25">
            {project.title.slice(0, 1).toUpperCase()}
          </span>
        </div>
        <div className="space-y-4 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={project.status === "ACTIVE" ? "accent" : "primary"}>
              {STATUS_LABELS[project.status] ?? project.status}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {project.members.length} contributor{project.members.length === 1 ? "" : "s"}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">{project.title}</h1>
          {project.startedOn ? (
            <p className="text-muted-foreground text-sm">
              Started {longDate(project.startedOn)}
              {project.completedOn ? ` · completed ${longDate(project.completedOn)}` : " · ongoing"}
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section aria-labelledby="about-project">
            <h2 id="about-project" className="font-heading mb-3 text-xl font-bold">
              About this project
            </h2>
            <p className="text-muted-foreground text-base/7 whitespace-pre-line">
              {project.description || "The team has not added a project description yet."}
            </p>
          </section>

          <section aria-labelledby="project-progress">
            <h2 id="project-progress" className="font-heading mb-4 text-xl font-bold">
              Project progress
            </h2>
            {project.milestones.length ? (
              <ol className="space-y-0 border-l-2 border-border pl-5">
                {project.milestones.map((milestone) => {
                  const complete = milestone.completedOn !== null || milestone.status === "COMPLETED";
                  return (
                    <li key={milestone.id} className="relative pb-6 last:pb-0">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[27px] top-1 size-3 rounded-full border-2 ${
                          complete ? "border-primary bg-primary" : "border-border-strong bg-surface"
                        }`}
                      />
                      <h3 className="font-semibold">{milestone.title}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {complete
                          ? milestone.completedOn
                            ? `Completed ${longDate(milestone.completedOn)}`
                            : "Completed"
                          : milestone.dueOn
                            ? `Planned for ${longDate(milestone.dueOn)}`
                            : "In progress"}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">The project team has not added milestones yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Skills in this project</CardTitle></CardHeader>
            <CardContent>
              {project.skills.length ? (
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => <Badge key={skill.id} variant="primary">{skill.name}</Badge>)}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Skills will appear as the team records them.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Built by members</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground text-sm/6">
              {project.members.length} member{project.members.length === 1 ? " is" : "s are"} contributing to this project.
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}
