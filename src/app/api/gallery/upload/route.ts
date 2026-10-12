import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { requireRole } from "@/lib/auth/roles";
import { addMediaItem } from "@/lib/gallery/upload";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Photo upload for gallery albums. EXECUTIVE or ADMIN only.
 *
 * Storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production), and
 * public/uploads on disk otherwise (local development). Both return a URL the
 * album grid can render, so nothing downstream knows which one ran.
 */
export async function POST(request: Request) {
  const { member } = await requireRole(["EXECUTIVE", "ADMIN"]);

  const formData = await request.formData();
  const file = formData.get("file");
  const albumId = formData.get("albumId");
  const altText = formData.get("altText");

  if (typeof albumId !== "string" || !albumId) {
    return NextResponse.json({ error: "Missing album." }, { status: 400 });
  }
  if (typeof altText !== "string" || !altText.trim()) {
    return NextResponse.json(
      { error: "Every photo needs alt text saying what it shows." },
      { status: 400 }
    );
  }
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  const extension = EXTENSION_BY_TYPE[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPEG, PNG and WebP photos can be uploaded." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "That photo is over 10 MB. Resize it and try again." },
      { status: 400 }
    );
  }

  const filename = `${crypto.randomUUID()}.${extension}`;

  let url: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`gallery/${filename}`, file, {
      access: "public",
      contentType: file.type,
    });
    url = blob.url;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer())
    );
    url = `/uploads/${filename}`;
  }

  const item = await addMediaItem(member.id, albumId, url, altText.trim());
  return NextResponse.json({ url, itemId: item.id });
}
