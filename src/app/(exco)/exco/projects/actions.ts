"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { deriveMemberSkills } from "@/lib/skills/derivation";

const statusSchema = z.enum(["PROPOSED", "ACTIVE", "COMPLETED", "PAUSED"]);

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").slice(0, 70);
}

async function uniqueSlug(value: string) {
  const base = slugify(value) || `project-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (await db.project.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export async function createProjectAction(formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const parsed = z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(5000).optional(),
  }).safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) throw new Error("Enter a project title and a description under 5,000 characters.");

  const project = await db.project.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      slug: await uniqueSlug(parsed.data.title),
    },
    select: { id: true },
  });
  revalidatePath("/exco/projects");
  redirect(`/exco/projects/${project.id}`);
}

export async function updateProjectAction(projectId: string, formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const parsed = z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(5000),
    status: statusSchema,
    isPublic: z.boolean(),
  }).safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    isPublic: formData.get("isPublic") === "on",
  });
  if (!parsed.success) throw new Error("Check the project details and try again.");

  const current = await db.project.findUnique({
    where: { id: projectId },
    select: {
      startedOn: true,
      completedOn: true,
      members: { select: { memberId: true } },
    },
  });
  if (!current) throw new Error("Project not found.");

  await db.project.update({
    where: { id: projectId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      status: parsed.data.status,
      isPublic: parsed.data.isPublic,
      startedOn:
        parsed.data.status === "ACTIVE" || parsed.data.status === "COMPLETED"
          ? (current.startedOn ?? new Date())
          : undefined,
      completedOn:
        parsed.data.status === "COMPLETED" ? (current.completedOn ?? new Date()) : null,
    },
  });

  if (parsed.data.status === "COMPLETED" && current.members.length) {
    await db.activityCompletion.createMany({
      data: current.members.map(({ memberId }) => ({
        memberId,
        sourceType: "project",
        sourceId: projectId,
      })),
      skipDuplicates: true,
    });
    await Promise.all(current.members.map(({ memberId }) => deriveMemberSkills(memberId)));
  }

  revalidatePath("/exco/projects");
  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function addProjectMemberAction(projectId: string, formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const parsed = z.object({
    memberId: z.string().min(1),
    role: z.string().trim().min(2).max(80),
  }).safeParse({ memberId: formData.get("memberId"), role: formData.get("role") });
  if (!parsed.success) throw new Error("Choose a member and enter their project role.");

  const member = await db.member.findFirst({
    where: { id: parsed.data.memberId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!member) throw new Error("Only an active member can be added to a project.");

  await db.projectMember.upsert({
    where: { projectId_memberId: { projectId, memberId: parsed.data.memberId } },
    create: { projectId, memberId: parsed.data.memberId, role: parsed.data.role },
    update: { role: parsed.data.role },
  });

  const project = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
  if (project?.status === "COMPLETED") {
    await db.activityCompletion.upsert({
      where: {
        memberId_sourceType_sourceId: {
          memberId: parsed.data.memberId,
          sourceType: "project",
          sourceId: projectId,
        },
      },
      create: { memberId: parsed.data.memberId, sourceType: "project", sourceId: projectId },
      update: {},
    });
    await deriveMemberSkills(parsed.data.memberId);
  }

  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function removeProjectMemberAction(projectId: string, memberId: string) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await db.projectMember.deleteMany({ where: { projectId, memberId } });
  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function addProjectMilestoneAction(projectId: string, formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const parsed = z.object({
    title: z.string().trim().min(2).max(160),
    dueOn: z.string().optional(),
  }).safeParse({ title: formData.get("title"), dueOn: formData.get("dueOn") || undefined });
  if (!parsed.success) throw new Error("Enter a milestone name.");

  await db.projectMilestone.create({
    data: {
      projectId,
      title: parsed.data.title,
      dueOn: parsed.data.dueOn ? new Date(`${parsed.data.dueOn}T12:00:00`) : null,
    },
  });
  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function completeMilestoneAction(projectId: string, milestoneId: string) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await db.projectMilestone.updateMany({
    where: { id: milestoneId, projectId },
    data: { status: "COMPLETED", completedOn: new Date() },
  });
  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function updateProjectSkillsAction(projectId: string, formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const skillIds = [...new Set(formData.getAll("skillIds").filter((value): value is string => typeof value === "string"))];
  const validSkills = await db.skill.findMany({
    where: { id: { in: skillIds } },
    select: { id: true },
  });
  if (validSkills.length !== skillIds.length) throw new Error("One or more selected skills could not be found.");

  const project = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
  if (!project) throw new Error("Project not found.");

  await db.$transaction([
    db.activitySkill.deleteMany({ where: { sourceType: "project", sourceId: projectId } }),
    ...(skillIds.length
      ? [db.activitySkill.createMany({ data: skillIds.map((skillId) => ({ sourceType: "project", sourceId: projectId, skillId })) })]
      : []),
  ]);

  if (project?.status === "COMPLETED") {
    const projectMembers = await db.projectMember.findMany({ where: { projectId }, select: { memberId: true } });
    await Promise.all(projectMembers.map(({ memberId }) => deriveMemberSkills(memberId)));
  }

  revalidatePath(`/exco/projects/${projectId}`);
  revalidatePath("/projects");
}
