import type { Metadata } from "next";
import { requireTechAdmin } from "@/lib/auth/roles";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTechAdmin();
  return children;
}
