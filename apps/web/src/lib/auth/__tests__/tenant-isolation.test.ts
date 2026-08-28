import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateTenantAccess,
  enforceAutomaticTenantIsolation,
  withTenantScope,
  CrossTenantAccessError,
} from '../tenant-isolation';
import { withEnhancedAuth } from '../enhanced-middleware';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('../middleware', () => ({
  authenticate: async (req: any) => ({
    user: { userId: 'user-tenant-a', tenantId: 'tenant-A', role: 'EMPLOYEE' },
    error: null,
  }),
}));

vi.mock('@aura/database', () => ({
  prisma: {
    user: {
      findUnique: async () => ({
        id: 'user-tenant-a',
        email: 'userA@tenantA.com',
        tenantId: 'tenant-A',
        roles: [],
      }),
    },
  },
}));

describe('AOS-SEC-011 — Automatic Tenant Isolation Enforcement Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTenantAccess', () => {
    it('allows access when user tenant matches target tenant', () => {
      expect(() => validateTenantAccess('tenant-A', 'tenant-A')).not.toThrow();
    });

    it('throws CrossTenantAccessError when user tenant does not match target tenant', () => {
      expect(() => validateTenantAccess('tenant-A', 'tenant-B')).toThrow(CrossTenantAccessError);
    });

    it('allows access for super admins regardless of target tenant', () => {
      expect(() => validateTenantAccess('tenant-A', 'tenant-B', true)).not.toThrow();
    });
  });

  describe('enforceAutomaticTenantIsolation', () => {
    it('blocks request when tenantId query param targets a different tenant', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/employees?tenantId=tenant-B');
      expect(() => enforceAutomaticTenantIsolation(req, 'tenant-A')).toThrow(
        CrossTenantAccessError
      );
    });

    it('blocks request when x-tenant-id header targets a different tenant', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/employees', {
        headers: { 'x-tenant-id': 'tenant-B' },
      });
      expect(() => enforceAutomaticTenantIsolation(req, 'tenant-A')).toThrow(
        CrossTenantAccessError
      );
    });

    it('allows request when parameters match authenticated user tenant', () => {
      const req = new NextRequest('http://localhost:3000/api/v1/employees?tenantId=tenant-A', {
        headers: { 'x-tenant-id': 'tenant-A' },
      });
      expect(() => enforceAutomaticTenantIsolation(req, 'tenant-A')).not.toThrow();
    });
  });

  describe('withTenantScope', () => {
    it('automatically injects tenantId into query where clause', () => {
      const query = withTenantScope({ status: 'ACTIVE' }, 'tenant-A');
      expect(query).toEqual({ status: 'ACTIVE', tenantId: 'tenant-A' });
    });

    it('throws CrossTenantAccessError if existing filter contains mismatched tenantId', () => {
      expect(() => withTenantScope({ tenantId: 'tenant-B' }, 'tenant-A')).toThrow(
        CrossTenantAccessError
      );
    });
  });

  describe('Integration: withEnhancedAuth automatic tenant isolation wrapper', () => {
    it('returns HTTP 403 Forbidden when an authenticated request targets tenant B data', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true, data: [] }));
      const wrappedHandler = withEnhancedAuth(handler);

      // Authenticated user belongs to Tenant A, but request targets Tenant B
      const req = new NextRequest('http://localhost:3000/api/v1/employees?tenantId=tenant-B');
      const res = await wrappedHandler(req, {} as any);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.code).toBe('E4031');
      expect(json.error).toContain('Automatic tenant isolation blocked cross-tenant request');
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
