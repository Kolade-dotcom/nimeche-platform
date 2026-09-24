import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgotten passwords happen"
      lede="Give us the Tech-U address you signed up with and we will email you a link to set a new password. It works for 60 minutes."
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[30px] font-bold">Reset your password</h2>
        <p className="text-muted-foreground">
          Remembered it?{" "}
          <Link href="/sign-in" className="font-semibold underline underline-offset-4">
            Go back to sign in
          </Link>
        </p>
      </div>

      <ForgotPasswordForm />
    </AuthShell>
  );
}
