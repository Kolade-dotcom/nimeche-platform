"use server";

import { revalidatePath } from "next/cache";
import { RoleKey } from "@prisma/client";

import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import {
  approveMember,
  rejectMember,
  updateMemberRoleAdmin,
} from "@/lib/members/admin";

export async function approveMemberAction(memberId: string, matricNo?: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await approveMember(actor.id, memberId, matricNo);
  revalidatePath("/exco/members");
  revalidatePath(`/exco/members/${memberId}`);
}

export async function rejectMemberAction(memberId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await rejectMember(actor.id, memberId);
  revalidatePath("/exco/members");
  revalidatePath(`/exco/members/${memberId}`);
}

export async function updateRoleAction(
  memberId: string,
  roleKey: RoleKey,
  grant: boolean
) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await updateMemberRoleAdmin(actor.id, memberId, roleKey, grant);
  revalidatePath(`/exco/members/${memberId}`);
  revalidatePath("/exco/members");
  revalidatePath("/exco");
  revalidatePath("/");
}
