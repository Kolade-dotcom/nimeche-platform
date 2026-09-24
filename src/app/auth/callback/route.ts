import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Where an emailed link lands: the confirmation link after sign-up, and the
 * password reset link. Exchanges the one-time code for a session, then sends
 * the person on to wherever they were headed.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/me";

  if (!code) {
    return NextResponse.redirect(`${origin}/link-expired`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/link-expired`);
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
