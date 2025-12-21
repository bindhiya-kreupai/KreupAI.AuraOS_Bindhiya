/**
 * Tenant Isolation Middleware Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateTenantAccess,
  validateMultipleTenantAccess,
  addTenantFilter,
  canAccessCrossTenant,
  validateTenantAccessWithBypass,
} from './tenant-isolation';
import { TenantIsolationError } from '@/lib/errors';

describe('Tenant Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTenantAccess', () => {
    it('should allow access when tenant IDs match', () => {
      expect(() => {
        validateTenantAccess('tenant-1', 'tenant-1', 'User', 'user-123');
      }).not.toThrow();
    });

    it('should throw error when tenant IDs do not match', () => {
      expect(() => {
        validateTenantAccess('tenant-1', 'tenant-2', 'User', 'user-123');
      }).toThrow(TenantIsolationError);
    });

    it('should throw error when resource has no tenant ID', () => {
      expect(() => {
        validateTenantAccess(null, 'tenant-1', 'User', 'user-123');
      }).toThrow(TenantIsolationError);
    });

    it('should throw error when resource tenant ID is undefined', () => {
      expect(() => {
        validateTenantAccess(undefined, 'tenant-1', 'User', 'user-123');
      }).toThrow(TenantIsolationError);
    });

    it('should include resource details in error', () => {
      try {
        validateTenantAccess('tenant-1', 'tenant-2', 'User', 'user-123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantIsolationError);
        expect((error as TenantIsolationError).context).toMatchObject({
          resourceType: 'User',
          resourceId: 'user-123',
        });
      }
    });
  });

  describe('validateMultipleTenantAccess', () => {
    it('should allow when all resources belong to user tenant', () => {
      const resources = [
        { id: 'res-1', tenantId: 'tenant-1' },
        { id: 'res-2', tenantId: 'tenant-1' },
        { id: 'res-3', tenantId: 'tenant-1' },
      ];

      expect(() => {
        validateMultipleTenantAccess(resources, 'tenant-1', 'License');
      }).not.toThrow();
    });

    it('should throw when any resource belongs to different tenant', () => {
      const resources = [
        { id: 'res-1', tenantId: 'tenant-1' },
        { id: 'res-2', tenantId: 'tenant-2' }, // Different tenant
        { id: 'res-3', tenantId: 'tenant-1' },
      ];

      expect(() => {
        validateMultipleTenantAccess(resources, 'tenant-1', 'License');
      }).toThrow(TenantIsolationError);
    });

    it('should allow resources with no tenant ID', () => {
      const resources = [
        { id: 'res-1', tenantId: 'tenant-1' },
        { id: 'res-2', tenantId: null },
        { id: 'res-3', tenantId: undefined },
      ];

      expect(() => {
        validateMultipleTenantAccess(resources, 'tenant-1', 'License');
      }).not.toThrow();
    });

    it('should report correct violation count', () => {
      const resources = [
        { id: 'res-1', tenantId: 'tenant-2' },
        { id: 'res-2', tenantId: 'tenant-3' },
        { id: 'res-3', tenantId: 'tenant-1' },
      ];

      try {
        validateMultipleTenantAccess(resources, 'tenant-1', 'License');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantIsolationError);
        expect((error as TenantIsolationError).context).toMatchObject({
          violationCount: 2,
        });
      }
    });
  });

  describe('addTenantFilter', () => {
    it('should return tenant filter object', () => {
      const filter = addTenantFilter('tenant-123');

      expect(filter).toEqual({
        tenantId: 'tenant-123',
      });
    });

    it('should be usable in Prisma queries', () => {
      const tenantId = 'tenant-1';
      const filter = addTenantFilter(tenantId);

      // Simulate Prisma where clause
      const whereClause = {
        ...filter,
        status: 'Active',
      };

      expect(whereClause).toEqual({
        tenantId: 'tenant-1',
        status: 'Active',
      });
    });
  });

  describe('canAccessCrossTenant', () => {
    it('should return true for super admin', () => {
      const user = {
        userId: 'admin-1',
        roleId: 'role-super-admin',
        tenantId: 'tenant-1',
      };

      expect(canAccessCrossTenant(user)).toBe(true);
    });

    it('should return true for users with cross_tenant_access permission', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
        permissions: ['cross_tenant_access', 'read_users'],
      };

      expect(canAccessCrossTenant(user)).toBe(true);
    });

    it('should return false for regular users', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
        permissions: ['read_users', 'write_users'],
      };

      expect(canAccessCrossTenant(user)).toBe(false);
    });

    it('should return false for users without permissions array', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
      };

      expect(canAccessCrossTenant(user)).toBe(false);
    });
  });

  describe('validateTenantAccessWithBypass', () => {
    it('should allow super admin to access any tenant', () => {
      const user = {
        userId: 'admin-1',
        roleId: 'role-super-admin',
        tenantId: 'tenant-1',
      };

      expect(() => {
        validateTenantAccessWithBypass('tenant-2', user, 'User', 'user-123');
      }).not.toThrow();
    });

    it('should allow user with cross_tenant_access permission', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
        permissions: ['cross_tenant_access'],
      };

      expect(() => {
        validateTenantAccessWithBypass('tenant-2', user, 'User', 'user-123');
      }).not.toThrow();
    });

    it('should enforce tenant isolation for regular users', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
      };

      expect(() => {
        validateTenantAccessWithBypass('tenant-2', user, 'User', 'user-123');
      }).toThrow(TenantIsolationError);
    });

    it('should allow regular users to access their own tenant', () => {
      const user = {
        userId: 'user-1',
        roleId: 'role-user',
        tenantId: 'tenant-1',
      };

      expect(() => {
        validateTenantAccessWithBypass('tenant-1', user, 'User', 'user-123');
      }).not.toThrow();
    });
  });
});
