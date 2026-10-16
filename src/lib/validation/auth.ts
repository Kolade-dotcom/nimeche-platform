import { z } from "zod";

/**
 * The email domain is the gate.
 *
 * The official Tech-U address identifies the institution, and the matric number
 * collected during sign-up ties the account to the student's school record.
 */
export const TECH_U_DOMAIN = "tech-u.edu.ng";

export const DEPARTMENTS = [
  { value: "MECHANICAL", label: "Mechanical" },
  { value: "MECHATRONICS", label: "Mechatronics" },
] as const;

export const LEVELS = ["100", "200", "300", "400", "500"] as const;

/** Minimum length only. Composition rules make passwords worse, not better. */
export const PASSWORD_MIN = 8;

const techUEmail = z
  .string()
  .trim()
  .min(1, "Enter your Tech-U email.")
  .toLowerCase()
  .email("That does not look like an email address.")
  .refine((value) => value.endsWith(`@${TECH_U_DOMAIN}`), {
    message: `Use your Tech-U address - the one ending @${TECH_U_DOMAIN}.`,
  });

const password = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(72, "That is longer than 72 characters, which is as long as we can store.");

export const signInSchema = z.object({
  email: techUEmail,
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().default(true),
});

export const joinSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "That is longer than we can store."),
  email: techUEmail,
  matricNo: z
    .string()
    .trim()
    .regex(/^\d{3}\/\d{2}\/[12]\/\d{4}$/, "Enter your matric number in the format 125/22/1/0178."),
  password,
  department: z.enum(["MECHANICAL", "MECHATRONICS"], {
    message: "Choose your department.",
  }),
  level: z.enum(LEVELS, { message: "Choose your level." }),
});

export const forgotPasswordSchema = z.object({ email: techUEmail });

export const resetPasswordSchema = z.object({ password });

export type SignInValues = z.infer<typeof signInSchema>;
export type JoinValues = z.infer<typeof joinSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
