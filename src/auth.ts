import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { verifyPassword, wastePasswordTime } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validation/auth";

/**
 * Thrown for every failed sign-in, whatever the cause.
 *
 * The member sees one message for a wrong password and for an address with no
 * account. Telling a stranger which it was hands them a way to find out who is
 * a member, and the friction of a slightly vaguer error is worth that.
 */
class BadCredentials extends CredentialsSignin {
  code = "credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },

      async authorize(raw) {
        const parsed = signInSchema.pick({ email: true, password: true }).safeParse(raw);

        if (!parsed.success) {
          await wastePasswordTime();
          throw new BadCredentials();
        }

        const member = await db.member.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            fullName: true,
            status: true,
            passwordHash: true,
            emailVerifiedAt: true,
          },
        });

        if (!member) {
          // Same wall-clock cost as a real comparison, so the absence of an
          // account is not detectable by timing it.
          await wastePasswordTime();
          throw new BadCredentials();
        }

        const ok = await verifyPassword(parsed.data.password, member.passwordHash);
        if (!ok) throw new BadCredentials();

        return {
          id: member.id,
          email: member.email,
          fullName: member.fullName,
          status: member.status,
        };
      },
    }),
  ],
  callbacks: {
    // Re-include the edge-safe callbacks from authConfig verbatim so the proxy
    // and the Node handler stay in sync.
    authorized: authConfig.callbacks!.authorized,
    session: authConfig.callbacks!.session,

    /**
     * Extends the base jwt callback from authConfig to also check whether the
     * signing-in member holds EXECUTIVE or ADMIN role. Done here (not in
     * auth.config.ts) because the role check needs Prisma, which cannot run
     * on the edge.
     */
    async jwt(params) {
      // Run the base implementation first: copies memberId, status, fullName.
      const token = (await authConfig.callbacks!.jwt!(params)) ?? params.token;

      // Only query on sign-in (when `user` is present). On subsequent
      // requests the token already carries isAdmin from the initial sign-in.
      if (params.user && token.memberId) {
        try {
          const adminRole = await db.memberRole.findFirst({
            where: {
              memberId: token.memberId as string,
              role: { key: { in: ["EXECUTIVE", "ADMIN"] } },
            },
          });
          token.isAdmin = adminRole !== null;
        } catch {
          // Role query must not break sign-in if it fails.
          token.isAdmin = false;
        }
      }

      return token;
    },
  },
});
