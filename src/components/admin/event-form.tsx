"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventSchema, type EventValues } from "@/lib/validation/event";
import { cn } from "@/lib/utils";

const KIND_OPTIONS = [
  { value: "PLANT_VISIT", label: "Plant visit" },
  { value: "TRAINING", label: "Training" },
  { value: "LECTURE", label: "Lecture" },
  { value: "CAREERS", label: "Careers" },
  { value: "COMPETITION", label: "Competition" },
  { value: "MEETING", label: "Meeting" },
];

const MODE_OPTIONS = [
  { value: "IN_PERSON", label: "In Person" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
];

export function EventForm({
  defaultValues,
  action,
  submitLabel = "Save event",
}: {
  defaultValues?: Partial<EventValues>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    // The schema coerces capacity/contactHours and defaults contactHours, so
    // the form's input type differs from the parsed output type. The three
    // generics keep both honest: fields are typed as z.input, handleSubmit
    // receives z.output.
  } = useForm<z.input<typeof eventSchema>, unknown, EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      contactHours: 0,
      ...defaultValues,
    },
  });

  const selectedKind = useWatch({ control, name: "kind" });
  const selectedMode = useWatch({ control, name: "mode" });

  return (
    <form
      action={action}
      onSubmit={handleSubmit(async (_values, e) => {
        if (e) {
          const form = e.target as HTMLFormElement;
          const fd = new FormData(form);
          await action(fd);
        }
      })}
      className="space-y-6"
    >
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="e.g. Plant visit to Dangote Refinery" />
        {errors.title && (
          <p className="text-danger text-sm">{errors.title.message}</p>
        )}
      </div>

      {/* Kind */}
      <div className="space-y-1.5">
        <Label>Kind</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {KIND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("kind", opt.value as EventValues["kind"])}
              className={cn(
                "min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                selectedKind === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {/* Hidden input for form submission */}
        <input type="hidden" {...register("kind")} />
        {errors.kind && (
          <p className="text-danger text-sm">{errors.kind.message}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
          {errors.startsAt && (
            <p className="text-danger text-sm">{errors.startsAt.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endsAt">Ends at (optional)</Label>
          <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
        </div>
      </div>

      {/* Mode */}
      <div className="space-y-1.5">
        <Label>Mode</Label>
        <div className="flex gap-2">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("mode", opt.value as EventValues["mode"])}
              className={cn(
                "min-h-[44px] flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                selectedMode === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("mode")} />
        {errors.mode && (
          <p className="text-danger text-sm">{errors.mode.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location">
          {selectedMode === "ONLINE" ? "Meeting URL" : "Location"}
          <span className="text-muted-foreground font-normal"> (optional)</span>
        </Label>
        <Input
          id="location"
          {...register("location")}
          placeholder={selectedMode === "ONLINE" ? "https://meet.google.com/…" : "Room / gate"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Host */}
        <div className="space-y-1.5">
          <Label htmlFor="host">
            Host name
            <span className="text-muted-foreground font-normal"> (optional)</span>
          </Label>
          <Input id="host" {...register("host")} placeholder="Engr. John Doe" />
        </div>

        {/* Capacity */}
        <div className="space-y-1.5">
          <Label htmlFor="capacity">
            Capacity
            <span className="text-muted-foreground font-normal"> (optional)</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            {...register("capacity")}
            placeholder="Leave blank for unlimited"
          />
        </div>
      </div>

      {/* Contact hours */}
      <div className="space-y-1.5">
        <Label htmlFor="contactHours">Contact hours</Label>
        <Input
          id="contactHours"
          type="number"
          min={0}
          {...register("contactHours")}
          placeholder="0"
        />
        {errors.contactHours && (
          <p className="text-danger text-sm">{errors.contactHours.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">
          Notes
          <span className="text-muted-foreground font-normal"> (optional)</span>
        </Label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          placeholder="What to bring, what to wear, etc."
          className="border-input bg-surface w-full rounded-sm border px-4 py-3 text-sm"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
