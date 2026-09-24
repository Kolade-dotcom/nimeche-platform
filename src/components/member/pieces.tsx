import * as React from "react";

import { cn } from "@/lib/utils";

/** The h1 and one line under it that opens every member page. */
export function PageIntro({
  title,
  lede,
  action,
}: {
  title: string;
  lede?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h1>
        {lede ? <p className="text-muted-foreground max-w-[66ch]">{lede}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** A number and what it counts. Tabular figures so a row of them lines up. */
export function StatTile({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3.5">
      <div className="font-heading text-2xl leading-none font-bold tabular-nums">
        {value}
      </div>
      <div className="text-muted-foreground mt-1.5 text-[13px]">{label}</div>
    </div>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>;
}

const LEVELS = ["INTRODUCED", "PRACTISING", "COMPETENT", "VERIFIED"] as const;
export type Level = (typeof LEVELS)[number];

/** How far through the four levels a skill is, as four segments. */
export function LevelMeter({ level }: { level: Level }) {
  const filled = LEVELS.indexOf(level) + 1;
  return (
    <div
      className="flex gap-1.5"
      role="img"
      aria-label={`Level ${filled} of 4: ${levelLabel(level)}`}
    >
      {LEVELS.map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            index < filled ? "bg-primary" : "bg-surface-sunken"
          )}
        />
      ))}
    </div>
  );
}

export function levelLabel(level: Level): string {
  return level.charAt(0) + level.slice(1).toLowerCase();
}

/** A verification code, set in the mono face because people read it aloud. */
export function Code({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-surface-sunken rounded-sm px-2 py-1 font-mono text-[13px] font-semibold tracking-wider">
      {children}
    </span>
  );
}

/** A quiet inset note - the explanation a card needs but should not shout. */
export function Well({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-sunken text-muted-foreground rounded-md px-3.5 py-3 text-[13px]">
      {children}
    </div>
  );
}

/** A label above a value, for the read-only facts on the profile. */
export function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.09em] uppercase">
        {label}
      </span>
      <span className="font-semibold break-words">{value}</span>
    </div>
  );
}
