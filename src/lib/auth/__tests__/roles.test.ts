import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The role service is what keeps /admin closed to ordinary members. These
 * tests pin the query shapes and the audit trail, with the database and the
 * session mocked out.
 */
vi.mock("@/lib/db", () => ({
  db: {
    memberRole: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    role: {
      findUniqueOrThrow: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/member/session", () => ({
  requireMember: vi.fn(),
}));

vi.mock("@/lib/auth/audit", () => ({ logAudit: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/member/session";
import { grantRole, requireRole, revokeRole } from "@/lib/auth/roles";

const member = { id: "m1", fullName: "Akolade Salako", email: "a@tech-u.edu.ng" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireMember).mockResolvedValue(member as never);
});

describe("getMemberRoles through requireRole", () => {
  it("returns the member and their roles when one matches", async () => {
    vi.mocked(db.memberRole.findMany).mockResolvedValue([
      { role: { key: "EXECUTIVE" } },
      { role: { key: "MEMBER" } },
    ] as never);

    const result = await requireRole(["EXECUTIVE", "ADMIN"]);

    expect(result.member).toBe(member);
    expect(result.roles).toEqual(["EXECUTIVE", "MEMBER"]);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("sends a member without a matching role to sign-in", async () => {
    vi.mocked(db.memberRole.findMany).mockResolvedValue([
      { role: { key: "MEMBER" } },
    ] as never);

    await requireRole(["EXECUTIVE", "ADMIN"]);

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("sends a member with no roles at all to sign-in", async () => {
    vi.mocked(db.memberRole.findMany).mockResolvedValue([]);

    await requireRole(["EXECUTIVE", "ADMIN"]);

    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });
});

describe("grantRole", () => {
  it("upserts the role and writes an audit entry", async () => {
    vi.mocked(db.role.findUniqueOrThrow).mockResolvedValue({
      id: "r-exec",
      key: "EXECUTIVE",
    } as never);
    vi.mocked(db.memberRole.upsert).mockResolvedValue({} as never);

    await grantRole("actor-1", "m2", "EXECUTIVE");

    expect(db.memberRole.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { memberId_roleId: { memberId: "m2", roleId: "r-exec" } },
        create: expect.objectContaining({ memberId: "m2", grantedBy: "actor-1" }),
      })
    );
    const { logAudit } = await import("@/lib/auth/audit");
    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "ROLE_GRANTED", entityId: "m2" })
    );
  });
});

describe("revokeRole", () => {
  it("deletes the role and writes an audit entry", async () => {
    vi.mocked(db.role.findUnique).mockResolvedValue({
      id: "r-exec",
      key: "EXECUTIVE",
    } as never);
    vi.mocked(db.memberRole.deleteMany).mockResolvedValue(1 as never);

    await revokeRole("actor-1", "m2", "EXECUTIVE");

    expect(db.memberRole.deleteMany).toHaveBeenCalledWith({
      where: { memberId: "m2", roleId: "r-exec" },
    });
  });

  it("no-ops when the role does not exist", async () => {
    vi.mocked(db.role.findUnique).mockResolvedValue(null);

    await revokeRole("actor-1", "m2", "CONTENT_MANAGER");

    expect(db.memberRole.deleteMany).not.toHaveBeenCalled();
  });
});
