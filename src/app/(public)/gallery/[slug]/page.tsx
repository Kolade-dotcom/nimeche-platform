import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";

import { getAlbumBySlug } from "@/lib/gallery/queries";
import { PhotoGrid } from "./photo-grid";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return { title: "Album not found" };
  return {
    title: `${album.title} — NiMechE-SF Gallery`,
    description: album.description ?? undefined,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-7">
      {/* Back link */}
      <Link
        href="/gallery"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        All albums
      </Link>

      {/* Album header */}
      <header className="mb-8">
        <h1 className="font-heading mb-2 text-[26px] font-bold sm:text-[34px]">
          {album.title}
        </h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {album.eventTitle && (
            <span>
              Event:{" "}
              {album.eventId ? (
                <Link
                  href={`/events`}
                  className="text-primary-text underline"
                >
                  {album.eventTitle}
                </Link>
              ) : (
                album.eventTitle
              )}
            </span>
          )}
          <span>
            {album.items.length} photo{album.items.length === 1 ? "" : "s"}
          </span>
          <span>{format(album.publishedAt, "d MMMM yyyy")}</span>
        </div>
        {album.description && (
          <p className="text-muted-foreground mt-3 max-w-[60ch] text-[15px]/relaxed">
            {album.description}
          </p>
        )}
      </header>

      {/* Photo grid with lightbox */}
      <PhotoGrid items={album.items} />
    </div>
  );
}
