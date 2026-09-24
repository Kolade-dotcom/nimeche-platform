import { z } from "zod";

/**
 * Environment variables, validated once and cached.
 *
 * Validation is lazy on purpose. Throwing at module load would fail
 * `next build` on a machine that has no keys yet - including CI, which has no
 * business holding Supabase credentials just to typecheck a page. Instead the
 * first code path that actually needs a variable gets a readable error naming
 * what is missing, rather than "undefined is not a string" three frames deep.
 *
 * Secrets live in environment variables only (dev plan section 9). Anything
 * prefixed NEXT_PUBLIC_ is compiled into the browser bundle and is therefore
 * public by definition - the service-role key must never be one.
 */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  // Written out rather than passing `process.env`, because Next.js inlines
  // NEXT_PUBLIC_* by matching this exact expression at build time.
  const result = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!result.success) {
    const missing = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(
      `Missing or invalid environment variables: ${missing}. ` +
        `Copy .env.example to .env.local and fill it in from your Supabase dashboard.`
    );
  }

  cached = result.data;
  return cached;
}

/** The public site origin, with no trailing slash, for building absolute URLs. */
export function siteUrl(path = ""): string {
  const base = getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
}
