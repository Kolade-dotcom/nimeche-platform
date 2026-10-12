import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(200),
  kind: z.enum(
    ["PLANT_VISIT", "TRAINING", "LECTURE", "CAREERS", "COMPETITION", "MEETING"],
    { error: "Choose an event kind." }
  ),
  startsAt: z.string().min(1, "Enter a start date and time."),
  endsAt: z.string().optional(),
  mode: z.enum(["IN_PERSON", "ONLINE", "HYBRID"], {
    error: "Choose an event mode.",
  }),
  location: z.string().max(200).optional(),
  host: z.string().max(100).optional(),
  capacity: z.coerce.number().int().positive().optional().or(z.literal("")),
  contactHours: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(500).optional(),
  completionRuleId: z.string().optional(),
});

export type EventValues = z.infer<typeof eventSchema>;
