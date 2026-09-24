import { createHash, randomBytes } from "node:crypto";

import { db } from "@/lib/db";
import type { TokenPurpose } from "@prisma/client";

/** An hour for a reset, a day for a first confirmation. */
const TTL_MINUTES: Record<TokenPurpose, number> = {
  PASSWORD_RESET: 60,
  EMAIL_VERIFICATION: 60 * 24,
};

/** Only ever the hash goes in the database, never the token itself. */
function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Mints a single-use token and returns the plaintext, which is the only time
 * it exists anywhere. It goes straight into the email and is not kept.
 *
 * Any unspent token for the same purpose is spent first, so asking for a
 * second reset link silently kills the first.
 */
export async function issueToken(memberId: string, purpose: TokenPurpose) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TTL_MINUTES[purpose] * 60_000);

  await db.$transaction([
    db.authToken.updateMany({
      where: { memberId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    }),
    db.authToken.create({
      data: { tokenHash: hash(token), purpose, memberId, expiresAt },
    }),
  ]);

  return token;
}

/**
 * Spends a token, returning the member it belonged to, or null if it was
 * unknown, already used, or expired. Marking it used is part of the same
 * query, so two tabs racing on the same link cannot both win.
 */
export async function consumeToken(token: string, purpose: TokenPurpose) {
  const record = await db.authToken.findUnique({
    where: { tokenHash: hash(token) },
    include: { member: true },
  });

  if (!record) return null;
  if (record.purpose !== purpose) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  const spent = await db.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Somebody else spent it between the read and the write.
  if (spent.count === 0) return null;

  return record.member;
}
