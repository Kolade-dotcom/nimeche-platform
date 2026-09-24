"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * One password field, with a Show toggle.
 *
 * There is no confirm box and no strength meter. A confirm box asks the member
 * to type the same thing twice to catch a typo they cannot see; letting them
 * look at what they typed catches it directly, and works on a phone keyboard
 * where the mistake usually happens.
 */
export function PasswordField({
  id,
  name = "password",
  autoComplete = "current-password",
  invalid,
  className,
  ...props
}: React.ComponentProps<"input"> & { invalid?: boolean }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className={cn(
        "bg-surface flex h-12 w-full items-center gap-2 rounded-sm border pr-2 pl-4",
        invalid ? "border-destructive" : "border-input",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]",
        className
      )}
    >
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-none"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        // The toggle is a convenience, not a field. Keeping it out of the tab
        // order means Tab goes straight from the password to the submit button.
        tabIndex={-1}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1.5 text-[13px] font-semibold"
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
