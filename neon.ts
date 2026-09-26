import { defineConfig } from "@neon/config/v1";

/**
 * The Neon project's own configuration, as code.
 *
 * This is not where the application schema lives. Tables, columns and indexes
 * are Prisma's - `prisma/schema.prisma`, applied with `npm run db:push` or a
 * migration. This file declares the Neon *project*: which of Neon's services
 * are switched on, and how branches behave.
 *
 * Applied with:
 *   neon config plan     preview the difference
 *   neon config apply    apply it
 *   neon deploy          apply it and pull the branch's connection strings
 *
 * `neon deploy` writes the pulled values into `.env`. Next.js, prisma.config.ts
 * and prisma/seed.ts all read `.env.local` first and `.env` second, so a
 * `.env.local` left over from local development silently wins over anything
 * pulled here. Delete it, or move the pulled values across.
 */
export default defineConfig({
  // Neon Auth is off: this project authenticates with Auth.js v5 against the
  // Member table, because membership is not the same thing as an account and
  // an executive approves the second before the first means anything
  // (dev plan section 5). Turning this on would give us a second, competing
  // source of identity.
  auth: false,

  branch: (branch) => {
    // The default branch is the one the deployed site reads. It takes the
    // project's own settings, with nothing overridden here.
    if (branch.isDefault) return {};

    // A branch made for a piece of work - `neon checkout <name>` - expires by
    // itself. A student branch pays for what it leaves running, and a database
    // per pull request is exactly the kind of thing nobody remembers to delete.
    if (!branch.exists) return { ttl: "7d" };

    return {};
  },
});
