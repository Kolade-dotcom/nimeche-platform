import { z } from "zod";

/**
 * The email domain is the gate.
 *
 * Every member already has firstname.lastname@tech-u.edu.ng, already knows it,
 * and it is the one identifier that ties an account to a real student without
 * anyone typing a matric number. Accepting only this domain is what lets
 * sign-up skip "which institution?" entirely (design plan section 1.1).
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
