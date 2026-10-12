import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminAlbumList } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const albums = await getAdminAlbumList();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {albums.length} album{albums.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/gallery/new">New album</Link>
        </Button>
      </div>

      {albums.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm">
          No albums yet.{" "}
          <Link href="/admin/gallery/new" className="text-primary-text underline">
            Create the first one.
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <li key={album.id}>
              <Card className="overflow-hidden py-0">
                {/* Cover image */}
                <div className="bg-muted relative aspect-video w-full overflow-hidden">
                  {album.firstItemUrl ? (
                    <Image
                      src={album.firstItemUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-muted-foreground text-sm">No photos</span>
                    </div>
                  )}
                </div>

                <CardContent className="space-y-2 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight">{album.title}</p>
                    <Badge variant={album.publishedAt ? "primary" : "default"}>
                      {album.publishedAt ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {album.eventTitle && (
                    <p className="text-muted-foreground text-xs">
                      Event: {album.eventTitle}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {album.itemCount} photo{album.itemCount !== 1 ? "s" : ""}
                  </p>
                  <Link
                    href={`/admin/gallery/${album.id}`}
                    className="text-primary-text text-sm font-medium underline-offset-4 hover:underline"
                  >
                    Manage
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
