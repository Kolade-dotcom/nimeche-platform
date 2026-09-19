import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/** Supabase in the browser. Reads and writes are governed by row-level security. */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
