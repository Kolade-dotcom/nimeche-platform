import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Initials in a circle. No photo uploads yet, and none promised. */
export function MemberAvatar({
  fullName,
  title,
  size = 38,
  className,
}: {
  fullName: string;
  title?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <span
      title={title ? `${fullName} — ${title}` : fullName}
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        "bg-primary-subtle text-primary-text font-heading inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        className
      )}
    >
      {initials(fullName)}
    </span>
  );
}
