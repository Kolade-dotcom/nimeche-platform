"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Register the signed-in member for an event.
 *
 * Upserts a Registration row so submitting twice is idempotent. Returns an
 * error string rather than throwing so the client component can display it.
 */
export async function registerForEvent(
  eventId: string
): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to register" };
  }

  const memberId = session.user.id;

  try {
    const existing = await db.registration.findUnique({
      where: { memberId_eventId: { memberId, eventId } },
    });

    if (existing) {
      if (existing.cancelledAt === null) {
        // Already registered, treat as success
        return { ok: true };
      }
      // Re-activate a cancelled registration
      await db.registration.update({
        where: { id: existing.id },
        data: { cancelledAt: null },
      });
    } else {
      await db.registration.create({ data: { memberId, eventId } });
    }

    return { ok: true };
  } catch (err) {
    console.error("[registerForEvent]", err);
    return { error: "Registration failed — please try again." };
  }
}
