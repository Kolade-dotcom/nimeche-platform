import { config as loadEnv } from "dotenv";
import { PrismaClient, type RoleKey } from "@prisma/client";

// Load the same local environment files as Next.js and prisma.config.ts.
loadEnv({ path: [".env.local", ".env"], quiet: true });

const prisma = new PrismaClient();

/** Reference vocabulary, not example member activity or platform records. */
const SKILLS = [
  { slug: "cad-modelling", name: "CAD modelling" },
  { slug: "workshop-safety", name: "Workshop safety" },
  { slug: "technical-drawing", name: "Technical drawing" },
  { slug: "design-for-manufacture", name: "Design for manufacture" },
  { slug: "risk-assessment", name: "Risk assessment" },
  { slug: "plant-operations", name: "Plant operations" },
  { slug: "materials-selection", name: "Materials selection" },
  { slug: "maintenance-practice", name: "Maintenance practice" },
];

const ROLES: { key: RoleKey; label: string }[] = [
  { key: "MEMBER", label: "Member" },
  { key: "EXECUTIVE", label: "Executive" },
  { key: "PRESIDENT", label: "President" },
  { key: "ADMIN", label: "Admin" },
  { key: "CONTENT_MANAGER", label: "Content manager" },
  { key: "PROJECT_LEAD", label: "Project lead" },
];

async function main() {
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name },
      create: skill,
    });
  }

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { label: role.label },
      create: role,
    });
  }

  console.log(`Seeded ${SKILLS.length} skills and ${ROLES.length} roles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
