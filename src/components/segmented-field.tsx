"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";

/**
 * Department and level, as a row of buttons rather than a dropdown.
 *
 * A native select on a phone opens a wheel the member has to scroll, confirm
 * and dismiss - three interactions for a five-way choice. These are one tap,
 * and every option is visible without opening anything. It is a radio group
 * underneath, so keyboard and screen reader behaviour is the real thing.
 */
export function SegmentedField({
  name,
  options,
  defaultValue,
  invalid,
  className,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  invalid?: boolean;
  className?: string;
}) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      defaultValue={defaultValue}
      aria-invalid={invalid || undefined}
      className={cn("flex flex-wrap gap-2.5", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className={cn(
            // basis-16 rather than something wider: five levels have to share one row
            // at 440px, and flex-1 hands back the slack when there are only two.
            "border-input bg-surface min-h-12 flex-1 basis-16 rounded-sm border px-2",
            "text-[15px] font-medium transition-colors",
            "hover:bg-muted",
            "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
            "data-[state=checked]:text-primary-foreground data-[state=checked]:font-semibold"
          )}
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
