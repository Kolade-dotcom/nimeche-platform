"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireMember } from "@/lib/member/session";

export async function togglePublicProfileAction() {
  const member = await requireMember();
  const enabling = !member.publicProfile;
  if (enabling && member.status !== "ACTIVE") {
    throw new Error("Public profiles are available after membership approval.");
  }
  const slug = member.publicSlug ?? `${slugify(member.fullName)}-${member.id.toLowerCase()}`;

  await db.member.update({
    where: { id: member.id },
    data: { publicProfile: enabling, publicSlug: slug },
  });

  revalidatePath("/me/profile");
  revalidatePath(`/u/${slug}`);
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "member";
}
