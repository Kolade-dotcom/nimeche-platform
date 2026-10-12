import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemberDetail } from "@/lib/members/admin";
import { longDate } from "@/lib/format";
import {
  approveMemberAction,
  rejectMemberAction,
  updateRoleAction,
} from "@/app/(admin)/admin/members/actions";
import { verifyMemberSkill } from "@/lib/skills/actions";
import { RoleKey } from "@prisma/client";

const LEVEL_LABELS: Record<string, string> = {
  INTRODUCED: "Introduced",
  PRACTISING: "Practising",
  COMPETENT: "Competent",
  VERIFIED: "Verified",
};

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "ACTIVE") return "primary" as const;
  if (status === "PENDING") return "accent" as const;
  return "default" as const;
}

const ACTIVITY_LABELS: Record<string, string> = {
  CHECKED_IN: "✓ Checked in",
  CERTIFICATE_ISSUED: "🎓 Certificate issued",
  SKILL_LEVEL_UP: "⬆ Skill level up",
  DELIVERABLE_SUBMITTED: "📄 Deliverable submitted",
  MEMBERSHIP_APPROVED: "✅ Membership approved",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMemberDetail(id);

  if (!member) notFound();

  const hasExecutiveRole = member.roles.includes("EXECUTIVE" as RoleKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{member.fullName}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{member.email}</p>
        </div>
        <Badge variant={statusVariant(member.status)}>
          {member.status.charAt(0) + member.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Member info */}
        <Card>
          <CardHeader>
            <CardTitle>Member details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Department">
              {member.department
                ? member.department.charAt(0) + member.department.slice(1).toLowerCase()
                : "—"}
            </Row>
            <Row label="Level">{member.level ?? "—"}</Row>
            <Row label="Matric number">{member.matricNo ?? "—"}</Row>
            <Row label="Member number">{member.memberNo ?? "—"}</Row>
            <Row label="Joined">{member.joinedAt ? longDate(member.joinedAt) : "—"}</Row>
            <Row label="Email verified">
              {member.emailVerifiedAt ? longDate(member.emailVerifiedAt) : "Not yet"}
            </Row>
            <Row label="Expected graduation">{member.expectedGraduation ?? "—"}</Row>
            <Row label="Certificates">{member.credentialCount}</Row>
            <Row label="Roles">
              {member.roles.length > 0 ? member.roles.join(", ") : "Member"}
            </Row>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          {member.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Review membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Approve to activate this member and assign a member number. Enter
                  their matric number from the department roll if available.
                </p>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const matricNo = formData.get("matricNo") as string | undefined;
                    await approveMemberAction(id, matricNo || undefined);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label htmlFor="matricNo" className="text-sm font-medium">
                      Matric number (optional)
                    </label>
                    <input
                      id="matricNo"
                      name="matricNo"
                      placeholder="e.g. 125/23/1/0142"
                      className="border-input bg-surface flex h-11 w-full rounded-sm border px-4 text-sm"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Approve member
                  </Button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await rejectMemberAction(id);
                  }}
                >
                  <Button type="submit" variant="outline" className="w-full">
                    Reject application
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {member.status === "ACTIVE" && (
            <Card>
              <CardHeader>
                <CardTitle>Executive role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Grant or revoke the Executive role, which allows this member to access
                  the admin console.
                </p>
                <form
                  action={async () => {
                    "use server";
                    await updateRoleAction(
                      id,
                      RoleKey.EXECUTIVE,
                      !hasExecutiveRole
                    );
                  }}
                >
                  <Button
                    type="submit"
                    variant={hasExecutiveRole ? "outline" : "default"}
                    className="w-full"
                  >
                    {hasExecutiveRole ? "Revoke Executive role" : "Grant Executive role"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Skills — derivation computes these; the executive can only sign off */}
      {member.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border divide-y text-sm">
              {member.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {LEVEL_LABELS[skill.level] ?? skill.level}
                      {skill.verifiedBy ? ` · signed off by ${skill.verifiedBy}` : ""}
                    </span>
                  </div>
                  {skill.level !== "VERIFIED" && (
                    <form
                      action={async () => {
                        "use server";
                        await verifyMemberSkill(id, skill.id);
                      }}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        Sign off as verified
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-3 text-[13px]">
              Levels up to Competent are worked out from what the member attended and
              built — they cannot be set by hand. Verified means you have looked at the
              work yourself, and your name goes on it.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      {member.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border divide-y text-sm">
              {member.recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-4 py-3">
                  <span>
                    {ACTIVITY_LABELS[entry.kind] ?? entry.kind}: {entry.summary}
                  </span>
                  <time
                    dateTime={entry.occurredAt.toISOString()}
                    className="text-muted-foreground shrink-0"
                  >
                    {longDate(entry.occurredAt)}
                  </time>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
