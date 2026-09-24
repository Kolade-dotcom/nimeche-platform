import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, ClockIcon } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { consumeToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Confirm your address" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const member = token ? await consumeToken(token, "EMAIL_VERIFICATION") : null;

  if (member) {
    await db.member.update({
      where: { id: member.id },
      data: { emailVerifiedAt: member.emailVerifiedAt ?? new Date() },
    });
  }

  if (!member) {
    return (
      <AuthShell
        title="Confirmation links do not last long"
        lede="For safety a confirmation link works for 24 hours and once only. Getting another takes one tap, and nothing is lost."
      >
        <div className="bg-accent-subtle text-accent-text flex size-16 items-center justify-center rounded-full">
          <ClockIcon className="size-7" />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-[30px] font-bold">That link has expired</h2>
          <p className="text-muted-foreground text-base/relaxed">
            Sign in and we will send you a fresh one. Your account is still there.
          </p>
        </div>
        <Button asChild>
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="That is your address confirmed"
      lede="An executive checks new members against the department roll, usually within 48 hours. You will get an email when you are approved."
    >
      <div className="bg-primary-subtle text-primary-text flex size-16 items-center justify-center rounded-full">
        <CheckIcon className="size-8" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-[30px] font-bold">
          Thank you, {member.fullName.split(" ")[0]}
        </h2>
        <p className="text-muted-foreground text-base/relaxed">
          Your address is confirmed and your application is with the executive. Nothing
          more to do.
        </p>
      </div>
      <Button asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </AuthShell>
  );
}
