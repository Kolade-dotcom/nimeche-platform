"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { createAlbum, publishAlbum, deleteMediaItem } from "@/lib/gallery/upload";

export async function createAlbumAction(formData: FormData) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const eventId = (formData.get("eventId") as string) || undefined;

  if (!title || title.trim().length < 2) {
    throw new Error("Album title must be at least 2 characters.");
  }

  const album = await createAlbum(actor.id, { title, description, eventId });
  redirect(`/exco/gallery/${album.id}`);
}

export async function publishAlbumAction(albumId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await publishAlbum(actor.id, albumId);
  revalidatePath(`/exco/gallery/${albumId}`);
  revalidatePath("/exco/gallery");
}

export async function deleteMediaItemAction(itemId: string, albumId: string) {
  const { member: actor } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  await deleteMediaItem(actor.id, itemId);
  revalidatePath(`/exco/gallery/${albumId}`);
}
