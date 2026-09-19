import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The NiMechE crest. Never below 40px - the annulus lettering stops resolving
 * and it reads as an orange smudge (design plan section 2.3). Use `knockout`
 * on the green panels and anywhere dark: the crest has a white inner field and
 * cannot sit bare on a coloured ground.
 */
export function BrandMark({
  size = 44,
  knockout = false,
  className,
}: {
  size?: number;
  knockout?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/nimeche-logo.svg"
      alt="NiMechE-SF, Tech-U"
      width={size}
      height={Math.round((size * 397) / 457)}
      priority
      className={cn(knockout && "brightness-0 invert", className)}
    />
  );
}

export function BrandLockup({
  size = 44,
  knockout = false,
  className,
}: {
  size?: number;
  knockout?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark size={size} knockout={knockout} />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-base font-bold">NiMechE-SF</span>
        <span className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] opacity-80">
          TECH-U
        </span>
      </span>
    </span>
  );
}
