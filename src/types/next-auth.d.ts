import type { DefaultSession } from "next-auth";

/**
 * Extra session fields and dashboard role flags are typed instead of `any`.
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
      isTechAdmin: boolean;
      isExecutive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    memberId: string;
    fullName: string;
    status: string;
    isTechAdmin: boolean;
    isExecutive: boolean;
    /** Legacy dashboard claim retained only while existing JWTs expire. */
    isAdmin?: boolean;
  }
}
