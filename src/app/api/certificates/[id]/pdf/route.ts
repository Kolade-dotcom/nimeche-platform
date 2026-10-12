import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSessionMember } from "@/lib/member/session";
import { getMemberRoles } from "@/lib/auth/roles";
import { generatePdf } from "@/lib/certificates/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * The printable PDF for one certificate. The member who owns it, or an
 * executive/admin, may download it. Generated once and stored — later calls
 * redirect straight to the stored copy, so the response carries a long cache.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const member = await getSessionMember();
  if (!member) {
    return NextResponse.json(
      { error: "Sign in to download this certificate." },
      { status: 401 }
    );
  }

  const credential = await db.credential.findUnique({
    where: { id },
    select: { memberId: true, pdfUrl: true },
  });
  if (!credential) {
    return NextResponse.json({ error: "No such certificate." }, { status: 404 });
  }

  const isOwner = credential.memberId === member.id;
  const roles = await getMemberRoles(member.id);
  const isExec = roles.some((r) => r === "EXECUTIVE" || r === "ADMIN");
  if (!isOwner && !isExec) {
    return NextResponse.json(
      { error: "This certificate belongs to someone else." },
      { status: 403 }
    );
  }

  const url = credential.pdfUrl ?? (await generatePdf(id));

  return NextResponse.redirect(new URL(url, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"), {
    headers: { "Cache-Control": "private, max-age=86400" },
  });
}
