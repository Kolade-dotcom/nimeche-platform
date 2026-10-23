import { createHash } from "node:crypto";
import { cookies } from "next/headers";

import { db } from "@/lib/db";

export const FRESHER_COOKIE = "nimeche_fresher_access";

export function hashFresherToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentFresher() {
  const token = (await cookies()).get(FRESHER_COOKIE)?.value;
  if (!token) return null;

  return db.fresherIntake.findFirst({
    where: {
      accessTokenHash: hashFresherToken(token),
      accessExpiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      department: true,
    },
  });
}
