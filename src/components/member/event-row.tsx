import * as React from "react";

import { DateBox } from "@/components/date-box";
import { dateParts } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * One event, fronted by its date. The same row on the dashboard, the events
 * page and anywhere else an event is listed, so the date block never drifts.
 */
export function EventRow({
  startsAt,
  title,
  meta,
  muted,
  trailing,
  className,
}: {
  startsAt: Date;
  title: string;
  meta?: React.ReactNode;
  muted?: boolean;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const { day, month } = dateParts(startsAt);

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-3", className)}>
      <DateBox day={day} month={month} muted={muted} />
      <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1">
        <strong className="text-[15px] leading-snug font-semibold">{title}</strong>
        {meta ? <span className="text-muted-foreground text-[13px]">{meta}</span> : null}
      </div>
      {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
    </div>
  );
}
