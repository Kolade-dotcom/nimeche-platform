import { db } from "@/lib/db";
import { logAudit } from "@/lib/auth/audit";
import { sendCertificateIssuedEmail } from "@/lib/email";
import { siteUrl } from "@/lib/env";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a unique 9-char verification code in the format NM-XXXX-XXXX.
 * Uses only unambiguous characters — no 0/O/1/I.
 * Retries up to 5 times on collision.
 */
export async function generateVerificationCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const part1 = Array.from(
      { length: 4 },
      () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]!
    ).join("");
    const part2 = Array.from(
      { length: 4 },
      () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]!
    ).join("");
    const code = `NM-${part1}-${part2}`;

    const existing = await db.credential.findUnique({ where: { code } });
    if (!existing) return code;
  }

  throw new Error("Could not generate a unique verification code after 5 attempts.");
}

/**
 * Issues certificates for all qualifying members of an event.
 * Skips members who already have a credential for this event.
 */
export async function issueCredentialsForEvent(
  actorId: string,
  eventId: string
): Promise<{ issued: number }> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, contactHours: true },
  });

  if (!event) throw new Error("Event not found.");

  // Find completions for this event that don't yet have a credential
  const completions = await db.activityCompletion.findMany({
    where: { sourceType: "event", sourceId: eventId },
    select: {
      memberId: true,
      member: {
        select: {
          email: true,
          fullName: true,
          credentials: {
            where: { events: { some: { eventId } } },
            select: { id: true },
          },
        },
      },
    },
  });

  let issued = 0;

  for (const completion of completions) {
    // Skip if credential already exists for this event
    if (completion.member.credentials.length > 0) continue;

    const code = await generateVerificationCode();

    const credential = await db.credential.create({
      data: {
        code,
        memberId: completion.memberId,
        title: event.title,
        sessions: 1,
        contactHours: event.contactHours,
      },
      select: { id: true },
    });

    // Link to the event
    await db.credentialEvent.create({
      data: { credentialId: credential.id, eventId: event.id },
    });

    // Activity entry
    await db.activityEntry.create({
      data: {
        memberId: completion.memberId,
        kind: "CERTIFICATE_ISSUED",
        summary: `Certificate issued for ${event.title}.`,
      },
    });

    await logAudit({
      actorId,
      action: "CREDENTIAL_ISSUED",
      entityType: "Credential",
      entityId: credential.id,
      diff: { eventId, memberId: completion.memberId },
    });

    // Fire and forget email
    const verifyUrl = siteUrl(`/verify/${encodeURIComponent(code)}`);
    void sendCertificateIssuedEmail(
      completion.member.email,
      completion.member.fullName,
      event.title,
      code,
      verifyUrl
    ).catch((err: unknown) => {
      console.error("[issueCredentialsForEvent] email failed", err);
    });

    issued++;
  }

  return { issued };
}

export async function revokeCredential(
  actorId: string,
  credentialId: string,
  reason: string
): Promise<void> {
  await db.credential.update({
    where: { id: credentialId },
    data: { revokedAt: new Date() },
  });

  await logAudit({
    actorId,
    action: "CREDENTIAL_REVOKED",
    entityType: "Credential",
    entityId: credentialId,
    diff: { reason },
  });
}
