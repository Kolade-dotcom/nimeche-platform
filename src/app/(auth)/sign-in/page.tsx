import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to NiMechE-SF with your Tech-U email and password.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

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
