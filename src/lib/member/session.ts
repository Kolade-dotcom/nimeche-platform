import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * The signed-in member's row, or null.
 *
 * `cache` de-duplicates this within one request, so a layout and the page it
 * wraps share a single query rather than issuing two.
 */
export const getSessionMember = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.member.findUnique({ where: { id: session.user.id } });
});

/**
 * The same, but for pages that cannot render without one.
 *
 * The proxy already turns signed-out visitors away, and this still checks:
 * the session is a JWT that outlives the row it describes, so a member deleted
 * mid-session arrives here holding a cookie that says otherwise. Trusting the
 * middleware alone would crash the page instead of signing them out.
 */
export async function requireMember() {
  const member = await getSessionMember();
  if (!member) redirect("/sign-in?next=/me");
  return member;
}

export type SessionMember = NonNullable<Awaited<ReturnType<typeof getSessionMember>>>;
