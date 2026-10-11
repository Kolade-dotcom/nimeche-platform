import { type AuditAction, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Appends a row to AuditLog.
 *
 * Deliberately never throws — an audit failure must not abort the business
 * operation that triggered it. All errors are swallowed and logged to the
 * console so they are visible in server logs without crashing the caller.
 */
export async function logAudit({
  actorId,
  action,
  entityType,
  entityId,
  diff,
}: {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  diff?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        diff: diff !== undefined ? (diff as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });
  } catch (err) {
    console.error("[logAudit] failed to write audit log", { action, entityType, entityId }, err);
  }
}
