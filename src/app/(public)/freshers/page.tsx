import type { Metadata } from "next";
import { ArrowRightIcon, MapPinnedIcon, MessageCircleQuestionIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";

import { FresherSignupForm } from "@/app/(public)/freshers/fresher-signup-form";
import { getCurrentFresher } from "@/lib/freshers/session";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Freshers’ welcome and support",
  description: "Sign up for help settling in at Tech-U. No matric number needed.",
};

export const dynamic = "force-dynamic";

export default async function FreshersWelcomePage() {
  const fresher = await getCurrentFresher();

  return (
    <section className="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-7 sm:py-12 lg:py-16">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.82fr)] lg:gap-14">
        <div className="space-y-7">
          <div className="space-y-4">
            <span className="bg-primary-subtle text-primary-text inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
              <MapPinnedIcon className="size-4" /> Tech-U fresher support
            </span>
            <h1 className="max-w-[16ch] text-3xl font-bold leading-tight sm:text-4xl">
              New here? We’ll help you find your feet.
            </h1>
            <p className="text-muted-foreground max-w-[58ch] text-base/relaxed sm:text-lg">
              Sign up once to get a place to ask the NiMechE-SF team for help with rooms,
              getting around, registration, or anything else you are figuring out.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="border-border bg-surface rounded-xl border p-4">
              <MessageCircleQuestionIcon className="text-primary-text mb-3 size-5" />
              <h2 className="font-heading font-bold">Ask about anything</h2>
              <p className="text-muted-foreground mt-1 text-sm/relaxed">
                Send a request, question, complaint, or other issue to the executive team.
              </p>
            </li>
            <li className="border-border bg-surface rounded-xl border p-4">
              <ShieldCheckIcon className="text-primary-text mb-3 size-5" />
              <h2 className="font-heading font-bold">No matric number needed</h2>
              <p className="text-muted-foreground mt-1 text-sm/relaxed">
                Use the page now. You can join as a full member when your school details are ready.
              </p>
            </li>
          </ul>

          {fresher ? (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/freshers/help">
                Continue to your support page <ArrowRightIcon />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="border-border bg-surface shadow-e1 rounded-2xl border p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="font-heading text-xl font-bold">Quick sign-up</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Just your name, WhatsApp number, and department.
            </p>
          </div>
          <FresherSignupForm />
        </div>
      </div>
    </section>
  );
}
