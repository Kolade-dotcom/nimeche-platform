import type { Metadata } from "next";
import Link from "next/link";
import { ClockIcon } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "That link has expired" };

export default function LinkExpiredPage() {
  return (
    <AuthShell
      title="Reset links do not last long"
      lede="For safety a reset link works for 60 minutes and once only. Getting another takes one tap, and nothing is lost."
    >
      <div className="bg-accent-subtle text-accent-text flex size-16 items-center justify-center rounded-full">
        <ClockIcon className="size-7" />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-[30px] font-bold">That link has expired</h2>
        <p className="text-muted-foreground text-base/relaxed">
          Ask for a fresh one and use it within the hour. It goes to the same address.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/forgot-password">Send me a new one</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>

      <div className="bg-surface-sunken rounded-lg px-5 py-4">
        <p className="text-muted-foreground text-sm/relaxed">
          Nothing you did is lost. Your membership, certificates and record are all still
          there — this is only about getting you back in.
        </p>
      </div>
    </AuthShell>
  );
}
