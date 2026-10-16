import type { NextAuthConfig } from "next-auth";

/**
 * The edge-safe half of the Auth.js configuration.
 *
 * `proxy.ts` runs on the edge runtime, where Prisma and bcrypt cannot go. This
 * file therefore holds only what the middleware needs - the routing rules and
 * the JWT callbacks - and no provider, no database, no hashing. The full
 * config in `auth.ts` spreads this and adds the parts that need Node.
 *
 * This split is the documented Auth.js pattern, not a workaround.
 */

/** Routes a signed-out visitor may not reach. Everything else renders publicly. */
const PROTECTED = ["/me", "/exco", "/admin"];

/** Auth screens a signed-in member has no business seeing again. */
const AUTH_ONLY = ["/sign-in", "/join"];

export const authConfig = {
  // Auth.js refuses to build callback URLs from an untrusted Host header
  // unless told the deployment is behind a trusted proxy. Vercel sets this
  // implicitly; anywhere else - including `next start` locally - it has to be
  // explicit, or every call to /api/auth/session fails with UntrustedHost.
  trustHost: true,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    // JWT rather than database sessions: the Credentials provider only
    // supports JWT, and a long-lived cookie is what keeps a member signed in
    // between events (design plan section 1.1).
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  callbacks: {
    /**
     * Runs in the middleware on every matched request.
     *
     * - Signed-out visitors are sent to `pages.signIn` for protected routes.
     * - Signed-in members without the right role for /exco or /admin are
     *   redirected to /me, not back to sign-in.
     * - Signed-in members are kept off the auth screens.
     */
    authorized({ auth, request }) {
      const signedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      // Exco routes are for executives; Tech Admin routes require the ADMIN role.
      const isExcoRoute = pathname === "/exco" || pathname.startsWith("/exco/");
      const isTechAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
      if (isExcoRoute || isTechAdminRoute) {
        if (!signedIn) return false; // → sign-in
        // Old JWTs use the prior dashboard-wide executive claim. Permit those
        // to reach the server guard, which checks the member's current DB role.
        // The admin layout remains the authority for /admin access.
        const allowed = isTechAdminRoute
          ? auth?.user?.isTechAdmin === true || auth?.user?.isExecutive === true
          : auth?.user?.isExecutive === true;
        if (!allowed) {
          return Response.redirect(new URL("/me", request.nextUrl));
        }
        return true;
      }

      if (PROTECTED.some((p) => pathname.startsWith(p))) return signedIn;
      if (signedIn && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
        return Response.redirect(new URL("/me", request.nextUrl));
      }
      return true;
    },

    /** Copies the bits of the member we want readable without a query. */
    jwt({ token, user }) {
      if (user) {
        token.memberId = user.id;
        token.status = user.status;
        token.fullName = user.fullName;
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.memberId as string;
        session.user.status = token.status as string;
        session.user.fullName = token.fullName as string;
        session.user.isTechAdmin = (token.isTechAdmin as boolean) ?? false;
        // Older sessions used `isAdmin` to mean access to the Exco dashboard.
        // Keep that claim as a migration fallback for /exco only; /admin checks
        // the new, distinct `isTechAdmin` claim above.
        session.user.isExecutive =
          (token.isExecutive as boolean | undefined) ??
          (token.isAdmin as boolean | undefined) ??
          false;
      }
      return session;
    },
  },
  providers: [], // added in auth.ts - Credentials needs Prisma and bcrypt
} satisfies NextAuthConfig;
