import bcrypt from "bcryptjs";

/**
 * bcrypt, cost 12. Deliberately slow: the whole point is that guessing is
 * expensive. bcryptjs rather than a native binding so there is nothing to
 * compile on a volunteer's laptop or in a serverless build.
 */
const COST = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Burns roughly the same time as a real comparison when the address has no
 * account. Without it, "no such member" answers faster than "wrong password",
 * and the difference is measurable - which turns sign-in into a way of asking
 * whether a given student is a member.
 */
export async function wastePasswordTime(): Promise<void> {
  await bcrypt.compare(
    "not-a-real-password",
    "$2a$12$CwTycUXWue0Thq9StjUM0uJ8DiXsGRbyDbLm9Cp3vI/1Ot3sQKkU."
  );
}
