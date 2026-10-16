import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The derivation rules, tested against a mocked database. The rules are the
 * product: what a member did decides what their skills page says, and nobody
 * can type over it.
 */
vi.mock("@/lib/db", () => ({
  db: {
    activityCompletion: { findMany: vi.fn() },
    activitySkill: { findMany: vi.fn() },
    event: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    deliverable: { findMany: vi.fn() },
    projectMember: { findMany: vi.fn() },
    memberSkill: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    activityEntry: { create: vi.fn() },
    skill: { findUnique: vi.fn() },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));

import { db } from "@/lib/db";
import { deriveMemberSkills } from "@/lib/skills/derivation";

const member = { id: "m1", fullName: "Akolade Salako" };
const skill = { id: "s1", slug: "cad-modelling", name: "CAD modelling" };

type Fixtures = {
  completions?: unknown[];
  mappings?: unknown[];
  events?: unknown[];
  projects?: unknown[];
  deliverables?: unknown[];
  projectMembers?: unknown[];
  existingSkill?: unknown;
};

function mockDb(fixtures: Fixtures = {}) {
  vi.mocked(db.activityCompletion.findMany).mockResolvedValue(
    (fixtures.completions ?? []) as never
  );
  vi.mocked(db.activitySkill.findMany).mockResolvedValue((fixtures.mappings ?? []) as never);
  vi.mocked(db.event.findMany).mockResolvedValue((fixtures.events ?? []) as never);
  vi.mocked(db.project.findMany).mockResolvedValue((fixtures.projects ?? []) as never);
  vi.mocked(db.deliverable.findMany).mockResolvedValue((fixtures.deliverables ?? []) as never);
  vi.mocked(db.projectMember.findMany).mockResolvedValue(
    (fixtures.projectMembers ?? []) as never
  );
  vi.mocked(db.memberSkill.findUnique).mockResolvedValue(
    (fixtures.existingSkill ?? null) as never
  );
  vi.mocked(db.memberSkill.create).mockResolvedValue({} as never);
  vi.mocked(db.memberSkill.update).mockResolvedValue({} as never);
  vi.mocked(db.activityEntry.create).mockResolvedValue({} as never);
  vi.mocked(db.skill.findUnique).mockResolvedValue(skill as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb();
});

describe("deriveMemberSkills", () => {
  it("records a skill as introduced after one completed activity", async () => {
    mockDb({
      completions: [{ sourceType: "event", sourceId: "e1", completedAt: new Date() }],
      mappings: [{ sourceType: "event", sourceId: "e1", skillId: skill.id }],
      events: [{ id: "e1", title: "Introduction to CAD, session 3" }],
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(1);
    expect(db.memberSkill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ memberId: member.id, skillId: skill.id, level: "INTRODUCED" }),
      })
    );
  });

  it("reaches practising after three completed activities", async () => {
    mockDb({
      completions: [
        { sourceType: "event", sourceId: "e1", completedAt: new Date() },
        { sourceType: "event", sourceId: "e2", completedAt: new Date() },
        { sourceType: "event", sourceId: "e3", completedAt: new Date() },
      ],
      mappings: [
        { sourceType: "event", sourceId: "e1", skillId: skill.id },
        { sourceType: "event", sourceId: "e2", skillId: skill.id },
        { sourceType: "event", sourceId: "e3", skillId: skill.id },
      ],
      events: [
        { id: "e1", title: "CAD session 1" },
        { id: "e2", title: "CAD session 2" },
        { id: "e3", title: "CAD session 3" },
      ],
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(1);
    expect(db.memberSkill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ level: "PRACTISING" }),
      })
    );
  });

  it("reaches practising after one activity with a submitted assessment", async () => {
    mockDb({
      completions: [
        { sourceType: "event", sourceId: "e1", completedAt: new Date() },
      ],
      mappings: [{ sourceType: "event", sourceId: "e1", skillId: skill.id }],
      events: [{ id: "e1", title: "CAD session 1" }],
      deliverables: [{ eventId: "e1" }],
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(1);
    expect(db.memberSkill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ level: "PRACTISING" }),
      })
    );
  });

  it("reaches competent through project participation", async () => {
    mockDb({
      completions: [
        { sourceType: "project", sourceId: "p1", completedAt: new Date() },
      ],
      mappings: [{ sourceType: "project", sourceId: "p1", skillId: skill.id }],
      projects: [{ id: "p1", title: "Solar dryer build" }],
      projectMembers: [{ projectId: "p1" }],
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(1);
    expect(db.memberSkill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ level: "COMPETENT" }),
      })
    );
  });

  it("never downgrades an existing higher level", async () => {
    mockDb({
      completions: [
        { sourceType: "event", sourceId: "e1", completedAt: new Date() },
      ],
      mappings: [{ sourceType: "event", sourceId: "e1", skillId: skill.id }],
      events: [{ id: "e1", title: "CAD session 1" }],
      existingSkill: { id: "ms1", level: "COMPETENT", evidence: [] },
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(0);
    expect(db.memberSkill.update).not.toHaveBeenCalled();
    expect(db.memberSkill.create).not.toHaveBeenCalled();
  });

  it("preserves an executive-verified skill untouched", async () => {
    mockDb({
      completions: [
        { sourceType: "event", sourceId: "e1", completedAt: new Date() },
        { sourceType: "event", sourceId: "e2", completedAt: new Date() },
        { sourceType: "event", sourceId: "e3", completedAt: new Date() },
      ],
      mappings: [
        { sourceType: "event", sourceId: "e1", skillId: skill.id },
        { sourceType: "event", sourceId: "e2", skillId: skill.id },
        { sourceType: "event", sourceId: "e3", skillId: skill.id },
      ],
      events: [
        { id: "e1", title: "a" },
        { id: "e2", title: "b" },
        { id: "e3", title: "c" },
      ],
      existingSkill: {
        id: "ms1",
        level: "VERIFIED",
        evidence: ["Attended the workshop safety briefing"],
        verifiedBy: "Engr. Richard Roe",
        verifiedAt: new Date(),
      },
    });

    const result = await deriveMemberSkills(member.id);

    // Three activities would say PRACTISING; a signature outranks arithmetic.
    expect(result.changed).toBe(0);
    expect(db.memberSkill.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ level: expect.any(String) }) })
    );
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("writes a skill-level-up activity entry when a level moves up", async () => {
    mockDb({
      completions: [
        { sourceType: "event", sourceId: "e1", completedAt: new Date() },
        { sourceType: "event", sourceId: "e2", completedAt: new Date() },
        { sourceType: "event", sourceId: "e3", completedAt: new Date() },
      ],
      mappings: [
        { sourceType: "event", sourceId: "e1", skillId: skill.id },
        { sourceType: "event", sourceId: "e2", skillId: skill.id },
        { sourceType: "event", sourceId: "e3", skillId: skill.id },
      ],
      events: [
        { id: "e1", title: "a" },
        { id: "e2", title: "b" },
        { id: "e3", title: "c" },
      ],
      existingSkill: { id: "ms1", level: "INTRODUCED", evidence: [] },
    });

    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(1);
    expect(db.activityEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          memberId: member.id,
          kind: "SKILL_LEVEL_UP",
          summary: expect.stringContaining("CAD modelling"),
        }),
      })
    );
  });

  it("does nothing for a member with no completed activities", async () => {
    const result = await deriveMemberSkills(member.id);

    expect(result.changed).toBe(0);
    expect(db.memberSkill.create).not.toHaveBeenCalled();
  });
});
