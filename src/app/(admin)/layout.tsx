import type { Metadata } from "next";
import { RoleKey } from "@prisma/client";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/roles";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member, roles } = await requireRole([RoleKey.EXECUTIVE, RoleKey.ADMIN]);

  return (
    <AdminShell fullName={member.fullName} roles={roles}>
      {children}
    </AdminShell>
  );
}
