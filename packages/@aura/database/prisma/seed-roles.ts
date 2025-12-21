import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for Roles and Permissions
 * Run with: npx ts-node prisma/seed-roles.ts
 */

// System-wide roles (no tenantId)
const SYSTEM_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full system access across all tenants',
    isSystem: true,
  },
];

// Tenant-specific roles (will be created for each tenant)
const TENANT_ROLES = [
  {
    code: 'ADMIN',
    name: 'Administrator',
    description: 'Full tenant administration access',
    isSystem: true,
  },
  {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    description: 'Human Resources management access',
    isSystem: true,
  },
  {
    code: 'MANAGER',
    name: 'Manager',
    description: 'Team and department management access',
    isSystem: false,
  },
  {
    code: 'EMPLOYEE',
    name: 'Employee',
    description: 'Basic employee self-service access',
    isSystem: true,
  },
];

// All available permissions in the system
const PERMISSIONS = [
  // User Management
  { resource: 'users', action: 'create', description: 'Create new users' },
  { resource: 'users', action: 'read', description: 'View users' },
  { resource: 'users', action: 'update', description: 'Update users' },
  { resource: 'users', action: 'delete', description: 'Delete users' },
  { resource: 'users', action: 'manage', description: 'Full user management' },

  // Role Management
  { resource: 'roles', action: 'create', description: 'Create roles' },
  { resource: 'roles', action: 'read', description: 'View roles' },
  { resource: 'roles', action: 'update', description: 'Update roles' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },
  { resource: 'roles', action: 'manage', description: 'Full role management' },

  // Session Management
  { resource: 'sessions', action: 'read', description: 'View sessions' },
  { resource: 'sessions', action: 'delete', description: 'Revoke sessions' },
  { resource: 'sessions', action: 'manage', description: 'Full session management' },

  // Employee Management
  { resource: 'employees', action: 'create', description: 'Create employees' },
  { resource: 'employees', action: 'read', description: 'View employees' },
  { resource: 'employees', action: 'update', description: 'Update employees' },
  { resource: 'employees', action: 'delete', description: 'Delete employees' },
  { resource: 'employees', action: 'manage', description: 'Full employee management' },

  // Department Management
  { resource: 'departments', action: 'create', description: 'Create departments' },
  { resource: 'departments', action: 'read', description: 'View departments' },
  { resource: 'departments', action: 'update', description: 'Update departments' },
  { resource: 'departments', action: 'delete', description: 'Delete departments' },
  { resource: 'departments', action: 'manage', description: 'Full department management' },

  // Competency Library
  { resource: 'competencies', action: 'create', description: 'Create competencies' },
  { resource: 'competencies', action: 'read', description: 'View competencies' },
  { resource: 'competencies', action: 'update', description: 'Update competencies' },
  { resource: 'competencies', action: 'delete', description: 'Delete competencies' },
  { resource: 'competencies', action: 'manage', description: 'Full competency management' },

  // System Settings
  { resource: 'system_settings', action: 'read', description: 'View system settings' },
  { resource: 'system_settings', action: 'update', description: 'Update system settings' },
  { resource: 'system_settings', action: 'manage', description: 'Full system settings management' },

  // Audit Logs
  { resource: 'audit_logs', action: 'read', description: 'View audit logs' },
  { resource: 'audit_logs', action: 'export', description: 'Export audit logs' },

  // Master Data
  { resource: 'master_data', action: 'create', description: 'Create master data' },
  { resource: 'master_data', action: 'read', description: 'View master data' },
  { resource: 'master_data', action: 'update', description: 'Update master data' },
  { resource: 'master_data', action: 'delete', description: 'Delete master data' },
  { resource: 'master_data', action: 'manage', description: 'Full master data management' },
];

// Role-Permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'users:manage',
    'roles:manage',
    'sessions:manage',
    'employees:manage',
    'departments:manage',
    'competencies:manage',
    'system_settings:manage',
    'audit_logs:read',
    'audit_logs:export',
    'master_data:manage',
  ],
  ADMIN: [
    'users:create', 'users:read', 'users:update', 'users:delete',
    'roles:read',
    'sessions:read', 'sessions:delete',
    'employees:manage',
    'departments:manage',
    'competencies:manage',
    'audit_logs:read',
    'master_data:read', 'master_data:create', 'master_data:update',
  ],
  HR_MANAGER: [
    'users:read',
    'employees:create', 'employees:read', 'employees:update',
    'departments:read',
    'competencies:read', 'competencies:create', 'competencies:update',
    'master_data:read',
  ],
  MANAGER: [
    'employees:read',
    'departments:read',
    'competencies:read',
  ],
  EMPLOYEE: [
    'employees:read', // Can only read own employee data
    'competencies:read',
  ],
};

async function main() {
  console.log('🌱 Seeding roles and permissions...');

  // 1. Create all permissions
  console.log('\n📝 Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {
        description: perm.description,
      },
      create: perm,
    });
  }
  console.log(`✅ Created/updated ${PERMISSIONS.length} permissions`);

  // 2. Create system-wide roles (no tenant)
  console.log('\n👑 Creating system-wide roles...');
  for (const roleData of SYSTEM_ROLES) {
    const role = await prisma.role.upsert({
      where: {
        tenantId_code: {
          tenantId: null,
          code: roleData.code,
        },
      },
      update: {
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
      create: {
        ...roleData,
        tenantId: null,
      },
    });

    // Assign permissions to role
    const permissionCodes = ROLE_PERMISSIONS[roleData.code] || [];
    for (const permCode of permissionCodes) {
      const [resource, action] = permCode.split(':');
      const permission = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`✅ Created role: ${roleData.name} with ${permissionCodes.length} permissions`);
  }

  // 3. Create tenant-specific roles for all existing tenants
  console.log('\n🏢 Creating tenant-specific roles...');
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    console.log(`\n  Processing tenant: ${tenant.name}`);

    for (const roleData of TENANT_ROLES) {
      const role = await prisma.role.upsert({
        where: {
          tenantId_code: {
            tenantId: tenant.id,
            code: roleData.code,
          },
        },
        update: {
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
        },
        create: {
          ...roleData,
          tenantId: tenant.id,
        },
      });

      // Assign permissions to role
      const permissionCodes = ROLE_PERMISSIONS[roleData.code] || [];
      for (const permCode of permissionCodes) {
        const [resource, action] = permCode.split(':');
        const permission = await prisma.permission.findUnique({
          where: { resource_action: { resource, action } },
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }

      console.log(`  ✅ Created role: ${roleData.name}`);
    }
  }

  console.log('\n\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  const roleCount = await prisma.role.count();
  const permissionCount = await prisma.permission.count();
  const rolePermCount = await prisma.rolePermission.count();

  console.log(`  - Roles: ${roleCount}`);
  console.log(`  - Permissions: ${permissionCount}`);
  console.log(`  - Role-Permission assignments: ${rolePermCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
