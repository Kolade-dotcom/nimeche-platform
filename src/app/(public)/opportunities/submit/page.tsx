import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { OpportunityForm } from "./opportunity-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit an opportunity — NiMechE-SF, Tech-U",
  description:
    "Submit an internship, job, scholarship or competition for NiMechE-SF members to see.",
};

export default function SubmitOpportunityPage() {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4 py-10 sm:px-7">
      <Link
        href="/opportunities"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        All opportunities
      </Link>

      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-[26px] font-bold">Submit an opportunity</h1>
        <p className="text-muted-foreground text-[15px]">
          Know of an internship, job, scholarship or competition? Share it here — no
          account needed. We review every submission before it goes live.
        </p>
      </div>

      <OpportunityForm />
    </div>
  );
}
