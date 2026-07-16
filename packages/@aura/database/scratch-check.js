const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');
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
} else {
  console.error('.env not found at:', envPath);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@auraos.local' },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log('User admin@auraos.local not found');
    return;
  }

  console.log('User roles:');
  user.roles.forEach(ur => {
    console.log(`- Role: ${ur.role.code} (${ur.role.name}), Active: ${ur.role.isActive}`);
    console.log('  Permissions:');
    ur.role.permissions.forEach(rp => {
      console.log(`    * ${rp.permission.resource}:${rp.permission.action}`);
    });
  });

  const allPermissions = await prisma.permission.findMany();
  console.log('\nAll permissions in DB:', allPermissions.map(p => `${p.resource}:${p.action}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
