import type { Metadata } from "next";

import { MemberShell } from "@/components/member/member-shell";
import { requireMember } from "@/lib/member/session";

export const metadata: Metadata = {
  // Nothing under /me is public, so nothing under it should be indexable -
  // including by a crawler that somehow gets a session.
  robots: { index: false, follow: false },
};

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();

  return (
    <MemberShell fullName={member.fullName} execTitle={member.execTitle}>
      {children}
    </MemberShell>
  );
}
