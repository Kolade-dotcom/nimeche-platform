"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaTile } from "@/components/media-tile";
import type { AlbumMediaItem } from "@/lib/gallery/queries";

export function PhotoGrid({ items }: { items: AlbumMediaItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const current = items[index];

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    setIndex((i) => (i + 1) % items.length);
  }

  // Keyboard navigation within the dialog
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ImageIcon
          className="text-muted-foreground mx-auto mb-4 size-10"
          aria-hidden
        />
        <p className="text-muted-foreground">No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo grid */}
      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        role="list"
        aria-label="Album photos"
      >
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Open photo: ${item.altText}`}
              className="block h-[140px] w-full cursor-pointer overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:h-[160px]"
            >
              <MediaTile caption={undefined} className="h-full w-full" />
            </button>
          </li>
        ))}
      </ul>

      {/* Lightbox */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[min(90vw,800px)] p-0"
          onKeyDown={handleKeyDown}
          aria-describedby="lightbox-caption"
        >
          <DialogTitle className="sr-only">
            Photo {index + 1} of {items.length}
          </DialogTitle>

          {/* Image area */}
          <div className="bg-black relative aspect-[4/3] overflow-hidden rounded-t-lg">
            <MediaTile caption={undefined} className="h-full w-full rounded-none" />
          </div>

          {/* Caption and navigation */}
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-strong)] transition-colors hover:bg-[var(--muted)]"
            >
              <ChevronLeftIcon className="size-5" aria-hidden />
            </button>

            <p
              id="lightbox-caption"
              className="text-muted-foreground min-w-0 flex-1 truncate text-sm"
            >
              {current?.altText ?? ""}
              <span className="ml-2 tabular-nums">
                ({index + 1} / {items.length})
              </span>
            </p>

            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-strong)] transition-colors hover:bg-[var(--muted)]"
            >
              <ChevronRightIcon className="size-5" aria-hidden />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
