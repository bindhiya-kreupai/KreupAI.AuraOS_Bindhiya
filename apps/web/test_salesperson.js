const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

async function test() {
  try {
    const data = {
      salesPersonId: `SP-${Date.now()}`,
      name: 'Test Sales Person',
      email: 'test@example.com',
      department: 'sales',
      baseSalary: 0,
      commissionRate: 0,
      status: 'active',
      performance: {
        ytdSales: 0,
        ytdCommissions: 0,
        ytdUnits: 0,
        mtdSales: 0,
        mtdCommissions: 0,
        mtdUnits: 0,
        averageDealSize: 0,
        closingRate: 0,
        customerSatisfactionScore: 0,
        lastReviewDate: new Date().toISOString(),
      },
    };

    console.log('Attempting to create:', data);
    const salesPerson = await prisma.salesPerson.create({ data });
    console.log('Success:', salesPerson);
    
    await prisma.salesPerson.delete({ where: { id: salesPerson.id } });
    console.log('Cleaned up');
  } catch (error) {
    console.error('Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
