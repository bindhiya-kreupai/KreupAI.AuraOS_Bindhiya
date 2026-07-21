import fs from 'fs';
import path from 'path';

// Manually parse .env file
try {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error('Failed to parse .env file:', e);
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Check EosbAccrual records
  const accruals = await prisma.eosbAccrual.findMany({
    where: {
      employeeId: {
        in: ['emp1', 'emp2']
      }
    }
  });

  console.log('--- ACCRUALS FOUND ---');
  console.log(accruals);

  // 2. Delete EosbAccrual records
  if (accruals.length > 0) {
    const deleteResult = await prisma.eosbAccrual.deleteMany({
      where: {
        employeeId: {
          in: ['emp1', 'emp2']
        }
      }
    });
    console.log(`Deleted ${deleteResult.count} accrual records.`);
  } else {
    console.log('No accrual records found to delete.');
  }

  // 3. Verify if emp1 / emp2 are actual employee records
  const employees = await prisma.employee.findMany({
    where: {
      id: { in: ['emp1', 'emp2'] }
    }
  });
  console.log('\n--- ACTUAL EMPLOYEES BY ID ---');
  console.log(employees);

  const employeesByCode = await prisma.employee.findMany({
    where: {
      employeeCode: { in: ['emp1', 'emp2'] }
    }
  });
  console.log('\n--- ACTUAL EMPLOYEES BY CODE ---');
  console.log(employeesByCode);
}

main().catch(console.error).finally(() => prisma.$disconnect());
