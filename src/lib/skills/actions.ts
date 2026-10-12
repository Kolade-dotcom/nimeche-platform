"use server";

import type { RoleKey } from "@prisma/client";

import { requireRole } from "@/lib/auth/roles";
import { logAudit } from "@/lib/auth/audit";
import { db } from "@/lib/db";

/**
 * Executive sign-off on a skill. VERIFIED is the one level no amount of
 * attendance can reach — it exists because somebody with a name looked at the
 * work and put their name against it (design plan §8).
 */
export async function verifyMemberSkill(
  memberId: string,
  skillId: string
): Promise<{ ok: boolean; error?: string }> {
  const { member: actor } = await requireRole(["EXECUTIVE", "ADMIN"] as RoleKey[]);

  const skill = await db.skill.findUnique({
    where: { id: skillId },
    select: { name: true },
  });
  if (!skill) return { ok: false, error: "That skill no longer exists." };

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { fullName: true },
  });
  if (!member) return { ok: false, error: "That member no longer exists." };

  await db.memberSkill.upsert({
    where: { memberId_skillId: { memberId, skillId } },
    create: {
      memberId,
      skillId,
      level: "VERIFIED",
      evidence: [`Verified by ${actor.fullName}`],
      verifiedBy: actor.fullName,
      verifiedAt: new Date(),
    },
    update: {
      level: "VERIFIED",
      verifiedBy: actor.fullName,
      verifiedAt: new Date(),
    },
  });

  await logAudit({
    actorId: actor.id,
    action: "ROLE_GRANTED",
    entityType: "MemberSkill",
    entityId: `${memberId}:${skillId}`,
    diff: { skill: skill.name, verifiedBy: actor.fullName },
  });

  return { ok: true };
}
