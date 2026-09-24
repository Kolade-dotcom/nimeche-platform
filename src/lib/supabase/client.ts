import { createBrowserClient } from "@supabase/ssr";

import { getEnv } from "@/lib/env";

/** Supabase in the browser. Every read and write is governed by row-level security. */
export function createClient() {
  const env = getEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
