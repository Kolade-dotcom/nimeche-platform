import { db } from "@/lib/db";

export type CredentialVerifyResult =
  | { found: false }
  | {
      found: true;
      revoked: boolean;
      credential: {
        title: string;
        memberName: string;
        issuedAt: Date;
        sessions: number;
        contactHours: number;
        skills: string[];
        events: { title: string; startsAt: Date }[];
        revokedAt: Date | null;
      };
    };

/**
 * Look up a credential by its public verification code.
 *
 * Also writes a VerificationCheck row so the member can see their certificate
 * was checked. The check is recorded even if the certificate is revoked — the
 * revocation is the material fact, not the check itself.
 */
export async function verifyCredential(code: string): Promise<CredentialVerifyResult> {
  const credential = await db.credential.findUnique({
    where: { code },
    select: {
      id: true,
      title: true,
      issuedAt: true,
      sessions: true,
      contactHours: true,
      revokedAt: true,
      member: { select: { fullName: true } },
      skills: { select: { skill: { select: { name: true } } } },
      events: {
        select: { event: { select: { title: true, startsAt: true } } },
      },
    },
  });

  if (!credential) return { found: false };

  const isValid = credential.revokedAt === null;

  // Record the check — fire and forget; audit failure never blocks the response
  void db.verificationCheck
    .create({
      data: {
        credentialId: credential.id,
        verified: isValid,
      },
    })
    .catch((err: unknown) => {
      console.error("[verifyCredential] failed to write VerificationCheck", err);
    });

  return {
    found: true,
    revoked: !isValid,
    credential: {
      title: credential.title,
      memberName: credential.member.fullName,
      issuedAt: credential.issuedAt,
      sessions: credential.sessions,
      contactHours: credential.contactHours,
      skills: credential.skills.map((s) => s.skill.name),
      events: credential.events.map((e) => ({
        title: e.event.title,
        startsAt: e.event.startsAt,
      })),
      revokedAt: credential.revokedAt,
    },
  };
}
