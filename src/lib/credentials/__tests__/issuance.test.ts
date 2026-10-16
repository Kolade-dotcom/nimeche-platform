import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The verification code is what an employer reads off a printout over the
 * phone — its format and alphabet are a product decision, not a detail.
 */
vi.mock("@/lib/db", () => ({
  db: {
    credential: { findUnique: vi.fn() },
    event: { findUnique: vi.fn() },
    activityCompletion: { findMany: vi.fn() },
    credentialEvent: { create: vi.fn() },
    activityEntry: { create: vi.fn() },
  },
}));

vi.mock("@/lib/auth/audit", () => ({ logAudit: vi.fn() }));
vi.mock("@/lib/email", () => ({
  sendCertificateIssuedEmail: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/lib/db";
import { generateVerificationCode } from "@/lib/credentials/issuance";

// NM-XXXX-XXXX, X from an alphabet with no 0/O/1/I.
const CODE_PATTERN = /^NM-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(db.credential.findUnique).mockResolvedValue(null);
});

describe("generateVerificationCode", () => {
  it("produces an NM-XXXX-XXXX code from the unambiguous alphabet", async () => {
    const code = await generateVerificationCode();

    expect(code).toMatch(CODE_PATTERN);
    // None of the characters an employer mishears.
    expect(code).not.toMatch(/[0O1I]/);
  });

  it("throws after five collisions rather than issuing a duplicate", async () => {
    vi.mocked(db.credential.findUnique).mockResolvedValue({ id: "existing" } as never);

    await expect(generateVerificationCode()).rejects.toThrow(/unique verification code/);
    // Six lookups: five attempts plus the final check that never happens —
    // actually five attempts, each checking the database once.
    expect(db.credential.findUnique).toHaveBeenCalledTimes(5);
  });

  it("retries past a collision and returns a fresh code", async () => {
    const existing = { id: "existing" } as never;
    vi.mocked(db.credential.findUnique)
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(null);

    const code = await generateVerificationCode();

    expect(code).toMatch(CODE_PATTERN);
    expect(db.credential.findUnique).toHaveBeenCalledTimes(2);
  });
});
