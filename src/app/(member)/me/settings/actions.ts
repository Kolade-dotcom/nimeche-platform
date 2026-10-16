"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/member/session";

export type SettingsState = { error?: string; success?: string };

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
  confirmPassword: z.string(),
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ["confirmPassword"],
});

export async function changePasswordAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: "Use a password of 8–72 characters and make sure both new password fields match." };

  const member = await requireMember();
  if (!(await verifyPassword(parsed.data.currentPassword, member.passwordHash))) {
    return { error: "Your current password is not correct." };
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return { error: "Choose a new password that is different from your current one." };
  }

  await db.$transaction([
    db.member.update({ where: { id: member.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } }),
    db.authToken.updateMany({ where: { memberId: member.id, purpose: "PASSWORD_RESET", usedAt: null }, data: { usedAt: new Date() } }),
  ]);
  revalidatePath("/me/settings");
  return { success: "Your password has been changed." };
}
