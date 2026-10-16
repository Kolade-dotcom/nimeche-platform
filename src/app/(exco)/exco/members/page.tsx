import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/admin/search-input";
import { getMemberList } from "@/lib/members/admin";
import { longDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RoleKey } from "@prisma/client";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";
import { updateRoleAction } from "@/app/(exco)/exco/members/actions";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "lapsed", label: "Lapsed" },
];

function statusVariant(status: string) {
  if (status === "ACTIVE") return "primary";
  if (status === "PENDING") return "accent";
  if (status === "LAPSED") return "default";
  return "default";
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { member: actor, roles: actorRoles } = await requireRole(
    EXECUTIVE_DASHBOARD_ROLES
  );
  const status = params.status ?? "all";
  const search = params.search ?? "";

  const members = await getMemberList({ search, status });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {members.length} member{members.length !== 1 ? "s" : ""} shown
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/exco/members?status=${tab.value}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={cn(
                "min-h-[44px] px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary-text border-b-2 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <Suspense>
        <div className="max-w-sm">
          <SearchInput placeholder="Search name, email or matric number…" />
        </div>
      </Suspense>

      {/* Table */}
      <Table stacked>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                No members found.
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow
                key={member.id}
                className={
                  member.status === "PENDING" ? "bg-accent-subtle/40" : undefined
                }
              >
                <TableCell data-label="Name" className="font-medium">
                  {member.fullName}
                </TableCell>
                <TableCell data-label="Email" className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell data-label="Department">
                  {member.department
                    ? member.department.charAt(0) +
                      member.department.slice(1).toLowerCase()
                    : "—"}
                </TableCell>
                <TableCell data-label="Level">{member.level ?? "—"}</TableCell>
                <TableCell data-label="Status">
                  <Badge variant={statusVariant(member.status)}>
                    {member.status.charAt(0) + member.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell data-label="Joined">
                  {member.joinedAt ? longDate(member.joinedAt) : "—"}
                </TableCell>
                <TableCell data-label="Roles">
                  {member.roles.some((role) => role !== RoleKey.MEMBER) ? member.roles.filter((role) => role !== RoleKey.MEMBER).map((role) => <Badge key={role} variant={role === RoleKey.PRESIDENT ? "accent" : "default"} className="mr-1">{role === RoleKey.ADMIN ? "Tech Admin" : role === RoleKey.PRESIDENT ? "President" : role === RoleKey.EXECUTIVE ? "Executive" : role}</Badge>) : <span className="text-muted-foreground">Member</span>}
                </TableCell>
                <TableCell data-label="Actions">
                  <Link
                    href={`/exco/members/${member.id}`}
                    className="text-primary-text text-sm font-medium underline-offset-4 hover:underline"
                  >
                    View
                  </Link>
                  {member.status === "ACTIVE" && (actorRoles.includes(RoleKey.PRESIDENT) || actorRoles.includes(RoleKey.ADMIN)) && (actor.id !== member.id || actorRoles.includes(RoleKey.ADMIN)) ? (
                    <form action={async () => { "use server"; await updateRoleAction(member.id, RoleKey.EXECUTIVE, !member.roles.includes(RoleKey.EXECUTIVE)); }} className="mt-2">
                      <Button type="submit" size="sm" variant="outline">{member.roles.includes(RoleKey.EXECUTIVE) ? "Remove Executive" : "Make Executive"}</Button>
                    </form>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
