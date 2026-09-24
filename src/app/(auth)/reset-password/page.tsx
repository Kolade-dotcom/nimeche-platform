import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      lede="Pick something you will remember. You will be signed in as soon as you save it."
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[30px] font-bold">New password</h2>
        <p className="text-muted-foreground">
          Nothing else changes. Your membership, certificates and record are all still
          there.
        </p>
      </div>

      <ResetPasswordForm />
    </AuthShell>
  );
}
