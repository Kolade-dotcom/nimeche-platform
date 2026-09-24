import { CheckIcon } from "lucide-react";

import { BrandLockup, BrandMark } from "@/components/brand-mark";

/**
 * The two-panel auth layout: the case for joining on the branch green, the
 * form on the right. On a phone the green panel becomes a short header rather
 * than a screen the member has to scroll past to reach the fields.
 *
 * The crest is knocked out to white on the green. It has a white inner field
 * and cannot sit bare on a coloured ground (design plan section 2.3).
 */
export function AuthShell({
  title,
  lede,
  points,
  children,
}: {
  title: string;
  lede: string;
  points?: string[];
  children: React.ReactNode;
}) {
  return (
    // min-h-dvh only from lg. Below that the two panels stack, and stretching
    // them to fill the viewport leaves the green one half empty above the
    // fields the member came here to type into.
    <div className="grid lg:min-h-dvh lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
      <section className="bg-band relative flex flex-col gap-4 overflow-hidden px-5 py-8 text-white sm:px-10 lg:gap-5 lg:py-13">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-16 hidden opacity-[0.13] lg:block"
        >
          <BrandMark size={300} knockout />
        </span>

        <div className="relative">
          <BrandLockup size={44} knockout />
        </div>

        <h1 className="font-heading relative mt-2 text-2xl font-bold lg:text-[32px]">
          {title}
        </h1>
        <p className="relative max-w-[46ch] text-base/relaxed text-white/90">{lede}</p>

        {points?.length ? (
          <ul className="relative mt-1 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckIcon className="mt-0.5 size-[18px] shrink-0" />
                <span className="text-[15px]/relaxed text-white/90">{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:py-13">
        <div className="flex w-full max-w-[440px] flex-col gap-6">{children}</div>
      </section>
    </div>
  );
}
