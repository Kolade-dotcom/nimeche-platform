"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { FRESHER_COOKIE, getCurrentFresher, hashFresherToken } from "@/lib/freshers/session";
import { fresherSignupSchema, fresherSubmissionSchema } from "@/lib/validation/freshers";

export type FresherFormState = {
  message?: string;
  successMessage?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !result[field]) result[field] = issue.message;
  }
  return result;
}

export async function fresherSignupAction(
  _previous: FresherFormState,
  formData: FormData
): Promise<FresherFormState> {
  // Quiet honeypot for basic bot traffic. It is intentionally not rendered visibly.
  if (String(formData.get("website") ?? "").trim()) {
    return { message: "We could not complete that signup. Please try again." };
  }

  const parsed = fresherSignupSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    department: formData.get("department"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.fresherIntake.create({
    data: {
      ...parsed.data,
      accessTokenHash: hashFresherToken(token),
      accessExpiresAt: expiresAt,
    },
  });

  (await cookies()).set(FRESHER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/freshers",
    expires: expiresAt,
  });

  redirect("/freshers/help");
}

export async function submitFresherIssueAction(
  _previous: FresherFormState,
  formData: FormData
): Promise<FresherFormState> {
  const fresher = await getCurrentFresher();
  if (!fresher) return { message: "Your fresher session has expired. Please sign up again." };

  const parsed = fresherSubmissionSchema.safeParse({
    type: formData.get("type"),
    area: formData.get("area"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await db.fresherSubmission.create({
    data: { ...parsed.data, fresherId: fresher.id },
  });

  return {
    successMessage: "Your message is with the executive team. They can now follow up with you.",
  };
}
