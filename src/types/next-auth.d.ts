import type { DefaultSession } from "next-auth";

/**
 * The extra fields carried on the session, so `session.user.status` is typed
 * rather than `any` at every call site.
 */
declare module "next-auth" {
  interface User {
    fullName: string;
    status: string;
  }

  interface Session {
    user: {
      id: string;
      fullName: string;
      status: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberId: string;
    fullName: string;
    status: string;
  }
}
