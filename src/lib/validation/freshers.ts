import { z } from "zod";

const phoneNumber = z
  .string()
  .trim()
  .min(8, "Enter a phone or WhatsApp number the team can reach.")
  .max(24, "That phone number is too long.")
  .regex(/^\+?[0-9][0-9\s().-]*$/, "Enter a valid phone number.")
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .refine((value) => value.replace(/\D/g, "").length >= 8, "Enter a valid phone number.");

export const fresherSignupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(100, "Keep your name under 100 characters."),
  phone: phoneNumber,
  department: z.enum(["MECHANICAL", "MECHATRONICS"], {
    message: "Choose your department.",
  }),
});

export const fresherSubmissionSchema = z.object({
  type: z.enum(["REQUEST", "INQUIRY", "COMPLAINT", "OTHER"], {
    message: "Choose what best describes this message.",
  }),
  area: z.enum(
    [
      "ROOM_AND_HOSTEL",
      "ARRIVAL_AND_DIRECTIONS",
      "REGISTRATION",
      "FEES",
      "ACADEMIC",
      "SAFETY",
      "OTHER",
    ],
    { message: "Choose a topic, or select Other." }
  ),
  subject: z.string().trim().min(3, "Add a short subject.").max(120, "Use 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail so the team can help.")
    .max(3000, "Keep your message under 3,000 characters."),
});

export type FresherSignupValues = z.infer<typeof fresherSignupSchema>;
export type FresherSubmissionValues = z.infer<typeof fresherSubmissionSchema>;
