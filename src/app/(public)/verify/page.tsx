import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify a certificate — NiMechE-SF, Tech-U",
  description: "Enter a certificate code to verify it was issued by the NiMechE Student Faculty at Tech-U.",
};

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function VerifyLandingPage({ searchParams }: Props) {
  const { code } = await searchParams;
  // If a code is submitted via the form, redirect to the code-specific route
  if (code?.trim()) {
    redirect(`/verify/${encodeURIComponent(code.trim())}`);
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 py-16 sm:px-7">
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h1 className="font-heading text-[26px] font-bold">
          Verify a certificate
        </h1>
        <p className="text-muted-foreground text-[15px]">
          Enter the code printed on a NiMechE-SF certificate. No account needed.
        </p>
      </div>

      <form method="get" action="/verify" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-semibold">
            Certificate code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            placeholder="Enter the code printed on the certificate"
            required
            className="border-border-strong bg-surface min-h-[50px] rounded-lg border px-4 font-mono text-base tracking-[0.06em] focus:outline focus:outline-2 focus:outline-offset-0"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-primary-foreground min-h-[50px] rounded-lg px-6 font-semibold transition-opacity hover:opacity-90 focus:outline focus:outline-2 focus:outline-offset-2"
        >
          Check certificate
        </button>
      </form>
    </div>
  );
}
