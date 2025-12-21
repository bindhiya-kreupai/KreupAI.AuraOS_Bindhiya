import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import {
  createTestTenant,
  createTestUser,
  createTestRole,
  assignRoleToUser,
  cleanupTestData,
  TestTenant,
  TestUser,
} from '../helpers/test-utils';

/**
 * Tenant Isolation Security Tests
 *
 * These tests verify that tenant isolation is properly enforced across all services.
 * Users in one tenant should never be able to access or modify data from another tenant.
 */

describe('Tenant Isolation Security Tests', () => {
  let tenant1: TestTenant;
  let tenant2: TestTenant;
  let user1Tenant1: TestUser;
  let user2Tenant1: TestUser;
  let user1Tenant2: TestUser;

  beforeEach(async () => {
    // Clean up before each test
    await cleanupTestData();

    // Create two separate tenants
    tenant1 = await createTestTenant('Tenant One', 'TENANT_ONE');
    tenant2 = await createTestTenant('Tenant Two', 'TENANT_TWO');

    // Create users in tenant 1
    user1Tenant1 = await createTestUser('user1@tenant1.com', 'Pass123!@#', tenant1.id);
    user2Tenant1 = await createTestUser('user2@tenant1.com', 'Pass123!@#', tenant1.id);

    // Create user in tenant 2
    user1Tenant2 = await createTestUser('user1@tenant2.com', 'Pass123!@#', tenant2.id);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('User Service Tenant Isolation', () => {
    it('should not allow user from tenant1 to access user from tenant2', async () => {
      // Try to get user from tenant2 using tenant1 context
      const result = await userService.getUserById(user1Tenant2.id, tenant1.id);

      expect(result).toBeNull();
    });

    it('should allow user to access other users in same tenant', async () => {
      // User1 from tenant1 accessing user2 from tenant1
      const result = await userService.getUserById(user2Tenant1.id, tenant1.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(user2Tenant1.id);
      expect(result?.tenantId).toBe(tenant1.id);
    });

    it('should not list users from other tenants', async () => {
      // Get users for tenant1
      const result1 = await userService.listUsers({ tenantId: tenant1.id });

      expect(result1.users).toHaveLength(2);
      expect(result1.users.every((u) => u.id === user1Tenant1.id || u.id === user2Tenant1.id)).toBe(true);

      // Get users for tenant2
      const result2 = await userService.listUsers({ tenantId: tenant2.id });

      expect(result2.users).toHaveLength(1);
      expect(result2.users[0].id).toBe(user1Tenant2.id);
    });

    it('should not allow updating user from different tenant', async () => {
      // Try to update tenant2 user using tenant1 context
      const result = await userService.updateUser(
        user1Tenant2.id,
        { email: 'hacked@tenant1.com' },
        user1Tenant1.id,
        tenant1.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not allow deleting user from different tenant', async () => {
      // Try to delete tenant2 user using tenant1 context
      const result = await userService.deleteUser(
        user1Tenant2.id,
        user1Tenant1.id,
        tenant1.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not allow changing status of user from different tenant', async () => {
      // Try to change status of tenant2 user using tenant1 context
      const result = await userService.setUserStatus(
        user1Tenant2.id,
        'Inactive',
        user1Tenant1.id,
        tenant1.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Role Service Tenant Isolation', () => {
    it('should not allow assigning tenant-specific role to user from different tenant', async () => {
      // Create role in tenant1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);

      // Try to assign tenant1 role to tenant2 user
      const result = await roleService.assignRole(
        {
          userId: user1Tenant2.id,
          roleId: role1.id,
          tenantId: tenant1.id,
          assignedBy: user1Tenant1.id,
        },
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should allow accessing system roles from any tenant', async () => {
      // Create system role (tenantId: null)
      const systemRole = await createTestRole('SYSTEM_ROLE', 'System Role', null);

      // Should be accessible from tenant1
      const result1 = await roleService.getRoleById(systemRole.id, tenant1.id);
      expect(result1).not.toBeNull();
      expect(result1?.id).toBe(systemRole.id);

      // Should be accessible from tenant2
      const result2 = await roleService.getRoleById(systemRole.id, tenant2.id);
      expect(result2).not.toBeNull();
      expect(result2?.id).toBe(systemRole.id);
    });

    it('should not allow accessing tenant-specific role from different tenant', async () => {
      // Create role in tenant1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);

      // Try to access from tenant2
      const result = await roleService.getRoleById(role1.id, tenant2.id);

      expect(result).toBeNull();
    });

    it('should not list roles from other tenants', async () => {
      // Create roles for each tenant
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);
      const role2 = await createTestRole('ROLE_T2', 'Role Tenant 2', tenant2.id);
      const systemRole = await createTestRole('SYSTEM_ROLE', 'System Role', null);

      // List roles for tenant1 (should include system and tenant1 roles)
      const result1 = await roleService.listRoles({
        tenantId: tenant1.id,
        includeSystem: true,
      });

      const roleIds1 = result1.roles.map((r) => r.id);
      expect(roleIds1).toContain(role1.id);
      expect(roleIds1).toContain(systemRole.id);
      expect(roleIds1).not.toContain(role2.id);

      // List roles for tenant2 (should include system and tenant2 roles)
      const result2 = await roleService.listRoles({
        tenantId: tenant2.id,
        includeSystem: true,
      });

      const roleIds2 = result2.roles.map((r) => r.id);
      expect(roleIds2).toContain(role2.id);
      expect(roleIds2).toContain(systemRole.id);
      expect(roleIds2).not.toContain(role1.id);
    });

    it('should not allow updating role from different tenant', async () => {
      // Create role in tenant1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);

      // Try to update using tenant2 context
      const result = await roleService.updateRole(
        role1.id,
        { name: 'Hacked Role' },
        user1Tenant2.id,
        tenant2.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not allow deleting role from different tenant', async () => {
      // Create role in tenant1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);

      // Try to delete using tenant2 context
      const result = await roleService.deleteRole(
        role1.id,
        user1Tenant2.id,
        tenant2.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not allow revoking role assignment from different tenant', async () => {
      // Create role in tenant1 and assign to user1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);
      await assignRoleToUser(user1Tenant1.id, role1.id, tenant1.id);

      // Try to revoke using tenant2 context
      const result = await roleService.revokeRole(
        user1Tenant1.id,
        role1.id,
        user1Tenant2.id,
        tenant2.id,
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should not return user roles from different tenant', async () => {
      // Create role in tenant1 and assign to user1
      const role1 = await createTestRole('ROLE_T1', 'Role Tenant 1', tenant1.id);
      await assignRoleToUser(user1Tenant1.id, role1.id, tenant1.id);

      // Try to get user roles using tenant2 context
      const result = await roleService.getUserRoles(user1Tenant1.id, tenant2.id);

      expect(result).toHaveLength(0);
    });
  });

  describe('Cross-Tenant Data Leakage Prevention', () => {
    it('should not leak user count from other tenants', async () => {
      const stats1 = await userService.getUserStats(tenant1.id);
      const stats2 = await userService.getUserStats(tenant2.id);

      expect(stats1.total).toBe(2); // Only tenant1 users
      expect(stats2.total).toBe(1); // Only tenant2 user
    });

    it('should not leak role count from other tenants', async () => {
      // Create roles for each tenant
      await createTestRole('ROLE_T1_A', 'Role A', tenant1.id);
      await createTestRole('ROLE_T1_B', 'Role B', tenant1.id);
      await createTestRole('ROLE_T2_A', 'Role A', tenant2.id);

      const stats1 = await roleService.getRoleStats(tenant1.id);
      const stats2 = await roleService.getRoleStats(tenant2.id);

      // Custom roles should only count tenant-specific roles
      expect(stats1.customRoles).toBeGreaterThanOrEqual(2);
      expect(stats2.customRoles).toBeGreaterThanOrEqual(1);
    });

    it('should not allow email enumeration across tenants', async () => {
      // User with same email in different tenants should be treated as different users
      const email = 'same@email.com';

      await createTestUser(email, 'Pass1!', tenant1.id);
      await createTestUser(email, 'Pass2!', tenant2.id);

      // Get user by email in tenant1
      const user1 = await userService.getUserByEmail(email, tenant1.id);
      expect(user1).not.toBeNull();
      expect(user1?.tenantId).toBe(tenant1.id);

      // Get user by email in tenant2
      const user2 = await userService.getUserByEmail(email, tenant2.id);
      expect(user2).not.toBeNull();
      expect(user2?.tenantId).toBe(tenant2.id);

      // Should be different users
      expect(user1?.id).not.toBe(user2?.id);
    });
  });

  describe('Tenant Boundary Enforcement', () => {
    it('should enforce tenant boundary on user search', async () => {
      // Create users with searchable names
      await createTestUser('alice@tenant1.com', 'Pass123!', tenant1.id);
      await createTestUser('alice@tenant2.com', 'Pass123!', tenant2.id);

      // Search in tenant1
      const result1 = await userService.listUsers({
        tenantId: tenant1.id,
        search: 'alice',
      });

      expect(result1.users.every((u) => u.tenantId === tenant1.id)).toBe(true);
      expect(result1.users.some((u) => u.email === 'alice@tenant1.com')).toBe(true);
      expect(result1.users.some((u) => u.email === 'alice@tenant2.com')).toBe(false);
    });

    it('should enforce tenant boundary on role search', async () => {
      // Create roles with similar names
      await createTestRole('ADMIN', 'Admin Role', tenant1.id);
      await createTestRole('ADMIN', 'Admin Role', tenant2.id);

      // Search in tenant1
      const result1 = await roleService.listRoles({
        tenantId: tenant1.id,
        includeSystem: false,
        search: 'admin',
      });

      expect(result1.roles.every((r) => r.tenantId === tenant1.id)).toBe(true);
    });
  });
});
