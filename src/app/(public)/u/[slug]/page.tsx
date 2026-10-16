import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AwardIcon, GraduationCapIcon } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Member profile",
  robots: { index: false, follow: false },
};

const DEPARTMENTS: Record<string, string> = {
  MECHANICAL: "Mechanical Engineering",
  MECHATRONICS: "Mechatronics Engineering",
};

export default async function PublicMemberProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await db.member.findFirst({
    where: { publicSlug: slug, publicProfile: true, status: "ACTIVE" },
    select: { fullName: true, department: true, level: true, execTitle: true },
  });
  if (!member) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-7 sm:py-16">
      <header className="mb-8 flex items-center justify-between gap-4">
        <BrandLockup />
        <Badge variant="primary">Member profile</Badge>
      </header>
      <Card className="overflow-hidden p-0">
        <div className="bg-band px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold tracking-wide text-white/75">NiMechE-SF · Tech-U</p>
          <h1 className="font-heading mt-3 text-3xl font-bold sm:text-4xl">{member.fullName}</h1>
          {member.execTitle ? <p className="mt-3 font-medium text-white/85">{member.execTitle}</p> : null}
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10">
          {member.department ? (
            <div className="flex items-start gap-3">
              <GraduationCapIcon className="text-primary-text mt-0.5 size-5 shrink-0" />
              <div><p className="text-muted-foreground text-xs font-semibold uppercase">Department</p><p className="mt-1 font-medium">{DEPARTMENTS[member.department] ?? member.department}</p></div>
            </div>
          ) : null}
          {member.level ? (
            <div className="flex items-start gap-3">
              <AwardIcon className="text-primary-text mt-0.5 size-5 shrink-0" />
              <div><p className="text-muted-foreground text-xs font-semibold uppercase">Level</p><p className="mt-1 font-medium">{member.level} level</p></div>
            </div>
          ) : null}
        </div>
      </Card>
      <p className="text-muted-foreground mt-5 text-center text-xs">Shared by the member. Contact and matric details are kept private.</p>
    </div>
  );
}
