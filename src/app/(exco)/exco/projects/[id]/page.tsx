import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { longDate } from "@/lib/format";

import {
  addProjectMemberAction,
  addProjectMilestoneAction,
  completeMilestoneAction,
  removeProjectMemberAction,
  updateProjectSkillsAction,
  updateProjectAction,
} from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["PROPOSED", "ACTIVE", "COMPLETED", "PAUSED"] as const;

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, activeMembers, skills] = await Promise.all([
    db.project.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        status: true,
        isPublic: true,
        startedOn: true,
        completedOn: true,
        members: {
          orderBy: { joinedAt: "asc" },
          select: {
            role: true,
            member: { select: { id: true, fullName: true, email: true, status: true } },
          },
        },
        milestones: { orderBy: [{ dueOn: "asc" }, { title: "asc" }] },
      },
    }),
    db.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true },
    }),
    db.skill.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();
  const members = activeMembers.filter(
    (member) => !project.members.some((projectMember) => projectMember.member.id === member.id)
  );
  const projectSkills = await db.activitySkill.findMany({
    where: { sourceType: "project", sourceId: id },
    select: { skillId: true },
  });
  const selectedSkillIds = new Set(projectSkills.map(({ skillId }) => skillId));

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Project record</p>
          <h1 className="font-heading mt-1 text-2xl font-bold">{project.title}</h1>
        </div>
        <div className="flex gap-2">
          <Badge variant={project.status === "ACTIVE" ? "accent" : "default"}>{project.status.toLowerCase()}</Badge>
          {project.isPublic ? <Badge variant="primary">Public</Badge> : null}
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Project details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProjectAction.bind(null, id)} className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Project name
              <input name="title" defaultValue={project.title} required minLength={3} maxLength={120} className="h-11 rounded-md border bg-surface px-3 font-normal" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Status
              <select name="status" defaultValue={project.status} className="h-11 rounded-md border bg-surface px-3 font-normal">
                {STATUSES.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Description
              <textarea name="description" defaultValue={project.description ?? ""} maxLength={5000} rows={5} className="rounded-md border bg-surface px-3 py-2 font-normal" />
            </label>
            <label className="flex items-center gap-3 text-sm sm:col-span-2">
              <input type="checkbox" name="isPublic" defaultChecked={project.isPublic} className="size-4 accent-[var(--primary)]" />
              Show this project on the public website
            </label>
            <div><Button type="submit">Save project</Button></div>
          </form>
          {project.startedOn ? <p className="text-muted-foreground mt-4 text-xs">Started {longDate(project.startedOn)}{project.completedOn ? ` · completed ${longDate(project.completedOn)}` : ""}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Team ({project.members.length})</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {project.members.length ? (
            <ul className="divide-y">
              {project.members.map(({ member, role }) => (
                <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-muted-foreground text-sm">{role} · {member.email}</p>
                  </div>
                  <form action={removeProjectMemberAction.bind(null, id, member.id)}>
                    <Button type="submit" variant="outline" size="sm">Remove</Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-sm">No members have been added to this team.</p>}

          {members.length ? (
            <form action={addProjectMemberAction.bind(null, id)} className="grid gap-3 border-t pt-5 sm:grid-cols-[1fr_1fr_auto]">
              <label className="flex flex-col gap-2 text-sm font-medium">Member
                <select name="memberId" required className="h-11 rounded-md border bg-surface px-3 font-normal">
                  <option value="">Choose an active member</option>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.fullName} · {member.email}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">Project role
                <input name="role" required minLength={2} maxLength={80} className="h-11 rounded-md border bg-surface px-3 font-normal" placeholder="Design lead" />
              </label>
              <div className="flex items-end"><Button type="submit" variant="outline">Add to team</Button></div>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {project.milestones.length ? (
            <ul className="divide-y">
              {project.milestones.map((milestone) => (
                <li key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {milestone.completedOn ? `Completed ${longDate(milestone.completedOn)}` : milestone.dueOn ? `Due ${longDate(milestone.dueOn)}` : "No due date"}
                    </p>
                  </div>
                  {!milestone.completedOn && milestone.status !== "COMPLETED" ? (
                    <form action={completeMilestoneAction.bind(null, id, milestone.id)}><Button type="submit" variant="outline" size="sm">Mark complete</Button></form>
                  ) : <Badge variant="primary">Complete</Badge>}
                </li>
              ))}
            </ul>
          ) : <p className="text-muted-foreground text-sm">No milestones added.</p>}
          <form action={addProjectMilestoneAction.bind(null, id)} className="grid gap-3 border-t pt-5 sm:grid-cols-[1fr_220px_auto]">
            <label className="flex flex-col gap-2 text-sm font-medium">Milestone
              <input name="title" required minLength={2} maxLength={160} className="h-11 rounded-md border bg-surface px-3 font-normal" placeholder="First prototype test" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">Target date
              <input name="dueOn" type="date" className="h-11 rounded-md border bg-surface px-3 font-normal" />
            </label>
            <div className="flex items-end"><Button type="submit" variant="outline">Add milestone</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Skills this project develops</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProjectSkillsAction.bind(null, id)} className="space-y-4">
            {skills.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                    <input type="checkbox" name="skillIds" value={skill.id} defaultChecked={selectedSkillIds.has(skill.id)} className="size-4 accent-[var(--primary)]" />
                    {skill.name}
                  </label>
                ))}
              </div>
            ) : <p className="text-muted-foreground text-sm">Add skills in the database before assigning them to a project.</p>}
            <Button type="submit" variant="outline">Save project skills</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
