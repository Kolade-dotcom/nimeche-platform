import { cache } from "react";

import { db } from "@/lib/db";

export type PublicAlbum = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  publishedAt: Date;
  eventId: string | null;
  eventTitle: string | null;
  _count: { items: number };
  firstItemUrl: string | null;
};

export type AlbumDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  publishedAt: Date;
  eventId: string | null;
  eventTitle: string | null;
  items: AlbumMediaItem[];
};

export type AlbumMediaItem = {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string;
  kind: string;
  width: number | null;
  height: number | null;
};

/** All published albums, newest first. */
export const getPublishedAlbums = cache(async function getPublishedAlbums(): Promise<
  PublicAlbum[]
> {
  const rows = await db.album.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      publishedAt: true,
      eventId: true,
      event: { select: { title: true } },
      _count: { select: { items: true } },
      items: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverUrl: row.coverUrl,
    publishedAt: row.publishedAt!,
    eventId: row.eventId,
    eventTitle: row.event?.title ?? null,
    _count: row._count,
    firstItemUrl: row.items[0]?.url ?? null,
  }));
});

/** A single album with all its media items. */
export const getAlbumBySlug = cache(async function getAlbumBySlug(
  slug: string
): Promise<AlbumDetail | null> {
  const row = await db.album.findFirst({
    where: { slug, publishedAt: { not: null } },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      publishedAt: true,
      eventId: true,
      event: { select: { title: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          altText: true,
          kind: true,
          width: true,
          height: true,
        },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    publishedAt: row.publishedAt!,
    eventId: row.eventId,
    eventTitle: row.event?.title ?? null,
    items: row.items,
  };
});

/** Most recent media items across all published albums (for homepage mosaic). */
export const getRecentMediaItems = cache(async function getRecentMediaItems(
  take: number
): Promise<AlbumMediaItem[]> {
  return db.mediaItem.findMany({
    where: { album: { publishedAt: { not: null } } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      url: true,
      thumbnailUrl: true,
      altText: true,
      kind: true,
      width: true,
      height: true,
    },
  });
});
