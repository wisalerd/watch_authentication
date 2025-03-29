const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config(); // โหลดตัวแปรจากไฟล์ .env

const prisma = new PrismaClient();

async function main() {
  const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;

  if (!adminWalletAddress) {
    console.error('ADMIN_WALLET_ADDRESS is not set in .env file');
    process.exit(1);
  }

  // Check Admin มีอยู่แล้วหรือไม่
  const adminExists = await prisma.user.findUnique({
    where: { walletAddress: adminWalletAddress },
  });

  if (!adminExists) {
    // Create Admin account.
    await prisma.user.create({
      data: {
        userName: 'Admin',
        walletAddress: adminWalletAddress,
        role: 'Admin',
        approve: true,
        createdAt: new Date(),
      },
    });
    console.log('Admin account created');
  } else {
    console.log('Admin account already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
