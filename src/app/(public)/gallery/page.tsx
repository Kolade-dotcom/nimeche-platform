import Link from "next/link";
import { format } from "date-fns";
import { ImageIcon } from "lucide-react";

import { MediaTile } from "@/components/media-tile";
import { Badge } from "@/components/ui/badge";
import { getPublishedAlbums, getRecentMediaItems } from "@/lib/gallery/queries";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery — NiMechE-SF, Tech-U",
  description:
    "Photographs and video from events, projects and competitions run by the NiMechE Student Forum at Abiola Ajimobi Technical University (AATU), also known as Tech-U.",
};

export default async function GalleryPage() {
  const [albums, recentItems] = await Promise.all([
    getPublishedAlbums(),
    getRecentMediaItems(5),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-7">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-[28px] font-bold sm:text-[38px]">Gallery</h1>
        <p className="text-muted-foreground text-[17px]">
          Photographs and video from every event, project and competition.
        </p>
      </div>

      {/* Featured mosaic (5 most recent photos) */}
      {recentItems.length > 0 && (
        <section aria-labelledby="recent-heading" className="mb-12">
          <h2 id="recent-heading" className="sr-only">
            Recent photos
          </h2>
          <div className="grid auto-rows-[130px] grid-cols-2 gap-3.5 sm:auto-rows-[150px] lg:auto-rows-[190px] lg:grid-cols-4">
            {recentItems.map((item, i) => (
              <div
                key={item.id}
                className={i === 0 ? "col-span-2 row-span-1 h-full lg:row-span-2" : "h-full"}
              >
                <MediaTile caption={item.altText} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Albums grid */}
      {albums.length === 0 ? (
        <div className="py-16 text-center">
          <ImageIcon
            className="text-muted-foreground mx-auto mb-4 size-10"
            aria-hidden
          />
          <p className="text-muted-foreground">
            No albums yet — photos will appear here after events.
          </p>
        </div>
      ) : (
        <section aria-labelledby="albums-heading">
          <h2
            id="albums-heading"
            className="font-heading mb-6 text-[22px] font-bold sm:text-[28px]"
          >
            Albums
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <li key={album.id}>
                <Link
                  href={`/gallery/${album.slug}`}
                  className="group border-border bg-surface shadow-e1 hover:shadow-e2 hover:-translate-y-0.5 flex flex-col overflow-hidden rounded-xl border transition-[box-shadow,transform] duration-200 ease-[var(--ease)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {/* Cover */}
                  <div className="h-[160px]">
                    <MediaTile className="h-full w-full rounded-none" />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-bold leading-snug group-hover:underline">
                        {album.title}
                      </h3>
                      <Badge variant="default" className="shrink-0">
                        {album._count.items} photo{album._count.items === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    {album.eventTitle && (
                      <p className="text-muted-foreground text-sm">{album.eventTitle}</p>
                    )}

                    <p className="text-muted-foreground text-xs">
                      {format(album.publishedAt, "d MMM yyyy")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
