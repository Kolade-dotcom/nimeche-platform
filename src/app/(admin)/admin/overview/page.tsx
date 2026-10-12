import Link from "next/link";
import { AlertCircleIcon, AwardIcon, CalendarIcon, ClockIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/admin/queries";
import { longDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  MEMBER_APPROVED: "Member approved",
  MEMBER_REJECTED: "Member rejected",
  ROLE_GRANTED: "Role granted",
  ROLE_REVOKED: "Role revoked",
  EVENT_PUBLISHED: "Event published",
  EVENT_CANCELLED: "Event cancelled",
  ATTENDANCE_EDITED: "Attendance edited",
  CREDENTIAL_ISSUED: "Certificate issued",
  CREDENTIAL_REVOKED: "Certificate revoked",
  OPPORTUNITY_PUBLISHED: "Opportunity published",
  OPPORTUNITY_REJECTED: "Opportunity rejected",
  SETTINGS_UPDATED: "Settings updated",
};

export default async function OverviewPage() {
  const data = await getAdminOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Branch activity at a glance.</p>
      </div>

      {/* Pending members alert */}
      {data.pendingMembers > 0 && (
        <div className="bg-accent-subtle text-accent-text flex items-center gap-3 rounded-lg border border-[var(--accent)] px-4 py-3">
          <AlertCircleIcon className="size-5 shrink-0" />
          <p className="text-sm font-medium">
            {data.pendingMembers} member{data.pendingMembers !== 1 ? "s" : ""} waiting for
            approval.{" "}
            <Link
              href="/admin/members?status=pending"
              className="underline underline-offset-4"
            >
              Review now
            </Link>
          </p>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total members"
          value={data.totalMembers}
          icon={<UsersIcon className="size-5" />}
        />
        <StatTile
          label="Pending"
          value={data.pendingMembers}
          icon={<ClockIcon className="size-5" />}
          variant={data.pendingMembers > 0 ? "accent" : "default"}
        />
        <StatTile
          label="Upcoming events"
          value={data.upcomingEvents}
          icon={<CalendarIcon className="size-5" />}
        />
        <StatTile
          label="Certificates"
          value={data.totalCredentials}
          icon={<AwardIcon className="size-5" />}
        />
      </div>

      {/* Recent audit log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentAuditLog.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          ) : (
            <ul className="divide-border divide-y text-sm">
              {data.recentAuditLog.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <span className="font-medium">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {entry.entityType} {entry.entityId.slice(0, 8)}
                    </span>
                    {entry.actorName && (
                      <span className="text-muted-foreground"> by {entry.actorName}</span>
                    )}
                  </div>
                  <time
                    dateTime={entry.createdAt.toISOString()}
                    className="text-muted-foreground shrink-0 tabular-nums"
                  >
                    {longDate(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "accent";
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="px-5">
        <div
          className={
            variant === "accent"
              ? "text-accent-text bg-accent-subtle mb-2 flex size-9 items-center justify-center rounded-lg"
              : "text-primary-text bg-primary-subtle mb-2 flex size-9 items-center justify-center rounded-lg"
          }
        >
          {icon}
        </div>
        <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
      </CardContent>
    </Card>
  );
}
