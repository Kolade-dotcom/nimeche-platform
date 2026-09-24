"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import { consumeToken, issueToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import {
  forgotPasswordSchema,
  joinSchema,
  resetPasswordSchema,
  signInSchema,
} from "@/lib/validation/auth";

/**
 * What a form gets back. Field errors land next to the field; `formError` is
 * for the ones that belong to no single field, like wrong credentials.
 *
 * Every message says what to do next, in plain words. An error naming an
 * internal state is a defect (design plan section 15).
 */
export type AuthState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
};

/** Only ever send someone to a path on this site, never to a pasted URL. */
function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/me";
  if (!next.startsWith("/") || next.startsWith("//")) return "/me";
  return next;
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeNext(formData.get("next")),
    });
  } catch (error) {
    // signIn redirects by throwing. Let that through, or nobody ever arrives.
    if (isRedirectError(error)) throw error;

    if (error instanceof AuthError) {
      return {
        formError:
          "That email and password do not match. Check them, or reset your password.",
      };
    }
    throw error;
  }

  return {};
}

export async function joinAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = joinSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    department: formData.get("department"),
    level: formData.get("level"),
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const { fullName, email, password, department, level } = parsed.data;

  const existing = await db.member.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      formError:
        "There is already an account on that address. Sign in instead, or reset your password.",
    };
  }

  const member = await db.member.create({
    data: {
      fullName,
      email,
      passwordHash: await hashPassword(password),
      department,
      level: Number(level),
      status: "PENDING",
    },
    select: { id: true, email: true, fullName: true },
  });

  const token = await issueToken(member.id, "EMAIL_VERIFICATION");
  await sendVerificationEmail(member.email, member.fullName, token);

  redirect("/check-email?reason=confirm");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const member = await db.member.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, fullName: true },
  });

  // Only sent if there is somewhere to send it, but the answer below is the
  // same either way. Anything else turns this form into a way of asking
  // whether a given student is a member.
  if (member) {
    const token = await issueToken(member.id, "PASSWORD_RESET");
    await sendPasswordResetEmail(member.email, member.fullName, token);
  }

  redirect("/check-email?reason=reset");
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = formData.get("token");
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  if (typeof token !== "string" || !token) {
    return {
      formError: "That reset link is incomplete. Ask for a new one and open it directly.",
    };
  }

  const member = await consumeToken(token, "PASSWORD_RESET");

  if (!member) {
    return {
      formError:
        "That reset link has expired or has already been used. Ask for a new one.",
    };
  }

  await db.member.update({
    where: { id: member.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      // Opening a link we emailed proves the address, so the reset doubles as
      // a confirmation for anyone who never got round to it.
      emailVerifiedAt: member.emailVerifiedAt ?? new Date(),
    },
  });

  try {
    await signIn("credentials", {
      email: member.email,
      password: parsed.data.password,
      redirectTo: "/me",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    // The password did change. Send them to sign in rather than pretend it did not.
    redirect("/sign-in?reset=1");
  }

  return {};
}
