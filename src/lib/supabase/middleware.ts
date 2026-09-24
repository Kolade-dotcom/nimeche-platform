import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getEnv } from "@/lib/env";

/** Routes a signed-out visitor may not reach. Everything else renders publicly. */
const PROTECTED = ["/me", "/admin"];

/** Auth screens a signed-in member has no business seeing again. */
const AUTH_ONLY = ["/sign-in", "/join"];

/**
 * Refreshes the Supabase session on every request and redirects where the
 * session says it must.
 *
 * The `?next=` parameter is preserved through the whole round trip. A member
 * who taps an event link in WhatsApp, signs in, and lands on a dashboard has
 * had their journey broken - the budget is two taps to the event itself
 * (design plan section 1.1), and that only works if the destination survives.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getEnv();
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser, not getSession: it revalidates the token with Supabase rather
  // than trusting a cookie the browser handed us.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/me";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
