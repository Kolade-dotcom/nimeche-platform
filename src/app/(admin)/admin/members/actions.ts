"use server";

import { revalidatePath } from "next/cache";
import { RoleKey } from "@prisma/client";

import { requireRole } from "@/lib/auth/roles";
import {
  approveMember,
  rejectMember,
  updateMemberRoleAdmin,
} from "@/lib/members/admin";

export async function approveMemberAction(memberId: string, matricNo?: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await approveMember(actor.id, memberId, matricNo);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}

export async function rejectMemberAction(memberId: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await rejectMember(actor.id, memberId);
  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${memberId}`);
}

export async function updateRoleAction(
  memberId: string,
  roleKey: RoleKey,
  grant: boolean
) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await updateMemberRoleAdmin(actor.id, memberId, roleKey, grant);
  revalidatePath(`/admin/members/${memberId}`);
}
