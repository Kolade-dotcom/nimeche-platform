"use server";

import { revalidatePath } from "next/cache";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { logAudit } from "@/lib/auth/audit";
import { db } from "@/lib/db";

export async function publishOpportunityAction(id: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  await db.opportunity.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: new Date(),
      reviewedById: actor.id,
    },
  });

  await logAudit({
    actorId: actor.id,
    action: "OPPORTUNITY_PUBLISHED",
    entityType: "Opportunity",
    entityId: id,
  });

  revalidatePath("/exco/opportunities");
}

export async function rejectOpportunityAction(id: string, reason?: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  await db.opportunity.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedById: actor.id,
    },
  });

  await logAudit({
    actorId: actor.id,
    action: "OPPORTUNITY_REJECTED",
    entityType: "Opportunity",
    entityId: id,
    diff: { reason: reason ?? null },
  });

  revalidatePath("/exco/opportunities");
}
