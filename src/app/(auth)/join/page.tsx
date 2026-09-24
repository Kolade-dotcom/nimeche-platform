import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";

import { JoinForm } from "./join-form";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join NiMechE-SF at Tech-U. Five fields, and an executive reviews new members within 48 hours.",
};

export default function JoinPage() {
  return (
    <AuthShell
      title="Join NiMechE-SF"
      lede="Five fields and you are in. We do not ask which school you attend, because a Tech-U address already answers that."
      points={[
        "One password, no confirm box, no rules to decode",
        "An executive reviews new members within 48 hours",
        "Certificates and skills fill themselves in as you take part",
      ]}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-[30px] font-bold">Create your account</h2>
        <p className="text-muted-foreground">
          Already a member?{" "}
          <Link href="/sign-in" className="font-semibold underline underline-offset-4">
            Sign in instead
          </Link>
        </p>
      </div>

      <JoinForm />
    </AuthShell>
  );
}
