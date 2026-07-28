const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const count = await prisma.user.count();
    console.log(`Total users: ${count}`);
    if (count > 0) {
      const user = await prisma.user.findFirst();
      console.log('Sample user email:', user.email);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
