"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { FRESHER_CONTACT_SETTINGS_ID } from "@/lib/freshers/contacts";

const statusSchema = z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]);

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a reachable phone number.")
  .max(24, "Keep the phone number under 25 characters.")
  .regex(/^\+?[0-9][0-9\s().-]*$/, "Enter a valid phone number.");

const fresherContactsSchema = z.object({
  presidentPhone: phoneSchema,
  executiveSupportPhone: phoneSchema,
  staffAdviserPhone: z
    .string()
    .trim()
    .max(24, "Keep the phone number under 25 characters.")
    .refine((value) => !value || /^\+?[0-9][0-9\s().-]*$/.test(value), "Enter a valid phone number."),
});

export type FresherContactFormState = {
  message?: string;
  successMessage?: string;
  fieldErrors?: Record<string, string>;
};

function contactFieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !result[field]) result[field] = issue.message;
  }
  return result;
}

export async function saveFresherContactNumbers(
  _previous: FresherContactFormState,
  formData: FormData
): Promise<FresherContactFormState> {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  const parsed = fresherContactsSchema.safeParse({
    presidentPhone: formData.get("presidentPhone"),
    executiveSupportPhone: formData.get("executiveSupportPhone"),
    staffAdviserPhone: formData.get("staffAdviserPhone"),
  });
  if (!parsed.success) return { fieldErrors: contactFieldErrors(parsed.error) };

  await db.fresherContactSettings.upsert({
    where: { id: FRESHER_CONTACT_SETTINGS_ID },
    create: { id: FRESHER_CONTACT_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/exco/freshers");
  revalidatePath("/freshers/help");
  return { successMessage: "Fresher contact numbers saved." };
}

export async function updateFresherSubmissionStatus(formData: FormData) {
  await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  const id = formData.get("submissionId");
  const parsedStatus = statusSchema.safeParse(formData.get("status"));
  if (typeof id !== "string" || !id || !parsedStatus.success) return;

  await db.fresherSubmission.update({
    where: { id },
    data: { status: parsedStatus.data },
  });

  revalidatePath("/exco/freshers");
}
