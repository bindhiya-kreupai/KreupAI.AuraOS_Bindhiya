import { prisma } from '@aura/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Test Utilities
 *
 * Helper functions for setting up test data and cleaning up
 */

export interface TestTenant {
  id: string;
  name: string;
  code: string;
}

export interface TestUser {
  id: string;
  email: string;
  password: string; // Plain text for testing
  hashedPassword: string;
  tenantId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  mfaEnabled: boolean;
}

export interface TestRole {
  id: string;
  code: string;
  name: string;
  tenantId: string | null;
}

/**
 * Create a test tenant
 */
export async function createTestTenant(
  name?: string,
  code?: string
): Promise<TestTenant> {
  const tenantCode = code || `TEST_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const tenantName = name || `Test Tenant ${tenantCode}`;

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      code: tenantCode,
      status: 'Active',
      subscriptionTier: 'Enterprise',
      maxUsers: 100,
    },
  });

  return {
    id: tenant.id,
    name: tenant.name,
    code: tenant.code,
  };
}

/**
 * Create a test user
 */
export async function createTestUser(
  email?: string,
  password?: string,
  tenantId?: string,
  options?: {
    status?: 'Active' | 'Inactive' | 'Suspended';
    mfaEnabled?: boolean;
    employeeId?: string;
  }
): Promise<TestUser> {
  const userEmail = email || `test-${crypto.randomBytes(4).toString('hex')}@test.com`;
  const userPassword = password || 'Test123!@#';
  const hashedPassword = await bcrypt.hash(userPassword, 10);

  let userTenantId = tenantId;
  if (!userTenantId) {
    const tenant = await createTestTenant();
    userTenantId = tenant.id;
  }

  const user = await prisma.user.create({
    data: {
      email: userEmail,
      password: hashedPassword,
      tenantId: userTenantId,
      status: options?.status || 'Active',
      mfaEnabled: options?.mfaEnabled || false,
      employeeId: options?.employeeId,
    },
  });

  return {
    id: user.id,
    email: user.email,
    password: userPassword,
    hashedPassword,
    tenantId: user.tenantId,
    status: user.status as 'Active' | 'Inactive' | 'Suspended',
    mfaEnabled: user.mfaEnabled,
  };
}

/**
 * Create a test role
 */
export async function createTestRole(
  code?: string,
  name?: string,
  tenantId?: string | null,
  permissionIds?: string[]
): Promise<TestRole> {
  const roleCode = code || `TEST_ROLE_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const roleName = name || `Test Role ${roleCode}`;

  const role = await prisma.role.create({
    data: {
      code: roleCode,
      name: roleName,
      tenantId: tenantId === undefined ? null : tenantId,
      isSystem: false,
      isActive: true,
      permissions: permissionIds
        ? {
            create: permissionIds.map((permId) => ({
              permissionId: permId,
            })),
          }
        : undefined,
    },
  });

  return {
    id: role.id,
    code: role.code,
    name: role.name,
    tenantId: role.tenantId,
  };
}

/**
 * Create a test permission
 */
export async function createTestPermission(
  resource: string,
  action: string,
  description?: string
) {
  // Check if permission already exists
  const existing = await prisma.permission.findUnique({
    where: {
      resource_action: {
        resource,
        action,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.permission.create({
    data: {
      resource,
      action,
      description,
    },
  });
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  roleId: string,
  tenantId: string,
  options?: {
    expiresAt?: Date;
    assignedBy?: string;
  }
) {
  return prisma.userRole.create({
    data: {
      userId,
      roleId,
      tenantId,
      assignedBy: options?.assignedBy,
      expiresAt: options?.expiresAt,
    },
  });
}

/**
 * Create a test user session
 */
export async function createTestSession(
  userId: string,
  ipAddress: string = '127.0.0.1',
  status: 'Active' | 'Revoked' | 'Expired' = 'Active'
) {
  return prisma.userSession.create({
    data: {
      userId,
      ipAddress,
      device: 'Test Device',
      browser: 'Test Browser',
      status,
    },
  });
}

/**
 * Clean up test data
 */
export async function cleanupTestData() {
  // Delete in order to respect foreign key constraints
  await prisma.auditLog.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.userMFA.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({ where: { isSystem: false } });
  await prisma.user.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.tenant.deleteMany({});
}

/**
 * Clean up test data for a specific tenant
 */
export async function cleanupTenantData(tenantId: string) {
  await prisma.auditLog.deleteMany({ where: { user: { tenantId } } });
  await prisma.loginAttempt.deleteMany({ where: { user: { tenantId } } });
  await prisma.passwordResetToken.deleteMany({ where: { user: { tenantId } } });
  await prisma.userMFA.deleteMany({ where: { user: { tenantId } } });
  await prisma.userSession.deleteMany({ where: { user: { tenantId } } });
  await prisma.userRole.deleteMany({ where: { tenantId } });
  await prisma.user.deleteMany({ where: { tenantId } });
  await prisma.tenant.delete({ where: { id: tenantId } });
}

/**
 * Wait for a specified time (useful for testing time-based features)
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random email
 */
export function randomEmail(): string {
  return `test-${crypto.randomBytes(8).toString('hex')}@test.com`;
}

/**
 * Generate a random password
 */
export function randomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
