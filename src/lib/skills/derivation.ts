import type { SkillLevel } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * The levels, in the order they are climbed. A member's level in a skill only
 * ever moves up this list — derivation never downgrades, and VERIFIED is
 * untouchable by anything except an executive's explicit sign-off.
 */
const LEVEL_ORDER: Record<SkillLevel, number> = {
  INTRODUCED: 0,
  PRACTISING: 1,
  COMPETENT: 2,
  VERIFIED: 3,
};

/**
 * Works out a member's level in every skill they have touched, from what they
 * have actually done, and writes the result. This is the function that makes
 * "0 actions to have a skill recorded" true: it runs when an event is marked
 * complete, and the member never fills in a skills form.
 *
 * Rules (design plan §8, dev plan §6.6):
 *   - 1+ completed activities mapped to a skill      → INTRODUCED
 *   - 3+ activities, or 1 with a passed assessment   → PRACTISING
 *   - a project role on a project tagged with it     → COMPETENT
 *   - executive sign-off (already in MemberSkill)    → VERIFIED (preserved)
 */
export async function deriveMemberSkills(memberId: string): Promise<{ changed: number }> {
  // Every completion this member has, mapped to the skills each activity
  // develops. sourceType is "event" or "project", matching ActivitySkill.
  const completions = await db.activityCompletion.findMany({
    where: { memberId },
    select: { sourceType: true, sourceId: true, completedAt: true },
  });

  // Activities that counted, per skill, plus the names the evidence lines cite.
  const counts = new Map<string, number>();
  const evidenceBySkill = new Map<string, string[]>();

  const eventIds = completions.filter((c) => c.sourceType === "event").map((c) => c.sourceId);
  const projectIds = completions
    .filter((c) => c.sourceType === "project")
    .map((c) => c.sourceId);

  const [mappings, events, projects] = await Promise.all([
    db.activitySkill.findMany({
      where: {
        OR: [
          ...(eventIds.length ? [{ sourceType: "event", sourceId: { in: eventIds } }] : []),
          ...(projectIds.length
            ? [{ sourceType: "project", sourceId: { in: projectIds } }]
            : []),
        ],
      },
      select: { sourceType: true, sourceId: true, skillId: true },
    }),
    eventIds.length
      ? db.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
    projectIds.length
      ? db.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, title: true },
        })
      : Promise.resolve([]),
  ]);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "an activity";
  const projectTitle = (id: string) =>
    projects.find((p) => p.id === id)?.title ?? "a project";

  for (const completion of completions) {
    const skillIds = mappings
      .filter(
        (m) => m.sourceType === completion.sourceType && m.sourceId === completion.sourceId
      )
      .map((m) => m.skillId);

    for (const skillId of skillIds) {
      counts.set(skillId, (counts.get(skillId) ?? 0) + 1);
      const line =
        completion.sourceType === "project"
          ? `Took part in ${projectTitle(completion.sourceId)}`
          : `Completed ${eventTitle(completion.sourceId)}`;
      const lines = evidenceBySkill.get(skillId) ?? [];
      if (!lines.includes(line)) lines.push(line);
      evidenceBySkill.set(skillId, lines);
    }
  }

  if (counts.size === 0) return { changed: 0 };

  // A submitted assessment against any counted event counts one activity as
  // "with assessment", which alone reaches PRACTISING.
  const assessmentEventIds = new Set(
    (
      await db.deliverable.findMany({
        where: { memberId, kind: "ASSESSMENT", submittedAt: { not: null } },
        select: { eventId: true },
      })
    ).map((d) => d.eventId)
  );
  const hasAssessmentSkillIds = new Set(
    mappings
      .filter((m) => m.sourceType === "event" && assessmentEventIds.has(m.sourceId))
      .map((m) => m.skillId)
  );

  // Project participation reaches COMPETENT, whatever the activity count says.
  // Only mappings on projects the member actually has a role in count.
  const projectMemberships = projectIds.length
    ? await db.projectMember.findMany({
        where: { memberId, projectId: { in: projectIds } },
        select: { projectId: true },
      })
    : [];
  const memberProjectIds = new Set(projectMemberships.map((pm) => pm.projectId));
  const projectSkillIds = new Set(
    mappings
      .filter(
        (m) => m.sourceType === "project" && memberProjectIds.has(m.sourceId)
      )
      .map((m) => m.skillId)
  );

  let changed = 0;

  for (const [skillId, count] of counts) {
    const derived: SkillLevel =
      projectSkillIds.has(skillId)
        ? "COMPETENT"
        : count >= 3 || hasAssessmentSkillIds.has(skillId)
          ? "PRACTISING"
          : "INTRODUCED";

    const existing = await db.memberSkill.findUnique({
      where: { memberId_skillId: { memberId, skillId } },
    });

    // VERIFIED is an executive's signature, not a computed value — keep it,
    // and keep its verifiedBy/verifiedAt, whatever the arithmetic says.
    if (existing?.level === "VERIFIED") {
      if (existing.evidence.length < (evidenceBySkill.get(skillId) ?? []).length) {
        await db.memberSkill.update({
          where: { id: existing.id },
          data: { evidence: evidenceBySkill.get(skillId) ?? existing.evidence },
        });
      }
      continue;
    }

    if (!existing) {
      await db.memberSkill.create({
        data: {
          memberId,
          skillId,
          level: derived,
          evidence: evidenceBySkill.get(skillId) ?? [],
        },
      });
      changed++;
      continue;
    }

    if (LEVEL_ORDER[derived] > LEVEL_ORDER[existing.level]) {
      const skill = await db.skill.findUnique({
        where: { id: skillId },
        select: { name: true },
      });
      await db.$transaction([
        db.memberSkill.update({
          where: { id: existing.id },
          data: { level: derived, evidence: evidenceBySkill.get(skillId) ?? [] },
        }),
        db.activityEntry.create({
          data: {
            memberId,
            kind: "SKILL_LEVEL_UP",
            summary: `${skill?.name ?? "A skill"} moved from ${existing.level.toLowerCase()} to ${derived.toLowerCase()}`,
          },
        }),
      ]);
      changed++;
    }
  }

  return { changed };
}
