import { ImageIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A slot where a photograph goes.
 *
 * Until the media subsystem exists there is nothing to put in one, so it
 * renders as a sunken panel with a hairline and a thin glyph rather than an
 * empty box. It reads as "a photograph belongs here", which is the honest
 * thing for it to say.
 */
export function MediaTile({
  tag,
  caption,
  duration,
  className,
}: {
  tag?: string;
  caption?: string;
  duration?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface-sunken relative flex size-full items-center justify-center overflow-hidden rounded-lg",
        "shadow-[inset_0_0_0_1px_var(--border)]",
        className
      )}
    >
      <ImageIcon
        className="text-border-strong/90 size-9"
        strokeWidth={1.35}
        aria-hidden
      />

      {tag ? (
        <span className="absolute top-3 left-3 z-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white uppercase">
          {tag}
        </span>
      ) : null}

      {duration ? (
        <>
          <span className="absolute inset-0 z-2 m-auto flex size-11 items-center justify-center rounded-full bg-black/60 text-white">
            <PlayIcon className="size-4 fill-current" />
          </span>
          <span className="absolute right-2.5 bottom-2.5 z-2 rounded-[5px] bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {duration}
          </span>
        </>
      ) : null}

      {caption ? (
        <span className="absolute inset-x-0 bottom-0 z-2 bg-gradient-to-t from-black/70 to-transparent px-3.5 pt-8 pb-3 text-[13px] font-medium text-white">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
