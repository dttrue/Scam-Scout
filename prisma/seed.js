const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "testuser@example.com",
      tier: "free",
    },
  });

  await prisma.user.create({
    data: {
      email: "paiduser@example.com",
      tier: "paid",
    },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
