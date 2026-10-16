import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { EXECUTIVE_DASHBOARD_ROLES, requireRole } from "@/lib/auth/roles";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ExcoLayout({ children }: { children: React.ReactNode }) {
  const { member, roles } = await requireRole(EXECUTIVE_DASHBOARD_ROLES);
  return <AdminShell fullName={member.fullName} roles={roles}>{children}</AdminShell>;
}
