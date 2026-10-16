"use server";

import { revalidatePath } from "next/cache";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { issueCredentialsForEvent, revokeCredential } from "@/lib/credentials/issuance";

export async function issueCertificatesAction(eventId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  const result = await issueCredentialsForEvent(actor.id, eventId);
  revalidatePath("/exco/certificates");
  return result;
}

export async function revokeCredentialAction(credentialId: string, reason: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await revokeCredential(actor.id, credentialId, reason);
  revalidatePath("/exco/certificates");
}
