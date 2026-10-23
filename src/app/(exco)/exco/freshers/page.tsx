import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareTextIcon, PhoneIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";

import { updateFresherSubmissionStatus } from "./actions";

export const metadata: Metadata = {
  title: "Fresher support queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TYPE_LABELS = {
  REQUEST: "Request",
  INQUIRY: "Inquiry",
  COMPLAINT: "Complaint",
  OTHER: "Other",
} as const;

const AREA_LABELS = {
  ROOM_AND_HOSTEL: "Room or hostel",
  ARRIVAL_AND_DIRECTIONS: "Arrival or directions",
  REGISTRATION: "Registration or clearance",
  FEES: "Fees or payment",
  ACADEMIC: "Academic or department",
  SAFETY: "Safety",
  OTHER: "Other",
} as const;

const STATUS_LABELS = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
} as const;

const DEPARTMENT_LABELS = {
  MECHANICAL: "Mechanical Engineering",
  MECHATRONICS: "Mechatronics Engineering",
} as const;

function whatsappNumber(phone: string) {
  return phone.replace(/\D/g, "");
}

export default async function FresherSupportQueuePage() {
  const [submissions, totalFreshers] = await Promise.all([
    db.fresherSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        fresher: {
          select: { fullName: true, phone: true, department: true },
        },
      },
    }),
    db.fresherIntake.count(),
  ]);

  const openCount = submissions.filter((item) => item.status !== "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Fresher support</h1>
            <p className="text-muted-foreground mt-1 max-w-[68ch] text-sm">
              Requests, inquiries, complaints, and other messages from new students. The
              executive team shares this queue.
            </p>
          </div>
          <Link
            href="/freshers"
            target="_blank"
            className="border-border inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-semibold"
          >
            Open fresher signup
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="gap-1 py-4">
          <div className="px-5">
            <p className="font-heading text-2xl font-bold tabular-nums">{openCount}</p>
            <p className="text-muted-foreground text-xs font-medium">Open messages (latest 200)</p>
          </div>
        </Card>
        <Card className="gap-1 py-4">
          <div className="px-5">
            <p className="font-heading text-2xl font-bold tabular-nums">{totalFreshers}</p>
            <p className="text-muted-foreground text-xs font-medium">Fresher sign-ups</p>
          </div>
        </Card>
        <Card className="col-span-2 gap-1 py-4 sm:col-span-1">
          <div className="flex items-center gap-3 px-5">
            <MessageSquareTextIcon className="text-primary-text size-5" />
            <div>
              <p className="font-heading text-2xl font-bold tabular-nums">{submissions.length}</p>
              <p className="text-muted-foreground text-xs font-medium">Messages shown</p>
            </div>
          </div>
        </Card>
      </div>

      {submissions.length ? (
        <ul className="space-y-4">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <Card className="gap-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{TYPE_LABELS[submission.type]}</Badge>
                      <Badge variant="outline">{AREA_LABELS[submission.area]}</Badge>
                      <Badge
                        variant={submission.status === "RESOLVED" ? "primary" : "accent"}
                      >
                        {STATUS_LABELS[submission.status]}
                      </Badge>
                    </div>
                    <h2 className="font-heading text-lg font-bold">{submission.subject}</h2>
                  </div>
                  <time
                    dateTime={submission.createdAt.toISOString()}
                    className="text-muted-foreground shrink-0 text-xs"
                  >
                    {submission.createdAt.toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </div>

                <p className="text-foreground whitespace-pre-wrap break-words text-sm/relaxed">
                  {submission.message}
                </p>

                <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{submission.fresher.fullName}</p>
                    {submission.fresher.department && (
                      <p className="text-muted-foreground text-xs">
                        {DEPARTMENT_LABELS[submission.fresher.department]}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`tel:${submission.fresher.phone}`}
                        className="border-border inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium"
                      >
                        <PhoneIcon className="size-3.5" /> {submission.fresher.phone}
                      </a>
                      <a
                        href={`https://wa.me/${whatsappNumber(submission.fresher.phone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary-subtle text-primary-text inline-flex min-h-9 items-center rounded-md px-3 text-xs font-semibold"
                      >
                        WhatsApp fresher
                      </a>
                    </div>
                  </div>

                  <form
                    action={updateFresherSubmissionStatus}
                    className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                  >
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <label className="sr-only" htmlFor={`status-${submission.id}`}>
                      Update status for {submission.subject}
                    </label>
                    <select
                      id={`status-${submission.id}`}
                      name="status"
                      defaultValue={submission.status}
                      className="border-input bg-surface h-10 min-w-36 flex-1 rounded-sm border px-3 text-sm sm:flex-none"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground min-h-10 rounded-md px-4 text-sm font-semibold"
                    >
                      Save status
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="items-center px-6 py-12 text-center">
          <MessageSquareTextIcon className="text-muted-foreground mb-3 size-8" />
          <h2 className="font-heading font-bold">No fresher messages yet</h2>
          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            Share the fresher support link with incoming students. New submissions will
            appear here for the whole executive team.
          </p>
          <Link href="/freshers" className="text-primary-text mt-3 text-sm font-semibold underline">
            Open the fresher signup page
          </Link>
        </Card>
      )}
    </div>
  );
}
