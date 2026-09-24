import { cn } from "@/lib/utils";

/** The day-and-month block that fronts every event, everywhere it appears. */
export function DateBox({
  day,
  month,
  muted,
  className,
}: {
  day: string;
  month: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-13 shrink-0 rounded-md py-2 text-center",
        muted
          ? "bg-surface-sunken text-foreground"
          : "bg-primary text-primary-foreground",
        className
      )}
    >
      <div className="font-heading text-lg leading-none font-bold">{day}</div>
      <div className="mt-0.5 text-[10px] font-semibold tracking-[0.08em]">{month}</div>
    </div>
  );
}
