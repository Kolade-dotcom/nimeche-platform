import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Development seed. Everyone here is a deliberately generic placeholder, so a
 * development database can never be mistaken for real member records.
 */
async function main() {
  await prisma.member.upsert({
    where: { email: "jane.doe@tech-u.edu.ng" },
    update: {},
    create: {
      email: "jane.doe@tech-u.edu.ng",
      fullName: "Jane Doe",
      department: "MECHANICAL",
      level: 400,
      status: "ACTIVE",
    },
  });
  console.log("Seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
