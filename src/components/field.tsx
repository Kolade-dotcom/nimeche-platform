import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Label, control, hint and error as one unit, wired together for screen
 * readers: the error is announced, and aria-describedby points at whichever
 * of hint or error is actually showing.
 */
export function Field({
  id,
  label,
  hint,
  error,
  action,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {action ? (
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor={id}>{label}</Label>
          {action}
        </div>
      ) : (
        <Label htmlFor={id}>{label}</Label>
      )}

      <FieldDescribedBy id={describedBy}>{children}</FieldDescribedBy>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive text-[13px] font-medium"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-[13px]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Threads aria-describedby onto the control without every caller repeating it. */
function FieldDescribedBy({ id, children }: { id?: string; children: React.ReactNode }) {
  if (!id || !React.isValidElement(children)) return <>{children}</>;
  return React.cloneElement(
    children as React.ReactElement<{ "aria-describedby"?: string }>,
    {
      "aria-describedby": id,
    }
  );
}
