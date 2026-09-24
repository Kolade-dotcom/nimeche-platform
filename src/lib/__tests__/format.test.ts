import { describe, expect, it } from "vitest";

import { dueWording, firstName, greeting, initials, longDate } from "@/lib/format";

describe("initials", () => {
  it("takes the first and last word", () => {
    expect(initials("Akolade Salako")).toBe("AS");
    expect(initials("Jane Adaeze Doe")).toBe("JD");
  });

  it("gives one letter for one name, rather than doubling it", () => {
    expect(initials("Akolade")).toBe("A");
  });

  it("copes with stray whitespace and an empty string", () => {
    expect(initials("  Mary   Major ")).toBe("MM");
    expect(initials("")).toBe("?");
  });
});

describe("firstName", () => {
  it("is the word the greeting uses", () => {
    expect(firstName("Akolade Salako")).toBe("Akolade");
  });
});

describe("longDate", () => {
  it("does not depend on the runtime locale", () => {
    expect(longDate(new Date(2026, 8, 5))).toBe("5 September 2026");
  });
});

describe("greeting", () => {
  it("matches the hour", () => {
    expect(greeting(new Date(2026, 8, 5, 9))).toBe("Good morning");
    expect(greeting(new Date(2026, 8, 5, 13))).toBe("Good afternoon");
    expect(greeting(new Date(2026, 8, 5, 19))).toBe("Good evening");
  });
});

describe("dueWording", () => {
  const now = new Date(2026, 8, 24, 10); // Thursday

  it("names the day inside the week, not a date", () => {
    expect(dueWording(new Date(2026, 8, 25, 17), now)).toBe("due tomorrow");
    expect(dueWording(new Date(2026, 8, 28, 17), now)).toBe("due Monday");
  });

  it("says today for the rest of today, whatever the clock says", () => {
    expect(dueWording(new Date(2026, 8, 24, 1), now)).toBe("due today");
  });

  it("falls back to a date once the week is out", () => {
    expect(dueWording(new Date(2026, 9, 12, 17), now)).toBe("due 12 October 2026");
  });

  it("does not pretend something overdue is still due", () => {
    expect(dueWording(new Date(2026, 8, 20, 17), now)).toBe(
      "overdue since 20 September 2026"
    );
  });
});
