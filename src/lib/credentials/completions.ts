import { db } from "@/lib/db";
import { deriveMemberSkills } from "@/lib/skills/derivation";

/**
 * After an event is marked COMPLETED, evaluate which attendees have satisfied
 * the completion rule, create ActivityCompletion rows for them, and re-derive
 * their skills. Returns completions created and members whose skills moved.
 */
export async function runCompletionEvaluation(eventId: string): Promise<{
  completed: number;
  skillsChanged: number;
}> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      completionRuleId: true,
      completionRule: {
        select: { kind: true },
      },
      attendance: {
        select: { memberId: true },
      },
    },
  });

  if (!event) return { completed: 0, skillsChanged: 0 };

  const kind = event.completionRule?.kind ?? "ATTENDANCE_ONLY";

  let completed = 0;

  for (const record of event.attendance) {
    const { memberId } = record;

    // Skip if already completed
    const existing = await db.activityCompletion.findUnique({
      where: {
        memberId_sourceType_sourceId: {
          memberId,
          sourceType: "event",
          sourceId: eventId,
        },
      },
    });
    if (existing) continue;

    let qualifies = false;

    if (kind === "ATTENDANCE_ONLY") {
      qualifies = true;
    } else if (kind === "ATTENDANCE_PLUS_DELIVERABLE") {
      const deliverable = await db.deliverable.findFirst({
        where: { memberId, eventId, submittedAt: { not: null } },
        select: { id: true },
      });
      qualifies = deliverable !== null;
    } else if (kind === "MANUAL_APPROVAL") {
      // Manual approval — skip, requires explicit exec action
      qualifies = false;
    }

    if (qualifies) {
      await db.activityCompletion.create({
        data: {
          memberId,
          sourceType: "event",
          sourceId: eventId,
          completionRuleId: event.completionRuleId ?? null,
        },
      });
      completed++;
    }
  }

  // Re-derive skills for everyone who just completed. Only members with a new
  // completion can change, so scope it to them.
  const completedMemberIds = [...new Set(event.attendance.map((a) => a.memberId))];
  let skillsChanged = 0;
  for (const memberId of completedMemberIds) {
    const { changed } = await deriveMemberSkills(memberId);
    skillsChanged += changed;
  }

  return { completed, skillsChanged };
}
