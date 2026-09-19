import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps the last conflicting Tailwind utility", () => {
    expect(cn("px-2", "px-5")).toBe("px-5");
  });

  it("drops falsy values", () => {
    expect(cn("bg-primary", false && "hidden", undefined)).toBe("bg-primary");
  });
});
