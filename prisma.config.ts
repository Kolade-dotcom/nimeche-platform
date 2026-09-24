import path from "node:path";

import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma stopped loading .env itself once a config file is present, so we do
// it here. Next.js reads .env.local first and .env second, and credentials
// belong in .env.local because that is the file .gitignore already covers -
// so the CLI has to look in the same order, or `npm run db:push` cannot find
// a connection string the app can.
loadEnv({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
