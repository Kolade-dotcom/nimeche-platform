import { z } from "zod";

const today = () => new Date().toISOString().split("T")[0]!;

export const opportunitySubmitSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  organisation: z
    .string()
    .min(2, "Organisation must be at least 2 characters.")
    .max(100, "Organisation must be 100 characters or fewer."),
  type: z.enum(
    ["internship", "job", "scholarship", "competition", "grant", "conference", "training", "volunteering"],
    { error: "Choose a valid opportunity type." }
  ),
  deadline: z
    .string()
    .min(1, "Enter a deadline date.")
    .refine(
      (v) => v > today(),
      "The deadline must be in the future."
    ),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must be 1000 characters or fewer."),
  externalUrl: z
    .string()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type OpportunitySubmitValues = z.infer<typeof opportunitySubmitSchema>;
