/**
 * Enhanced Authentication Middleware Tests
 *
 * Covers: authenticateWithPermissions, withEnhancedAuth
 * - JWT authentication flow
 * - Role and permission aggregation
 * - Rate limiting integration
 * - Response envelope normalization
 * - Auto-audit logging for mutations
 * - Bilingual error responses
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';

// Hoist mock references so they're available inside vi.mock factories
const { mockAuthenticate, mockRateLimiter } = vi.hoisted(() => ({
  mockAuthenticate: vi.fn(),
  mockRateLimiter: vi.fn(async (_request: any, handler: () => Promise<any>, _userId?: string) =>
    handler()
  ),
}));

vi.mock('@/lib/auth/middleware', () => ({
  authenticate: (...args: unknown[]) => mockAuthenticate(...args),
}));

vi.mock('@/lib/middleware/advanced-rate-limit', () => ({
  createRateLimit: () => mockRateLimiter,
  RateLimitPresets: {
    API_USER: {
      maxRequests: 100,
      windowSeconds: 60,
      identifier: 'api:user',
      useUserId: true,
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { authenticateWithPermissions, withEnhancedAuth } from '@/lib/auth/enhanced-middleware';

// ── Helpers ──────────────────────────────────────────────────────────

function createRequest(
  url = 'http://localhost:3006/api/v1/employees',
  method = 'GET',
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      Authorization: 'Bearer valid-token',
      ...headers,
    },
  });
}

const MOCK_JWT_PAYLOAD = {
  userId: 'user-1',
  email: 'test@example.com',
  tenantId: 'tenant-1',
  type: 'access' as const,
  sessionId: 'sess-1',
};

const MOCK_USER_WITH_ROLES = {
  id: 'user-1',
  email: 'test@example.com',
  tenantId: 'tenant-1',
  employee: { id: 'emp-1' },
  roles: [
    {
      role: {
        code: 'HR_MANAGER',
        name: 'HR Manager',
        isActive: true,
        permissions: [
          { permission: { resource: 'employees', action: 'read' } },
          { permission: { resource: 'employees', action: 'create' } },
          { permission: { resource: 'employees', action: 'update' } },
        ],
      },
    },
    {
      role: {
        code: 'EMPLOYEE',
        name: 'Employee',
        isActive: true,
        permissions: [
          { permission: { resource: 'employees', action: 'read' } },
          { permission: { resource: 'leave', action: 'create' } },
        ],
      },
    },
  ],
};

// ── authenticateWithPermissions ──────────────────────────────────────

describe('authenticateWithPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when base authentication fails', async () => {
    const errorResponse = NextResponse.json({ success: false, error: 'No token' }, { status: 401 });
    mockAuthenticate.mockResolvedValue({ user: null, error: errorResponse });

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context).toBeNull();
    expect(result.error).toBe(errorResponse);
  });

  it('should return context with roles and permissions on success', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER_WITH_ROLES);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.error).toBeNull();
    expect(result.context).not.toBeNull();
    expect(result.context!.user).toEqual(MOCK_JWT_PAYLOAD);
    expect(result.context!.roles).toContain('HR_MANAGER');
    expect(result.context!.roles).toContain('EMPLOYEE');
    expect(result.context!.employeeId).toBe('emp-1');
  });

  it('should de-duplicate permissions across roles', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER_WITH_ROLES);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    // 'employees:read' appears in both roles but should only be listed once
    const readPerms = result.context!.permissions.filter((p) => p === 'employees:read');
    expect(readPerms).toHaveLength(1);
    // Total unique: employees:read, employees:create, employees:update, leave:create = 4
    expect(result.context!.permissions).toHaveLength(4);
  });

  it('should filter out inactive roles', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });

    const userWithInactiveRole = {
      ...MOCK_USER_WITH_ROLES,
      roles: [
        ...MOCK_USER_WITH_ROLES.roles,
        {
          role: {
            code: 'ADMIN',
            name: 'Admin',
            isActive: false,
            permissions: [{ permission: { resource: 'system', action: 'admin' } }],
          },
        },
      ],
    };
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(userWithInactiveRole);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context!.roles).not.toContain('ADMIN');
    expect(result.context!.permissions).not.toContain('system:admin');
  });

  it('should default to EMPLOYEE role when user has no roles', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });

    const userWithNoRoles = {
      ...MOCK_USER_WITH_ROLES,
      roles: [],
    };
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(userWithNoRoles);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context!.roles).toEqual(['EMPLOYEE']);
    expect(result.context!.permissions).toHaveLength(0);
  });

  it('should return 401 when user is not found in database', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context).toBeNull();
    expect(result.error).not.toBeNull();

    const body = await result.error!.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('User not found');
    expect(result.error!.status).toBe(401);
  });

  it('should return 500 on database error', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('DB connection lost')
    );

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error!.status).toBe(500);
  });

  it('should handle user with no employee record', async () => {
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });

    const userWithoutEmployee = {
      ...MOCK_USER_WITH_ROLES,
      employee: null,
    };
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(userWithoutEmployee);

    const request = createRequest();
    const result = await authenticateWithPermissions(request);

    expect(result.context!.employeeId).toBeUndefined();
  });
});

// ── withEnhancedAuth ─────────────────────────────────────────────────

describe('withEnhancedAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: auth succeeds
    mockAuthenticate.mockResolvedValue({
      user: MOCK_JWT_PAYLOAD,
      error: null,
    });
    (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER_WITH_ROLES);
    // Default: rate limiter passes through
    mockRateLimiter.mockImplementation(
      async (_req: NextRequest, handler: () => Promise<Response>) => handler()
    );
  });

  describe('authentication', () => {
    it('should return 401 when authentication fails', async () => {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
      mockAuthenticate.mockResolvedValue({ user: null, error: errorResponse });

      const handler = vi.fn();
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      expect(handler).not.toHaveBeenCalled();
      expect(result).toBe(errorResponse);
    });

    it('should pass enhanced context to handler', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ items: [] }));
      const routeContext = { params: { id: '123' } };

      const wrapped = withEnhancedAuth(handler);
      await wrapped(createRequest(), routeContext);

      expect(handler).toHaveBeenCalledWith(
        expect.any(NextRequest),
        expect.objectContaining({
          params: { id: '123' },
          user: MOCK_JWT_PAYLOAD,
          roles: expect.arrayContaining(['HR_MANAGER', 'EMPLOYEE']),
          permissions: expect.arrayContaining(['employees:read']),
          employeeId: 'emp-1',
        })
      );
    });
  });

  describe('rate limiting', () => {
    it('should pass userId to rate limiter', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
      const wrapped = withEnhancedAuth(handler);

      await wrapped(createRequest(), {});

      expect(mockRateLimiter).toHaveBeenCalledWith(
        expect.any(NextRequest),
        expect.any(Function),
        'user-1'
      );
    });

    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new NextResponse(
        JSON.stringify({ success: false, error: 'Rate limited' }),
        { status: 429 }
      );
      mockRateLimiter.mockResolvedValue(rateLimitResponse);

      const handler = vi.fn();
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      expect(handler).not.toHaveBeenCalled();
      expect(result.status).toBe(429);
    });
  });

  describe('response envelope normalization', () => {
    it('should wrap raw JSON responses in standard envelope', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ items: [1, 2, 3] }));
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      const body = await result.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ items: [1, 2, 3] });
      expect(body.meta).toBeDefined();
      expect(body.meta.apiVersion).toBe('v1');
      expect(body.meta.timestamp).toBeDefined();
    });

    it('should pass through responses that already have success field', async () => {
      const handler = vi
        .fn()
        .mockResolvedValue(
          NextResponse.json({ success: true, data: { id: 1 }, meta: { page: 1 } })
        );
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      const body = await result.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: 1 });
      expect(body.meta).toEqual({ page: 1 });
    });

    it('should pass through non-JSON responses', async () => {
      const handler = vi.fn().mockResolvedValue(
        new Response('plain text', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        })
      );
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      const text = await result.text();
      expect(text).toBe('plain text');
    });

    it('should not wrap error responses (4xx/5xx)', async () => {
      const handler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ message: 'Not found' }, { status: 404 }));
      const wrapped = withEnhancedAuth(handler);
      const result = await wrapped(createRequest(), {});

      const body = await result.json();
      // 404 is outside 200-299 range, so envelope normalization should not apply
      expect(body.message).toBe('Not found');
      expect(body.success).toBeUndefined();
    });
  });

  describe('auto-audit logging', () => {
    it('should create audit log for POST requests', async () => {
      const createMock = vi.fn().mockResolvedValue({});
      (prisma.auditLog.create as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        catch: (_fn: (e: Error) => void) => createMock(),
      }));

      const handler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true, data: { id: 'new-1' } }));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees', 'POST');

      await wrapped(request, {});

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            tenantId: 'tenant-1',
            action: 'CREATE',
          }),
        })
      );
    });

    it('should create audit log for DELETE requests', async () => {
      (prisma.auditLog.create as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        catch: () => {},
      }));

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees/123', 'DELETE');

      await wrapped(request, {});

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'DELETE',
          }),
        })
      );
    });

    it('should create audit log for PUT requests with UPDATE action', async () => {
      (prisma.auditLog.create as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        catch: () => {},
      }));

      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees/123', 'PUT');

      await wrapped(request, {});

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'UPDATE',
          }),
        })
      );
    });

    it('should NOT create audit log for GET requests', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ items: [] }));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees', 'GET');

      await wrapped(request, {});

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('should not block response if audit logging fails', async () => {
      (prisma.auditLog.create as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        catch: (fn: (e: Error) => void) => {
          fn(new Error('Redis down'));
        },
      }));

      const handler = vi
        .fn()
        .mockResolvedValue(NextResponse.json({ success: true, data: { id: '1' } }));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees', 'POST');

      const result = await wrapped(request, {});
      // Response should still succeed despite audit log failure
      expect(result.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should return 500 with bilingual error on unhandled exception', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Unexpected crash'));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest();

      const result = await wrapped(request, {});

      expect(result.status).toBe(500);
      const body = await result.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('E5001');
      expect(body.error.message).toBe('Internal server error');
      expect(body.error.messageAr).toBe('خطأ داخلي في الخادم');
      expect(body.meta.apiVersion).toBe('v1');
    });

    it('should audit failed mutations', async () => {
      (prisma.auditLog.create as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        catch: () => {},
      }));

      const handler = vi.fn().mockRejectedValue(new Error('Validation failed'));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees', 'POST');

      await wrapped(request, {});

      // Should have been called for the failed mutation audit
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            details: expect.stringContaining('FAILED'),
          }),
        })
      );
    });

    it('should NOT audit failed GET requests', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('DB error'));
      const wrapped = withEnhancedAuth(handler);
      const request = createRequest('http://localhost:3006/api/v1/employees', 'GET');

      await wrapped(request, {});

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });
  });
});
