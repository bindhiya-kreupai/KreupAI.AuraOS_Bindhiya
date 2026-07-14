const fs = require('fs');
const path = require('path');

// Manually parse .env file
try {
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
  }
} catch (e) {
  console.error('Failed to parse .env file:', e);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newResources = ['compensation'];
  const actions = ['create', 'read', 'update', 'delete', 'manage'];

  console.log('Inserting missing compensation permissions...');
  const createdPermissions = [];

  for (const resource of newResources) {
    for (const action of actions) {
      let perm = await prisma.permission.findFirst({
        where: { resource, action },
      });
      if (!perm) {
        perm = await prisma.permission.create({
          data: {
            resource,
            action,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          },
        });
        console.log(`Created permission: ${resource}:${action}`);
      } else {
        console.log(`Permission already exists: ${resource}:${action}`);
      }
      createdPermissions.push(perm);
    }
  }

  console.log('\nLinking permissions to roles...');
  const roles = await prisma.role.findMany();

  const roleActionMap = {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    HR_MANAGER: ['create', 'read', 'update', 'delete'],
    MANAGER: ['read', 'update'],
    EMPLOYEE: ['read'],
  };

  let linkCount = 0;
  for (const role of roles) {
    const allowedActions = roleActionMap[role.code] ?? ['read'];
    for (const perm of createdPermissions) {
      if (!allowedActions.includes(perm.action)) continue;
      
      const existing = await prisma.rolePermission.findFirst({
        where: { roleId: role.id, permissionId: perm.id },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
        console.log(`Linked ${role.code} -> ${perm.resource}:${perm.action}`);
        linkCount++;
      }
    }
  }
  console.log(`\nLinked ${linkCount} role-permission mappings successfully!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
