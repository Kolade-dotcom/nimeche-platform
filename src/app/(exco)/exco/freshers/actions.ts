"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";

const statusSchema = z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]);

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
