import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const cred = await prisma.credential.findFirst({ select: { id: true, code: true } });
  if (!cred) throw new Error("no credential");
  console.log("Generating for", cred.code);
  const { generatePdf } = await import("./src/lib/certificates/pdf");
  const url = await generatePdf(cred.id);
  console.log("PDF URL:", url);
  process.exit(0);
}
main().catch((e) => { console.error("FAILED:", e); process.exit(1); });
