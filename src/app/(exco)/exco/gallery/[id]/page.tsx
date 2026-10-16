import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUpload } from "@/components/admin/photo-upload";
import { db } from "@/lib/db";
import { publishAlbumAction, deleteMediaItemAction } from "@/app/(exco)/exco/gallery/actions";

export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const album = await db.album.findUnique({
    where: { id },
    select: {
      id: true,
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

  if (!album) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{album.title}</h1>
          {album.event && (
            <p className="text-muted-foreground mt-1 text-sm">
              Event: {album.event.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={album.publishedAt ? "primary" : "default"}>
            {album.publishedAt ? "Published" : "Draft"}
          </Badge>
          {!album.publishedAt && (
            <form
              action={async () => {
                "use server";
                await publishAlbumAction(id);
              }}
            >
              <Button type="submit" size="sm">
                Publish album
              </Button>
            </form>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/exco/gallery">← Back</Link>
          </Button>
        </div>
      </div>

      {album.description && (
        <p className="text-muted-foreground text-sm">{album.description}</p>
      )}

      {/* Photo grid */}
      {album.items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {album.items.length} photo{album.items.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {album.items.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={item.thumbnailUrl ?? item.url}
                      alt={item.altText}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  </div>
                  <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                    {item.altText}
                  </p>
                  <form
                    action={async () => {
                      "use server";
                      await deleteMediaItemAction(item.id, id);
                    }}
                    className="mt-1"
                  >
                    <button
                      type="submit"
                      className="text-danger text-xs underline-offset-2 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
          No photos yet. Upload some below.
        </div>
      )}

      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUpload albumId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
