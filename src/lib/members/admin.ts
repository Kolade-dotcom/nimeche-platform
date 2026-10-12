import { db } from "@/lib/db";
import { logAudit } from "@/lib/auth/audit";
import { grantRole, revokeRole } from "@/lib/auth/roles";
import { sendMemberApprovalEmail } from "@/lib/email";
import type { RoleKey } from "@prisma/client";

export type MemberListItem = {
  id: string;
  fullName: string;
  email: string;
  department: string | null;
  level: number | null;
  status: string;
  matricNo: string | null;
  memberNo: string | null;
  createdAt: Date;
  joinedAt: Date | null;
};

export type MemberDetail = MemberListItem & {
  execTitle: string | null;
  expectedGraduation: number | null;
  emailVerifiedAt: Date | null;
  roles: RoleKey[];
  credentialCount: number;
  recentActivity: {
    id: string;
    kind: string;
    summary: string;
    occurredAt: Date;
  }[];
};

export async function getMemberList(filter?: {
  search?: string;
  status?: string;
}): Promise<MemberListItem[]> {
  const where: Record<string, unknown> = {};

  if (filter?.status && filter.status !== "all") {
    where.status = filter.status.toUpperCase();
  }

  if (filter?.search) {
    const search = filter.search.trim();
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { matricNo: { contains: search, mode: "insensitive" } },
    ];
  }

  const rows = await db.member.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      department: true,
      level: true,
      status: true,
      matricNo: true,
      memberNo: true,
      createdAt: true,
      joinedAt: true,
    },
  });

  return rows.map((row) => ({
    ...row,
    department: row.department as string | null,
    status: row.status as string,
  }));
}

export async function getMemberDetail(id: string): Promise<MemberDetail | null> {
  const member = await db.member.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      department: true,
      level: true,
      status: true,
      matricNo: true,
      memberNo: true,
      createdAt: true,
      joinedAt: true,
      execTitle: true,
      expectedGraduation: true,
      emailVerifiedAt: true,
      memberRoles: { include: { role: true } },
      activity: {
        orderBy: { occurredAt: "desc" },
        take: 5,
        select: { id: true, kind: true, summary: true, occurredAt: true },
      },
      _count: { select: { credentials: true } },
    },
  });

  if (!member) return null;

  const { memberRoles, activity, _count, ...rest } = member;

  return {
    ...rest,
    department: rest.department as string | null,
    status: rest.status as string,
    roles: memberRoles.map((mr) => mr.role.key),
    credentialCount: _count.credentials,
    recentActivity: activity.map((a) => ({
      id: a.id,
      kind: a.kind as string,
      summary: a.summary,
      occurredAt: a.occurredAt,
    })),
  };
}

export async function approveMember(
  actorId: string,
  memberId: string,
  matricNo?: string
): Promise<void> {
  // Generate member number based on current active member count
  const activeCount = await db.member.count({ where: { status: "ACTIVE" } });
  const memberNo = `SF-TECHU-${String(activeCount + 1).padStart(4, "0")}`;

  const member = await db.member.update({
    where: { id: memberId },
    data: {
      status: "ACTIVE",
      joinedAt: new Date(),
      memberNo,
      ...(matricNo ? { matricNo } : {}),
    },
    select: { email: true, fullName: true },
  });

  await db.activityEntry.create({
    data: {
      memberId,
      kind: "MEMBERSHIP_APPROVED",
      summary: "Membership approved by an executive.",
    },
  });

  await logAudit({
    actorId,
    action: "MEMBER_APPROVED",
    entityType: "Member",
    entityId: memberId,
    diff: { memberNo, matricNo: matricNo ?? null },
  });

  // Fire and forget — email failure must not roll back the approval
  void sendMemberApprovalEmail(member.email, member.fullName).catch((err: unknown) => {
    console.error("[approveMember] failed to send approval email", err);
  });
}

export async function rejectMember(actorId: string, memberId: string): Promise<void> {
  await db.member.update({
    where: { id: memberId },
    data: { status: "LAPSED" },
  });

  await logAudit({
    actorId,
    action: "MEMBER_REJECTED",
    entityType: "Member",
    entityId: memberId,
  });
}

export async function updateMemberRoleAdmin(
  actorId: string,
  memberId: string,
  roleKey: RoleKey,
  grant: boolean
): Promise<void> {
  if (grant) {
    await grantRole(actorId, memberId, roleKey);
  } else {
    await revokeRole(actorId, memberId, roleKey);
  }
}
