import { cache } from "react";

import { db } from "@/lib/db";

export type ProjectStatusFilter = "all" | "active" | "completed";

const publicProjectWhere = { isPublic: true } as const;

export const getPublicProjects = cache(async function getPublicProjects(
  status: ProjectStatusFilter = "all"
) {
  return db.project.findMany({
    where: {
      ...publicProjectWhere,
      ...(status === "active" ? { status: "ACTIVE" } : {}),
      ...(status === "completed" ? { status: "COMPLETED" } : {}),
    },
    orderBy: [{ completedOn: "desc" }, { startedOn: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      startedOn: true,
      completedOn: true,
      _count: { select: { members: true } },
    },
  });
});

export const getPublicProject = cache(async function getPublicProject(slug: string) {
  const project = await db.project.findFirst({
    where: { slug, ...publicProjectWhere },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      startedOn: true,
      completedOn: true,
      members: { select: { role: true } },
      milestones: {
        orderBy: [{ dueOn: "asc" }, { title: "asc" }],
        select: { id: true, title: true, dueOn: true, completedOn: true, status: true },
      },
    },
  });

  if (!project) return null;

  const skills = await db.activitySkill.findMany({
    where: { sourceType: "project", sourceId: project.id },
    select: { skill: { select: { id: true, name: true } } },
    orderBy: { skill: { name: "asc" } },
  });

  return {
    ...project,
    skills: skills.map(({ skill }) => skill),
  };
});
