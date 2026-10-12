import { db } from "@/lib/db";
import { logAudit } from "@/lib/auth/audit";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await db.album.findUnique({ where: { slug: base } });
  if (!existing) return base;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createAlbum(
  actorId: string,
  data: { title: string; description?: string; eventId?: string }
): Promise<{ id: string; slug: string }> {
  const slug = await uniqueSlug(slugify(data.title));
  const album = await db.album.create({
    data: {
      slug,
      title: data.title,
      description: data.description || null,
      eventId: data.eventId || null,
      createdById: actorId,
    },
    select: { id: true, slug: true },
  });
  return album;
}

export async function addMediaItem(
  actorId: string,
  albumId: string,
  blobUrl: string,
  altText: string,
  width?: number,
  height?: number
): Promise<{ id: string }> {
  const item = await db.mediaItem.create({
    data: {
      albumId,
      url: blobUrl,
      altText,
      width: width ?? null,
      height: height ?? null,
      uploadedById: actorId,
    },
    select: { id: true },
  });
  return item;
}

export async function publishAlbum(actorId: string, albumId: string): Promise<void> {
  await db.album.update({
    where: { id: albumId },
    data: { publishedAt: new Date() },
  });

  await logAudit({
    actorId,
    action: "SETTINGS_UPDATED",
    entityType: "Album",
    entityId: albumId,
    diff: { published: true },
  });
}

export async function deleteMediaItem(
  _actorId: string,
  itemId: string
): Promise<void> {
  await db.mediaItem.delete({ where: { id: itemId } });
}
