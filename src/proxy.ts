import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Next.js 16 renamed the middleware convention to `proxy`. This runs before
 * every matched request and applies the `authorized` callback in
 * `auth.config.ts`: signed-out visitors asking for /me or /admin are sent to
 * sign-in with a callbackUrl, signed-in members are kept off the auth screens.
 *
 * It uses the edge-safe half of the config only - no Prisma, no bcrypt.
 *
 * Exported as a plain function rather than `export const { auth: proxy }`,
 * because Next.js checks for a function export statically and a destructured
 * binding does not satisfy it.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Everything except the auth endpoints, static assets and image files. The
     * session has to be checked on real page requests, not on every logo fetch.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
