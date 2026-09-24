import type { Metadata } from "next";
import Link from "next/link";
import { InboxIcon, SearchIcon } from "lucide-react";

import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Check your email" };

const COPY = {
  confirm: {
    title: "Check your inbox",
    lede: "We sent a link to confirm your address. Open it and your account is live, ready for an executive to review.",
    heading: "Check your email",
    body: "We sent a confirmation link. Open it on whichever device is easiest — it works on any of them.",
  },
  reset: {
    title: "Check your inbox",
    lede: "We sent a link to set a new password. It is good for 60 minutes and works on any device.",
    heading: "Check your email",
    body: "If there is an account on that address, a reset link is on its way. Open it and you can set a new password.",
  },
} as const;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const copy = reason === "confirm" ? COPY.confirm : COPY.reset;

  return (
    <AuthShell title={copy.title} lede={copy.lede}>
      <div className="bg-primary-subtle text-primary-text flex size-16 items-center justify-center rounded-full">
        <InboxIcon className="size-7" />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-[30px] font-bold">{copy.heading}</h2>
        <p className="text-muted-foreground text-base/relaxed">{copy.body}</p>
      </div>

      <div className="bg-surface-sunken flex items-start gap-3 rounded-lg px-5 py-4">
        <SearchIcon className="text-muted-foreground mt-0.5 size-[18px] shrink-0" />
        <p className="text-muted-foreground text-sm/relaxed">
          Nothing after a minute? Check your spam folder, and the Tech-U webmail if your
          address forwards somewhere else.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/forgot-password">Send it again</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
