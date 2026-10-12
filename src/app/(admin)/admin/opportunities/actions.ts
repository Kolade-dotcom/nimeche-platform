"use server";

import { revalidatePath } from "next/cache";
import { RoleKey } from "@prisma/client";

import { requireRole } from "@/lib/auth/roles";
import { logAudit } from "@/lib/auth/audit";
import { db } from "@/lib/db";

export async function publishOpportunityAction(id: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);

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

  revalidatePath("/admin/opportunities");
}

export async function rejectOpportunityAction(id: string, reason?: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);

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

  revalidatePath("/admin/opportunities");
}
