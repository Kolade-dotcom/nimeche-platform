import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to NiMechE-SF with your Tech-U email and password.",
};

/**
 * Auth.js sends people here with `?callbackUrl=`, an absolute URL. Our own
 * action reads `next`, a path. Accept either and normalise to a path, so a
 * link written by hand and a redirect written by the library both work, and
 * neither can bounce a member to another site.
 */
function toPath(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}`;
  } catch {
    return undefined;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const next = toPath(params.next) ?? toPath(params.callbackUrl);

  return (
    <AuthShell
      title="Welcome back"
      lede="Your Tech-U email and your password. Nothing else to remember, nothing else to look up."
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[30px] font-bold">Sign in</h2>
        <p className="text-muted-foreground">
          New here?{" "}
          <Link href="/join" className="font-semibold underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>

      <SignInForm next={next} />
    </AuthShell>
  );
}
