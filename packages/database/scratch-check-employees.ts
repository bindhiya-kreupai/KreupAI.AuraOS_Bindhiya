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
  const result = await prisma.gosiEmployeeRegistration.deleteMany({
    where: {
      employeeId: 'abc',
    },
  });
  console.log('Deleted registrations count:', result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
