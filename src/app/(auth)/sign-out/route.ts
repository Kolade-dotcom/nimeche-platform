import { signOut } from "@/auth";

/** POST only: a GET would let any image tag on any page sign a member out. */
export async function POST() {
  await signOut({ redirectTo: "/" });
}
