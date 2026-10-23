import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeftIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";

import { FresherIssueForm } from "@/app/(public)/freshers/help/issue-form";
import { getCurrentFresher } from "@/lib/freshers/session";
import { DEFAULT_FRESHER_CONTACTS, FRESHER_CONTACT_SETTINGS_ID, formatPhoneForWhatsApp } from "@/lib/freshers/contacts";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

const DEPARTMENT_LABELS = {
  MECHANICAL: "Mechanical Engineering",
  MECHATRONICS: "Mechatronics Engineering",
} as const;

export const metadata: Metadata = {
  title: "Your fresher support page",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS = {
  NEW: "Received",
  IN_PROGRESS: "Being followed up",
  RESOLVED: "Resolved",
} as const;

export default async function FresherHelpPage() {
  const fresher = await getCurrentFresher();
  if (!fresher) redirect("/freshers");

  const [submissions, savedContacts] = await Promise.all([
    db.fresherSubmission.findMany({
      where: { fresherId: fresher.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, subject: true, status: true, createdAt: true },
    }),
    db.fresherContactSettings.findUnique({ where: { id: FRESHER_CONTACT_SETTINGS_ID } }),
  ]);
  const contacts = savedContacts ?? DEFAULT_FRESHER_CONTACTS;
  const contactList = [
    { title: "President", phone: contacts.presidentPhone },
    { title: "Executive support", phone: contacts.executiveSupportPhone },
    { title: "Staff adviser", phone: contacts.staffAdviserPhone },
  ];

  return (
    <section className="mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-7 sm:py-12">
      <Link
        href="/freshers"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm font-medium"
      >
        <ArrowLeftIcon className="size-4" /> Freshers’ welcome
      </Link>

      <div className="mb-8">
        <p className="text-primary-text text-sm font-semibold">Welcome, {fresher.fullName}</p>
        <h1 className="font-heading mt-1 text-3xl font-bold sm:text-4xl">How can we help?</h1>
        <p className="text-muted-foreground mt-3 max-w-[62ch] text-base/relaxed">
          Send the executive team a request, inquiry, complaint, or anything else you need
          help with. Your department is {DEPARTMENT_LABELS[fresher.department!]}.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]">
        <div className="border-border bg-surface shadow-e1 rounded-2xl border p-5 sm:p-7">
          <h2 className="font-heading mb-5 text-xl font-bold">Contact the executive team</h2>
          <FresherIssueForm />
        </div>

        <aside className="space-y-6">
          <div className="border-border bg-surface rounded-2xl border p-5">
            <h2 className="font-heading text-lg font-bold">Call or WhatsApp</h2>
            <p className="text-muted-foreground mt-1 text-sm/relaxed">
              You can call or message the team directly using the contact options below.
            </p>
            <ul className="mt-4 space-y-3">
              {contactList.map(({ title, phone }) => (
                <li key={title} className="border-border rounded-xl border p-3">
                  <p className="text-sm font-semibold">{title}</p>
                  {phone ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="border-border text-foreground inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium"
                      >
                        <PhoneIcon className="size-4" /> {phone}
                      </a>
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary-subtle text-primary-text inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold"
                      >
                        <MessageCircleIcon className="size-4" /> WhatsApp
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1 text-sm">Number coming soon</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border bg-surface rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold">Your messages</h2>
              <Badge>{submissions.length}</Badge>
            </div>
            {submissions.length ? (
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {submissions.map((submission) => (
                  <li key={submission.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold">{submission.subject}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {STATUS_LABELS[submission.status]} · {submission.createdAt.toLocaleDateString("en-NG")}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                Messages you send will appear here with their follow-up status.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
