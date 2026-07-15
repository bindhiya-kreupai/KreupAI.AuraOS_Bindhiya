import fs from 'fs';
import path from 'path';

// Manually parse .env file
try {
  const envPath = path.resolve(__dirname, '../../.env');
  console.log('Resolving env path:', envPath, 'exists:', fs.existsSync(envPath));
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
  const allPerms = await prisma.permission.findMany();
  const permStrings = allPerms.map(p => `${p.resource}:${p.action}`).sort();
  console.log('--- ALL DB PERMISSIONS ---');
  permStrings.forEach(p => console.log(p));
}

main().catch(console.error).finally(() => prisma.$disconnect());
