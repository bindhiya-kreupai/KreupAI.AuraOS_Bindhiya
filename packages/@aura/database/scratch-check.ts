import fs from 'fs';
import path from 'path';

// Manually parse .env file
try {
  const envPath = path.resolve(__dirname, '../../../.env');
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
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      roles: {
        select: {
          role: {
            select: {
              code: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      resource: true,
                      action: true,
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('--- USERS & ROLES ---');
  for (const u of users) {
    console.log(`User: ${u.email}`);
    for (const r of u.roles) {
      console.log(`  Role: ${r.role.code}`);
      const perms = r.role.permissions.map(p => `${p.permission.resource}:${p.permission.action}`);
      console.log(`    Permissions (${perms.length}): ${perms.slice(0, 10).join(', ')}...`);
    }
  }

  const allPerms = await prisma.permission.findMany();
  console.log('\n--- ALL DB PERMISSIONS ---');
  console.log(allPerms.map(p => `${p.resource}:${p.action}`).join(', '));
}

main().catch(console.error).finally(() => prisma.$disconnect());
