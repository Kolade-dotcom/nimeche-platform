import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { verifyCredential } from "@/lib/credentials/verify";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Certificate ${code} — NiMechE-SF verification`,
  };
}

export default async function VerifyPage({ params }: Props) {
  const { code } = await params;
  const result = await verifyCredential(code);

  // ---- Not found ----
  if (!result.found) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-16 text-center sm:px-7">
        <XCircleIcon className="text-muted-foreground mx-auto mb-4 size-12" aria-hidden />
        <h1 className="font-heading mb-2 text-[22px] font-bold">Certificate not found</h1>
        <p className="text-muted-foreground mb-8">
          No certificate found with that code. Check for typos and try again.
        </p>
        <Link
          href="/verify"
          className="text-primary-text text-sm font-semibold underline"
        >
          Verify another certificate
        </Link>
      </main>
    );
  }

  const { credential, revoked } = result;

  // ---- Found but revoked ----
  if (revoked) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-16 sm:px-7">
        <div
          className="border-danger-text/20 bg-danger-subtle rounded-2xl border p-8 text-center"
          role="alert"
        >
          <XCircleIcon
            className="text-danger-text mx-auto mb-4 size-10"
            aria-hidden
          />
          <h1 className="font-heading text-danger-text mb-2 text-[20px] font-bold">
            Certificate revoked
          </h1>
          <p className="text-muted-foreground text-sm">
            This certificate was revoked on{" "}
            {credential.revokedAt ? format(credential.revokedAt, "d MMMM yyyy") : "—"}.
          </p>
          <hr className="border-border my-6" />
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold">{credential.memberName}</span>{" "}
            · {credential.title}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/verify"
            className="text-primary-text text-sm font-semibold underline"
          >
            Verify another certificate
          </Link>
        </div>
      </main>
    );
  }

  // ---- Found and valid ----
  return (
    <main className="mx-auto max-w-[640px] px-4 py-12 sm:px-7">
      {/* Institution header */}
      <header className="mb-8 text-center">
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.09em]">
          NiMechE-SF · Tech-U
        </p>
        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.09em]">
          Certificate verification
        </p>
      </header>

      {/* Certificate card */}
      <div className="border-border shadow-e1 rounded-2xl border bg-[var(--surface)] p-8">
        {/* Valid badge */}
        <div className="mb-6 flex items-center gap-2">
          <CheckCircle2Icon
            className="text-primary-text size-5"
            aria-hidden
          />
          <span className="text-primary-text text-sm font-semibold">
            Valid certificate
          </span>
        </div>

        {/* Member name */}
        <h1 className="font-heading mb-1 text-[28px] font-bold leading-tight sm:text-[34px]">
          {credential.memberName}
        </h1>

        {/* Programme title */}
        <p className="text-muted-foreground mb-6 text-[17px]">{credential.title}</p>

        <hr className="border-border mb-6" />

        {/* Stats */}
        <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
              Issued
            </dt>
            <dd className="mt-1 text-sm font-semibold">
              {format(credential.issuedAt, "d MMM yyyy")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
              Sessions
            </dt>
            <dd className="mt-1 text-sm font-semibold">{credential.sessions}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
              Contact hours
            </dt>
            <dd className="mt-1 text-sm font-semibold">{credential.contactHours}</dd>
          </div>
        </dl>

        {/* Skills */}
        {credential.skills.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-[0.08em]">
              Skills evidenced
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Skills">
              {credential.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="default">{skill}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Events */}
        {credential.events.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-[0.08em]">
              Activities
            </p>
            <ul className="flex flex-col gap-2" aria-label="Events attended">
              {credential.events.map((event) => (
                <li key={event.title} className="flex items-baseline gap-2 text-sm">
                  <span className="text-muted-foreground shrink-0">
                    {format(event.startsAt, "d MMM yyyy")}
                  </span>
                  <span className="font-medium">{event.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verify another */}
      <div className="mt-8 text-center">
        <Link
          href="/verify"
          className="text-primary-text text-sm font-semibold underline"
        >
          Verify another certificate
        </Link>
      </div>
    </main>
  );
}
