import { describe, expect, it } from "vitest";

import { joinSchema, signInSchema } from "@/lib/validation/auth";

describe("the Tech-U email rule", () => {
  it("accepts a Tech-U address", () => {
    const result = signInSchema.safeParse({
      email: "jane.doe@tech-u.edu.ng",
      password: "correct horse",
      remember: true,
    });
    expect(result.success).toBe(true);
  });

  it("lowercases and trims, so a capitalised address still signs in", () => {
    const result = signInSchema.safeParse({
      email: "  Jane.Doe@Tech-U.edu.ng  ",
      password: "correct horse",
      remember: true,
    });
    expect(result.success && result.data.email).toBe("jane.doe@tech-u.edu.ng");
  });

  it("rejects a personal address, and says which one to use", () => {
    const result = signInSchema.safeParse({
      email: "jane.doe@gmail.com",
      password: "correct horse",
      remember: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("tech-u.edu.ng");
    }
  });

  it("rejects a lookalike domain", () => {
    const result = signInSchema.safeParse({
      email: "jane.doe@nottech-u.edu.ng.example.com",
      password: "correct horse",
      remember: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("joining", () => {
  const valid = {
    fullName: "Jane Doe",
    email: "jane.doe@tech-u.edu.ng",
    password: "eight888",
    department: "MECHANICAL",
    level: "400",
  };

  it("accepts the five fields", () => {
    expect(joinSchema.safeParse(valid).success).toBe(true);
  });

  it("refuses a password under eight characters", () => {
    expect(joinSchema.safeParse({ ...valid, password: "seven77" }).success).toBe(false);
  });

  it("refuses a department that is not one of the two", () => {
    expect(joinSchema.safeParse({ ...valid, department: "CIVIL" }).success).toBe(false);
  });

  it("refuses a level outside 100 to 500", () => {
    expect(joinSchema.safeParse({ ...valid, level: "600" }).success).toBe(false);
  });
});
