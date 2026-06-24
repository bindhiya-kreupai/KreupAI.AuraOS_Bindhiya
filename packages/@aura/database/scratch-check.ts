import { PrismaClient } from '@prisma/client';
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
