"use server";

import { revalidatePath } from "next/cache";
import { RoleKey } from "@prisma/client";

import { requireRole } from "@/lib/auth/roles";
import { issueCredentialsForEvent, revokeCredential } from "@/lib/credentials/issuance";

export async function issueCertificatesAction(eventId: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  const result = await issueCredentialsForEvent(actor.id, eventId);
  revalidatePath("/admin/certificates");
  return result;
}

export async function revokeCredentialAction(credentialId: string, reason: string) {
  const { member: actor } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);
  await revokeCredential(actor.id, credentialId, reason);
  revalidatePath("/admin/certificates");
}
