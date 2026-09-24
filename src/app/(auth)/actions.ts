"use server";

import { redirect } from "next/navigation";

import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately the same message for a wrong password and an address with
    // no account. Telling a stranger which one it was hands them a way to
    // find out who is a member.
    return {
      formError:
        "That email and password do not match. Check them, or reset your password.",
    };
  }

  redirect(safeNext(formData.get("next")));
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: siteUrl("/auth/callback"),
      // Read back by the trigger that creates the Member row, so the profile
      // exists the moment the account does.
      data: {
        full_name: parsed.data.fullName,
        department: parsed.data.department,
        level: Number(parsed.data.level),
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return {
        formError:
          "There is already an account on that address. Sign in instead, or reset your password.",
      };
    }
    return { formError: "We could not create the account. Try again in a moment." };
  }

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

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: siteUrl("/auth/callback?next=/reset-password"),
  });

  // Always the same answer, sent or not. Anything else turns this form into a
  // way of asking whether a given student is a member.
  redirect("/check-email?reason=reset");
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      formError:
        "That reset link has expired. Ask for a new one and use it within the hour.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { formError: "We could not change the password. Try again in a moment." };
  }

  redirect("/me");
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
