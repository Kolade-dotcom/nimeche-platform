import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { longDate } from "@/lib/format";

import { createProjectAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      isPublic: true,
      createdAt: true,
      _count: { select: { members: true, milestones: true } },
    },
  });

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-heading text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Track project teams and milestones. Public projects appear on the branch website.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Start a project record</CardTitle></CardHeader>
        <CardContent>
          <form action={createProjectAction} className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Project name
              <input name="title" required minLength={3} maxLength={120} className="h-11 rounded-md border bg-surface px-3 font-normal" placeholder="Campus Solar Dryer" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:row-span-2">
              Description
              <textarea name="description" maxLength={5000} rows={4} className="rounded-md border bg-surface px-3 py-2 font-normal" placeholder="What the team is building and why." />
            </label>
            <div className="flex items-end">
              <Button type="submit">Create project</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-labelledby="project-list-title" className="space-y-3">
        <h2 id="project-list-title" className="font-heading text-lg font-bold">Project records</h2>
        {projects.length ? projects.map((project) => (
          <Link key={project.id} href={`/exco/projects/${project.id}`} className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
            <Card interactive className="flex-row items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{project.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {project._count.members} members · {project._count.milestones} milestones · created {longDate(project.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Badge variant={project.status === "ACTIVE" ? "accent" : "default"}>{project.status.toLowerCase()}</Badge>
                <Badge variant={project.isPublic ? "primary" : "outline"}>{project.isPublic ? "Public" : "Private"}</Badge>
              </div>
            </Card>
          </Link>
        )) : (
          <Card><CardContent className="text-muted-foreground py-8 text-sm">No projects yet. Create the first project record above.</CardContent></Card>
        )}
      </section>
    </div>
  );
}
