import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma stopped loading .env itself once a config file is present, so we do
// it here. Next.js loads its own .env for the app; this is only for the CLI.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
