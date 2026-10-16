import { redirect } from "next/navigation";

import { type Member, RoleKey } from "@prisma/client";

import { db } from "@/lib/db";
import { requireMember } from "@/lib/member/session";

import { logAudit } from "./audit";

/** Organizational roles allowed into the Exco dashboard and its operational actions. */
export const EXECUTIVE_DASHBOARD_ROLES: RoleKey[] = [
  RoleKey.EXECUTIVE,
  RoleKey.PRESIDENT,
];

/**
 * Returns the RoleKey values currently held by a member.
 */
export async function getMemberRoles(memberId: string): Promise<RoleKey[]> {
  const rows = await db.memberRole.findMany({
    where: { memberId },
    include: { role: true },
  });
  return rows.map((r) => r.role.key);
}

/**
 * Ensures the signed-in member holds at least one of the allowed roles.
 *
 * Calls requireMember() first (which redirects to /sign-in if no session or
 * no matching row). Then checks roles. If none match, redirects to /sign-in.
 */
export async function requireRole(
  allowedKeys: RoleKey[],
): Promise<{ member: Member; roles: RoleKey[] }> {
  const member = await requireMember();
  const roles = await getMemberRoles(member.id);
  const hasRole = roles.some((r) => allowedKeys.includes(r));
  if (!hasRole) redirect("/sign-in");
  return { member, roles };
}

/** Requires the distinct Tech Admin role and sends other signed-in members home. */
export async function requireTechAdmin(): Promise<{ member: Member; roles: RoleKey[] }> {
  const member = await requireMember();
  const roles = await getMemberRoles(member.id);
  if (!roles.includes(RoleKey.ADMIN)) redirect("/me");
  return { member, roles };
}

/**
 * Grants a role to a member. Upserts so calling it twice is safe.
 * Writes an audit log entry.
 */
export async function grantRole(
  actorId: string,
  targetMemberId: string,
  roleKey: RoleKey,
): Promise<void> {
  // Roles are normally seeded, but this also makes a newly introduced role
  // usable immediately after its enum is deployed.
  const labels: Record<RoleKey, string> = {
    MEMBER: "Member",
    EXECUTIVE: "Executive",
    PRESIDENT: "President",
    ADMIN: "Admin",
    CONTENT_MANAGER: "Content manager",
    PROJECT_LEAD: "Project lead",
  };
  const role = await db.role.upsert({
    where: { key: roleKey },
    update: {},
    create: { key: roleKey, label: labels[roleKey] },
  });

  await db.memberRole.upsert({
    where: { memberId_roleId: { memberId: targetMemberId, roleId: role.id } },
    create: {
      memberId: targetMemberId,
      roleId: role.id,
      grantedBy: actorId,
    },
    update: {
      grantedBy: actorId,
      grantedAt: new Date(),
    },
  });

  await logAudit({
    actorId,
    action: "ROLE_GRANTED",
    entityType: "Member",
    entityId: targetMemberId,
    diff: { roleKey },
  });
}

/**
 * Revokes a role from a member. No-ops if the member does not hold it.
 * Writes an audit log entry.
 */
export async function revokeRole(
  actorId: string,
  targetMemberId: string,
  roleKey: RoleKey,
): Promise<void> {
  const role = await db.role.findUnique({ where: { key: roleKey } });
  if (!role) return;

  await db.memberRole.deleteMany({
    where: { memberId: targetMemberId, roleId: role.id },
  });

  await logAudit({
    actorId,
    action: "ROLE_REVOKED",
    entityType: "Member",
    entityId: targetMemberId,
    diff: { roleKey },
  });
}
