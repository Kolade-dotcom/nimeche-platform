import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

/**
 * Development seed. Everyone here is a deliberately generic placeholder, so a
 * development database can never be mistaken for real member records, and the
 * password is printed rather than guessed at.
 */
const DEV_PASSWORD = "nimeche-dev";

async function main() {
  const passwordHash = await hashPassword(DEV_PASSWORD);

  const members = [
    {
      email: "jane.doe@tech-u.edu.ng",
      fullName: "Jane Doe",
      department: "MECHANICAL" as const,
      level: 200,
      matricNo: "125/25/2/0174",
      status: "PENDING" as const,
    },
    {
      email: "akolade.salako@tech-u.edu.ng",
      fullName: "Akolade Salako",
      department: "MECHANICAL" as const,
      level: 400,
      matricNo: "125/23/1/0142",
      status: "ACTIVE" as const,
    },
  ];

  for (const member of members) {
    await prisma.member.upsert({
      where: { email: member.email },
      update: {},
      create: { ...member, passwordHash, emailVerifiedAt: new Date() },
    });
  }

  console.log(
    `Seeded ${members.length} members. Sign in as any of them with the password: ${DEV_PASSWORD}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
